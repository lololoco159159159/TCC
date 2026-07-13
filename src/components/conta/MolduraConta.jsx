import SiteHeader from '../SiteHeader'
import Footer from '../Footer'

// Moldura compartilhada das telas de conta — Entrar e Criar conta (A1 do
// roadmap, ESTADO_ATUAL.md §4.3). Porte da estrutura do overlay de auth do
// protótipo final: header + área central de exatamente 1 viewport (o card no
// meio) e o footer abaixo da dobra, aparecendo só ao rolar. No SiteHeader
// (único do site), o slot de conta de largura fixa recebe o prompt de troca do
// protótipo — "Novo por aqui? Criar conta" / "Já tem conta? Entrar" — assim
// logo, nav, logos institucionais e ThemeToggle ficam pixel-idênticos aos das
// outras páginas.
// Preparação para a A2 (fundo de vértices): o wrapper é position:relative e
// header/main/footer vivem em zIndex 1 porque o canvas entrará em zIndex 0
// (absolute, inset 0) atrás de tudo; o <main> tem pointer-events:none para os
// cliques na área vazia atravessarem até o canvas — só o miolo do card
// reativa com pointer-events:auto (o div que embrulha os children).

// Largura do miolo clicável = a do card atual (430). A A3 troca para 400,
// a largura do card do protótipo.
const LARGURA_CARD = 430

function MolduraConta({ onHome, onGrafos, onSignup, trocaTexto, trocaAcao, onTrocar, children }) {
  return (
    <div style={{ position: 'relative', background: 'var(--bg)' }}>
      {/* header acima do (futuro) canvas */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SiteHeader onHome={onHome} onGrafos={onGrafos}>
          <span
            style={{
              font: "400 14px/1.3 'Figtree', sans-serif",
              color: 'var(--muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {trocaTexto}{' '}
            <span
              onClick={onTrocar}
              style={{ fontWeight: 700, color: 'var(--green)', cursor: 'pointer' }}
            >
              {trocaAcao}
            </span>
          </span>
        </SiteHeader>
      </div>

      {/* área central: 1 viewport menos os 60px do header (footer abaixo da dobra) */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: 'calc(100vh - 60px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto', width: '100%', maxWidth: LARGURA_CARD }}>{children}</div>
      </main>

      {/* footer aparece ao rolar; ganha o vidro na A4 */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Footer onSignup={onSignup} onGrafos={onGrafos} />
      </div>
    </div>
  )
}

export default MolduraConta
