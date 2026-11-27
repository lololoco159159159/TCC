"""As consultas do grafo — o que o site pergunta ao Neo4j, por assunto.

Cada rota executa UMA consulta Cypher, sempre com parâmetros (os valores nunca
são colados no texto da consulta), e responde:

    { "consulta": "<o Cypher>", "parametros": {...}, "resposta": <a resposta do Neo4j> }

A `resposta` vem como o Neo4j mandou (JSON tipado), e a consulta vem junto, para
quem usa a API saber o que foi perguntado ao banco. Os erros saem no formato de
sempre — { "errors": [...] } —, também com a consulta.

O modelo do grafo (o da orientadora):
    (:Ano)-[:TEM_AREA]->(:AreaConhecimento {codigo, nome})
      -[:TEM_COMPONENTE]->(:ComponenteCurricular {codigo, nome})
      -[:TEM_UNIDADE]->(unidade temática {nome})
      -[:TEM_OBJETO]->(objeto de conhecimento {descricao})
      -[:DESENVOLVE]->(habilidade {codigo, descricao})
    e o atalho (:Ano)-[:DESENVOLVE_HABILIDADE]->(habilidade)
Cada componente tem os seus rótulos (UnidadeTematicaMat, UnidadeTematicaCien…),
mas as consultas daqui não citam rótulo nenhum além de Ano, AreaConhecimento e
ComponenteCurricular: andam pelas RELAÇÕES, que são as mesmas em todo
componente — um componente novo entra no site sozinho, sem mudar o código.
O ano é amarrado pelo atalho Ano → Habilidade: área, componente, unidades e
objetos são os mesmos nós em todos os anos (não existe "Habilidade2Cien"), e
descer por eles traria também o que é de outros anos.
"""

from typing import Annotated, Any

from fastapi import APIRouter, Path, Query
from pydantic import BaseModel, Field

import neo4j
from neo4j import ErroDaApi

router = APIRouter(prefix="/api/grafo", tags=["Grafo"])

CODIGO = r"^[A-Za-z0-9]{1,10}$"  # códigos do modelo: EF1, CN, MA…
Ano = Annotated[str, Path(pattern=CODIGO, description="Código do ano.", examples=["EF1"])]
Area = Annotated[str, Path(pattern=CODIGO, description="Código da área de conhecimento.", examples=["MT"])]
Componente = Annotated[str, Path(pattern=CODIGO, description="Código do componente curricular.", examples=["MA"])]


async def responder(consulta: str, parametros: dict[str, Any] | None = None) -> dict[str, Any]:
    """Executa a consulta e devolve { consulta, parametros, resposta }. Se o Neo4j
    recusar a consulta, o erro dele sai como ErroDaApi — com a consulta junto."""
    parametros = parametros or {}
    junto = {"consulta": consulta, "parametros": parametros}
    try:
        r = await neo4j.consultar(consulta, parametros)
    except ErroDaApi as e:
        e.extras.update(junto)
        raise
    try:
        corpo = r.json()
    except ValueError:
        raise ErroDaApi(
            502, "EduGraph.Api.RespostaInvalida", f"O Neo4j respondeu algo que não é JSON (HTTP {r.status_code}).", **junto
        ) from None
    erros = corpo.get("errors")
    if erros or r.status_code >= 400:
        e = (erros or [{}])[0]
        raise ErroDaApi(
            max(r.status_code, 400),
            e.get("code", f"HTTP {r.status_code}"),
            e.get("message", "O Neo4j recusou a consulta."),
            **junto,
        )
    return {**junto, "resposta": corpo}


# ---------------------------------------------------------------------------
# Home — os números e as turmas
# ---------------------------------------------------------------------------

ANOS = "MATCH (a:Ano) RETURN a.codigo AS codigo, a.nome AS nome"

# conta pelas relações do modelo — habilidade é quem um Ano desenvolve; unidade,
# quem um componente curricular tem —, então conta todo componente, inclusive os
# que ainda vão chegar. (COLLECT { } e não [(a:Ano) | …]: a compreensão de padrão
# exige uma relação.)
ESTATISTICAS = """RETURN size(COLLECT { MATCH (:Ano)-[:DESENVOLVE_HABILIDADE]->(h) RETURN DISTINCT h }) AS habilidades,
       size(COLLECT { MATCH (:ComponenteCurricular)-[:TEM_UNIDADE]->(u) RETURN DISTINCT u }) AS unidades,
       COLLECT { MATCH (a:Ano) RETURN a.codigo } AS anos"""


