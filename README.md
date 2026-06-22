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

Este repositório contém o **front-end React** do projeto. Por enquanto, as telas estão implementadas com dados estáticos; a integração com o servidor de grafos (Apache Jena Fuseki via SPARQL) está prevista para a segunda etapa do TCC.

**Telas disponíveis:**

| Tela | Descrição |
|---|---|
| Home | Apresentação do projeto com acesso ao login e cadastro |
| Entrar | Formulário de autenticação (visual; sem back-end ainda) |
| Criar conta | Formulário de cadastro (visual; sem back-end ainda) |

**Recursos de acessibilidade:**

- **Modo claro / escuro** — toggle sol/lua na barra de navegação; no modo escuro o acento visual muda de verde para roxo. A preferência persiste entre sessões.
- **Tamanho de fonte** — botões A/A na lateral direita ajustam o zoom do site em 6 níveis (60% a 160%). A preferência persiste entre sessões.

## Contexto acadêmico

O mapeamento sistemático da literatura foi conduzido no **Parsifal**, cobrindo publicações de 2012 a 2025 sobre Pensamento Computacional na educação básica brasileira. Os artigos selecionados identificaram quais habilidades da BNCC aparecem em práticas computacionais documentadas, quais pilares do PC cada prática mobiliza e em quais disciplinas essas práticas ocorrem.

Esses dados alimentarão o grafo de conhecimento que esta interface visa exibir e tornar navegável para professores da educação básica.

## Tecnologias

- **React 18** + **Vite** — interface e build
- **JavaScript / JSX** — sem TypeScript por ora
- **CSS Variables** — sistema de temas (claro/escuro) sem biblioteca de UI
- **Google Fonts** — Inter (interface) e IBM Plex Mono (rótulos e labels)
- Futuro: **Apache Jena Fuseki** (servidor SPARQL) e biblioteca de visualização de grafos (Cytoscape.js, react-force-graph ou D3.js — a definir)

## Como rodar localmente

### 1. Instalar o Node.js e o npm

**Ubuntu / Debian:**

```bash
sudo apt update
sudo apt install -y nodejs npm
```

### 2. Instalar as dependências do projeto

Na pasta do projeto, rode **uma vez**:

```bash
npm install
```

### 3. Subir o servidor de desenvolvimento

```bash
npm run dev
```

Abra http://localhost:5173 no navegador. As alterações em `src/` atualizam a tela automaticamente (hot reload).

---

### Outros comandos

```bash
npm run build    # gera versão otimizada em dist/
npm run preview  # serve a versão de build localmente
npm run lint     # verifica qualidade do código
```

## Estrutura do projeto

```
src/
├── context/
│   └── ThemeContext.jsx     # estado global de tema e tamanho de fonte
├── components/
│   ├── Logo.jsx             # logo SVG do EduGraph
│   ├── ThemeToggle.jsx      # botão sol/lua (modo claro/escuro)
│   └── FontSizeWidget.jsx   # controles A/A de acessibilidade
├── pages/
│   ├── Home.jsx             # tela inicial
│   ├── Login.jsx            # tela de Entrar
│   └── Signup.jsx           # tela de Criar conta
├── App.jsx                  # roteamento por estado
├── main.jsx                 # ponto de entrada React
└── index.css                # design system (variáveis de tema, classes .eg-*)
```

---

TCC — Ciência da Computação · UFES · 2026
