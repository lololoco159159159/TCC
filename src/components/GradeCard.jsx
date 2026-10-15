import { useRef, useState } from 'react'
import MateriaPopover from './MateriaPopover'

// Card de uma série na grade "Explore por série" (extraído do
// TestimonialsSection na R7b — movimento puro). N9: um card por Ano do grafo do
// Neo4j, mostrando só o `nome` do nó ("1º Ano") em destaque (decisão do autor;
// antes: nº de habilidades + o ano). No hover/aberto ganha destaque
// (fundo/borda dourada e texto escuro). Clicar abre o MateriaPopover ancorado
// ao card — o grid não se mexe (o balão é position:absolute, fora do fluxo).
// Só um card fica aberto por vez (estado no pai). O CTA do balão navega para a
// página de grafos com a consulta da turma (aoVerGrafo).
function GradeCard({ ano, aberto, onToggle, aoVerGrafo }) {
  const [hover, setHover] = useState(false)
  const [placement, setPlacement] = useState('baixo')
  const cardRef = useRef(null)

  const aoClicar = () => {
    if (aberto) {
      onToggle(null)
      return
    }
    // decide a direção do balão para não ser cortado pelo rodapé da <section>
    const r = cardRef.current?.getBoundingClientRect()
    setPlacement(r && r.bottom + 340 > window.innerHeight ? 'cima' : 'baixo')
    onToggle(ano)
  }

  const destaque = hover || aberto
  return (
    <div
      ref={cardRef}
      onClick={aoClicar}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        zIndex: aberto ? 20 : undefined,
        background: destaque ? 'var(--grade-card-hover)' : 'var(--grade-card)',
        border: `1px solid ${destaque ? 'var(--gold)' : 'var(--pill-border)'}`,
        borderRadius: 12,
        padding: '20px 16px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'background .25s ease, border-color .25s ease',
      }}
    >
      <div style={{ font: "700 28px/1 'Spectral', serif", color: destaque ? 'var(--text)' : 'var(--gold)' }}>
        {ano}
      </div>
      {aberto && (
        <MateriaPopover
          ano={ano}
          placement={placement}
          anchorRef={cardRef}
          onClose={() => onToggle(null)}
          onVerGrafo={aoVerGrafo}
        />
      )}
    </div>
  )
}

export default GradeCard
