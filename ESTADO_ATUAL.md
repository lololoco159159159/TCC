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
--accent-hover --line --line-strong --card --bg-soft --mut --*-rgb`) apontando para
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
  [src/assets/labotim.png](src/assets/labotim.png). **Ainda NÃO são exibidos** no
  header — há um comentário marcando o lugar deles (entram na próxima etapa).

Verificado: `npm run build`, `npm run lint` (só 1 warning pré-existente em
ThemeContext.jsx) e `npm run dev` (HTTP 200) OK.

## 4. O que FALTA (próximas etapas)

Em ordem aproximada das seções do protótipo final:

1. **Logos UFES/LabOtim no header** (assets já extraídos; só inserir + divisória).
2. **Seção do grafo interativo** — bloco grande `sticky` com `scroll zone` de ~280vh,
   globo wireframe em SVG, nós das matérias e tooltip "Passe o mouse…". É a parte
   mais complexa (tem JS de animação/canvas no protótipo).
3. **Banda de estatísticas** (`#statsBand`).
4. **Seção de depoimentos** (`sticky`).
5. **Footer** completo.
6. **Redesenho de Login e Signup** com os tokens novos (e remover aliases órfãos).
7. **Back-end**: Apache Jena Fuseki (SPARQL) + lib de visualização de grafo
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
│   └── FontSizeWidget.jsx     # controles A/A de acessibilidade
├── pages/
│   ├── Home.jsx               # Header + Hero (Etapa 1 — FEITO)
│   ├── Login.jsx              # ainda no visual antigo (herda paleta via aliases)
│   └── Signup.jsx             # ainda no visual antigo (herda paleta via aliases)
├── assets/{ufes,labotim}.png  # logos extraídos (ainda não usados)
├── App.jsx                    # roteamento por estado
├── main.jsx                   # entrada React
└── index.css                  # design system (tokens + aliases + classes .eg-*)
```
