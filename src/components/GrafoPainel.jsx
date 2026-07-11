import { useRef, useState } from 'react'
import { ANOS, EIXOS, NOS } from '../data/mockFuseki'

// Painel de contexto da página de grafos (G7) — porte fiel do aside "de vidro"
// do protótipo (design/prototipo_grafo.html): flutua à esquerda do palco,
// ARRASTÁVEL pela alça superior e REDIMENSIONÁVEL pela borda direita (clamps do
// protótipo: x ∈ [8, W−w−8], w ∈ [320, min(620, W−x−8)]), com botão de esconder
// (vira a aba "Painel" no topo-esquerda). Sem seleção mostra o cheat-sheet de
// interações; com seleção mostra tipo, código, título, pills (ano/eixo/área),
// texto normativo/definição (spinner enquanto consulta o endpoint) e as
// CONEXÕES agrupadas por relação — item fora do recorte ganha o chip
// "+ expandir" (a expansão em si chega na G8). Rodapé: "Vistos por último" +
// placeholder do assistente. Posição/largura persistem em localStorage na G10;
// por ora vivem no estado da página. Hovers via classes .eg-painel-* (CSS).

// cores por tipo de nó — mesmos tokens do canvas (formas p/ daltonismo: G10)
const COR = {
  habilidade: 'var(--no-habilidade)',
  conceito: 'var(--no-conceito)',
  disciplina: 'var(--no-disciplina)',
}

const MONO_LABEL = {
  font: "9.5px/1 'JetBrains Mono', monospace",
  letterSpacing: '0.16em',
  color: 'var(--faint)',
  textTransform: 'uppercase',
}

function Bolinha({ tipo, tamanho }) {
  return (
    <span style={{ width: tamanho, height: tamanho, borderRadius: '50%', background: COR[tipo], flex: 'none' }} />
  )
}

// atalhos do cheat-sheet (estado sem seleção) — verbatim do protótipo
const ATALHOS = [
  ['hover', 'destaca as conexões do nó'],
  ['clique', 'abre os detalhes aqui'],
  ['2× clique', 'expande as conexões do nó'],
  ['arrastar', 'move nós ou o quadro; roda = zoom'],
]

