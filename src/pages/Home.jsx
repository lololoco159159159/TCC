import SiteHeader from '../components/SiteHeader'
import HeroSection from '../components/HeroSection'
import GraphSection from '../components/GraphSection'
import StatsBand from '../components/StatsBand'
import TestimonialsSection from '../components/TestimonialsSection'
import Footer from '../components/Footer'

// Home — landing de scroll longo (protótipo final): header + hero "Conhecimento
// conectado" + grafo-globo interativo + banda de estatísticas + depoimentos (que
// revelam a grade "Encontre as habilidades da sua turma.") + footer.
function Home({ onLogin, onSignup, onGrafos }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ============ HEADER (compartilhado com a página de grafos) ============ */}
      <SiteHeader onGrafos={onGrafos}>
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
      </SiteHeader>

      {/* Seção 1: hero "Conhecimento conectado." */}
      <HeroSection onLogin={onLogin} onSignup={onSignup} />

      {/* Seção 2: grafo-globo interativo "Cada matéria tem sua rede." */}
      <GraphSection onGrafos={onGrafos} />

      {/* Seção 3: banda de estatísticas (3 contadores animados) */}
      <StatsBand />

      {/* Seção 4: depoimentos + revelação da grade "Encontre as habilidades da
          sua turma." (cortina dirigida por scroll) */}
      <TestimonialsSection onGrafos={onGrafos} />

      {/* Footer: fim do site */}
      <Footer onSignup={onSignup} onGrafos={onGrafos} />
    </div>
  )
}

export default Home
