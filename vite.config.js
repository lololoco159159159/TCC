import { Buffer } from 'node:buffer'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy do Neo4j (N1 — ESTADO_ATUAL.md §4.5; decisão D14). O navegador chama
// POST /api/cypher SEM credencial; o servidor do Vite repassa para a Query API
// (/db/<banco>/query/v2) acrescentando o Authorization. A senha mora no
// .env.local (ignorado pelo git) e é lida aqui, no processo Node — como as
// variáveis NEO4J_* não têm o prefixo VITE_, o Vite não as embute no bundle.
// Vale para `npm run dev` e `npm run preview`; no site publicado, o mesmo
// caminho /api/cypher será atendido pelo proxy de produção (N11).
function proxyNeo4j(env) {
  const url = env.NEO4J_URL || 'http://localhost:7474'
  const banco = env.NEO4J_DATABASE || 'neo4j'
  const usuario = env.NEO4J_USER || 'neo4j'
  const senha = env.NEO4J_PASSWORD
  const credencial = senha ? Buffer.from(`${usuario}:${senha}`).toString('base64') : null
  return {
    target: url,
    changeOrigin: true,
    rewrite: () => `/db/${banco}/query/v2`,
    // sobrescreve qualquer Authorization que venha do navegador
    headers: credencial ? { Authorization: `Basic ${credencial}` } : {},
    // Neo4j fora do ar: o padrão do Vite responde 500 com corpo vazio. Aqui a
    // falha sai no MESMO formato de erro da Query API ({ errors: [{ code,
    // message }] }), para o front tratar tudo de um jeito só. Este listener é
    // registrado antes do listener do Vite, que então só loga a falha.
    configure(proxy) {
      proxy.on('error', (err, _req, res) => {
        if (!res || !('writeHead' in res) || res.headersSent) return
        res.writeHead(502, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            errors: [
              {
                code: 'EduGraph.Proxy.Neo4jIndisponivel',
                message: `Não foi possível conectar ao Neo4j em ${url} (${err.code || err.message}).`,
              },
            ],
          }),
        )
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // prefixo '' = carrega TODAS as variáveis do .env.local, não só as VITE_*;
  // elas ficam neste processo Node e não chegam ao navegador
  const env = loadEnv(mode, process.cwd(), '')
  if (command === 'serve' && !env.NEO4J_PASSWORD) {
    console.warn('[neo4j] NEO4J_PASSWORD não definida — copie .env.example para .env.local e preencha a senha.')
  }
  const proxy = { '/api/cypher': proxyNeo4j(env) }
  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
  }
})
