# Estado atual da implementação — EduGraph (TCC)

> este arquivo é a fonte de
> verdade do andamento do projeto e **é versionado no git**. O `CLAUDE.md` está no
> `.gitignore` (não sincroniza entre máquinas), então o estado real do trabalho
> mora **aqui**. Ao iniciar uma sessão, leia este arquivo primeiro e, ao concluir
> uma etapa, atualize-o.
>
> **Decisões importantes** (escopo, arquitetura, biblioteca, dados,
> acessibilidade) são registradas em **[DECISOES.md](DECISOES.md)** — organizado e
> didático, é o material de preparação da defesa E da escrita do texto. Ao tomar
> uma decisão dessas, adicione a entrada lá **na hora**, com **todos** os campos do
> formato do cabeçalho — inclusive o **parágrafo de monografia** (tom acadêmico,
> com o capítulo onde encaixa).

Última atualização: 2026-10-09.

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
acadêmico completo). Sem back-end por enquanto — só as telas, com dados estáticos.
A integração com o servidor de grafos — agora **Neo4j / Cypher** (decisão de
2026-10-09, substitui o antigo plano Fuseki/SPARQL) — é o **foco atual** (§4.5).

O código está sendo migrado **por partes** de um **protótipo inicial** para o
**protótipo final aceito**, que vive em [design/prototipo_final.html](design/prototipo_final.html).

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
--muted --body --faint --green --green-deep --green-soft --gold --edge --pill-bg
--pill-border`.

### Aliases de compatibilidade — REMOVIDOS (A5, 2026-07-16)
`index.css` **não define mais** os aliases dos nomes antigos (`--ink --accent
--accent-hover --line --line-strong --card --bg-soft --mut --accent-rgb`).
Eles existiam só para manter Login/Signup/FontSizeWidget funcionando com a
paleta nova antes da migração; na **A5** essas telas passaram a usar os tokens
do protótipo direto e os aliases foram removidos dos dois temas (grep
pré-remoção incluindo strings — nenhum uso restou). O único token "extra"
mantido é `--green-soft` (documentado na tabela acima, da paleta do protótipo).
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
registradas: **D11** no [DECISOES.md](DECISOES.md).

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

A landing (Home, Etapas 1–6) e a **página de grafos (G1–G11, Etapas 7–16)** estão
completas contra o mock. Restam:

0. ~~Revisão e polimento do código~~ — **concluída** (roadmap §4.2, Etapa 17).
1. ~~**Telas de conta (Entrar / Criar conta)**~~ — **concluída** (roadmap
   §4.3, A0–A5, Etapa 18): fundo de vértices do protótipo, header no
   SiteHeader (slot fixo), card e footer de vidro, aliases órfãos removidos e
   revisão de acessibilidade das telas.
2. **PENDENTE (pausado em 2026-10-09) — Desempenho do motor do grafo**: P0–P2
   feitas; **P3, P4 e P5 pendentes** — roadmap §4.4. Retomar depois da integração.
3. **FOCO ATUAL — Integração com o Neo4j** (substitui o antigo plano de Apache
   Jena Fuseki/SPARQL) — §4.5, roadmap N0–N12. **N1–N5 feitas; próxima etapa: N6.**

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
  do [DECISOES.md](DECISOES.md) — nada aqui pode contrariá-las).
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
> integração com o Neo4j (§4.5).

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
  (`neo4j/consultas`, "arvore completa"): nós `Ano → UnidadeTematica →
  ObjetoConhecimento → Habilidade` e as arestas entre eles.
- **O Ano é um nó** do grafo (não só um filtro).
- **O grafo atual é uma versão resumida** do que a orientadora ainda está
  construindo (hoje: só 1.º ano de Matemática), mas **respeita a estrutura final**
  — a integração deve ser feita para o modelo definitivo, não para este recorte.
- **Não haverá mais sistema de usuários/cadastro.** Login/Signup/perfil mock **não
  devem ser alterados agora** — vão acabar deixando de existir, em etapa futura.

**Material de origem:** [neo4j/exemplo_rosiane_alterado](neo4j/exemplo_rosiane_alterado)
(script Cypher de carga) e [neo4j/consultas](neo4j/consultas) (consultas de teste).
Neo4j local em `http://localhost:7474` (Browser em `/browser/`), banco `neo4j`.

