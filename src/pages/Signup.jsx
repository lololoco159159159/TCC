import { useState } from 'react'
import Logo from '../components/Logo'

// Estilos reutilizados nos rótulos e mensagens do formulário
const estiloLabel = {
  display: 'block',
  marginBottom: 8,
  font: "500 11px/1 'IBM Plex Mono', monospace",
  letterSpacing: '0.1em',
  color: '#86868b',
  textTransform: 'uppercase',
}

const estiloErro = {
  marginTop: 7,
  font: "400 13px/1.3 'Inter', sans-serif",
  color: '#d1453b',
}

// Validação simples de e-mail (mesma regra do protótipo de design)
function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((valor || '').trim())
}

// Tela de Criar conta — mesmo layout do Login, com três campos.
// O cadastro real (back-end) é trabalho futuro; por ora apenas
// valida os campos e simula o envio.
function Signup({ onHome, onLogin }) {
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f5f7',
      }}
    >
      {/* Barra superior: logo + atalho para entrar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          background: '#fff',
          borderBottom: '1px solid #eef0f1',
        }}
      >
        <Logo onClick={onHome} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ font: "400 14px/1 'Inter', sans-serif", color: '#86868b' }}>
            Já tem conta?
          </span>
          <span
            onClick={onLogin}
            style={{
              font: "600 14px/1 'Inter', sans-serif",
              color: '#1f8a5b',
              cursor: 'pointer',
            }}
          >
            Entrar
          </span>
        </div>
      </div>

      {/* Card central do formulário */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 430,
            background: '#fff',
            border: '1px solid #ececef',
            borderRadius: 18,
            padding: '40px 36px',
          }}
        >
          <h2
            style={{
              margin: 0,
              font: "600 28px/1.1 'Inter', sans-serif",
              letterSpacing: '-0.025em',
              color: '#1d1d1f',
            }}
          >
            Criar conta
          </h2>
          <p
            style={{
              margin: '8px 0 28px',
              font: "400 15px/1.5 'Inter', sans-serif",
              color: '#86868b',
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
            style={{ width: '100%', padding: 14, marginTop: 18, font: "600 16px/1 'Inter', sans-serif" }}
          >
            {enviando ? 'Criando conta…' : 'Criar conta'}
          </button>

          <p
            style={{
              margin: '18px 0 0',
              textAlign: 'center',
              font: "400 12px/1.5 'Inter', sans-serif",
              color: '#a6a6ab',
            }}
          >
            Ao criar uma conta, você concorda com os Termos e a Política de Privacidade do
            EduGraph.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
