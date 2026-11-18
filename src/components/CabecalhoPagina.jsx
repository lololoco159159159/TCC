// Faixa de título das páginas de conteúdo (Fórum e Ontologias — D23): migalha
// em mono ("EduGraph › Fórum"), título em Spectral, uma frase e, à direita, o
// que a página quiser (busca, botão). `aviso`: pílula discreta abaixo da frase
// (ex.: "prévia — as conversas ainda não são salvas").
function CabecalhoPagina({ migalha, titulo, destaque, frase, aviso, children }) {
  return (
    <section style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--pill-border)' }}>
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '44px 32px 38px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 32,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: 600 }}>
          <div
            style={{
              font: "12px/1 'JetBrains Mono', monospace",
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--testi-accent)',
              marginBottom: 16,
            }}
          >
            {migalha}
          </div>
          <h1
            style={{
              margin: 0,
              font: "700 clamp(32px, 3.6vw, 48px)/1.04 'Spectral', serif",
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            {titulo}{' '}
            {destaque ? <em style={{ fontStyle: 'italic', fontWeight: 600, color: 'var(--testi-accent)' }}>{destaque}</em> : null}
          </h1>
          <p style={{ margin: '16px 0 0', fontSize: 16, lineHeight: 1.6, color: 'var(--muted)' }}>{frase}</p>
          {aviso ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 18,
                padding: '6px 12px',
                borderRadius: 999,
                border: '1px solid var(--pill-border)',
                background: 'var(--pill-bg)',
                font: "11px/1.3 'JetBrains Mono', monospace",
                letterSpacing: '0.04em',
                color: 'var(--muted)',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flex: 'none' }} />
              {aviso}
            </span>
          ) : null}
        </div>
        {children ? <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>{children}</div> : null}
      </div>
    </section>
  )
}

export default CabecalhoPagina
