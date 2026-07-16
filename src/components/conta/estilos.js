// Estilos inline compartilhados das telas de conta — Login e Signup (A3 do
// roadmap, ESTADO_ATUAL.md §4.3). Porte do card do overlay de auth do
// protótipo final; módulo .js sem componente (mesmo padrão do
// grafo/estilos.js, R6) para não quebrar o fast-refresh.

// Card "de vidro": geometria, borda e sombra verbatim do protótipo. O fundo
// opaco (--pill-bg) do overlay virou translúcido + blur (receita do
// GrafoPainel) para o fundo de vértices aparecer — desvio consciente, D12.
// Calibração: 72% de --pill-bg ficou legível nos 2 temas (valor da receita).
export const CARD_VIDRO = {
  width: '100%',
  background: 'color-mix(in srgb, var(--pill-bg) 72%, transparent)',
  backdropFilter: 'blur(14px) saturate(1.15)',
  WebkitBackdropFilter: 'blur(14px) saturate(1.15)',
  border: '1px solid var(--pill-border)',
  borderRadius: 22,
  padding: 40,
  boxShadow: '0 34px 80px -42px rgba(0,0,0,.45)',
}

// h1 do card (Spectral, como todo título do site)
export const TITULO_CARD = {
  margin: '0 0 8px',
  font: "700 34px 'Spectral', serif",
  letterSpacing: '-.01em',
  color: 'var(--text)',
}

// parágrafo sob o título
export const SUBTITULO_CARD = {
  margin: '0 0 28px',
  font: "400 15px/1.5 'Figtree', system-ui, sans-serif",
  color: 'var(--muted)',
}

// rótulo mono uppercase dos campos
export const LABEL_CAMPO = {
  font: "400 11px/1 'JetBrains Mono', monospace",
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
}

// mensagem de validação sob o campo (cor de erro das validações — D2)
export const MSG_ERRO = {
  marginTop: 7,
  font: "400 13px/1.3 'Figtree', sans-serif",
  color: '#d1453b',
}
