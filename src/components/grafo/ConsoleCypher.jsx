import { useRef, useState } from 'react'
import textoConsultas from '../../../neo4j/consultas?raw'
import { MONO_LABEL } from './estilos'

// Console Cypher da página de grafos (N3 — ESTADO_ATUAL.md §4.5): o lugar
// provisório para escrever Cypher e testar a integração com o Neo4j. Ocupa o
// lugar (e o z-index 40) da barra de filtros do protótipo, que vai ser
// redesenhada. O texto digitado vive AQUI, e não na página: digitar não
// re-renderiza a página inteira (o mesmo cuidado da P4). A página só recebe a
// consulta no Executar (botão ou Ctrl/Cmd+Enter) e devolve o estado da
// execução para a linha de status.

// Exemplos do menu = as consultas de neo4j/consultas, lidas do próprio arquivo
// (import ?raw do Vite) para acompanharem o que a orientadora mandar. Formato
// do arquivo: cada consulta vem depois de uma linha de comentário (`// título`).
function lerExemplos(texto) {
  const exemplos = []
  for (const linha of texto.split('\n')) {
    const t = linha.trim()
    if (t.startsWith('//')) {
      exemplos.push({ titulo: t.replace(/^\/\/\s*/, ''), consulta: '' })
    } else if (t && exemplos.length) {
      const ex = exemplos[exemplos.length - 1]
      ex.consulta += (ex.consulta ? '\n' : '') + linha.trimEnd()
    }
  }
  return exemplos.filter((ex) => ex.consulta)
}
const EXEMPLOS = lerExemplos(textoConsultas)

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
const STATUS = {
  minHeight: 15,
  marginTop: 6,
  font: "10.5px/1.4 'JetBrains Mono', monospace",
  color: 'var(--muted)',
}

function ConsoleCypher({ status, resultado, erro, aoExecutar }) {
  const [texto, setTexto] = useState('')
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
    linhaStatus = (
      <>
        linhas: {resultado.linhas.length} · Neo4j: pronto em {t.disponivelApos} ms, lido em {t.consumidoApos} ms ·
        total no navegador: {t.totalMs} ms
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
          <div aria-live="polite" style={STATUS}>
            {linhaStatus}
          </div>
        </div>
        {/* value fixo em '': depois de escolher, o menu volta ao rótulo, e o
            mesmo exemplo pode ser escolhido de novo */}
        <select
          value=""
          onChange={aoEscolherExemplo}
          aria-label="Exemplos de consulta (arquivo neo4j/consultas)"
          title="Consultas do arquivo neo4j/consultas"
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
