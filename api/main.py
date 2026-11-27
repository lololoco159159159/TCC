"""A API do EduGraph — o servidor entre o site e o banco de grafos (Neo4j).

Rodar (da raiz do projeto): npm run api → http://localhost:8000
Documentação interativa dos endpoints: http://localhost:8000/api/docs

  main.py        a aplicação: a saúde e o tratamento de erros
  neo4j.py       a conexão com o Neo4j (sempre em modo somente leitura)
  grafo.py       as consultas do site, por assunto (anos, áreas, recorte, perguntas…)
  forum.py       ┐
  ontologias.py  ├ arquivos base: as rotas previstas, ainda não implementadas (501)
  ia.py          ┘
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

import forum
import grafo
import ia
import neo4j
import ontologias
from neo4j import ErroDaApi


@asynccontextmanager
async def ciclo_de_vida(app: FastAPI):
    neo4j.abrir()
    yield
    await neo4j.fechar()


app = FastAPI(
    title="API do EduGraph",
    description="Fica entre o site e o banco de grafos (Neo4j): guarda a senha do banco e impõe o modo "
    "**somente leitura** em toda consulta. Os erros saem sempre no formato "
    '`{ "errors": [{ "code", "message" }] }` — códigos `Neo.*` vêm do Neo4j; `EduGraph.Api.*`, da API.',
    version="0.4.0",
    openapi_tags=[
        {"name": "Grafo", "description": "As consultas do site, por assunto. Toda resposta traz a consulta Cypher usada."},
        {"name": "Saúde", "description": "Se a API está no ar e consegue falar com o Neo4j."},
        {"name": "Fórum (a implementar)", "description": "Rotas previstas, ainda respondendo 501. Ponto de partida: api/forum.py."},
        {"name": "Ontologias (a implementar)", "description": "Rotas previstas, ainda respondendo 501. Ponto de partida: api/ontologias.py."},
        {"name": "Assistente (a implementar)", "description": "Rota prevista, ainda respondendo 501. Ponto de partida: api/ia.py."},
    ],
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    redoc_url=None,
    lifespan=ciclo_de_vida,
)


# ---------------------------------------------------------------------------
# Erros — todos no MESMO formato dos erros do Neo4j, para o site tratar tudo de
# um jeito só: { "errors": [{ "code": ..., "message": ... }] }
# ---------------------------------------------------------------------------


def erro(status: int, codigo: str, mensagem: str, **extras) -> JSONResponse:
    return JSONResponse({"errors": [{"code": codigo, "message": mensagem}], **extras}, status_code=status)


@app.exception_handler(ErroDaApi)
async def erro_da_api(request: Request, e: ErroDaApi):
    return erro(e.status, e.codigo, e.mensagem, **e.extras)


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
# Saúde — para conferir se a API está no ar e consegue falar com o Neo4j
# ---------------------------------------------------------------------------


@app.get("/api/saude", tags=["Saúde"], summary="Confere a API e a conexão com o Neo4j")
async def saude():
    """200 quando está tudo certo; 503 quando o Neo4j está fora do ar ou recusa a conexão (ex.: senha errada)."""
    try:
        r = await neo4j.consultar("RETURN 1")
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


# ---------------------------------------------------------------------------
# As consultas do site, por assunto (grafo.py), e os arquivos base do fórum, das
# ontologias e do assistente
# ---------------------------------------------------------------------------

app.include_router(grafo.router)
app.include_router(forum.router)
app.include_router(ontologias.router)
app.include_router(ia.router)
