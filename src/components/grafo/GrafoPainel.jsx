import { Fragment, useRef, useState } from 'react'
import { ESTILO_NO } from '../../data/estiloGrafo'
import { MONO_LABEL } from './estilos'
import PontoNo from './PontoNo'

// Painel de contexto da página de grafos (G7) — porte fiel do aside "de vidro"
// do protótipo (design/prototipo_grafo.html): flutua à esquerda do palco,
// ARRASTÁVEL pela alça superior e REDIMENSIONÁVEL pela borda direita (clamps do
// protótipo: x ∈ [8, W−w−8], w ∈ [320, min(620, W−x−8)]), com botão de esconder
// (vira a aba "Painel" no topo-esquerda). Sem seleção mostra o cheat-sheet de
// interações. Rodapé: "Vistos por último" + placeholder do assistente.
// Posição/largura/escondido vivem no estado da página e persistem em
// localStorage['edugraphPrefs'] (G10). Hovers via classes .eg-painel-* (CSS).
// N7 (integração com o Neo4j): o detalhe é o do Neo4j, genérico como o
// inspetor do Neo4j Browser — rótulos, o texto completo do nó como título, TODAS
// as propriedades (o modelo ainda vai crescer) e as CONEXÕES consultadas no
// banco, agrupadas por tipo de relação e sentido (src/data/vizinhanca.js). Item
// no desenho → seleciona e centra; oculto pela legenda ou fora do desenho → abre
// o detalhe dele aqui (aoIr decide). O botão "Expandir conexões deste nó" só
// aparece quando a página passa aoExpandir (volta na N8).

// Limites de arrasto/redimensionamento do painel (clamps do protótipo)
const MARGEM_PALCO = 8 // folga mínima até as bordas do palco
const LARGURA_MIN = 320
const LARGURA_MAX = 620

// atalhos do cheat-sheet (estado sem seleção) — verbatim do protótipo
const ATALHOS = [
  ['hover', 'destaca as conexões do nó'],
  ['clique', 'abre os detalhes aqui'],
  ['2× clique', 'expande as conexões do nó'],
  ['arrastar', 'move nós ou o quadro; roda = zoom'],
]

// valor de propriedade como texto (listas e mapas do Neo4j também cabem aqui)
function formatarValor(v) {
  if (v === null || v === undefined) return 'null'
  if (Array.isArray(v)) return `[${v.map(formatarValor).join(', ')}]`
  return typeof v === 'object' ? JSON.stringify(v) : String(v)
}

// chip discreto (outros rótulos do nó; "oculto" / "fora do desenho")
const CHIP = {
  font: "9px/1.4 'JetBrains Mono', monospace",
  color: 'var(--gold)',
  border: '1px dashed color-mix(in srgb, var(--gold) 45%, transparent)',
  borderRadius: 6,
  padding: '1px 5px',
  flex: 'none',
}

const DICA_ITEM = {
  visivel: 'Ver este nó no grafo',
  oculto: 'Oculto pela legenda — clique para ver os detalhes aqui',
  fora: 'Fora do desenho — clique para ver os detalhes aqui',
}

