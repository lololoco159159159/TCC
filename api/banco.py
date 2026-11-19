"""A conexão da API com o banco de grafos (Neo4j).

A configuração — endereço, usuário e senha do banco — vem do .env.local da raiz
do projeto, o arquivo que nunca vai para o git (modelo em .env.example).

Toda consulta vai para a Query API do Neo4j (POST /db/<banco>/query/v2) SEMPRE
em modo somente leitura, e o Neo4j recusa qualquer escrita. Isso importa porque,
na edição Community do Neo4j, não existe usuário só de leitura: quem tem a senha
pode apagar o grafo. A resposta vem no JSON tipado da Query API, em que cada
valor declara o próprio tipo (nó, relação, caminho, inteiro…) — o formato que o
site já sabe ler.
"""

import logging
import os
import re
import time
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")

URL = os.getenv("NEO4J_URL", "http://localhost:7474")
BANCO = os.getenv("NEO4J_DATABASE", "neo4j")
USUARIO = os.getenv("NEO4J_USER", "neo4j")
SENHA = os.getenv("NEO4J_PASSWORD", "")
TEMPO_LIMITE_S = 12  # menor que os 15 s do site: a API avisa antes de o site desistir

log = logging.getLogger("uvicorn.error")  # as mensagens saem no terminal, junto das do Uvicorn


class ErroDaApi(Exception):
    """Um erro que a API devolve ao site, no formato do Neo4j (ver main.py)."""

    def __init__(self, status: int, codigo: str, mensagem: str):
        super().__init__(mensagem)
        self.status = status
        self.codigo = codigo
        self.mensagem = mensagem


_cliente: httpx.AsyncClient | None = None


def abrir() -> None:
    """Abre a conexão com o Neo4j — uma só, reaproveitada em todos os pedidos."""
    global _cliente
    if not SENHA:
        log.warning("NEO4J_PASSWORD não definida — copie .env.example para .env.local e preencha a senha.")
    _cliente = httpx.AsyncClient(base_url=URL, auth=(USUARIO, SENHA), timeout=TEMPO_LIMITE_S)


async def fechar() -> None:
    await _cliente.aclose()


async def consultar(consulta: str, parametros: dict | None = None) -> httpx.Response:
    """Executa uma consulta Cypher em modo somente leitura e devolve a resposta do Neo4j como veio.

    Os erros do próprio Neo4j (sintaxe, escrita recusada…) voltam na resposta,
    com `errors` no corpo. Só a falta de resposta vira ErroDaApi.
    """
    corpo = {"statement": consulta, "parameters": parametros or {}, "accessMode": "READ"}
    t0 = time.perf_counter()
    try:
        r = await _cliente.post(
            f"/db/{BANCO}/query/v2", json=corpo, headers={"Accept": "application/vnd.neo4j.query"}
        )
    except httpx.TimeoutException:
        raise ErroDaApi(
            504,
            "EduGraph.Api.TempoEsgotado",
            f"O Neo4j não respondeu em {TEMPO_LIMITE_S} s — ele pode estar sobrecarregado ou a consulta é pesada demais.",
        ) from None
    except httpx.TransportError as e:
        raise ErroDaApi(
            502, "EduGraph.Api.Neo4jIndisponivel", f"Não foi possível conectar ao Neo4j em {URL} ({e})."
        ) from None
    ms = round((time.perf_counter() - t0) * 1000)
    log.info("neo4j %d ms · HTTP %d · %s", ms, r.status_code, re.sub(r"\s+", " ", consulta)[:90])
    return r
