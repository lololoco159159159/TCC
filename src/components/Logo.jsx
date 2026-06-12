// Logo do EduGraph: três nós conectados (mini grafo) + nome do produto.
// Usado na nav da home e no topo das telas de Entrar / Criar conta.
// As cores vêm das variáveis de tema, então o logo acompanha o modo escuro.
function Logo({ onClick, tamanho = 22 }) {
  return (
    <div
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}
    >
      <svg width={tamanho} height={tamanho} viewBox="0 0 22 22" fill="none">
        <line x1="6" y1="6" x2="16" y2="9" style={{ stroke: 'var(--accent)' }} strokeWidth="1.7" />
        <line x1="16" y1="9" x2="9.5" y2="16.5" style={{ stroke: 'var(--accent)' }} strokeWidth="1.7" />
        <line x1="6" y1="6" x2="9.5" y2="16.5" style={{ stroke: 'var(--line-strong)' }} strokeWidth="1.7" />
        <circle cx="6" cy="6" r="3.1" style={{ fill: 'var(--ink)' }} />
        <circle cx="16" cy="9" r="3.1" style={{ fill: 'var(--accent)' }} />
        <circle cx="9.5" cy="16.5" r="2.6" style={{ fill: 'var(--ink)' }} />
      </svg>
      <span
        style={{
          font: "700 18px/1 'Inter', sans-serif",
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        EduGraph
      </span>
    </div>
  )
}

export default Logo
