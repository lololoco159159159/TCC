import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Em desenvolvimento, o servidor do Vite repassa tudo o que começa com /api/
// para a API do EduGraph (pasta api/, em Python — `npm run api`). É ela que
// guarda a senha do Neo4j e impõe o modo somente leitura: o navegador nunca fala
// direto com o banco, e nenhuma credencial passa por aqui. Vale para
// `npm run dev` e `npm run preview`. O endereço da API vem de API_URL
// (.env.local, opcional), com http://localhost:8000 como padrão.
function proxyApi(env) {
  const url = env.API_URL || 'http://localhost:8000'
  return {
    target: url,
    changeOrigin: true,
    // API fora do ar: o padrão do Vite responde 500 com corpo vazio. Aqui a
    // falha sai no MESMO formato de erro da API e do Neo4j ({ errors: [{ code,
    // message }] }), para o site tratar tudo de um jeito só. Este listener é
    // registrado antes do listener do Vite, que então só registra a falha.
    configure(proxy) {
      proxy.on('error', (err, _req, res) => {
        if (!res || !('writeHead' in res) || res.headersSent) return
        res.writeHead(502, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            errors: [
              {
                code: 'EduGraph.Proxy.ApiIndisponivel',
                message: `Não foi possível conectar à API do EduGraph em ${url} (${err.code || err.message}). Ela está rodando? (npm run api)`,
              },
            ],
          }),
        )
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // prefixo '' = carrega TODAS as variáveis do .env.local, não só as VITE_*;
  // elas ficam neste processo Node e não chegam ao navegador
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = { '/api/': proxyApi(env) }
  return {
    plugins: [react()],
    server: {
      proxy,
      // o ambiente do Python da API (.venv) tem milhares de arquivos que o Vite
      // não precisa vigiar
      watch: { ignored: ['**/.venv/**'] },
    },
    preview: { proxy },
  }
})
