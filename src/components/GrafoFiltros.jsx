import { ANOS, LISTA_DISCIPLINAS, LISTA_CONCEITOS } from '../data/mockFuseki'

// Barra de busca e filtros da página de grafos (fiel ao protótipo).
// Modelo de SELEÇÃO PENDENTE: pills de série e selects de matéria/conceito só
// mexem em `pend`; a consulta ao endpoint acontece apenas no botão Filtrar.
// A busca tem autocomplete (buscar() do mock) — escolher uma sugestão aplica o
// recorte na hora. A prévia "N vértices" antecipa o tamanho do recorte pendente.

// estilo das pills de série: pendente (escolhida agora) > aplicada (no recorte
// atual) > neutra — mesmos três estados do protótipo
function estiloPill(pendente, aplicado) {
  if (pendente) return { bg: 'var(--green)', cor: '#fff', borda: 'var(--green)', peso: 700 }
  if (aplicado)
    return { bg: 'var(--grafo-previa-bg)', cor: 'var(--green)', borda: 'var(--green)', peso: 600 }
  return { bg: 'var(--bg)', cor: 'var(--body)', borda: 'var(--pill-border)', peso: 500 }
}

function GrafoFiltros({
  pend,
  aoMudarPend,
  filtros,
  status,
  busca,
  sugestoes,
  aoBuscar,
  aoFecharSugestoes,
  aoEscolherSugestao,
  prevQtd,
  temPend,
  pendDiff,
  filtrosAtivos,
  aoFiltrar,
  aoLimpar,
}) {
  const aoTeclarBusca = (e) => {
    if (e.key === 'Enter' && sugestoes.length) aoEscolherSugestao(sugestoes[0])
    if (e.key === 'Escape') aoBuscar('')
  }

  return (
    <div
      style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        flexWrap: 'wrap',
        padding: '11px 26px',
        background: 'var(--pill-bg)',
        borderBottom: '1px solid var(--pill-border)',
        position: 'relative',
        zIndex: 40,
      }}
    >
      {/* ---- busca com autocomplete ---- */}
      <div style={{ position: 'relative', width: 250, flex: 'none' }}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--faint)"
          strokeWidth="2.4"
          style={{
            position: 'absolute',
            left: 13,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
        <input
          type="text"
          className="eg-grafo-busca"
          value={busca}
          onChange={(e) => aoBuscar(e.target.value)}
          onKeyDown={aoTeclarBusca}
          onBlur={aoFecharSugestoes}
          placeholder="Buscar habilidade, matéria, conceito…"
        />
        {sugestoes.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 42,
              left: 0,
              right: -110,
              background: 'var(--pill-bg)',
              border: '1px solid var(--pill-border)',
              borderRadius: 14,
              boxShadow: '0 18px 44px rgba(28,38,32,.14)',
              overflow: 'hidden',
              animation: 'egSurgir .14s ease',
              zIndex: 60,
            }}
          >
            {sugestoes.map((s) => (
              <button
                key={s.id}
                type="button"
                className="eg-grafo-sugestao"
                onMouseDown={(e) => {
                  e.preventDefault()
                  aoEscolherSugestao(s)
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: `var(--no-${s.tipo})`,
                    flex: 'none',
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: 13.5,
                    color: 'var(--text)',
                    fontWeight: 500,
                  }}
                >
                  {s.tipo === 'habilidade' ? `${s.codigo} — ${s.resumo}` : s.label}
                </span>
                <span
                  style={{
                    font: "9.5px/1 'JetBrains Mono', monospace",
                    letterSpacing: '0.08em',
                    color: 'var(--faint)',
                    textTransform: 'uppercase',
                    flex: 'none',
                  }}
                >
                  {s.tipo === 'habilidade' ? 'Habilidade' : s.tipo === 'conceito' ? 'Conceito' : 'Matéria'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--pill-border)', flex: 'none' }} />

      {/* ---- série (pills, seleção pendente) ---- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 'none' }}>
        {ANOS.map((a) => {
          const pendente = pend.ano === a.id
          const aplicado = filtros.ano === a.id && status !== 'inicio'
          const e = estiloPill(pendente, aplicado)
          return (
            <button
              key={a.id}
              type="button"
              className="eg-grafo-pill"
              title={pendente ? 'Clique novamente para desmarcar' : 'Selecionar série (aplica no Filtrar)'}
              onClick={() => aoMudarPend({ ...pend, ano: pendente ? '' : a.id })}
              style={{
                padding: '7px 11px',
                borderRadius: 999,
                border: `1px solid ${e.borda}`,
                background: e.bg,
                color: e.cor,
                font: `${e.peso} 13px/1 'Figtree', sans-serif`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {a.label}
            </button>
          )
        })}
      </div>

      {/* ---- matéria ---- */}
      <select
        value={pend.disciplina}
        onChange={(e) => aoMudarPend({ ...pend, disciplina: e.target.value })}
        style={{
          padding: '8px 26px 8px 11px',
          border: `1px solid ${pend.disciplina ? 'var(--green)' : 'var(--pill-border)'}`,
          borderRadius: 10,
          background: 'var(--bg)',
          font: "600 13px/1.3 'Figtree', sans-serif",
          color: pend.disciplina ? 'var(--green)' : 'var(--body)',
          cursor: 'pointer',
          outline: 'none',
          maxWidth: 170,
        }}
      >
        <option value="">Matéria: todas</option>
        {LISTA_DISCIPLINAS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>

      {/* ---- conceito ---- */}
      <select
        value={pend.conceito}
        onChange={(e) => aoMudarPend({ ...pend, conceito: e.target.value })}
        style={{
          padding: '8px 26px 8px 11px',
          border: `1px solid ${pend.conceito ? 'var(--green)' : 'var(--pill-border)'}`,
          borderRadius: 10,
          background: 'var(--bg)',
          font: "600 13px/1.3 'Figtree', sans-serif",
          color: pend.conceito ? 'var(--green)' : 'var(--body)',
          cursor: 'pointer',
          outline: 'none',
          maxWidth: 180,
        }}
      >
        <option value="">Conceito: todos</option>
        {LISTA_CONCEITOS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>

      {/* ---- prévia + Filtrar + Limpar ---- */}
      {temPend && (
        <span
          title="Vértices que a consulta vai retornar com os critérios selecionados"
          style={{
            font: "11px/1 'JetBrains Mono', monospace",
            color: 'var(--green)',
            background: 'var(--grafo-previa-bg)',
            border: '1px solid var(--grafo-previa-borda)',
            borderRadius: 999,
            padding: '6px 12px',
            whiteSpace: 'nowrap',
          }}
        >
          {prevQtd} vértices
        </span>
      )}
      <button
        type="button"
        className="eg-grafo-filtrar"
        title="Consultar o endpoint com os critérios selecionados"
        onClick={aoFiltrar}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 20px',
          borderRadius: 999,
          border: 'none',
          background: 'var(--green)',
          color: '#fff',
          font: "700 13.5px/1 'Figtree', sans-serif",
          cursor: 'pointer',
          opacity: pendDiff ? 1 : 0.45,
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 5h16l-6.5 8v5.5L10.5 20v-7z" />
        </svg>
        <span>Filtrar</span>
      </button>
      {filtrosAtivos && (
        <button
          type="button"
          onClick={aoLimpar}
          style={{
            padding: '7px 10px',
            border: 'none',
            background: 'transparent',
            color: 'var(--gold)',
            font: "600 13px/1 'Figtree', sans-serif",
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          Limpar
        </button>
      )}
    </div>
  )
}

export default GrafoFiltros
