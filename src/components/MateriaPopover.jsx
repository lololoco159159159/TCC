import { useEffect, useRef } from 'react'

// Popover ("balão") ancorado a um card de série na grade "Explore por série".
// Sobe ao abrir (keyframe egFadeUp), com uma setinha apontando para o card. O
// CTA "Ver o grafo desta turma →" (G11) chama onVerGrafo — a seção navega para
// a página de grafos com a consulta da turma. Fecha no ×, clicando fora ou com
// Esc. O grid não se mexe: o balão é position:absolute (fora do fluxo).
// (Desvio documentado: o CTA não existe no protótipo — o balão de lá é só
// visual; o botão materializa a integração prevista no roadmap G11.)
// N9 (integração com o Neo4j): os chips de MATÉRIA saíram — vinham do mock, e o
// grafo da orientadora ainda não tem componente curricular (hoje é só o 1.º ano
// de Matemática). Voltam quando o modelo tiver o componente; até lá, o balão
// tem só o CTA (decisão do autor).

function MateriaPopover({ ano, onClose, onVerGrafo, placement = 'baixo', anchorRef }) {
  const ref = useRef(null)

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

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Turma — ${ano}`}
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

      {/* cabeçalho: TURMA — {ano} + botão fechar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span
          style={{
            font: "11px/1 'JetBrains Mono', monospace",
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          Turma — {ano}
        </span>
        <button type="button" aria-label="Fechar" onClick={onClose} className="eg-materia-fechar">
          ×
        </button>
      </div>

      {/* CTA (G11 → N9): abre a página de grafos com a consulta da turma */}
      <button
        type="button"
        className="eg-grafo-filtrar"
        onClick={() => onVerGrafo?.()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          padding: '10px 16px',
          borderRadius: 999,
          border: 'none',
          background: 'var(--green)',
          color: '#fff',
          font: "700 13.5px/1 'Figtree', sans-serif",
          cursor: 'pointer',
        }}
      >
        <span>Ver o grafo desta turma</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}

export default MateriaPopover
