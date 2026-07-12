import { useTheme } from '../context/useTheme'

// Estilo comum dos dois botões "A" (o raio das pontas muda entre eles)
const estiloBotaoBase = {
  width: 46,
  height: 46,
  border: '1px solid var(--line)',
  background: 'var(--card)',
  color: 'var(--ink)',
  cursor: 'pointer',
  boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform .12s ease, opacity .2s ease',
}

// Widget de acessibilidade fixo no meio da lateral direita:
// um "A" grande (aumenta a fonte) sobre um "A" pequeno (diminui),
// com o percentual atual entre eles. O zoom é aplicado no #eg-root.
// A posição vem da classe .eg-font-widget (index.css): quando o popover de
// paleta da página de grafos está aberto (atributo data-paleta-aberta no
// <html>), o widget some com fade (deslizar cobria a legenda "Tipos de nó")
// e reaparece ao fechar.
function FontSizeWidget() {
  const { setFont, fontPct, fonteNoMaximo, fonteNoMinimo } = useTheme()

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
          color: 'var(--mut)',
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
