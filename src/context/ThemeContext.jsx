import { createContext, useContext, useEffect, useState } from 'react'

// Escala de zoom da fonte: do 60% ao 160%, padrão 100% (índice 2)
const ESCALA_FONTE = [0.6, 0.8, 1, 1.2, 1.4, 1.6]
const FONTE_PADRAO = 2

const ThemeContext = createContext(null)

// Lê as preferências salvas no localStorage (tema e tamanho de fonte).
// Roda uma única vez na inicialização do estado.
function lerPreferencias() {
  let theme = 'light'
  let fontIdx = FONTE_PADRAO
  try {
    const t = localStorage.getItem('eg_theme')
    if (t === 'dark' || t === 'light') theme = t
    const f = parseInt(localStorage.getItem('eg_font'), 10)
    if (!isNaN(f) && f >= 0 && f < ESCALA_FONTE.length) fontIdx = f
  } catch {
    // localStorage indisponível (ex.: modo privado) — usa os padrões
  }
  return { theme, fontIdx }
}

// Provider global de tema (claro/escuro) e tamanho de fonte.
// O tema é aplicado como data-theme no <html>, e as variáveis CSS
// definidas em index.css fazem o resto cascatear pelo site inteiro.
export function ThemeProvider({ children }) {
  const [{ theme, fontIdx }, setPrefs] = useState(lerPreferencias)

  // Aplica o tema no <html> e persiste sempre que mudar
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('eg_theme', theme)
    } catch {
      // sem persistência — segue apenas em memória
    }
  }, [theme])

  // Persiste o tamanho de fonte sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem('eg_font', String(fontIdx))
    } catch {
      // sem persistência — segue apenas em memória
    }
  }, [fontIdx])

  function toggleTheme() {
    setPrefs((p) => ({ ...p, theme: p.theme === 'light' ? 'dark' : 'light' }))
  }

  // d = +1 aumenta, -1 diminui (limitado aos extremos da escala)
  function setFont(d) {
    setPrefs((p) => ({
      ...p,
      fontIdx: Math.min(ESCALA_FONTE.length - 1, Math.max(0, p.fontIdx + d)),
    }))
  }

  const valor = {
    theme,
    toggleTheme,
    fontIdx,
    setFont,
    fontZoom: ESCALA_FONTE[fontIdx],
    fontPct: Math.round(ESCALA_FONTE[fontIdx] * 100) + '%',
    fonteNoMaximo: fontIdx >= ESCALA_FONTE.length - 1,
    fonteNoMinimo: fontIdx <= 0,
  }

  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>
}

// Hook de acesso ao tema — usado pelo ThemeToggle, FontSizeWidget e App
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>')
  return ctx
}