function GrafoPainel({ painel, aoMudarPainel, detalhe, noGrafo, vistos, aoIr, aoFechar }) {
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
      const nx = Math.min(Math.max(8, inicial + e.clientX - x0), Math.max(8, W - w - 8))
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
      const nw = Math.min(Math.max(320, inicial + e.clientX - x0), Math.min(620, W - x - 8))
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

  // nó selecionado (o detalhe é a fonte; sem detalhe → cheat-sheet)
  const base = detalhe ? NOS.get(detalhe.id) : null
  const pills = []
  if (base) {
    if (base.ano) pills.push((ANOS.find((a) => a.id === base.ano) || {}).label)
    if (base.eixo) pills.push(EIXOS[base.eixo].label)
    if (base.area) pills.push(`Área: ${base.area}`)
  }
  const totalConex = base ? detalhe.grupos.reduce((s, g) => s + g.itens.length, 0) : 0

  const vistosUI = vistos.filter((id) => NOS.has(id)).map((id) => NOS.get(id))

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
      {!base ? (
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
            Clique em um nó do grafo para ver aqui o <strong>texto oficial da habilidade</strong>, suas
            conexões agrupadas por relação e a fonte normativa.
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
          {/* tipo + fechar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 13 }}>
            <Bolinha tipo={base.tipo} tamanho={10} />
            <span style={{ ...MONO_LABEL, fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted)' }}>
              {base.tipo === 'habilidade' ? 'Habilidade' : base.tipo === 'conceito' ? 'Conceito de computação' : 'Matéria'}
            </span>
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

          {/* código EFxxCOxx (só habilidade) */}
          {base.tipo === 'habilidade' && (
            <div
              style={{
                display: 'inline-block',
                font: "600 12px/1.4 'JetBrains Mono', monospace",
                letterSpacing: '0.06em',
                color: 'var(--green)',
                background: 'color-mix(in srgb, var(--grafo-previa-bg) 90%, transparent)',
                border: '1px solid var(--grafo-previa-borda)',
                borderRadius: 7,
                padding: '3px 9px',
                marginBottom: 10,
              }}
            >
              {base.codigo}
            </div>
          )}

          <h2 style={{ font: "700 23px/1.16 'Spectral', serif", letterSpacing: '-0.015em', margin: '0 0 12px', color: 'var(--text)' }}>
            {base.tipo === 'habilidade' ? base.resumo : base.label}
          </h2>

          {/* pills ano / eixo / área */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
            {pills.map((p) => (
              <span
                key={p}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--body)',
                  background: 'color-mix(in srgb, var(--bg2) 90%, transparent)',
                  borderRadius: 999,
                  padding: '4px 11px',
                }}
              >
                {p}
              </span>
            ))}
          </div>

          {/* texto normativo / definição */}
          {base.tipo !== 'disciplina' && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ ...MONO_LABEL, marginBottom: 8 }}>
                {base.tipo === 'habilidade' ? 'Texto normativo — BNCC Computação' : 'Definição'}
              </div>
              {detalhe.carregando ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '16px 14px',
                    background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
                    borderLeft: '3px solid var(--green)',
                    borderRadius: '0 10px 10px 0',
                  }}
                >
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
                    consultando o endpoint…
                  </span>
                </div>
              ) : (
                detalhe.texto && (
                  <blockquote
                    style={{
                      margin: 0,
                      padding: '14px 16px',
                      background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
                      borderLeft: '3px solid var(--green)',
                      borderRadius: '0 10px 10px 0',
                      fontSize: 14,
                      lineHeight: 1.68,
                      color: 'var(--body)',
                    }}
                  >
                    “{detalhe.texto}”
                  </blockquote>
                )
              )}
            </div>
          )}

          {/* conexões agrupadas por relação */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
              <div style={MONO_LABEL}>Conexões</div>
              <div style={{ font: "10.5px/1 'JetBrains Mono', monospace", color: 'var(--muted)' }}>({totalConex})</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {detalhe.grupos.map((g) => (
                <div key={g.rotulo}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{g.rotulo}</span>
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
                      const fora = !noGrafo(it.id)
                      return (
                        <button
                          key={it.id}
                          type="button"
                          className="eg-painel-item"
                          title={fora ? 'Fora do recorte atual — clique para expandir o grafo até este nó' : 'Ver este nó no grafo'}
                          onClick={() => aoIr(it.id)}
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
                            opacity: fora ? 0.62 : 1,
                          }}
                        >
                          <Bolinha tipo={it.tipo} tamanho={8} />
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
                            {it.tipo === 'habilidade' ? `${it.codigo} — ${it.resumo}` : it.label}
                          </span>
                          <span style={{ font: "9.5px/1 'JetBrains Mono', monospace", color: 'var(--faint)', flex: 'none' }}>
                            {it.tipo === 'habilidade' ? (ANOS.find((a) => a.id === it.ano) || {}).label || '' : ''}
                          </span>
                          {fora && (
                            <span
                              style={{
                                font: "9px/1.4 'JetBrains Mono', monospace",
                                color: 'var(--gold)',
                                border: '1px dashed color-mix(in srgb, var(--gold) 45%, transparent)',
                                borderRadius: 6,
                                padding: '1px 5px',
                                flex: 'none',
                              }}
                            >
                              + expandir
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* fonte oficial */}
          <div style={{ borderTop: '1px solid color-mix(in srgb, var(--edge) 80%, transparent)', paddingTop: 14 }}>
            <div style={{ ...MONO_LABEL, marginBottom: 9 }}>Fonte oficial</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <a
                className="eg-painel-fonte"
                href="http://portal.mec.gov.br/docman/fevereiro-2022-pdf/236791-anexo-ao-parecer-cneceb-n-2-2022-bncc-computacao/file"
                target="_blank"
                rel="noopener"
                style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--green)', textDecoration: 'none', display: 'inline-flex', gap: 6, alignItems: 'baseline' }}
              >
                <span>BNCC — Computação (norma anexa ao Parecer CNE/CEB nº 2/2022)</span>
                <span style={{ fontSize: 11 }}>↗</span>
              </a>
              <a
                className="eg-painel-fonte"
                href="http://portal.mec.gov.br/index.php?option=com_docman&view=download&alias=236131-rceb001-22&category_slug=fevereiro-2022-pdf&Itemid=30192"
                target="_blank"
                rel="noopener"
                style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--green)', textDecoration: 'none', display: 'inline-flex', gap: 6, alignItems: 'baseline' }}
              >
                <span>Resolução CNE/CEB nº 1/2022</span>
                <span style={{ fontSize: 11 }}>↗</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* rodapé: vistos por último + assistente (placeholder) */}
      <div style={{ flex: 'none', borderTop: '1px solid color-mix(in srgb, var(--edge) 80%, transparent)', padding: '12px 22px 14px' }}>
        {vistosUI.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...MONO_LABEL, marginBottom: 7 }}>Vistos por último</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {vistosUI.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="eg-painel-chip"
                  title={n.tipo === 'habilidade' ? n.resumo : n.label}
                  onClick={() => aoIr(n.id)}
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
                  <Bolinha tipo={n.tipo} tamanho={7} />
                  <span>{n.tipo === 'habilidade' ? n.codigo : n.label}</span>
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
            placeholder="Pergunte: onde “algoritmos” aparece no 7.º ano?"
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
            Em desenvolvimento — aqui a IA vai transformar sua pergunta em uma consulta SPARQL e
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
