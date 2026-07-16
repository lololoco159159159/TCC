import { useEffect, useRef, useState } from 'react'
import Chave from '../Chave'

// Botão de acessibilidade das telas de conta — um recorte do popover de
// acessibilidade da página de grafos (GrafoOverlays), reduzido a UM controle:
// "Desativar animações e física". Aqui a única animação é o fundo de vértices,
// então paletas/formas (que só valem para o grafo) ficam de fora.
//
// Composição (state-lift-state): o componente é CONTROLADO — não guarda a
// preferência; recebe `semAnim` e `aoToggle` da MolduraConta (o pai comum ao
// FundoVertices). Só o abre/fecha do popover é estado local. Reusa o primitivo
// Chave e a classe .eg-toggle-linha (mesmos do grafo).
//
// Posição: fixo na lateral direita, logo ACIMA do widget A/A (FontSizeWidget),
// formando uma pilha de controles de acessibilidade. O popover abre à esquerda.

const LABEL_TITULO = {
  font: "600 10px/1 'JetBrains Mono', monospace",
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
}

function BotaoAcessibilidade({ semAnim, aoToggle }) {
  const [aberto, setAberto] = useState(false)
  const raizRef = useRef(null)

  // fecha no Esc e no clique fora (mesmo padrão do MateriaPopover)
  useEffect(() => {
    if (!aberto) return
    const aoClicarFora = (e) => {
      if (raizRef.current && !raizRef.current.contains(e.target)) setAberto(false)
    }
    const aoTeclar = (e) => {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  return (
    <div
      ref={raizRef}
      style={{
        // fixo na borda direita, logo ACIMA do widget A/A (que é centrado em
        // top:50%): metade da altura do widget (~57px) + uma folga de 8px. Em
        // px, então escala junto com o zoom de fonte (tudo vive no #eg-root).
        position: 'fixed',
        right: 14,
        bottom: 'calc(50% + 65px)',
        zIndex: 120,
      }}
    >
      <button
        type="button"
        className="eg-font-btn"
        aria-label="Opções de acessibilidade"
        aria-expanded={aberto}
        title="Acessibilidade"
        onClick={() => setAberto((a) => !a)}
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          border: `1px solid ${semAnim ? 'var(--green)' : 'var(--pill-border)'}`,
          background: 'var(--pill-bg)',
          color: 'var(--text)',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* ícone universal de acessibilidade (pessoa em círculo) */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9.2" />
          <circle cx="12" cy="7.4" r="1.1" fill="currentColor" stroke="none" />
          <path d="M6.5 9.2c1.8.9 3.6 1.3 5.5 1.3s3.7-.4 5.5-1.3" />
          <path d="M12 10.5v4M12 14.5l-2.4 3.4M12 14.5l2.4 3.4" />
        </svg>
      </button>

      {/* popover abre à ESQUERDA do botão (ele está na borda direita) */}
      {aberto ? (
        <div
          role="dialog"
          aria-label="Acessibilidade"
          style={{
            position: 'absolute',
            right: 'calc(100% + 8px)',
            bottom: 0,
            width: 262,
            background: 'var(--pill-bg)',
            border: '1px solid var(--pill-border)',
            borderRadius: 14,
            padding: '12px 13px',
            boxShadow: '0 14px 34px rgba(28,38,32,.14)',
            animation: 'egSurgir .14s ease',
          }}
        >
          <div style={{ ...LABEL_TITULO, marginBottom: 9 }}>Acessibilidade</div>
          <button
            type="button"
            className="eg-toggle-linha"
            onClick={aoToggle}
            aria-pressed={semAnim}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '7px 6px',
              border: 'none',
              background: 'transparent',
              borderRadius: 9,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: "700 12px/1.4 'Figtree', sans-serif", color: 'var(--text)' }}>
                Desativar animações e física
              </span>
              <span style={{ display: 'block', fontSize: 10, color: 'var(--faint)' }}>
                o fundo de vértices para de se mover
              </span>
            </span>
            <Chave ligada={semAnim} />
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default BotaoAcessibilidade
