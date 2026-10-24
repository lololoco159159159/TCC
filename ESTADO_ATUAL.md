# Estado atual da implementação — EduGraph (TCC)

> este arquivo é a fonte de
> verdade do andamento do projeto e **é versionado no git**. O `CLAUDE.md` está no
> `.gitignore` (não sincroniza entre máquinas), então o estado real do trabalho
> mora **aqui**. Ao iniciar uma sessão, leia este arquivo primeiro e, ao concluir
> uma etapa, atualize-o.
>
> **Decisões importantes** (escopo, arquitetura, biblioteca, dados,
> acessibilidade) são registradas em **[guia/DECISOES.md](guia/DECISOES.md)** — organizado e
> didático, é o material de preparação da defesa E da escrita do texto. Ao tomar
> uma decisão dessas, adicione a entrada lá **na hora**, com **todos** os campos do
> formato do cabeçalho — inclusive o **parágrafo de monografia** (tom acadêmico,
> com o capítulo onde encaixa).

Última atualização: 2026-10-24.

---

## 0. Regra permanente — autoria do repositório é 100% do autor

**O assistente (Claude Code ou qualquer outra IA) NUNCA pode aparecer como
contribuidor deste repositório.** Vale para toda sessão, sem exceção e sem
precisar ser relembrado:

- **Não commita, não faz push, não abre PR, não cria tag/release** e não executa
  nenhum comando git que escreva no histórico (`commit`, `push`, `merge`,
  `rebase`, `tag`, `cherry-pick`, `revert`).
- **Nenhum rastro de autoria** nas mensagens de commit: nada de
  `Co-Authored-By:`, `Generated with`, `Signed-off-by:`, `--author`, `--amend`
  com outro nome, alteração de `git config user.name/user.email` ou qualquer
  menção a IA no texto do commit.
- **Fluxo correto:** o assistente implementa, verifica (`npm run lint` /
  `npm run build` / `npm run dev`), registra a etapa neste arquivo e **sugere a
  mensagem de commit em texto** — quem roda `git commit` / `git push` é sempre o
  autor. Onde os roadmaps dizem "commitar" (§4.2, §4.3), o sujeito é **o autor**.

**Motivo:** este é um TCC. A autoria do código precisa ser inequívoca no
histórico do GitHub — para a banca, para a orientadora e para o registro
acadêmico.

---

## 1. Visão geral

Front-end React + Vite do EduGraph (ver [README.md](README.md) para o contexto
acadêmico completo). Sem back-end próprio: os dados do grafo vêm de um **Neo4j**
(consultas **Cypher** — decisão de 2026-10-09, substitui o antigo plano
Fuseki/SPARQL), sempre através do proxy `/api/cypher`, que guarda a senha (D14).
Desde a N10 o site não guarda nenhum dado do grafo (D17). A integração com o Neo4j
é o **foco atual** (§4.5).

O código foi migrado **por partes** de um **protótipo inicial** para o
**protótipo final aceito** (`design/prototipo_final.html`). A pasta `design/` foi
retirada em 2026-10-15: servia só de referência para a migração e não é mais usada.

## 2. Migração de design: inicial → final

A reformulação troca a identidade visual inteira:

| | Protótipo inicial (antigo) | Protótipo final (atual) |
|---|---|---|
| Fundo (claro) | branco `#ffffff` | creme/papel `#F7F2E8` |
| Acento | verde `#1f8a5b` | verde `#06492D` + dourado/terracota `#8C3E18` |
| Modo escuro | fundo roxo, acento roxo | fundo preto, verde `#3AA76D` + âmbar `#8E4806` |
| Fonte títulos | Inter | **Spectral** (serifada) |
| Fonte corpo/UI | Inter | **Figtree** |
| Fonte labels | IBM Plex Mono | **JetBrains Mono** |

Tokens completos (claro/escuro) ficam em [src/index.css](src/index.css) — **essa é
a autoridade da paleta**. Nomes dos tokens (do protótipo): `--bg --bg2 --text
--muted --body --faint --green --green-deep --gold --edge --pill-bg
--pill-border` (`--green-soft`, que vinha do protótipo e nunca foi usado, saiu na L2 da
§4.6).

### Aliases de compatibilidade — REMOVIDOS (A5, 2026-07-16)
`index.css` **não define mais** os aliases dos nomes antigos (`--ink --accent
--accent-hover --line --line-strong --card --bg-soft --mut --accent-rgb`).
Eles existiam só para manter Login/Signup/FontSizeWidget funcionando com a
paleta nova antes da migração; na **A5** essas telas passaram a usar os tokens
do protótipo direto e os aliases foram removidos dos dois temas (grep
pré-remoção incluindo strings — nenhum uso restou). O único token "extra"
que tinha sido mantido, `--green-soft`, saiu na L2 da §4.6 (nunca foi usado).
**Não reintroduzir aliases** — use sempre os tokens novos.

## 3. O que JÁ foi feito (Etapa 1 — seção "Conhecimento conectado")

- **Fontes globais** trocadas em [index.html](index.html) para Figtree + JetBrains
  Mono + Spectral (Google Fonts).
- **Paleta global** aplicada em [src/index.css](src/index.css): novos tokens
  claro/escuro + aliases de compatibilidade; `body` e classes `.eg-*` usam Figtree.
- **[src/components/Logo.jsx](src/components/Logo.jsx)** — novo logo: grafo de
  **9 nós** + "EduGraph" em Spectral. Prop `tamanho` agora é a largura (default 38).
- **[src/pages/Home.jsx](src/pages/Home.jsx)** — reescrita do **Header + Hero**:
  - Header: logo, nav (Grafos/BNCC/Para escolas/Ajuda), ThemeToggle, "Entrar",
    botão "Criar conta".
  - Hero em **grid de 2 colunas**: à esquerda label mono + `<h1>` Spectral
    ("Conhecimento" + *conectado.* em itálico dourado) + parágrafo; à direita dois
    grupos de CTA ("Criar conta gratuita" / "Entrar") separados por divisor "ou".
- **Logos institucionais** extraídos do bundle para
  [src/assets/ufes.png](src/assets/ufes.png) e
  [src/assets/labotim.png](src/assets/labotim.png) (exibidos no header desde a Etapa 2).

Verificado: `npm run build`, `npm run lint` (só 1 warning pré-existente em
ThemeContext.jsx) e `npm run dev` (HTTP 200) OK.

### Limpeza de código (2026-06-22)
Removidos artefatos do template Vite e resíduos do redesenho da Home:
- Apagados `src/App.css` (boilerplate não importado) e `src/assets/react.svg` (sem referência).
- Removida a classe `.eg-btn-secundario` de `index.css` (o hero novo usa botões inline).
- Removido o token `--card-rgb` (sem uso após a reescrita da Home).
- Normalizadas as fontes em Login, Signup e FontSizeWidget: Inter→Figtree e
  IBM Plex Mono→JetBrains Mono (as antigas não são mais carregadas pelo `index.html`).

### Etapa 2 (2026-06-22) — cabeçalho completo + seção "Cada matéria tem sua rede"
- **Cabeçalho**: logos **UFES** e **LabOtim** (links institucionais) + divisória
  adicionados em [src/pages/Home.jsx](src/pages/Home.jsx), à esquerda do ThemeToggle.
- **[src/components/GraphSection.jsx](src/components/GraphSection.jsx)** — 2ª seção,
  grafo-globo interativo **fiel ao protótipo**: `#graphScrollZone` (280vh) com seção
  `sticky`; 15 nós numa esfera projetada em 2D que **gira 360°** conforme o scroll; o
  globo **desliza/escala** para a esquerda e o **painel de texto surge** à direita; o
  tooltip some; **hover** num nó realça vizinhos e rótulos das 21 arestas. Progresso de
  scroll via `requestAnimationFrame`. Puro SVG/DOM (sem three.js / partículas).
- Token `--dot-color` (fundo pontilhado) adicionado em [src/index.css](src/index.css).
- Verificado: `npm run build`, `npm run lint` (só o warning pré-existente) e `npm run dev` (200).

### Etapa 3 (2026-06-22) — banda de estatísticas
- **[src/components/StatsBand.jsx](src/components/StatsBand.jsx)** — faixa `#statsBand` com os
  3 dados de exemplo (412 habilidades BNCC mapeadas · 9 áreas conectadas · 5.º–9.º ano). Os
  números **contam de 0** até o valor final (easeInOutCubic, 1.4s) **uma única vez** quando a
  faixa entra na viewport (`IntersectionObserver`). Renderizado no Home após `<GraphSection />`.
  Sem token novo. Plano de origem: [PLANO_ETAPA3_STATS_BAND.md](PLANO_ETAPA3_STATS_BAND.md).
- Verificado: `npm run build`, `npm run lint` (só o warning pré-existente) e `npm run dev` (200).

### Correção (2026-06-22) — contadores da StatsBand presos em 0
- Em [src/components/StatsBand.jsx](src/components/StatsBand.jsx) o `IntersectionObserver`
  usava `rootMargin: '0px 0px -20% 0px'`. Como a faixa era o **último elemento da página**,
  em telas altas o topo dela nunca cruzava a linha de corte (80%) e a animação nunca
  disparava (ficava em 0). Trocado por `{ threshold: 0.35 }`, robusto a altura de viewport
  e zoom de fonte. (Quando houver footer depois dela, o `-20%` também voltaria a funcionar.)

### Etapa 4 (2026-06-22) — seção de depoimentos
- **[src/components/TestimonialsSection.jsx](src/components/TestimonialsSection.jsx)** — 4ª seção,
  "Quem ensina, sabe o que funciona." **Porte simplificado** do protótipo (que usa
  three.js/WebGL): aqui é **puro DOM/CSS, sem three.js e sem dependências novas**. Zona
  `#testiScrollZone` (300vh) com seção `sticky`; conforme o scroll, os 5 depoimentos
  desfilam num efeito **coverflow** (card ativo centralizado e em destaque, laterais
  reduzem/giram/esmaecem). Painel de legenda (nº + nome ativo) e barra de progresso na
  base; cabeçalho com kicker + título. Progresso de scroll via `requestAnimationFrame`
  (mesmo padrão de GraphSection).
- **[src/data/depoimentos.js](src/data/depoimentos.js)** — os 5 depoimentos (dados mockados,
  conteúdo verbatim do protótipo), seguindo a convenção de manter dados em `src/data/`
  para troca futura por SPARQL.
- Tokens `--testi-accent --testi-num --testi-label --testi-value` (claro/escuro) e o
  keyframe `egFadeUp` adicionados em [src/index.css](src/index.css). **Fora de escopo à
  época:** a fase 2 do protótipo (cortina revelando cards de séries — **feita na Etapa 5**)
  e o WebGL (continua fora de escopo).
- Plano de origem: [crie-um-plano-para-vast-lagoon.md](../../.claude/plans/crie-um-plano-para-vast-lagoon.md).
- Verificado: `npm run lint` (só o warning pré-existente), `npm run build` (bundle +~5KB, sem
  dependência nova) e `npm run dev` (200).

#### Redesenho do layout (2026-06-22) — fiel ao protótipo
- O layout deixou de ser coverflow centralizado e passou ao formato do protótipo:
  **cabeçalho no topo-esquerda**, **legenda à esquerda** (nº + nome + Função/Etapa, em
  grade rotulada) e **um card grande à direita** (levemente inclinado, `rotateY`) com o
  depoimento em destaque; ao rolar, o card ativo desliza/esmaece dando lugar ao próximo.
  Barra de progresso na base, quase em largura total.
- Cores: **fundo da seção branco** e **cards bege** — novos tokens `--testi-bg` e
  `--testi-card` em [src/index.css](src/index.css) (claro: `#ffffff`/`#f7f2e8`; escuro:
  `#000000`/`#121915`).
- Dados: [src/data/depoimentos.js](src/data/depoimentos.js) reestruturado de
  `{ nome, papel, texto }` para `{ nome, funcao, etapa, texto }` (Função/Etapa separadas).
- Verificado: `npm run lint`, `npm run build` e `npm run dev` (200).

#### Ajuste de fidelidade dos cards (2026-06-22)
- Cards mais fiéis ao exemplo em [src/components/TestimonialsSection.jsx](src/components/TestimonialsSection.jsx):
  **cantos retos** (`borderRadius: 0`), contorno fino escuro (`1px solid var(--text)`) e
  **sombra deslocada** (`22px 26px 40px -10px rgba(0,0,0,.28)`). Todos os cards com estilo
  idêntico (sem variação ativo/inativo).
- **Card maior**: passa a rastrear `wh` (`window.innerHeight`); `cardH` é o maior possível
  pela altura disponível (`min(wh-180, 880)`), limitado pela largura da área direita.
- **Faixas decorativas**: SVG ao fundo da seção (zIndex 1) com duas linhas finas
  (`var(--edge)`, levemente inclinadas) no topo e na base — as "linhas da parede" do protótipo.
- `--testi-bg` ajustado para `#fdfdfb` (branco levemente quente).

#### Imersão / animação da "parede" (2026-06-22)
Aproximação maior ao protótipo WebGL em [src/components/TestimonialsSection.jsx](src/components/TestimonialsSection.jsx):
- **Card desliza para a esquerda e encolhe de leve** (`scale` ~−5,5%/card) em vez de
  **esmaecer**: removido o fade por `opacity`; o card ativo descansa em centro-direita
  (`baseX = vw*0.19`) e cada passo de scroll (`stepX = cardW + vw*0.14`) empurra todos
  para a esquerda. Cards distantes saem da tela (cortados pelo `overflow:hidden` da `<section>`).
- **Nome do professor por cima do card**: o container dos cards passou a ocupar a seção
  inteira (`inset:0`) com `zIndex:2`, **abaixo da legenda** (`zIndex:5`) — o card que sai
  escorrega por baixo do nome em itálico da legenda.
- **Sombra quadrada**: troca da sombra borrada por uma sólida **sem blur**
  (`Npx Npx 0 0 rgba(0,0,0,.16)`, offset ~5% da largura), acompanhando a inclinação do
  card — como o plano de sombra do protótipo.
- **Parede mais inclinada** (`rotateY(-10deg)` → `rotateY(-14deg)`, ≈ os −0,25 rad do
  WebGL) e **card maior** (`cardH` máx. 880→960; largura máx. 50%→54% da viewport).
- **Linhas de enfeite mais diagonais** (inclinação ~5%→~16%), reforçando a perspectiva
  da "parede" convergindo à esquerda.
- Verificado: `npm run dev` (módulo transpila via Vite, HTTP 200).

### Etapa 5 (2026-07-04) — grade "Encontre as habilidades da sua turma." + footer
Última seção do protótipo + fim do site. No protótipo a grade **não** é seção solta: é
a **camada de fundo** do scroll-zone dos depoimentos (cortina de 520vh). Optou-se pela
**revelação integrada** (fiel ao protótipo), estendendo o componente de depoimentos.
- **[src/components/TestimonialsSection.jsx](src/components/TestimonialsSection.jsx)** —
  agora implementa a **fase 2 (cortina)** que a Etapa 4 deixou de fora. O `#testiScrollZone`
  cresceu de **300vh → 520vh** e o scroll tem duas fases: `SPLIT = 0.6` reparte entre o
  **desfile** dos depoimentos (fase 1, inalterada — `pos = p1 * (N-1)`) e a **revelação**
  (fase 2, `p2`). A camada da frente (depoimentos, fundo `--testi-bg`) **desliza para a
  esquerda** (`translateX`) e sai; a borda direita varre a tela e revela **pela direita** a
  **camada de fundo** (que entra com leve parallax da direita): kicker "Explore por série" + título "Encontre as
  habilidades da sua turma." + parágrafo + link "Ver todos os grafos" + 8 `GradeCard`
  (hover destaca com borda/texto dourado→escuro). O fundo da `<section>` passou de
  `--testi-bg` para `--bg2`. A barra de progresso agora acompanha `p1`.
- **[src/data/series.js](src/data/series.js)** — as 8 séries (5.º ano…3.º EM) com o nº de
  habilidades (mock; troca futura por SPARQL), seguindo a convenção de `src/data/`.
- **[src/components/Footer.jsx](src/components/Footer.jsx)** — footer completo (fiel ao
  protótipo): marca (**reusa `<Logo>`**) + descrição, colunas **Plataforma**/**Apoio**,
  parceiros **LabOtim**/**UFES** (**reusa** os assets do header) e rodapé legal. "Criar conta"
  chama `onSignup`. Renderizado no [Home.jsx](src/pages/Home.jsx) após `<TestimonialsSection />`.
- Tokens `--grade-card --grade-card-hover` (claro/escuro) e classes `.eg-footer-link` /
  `.eg-footer-legal` adicionados em [src/index.css](src/index.css).
- Verificado: `npm run lint` (só o warning pré-existente), `npm run build` (46 módulos, sem
  dependência nova) e `npm run dev` (HTTP 200, sem erro de transform).

### Etapa 6 (2026-07-07) — popover de matérias ("balão") na grade
Interação nova sobre a grade de séries: **clicar** num card abre um popover ancorado a ele.
- **[src/components/MateriaPopover.jsx](src/components/MateriaPopover.jsx)** — o "balão":
  cabeçalho "MATÉRIA — {ano}" + botão **×**, chips de matérias ("Todas as matérias"
  selecionada por padrão), **setinha** apontando para o card e animação de subida (reusa o
  keyframe `egFadeUp`). Fecha no ×, **clicando fora** (`mousedown` no `document`) ou com
  **Esc**. Acessível (`role="dialog"`, chips `<button>` com `aria-pressed`). Seleção é só
  visual (a tela de grafo é trabalho futuro).
