// Paletas de cores por rótulo de nó para daltonismo (G9; refeitas na N6 para os
// rótulos do Neo4j), com cores do projeto Color Universal Design (CUD) de
// Okabe & Ito — independentes do tema claro/escuro. A escolha sobrescreve os
// tokens --no-* no <html> (efeito em Grafos.jsx); 'padrao' remove o override e
// volta aos tokens do index.css. A preferência persiste em
// localStorage['edugraphPrefs'] (G10). Chaves = nome do token de cada rótulo na
// tabela de estilo (src/data/estiloGrafo.js); rótulo sem estilo fica no cinza.
//
// Como as cores foram escolhidas (N6; decisão D15): entre as 6 cores do CUD que
// aparecem nos dois fundos (o preto some no tema escuro; o amarelo, no creme do
// claro), cada paleta é o grupo de 4 com a MAIOR diferença perceptual mínima
// (ΔE CIE76, em CIELAB) entre pares depois de SIMULAR a deficiência (Machado,
// Oliveira e Fernandes, 2009, severidade 1). ΔE mínimo simulado — protanopia
// 25,2 · deuteranopia 24,9 · tritanopia 24,8 (todos ≥ 19,8 contra o cinza dos
// rótulos sem estilo). Empates foram desfeitos a favor do maior contraste com o
// fundo claro.

export const PALETAS = {
  protanopia: { '--no-ano': '#D55E00', '--no-unidade': '#E69F00', '--no-objeto': '#009E73', '--no-habilidade': '#0072B2' },
  deuteranopia: { '--no-ano': '#D55E00', '--no-unidade': '#56B4E9', '--no-objeto': '#009E73', '--no-habilidade': '#0072B2' },
  tritanopia: { '--no-ano': '#CC79A7', '--no-unidade': '#56B4E9', '--no-objeto': '#0072B2', '--no-habilidade': '#D55E00' },
}
