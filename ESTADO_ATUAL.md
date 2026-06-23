# Estado atual da implementação — EduGraph (TCC)

> este arquivo é a fonte de
> verdade do andamento do projeto e **é versionado no git**. O `CLAUDE.md` está no
> `.gitignore` (não sincroniza entre máquinas), então o estado real do trabalho
> mora **aqui**. Ao iniciar uma sessão, leia este arquivo primeiro e, ao concluir
> uma etapa, atualize-o.

Última atualização: 2026-06-22.

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
  keyframe `egFadeUp` adicionados em [src/index.css](src/index.css). **Fora de escopo:** a
  fase 2 do protótipo (cortina revelando cards de séries) e o WebGL.
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

## 4. O que FALTA (próximas etapas)

Em ordem aproximada das seções do protótipo final:

1. **Footer** completo.
2. **Redesenho de Login e Signup** com os tokens novos (e remover aliases órfãos).
3. **Back-end**: Apache Jena Fuseki (SPARQL) + lib de visualização de grafo
   (Cytoscape.js / react-force-graph / D3 — a definir).

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

## 7. Estrutura de arquivos

```
src/
├── context/ThemeContext.jsx   # tema (claro/escuro) + zoom de fonte
├── components/
│   ├── Logo.jsx               # logo grafo 9 nós + "EduGraph" (Spectral)
│   ├── ThemeToggle.jsx        # toggle sol/lua (já bate com o protótipo)
│   ├── GraphSection.jsx       # seção 2: grafo-globo interativo (Etapa 2 — FEITO)
│   ├── StatsBand.jsx          # seção 3: banda de estatísticas, 3 contadores (Etapa 3 — FEITO)
│   ├── TestimonialsSection.jsx # seção 4: depoimentos, card deslizante/parede (Etapa 4 — FEITO)
│   └── FontSizeWidget.jsx     # controles A/A de acessibilidade
├── data/
│   └── depoimentos.js         # 5 depoimentos (mock; troca futura por SPARQL)
├── pages/
│   ├── Home.jsx               # Header + Hero + GraphSection + StatsBand + Testimonials (Etapas 1-4 — FEITO)
│   ├── Login.jsx              # layout antigo; fontes/paleta já normalizadas (via aliases)
│   └── Signup.jsx             # layout antigo; fontes/paleta já normalizadas (via aliases)
├── assets/{ufes,labotim}.png  # logos institucionais (exibidos no header)
├── App.jsx                    # roteamento por estado
├── main.jsx                   # entrada React
└── index.css                  # design system (tokens + aliases + classes .eg-*)
```
