import { useState } from 'react'
import { OpcoesAcessibilidade } from './GrafoOverlays'
import { MONO_LABEL } from './estilos'

// Perfil MOCK do header da página de grafos (G10) — porte do protótipo com a
// identidade genérica "Perfil" (avatar "P"; sem persona): substitui o
// Entrar/Criar conta por um botão de conta que abre um dropdown fixo
// (backdrop fecha ao clicar fora):
//   • identidade + "Alterar senha" (aviso: o fluxo chega com o sistema de contas);
//   • "Acessibilidade · cores do grafo": reusa OpcoesAcessibilidade (paletas
//     CUD + formas + sem animação) — os mesmos controles do PaletaPopover.
// As preferências persistem em localStorage['edugraphPrefs'] (efeito na página).
// N10: a seção "Minhas turmas" saiu com o mock (os anos 5.º–9.º e as matérias
// eram dados do mock; decisão do autor — nada de dado local do grafo).

function GrafoPerfil({
  aberto,
  aoAlternar,
  aoFechar,
  ...acessibilidade // paleta/formas/semAnim + handlers (OpcoesAcessibilidade)
}) {
  const [senhaAviso, setSenhaAviso] = useState(false)

  const alternar = () => {
    setSenhaAviso(false)
    aoAlternar()
  }

  return (
    <>
      <button
        type="button"
        className="eg-painel-chip"
        title="Minha conta"
        onClick={alternar}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 9,
          // largura natural: o slot de conta do SiteHeader centraliza o botão
          // (padronizado com Entrar/Criar conta e o prompt das telas de conta)
          padding: '5px 12px 5px 5px',
          borderRadius: 999,
          border: `1px solid ${aberto ? 'var(--green)' : 'var(--pill-border)'}`,
          background: 'var(--pill-bg)',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'var(--green)',
            color: 'var(--bg)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            font: "700 12px/1 'Figtree', sans-serif",
            letterSpacing: '0.03em',
          }}
        >
          P
        </span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>
          Perfil exemplo
        </span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flex: 'none' }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {aberto && (
        <>
          {/* backdrop: clique fora fecha */}
          <div onClick={aoFechar} style={{ position: 'fixed', inset: 0, zIndex: 190 }} />
          <div
            style={{
              position: 'fixed',
              top: 66,
              right: 20,
              width: 368,
              maxHeight: 'calc(100vh - 92px)',
              overflowY: 'auto',
              background: 'var(--pill-bg)',
              border: '1px solid var(--pill-border)',
              borderRadius: 18,
              boxShadow: '0 30px 70px rgba(28,38,32,.24)',
              zIndex: 200,
              animation: 'egSurgir .16s ease',
              padding: '20px 20px 18px',
            }}
          >
            {/* identidade */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
              <span
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: 'var(--green)',
                  color: 'var(--bg)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  font: "700 16px/1 'Figtree', sans-serif",
                  letterSpacing: '0.03em',
                  flex: 'none',
                }}
              >
                P
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ font: "700 18px/1.15 'Spectral', serif", color: 'var(--text)' }}>
                  Perfil
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  perfil.exemplo@prof.edu.es.gov.br
                </div>
              </div>
            </div>
            <button
              type="button"
              className="eg-painel-chip"
              onClick={() => setSenhaAviso(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 13px',
                borderRadius: 999,
                border: '1px solid var(--pill-border)',
                background: 'transparent',
                color: 'var(--body)',
                font: "600 12.5px/1 'Figtree', sans-serif",
                cursor: 'pointer',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Alterar senha</span>
            </button>
            {senhaAviso && (
              <p style={{ margin: '8px 0 0', fontSize: 11.5, lineHeight: 1.5, color: 'var(--faint)', animation: 'egSurgir .16s ease' }}>
                O fluxo de troca de senha chega junto com o sistema de contas (em desenvolvimento).
              </p>
            )}

            {/* acessibilidade (mesmos controles do popover de paleta) */}
            <div style={{ borderTop: '1px solid var(--pill-border)', marginTop: 16, paddingTop: 14 }}>
              <div style={{ ...MONO_LABEL, marginBottom: 9 }}>Acessibilidade · cores do grafo</div>
              <OpcoesAcessibilidade {...acessibilidade} />
              <p style={{ margin: '8px 0 0', fontSize: 11, lineHeight: 1.5, color: 'var(--faint)' }}>
                Preferências salvas na sua conta e aplicadas em todas as visitas.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default GrafoPerfil
