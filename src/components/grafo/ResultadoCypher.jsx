import { memo, useState } from 'react'
import { Caminho, No, Relacao } from '../../data/neo4j'
import { MONO_LABEL } from './estilos'

// Resultado da última consulta do console Cypher (N3 — ESTADO_ATUAL.md §4.5),
// sobre o palco, à direita do painel de contexto. Duas abas:
//  - Tabela: uma coluna por campo do RETURN, com os valores já convertidos pelo
//    cliente (src/data/neo4j.js) — nó como (:Rotulo {props}), relação como
//    [:TIPO], caminho resumido com o sentido real de cada relação;
//  - JSON: a resposta EXATAMENTE como chegou do Neo4j (JSON tipado da Query
//    API), formatada — é a aba de conferência com o Neo4j Browser.
// As duas abas são memo(): o contêiner re-renderiza a cada movimento quando o
// painel é arrastado (offsetEsquerda muda), mas a tabela — o trecho caro — só
// quando chega um resultado novo.

const LIMITE_LINHAS = 500 // linhas desenhadas na Tabela
const LIMITE_JSON = 1_000_000 // caracteres exibidos no JSON (respostas gigantes travariam a aba)
const TAM_RESUMO = 28 // caracteres do valor que identifica cada nó no resumo de um caminho

const encurtar = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
const rotulosDe = (no) => no.rotulos.map((r) => `:${r}`).join('')

// valor já convertido → texto no estilo dos literais Cypher
function formatar(v) {
  if (v === null) return 'null'
  if (typeof v === 'string') return JSON.stringify(v)
  if (typeof v !== 'object') return String(v) // número (inclusive NaN/Infinity) e booleano
  if (v instanceof No) {
    const props = formatarMapa(v.props)
    return `(${rotulosDe(v)}${props === '{}' ? '' : ` ${props}`})`
  }
  if (v instanceof Relacao) {
    const props = formatarMapa(v.props)
    return `[:${v.rel}${props === '{}' ? '' : ` ${props}`}]`
  }
  if (v instanceof Caminho) return resumirCaminho(v)
  if (Array.isArray(v)) return `[${v.map(formatar).join(', ')}]`
  return formatarMapa(v)
}

function formatarMapa(m) {
  const pares = Object.entries(m).map(([k, x]) => `${k}: ${formatar(x)}`)
  return pares.length ? `{${pares.join(', ')}}` : '{}'
}

// caminho resumido: cada nó com o rótulo e o 1.º valor de propriedade (o que
// costuma identificá-lo: codigo, nome…); a seta segue o sentido real da relação
function noResumido(no) {
  const primeiro = Object.values(no.props)[0]
  if (primeiro === undefined) return `(${rotulosDe(no)})`
  const curto =
    typeof primeiro === 'string' ? JSON.stringify(encurtar(primeiro, TAM_RESUMO)) : encurtar(formatar(primeiro), TAM_RESUMO)
  return `(${rotulosDe(no)} ${curto})`
}

function resumirCaminho(c) {
  let s = noResumido(c.nos[0])
  c.relacoes.forEach((r, i) => {
    s += (r.inicio === c.nos[i].id ? `-[:${r.rel}]->` : `<-[:${r.rel}]-`) + noResumido(c.nos[i + 1])
  })
  return s
}