@router.get("/anos", summary="Os anos do grafo")
async def anos():
    """Um item por nó Ano: `codigo` e `nome` (ex.: EF1, "1º Ano")."""
    return await responder(ANOS)


@router.get("/estatisticas", summary="Os números da Home")
async def estatisticas():
    """Quantas habilidades e unidades temáticas o grafo tem, e os códigos dos anos."""
    return await responder(ESTATISTICAS)


# ---------------------------------------------------------------------------
# Busca do professor — as opções: áreas, componentes e o recorte
# ---------------------------------------------------------------------------

# as áreas ligadas ao ano que têm alguma habilidade nele (área ainda sem
# componente, como Linguagens hoje, não aparece)
AREAS_DO_ANO = """MATCH (a:Ano {codigo: $ano})-[:TEM_AREA]->(ar:AreaConhecimento)
WHERE EXISTS { (ar)-[:TEM_COMPONENTE]->()-[:TEM_UNIDADE]->()-[:TEM_OBJETO]->()-[:DESENVOLVE]->(h)<-[:DESENVOLVE_HABILIDADE]-(a) }
RETURN ar.codigo AS codigo, ar.nome AS nome"""

# os componentes da área que têm alguma habilidade no ano
COMPONENTES_DA_AREA = """MATCH (a:Ano {codigo: $ano})-[:TEM_AREA]->(:AreaConhecimento {codigo: $area})
      -[:TEM_COMPONENTE]->(c:ComponenteCurricular)
WHERE EXISTS { (c)-[:TEM_UNIDADE]->()-[:TEM_OBJETO]->()-[:DESENVOLVE]->(h)<-[:DESENVOLVE_HABILIDADE]-(a) }
RETURN c.codigo AS codigo, c.nome AS nome"""

# todos os componentes do ano (de qualquer área), cada um com a sua área — o
# balão da turma na Home
COMPONENTES_DO_ANO = """MATCH (a:Ano {codigo: $ano})-[:TEM_AREA]->(ar:AreaConhecimento)-[:TEM_COMPONENTE]->(c:ComponenteCurricular)
WHERE EXISTS { (c)-[:TEM_UNIDADE]->()-[:TEM_OBJETO]->()-[:DESENVOLVE]->(h)<-[:DESENVOLVE_HABILIDADE]-(a) }
RETURN c.codigo AS codigo, c.nome AS nome, ar.codigo AS area"""

# o recorte: uma linha por (habilidade do ano, objeto, unidade) do componente — as
# listas dos campos da busca saem daqui, no navegador, sem consulta nova
RECORTE = """MATCH (:Ano {codigo: $ano})-[:DESENVOLVE_HABILIDADE]->(h)
      <-[:DESENVOLVE]-(o)<-[:TEM_OBJETO]-(u)<-[:TEM_UNIDADE]-(:ComponenteCurricular {codigo: $componente})
RETURN elementId(u) AS idUnidade, u.nome AS unidade,
       elementId(o) AS idObjeto, o.descricao AS objeto,
       elementId(h) AS idHabilidade, h.codigo AS codigo, h.descricao AS texto
LIMIT $limite"""


@router.get("/anos/{ano}/areas", summary="As áreas de conhecimento de um ano")
async def areas_do_ano(ano: Ano):
    """Só as áreas que têm alguma habilidade no ano."""
    return await responder(AREAS_DO_ANO, {"ano": ano})


@router.get("/anos/{ano}/areas/{area}/componentes", summary="Os componentes curriculares de uma área, num ano")
async def componentes_da_area(ano: Ano, area: Area):
    """Só os componentes que têm alguma habilidade no ano."""
    return await responder(COMPONENTES_DA_AREA, {"ano": ano, "area": area})


@router.get("/anos/{ano}/componentes", summary="Todos os componentes curriculares de um ano")
async def componentes_do_ano(ano: Ano):
    """De qualquer área, cada um com a sua (`area`) — o balão da turma na Home."""
    return await responder(COMPONENTES_DO_ANO, {"ano": ano})


@router.get("/anos/{ano}/componentes/{componente}/recorte", summary="O recorte de um ano num componente")
async def recorte(
    ano: Ano,
    componente: Componente,
    limite: Annotated[int, Query(ge=1, le=5001, description="Máximo de linhas.")] = 2001,
):
    """As unidades temáticas, os objetos de conhecimento e as habilidades do ano no
    componente, numa consulta só: uma linha por (habilidade, objeto, unidade), com
    os `elementId` que as perguntas usam."""
    return await responder(RECORTE, {"ano": ano, "componente": componente, "limite": limite})


