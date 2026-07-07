import { useEffect, useRef, useState } from 'react'
import materias from '../data/materias'

// Popover ("balão") ancorado a um card de série na grade "Explore por série".
// Sobe ao abrir (keyframe egFadeUp), com uma setinha apontando para o card.
// Lista as matérias como chips selecionáveis — a seleção é só visual por ora (a
// tela de grafo é trabalho futuro). Fecha no ×, clicando fora ou com Esc.
// O grid não se mexe: o balão é position:absolute (fora do fluxo) sobre o card.

const TODAS = 'Todas as matérias'

function MateriaPopover({ ano, onClose, placement = 'baixo', anchorRef }) {
  const ref = useRef(null)
  const [selecionada, setSelecionada] = useState(TODAS)

  // Fecha ao clicar fora do CARD (mousedown) ou ao pressionar Esc. Usamos o card
  // (anchorRef), não só o balão: assim clicar no próprio card apenas alterna (o
  // onClick do card fecha), sem o "fecha-e-reabre" que aconteceria se o mousedown
  // externo fechasse antes do clique do card reabrir.
  useEffect(() => {
    const aoClicarFora = (e) => {
      const alvo = anchorRef?.current ?? ref.current
      if (alvo && !alvo.contains(e.target)) onClose()
    }
    const aoTeclar = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [onClose, anchorRef])

  const paraCima = placement === 'cima'
  const lista = [TODAS, ...materias]

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Matérias — ${ano}`}
      onClick={(e) => e.stopPropagation()} // não deixa o clique fechar o card pai
      style={{
        position: 'absolute',
        left: 0,
        [paraCima ? 'bottom' : 'top']: 'calc(100% + 12px)',
        width: 300,
        zIndex: 30,
        background: 'var(--pill-bg)',
        border: '1px solid var(--pill-border)',
        borderRadius: 16,
        padding: '16px 16px 18px',
        boxShadow: '0 18px 40px -16px rgba(0,0,0,.35)',
        animation: 'egFadeUp .18s ease',
        textAlign: 'left',
        cursor: 'default',
      }}
    >
      {/* setinha apontando para o card */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 24,
          [paraCima ? 'bottom' : 'top']: -6,
          width: 12,
          height: 12,
          background: 'var(--pill-bg)',
          borderTop: paraCima ? 'none' : '1px solid var(--pill-border)',
          borderLeft: paraCima ? 'none' : '1px solid var(--pill-border)',
          borderBottom: paraCima ? '1px solid var(--pill-border)' : 'none',
          borderRight: paraCima ? '1px solid var(--pill-border)' : 'none',
          transform: 'rotate(45deg)',
        }}
      />

      {/* cabeçalho: MATÉRIA — {ano} + botão fechar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span
          style={{
            font: "11px/1 'JetBrains Mono', monospace",
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          Matéria — {ano}
        </span>
        <button type="button" aria-label="Fechar" onClick={onClose} className="eg-materia-fechar">
          ×
        </button>
      </div>

      {/* chips de matérias */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {lista.map((m) => {
          const sel = selecionada === m
          return (
            <button
              key={m}
              type="button"
              aria-pressed={sel}
              onClick={() => setSelecionada(m)}
              className={sel ? 'eg-materia-chip eg-materia-chip--sel' : 'eg-materia-chip'}
            >
              {m}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MateriaPopover
