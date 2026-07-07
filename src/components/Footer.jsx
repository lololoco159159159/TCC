import Logo from './Logo'
import labotim from '../assets/labotim.png'
import ufes from '../assets/ufes.png'

// Footer do EduGraph — fim do site (fiel ao protótipo final). Três faixas:
// marca + colunas de links, parceiros institucionais (LabOtim / UFES) e rodapé
// legal. Reaproveita o <Logo> (grafo de 9 nós + "EduGraph") e os logos já
// extraídos em src/assets. "Criar conta" leva ao cadastro via onSignup;
// "Explorar grafos" leva à página de grafos via onGrafos.
function Footer({ onSignup, onGrafos }) {
  const larguraMax = 1040

  return (
    <footer
      style={{
        background: 'var(--bg2)',
        borderTop: '1px solid var(--pill-border)',
        padding: '54px 32px',
      }}
    >
      {/* ---- marca + colunas de links ---- */}
      <div
        style={{
          maxWidth: larguraMax,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 40,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: 320 }}>
          <Logo tamanho={33} />
          <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.55, color: 'var(--muted)' }}>
            Grafos da BNCC de Computação para professores da educação básica. Veja o currículo conectado.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span
              style={{
                font: "600 12px/1 'JetBrains Mono', monospace",
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text)',
              }}
            >
              Plataforma
            </span>
            <span className="eg-footer-link" onClick={onGrafos}>
              Explorar grafos
            </span>
            <a href="#" className="eg-footer-link">
              BNCC Computação
            </a>
            <span className="eg-footer-link" onClick={onSignup}>
              Criar conta
            </span>
          </nav>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span
              style={{
                font: "600 12px/1 'JetBrains Mono', monospace",
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text)',
              }}
            >
              Apoio
            </span>
            <a href="#" className="eg-footer-link">
              Central de ajuda
            </a>
            <a href="#" className="eg-footer-link">
              Para escolas
            </a>
            <a href="#" className="eg-footer-link">
              Contato
            </a>
          </nav>
        </div>
      </div>

      {/* ---- parceiros institucionais ---- */}
      <div
        style={{
          maxWidth: larguraMax,
          margin: '40px auto 0',
          paddingTop: 30,
          borderTop: '1px solid var(--pill-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            font: "11px/1 'JetBrains Mono', monospace",
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--faint)',
          }}
        >
          Uma iniciativa de
        </span>
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
            borderRadius: 12,
            padding: '14px 20px',
            boxShadow: '0 4px 14px -8px rgba(0,0,0,.3)',
          }}
        >
          <img src={labotim} alt="LabOtim" style={{ height: 42, display: 'block' }} />
        </a>
        <a
          href="https://www.ufes.br"
          target="_blank"
          rel="noopener"
          title="Universidade Federal do Espírito Santo"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
            border: '1px solid rgba(28,38,32,.08)',
            borderRadius: 12,
            padding: '14px 20px',
            boxShadow: '0 4px 14px -8px rgba(0,0,0,.3)',
          }}
        >
          <img src={ufes} alt="UFES" style={{ height: 42, display: 'block' }} />
        </a>
      </div>

      {/* ---- rodapé legal ---- */}
      <div
        style={{
          maxWidth: larguraMax,
          margin: '34px auto 0',
          paddingTop: 22,
          borderTop: '1px solid var(--pill-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--faint)' }}>
          © 2026 EduGraph · Feito para a educação básica
        </span>
        <div style={{ display: 'flex', gap: 22 }}>
          <a href="#" className="eg-footer-legal">
            Privacidade
          </a>
          <a href="#" className="eg-footer-legal">
            Termos
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
