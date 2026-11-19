"""Ontologias do projeto — ainda não implementado."""

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/ontologias", tags=["Ontologias (a implementar)"])


@router.get("")
async def listar_ontologias():
    raise HTTPException(501, "Ainda não implementado")


@router.get("/{ontologia}/arquivo")
async def baixar_ontologia(ontologia: str):
    raise HTTPException(501, "Ainda não implementado")


@router.post("")
async def enviar_ontologia():
    raise HTTPException(501, "Ainda não implementado")
