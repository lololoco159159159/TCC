import { useState } from 'react'
import Logo from '../components/Logo'

// Estilos reutilizados nos rótulos e mensagens do formulário
const estiloLabel = {
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

// Tela de Entrar — formulário centralizado sobre fundo cinza claro.
// A autenticação real (back-end) é trabalho futuro; por ora apenas
// valida os campos e simula o envio.
function Login({ onHome, onSignup }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroEmail, setErroEmail] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [enviando, setEnviando] = useState(false)

  function enviar() {
    let ee = ''
    let es = ''
    if (!emailValido(email)) ee = 'Informe um e-mail válido.'
    if (!senha) es = 'Informe sua senha.'
    if (ee || es) {
      setErroEmail(ee)
      setErroSenha(es)
      return
    }
    setEnviando(true)
    // Simula a chamada de autenticação e volta para a home
    setTimeout(() => onHome(), 850)
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
      {/* Barra superior: logo + atalho para criar conta */}
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
            Novo por aqui?
          </span>
          <span
            onClick={onSignup}
            style={{
              font: "600 14px/1 'Inter', sans-serif",
              color: '#1f8a5b',
              cursor: 'pointer',
            }}
          >
            Criar conta
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
            Entrar
          </h2>
          <p
            style={{
              margin: '8px 0 28px',
              font: "400 15px/1.5 'Inter', sans-serif",
              color: '#86868b',
            }}
          >
            Acesse e continue de onde você parou nos seus grafos.
          </p>

          {/* Campo: e-mail */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ ...estiloLabel, display: 'block', marginBottom: 8 }}>E-mail</label>
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <label style={estiloLabel}>Senha</label>
              <span
                style={{
                  font: "400 13px/1 'Inter', sans-serif",
                  color: '#1f8a5b',
                  cursor: 'pointer',
                }}
              >
                Esqueceu?
              </span>
            </div>
            <input
              type="password"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value)
                setErroSenha('')
              }}
              placeholder="••••••••"
              className={`eg-input${erroSenha ? ' eg-input-erro' : ''}`}
            />
            {erroSenha && <div style={estiloErro}>{erroSenha}</div>}
          </div>

          <button
            onClick={enviar}
            className="eg-btn-primario"
            style={{ width: '100%', padding: 14, marginTop: 18, font: "600 16px/1 'Inter', sans-serif" }}
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>

          {/* Divisor "ou" */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#ececef' }} />
            <span style={{ font: "400 12px/1 'Inter', sans-serif", color: '#b3b3b8' }}>ou</span>
            <div style={{ flex: 1, height: 1, background: '#ececef' }} />
          </div>

          <p
            style={{
              margin: 0,
              textAlign: 'center',
              font: "400 14px/1 'Inter', sans-serif",
              color: '#86868b',
            }}
          >
            Ainda não tem conta?{' '}
            <span
              onClick={onSignup}
              style={{ fontWeight: 600, color: '#1f8a5b', cursor: 'pointer' }}
            >
              Criar conta
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