**Estado do banco (conferido em 2026-10-09):** Neo4j 2026.09 Community, Cypher 5/25.
1 `Ano` · 5 `UnidadeTematica` · 17 `ObjetoConhecimento` · 22 `Habilidade`;
relações `TEM_UNIDADE` (5) · `TEM_OBJETO` (17) · `DESENVOLVE` (22) ·
`DESENVOLVE_HABILIDADE` (22, atalho Ano→Habilidade). Propriedades: `Ano{codigo,
nome}`, `UnidadeTematica{nome}`, `ObjetoConhecimento{descricao}`,
`Habilidade{codigo, descricao}`. Sem constraints/índices.

**Direção técnica:** detalhada no roadmap abaixo (arquitetura, contrato, regras e
etapas N0–N12). Em resumo: **Query API HTTP** com `fetch` (sem dependência nova),
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
4. [neo4j/consultas:26](neo4j/consultas) tem erro de sintaxe (falta `)` depois de
   `:UnidadeTematica`).

#### Roadmap da integração — etapas N0–N12

*Proposto em 2026-10-09.* A ordem segue um princípio simples: **primeiro provar que
os dados chegam** (N1–N3), **depois provar que foram entendidos** (N4) e **só então
desenhar** (N5) — se o grafo sair errado, já se sabe em qual camada procurar. Em
seguida voltam, uma a uma, as funções que hoje dependem do mock (N6–N9), o mock sai
(N10) e o site vai para o ar (N11). A barra de filtros **não** é adaptada: vai ser
redesenhada depois, e até lá o lugar dela é de um **console Cypher** para testar a
integração.

- [x] **N0** — Este roadmap *(2026-10-09)*
- [x] **N1** — Conexão: proxy de desenvolvimento e senha fora do código (+ D14) *(2026-10-09)*
- [x] **N2** — Cliente Cypher `src/data/neo4j.js` (sem tela) *(2026-10-12)*
- [x] **N3** — Console Cypher na página de grafos: ver o que chega *(2026-10-12)*
- [x] **N4** — Do resultado ao grafo: extrair nós e relações (em texto) *(2026-10-12)*
- [x] **N5** — Desenhar o grafo no canvas *(2026-10-12)*
- [ ] **N6** — Tipos novos: cores, formas, paletas e legenda
- [ ] **N7** — Painel de detalhe com dados reais
- [ ] **N8** — Expandir e desfazer com Cypher
- [ ] **N9** — Home com dados do Neo4j
- [ ] **N10** — Remoção do mock
- [ ] **N11** — Produção (site no ar)
- [ ] **N12** — Fechamento

**Arquitetura**

