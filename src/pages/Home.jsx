import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

// Home — Etapa 1 do redesenho (protótipo final): header + hero "Conhecimento
// conectado". A grande seção de grafo interativo, a banda de estatísticas, os
// depoimentos e o footer completos virão nas próximas etapas.
function Home({ onLogin, onSignup }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ============ HEADER ============ */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
          padding: '20px 28px',
          maxWidth: 1480,
          margin: '0 auto',
        }}
      >
        <Logo tamanho={38} />

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--muted)',
            whiteSpace: 'nowrap',
            flex: 'none',
          }}
        >
          <span className="eg-link-nav">Grafos</span>
          <span className="eg-link-nav">BNCC</span>
          <span className="eg-link-nav">Para escolas</span>
          <span className="eg-link-nav">Ajuda</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 'none' }}>
          {/* Logos institucionais (UFES / LabOtim) entram aqui na próxima etapa. */}
          <ThemeToggle />
          <span
            onClick={onLogin}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Entrar
          </span>
          <button
            onClick={onSignup}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#fff',
              background: 'var(--green)',
              padding: '9px 18px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Criar conta
          </button>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '40px 48px 30px',
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          gap: 40,
          alignItems: 'center',
          minHeight: 540,
        }}
      >
        {/* Coluna esquerda: label + título + parágrafo */}
        <div style={{ maxWidth: 560 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              font: "12px/1 'JetBrains Mono', monospace",
              letterSpacing: '0.14em',
              color: 'var(--muted)',
              textTransform: 'uppercase',
              marginBottom: 26,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />
            <span style={{ width: 30, height: 1, background: 'var(--edge)' }} />
            <span>BNCC · Pensamento Computacional</span>
          </div>

          <h1
            style={{
              margin: 0,
              font: "700 clamp(52px, 6vw, 88px)/0.98 'Spectral', serif",
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              marginBottom: 26,
            }}
          >
            Conhecimento
            <br />
            <em style={{ fontStyle: 'italic', fontWeight: 600, color: 'var(--gold)' }}>
              conectado.
            </em>
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.62,
              color: 'var(--muted)',
              maxWidth: 480,
            }}
          >
            Os grafos da BNCC de Computação mostram como cada habilidade se liga às matérias que
            você já ensina. Veja{' '}
            <strong style={{ color: 'var(--text)', fontWeight: 700 }}>matemática</strong> virar base
            para <strong style={{ color: 'var(--text)', fontWeight: 700 }}>algoritmo</strong> — e
            planeje com o currículo inteiro à vista.
          </p>
        </div>

        {/* Coluna direita: dois grupos de CTA separados por divisor "ou" */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'center',
            maxWidth: 330,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11 }}>
            <span
              style={{
                font: "12px/1 'JetBrains Mono', monospace",
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}
            >
              Junte-se à comunidade
            </span>
            <button
              onClick={onSignup}
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 600,
                color: '#fff',
                background: 'var(--green)',
                padding: '16px 28px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Criar conta gratuita
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '26px 2px' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--edge)' }} />
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
            <span
              style={{
                font: "11px/1 'JetBrains Mono', monospace",
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}
            >
              ou
            </span>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)' }} />
            <span style={{ flex: 1, height: 1, background: 'var(--edge)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11 }}>
            <span style={{ fontSize: 13, color: 'var(--faint)' }}>Já possui conta?</span>
            <button
              onClick={onLogin}
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--text)',
                background: 'transparent',
                padding: '16px 28px',
                borderRadius: 999,
                border: '1px solid var(--pill-border)',
                cursor: 'pointer',
              }}
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
