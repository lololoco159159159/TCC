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

Última atualização: 2026-07-12.

---

## 1. Visão geral

Front-end React + Vite do EduGraph (ver [README.md](README.md) para o contexto
acadêmico completo). Sem back-end por enquanto — só as telas, com dados estáticos.
A integração com o servidor de grafos (Apache Jena Fuseki / SPARQL) é etapa futura.

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

### Aliases de compatibilidade (importante!)
`index.css` ainda define aliases dos nomes **antigos** (`--ink --accent
--accent-hover --line --line-strong --card --bg-soft --mut --accent-rgb`) apontando para
os novos tokens. Isso mantém **Login** e **Signup** funcionando com a paleta nova
**antes** de serem migrados. Ao migrar essas telas para os tokens novos, remover os
aliases que deixarem de ser usados.

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

## 4. O que FALTA (próximas etapas)

A landing (Home, Etapas 1–6) e a **página de grafos (G1–G11, Etapas 7–16)** estão
completas. Restam:

0. **Revisão e polimento do código** — roadmap R0–R7 em **§4.2** (em andamento;
   fazer ANTES das frentes abaixo).
1. **Redesenho de Login e Signup** com os tokens novos (e remover aliases órfãos).
2. **Back-end**: subir um Apache Jena Fuseki real e trocar o mock
   (`src/data/mockFuseki.js`, etapa G2) por `fetch` ao endpoint SPARQL — ver a
   receita no cabeçalho do próprio mock e a decisão D1 em [DECISOES.md](DECISOES.md).

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
`npm run dev` (200). Commit só com os três verdes. Ao final de tudo: rodar o
checklist de regressão (abaixo) no navegador.

- [x] **Pré-passo — commit do trabalho pendente**: há mudanças não commitadas
  (G11 + ajustes do autor no GrafoPerfil + .gitignore). Commitar como estão, com
  mensagem própria (ex.: "G11: integração Home–Grafos + ajustes de perfil"), ANTES
  de qualquer limpeza — nenhuma fase pode misturar limpeza com trabalho anterior.
  Anotar o tamanho do bundle (`npm run build`) como baseline.
- [x] **R0 — Este roadmap** *(2026-07-12)*: seção §4.2 + checklist de regressão.
- [ ] **R1 — Código morto seguro** (inventário 2026-07-12, conferir no grep antes):
  (a) `App.jsx` ~linha 54: remover a prop `onLogin` passada a `<Grafos>` — a página
  não a aceita desde a G10 (assinatura `function Grafos({ onHome, onSignup,
  onGrafos })`); (b) `index.css`: remover os aliases `--accent-hover`,
  `--accent-rgb`, `--line-strong` (zero usos no projeto); atualizar a lista de
  aliases no §2 deste arquivo. **Manter deliberadamente** (anotar no relatório):
  `--green-soft` (token da paleta documentada do protótipo, §2 — sem uso hoje, pode
  servir ao redesenho de Login/Signup); aliases usados por Login/Signup/
  FontSizeWidget (`--ink --accent --line --card --bg-soft --mut`); exports do
  mockFuseki sem uso interno (contrato público, D1). ESLint já garante que não há
  imports/variáveis órfãos; não há código comentado nem assets órfãos;
  `package.json` está mínimo (react/react-dom).
