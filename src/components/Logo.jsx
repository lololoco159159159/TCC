// Logo do EduGraph: grafo de 9 nós conectados + nome do produto.
// Usado nos headers (Home, Grafos, Entrar/Criar conta) e no Footer.
// As cores vêm das variáveis de tema, então o logo acompanha o modo escuro.
function Logo({ onClick, tamanho = 38 }) {
  const altura = Math.round((tamanho * 120) / 150)
  return (
    <div
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
    >
      <svg width={tamanho} height={altura} viewBox="0 0 150 120" fill="none" aria-hidden="true">
        <path
          d="M33 47L64 46M64 46L80 74M80 74L64 100M64 100L34 101M34 101L18 74M18 74L33 47M49 74L33 47M49 74L64 46M49 74L80 74M49 74L64 100M49 74L34 101M49 74L18 74M64 46L101 20M101 20L132 44"
          style={{ stroke: 'var(--green)' }}
          strokeWidth="3"
          strokeOpacity=".45"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="33" cy="47" r="8" style={{ fill: 'var(--gold)' }} />
        <circle cx="64" cy="46" r="8" style={{ fill: 'var(--green)' }} />
        <circle cx="80" cy="74" r="8" style={{ fill: 'var(--green-deep)' }} />
        <circle cx="64" cy="100" r="8" style={{ fill: 'var(--gold)' }} />
        <circle cx="34" cy="101" r="8" style={{ fill: 'var(--green)' }} />
        <circle cx="18" cy="74" r="8" style={{ fill: 'var(--green-deep)' }} />
        <circle cx="49" cy="74" r="9.5" style={{ fill: 'var(--green)' }} />
        <circle cx="101" cy="20" r="8" style={{ fill: 'var(--gold)' }} />
        <circle cx="132" cy="44" r="8" style={{ fill: 'var(--green)' }} />
      </svg>
      <span
        style={{
          font: "700 22px/1 'Spectral', serif",
          letterSpacing: '-0.01em',
          color: 'var(--text)',
        }}
      >
        EduGraph
      </span>
    </div>
  )
}

export default Logo
