import { memo } from 'react'
import { Caminho, No, Relacao } from '../../data/neo4j'
import { MONO_LABEL } from './estilos'

// Resultado da última consulta do console Cypher (N3 — ESTADO_ATUAL.md §4.5),
// sobre o palco, à direita do painel de contexto. A 1.ª aba, "Grafo", é o próprio
// desenho do canvas (fecha o painel — ver o comentário do componente); as de
// conteúdo:
//  - Tabela: uma coluna por campo do RETURN, com os valores já convertidos pelo
//    cliente (src/data/neo4j.js) — nó como (:Rotulo {props}), relação como
//    [:TIPO], caminho resumido com o sentido real de cada relação;
//  - Relações (N4; chamada "Grafo" até um ajuste da N5): o grafo extraído do
//    resultado (src/data/extrairGrafo.js), em
//    texto — totais, consultas extras feitas, contagem por rótulo e por tipo
//    de relação e as listas. É o que o canvas desenha ao chegar o resultado
//    (N5); o que as expansões (N8) acrescentam aparece só no desenho, no resumo
//    e na legenda — as abas descrevem a resposta da CONSULTA;
//  - JSON: a resposta EXATAMENTE como chegou do Neo4j (JSON tipado da Query
//    API), formatada — é a aba de conferência com o Neo4j Browser.
// As abas são memo(): o contêiner re-renderiza a cada movimento quando o
// painel é arrastado (offsetEsquerda muda), mas a tabela — o trecho caro — só
// quando chega um resultado novo. A aba escolhida mora na página (sobrevive às
// execuções, que desmontam este componente enquanto carregam).

const LIMITE_LINHAS = 500 // linhas desenhadas na Tabela
const LIMITE_RELACOES = 1000 // relações listadas na aba Relações
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