- **[src/data/materias.js](src/data/materias.js)** — as 8 matérias (mock; "Todas as
  matérias" é adicionada na UI).
- **[src/components/TestimonialsSection.jsx](src/components/TestimonialsSection.jsx)** — o
  `GradeCard` virou clicável: estado `anoAberto` no pai (**um card aberto por vez**), card
  `position:relative` (o **grid não se mexe** — o balão é `absolute`), destaque mantido
  enquanto aberto, `zIndex` elevado, e escolha de abrir **para baixo/cima** conforme o espaço
  disponível (evita corte pelo `overflow:hidden` da seção).
- Classes `.eg-materia-chip` (+ `--sel`) e `.eg-materia-fechar` em [src/index.css](src/index.css).
- Plano de origem: [PLANO_POPOVER_MATERIAS.md](PLANO_POPOVER_MATERIAS.md).
- Verificado: `npm run lint` (só o warning pré-existente), `npm run build` (sem dependência
  nova) e `npm run dev` (HTTP 200, sem erro de transform).

### Etapa 7 (2026-07-07) — página "Grafos": conexão + casca (G1)
Início da página que exibirá **de fato o grafo de conhecimento** (o coração do TCC).
Protótipo: [design/prototipo_grafo.html](design/prototipo_grafo.html) (leitura: §5).
Duas decisões tomadas nesta etapa: **motor próprio portado do protótipo** (canvas 2D +
física custom — sem lib externa, resolvendo o "a definir" antigo) e **adaptação ao tema
claro/escuro do site** com ThemeToggle (o protótipo é só claro). A implementação é
**por partes** — roadmap completo em **§4.1**; esta etapa cobre só a G1:
- **[src/pages/Grafos.jsx](src/pages/Grafos.jsx)** — casca: quadro de 1 viewport com
  header próprio (60px: logo, nav com **"Grafos" ativo** sublinhado em verde, logos
  LabOtim/UFES, ThemeToggle, Entrar/Criar conta — trecho que na G10 vira o perfil mock),
  área de trabalho (fundo `--grafo-bg` pontilhado com `--dot-color`) com o
  **card-convite** ("Monte um recorte e explore o grafo.") e `<Footer/>` abaixo da dobra.
- **Rota** `tela === 'grafos'` em [src/App.jsx](src/App.jsx) (callbacks
  `onHome/onLogin/onSignup/onGrafos`).
- **Conexões** (prop `onGrafos` propagada): nav **"Grafos"** no header da Home,
  **"Ver todos os grafos →"** na grade da cortina
  ([TestimonialsSection.jsx](src/components/TestimonialsSection.jsx)) e
  **"Explorar grafos"** no [Footer.jsx](src/components/Footer.jsx) — os três navegam
  para a página.
- Token `--grafo-bg` (claro `#f3eddf` / escuro `#0c110e`) em [src/index.css](src/index.css).
- Verificado: `npm run lint` (só o warning pré-existente), `npm run build` (sem dependência
  nova) e `npm run dev` (HTTP 200).

### Etapa 8 (2026-07-07) — página "Grafos": dados / mock do Fuseki (G2)
- **[src/data/mockFuseki.js](src/data/mockFuseki.js)** — o endpoint SPARQL **simulado**,
  extraído **verbatim** do asset `mock-fuseki.js` do bundle do protótipo (receita no §5)
  — só ganhou a nota de proveniência no cabeçalho. ES module puro (sem API de browser;
  usa apenas `performance.now()`, disponível em browser e Node). Exports: `PREFIXOS
  EIXOS ANOS RELACOES NOS ARESTAS LISTA_* INDICE`, `buscar()`, `construirConsulta{Grafo,
  Expansao,Detalhe}()` (SPARQL real), `config`/`setConfig()`, `consultarFuseki()`
  (Promise no contrato `application/sparql-results+json` + `ms`; simula latência, erro
  HTTP 503 e recorte vazio) e `conexoesDe()` (conexões agrupadas por relação).
- **Correção de contagens** (o relatório da decodificação havia estimado errado): são
  **64 nós** (**8 disciplinas** + 11 conceitos + 45 habilidades — as 8 disciplinas batem
  com as 8 matérias de `materias.js`) e **169 arestas** (53 `desenvolve` ·
  82 `podeSerTrabalhadaEm` · 34 `progrideDe`). §4.1 e §5 corrigidos.
- **Sem UI nova** (critério da G2): nada importa o módulo ainda — o bundle não mudou.
- Testado via Node (script de aceitação): contagens, `buscar` (acentos/pontuação),
  consultas SPARQL geradas, `consultarFuseki` nos 3 tipos + modos vazio/erro/latência,
  `setConfig` e `conexoesDe`. Tudo passou.
- Verificado: `npm run lint` (0 erros no módulo novo; só o warning pré-existente),
  `npm run build` e `npm run dev` (módulo transpila e serve com HTTP 200).

#### Ajuste (2026-07-07) — recorte 5.º–9.º ano + dados dinâmicos na Home
- **[src/data/mockFuseki.js](src/data/mockFuseki.js)** — removido o **Ensino Médio**
  (entrada `EM` de `ANOS` e as 8 habilidades `EM13CO*`): o site cobre o fundamental.
  Novas contagens: **56 nós** (8 disciplinas + 11 conceitos + **37 habilidades**) e
  **136 arestas** (43 `desenvolve` · 67 `podeSerTrabalhadaEm` · 26 `progrideDe`), zero
  arestas órfãs (nenhuma habilidade EF apontava `prog` para EM). Nova função exportada
  **`estatisticas()`** → `{ habilidades, componentes, anoInicial, anoFinal }` (futuro:
  consulta SPARQL de agregação). O cabeçalho documenta os desvios do original.
- **[src/components/StatsBand.jsx](src/components/StatsBand.jsx)** — os 3 números da
  banda deixaram de ser estáticos (412/9/5º–9º) e passam a vir de `estatisticas()` do
  mock (a "costura" do back-end): 37 habilidades · 8 **componentes curriculares
  conectados** (rótulo ajustado; antes "áreas de conhecimento") · 5.º–9.º ano. Quando o
  Fuseki real existir, a banda o refletirá sem mudanças de UI.
- **`src/data/materias.js` removido** — duplicava as 8 disciplinas do mock. O
  [MateriaPopover.jsx](src/components/MateriaPopover.jsx) agora lê
  `LISTA_DISCIPLINAS` do `mockFuseki.js` (fonte única).
- **`src/data/series.js` removido** — a grade "Encontre as habilidades da sua
  turma." ([TestimonialsSection.jsx](src/components/TestimonialsSection.jsx))
  agora consome a nova função **`habilidadesPorAno()`** do mock (futuro: SPARQL
  `COUNT … GROUP BY ?etapa`). Consequência visual: a grade passa a mostrar as
  **5 séries reais do mock** (5.º–9.º ano, com 6/8/9/7/7 habilidades) em vez das
  9 séries com números inventados — coerente com o recorte do site.
- Verificado: teste de aceitação em Node re-rodado com as novas contagens (tudo
  passou), `npm run lint` (0 erros), `npm run build` (mock agora entra no bundle via
  StatsBand, +~13KB) e `npm run dev` (200 em todos os módulos alterados).

### Etapa 9 (2026-07-07) — página "Grafos": filtros + estados (G3) e render do canvas (G4)
A página ganhou o coração funcional: montar um recorte e **ver o grafo**. Trechos
portados diretamente do dc-script/template do protótipo (ver §5).
- **[src/components/GrafoFiltros.jsx](src/components/GrafoFiltros.jsx)** (G3) — barra de
  busca e filtros: **busca com autocomplete** (`buscar()` do mock; bolinha colorida por
  tipo, Enter escolhe a 1ª, Esc/blur fecha; escolher **matéria/conceito aplica na hora**,
  habilidade abre o recorte do ano dela), **pills de série** com 3 estados
  (pendente/aplicada/neutra), **selects** de matéria e conceito, **prévia "N vértices"**
  (`contarVertices` do pendente), botão **Filtrar** (esmaecido sem mudança pendente) e
  link **Limpar**. Modelo de **seleção pendente**: nada consulta até o Filtrar.
- **[src/pages/Grafos.jsx](src/pages/Grafos.jsx)** (G3) — máquina de estados
  `inicio/carregando/pronto/vazio/erro` com os overlays do protótipo: card-convite
  (início), **skeleton de 14 nós pulsando** + spinner "Consultando endpoint SPARQL…"
  (carregando), card de **erro** (mensagem monoespaçada + Tentar novamente / Voltar ao
  início) e card de **vazio** (Limpar filtros); **resumo do recorte** (pill topo-centro:
  recorte · nós · conexões · ms); fluxo `pend → filtros → consultarFuseki('grafo')` com
  guarda de sequência (descarta resposta atrasada); **sincronização com a URL**
  (`?serie=&disciplina=&conceito=` — lê no mount com validação e escreve via
  `history.replaceState`); `montarGrafo()` porta o `construirGrafo` do protótipo
  (dedupe de arestas, `nosIsolados`, posições estáveis entre recortes).
- **[src/components/GrafoCanvas.jsx](src/components/GrafoCanvas.jsx)** (G4) — canvas 2D
  **HiDPI** com o `desenhar()` fiel: grid pontilhado com **parallax**, transform de
  câmera com **aproximação suave** (lerp 0.14/frame), **arestas com seta** (tracejadas
  em `progrideDe`), nós por tipo com **rótulo + halo**, `enquadrar()` (fit-to-view) ao
  trocar o recorte; posições iniciais em **espiral de ângulo áureo** (dist 70+/230/330,
  raio visual 11/14/17). Cores **resolvidas dos tokens** via `getComputedStyle`
  (re-lidas na troca de tema). `hoverRef`/`selecionadoRef` e o chip de rótulo de
  relação já existem para a G6; física fica para a G5 (layout estático por ora).
- **[src/index.css](src/index.css)** — tokens novos (claro/escuro): `--no-habilidade
  --no-conceito --no-disciplina --grafo-aresta --grafo-aresta-destaque --grafo-anel
  --grafo-halo --grafo-tooltip-bg/fg --grafo-previa-bg/borda`; keyframes `egPulsar
  egGirar egSurgir`; classes `.eg-grafo-busca .eg-grafo-sugestao .eg-grafo-pill
  .eg-grafo-filtrar`.
- Verificado: `npm run lint` (0 erros, só o warning pré-existente), `npm run build`
  (+~20KB, sem dependência nova) e `npm run dev` (200 em todos os módulos novos).

#### Correções (2026-07-07) — deep-link e paleta do canvas
- **Deep-link abria a Home**: o roteamento por estado sempre iniciava `tela='home'`,
  então uma URL com recorte (`?serie=7&disciplina=matematica`) nunca montava a página
  Grafos. Em [src/App.jsx](src/App.jsx), `telaInicial()` agora inspeciona a URL e abre
  direto em `grafos` quando há parâmetros de recorte; e `irPara()` **limpa** esses
  parâmetros ao navegar para fora do grafo (o recorte só faz sentido lá).
- **Halo/grid com a cor do tema anterior**: ao alternar claro↔escuro, o halo dos
  rótulos e o grid pontilhado do canvas ficavam com as cores do tema **anterior**
  (halo creme no escuro; preto ao voltar pro claro). Causa: o efeito do
  `GrafoCanvas` (filho) lia os tokens **antes** de o `ThemeProvider` (pai) aplicar o
  `data-theme` no `<html>` — efeitos de filho rodam primeiro no React, então a
  paleta ficava um toggle atrasada. Em
  [src/components/GrafoCanvas.jsx](src/components/GrafoCanvas.jsx) a paleta agora é
  re-resolvida **dentro do loop de desenho**, quando o atributo `data-theme` do
  `<html>` de fato muda.

### Etapa 10 (2026-07-07) — página "Grafos": física do layout (G5)
O grafo deixou de ser a espiral estática (que sobrepunha nós) e passou a **assentar
organicamente** — e com garantia de espaçamento.
- **[src/components/GrafoCanvas.jsx](src/components/GrafoCanvas.jsx)** — `fisica()`
  **fiel às constantes do protótipo**: repulsão entre todos os pares
  `min(2800/d², 12)·alpha` + **anti-colisão** (distância mínima entre centros =
  `raio_A + raio_B + 10px`, empurrão `(min−d)·0.35` — **nenhum nó fica sobre outro**);
  **molas por aresta** com repouso por relação (`desenvolve` 130 ·
  `podeSerTrabalhadaEm` 175 · `progrideDe` 205, força 0.028); **gravidade ao centro**
  0.0045; **damping** 0.86; **esfriamento** `alpha *= 0.988`. Roda no loop RAF
  enquanto `alpha > 0.012` (ou durante arraste — `dragRef`, pronto para a G6).
- **Reaquecimento**: recorte novo (prop `versao`) reaquece com `alpha = 1`; o
  `enquadrar()` (fit-to-view) passou de 60ms para **420ms** após a chegada dos dados,
  como no protótipo — a câmera enquadra o layout já aberto pela física.
- **`assentar(N)`**: resolve N iterações de uma vez (alpha 1 → 0) — é o caminho do
  modo **"sem animação"** (prop `semAnim`, já aceita pelo componente e com salto de
  câmera instantâneo; quem a liga é a preferência de acessibilidade da G10).
- Nota de implementação: a física **muta** os nós do Map do estado (mesmos objetos) —
  intencional e documentado no código: só o canvas lê `x/y`, a cada frame, como no
  protótipo.
- Verificado: `npm run lint` (0 erros, só o warning pré-existente), `npm run build`
  (+~1,5KB, sem dependência nova) e `npm run dev` (200 nos módulos alterados).

### Etapa 11 (2026-07-10) — página "Grafos": interações do canvas (G6)
O grafo virou um objeto manipulável — handlers portados fielmente do dc-script do
protótipo (conversão tela→mundo, hit-test com tolerância de 6px de tela, `moveu`
distinguindo clique de arraste/pan).
- **[src/components/GrafoCanvas.jsx](src/components/GrafoCanvas.jsx)** — efeito de
  interações (listeners nativos; wheel com `passive: false` porque o `onWheel` do
  React é passivo): **hover** liga tooltip/destaque de vizinhos já desenhados na G4
  (cursor pointer/grab), **clique seleciona** (soltar sem mover; anel + esmaecer o
  resto), **arrastar nó** (nó segue o ponteiro com `vx=vy=0` e reaquece a física a
  `alpha ≥ 0.25`), **pan no vazio** (soltar sem mover desseleciona), **wheel-zoom
  ancorado no cursor** (`k·exp(−deltaY·0.0013)`, clamp `[0.18, 3]`). A **seleção
  subiu para a página** (props `selecionadoId`/`onSelecionar`; hover continua em ref,
  sem re-render) e o componente virou `forwardRef` expondo `{ centrarEm, enquadrar,
  zoomMais, zoomMenos }` (passos ×1.35, mesmos clamps) para os botões, a busca e as
  G7/G11. Desvios documentados no código: `pointerleave` limpa o hover, hover zerado
  na troca de recorte (senão o grafo novo nasceria esmaecido) e `touch-action: none`
  no canvas (sem isso não há drag/pan em touch).
- **[src/pages/Grafos.jsx](src/pages/Grafos.jsx)** — estado `selecionadoId` (zerado
  quando o nó sai do recorte novo, como no protótipo), **Esc** limpa seleção e
  sugestões (listener global), botões **+/−/recentrar** no topo-direita (só em
  `pronto`; ícone do protótipo) e o fim do pendente da G3 na busca: **habilidade já
  no grafo** → seleciona e centra sem reconsultar; **fora** → `pendenteSel` + recorte
  do ano dela (limpando matéria/conceito, como o protótipo) e seleção+`centrarEm`
  ~770ms depois (420 do enquadrar + 350), cancelada se outro recorte chegar antes.
- Classe `.eg-grafo-zoom` (+ `:hover` verde) em [src/index.css](src/index.css) —
  hover via CSS, não via estado JS. Sem token novo.
- 2×clique (expandir) ficou para a **G8**, como no roadmap; painel de detalhe é G7.
- Verificado: `npm run lint` (0 erros, só o warning pré-existente), `npm run build`
  (sem dependência nova) e `npm run dev` (200 nos módulos alterados). Interações de
  ponteiro exigem teste manual no navegador (checklist: hover/tooltip, clique
  seleciona, Esc, arrastar nó, pan, wheel-zoom, botões, busca por habilidade).

### Etapa 12 (2026-07-11) — página "Grafos": painel de detalhe (G7)
O aside "de vidro" do protótipo — o lugar onde o professor lê o texto oficial da
habilidade sem sair do grafo.
- **[src/components/GrafoPainel.jsx](src/components/GrafoPainel.jsx)** (novo) — painel
  flutuante à esquerda do palco (vidro: `--pill-bg` 72% + `backdrop-filter: blur(14px)`,
  `zIndex` 30 — acima do card-convite, abaixo dos overlays de estado em 32).
  **Arrastável** pela alça superior e **redimensionável** pela borda direita (clamps do
  protótipo: `x ∈ [8, W−w−8]`, `w ∈ [320, min(620, W−x−8)]`; listeners na `window` para
  o arrasto sobreviver fora do aside); botão **esconder** vira a aba "Painel"
  (topo-esquerda) que reabre. **Sem seleção**: cheat-sheet de interações (hover/clique/
  2×clique/arrastar, verbatim). **Com seleção**: bolinha + tipo, chip do código
  `EFxxCOxx`, título em Spectral, pills ano/eixo/área, bloco "Texto normativo — BNCC
  Computação"/"Definição" (spinner `egGirar` enquanto consulta; sem bloco para matéria),
  **conexões agrupadas por relação** (contador por grupo; item clicável navega via
  `irPara`; **fora do recorte** fica a 62% com chip "+ expandir" — a expansão em si é
  G8) e os links da **fonte oficial** (BNCC Computação / Resolução CNE/CEB). Rodapé:
  chips **"Vistos por último"** (últimos 5, clicáveis) + placeholder **"Assistente do
  grafo — em breve"** (input + aviso "Em desenvolvimento…").
- **[src/pages/Grafos.jsx](src/pages/Grafos.jsx)** — `selecionar(id)` agora é o fluxo
  completo do protótipo: registra nos vistos (máx. 5, sem duplicar), abre o painel com
  `conexoesDe(id)` (síncrono, do mock) e busca o texto via `consultarFuseki('detalhe')`
  (parse de `edu:textoNormativo`/`edu:definicao`; **fallback local** `base.texto/def` se
  a consulta falhar; guarda `selRef` descarta resposta de seleção antiga). Estados novos
  `detalhe` e `painel {x:12, w:392, esc}` (persistência em localStorage fica p/ G10);
  `irPara(id)` centraliza a navegação painel→canvas (nó fora do recorte: no-op até a
  G8). Esc/recorte novo/Limpar também fecham o painel.
- **[src/components/GrafoCanvas.jsx](src/components/GrafoCanvas.jsx)** — prop nova
  `offsetEsquerda` (= `painel.x + painel.w`, 0 se escondido) alimenta o `offsetPainel()`
  que estava stub desde a G4: `enquadrar()` e `centrarEm()` miram o centro do espaço
  **livre** à direita do painel, como no protótipo.
- Classes `.eg-painel-chip .eg-painel-fechar .eg-painel-item .eg-painel-fonte
  .eg-painel-ia(:focus) .eg-painel-enviar` em [src/index.css](src/index.css) (hovers via
  CSS). **Sem token novo** — os rgba() do protótipo viraram `color-mix()` sobre tokens
  existentes (`--pill-bg --bg --bg2 --edge --grafo-previa-*`), então o vidro acompanha o
  tema escuro de graça.
- Fora do escopo (roadmap): botão "Expandir conexões deste nó" e o clique em item fora
  do recorte (**G8**); persistência da posição/largura e formas por tipo (**G10**).
- Verificado: `npm run lint` (0 erros; 1 disable documentado no efeito de mount da URL,
  mesmo padrão do canvas), `npm run build` (+~17KB, sem dependência nova) e
  `npm run dev` (200 nos módulos novos/alterados). Teste manual no navegador:
  clicar nó → painel com texto e conexões; arrastar/redimensionar/esconder painel;
  navegar por conexão e por "visto"; Esc/× fecham; recorte novo enquadra à direita
  do painel.

### Etapa 13 (2026-07-11) — página "Grafos": expandir + desfazer (G8)
O grafo deixou de ser um recorte fixo: dá para **crescer** a partir de qualquer nó e
**voltar atrás**. Porte fiel de `expandir()/snapshot()/desfazerExpansao()` do protótipo.
- **[src/pages/Grafos.jsx](src/pages/Grafos.jsx)** — `expandir(id, aposExpandir)`:
  `consultarFuseki('expansao')` traz os vizinhos e **funde** ao grafo (dedupe de arestas
  por `a|rel|b`; nós novos nascem num **círculo de 90px** ao redor da origem e a física
  os assenta). A fusão **não re-enquadra**: `versao` não muda — o canvas só recebe
  `reaquecer(0.8)`. Antes de fundir, um **snapshot** (nós com posição + arestas, cópias
  profundas) entra no histórico `histExp` (**máx. 10**; zerado a cada recorte novo, como
  o protótipo). `desfazerExpansao()` restaura o snapshot (posições inclusas), atualiza
  contagens, mantém a seleção só se o nó sobreviveu e reaquece de leve (0.5). Guarda de
  sequência compartilhada com `aplicarFiltros` (recorte novo invalida expansão em voo);
  falha da expansão cai no card de **erro** padrão. `irPara(id)` agora é o completo do
  protótipo: nó presente → seleciona/centra; **fora do recorte com seleção** → expande o
  selecionado e vai ao alvo se ele chegou (callback após 250ms); fora sem seleção → só
  seleciona (painel mostra o detalhe). Botão **"Desfazer expansão ×N"** (pill topo-centro
  a 52px, abaixo do resumo; hover dourado; só em `pronto` com histórico).
- **[src/components/GrafoCanvas.jsx](src/components/GrafoCanvas.jsx)** — **2×clique**
  num nó seleciona + expande (`onExpandir`, listener `dblclick` no efeito de interações);
  API nova **`reaquecer(nivel)`** (`alpha = max(alpha, nivel)`; com `semAnim` assenta
  160/120 iterações de uma vez, fiel ao protótipo).
- **[src/components/GrafoPainel.jsx](src/components/GrafoPainel.jsx)** — botão
  **"Expandir conexões deste nó"** (borda verde, entre as conexões e a fonte oficial;
  "Expandindo…" + `disabled` durante a consulta) e os itens **"+ expandir"** das
  conexões agora funcionam via `irPara`.
- Classes `.eg-painel-expandir` e `.eg-grafo-desfazer` em [src/index.css](src/index.css).
  Sem token novo.
- Verificado: `npm run lint` (0 erros, só o warning pré-existente), `npm run build`
  (+~4KB, sem dependência nova) e `npm run dev` (200 nos módulos alterados). Teste
  manual: 2×clique expande; botão do painel expande; item "+ expandir" expande e navega;
  Desfazer volta cada passo (contador decrementa) e some no zero; recorte novo zera o
  histórico; a câmera NÃO re-enquadra ao expandir.

### Etapa 14 (2026-07-11) — página "Grafos": overlays finais (G9)
Legenda com filtro por tipo, gaveta SPARQL e paleta para daltonismo — os três
overlays que faltavam no palco. Componentes pequenos e irmãos num único módulo.
- **[src/components/GrafoOverlays.jsx](src/components/GrafoOverlays.jsx)** (novo; três
  exports nomeados):
  - **`LegendaTipos`** (canto inferior direito) — contagem por tipo com bolinha nas
    cores `--no-*` e **toggle** que oculta/mostra o tipo **reconsultando o endpoint**:
    o filtro `tipos` agora viaja em `filtros` (o `FILTER (?origemTipo NOT IN …)` da
    consulta gerada pelo mock passa a ser exercitado). Tipo oculto: opacidade 0.45,
    riscado, contagem "—". Rodapé com a linha tracejada "progressão entre anos".
    Visível em `pronto` e `vazio` (fiel ao protótipo — inclusive o overlay de vazio
    por cima, transparente).
  - **`GavetaSparql`** (ao lado da legenda, estado `aberta` interno) — pill "SPARQL"
    (bolinha verde → dourada quando a simulação de falha está ligada) abre a gaveta
    com a **última consulta real** enviada (`construirConsulta{Grafo,Expansao,Detalhe}`
    agora alimentam o estado `consulta` da página), o tempo em ms, o checkbox
    **"Simular falha do endpoint (HTTP 503)"** (efeito `[simErro]` → `setConfig({erro})`;
    desligado ao sair da página) e a nota de troca por um Fuseki real. O `<pre>` usa
    cores fixas de terminal (escuro nos 2 temas, de propósito).
  - **`PaletaPopover`** (na coluna de zoom) — botão-swatch (3 círculos nas cores
    ATUAIS via tokens; borda verde quando a paleta não é a padrão) abre "Cores do
    grafo · daltonismo": **Padrão / Protanopia / Deuteranopia / Tritanopia** com
    amostras, ✓ na ativa. Esc e clique no vazio fecham (via `desselecionar`).
- **[src/data/paletas.js](src/data/paletas.js)** (novo) — os hex das 3 paletas de
  daltonismo (verbatim do protótipo; módulo próprio para não quebrar o fast-refresh
  com export não-componente).
- **[src/pages/Grafos.jsx](src/pages/Grafos.jsx)** — `FILTROS_VAZIOS` ganhou `tipos`
  (Limpar re-liga os 3); estados `consulta/simErro/paleta/paletaAberta`; efeito da
  paleta escreve/remove os overrides `--no-*` no `<html>` (vale para canvas, painel,
  filtros e legenda de uma vez; limpa ao desmontar).
- **[src/components/GrafoCanvas.jsx](src/components/GrafoCanvas.jsx)** — a chave do
  cache de cores passou de `tema` para `tema|override(--no-habilidade)`: o canvas
  relê os tokens quando a paleta muda, **lendo o valor já aplicado no `<html>`** (uma
  prop criaria corrida: o RAF poderia recachear antes de o efeito escrever os tokens).
- Classes `.eg-legenda-item .eg-grafo-sparql .eg-paleta-opcao` em
  [src/index.css](src/index.css). Sem token novo.
- Fora do escopo (G10): toggles "formas em vez de cores" e "sem animação" no popover,
  persistência da paleta em localStorage.
- Verificado: `npm run lint` (0 erros, só o warning pré-existente), `npm run build`
  (+~10KB, sem dependência nova) e `npm run dev` (200 nos módulos novos/alterados).
  Teste manual: ocultar "Conceitos" pela legenda (reconsulta e some do grafo; "—" na
  contagem); gaveta mostra a consulta com o FILTER; ligar a simulação → Filtrar cai no
  card de erro (bolinha do pill fica dourada); trocar para Deuteranopia recolore
  canvas, legenda, painel e busca; Padrão volta ao normal; tema escuro convive com a
  paleta.

#### Ajuste (2026-07-11) — Habilidades sempre visíveis na legenda
- Em [src/components/GrafoOverlays.jsx](src/components/GrafoOverlays.jsx), a linha
  **Habilidades** da legenda deixou de ser alternável (desvio documentado do
  protótipo): **toda aresta do grafo passa por uma habilidade** (`desenvolve`,
  `podeSerTrabalhadaEm` e `progrideDe` são centradas nelas), então ocultá-las
  esvaziava o recorte em 100% dos casos. A linha continua exibindo a contagem
  (cursor default, sem hover; tooltip explica). Conceitos e Matérias seguem
  alternáveis. Verificado: lint/build/dev OK.

#### Ajustes de UX (2026-07-11) — legenda, paleta CUD e widget de fonte
- **Legenda** ([GrafoOverlays.jsx](src/components/GrafoOverlays.jsx)): a linha
  **Habilidades** virou uma "linha-selo" visivelmente não-clicável — fundo `--bg2`,
  contorno tracejado, chip **FIXO** — apartada dos dois toggles. A chave de leitura no
  rodapé ganhou a **linha contínua** ("conexão direta no recorte") acima da tracejada
  ("progressão entre anos").
- **Paletas de daltonismo** ([src/data/paletas.js](src/data/paletas.js)) trocadas pelas
  cores do **Color Universal Design (CUD) de Okabe & Ito**: protanopia
  `#0072B2/#E69F00/#000000`, deuteranopia `#0072B2/#E69F00/#CC79A7`, tritanopia
  `#D55E00/#0072B2/#009E73`; crédito adicionado no rodapé do popover.
- **FontSizeWidget × popover de paleta**: o popover cobria o widget A/A (fixo a 50% da
  lateral direita). A posição do widget saiu do inline para a classe `.eg-font-widget`;
  com o popover aberto, a página de grafos põe `data-paleta-aberta="1"` no `<html>` e o
  CSS **esconde o widget com fade** (`opacity: 0` + `pointer-events: none`; a 1ª versão
  deslizava para `top: 80%`, mas caía em cima da legenda "Tipos de nó") — fechou o
  popover, reaparece. Mesmo padrão desacoplado do `data-theme` (o widget é global, do App).
- Verificado: lint/build/dev OK.

#### Correção (2026-07-11) — protanopia ↔ deuteranopia não recoloria o canvas
- A chave do cache de cores do [GrafoCanvas.jsx](src/components/GrafoCanvas.jsx) usava
  só o override de `--no-habilidade` — e as paletas CUD de protanopia e deuteranopia
  **compartilham** habilidade (`#0072B2`) e conceito (`#E69F00`), diferindo apenas na
  disciplina. Trocar uma pela outra não mudava a chave e o canvas não relia os tokens
  (a legenda/painel, que usam `var()` direto, atualizavam). A chave agora concatena os
  **três** tokens `--no-*`. Verificado: lint/build/dev OK.

### Etapa 15 (2026-07-11) — página "Grafos": perfil mock + acessibilidade + persistência (G10)
A página ganhou "dona": a Profa. Mariana (mock), suas turmas como atalho de filtro, e
as preferências de acessibilidade que sobrevivem ao reload.
- **[src/components/GrafoPerfil.jsx](src/components/GrafoPerfil.jsx)** (novo) —
  **substitui o Entrar/Criar conta** do header da página: botão de conta (avatar "MS" +
  "Profa. Mariana" + seta; borda verde aberto) abre o dropdown fixo (`top:66 right:20`,
  368px; backdrop `fixed inset:0` fecha ao clicar fora): **identidade** (avatar 46px,
  nome em Spectral, e-mail), **"Alterar senha"** (aviso: "chega junto com o sistema de
  contas"), **"Minhas turmas"** (lista ano+matéria com **Filtrar** — aplica o recorte —
  e **×** remover; selects + **"+ Adicionar"** com dedupe) e **"Acessibilidade · cores
  do grafo"** (reusa `OpcoesAcessibilidade`) + nota "Preferências salvas na sua conta".
- **[src/components/GrafoOverlays.jsx](src/components/GrafoOverlays.jsx)** —
  **`OpcoesAcessibilidade`** (novo export): o miolo compartilhado entre o PaletaPopover
  e o perfil — linhas de paleta CUD + toggles **"Formas em vez de cores"** e
  **"Desativar animações e física"** (interruptor 34×20 do protótipo, componente
  `Chave`). O botão-swatch fica verde quando qualquer preferência é não-padrão.
- **[src/components/GrafoFiltros.jsx](src/components/GrafoFiltros.jsx)** — botão
  **"Turmas"** (chapeuzinho + seta) entre os selects e a prévia: dropdown com as turmas
  do perfil (clicar **aplica ano+matéria na hora**), estado vazio ("Você ainda não tem
  turmas cadastradas.") e link **"Gerenciar turmas no perfil"** (abre o dropdown do
  perfil). Aberto/fechado vive na página (Esc e clique no vazio fecham; abrir um
  popover fecha o outro).
- **Modo formas** (daltonismo total): no canvas, `tracarNo()` portado do protótipo —
  conceito vira **quadrado** (`s = r·0.92`), disciplina vira **triângulo** (`s = r·1.22`),
  habilidade continua círculo. Nos pontinhos DOM (sugestões, legenda, painel, vistos,
  paleta), a forma vem das **classes `.eg-no-*`** + atributo `data-formas` no `<html>`
  (quadrado: `border-radius: 2px`; triângulo: `clip-path: polygon(…)`) — um só switch
  CSS recolore tudo, mesmo padrão do `data-theme`/paleta.
- **Modo sem animação**: prop `semAnim` (aceita desde a G5) finalmente ligada — física
  desligada, `assentar(N)` resolve o layout de uma vez, câmera salta sem lerp. Ligar
  com um grafo em cena chama `canvasApi.assentar(200)` após 30ms (novo método na API
  imperativa, fiel ao protótipo).
- **Persistência** ([src/pages/Grafos.jsx](src/pages/Grafos.jsx)) —
  `localStorage['edugraphPrefs']` guarda `{ paleta, formas, semAnim, turmas, painel }`.
  `lerPrefs()` valida campo a campo no load (prefs corrompidas viram padrão, como o
  protótipo); efeito de gravação com **debounce de 150ms** (o arrasto do painel muda o
  estado a cada pointermove — não vale um write por frame). A posição/largura/esc do
  painel de contexto agora sobrevive ao reload.
- Classes `.eg-no-{habilidade,conceito,disciplina}` (+ variantes `data-formas`),
  `.eg-turma-item .eg-turma-add .eg-toggle-linha` em [src/index.css](src/index.css).
  Sem token novo. Prop `onLogin` removida da página (sem uso após o perfil).
- Verificado: `npm run lint` (0 erros, só o warning pré-existente), `npm run build`
  (+~13KB, sem dependência nova) e `npm run dev` (200 nos módulos novos/alterados).
  Teste manual: perfil abre/fecha (backdrop, Esc); adicionar turma "7.º ano ·
  Matemática" → aparece no dropdown Turmas → Filtrar aplica o recorte; formas trocam
  no canvas E nos pontinhos DOM; sem-animação assenta na hora (recorte novo sem
  física); recarregar a página preserva paleta/formas/semAnim/turmas/painel; Limpar
  prefs = apagar a chave no devtools.

#### Ajuste de UX (2026-07-12) — header único para Home e Grafos
A pedido do autor (durante a revisão §4.2, mas **fora dela** — é mudança visual):
os dois headers viraram UM componente, **[src/components/SiteHeader.jsx](src/components/SiteHeader.jsx)**,
na base compacta da página de grafos (60px, borda inferior, logo 34, logos
institucionais 22px). A única diferença entre as páginas é o **slot da direita**
(children): Home injeta **Entrar/Criar conta** (agora 14px/compactos, como eram no
Grafos); Grafos injeta o **GrafoPerfil**. Prop `paginaAtiva="grafos"` marca o item
da nav como ativo (sublinhado verde); fora dela "Grafos" navega; o Logo leva à
Home quando `onHome` é passado. As laterais têm `flex: 1` e a nav vive no
**centro geométrico** do header — trocar de página (slot direito mais largo ou
estreito) não desloca os itens do meio (pedido do autor após comparar as telas).
O slot de conta tem **largura fixa** (`LARGURA_SLOT_CONTA = 180`) nas duas
páginas: logos institucionais, divisor e ThemeToggle ficam pixel-idênticos entre
telas, e o botão de perfil se **estica** (`width: 100%`, seta com
`margin-left: auto`) para ocupar o mesmo espaço do par Entrar/Criar conta. **Desvio do protótipo final documentado**: a Home
perdeu o header alto/sem borda da landing em troca da consistência entre páginas
(decisão do autor). Isso **antecipou e substituiu** a extração `HomeHeader.jsx`
prevista na R7b. Home.jsx e Grafos.jsx perderam os imports de
Logo/ThemeToggle/LogosInstitucionais (vivem no SiteHeader). Verificado: lint 0/0,
build (bundle 274.90 → 274.34 kB), dev 200.

### Etapa 16 (2026-07-11) — integração Home ↔ Grafos (G11) · **roadmap G1–G11 completo**
O ciclo fechou: da grade de séries da Home dá para cair na página de grafos **com o
recorte da turma já aplicado** — reusando o deep-link da G3, sem mecanismo novo.
- **[src/components/MateriaPopover.jsx](src/components/MateriaPopover.jsx)** — os chips
  deixaram de ser rótulos soltos e carregam o **id real** da disciplina (de
  `LISTA_DISCIPLINAS`; "Todas as matérias" = id vazio), e o balão ganhou o CTA
  **"Ver o grafo desta turma →"** (verde, largura total), que chama
  `onVerGrafo(disciplinaId)`. *Desvio documentado:* o CTA **não existe no protótipo**
  (o balão de lá é só visual) — o botão materializa a integração prevista na G11.
- **[src/components/TestimonialsSection.jsx](src/components/TestimonialsSection.jsx)** —
  `verGrafoDaTurma(anoId, disciplinaId)`: escreve `?serie=&disciplina=` na URL
  (`history.replaceState`) e chama `onGrafos()`. A página de grafos **remonta**, lê os
  parâmetros no mount (deep-link da G3, com validação) e aplica o recorte sozinha — o
  `irPara()` do App já preservava os parâmetros quando o destino é `grafos`.
  `GradeCard` propaga `anoId`/`aoVerGrafo` ao balão.
- **[src/data/mockFuseki.js](src/data/mockFuseki.js)** — `habilidadesPorAno()` passou
  a devolver também o `id` da série (o rótulo "5.º ano" não serve de parâmetro).
- Sem CSS novo (o CTA reusa `.eg-grafo-filtrar`); sem token novo.
- Verificado: `npm run lint` (0 erros, só o warning pré-existente), `npm run build` e
  `npm run dev` (200 nos módulos alterados). Teste manual: Home → rolar até a grade →
  card "7.º ano" → chip "Matemática" → "Ver o grafo desta turma" → página abre já
  consultando `serie=7&disciplina=matematica` (pill de resumo confere); com "Todas as
  matérias", só `serie=7`; voltar à Home limpa a URL (comportamento do App).

**Com a G11, o roadmap §4.1 (G1–G11) está 100% concluído — a página de grafos está
completa contra o mock.**

### Etapa 17 (2026-07-12) — Revisão e polimento (R0–R7b): relatório final
Revisão de limpeza pura concluída (roadmap §4.2; zero mudança de comportamento,
exceto os ajustes de UX pedidos pelo autor no meio dela, registrados à parte).

**Removido:** prop `onLogin` morta passada a `<Grafos>` (App.jsx) — único código
morto real do projeto (ESLint já bloqueava o resto).

**Corrigido (comentários):** 6 desatualizados (paletas.js, GrafoPainel, Grafos,
GrafoCanvas, Logo, GrafoPerfil — detalhes na R2). Nenhum ruído nem porquê
faltante encontrado; todos os porquês (física, proveniência, guardas, caches)
preservados.

**Consolidado:** `useTheme` em módulo próprio (**lint zerado**: morreu o warning
que acompanhava o projeto desde a Etapa 1); `MONO_LABEL` ×3 → `grafo/estilos.js`;
logos LabOtim/UFES dos 2 headers → `LogosInstitucionais`; 12 números mágicos →
constantes nomeadas (R4, valores idênticos); `index.css` com sumário + escala de
z-index documentada (R3).

**Reorganizado:** `components/grafo/` com os 6 arquivos do domínio (R7a, renames
git); fragmentação R7b — Home 281→65 (HeroSection), Grafos 1149→799
(GrafoEstados), Testimonials 559→491 (GradeCard). Fora da revisão, mas junto:
header único `SiteHeader` (ajuste de UX).

**Mantido deliberadamente (com motivo):**
- `--green-soft`: paleta documentada do protótipo (§2), pode servir a Login/Signup.
- Aliases `--accent-hover --accent-rgb --line-strong`: o inventário os deu como
  órfãos, mas o **grep obrigatório pré-remoção** (regra do §4.2) mostrou usos
  dentro do próprio index.css (`::selection`, `.eg-input`, `.eg-btn-primario`) —
  lição registrada: inventário só de `.jsx` não basta.
- Exports do mockFuseki sem uso interno: contrato público da troca pelo Fuseki (D1).
- Padrões Esc/clique-fora (4 variações) e estilos de `<select>`: sutilmente
  diferentes entre si — extração viraria abstração falsa.
- Logos do Footer: variação de design própria, não duplicação.
- GrafoCanvas/GrafoPainel/GrafoOverlays/mockFuseki não fragmentados (coesão/D3/D1).

**Bugs encontrados e não corrigidos: nenhum** — a revisão não identificou defeito
funcional.

**Números finais:** lint **0 erros / 0 warnings**; bundle JS 275.86 → **274.88 kB**
(−0,35%), CSS **7.45 kB idêntico**; sem dependência nova. Convenções novas
registradas: **D11** no [guia/DECISOES.md](guia/DECISOES.md).

#### Ajuste de UX (2026-07-13) — conteúdo do slot de conta CENTRALIZADO
A pedido do autor (durante a A1 do §4.3, mas vale para o site todo): o conteúdo
do slot de conta do [SiteHeader.jsx](src/components/SiteHeader.jsx) (largura
fixa de 180px) deixou de ser alinhado à direita (`justify-content: flex-end`)
e passou a ser **centralizado** (`center`) — padroniza as 4 telas: par
Entrar/Criar conta (Home), prompt de troca (Login/Signup) e botão de perfil
(Grafos). O botão de perfil ([GrafoPerfil.jsx](src/components/grafo/GrafoPerfil.jsx))
perdeu o `width: 100%` (e a seta o `margin-left: auto`): agora tem largura
natural e centraliza no slot como os demais. O slot em si continua com os
mesmos 180px — logo, nav, logos institucionais e ThemeToggle seguem imóveis
entre páginas. Verificado: lint 0/0, build (274.45 kB), dev 200.

### Etapa 18 (2026-07-16) — Telas de conta (A0–A5): fechamento + revisão de acessibilidade
Roadmap §4.3 concluído — Login/Signup migrados do layout antigo para o
protótipo final (moldura + fundo de vértices + card/footer de vidro), e o
autor pediu, junto da A5, uma **revisão web-interface-guidelines** das telas.

**Aliases removidos (A5):** os 9 aliases antigos (`--ink --accent --accent-hover
--line --line-strong --card --bg-soft --mut --accent-rgb`) saíram dos dois
temas do [index.css](src/index.css). Migrações antes da remoção:
[FontSizeWidget.jsx](src/components/FontSizeWidget.jsx) (`--line/--card/--ink/
--mut` → `--pill-border/--pill-bg/--text/--muted`), `::selection`
(`rgba(--accent-rgb)` → `color-mix` sobre `--green`) e — **achado pelo grep
obrigatório, fora do roadmap** — `.eg-link-nav:hover` (`--ink` → `--text`,
nav do SiteHeader, site todo). `--green-soft` mantido (paleta do protótipo,
§2). Grep pré-remoção incluindo strings/template literals: zero sobras
(só o comentário do topo cita os nomes). **Lição da R1 confirmada de novo:**
o roadmap tinha previsto 2 migrações; o grep no CSS achou a 3.ª.

**Acessibilidade das telas de conta (guidelines):** Login/Signup ganharam
`<form>` semântico (**Enter envia**), `label htmlFor`/`input id`,
`autocomplete`/`name`/`inputmode`, `spellCheck={false}` no e-mail, **foco no
1.º campo com erro** no submit, `aria-invalid` + `role="alert"` nas mensagens
e botão `type="submit"` **desabilitado durante o envio** (regra `:disabled`
nova). [FundoVertices.jsx](src/components/conta/FundoVertices.jsx) passou a
honrar **`prefers-reduced-motion` do SO** além do `edugraphPrefs.semAnim`
(a animação é decorativa). Tudo invisível: o layout do protótipo não mudou.

**Achados reportados e NÃO alterados** (decisão documentada / fora de escopo):
navegação por `<span onClick>` (padrão D8/D9 do site inteiro — trocar só
nestas telas criaria inconsistência); placeholders sem `…` (são valores-exemplo
fiéis ao protótipo, D4); `<img>` dos logos no [Footer.jsx](src/components/Footer.jsx)
sem `width`/`height` (componente compartilhado — mexer arriscaria regressão em
Home/Grafos, contra a regra do §4.3).

**Bugs encontrados: nenhum.** **Números:** lint **0/0**; bundle JS 278.44 →
**280.18 kB** (+1,7 kB do form acessível); **CSS 7.50 → 7.33 kB** (−2,3%, os
aliases fora); sem dependência nova. **D12** já fora registrada na A3.

#### Adição (2026-07-16) — botão de acessibilidade nas telas de conta
A pedido do autor (pós-roadmap): Login/Signup ganharam um **botão de
acessibilidade** flutuante na **lateral direita, logo acima do widget A/A**
(pilha de controles de acessibilidade; popover abre à esquerda), recorte do
popover de acessibilidade da página de grafos reduzido a **um** controle —
"Desativar animações e física" (as paletas/formas só valem para o grafo).
Ligar deixa o fundo de vértices estático na hora e persiste em
`edugraphPrefs.semAnim` (mesmo contrato da G10/D6).
- **Composição** (skill vercel-composition-patterns): o switch `Chave` (34×20)
  foi **extraído** de [GrafoOverlays.jsx](src/components/grafo/GrafoOverlays.jsx)
  para **[src/components/Chave.jsx](src/components/Chave.jsx)** (primitivo
  compartilhado, zero mudança visual no grafo); a preferência `semAnim` foi
  **subida** para a [MolduraConta.jsx](src/components/conta/MolduraConta.jsx)
  (*state-lift-state*), que a passa por prop ao `FundoVertices` (agora
  **controlado**: `semAnim` entrou nas deps do efeito → toggle recria o campo
  animado ↔ estático) e ao novo
  **[BotaoAcessibilidade.jsx](src/components/conta/BotaoAcessibilidade.jsx)**
  (controlado, sem estado de preferência próprio — só o abre/fecha do popover;
  fecha no Esc e clique-fora; `aria-label`/`aria-expanded`/`aria-pressed`).
- O `prefers-reduced-motion` do SO segue respeitado dentro do `FundoVertices`
  (união com a prop). Verificado: lint 0/0, build (JS 280.18 → 282.98 kB, CSS
  7.33 kB idêntico), dev 200. **Teste do autor:** abrir o botão, ligar/desligar
  o toggle (fundo para/volta), recarregar (persiste), e conferir que o popover
  de acessibilidade do grafo continua idêntico.

## 4. O que FALTA (próximas etapas)

> **FOCO ATUAL (desde 2026-10-09): integração com o Neo4j — ver §4.5.** Todo o
> resto fica **pendente** até a integração estar de pé.

A landing (Home, Etapas 1–6) e a **página de grafos (G1–G11, Etapas 7–16)** foram
construídas contra o mock e integradas ao Neo4j na §4.5. Restam:

0. ~~Revisão e polimento do código~~ — **concluída** (roadmap §4.2, Etapa 17).
1. ~~**Telas de conta (Entrar / Criar conta)**~~ — **concluída** (roadmap
   §4.3, A0–A5, Etapa 18): fundo de vértices do protótipo, header no
   SiteHeader (slot fixo), card e footer de vidro, aliases órfãos removidos e
   revisão de acessibilidade das telas.
2. **PENDENTE (pausado em 2026-10-09) — Desempenho do motor do grafo**: P0–P2
   feitas; **P3, P4 e P5 pendentes** — roadmap §4.4. Retomar depois da integração.
3. **FOCO ATUAL — Integração com o Neo4j** (substitui o antigo plano de Apache
   Jena Fuseki/SPARQL) — §4.5. **N1–N10 feitas e testadas; N11 (física e layout
   hierárquico do Neo4j Browser) feita em 2026-10-18 — falta o teste do autor.**

### 4.1 Página de grafos — caminho por etapas (G1–G11)

Protótipo: [design/prototipo_grafo.html](design/prototipo_grafo.html) — página de
1 viewport: header → barra de busca/filtros → `<canvas>` 2D com física custom →
painel de detalhe flutuante → footer abaixo da dobra. Dados num **mock do Fuseki**
(**56 nós**: 8 disciplinas + 11 conceitos + 37 habilidades; **136 arestas**
`desenvolve`/`podeSerTrabalhadaEm`/`progrideDe` — recorte **5.º–9.º ano**, sem EM;
contagens conferidas na G2 + ajuste).

Regra de segurança: **uma etapa por sessão** — implementar, verificar
(`lint`/`build`/`dev`) e registrar aqui antes de seguir à próxima. Tokens novos
sempre com contraparte escura (a página acompanha o tema do site).

- [x] **G1 — Conexão + casca** *(Etapa 7, 2026-07-07)*: página, rota, links
  ("Grafos" na nav, "Ver todos os grafos →", "Explorar grafos"), header próprio,
  card-convite, footer.
- [x] **G2 — Dados (mock Fuseki)** *(Etapa 8, 2026-07-07)*: `mock-fuseki.js`
  extraído do bundle e portado verbatim para `src/data/mockFuseki.js` (ES module):
  `EIXOS/ANOS/RELACOES/NOS/ARESTAS/LISTA_*`, `buscar()`,
  `construirConsulta{Grafo,Expansao,Detalhe}()` (texto SPARQL real),
  `consultarFuseki()` (latência/erro/vazio via `setConfig`) e `conexoesDe()`.
  Sem UI nova. Aceito via teste em Node: **64 nós, 169 arestas**, consultas e
  modos simulados conferidos.
- [x] **G3 — Barra de busca/filtros + máquina de estados** *(Etapa 9, 2026-07-07)*:
  `GrafoFiltros.jsx` (busca com autocomplete, pills de série, selects, prévia,
  Filtrar/Limpar, seleção pendente) + máquina de estados e overlays em
  `Grafos.jsx` (início/carregando/vazio/erro, resumo do recorte, URL sync).
- [x] **G4 — Render estático do canvas** *(Etapa 9, 2026-07-07)*:
  `GrafoCanvas.jsx` — HiDPI, espiral de ângulo áureo, `desenhar()` (grid com
  parallax, câmera com lerp, arestas com seta/tracejado, nós com rótulo+halo),
  `enquadrar()`; cores por tipo de nó em tokens claro/escuro.
- [x] **G5 — Física** *(Etapa 10, 2026-07-07)*: `fisica()` com as constantes
  exatas (repulsão + anti-colisão, molas 130/175/205 × 0.028, gravidade 0.0045,
  damping 0.86, cooling 0.988) no loop RAF; reaquecimento `alpha = 1` no
  recorte (expandir 0.8 / drag 0.25 chegam com G8/G6); `assentar(N)` + prop
  `semAnim` prontos para a G10.
- [x] **G6 — Interações do canvas** *(Etapa 11, 2026-07-10)*: conversão
  tela→mundo e hit-test, hover (tooltip + destaque de vizinhos, resto
  esmaecido), clique seleciona (estado no pai), arrastar nó (reaquece a
  física), pan no vazio (deseleciona), wheel-zoom no cursor (clamp
  `[0.18, 3]`), botões +/−/recentrar (×1.35), Esc limpa, API
  `{ centrarEm, enquadrar, zoomMais, zoomMenos }` via ref; busca por
  habilidade seleciona/centra o nó (fim do pendente da G3).
- [x] **G7 — Painel de detalhe** *(Etapa 12, 2026-07-11)*: `GrafoPainel.jsx` —
  aside "de vidro" flutuante à esquerda (arrastável, redimensionável,
  esconder/reabrir por aba), cheat-sheet no vazio, detalhe do selecionado
  (tipo, código, título, pills ano/eixo/área, texto normativo via
  `consultarFuseki('detalhe')` com fallback local, conexões agrupadas por
  relação clicáveis — "fora do recorte" espera a G8), "Vistos por último"
  (máx. 5) + placeholder do assistente; `offsetEsquerda` desconta o painel
  do enquadramento do canvas.
- [x] **G8 — Expandir + desfazer** *(Etapa 13, 2026-07-11)*: 2×clique, botão
  do painel ou item "+ expandir" → `consultarFuseki('expansao')` funde os
  vizinhos (nascem a 90px da origem; sem re-enquadrar, `reaquecer(0.8)`);
  histórico de snapshots (máx. 10, zerado por recorte) e pill **"Desfazer
  expansão ×N"**; `irPara` completo (expande o selecionado para alcançar
  itens fora do recorte).
