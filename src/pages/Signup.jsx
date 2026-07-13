import { useState } from 'react'
import MolduraConta from '../components/conta/MolduraConta'

// Estilos reutilizados nos rótulos e mensagens do formulário
const estiloLabel = {
  display: 'block',
  marginBottom: 8,
  font: "500 11px/1 'JetBrains Mono', monospace",
  letterSpacing: '0.1em',
  color: 'var(--mut)',
  textTransform: 'uppercase',
}

const estiloErro = {
  marginTop: 7,
  font: "400 13px/1.3 'Figtree', sans-serif",
  color: '#d1453b',
}

// Validação simples de e-mail (mesma regra do protótipo de design)
function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((valor || '').trim())
}

// Tela de Criar conta — casca da A1 (ESTADO_ATUAL.md §4.3): a MolduraConta traz
// o SiteHeader único (prompt "Já tem conta? Entrar" no slot fixo), a área
// central de 1 viewport e o footer abaixo da dobra. O card abaixo ainda é o
// layout antigo — o redesenho fiel ao protótipo (vidro + tokens novos) é a
// etapa A3. O cadastro real (back-end) é trabalho futuro (D2); por ora apenas
// valida os campos e simula o envio.
function Signup({ onHome, onLogin, onSignup, onGrafos }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroNome, setErroNome] = useState('')
  const [erroEmail, setErroEmail] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [enviando, setEnviando] = useState(false)

  function enviar() {
    let en = ''
    let ee = ''
    let es = ''
    if (!nome.trim()) en = 'Como podemos te chamar?'
    if (!emailValido(email)) ee = 'Use um e-mail válido.'
    if ((senha || '').length < 8) es = 'Mínimo de 8 caracteres.'
    if (en || ee || es) {
      setErroNome(en)
      setErroEmail(ee)
      setErroSenha(es)
      return
    }
    setEnviando(true)
    // Simula a chamada de cadastro e volta para a home
    setTimeout(() => onHome(), 950)
  }

  return (
    <MolduraConta
      onHome={onHome}
      onGrafos={onGrafos}
      onSignup={onSignup}
      trocaTexto="Já tem conta?"
      trocaAcao="Entrar"
      onTrocar={onLogin}
    >
      {/* Card do formulário (layout antigo — vira vidro fiel ao protótipo na A3);
          a largura máxima vem do miolo da moldura (LARGURA_CARD) */}
      <div
        style={{
          width: '100%',
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 18,
          padding: '40px 36px',
        }}
      >
        <h2
          style={{
            margin: 0,
            font: "600 28px/1.1 'Figtree', sans-serif",
            letterSpacing: '-0.025em',
            color: 'var(--ink)',
          }}
        >
          Criar conta
        </h2>
        <p
          style={{
            margin: '8px 0 28px',
            font: "400 15px/1.5 'Figtree', sans-serif",
            color: 'var(--mut)',
          }}
        >
          É gratuito para professores da educação básica.
        </p>

        {/* Campo: nome completo */}
        <div style={{ marginBottom: 18 }}>
          <label style={estiloLabel}>Nome completo</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value)
              setErroNome('')
            }}
            placeholder="Maria Oliveira"
            className={`eg-input${erroNome ? ' eg-input-erro' : ''}`}
          />
          {erroNome && <div style={estiloErro}>{erroNome}</div>}
        </div>

        {/* Campo: e-mail institucional */}
        <div style={{ marginBottom: 18 }}>
          <label style={estiloLabel}>E-mail institucional</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErroEmail('')
            }}
            placeholder="voce@escola.edu.br"
            className={`eg-input${erroEmail ? ' eg-input-erro' : ''}`}
          />
          {erroEmail && <div style={estiloErro}>{erroEmail}</div>}
        </div>

        {/* Campo: senha */}
        <div style={{ marginBottom: 10 }}>
          <label style={estiloLabel}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => {
              setSenha(e.target.value)
              setErroSenha('')
            }}
            placeholder="Mínimo de 8 caracteres"
            className={`eg-input${erroSenha ? ' eg-input-erro' : ''}`}
          />
          {erroSenha && <div style={estiloErro}>{erroSenha}</div>}
        </div>

        <button
          onClick={enviar}
          className="eg-btn-primario"
          style={{ width: '100%', padding: 14, marginTop: 18, font: "600 16px/1 'Figtree', sans-serif" }}
        >
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </button>

        <p
          style={{
            margin: '18px 0 0',
            textAlign: 'center',
            font: "400 12px/1.5 'Figtree', sans-serif",
            color: 'var(--faint)',
          }}
        >
          Ao criar uma conta, você concorda com os Termos e a Política de Privacidade do
          EduGraph.
        </p>
      </div>
    </MolduraConta>
  )
}

export default Signup
