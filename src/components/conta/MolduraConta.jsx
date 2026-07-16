import { useState } from 'react'
import SiteHeader from '../SiteHeader'
import Footer from '../Footer'
import FundoVertices from './FundoVertices'
import BotaoAcessibilidade from './BotaoAcessibilidade'

// Moldura compartilhada das telas de conta — Entrar e Criar conta (A1 do
// roadmap, ESTADO_ATUAL.md §4.3). Porte da estrutura do overlay de auth do
// protótipo final: header + área central de exatamente 1 viewport (o card no
// meio) e o footer abaixo da dobra, aparecendo só ao rolar. No SiteHeader
// (único do site), o slot de conta de largura fixa recebe o prompt de troca do
// protótipo — "Novo por aqui? Criar conta" / "Já tem conta? Entrar" — assim
// logo, nav, logos institucionais e ThemeToggle ficam pixel-idênticos aos das
// outras páginas.
// Fundo de vértices (A2): o wrapper é position:relative e header/main/footer
// vivem em zIndex 1 porque o canvas (FundoVertices) fica em zIndex 0
// (absolute, inset 0) atrás de tudo — o footer já traz seu próprio zIndex 1
// via prop `vidro` (A4); o <main> tem pointer-events:none para os cliques na
// área vazia atravessarem até o canvas — só o miolo do card reativa com
// pointer-events:auto (o div que embrulha os children).

// Largura do miolo clicável = a do card do protótipo (max-width 400 do
// overlay de auth; aplicada na A3)
const LARGURA_CARD = 400

// Preferência "desativar animações e física" (edugraphPrefs.semAnim — mesmo
// contrato/validação da página de grafos, D6). Subida para cá (state-lift-
// state) para o FundoVertices e o BotaoAcessibilidade serem irmãos.
function lerSemAnim() {
  try {
    const p = JSON.parse(localStorage.getItem('edugraphPrefs') || '{}')
    return typeof p.semAnim === 'boolean' ? p.semAnim : false
  } catch {
    return false
  }
}

// Grava só o campo semAnim, preservando os demais (paleta/formas/turmas/painel)
function gravarSemAnim(valor) {
  try {
    const p = JSON.parse(localStorage.getItem('edugraphPrefs') || '{}')
    localStorage.setItem('edugraphPrefs', JSON.stringify({ ...p, semAnim: valor }))
  } catch {
    /* localStorage indisponível — a preferência vale só nesta sessão */
  }
}

function MolduraConta({ onHome, onGrafos, onSignup, trocaTexto, trocaAcao, onTrocar, children }) {
  const [semAnim, setSemAnim] = useState(lerSemAnim)

  function alternarSemAnim() {
    setSemAnim((v) => {
      const novo = !v
      gravarSemAnim(novo)
      return novo
    })
  }

  return (
    <div style={{ position: 'relative', background: 'var(--bg)' }}>
      {/* fundo de vértices atrás de tudo (zIndex 0) — controlado pelo semAnim */}
      <FundoVertices semAnim={semAnim} />

      {/* header acima do canvas */}
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

      {/* footer aparece ao rolar; vidro (blur sobre o fundo de vértices) */}
      <Footer onSignup={onSignup} onGrafos={onGrafos} vidro />

      {/* botão de acessibilidade fixo (só o toggle de animação/física) */}
      <BotaoAcessibilidade semAnim={semAnim} aoToggle={alternarSemAnim} />
    </div>
  )
}

export default MolduraConta
