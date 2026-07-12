import { useEffect, useRef, useState } from 'react'
import { LISTA_DISCIPLINAS } from '../data/mockFuseki'

// Popover ("balão") ancorado a um card de série na grade "Explore por série".
// Sobe ao abrir (keyframe egFadeUp), com uma setinha apontando para o card.
// Lista as matérias como chips selecionáveis e, desde a G11, fecha o ciclo com
// a Home: o CTA "Ver o grafo desta turma →" chama onVerGrafo(disciplinaId) — a
// seção escreve o recorte na URL e navega para a página de grafos, que o aplica
// pelo deep-link da G3. Fecha no ×, clicando fora ou com Esc.
// O grid não se mexe: o balão é position:absolute (fora do fluxo) sobre o card.
// (Desvio documentado: o CTA não existe no protótipo — o balão de lá é só
// visual; o botão materializa a integração prevista no roadmap G11.)

// As matérias vêm do "back-end" (mock do Fuseki) — mesma fonte da página de
// grafos; o chip "Todas as matérias" vira recorte sem disciplina (id vazio).
const TODAS = { id: '', label: 'Todas as matérias' }
const materias = [TODAS, ...LISTA_DISCIPLINAS.map((d) => ({ id: d.id, label: d.label }))]

function MateriaPopover({ ano, onClose, onVerGrafo, placement = 'baixo', anchorRef }) {
  const ref = useRef(null)
  const [selecionada, setSelecionada] = useState(TODAS.id)

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
        {materias.map((m) => {
          const sel = selecionada === m.id
          return (
            <button
              key={m.id || 'todas'}
              type="button"
              aria-pressed={sel}
              onClick={() => setSelecionada(m.id)}
              className={sel ? 'eg-materia-chip eg-materia-chip--sel' : 'eg-materia-chip'}
            >
              {m.label}
            </button>
          )
        })}
      </div>

      {/* CTA da G11: abre a página de grafos com o recorte série(+matéria) aplicado */}
      <button
        type="button"
        className="eg-grafo-filtrar"
        onClick={() => onVerGrafo?.(selecionada)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          marginTop: 14,
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