const ALTURA_CABECALHO = 40 // altura fixa da barra de abas: o painel fechado mede isto + as 2 bordas
const CAIXA = {
  position: 'absolute',
  top: 12,
  right: 12,
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
  height: ALTURA_CABECALHO,
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
const RESUMO = { padding: '14px 16px 12px', borderBottom: '1px solid var(--pill-border)' }
const TOTAIS = { font: "600 15px/1.3 'JetBrains Mono', monospace", color: 'var(--text)' }
const DETALHE = { marginTop: 5, font: "10.5px/1.5 'JetBrains Mono', monospace", color: 'var(--muted)' }
const CHIPS = { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }
const CHIP = {
  padding: '4px 9px',
  border: '1px solid var(--pill-border)',
  borderRadius: 999,
  background: 'var(--bg)',
  font: "11.5px/1.2 'JetBrains Mono', monospace",
  color: 'var(--body)',
}
const SUBTITULO = { ...MONO_LABEL, display: 'block', padding: '14px 16px 6px', color: 'var(--muted)' }
// bloco "terminal": as mesmas cores fixas da gaveta Cypher (escuro nos 2 temas)
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

// contagem por chave, da maior para a menor (empate: ordem alfabética)
function contarPor(itens, chavesDe) {
  const contagem = new Map()
  for (const item of itens) for (const k of chavesDe(item)) contagem.set(k, (contagem.get(k) || 0) + 1)
  return [...contagem].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

function Contagem({ titulo, itens }) {
  return (
    <div style={{ marginTop: 12 }}>
      <span style={MONO_LABEL}>{titulo}</span>
      <div style={CHIPS}>
        {itens.length ? (
          itens.map(([nome, n]) => (
            <span key={nome} style={CHIP}>
              {nome} <strong style={{ color: 'var(--green)' }}>{n}</strong>
            </span>
          ))
        ) : (
          <span style={{ ...CHIP, color: 'var(--faint)' }}>nenhum</span>
        )}
      </div>
    </div>
  )
}

const GrafoTexto = memo(function GrafoTexto({ grafo }) {
  const nos = [...grafo.nos.values()]
  const relacoes = [...grafo.relacoes.values()]
  if (!nos.length) return <p style={VAZIO}>A consulta não trouxe nós nem relações — nada para desenhar.</p>
  const porRotulo = contarPor(nos, (n) => (n.rotulos.length ? n.rotulos : ['(sem rótulo)']))
  const porTipo = contarPor(relacoes, (r) => [r.rel])
  const pontas = grafo.extras.find((e) => e.tipo === 'pontas')
  const conectar = grafo.extras.find((e) => e.tipo === 'conectar')
  const listadas = relacoes.length > LIMITE_RELACOES ? relacoes.slice(0, LIMITE_RELACOES) : relacoes
  return (
    <>
      <div style={RESUMO}>
        <div style={TOTAIS}>
          {nos.length} nós · {relacoes.length} relações
        </div>
        {grafo.total > nos.length ? (
          <div style={{ ...DETALHE, color: 'var(--gold)' }}>
            Mostrando {nos.length} de {grafo.total} nós (o limite do Neo4j Browser); relações com ponta de
            fora também ficaram de fora.
          </div>
        ) : null}
        <div style={DETALHE}>
          {pontas ? `pontas que faltavam: +${pontas.adicionados} nós (consulta extra, ${pontas.ms} ms) · ` : ''}
          conectar nós do resultado:{' '}
          {conectar ? `ligado — +${conectar.adicionados} relações (consulta extra, ${conectar.ms} ms)` : 'desligado'}
        </div>
        <Contagem titulo="Rótulos" itens={porRotulo} />
        <Contagem titulo="Tipos de relação" itens={porTipo} />
      </div>

      <span style={SUBTITULO}>Nós</span>
      <table className="eg-resultado-tabela">
        <thead>
          <tr>
            <th scope="col" className="eg-resultado-num">
              #
            </th>
            <th scope="col">nó</th>
          </tr>
        </thead>
        <tbody>
          {nos.map((n, i) => (
            <tr key={n.id}>
              <td className="eg-resultado-num">{i + 1}</td>
              <td>{formatar(n)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <span style={SUBTITULO}>Relações</span>
      {listadas.length ? (
        <table className="eg-resultado-tabela">
          <thead>
            <tr>
              <th scope="col" className="eg-resultado-num">
                #
              </th>
              <th scope="col">relação</th>
            </tr>
          </thead>
          <tbody>
            {listadas.map((r, i) => (
              <tr key={r.id}>
                <td className="eg-resultado-num">{i + 1}</td>
                <td>
                  {noResumido(grafo.nos.get(r.inicio))}-{formatar(r)}-&gt;{noResumido(grafo.nos.get(r.fim))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ ...VAZIO, paddingTop: 4 }}>Nenhuma relação entre esses nós.</p>
      )}
      {relacoes.length > LIMITE_RELACOES ? (
        <p style={NOTA}>
          Listando as primeiras {LIMITE_RELACOES} de {relacoes.length} relações.
        </p>
      ) : null}
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

// abas de conteúdo; "Grafo" (a 1.ª) não tem conteúdo: é o próprio desenho do
// canvas — escolhê-la fecha o painel
const ABAS = [
  { id: 'tabela', rotulo: 'Tabela' },
  { id: 'relacoes', rotulo: 'Relações' },
  { id: 'json', rotulo: 'JSON' },
]
const CONTEUDO = { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }

// N5: o painel fica no TOPO do palco (logo abaixo do console). A 1.ª aba,
// "Grafo", é o próprio desenho do canvas: com ela escolhida o painel fica
// FECHADO — só a barra de abas, sem cobrir o grafo. As outras abas o abrem.
// Abrir e fechar são animados pela altura (classe .eg-resultado-caixa): o
// painel desce a partir da barra e sobe de volta até ela; por isso o conteúdo
// continua montado enquanto fecha (o overflow do painel o corta). Sem animação
// no modo "Desativar animações" (`semAnim`, D6) e com prefers-reduced-motion.
// `aba` é a última aba de CONTEÚDO escolhida (a que aparece ao abrir).
function ResultadoCypher({ resultado, offsetEsquerda, aba, aberto, aoAbrirAba, aoFechar, semAnim }) {
  const { campos, linhas, avisos, bruto, grafo } = resultado
  const altura = aberto ? 'calc(100% - 24px)' : ALTURA_CABECALHO + 2
  return (
    <section
      aria-label="Resultado da consulta Cypher"
      className={semAnim ? 'eg-resultado-caixa eg-resultado-caixa--sem-anim' : 'eg-resultado-caixa'}
      style={{ ...CAIXA, left: offsetEsquerda + 12, height: altura }}
    >
      <div style={CABECALHO}>
        <div role="tablist" aria-label="Formato do resultado">
          <button
            type="button"
            role="tab"
            aria-selected={!aberto}
            className="eg-resultado-aba"
            title="O grafo desenhado no palco (fecha o painel)"
            onClick={aoFechar}
          >
            Grafo
          </button>
          {ABAS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={aberto && aba === a.id}
              className="eg-resultado-aba"
              onClick={() => aoAbrirAba(a.id)}
            >
              {a.rotulo}
            </button>
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <span style={INFO}>
          linhas: {linhas.length} · campos: {campos.length}
        </span>
      </div>

      <div style={CONTEUDO} aria-hidden={!aberto}>
        {/* notificações do Neo4j (ex.: rótulo que não existe no banco) */}
        {avisos.map((a, i) => (
          <div key={i} style={AVISO}>
            <span style={{ ...MONO_LABEL, color: 'var(--gold)' }}>{a.severity || 'aviso'}</span>
            <strong style={{ fontWeight: 600, color: 'var(--text)' }}>{a.title || a.code}</strong>
            <span>{a.description}</span>
          </div>
        ))}

        <div role="tabpanel" style={CORPO}>
          {aba === 'tabela' ? <Tabela campos={campos} linhas={linhas} /> : null}
          {aba === 'relacoes' ? <GrafoTexto grafo={grafo} /> : null}
          {aba === 'json' ? <Json bruto={bruto} /> : null}
        </div>
      </div>
    </section>
  )
}

export default ResultadoCypher
