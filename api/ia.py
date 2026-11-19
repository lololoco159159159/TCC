"""Assistente do grafo — ainda não implementado."""

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/assistente", tags=["Assistente (a implementar)"])


@router.post("/mensagens")
async def perguntar():
    raise HTTPException(501, "Ainda não implementado")
