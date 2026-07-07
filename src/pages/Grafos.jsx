import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Footer from '../components/Footer'
import labotim from '../assets/labotim.png'
import ufes from '../assets/ufes.png'

// Página "Grafos" — a tela que exibirá o grafo de conhecimento (BNCC ×
// Pensamento Computacional). Protótipo: design/prototipo_grafo.html.
// Etapa G1 do roadmap (ESTADO_ATUAL.md §4.1): apenas a CASCA — header próprio
// (nav com "Grafos" ativo), área de trabalho com o estado-convite e footer
// abaixo da dobra. A barra de filtros, o canvas com o motor do grafo e o painel
// de detalhe chegam nas próximas etapas (G2–G11). Diferente do protótipo (só
// claro), esta página acompanha o tema claro/escuro do site via tokens.
function Grafos({ onHome, onLogin, onSignup, onGrafos }) {
  return (
    <>
      {/* quadro de exatamente 1 viewport: header + área de trabalho; o footer
          fica abaixo da dobra e aparece ao rolar, como no protótipo */}
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        {/* ============ HEADER da página (60px) ============ */}
        <header
          style={{
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            height: 60,
            padding: '0 26px',
            borderBottom: '1px solid var(--edge)',
            background: 'var(--bg)',
          }}
        >
          <Logo tamanho={34} onClick={onHome} />

          <nav style={{ display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap', flex: 'none' }}>
            {/* item ativo: sublinhado verde, como no protótipo */}
            <span
              style={{
                font: "600 14px/1 'Figtree', sans-serif",
                color: 'var(--green)',
                borderBottom: '2px solid var(--green)',
                paddingBottom: 4,
                cursor: 'default',
              }}
            >
              Grafos
            </span>
            <span className="eg-link-nav">BNCC</span>
            <span className="eg-link-nav">Para escolas</span>
            <span className="eg-link-nav">Ajuda</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 'none' }}>
            <a
              href="https://labotim.inf.ufes.br"
              target="_blank"
              rel="noopener"
              title="LabOtim · Laboratório de Otimização e Modelagem Computacional"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#fff',
                border: '1px solid rgba(28,38,32,.08)',
                borderRadius: 9,
                padding: '5px 10px',
                boxShadow: '0 2px 7px -4px rgba(0,0,0,.25)',
              }}
            >
              <img src={labotim} alt="LabOtim" style={{ height: 22, display: 'block' }} />
            </a>
            <a
              href="https://www.ufes.br"
              target="_blank"
              rel="noopener"
              title="Universidade Federal do Espírito Santo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#fff',
                border: '1px solid rgba(28,38,32,.08)',
                borderRadius: 9,
                padding: '5px 10px',
                boxShadow: '0 2px 7px -4px rgba(0,0,0,.25)',
              }}
            >
              <img src={ufes} alt="UFES" style={{ height: 22, display: 'block' }} />
            </a>
            <span style={{ width: 1, height: 24, background: 'var(--edge)' }} />
            <ThemeToggle />
            {/* Na etapa G10 este trecho vira o perfil (mock) do protótipo */}
            <span
              onClick={onLogin}
              style={{
                fontSize: 14,
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
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                background: 'var(--green)',
                padding: '8px 16px',
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

        {/* ============ ÁREA DE TRABALHO (estado-convite) ============ */}
        <main
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            background: 'var(--grafo-bg)',
            backgroundImage: 'radial-gradient(var(--dot-color) 1px, transparent 1.4px)',
            backgroundSize: '26px 26px',
            overflow: 'hidden',
          }}
        >
          {/* card-convite central (estado "início" simplificado do protótipo) */}
          <div
            style={{
              maxWidth: 560,
              textAlign: 'center',
              background: 'var(--pill-bg)',
              border: '1px solid var(--pill-border)',
              borderRadius: 18,
              padding: '42px 44px 40px',
              boxShadow: '0 18px 50px -24px rgba(0,0,0,.3)',
            }}
          >
            <div
              style={{
                font: "12px/1 'JetBrains Mono', monospace",
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--green)',
                marginBottom: 16,
              }}
            >
              Explorar grafos
            </div>
            <h1
              style={{
                margin: 0,
                font: "700 clamp(26px, 3vw, 38px)/1.1 'Spectral', serif",
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                marginBottom: 16,
              }}
            >
              Monte um recorte e explore o grafo.
            </h1>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: 'var(--muted)' }}>
              Escolha série, matéria e conceito para ver as habilidades da BNCC Computação
              conectadas ao currículo que você já ensina. Esta página está em construção — a
              barra de filtros e o grafo interativo chegam nas próximas etapas.
            </p>
          </div>
        </main>
      </div>

      {/* footer abaixo da dobra (aparece ao rolar) */}
      <Footer onSignup={onSignup} onGrafos={onGrafos} />
    </>
  )
}

export default Grafos
