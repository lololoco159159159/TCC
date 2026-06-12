import { useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import FontSizeWidget from './components/FontSizeWidget'
import { useTheme } from './context/ThemeContext'

// Navegação por estado entre as três telas atuais.
// Quando o site crescer, isto pode ser substituído por react-router-dom.
function App() {
  const [tela, setTela] = useState('home')
  const { fontZoom } = useTheme()

  function irPara(novaTela) {
    setTela(novaTela)
    window.scrollTo(0, 0)
  }

  let pagina
  if (tela === 'login') {
    pagina = <Login onHome={() => irPara('home')} onSignup={() => irPara('signup')} />
  } else if (tela === 'signup') {
    pagina = <Signup onHome={() => irPara('home')} onLogin={() => irPara('login')} />
  } else {
    pagina = <Home onLogin={() => irPara('login')} onSignup={() => irPara('signup')} />
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
