// Estilos inline compartilhados das telas de conta — Login e Signup (A3 do
// roadmap, ESTADO_ATUAL.md §4.3). Porte do card do overlay de auth do
// protótipo final; módulo .js sem componente (mesmo padrão do
// grafo/estilos.js, R6) para não quebrar o fast-refresh.

// Card "de vidro": geometria do card do protótipo (radius 22, padding 40),
// mas a SUPERFÍCIE segue a receita do painel da página de grafos
// (GrafoPainel, D12) para ler como vidro fosco e deixar o fundo de vértices
// aparecer. O fundo opaco (--pill-bg) do overlay virou translúcido + blur; a
// borda translúcida (--edge 95%) e a sombra difusa esverdeada substituem a
// borda sólida e a sombra escura/concentrada do card opaco original — sem
// elas o card lia como painel sólido, não vidro. 72% de --pill-bg ficou
// legível nos 2 temas (valor da receita do GrafoPainel).
export const CARD_VIDRO = {
  width: '100%',
  background: 'color-mix(in srgb, var(--pill-bg) 50%, transparent)',
  backdropFilter: 'blur(3px) saturate(1.15)',
  WebkitBackdropFilter: 'blur(3px) saturate(1.15)',
  border: '1px solid color-mix(in srgb, var(--edge) 50%, transparent)',
  borderRadius: 22,
  padding: 40,
  boxShadow: '0 24px 60px rgba(28,38,32,.18)',
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
