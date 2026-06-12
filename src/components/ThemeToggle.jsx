import { useTheme } from '../context/ThemeContext'

// Botão de alternância claro/escuro no formato sol/lua.
// No modo claro o sol fica à direita sobre um céu azul com nuvens;
// no modo escuro o nó vira lua e desliza para a esquerda sobre um
// céu roxo com estrelas. O movimento usa transform (GPU) para a
// transição ficar fluida mesmo com o site inteiro mudando de cor.
function ThemeToggle({ style }) {
  const { theme, toggleTheme } = useTheme()
  const escuro = theme === 'dark'
  const opEscuro = escuro ? 1 : 0
  const opClaro = escuro ? 0 : 1

  return (
    <div
      onClick={toggleTheme}
      role="button"
      aria-label="Alternar modo claro e escuro"
      title="Alternar modo claro e escuro"
      style={{
        position: 'relative',
        width: 60,
        height: 32,
        borderRadius: 999,
        cursor: 'pointer',
        overflow: 'hidden',
        flex: 'none',
        boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.22)',
        ...style,
      }}
    >
      {/* Céu de dia (azul) */}
      <span
        style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#4f9ff5,#9ed0f8)' }}
      />
      {/* Céu de noite (roxo) — aparece por cima no modo escuro */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg,#4b2fd6,#7a4ff0)',
          opacity: opEscuro,
          transition: 'opacity .5s ease',
        }}
      />
      {/* Nuvens (visíveis no claro) */}
      <span
        style={{
          position: 'absolute',
          left: 9,
          top: 8,
          width: 12,
          height: 6,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.95)',
          opacity: opClaro,
          transition: 'opacity .45s ease',
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: 15,
          top: 18,
          width: 14,
          height: 7,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.75)',
          opacity: opClaro,
          transition: 'opacity .45s ease',
        }}
      />
      {/* Estrelas (visíveis no escuro) */}
      <span
        style={{
          position: 'absolute',
          right: 11,
          top: 7,
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.95)',
          opacity: opEscuro,
          transition: 'opacity .45s ease',
        }}
      />
      <span
        style={{
          position: 'absolute',
          right: 19,
          top: 17,
          width: 2,
          height: 2,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.8)',
          opacity: opEscuro,
          transition: 'opacity .45s ease',
        }}
      />
      <span
        style={{
          position: 'absolute',
          right: 26,
          top: 10,
          width: 2,
          height: 2,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.7)',
          opacity: opEscuro,
          transition: 'opacity .45s ease',
        }}
      />
      {/* Nó deslizante: sol (claro) que vira lua (escuro) */}
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: 3,
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 32%,#ffe29a,#ff9d3f)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          transform: `translateX(${escuro ? '0px' : '28px'})`,
          willChange: 'transform',
          transition: 'transform .45s cubic-bezier(.55,1.4,.4,1)',
          overflow: 'hidden',
        }}
      >
        {/* Face da lua com crateras, sobreposta ao sol no modo escuro */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 32%,#ffffff,#c3cbf2)',
            opacity: opEscuro,
            transition: 'opacity .5s ease',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 5,
              top: 14,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'rgba(150,160,210,0.5)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: 15,
              top: 6,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'rgba(150,160,210,0.45)',
            }}
          />
        </span>
      </span>
    </div>
  )
}

export default ThemeToggle
