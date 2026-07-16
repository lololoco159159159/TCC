import { useRef, useState } from 'react'
import MolduraConta from '../components/conta/MolduraConta'
import {
  CARD_VIDRO,
  TITULO_CARD,
  SUBTITULO_CARD,
  LABEL_CAMPO,
  MSG_ERRO,
} from '../components/conta/estilos'

// Validação simples de e-mail (mesma regra do protótipo de design)
function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((valor || '').trim())
}

// Tela de Entrar — card de vidro fiel ao overlay do protótipo (A3,
// ESTADO_ATUAL.md §4.3): h1 Spectral 34, labels mono, inputs sobre --bg com
// foco verde, linha da senha com "Esqueceu?", botão primário DOURADO,
// divisor "ou" e rodapé de troca. O vidro no lugar do fundo opaco do
// protótipo é desvio consciente (D12) para o fundo de vértices aparecer.
// Acessibilidade (revisão A5, web-interface-guidelines): <form> semântico
// (Enter envia), labels associados por htmlFor/id, autocomplete/name/
// inputmode, spellCheck off no e-mail, foco no 1.º campo com erro e
// aria-invalid/role=alert nas mensagens. A autenticação real (back-end) é
// trabalho futuro (D2); por ora apenas valida os campos e simula o envio.
function Login({ onHome, onSignup, onGrafos }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroEmail, setErroEmail] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const emailRef = useRef(null)
  const senhaRef = useRef(null)

  function enviar() {
    let ee = ''
    let es = ''
    if (!emailValido(email)) ee = 'Informe um e-mail válido.'
    if (!senha) es = 'Informe sua senha.'
    if (ee || es) {
      setErroEmail(ee)
      setErroSenha(es)
      // foca o primeiro campo com erro (guideline: focus first error on submit)
      if (ee) emailRef.current?.focus()
      else senhaRef.current?.focus()
      return
    }
    setEnviando(true)
    // Simula a chamada de autenticação e volta para a home
    setTimeout(() => onHome(), 850)
  }

  return (
    <MolduraConta
      onHome={onHome}
      onGrafos={onGrafos}
      onSignup={onSignup}
      trocaTexto="Novo por aqui?"
      trocaAcao="Criar conta"
      onTrocar={onSignup}
    >
      {/* a largura máxima (400, a do protótipo) vem do miolo da moldura */}
      <div style={CARD_VIDRO}>
        <h1 style={TITULO_CARD}>Entrar</h1>
        <p style={SUBTITULO_CARD}>Acesse e continue de onde você parou nos seus grafos.</p>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            enviar()
          }}
          style={{ margin: 0 }}
        >
          {/* Campo: e-mail (mb 20, como no protótipo) */}
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="login-email" style={{ ...LABEL_CAMPO, display: 'block', marginBottom: 8 }}>
              E-mail
            </label>
            <input
              id="login-email"
              ref={emailRef}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={erroEmail ? true : undefined}
              aria-describedby={erroEmail ? 'login-email-erro' : undefined}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErroEmail('')
              }}
              placeholder="voce@escola.edu.br"
              className={`eg-input${erroEmail ? ' eg-input-erro' : ''}`}
            />
            {erroEmail ? (
              <div id="login-email-erro" role="alert" style={MSG_ERRO}>
                {erroEmail}
              </div>
            ) : null}
          </div>

          {/* Campo: senha (mb 24) com o "Esqueceu?" na linha do rótulo */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <label htmlFor="login-senha" style={LABEL_CAMPO}>
                Senha
              </label>
              <span
                style={{ font: "600 13px/1 'Figtree', sans-serif", color: 'var(--green)', cursor: 'pointer' }}
              >
                Esqueceu?
              </span>
            </div>
            <input
              id="login-senha"
              ref={senhaRef}
              type="password"
              name="password"
              autoComplete="current-password"
              aria-invalid={erroSenha ? true : undefined}
              aria-describedby={erroSenha ? 'login-senha-erro' : undefined}
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value)
                setErroSenha('')
              }}
              placeholder="••••••••"
              className={`eg-input${erroSenha ? ' eg-input-erro' : ''}`}
            />
            {erroSenha ? (
              <div id="login-senha-erro" role="alert" style={MSG_ERRO}>
                {erroSenha}
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={enviando}
            aria-busy={enviando}
            className="eg-btn-primario"
            style={{ width: '100%', padding: 15 }}
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        {/* Divisor "ou" (mono uppercase, linhas --pill-border) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--pill-border)' }} />
          <span
            style={{
              font: "400 11px/1 'JetBrains Mono', monospace",
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--faint)',
            }}
          >
            ou
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--pill-border)' }} />
        </div>

        <p
          style={{
            margin: 0,
            textAlign: 'center',
            font: "400 14px/1.4 'Figtree', sans-serif",
            color: 'var(--muted)',
          }}
        >
          Ainda não tem conta?{' '}
          <span
            onClick={onSignup}
            style={{ fontWeight: 700, color: 'var(--green)', cursor: 'pointer' }}
          >
            Criar conta
          </span>
        </p>
      </div>
    </MolduraConta>
  )
}

export default Login
