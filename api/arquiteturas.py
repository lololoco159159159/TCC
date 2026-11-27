"""Arquiteturas pedagógicas — ainda não implementado."""

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/arquiteturas", tags=["Arquiteturas pedagógicas (a implementar)"])


@router.get("/eixos")
async def listar_eixos():
    raise HTTPException(501, "Ainda não implementado")


@router.post("/recomendacao")
async def recomendar_pedagogia():
    raise HTTPException(501, "Ainda não implementado")


@router.post("/documento")
async def gerar_documento():
    raise HTTPException(501, "Ainda não implementado")
