import { useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Grafos from './pages/Grafos'
import Forum from './pages/Forum'
import Ontologias from './pages/Ontologias'
import Arquiteturas from './pages/Arquiteturas'
import FontSizeWidget from './components/FontSizeWidget'
import { useTheme } from './context/useTheme'

// Navegação por estado entre as telas.
// Quando o site crescer, isto pode ser substituído por react-router-dom.
// N10: saiu o deep-link do mock (?serie=…&disciplina=… abria a página Grafos
// com um recorte): a página não lia esses parâmetros desde a N3, e o link para
// os grafos volta com os filtros novos, sobre o modelo do Neo4j.
// 2026-11-18 (D23): telas 'forum' e 'ontologias' (só front-end), alcançadas pelo
// header e pelo rodapé de todas as páginas.
// 2026-11-26: tela 'arquiteturas' (Arquiteturas pedagógicas, só front-end), do
// mesmo jeito.
function App() {
  const [tela, setTela] = useState('home')
  // a busca com que a página de grafos abre (N19: o "Ver o grafo desta turma" da
  // Home — { ano, area, componente }, os códigos do Neo4j); qualquer outra
  // navegação zera. (Até a N19 era uma consulta Cypher executada no console.)
  const [buscaGrafos, setBuscaGrafos] = useState(null)
  const { fontZoom } = useTheme()

  // `opcoes.busca` só vale para a página de grafos. (Os links que chamam
  // onGrafos direto do onClick passam o evento como 1.º argumento — por isso o
  // teste de tipo.)
  function irPara(novaTela, opcoes) {
    setBuscaGrafos(novaTela === 'grafos' && typeof opcoes?.busca?.ano === 'string' ? opcoes.busca : null)
    setTela(novaTela)
    window.scrollTo(0, 0)
  }

  // navegação para as telas de conteúdo, igual em todas as páginas (header e rodapé)
  const nav = {
    onForum: () => irPara('forum'),
    onOntologias: () => irPara('ontologias'),
    onArquiteturas: () => irPara('arquiteturas'),
  }

  let pagina
  if (tela === 'login') {
    pagina = (
      <Login
        onHome={() => irPara('home')}
        onSignup={() => irPara('signup')}
        onGrafos={() => irPara('grafos')}
        {...nav}
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
        {...nav}
      />
    )
  } else if (tela === 'grafos') {
    pagina = (
      <Grafos
        onHome={() => irPara('home')}
        onSignup={() => irPara('signup')}
        onGrafos={() => irPara('grafos')}
        buscaInicial={buscaGrafos}
        {...nav}
      />
    )
  } else if (tela === 'forum' || tela === 'ontologias' || tela === 'arquiteturas') {
    const Pagina = { forum: Forum, ontologias: Ontologias, arquiteturas: Arquiteturas }[tela]
    pagina = (
      <Pagina
        onHome={() => irPara('home')}
        onLogin={() => irPara('login')}
        onSignup={() => irPara('signup')}
        onGrafos={() => irPara('grafos')}
        {...nav}
      />
    )
  } else {
    pagina = (
      <Home
        onLogin={() => irPara('login')}
        onSignup={() => irPara('signup')}
        onGrafos={(opcoes) => irPara('grafos', opcoes)}
        {...nav}
      />
    )
  }

  return (
    // O zoom aplica o tamanho de fonte escolhido no widget A/A ao site inteiro.
    // Na página de grafos o widget não é o fixo: ele vive na coluna de controles
    // do palco, junto dos outros botões (o fixo caía em cima deles).
    <div id="eg-root" style={{ minHeight: '100vh', background: 'var(--bg)', zoom: fontZoom }}>
      {tela !== 'grafos' && <FontSizeWidget />}
      {pagina}
    </div>
  )
}

export default App
