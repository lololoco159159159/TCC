import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import LogosInstitucionais from './LogosInstitucionais'

// Header único do site (ajuste de 2026-07-12, a pedido do autor): Home e
// página de grafos usam EXATAMENTE o mesmo cabeçalho — base compacta da página
// de grafos (60px, borda inferior) — variando apenas o slot da direita
// (children): Entrar/Criar conta na Home, botão de perfil no Grafos.
// `paginaAtiva === 'grafos'` marca o item "Grafos" da nav como ativo
// (sublinhado verde, fiel ao protótipo da página); fora dela o item navega.
// O Logo leva à Home quando há onHome (na própria Home fica estático).
// As laterais têm flex:1 e a nav fica no CENTRO GEOMÉTRICO do header: trocar
// de página (slot direito mais largo/estreito) não desloca os itens do meio.
// O slot de conta (children) tem LARGURA FIXA nas duas páginas: assim os
// logos institucionais, o divisor e o ThemeToggle também não se movem — na
// página de grafos o botão de perfil se estica para preencher o slot.

// largura do par "Entrar + Criar conta" da Home (14px Figtree + paddings);
// o botão de perfil ocupa o mesmo espaço via width:100%
const LARGURA_SLOT_CONTA = 180

function SiteHeader({ paginaAtiva, onHome, onGrafos, children }) {
  return (
    <header
      style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        height: 60,
        padding: '0 26px',
        borderBottom: '1px solid var(--edge)',
        background: 'var(--bg)',
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: 0 }}>
        <Logo tamanho={34} onClick={onHome} />
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap', flex: 'none' }}>
        {paginaAtiva === 'grafos' ? (
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
        ) : (
          <span className="eg-link-nav" onClick={onGrafos}>
            Grafos
          </span>
        )}
        <span className="eg-link-nav">BNCC</span>
        <span className="eg-link-nav">Para escolas</span>
        <span className="eg-link-nav">Ajuda</span>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14, minWidth: 0 }}>
        <LogosInstitucionais altura={22} padding="5px 10px" />
        <span style={{ width: 1, height: 24, background: 'var(--edge)', flex: 'none' }} />
        <ThemeToggle />
        <div
          style={{
            width: LARGURA_SLOT_CONTA,
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 14,
          }}
        >
          {children}
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
