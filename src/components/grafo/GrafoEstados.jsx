// Overlays de ESTADO do palco da página de grafos (G3; extraídos da página na
// R7b — movimento puro de JSX): card-convite (início), skeleton de nós pulsando
// + spinner (carregando), card de erro (Tentar novamente / Voltar ao início) e
// card de vazio (até a N5). Carregando/erro cobrem o palco com zIndex 32 (acima do
// painel de contexto, 30 — ver a escala no index.css); o convite fica sem
// z-index, acima do canvas só pela ordem no DOM.
// N3 (integração com o Neo4j): textos trocados de SPARQL/Fuseki/Filtrar para
// Neo4j/Cypher/Executar, e o card de erro mostra o código do erro + a mensagem
// (a de sintaxe traz a consulta e um ^ na posição — por isso o resto da
// mensagem vai num bloco que não quebra linha). N5: o card de vazio saiu —
// nenhum estado o aciona mais (consulta sem nós aparece na própria tabela do
// resultado, aberto). N14: o convite fala primeiro da busca do professor e
// depois do console.

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

// título do card de erro conforme a origem do ErroCypher (src/data/neo4j.js)
const TITULO_ERRO = {
  neo4j: 'O Neo4j recusou a consulta',
  http: 'Não foi possível falar com o Neo4j',
  rede: 'Sem resposta do servidor do site',
}

function GrafoEstados({ status, erro, aoTentarNovamente, aoLimpar }) {
  // 1.ª linha da mensagem = explicação (quebra normal); o resto, quando existe,
  // é a consulta + o ^ apontando a posição — sem quebra, para o ^ alinhar
  const [explicacao, ...resto] = (erro?.mensagem || '').split('\n')
  const erroDaConsulta = erro?.origem === 'neo4j' // sintaxe etc.: repetir não adianta

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
              Explore o grafo.
            </h1>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: 'var(--muted)' }}>
              Na <strong style={{ color: 'var(--text)' }}>Busca</strong>, acima, escolha o ano, a matéria e o
              que você quer ver, e clique em <strong style={{ color: 'var(--text)' }}>Ver no grafo</strong>. Ou
              escreva uma consulta no console <strong style={{ color: 'var(--text)' }}>Cypher</strong> — ou
              escolha um dos <strong style={{ color: 'var(--text)' }}>Exemplos</strong> — e clique em{' '}
              <strong style={{ color: 'var(--text)' }}>Executar</strong> (ou Ctrl+Enter). Os nós e as relações
              da resposta aparecem desenhados aqui, como no Neo4j Browser.
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
              Consultando o Neo4j…
            </span>
            <span style={{ fontSize: 11, color: 'var(--faint)' }}>Cypher · Query API</span>
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
              width: 560,
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
              {TITULO_ERRO[erro?.origem] || 'Não foi possível consultar o grafo'}
            </h2>
            <div
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
              {erro?.codigo ? (
                <div style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: 6, overflowWrap: 'anywhere' }}>
                  {erro.codigo}
                </div>
              ) : null}
              <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{explicacao}</div>
              {resto.length ? (
                <pre style={{ margin: '8px 0 0', font: 'inherit', whiteSpace: 'pre', overflowX: 'auto' }}>
                  {resto.join('\n')}
                </pre>
              ) : null}
            </div>
            {erroDaConsulta ? (
              <p style={{ margin: '-8px 0 18px', fontSize: 13.5, lineHeight: 1.5, color: 'var(--muted)' }}>
                Corrija a consulta na barra acima e execute de novo.
              </p>
            ) : null}
            <div style={{ display: 'flex', gap: 10 }}>
              {erroDaConsulta ? null : (
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
              )}
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
    </>
  )
}

export default GrafoEstados
