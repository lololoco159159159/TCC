import { useState } from 'react'
import MolduraConta from '../components/conta/MolduraConta'
import {
  CARD_VIDRO,
  TITULO_CARD,
  SUBTITULO_CARD,
  LABEL_CAMPO,
  MSG_ERRO,
} from '../components/conta/estilos'

// Rótulo de campo em bloco (todos os labels do Signup são assim)
const LABEL_BLOCO = { ...LABEL_CAMPO, display: 'block', marginBottom: 8 }

// Validação simples de e-mail (mesma regra do protótipo de design)
function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((valor || '').trim())
}

// Tela de Criar conta — card de vidro fiel ao overlay do protótipo (A3,
// ESTADO_ATUAL.md §4.3): h1 Spectral 34, labels mono, inputs sobre --bg com
// foco verde, botão primário DOURADO e o parágrafo dos termos. O vidro no
// lugar do fundo opaco do protótipo é desvio consciente (D12) para o fundo
// de vértices aparecer. O cadastro real (back-end) é trabalho futuro (D2);
// por ora apenas valida os campos e simula o envio.
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
      {/* a largura máxima (400, a do protótipo) vem do miolo da moldura */}
      <div style={CARD_VIDRO}>
        <h1 style={TITULO_CARD}>Criar conta</h1>
        <p style={SUBTITULO_CARD}>É gratuito para professores da educação básica.</p>

        {/* Campo: nome completo (mb 20, como no protótipo) */}
        <div style={{ marginBottom: 20 }}>
          <label style={LABEL_BLOCO}>Nome completo</label>
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
          {erroNome ? <div style={MSG_ERRO}>{erroNome}</div> : null}
        </div>

        {/* Campo: e-mail institucional (mb 20) */}
        <div style={{ marginBottom: 20 }}>
          <label style={LABEL_BLOCO}>E-mail institucional</label>
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
          {erroEmail ? <div style={MSG_ERRO}>{erroEmail}</div> : null}
        </div>

        {/* Campo: senha (mb 24) */}
        <div style={{ marginBottom: 24 }}>
          <label style={LABEL_BLOCO}>Senha</label>
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
          {erroSenha ? <div style={MSG_ERRO}>{erroSenha}</div> : null}
        </div>

        <button onClick={enviar} className="eg-btn-primario" style={{ width: '100%', padding: 15 }}>
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </button>

        <p
          style={{
            margin: '20px 0 0',
            textAlign: 'center',
            font: "400 12.5px/1.55 'Figtree', sans-serif",
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
