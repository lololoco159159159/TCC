import { useTheme } from '../context/useTheme'

// Estilo comum dos dois botões "A" (o raio das pontas muda entre eles)
const estiloBotaoBase = {
  width: 46,
  height: 46,
  border: '1px solid var(--pill-border)',
  background: 'var(--pill-bg)',
  color: 'var(--text)',
  cursor: 'pointer',
  boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform .12s ease, opacity .2s ease',
}

// Widget de acessibilidade: um "A" grande (aumenta a fonte) sobre um "A"
// pequeno (diminui), com o percentual atual entre eles. O zoom é aplicado no
// #eg-root. Duas apresentações:
//  - padrão: fixo no meio da lateral direita (classe .eg-font-widget, no
//    index.css) — Home e telas de conta, montado pelo App;
//  - `compacto`: na coluna de controles do palco da página de grafos, com os
//    botões 34×34 dos outros controles (.eg-grafo-zoom). Ajuste de 2026-10-18: o
//    widget fixo caía em cima dessa coluna.
function FontSizeWidget({ compacto = false }) {
  const { setFont, fontPct, fonteNoMaximo, fonteNoMinimo } = useTheme()

  if (compacto) {
    return (
      <div role="group" aria-label="Tamanho da letra" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          onClick={() => setFont(1)}
          title="Aumentar tamanho da letra"
          className="eg-grafo-zoom"
          style={{ font: "700 17px/1 'Figtree', sans-serif", opacity: fonteNoMaximo ? 0.35 : 1 }}
        >
          A
        </button>
        <span style={{ font: "600 10px/1 'JetBrains Mono', monospace", letterSpacing: '0.05em', color: 'var(--muted)' }}>
          {fontPct}
        </span>
        <button
          type="button"
          onClick={() => setFont(-1)}
          title="Diminuir tamanho da letra"
          className="eg-grafo-zoom"
          style={{ font: "700 11px/1 'Figtree', sans-serif", opacity: fonteNoMinimo ? 0.35 : 1 }}
        >
          A
        </button>
      </div>
    )
  }

  return (
    <div className="eg-font-widget">
      <button
        onClick={() => setFont(1)}
        title="Aumentar tamanho da letra"
        className="eg-font-btn"
        style={{
          ...estiloBotaoBase,
          borderRadius: '14px 14px 6px 6px',
          font: "700 22px/1 'Figtree', sans-serif",
          opacity: fonteNoMaximo ? 0.35 : 1,
        }}
      >
        A
      </button>
      <span
        style={{
          font: "600 10px/1 'JetBrains Mono', monospace",
          letterSpacing: '0.05em',
          color: 'var(--muted)',
        }}
      >
        {fontPct}
      </span>
      <button
        onClick={() => setFont(-1)}
        title="Diminuir tamanho da letra"
        className="eg-font-btn"
        style={{
          ...estiloBotaoBase,
          borderRadius: '6px 6px 14px 14px',
          font: "700 13px/1 'Figtree', sans-serif",
          opacity: fonteNoMinimo ? 0.35 : 1,
        }}
      >
        A
      </button>
    </div>
  )
}

export default FontSizeWidget
