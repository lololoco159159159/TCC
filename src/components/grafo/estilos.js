// Estilos inline compartilhados pelos componentes da página de grafos (R6).
// Módulo .js SEM componentes de propósito: exportar constantes de um .jsx com
// componente quebraria o fast-refresh (react-refresh/only-export-components).

// Rótulo monoespaçado em caps — o "kicker" padrão do protótipo (painel,
// overlays, perfil). Usar com spread para sobrepor cor/tamanho pontualmente.
export const MONO_LABEL = {
  font: "9.5px/1 'JetBrains Mono', monospace",
  letterSpacing: '0.16em',
  color: 'var(--faint)',
  textTransform: 'uppercase',
}