- [x] **G9 — Overlays finais** *(Etapa 14, 2026-07-11)*: `GrafoOverlays.jsx` —
  legenda "Tipos de nó" com toggle por tipo + contagens (filtro `tipos` na
  consulta), gaveta SPARQL (consulta real + ms + "Simular falha HTTP 503" via
  `setConfig`), popover de paleta (daltonismo, `src/data/paletas.js`;
  override dos tokens `--no-*` no `<html>`). Formas/sem-anim/persistência
  ficaram na G10, como o roadmap.
- [x] **G10 — Perfil mock + acessibilidade + persistência** *(Etapa 15,
  2026-07-11)*: `GrafoPerfil.jsx` no lugar do Entrar/Criar conta (identidade,
  turmas com Filtrar/remover/adicionar, acessibilidade); botão "Turmas" na
  barra (`GrafoFiltros`); modo **formas** (canvas `tracarNo` + classes
  `.eg-no-*` com `data-formas`); modo **sem animação** (`semAnim` +
  `assentar(200)`); persistência validada em `localStorage['edugraphPrefs']`
  (paleta, formas, semAnim, turmas, painel; debounce 150ms).
  `OpcoesAcessibilidade` compartilhado entre popover e perfil.
- [x] **G11 — Integração com a Home** *(Etapa 16, 2026-07-11)*: chips do
  `MateriaPopover` com id real + CTA **"Ver o grafo desta turma →"** →
  `verGrafoDaTurma` escreve `?serie=&disciplina=` na URL e navega; a página
  aplica o recorte pelo deep-link da G3. `habilidadesPorAno()` ganhou `id`.
  **Roadmap G1–G11 concluído.**

### 4.2 Revisão e polimento — caminho por etapas (R0–R7)

Refatoração de **limpeza pura, ZERO mudança de comportamento ou visual**. Plano
aprovado em 2026-07-12 (inventário completo feito nessa data). Regra: **uma fase por
sessão** — implementar, verificar, commitar (1 commit por fase, mensagem clara) e
marcar aqui antes da próxima.

**Restrições invioláveis (valem em TODAS as fases):**
- Bug encontrado → **não corrigir**; anotar na seção "Relatório da revisão" (criar ao
  final) para o autor decidir.
- Sem dependência nova; motor próprio de física/canvas intocável (decisões D1/D3/D4
  do [guia/DECISOES.md](guia/DECISOES.md) — nada aqui pode contrariá-las).
- Não renomear contratos: chaves de localStorage (`edugraphPrefs`, `eg_theme`,
  `eg_font`), parâmetros de URL (`serie/disciplina/conceito`), exports de
  `src/data/mockFuseki.js`, cabeçalho de proveniência do mock.
- Não tocar: `design/`, `PLANO_*.md`, dados do mock, `DECISOES.md` (exceto entrada
  nova). Login/Signup: só limpeza superficial (redesenho é etapa própria).
- Remoções só com **zero ocorrências em grep incluindo strings/template literals**
  (`var(--no-${…})`, `eg-no-${…}`, keyframes em `animation:` inline, seletores
  `data-theme/data-formas/data-paleta-aberta`). Na dúvida: manter e listar.
- **Decisões já tomadas pelo autor (2026-07-12):** handlers ficam como estão e a
  convenção é documentada (navegação entre telas = `on*`, demais callbacks = `ao*`);
  criar `src/components/grafo/`; extrações da Home em inglês (`HomeHeader.jsx`,
  `HeroSection.jsx`); NÃO renomear GraphSection/StatsBand/TestimonialsSection.

**Verificação por fase:** `npm run lint` (0 erros, nenhum warning novo; de R5 em
diante 0 warnings), `npm run build` (bundle igual ou menor — anotar tamanho),
`npm run dev` (200). Commit só com os três verdes.

- [x] **Pré-passo — commit do trabalho pendente**: há mudanças não commitadas
  (G11 + ajustes do autor no GrafoPerfil + .gitignore). Commitar como estão, com
  mensagem própria (ex.: "G11: integração Home–Grafos + ajustes de perfil"), ANTES
  de qualquer limpeza — nenhuma fase pode misturar limpeza com trabalho anterior.
  Anotar o tamanho do bundle (`npm run build`) como baseline.
- [x] **R0 — Este roadmap** *(2026-07-12)*: seção §4.2 (fases R1–R7b + regras).
- [x] **R1 — Código morto seguro** *(2026-07-12)*: removida a prop `onLogin`
  passada a `<Grafos>` em `App.jsx` (a página não a aceita desde a G10). **Os 3
  aliases apontados pelo inventário NÃO foram removidos** — o grep obrigatório
  pré-remoção mostrou que o inventário (que só varreu `.jsx`) errou: são usados
  DENTRO do `index.css` — `--accent-rgb` pelo `::selection` (site todo),
  `--line-strong` pela `.eg-input` e `--accent-hover` pela `.eg-btn-primario:hover`
  (Login/Signup). Caem junto com a migração dessas telas. **Mantidos
  deliberadamente** (relatório): esses 3 aliases; `--green-soft` (token da paleta
  documentada do protótipo, §2 — sem uso hoje, pode servir ao redesenho de
  Login/Signup); aliases usados por Login/Signup/FontSizeWidget (`--ink --accent
  --line --card --bg-soft --mut`); exports do mockFuseki sem uso interno (contrato
  público, D1). ESLint já garante que não há imports/variáveis órfãos; não há
  código comentado nem assets órfãos; `package.json` está mínimo (react/react-dom).
- [x] **R2 — Comentários** *(2026-07-12)*: corrigidos 6 comentários
  desatualizados — `paletas.js` (persistência "chega na G10" → já persiste em
  `edugraphPrefs`); cabeçalho do `GrafoPainel.jsx` ("por ora vivem no estado da
  página" → persistem); `Grafos.jsx` (lista da API do canvas sem
  `reaquecer/assentar`); cabeçalho do `GrafoCanvas.jsx` (idem, sem `assentar`);
  `Logo.jsx` (dizia "home e Entrar/Criar conta" — hoje também Grafos e Footer);
  cabeçalho do `GrafoPerfil.jsx` (descrevia "avatar MS + Profa. Mariana",
  trocados pelo autor por "P + Perfil"). Varredura completa: "trabalho futuro"
  de Login/Signup segue verdadeiro (mantido); anotações históricas (G1…G11) são
  proveniência (mantidas); porquês todos preservados; nenhum ruído nem porquê
  faltante encontrado.
- [x] **R3 — CSS + escala de z-index** *(2026-07-12)*: `index.css` reorganizado
  com **sumário numerado no topo** (1 tokens claro+aliases → 2 tokens dark → 3
  reset/base → 4 keyframes → 5 classes por área) e a **escala de z-index
  documentada** no mesmo comentário (e no §6). O arquivo já estava quase em
  ordem: o diff real foi só comentários de seção + o `input::placeholder`
  movido dos keyframes para o bloco base (regra única no projeto — cascata
  idêntica). Os aliases ficaram DENTRO do `:root` (são declarações; separá-los
  criaria um segundo bloco `:root` sem ganho). Nenhuma regra/valor mudou.
- [x] **R4 — Constantes nomeadas** *(2026-07-12; valores idênticos)*: em
  `Grafos.jsx` — `ATRASO_SELECAO_BUSCA=770`, `ATRASO_POS_EXPANSAO=250`,
  `ATRASO_ASSENTAR=30`, `DEBOUNCE_PREFS_MS=150`, `VISTOS_MAX=5`,
  `HISTORICO_EXPANSAO_MAX=10`; em `GrafoCanvas.jsx` — `ZOOM_MIN=0.18` /
  `ZOOM_MAX=3` (2 pontos: wheel e zoomCam; o clamp 0.2–1.5 do `enquadrar` é
  outro limite e ficou intocado — assim como os `globalAlpha: 0.18` do
  esmaecer, que só coincidem no número); em `GrafoPainel.jsx` —
  `MARGEM_PALCO=8`, `LARGURA_MIN=320`, `LARGURA_MAX=620`. **Física intocada.**
- [x] **R5 — Warning do ThemeContext** *(2026-07-12)*: criado
  `src/context/useTheme.js` (contexto + hook, módulo sem componentes);
  `ThemeContext.jsx` exporta só o `ThemeProvider` (importa o contexto do novo
  módulo); imports do hook atualizados em `ThemeToggle.jsx`, `FontSizeWidget.jsx`
  e `App.jsx`. **Lint zerado: 0 erros, 0 warnings.**
- [x] **R6 — Duplicações triviais** *(2026-07-12)*: (a) `MONO_LABEL` (idêntico em
  GrafoPainel/GrafoOverlays/GrafoPerfil) movido para
  `src/components/grafo/estilos.js` (módulo `.js` sem componente, já na pasta da
  R7a); (b) par de `<a>` LabOtim/UFES dos DOIS headers extraído para
  `components/LogosInstitucionais.jsx` (fragment; props `altura`/`padding` — Home
  24/'6px 12px', Grafos 22/'5px 10px'; DOM idêntico, espaçamento continua vindo do
  gap do pai). **Desvio do plano, com motivo:** o 3º uso (`Footer.jsx`) NÃO foi
  extraído — lá é outra variação de design (cards 42px, raio 12, sombra e padding
  próprios, na faixa "Uma iniciativa de"), não duplicação acidental; parametrizar
  4 estilos só para cobri-lo viraria indireção sem abstração. **NÃO extraídos**
  (variações sutis — relatório): padrões Esc/clique-fora (MateriaPopover usa
  mousedown no document ancorado no card; GrafoPerfil usa backdrop; Grafos usa
  keydown global; sugestões usam blur) e estilos de `<select>` (GrafoFiltros ×
  SELECT_TURMA não são iguais). Bundle: 275.91 → 274.90 kB.
- [x] **R7a — Pasta por domínio** *(2026-07-12)*: `git mv` de GrafoCanvas/
  GrafoFiltros/GrafoPainel/GrafoPerfil/GrafoOverlays para
  `src/components/grafo/` (o `estilos.js` da R6 já nasceu lá). Imports
  ajustados: `../data/*` → `../../data/*` nos movidos, `./grafo/estilos` →
  `./estilos`, e Grafos.jsx aponta para `../components/grafo/*`. Renames
  detectados pelo git (RM); bundle byte-idêntico; §7 sincronizado.
- [x] **R7b — Fragmentação de arquivos grandes** *(2026-07-12; movimentos puros
  de JSX, props explícitas)*:
  (a) `Home.jsx` → `components/HeroSection.jsx` (hero 2 colunas, props
  onLogin/onSignup) — com o SiteHeader do ajuste de UX, a Home virou composição
  pura de seções (**281 → 65 linhas**);
  (b) `Grafos.jsx` → `components/grafo/GrafoEstados.jsx` (os 4 overlays de
  estado: convite/carregando+SKELETON/erro/vazio; props status, msgErro,
  aoTentarNovamente, aoLimpar; mesma posição no DOM, zIndex 32 preservado) —
  página em **799 linhas** (meta ≤800 ✓);
  (c) `TestimonialsSection.jsx` → `components/GradeCard.jsx` (verbatim, leva o
  import do MateriaPopover; **559 → 491**).
  **NÃO fragmentados** (relatório): GrafoCanvas (motor coeso — D3), GrafoPainel
  (um único aside), GrafoOverlays (já modular), mockFuseki (contrato — D1).
  Bundle 274.64 → 274.88 kB (+240 bytes de wrappers de componente).
- [x] **Fechamento** *(2026-07-12)*: relatório final da revisão no §3
  (**Etapa 17** — removido/corrigido/consolidado/reorganizado/mantido, **zero
  bugs encontrados**); §6 ganhou a convenção de handlers (`on*` navegação /
  `ao*` callbacks; z-index entrou na R3) e o §7 já estava sincronizado; **D11**
  registrada no DECISOES.md (convenções consolidadas, com parágrafo de
  monografia); bundle final **274.88 kB** × baseline 275.86 kB (−0,35%, CSS
  idêntico), lint 0/0.

### 4.3 Telas de conta (Entrar / Criar conta) — caminho por etapas (A0–A5)

Protótipo: [design/prototipo_final.html](design/prototipo_final.html) — overlays
de auth (decodificar com a receita do §5). No arquivo decodificado (~1.557
linhas): animação `particle-network` em **L428–577**, overlays em **L902–1025**,
handlers `openLogin/openSignup/closeAuth/switchAuth` em L1548–1551, derivados
(`authSwitchPrompt/authSwitchAction`) em L1369–1374, `themeVars()` em L1043.
No protótipo, Login/Cadastro são um OVERLAY full-screen opaco sobre a landing;
aqui continuam sendo PÁGINAS do App (roteamento por estado, D9), mantendo o
escopo do D2: validação no cliente, envio simulado, nenhum back-end.

**Desvios conscientes já decididos pelo autor** (registrar como D12 na A3):
- **Header**: o overlay tem header próprio (73px; o logo fecha o overlay). Aqui
  usamos o **SiteHeader único** (60px): o prompt de troca do protótipo
  ("Novo por aqui? Criar conta" no Login / "Já tem conta? Entrar" no Signup —
  span 14px `--muted` + link verde 700 inline) entra no **slot de conta fixo de
  180px**; logo, nav, logos institucionais e ThemeToggle ficam pixel-idênticos
  aos das outras telas. NÃO alterar `LARGURA_SLOT_CONTA`; se o prompt não
  couber, reduzir gap/fonte do prompt, nunca o slot.
- **Card**: no protótipo é OPACO (`--pill-bg`). Aqui vira **VIDRO** (receita do
  GrafoPainel: `color-mix(in srgb, var(--pill-bg) 72%, transparent)` +
  `backdrop-filter: blur(14px) saturate(1.15)`; calibrar o % se a legibilidade
  pedir, documentando o valor final) para o fundo de vértices aparecer.
  Geometria, cores e fontes internas seguem o protótipo à risca.
- **Footer**: o overlay usa o footer do site TRANSLÚCIDO
  (`color-mix(in srgb, var(--bg2) 20%, transparent)` + `blur(5px)`). Aqui o
  [Footer.jsx](src/components/Footer.jsx) compartilhado ganha a prop opt-in
  `vidro` (default false) — aplicar o vidro globalmente mudaria a cor do footer
  na Home/Grafos (mix 20% sobre `--bg` ≠ `--bg2` sólido), quebrando a regra de
  zero regressão do §4.2.

**Espec do fundo animado (porte VERBATIM da classe de L428–577; uso em L906):**
partículas criadas TODAS no mount — `qtd = w·h/density`, `density 13000` — com
fade-in `+0.012`/frame (não há spawn ambiente contínuo; nós não morrem); drift
retilíneo `velocity 0.6` com bounce a ±100px além das bordas; nó-cursor que
segue o mouse (some no mouseleave); clique/segurar = rajada de 3 + 1 a cada
50ms no ponto do cursor (mouseup para; touch equivalente); arestas contínuas
por distância `D = 200` com `alpha = (D−d)/D · op1 · op2` e `lineWidth 0.7`;
raio dos nós `rand(1.4, 2.6)`; DPR cap 2; `ResizeObserver` recria o campo
(perde os nós clicados — fiel); `cursor: crosshair`. Cores do overlay: aresta
`#B3A988`; nós `#2F9E5F #8C3E18 #C9A23F #A89D80` (mesmos hex nos 2 temas do
protótipo). Estrutura de camadas: canvas `absolute inset:0 z:0`; header/main/
footer com `position:relative; z-index:1`; o `main` central tem
`pointer-events:none` (cliques no vazio atravessam até o canvas) e o card
reativa com `pointer-events:auto`.

**Regras** (mesmas do §4.1/§4.2): uma etapa por sessão — implementar, verificar
(`npm run lint` 0/0 · `npm run build` · `npm run dev` + teste manual da etapa),
registrar aqui e commitar (1 commit por etapa). Tokens novos sempre com
contraparte escura. **Zero mudança visual/comportamental em Home e Grafos** —
conferir o header e o footer delas a cada etapa. Os aliases antigos (`--ink
--accent --line --card --bg-soft --mut --line-strong --accent-hover
--accent-rgb`) só caem na A5, com grep obrigatório pré-remoção incluindo
strings/template literals (lição da R1).

- [x] **A0 — Este roadmap** *(2026-07-12)*: seção §4.3 (espec do protótipo
  decodificada + desvios decididos + etapas A1–A5); item 1
  do §4 atualizado. Commit: `A0: roadmap das telas de conta (§4.3)`.
- [x] **A1 — Estrutura + header** *(2026-07-12)*: criado
  `src/components/conta/MolduraConta.jsx` — wrapper `position:relative` com
  `background: var(--bg)`; SiteHeader único com o prompt de troca do protótipo
  no slot fixo de conta (Login: "Novo por aqui? *Criar conta*" → onSignup;
  Signup: "Já tem conta? *Entrar*" → onLogin; span 14px `--muted` + link
  verde 700); `<main>` de `calc(100vh - 60px)` centrado com
  `pointer-events:none` e o miolo do card reativando com
  `pointer-events:auto` (`LARGURA_CARD = 430` — vira 400 na A3, a largura do
  protótipo); header/main/footer em `zIndex 1` (o canvas da A2 entra em
  `zIndex 0`); Footer abaixo da dobra (opaco até a A4).
  [Login.jsx](src/pages/Login.jsx) e [Signup.jsx](src/pages/Signup.jsx)
  perderam a barra superior própria e o fundo `--bg-soft` (o card antigo
  segue dentro, intocado — só o `maxWidth` migrou para o miolo da moldura);
  [App.jsx](src/App.jsx) passa `onGrafos` às duas páginas (e `onSignup` ao
  Signup, para o "Criar conta" do footer da moldura). Verificado: lint 0/0,
  build (bundle 274.88 → 274.48 kB, CSS idêntico), dev 200 nos 4 módulos.
  Teste manual do autor: navegar Home ↔ Login ↔ Signup ↔ Grafos sem
  deslocamento de logo/nav/logos/toggle; prompt correto e clicável nas 2
  telas; footer só aparece ao rolar.
- [x] **A2 — Fundo de vértices** *(2026-07-16)*: tokens `--conta-aresta
  --conta-no-1..4` no [index.css](src/index.css) (claro E escuro — **mesmos
  hex do protótipo nos 2 temas**, como no overlay; contraste no preto ficou
  bom sem ajuste). Criado
  [src/components/conta/FundoVertices.jsx](src/components/conta/FundoVertices.jsx):
  porte verbatim da classe `particle-network` (constantes nomeadas —
  velocity 0.6 · D 200 · fade +0.012 · rajada 3 + gotejamento/50ms ·
  bounce ±100px · DPR cap 2;
  rejeição barata `min(|dx|,|dy|)` antes da euclidiana; ResizeObserver
  recria o campo; cleanup completo de RAF/interval/listeners, inclusive o
  `mouseup` da window). **Desvios documentados no código:** (a) a partícula
  guarda o **índice** da cor (não o hex) e a paleta é re-resolvida via
  `getComputedStyle` na troca de `data-theme` (padrão GrafoCanvas) — o tema
  recolore sem recriar o campo; (b) dimensões/coordenadas via
  `getBoundingClientRect()` (zoom do A/A) e, como o zoom não dispara o RO,
  `fontZoom` é dependência do efeito (mudou = recria, igual a um resize);
  (c) no resize o nó-cursor é zerado (no protótipo virava referência órfã
  fora do array); (d) `edugraphPrefs.semAnim` → campo ESTÁTICO (D6):
  opacity 1, frame único, sem nó-cursor/spawn, cursor default, e um
  MutationObserver repinta o frame na troca de tema (não há loop RAF);
  (e) **parâmetros do campo POR TEMA** (`PARAMS_CAMPO`, decisão do autor no
  mesmo dia): o modo **escuro** segue o protótipo **verbatim** (density
  13000 · lineWidth 0.7 · raio 1.4–2.6) e o **claro** usa o ajuste do autor
  (campo mais denso de nós menores: 7500 · 0.4 · raio 1); trocar o tema
  recria o campo, pois a densidade muda.
  Montado na MolduraConta (`absolute inset:0, zIndex 0`, crosshair);
  header/main/footer seguem em zIndex 1 — o SiteHeader é opaco (`--bg`) e
  cobre o canvas, como o header do overlay do protótipo. Verificado:
  `npm run lint` (0/0), `npm run build` (274.45 → 278.50 kB, CSS 7.45 →
  7.67 kB, sem dependência nova) e `npm run dev` (200 nos módulos
  novos/alterados). **Teste manual do autor:** fade-in ao abrir; arestas
  < 200px; nó segue o cursor e some ao sair; clique = rajada de 3; segurar
  goteja; sem spawn sobre card/header/footer; resize recria; tema escuro
  recolore na hora; A/A ≠ 100% não desalinha; semAnim estático. Commit:
  `A2: fundo de vértices das telas de conta`.
- [x] **A3 — Card de vidro** *(2026-07-16)*: miolo de
  [Login.jsx](src/pages/Login.jsx) e [Signup.jsx](src/pages/Signup.jsx)
  reescrito fiel ao overlay do protótipo — card `borderRadius 22 · padding
  40` com a **superfície de vidro do GrafoPainel** (`color-mix` 72% de
  `--pill-bg` + `blur(14px) saturate(1.15)` + borda `--edge 95%` + sombra
  difusa `0 24px 60px rgba(28,38,32,.18)`; 72% legível nos 2 temas).
  **Ajuste sobre o spec do roadmap** (pedido do autor): a borda sólida
  `--pill-border` e a sombra escura/concentrada `0 34px 80px -42px
  rgba(0,0,0,.45)` do card **opaco** do protótipo faziam o card ler como
  painel sólido — trocadas pela borda/sombra do painel de grafos (que a D12
  já cita como a receita de vidro), para ler como vidro fosco de fato.
  h1 **Spectral 700 34px** (−.01em); subtítulo 15/1.5
  `--muted`; labels JetBrains Mono 11px uppercase .14em; margens do
  protótipo (e-mail/nome mb 20, senha mb 24); Login com "Esqueceu?" (13px
  600 verde), divisor "ou" mono e rodapé de troca (link verde 700); Signup
  com termos (12.5px/1.55 `--faint`, mt 20). Estilos compartilhados dos 2
  cards em **[src/components/conta/estilos.js](src/components/conta/estilos.js)**
  (CARD_VIDRO/TITULO/SUBTITULO/LABEL/MSG_ERRO — padrão do grafo/estilos.js,
  R6). No [index.css](src/index.css): `.eg-input` atualizada para os tokens
  novos (padding 13px 16px, `--bg`/`--pill-border`/`--text`, focus só
  borda `--green`, sem sombra — deixou de usar `--line-strong` e
  `--accent-rgb`) e `.eg-btn-primario` virou o **botão DOURADO** do
  protótipo (`--gold`, 700 16px; **:hover de cor removido** — o protótipo
  não tem; ficou só o :active, desvio documentado; deixou de usar
  `--accent`/`--accent-hover`). `LARGURA_CARD` 430 → **400** na
  MolduraConta (largura do protótipo). Validações, mensagens, `#d1453b` e
  envio simulado (850/950ms → onHome) **intocados** (D2). **D12 registrada
  no [guia/DECISOES.md](guia/DECISOES.md)** (header unificado + card/footer
  de vidro, com parágrafo de monografia). Boas práticas aplicadas no
  reescrito: erros renderizados com ternário (não `&&`) e estilos estáticos
  içados para módulo. Verificado: `npm run lint` (0/0), `npm run build`
  (278.50 → 278.24 kB, CSS 7.67 → 7.50 kB) e `npm run dev` (200 nos 5
  módulos alterados). **Teste manual do autor:** lado a lado com o protótipo
  no navegador, claro E escuro; validações; troca login↔signup; vértices
  visíveis através do vidro. Commit: `A3: card de vidro fiel ao protótipo`.
- [x] **A4 — Footer de vidro** *(2026-07-16)*: prop `vidro` (default
  `false`) no [Footer.jsx](src/components/Footer.jsx) — Home e Grafos
  continuam sem a prop (estilo idêntico ao de antes: `background: var(--bg2)`,
  sem blur/zIndex); quando `true`, o `<footer>` troca para
  `background: 'color-mix(in srgb, var(--bg2) 20%, transparent)'`,
  `backdropFilter/WebkitBackdropFilter: 'blur(5px)'` e
  `position:'relative', zIndex:1`. **[MolduraConta.jsx](src/components/conta/MolduraConta.jsx)**
  passa `vidro` ao `<Footer>` e perdeu o `div` wrapper de zIndex que existia
  desde a A1 (o próprio Footer agora carrega o zIndex quando vidro). Sem
  token novo (reusa `--bg2`/`--pill-border`). Verificado: `npm run lint`
  (0/0), `npm run build` (278.27 → 278.44 kB, CSS 7.50 kB idêntico) e
  `npm run dev` (200 nos 2 módulos alterados). **Teste manual do autor:**
  vértices borrados atrás do footer ao rolar as telas de conta; footer da
  Home e do Grafos inalterado (comparar claro+escuro). Commit:
  `A4: footer de vidro nas telas de conta`.
- [x] **A5 — Limpeza dos aliases + fechamento** *(2026-07-16)*:
  [FontSizeWidget.jsx](src/components/FontSizeWidget.jsx) migrou `--line →
  --pill-border`, `--card → --pill-bg`, `--ink → --text`, `--mut → --muted`
  (aparência idêntica); `::selection` em [index.css](src/index.css) trocou
  `rgba(var(--accent-rgb), 0.18)` por `color-mix(in srgb, var(--green) 18%,
  transparent)`. **Uso extra achado pelo grep** (não estava no roadmap):
  `.eg-link-nav:hover` usava `var(--ink)` (nav do SiteHeader, site todo) →
  migrado para `var(--text)`. Com o grep pré-remoção (incluindo strings/
  template literals; a única "sobra" foi o próprio comentário do topo do CSS
  citando os nomes) removidos os aliases `--bg-soft --card --ink --mut --line
  --line-strong --accent --accent-hover --accent-rgb` dos **dois** temas;
  comentário do topo atualizado. `--green-soft` mantido (§2). **Revisão
  web-interface-guidelines das telas de conta** (pedido do autor, junto):
  Login/Signup ganharam `<form>` semântico (**Enter envia**), labels
  associados (`htmlFor`/`id`), `autocomplete`/`name`/`inputmode`,
  `spellCheck={false}` no e-mail, **foco no 1.º campo com erro**,
  `aria-invalid` + `role="alert"` nas mensagens e botão `type="submit"`
  **desabilitado durante o envio** (`:disabled` novo no CSS) — tudo
  invisível, layout do protótipo intocado. [FundoVertices.jsx](src/components/conta/FundoVertices.jsx)
  passou a respeitar **`prefers-reduced-motion` do SO** além do
  `edugraphPrefs.semAnim` (união; anima decorativa deve honrar o SO).
  Achados **reportados e não alterados** (fora do escopo / decisão
  documentada): navegação por `<span onClick>` (padrão D8/D9 do site inteiro,
  não só destas telas), placeholders sem `…` (valores-exemplo fiéis ao
  protótipo, D4) e `<img>` dos logos do Footer sem width/height (compartilhado
  — mexer arriscaria regressão em Home/Grafos). Verificado: `npm run lint`
  (0/0), `npm run build` (278.44 → 280.18 kB; **CSS 7.50 → 7.33 kB** com os
  aliases fora) e `npm run dev` (200 nos módulos alterados). Commit:
  `A5: limpeza dos aliases + fechamento`.

  **Com a A5, o roadmap §4.3 (A0–A5) está 100% concluído — as telas de conta
  estão migradas para o protótipo final.**

### 4.4 Desempenho: renderização sob demanda do motor do grafo — etapas (P0–P5)

A página de grafos está pesada. O motor portado do protótipo (D3/D4) redesenha o
canvas **60×/s para sempre** — grafo parado, sem hover e sem câmera em movimento
custam o mesmo que um arraste. O objetivo é trocar o loop perpétuo por
**renderização sob demanda** (desenha só quando algo mudou), reduzir o custo do
quadro quando ele acontece e tirar o arrasto do painel do ciclo de render do
React. **Zero mudança visual ou de comportamento**: mesma física, mesmas
constantes, mesmos tempos, mesmo desenho pixel a pixel.

#### Em linguagem simples — o que está sendo otimizado

*(Seção didática, escrita para a defesa e para a escrita do TCC: explica a
otimização sem jargão. O registro formal — com alternativas rejeitadas, fala
para a banca e parágrafo de monografia — entra na **D13**, na P5.)*

**Como o grafo é desenhado.** A tela do grafo não é feita de elementos HTML: é
um `<canvas>`, uma folha em branco onde o programa desenha tudo à mão — os
pontinhos do fundo, cada aresta, cada seta, cada bolinha, cada rótulo. Desenhar
no canvas não "guarda" objetos: é pintura. Para mostrar qualquer mudança, apaga
a folha e repinta tudo do zero.

**O que o motor faz hoje.** Ele repinta a folha inteira **60 vezes por segundo,
o tempo todo** — herança do protótipo. Faz isso enquanto você arrasta um nó
(aí é necessário: as coisas se movem) e faz igual enquanto você só lê a tela sem
tocar em nada (aí é desperdício: os 60 quadros daquele segundo são idênticos).
É um pintor refazendo o mesmo quadro 60 vezes por minuto porque ninguém mandou
parar.

**Quanto custa esse desperdício.** Medido na P1: com o grafo parado, ~59
repinturas por segundo, cada uma custando 3,87 ms — dá **~228 ms de desenho a
cada segundo, quase um quarto de um núcleo do processador, para não mudar um
pixel**. Em notebook isso é ventilador ligado e bateria indo embora.

**A ideia central da mudança.** Trocar "pinta sempre" por **"pinta quando
precisa"**. O motor ganha um aviso de "sujou": quem mexe em alguma coisa — o
ponteiro passou por um nó, a câmera está se movendo, a física ainda está
acomodando o layout, chegou um recorte novo — levanta a mão. O motor pinta e,
quando ninguém mais levanta a mão, **ele dorme**. Nada desaparece da tela: o que
já foi pintado continua lá, porque o canvas não se apaga sozinho.

