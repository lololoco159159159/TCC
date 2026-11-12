import { useEffect, useRef, useState } from 'react'
import { componentesDoAno } from '../data/filtrosDeBusca'

// Popover ("balão") ancorado a um card de série na grade "Explore por série".
// Sobe ao abrir (keyframe egFadeUp), com uma setinha apontando para o card. O
// CTA "Ver o grafo desta turma →" (G11) chama onVerGrafo — a seção navega para
// a página de grafos. Fecha no ×, clicando fora ou com Esc. O grid não se mexe:
// o balão é position:absolute (fora do fluxo).
// (Desvio documentado: o CTA não existe no protótipo — o balão de lá é só
// visual; o botão materializa a integração prevista no roadmap G11.)
// N9 (integração com o Neo4j): os chips de MATÉRIA saíram — vinham do mock.
// N19 (2026-11-12, pedido do autor): voltaram, agora com os COMPONENTES
// CURRICULARES do ano vindos do Neo4j (os que têm habilidade nele). Escolher um
// chip e clicar no CTA abre a busca da página de grafos já com o ano, a área e o
// componente escolhidos, faltando a pergunta; sem chip escolhido, só o ano.

function MateriaPopover({ ano, codigoAno, onClose, onVerGrafo, placement = 'baixo', anchorRef }) {
  const ref = useRef(null)
  // { estado: carregando | pronto | erro, lista } — os componentes do ano
  const [componentes, setComponentes] = useState({ estado: 'carregando', lista: [] })
  const [escolhido, setEscolhido] = useState(null) // { codigo, nome, area } ou null

  useEffect(() => {
    let vivo = true
    componentesDoAno(codigoAno)
      .then((lista) => vivo && setComponentes({ estado: 'pronto', lista }))
      .catch(() => vivo && setComponentes({ estado: 'erro', lista: [] }))
    return () => {
      vivo = false
    }
  }, [codigoAno])

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

  let aviso = null
  if (componentes.estado === 'carregando') aviso = 'Carregando os componentes…'
  else if (componentes.estado === 'erro') aviso = 'Não foi possível carregar os componentes agora.'
  else if (!componentes.lista.length) aviso = 'Esta turma ainda não tem componentes no grafo.'

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

      {/* chips dos componentes curriculares do ano (N19): um de cada vez;
          clicar de novo no escolhido o solta */}
      {aviso ? (
        <p aria-live="polite" style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--muted)' }}>
          {aviso}
        </p>
      ) : (
        <div role="group" aria-label="Componentes curriculares" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {componentes.lista.map((c) => {
            const sel = escolhido?.codigo === c.codigo
            return (
              <button
                key={c.codigo}
                type="button"
                aria-pressed={sel}
                onClick={() => setEscolhido(sel ? null : c)}
                className={sel ? 'eg-materia-chip eg-materia-chip--sel' : 'eg-materia-chip'}
              >
                {c.nome}
              </button>
            )
          })}
        </div>
      )}

      {/* CTA (G11 → N19): abre a busca da página de grafos já filtrada */}
      <button
        type="button"
        className="eg-grafo-filtrar"
        onClick={() => onVerGrafo?.(escolhido)}
        title={escolhido ? `Abre a busca com ${ano} e ${escolhido.nome}` : `Abre a busca com ${ano}`}
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
