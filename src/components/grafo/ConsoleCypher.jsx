import { useRef, useState } from 'react'
import { CONSULTAS_EXEMPLO as EXEMPLOS } from '../../data/consultasExemplo'
import Chave from '../Chave'
import { MONO_LABEL } from './estilos'

// Console Cypher da página de grafos (N3 — ESTADO_ATUAL.md §4.5): o lugar
// provisório para escrever Cypher e testar a integração com o Neo4j. Ocupa o
// lugar (e o z-index 40) da barra de filtros do protótipo, que vai ser
// redesenhada. O texto digitado vive AQUI, e não na página: digitar não
// re-renderiza a página inteira (o mesmo cuidado da P4). A página só recebe a
// consulta no Executar (botão ou Ctrl/Cmd+Enter) e devolve o estado da
// execução para a linha de status.
// N4: a linha de status mostra também o tamanho do grafo extraído, e a chave
// "Conectar nós do resultado" (o "Connect result nodes" do Neo4j Browser) fica
// à direita dela — o estado mora na página, que refaz a consulta ao mudar.

// Exemplos do menu: src/data/consultasExemplo.js (as consultas de teste da
// orientadora). Até este ajuste eram lidos do arquivo neo4j/consultas por import
// ?raw; aquela pasta ficou só como o registro do material dela.

const LINHAS_MAX = 8 // a caixa cresce com a consulta até este nº de linhas (depois rola)

const BARRA = {
  flex: 'none',
  padding: '11px 26px 9px',
  background: 'var(--pill-bg)',
  borderBottom: '1px solid var(--pill-border)',
  position: 'relative',
  zIndex: 40,
}
const ROTULO = { ...MONO_LABEL, color: 'var(--green)', paddingTop: 15, flex: 'none' }
const SELECT = {
  padding: '10px 26px 10px 11px',
  border: '1px solid var(--pill-border)',
  borderRadius: 10,
  background: 'var(--bg)',
  font: "600 13px/1.3 'Figtree', sans-serif",
  color: 'var(--body)',
  cursor: 'pointer',
  outline: 'none',
  maxWidth: 230,
  flex: 'none',
}
const BOTAO = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 20px',
  borderRadius: 999,
  border: 'none',
  background: 'var(--green)',
  color: '#fff',
  font: "700 13.5px/1 'Figtree', sans-serif",
  cursor: 'pointer',
  flex: 'none',
}
const LINHA_STATUS = { display: 'flex', alignItems: 'flex-start', gap: 14, marginTop: 6 }
const STATUS = {
  flex: 1,
  minWidth: 0,
  minHeight: 15,
  font: "10.5px/1.4 'JetBrains Mono', monospace",
  color: 'var(--muted)',
}
const BOTAO_CHAVE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  flex: 'none',
  padding: 0,
  border: 'none',
  background: 'transparent',
  font: "600 11.5px/1 'Figtree', sans-serif",
  color: 'var(--body)',
  cursor: 'pointer',
}

// `consultaInicial` (N9): a consulta com que a página abriu (o "Ver o grafo
// desta turma" da Home) — aparece escrita na caixa, como se tivesse sido digitada
function ConsoleCypher({ status, resultado, erro, aoExecutar, conectar, aoAlternarConectar, consultaInicial }) {
  const [texto, setTexto] = useState(consultaInicial || '')
  const campo = useRef(null)
  const executando = status === 'carregando'
  const podeExecutar = !executando && texto.trim() !== ''

  const executar = () => {
    if (podeExecutar) aoExecutar(texto)
  }
  const aoTeclar = (e) => {
    // Ctrl+Enter (Cmd+Enter no Mac) executa; Enter sozinho quebra a linha
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      executar()
    }
  }
  const aoEscolherExemplo = (e) => {
    const ex = EXEMPLOS[Number(e.target.value)]
    if (!ex) return
    setTexto(ex.consulta)
    campo.current?.focus()
  }

  let linhaStatus
  if (executando) {
    linhaStatus = 'Executando no Neo4j…'
  } else if (status === 'erro' && erro) {
    linhaStatus = <span style={{ color: 'var(--gold)' }}>erro · {erro.codigo || 'sem código'}</span>
  } else if (status === 'pronto' && resultado) {
    const t = resultado.tempos
    const g = resultado.grafo
    linhaStatus = (
      <>
        linhas: {resultado.linhas.length} · grafo: {g.nos.size} nós, {g.relacoes.size} relações · Neo4j: pronto
        em {t.disponivelApos} ms, lido em {t.consumidoApos} ms · total no navegador: {t.totalMs} ms
        {resultado.avisos.length ? (
          <span style={{ color: 'var(--gold)' }}> · avisos: {resultado.avisos.length}</span>
        ) : null}
      </>
    )
  } else {
    linhaStatus = <span style={{ color: 'var(--faint)' }}>Ctrl+Enter executa · somente leitura</span>
  }

  return (
    <div style={BARRA}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
        <span style={ROTULO}>Cypher</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea
            ref={campo}
            className="eg-console-cypher"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={aoTeclar}
            rows={Math.min(texto.split('\n').length, LINHAS_MAX)}
            spellCheck={false}
            autoComplete="off"
            aria-label="Consulta Cypher"
            placeholder="MATCH (h:Habilidade) RETURN h LIMIT 25"
          />
          <div style={LINHA_STATUS}>
            <div aria-live="polite" style={STATUS}>
              {linhaStatus}
            </div>
            <button
              type="button"
              onClick={aoAlternarConectar}
              disabled={executando}
              aria-pressed={conectar}
              title="Como no Neo4j Browser: desenha também as relações que existem entre os nós retornados, mesmo que a consulta não as peça. Com um resultado na tela, refaz a consulta."
              style={executando ? { ...BOTAO_CHAVE, opacity: 0.5, cursor: 'default' } : BOTAO_CHAVE}
            >
              <span>Conectar nós do resultado</span>
              <Chave ligada={conectar} />
            </button>
          </div>
        </div>
        {/* value fixo em '': depois de escolher, o menu volta ao rótulo, e o
            mesmo exemplo pode ser escolhido de novo */}
        <select
          value=""
          onChange={aoEscolherExemplo}
          aria-label="Exemplos de consulta"
          title="Consultas de exemplo (as de teste da orientadora)"
          style={SELECT}
        >
          <option value="" disabled>
            Exemplos…
          </option>
          {EXEMPLOS.map((ex, i) => (
            <option key={i} value={i}>
              {ex.titulo}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="eg-grafo-filtrar"
          onClick={executar}
          disabled={!podeExecutar}
          title="Executar no Neo4j (Ctrl+Enter)"
          style={BOTAO}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 4.5v15l13-7.5z" />
          </svg>
          <span>{executando ? 'Executando…' : 'Executar'}</span>
        </button>
      </div>
    </div>
  )
}

export default ConsoleCypher
