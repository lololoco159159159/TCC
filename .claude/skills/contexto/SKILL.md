---
name: contexto
description: Carrega o contexto completo do projeto EduGraph (TCC) lendo ESTADO_ATUAL.md e guia/DECISOES.md por inteiro. Use no início de toda conversa nova neste repositório, ou quando o usuário pedir para "pegar o contexto do trabalho", "entender o projeto por completo", "ler a documentação do andamento" ou similar — sempre ANTES de qualquer outra tarefa, e sem alterar nada.
---

# Contexto do projeto EduGraph (TCC)

Passo somente de leitura: **não altere nenhum arquivo** enquanto roda esta
skill — o objetivo é entender o estado do trabalho antes de qualquer tarefa.

## 1. Leia os dois arquivos de documentação, POR INTEIRO

1. **ESTADO_ATUAL.md** (raiz do repo) — a fonte de verdade do andamento,
   versionada no git (o CLAUDE.md está no `.gitignore` e não sincroniza entre
   as duas máquinas do autor). Contém: a regra de autoria (§0), o histórico
   das etapas (§3), o que falta e os roadmaps por etapas (§4, §4.1–§4.5 — o
   roadmap ativo é o da integração com o Neo4j, §4.5), o registro de como os
   protótipos foram lidos (§5, histórico), as convenções do código (§6) e a
   estrutura de arquivos (§7). O arquivo passa de 2.500 linhas: leia TODO, em
   mais de uma chamada de Read se for preciso — não responda a partir de
   leitura parcial. A pasta `design/` (os protótipos "bundled" usados como
   referência na migração) foi retirada em 2026-10-15 e **não é mais usada**:
   não tente recuperá-la — se for necessária, o autor a traz de volta.
2. **guia/DECISOES.md** — as decisões de projeto (D1, D2, D3…),
   cada uma com problema, decisão, alternativas rejeitadas, fala pronta para a
   banca e parágrafo de monografia. É o material de defesa e de escrita do
   TCC. Regra do projeto: decisão relevante nova ganha entrada lá na hora,
   sempre com o parágrafo de monografia.

## 2. Contexto fixo do projeto (dado pelo autor)

- É o TCC do autor: front-end **React 18 + Vite** (em português) de um grafo
  de conhecimento curricular (BNCC). O grafo é construído pela
  professora/orientadora num **Neo4j** e consultado em **Cypher** pela Query
  API HTTP, sempre através do proxy `/api/cypher`, que guarda a senha (em
  desenvolvimento, o proxy do Vite lendo o `.env.local`; a senha nunca leva o
  prefixo `VITE_`) — ver D14. O grafo atual é uma versão resumida (1.º ano de
  Matemática), mas respeita a estrutura definitiva (Ano → UnidadeTematica →
  ObjetoConhecimento → Habilidade): a integração é feita para o modelo
  definitivo.
- **Integração real, sem mock e sem dados locais do grafo**: o site vai para o
  ar, então tudo o que aparece vem do Neo4j. O `mockFuseki.js` foi apagado na
  N10 (D17); o antigo plano Apache Jena Fuseki/SPARQL (D1) é só registro
  histórico. Não propor mock nem dados locais como plano B.
- **Não haverá sistema de usuários** (D2): Login/Signup/perfil mock não devem
  ser alterados — vão deixar de existir num roadmap próprio.
- O trabalho acontece em **duas máquinas**: tudo que importa para continuar
  precisa estar nos arquivos versionados (ESTADO_ATUAL.md, guia/DECISOES.md),
  nunca apenas na conversa ou no CLAUDE.md. A outra máquina precisa do seu
  próprio `.env.local` (copiado do `.env.example`) e de um Neo4j com os mesmos
  dados.
- Os commits são feitos **pelo autor**, sem nenhum rastro de IA (regra §0 do
  ESTADO_ATUAL.md) — implemente, verifique (`npm run lint` / `npm run build` /
  `npm run dev`), registre a etapa no ESTADO_ATUAL.md e apenas sugira a
  mensagem de commit.

## 3. Ao terminar

Responda com um resumo curto: em que etapa o projeto está, qual é a próxima
etapa do roadmap ativo e as pendências anotadas (ex.: checklist de regressão
do autor). Depois **pare e aguarde instruções** — não implemente nada por
conta própria.