# ---------------------------------------------------------------------------
# Busca do professor — as perguntas
# ---------------------------------------------------------------------------

# habilidades do ano escolhido (o começo de três das consultas)
HABILIDADES_DO_ANO = "MATCH (a:Ano {codigo: $ano})-[:DESENVOLVE_HABILIDADE]->(h)"

# a árvore do ano no componente: o caminho de cada habilidade do ano, desde o
# ano, passando pela área e pelo componente
ARVORE_DO_ANO = (
    HABILIDADES_DO_ANO
    + """
MATCH p = (a)-[:TEM_AREA]->(:AreaConhecimento)-[:TEM_COMPONENTE]->(:ComponenteCurricular {codigo: $componente})
      -[:TEM_UNIDADE]->()
      -[:TEM_OBJETO]->()-[:DESENVOLVE]->(h)
RETURN p"""
)

PERGUNTAS = [
    {
        "id": "caminho",
        "titulo": "Caminho até uma habilidade",
        "explicacao": "De que unidade temática e objeto de conhecimento a habilidade vem",
        "campos": [{"nome": "habilidade", "tipo": "habilidade"}],
        "consulta": """MATCH p = (:Ano {codigo: $ano})-[:TEM_AREA]->(:AreaConhecimento)
      -[:TEM_COMPONENTE]->(:ComponenteCurricular {codigo: $componente})-[:TEM_UNIDADE]->()-[:TEM_OBJETO]->()-[:DESENVOLVE]->(h)
WHERE elementId(h) = $habilidade
RETURN p""",
    },
    {
        "id": "irmas",
        "titulo": "Habilidades irmãs",
        "explicacao": "As outras habilidades do ano que saem do mesmo objeto de conhecimento",
        "campos": [{"nome": "habilidade", "tipo": "habilidade"}],
        "consulta": """MATCH (:Ano {codigo: $ano})-[:DESENVOLVE_HABILIDADE]->(irma)
MATCH p = (h)<-[:DESENVOLVE]-()-[:DESENVOLVE]->(irma)
WHERE elementId(h) = $habilidade
RETURN p""",
    },
    {
        "id": "ligacao",
        "titulo": "Ligação entre duas habilidades",
        "explicacao": "O caminho mais curto entre duas habilidades, pelas unidades temáticas e objetos de conhecimento",
        "campos": [
            {"nome": "habilidade", "tipo": "habilidade", "rotulo": "Primeira habilidade"},
            {"nome": "habilidade2", "tipo": "habilidade", "rotulo": "Segunda habilidade"},
        ],
        "distintos": ["habilidade", "habilidade2"],  # as duas não podem ser a mesma
        # as duas pontas vão no WHERE do próprio shortestPath: um `MATCH (h1), (h2)`
        # antes dele fazia o Neo4j avisar de "produto cartesiano" (inofensivo, 1 × 1
        # nó). O caminho só anda pelas relações da hierarquia — sobe até a unidade
        # (ou o componente) comum e desce; sem o Ano no meio, não passa por outro ano
        "consulta": """MATCH p = shortestPath((h1)-[:TEM_UNIDADE|TEM_OBJETO|DESENVOLVE*..10]-(h2))
WHERE elementId(h1) = $habilidade AND elementId(h2) = $habilidade2
RETURN p""",
    },
    {
        "id": "ensinar",
        "titulo": "Habilidades que preciso ensinar no ano",
        "explicacao": "Todas as habilidades do ano nesta matéria, cada uma com a unidade temática e o objeto de conhecimento de onde vem",
        "campos": [],
        "consulta": ARVORE_DO_ANO,
    },
    {
        "id": "objeto",
        "titulo": "Um objeto de conhecimento e as suas habilidades",
        "explicacao": "O objeto, as habilidades do ano e a unidade temática de cima",
        "campos": [{"nome": "objeto", "tipo": "objeto"}],
        "consulta": HABILIDADES_DO_ANO
        + """
MATCH p = ()-[:TEM_OBJETO]->(o)-[:DESENVOLVE]->(h)
WHERE elementId(o) = $objeto
RETURN p""",
    },
    {
        "id": "unidade",
        "titulo": "Uma unidade temática inteira",
        "explicacao": "A unidade, os objetos de conhecimento dela e as habilidades do ano",
        "campos": [{"nome": "unidade", "tipo": "unidade"}],
        "consulta": HABILIDADES_DO_ANO
        + """
MATCH p = (u)-[:TEM_OBJETO]->()-[:DESENVOLVE]->(h)
WHERE elementId(u) = $unidade
RETURN p""",
    },
    {
        "id": "habilidadesDoAno",
        "titulo": "As habilidades do ano",
        "explicacao": "O ano ligado direto às habilidades dele nesta matéria",
        "campos": [],
        "consulta": """MATCH p = (:Ano {codigo: $ano})-[:DESENVOLVE_HABILIDADE]->(h)
WHERE EXISTS { (:ComponenteCurricular {codigo: $componente})-[:TEM_UNIDADE]->()-[:TEM_OBJETO]->()-[:DESENVOLVE]->(h) }
RETURN p""",
    },
    {
        "id": "ano",
        "titulo": "O ano inteiro nesta matéria",
        "explicacao": "Todas as unidades temáticas, objetos de conhecimento e habilidades do ano",
        "campos": [],
        "consulta": ARVORE_DO_ANO,
    },
]
POR_ID = {p["id"]: p for p in PERGUNTAS}


