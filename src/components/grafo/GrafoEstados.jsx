// Overlays de ESTADO do palco da página de grafos (G3; extraídos da página na
// R7b — movimento puro de JSX): card-convite (início), skeleton de nós pulsando
// + spinner (carregando), card de erro (Tentar novamente / Voltar ao início) e
// card de vazio (Limpar filtros). Carregando/erro/vazio cobrem o palco com
// zIndex 32 (acima do painel de contexto, 30 — ver a escala no index.css);
// o convite fica sem z-index, acima do canvas só pela ordem no DOM.

// pontos do skeleton de carregamento (verbatim do protótipo)
const SKELETON = [
  { l: 22, t: 30, d: 18, delay: 0 },
  { l: 30, t: 55, d: 14, delay: 0.15 },
  { l: 38, t: 22, d: 12, delay: 0.3 },
  { l: 45, t: 62, d: 22, delay: 0.1 },
  { l: 50, t: 38, d: 16, delay: 0.45 },
  { l: 57, t: 18, d: 12, delay: 0.25 },
  { l: 60, t: 70, d: 14, delay: 0.5 },
  { l: 66, t: 44, d: 20, delay: 0.05 },
  { l: 72, t: 26, d: 12, delay: 0.38 },
  { l: 76, t: 60, d: 16, delay: 0.2 },
  { l: 35, t: 75, d: 12, delay: 0.55 },
  { l: 84, t: 40, d: 14, delay: 0.32 },
  { l: 18, t: 60, d: 12, delay: 0.42 },
  { l: 88, t: 66, d: 10, delay: 0.12 },
]

function GrafoEstados({ status, msgErro, aoTentarNovamente, aoLimpar }) {
  return (
    <>
      {/* estado início: card-convite */}
      {status === 'inicio' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
          }}
        >
          <div
            style={{
              maxWidth: 560,
              textAlign: 'center',
              background: 'var(--pill-bg)',
              border: '1px solid var(--pill-border)',
              borderRadius: 18,
              padding: '42px 44px 40px',
              boxShadow: '0 18px 50px -24px rgba(0,0,0,.3)',
            }}
          >
            <div
              style={{
                font: "12px/1 'JetBrains Mono', monospace",
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--green)',
                marginBottom: 16,
              }}
            >
              Explorar grafos
            </div>
            <h1
              style={{
                margin: 0,
                font: "700 clamp(26px, 3vw, 38px)/1.1 'Spectral', serif",
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                marginBottom: 16,
              }}
            >
              Monte um recorte e explore o grafo.
            </h1>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: 'var(--muted)' }}>
              Use a barra acima: escolha série, matéria ou conceito e clique em{' '}
              <strong style={{ color: 'var(--text)' }}>Filtrar</strong> para consultar o endpoint e ver
              as habilidades da BNCC Computação conectadas ao currículo que você já ensina.
            </p>
          </div>
        </div>
      )}

      {/* estado carregando: skeleton de nós pulsando + spinner */}
      {status === 'carregando' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'color-mix(in srgb, var(--grafo-bg) 82%, transparent)',
            zIndex: 32,
          }}
        >
          {SKELETON.map((sk, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${sk.l}%`,
                top: `${sk.t}%`,
                width: sk.d,
                height: sk.d,
                borderRadius: '50%',
                background: 'var(--grafo-aresta)',
                animation: `egPulsar 1.3s ease-in-out ${sk.delay}s infinite`,
              }}
            />
          ))}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 64,
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--pill-bg)',
              border: '1px solid var(--pill-border)',
              borderRadius: 999,
              padding: '9px 18px',
              boxShadow: '0 10px 26px rgba(28,38,32,.10)',
            }}
          >
            <div
              style={{
                width: 15,
                height: 15,
                borderRadius: '50%',
                border: '2.5px solid var(--pill-border)',
                borderTopColor: 'var(--green)',
                animation: 'egGirar .8s linear infinite',
              }}
            />
            <span
              style={{
                font: "10.5px/1 'JetBrains Mono', monospace",
                letterSpacing: '0.12em',
                color: 'var(--body)',
                textTransform: 'uppercase',
              }}
            >
              Consultando endpoint SPARQL…
            </span>
            <span style={{ fontSize: 11, color: 'var(--faint)' }}>Apache Jena Fuseki</span>
          </div>
        </div>
      )}

      {/* estado erro */}
      {status === 'erro' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 32,
          }}
        >
          <div
            style={{
              width: 460,
              maxWidth: '92%',
              background: 'var(--pill-bg)',
              border: '1px solid var(--gold)',
              borderRadius: 18,
              padding: '28px 30px',
              boxShadow: '0 24px 60px rgba(28,38,32,.14)',
              animation: 'egSurgir .18s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />
              <span
                style={{
                  font: "10px/1 'JetBrains Mono', monospace",
                  letterSpacing: '0.16em',
                  color: 'var(--gold)',
                  textTransform: 'uppercase',
                }}
              >
                Falha na consulta
              </span>
            </div>
            <h2 style={{ font: "700 22px/1.2 'Spectral', serif", margin: '0 0 8px', color: 'var(--text)' }}>
              Não foi possível consultar o grafo
            </h2>
            <p
              style={{
                font: "11.5px/1.6 'JetBrains Mono', monospace",
                color: 'var(--muted)',
                margin: '0 0 20px',
                background: 'var(--bg)',
                border: '1px dashed var(--pill-border)',
                borderRadius: 10,
                padding: '10px 12px',
              }}
            >
              {msgErro}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="eg-grafo-filtrar"
                onClick={aoTentarNovamente}
                style={{
                  padding: '10px 20px',
                  borderRadius: 999,
                  border: 'none',
                  background: 'var(--green)',
                  color: '#fff',
                  font: "600 14px/1 'Figtree', sans-serif",
                  cursor: 'pointer',
                }}
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={aoLimpar}
                style={{
                  padding: '10px 18px',
                  borderRadius: 999,
                  border: '1px solid var(--pill-border)',
                  background: 'transparent',
                  color: 'var(--body)',
                  font: "500 14px/1 'Figtree', sans-serif",
                  cursor: 'pointer',
                }}
              >
                Voltar ao início
              </button>
            </div>
          </div>
        </div>
      )}

      {/* estado vazio */}
      {status === 'vazio' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 32,
          }}
        >
          <div
            style={{
              width: 440,
              maxWidth: '92%',
              background: 'var(--pill-bg)',
              border: '1px solid var(--pill-border)',
              borderRadius: 18,
              padding: '28px 30px',
              boxShadow: '0 24px 60px rgba(28,38,32,.12)',
              animation: 'egSurgir .18s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />
              <span
                style={{
                  font: "10px/1 'JetBrains Mono', monospace",
                  letterSpacing: '0.16em',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                }}
              >
                Sem resultados
              </span>
            </div>
            <h2 style={{ font: "700 22px/1.2 'Spectral', serif", margin: '0 0 8px', color: 'var(--text)' }}>
              Nenhuma conexão neste recorte
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 20px' }}>
              A combinação de série e matéria não retornou habilidades. Tente ampliar o recorte —
              trocar a matéria ou liberar a série.
            </p>
            <button
              type="button"
              className="eg-grafo-filtrar"
              onClick={aoLimpar}
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                border: 'none',
                background: 'var(--green)',
                color: '#fff',
                font: "600 14px/1 'Figtree', sans-serif",
                cursor: 'pointer',
              }}
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default GrafoEstados