**O que NÃO muda.** Nada do que se vê ou se sente: mesmas cores, mesmas fontes,
mesma física, mesmos tempos, mesmo comportamento de hover, clique, arraste e
zoom. Se a otimização estiver correta, é **impossível perceber pela tela** — só
pelo consumo de processador. Por isso a etapa foi planejada com medição
antes/depois e lista de teste manual: o critério de sucesso é "nada mudou, e
ficou barato".

**As etapas, sem jargão:**
- **P1 (feita)** — instalar um "velocímetro" que conta quantas repinturas
  acontecem por segundo e quanto cada uma custa. Só funciona em desenvolvimento
  e sai do site publicado. É o que permite *provar* o ganho em vez de afirmar.
- **P2** — o coração: fazer o motor dormir quando não há o que mostrar.
- **P3** — deixar cada repintura mais barata, para quando ela realmente
  precisar acontecer. O maior item é o fundo pontilhado: hoje cada pontinho é um
  comando de desenho separado (~1.800 por repintura) e passa a ser **um** comando
  só, com o mesmo resultado na tela.
- **P4** — o mesmo desperdício, do lado do React: hoje, arrastar o painel de
  detalhes obriga a página inteira a se recalcular a cada milímetro do
  movimento. Passa a mexer só no painel durante o gesto e a avisar o React uma
  única vez, quando você solta.
- **P5** — medir de novo, comparar com a P1 e registrar a decisão com os
  números na mão.

**Por que isso vale como trabalho de TCC, e não só "arrumar código".** A
otimização não troca o algoritmo por um mais esperto: ela reconhece que a
visualização é **dirigida por eventos**, não por tempo. Um grafo de conhecimento
é um objeto que o professor *lê* — fica parado na tela a maior parte do tempo —,
então o motor certo é o que gasta proporcionalmente ao que o usuário faz. É o
mesmo raciocínio das decisões de acessibilidade (D6): a interface se ajusta ao
uso real em vez de impor um custo fixo a todo mundo.

**Diagnóstico (2026-07-29)** — o que custa hoje:

| # | Custo | Onde |
|---|---|---|
| 1 | Loop RAF nunca ocioso: `desenhar()` roda todo quadro, para sempre | `GrafoCanvas.jsx` (efeito do loop) |
| 2 | Grid pontilhado: `beginPath+arc+fill` por ponto (~1.800/quadro em tela cheia) | `desenhar()` |
| 3 | `getBoundingClientRect()` por quadro (leitura de layout forçada) | loop |
| 4 | Sondagem de tema/paleta por quadro (`getAttribute` + 3× `getPropertyValue`) | loop |
| 5 | `[...mapa.values()]` a cada iteração da física; `Set` de vizinhos refeito por quadro | `fisica()`, `desenhar()` |
| 6 | String de `ctx.font` montada por nó, por quadro (parse de fonte é caro) | `desenhar()` |
| 7 | Arrasto/resize do painel: `setState` por `pointermove` → re-render da página toda | `GrafoPainel.jsx`, `Grafos.jsx` |
| 8 | Digitar na busca re-renderiza o `GrafoPainel` (639 linhas) a cada tecla | `Grafos.jsx` |

**Padrão a reusar (já existe no projeto):** o canvas das telas de conta
([FundoVertices.jsx](src/components/conta/FundoVertices.jsx)) já faz a disciplina
que falta aqui — `ResizeObserver` para dimensões, `MutationObserver` em
`data-theme` para repintar e **nenhum loop RAF quando não há animação**. O canvas
do grafo passa a seguir o mesmo padrão.

**Decisões do autor (2026-07-29):** escopo = canvas **e** lado React; o grid vira
**um único path** (pixel-idêntico, em vez de camada CSS, que seria desvio visual);
**com instrumentação** dev-only para medir antes/depois (números vão para a D13 e
para a monografia).

**Restrições invioláveis (valem em TODAS as fases):**
- **Nada de mudança visual ou de comportamento.** Constantes da física, molas por
  relação, damping, esfriamento, clamps de zoom, `ATRASO_*` e o `enquadrar` a
  420 ms ficam intocados (D3/D4 amarram esses valores ao protótipo).
- Sem dependência nova; sem biblioteca de grafos (D3).
- Não renomear contratos: API imperativa do canvas (`centrarEm`, `enquadrar`,
  `reaquecer`, `assentar`, `zoomMais`, `zoomMenos`), props dos componentes,
  chaves de localStorage (`edugraphPrefs`), parâmetros de URL.
- Acessibilidade intacta: `semAnim`, modo formas e paletas CUD (D6).
- Bug encontrado no caminho → **não corrigir**; anotar no relatório de fechamento
  (mesma regra do §4.2).

**Verificação por fase:** `npm run lint` (0/0), `npm run build` (sem dependência
nova — anotar o tamanho) e `npm run dev` (200), mais o teste manual da fase.
Regra de sempre: **uma etapa por sessão** — implementar, verificar, registrar aqui;
o commit é do autor.

- [x] **P0 — Este roadmap** *(2026-07-29)*: seção §4.4 (diagnóstico + decisões +
  restrições + etapas P1–P5) e item 2 do §4. Sem código.
- [x] **P1 — Instrumentação e linha de base** *(2026-07-29)*: medidor
  **dev-only** em [GrafoCanvas.jsx](src/components/grafo/GrafoCanvas.jsx) —
  desenhos por segundo e custo médio/de pico de `desenhar()`, publicado em
  `window.__grafoPerf` e logado a cada 2 s. Acumuladores em **refs, não estado**
  (medir não pode causar re-render, ou a medida alteraria o que mede).
  `MEDIR = import.meta.env.DEV` vira `false` no build: cronometragem, relatório,
  log e `acumular()` saem por eliminação de código morto (conferido no `dist` —
  zero ocorrências de `__grafoPerf`); sobram só os inicializadores dos refs,
  **+110 bytes**, porque hook não pode ser condicional. **Desvio do plano
  (a favor):** `fisica()` é cronometrada à parte de `desenhar()` — é o que
  decide a prioridade da P3.

  **Linha de base (2026-07-29, máquina do autor, recorte de 1 série):**

  | Cenário | Desenhos/s | `desenhar()` médio | Pico | `fisica()` médio |
  |---|---|---|---|---|
  | Grafo **parado** | 59,0 | 3,87 ms | 8 ms | 0,01 ms |
  | **Arrastando o quadro** (pan) | 60,2 | 2,63 ms | 6 ms | 0 ms |
  | **Arrastando um nó** | 52,6 | 2,58 ms | 7 ms | 0,06 ms |
  | **Mexendo no zoom** | 52,5 | 1,24 ms | 4 ms | 0 ms |

  **O que os números dizem:**
  1. **O custo não depende da interação.** Com o grafo imóvel o motor desenha
     ~59 quadros/s idênticos: **~228 ms de desenho por segundo (~23% de um
     núcleo) para não mudar um pixel**. É a confirmação direta do diagnóstico e
     o número-âncora do "antes/depois".
  2. **A física é irrelevante** (≤ 0,06 ms/quadro com 56 nós): ~99% do quadro é
     `desenhar()`. Confirma a exclusão do Web Worker e **rebaixa a P3(d)**
     (cache do array de nós) a ganho marginal.
  3. **O custo do quadro varia ~3× conforme o estado da câmera** — parado
     3,87 ms, arrastando 2,6 ms, mexendo no zoom 1,24 ms — e o quadro sai mais
     barato justamente **quando se está mexendo**. Ou seja, o pior caso do motor
     é a tela ociosa. Isso aponta para trabalho de desenho que **depende da
     câmera**, e há dois candidatos claros: (i) o **fundo pontilhado**, cujo
     número de pontos é `w·h / (34·k)²` e que é **pulado inteiro** quando
     `34·k < 13` — vai de milhares de pontos a zero conforme o zoom; e (ii) os
     **rótulos**, que somem abaixo de `k < 0,55`. Soma-se a isso que o motor
     **não faz culling**: as chamadas de desenho são emitidas para todo nó e
     toda aresta, e só o rasterizador descarta o que cai fora da tela.
     **Confirma grid e rótulos como alvo da P3(a)/(e).**
  - Verificado: `npm run lint` (0/0), `npm run build` (282,98 → **283,09 kB**,
    sem dependência nova) e `npm run dev` (200). Nenhuma mudança de
    comportamento no motor: as únicas adições ao caminho quente são três
    `performance.now()` atrás da constante `MEDIR`.
- [x] **P2 — Loop sob demanda** *(2026-07-29; o coração da mudança)*: o `tick()`
  perpétuo virou um loop que **para quando não há o que fazer**.

  **Resultado medido (mesma máquina e mesmo método da P1):**

  | Cenário | Antes (P1) | Depois (P2) |
  |---|---|---|
  | Grafo **parado** | 59,0 desenhos/s · 3,87 ms | **0 desenhos/s · 0 ms** |
  | **Arrastando um nó** | 52,6 · 2,58 ms | 58,9 · 3,53 ms |
  | **Zoom** | 52,5 · 1,24 ms | 38,0 · 4,25 ms (pico 19 ms) |

  **Como ler esses números.** O que a etapa promete é a **primeira linha**: com a
  tela ociosa o motor deixou de gastar ~228 ms de desenho por segundo (~um quarto
  de núcleo) e passou a gastar **zero**. As outras duas linhas continuam
  desenhando **de propósito** — arrastar e dar zoom são exatamente os momentos em
  que a tela precisa mudar. No zoom o número de desenhos caiu de 52,5 para 38,0
  porque agora o motor desenha **uma vez por evento de roda** em vez de 60×/s
  independentemente (o `aoRolar` já escrevia a câmera direto, sem interpolação).
  Os **ms por desenho não são comparáveis entre amostras**: o custo do quadro
  depende fortemente do nível de zoom (a densidade do grid é `w·h/(34·k)²`), e as
  amostras não estão no mesmo `k`. O **pico de 19 ms** no zoom é a melhor pista
  até agora de que o grid domina o quadro — alvo da P3(a).

  **Implementação** em [GrafoCanvas.jsx](src/components/grafo/GrafoCanvas.jsx):
  - `pedirFrame()` é o **único** ponto do arquivo que agenda `requestAnimationFrame`;
    `rafRef` (0 = dormindo) e `sujo` (pedido pendente) controlam o estado.
  - `precisaContinuar()` decide ao fim de cada quadro: física quente **ou**
    arraste **ou** câmera interpolando **ou** pedido pendente; nada disso → dorme.
  - Acordam o motor: `enquadrar`, `centrarEm`, `zoomCam`, `reaquecer`, `assentar`,
    o efeito de recorte novo e os handlers de ponteiro (descer, arrastar, pan,
    wheel, soltar).
  - **Hover só acorda quando o nó sob o ponteiro muda** — passear o mouse pelo
    vazio não desenha nada (era o caso mais comum).
  - **Grafo vazio não conta como "quente"**: o `alpha = 1` do recorte novo
    esquentava a simulação mesmo sem nós e manteria o loop girando ~6 s à toa —
    agora a tela do card-convite fica em zero desenho.
  - **Rede de segurança**: efeito em `[nos, arestas, selecionadoId, formas,
    semAnim]` pedindo um quadro, para mudanças de prop que não passam pelo
    reaquecimento da página (seleção e modo formas, por exemplo).
  - **Antecipado da P3(b)/(c) por necessidade, não por otimização:**
    `ResizeObserver` no canvas e `MutationObserver` em `<html>` (`data-theme` +
    `style`) **só para acordar o motor**. Sem eles a P2 regrediria: com o loop
    dormindo, redimensionar deixaria o canvas esticado (o backing store HiDPI só
    é refeito dentro do quadro) e trocar tema/paleta manteria as cores antigas até
    a próxima interação. A leitura da paleta segue **dentro do quadro**, com o
    motivo documentado desde a G9; a P3(c) remove a sondagem por quadro.
  - **Lacuna conhecida, fechada na P3(b):** trocar de monitor (muda o
    `devicePixelRatio` sem mudar o tamanho em CSS) não acorda o motor. Antes se
    auto-corrigia porque o loop rodava sempre.
  - Uma diretiva `eslint-disable` nova (deps do efeito de interações): `pedirFrame`
    só mexe em refs, e incluí-lo religaria todos os listeners a cada render.

  **Revisão pelo skill `vercel-react-best-practices` (na mesma sessão, a pedido
  do autor):**
  - **Regressão encontrada e corrigida — zoom do widget A/A.** O App aplica
    `zoom: fontZoom` no root, o que muda o `getBoundingClientRect()` (e portanto
    o backing store HiDPI) **sem disparar o ResizeObserver**, porque o box em px
    CSS não muda. Antes da P2 isso se auto-corrigia, já que o loop recalculava
    todo quadro; com o motor dormindo, o canvas ficaria **borrado** até a
    próxima interação. Corrigido com `fontZoom` (do `useTheme`) como dependência
    do efeito de redesenho — dependência **primitiva**, como manda a regra
    `rerender-dependencies`. **A mesma armadilha já estava documentada no
    [FundoVertices.jsx](src/components/conta/FundoVertices.jsx) desde a A2**: o
    precedente do próprio projeto é que confirmou o diagnóstico.
  - **`rendering-hoist-jsx`**: o objeto de `style` do `<canvas>` é 100% estático
    e era recriado a cada render — içado para o módulo (`ESTILO_CANVAS`). Não
    realoca e o React pula o diff de style (mesma identidade).
  - **Já em conformidade** (confirmado, sem mudança): `rerender-use-ref-transient-values`
    (hover, arraste, câmera e medidor vivem em refs — nenhum re-render por
    quadro) e `advanced-event-handler-refs` (`onSelecionar`/`onExpandir` em refs,
    para não religar listeners).
  - **Avaliado e mantido de propósito:** as deps do efeito de rede de segurança
    usam `nos`/`arestas` (objetos, não primitivos). Trocar por `.size`/`.length`
    perderia o caso de uma expansão que acrescenta arestas sem acrescentar nós;
    e todo `setGrafo` da página cria identidades novas (conferido), então o
    disparo é confiável. O custo de um disparo supérfluo é um único quadro.
  - **Confirmado como escopo da P3, não da P2:** a sondagem de tema/paleta por
    quadro ficou **redundante** com o `MutationObserver` — é a P3(c) que a
    remove; e o `getBoundingClientRect()` por quadro é a P3(b).
  - Verificado: `npm run lint` (**0/0**), `npm run build` (283,09 → **283,89 kB**,
    sem dependência nova) e `npm run dev` (200).
  - `sujo` (ref) + `pedirFrame()`: liga o RAF se ele não estiver rodando e marca
    que é preciso desenhar; nenhum outro ponto do arquivo chama
    `requestAnimationFrame` direto.
  - Condição de continuidade ao fim do quadro: `alpha > 0.012` (física quente)
    **ou** `alvoCam.current` (câmera interpolando) **ou** `dragRef.current`
    **ou** `sujo`. Falhou tudo → `cancelAnimationFrame` e o loop dorme.
  - Chamam `pedirFrame()`: `enquadrar`, `centrarEm`, `zoomCam`, `reaquecer`,
    `assentar`, o efeito de `versao`, os observers da P3 e os handlers de ponteiro
    (pan, wheel, drag). No **hover**, só quando o **id muda** — passar o mouse no
    vazio não pode acordar o loop.
  - Efeito defensivo em `[nos, arestas, selecionadoId, formas]` chamando
    `pedirFrame()`, para que mudança de dado/prop force um quadro mesmo que a
    página esqueça de reaquecer.
  - `semAnim` fica coerente de graça: sem física e com salto de câmera, desenha
    1 quadro e dorme.
  - **Critério de aceitação:** grafo parado sai de ~60 desenhos/s para **0**, e
    toda interação da lista de teste volta a acordar o loop e a dormir depois.
> **P3–P5 PENDENTES** — pausadas em 2026-10-09 pela mudança de foco para a
> integração com o Neo4j (§4.5). A linha de base da P1 foi medida com o mock:
> medir de novo antes da P3 — e depois da N11, que troca a física do motor.

- [ ] **P3 — Custo por quadro**: tudo em `GrafoCanvas.jsx`, sem mudança visual.
  - (a) **Grid num único path**: `beginPath()` uma vez, `moveTo`+`arc` por ponto,
    um `fill()` no fim — mesmos pixels, ~1.800× menos chamadas de desenho.
  - (b) **`ResizeObserver`** no canvas guardando `{ w, h }` num ref; o loop
    consome o ref em vez de `getBoundingClientRect()`, e o redimensionamento do
    backing store HiDPI passa para o observer. Os handlers de ponteiro continuam
    lendo o rect no evento (são raros e precisam da posição na tela). Guarda para
    troca de monitor: `matchMedia('(resolution: Xdppx)')` → `pedirFrame()`.
  - (c) **`MutationObserver`** em `<html>` (`attributeFilter: ['data-theme',
    'style']`) relendo a paleta e marcando sujo, no lugar da sondagem por quadro.
    **Preserva o motivo documentado** no cabeçalho do loop: o observer dispara
    *depois* de o atributo ser aplicado, então a paleta nunca fica um toggle
    atrasada — e os **três** tokens `--no-*` continuam na chave (protanopia e
    deuteranopia compartilham 2 cores).
  - (d) **Caches invalidados por versão dos dados**: array de nós da física (mata
    o `[...mapa.values()]` por iteração) e mapa de adjacência para o `Set` de
    vizinhos do foco. **Rebaixado pela medição da P1** (física ≤ 0,06 ms/quadro):
    fazer só o `Set` de vizinhos, que é custo de desenho; o array da física só se
    sobrar tempo.
  - (e) **Fontes pré-montadas**: as 3 strings de `ctx.font` (habilidade/conceito/
    disciplina) recalculadas só quando `cam.k` muda, guardadas num ref.
- [ ] **P4 — Lado React**:
  - (a) **Arrasto e resize do painel saem do estado**: em `GrafoPainel.jsx` o
    `move` escreve direto no nó (`aside.style.left` / `aside.style.width`) e o
    commit em `aoMudarPainel` acontece **só no `pointerup`**. A largura do palco é
    lida **uma vez** no início do gesto (hoje é um `getBoundingClientRect()` por
    movimento — com escrita direta viraria *layout thrashing*). Clamps
    (`MARGEM_PALCO`, `LARGURA_MIN`, `LARGURA_MAX`) idênticos. Seguro porque
    `offsetEsquerda` só é consumido por `enquadrar()`/`centrarEm()`, que não
    ocorrem durante o gesto.
  - (b) **`memo()` no `GrafoPainel` e no `GrafoEstados`**, com os callbacks que os
    alimentam estabilizados por `useCallback` em `Grafos.jsx` (`aoMudarPainel`,
    `noGrafo`, `aoIr`, `aoFechar`, `aoExpandir`). Ganho concreto: digitar na busca
    deixa de re-renderizar o subtree mais pesado da tela.
  - (c) **`useMemo` nos derivados por render** de `Grafos.jsx`: `turmasUI`,
    `acessibilidade` e `resumoRecorte`.
  - **Fora de escopo:** Web Worker para a física (com 56 nós não é o gargalo) e
    memoização geral dos demais componentes (re-render em ritmo humano — cerimônia
    sem ganho, já que o projeto não usa React Compiler).
- [ ] **P5 — Fechamento**: medir de novo os 3 cenários da P1 e registrar o
  **antes/depois**; decidir se o medidor fica atrás do `DEV` ou sai; relatório da
  **Etapa 19** no §3 (o que mudou, números, bugs encontrados); **D13** no
  [guia/DECISOES.md](guia/DECISOES.md) — "renderização sob demanda no motor do
  grafo", com problema, decisão, alternativas rejeitadas (loop perpétuo do
  protótipo; camada CSS para o grid; Web Worker; biblioteca de grafos), fala para
  a banca e **parágrafo de monografia** (cap. de Implementação, seção de
  visualização, retomando D3 e D4 — é desvio consciente do porte fiel, justificado
  por consumo de CPU/bateria).

#### Lista de teste manual do motor (rodar na P2 e repetir na P5)

Cada item precisa **acordar** o loop, redesenhar e **voltar a dormir**: hover
(tooltip + esmaecer) · clique/Esc · arrastar nó · pan · wheel-zoom · botões
+/−/recentrar · 2×clique (expandir) · Desfazer expansão · busca por habilidade
(seleciona e centra ~0,8 s depois) · recorte novo (enquadra a 420 ms) · troca de
tema · troca de paleta (protanopia ↔ deuteranopia) · modo formas · modo sem
animação · widget A/A · redimensionar a janela. **Painel:** arrastar e
redimensionar suaves, posição persiste no reload (`edugraphPrefs.painel`) e a
câmera segue enquadrando à direita dele.

### 4.5 Integração com o Neo4j — FOCO ATUAL (aberto em 2026-10-09)

Depois de reuniões com a orientadora, o grafo de conhecimento passa a viver num
**Neo4j** (consultas em **Cypher**), e não mais num Apache Jena Fuseki (SPARQL).
O projeto inteiro muda de foco para essa integração; os inacabados (P3–P5 do §4.4)
ficam pendentes.

**Decisões do autor (2026-10-09):**
- **Integração real, sem mock como plano B.** O site **vai para o ar**: nada de
  dados locais como segundo plano/fallback. O `mockFuseki.js` deixa de ser fonte
  de dados do app (a remoção/substituição é parte do trabalho desta seção).
- **Mostrar o grafo como o Neo4j Browser mostra** ao rodar a consulta da árvore
  ("arvore completa", das consultas de teste da orientadora): nós `Ano → UnidadeTematica →
  ObjetoConhecimento → Habilidade` e as arestas entre eles.
- **O Ano é um nó** do grafo (não só um filtro).
- **O grafo atual é uma versão resumida** do que a orientadora ainda está
  construindo (hoje: só 1.º ano de Matemática), mas **respeita a estrutura final**
  — a integração deve ser feita para o modelo definitivo, não para este recorte.
- **Não haverá mais sistema de usuários/cadastro.** Login/Signup/perfil mock **não
  devem ser alterados agora** — vão acabar deixando de existir, em etapa futura.

**Material de origem:** o script Cypher de carga (`exemplo_rosiane_alterado`) e as
consultas de teste (`consultas`) da orientadora. Ficavam na pasta `neo4j/`, **retirada
do repositório em 2026-10-15**: o site não usa esses arquivos (as consultas de teste
foram copiadas sem mudança para [src/data/consultasExemplo.js](src/data/consultasExemplo.js)).
O script de carga é material da orientadora e não fica no repositório — para montar o
Neo4j numa máquina, rodar no Browser a cópia que o autor guarda ou a versão mais
recente enviada por ela.
Neo4j local em `http://localhost:7474` (Browser em `/browser/`), banco `neo4j`.

**Estado do banco (conferido em 2026-10-09):** Neo4j 2026.09 Community, Cypher 5/25.
1 `Ano` · 5 `UnidadeTematica` · 17 `ObjetoConhecimento` · 22 `Habilidade`;
relações `TEM_UNIDADE` (5) · `TEM_OBJETO` (17) · `DESENVOLVE` (22) ·
`DESENVOLVE_HABILIDADE` (22, atalho Ano→Habilidade). Propriedades: `Ano{codigo,
nome}`, `UnidadeTematica{nome}`, `ObjetoConhecimento{descricao}`,
`Habilidade{codigo, descricao}`. Sem constraints/índices.

**Direção técnica:** detalhada no roadmap abaixo (arquitetura, contrato, regras e
etapas N0–N15). Em resumo: **Query API HTTP** com `fetch` (sem dependência nova),
sempre através de um **proxy do lado servidor** que guarda a senha — a edição
Community não tem usuário só-leitura e o site vai para o ar. A UI foi construída
sobre o modelo do protótipo (habilidade/conceito/disciplina; `desenvolve`/
`podeSerTrabalhadaEm`/`progrideDe`; eixos; 5.º–9.º) e é adaptada ao modelo novo ao
longo das etapas. Decisões afetadas: **D1** (Fuseki/mock), **D7** (habilidades
fixas), **D10** (recorte 5.º–9.º).

**Pontos para levar à orientadora:**
1. `MERGE (ut:UnidadeTematica {nome})` e `MERGE (oc:ObjetoConhecimento
   {descricao})` não incluem o ano: ao carregar o 2.º ano, "Números" vira o mesmo
   nó do 1.º e a árvore de um ano passa a trazer habilidades de outro.
2. Sem constraint de unicidade (`Habilidade.codigo`) e sem id estável para
   UnidadeTematica/ObjetoConhecimento.
3. Não há nó de componente curricular (a matéria só aparece no código `MA`) nem
   relação de progressão entre anos; descrições das habilidades estão truncadas.
4. A 7.ª consulta de teste dela ("professor colocar as habilidades que precisa
   ensinar no ano", linha 26 do arquivo `consultas`; cópia idêntica em
   [src/data/consultasExemplo.js](src/data/consultasExemplo.js)) tem erro de sintaxe
   (falta `)` depois de `:UnidadeTematica`).

#### Roadmap da integração — etapas N0–N15

*Proposto em 2026-10-09.* A ordem segue um princípio simples: **primeiro provar que
os dados chegam** (N1–N3), **depois provar que foram entendidos** (N4) e **só então
desenhar** (N5) — se o grafo sair errado, já se sabe em qual camada procurar. Em
seguida voltam, uma a uma, as funções que hoje dependem do mock (N6–N9) e o mock sai
(N10). A barra de filtros **não** é adaptada: vai ser
redesenhada depois, e até lá o lugar dela é de um **console Cypher** para testar a
integração. A **N11** (acrescentada em 2026-10-15) traz para o canvas a física e o
layout hierárquico do Neo4j Browser.

- [x] **N0** — Este roadmap *(2026-10-09)*
- [x] **N1** — Conexão: proxy de desenvolvimento e senha fora do código (+ D14) *(2026-10-09)*
- [x] **N2** — Cliente Cypher `src/data/neo4j.js` (sem tela) *(2026-10-12)*
- [x] **N3** — Console Cypher na página de grafos: ver o que chega *(2026-10-12)*
- [x] **N4** — Do resultado ao grafo: extrair nós e relações (em texto) *(2026-10-12)*
- [x] **N5** — Desenhar o grafo no canvas *(2026-10-12)*
- [x] **N6** — Tipos novos: cores, formas, paletas e legenda *(2026-10-13)*
- [x] **N7** — Painel de detalhe com dados reais *(2026-10-13)*
- [x] **N8** — Expandir e desfazer com Cypher *(2026-10-15)*
- [x] **N9** — Home com dados do Neo4j *(2026-10-15)*
- [x] **N10** — Remoção do mock *(2026-10-15)*
- [x] **N11** — Física igual à do Neo4j Browser + layout hierárquico *(2026-10-18)*
- [x] **N12** — Busca do professor: modelo e consultas (sem tela) *(2026-10-24)*
- [x] **N13** — Busca do professor: a barra (Ano, Matéria, Pergunta), ao lado do console Cypher *(2026-10-24)*
- [ ] **N14** — Busca do professor: os campos da pergunta, com o filtro por texto
- [ ] **N15** — Busca do professor: link compartilhável, botão da Home e fechamento

**N1–N10 finalizadas e testadas pelo autor** (confirmado em 2026-10-15). N11 planejada
em 2026-10-15 e feita em 2026-10-18 (detalhes no fim desta seção) — falta o teste do
autor.

**O globo da Home continua com dados locais** (decisão do autor, 2026-10-18): os nós e
arestas do grafo-globo da seção "Cada matéria tem sua rede."
([GraphSection.jsx](src/components/GraphSection.jsx)) ficam escritos no código, como
conteúdo ilustrativo da seção — faz mais sentido que puxá-los do Neo4j. É a única
exceção à D17 (nota lá).

**Fora deste roadmap** (registrado para não se perder): os pontos de modelagem para a
orientadora (lista acima). (A busca e o link compartilhável entraram no roadmap como
N12–N15, planejadas em 2026-10-24. Sobre as contas, o autor esclareceu em 2026-10-24
que Login e Signup continuam no site como telas sem uso funcional — não há remoção
prevista.)

**Arquitetura**

```
navegador (React)               servidor do site                     Neo4j
src/data/neo4j.js ──POST /api/cypher──► proxy ──POST /db/neo4j/query/v2──► Query API
   (sem senha)                  (põe a senha, força leitura)          (porta 7474)

desenvolvimento: proxy = Vite (vite.config.js, lê o .env.local)     → N1
produção:        proxy = a definir (mesmo caminho /api/cypher)
```

**Contrato (vale para todas as etapas)**
- O front só conhece `POST /api/cypher`, com o corpo da própria Query API
  (`{ statement, parameters, accessMode: "READ" }`) e
  `Accept: application/vnd.neo4j.query` (JSON **tipado**). A resposta passa sem
  alteração.
- **Por que JSON tipado** (os dois formatos foram testados em 2026-10-09): no JSON
  simples um nó chega como `{elementId, labels, properties}` — indistinguível de um
  mapa qualquer com essas chaves; no tipado cada valor vem marcado (`$type`: `Node`,
  `Relationship`, `Path`, `Integer`, `List`…), o que permite achar nós e relações em
  qualquer lugar do resultado, como o Browser faz. Inteiros e decimais chegam como
  texto (`"_value": "1"`) e o cliente converte.
- Erros: `{ errors: [{ code, message }] }` no corpo. Sintaxe e escrita em modo
  leitura chegam com HTTP 400 (`Neo.ClientError.Statement.SyntaxError`, com linha e
  coluna; `…Statement.AccessMode`), mas **erro em tempo de execução chega com 202**,
  o mesmo status do sucesso (ex.: `RETURN 1/0` → `…Statement.ArithmeticError`) —
  quem decide é a presença de `errors`, não o status (achado da N2). Campo
  desconhecido no corpo → 400 `Neo.ClientError.Request.Invalid` — por isso o
  `accessMode` aceito confirma que o campo existe.
- Do lado do front, quem fala com a Query API é só o
  [src/data/neo4j.js](src/data/neo4j.js) (N2): devolve as linhas já convertidas, com
  nós, relações e caminhos como as classes `No`, `Relacao` e `Caminho`, e toda falha
  como `ErroCypher` (`origem` · `codigo` · `status` · `message`).
- Formato interno do grafo (a partir da N4), usado pela página e pelo canvas:
  nó `{ id, tipo, rotulos, props, label, x, y, vx, vy, r }` · aresta
  `{ id, a, b, rel, props }` — `id` = `elementId`; `tipo` = rótulo principal;
  `rel` = tipo da relação.
- O `elementId` é a chave **dentro da sessão** (desenho, seleção, expansão): serve a
  qualquer resultado, inclusive UnidadeTematica e ObjetoConhecimento, que não têm
  código. O que precisar **persistir** ou ir para a **URL** (filtros futuros) usa
  chave de negócio (`Habilidade.codigo`…), porque o `elementId` muda se a base for
  recarregada.

**Regras (todas as etapas)**
- **Uma etapa por sessão**: implementar → `npm run lint` (0/0) · `npm run build` ·
  `npm run dev` → **teste do autor descrito na etapa** → registrar aqui. O commit é
  sempre do autor (§0).
- **Sem mock como plano B** (decisão de 2026-10-09). Durante a transição, partes da
  página ainda leem o `mockFuseki.js` até a etapa delas chegar; na N10 ele sai.
  (**Saiu na N10** — o site não guarda mais nenhum dado do grafo; D17.)
- **Sem dependência nova**: `fetch` + Query API (driver Bolt descartado); sem
  biblioteca de grafos (D3).
- **A senha nunca entra no código do front**: variáveis **sem** o prefixo `VITE_` (o
  Vite só embute no bundle o que começa com `VITE_`), guardadas no `.env.local`, que
  já é ignorado pelo `*.local` do `.gitignore`.
- **Consultas montadas pelo site usam sempre `parameters`** — nunca concatenar texto
  na Cypher. (O console é a exceção natural: lá quem escreve a consulta é a pessoa.)
- **Somente leitura**: toda requisição leva `accessMode: "READ"`.
- **Filtros antigos: não investir** — eles só saem de cena (o redesenho é trabalho
  futuro).
- **Contas: não mexer** em Login/Signup/`GrafoPerfil` (vão sair num roadmap
  próprio). Quando a integração esbarrar nelas, a etapa registra o efeito e não
  altera o componente. (Exceção decidida pelo autor na N10: as "Minhas turmas" saíram
  do `GrafoPerfil`, porque eram dados do mock.)
- Motor do canvas (D3/D4) intacto — física, câmera e tempos. Só a tabela de molas
  por tipo de relação muda, porque os tipos mudaram. Acessibilidade (D6) preservada.
  **Exceção: a N11** (feita em 2026-10-18), que trocou a física pela do Neo4j Browser
  (pedido do autor, 2026-10-15) — decisão própria, **D18**.
- Bug fora do escopo da etapa → anotar aqui, não corrigir junto.

**Números de referência** — base local de 2026-10-09 (1.º ano de Matemática),
calculados direto no Neo4j. **Mudam quando a orientadora atualizar a base**:
recalcular antes de usar como critério.

