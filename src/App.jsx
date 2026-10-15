import { useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Grafos from './pages/Grafos'
import FontSizeWidget from './components/FontSizeWidget'
import { useTheme } from './context/useTheme'

// Navegação por estado entre as telas.
// Quando o site crescer, isto pode ser substituído por react-router-dom.
// N10: saiu o deep-link do mock (?serie=…&disciplina=… abria a página Grafos
// com um recorte): a página não lia esses parâmetros desde a N3, e o link para
// os grafos volta com os filtros novos, sobre o modelo do Neo4j.
function App() {
  const [tela, setTela] = useState('home')
  // consulta Cypher que a página de grafos executa ao abrir (N9: o "Ver o grafo
  // desta turma" da Home); qualquer outra navegação zera
  const [consultaGrafos, setConsultaGrafos] = useState(null)
  const { fontZoom } = useTheme()

  // `opcoes.consulta` só vale para a página de grafos. (Os links que chamam
  // onGrafos direto do onClick passam o evento como 1.º argumento — por isso o
  // teste de tipo.)
  function irPara(novaTela, opcoes) {
    setConsultaGrafos(novaTela === 'grafos' && typeof opcoes?.consulta === 'string' ? opcoes.consulta : null)
    setTela(novaTela)
    window.scrollTo(0, 0)
  }

  let pagina
  if (tela === 'login') {
    pagina = (
      <Login
        onHome={() => irPara('home')}
        onSignup={() => irPara('signup')}
        onGrafos={() => irPara('grafos')}
      />
    )
  } else if (tela === 'signup') {
    // onSignup: o footer da moldura tem "Criar conta" (na própria tela, rola ao topo)
    pagina = (
      <Signup
        onHome={() => irPara('home')}
        onLogin={() => irPara('login')}
        onSignup={() => irPara('signup')}
        onGrafos={() => irPara('grafos')}
      />
    )
  } else if (tela === 'grafos') {
    pagina = (
      <Grafos
        onHome={() => irPara('home')}
        onSignup={() => irPara('signup')}
        onGrafos={() => irPara('grafos')}
        consultaInicial={consultaGrafos}
      />
    )
  } else {
    pagina = (
      <Home
        onLogin={() => irPara('login')}
        onSignup={() => irPara('signup')}
        onGrafos={(opcoes) => irPara('grafos', opcoes)}
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
