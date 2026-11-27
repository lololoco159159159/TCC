# EduGraph

Interface web para navegação em um grafo de conhecimento sobre **Pensamento Computacional na educação básica**, desenvolvida como Trabalho de Conclusão de Curso em Ciência da Computação na UFES.

## O que é

O Pensamento Computacional foi incorporado à Base Nacional Comum Curricular (BNCC) como um conjunto de habilidades esperadas do ensino fundamental ao médio. Na prática, porém, poucos professores sabem como integrar essas habilidades às disciplinas que já lecionam — Matemática, Ciências, Português — sem precisar criar um componente curricular separado.

O EduGraph responde a isso com um **grafo de conhecimento interativo** que mapeia as relações entre:

- Habilidades da **BNCC Computação** (ex.: EF05MA13, EF06MA23)
- **Pilares do Pensamento Computacional** (Decomposição, Reconhecimento de Padrões, Abstração, Algoritmos)
- **Componentes curriculares** já existentes (Matemática, Ciências, Português…)
- **Abordagens pedagógicas** identificadas na literatura (desplugada, plugada, híbrida)
- **Artigos e práticas** mapeados em revisão sistemática da literatura

Um professor de Matemática, por exemplo, pode entrar no grafo, selecionar sua disciplina e descobrir quais habilidades computacionais ela já "base para" — e quais práticas de sala de aula foram testadas e publicadas com esse par.

## Estado atual

Este repositório contém o **front-end React** e a **API em Python** do projeto, já integrados ao grafo de conhecimento real: um banco **Neo4j** montado pela orientadora, consultado em **Cypher**. Hoje o grafo traz o 1.º ano de Matemática e de Ciências e o 2.º ano de Ciências da BNCC (ano → área de conhecimento → componente curricular → unidades temáticas → objetos de conhecimento → habilidades) e vai crescer com outros anos e componentes — que aparecem no site, já com as cores do seu nível, sem mudar o código. O site não guarda dados do grafo: tudo o que aparece vem do Neo4j, pela API, exceto o globo ilustrativo da seção "Cada matéria tem sua rede.", na Home.

**Telas disponíveis:**

| Tela | Descrição |
|---|---|
| Home | Apresentação do projeto; os números, os cards de ano e os componentes de cada turma vêm do Neo4j |
| Grafos | O grafo de conhecimento: busca guiada para o professor, desenho interativo (layout de forças e hierárquico, como no Neo4j Browser), painel com os detalhes de cada nó, expandir e desfazer |
| Fórum | Conversas entre professores — por enquanto uma prévia, com conversas de exemplo |
| Ontologias | Ontologias do currículo para baixar — por enquanto uma prévia, com exemplos |
| Arquiteturas pedagógicas | O professor monta a arquitetura da aula em quatro eixos (metodológico, organizacional, conteúdo e tecnológico) e baixa um documento — por enquanto uma prévia, com opções de exemplo, que guarda as escolhas só no navegador |
| Entrar / Criar conta | Formulários apenas visuais — o site não tem sistema de contas |

**Recursos de acessibilidade:**

- **Modo claro / escuro** — toggle sol/lua na barra de navegação; o modo claro usa fundo creme com acentos verde e dourado, e o escuro inverte para fundo preto com verde e âmbar. A preferência persiste entre sessões.
- **Tamanho de fonte** — botões A/A (na lateral direita ou, na página de grafos, na coluna de controles) ajustam o zoom do site em 6 níveis (60% a 160%). A preferência persiste entre sessões.
- **Cores e formas no grafo** — paletas para protanopia, deuteranopia e tritanopia (cores do Color Universal Design) e formas no lugar das cores.
- **Sem animação** — desliga a física e as animações do grafo e o fundo animado de Entrar / Criar conta.

## Contexto acadêmico

O mapeamento sistemático da literatura foi conduzido no **Parsifal**, cobrindo publicações de 2012 a 2025 sobre Pensamento Computacional na educação básica brasileira. Os artigos selecionados identificaram quais habilidades da BNCC aparecem em práticas computacionais documentadas, quais pilares do PC cada prática mobiliza e em quais disciplinas essas práticas ocorrem.

Esses dados alimentarão o grafo de conhecimento que esta interface visa exibir e tornar navegável para professores da educação básica.

## Tecnologias