| # | Consulta de teste ([consultasExemplo.js](src/data/consultasExemplo.js), mesma ordem) | Linhas | Nós | Relações | Relações com "conectar nós" |
|---|---|---|---|---|---|
| 1 | árvore completa | 22 | 45 | 44 | 66 |
| 2 | geometria completa | 4 | 8 | 7 | 7 |
| 3 | de onde vem a habilidade (EF01MA17) | 1 | 4 | 3 | 4 |
| 4 | ano direto p/ habilidade | 22 | 23 | 22 | 22 |
| 5 | caminho entre 2 habilidades | 1 | 7 | 6 | 8 |
| 6 | habilidade irmã (EF01MA16) | 2 | 4 | 3 | 3 |
| 7 | habilidades que o professor precisa ensinar | erro de sintaxe (linha 26); corrigida: 4 | 11 | 10 | 14 |

*"Conectar nós":* o Neo4j Browser, por padrão, desenha também as relações que
**existem entre os nós retornados**, mesmo que a consulta não as peça — é por isso
que a árvore aparece lá com as setas `DESENVOLVE_HABILIDADE` do Ano para cada
habilidade (66 relações, e não 44). No Browser clássico é a opção "Connect result
nodes" das configurações; conferir como ela está antes de comparar.

Conexões por nó (critério da N7): Ano `EF1` = 27 · UnidadeTematica "Números" = 7 ·
Habilidade `EF01MA17` = 2.

---

#### N1 — Conexão: proxy de desenvolvimento e senha fora do código

**Objetivo:** o servidor de desenvolvimento do site conversa com o Neo4j e guarda a
senha do lado do servidor. **Nenhuma tela muda.**

**O que fazer:**
- `.env.local` (não versionado): `NEO4J_URL=http://localhost:7474`,
  `NEO4J_DATABASE=neo4j`, `NEO4J_USER=neo4j`, `NEO4J_PASSWORD=…`.
- `.env.example` (versionado, **sem** senha) com as mesmas variáveis — é por ele que
  a outra máquina monta o seu `.env.local`. A outra máquina também precisa do Neo4j
  com os mesmos dados (rodar o script de carga da orientadora no Browser dela — ver
  "Material de origem" no início da §4.5).
- [vite.config.js](vite.config.js): `loadEnv` + `server.proxy` **e** `preview.proxy`
  de `/api/cypher` para `${NEO4J_URL}/db/${NEO4J_DATABASE}/query/v2`, com o
  cabeçalho `Authorization: Basic …` montado das variáveis.
- **D14** no [guia/DECISOES.md](guia/DECISOES.md): Neo4j/Cypher no lugar do
  Fuseki/SPARQL, integração real sem mock, Query API atrás de proxy. A D14 supera a
  D1, que fica como registro histórico.

**Como testar (autor):**
1. Com o `npm run dev` rodando, o mesmo teste que você fez no terminal, mas **sem
   `-u`** e pela porta do site:
   ```bash
   curl -s -X POST http://localhost:5173/api/cypher -H 'Content-Type: application/json' \
     -d '{"statement":"MATCH (h:Habilidade) RETURN h.codigo AS codigo LIMIT 3"}'
   ```
   Tem que vir `EF01MA01`, `EF01MA02`, `EF01MA03`, igual ao curl direto.
2. Senha errada no `.env.local` (e reiniciar o `npm run dev`) → a resposta vira erro
   de autenticação do Neo4j (401). Desfazer.
3. Neo4j parado → o curl recebe erro na hora (não fica pendurado). Religar.
4. `git status` não lista o `.env.local`; depois de `npm run build`, procurar a senha
   dentro de `dist/` → nenhuma ocorrência.

**Pronto quando:** os 4 testes passam e lint/build/dev estão verdes.

**Feito (2026-10-09).** Arquivos: [vite.config.js](vite.config.js) (função
`proxyNeo4j(env)` + `loadEnv` com prefixo `''`; o mesmo objeto de proxy em
`server.proxy` e `preview.proxy`), [.env.example](.env.example) (versionado, senha
em branco) e `.env.local` (não versionado — conferido com `git check-ignore`). D14
registrada no [guia/DECISOES.md](guia/DECISOES.md); a D1 ganhou a nota "superada
pela D14" e a D13 ficou marcada como reservada para a P5.

Detalhes e desvios do plano (todos a favor):
- **Erro do proxy no formato da Query API.** Com o Neo4j fora do ar, o padrão do
  Vite responde `500` com corpo vazio. O proxy agora responde **`502`** com
  `{ errors: [{ code: 'EduGraph.Proxy.Neo4jIndisponivel', message }] }` — o mesmo
  formato dos erros do próprio Neo4j, para o cliente da N2 tratar tudo de um jeito
  só; o prefixo `EduGraph.Proxy.` separa falha do proxy de erro do banco (`Neo.*`).
  O listener entra pelo `configure` e roda antes do listener do Vite (conferido no
  código do Vite 5.4.21), que então só loga a falha no terminal.
- **A credencial do servidor sempre vence**: o `headers` do proxy sobrescreve
  qualquer `Authorization` vindo do navegador (testado com um Basic falso — a
  consulta continua passando com a credencial do `.env.local`).
- **Sem senha configurada** (ex.: outra máquina sem `.env.local`): o terminal do
  `npm run dev` avisa "NEO4J_PASSWORD não definida — copie .env.example para
  .env.local…" e nenhuma credencial é enviada (o Neo4j responde 401 "No
  authentication header supplied").
- `NEO4J_URL`, `NEO4J_DATABASE` e `NEO4J_USER` têm os padrões locais
  (`http://localhost:7474`, `neo4j`, `neo4j`); só a senha é obrigatória.
- `Buffer` e `process` importados de `node:buffer`/`node:process`: o ESLint do
  projeto aplica só globais de navegador a todo `.js`, e o import explícito evita
  mexer na config do lint.
- **Achado para a N2:** a Query API responde **`202 Accepted`** (não `200`) quando a
  consulta dá certo — o cliente tem que aceitar qualquer 2xx.

Verificado: `npm run lint` (0/0), `npm run build` (**283,89 kB, idêntico** — a
config não toca o bundle) e `npm run dev` (200). Os testes da etapa foram rodados
pelo assistente em servidores temporários (portas 5196–5199, encerrados no fim):
(1) curl sem `-u` em `/api/cypher` → `EF01MA01/02/03` (HTTP 202); (2) senha errada
(passada por variável de ambiente, sem editar o `.env.local`) → 401 `Invalid
credential.`; (3) Neo4j inalcançável (URL com porta fechada, sem derrubar o Neo4j
do autor) → 502 JSON em ~3 ms; (4) `.env.local` ignorado pelo git; a senha e o texto
`NEO4J` com zero ocorrências em `dist/`. **Teste do autor: feito** (os 4 itens
acima, no `npm run dev` dele; confirmado em 2026-10-15).

**Na outra máquina:** copiar `.env.example` para `.env.local` e preencher a senha;
ter o Neo4j rodando com os mesmos dados (o script de carga da orientadora rodado no
Browser dela; o arquivo não fica no repositório — ver "Material de origem" no início
da §4.5).

---

#### N2 — Cliente Cypher (`src/data/neo4j.js`), sem tela

**Objetivo:** uma única função do front que executa Cypher e devolve o resultado já
entendido — o transporte que todas as próximas etapas usam. **Nenhuma tela muda.**

**O que fazer:**
- `executarCypher(consulta, parametros = {})` → `fetch('/api/cypher')` no formato do
  contrato. Devolve `{ campos, linhas, tempos, tipoConsulta }`; `tempos` traz o
  `resultAvailableAfter` e o `resultConsumedAfter` do Neo4j e o tempo total medido
  no navegador (rede incluída).
- Decodificação do JSON tipado: texto/booleano/nulo → valor; `Integer`/`Float` →
  número (inteiro além do limite seguro do JS continua texto); `List`/`Map` →
  array/objeto; `Node`/`Relationship`/`Path` → objetos próprios (nó com `id`,
  `rotulos`, `props`; relação com `id`, `rel`, `inicio`, `fim`, `props`; caminho com a
  sequência nó–relação–nó); datas, pontos e bytes → texto.
- Erros num formato só: `{ origem: 'rede' | 'http' | 'neo4j', codigo, mensagem }` —
  rede (servidor do site fora do ar), HTTP (401 credencial, 5xx proxy sem Neo4j) e
  Neo4j (`errors[]`: sintaxe, consulta inválida, modo de acesso).
- Tempo-limite (`AbortController`, ~15 s) e cancelamento da consulta anterior quando
  outra é disparada.

**Como testar (autor)** — no console do DevTools, com o site aberto pelo `npm run dev`
(nos casos de erro, o `.catch` devolve `[origem, código, mensagem]` em vez de estourar
no console). As duas primeiras linhas carregam o cliente: **depois de qualquer F5** (ou
reinício do `npm run dev`, que recarrega a página) é preciso colá-las de novo — senão
vem `ReferenceError: executarCypher is not defined`. São `var` de propósito: no
Firefox, colar um `const` duas vezes na mesma página dá `redeclaration of let`.
```js
var { executarCypher } = await import('/src/data/neo4j.js')
var erro = (e) => [e.origem, e.codigo, e.message]
await executarCypher('RETURN 1 AS um, "a" AS texto, [1.5, null, true] AS lista, {k: 2} AS mapa')
await executarCypher('MATCH (h:Habilidade {codigo: $c}) RETURN h', { c: 'EF01MA17' })
await executarCypher('MATCH (n RETURN n').catch(erro)               // 'neo4j', …SyntaxError
await executarCypher('CREATE (:TesteEscrita) RETURN 1').catch(erro) // 'neo4j', …AccessMode
```
- 1.ª: `linhas` = `[{ um: 1, texto: 'a', lista: [1.5, null, true], mapa: { k: 2 } }]`
  (número é número, lista é array).
- 2.ª: `linhas[0].h` é um `No` com `id`, `rotulos: ['Habilidade']` e `props`
  (`codigo`, `descricao`).
- Se o `CREATE` **não** falhar: apagar no Browser (`MATCH (t:TesteEscrita) DELETE t`)
  e anotar aqui — o bloqueio de escrita passa a ser obrigação do proxy de produção.
- Neo4j parado → `.catch(erro)` devolve `['http', 'EduGraph.Proxy.Neo4jIndisponivel',
  'Não foi possível conectar ao Neo4j…']` na hora, sem travar.

**Pronto quando:** todos os casos se comportam como descrito.

**Feito (2026-10-12).** [src/data/neo4j.js](src/data/neo4j.js):
`executarCypher(consulta, parametros, opcoes)` + as classes `No`, `Relacao`, `Caminho`
e `ErroCypher`. Nenhuma tela importa o módulo ainda — bundle **idêntico** (283,89 kB,
mesmo hash).

Achados no Neo4j antes de escrever (testados direto na Query API):
- **Erro em tempo de execução chega com HTTP 202**, o mesmo status do sucesso, com
  `errors` no corpo (`RETURN 1/0` → `ArithmeticError`). O cliente decide pelo corpo.
