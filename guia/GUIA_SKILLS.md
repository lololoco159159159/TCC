# Guia de Skills — EduGraph

Skills ativam sozinhas quando o pedido bate com a `description` do SKILL.md — não é liga/desliga manual. Pra forçar uma específica, digite `/nome-da-skill` antes do pedido.

## Tabela rápida: frase → skill

| Se o pedido soa com... | Usa |
|---|---|
| "como refatorar esse componente" / "tá com muita prop" / "quero tornar isso reutilizável" | **vercel-composition-patterns** |
| "quero revisar minha implementação" / "audita essa tela" / "checa acessibilidade" | **web-design-guidelines** |
| "quero otimizar" / "revisa performance" / "por que tá lento" | **vercel-react-best-practices** |
| "cria a página de X" / "estiliza esse formulário" / "layout novo" | **frontend-design** |
| "existe uma skill pra..." / "como eu faço X" (fora do que já sei fazer) | **find-skills** |

---

## frontend-design (anthropics/skills)

**Ideia central:** força uma decisão estética deliberada antes de escrever CSS/JSX, evitando o "template genérico de IA" (gradiente roxo, cantos padrão, cards genéricos).

**Ativa quando:** tela ou componente novo, sem direção visual definida ainda.
**Não ativa (na prática) quando:** o componente só reaproveita tokens do Court Blanc já existentes — não há decisão de design sendo tomada.

**Melhor situação de uso:** páginas que ainda faltam (skill detail, índice de grafos, help, 404).

**Frases-gatilho:** "cria a página de X", "estiliza esse Y", "faz o layout de Z", "essa tela tá genérica demais".

---

## vercel-composition-patterns (vercel-labs/agent-skills)

**Ideia central:** evita acúmulo de props booleanas (`isLarge`, `showX`, `hasY`) empurrando pra compound components, context providers e lifting de estado.

**Ativa quando:** refatorar componente com muitas props, construir algo reutilizável, revisar arquitetura de componente.

**Melhor situação de uso:** conforme os controles da tela do grafo crescem (filtros, painel de detalhe de nó, popups) — pedir revisão de arquitetura nesse momento.

**Frases-gatilho:** "como refatorar esse componente", "esse componente tá com muita prop", "quero tornar isso reutilizável", "revisa a arquitetura desse componente".

---

## vercel-react-best-practices (vercel-labs/agent-skills)

**Ideia central:** 70 regras de performance priorizadas — eliminar waterfalls, bundle size, memoização, otimização de re-render, batching de DOM.

**Ativa quando:** escrever componente novo, mexer em data fetching, revisar performance, refatorar.

**Melhor situação de uso:** lógica de renderização do grafo (motor de física em Canvas 2D re-renderiza a cada frame) — vale ativar explicitamente aqui, não confiar só na ativação automática.

**Frases-gatilho:** "quero otimizar", "revisa performance dessa tela", "por que tá lento", "reduz o bundle".

---

## web-design-guidelines (vercel-labs/agent-skills)

**Ideia central:** busca ao vivo as guidelines atuais da Vercel (100+ regras: acessibilidade, foco, formulário, UX) e devolve violação por `arquivo:linha`. Não influencia o código enquanto ele é escrito — só age quando chamada.

**Ativa quando:** pedido explícito de revisão/auditoria.

**Melhor situação de uso:** antes de fechar qualquer tela nova, como último passo — não durante a escrita normal do componente.

**Frases-gatilho:** "revisa minha UI", "checa acessibilidade", "audita esse design", "confere contra best practices".

---

## find-skills (vercel-labs/skills)

**Ideia central:** a única das cinco que pode trazer uma skill nova pro repositório sozinha — pesquisa o leaderboard do skills.sh e oferece instalar.

**Ativa quando:** pedido de capacidade que o Claude Code não tem nativamente, ou perguntas do tipo "existe skill pra X".

**Cuidado:** sempre revisar o que ela sugere (nome, publisher, install count, audits) antes de aceitar — ela só sugere, a decisão de instalar é sempre manual.
