import Logo from '../components/Logo'

// Home simplificada: nav do design + hero básico com os botões de
// acesso às telas de Entrar e Criar conta. O grafo ilustrativo, o
// marquee de disciplinas e o footer completos virão depois.
function Home({ onLogin, onSignup }) {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Navegação superior */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 32px',
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: '1px solid #eef0f1',
        }}
      >
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <span className="eg-link-nav">Grafos</span>
          <span className="eg-link-nav">BNCC</span>
          <span className="eg-link-nav">Para escolas</span>
          <span className="eg-link-nav">Ajuda</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <span
            onClick={onLogin}
            style={{
              font: "500 14px/1 'Inter', sans-serif",
              color: '#1d1d1f',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
            }}
          >
            Entrar
          </span>
          <button
            onClick={onSignup}
            className="eg-btn-primario"
            style={{ padding: '9px 18px', font: "600 14px/1 'Inter', sans-serif", whiteSpace: 'nowrap' }}
          >
            Criar conta
          </button>
        </div>
      </nav>

      {/* Hero central */}
      <section style={{ padding: '70px 24px 60px' }}>
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: 22 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1f8a5b' }} />
            <span
              style={{
                font: "500 12px/1 'IBM Plex Mono', monospace",
                letterSpacing: '0.16em',
                color: '#6e6e73',
                textTransform: 'uppercase',
              }}
            >
              BNCC · Pensamento Computacional
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              font: "600 clamp(40px, 8vw, 76px)/1.02 'Inter', sans-serif",
              letterSpacing: '-0.035em',
              color: '#1d1d1f',
              maxWidth: '11ch',
            }}
          >
            Conhecimento conectado.
          </h1>
          <p
            style={{
              margin: '20px 0 0',
              font: "400 clamp(16px, 2.1vw, 20px)/1.5 'Inter', sans-serif",
              letterSpacing: '-0.01em',
              color: '#515154',
              maxWidth: 600,
            }}
          >
            Os grafos da BNCC de Computação mostram como cada habilidade se liga às matérias que
            você já ensina. Veja{' '}
            <strong style={{ fontWeight: 600, color: '#1d1d1f' }}>matemática</strong> virar base
            para <strong style={{ fontWeight: 600, color: '#1d1d1f' }}>algoritmo</strong> — e
            planeje com o currículo inteiro à vista.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 32,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={onSignup}
              className="eg-btn-primario"
              style={{ padding: '13px 24px', font: "600 15px/1 'Inter', sans-serif" }}
            >
              Criar conta gratuita
            </button>
            <button
              onClick={onLogin}
              className="eg-btn-secundario"
              style={{ padding: '13px 24px', font: "600 15px/1 'Inter', sans-serif" }}
            >
              Entrar
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