- **React 18** + **Vite** — interface e build
- **JavaScript / JSX** — sem TypeScript por ora
- **CSS Variables** — sistema de temas (claro/escuro) sem biblioteca de UI
- **Google Fonts** — Spectral (títulos), Figtree (interface) e JetBrains Mono (rótulos e labels)
- **Python** + **FastAPI** — a API do projeto (pasta `api/`), entre o site e o banco: guarda a senha do Neo4j, impõe o modo somente leitura em toda consulta, é dona das consultas do site (cada uma numa rota, que devolve o Cypher usado junto da resposta) e documenta os próprios endpoints em `/api/docs`
- **Neo4j** — o banco de grafos, consultado em Cypher pela Query API HTTP; o navegador nunca fala direto com ele, só com a API
- **Canvas 2D** — motor de visualização próprio, sem biblioteca de grafos: a física reproduz a do Neo4j Browser (as forças do d3-force, reimplementadas) e há um layout hierárquico em camadas

## Como rodar o projeto

O projeto tem duas partes que rodam juntas: o **site** (React, porta 5173) e a **API** (Python, porta 8000). O site repassa para a API tudo o que começa com `/api/`, e a API consulta o Neo4j.

### 1. Instalar o Node.js e o Python

São necessários o **Node.js** (com o npm) e o **Python 3.10 ou mais novo** (o projeto foi testado com o 3.14).

**Ubuntu / Debian:**

```bash
sudo apt update
sudo apt install -y nodejs npm python3 python3-venv
```

**Windows / macOS:** instale o Node.js de https://nodejs.org e o Python de https://www.python.org.

### 2. Instalar as dependências (uma vez)

Na pasta do projeto:

```bash
npm install
```

Depois, as da API, num ambiente isolado do Python (a pasta `.venv`, que não vai para o git):

```bash
python3 -m venv .venv
.venv/bin/pip install -r api/requirements.txt
```

No **Windows**, use `python` no lugar de `python3` e `.venv\Scripts\pip` no lugar de `.venv/bin/pip`.

### 3. Configurar o acesso ao Neo4j

É preciso ter um Neo4j rodando com os dados do grafo (o script de carga é material da orientadora e não fica no repositório). Copie o modelo de configuração e preencha a senha do banco (`NEO4J_PASSWORD`):

```bash
cp .env.example .env.local
```

(No Windows: `copy .env.example .env.local`.) O `.env.local` não vai para o git, e a senha nunca chega ao navegador: quem a usa é a API.

### 4. Subir a API e o site

Em **dois terminais**, na pasta do projeto:

```bash
npm run api     # terminal 1: a API, em http://localhost:8000
npm run dev     # terminal 2: o site, em http://localhost:5173
```

Abra http://localhost:5173 no navegador. As alterações em `src/` e em `api/` são aplicadas sozinhas (hot reload).

No **Windows**, o `npm run api` não funciona (ele usa o caminho do Linux/macOS); rode a API assim: `.venv\Scripts\uvicorn main:app --app-dir api --reload --reload-dir api --port 8000`.

**Para conferir:** http://localhost:8000/api/saude deve responder `{"api": "ok", "neo4j": "ok"}`. A documentação interativa da API, com todos os endpoints, fica em http://localhost:8000/api/docs (ou em http://localhost:5173/api/docs, pelo site). Se a API estiver parada, o site avisa: "Não foi possível conectar à API do EduGraph…".

---

### Outros comandos

```bash
npm run build       # gera versão otimizada do site em dist/
npm run preview     # serve a versão de build localmente (também precisa da API)
npm run lint        # verifica a qualidade do código do site
```

## Estrutura do projeto

```
src/                    # o site (React)
├── context/            # tema (claro/escuro) e tamanho de fonte
├── components/         # componentes compartilhados e as seções da Home
│   ├── grafo/          # página de grafos: canvas, painel, busca, overlays
│   └── conta/          # moldura, fundo animado e botão das telas de Entrar / Criar conta
├── data/               # acesso à API, filtros da busca, estilo do grafo, física e layout
├── pages/              # Home, Grafos, Fórum, Ontologias, Arquiteturas, Login, Signup
├── App.jsx             # roteamento por estado
├── main.jsx            # ponto de entrada React
└── index.css           # design system (variáveis de tema, classes .eg-*)

api/                    # a API (Python + FastAPI)
├── main.py             # a aplicação: a saúde, os erros e a documentação em /api/docs
├── neo4j.py            # a conexão com o Neo4j, sempre em modo somente leitura
├── grafo.py            # as consultas do site, por assunto: anos, áreas, componentes, recorte, perguntas da busca…
├── forum.py            # ┐ arquivos base: as rotas previstas do fórum, das ontologias, das
├── ontologias.py       # │ arquiteturas pedagógicas e do assistente — já aparecem em
├── arquiteturas.py     # │ /api/docs, mas ainda não foram implementadas (respondem 501)
├── ia.py               # ┘
└── requirements.txt    # as dependências da API
```


---

TCC — Ciência da Computação · UFES · 2026
