"""Fórum dos professores — ainda não implementado."""

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/forum", tags=["Fórum (a implementar)"])


@router.get("/topicos")
async def listar_conversas():
    raise HTTPException(501, "Ainda não implementado")


@router.post("/topicos")
async def abrir_conversa():
    raise HTTPException(501, "Ainda não implementado")


@router.get("/topicos/{topico}")
async def ver_conversa(topico: str):
    raise HTTPException(501, "Ainda não implementado")


@router.post("/topicos/{topico}/mensagens")
async def responder_conversa(topico: str):
    raise HTTPException(501, "Ainda não implementado")
