import { createContext, useContext } from 'react'

// Contexto + hook do tema num módulo SEM componentes (R5): exportá-los junto
// do ThemeProvider quebrava o fast-refresh do Vite (regra
// react-refresh/only-export-components — era o único warning do lint).
// O ThemeProvider (ThemeContext.jsx) importa o contexto daqui.
export const ThemeContext = createContext(null)

// Hook de acesso ao tema — usado pelo ThemeToggle, FontSizeWidget e App
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>')
  return ctx
}