class PedidoPergunta(BaseModel):
    ano: str | None = Field(None, pattern=CODIGO, description="Código do ano.", examples=["EF1"])
    componente: str | None = Field(None, pattern=CODIGO, description="Código do componente.", examples=["MA"])
    escolhas: dict[str, str] = Field(
        default={}, description="Os campos da pergunta: { nome do campo: elementId escolhido no recorte }."
    )


@router.get("/perguntas", summary="As perguntas da busca do professor")
async def perguntas():
    """O cardápio da busca: título, explicação, os campos que cada pergunta pede e a
    consulta Cypher dela. Não consulta o Neo4j."""
    return PERGUNTAS


@router.post("/perguntas/{pergunta}", summary="Responde uma pergunta da busca")
async def executar_pergunta(pergunta: str, pedido: PedidoPergunta):
    """Monta os parâmetros da pergunta (o ano, o componente e os campos escolhidos)
    e executa a consulta dela."""
    p = POR_ID.get(pergunta)
    if not p:
        raise ErroDaApi(404, "EduGraph.Api.PerguntaDesconhecida", f"Não existe a pergunta '{pergunta}'.")
    faltando = [nome for nome in ("ano", "componente") if not getattr(pedido, nome)]
    faltando += [c["nome"] for c in p["campos"] if not pedido.escolhas.get(c["nome"])]
    if faltando:
        raise ErroDaApi(400, "EduGraph.Api.FaltaEscolher", f"Falta escolher: {', '.join(faltando)}.")
    distintos = p.get("distintos", [])
    if len({pedido.escolhas[n] for n in distintos}) < len(distintos):
        raise ErroDaApi(400, "EduGraph.Api.EscolhasIguais", "Escolha itens diferentes em cada campo.")
    parametros = {"ano": pedido.ano, "componente": pedido.componente}
    parametros |= {c["nome"]: pedido.escolhas[c["nome"]] for c in p["campos"]}
    return await responder(p["consulta"], parametros)


# ---------------------------------------------------------------------------
# Painel e desenho — a vizinhança de um nó e as pontas que faltam
# ---------------------------------------------------------------------------

# as conexões de um nó: o painel de detalhe e o "expandir" (como no Neo4j Browser)
CONEXOES = "MATCH (n)-[r]-(m) WHERE elementId(n) = $id RETURN r, m LIMIT $limite"

# os nós das pontas de relações que vieram sem eles num resultado (ex.: `RETURN r`)
BUSCAR_PONTAS = "MATCH (n) WHERE elementId(n) IN $ids RETURN n"


class PedidoConexoes(BaseModel):
    id: str = Field(min_length=1, max_length=200, description="O elementId do nó.")
    limite: int = Field(200, ge=1, le=1000, description="Máximo de conexões.")


class PedidoNos(BaseModel):
    ids: list[str] = Field(max_length=1000, description="Os elementIds dos nós.")


@router.post("/conexoes", summary="As conexões de um nó")
async def conexoes(pedido: PedidoConexoes):
    """Cada relação do nó (`r`) com o vizinho do outro lado (`m`)."""
    return await responder(CONEXOES, {"id": pedido.id, "limite": pedido.limite})


@router.post("/nos", summary="Nós pelo elementId")
async def nos(pedido: PedidoNos):
    """Os nós pedidos — as pontas que faltam no desenho de um resultado."""
    return await responder(BUSCAR_PONTAS, {"ids": pedido.ids})
