// Par "Entrar / Criar conta" do slot de conta do header (extraído da Home em
// 2026-11-18 para ser reaproveitado pelo Fórum e pelas Ontologias — D23). As
// telas de conta são só visuais (D2): o par apenas navega até elas.
function BotoesConta({ onLogin, onSignup }) {
  return (
    <>
      <span
        onClick={onLogin}
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Entrar
      </span>
      <button
        onClick={onSignup}
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#fff',
          background: 'var(--green)',
          padding: '8px 16px',
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Criar conta
      </button>
    </>
  )
}

export default BotoesConta
