import { useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Navegação por estado entre as três telas atuais.
// Quando o site crescer, isto pode ser substituído por react-router-dom.
function App() {
  const [tela, setTela] = useState('home')

  function irPara(novaTela) {
    setTela(novaTela)
    window.scrollTo(0, 0)
  }

  if (tela === 'login') {
    return <Login onHome={() => irPara('home')} onSignup={() => irPara('signup')} />
  }
  if (tela === 'signup') {
    return <Signup onHome={() => irPara('home')} onLogin={() => irPara('login')} />
  }
  return <Home onLogin={() => irPara('login')} onSignup={() => irPara('signup')} />
}

export default App
