import { useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Grafos from './pages/Grafos'
import FontSizeWidget from './components/FontSizeWidget'
import { useTheme } from './context/useTheme'

// Parâmetros de recorte do grafo na URL (deep-link da página Grafos)
const PARAMS_GRAFO = ['serie', 'ano', 'disciplina', 'materia', 'conceito']

// Deep-link: uma URL com recorte (?serie=…&disciplina=…) abre direto a página
// Grafos — sem isso o roteamento por estado sempre começaria na Home e o link
// compartilhado se perderia.
function telaInicial() {
  try {
    const q = new URLSearchParams(location.search)
    return PARAMS_GRAFO.some((k) => q.has(k)) ? 'grafos' : 'home'
  } catch {
    return 'home'
  }
}

// Navegação por estado entre as telas.
// Quando o site crescer, isto pode ser substituído por react-router-dom.
function App() {
  const [tela, setTela] = useState(telaInicial)
  const { fontZoom } = useTheme()

  function irPara(novaTela) {
    // saindo do grafo, o recorte sai da URL junto (ele só faz sentido lá)
    if (novaTela !== 'grafos') {
      try {
        const u = new URL(location.href)
        PARAMS_GRAFO.forEach((k) => u.searchParams.delete(k))
        history.replaceState(null, '', u.toString())
      } catch {
        /* ambientes sem history */
      }
    }
    setTela(novaTela)
    window.scrollTo(0, 0)
  }

  let pagina
  if (tela === 'login') {
    pagina = <Login onHome={() => irPara('home')} onSignup={() => irPara('signup')} />
  } else if (tela === 'signup') {
    pagina = <Signup onHome={() => irPara('home')} onLogin={() => irPara('login')} />
  } else if (tela === 'grafos') {
    pagina = (
      <Grafos
        onHome={() => irPara('home')}
        onSignup={() => irPara('signup')}
        onGrafos={() => irPara('grafos')}
      />
    )
  } else {
    pagina = (
      <Home
        onLogin={() => irPara('login')}
        onSignup={() => irPara('signup')}
        onGrafos={() => irPara('grafos')}
      />
    )
  }

  return (
    // O zoom aplica o tamanho de fonte escolhido no widget A/A ao site inteiro
    <div id="eg-root" style={{ minHeight: '100vh', background: 'var(--bg)', zoom: fontZoom }}>
      <FontSizeWidget />
      {pagina}
    </div>
  )
}

export default App