const CAIXA = {
  position: 'absolute',
  top: 12,
  right: 12,
  bottom: 12,
  zIndex: 30,
  display: 'flex',
  flexDirection: 'column',
  // vidro do painel de contexto, mais opaco: tabela densa pede leitura firme
  background: 'color-mix(in srgb, var(--pill-bg) 92%, transparent)',
  backdropFilter: 'blur(14px) saturate(1.15)',
  WebkitBackdropFilter: 'blur(14px) saturate(1.15)',
  border: '1px solid color-mix(in srgb, var(--edge) 95%, transparent)',
  borderRadius: 16,
  boxShadow: '0 24px 60px rgba(28,38,32,.18)',
  overflow: 'hidden',
  animation: 'egSurgir .18s ease',
}
const CABECALHO = {
  flex: 'none',
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  borderBottom: '1px solid var(--pill-border)',
}
const INFO = { ...MONO_LABEL, fontSize: 10, letterSpacing: '0.1em' }
const CORPO = { flex: 1, minHeight: 0, overflow: 'auto' }
const AVISO = {
  flex: 'none',
  display: 'flex',
  alignItems: 'baseline',
  flexWrap: 'wrap',
  gap: 8,
  padding: '9px 16px',
  borderBottom: '1px dashed var(--pill-border)',
  background: 'color-mix(in srgb, var(--gold) 8%, transparent)',
  fontSize: 12.5,
  lineHeight: 1.5,
  color: 'var(--body)',
}
const NOTA = {
  margin: 0,
  padding: '9px 16px',
  font: "10.5px/1.4 'JetBrains Mono', monospace",
  color: 'var(--gold)',
}
const VAZIO = { margin: 0, padding: '22px 16px', fontSize: 14, color: 'var(--muted)' }
// bloco "terminal": as mesmas cores fixas da gaveta SPARQL (escuro nos 2 temas)
const TERMINAL = {
  margin: 12,
  background: '#1c2620',
  color: '#dde6df',
  borderRadius: 10,
  padding: '12px 14px',
  font: "11px/1.55 'JetBrains Mono', monospace",
  whiteSpace: 'pre',
}

const Tabela = memo(function Tabela({ campos, linhas }) {
  if (!linhas.length) return <p style={VAZIO}>A consulta não retornou linhas.</p>
  const visiveis = linhas.length > LIMITE_LINHAS ? linhas.slice(0, LIMITE_LINHAS) : linhas
  return (
    <>
      {linhas.length > LIMITE_LINHAS ? (
        <p style={NOTA}>
          Mostrando as primeiras {LIMITE_LINHAS} de {linhas.length} linhas.
        </p>
      ) : null}
      <table className="eg-resultado-tabela">
        <thead>
          <tr>
            <th scope="col" className="eg-resultado-num">
              #
            </th>
            {campos.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visiveis.map((linha, i) => (
            <tr key={i}>
              <td className="eg-resultado-num">{i + 1}</td>
              {campos.map((c) => (
                <td key={c}>{formatar(linha[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
})

const Json = memo(function Json({ bruto }) {
  const texto = JSON.stringify(bruto, null, 2)
  const cortado = texto.length > LIMITE_JSON
  return (
    <>
      {cortado ? (
        <p style={NOTA}>
          Resposta com {texto.length.toLocaleString('pt-BR')} caracteres — exibindo os primeiros{' '}
          {LIMITE_JSON.toLocaleString('pt-BR')}.
        </p>
      ) : null}
      <pre style={TERMINAL}>{cortado ? texto.slice(0, LIMITE_JSON) : texto}</pre>
    </>
  )
})

function ResultadoCypher({ resultado, offsetEsquerda }) {
  const [aba, setAba] = useState('tabela')
  const { campos, linhas, avisos, bruto } = resultado
  return (
    <section aria-label="Resultado da consulta Cypher" style={{ ...CAIXA, left: offsetEsquerda + 12 }}>
      <div style={CABECALHO}>
        <div role="tablist" aria-label="Formato do resultado">
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'tabela'}
            className="eg-resultado-aba"
            onClick={() => setAba('tabela')}
          >
            Tabela
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'json'}
            className="eg-resultado-aba"
            onClick={() => setAba('json')}
          >
            JSON
          </button>
        </div>
        <span style={{ flex: 1 }} />
        <span style={INFO}>
          linhas: {linhas.length} · campos: {campos.length}
        </span>
      </div>

      {/* notificações do Neo4j (ex.: rótulo que não existe no banco) */}
      {avisos.map((a, i) => (
        <div key={i} style={AVISO}>
          <span style={{ ...MONO_LABEL, color: 'var(--gold)' }}>{a.severity || 'aviso'}</span>
          <strong style={{ fontWeight: 600, color: 'var(--text)' }}>{a.title || a.code}</strong>
          <span>{a.description}</span>
        </div>
      ))}

      <div role="tabpanel" style={CORPO}>
        {aba === 'tabela' ? <Tabela campos={campos} linhas={linhas} /> : <Json bruto={bruto} />}
      </div>
    </section>
  )
}

export default ResultadoCypher
