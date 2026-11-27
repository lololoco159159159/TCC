import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import LogosInstitucionais from './LogosInstitucionais'
import { LINK_BNCC } from '../data/links'

// Header único do site (ajuste de 2026-07-12, a pedido do autor): Home e
// página de grafos usam EXATAMENTE o mesmo cabeçalho — base compacta da página
// de grafos (60px, borda inferior) — variando apenas o slot da direita
// (children): Entrar/Criar conta na Home, botão de perfil no Grafos.
// `paginaAtiva === 'grafos'` marca o item "Grafos" da nav como ativo
// (sublinhado verde, fiel ao protótipo da página); fora dela o item navega.
// O Logo leva à Home quando há onHome (na própria Home fica estático).
// As laterais têm flex:1 e a nav fica no CENTRO GEOMÉTRICO do header: trocar
// de página (slot direito mais largo/estreito) não desloca os itens do meio.
// O slot de conta (children) tem LARGURA FIXA em todas as páginas: assim os
// logos institucionais, o divisor e o ThemeToggle também não se movem — e o
// conteúdo (par Entrar/Criar conta da Home, prompt de troca das telas de
// conta, botão de perfil do Grafos) fica CENTRALIZADO dentro do slot
// (ajuste de 2026-07-13; antes era alinhado à direita/esticado).

// 2026-11-18 (reunião com a orientadora — D23): "Para escolas" virou "Fórum",
// entrou "Ontologias", e "BNCC" leva à página oficial do MEC numa aba nova. O
// item ativo vale para as três páginas internas (grafos, forum, ontologias).
// 2026-11-18 (pedido do autor): "Ajuda" saiu e entrou "Home", no meio da nav —
// Grafos · BNCC · Home · Fórum · Ontologias —, ativo na própria Home.
// 2026-11-26 (pedido do autor): entrou "Arquiteturas pedagógicas", no fim.
// Em seguida, Home e Fórum trocaram de lugar, para a Home ficar perto do centro:
// Grafos · BNCC · Fórum · Home · Ontologias · Arquiteturas pedagógicas.

// largura do espaço reservado ao conteúdo de conta; cada página centraliza
// seu conteúdo (de largura natural) no meio dele
const LARGURA_SLOT_CONTA = 180

const ESTILO_ATIVO = {
  font: "600 14px/1 'Figtree', sans-serif",
  color: 'var(--green)',
  borderBottom: '2px solid var(--green)',
  paddingBottom: 4,
  cursor: 'default',
}

// item interno da nav: sublinhado verde na página dele; link nas outras
function ItemNav({ ativo, ao, children }) {
  return ativo ? (
    <span style={ESTILO_ATIVO} aria-current="page">
      {children}
    </span>
  ) : (
    <span className="eg-link-nav" onClick={ao}>
      {children}
    </span>
  )
}

function SiteHeader({ paginaAtiva, onHome, onGrafos, onForum, onOntologias, onArquiteturas, children }) {
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
        <ItemNav ativo={paginaAtiva === 'grafos'} ao={onGrafos}>
          Grafos
        </ItemNav>
        <a className="eg-link-nav" href={LINK_BNCC} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          BNCC
        </a>
        <ItemNav ativo={paginaAtiva === 'forum'} ao={onForum}>
          Fórum
        </ItemNav>
        <ItemNav ativo={paginaAtiva === 'home'} ao={onHome}>
          Home
        </ItemNav>
        <ItemNav ativo={paginaAtiva === 'ontologias'} ao={onOntologias}>
          Ontologias
        </ItemNav>
        <ItemNav ativo={paginaAtiva === 'arquiteturas'} ao={onArquiteturas}>
          Arquiteturas pedagógicas
        </ItemNav>
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
            justifyContent: 'center',
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
