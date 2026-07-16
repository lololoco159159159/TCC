---
name: contexto
description: Carrega o contexto completo do projeto EduGraph (TCC) lendo ESTADO_ATUAL.md e DECISOES.md por inteiro. Use no início de toda conversa nova neste repositório, ou quando o usuário pedir para "pegar o contexto do trabalho", "entender o projeto por completo", "ler a documentação do andamento" ou similar — sempre ANTES de qualquer outra tarefa, e sem alterar nada.
---

# Contexto do projeto EduGraph (TCC)

Passo somente de leitura: **não altere nenhum arquivo** enquanto roda esta
skill — o objetivo é entender o estado do trabalho antes de qualquer tarefa.

## 1. Leia os dois arquivos de documentação, POR INTEIRO

1. **ESTADO_ATUAL.md** (raiz do repo) — a fonte de verdade do andamento,
   versionada no git (o CLAUDE.md está no `.gitignore` e não sincroniza entre
   as duas máquinas do autor). Contém: histórico das etapas (§3), o que falta
   e os roadmaps por etapas (§4, §4.1–§4.3), a receita de decodificação dos
   protótipos "bundled" da pasta `design/` (§5), as convenções do código (§6)
   e a estrutura de arquivos (§7). O arquivo passa de 1.000 linhas: leia TODO,
   em mais de uma chamada de Read se for preciso — não responda a partir de
   leitura parcial. **Como ler / decodificar os protótipos "bundled" da pasta
   `design/`** (a receita com o script Python, a ordem das seções e as
   particularidades do protótipo do grafo) está no **§5 do ESTADO_ATUAL.md** —
   consulte-o sempre que precisar abrir um protótipo.
2. **guia/DECISOES.md** — as decisões de projeto (D1, D2, D3…),
   cada uma com problema, decisão, alternativas rejeitadas, fala pronta para a
   banca e parágrafo de monografia. É o material de defesa e de escrita do
   TCC. Regra do projeto: decisão relevante nova ganha entrada lá na hora,
   sempre com o parágrafo de monografia.

## 2. Contexto fixo do projeto (dado pelo autor)

- É o TCC do autor: front-end **React 18 + Vite** (apenas telas, em
  português) de um grafo de conhecimento (BNCC-Computação × componentes
  curriculares). O grafo real será disponibilizado futuramente pela
  professora/orientadora; até lá **tudo roda localmente** com dados de
  exemplo, em sua maioria na pasta `src/data/` em arquivos `.js`
  (principal: `mockFuseki.js`).
- O back-end futuro será **Apache Jena Fuseki com endpoint SPARQL**; tudo é
  preparado para a integração mais simples possível (ver D1: o mock respeita
  o contrato fiel do Fuseki — a integração é trocar o corpo de
  `consultarFuseki()` por um `fetch`, sem mudar telas).
- **Não haverá sistema de usuários** (complexidade sem contribuição
  acadêmica — ver D2): as telas de conta são especificação visual e o app é
  uma demonstração local para a banca.
- O trabalho acontece em **duas máquinas**: tudo que importa para continuar
  precisa estar nos arquivos versionados (ESTADO_ATUAL.md, guia/DECISOES.md),
  nunca apenas na conversa ou no CLAUDE.md.
- Os commits são feitos **pelo autor** — implemente, verifique
  (`npm run lint` / `npm run build` / `npm run dev`), registre a etapa no
  ESTADO_ATUAL.md e apenas sugira a mensagem de commit.

## 3. Ao terminar

Responda com um resumo curto: em que etapa o projeto está, qual é a próxima
etapa do roadmap ativo e as pendências anotadas (ex.: checklist de regressão
do autor). Depois **pare e aguarde instruções** — não implemente nada por
conta própria.
