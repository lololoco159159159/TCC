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

Este repositório contém o **front-end React** do projeto, já integrado ao grafo de conhecimento real: um banco **Neo4j** montado pela orientadora, consultado em **Cypher**. Hoje o grafo traz o 1.º ano de Matemática da BNCC (ano → unidades temáticas → objetos de conhecimento → habilidades) e vai crescer com outros anos e matérias. O site não guarda dados do grafo: tudo o que aparece vem do Neo4j, exceto o globo ilustrativo da seção "Cada matéria tem sua rede.", na Home.

O andamento detalhado — o que já foi feito, o que falta e as decisões de projeto — está em [ESTADO_ATUAL.md](ESTADO_ATUAL.md) e [guia/DECISOES.md](guia/DECISOES.md).

**Telas disponíveis:**

| Tela | Descrição |
|---|---|
| Home | Apresentação do projeto; os números e os cards de ano vêm do Neo4j |
| Grafos | O grafo de conhecimento: consulta em Cypher, desenho interativo (layout de forças e hierárquico, como no Neo4j Browser), painel com os detalhes de cada nó, expandir e desfazer |
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
- **Neo4j** — o banco de grafos, consultado em Cypher pela Query API HTTP, sempre através de um proxy (`/api/cypher`) que guarda a senha. O site pede modo somente leitura em toda consulta; impor isso também no proxy fica para a publicação
- **Canvas 2D** — motor de visualização próprio, sem biblioteca de grafos: a física reproduz a do Neo4j Browser (as forças do d3-force, reimplementadas) e há um layout hierárquico em camadas

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

### 3. Configurar o acesso ao Neo4j

É preciso ter um Neo4j rodando com os dados do grafo (o script de carga é material da orientadora e não fica no repositório). Copie o modelo de configuração e preencha a senha do banco:

```bash
cp .env.example .env.local
```

O `.env.local` não vai para o git, e a senha nunca entra no código enviado ao navegador: quem a usa é o proxy do servidor de desenvolvimento.

### 4. Subir o servidor de desenvolvimento

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
├── context/            # tema (claro/escuro) e tamanho de fonte
├── components/         # componentes compartilhados e as seções da Home
│   ├── grafo/          # página de grafos: canvas, painel, console Cypher, overlays
│   └── conta/          # moldura, fundo animado e botão das telas de Entrar / Criar conta
├── data/               # acesso ao Neo4j, consultas, estilo do grafo, física e layout
├── pages/              # Home, Grafos, Login, Signup
├── App.jsx             # roteamento por estado
├── main.jsx            # ponto de entrada React
└── index.css           # design system (variáveis de tema, classes .eg-*)
```

A estrutura completa, arquivo por arquivo, está no §7 do [ESTADO_ATUAL.md](ESTADO_ATUAL.md).

---

TCC — Ciência da Computação · UFES · 2026
