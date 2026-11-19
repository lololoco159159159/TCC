"""A API do EduGraph — o servidor entre o site e o banco de grafos (Neo4j).

Rodar (da raiz do projeto): npm run api → http://localhost:8000
Documentação interativa dos endpoints: http://localhost:8000/api/docs

  main.py   a aplicação: as rotas e o tratamento de erros
  banco.py  a conexão com o Neo4j (sempre em modo somente leitura)
"""

import re
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException

import banco
from banco import ErroDaApi


@asynccontextmanager
async def ciclo_de_vida(app: FastAPI):
    banco.abrir()
    yield
    await banco.fechar()


app = FastAPI(
    title="API do EduGraph",
    description="Fica entre o site e o banco de grafos (Neo4j): guarda a senha do banco e impõe o modo "
    "**somente leitura** em toda consulta. Os erros saem sempre no formato "
    '`{ "errors": [{ "code", "message" }] }` — códigos `Neo.*` vêm do Neo4j; `EduGraph.Api.*`, da API.',
    version="0.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    redoc_url=None,
    lifespan=ciclo_de_vida,
)


# ---------------------------------------------------------------------------
# Erros — todos no MESMO formato dos erros do Neo4j, para o site tratar tudo de
# um jeito só: { "errors": [{ "code": ..., "message": ... }] }
# ---------------------------------------------------------------------------


def erro(status: int, codigo: str, mensagem: str) -> JSONResponse:
    return JSONResponse({"errors": [{"code": codigo, "message": mensagem}]}, status_code=status)


@app.exception_handler(ErroDaApi)
async def erro_da_api(request: Request, e: ErroDaApi):
    return erro(e.status, e.codigo, e.mensagem)


@app.exception_handler(RequestValidationError)
async def pedido_invalido(request: Request, e: RequestValidationError):
    problemas = []
    for x in e.errors():
        if x["type"] == "json_invalid":
            problemas.append("o corpo não é um JSON válido")
        else:
            campo = ".".join(str(p) for p in x["loc"] if p != "body")
            problemas.append(f"{campo}: {x['msg']}" if campo else x["msg"])
    return erro(400, "EduGraph.Api.PedidoInvalido", "Pedido inválido — " + "; ".join(problemas) + ".")


@app.exception_handler(HTTPException)
async def erro_http(request: Request, e: HTTPException):  # ex.: rota inexistente (404)
    return erro(e.status_code, f"EduGraph.Api.Http{e.status_code}", f"{request.method} {request.url.path}: {e.detail}.")


# ---------------------------------------------------------------------------
# Console Cypher — a consulta livre que a pessoa escreve na página de grafos
# ---------------------------------------------------------------------------

TAMANHO_MAXIMO = 20_000  # caracteres

# Comandos recusados: fariam o servidor do Neo4j ler arquivos ou endereços da
# internet (LOAD CSV, apoc.load, apoc.import, apoc.export) ou executar um texto
# como consulta (apoc.cypher). Antes de procurá-los, saem os textos entre aspas
# e os comentários — "LOAD CSV" dentro de um texto não é o comando, e um
# comentário no meio (LOAD/**/CSV) não pode escondê-lo — e as crases, para um
# nome como `apoc.load.json` aparecer.
TEXTOS_E_COMENTARIOS = re.compile(r"""'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|//[^\n]*|/\*.*?\*/""", re.S)
BLOQUEADOS = re.compile(r"\bLOAD\s+CSV\b|\bapoc\s*\.\s*(?:load|import|export|cypher)\b", re.I)


class PedidoCypher(BaseModel):
    statement: str = Field(description="A consulta Cypher.", examples=["MATCH (a:Ano) RETURN a.codigo, a.nome"])
    parameters: dict[str, Any] = Field(default={}, description="Os valores dos $parâmetros da consulta.")
    # o `accessMode` que o site manda é ignorado de propósito: quem decide é a API (sempre leitura)


@app.post("/api/cypher", tags=["Console Cypher"], summary="Executa uma consulta Cypher (somente leitura)")
async def executar_cypher(pedido: PedidoCypher):
    """A resposta é a do Neo4j, sem mudança: 202 no sucesso (e também num erro em
    tempo de execução, com `errors` no corpo) e 400 num erro de sintaxe."""
    if len(pedido.statement) > TAMANHO_MAXIMO:
        raise ErroDaApi(
            400, "EduGraph.Api.ConsultaGrande", f"A consulta passa do limite do console: {TAMANHO_MAXIMO} caracteres."
        )
    if BLOQUEADOS.search(TEXTOS_E_COMENTARIOS.sub(" ", pedido.statement).replace("`", "")):
        raise ErroDaApi(
            400,
            "EduGraph.Api.ConsultaBloqueada",
            "O console não aceita LOAD CSV nem procedimentos que leem arquivos ou endereços "
            "(apoc.load, apoc.import, apoc.export) ou que executam um texto como consulta (apoc.cypher).",
        )
    r = await banco.consultar(pedido.statement, pedido.parameters)
    return Response(content=r.content, status_code=r.status_code, media_type=r.headers.get("content-type"))


# ---------------------------------------------------------------------------
# Saúde — para conferir se a API está no ar e consegue falar com o Neo4j
# ---------------------------------------------------------------------------


@app.get("/api/saude", tags=["Saúde"], summary="Confere a API e a conexão com o Neo4j")
async def saude():
    """200 quando está tudo certo; 503 quando o Neo4j está fora do ar ou recusa a conexão (ex.: senha errada)."""
    try:
        r = await banco.consultar("RETURN 1")
    except ErroDaApi as e:
        return JSONResponse({"api": "ok", "neo4j": "fora do ar", "detalhe": e.mensagem}, status_code=503)
    try:
        erros = r.json().get("errors")
    except ValueError:
        erros = None
    if erros or r.status_code >= 400:
        detalhe = erros[0]["message"] if erros else f"HTTP {r.status_code}"
        return JSONResponse({"api": "ok", "neo4j": "erro", "detalhe": detalhe}, status_code=503)
    return {"api": "ok", "neo4j": "ok"}