```
navegador (React)               servidor do site                     Neo4j
src/data/neo4j.js ──POST /api/cypher──► proxy ──POST /db/neo4j/query/v2──► Query API
   (sem senha)                  (põe a senha, força leitura)          (porta 7474)

desenvolvimento: proxy = Vite (vite.config.js, lê o .env.local)     → N1
produção:        proxy = a definir (mesmo caminho /api/cypher)        → N11
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
  altera o componente.
- Motor do canvas (D3/D4) intacto — física, câmera e tempos. Só a tabela de molas
  por tipo de relação muda, porque os tipos mudaram. Acessibilidade (D6) preservada.
- Bug fora do escopo da etapa → anotar aqui, não corrigir junto.

**Números de referência** — base local de 2026-10-09 (1.º ano de Matemática),
calculados direto no Neo4j. **Mudam quando a orientadora atualizar a base**:
recalcular antes de usar como critério.

| # | Consulta de [neo4j/consultas](neo4j/consultas) | Linhas | Nós | Relações | Relações com "conectar nós" |
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
  com os mesmos dados (rodar [neo4j/exemplo_rosiane_alterado](neo4j/exemplo_rosiane_alterado)
  no Browser dela).
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
`NEO4J` com zero ocorrências em `dist/`. **Falta o teste do autor** (os 4 itens
acima, no `npm run dev` dele — no teste 3, parando o Neo4j de verdade).

**Na outra máquina:** copiar `.env.example` para `.env.local` e preencher a senha;
ter o Neo4j rodando com os mesmos dados (script
[neo4j/exemplo_rosiane_alterado](neo4j/exemplo_rosiane_alterado) no Browser dela).

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
  e anotar aqui — o bloqueio de escrita passa a ser obrigação do proxy (N11).
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
  e sem o rótulo criado. Na N11 o proxy de produção força o modo mesmo assim (o
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
  [neo4j/consultas](neo4j/consultas) — lidas do próprio arquivo (import `?raw`), para
  acompanharem o que a orientadora mandar — e linha de status (linhas · tempos do
  Neo4j · tempo total).
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
- **Exemplos** lidos do próprio [neo4j/consultas](neo4j/consultas) (import `?raw`):
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
novamente"), a aba JSON tipada, o Ctrl+Enter e os tipos na tabela. **Falta o teste
do autor** (itens acima), que também cobre o que ficou sem conferência: avisos,
"Voltar ao início", tema escuro e Neo4j fora do ar.

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
status + chave do console. **Falta o teste do autor** no navegador (itens acima): os
números de cada consulta aparecem na linha de status (`grafo: N nós, M relações`) e na
aba Grafo; alternar a chave refaz a consulta.

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

Verificado: `npm run lint` (0/0), `npm run build` (JS 282,02 → **283,29 kB**; CSS 8,81 →
8,97 kB) e `npm run dev` (os 5 módulos alterados servidos com 200). Testes do assistente
**sem instalar nada** (Vite e React do projeto, no Node, contra servidor temporário), 14
casos: estilo dos 4 rótulos com nós reais (forma, raio, anel, legenda, tooltip — a
descrição de objeto de conhecimento encurtada em 28 caracteres), rótulo desconhecido,
nó sem rótulo nem propriedades, nó com dois rótulos, molas e padrão de 150, tokens nos
**dois temas**, árvore inteira sem nenhum nó caindo no padrão, painel recolhido/aberto
e estados do palco sem o card vazio. **O desenho no canvas só roda no navegador —
falta o teste do autor** (itens acima: a árvore lado a lado com o Browser, arrastar,
pan, zoom, hover/tooltip, tema escuro, A/A, sem animação, repetir a consulta).

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

---

#### N11 — Produção (site no ar)

**Objetivo:** o mesmo `POST /api/cypher` funcionando fora da máquina do autor, com a
senha protegida.

**Decisão antes da etapa (com a orientadora):** onde o Neo4j definitivo vai rodar
(servidor da UFES/LabOtim, Neo4j Aura, outro) e onde o site vai ser publicado. Isso
escolhe o proxy de produção: função serverless (exige o Neo4j acessível por HTTPS),
servidor Node pequeno na mesma máquina do Neo4j (o Neo4j nem precisa ficar exposto
à internet) ou proxy reverso (nginx).

**Obrigatório em qualquer opção:** senha só em variável de ambiente do servidor; o
proxy **força** `accessMode: "READ"` (sobrescreve o que vier do navegador) e/ou a
base de produção fica somente leitura; tempo-limite de transação no Neo4j (uma
consulta pesada não derruba o servidor); HTTPS.

**Decidir também:** se o console Cypher continua visível no site publicado.

**Como testar (autor):** o site publicado roda as consultas de exemplo; a senha não
aparece no código publicado; `CREATE` pelo console falha; uma consulta
propositalmente pesada termina em erro legível.

**Pronto quando:** o site publicado funciona integrado e os testes de segurança
passam.

---

#### N12 — Fechamento

- Relatório no §3 (próximo número de Etapa): o que mudou, números, bugs encontrados.
- Entradas novas no DECISOES.md para o que mudou no caminho (revisão da D7 e da
  D10, desenho genérico no estilo do Browser, arquitetura de produção) — todas com
  parágrafo de monografia.
- §1, §6 e §7 sincronizados (arquivos novos, mock fora).
- Retomar o §4.4 (P3–P5). A linha de base da P1 foi medida com o mock: medir de novo
  antes da P3.

**Fora deste roadmap** (registrado para não se perder): o redesenho dos filtros, da
busca e do deep-link sobre o modelo novo (depois da N10); a remoção do sistema de
contas (roadmap próprio); os pontos de modelagem para a orientadora (lista acima).

## 5. Como ler o protótipo final (arquivo "bundled")

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
- **Roteamento por estado** em [src/App.jsx](src/App.jsx) (`tela` = home/login/signup),
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
  `32` overlays de estado · `40` barra do console Cypher (era a de filtros até a N3) ·
  `60` dropdowns da barra · `120` widget A/A ·
  `190/200` backdrop/dropdown do perfil.
- **Segredos** (senha do Neo4j): só no `.env.local` (não versionado; modelo em
  [.env.example](.env.example)), sempre **sem** o prefixo `VITE_` — o Vite só embute
  no bundle as variáveis `VITE_*`. Quem lê é o proxy `/api/cypher` do
  [vite.config.js](vite.config.js) (N1/D14).
- **Decisões importantes → [DECISOES.md](DECISOES.md)**: toda escolha relevante de
  escopo/arquitetura/biblioteca/dados/acessibilidade ganha uma entrada didática lá
  (problema → decisão → alternativas rejeitadas → fala pronta para a banca →
  **parágrafo de monografia**, em tom acadêmico e com o capítulo onde encaixa), no
  momento em que é tomada. O arquivo é versionado e já contém D1–D10 (retroativas).

## 7. Estrutura de arquivos

```
src/
├── context/ThemeContext.jsx   # tema (claro/escuro) + zoom de fonte
├── components/
│   ├── Logo.jsx               # logo grafo 9 nós + "EduGraph" (Spectral)
│   ├── ThemeToggle.jsx        # toggle sol/lua (já bate com o protótipo)
│   ├── GraphSection.jsx       # seção 2: grafo-globo interativo (Etapa 2 — FEITO)
│   ├── StatsBand.jsx          # seção 3: banda de estatísticas, 3 contadores (Etapa 3 — FEITO)
│   ├── TestimonialsSection.jsx # seção 4: depoimentos + cortina que revela a grade; cards abrem popover;
│   │                          #   "Ver o grafo desta turma" navega com recorte (Etapas 4-6 + G11 — FEITO)
│   ├── MateriaPopover.jsx     # balão de matérias ancorado ao card de série; CTA da G11 (Etapas 6+16 — FEITO)
│   ├── Footer.jsx             # footer / fim do site (Etapa 5 — FEITO)
│   ├── SiteHeader.jsx         # header único (Home + Grafos): nav no centro geométrico, slot de conta
│   │                          #   de largura fixa (ajuste de UX de 2026-07-12)
│   ├── HeroSection.jsx        # hero "Conhecimento conectado." da Home (R7b)
│   ├── GradeCard.jsx          # card de série da grade (abre o MateriaPopover; R7b)
│   ├── LogosInstitucionais.jsx # par de <a> LabOtim/UFES dos headers (R6; o Footer tem variação própria)
│   ├── FontSizeWidget.jsx     # controles A/A de acessibilidade
│   ├── Chave.jsx              # switch 34×20 (primitivo compartilhado grafo + conta)
│   ├── conta/                 # componentes exclusivos das telas de conta (A1–A5 — FEITO)
│   │   ├── MolduraConta.jsx   # moldura: SiteHeader + <main> 1 viewport + Footer de vidro (A1/A4); dona do semAnim
│   │   ├── FundoVertices.jsx  # canvas de partículas atrás do card (porte do particle-network; A2)
│   │   ├── BotaoAcessibilidade.jsx # botão flutuante: toggle "desativar animações e física"
│   │   └── estilos.js         # estilos inline compartilhados dos cards (CARD_VIDRO, ...; A3)
│   └── grafo/                 # componentes exclusivos da página de grafos (R7a)
│       ├── ConsoleCypher.jsx  # barra do console Cypher: consulta, exemplos de neo4j/consultas, Executar (N3)
│       ├── ResultadoCypher.jsx # resultado do console no palco: abas Tabela/JSON + avisos do Neo4j (N3)
│       ├── GrafoFiltros.jsx   # barra de busca/filtros do mock (G3) — SEM USO desde a N3 (decisão na N10)
│       ├── GrafoCanvas.jsx    # canvas 2D: render + física + interações (hover/seleção/drag/pan/zoom,
│       │                      #   2×clique expande; API centrarEm/enquadrar/reaquecer/assentar/zoom± via ref)
│       ├── GrafoPainel.jsx    # painel de contexto "de vidro": detalhe, conexões, expandir, vistos (G7–G8)
│       ├── GrafoOverlays.jsx  # legenda "Tipos de nó", gaveta SPARQL, popover de paleta,
│       │                      #   OpcoesAcessibilidade (G9–G10)
│       ├── GrafoPerfil.jsx    # perfil mock: identidade, turmas, acessibilidade (G10)
│       ├── GrafoEstados.jsx   # overlays de estado do palco: convite/carregando/erro (código + ^) (R7b; N3; vazio saiu na N5)
│       └── estilos.js         # estilos inline compartilhados do domínio (MONO_LABEL, R6)
├── data/
│   ├── neo4j.js               # cliente Cypher do Neo4j: executarCypher() via proxy /api/cypher (N2)
│   ├── estiloGrafo.js         # tabela de estilo: por rótulo (cor, raio, forma, legenda, tooltip, semente)
│   │                          #   e por tipo de relação (mola, tracejado); padrão p/ rótulo novo (N5)
│   ├── extrairGrafo.js        # resultado → nós + relações (puro) e as consultas extras do Browser:
│                              #   pontas que faltam, limite de 300 nós, "conectar nós" (N4)
│   ├── depoimentos.js         # 5 depoimentos (mock; troca futura por SPARQL)
│   ├── paletas.js             # paletas de daltonismo (protan/deuteran/tritanopia) da página de grafos (G9)
│   └── mockFuseki.js          # endpoint SPARQL simulado: 56 nós, 136 arestas (5.º–9.º), consultas reais,
│                              #   estatisticas() e habilidadesPorAno(); alimenta StatsBand, MateriaPopover
│                              #   e a grade de séries (Etapa 8/G2 — FEITO)
├── pages/
│   ├── Home.jsx               # Header + Hero + GraphSection + StatsBand + Testimonials + Footer (Etapas 1-5 — FEITO)
│   ├── Grafos.jsx             # página do grafo — console Cypher (N3) + grafo do Neo4j no canvas (N5) + estados + painel + expandir/desfazer + perfil/prefs (em transição, §4.5)
│   ├── Login.jsx              # card de vidro na MolduraConta; form acessível (A1–A5 — FEITO)
│   └── Signup.jsx             # card de vidro na MolduraConta; form acessível (A1–A5 — FEITO)
├── assets/{ufes,labotim}.png  # logos institucionais (header e footer)
├── App.jsx                    # roteamento por estado
├── main.jsx                   # entrada React
└── index.css                  # design system (tokens + aliases + classes .eg-*)
```
