import { useState } from 'react'
import { ANOS, LISTA_DISCIPLINAS } from '../../data/mockFuseki'
import { OpcoesAcessibilidade } from './GrafoOverlays'
import { MONO_LABEL } from './estilos'

// Perfil MOCK do header da página de grafos (G10) — porte do protótipo com a
// identidade genérica "Perfil" (avatar "P"; sem persona): substitui o
// Entrar/Criar conta por um botão de conta que abre um dropdown fixo
// (backdrop fecha ao clicar fora):
//   • identidade + "Alterar senha" (aviso: o fluxo chega com o sistema de contas);
//   • "Minhas turmas": lista ano+matéria com Filtrar (aplica o recorte) e
//     remover, + selects e "+ Adicionar" (dedupe na página);
//   • "Acessibilidade · cores do grafo": reusa OpcoesAcessibilidade (paletas
//     CUD + formas + sem animação) — os mesmos controles do PaletaPopover.
// As preferências persistem em localStorage['edugraphPrefs'] (efeito na página).

const SELECT_TURMA = {
  minWidth: 0,
  padding: '7px 8px',
  border: '1px solid var(--pill-border)',
  borderRadius: 9,
  background: 'var(--bg)',
  font: "500 12.5px/1.3 'Figtree', sans-serif",
  color: 'var(--body)',
  cursor: 'pointer',
  outline: 'none',
}

// chapeuzinho de formatura (turma) — ícone do protótipo
function IconeTurma({ tamanho }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
      <path d="M22 10 12 5 2 10l10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}

function GrafoPerfil({
  aberto,
  aoAlternar,
  aoFechar,
  turmas, // já com { ano, disciplina, label, indice }
  aoAddTurma,
  aoRemoverTurma,
  aoFiltrarTurma,
  ...acessibilidade // paleta/formas/semAnim + handlers (OpcoesAcessibilidade)
}) {
  const [novaAno, setNovaAno] = useState(ANOS[0].id)
  const [novaDisc, setNovaDisc] = useState(LISTA_DISCIPLINAS[0].id)
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
          // width 100%: preenche o slot de conta do SiteHeader (mesma largura
          // do par Entrar/Criar conta da Home — nada se desloca entre páginas)
          width: '100%',
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
          Perfil
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
          style={{ marginLeft: 'auto', flex: 'none' }}
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

            {/* minhas turmas */}
            <div style={{ borderTop: '1px solid var(--pill-border)', marginTop: 16, paddingTop: 14 }}>
              <div style={{ ...MONO_LABEL, marginBottom: 9 }}>Minhas turmas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 11 }}>
                {turmas.map((t) => (
                  <div
                    key={`${t.ano}|${t.disciplina}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      padding: '8px 10px',
                      border: '1px solid var(--pill-border)',
                      borderRadius: 11,
                      background: 'var(--bg)',
                    }}
                  >
                    <IconeTurma tamanho={13} />
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t.label}
                    </span>
                    <button
                      type="button"
                      className="eg-grafo-filtrar"
                      title="Filtrar o grafo por esta turma"
                      onClick={() => aoFiltrarTurma(t)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 10px',
                        borderRadius: 999,
                        border: 'none',
                        background: 'var(--green)',
                        color: '#fff',
                        font: "700 11.5px/1 'Figtree', sans-serif",
                        cursor: 'pointer',
                        flex: 'none',
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 5h16l-6.5 8v5.5L10.5 20v-7z" />
                      </svg>
                      <span>Filtrar</span>
                    </button>
                    <button
                      type="button"
                      className="eg-painel-fechar"
                      title="Remover turma"
                      onClick={() => aoRemoverTurma(t.indice)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 7,
                        border: '1px solid transparent',
                        background: 'transparent',
                        color: 'var(--faint)',
                        fontSize: 14,
                        lineHeight: 1,
                        cursor: 'pointer',
                        flex: 'none',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <select value={novaAno} onChange={(e) => setNovaAno(e.target.value)} style={{ ...SELECT_TURMA, flex: 1 }}>
                  {ANOS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <select value={novaDisc} onChange={(e) => setNovaDisc(e.target.value)} style={{ ...SELECT_TURMA, flex: 1.3 }}>
                  {LISTA_DISCIPLINAS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="eg-turma-add"
                  title="Adicionar turma"
                  onClick={() => aoAddTurma(novaAno, novaDisc)}
                  style={{
                    padding: '7px 13px',
                    borderRadius: 9,
                    border: '1.5px solid var(--green)',
                    background: 'transparent',
                    color: 'var(--green)',
                    font: "700 12.5px/1 'Figtree', sans-serif",
                    cursor: 'pointer',
                    flex: 'none',
                  }}
                >
                  + Adicionar
                </button>
              </div>
            </div>

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