- **O modo leitura é imposto pelo próprio Neo4j**: `CREATE` com `accessMode: "READ"`
  → `Neo.ClientError.Statement.AccessMode` ("Writing in read access mode not
  allowed"). O primeiro teste foi feito dentro de uma transação explícita desfeita no
  fim, para garantir que nada fosse gravado; o banco seguiu com 0 nós `TesteEscrita`
  e sem o rótulo criado. Em produção, o proxy deve forçar o modo mesmo assim (o
  código do navegador pode ser alterado por quem visita o site).

Detalhes e desvios do plano (todos a favor):
- **`linhas` são objetos chaveados pelo nome do campo** (`linhas[0].codigo`), na ordem
  de `campos` — mais legível no teste e nas agregações da N9. A resposta crua continua
  disponível em **`bruto`** (é o que a aba JSON da N3 vai mostrar).
- **`avisos`** (não estava no plano): as notificações do Neo4j — ex.: rótulo que não
  existe no banco (`UnknownLabelWarning`), útil para pegar erro de digitação nas
  consultas da N3.
- **Nós, relações e caminhos são classes** (`No`, `Relacao`, `Caminho`): `instanceof`
  os separa sem ambiguidade de um mapa Cypher que tenha as mesmas chaves (testado). O
  caminho guarda `nos` e `relacoes` em ordem: `nos[i] —relacoes[i]— nos[i + 1]`.
- **Cancelamento por `canal`, não global.** O plano dizia "cancelar a consulta anterior
  quando outra é disparada"; um cancelamento global derrubaria consultas paralelas
  legítimas (ex.: as conexões do painel durante uma expansão). Só se cancelam consultas
  do **mesmo canal** (o console vai usar `canal: 'console'`); também há `signal`
  externo. Cancelar não é falha: vira a 4.ª origem, **`'cancelada'`**, que quem chama
  só ignora.
- A mensagem fica em `err.message` (padrão do `Error`), não num campo `mensagem`. Os
  códigos do cliente seguem o padrão do proxy: `EduGraph.Cliente.SemConexao`,
  `.TempoEsgotado` e `.Cancelada`.
- Classificação: código `Neo.*` → `'neo4j'`, exceto `Neo.ClientError.Security.*`
  (credencial é configuração → `'http'`); `EduGraph.Proxy.*` e respostas sem JSON →
  `'http'`.
- Inteiro além do limite seguro do JS (2^53) fica texto; `NaN`/`Infinity` viram
  número; datas, durações e pontos ficam no texto que a Query API manda (ISO 8601/WKT).
- Parâmetro que não vira JSON (ex.: `BigInt`) estoura como `TypeError` — é erro de
  programação, não "falha de rede".

Verificado: `npm run lint` (0/0), `npm run build` (283,89 kB, idêntico) e
`npm run dev` (o módulo é servido em `/src/data/neo4j.js` com HTTP 200 — o caminho do
teste no DevTools). Bateria de **21 casos** rodada pelo assistente com o cliente real
no Node, contra servidores temporários (senha certa, senha errada, Neo4j inalcançável
e porta fechada), todos passando: tipos simples; nó com parâmetro; caminho; relação
solta; inteiros grandes e decimais especiais; datas/duração/ponto; mapa que imita nó;
lista de nós; aviso de rótulo inexistente; sintaxe (400); escrita bloqueada (banco
conferido: 0 nós); erro de execução com 202; tempo esgotado; canal; concorrentes sem
canal; `signal` externo; parâmetro não serializável; 404; 401; 502; servidor fora do
ar. **Teste do autor (2026-10-12, Firefox):** feito; os dois tropeços vieram do console
do navegador, não do cliente — colar o import duas vezes (`redeclaration of let`) e
testar depois de um F5 sem recarregar o cliente (`ReferenceError`); as instruções acima
foram ajustadas (`var` + aviso do F5). Um `ECONNREFUSED` com o Neo4j "ligado" era o
intervalo entre o `systemctl start` e a porta 7474 abrir (~9 s, conferido nos
registros do serviço).

---

#### N3 — Console Cypher na página de grafos: ver exatamente o que chega

**Objetivo:** o lugar para escrever Cypher e conferir a resposta **crua** do Neo4j,
antes de qualquer desenho. Ele toma o lugar da barra de filtros (provisoriamente —
os filtros vão ser redesenhados).

**O que fazer:**
- `src/components/grafo/ConsoleCypher.jsx`: caixa de texto em fonte mono, botão
  **Executar** (e Ctrl/Cmd+Enter), menu de **exemplos** com as consultas de
  `neo4j/consultas` — lidas do próprio arquivo (import `?raw`), para
  acompanharem o que a orientadora mandar — e linha de status (linhas · tempos do
  Neo4j · tempo total). **Ajuste do autor (2026-10-15):** o site não lê mais a pasta
  `neo4j/` (que depois foi retirada do repositório). Os exemplos foram
  copiados sem mudança para [src/data/consultasExemplo.js](src/data/consultasExemplo.js)
  (`CONSULTAS_EXEMPLO`; conferido: idênticos ao que o console lia), que também exporta
  `CONSULTA_ANO_HABILIDADES` — a consulta do "Ver o grafo desta turma" da Home (N9)
  agora sai dali, em vez de ser uma cópia à parte. Consulta nova no menu = uma entrada
  nova nesse módulo.
- Resultado no palco, em abas: **Tabela** (uma coluna por campo; nó como
  `(:Rotulo {props})`, relação como `[:TIPO]`, caminho resumido) e **JSON** (a
  resposta exatamente como veio, formatada).
- Erro mostra código + mensagem (no card de erro do palco, em fonte mono).
- Na página: o `GrafoFiltros` deixa de ser renderizado (o arquivo fica até a N10) e
  a barra do console herda o lugar e o z-index dele (40); os textos dos estados
  (`GrafoEstados`) trocam "endpoint SPARQL / Apache Jena Fuseki / Filtrar" por
  Neo4j / Cypher / Executar; a legenda e a gaveta SPARQL ficam ocultas até voltarem
  adaptadas (N6 e N10). O canvas ainda **não** recebe dados.
- **Efeitos colaterais aceitos (temporários):** o "Filtrar" das turmas no perfil e o
  "Ver o grafo desta turma" da Home dependem do fluxo de filtros antigo e ficam sem
  efeito — o `GrafoPerfil` não é alterado; a Home é tratada na N9.

**Como testar (autor):**
1. Rodar as 7 consultas de exemplo: nas 6 válidas, o nº de **linhas** bate com a
   tabela de referência e com a aba de tabela do Neo4j Browser.
2. A 7.ª mostra o erro de sintaxe com código e posição.
3. `RETURN 1 AS um, "a" AS texto, [1.5, null, true] AS lista` aparece certo na Tabela.
4. A aba JSON bate com a visão de código/JSON do resultado no Browser.
5. Neo4j parado → card de erro legível; religado → Executar funciona de novo.

**Pronto quando:** o que o site mostra bate com o Browser em todas as consultas.

**Feito (2026-10-12).** Arquivos novos:
[src/components/grafo/ConsoleCypher.jsx](src/components/grafo/ConsoleCypher.jsx)
(barra) e [src/components/grafo/ResultadoCypher.jsx](src/components/grafo/ResultadoCypher.jsx)
(Tabela/JSON). Alterados: [Grafos.jsx](src/pages/Grafos.jsx),
[GrafoEstados.jsx](src/components/grafo/GrafoEstados.jsx) e [index.css](src/index.css)
(classes `.eg-console-cypher`, `.eg-resultado-aba`, `.eg-resultado-tabela` e o
`:disabled` do botão verde). Sem token novo.

Como ficou:
- **Barra (z-index 40, no lugar da de filtros):** rótulo "CYPHER", caixa de texto em
  fonte mono que cresce até 8 linhas, menu **Exemplos…** e botão **Executar**
  (desabilitado sem texto ou durante a consulta). Ctrl/Cmd+Enter executa; Enter quebra
  a linha. Linha de status: `linhas · Neo4j: pronto em X ms, lido em Y ms · total no
  navegador: Z ms` (+ `avisos: N`); antes da 1.ª execução, "Ctrl+Enter executa ·
  somente leitura".
- **Exemplos** lidos do próprio `neo4j/consultas` (import `?raw`; hoje vêm do
  `consultasExemplo.js` — ajuste de 2026-10-15 acima):
  cada `// título` abre um exemplo. Os títulos aparecem como estão no arquivo
  (inclusive "habiludade irma"); se a orientadora trocar o arquivo, o menu acompanha.
- **Resultado** (vidro do painel, mais opaco — 92%, para a tabela ler firme; z-index
  30, à direita do painel de contexto): abas Tabela/JSON e `linhas · campos` no
  cabeçalho; os **avisos** do Neo4j aparecem no topo (ex.: rótulo inexistente).
  Tabela com coluna **#** (nº da linha, para conferir com o Browser), textos entre
  aspas (o tipo fica visível: `1` × `"1"`), nó como `(:Rotulo {props})`, relação como
  `[:TIPO]` e caminho resumido com o 1.º valor de cada nó e o sentido real das setas.
  Limites: 500 linhas desenhadas e 1.000.000 de caracteres no JSON (avisa quando corta).
- **Card de erro:** título conforme a origem ("O Neo4j recusou a consulta" / "Não foi
  possível falar com o Neo4j" / "Sem resposta do servidor do site"), código em dourado
  e a mensagem — a de sintaxe traz a consulta e o `^` num bloco que não quebra linha,
  para o `^` ficar sob a posição certa. Erro **da consulta** não oferece "Tentar
  novamente" (repetir não adianta); mostra "Corrija a consulta na barra acima".
- **Desempenho** (skill `vercel-react-best-practices`): o texto digitado vive no
  ConsoleCypher — digitar não re-renderiza a página; Tabela e JSON são `memo()` —
  arrastar o painel não refaz a tabela.

Desvios do plano:
- **O fluxo de filtros do mock saiu já na N3, não na N10.** Sem a barra, ele ficou
  sem nenhum chamador, e o lint do projeto (0/0) não aceita código morto. Saíram:
  `aplicarFiltros`, `montarGrafo`, `contarVertices`, `sincronizarURL`, o efeito de
  deep-link `?serie=`, busca/sugestões, seleção pendente, a simulação de falha 503 e a
  constante `ATRASO_SELECAO_BUSCA` (770 ms). **A N5 reescreve o `montarGrafo`** para o
  formato novo — referência no git (commit da N2): espiral áurea (ângulo 2.399963),
  distâncias `70 + (idx % 5)·38` / 230 / 330 por tipo, raios 11/14/17, ±15 px de
  ruído e a posição mantida para nós que já estavam na tela. Continuam no repo, sem
  uso: `GrafoFiltros.jsx` (decisão na N10) e `LegendaTipos`/`GavetaSparql` em
  `GrafoOverlays.jsx` (voltam adaptados na N6/N10). Grafos.jsx: 799 → 568 linhas.
- O estado `vazio` ficou sem uso (consulta sem linhas aparece na própria tabela); o
  texto do card foi adaptado e marcado "sem uso desde a N3 — a N5 decide".
- Zoom, paleta e resumo só aparecem com nós no canvas (`temGrafo`): ocultos na N3.
- "Filtrar" de turma no perfil: só fecha o perfil (efeito aceito no plano; o
  `GrafoPerfil` não mudou). O "Ver o grafo desta turma" da Home abre a página no
  convite (tratado na N9).

Verificado: `npm run lint` (0/0), `npm run build` (JS **283,89 → 276,37 kB** — saíram
a barra de filtros e o fluxo morto, entraram o cliente e o console; CSS 7,33 → 8,81
kB) e `npm run dev`. O assistente chegou a conferir parte do teste num navegador
automatizado instalado numa pasta temporária **sem pedir permissão** — erro dele; tudo
foi removido a pedido do autor, inclusive do cache do npm. O que essa conferência
cobriu: os 7 exemplos (22/4/1/22/1/2 linhas e o erro de sintaxe com `^`, sem "Tentar
novamente"), a aba JSON tipada, o Ctrl+Enter e os tipos na tabela. **Teste do
autor: feito** (itens acima, inclusive o que ficou sem conferência: avisos, "Voltar
ao início", tema escuro e Neo4j fora do ar; confirmado em 2026-10-15).

---

#### N4 — Do resultado ao grafo: extrair nós e relações (ainda em texto)

**Objetivo:** transformar qualquer resultado em "nós + relações", do jeito que o
Browser faz, e **conferir os números antes de desenhar** — se depois o desenho sair
errado, já se sabe que não é a extração.

**O que fazer:**
- `src/data/extrairGrafo.js` (função pura, sem React): percorre todas as linhas e
  valores — inclusive dentro de listas, mapas e caminhos — e junta nós e relações
  sem repetir (chave `elementId`).
- **Relação sem as pontas no resultado** (ex.: `MATCH ()-[r]->() RETURN r`): busca os
  nós que faltam numa consulta extra
  (`MATCH (n) WHERE elementId(n) IN $ids RETURN n`), como o Browser.
- **Conectar nós do resultado**: consulta extra que traz as relações existentes entre
  os nós retornados. Ligado por padrão (igual ao Browser), com uma chave
  liga/desliga no console.
- Limite de nós exibidos (proposta: 300, o padrão do Browser clássico), com o aviso
  "mostrando 300 de N".
- Aba nova **Grafo (texto)** no resultado: contagem por rótulo e por tipo de relação
  + a lista.

**Como testar (autor):** nas 6 consultas válidas, nós e relações batem com a tabela
de referência — com a chave ligada (última coluna) e desligada. Conferir também com
o que o Browser exibe.

**Pronto quando:** os números conferem nas duas posições da chave.

**Feito (2026-10-12).** Arquivo novo [src/data/extrairGrafo.js](src/data/extrairGrafo.js);
alterados [Grafos.jsx](src/pages/Grafos.jsx),
[ConsoleCypher.jsx](src/components/grafo/ConsoleCypher.jsx) e
[ResultadoCypher.jsx](src/components/grafo/ResultadoCypher.jsx). Sem CSS nem token
novo (reusa `Chave`, as classes da N3 e `MONO_LABEL`).

Como ficou:
- **`extrairGrafo(linhas)`** (pura, sem rede): percorre colunas, listas, mapas e
  caminhos e junta nós e relações sem repetir (chave `elementId`), na ordem em que
  aparecem. Um mapa que imita um nó continua sendo mapa (as classes da N2 resolvem).
- **`completarGrafo(grafo, { conectar, limite })`** — as consultas extras do Browser,
  todas em modo leitura: (1) **pontas que faltam** — relação cujas pontas não vieram
  no resultado busca esses nós (`MATCH (n) WHERE elementId(n) IN $ids RETURN n`), só os
  que vão ser exibidos; (2) **limite** `LIMITE_NOS = 300` — os nós do resultado
  primeiro, depois as pontas; relação com ponta de fora também sai; (3) **conectar**
  — traz as relações que existem entre os nós exibidos
  (`MATCH (a)-[r]->(b) WHERE elementId(a) IN $ids AND elementId(b) IN $ids RETURN r`).
  Devolve também `total` (nós antes do limite) e `extras` (cada consulta extra: o que
  trouxe e quanto demorou).
- **Console:** a linha de status ganhou `grafo: N nós, M relações` (os números do
  teste ficam à vista sem trocar de aba) e, à direita, a chave **"Conectar nós do
  resultado"** (ligada por padrão, como no Browser; desabilitada durante a consulta).
- **Aba "Grafo"** (entre Tabela e JSON): totais; aviso "Mostrando 300 de N nós" quando
  corta; as consultas extras feitas ("pontas que faltavam: +k nós", "conectar nós do
  resultado: ligado — +k relações" ou "desligado", com os ms); contagem por **rótulo**
  e por **tipo de relação**; e as listas de nós (`(:Rotulo {props})`) e de relações
  (`(:A "x")-[:TIPO]->(:B "y")`, até 1.000 linhas).

Desvios do plano (a favor):
- **A chave refaz a consulta na hora** (com um resultado na tela) em vez de valer só
  "na próxima execução": os números mudam ao alternar, como se espera de um
  interruptor. Refaz a última consulta *executada* (não o texto que estiver sendo
  editado). O estado da chave mora na **página**, não no console: a N8 (expansão)
  também vai precisar dele.
- **A aba escolhida passou a morar na página**: antes ela voltava para "Tabela" a cada
  execução (o resultado desmonta enquanto carrega); agora dá para conferir as 6
  consultas sem sair da aba Grafo.
- As consultas extras rodam **fora do canal** do console; a guarda `seq` da página
  descarta a resposta velha se outra execução começar no meio.

Verificado: `npm run lint` (0/0), `npm run build` (JS 276,37 → **282,02 kB**; CSS
8,81 kB idêntico) e `npm run dev`. Testes do assistente **sem instalar nada** — o Vite
e o React do próprio projeto, no Node, contra um servidor temporário: (a) **dados**,
14 casos: as 7 consultas da tabela de referência nas **duas posições da chave**
(45/44 → 45/66, 8/7 → 8/7, 4/3 → 4/4, 23/22 → 23/22, 7/6 → 7/8, 4/3 → 4/3 e, a 7.ª
corrigida, 11/10 → 11/14 — todos batendo), só relações (busca 6 pontas), limite (10 de
22; 5 de 23 cortando as relações de fora), nós dentro de lista e de mapa, nó repetido,
resultado sem nós (nenhuma consulta extra) e mapa que imita nó; (b) **renderização**
dos componentes em HTML (`react-dom/server`, sem navegador), 6 casos: aba Grafo com a
chave ligada/desligada, limite, pontas, sem nós, Tabela/JSON intactas e a linha de
status + chave do console. **Teste do autor no navegador: feito** (confirmado em
2026-10-15): os números de cada consulta aparecem na linha de status (`grafo: N nós,
M relações`) e na aba Grafo; alternar a chave refaz a consulta.

---

#### N5 — Desenhar o grafo no canvas

**Objetivo:** o grafo do Neo4j aparece no canvas do site com a mesma estrutura que o
Browser mostra.

**O que fazer:**
- O `montarGrafo` ([Grafos.jsx](src/pages/Grafos.jsx)) passa a receber o resultado da
  N4 (formato interno do contrato), mantendo a espiral de ângulo áureo como semente,
  a estabilidade de posição entre consultas e o enquadrar a 420 ms.
- **Tabela de estilo** `src/data/estiloGrafo.js` (o equivalente ao estilo do
  Browser): por rótulo → token de cor, raio e propriedade usada como legenda (Ano →
  `nome`, UnidadeTematica → `nome`, ObjetoConhecimento → `descricao` encurtada,
  Habilidade → `codigo`); por tipo de relação → comprimento da mola e tracejado.
  Rótulo ou tipo **desconhecido** (a orientadora vai acrescentar outros) cai num
  estilo padrão — o site nunca quebra por causa de um rótulo novo.
- Tokens de cor `--no-*` para os 4 rótulos, claro **e** escuro.
- Canvas: cor, raio, legenda e fonte vêm da tabela (saem os `tipo === 'habilidade'`
  fixos); molas por tipo de relação; rótulo da aresta = tipo da relação (como no
  Browser); tooltip com a legenda completa.
- Pill de resumo: "N nós · M relações · X ms".
- Ainda **não**: clique abrindo o painel (N7) e 2×clique expandindo (N8 — desligado
  até lá, para não chamar o mock).
- **Decidir com o autor na etapa:** o comprimento das molas dos 4 tipos de relação;
  e se o atalho `DESENVOLVE_HABILIDADE` aparece mais discreto (fino ou tracejado)
  para não poluir a árvore.

**Como testar (autor):** a consulta 1 (árvore) lado a lado com o Browser: mesmos
nós, mesmas setas e direções, mesma contagem. Depois: arrastar nó, pan, zoom, hover,
tema escuro, widget A/A, modo sem animação, e rodar a mesma consulta duas vezes (os
nós não "pulam").

**Pronto quando:** as 6 consultas válidas desenham o mesmo grafo que o Browser.

**Feito (2026-10-12).** Arquivo novo [src/data/estiloGrafo.js](src/data/estiloGrafo.js);
alterados [GrafoCanvas.jsx](src/components/grafo/GrafoCanvas.jsx),
[Grafos.jsx](src/pages/Grafos.jsx), [ResultadoCypher.jsx](src/components/grafo/ResultadoCypher.jsx),
[GrafoEstados.jsx](src/components/grafo/GrafoEstados.jsx) e [index.css](src/index.css).

Como ficou:
- **Tabela de estilo** (`estiloGrafo.js`), por rótulo:

  | Rótulo | Cor (token) | Raio | Forma | Legenda | Tooltip | Anel da semente |
  |---|---|---|---|---|---|---|
  | Ano | `--no-ano` (laranja) | 19 | losango | `nome` | — | 0 (centro) |
  | UnidadeTematica | `--no-unidade` (violeta) | 16 | quadrado | `nome` | — | 150 |
  | ObjetoConhecimento | `--no-objeto` (azul) | 13 | triângulo | `descricao` (28 car.) | descrição inteira | 280 |
  | Habilidade | `--no-habilidade` (verde) | 11 | círculo | `codigo` (mono) | `codigo — descricao` | 400 |
  | *sem estilo* | `--no-outro` (cinza) | 12 | círculo | 1.ª de nome/name/titulo/title/codigo/code/descricao/description | — | 220 |

  e por tipo de relação (comprimento de repouso da mola): `TEM_UNIDADE` 150 ·
  `TEM_OBJETO` 130 · `DESENVOLVE` 120 · `DESENVOLVE_HABILIDADE` 280 · *sem estilo*
  150 (o padrão do protótipo); nenhum tracejado. O rótulo principal de um nó é o 1.º
  que tiver estilo (um nó com dois rótulos usa o conhecido). Rótulo novo da
  orientadora aparece em cinza com a legenda pela 1.ª propriedade "de nome" — o site
  não quebra. Tokens novos `--no-ano --no-unidade --no-objeto --no-outro` com
  contraparte escura.
- **`montarGrafo`** (porte do da G3): espiral de ângulo áureo (2.399963) a partir do
  anel do rótulo + 0–96 px + ±15 px de ruído; nó que já estava na tela mantém a
  posição (repetir a consulta ou alternar "conectar nós" não faz o grafo pular).
  Resultado novo reaquece a física, enquadra a 420 ms e zera o histórico de
  expansões, como o recorte novo da G8.
- **Canvas**: cor, raio, forma (modo formas), fonte e legenda vêm prontos no nó; a mola
  e o tracejado vêm do tipo da relação; o chip da aresta em destaque mostra o **tipo**
  (como o Browser); o **tooltip** mostra o texto completo do nó quando ele diz mais que
  a legenda (Habilidade e ObjetoConhecimento), quebrado em até 4 linhas de 300 px —
  uma linha tem o mesmo visual de antes. A chave do cache de cores passou a incluir
  todos os tokens `--no-*` que o canvas usa. **Física, câmera, tempos e a
  renderização sob demanda: intocados** (só a tabela de molas mudou, D3/D4).
- **Pill de resumo**: `N nós · M relações · X ms`. Zoom/paleta/resumo aparecem quando
  há nós (a guarda `temGrafo` da N3).
- **Painel do resultado recolhível**: com nós para desenhar, ele abre **recolhido** —
  só a barra de abas no rodapé do palco, para não cobrir o desenho; clicar numa aba
  ou em "Abrir" abre. Sem nós (ex.: `RETURN 1`), abre aberto, na tabela.
- **"Voltar ao início"** limpa o palco (resultado e desenho).
- **Ajuste pedido pelo autor (mesmo dia):** a barra Tabela/Relações/JSON fica no
  **topo** do palco (logo abaixo do console), não no rodapé — recolhida é só a barra;
  aberto, o painel desce a partir dela. Com a barra lá, zoom, resumo e "Desfazer"
  descem para baixo dela (`topoOverlays`: 66 px em vez de 14). E a aba **"Grafo"
  passou a se chamar "Relações"** (id `relacoes`).
- **2.º ajuste do autor:** a 1.ª aba agora é **"Grafo" = o próprio desenho do canvas**
  (Grafo · Tabela · Relações · JSON). Com ela escolhida o painel fica fechado (só a
  barra); as outras abas o abrem. Abrir e fechar são **animados pela altura** (0,3 s;
  classe `.eg-resultado-caixa`): o painel desce a partir da barra e sobe de volta até
  ela — o conteúdo continua montado enquanto fecha (o painel o corta) e fica
  `aria-hidden` fechado. Sem animação no modo "Desativar animações" (`semAnim`, D6) e
  com `prefers-reduced-motion`. Saiu o botão "Recolher/Abrir" (a aba Grafo faz o
  papel). A escolha **sobrevive às execuções** (começa em Grafo); só uma consulta sem
  nós abre o painel sozinha, na última aba de conteúdo usada.

Desvios do plano:
- **Formas no canvas antecipadas da N6**: como `tracarNo` decidia a forma pelo tipo do
  mock, com os rótulos novos o modo formas viraria "tudo triângulo"; a forma já entra
  na tabela de estilo (com o **losango**, novo, para o 4.º rótulo). Continuam na N6:
  paletas CUD para os 4 rótulos (hoje a paleta de daltonismo só recolore a
  Habilidade), as formas nos pontinhos DOM (`.eg-no-*`) e a legenda.
- O card **"vazio"** saiu do `GrafoEstados` (nenhum estado o aciona; consulta sem nós
  abre o resultado na tabela). Sai também o estado `contagens` da página (contava os 3
  tipos do mock; o resumo usa o tamanho do grafo).
- Clique num nó ainda **não** seleciona nem abre o painel (o `selecionar` só conhece
  nós do mock — N7) e o **2×clique não expande** (a prop `onExpandir` não é passada até
  a N8, para não chamar o mock).

**Decisões para o autor** (previstas no plano; valores atuais escolhidos pelo
assistente, ajustáveis numa linha da tabela de estilo depois de ver o desenho): os
comprimentos de mola acima; e o atalho `DESENVOLVE_HABILIDADE` desenhado **igual às
outras setas**, fiel ao Browser (alternativa: `tracejado: true` para ficar discreto).
Ficaram os valores atuais (etapa finalizada pelo autor em 2026-10-15).

Verificado: `npm run lint` (0/0), `npm run build` (JS 282,02 → **283,29 kB**; CSS 8,81 →
8,97 kB) e `npm run dev` (os 5 módulos alterados servidos com 200). Testes do assistente
**sem instalar nada** (Vite e React do projeto, no Node, contra servidor temporário), 14
casos: estilo dos 4 rótulos com nós reais (forma, raio, anel, legenda, tooltip — a
descrição de objeto de conhecimento encurtada em 28 caracteres), rótulo desconhecido,
nó sem rótulo nem propriedades, nó com dois rótulos, molas e padrão de 150, tokens nos
**dois temas**, árvore inteira sem nenhum nó caindo no padrão, painel recolhido/aberto
e estados do palco sem o card vazio. **O desenho no canvas só roda no navegador —
teste do autor: feito** (itens acima: a árvore lado a lado com o Browser, arrastar,
pan, zoom, hover/tooltip, tema escuro, A/A, sem animação, repetir a consulta;
confirmado em 2026-10-15).

---

#### N6 — Tipos novos: cores, formas, paletas e legenda

**Objetivo:** a acessibilidade da D6 volta a valer para os rótulos do modelo novo.

**O que fazer:**
- [src/data/paletas.js](src/data/paletas.js): paletas CUD (Okabe & Ito) com uma cor
  por rótulo — o conjunto tem 8 cores, sobra espaço para os 4 — em protanopia,
  deuteranopia e tritanopia. O efeito da paleta e a chave do cache de cores do
  canvas passam a cobrir **todos** os tokens `--no-*`.
- Modo formas: uma forma por rótulo (ex.: círculo, quadrado, triângulo, losango) no
  canvas e nas classes `.eg-no-*` com `data-formas`.
- Legenda "Tipos de nó": lista os rótulos **presentes no resultado**, com contagem.
  Ocultar um rótulo passa a ser feito no próprio canvas, sem reconsultar (uma
  consulta Cypher qualquer não tem como ser refiltrada automaticamente). Rever a
  **D7**: no modelo novo, ocultar Habilidade não esvazia o grafo.
- O `OpcoesAcessibilidade` (compartilhado com o perfil) mostra os rótulos novos — o
  `GrafoPerfil.jsx` em si não muda.

**Como testar (autor):** cada paleta recolore canvas e legenda; as formas trocam no
canvas e nos pontinhos; ocultar/mostrar cada rótulo pela legenda; tudo persiste ao
recarregar.

**Pronto quando:** paletas, formas, sem-animação e legenda funcionam com os 4
rótulos.

**Feito (2026-10-13).** Alterados [src/data/paletas.js](src/data/paletas.js),
[src/data/estiloGrafo.js](src/data/estiloGrafo.js) (`estiloNo()`),
[GrafoOverlays.jsx](src/components/grafo/GrafoOverlays.jsx),
[Grafos.jsx](src/pages/Grafos.jsx) e [index.css](src/index.css). **D15** registrada no
[guia/DECISOES.md](guia/DECISOES.md) (a D7 ganhou a nota "revista pela D15").
`GrafoPerfil.jsx` não mudou (ele só repassa as props do `OpcoesAcessibilidade`).

Como ficou:
- **Paletas** indexadas pelo token de cada rótulo e **escolhidas por simulação**: para
  cada deficiência, o grupo de 4 cores do CUD com a maior diferença perceptual
  mínima (ΔE CIE76 em CIELAB) depois de simular a deficiência (Machado, Oliveira e
  Fernandes, 2009); preto e amarelo fora da disputa (somem no escuro e no creme).

  | Paleta | Ano | UnidadeTematica | ObjetoConhecimento | Habilidade | ΔE mín. simulado |
  |---|---|---|---|---|---|
  | Protanopia | vermelhão `#D55E00` | laranja `#E69F00` | verde-azulado `#009E73` | azul `#0072B2` | 25,2 |
  | Deuteranopia | vermelhão `#D55E00` | azul-céu `#56B4E9` | verde-azulado `#009E73` | azul `#0072B2` | 24,9 |
  | Tritanopia | roxo-avermelhado `#CC79A7` | azul-céu `#56B4E9` | azul `#0072B2` | vermelhão `#D55E00` | 24,8 |

  Os piores grupos de 4 do mesmo conjunto ficam em 16–21; uma paleta única para as 3
  deficiências chegaria a 20,7. Todas ficam ≥ 19,8 contra o cinza dos rótulos sem
  estilo (que as paletas não trocam). O efeito da página escreve e limpa exatamente os
  tokens da paleta.
- **Tokens de fábrica**: cada rótulo tem `--no-X-padrao` (claro e escuro) e o `--no-X`
  aponta para ele; a paleta sobrescreve o `--no-X` no `<html>`, e a amostra "Padrão"
  lê o `-padrao` — mostra as cores de fábrica (do tema atual) mesmo com outra paleta
  ativa, sem hexadecimal repetido no JS.
- **Formas nos pontinhos DOM**: classes **por forma** (`.eg-forma-circulo/quadrado/
  triangulo/losango` + `data-formas`), não por tipo — servem a rótulos futuros. As
  `.eg-no-*` do mock ficam enquanto o painel (N7) e a barra antiga (N10) as citam.
- **Legenda "Tipos de nó"** (canto inferior direito, com nós na tela): os rótulos
  **presentes no grafo**, na ordem em que aparecem, com cor, forma e contagem; clicar
  oculta/mostra **só no desenho** (`aria-pressed`; oculto fica riscado e esmaecido).
  A página entrega ao canvas o `grafoVisivel` (`useMemo`): mesmos objetos de nó, sem
  os ocultos e sem as relações que tocam neles — nada é reconsultado, a física segue
  com os mesmos nós e quem volta reaparece no mesmo lugar. **Todos os rótulos são
  alternáveis** (revê a D7). A chave das arestas mostra a linha contínua e, se algum
  tipo da tela for tracejado na tabela de estilo, a tracejada com os nomes.
- O resumo mostra os números **visíveis** (`… · N ocultos` quando há). Os ocultos
  valem na sessão (sobrevivem a novas consultas; "Voltar ao início" limpa); não vão
  para o `edugraphPrefs` — são estado de visualização, não preferência.
- **Amostras** do popover/perfil: 4 pontinhos por paleta (cor + forma de cada
  rótulo); o botão-swatch da coluna de zoom virou 4 círculos com as cores atuais;
  texto do toggle: "círculo, quadrado, triângulo e losango".

Verificado: `npm run lint` (0/0), `npm run build` (JS 283,22 → **286,09 kB**; CSS
9,16 → 9,73 kB) e `npm run dev`. Testes do assistente sem instalar nada (Vite e React
do projeto, no Node), 6 casos: legenda com os 4 rótulos (cor, forma, contagem,
Habilidade oculta e alternável, sem o selo "fixo"), chave tracejada só quando algum
tipo pede, 16 amostras de paleta com o "Padrão" lendo os tokens de fábrica, botão com
4 círculos, cada paleta cobrindo os 4 rótulos com 4 cores distintas, e tokens de
fábrica nos dois temas + regras de forma no CSS. A escolha das paletas veio de um
script de simulação (as contas estão na D15 e no cabeçalho do `paletas.js`). **Teste
do autor: feito** (itens acima: cada paleta recolore canvas, legenda e amostras; formas
no canvas e nos pontinhos; ocultar/mostrar cada rótulo; recarregar mantém paleta,
formas e sem-animação; confirmado em 2026-10-15).

---

#### N7 — Painel de detalhe com dados reais

**Objetivo:** clicar num nó abre o painel com o que o Neo4j sabe dele — como o
inspetor do Browser.

**O que fazer:**
- `selecionar(id)` usa o nó do grafo atual (sai o `NOS.get` do mock): rótulo,
  legenda e **todas as propriedades** (genérico — o modelo ainda vai crescer).
- Conexões por Cypher (`MATCH (n)-[r]-(m) WHERE elementId(n) = $id RETURN r, m`),
  agrupadas por tipo e direção, com contagem; item que está no grafo → seleciona e
  centra; fora → "+ expandir" (passa a funcionar na N8).
- "Vistos por último" guardam id + legenda + rótulo (o nó pode sair do grafo).
- Saem os blocos específicos do mock (pills ano/eixo/área, "Texto normativo — BNCC
  Computação"). Os links de fonte oficial e o texto do assistente ("consulta
  SPARQL") ficam para o autor decidir na etapa.

**Como testar (autor):** com a árvore na tela, o Ano `EF1` mostra 27 conexões,
"Números" 7 e `EF01MA17` 2; as propriedades são iguais às do Browser; clicar numa
conexão navega; arrastar, redimensionar e esconder o painel continuam funcionando.

**Pronto quando:** o painel mostra dados reais nos 4 rótulos.

**Feito (2026-10-13).** Arquivos novos [src/data/vizinhanca.js](src/data/vizinhanca.js)
(`conexoesDoNo`, `retratoDoNo`) e [src/components/grafo/PontoNo.jsx](src/components/grafo/PontoNo.jsx)
(o pontinho de rótulo, agora compartilhado entre legenda/amostras e painel);
alterados [GrafoPainel.jsx](src/components/grafo/GrafoPainel.jsx),
[Grafos.jsx](src/pages/Grafos.jsx), [GrafoOverlays.jsx](src/components/grafo/GrafoOverlays.jsx)
e [index.css](src/index.css) (só comentários). O `GrafoPainel` não importa mais
nada do mock.

Como ficou:
- **Clique num nó** abre o painel com o **retrato** do nó: rótulo principal (+ os
  outros rótulos, se houver), o texto completo como título (ex.: "EF01MA17 —
  Reconhecer…"), **todas as propriedades** numa lista chave/valor (genérico — o
  modelo ainda vai crescer) e o `elementId` no fim, como o inspetor do Neo4j
  Browser.
- **Conexões** consultadas no Neo4j (`MATCH (n)-[r]-(m) WHERE elementId(n) = $id
  RETURN r, m`, até 200 — passando, aparece "200+"), agrupadas por **tipo e
  sentido**: primeiro as que **saem** (`→ TEM_OBJETO`), depois as que **chegam**
  (`← TEM_UNIDADE`); itens em ordem de legenda (EF01MA01 antes de EF01MA02). Carregando
  e erro aparecem dentro do painel (o erro não derruba o palco). Canal `'painel'`:
  clicar em outro nó cancela a consulta anterior.
- **Item da conexão**: no desenho → seleciona e centra; **oculto** pela legenda ou
  **fora do desenho** → abre o detalhe dele no painel (chip "oculto" / "fora do
  desenho"). Com isso o painel navega pelo banco além do que está desenhado. A N8
  troca o "fora do desenho" por expandir até o nó, como o protótipo.
- **Seleção fora do desenho**: o painel pode mostrar um nó que não está no canvas, mas
  o canvas só recebe a seleção se o nó estiver **visível** (`selecionadoNoDesenho`) —
  um id que não está lá faria o canvas esmaecer todo o resto. Pelo mesmo motivo,
  ocultar pela legenda o rótulo do nó aberto agora só tira o anel; o painel continua.
- **"Vistos por último"** guardam o retrato (id, rótulos, propriedades, visual) — o nó
  pode sair do grafo e continua reabrível.

Decisões tomadas na etapa (o plano as deixava para o autor; mudam numa linha):
- **Fonte oficial**: os dois links da BNCC Computação saíram; ficou um só, **"BNCC —
  Base Nacional Comum Curricular (MEC)"** (`http://basenacionalcomum.mec.gov.br/`),
  mostrado só para os rótulos da tabela de estilo (o modelo da BNCC montado pela
  orientadora) — rótulo sem estilo não ganha o link.
- **Assistente** (placeholder): "consulta SPARQL" → **"consulta Cypher"**; o exemplo
  do campo virou "que habilidades do 1.º ano tratam de medidas de tempo?".
- Saíram os blocos do mock: código em destaque, pills ano/eixo/área e "Texto
  normativo — BNCC Computação" (a descrição agora está nas propriedades).

Desvios do plano:
- **A expansão do mock saiu já na N7**: sem o botão do painel e sem o 2×clique (N5), o
  `expandir` ficou sem chamador e o lint não aceita código morto — saiu com o
  `URI_PARA_ID` e as constantes `ATRASO_POS_EXPANSAO` (250 ms) e
  `HISTORICO_EXPANSAO_MAX` (10). **A N8 reescreve a expansão em Cypher e traz as duas
  constantes de volta** (valores do protótipo; o original está no git). O
  `desfazerExpansao` e o histórico ficaram (genéricos). O botão "Expandir conexões
  deste nó" só aparece quando a página passa `aoExpandir` (N8).
- O cheat-sheet ainda diz "2× clique — expande as conexões do nó" (texto do
  protótipo): vale de novo na N8.

Verificado: `npm run lint` (0/0), `npm run build` (JS 286,09 → **281,36 kB** — saíram o
detalhe e a expansão do mock; CSS 9,73 kB idêntico) e `npm run dev`. Testes do
assistente sem instalar nada (Vite e React do projeto, no Node, contra servidor
temporário), 9 casos: **Ano `EF1` = 27** (→ DESENVOLVE_HABILIDADE 22 + → TEM_UNIDADE 5),
**"Números" = 7** (→ TEM_OBJETO 6 + ← TEM_UNIDADE 1), **`EF01MA17` = 2** (← DESENVOLVE 1 +
← DESENVOLVE_HABILIDADE 1), ordem por legenda e chaves únicas; retrato; e o painel
renderizado em HTML — cheat-sheet, detalhe com título, todas as propriedades,
`elementId`, grupos com setas e contagens, chips "oculto"/"fora do desenho", link da
BNCC, sem botão de expandir sem `aoExpandir`; carregando, erro e "sem conexões"; rótulo
sem estilo (sem link, outros rótulos como chips); vistos. **Teste do autor: feito**
(itens acima: os 3 nós com 27/7/2 conexões, propriedades iguais às do Browser,
navegação pelas conexões, arrastar/redimensionar/esconder o painel; confirmado em
2026-10-15).

---

#### N8 — Expandir e desfazer com Cypher

**Objetivo:** o grafo volta a crescer a partir de um nó (2×clique, botão do painel,
"+ expandir"), agora pelo Neo4j.

**O que fazer:**
- `expandir(id)`: `MATCH (n)-[r]-(m) WHERE elementId(n) = $id RETURN r, m`, com
  limite de vizinhos (o Browser clássico usa 100); o resultado é fundido pela
  extração da N4 (sem repetir), os nós novos nascem a 90 px da origem,
  `reaquecer(0.8)` sem re-enquadrar, e o histórico do Desfazer continua como hoje.
- Com "conectar nós" ligado, aparecem também as relações entre os nós novos e os
  que já estavam na tela (como no Browser).

**Como testar (autor):** rodar `MATCH (h:Habilidade {codigo:'EF01MA17'}) RETURN h`
(1 nó) → o 2×clique traz o objeto de conhecimento "Medidas de tempo" e o Ano (+2
nós) → expandir o objeto traz a unidade temática e as habilidades irmãs `EF01MA16` e
`EF01MA18`, já ligadas ao Ano → "Desfazer ×N" volta cada passo; uma nova consulta
zera o histórico; a câmera não re-enquadra ao expandir.

**Pronto quando:** os 3 caminhos de expansão e o desfazer funcionam com dados reais.

**Feito (2026-10-15).** Alterados [src/data/vizinhanca.js](src/data/vizinhanca.js)
(`expandirNo`, `LIMITE_VIZINHOS`), [Grafos.jsx](src/pages/Grafos.jsx),
[GrafoPainel.jsx](src/components/grafo/GrafoPainel.jsx) e
[ResultadoCypher.jsx](src/components/grafo/ResultadoCypher.jsx) (só comentário).
Decisão do autor na etapa: **manter o comportamento do Neo4j Browser — toda expansão
consulta o banco** (foi oferecido reaproveitar as conexões que o painel já buscou para
poupar a 1.ª consulta; recusado).

Como ficou:
- **`expandirNo(id, idsNaTela, { conectar })`**: (1) os vizinhos do nó — a mesma
  consulta do painel, com limite de **100** (o "Max Neighbours" do Browser); (2) com a
  chave "Conectar nós do resultado" ligada e algum nó novo, as relações entre os
  **nós que chegaram** e **todos os da tela** (`MATCH (a)-[r]-(b) WHERE elementId(a)
  IN $novos AND elementId(b) IN $todos RETURN r` — o padrão sem sentido acha cada
  relação a partir do lado novo). No máximo **2 consultas por expansão**; sem nó novo, a
  2.ª é pulada. Os "nós da tela" incluem os ocultos pela legenda.
- **Fusão na página** (`expandir`): nós novos nascem a **90 px** da origem
  (`DISTANCIA_NASCIMENTO`), relação já desenhada ou com ponta de fora é descartada,
  `reaquecer(0.8)` **sem re-enquadrar**, snapshot para o **Desfazer** (até 10) — fiel à
  G8. As constantes `ATRASO_POS_EXPANSAO` (250 ms) e `HISTORICO_EXPANSAO_MAX` (10),
  tiradas na N7, voltaram. O nó do canvas e a aresta saem dos mesmos `noDoCanvas`/
  `arestaDoCanvas` do `montarGrafo` (extraídos, sem mudar o comportamento dele).
- **Os 3 caminhos**: **2×clique** num nó (seleciona + expande); botão **"Expandir
  conexões deste nó"** no painel; item **"+ expandir"** de uma conexão fora do desenho
  (expande o nó do painel e, ~250 ms depois, seleciona e centra o alvo; se ele não
  chegou — ex.: além dos 100 —, abre o detalhe dele). Botão e "+ expandir" só aparecem
  com o nó do painel **no grafo**; um nó aberto a partir de uma conexão, fora do
  desenho, mostra "fora do desenho" (não tem de onde crescer).
- **Falha de expansão** aparece no painel, embaixo do botão ("Não foi possível
  expandir: …"), **sem derrubar o palco** (desvio da G8, que abria o card de erro e,
  com ele, o "Voltar ao início" apagaria o grafo); trocar de nó limpa o aviso.
- Consulta nova no console invalida a expansão em voo (guarda `seq`) e zera o
  histórico, como o recorte novo da G8. As abas Tabela/Relações/JSON continuam
  descrevendo a resposta da **consulta**; o que a expansão acrescenta aparece no
  desenho, no resumo e na legenda.

Verificado: `npm run lint` (0/0), `npm run build` (JS 281,36 → **283,52 kB**; CSS
idêntico) e `npm run dev`. Testes do assistente sem instalar nada (Vite do projeto, no
Node, contra servidor temporário) — o **cenário do plano** com a consulta real e a
mesma fusão da página: (1) `EF01MA17` sozinha → expandir traz o objeto "Medidas de
tempo" e o Ano (+2 nós, 2 relações, 2 consultas); (2) expandir o objeto → "Grandezas e
medidas", `EF01MA16` e `EF01MA18` (6 nós, **8 relações**, todas as 4 do Ano presentes);
(2b) o mesmo com a chave **desligada** → 5 relações e 1 consulta só; (3) expandir de
novo quem já está todo na tela → nada muda e o "conectar" é pulado; limite de 100
conferido (o Ano traz os seus 27). E o painel renderizado: "+ expandir" e botão só com
o nó no grafo, "fora do desenho" sem, "Expandindo…" e o aviso de erro. **Teste do
autor: feito** (itens acima: 2×clique, botão, "+ expandir", Desfazer ×N, nova consulta
zera o histórico, a câmera não re-enquadra; confirmado em 2026-10-15).

---

#### N9 — Home com dados do Neo4j

**Objetivo:** os números e a grade da Home deixam de vir do mock.

**O que fazer:**
- Banda de estatísticas ([StatsBand.jsx](src/components/StatsBand.jsx)): consultas
  de agregação (ex.: `MATCH (h:Habilidade) RETURN count(h)`) carregadas de forma
  assíncrona; a contagem animada só começa quando o dado chega; Neo4j fora do ar →
  estado discreto ("—"), sem quebrar a página.
- Grade "Encontre as habilidades da sua turma": habilidades por `Ano`, via Cypher.
- **Decisões do autor na etapa** (o modelo atual não tem componente curricular):
  - o 2.º número da banda ("componentes curriculares conectados") vira outra
    métrica do modelo ou espera o nó de componente;
  - o balão de matérias (`MateriaPopover`) e o "Ver o grafo desta turma" dependem de
    componente curricular **e** dos filtros novos → esconder até lá, ou abrir a
    página de grafos com uma consulta do ano já preenchida no console.
- O `depoimentos.js` é conteúdo editorial, não dado do grafo — fica.

**Como testar (autor):** a banda mostra 22 habilidades e o 1.º ano; a grade mostra o
1.º ano com 22 habilidades; com o Neo4j parado, a Home abre normalmente.

**Pronto quando:** nenhum número da Home vem do mock.

**Feito (2026-10-15).** Arquivo novo [src/data/resumoGrafo.js](src/data/resumoGrafo.js)
(`estatisticasDoGrafo`, `anosDoGrafo`, `numeroDoAno`); alterados
[StatsBand.jsx](src/components/StatsBand.jsx),
[TestimonialsSection.jsx](src/components/TestimonialsSection.jsx),
[GradeCard.jsx](src/components/GradeCard.jsx),
[MateriaPopover.jsx](src/components/MateriaPopover.jsx), [App.jsx](src/App.jsx),
[Grafos.jsx](src/pages/Grafos.jsx) e [ConsoleCypher.jsx](src/components/grafo/ConsoleCypher.jsx).
**D16** registrada no [guia/DECISOES.md](guia/DECISOES.md) (a D10 ganhou a nota
"revista pela D16"). **A Home não importa mais nada do mock.**

Decisões do autor na etapa (perguntadas antes de implementar):
- **Banda**: o 2.º número vira **"unidades temáticas conectadas"** (no lugar de
  "componentes curriculares", que o modelo não tem); os anos mostram só o que o grafo
  tem — hoje **"1.º ano"** ("ano do fundamental disponível agora").
- **Grade**: **um card por Ano** do grafo (hoje só EF1), com **só o `nome` do nó**
  ("1º Ano") em destaque. **Balão sem matérias** — só "Ver o grafo desta turma", que
  abre a página de grafos já executando `MATCH p = (:Ano)-[:DESENVOLVE_HABILIDADE]->
  (:Habilidade) RETURN p` (o exemplo "ano direto p habilidade"). As matérias voltam
  quando o grafo tiver componente curricular; EF2, EF3… viram cards novos sozinhos.

Como ficou:
- **Consultas** (`resumoGrafo.js`): a banda numa só —
  `RETURN COUNT { (:Habilidade) }, COUNT { (:UnidadeTematica) }, COLLECT { MATCH
  (a:Ano) RETURN a.codigo }` (a compreensão de padrão `[(a:Ano) | …]` não serve: exige
  uma relação); a grade — `MATCH (a:Ano) RETURN a.codigo, a.nome`, em ordem de ano.
  O número do ano sai do código (`EF1` → 1): o modelo não o guarda como propriedade.
- **Banda**: carrega ao montar; a contagem animada só começa quando o dado **chegou e**
  a faixa está visível; um ano só → conta "0.º ano" → "1.º ano"; vários → "1.º – N.º
  ano" (o último conta, como antes). Neo4j fora do ar → "—" e a página segue.
  **Ajuste pedido pelo autor (mesmo dia):** a 1.ª versão mostrava "1.º ano" fixo, sem
  animar; agora conta. Como é um passo só, usa `Math.floor` em vez de `Math.round`
  (que viraria na metade dos 1,4 s, rápido demais): o "1" aparece no fim da
  animação, quando habilidades e unidades já chegaram aos valores finais.
- **Grade**: carrega ao montar; Neo4j fora → "Não foi possível carregar as turmas
  agora." no lugar dos cards.
- **"Ver o grafo desta turma"** → `onGrafos({ consulta })`: o App guarda a consulta e a
  entrega à página de grafos (`consultaInicial`), que a escreve no console e a executa
  ao abrir. Qualquer outra navegação zera (os links que chamam `onGrafos` direto do
  `onClick` passam o evento — o App só aceita `consulta` do tipo texto). Substitui o
  deep-link antigo `?serie=&disciplina=` (que a página não lê desde a N3; o código de
  URL do App sai na N10).
- O `depoimentos.js` continua (conteúdo editorial). As classes `.eg-materia-chip`
  ficam no CSS para quando as matérias voltarem.

Verificado: `npm run lint` (0/0), `npm run build` (JS **283,87 kB**; CSS idêntico) e
`npm run dev`. Testes do assistente sem instalar nada (Vite e React do projeto, no Node,
contra servidor temporário), 5 casos: a consulta da banda devolve **22 habilidades, 5
unidades temáticas e o ano 1**; a da grade, só **EF1 "1º Ano"**; o número do ano a
partir do código; a banda renderizada antes do dado (ou sem Neo4j) com "—" e os rótulos
novos; e o card ("1º Ano" e nada mais) com o balão só com o botão, sem chips de
matéria. **Teste do autor: feito** (confirmado em 2026-10-15): a banda mostra 22 · 5 ·
1.º ano; a grade mostra o
card "1º Ano"; o botão abre a página de grafos já com o grafo da consulta; com o Neo4j
parado, a Home abre normalmente.

---

#### N10 — Remoção do mock

**Objetivo:** o site deixa de ter dados locais do grafo.

**Decisões do autor antes da etapa:**
- `GrafoFiltros.jsx`: apagar (o desenho continua no protótipo e no histórico do git)
  ou guardar como referência para o redesenho dos filtros;
- `GrafoPerfil.jsx` importa anos e matérias do mock: remover as contas antes
  (roadmap próprio) ou adiar a remoção do mock até lá.

**O que fazer:**
- `grep` de `mockFuseki` até zerar; apagar `src/data/mockFuseki.js`.
- A gaveta "SPARQL" vira gaveta **Cypher**: mostra a última consulta que o site
  executou por conta própria (conectar nós, conexões, expansão), com parâmetros e
  tempos. Sai o "Simular falha (HTTP 503)" — era recurso do mock; as falhas agora são
  reais.
- Sai o fluxo de filtros antigo que ficou sem uso (seleção pendente, prévia de
  vértices, `?serie=` na URL, busca do mock) e o deep-link correspondente no
  [App.jsx](src/App.jsx).

**Como testar (autor):** `grep -r mockFuseki src` vazio; `npm run build` sem erro;
repetir os testes da N3, N5, N7, N8 e N9.

**Pronto quando:** zero referências ao mock e todas as telas funcionando.

**Feito (2026-10-15).** Apagados `src/data/mockFuseki.js` e
`src/components/grafo/GrafoFiltros.jsx` (recuperáveis no git: estão no commit
`05a1894`, ex.: `git show 05a1894:src/components/grafo/GrafoFiltros.jsx`); alterados
[neo4j.js](src/data/neo4j.js), [extrairGrafo.js](src/data/extrairGrafo.js),
[vizinhanca.js](src/data/vizinhanca.js), [resumoGrafo.js](src/data/resumoGrafo.js),
[GrafoOverlays.jsx](src/components/grafo/GrafoOverlays.jsx),
[GrafoPerfil.jsx](src/components/grafo/GrafoPerfil.jsx), [Grafos.jsx](src/pages/Grafos.jsx),
[App.jsx](src/App.jsx) e [index.css](src/index.css). **D17** registrada no
[guia/DECISOES.md](guia/DECISOES.md) (a D1 ganhou a nota "encerrada pela D17"; a D2,
"revista pela D17"). **`grep -r mockFuseki src` vazio.**

Decisões do autor na etapa (perguntadas antes de implementar):
- **`GrafoFiltros.jsx`: apagar.** O redesenho dos filtros vai ser sobre o modelo novo;
  o código antigo fica no histórico do git. (A pasta `design/`, com os protótipos, já
  estava apagada na cópia local do autor.)
- **Perfil: tirar tudo o que usava o mock** — *"não quero que nenhuma informação (se
  não consultas para serem feitas via API) seja guardada como feito no mock"*. O perfil
  **continua** no header, com a identidade e as **opções de acessibilidade**; a seção
  **"Minhas turmas" saiu inteira**.

Como ficou:
- **Gaveta Cypher** (`GavetaCypher`, no lugar da `GavetaSparql`): botão "Cypher" no canto
  inferior direito, à esquerda da legenda (ou no canto, sem legenda); aparece com o
  palco no estado "pronto". Lista as **10 últimas consultas que o site fez sozinho**, a
  mais recente em cima: para que serviu (*pontas das relações do resultado*, *conectar
  nós do resultado*, *conexões do nó (painel)*, *expandir · vizinhos*, *expandir ·
  conectar os novos*), linhas que voltaram (ou o código do erro), tempo e hora; embaixo,
  o texto Cypher e os parâmetros como comentários (`// $id = "4:…"`; lista longa mostra
  os 3 primeiros e "… +N"). O ponto do botão fica dourado se a última falhou. Saiu o
  "Simular falha (HTTP 503)". A consulta do console **não** entra (já está escrita no
  console).
- **Como a gaveta sabe das consultas:** o `neo4j.js` ganhou `observarConsultas()` —
  toda consulta concluída (com resposta ou com erro; cancelada não) é anunciada com
  `{ descricao, consulta, parametros, ms, linhas, erro }`, e `executarCypher` aceita a
  opção `descricao`. A gaveta se inscreve sozinha e guarda a lista no próprio estado:
  uma consulta nova re-renderiza só ela (o cuidado da P4). Fica sempre montada — só
  escondida fora do "pronto" — para não perder as consultas que rodam enquanto o palco
  carrega.
- **Perfil:** identidade + "Alterar senha" + "Acessibilidade · cores do grafo". Na
  página saíram o estado `turmas`, os rótulos de turma e o campo `turmas` das
  preferências salvas (`localStorage['edugraphPrefs']` agora guarda só paleta, formas,
  sem animação e posição do painel; um valor antigo de `turmas` é ignorado e some na
  próxima gravação).
- **App:** saiu o deep-link do mock (`?serie=&disciplina=…` abria a página de grafos e
  era limpo da URL ao sair); o site sempre abre na Home. O link para os grafos volta com
  os filtros novos.
- **CSS:** saíram as regras que só o código apagado usava (`.eg-grafo-busca`,
  `.eg-grafo-sugestao`, `.eg-grafo-pill`, `.eg-no-*`, `.eg-turma-*`, os tokens
  `--no-conceito`/`--no-disciplina` e o nível `60` da escala de z-index); `.eg-grafo-sparql`
  virou `.eg-grafo-cypher`. As `.eg-materia-chip` ficam (as matérias voltam com o
  componente curricular — N9).

Verificado: `npm run lint` (0/0), `npm run build` (JS **270,64 kB**, era 283,66 kB sem
o mock no bundle; CSS 8,67 kB) e `npm run dev`. Testes do assistente sem instalar nada
(Vite e React do projeto, no Node, contra servidor temporário), 12 casos: o anúncio de
uma consulta (descrição, texto, parâmetros, linhas, tempo); a do console chega sem
descrição; erro de sintaxe é anunciado com o código e a promessa ainda rejeita; a
consulta **cancelada** não é anunciada; cancelar a inscrição funciona; completar
`RETURN r` de TEM_UNIDADE anuncia *pontas* (6 ids, 6 linhas) e *conectar*; painel e
expansão do EF1 anunciam *conexões do nó* (`$limite = 201`, 27 linhas), *vizinhos* e
*conectar os novos* (27 novos); o perfil aberto tem identidade, "Alterar senha" e
acessibilidade, sem turmas nem selects; a gaveta escondida fora do "pronto" e, visível,
com o botão "Cypher" fechado; a página de grafos e o App renderizam sem o mock; nenhum
arquivo de `src/` cita o mock. **Teste do autor: feito** (abaixo; confirmado em
2026-10-15).

**Teste do autor (feito):** `grep -r mockFuseki src` vazio; repetir os testes da N3, N5, N7, N8 e
N9; e, na gaveta Cypher: rodar "arvore completa" → abrir "Cypher" → aparece *conectar
nós do resultado*; clicar num nó → *conexões do nó (painel)*; 2×clique → *expandir ·
vizinhos* (+ *conectar os novos*, se trouxe nós); `MATCH ()-[r:TEM_UNIDADE]->() RETURN r`
→ *pontas das relações do resultado*. No perfil: só identidade, "Alterar senha" e
acessibilidade.

---

#### N11 — Física igual à do Neo4j Browser + layout hierárquico

*Planejada em 2026-10-15.*

**Objetivo:** o grafo da página de grafos se comporta como o do Neo4j Browser:
(1) a física passa a ser a do layout **"Force-based"** do Browser; (2) a página ganha o
**"Hierarchical layout"**, com o mesmo algoritmo e os mesmos parâmetros, e um seletor
entre os dois, como o do Browser.

**De onde vêm os números.** Extraídos em 2026-10-15 do próprio Browser servido pelo
Neo4j 2026.09 do autor (`localhost:7474/browser/`) — a classe `d3ForceLayout` do pacote
de visualização (`vendor-neo4j-ndl`) e o worker `HierarchicalLayout`. O código foi só
**lido** (nada instalado). A implementação **reproduz parâmetros e comportamento, sem
copiar código do Browser**; as duas peças de código aberto que ele embute — **d3-force**
(licença ISC) na física e **dagre 0.8.14** (MIT) no hierárquico — podem ser portadas,
com a nota de licença. O Browser trabalha em pixels do dispositivo (multiplica as
distâncias pelo `devicePixelRatio`); o canvas daqui trabalha em pixels CSS, então
valem os números com `devicePixelRatio = 1`. O Browser oferece **só esses dois
layouts**, e o padrão é o de forças. (A física das telas de modelo de dados e de
importação do Browser é outra — repulsão −200, molas até 0,2 — e não vale aqui.)

**1. Física "Force-based" — Browser × hoje**

| | Neo4j Browser | EduGraph hoje (G5/N5) |
|---|---|---|
| Motor | d3-force: velocidade × 0,6 a cada passo (`velocityDecay` 0,4); alpha começa em 1 e para abaixo de 0,05, caindo ≈ 2,28% por passo (1 − 0,001^(1/300)) | alpha × 0,988 por quadro, para em 0,012; damping 0,86 |
| Repulsão | `forceManyBody`, força −400 (aproximação de Barnes–Hut, θ = 0,9) | min(2800/d², 12) · alpha, todos os pares |
| Colisão | `forceCollide`, raio = tamanho + 25 | centros a ≥ rA + rB + 10, empurrão 0,35 |
| Molas | `forceLink`: distância = tamA + tamB + 90; força = 1,2 / (min(gA, gB) + (max(gA, gB) − 1)/100), limitada a [0,06; 1] (g = nº de relações do nó) | comprimento por tipo de relação (150/130/120/280), força 0,028 |
| Centro | `forceX`/`forceY` para (0, 0), força 0,03 | gravidade 0,0045 |
| Tamanho do nó nas contas | 25 (padrão) | raios 19/16/13/11 (tabela de estilo) |
| 1.ª carga | nós sem posição num círculo de raio 45·√n; **pré-cálculo antes do 1.º desenho**: até 200 passos (ou 300 ms) com alpha fixo em 1 e repulsão dobrada (−800), depois até 100 ms com −400 até esfriar; o que sobrar anima | espiral de ângulo áureo por anel de rótulo; tudo animado; enquadra a 420 ms |
| Mudança no grafo (expansão) | reaquece para alpha 1 | reaquece para 0,8; nós novos a 90 px da origem |
| Arrastar um nó | o nó **fica preso onde foi solto** (`pinned`); reaquece para 0,2 | o nó volta à física ao soltar; reaquece para ≥ 0,25 |
| Aleatoriedade | gerador fixo (semente 1): a mesma entrada dá sempre o mesmo desenho | — |

**2. Layout hierárquico do Browser**
- Algoritmo **dagre** (desenho em camadas, de Sugiyama): ranqueamento `tight-tree`, de
  cima para baixo (`TB`), `nodesep` 75 e `ranksep` 75; cada nó ocupa uma caixa de
  tamanho × 2,63 (1/0,38) — 66 px com o tamanho 25. A NVL aceita outras direções e um
  2.º empacotamento, mas **a interface do Browser não os oferece** (fica `down`/`bin`).
- **Uma aresta por par de nós** (o sentido da 1.ª relação decide quem fica acima; laços
  ignorados). Na árvore: Ano no topo → unidades → objetos → habilidades.
- Relação que atravessa mais de um nível (ex.: o atalho `DESENVOLVE_HABILIDADE`,
  Ano → Habilidade) é desenhada **dobrada**, pelos pontos intermediários que o dagre
  calcula (pontos alinhados são removidos).
- Partes desconectadas (duas árvores, nós soltos): cada uma é arranjada sozinha e
  depois **empacotada** (`bin`): a maior primeiro, caixas com 100 px de folga.
- O grafo **não sai do lugar**: o resultado é deslocado para o centroide das posições
  anteriores, e a troca é uma **transição animada de 400 ms**. Sem física no
  hierárquico; o layout é refeito a cada mudança no grafo (consulta nova, expansão,
  desfazer).
- Seletor do Browser: dois botões com ícone, "Force-based layout" e "Hierarchical
  layout"; a escolha fica salva.

**O que fazer:**
- **Física** ([GrafoCanvas.jsx](src/components/grafo/GrafoCanvas.jsx)): trocar o
  `fisica()` pelo modelo da tabela (as cinco forças e o passo de simulação do d3-force,
  implementados aqui, com o gerador fixo), sem mexer no resto do motor: render sob
  demanda da P2 (o loop dorme quando alpha < 0,05 e nada mais se mexe), câmera,
  hit-test, HiDPI e a API imperativa (`reaquecer`, `assentar`, `enquadrar`…).
- **Semente e pré-cálculo** ([Grafos.jsx](src/pages/Grafos.jsx), `montarGrafo`): círculo
  de 45·√n no lugar da espiral por anel; pré-cálculo antes do 1.º desenho, como no
  Browser.
- **Hierárquico:** módulo novo `src/data/layoutHierarquico.js`, puro (sem React), que
  recebe nós e relações e devolve posições + pontos de dobra das arestas; o canvas faz
  a transição de 400 ms e desenha as arestas dobradas (conferir no Browser se a dobra é
  reta ou curva).
- **Seletor** na coluna de controles do palco (junto de +/−/recentrar e da paleta): dois
  botões, "Layout de forças" e "Layout hierárquico" (`aria-pressed`, ícones no espírito
  dos do Browser). A escolha vai para o `edugraphPrefs` (`layout`, validado no
  `lerPrefs`); o padrão é **forças**, como no Browser.
- **Tabela de estilo** ([estiloGrafo.js](src/data/estiloGrafo.js)): sai o comprimento de
  mola por tipo de relação (no Browser a distância depende do tamanho dos nós, não da
  relação); o tracejado fica.
- **Acessibilidade (D6):** "Desativar animações e física" → forças: pré-cálculo até
  esfriar, sem animar; hierárquico: salta para as posições, sem a transição.
- **DECISOES.md** (com parágrafo de monografia): **D18** — o motor deixa de ser fiel ao
  protótipo e passa a ser fiel ao Neo4j Browser (revê a **D3**, inclusive o argumento
  das "molas semânticas" do parágrafo de monografia, e a **D4**); e a forma escolhida
  para ter o dagre (item 1 abaixo).

**Decidir com o autor antes de implementar:**
1. **Como ter o dagre.** Só o mesmo algoritmo deixa o hierárquico *exatamente* igual:
   (a) **instalar o pacote** do dagre (MIT) — exceção às regras "sem dependência nova"
   e "sem biblioteca de grafos" (D3), e a instalação precisa da permissão do autor;
   (b) **trazer o código-fonte** do dagre para dentro do projeto, com a licença — sem
   `npm install`, mas ~3 mil linhas de terceiros no repositório; (c) escrever um
   hierárquico próprio — **não** fica idêntico. O empacotamento `bin` é um algoritmo
   pequeno (MIT) que dá para escrever aqui em qualquer opção. Conferir qual versão
   publicada corresponde à 0.8.14 que o Browser embute.
2. **Tamanho dos nós nas contas:** o Browser usa 25 para todos; os raios desenhados aqui
   são 19/16/13/11. Proposta: usar 25 nas contas (espaçamento idêntico ao do Browser)
   e manter o desenho atual — ou usar os nossos raios (grafo mais compacto, não
   idêntico).
3. **Nó arrastado fica preso** onde foi solto, como no Browser? Muda a sensação de hoje
   (ele volta para a física). Se sim, decidir como soltá-lo de novo.
4. **Expansão:** adotar também a câmera do Browser (100 ms depois, afasta só o
   necessário para caberem os nós novos, sem mover o centro) e o lugar onde os nós novos
   nascem — o Browser não dá posição a eles; **conferir lado a lado** de onde surgem.
5. **Consulta nova:** no Browser cada resultado começa do zero (1.ª carga com
   pré-cálculo); aqui os nós que já estavam na tela mantêm a posição (N5). E o enquadrar
   a 420 ms (D4): com o pré-cálculo o grafo já chega arrumado — enquadrar logo depois?
6. **Ocultar um rótulo pela legenda (N6) no hierárquico:** refazer o layout só com os
   visíveis (proposta) ou manter as posições.

**Fora do escopo** (observado no Browser e registrado): o 2×clique num nó já expandido
**recolhe** a expansão (lá é alternância; aqui existe o "Desfazer"); o visual dos nós do
Browser (tamanho 25, rótulo dentro do círculo); limites de zoom.

**Como testar (autor):** lado a lado com o Browser, nas 6 consultas válidas de exemplo,
nos **dois** layouts:
- **Forças:** mesma "cara" (espaçamento, forma da árvore, quem fica perto de quem); o
  grafo já aparece arrumado, sem "explosão" inicial; arrastar um nó (como decidido no
  item 3); 2×clique expande e acomoda como no Browser; repetir a consulta dá o mesmo
  desenho.
- **Hierárquico** ("arvore completa"): Ano no topo, depois as 5 unidades, os 17 objetos
  e as 22 habilidades, na mesma ordem dentro de cada nível que o Browser; o atalho
  `DESENVOLVE_HABILIDADE` dobrado como lá; trocar de layout anima em ~0,4 s e o grafo
  não pula de lugar; um resultado com partes soltas empacotado como no Browser.
- **Seletor:** troca nos dois sentidos; a escolha sobrevive ao recarregar; "Desativar
  animações" sem animação nos dois layouts; tema escuro; widget A/A; formas e paletas.
- **Medidor da P1** (dev): grafo parado = 0 desenhos/s nos dois layouts (o render sob
  demanda continua valendo).

**Pronto quando:** os dois layouts reproduzem o Browser nas consultas de exemplo, os
testes passam e a D18 (com a decisão do dagre) está registrada.

**Feito (2026-10-18).** Arquivos novos [src/data/simulacaoForcas.js](src/data/simulacaoForcas.js)
(a física) e [src/data/layoutHierarquico.js](src/data/layoutHierarquico.js) (o
hierárquico), os dois puros (sem React); alterados
[GrafoCanvas.jsx](src/components/grafo/GrafoCanvas.jsx), [Grafos.jsx](src/pages/Grafos.jsx),
[estiloGrafo.js](src/data/estiloGrafo.js) e [index.css](src/index.css). **D18**
registrada no [guia/DECISOES.md](guia/DECISOES.md) (a D3 e a D4 ganharam a nota
"revista pela D18").

Decisões do autor (perguntadas antes de implementar):
1. **Hierárquico próprio, sem dependência nova.** A versão do dagre que o Browser embute
   (0.8.14) não está publicada no npm; as publicadas são o `dagre` 0.8.5 e o
   `@dagrejs/dagre` 3.x, este com o algoritmo já bem mudado. Fica parecido, não idêntico.
2. **Tamanho 25 nas contas** (física e hierárquico), o padrão do Browser; o desenho
   mantém os raios da tabela de estilo (19/16/13/11).
3. **Nó arrastado fica preso** onde foi solto, como no Browser (que não oferece como
   soltar pela interface; uma consulta nova recomeça).
4. **Carga e expansão como no Browser:** consulta nova começa do zero (sem guardar
   posições), enquadra logo depois do pré-cálculo; na expansão os nós novos nascem na
   espiral do d3 perto do centro, a física reaquece em 1 e, 100 ms depois, a câmera
   afasta só o necessário.
5. (Proposta do plano, adotada) Ocultar um rótulo pela legenda no hierárquico refaz o
   layout só com os visíveis.

Como ficou:
- **Física idêntica à do Browser.** As cinco forças do d3-force (repulsão com
  Barnes–Hut, centro, colisão, molas com força pelo grau) e o passo da simulação foram
  escritos no projeto, com o gerador de semente fixa do d3. Prova: teste no Node que
  roda a MESMA entrada nesta física e no d3 extraído do próprio bundle do Browser (numa
  pasta temporária, fora do repositório) e compara as coordenadas — **diferença máxima
  de 0 px** na árvore completa (45 nós, 66 relações) depois do pré-cálculo e depois de
  60 passos de reaquecimento; idem sem o atalho `DESENVOLVE_HABILIDADE`, com 3 nós
  exatamente sobrepostos (exercita o desempate aleatório) e com um nó preso.
- **Consulta nova:** nós num círculo de raio 45·√n; pré-cálculo antes do 1.º desenho
  (até 200 passos ou 300 ms com alpha 1 e repulsão −800; depois até 100 ms com −400
  enquanto estiver quente); enquadra logo em seguida; o que sobrar anima. Saíram a
  espiral por "anel" de rótulo, o ruído aleatório, a posição mantida entre consultas e
  o enquadrar a 420 ms.
- **Expansão:** nós novos na espiral do d3 (10·√(0,5 + i), pelo índice), alpha 1, e
  `afastarParaCaber` 100 ms depois (sem mover o centro, sem aproximar; folga de 40 px de
  tela — valor nosso, o Browser não expõe o dele). **Desfazer:** alpha 1 (era 0,5).
- **Arraste:** no modo forças o nó fica preso (`fx/fy`) e a física reaquece em 0,2 (o
  Browser faz assim a cada movimento); no hierárquico o nó só se move.
- **Hierárquico** — as etapas do dagre (ciclos por DFS, níveis por caminho mais longo +
  árvore justa, nós fictícios nas arestas longas, ordem por baricentro com parada após 4
  varreduras sem melhora, x por Brandes–Köpf) com a configuração do Browser (de cima
  para baixo, 75/75, caixa de 65,8 px, uma aresta por par, partes soltas empacotadas,
  centroide preservado). Na árvore completa: **4 níveis** (1 Ano · 5 unidades · 17
  objetos · 22 habilidades), 140,79 px entre níveis, nenhuma sobreposição, as **22**
  relações `DESENVOLVE_HABILIDADE` dobradas (e só elas), centroide preservado, em 15 ms.
  Partes desconectadas: empacotadas sem sobreposição e sem dobras (como no Browser, que
  não aproveita os pontos nesse caso).
- **Transições** de 400 ms com a curva *smoothstep* do Browser: trocar de modo e refazer
  o hierárquico. **Voltar às forças** retoma as posições que elas tinham (o Browser
  guarda o estado da física); se o grafo chegou no hierárquico, as forças fazem a 1.ª
  carga na hora da troca; nós que chegaram durante o hierárquico nascem na espiral e a
  física reaquece.
- **Seletor** na coluna de controles, depois do "recentrar": "Layout de forças" e
  "Layout hierárquico" (`role="group"`, `aria-pressed`; o ativo fica verde —
  `.eg-grafo-zoom[aria-pressed='true']`). Preferência `layout` no `edugraphPrefs`
  (validada; padrão forças, como no Browser).
- **Motor:** tudo o que muda o grafo é aplicado DENTRO do quadro (`sincronizar()`), e o
  `reaquecer` da página virou um pedido aplicado depois de as props novas chegarem —
  nenhum passo da física roda sobre um conjunto de nós desatualizado. Render sob demanda
  preservado (grafo parado = 0 desenhos/s); "Desativar animações" = pré-cálculo até
  esfriar e hierárquico sem transição (D6).
- **Tabela de estilo:** saíram o comprimento de mola por relação e o "anel" da semente.

Desvios e pontos a conferir lado a lado com o Browser:
- O hierárquico é **parecido, não idêntico**: o dagre ainda reserva um nível
  intermediário para rótulos de aresta e liga todos os nós a uma raiz auxiliar no
  ranqueamento — ficaram de fora. A ordem dentro dos níveis e a posição exata das
  dobras podem diferir.
- **Voltar do hierárquico às forças anima** em 400 ms; não foi possível conferir se o
  Browser anima ou salta.
- As dobras são desenhadas como **poligonal** e só depois que a transição termina; aresta
  de um nó arrastado no hierárquico volta a ser reta.
- Ocultar um rótulo pela legenda no modo forças **não reaquece** (continua sendo filtro
  de desenho, N6); no hierárquico refaz o layout.
- O hierárquico roda na thread principal (o Browser usa um worker): 12–18 ms numa
  árvore de 300 nós; ~0,1–0,15 s num grafo aleatório de 300 nós com 40 níveis.
- Assumido: o Browser usa o tamanho 25 para todos os nós no estilo padrão (o padrão do
  pacote de visualização).

Verificado: `npm run lint` (0/0), `npm run build` (JS 270,64 → **290,76 kB**, CSS 8,67 →
8,71 kB, **sem dependência nova**) e `npm run dev` (200 nos 6 módulos). Testes do
assistente no Node, sem instalar nada: física (5 cenários, idênticos ao Browser) e
hierárquico (árvore real, ciclo, partes soltas, vazio, nó único, 300 nós). **O desenho
no canvas só roda no navegador — falta o teste do autor** (a lista "Como testar" acima),
incluindo: arrastar um nó e ver que ele fica preso; a escolha do layout sobrevive ao
recarregar; o medidor da P1 em 0 desenhos/s com o grafo parado nos dois modos.

**Ajuste pedido pelo autor (2026-10-18) — o A/A na coluna de controles do palco.** O
widget de tamanho da letra era o fixo do site inteiro (montado pelo App, no meio da
lateral direita, z-index 120) e, na página de grafos, caía em cima da coluna de
controles. Agora:
- **Na página de grafos** o widget é a versão `compacto` do
  [FontSizeWidget.jsx](src/components/FontSizeWidget.jsx) — "A" grande / percentual / "A"
  pequeno, com os botões 34×34 dos outros controles (`.eg-grafo-zoom`) e
  `role="group"` — no **fim da coluna**, depois da paleta. O App não monta o fixo nessa
  tela ([App.jsx](src/App.jsx)); na Home e nas telas de conta nada muda.
- A coluna ([Grafos.jsx](src/pages/Grafos.jsx)) passou a existir **sempre** (antes só com
  grafo na tela): sem grafo, só com o A/A. Ela vem **depois** dos overlays de estado no
  DOM e com o **mesmo z-index (32)** — o A/A segue clicável no convite, no "carregando" e
  no erro, como o widget fixo (sem criar nível novo na escala). Zoom, layout e paleta só
  aparecem com o desenho à vista: com o resultado (Tabela/Relações/JSON) aberto eles se
  escondem — antes ficavam por baixo dele (z-index 30), então nada muda na prática.
- Com o **popover de paleta aberto, o A/A some** e volta ao fechar — o mesmo
  comportamento do widget fixo (que sumia com fade), agora porque o popover ocupa o
  lugar dele na coluna. Saíram o atributo `data-paleta-aberta` no `<html>` e a regra de
  CSS que escondia o widget fixo: ficaram sem uso.

Verificado: `npm run lint` (0/0), `npm run build` (JS 291,35 kB; CSS 8,71 → 8,60 kB) e
`npm run dev` (200 nos 4 módulos alterados). Teste do assistente (HTML gerado com o React
do projeto, sem navegador): na página de grafos o grupo "Tamanho da letra" está na coluna
(topo-direita, z-index 32) com os 2 botões no estilo da coluna, sem o widget fixo e sem os
controles do grafo enquanto não há grafo; na Home o widget fixo continua. **Teste do
autor:** página de grafos sem consulta (só o A/A no canto); depois de uma consulta, a
coluna inteira, com o A/A embaixo da paleta e nada sobreposto; abrir a paleta (o A/A some)
e fechar (volta); A/A funciona no carregando e no erro; Home e Entrar/Criar conta com o
widget de sempre.

---

#### N12–N15 — Busca do professor

*Planejada em 2026-10-24, a partir das conversas de 2026-10-20 com o autor.* O
professor monta a busca **só escolhendo opções**, sem ver código: escolhe o ano, a
matéria e a pergunta, e depois preenche o que a pergunta pede. O console Cypher continua
na tela, ao lado da busca (o autor o usa; sai bem depois). Premissas: o modelo do grafo
da orientadora **não
muda** (o site se adapta) e o site **não guarda dados do grafo** (D17) — guarda só
consultas e a descrição de como o modelo está organizado.

**Pode começar antes da reunião** com a orientadora: a Matemática já é conhecida, e a
Gramática (e as próximas matérias) entram como uma entrada nova na tabela de matérias
quando chegarem as respostas de [guia/reuniao_orientadora.txt](guia/reuniao_orientadora.txt).

##### Decisões — fluxo e tela

1. A busca entra no topo do palco **junto do console Cypher** (z-index 40): **os dois
   ficam visíveis** — o autor usa o console e ele só sai bem depois (decisão do autor,
   2026-10-24). Como os dois dividem a barra fica para a N13.
2. O console continua como está, com a chave "Conectar nós do resultado". Na busca, o
   "conectar" fica sempre ligado (o padrão do Browser).
3. Ordem: **Ano → Matéria → Pergunta → campos da pergunta → "Ver no grafo"**. Os três
   primeiros são seletores lado a lado; os campos aparecem quando a pergunta é escolhida.
4. A Matéria só abre depois do Ano e lista **só as matérias que têm algo naquele ano**.
   Ela **nunca vem escolhida automaticamente**: mesmo com uma matéria só, o professor
   escolhe (decisão do autor, 2026-10-24).
5. Trocar o Ano ou a Matéria limpa os campos já preenchidos (o recorte mudou).
6. "Ver no grafo" só fica ativo com todos os campos da pergunta preenchidos. O resultado
   vai para o que já existe: canvas (forças/hierárquico), painel, expandir, desfazer,
   legenda e gaveta Cypher.

##### Decisões — as perguntas (cardápio)

**Todas as consultas de teste da orientadora viram perguntas** (decisão do autor,
2026-10-24): os códigos e nomes fixos dela ("EF01MA17", "Geometria"…) viram campos que o
professor escolhe, e o ano e a matéria são os da barra. Ordem no menu, com a consulta de
origem (o título dela em [consultasExemplo.js](src/data/consultasExemplo.js)):

7. **A partir de habilidades** (4 perguntas):
   - **Caminho até uma habilidade** — campo: *Habilidade*. Mostra Ano → unidade temática →
     objeto de conhecimento → habilidade. *(de "de onde vem a habilidade")*
   - **Habilidades irmãs** — campo: *Habilidade*. A habilidade, o objeto de conhecimento
     dela e as outras habilidades do ano que saem do mesmo objeto. *(de "habiludade irma")*
   - **Ligação entre duas habilidades** — campos: *Primeira habilidade* e *Segunda
     habilidade* (diferentes). O caminho mais curto entre as duas, só pelas relações da
     matéria e só pelo ano escolhido — as unidades são compartilhadas entre anos, e sem
     essa trava o caminho poderia subir por outro ano. *(de "caminho entre 2
     habilidades")*
   - **Habilidades que preciso ensinar no ano** — campo: *Habilidades*, **várias** de uma
     vez. O caminho de cada uma desde o ano. *(de "professor colocar as habilidades que
     precisa ensinar no ano", com o `)` que faltava)*
8. **Um objeto de conhecimento e as suas habilidades** — campo: *Objeto de
   conhecimento*. Mostra o objeto, as habilidades do ano e a unidade de cima.
9. **Uma unidade temática inteira** — campo: *Unidade temática*. Mostra a unidade, os
   objetos dela e as habilidades do ano escolhido. *(de "geometria completa")*
10. **Sem campo** (3 perguntas):
    - **As habilidades do ano** — o ano ligado direto às habilidades dele na matéria (o
      atalho Ano → Habilidade). *(de "ano direto p habilidade")*
    - **O ano inteiro nesta matéria** — Ano → unidades → objetos → habilidades da
      matéria. *(de "arvore completa")*
    - **Teste de erro** — por último. A 7.ª consulta da orientadora **como veio, com o
      erro de sintaxe**: serve para ver o card de erro. É fixa — não usa o ano nem a
      matéria.
11. Cada pergunta é uma entrada de um módulo do código (`src/data/filtrosDeBusca.js`): título em
    linguagem de professor, explicação de uma linha, os campos e a consulta Cypher com
    parâmetros. Pergunta nova = uma entrada nova. Cada campo diz de que lista do recorte
    escolhe (unidade, objeto ou habilidade), o rótulo quando o título da matéria não serve
    ("Primeira habilidade") e se escolhe **várias**; a pergunta pode exigir campos
    **diferentes** entre si (a ligação).

##### Decisões — de onde vêm as opções (nada guardado no código)

12. **Anos:** consulta ao Neo4j (a mesma da Home, N9).
13. **Matérias:** uma **tabela de matérias** no código (`src/data/filtrosDeBusca.js`)
    descreve como o modelo da orientadora se organiza — para cada matéria, o nome a
    mostrar, o rótulo de cada nível, a relação entre os níveis e o atalho Ano → Habilidade.
    Nenhum dado do grafo fica nela. O site confere a tabela contra o banco: matéria cujos
    rótulos não existem ou que não tem nada no ano escolhido **não aparece**. Matéria nova
    = uma entrada nova (hoje só a Matemática).
14. Escolhidos Ano e Matéria, o site faz **uma única consulta** que traz o **recorte
    inteiro**: as unidades, os objetos e as habilidades daquele ano naquela matéria, cada
    um com código/nome/descrição e a quem pertence. Medido no 1.º ano de Matemática: 22
    habilidades, ~3 KB, ~12 ms no Neo4j.
15. O ano é **amarrado pelas habilidades** (o atalho Ano → Habilidade), porque as unidades
    e os objetos são compartilhados entre anos (pergunta 5 da reunião). Matéria sem o
    atalho (pergunta 2): a tabela diz como achar o ano.
16. Todas as listas dos campos saem desse recorte. A **cascata** (escolher a unidade
    filtra os objetos; o objeto filtra as habilidades) também é feita no navegador, sem
    consulta nova.
17. O recorte fica **só na memória da página**, como o grafo desenhado: some ao
    recarregar. Um cache por (ano, matéria) evita consultar de novo ao voltar a um recorte
    na mesma visita. **Nada vai para o `localStorage`.**
18. Limite de segurança: o recorte vem com teto (proposta: 2.000 itens) e um aviso se
    passar — um ano/matéria desse tamanho pediria busca no servidor.

##### Decisões — a busca por texto dentro de um campo

19. O professor digita no próprio campo (código ou parte do texto) e **só aparecem as
    opções que contêm o que ele escreveu**.
20. O filtro roda **no navegador, a cada tecla**, sobre o recorte já carregado:
    **nenhuma consulta ao Neo4j enquanto ele digita** e, por isso, **sem intervalo de
    tempo (debounce)** — a lista se atualiza na hora. (Intervalo de ~250 ms com
    cancelamento só valeria para uma busca no servidor, que este fluxo não usa.)
21. **Ignora maiúsculas e acentos**: "numeros" acha "Números"; "ef01ma1" acha EF01MA10…
22. **Várias palavras**: a opção aparece se contiver **todas** as palavras digitadas, em
    qualquer ordem ("tempo medidas" acha "Medidas de tempo").
23. Onde procura: habilidade — código e descrição; objeto — descrição; unidade — nome.
24. Ordem das opções: primeiro as que **começam** com o que foi digitado, depois as que só
    **contêm**; dentro de cada grupo, ordem natural (EF01MA01 antes de EF01MA02; nomes em
    ordem alfabética do português — o Neo4j põe "Álgebra" no fim).
25. Cada opção mostra o código/nome em destaque e, embaixo, de onde vem (ex.: "Medidas de
    tempo · Grandezas e medidas"); o trecho digitado fica marcado.
26. Campo vazio = a lista inteira (do recorte ou da cascata), para quem prefere escolher
    olhando.
27. Nada encontrado: "Nada encontrado com 'xyz' neste ano e matéria."
28. Teclado: ↑/↓ percorre, Enter escolhe, Esc fecha; mouse também. Padrão de
    acessibilidade *combobox* (ARIA).

##### Decisões — consultas e integração

29. Consultas **sempre com parâmetros**. O texto digitado nem vai ao Neo4j.
30. Rótulos e relações da matéria entram como parâmetros (`$any(...)`, testado em
    2026-10-20); nos caminhos de tamanho variável o filtro é feito sobre
    `relationships(p)`, porque ali o Neo4j ignora tipo dinâmico (testado).
31. Toda consulta da busca aparece na gaveta Cypher, com descrição ("busca · recorte",
    "busca · caminho até a habilidade").
32. **Link compartilhável**: `?busca=caminho&ano=EF1&materia=matematica&habilidade=EF01MA17`
    — abrir o link refaz a busca. Habilidade vai pelo código (chave de negócio); unidade
    e objeto, que não têm id estável (ponto 2 da lista da orientadora), vão pelo
    nome/descrição. Campo de várias: os códigos separados por vírgula
    (`habilidades=EF01MA06,EF01MA07`).
33. **Home**: o "Ver o grafo desta turma" abre a busca com o Ano preenchido e a pergunta
    "O ano inteiro nesta matéria" — a matéria fica para o professor escolher (decisão 4) —,
    no lugar da consulta escrita no console (N9).
34. Neo4j fora do ar: aviso na barra ("Não foi possível carregar os anos agora") e nenhum
    dado local.
35. Sem dependência nova; tema escuro, A/A, sem animação e paletas continuam valendo.

**O que depende das respostas da reunião:** os rótulos e as relações da Gramática
(pergunta 1 → entrada na tabela); o atalho Ano → Habilidade em toda matéria (pergunta 2 →
como amarrar o ano); `Habilidade` único ou por matéria (pergunta 3 → campo da tabela);
habilidade de vários anos (pergunta 4 → aparece em cada ano a que estiver ligada); unidades
e objetos compartilhados entre anos (pergunta 5 → confirma a amarração pelas habilidades).

##### Etapas

- **N12 — Modelo e consultas (sem tela):** tudo num arquivo só,
  `src/data/filtrosDeBusca.js` (pedido do autor): a tabela de matérias (Matemática), as
  consultas de anos, matérias do ano e recorte, as 4 perguntas e o filtro de texto (função
  pura). Testado no Node contra o Neo4j real: as 4 perguntas devolvem o esperado; o filtro
  respeita acentos, várias palavras e a ordem.
- **N13 — A barra:** Ano, Matéria e Pergunta **junto do console Cypher, que continua
  visível**; estados de carregando, Neo4j fora do ar e recorte vazio.
- **N14 — Os campos da pergunta:** o campo com filtro por texto (combobox), a cascata e o
  "Ver no grafo" levando o resultado ao canvas. Também o campo de **várias** habilidades
  (as escolhidas viram etiquetas removíveis), as perguntas com **dois** campos (a ligação:
  as duas precisam ser diferentes) e o "Teste de erro", que vai direto ao "Ver no grafo"
  e mostra o card de erro.
- **N15 — Link, Home e fechamento:** o link compartilhável, o botão da Home e o
  fechamento da **D19** no DECISOES.md. A D19 (o fluxo da busca: de onde vem cada opção,
  quantas consultas e por quê — com parágrafo de monografia) **já foi escrita em
  2026-10-24**, a pedido do autor; na N14 e na N15 ela só ganha o que essas etapas
  mudarem.

Regras de sempre: uma etapa por sessão, lint 0/0 · build · dev, teste do autor, registro
aqui e commit do autor (§0).

##### N12 — Feito (2026-10-24)

Arquivo novo **[src/data/filtrosDeBusca.js](src/data/filtrosDeBusca.js)** — tudo da busca
num arquivo só (pedido do autor), sem tela (nenhum componente o importa ainda — o bundle
não mudou, e o knip vai apontá-lo como "sem uso" até a N13). Quatro partes:
1. **Tabela de matérias** (hoje só a Matemática): nome, títulos dos campos, rótulos de
   cada nível, as quatro relações (Ano → unidade, unidade → objeto, objeto → habilidade e o
   atalho Ano → Habilidade) e a propriedade que dá o texto de cada nível;
   `parametrosDaMateria()` a converte no parâmetro `$m` das consultas.
2. **Filtro por texto**, puro: `filtrarOpcoes()` (sem acento e sem maiúscula; todas as
   palavras, em qualquer ordem; quem começa com o texto vem antes) e `marcarTrechos()` (o
   trecho digitado, marcado também no texto com acento).
3. **Opções**: `anosDaBusca()` (a consulta de anos da Home, com descrição própria na
   gaveta), `materiasDoAno(ano)` (as da tabela que têm habilidade no ano — uma consulta para
   todas, com `EXISTS`), `carregarRecorte(ano, matéria)` (**uma consulta**: unidades,
   objetos e habilidades do ano, amarrados pelas habilidades; teto de 2.000 linhas com
   aviso; ordem natural do português; cache da visita, que guarda a promessa e esquece se a
   consulta falhar) e `opcoesDoCampo(recorte, campo, cascata)` (as opções de cada campo, com
   a cascata aplicada e o "de onde vem").
4. **Perguntas**: as 4 do cardápio (caminho até uma habilidade, unidade inteira, objeto e
   suas habilidades, o ano inteiro) e `consultaDaPergunta()` (texto + parâmetros +
   descrição para a gaveta; erro claro se faltar um campo). As consultas devolvem caminhos,
   que seguem o mesmo trajeto do console (extrairGrafo → completarGrafo → canvas). Cada
   salto é um tipo dinâmico de um passo só, porque em caminho de tamanho variável o Neo4j
   ignora o tipo dinâmico.

(Uma 1.ª versão tinha as quatro partes em quatro arquivos; o autor pediu um só.)

Alterado: [resumoGrafo.js](src/data/resumoGrafo.js) — `anosDoGrafo()` aceita a descrição
que aparece na gaveta (a Home continua com a dela).

Verificado: `npm run lint` (0/0), `npm run build` (JS 291,35 → 291,37 kB — a opção nova
do `anosDoGrafo`; CSS igual) e `npm run dev` (o servidor do teste). Teste do assistente no
Node contra o Neo4j real (Vite do projeto, sem instalar nada), **29 verificações**: anos
(`EF1 · 1º Ano`); matérias do 1.º ano (só Matemática; uma Gramática com rótulos que ainda
não existem não aparece; ano sem dados → nenhuma); recorte (5 unidades, 17 objetos, 22
habilidades, "Álgebra" na ordem certa, EF01MA01…22; o mesmo recorte de novo não consulta o
Neo4j); cascata ("Grandezas e medidas" → 3 objetos e 5 habilidades; "Medidas de tempo" →
EF01MA16/17/18); filtro ("numeros" acha "Números", "tempo medidas" acha "Medidas de
tempo", "ef01ma1" acha EF01MA10…19, campo vazio = tudo, quem começa vem antes, trecho
marcado com acento); as 4 perguntas pelo trajeto do console — caminho até EF01MA17: 4 nós
e 3 relações (4 com "conectar", igual à consulta de referência 3); unidade "Grandezas e
medidas": 9 nós e 8 relações; objeto "Medidas de tempo": 5 nós e 4 relações; o ano
inteiro: 45 nós e 44 relações (66 com "conectar", igual à "árvore completa"); e as
descrições na gaveta Cypher. **Teste do autor:** não há nada na tela nesta etapa; a N13
traz a barra.

##### N13 — Feito (2026-10-24)

Arquivo novo [src/components/grafo/BuscaProfessor.jsx](src/components/grafo/BuscaProfessor.jsx);
alterados [Grafos.jsx](src/pages/Grafos.jsx) (a barra entra logo acima do console) e
[filtrosDeBusca.js](src/data/filtrosDeBusca.js) (a tabela de matérias ganhou o plural dos
títulos, para os totais do recorte).

Como ficou:
- **Duas barras no topo do palco, as duas visíveis** (decisão 1): a da **busca** em cima e
  o **console Cypher** embaixo, exatamente como era — mesmo estilo de barra, mesmo z-index
  (40). O console não mudou.
- A barra da busca: rótulo **BUSCA** e três seletores, **Ano → Matéria → Pergunta**, com a
  explicação da pergunta escolhida ao lado. Cada seletor só liga quando o anterior está
  escolhido e a lista dele chegou do Neo4j; a **Matéria nunca vem escolhida sozinha**, mesmo
  com uma só (decisão 4), e trocar o Ano zera a Matéria.
- **Linha de estado** (como a do console): o passo que falta ("Escolha o ano, a matéria e
  o que você quer ver.", "Escolha a matéria."), o que está carregando, as falhas com
  **"Tentar de novo"** ("Não foi possível carregar os anos agora." etc. — nenhum dado
  local, decisão 34), "Nenhuma matéria com habilidades neste ano.", e, com o recorte
  carregado, os totais: "1º Ano · Matemática: 5 unidades temáticas · 17 objetos de
  conhecimento · 22 habilidades" (+ aviso se passar do teto).
- As consultas da busca aparecem na **gaveta Cypher** com as descrições ("busca · anos",
  "busca · matérias do ano", "busca · recorte do ano e matéria").
- As escolhas vivem no componente (mexer na busca não re-renderiza a página). Cada carga
  guarda a chave a que pertence: no 1.º desenho e no quadro logo depois de trocar o ano
  ela conta como "carregando" — o teste em HTML pegou que, sem isso, aparecia por um
  instante "O grafo ainda não tem anos." (e, ao trocar o ano, as matérias do ano anterior).
- Ainda **não** há os campos da pergunta nem o "Ver no grafo": chegam na N14.

Verificado: `npm run lint` (0/0), `npm run build` (77 módulos; JS 291,37 → **299,88 kB** —
a barra e o `filtrosDeBusca.js` entraram no bundle; CSS igual) e `npm run dev` (200 nos 3
módulos; o proxy responde). Testes do assistente (sem navegador): o teste de dados da N12
de novo (29 verificações) e a página renderizada em HTML com o React do projeto — a barra
da busca acima do console, os 3 seletores começando desligados, os placeholders, as 4
perguntas no seletor, a linha de estado inicial e o console intacto. A troca de seletores
e as cargas só rodam no navegador — **teste do autor:**
1. Abrir a página de grafos: "Carregando os anos…" e depois "Escolha o ano…"; Matéria e
   Pergunta desligadas.
2. Escolher "1º Ano": a Matéria liga com "Matemática", **sem vir escolhida**.
3. Escolher "Matemática": a linha mostra "1º Ano · Matemática: 5 unidades temáticas · 17
   objetos de conhecimento · 22 habilidades · escolha o que você quer ver"; a Pergunta liga.
4. Escolher cada pergunta: a explicação aparece ao lado.
5. Abrir a gaveta Cypher (depois de rodar algo no console): as consultas "busca · …".
6. Com o Neo4j parado: "Não foi possível carregar os anos agora." + "Tentar de novo";
   religar e clicar em "Tentar de novo".
7. Tema escuro e widget A/A; o console continua funcionando como antes.

##### Entre a N13 e a N14 — as consultas de teste viram perguntas (2026-10-24)

A pedido do autor, **todas** as consultas de
[consultasExemplo.js](src/data/consultasExemplo.js) entraram no menu da busca,
**inclusive a de testar erro** (decisões 7–11, reescritas): o menu passou de 4 para **9
perguntas** — chegaram "Habilidades irmãs", "Ligação entre duas habilidades",
"Habilidades que preciso ensinar no ano", "As habilidades do ano" e "Teste de erro". O
menu "Exemplos…" do console continua igual.

Alterados:
- [filtrosDeBusca.js](src/data/filtrosDeBusca.js) — as 5 perguntas novas; o campo deixou
  de ser só um nome e passou a dizer de que lista escolhe, o rótulo e se escolhe várias
  (`{ nome, tipo, rotulo?, varias? }`); `distintos` (campos que não podem repetir) e
  `fixa` (consulta que não usa o ano nem a matéria); `consultaDaPergunta()` confere lista
  vazia e campos repetidos, com erro claro.
- [consultasExemplo.js](src/data/consultasExemplo.js) — a 7.ª consulta (a do erro) virou
  a constante `CONSULTA_COM_ERRO`, que o "Teste de erro" importa: o texto existe num lugar
  só.
- A barra (N13) não mudou: o seletor de perguntas já lista o que estiver em `PERGUNTAS`.

Verificado: `npm run lint` (0/0), `npm run build` (JS 299,88 → **301,88 kB**; CSS igual).
Testes do assistente no Node contra o Neo4j real, **41 verificações** (as 29 da N12 +
12): cada pergunta nova devolve o mesmo que a consulta de origem da orientadora — irmãs de
EF01MA16: EF01MA17 e EF01MA18 (4 nós, 3 relações); ligação EF01MA01 → EF01MA21: 7 nós e 6
relações (8 com "conectar"), passando pelo 1.º ano; as 4 habilidades que preciso ensinar
(EF01MA06/07/08/19): 11 nós e 10 relações (14 com "conectar"); as habilidades do ano: 23
nós e 22 relações —; campos faltando, lista vazia e a mesma habilidade nos dois campos dão
erro claro; o "Teste de erro" é recusado pelo Neo4j (`ErroCypher`, origem `neo4j`,
`Neo.ClientError.Statement.SyntaxError`) e é a única consulta com erro na gaveta. A
página em HTML: as 9 perguntas no seletor, na ordem. **Teste do autor** (junto com o da
N13): abrir o seletor "O que você quer ver?" e conferir as 9 perguntas e as explicações —
rodar cada uma só será possível na N14.

### 4.6 Limpeza do código — etapas (L0–L2) · FINALIZADO

*Planejado em 2026-10-24, a pedido do autor; **finalizado na L2, em 2026-10-24**, por
decisão do autor — as etapas seguintes que estavam no plano (reaproveitar componentes,
organizar arquivos e o fechamento) foram cortadas.* Com a integração (N1–N11) de pé e a
busca do professor (N12) esperando as respostas da orientadora
([guia/reuniao_orientadora.txt](guia/reuniao_orientadora.txt)), o código passou por uma
limpeza: tirar o que não se usa mais. Mesma filosofia da revisão R0–R7 (§4.2): **zero
mudança de comportamento ou visual**.

**Ferramentas (escolhidas pelo autor):**
1. **knip** — inventário de arquivos, exportações e dependências sem uso. Roda com
   `npx knip` (cache temporário; o `package.json` não muda — autorizado pelo autor). As
   skills de código morto da comunidade foram descartadas: todas com menos de 130
   instalações, e a maioria só embrulha o knip.
2. **`/simplify`** (embutido no Claude Code) — revisão do diff da L2, antes do commit do
   autor, com as regras abaixo.

O plugin oficial `code-simplifier` ficou de fora: traz padrões internos da Anthropic
(`function` em vez de arrow, tipos do TypeScript, apagar comentários "óbvios") que
conflitam com o §6.

**Restrições invioláveis:**
- Zero mudança de comportamento ou visual. Bug achado no caminho → anotado no
  relatório, não corrigido junto.
- Remoção só com **zero ocorrências na busca**, inclusive em textos montados
  (`eg-forma-${…}`, `var(--no-${…})`, keyframes em `animation:` inline, seletores
  `data-*`). O knip dá candidatos, não veredito.
- Sem dependência nova. Não renomear contratos: chaves do `localStorage`
  (`edugraphPrefs` — paleta, formas, semAnim, painel, layout —, `eg_theme`, `eg_font`), a
  API imperativa do canvas, `/api/cypher`, `No`/`Relacao`/`Caminho`/`ErroCypher` e os
  textos das consultas da orientadora.
- Comentários que explicam o porquê ficam (são material do TCC): nem o `/simplify` nem
  as skills apagam comentário por ser "óbvio"; só se corrige o que está desatualizado
  (como na R2). Anotações de histórico ("era a gaveta SPARQL", "N5: …") são proveniência
  e ficam.
- Fora do escopo: o globo da Home (dados locais, por decisão do autor); `depoimentos.js`
  (conteúdo editorial); os algoritmos de `simulacaoForcas.js` e `layoutHierarquico.js` (a
  física é verificada como idêntica à do Browser — D18 —, e mudá-la exige refazer a
  comparação). Desempenho (memo, useCallback…) fica para a P3–P4 (§4.4).
- **Telas de conta (esclarecimento do autor, 2026-10-24):** Login e Signup **continuam no
  site**, só sem uso funcional (não haverá sistema de contas). Entram na limpeza como o
  resto: o que elas não usam pode sair.
- Uma etapa por sessão: `npm run lint` (0/0) · `npm run build` (bundle igual ou menor —
  anotar) · `npm run dev` (200) · teste do autor · registro aqui · commit do autor (§0).

**Linha de base (2026-10-24):** lint 0/0 · 75 módulos · JS 291,35 kB · CSS 8,60 kB · 45
arquivos de código (js/jsx/css) com 9.855 linhas.

- [x] **L0 — Este plano** *(2026-10-24)*
- [x] **L1 — Inventário, sem apagar nada** *(2026-10-24)* — relatório abaixo
- [x] **L2 — Remoção do que está sem uso** (a lista aprovada abaixo) + `/simplify` no diff
  *(2026-10-24)* — relatório abaixo

**Roteiro finalizado na L2** (decisão do autor, 2026-10-24).

#### Relatório da L1 (2026-10-24)

Como foi feito: `npx knip`; busca no código das classes `.eg-*`, das variáveis `--*` e
dos `@keyframes` do `index.css` (o knip não lê CSS); análise das props de componente com
o parser do Babel que já está no `node_modules` — props passadas e não declaradas, e
declaradas e nunca lidas (o detector foi conferido num exemplo artificial); busca de
comentários e documentação desatualizados.

Já está limpo: **nenhum arquivo sem uso e nenhuma dependência sobrando** (knip),
**nenhuma prop sobrando** nos 35 componentes e todos os `@keyframes` em uso.

**Para remover na L2 (aprovado pelo autor):**

| Item | Onde | Evidência |
|---|---|---|
| `--grafo-previa-borda` | index.css (claro e escuro) | zero usos; sobra da prévia "N vértices" da barra de filtros (saiu na N3/N10) |
| `--green-soft` | index.css (claro e escuro) | zero usos desde sempre; guardado "para Login/Signup", que não o usam |
| `.eg-materia-chip` e `.eg-materia-chip--sel` | index.css | zero usos desde a N9 (o balão perdeu as matérias); na N12 a matéria vira seletor |
| `export` de `estiloNo`, `LIMITE_NOS`, `numeroDoAno`, `ALPHA_MIN`, `LIMITE_CONEXOES`, `LIMITE_VIZINHOS` | estiloGrafo, extrairGrafo, resumoGrafo, simulacaoForcas, vizinhanca | ninguém importa; usados só no próprio arquivo — sai só a palavra `export` |
| comentário de `estiloNo` ("usado pela legenda e pelas amostras de paleta") | estiloGrafo.js | desatualizado: só a própria tabela de estilo o usa |
| README: "Estado atual", tabela de telas e "Tecnologias" | README.md | ainda falam em dados estáticos, Fuseki/SPARQL e biblioteca de visualização "a definir". As partes de visão ("O que é", "Contexto acadêmico") são texto do autor e não mudam |

**Mantidos (decisão do autor):** a tabela vazia `ESTILO_RELACAO` e o caminho do tracejado
(ponto de extensão: uma relação de progressão entre anos seria uma linha na tabela) e o
`export class ErroCypher` (contrato documentado do cliente, §4.5). **Falsos positivos:**
as classes `.eg-forma-*` (montadas no `PontoNo`) e os comentários "era a gaveta SPARQL",
"N10: …" (proveniência, R2).

#### Relatório da L2 (2026-10-24)

**Removido**, cada item com zero ocorrências na busca antes de sair:
- [index.css](src/index.css): os tokens `--grafo-previa-borda` e `--green-soft` (claro e
  escuro) e as regras `.eg-materia-chip`, `:hover` e `--sel`.
- A palavra `export` de `estiloNo` ([estiloGrafo.js](src/data/estiloGrafo.js)),
  `LIMITE_NOS` ([extrairGrafo.js](src/data/extrairGrafo.js)), `numeroDoAno`
  ([resumoGrafo.js](src/data/resumoGrafo.js)), `ALPHA_MIN`
  ([simulacaoForcas.js](src/data/simulacaoForcas.js) — só a palavra; o algoritmo não
  mudou) e `LIMITE_CONEXOES`/`LIMITE_VIZINHOS` ([vizinhanca.js](src/data/vizinhanca.js)).

**Corrigido:** o comentário de `estiloNo` (dizia que a legenda e as amostras o usavam);
no [vite.config.js](vite.config.js), o comentário que chamava o proxy de produção de
"N11" (hoje a N11 é a física); e um comentário novo no `--grafo-previa-bg`, que ficou
(é o fundo verde-claro da opção selecionada na paleta e do hover do "Expandir conexões") e
só tem o nome da antiga prévia.

**README atualizado** (só as partes factuais; "O que é" e "Contexto acadêmico" não
mudaram): "Estado atual" (Neo4j/Cypher, o site não guarda dados do grafo — exceto o globo
ilustrativo da Home), a tabela de telas (com a página de grafos; Entrar/Criar conta como
formulários apenas visuais), acessibilidade (A/A nos dois lugares, cores e formas no grafo,
sem animação também nas telas de conta), "Tecnologias" (Neo4j pela Query API atrás do
proxy; motor próprio em Canvas 2D com a física do Neo4j Browser e o layout hierárquico),
o passo novo "Configurar o acesso ao Neo4j" (`.env.example` → `.env.local`) e a
estrutura por pastas, apontando para o §7. O texto não promete o que o código não faz: o
modo somente leitura é pedido pelo site em toda consulta, e impô-lo no proxy fica para a
publicação.

**`/simplify`** sobre o diff da fase, com as regras do §4.6 (4 revisores: reaproveitamento,
simplificação, eficiência e altitude). Aplicado: o comentário de `estiloNo` encurtado (ele
listava quem *não* o usa); a descrição de `conta/` no README (lá ficam a moldura, o fundo e
o botão; as telas estão em `pages/`); a frase do A/A; e, do revisor de altitude, as três
afirmações do README que o código não sustentava (globo da Home, "somente leitura", sem
animação só no grafo), o comentário do `vite.config.js` e o do `--grafo-previa-bg`.
Mantido (com motivo): a frase "hoje o grafo traz o 1.º ano de Matemática" do README — o
"e vai crescer" logo depois já avisa que é um retrato; e a função `estiloNo` (o revisor
sugeriu embutir a linha em `visualDoNo`, mas ela forma par com `estiloRelacao`). Eficiência
e reaproveitamento: nenhum achado.

**Números:** lint 0/0 · 75 módulos · JS **291,35 kB** (igual) · CSS **8,60 → 8,08 kB** ·
`npx knip` agora só aponta as duas exportações mantidas por decisão do autor
(`ESTILO_RELACAO` e `ErroCypher`) · `npm run dev` 200 nos módulos alterados.

**Teste do autor:** nada deve ter mudado na tela. Conferir a Home (o balão do card de ano
com o botão "Ver o grafo desta turma"), a página de grafos nos dois temas (popover de paleta
com a opção selecionada em verde-claro; hover do "Expandir conexões deste nó") e Entrar/Criar
conta; e ler o README.

## 5. Como ler o protótipo final (arquivo "bundled")

> **A pasta `design/` foi retirada do repositório em 2026-10-15.** Os protótipos eram
> o exemplo de referência da migração (decisões de design e porte fiel, D4) e não são
> mais usados. Esta seção fica só como registro de como eles foram lidos. Se voltarem
> a ser necessários, o autor traz a pasta de volta.

[design/prototipo_final.html](design/prototipo_final.html) (~1.1 MB) é uma página
empacotada — o HTML/JSX real **não** está legível direto. Estrutura:

- `<script type="__bundler/template">` → o HTML real, **JSON-encoded**.
- `<script type="__bundler/manifest">` → assets (fontes, logos) em base64 (alguns gzip).

Decodificar o template para um arquivo legível:

```bash
cd design
# acha a linha do template e decodifica o JSON:
python3 - <<'PY'
import json, re
html = open('prototipo_final.html', encoding='utf-8').read()
m = re.search(r'<script type="__bundler/template">(.*?)</script>', html, re.S)
open('/tmp/proto.html', 'w').write(json.loads(m.group(1)))
print('escrito em /tmp/proto.html')
PY
```

Ordem das seções dentro do template: **Header → Hero ("Conhecimento conectado") →
Grafo interativo → Banda de estatísticas → Depoimentos → Footer** (+ overlays de
Login/Signup). A paleta e as fontes do protótipo estão no método `themeVars()`.

### Protótipo da página de grafos ([design/prototipo_grafo.html](design/prototipo_grafo.html))

Mesmo formato de bundle e mesma receita acima (só trocar o nome do arquivo).
Particularidades:

- A **lógica da página** (estado, física do grafo, interações do canvas) não está
  no HTML: fica num `<script type="text/x-dc" data-dc-script>` **dentro do
  template decodificado** (~43k chars) — uma `class Component` com `state`,
  handlers e o motor do canvas. É a referência para o porte (constantes da
  física, hit-test, câmera).
- Os **dados do grafo** também não estão no template: vivem no asset
  **`mock-fuseki.js`** dentro do `<script type="__bundler/manifest">` (uuid
  `dacfc242-29cf-4b8b-88e7-139502e68ac5`, **gzip+base64**). Para extrair:
  localizar o uuid no manifest JSON, decodificar base64 e dar gunzip — é um ES
  module (~29k chars) que simula o endpoint Fuseki (`consultarFuseki`, consultas
  SPARQL reais). **Já extraído na G2** → [src/data/mockFuseki.js](src/data/mockFuseki.js)
  (com ajustes locais: recorte 5.º–9.º ano e `estatisticas()` — ver o cabeçalho do módulo).
- O template usa `style-hover=`/`style-focus=` (atributos do bundler) → viram
  `:hover`/`:focus` em classes; `<sc-for>`/`<sc-if>` → `.map()`/render condicional.
- **Só tema claro, sem CSS variables** — no porte, mapear os hex para tokens
  `var(--…)` com contraparte escura (decisão da Etapa 7).

## 6. Convenções do código

- **Estilos inline** (`style={{}}`) na maioria dos componentes; classes utilitárias
  `.eg-*` e variáveis de tema em `index.css`. Sem Tailwind, sem lib de UI.
- **Roteamento por estado** em [src/App.jsx](src/App.jsx) (`tela` = home/login/signup/grafos),
  sem react-router. Páginas recebem callbacks `onLogin`/`onSignup`/`onHome`.
- **Tema + zoom de fonte** via Context: [src/context/ThemeContext.jsx](src/context/ThemeContext.jsx)
  (atributo `data-theme` no `<html>`, persistência em localStorage).
- Idioma do projeto e dos comentários: **português**.
- **Handlers**: props de navegação entre telas usam `on*` (`onHome/onGrafos/...`,
  padrão desde a Etapa 1); os demais callbacks de componente usam `ao*`
  (`aoFechar/aoFiltrar/...`, padrão da página de grafos). Convenção consolidada na
  revisão R0–R7 (decisão do autor: documentar, não renomear em massa) — ver D11.
- Use sempre `var(--token)` (sem fallback `,#hex`) ao portar trechos do protótipo,
  porque os tokens estão definidos globalmente.
- **Escala de z-index** (documentada no topo do `index.css`; não criar valores
  intermediários novos): `1–8` camadas internas da landing · `20` GradeCard aberto ·
  `30` painel de contexto/resultado do console/popovers do palco/balão de matérias ·
  `32` overlays de estado + coluna de controles do palco (depois deles no DOM) ·
  `40` barras da busca do professor e do console Cypher (a do console era a de filtros até a N3) ·
  `120` widget A/A fixo (Home e telas de conta; nos grafos ele fica na coluna) ·
  `190/200` backdrop/dropdown do perfil.
- **Segredos** (senha do Neo4j): só no `.env.local` (não versionado; modelo em
  [.env.example](.env.example)), sempre **sem** o prefixo `VITE_` — o Vite só embute
  no bundle as variáveis `VITE_*`. Quem lê é o proxy `/api/cypher` do
  [vite.config.js](vite.config.js) (N1/D14).
- **Decisões importantes → [guia/DECISOES.md](guia/DECISOES.md)**: toda escolha relevante de
  escopo/arquitetura/biblioteca/dados/acessibilidade ganha uma entrada didática lá
  (problema → decisão → alternativas rejeitadas → fala pronta para a banca →
  **parágrafo de monografia**, em tom acadêmico e com o capítulo onde encaixa), no
  momento em que é tomada. O arquivo é versionado e contém D1–D17 (D1–D10
  retroativas; D13 reservada para a P5 do §4.4).

## 7. Estrutura de arquivos

```
src/
├── context/ThemeContext.jsx   # tema (claro/escuro) + zoom de fonte
├── components/
│   ├── Logo.jsx               # logo grafo 9 nós + "EduGraph" (Spectral)
│   ├── ThemeToggle.jsx        # toggle sol/lua (já bate com o protótipo)
│   ├── GraphSection.jsx       # seção 2: grafo-globo interativo (Etapa 2); nós ilustrativos no código (nota na D17)
│   ├── StatsBand.jsx          # seção 3: banda de estatísticas, 3 contadores — dados do Neo4j (Etapa 3; N9)
│   ├── TestimonialsSection.jsx # seção 4: depoimentos + cortina que revela a grade (um card por Ano do Neo4j);
│   │                          #   "Ver o grafo desta turma" abre os grafos com a consulta da turma (Etapas 4-6; N9)
│   ├── MateriaPopover.jsx     # balão do card de série: só o CTA desde a N9 (matérias voltam com o componente)
│   ├── Footer.jsx             # footer / fim do site (Etapa 5 — FEITO)
│   ├── SiteHeader.jsx         # header único (Home + Grafos): nav no centro geométrico, slot de conta
│   │                          #   de largura fixa (ajuste de UX de 2026-07-12)
│   ├── HeroSection.jsx        # hero "Conhecimento conectado." da Home (R7b)
│   ├── GradeCard.jsx          # card de série da grade: o nome do Ano ("1º Ano"); abre o MateriaPopover (R7b; N9)
│   ├── LogosInstitucionais.jsx # par de <a> LabOtim/UFES dos headers (R6; o Footer tem variação própria)
│   ├── FontSizeWidget.jsx     # controles A/A de acessibilidade (fixo; `compacto` na coluna do palco dos grafos)
│   ├── Chave.jsx              # switch 34×20 (primitivo compartilhado grafo + conta)
│   ├── conta/                 # componentes exclusivos das telas de conta (A1–A5 — FEITO)
│   │   ├── MolduraConta.jsx   # moldura: SiteHeader + <main> 1 viewport + Footer de vidro (A1/A4); dona do semAnim
│   │   ├── FundoVertices.jsx  # canvas de partículas atrás do card (porte do particle-network; A2)
│   │   ├── BotaoAcessibilidade.jsx # botão flutuante: toggle "desativar animações e física"
│   │   └── estilos.js         # estilos inline compartilhados dos cards (CARD_VIDRO, ...; A3)
│   └── grafo/                 # componentes exclusivos da página de grafos (R7a)
│       ├── BuscaProfessor.jsx # barra da busca do professor: Ano → Matéria → Pergunta, acima do console (N13)
│       ├── ConsoleCypher.jsx  # barra do console Cypher: consulta, menu de exemplos, Executar (N3)
│       ├── ResultadoCypher.jsx # resultado do console no palco: abas Tabela/JSON + avisos do Neo4j (N3)
│       ├── GrafoCanvas.jsx    # canvas 2D: render + layout + interações (hover/seleção/drag/pan/zoom,
│       │                      #   2×clique expande; API centrarEm/enquadrar/reaquecer/assentar/afastarParaCaber/
│       │                      #   zoom± via ref); layouts do Neo4j Browser: forças e hierárquico, com transição (N11)
│       ├── GrafoPainel.jsx    # painel de contexto "de vidro": detalhe do Neo4j (propriedades, conexões por
│       │                      #   tipo e sentido), vistos, expandir (+ expandir / botão) e o erro dela (G7–G8; N7–N8)
│       ├── PontoNo.jsx        # pontinho de rótulo (cor + forma da tabela de estilo), compartilhado (N7)
│       ├── GrafoOverlays.jsx  # legenda "Tipos de nó" (rótulos do Neo4j, oculta no desenho — N6), gaveta
│       │                      #   Cypher (consultas que o site fez sozinho — N10), popover de paleta,
│       │                      #   OpcoesAcessibilidade (G9–G10)
│       ├── GrafoPerfil.jsx    # perfil mock: identidade e acessibilidade (G10; as turmas saíram na N10)
│       ├── GrafoEstados.jsx   # overlays de estado do palco: convite/carregando/erro (código + ^) (R7b; N3; vazio saiu na N5)
│       └── estilos.js         # estilos inline compartilhados do domínio (MONO_LABEL, R6)
├── data/
│   ├── neo4j.js               # cliente Cypher do Neo4j: executarCypher() via proxy /api/cypher (N2);
│   │                          #   observarConsultas(): anuncia cada consulta concluída (gaveta Cypher, N10)
│   ├── estiloGrafo.js         # tabela de estilo: por rótulo (cor, raio, forma, legenda, tooltip)
│   │                          #   e por tipo de relação (tracejado); padrão p/ rótulo novo (N5; mola/anel saíram na N11)
│   ├── simulacaoForcas.js     # física do "Force-based layout" do Neo4j Browser (forças do d3; idêntica — N11, D18)
│   ├── layoutHierarquico.js   # "Hierarchical layout" do Browser: camadas de Sugiyama, como o dagre (N11, D18)
│   ├── resumoGrafo.js         # agregados da Home no Neo4j: habilidades, unidades temáticas, anos (N9)
│   ├── filtrosDeBusca.js      # busca do professor (N12), sem tela: tabela de matérias (como o modelo da
│   │                          #   orientadora se organiza; nenhum dado do grafo), filtro por texto (sem acento,
│   │                          #   todas as palavras), opções (anos, matérias do ano, o recorte — 1 consulta,
│   │                          #   cache da visita — e a cascata) e as 9 perguntas com a consulta de cada uma
│   │                          #   (todas as de teste da orientadora, com campos, + o "Teste de erro")
│   ├── consultasExemplo.js    # consultas Cypher de exemplo (menu do console) + a do "Ver o grafo desta
│   │                          #   turma" + a do erro (o "Teste de erro" da busca); cópia das de teste da
│   │                          #   orientadora (a pasta neo4j/ saiu do repo)
│   ├── vizinhanca.js          # conexões de um nó no Neo4j por tipo e sentido; retrato do nó (N7);
│   │                          #   expandirNo: vizinhos (até 100) + "conectar" os novos (N8)
│   ├── extrairGrafo.js        # resultado → nós + relações (puro) e as consultas extras do Browser:
│   │                          #   pontas que faltam, limite de 300 nós, "conectar nós" (N4)
│   ├── depoimentos.js         # 5 depoimentos (conteúdo editorial do protótipo; troca futura por Cypher)
│   └── paletas.js             # paletas de daltonismo por rótulo, escolhidas por simulação (G9; refeitas na N6 — D15)
├── pages/
│   ├── Home.jsx               # Header + Hero + GraphSection + StatsBand + Testimonials + Footer (Etapas 1-5 — FEITO)
│   ├── Grafos.jsx             # página do grafo — console Cypher (N3) + grafo do Neo4j no canvas (N5) + estados + painel + expandir/desfazer + gaveta Cypher + perfil/prefs (§4.5)
│   ├── Login.jsx              # card de vidro na MolduraConta; form acessível (A1–A5 — FEITO)
│   └── Signup.jsx             # card de vidro na MolduraConta; form acessível (A1–A5 — FEITO)
├── assets/{ufes,labotim}.png  # logos institucionais (header e footer)
├── App.jsx                    # roteamento por estado
├── main.jsx                   # entrada React
└── index.css                  # design system (tokens + aliases + classes .eg-*)
```