function GrafoPainel({ painel, aoMudarPainel, detalhe, estadoNo, vistos, aoIr, aoFechar, aoExpandir, expandindo }) {
  const asideRef = useRef(null)
  const atual = useRef(painel) // x/w correntes para os handlers de arrasto/resize
  atual.current = painel
  const [iaMsg, setIaMsg] = useState('')
  const [iaAviso, setIaAviso] = useState(false)

  const larguraPalco = () => {
    const pai = asideRef.current?.parentElement
    return pai ? pai.getBoundingClientRect().width : 1200
  }

  // mover o painel pela alça (listeners na window: o arrasto sobrevive a sair do aside)
  const iniciarArrasto = (ev) => {
    if (ev.button !== 0) return
    ev.preventDefault()
    const x0 = ev.clientX
    const inicial = atual.current.x
    const move = (e) => {
      const W = larguraPalco()
      const w = atual.current.w
      const nx = Math.min(Math.max(MARGEM_PALCO, inicial + e.clientX - x0), Math.max(MARGEM_PALCO, W - w - MARGEM_PALCO))
      aoMudarPainel({ x: nx })
    }
    const solta = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', solta)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', solta)
  }

  // redimensionar pela borda direita
  const iniciarResize = (ev) => {
    if (ev.button !== 0) return
    ev.preventDefault()
    ev.stopPropagation()
    const x0 = ev.clientX
    const inicial = atual.current.w
    const move = (e) => {
      const W = larguraPalco()
      const x = atual.current.x
      const nw = Math.min(Math.max(LARGURA_MIN, inicial + e.clientX - x0), Math.min(LARGURA_MAX, W - x - MARGEM_PALCO))
      aoMudarPainel({ w: nw })
    }
    const solta = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', solta)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', solta)
  }

  // aba de reabrir (painel escondido)
  if (painel.esc) {
    return (
      <button
        type="button"
        className="eg-painel-chip"
        title="Mostrar painel de contexto"
        onClick={() => aoMudarPainel({ esc: false })}
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 14px',
          borderRadius: 999,
          border: '1px solid var(--pill-border)',
          background: 'color-mix(in srgb, var(--pill-bg) 85%, transparent)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          cursor: 'pointer',
          boxShadow: '0 6px 16px rgba(28,38,32,.10)',
          font: "10px/1 'JetBrains Mono', monospace",
          letterSpacing: '0.14em',
          color: 'var(--body)',
          textTransform: 'uppercase',
          animation: 'egSurgir .16s ease',
          zIndex: 30,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m13 17 5-5-5-5" />
          <path d="m6 17 5-5-5-5" />
        </svg>
        <span>Painel</span>
      </button>
    )
  }

  // nó do detalhe (sem detalhe → cheat-sheet)
  const no = detalhe ? detalhe.no : null

  return (
    <aside
      ref={asideRef}
      style={{
        position: 'absolute',
        top: 12,
        bottom: 12,
        left: painel.x,
        width: painel.w,
        display: 'flex',
        flexDirection: 'column',
        background: 'color-mix(in srgb, var(--pill-bg) 72%, transparent)',
        backdropFilter: 'blur(14px) saturate(1.15)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.15)',
        border: '1px solid color-mix(in srgb, var(--edge) 95%, transparent)',
        borderRadius: 18,
        boxShadow: '0 24px 60px rgba(28,38,32,.18)',
        overflow: 'hidden',
        zIndex: 30,
      }}
    >
      {/* alça de arrasto */}
      <div
        onPointerDown={iniciarArrasto}
        title="Arraste para mover o painel"
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '10px 14px',
          borderBottom: '1px solid color-mix(in srgb, var(--edge) 70%, transparent)',
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--faint)">
          <circle cx="7" cy="5" r="1.6" />
          <circle cx="17" cy="5" r="1.6" />
          <circle cx="7" cy="12" r="1.6" />
          <circle cx="17" cy="12" r="1.6" />
          <circle cx="7" cy="19" r="1.6" />
          <circle cx="17" cy="19" r="1.6" />
        </svg>
        <span style={{ ...MONO_LABEL, letterSpacing: '0.18em', color: 'var(--muted)', flex: 1 }}>
          Painel de contexto
        </span>
        <button
          type="button"
          className="eg-painel-chip"
          title="Esconder painel"
          onClick={() => aoMudarPainel({ esc: true })}
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            border: '1px solid var(--pill-border)',
            background: 'color-mix(in srgb, var(--bg) 70%, transparent)',
            color: 'var(--muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m11 17-5-5 5-5" />
            <path d="m18 17-5-5 5-5" />
          </svg>
        </button>
      </div>

      {/* conteúdo: cheat-sheet (sem seleção) ou detalhe do nó */}
      {!no ? (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '24px 26px 18px', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="40" height="40" viewBox="0 0 52 52" fill="none" style={{ opacity: 0.65, flex: 'none' }}>
              <circle cx="14" cy="36" r="6" fill="var(--edge)" />
              <circle cx="30" cy="14" r="5" fill="var(--edge)" />
              <circle cx="41" cy="33" r="4.4" fill="var(--grafo-aresta)" />
              <line x1="14" y1="36" x2="30" y2="14" stroke="var(--edge)" strokeWidth="1.6" />
              <line x1="30" y1="14" x2="41" y2="33" stroke="var(--edge)" strokeWidth="1.6" />
              <line x1="14" y1="36" x2="41" y2="33" stroke="var(--edge)" strokeWidth="1.6" strokeDasharray="4 3" />
            </svg>
            <h2 style={{ font: "700 22px/1.2 'Spectral', serif", margin: 0, color: 'var(--text)' }}>
              Painel de contexto
            </h2>
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--body)', margin: 0 }}>
            Clique em um nó do grafo para ver aqui <strong>tudo o que o Neo4j sabe dele</strong> — rótulos
            e propriedades, como no Neo4j Browser — e as conexões agrupadas por tipo de relação.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 9,
              fontSize: 13,
              color: 'var(--muted)',
              background: 'color-mix(in srgb, var(--bg) 75%, transparent)',
              border: '1px dashed var(--edge)',
              borderRadius: 12,
              padding: '13px 15px',
            }}
          >
            {ATALHOS.map(([tecla, faz]) => (
              <div key={tecla} style={{ display: 'flex', gap: 10 }}>
                <span style={{ font: "11px/1.5 'JetBrains Mono', monospace", color: 'var(--green)', flex: 'none', width: 60 }}>
                  {tecla}
                </span>
                <span>{faz}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 16px' }}>
          {/* rótulo principal (+ outros rótulos do nó) + fechar */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 9, marginBottom: 13 }}>
            <PontoNo forma={no.forma} cor={`var(${no.cor})`} tamanho={10} />
            <span style={{ ...MONO_LABEL, fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted)' }}>{no.tipo}</span>
            {no.rotulos
              .filter((r) => r !== no.tipo)
              .map((r) => (
                <span key={r} style={CHIP}>
                  :{r}
                </span>
              ))}
            <span style={{ flex: 1 }} />
            <button
              type="button"
              className="eg-painel-fechar"
              title="Limpar seleção"
              onClick={aoFechar}
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                border: '1px solid var(--pill-border)',
                background: 'transparent',
                color: 'var(--muted)',
                fontSize: 15,
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>

          {/* título: o texto completo do nó (ex.: "EF01MA17 — Reconhecer…") */}
          <h2
            style={{
              font: "700 23px/1.16 'Spectral', serif",
              letterSpacing: '-0.015em',
              margin: '0 0 16px',
              color: 'var(--text)',
              overflowWrap: 'anywhere',
            }}
          >
            {no.dica}
          </h2>

          {/* propriedades — todas, como o inspetor do Neo4j Browser */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ ...MONO_LABEL, marginBottom: 8 }}>Propriedades</div>
            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(64px, auto) 1fr',
                gap: '7px 12px',
                margin: 0,
                padding: '12px 14px',
                background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
                borderLeft: '3px solid var(--green)',
                borderRadius: '0 10px 10px 0',
              }}
            >
              {Object.entries(no.props).map(([chave, valor]) => (
                <Fragment key={chave}>
                  <dt style={{ font: "10.5px/1.6 'JetBrains Mono', monospace", color: 'var(--faint)' }}>{chave}</dt>
                  <dd
                    style={{
                      margin: 0,
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      color: 'var(--body)',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {formatarValor(valor)}
                  </dd>
                </Fragment>
              ))}
              <dt style={{ font: "10.5px/1.6 'JetBrains Mono', monospace", color: 'var(--faint)' }}>elementId</dt>
              <dd style={{ margin: 0, font: "10.5px/1.6 'JetBrains Mono', monospace", color: 'var(--faint)', overflowWrap: 'anywhere' }}>
                {no.id}
              </dd>
            </dl>
          </div>

          {/* conexões consultadas no Neo4j, agrupadas por tipo de relação e sentido */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
              <div style={MONO_LABEL}>Conexões</div>
              {detalhe.carregando || detalhe.erro ? null : (
                <div style={{ font: "10.5px/1 'JetBrains Mono', monospace", color: 'var(--muted)' }}>
                  ({detalhe.total}
                  {detalhe.mais ? '+' : ''})
                </div>
              )}
            </div>
            {detalhe.carregando ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2.5px solid var(--pill-border)',
                    borderTopColor: 'var(--green)',
                    animation: 'egGirar .8s linear infinite',
                    flex: 'none',
                  }}
                />
                <span style={{ font: "10.5px/1 'JetBrains Mono', monospace", color: 'var(--faint)' }}>
                  consultando o Neo4j…
                </span>
              </div>
            ) : null}
            {detalhe.erro ? (
              <p style={{ margin: 0, font: "11.5px/1.5 'JetBrains Mono', monospace", color: 'var(--gold)', overflowWrap: 'anywhere' }}>
                Não foi possível carregar as conexões: {detalhe.erro}
              </p>
            ) : null}
            {!detalhe.carregando && !detalhe.erro && !detalhe.grupos.length ? (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>Este nó não tem conexões.</p>
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {detalhe.grupos.map((g) => (
                <div key={g.chave}>
                  <div
                    title={g.sentido === 'saida' ? `Relações ${g.rel} que saem deste nó` : `Relações ${g.rel} que chegam a este nó`}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}
                  >
                    <span style={{ font: "600 12px/1.3 'JetBrains Mono', monospace", color: 'var(--text)', overflowWrap: 'anywhere' }}>
                      {g.sentido === 'saida' ? '→' : '←'} {g.rel}
                    </span>
                    <span
                      style={{
                        font: "10px/1.4 'JetBrains Mono', monospace",
                        color: 'var(--faint)',
                        background: 'color-mix(in srgb, var(--bg2) 90%, transparent)',
                        borderRadius: 999,
                        padding: '1px 7px',
                      }}
                    >
                      {g.itens.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {g.itens.map((it) => {
                      const estado = estadoNo(it.id)
                      return (
                        <button
                          key={it.relId}
                          type="button"
                          className="eg-painel-item"
                          title={DICA_ITEM[estado]}
                          onClick={() => aoIr(it)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 9,
                            width: '100%',
                            padding: '6px 9px',
                            margin: '0 -9px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: 9,
                            cursor: 'pointer',
                            textAlign: 'left',
                            opacity: estado === 'visivel' ? 1 : 0.62,
                          }}
                        >
                          <PontoNo forma={it.forma} cor={`var(${it.cor})`} tamanho={8} />
                          <span
                            style={{
                              flex: 1,
                              minWidth: 0,
                              fontSize: 12.5,
                              fontWeight: 500,
                              color: 'var(--text)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {it.dica}
                          </span>
                          {estado === 'visivel' ? null : (
                            <span style={CHIP}>{estado === 'oculto' ? 'oculto' : 'fora do desenho'}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* expandir conexões — volta na N8, quando a página passa aoExpandir */}
          {aoExpandir ? (
            <button
              type="button"
              className="eg-painel-expandir"
              onClick={aoExpandir}
              disabled={expandindo}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 12,
                border: '1.5px solid var(--green)',
                background: 'color-mix(in srgb, var(--bg) 50%, transparent)',
                color: 'var(--green)',
                font: "600 13.5px/1.4 'Figtree', sans-serif",
                cursor: expandindo ? 'wait' : 'pointer',
                marginBottom: 20,
              }}
            >
              {expandindo ? 'Expandindo…' : 'Expandir conexões deste nó'}
            </button>
          ) : null}

          {/* fonte oficial — os rótulos da tabela de estilo são os do modelo da BNCC
              montado pela orientadora; rótulo sem estilo não ganha o link */}
          {ESTILO_NO[no.tipo] ? (
            <div style={{ borderTop: '1px solid color-mix(in srgb, var(--edge) 80%, transparent)', paddingTop: 14 }}>
              <div style={{ ...MONO_LABEL, marginBottom: 9 }}>Fonte oficial</div>
              <a
                className="eg-painel-fonte"
                href="http://basenacionalcomum.mec.gov.br/"
                target="_blank"
                rel="noopener"
                style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--green)', textDecoration: 'none', display: 'inline-flex', gap: 6, alignItems: 'baseline' }}
              >
                <span>BNCC — Base Nacional Comum Curricular (MEC)</span>
                <span style={{ fontSize: 11 }}>↗</span>
              </a>
            </div>
          ) : null}
        </div>
      )}

      {/* rodapé: vistos por último + assistente (placeholder) */}
      <div style={{ flex: 'none', borderTop: '1px solid color-mix(in srgb, var(--edge) 80%, transparent)', padding: '12px 22px 14px' }}>
        {vistos.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...MONO_LABEL, marginBottom: 7 }}>Vistos por último</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {vistos.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="eg-painel-chip"
                  title={n.dica}
                  onClick={() => aoIr(n)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '5px 11px',
                    borderRadius: 999,
                    border: '1px solid var(--edge)',
                    background: 'color-mix(in srgb, var(--bg) 75%, transparent)',
                    font: "600 12px/1.4 'Figtree', sans-serif",
                    color: 'var(--body)',
                    cursor: 'pointer',
                  }}
                >
                  <PontoNo forma={n.forma} cor={`var(${n.cor})`} tamanho={7} />
                  <span>{n.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
            <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
            <path d="M19 15l.9 2.4L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.6z" />
          </svg>
          <span style={{ ...MONO_LABEL, color: 'var(--muted)' }}>Assistente do grafo</span>
          <span
            style={{
              font: "9px/1.4 'JetBrains Mono', monospace",
              letterSpacing: '0.08em',
              color: 'var(--gold)',
              border: '1px dashed color-mix(in srgb, var(--gold) 45%, transparent)',
              borderRadius: 6,
              padding: '1px 6px',
              textTransform: 'uppercase',
            }}
          >
            em breve
          </span>
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <input
            type="text"
            className="eg-painel-ia"
            value={iaMsg}
            onChange={(e) => setIaMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIaAviso(true)
            }}
            placeholder="Pergunte: que habilidades do 1.º ano tratam de medidas de tempo?"
          />
          <button
            type="button"
            className="eg-painel-enviar"
            title="Enviar pergunta ao assistente"
            onClick={() => setIaAviso(true)}
            style={{
              width: 37,
              height: 37,
              flex: 'none',
              borderRadius: 11,
              border: 'none',
              background: 'var(--green)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4z" />
            </svg>
          </button>
        </div>
        {iaAviso && (
          <p style={{ margin: '8px 0 0', fontSize: 11.5, lineHeight: 1.5, color: 'var(--faint)', animation: 'egSurgir .16s ease' }}>
            Em desenvolvimento — aqui a IA vai transformar sua pergunta em uma consulta Cypher e
            destacar a resposta no grafo.
          </p>
        )}
      </div>

      {/* alça de redimensionar (borda direita) */}
      <div
        onPointerDown={iniciarResize}
        title="Arraste para redimensionar"
        style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 9, cursor: 'ew-resize', touchAction: 'none' }}
      />
    </aside>
  )
}

export default GrafoPainel