- [ ] **R2 — Comentários**: corrigir os desatualizados já achados —
  `src/data/paletas.js:5` ("persistência… chega na G10": G10 feita, persiste via
  `edugraphPrefs`) e `src/components/GrafoPainel.jsx:~14` ("posição/largura
  persistem… na G10; por ora vivem no estado da página": já persistem) — e varrer
  TODOS os cabeçalhos de componente comparando o que afirmam com o código (buscar
  por "chega na G", "fica para a G", "próxima etapa", "por ora"). Remover ruído
  (comentário que só repete a linha). **PRESERVAR** os porquês: proveniência do
  protótipo, constantes da física (GrafoCanvas), bug de ordem de efeitos do tema
  (GrafoCanvas, correção Etapa 9), chave do cache de cores (3 tokens, correção
  2026-07-11), guardas de sequência (`seq/meuSeq`), clamps, desvios documentados
  (CTA da G11, Habilidades fixas, pointerleave/touch-action). Onde faltar um porquê
  em código não-óbvio, adicionar (curto, em português).
- [ ] **R3 — CSS + escala de z-index**: reorganizar `index.css` em blocos com
  sumário no topo (ordem: tokens claro → tokens dark → aliases de compatibilidade →
  reset/base → keyframes → classes por área: nav/global, home/matéria,
  grafos-barra, grafos-palco/zoom, painel, perfil/turmas, formas) — **sem alterar
  nenhuma regra, seletor ou valor** (diff = só movimentação e comentários).
  Documentar a escala de z-index em comentário no topo do index.css e em uma linha
  no §6: `1–8` camadas internas da landing · `20` GradeCard aberto · `30` painel de
  contexto/MateriaPopover · `32` overlays de estado do palco · `40` barra de
  filtros · `60` dropdowns da barra (sugestões/turmas) · `120` widget A/A ·
  `190/200` backdrop/dropdown do perfil. Nenhum valor muda.
- [ ] **R4 — Constantes nomeadas** (valores IDÊNTICOS; só dar nome + comentário):
  em `Grafos.jsx`: 770ms (seleção pós-busca = 420 do enquadrar + 350, protótipo),
  250ms (callback pós-expansão), 30ms (assentar ao ligar semAnim), 150ms (debounce
  de prefs), `VISTOS_MAX = 5`, `HISTORICO_EXPANSAO_MAX = 10`; em `GrafoCanvas.jsx`:
  `ZOOM_MIN = 0.18` / `ZOOM_MAX = 3` (aparecem 3×: wheel, zoomCam — conferir
  enquadrar que usa clamp próprio 0.2–1.5, é OUTRO limite, não unificar); em
  `GrafoPainel.jsx`: limites de arrasto/resize 8/320/620 (o `PAINEL_PADRAO`
  {x:12, w:392} já existe em Grafos.jsx). **Física do canvas intocada** (2800/12,
  molas 130/175/205×0.028, 0.0045, 0.86, 0.988 — já documentada inline, D4).
- [ ] **R5 — Warning do ThemeContext** (o único do lint): o hook `useTheme` é
  exportado junto do Provider em `src/context/ThemeContext.jsx:77` (regra
  react-refresh/only-export-components). Resolver SEM mudança de comportamento:
  criar `src/context/useTheme.js` com o `createContext` + `useTheme` (o contexto
  passa a ser importado pelo Provider); `ThemeContext.jsx` exporta SÓ o
  `ThemeProvider`; atualizar os consumidores — `ThemeToggle.jsx`,
  `FontSizeWidget.jsx`, `App.jsx` (import do hook muda de caminho). Resultado
  esperado: **lint com 0 erros e 0 warnings**.
- [ ] **R6 — Duplicações triviais**: (a) `MONO_LABEL` está idêntico em 3 arquivos
  (`GrafoPainel.jsx`, `GrafoOverlays.jsx`, `GrafoPerfil.jsx`) → mover para
  `src/components/grafo/estilos.js` (módulo `.js` SEM componente — não dispara o
  warning react-refresh; se a R7a ainda não rodou, criar já na pasta nova);
  (b) o par de `<a>` LabOtim/UFES aparece 3× (`Home.jsx` header — img 24px, padding
  '6px 12px'; `Grafos.jsx` header — img 22px, padding '5px 10px'; `Footer.jsx` —
  conferir tamanhos) → componente `LogosInstitucionais` parametrizado para que o
  DOM resultante fique IDÊNTICO nos 3 usos (diferenças viram props; comparar com o
  render atual antes/depois). **NÃO extrair** (variações sutis — anotar no
  relatório): padrões Esc/clique-fora (MateriaPopover usa mousedown no document
  ancorado no card; GrafoPerfil usa backdrop; Grafos usa keydown global; sugestões
  usam blur) e estilos de `<select>` (GrafoFiltros × SELECT_TURMA não são iguais).
- [ ] **R7a — Pasta por domínio**: `git mv` de GrafoCanvas/GrafoFiltros/
  GrafoPainel/GrafoPerfil/GrafoOverlays (+ `estilos.js` da R6) para
  `src/components/grafo/`; atualizar imports (Grafos.jsx e imports internos entre
  eles) e o §7 deste arquivo. Commit só de moves (diff legível).
- [ ] **R7b — Fragmentação de arquivos grandes** (movimentos PUROS de JSX com
  props explícitas; nada de lógica nova; tamanhos em 2026-07-12: Grafos 1149,
  GrafoPainel 639, GrafoCanvas 597, Testimonials 559, Home 281):
  (a) `Home.jsx` → extrair `components/HomeHeader.jsx` (header: logo, nav, logos
  institucionais, ThemeToggle, Entrar/Criar conta — props onLogin/onSignup/
  onGrafos) e `components/HeroSection.jsx` (hero 2 colunas — props onLogin/
  onSignup); Home vira composição pura como as demais seções;
  (b) `Grafos.jsx` → extrair `components/grafo/GrafoEstados.jsx` com os 4 overlays
  de estado (card-convite, carregando+skeleton — a const SKELETON vai junto —,
  erro, vazio; ~330 linhas de JSX; props: status, msgErro, e callbacks
  tentarNovamente/limpar); meta: página ≤ ~800 linhas;
  (c) `TestimonialsSection.jsx` → extrair a função `GradeCard` (já é componente
  separado no arquivo, ~28–95) para `components/GradeCard.jsx` (leva o
  MateriaPopover junto no import).
  **NÃO fragmentar** (anotar no relatório): GrafoCanvas (motor coeso — D3),
  GrafoPainel (um único aside), GrafoOverlays (já modular, 4 exports pequenos),
  mockFuseki (contrato — D1).
- [ ] **Fechamento**: entrada "Limpeza e polimento (R0–R7)" no histórico (§3) com o
  **relatório**: removido/consolidado/fragmentado (com motivo), mantido
  deliberadamente (lista das fases acima), bugs encontrados e NÃO corrigidos;
  atualizar §6 (convenção de handlers on*/ao* + escala de z-index) e §7 (árvore
  nova); adicionar **D11 ao DECISOES.md** (convenções consolidadas: escala de
  z-index, handlers, organização por domínio — formato completo do cabeçalho,
  incluindo o parágrafo de monografia); comparar bundle final × baseline do
  pré-passo; autor roda o checklist de regressão abaixo.

#### Checklist de regressão manual (rodar ao final da revisão, no navegador)

Compilado das notas "Verificado/Teste manual" das Etapas 1–16. Tema claro E escuro
onde fizer sentido.

**Home:** hero renderiza (título Spectral, CTAs Criar conta/Entrar) · nav Grafos
navega · globo da GraphSection gira com o scroll e hover realça vizinhos ·
contadores da StatsBand contam 1 única vez ao entrar na tela · depoimentos desfilam
e a cortina revela a grade · GradeCard abre popover (fecha no ×, clique fora, Esc);
chips selecionam; **"Ver o grafo desta turma"** abre a página consultando
`?serie=X(&disciplina=Y)` (pill de resumo confere) · "Ver todos os grafos →" e
links do Footer navegam.

**Grafos — fluxo básico:** card-convite no início · pills de série com 3 estados +
selects + prévia "N vértices" + Filtrar (esmaecido sem mudança) + Limpar ·
carregando mostra skeleton + spinner · vazio e erro mostram os cards (Tentar
novamente/Voltar/Limpar funcionam) · resumo do recorte no topo confere nós/
conexões/ms.

**Grafos — busca:** autocomplete com bolinhas por tipo; Enter escolhe a 1ª; Esc
fecha · matéria/conceito aplicam na hora · habilidade JÁ no grafo: seleciona e
centra sem reconsultar · habilidade FORA: abre o recorte do ano dela e
seleciona/centra ~0,8s depois.

**Grafos — canvas:** hover mostra tooltip e esmaece não-vizinhos (rótulo da aresta
aparece) · clique seleciona (anel); clique no vazio desseleciona; Esc limpa ·
arrastar nó move com a física acompanhando · pan e wheel-zoom ancorado no cursor ·
botões +/−/recentrar · 2×clique expande.

**Grafos — painel:** cheat-sheet sem seleção · com seleção: código, texto
normativo (spinner antes), pills, conexões navegam (item fora do recorte tem
"+ expandir" e expande) · botão "Expandir conexões deste nó" · arrastar pela alça,
redimensionar pela borda, esconder → aba "Painel" reabre · vistos por último
navegam · a câmera enquadra à direita do painel.

**Grafos — expandir/desfazer:** expansão NÃO re-enquadra a câmera · "Desfazer
expansão ×N" volta passo a passo e some no zero · recorte novo zera o histórico.

**Grafos — overlays:** legenda: Habilidades fixa (selo FIXO), Conceitos/Matérias
alternam reconsultando (contagem vira "—") · gaveta SPARQL mostra a consulta real
(com FILTER ao ocultar tipo) + ms; checkbox 503 faz o próximo Filtrar cair no erro
(bolinha dourada) · paleta: 4 opções recolorem canvas E pontinhos DOM (testar
protanopia↔deuteranopia, que compartilham 2 cores); Padrão volta · formas: conceito
quadrado/matéria triângulo no canvas e nos pontinhos · sem animação: recorte novo
assenta instantâneo.

**Grafos — perfil/turmas/persistência:** perfil abre/fecha (backdrop, Esc);
alterar senha mostra aviso · adicionar turma (dedupe), remover, Filtrar aplica
recorte · botão Turmas na barra idem + "Gerenciar turmas no perfil" · **reload
preserva** paleta/formas/semAnim/turmas/posição+largura+esc do painel · deep-link
`?serie=7&disciplina=matematica` direto abre consultando · sair do grafo limpa a
URL.

**Global:** tema claro↔escuro em ambas as páginas (canvas acompanha na hora, sem
cor do tema anterior) · widget A/A muda a fonte, persiste no reload e some com
fade quando o popover de paleta abre · lint 0/0, build sem dependência nova,
bundle ≤ baseline.

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
- Use sempre `var(--token)` (sem fallback `,#hex`) ao portar trechos do protótipo,
  porque os tokens estão definidos globalmente.
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
│   ├── GrafoFiltros.jsx       # barra de busca/filtros da página de grafos (Etapa 9/G3 — FEITO)
│   ├── GrafoCanvas.jsx        # canvas 2D do grafo: render + física + interações (hover/seleção/drag/pan/zoom,
│   │                          #   2×clique expande; API centrarEm/enquadrar/reaquecer/zoom± via ref) (G4–G8 — FEITO)
│   ├── GrafoPainel.jsx        # painel de contexto "de vidro": detalhe do nó, conexões por relação,
│   │                          #   expandir conexões, vistos por último, assistente (placeholder) (G7–G8 — FEITO)
│   ├── GrafoOverlays.jsx      # legenda "Tipos de nó" (toggle reconsulta), gaveta SPARQL (consulta real +
│   │                          #   simular falha 503), popover de paleta/daltonismo e OpcoesAcessibilidade
│   │                          #   (paletas + formas + sem animação) (G9–G10 — FEITO)
│   ├── GrafoPerfil.jsx        # perfil mock do header: identidade, turmas (filtro rápido) e acessibilidade;
│   │                          #   prefs em localStorage['edugraphPrefs'] (Etapa 15/G10 — FEITO)
│   └── FontSizeWidget.jsx     # controles A/A de acessibilidade
├── data/
│   ├── depoimentos.js         # 5 depoimentos (mock; troca futura por SPARQL)
│   ├── paletas.js             # paletas de daltonismo (protan/deuteran/tritanopia) da página de grafos (G9)
│   └── mockFuseki.js          # endpoint SPARQL simulado: 56 nós, 136 arestas (5.º–9.º), consultas reais,
│                              #   estatisticas() e habilidadesPorAno(); alimenta StatsBand, MateriaPopover
│                              #   e a grade de séries (Etapa 8/G2 — FEITO)
├── pages/
│   ├── Home.jsx               # Header + Hero + GraphSection + StatsBand + Testimonials + Footer (Etapas 1-5 — FEITO)
│   ├── Grafos.jsx             # página do grafo — filtros + estados + canvas + painel + expandir/desfazer + overlays + perfil/prefs (G1–G11 — COMPLETA contra o mock)
│   ├── Login.jsx              # layout antigo; fontes/paleta já normalizadas (via aliases)
│   └── Signup.jsx             # layout antigo; fontes/paleta já normalizadas (via aliases)
├── assets/{ufes,labotim}.png  # logos institucionais (header e footer)
├── App.jsx                    # roteamento por estado
├── main.jsx                   # entrada React
└── index.css                  # design system (tokens + aliases + classes .eg-*)
```
