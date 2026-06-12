# EduGraph — Front-end do TCC

Implementação em React do front-end do meu TCC (Ciência da Computação — UFES),
voltado à exploração de um grafo de conhecimento educacional construído a partir
da BNCC e de estratégias pedagógicas relacionadas ao Pensamento Computacional.

## Estado atual

O site (**EduGraph**) tem três telas navegáveis:

- **Home** — apresentação do projeto, com botões de acesso
- **Entrar** — formulário de login com validação
- **Criar conta** — formulário de cadastro com validação

A autenticação ainda é apenas visual (sem back-end). A integração com o
Apache Jena Fuseki (SPARQL) e a visualização do grafo são trabalho futuro (TCC2).

## Pré-requisitos

- **Node.js** 18 ou superior (recomendado: versão LTS) — https://nodejs.org
- **npm** (já vem junto com o Node.js)

Para conferir se estão instalados:

```bash
node --version
npm --version
```

## Como rodar

1. Clone o repositório e entre na pasta `site/`:

   ```bash
   cd site
   ```

2. Instale as dependências (só precisa na primeira vez):

   ```bash
   npm install
   ```

3. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra http://localhost:5173 no navegador. As alterações nos arquivos de
   `src/` atualizam a tela automaticamente ao salvar.

Para parar o servidor: `Ctrl+C` no terminal.

## Comandos disponíveis

| Comando           | O que faz                                            |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Sobe o servidor de desenvolvimento (uso no dia a dia)|
| `npm run build`   | Gera a versão otimizada para produção em `dist/`     |
| `npm run preview` | Serve localmente a versão de build para conferência  |
| `npm run lint`    | Verifica problemas de qualidade no código            |

## Dependências

**Produção:**

- `react` ^18.3 — biblioteca de interface
- `react-dom` ^18.3 — renderização do React no navegador

**Desenvolvimento:**

- `vite` ^5.4 — build e servidor de desenvolvimento
- `@vitejs/plugin-react` — suporte a React/JSX no Vite
- `eslint` + plugins de React — análise de qualidade de código

Tudo é instalado automaticamente com `npm install` (lista completa no
`package.json`). As fontes Inter e IBM Plex Mono são carregadas do Google
Fonts pelo `index.html` — é preciso estar online para que apareçam.

## Estrutura do projeto

Explicação detalhada de cada arquivo e pasta em
[ESTRUTURA_DO_PROJETO.txt](ESTRUTURA_DO_PROJETO.txt).
