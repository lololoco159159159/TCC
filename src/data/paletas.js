// Paletas de cores por nível de nó para daltonismo (G9; refeitas na N6 para os
// rótulos do Neo4j), com cores do projeto Color Universal Design (CUD) de
// Okabe & Ito. A escolha sobrescreve os tokens --no-* no <html> (efeito em
// Grafos.jsx); 'padrao' remove o override e volta aos tokens do index.css. A
// preferência persiste em localStorage['edugraphPrefs'] (G10). Chaves = token de
// cor de cada nível na tabela de estilo (src/data/estiloGrafo.js); rótulo de fora
// do modelo fica no cinza.
//
// Como as cores foram escolhidas (N6; decisão D15): entre as 6 cores do CUD que
// aparecem nos dois fundos (o preto some no tema escuro; o amarelo, no creme do
// claro), cada paleta é o grupo com a MAIOR diferença perceptual mínima (ΔE
// CIE76, em CIELAB) entre pares depois de SIMULAR a deficiência (Machado,
// Oliveira e Fernandes, 2009, severidade 1, em RGB linear). Com 4 níveis (N6):
// ΔE mínimo simulado — protanopia 25,2 · deuteranopia 24,9 · tritanopia 24,8.
// D21 (2026-11-03): o 5.º nível (hoje o Componente curricular) ganhou a cor que
// sobrava com o maior ΔE mínimo — protanopia 24,8 · deuteranopia 18,3 ·
// tritanopia 17,2.
// D22 (2026-11-11): o 6.º nível, a Área de conhecimento. A cor do CUD que sobrava
// (o roxo-avermelhado, ou o verde-azulado na tritanopia) ficaria quase igual ao
// cinza dos rótulos sem estilo na deuteranopia (ΔE 3,5). A Área usa, então, as
// duas cores do CUD que a D15 deixou de fora — cada uma só no fundo em que
// aparece: PRETO no tema claro e AMARELO no escuro (token --no-area-cud, por tema,
// no index.css). ΔE mínimo simulado com 6 (o pior dos dois temas) — protanopia
// 24,7 · deuteranopia 17,0 · tritanopia 17,2, todos ≥ 19,8 contra o cinza.
// As 5 cores de antes ficaram em cada paleta.

export const PALETAS = {
  protanopia: {
    '--no-ano': '#D55E00',
    '--no-area': 'var(--no-area-cud)',
    '--no-componente': '#56B4E9',
    '--no-unidade': '#E69F00',
    '--no-objeto': '#009E73',
    '--no-habilidade': '#0072B2',
  },
  deuteranopia: {
    '--no-ano': '#D55E00',
    '--no-area': 'var(--no-area-cud)',
    '--no-componente': '#E69F00',
    '--no-unidade': '#56B4E9',
    '--no-objeto': '#009E73',
    '--no-habilidade': '#0072B2',
  },
  tritanopia: {
    '--no-ano': '#CC79A7',
    '--no-area': 'var(--no-area-cud)',
    '--no-componente': '#E69F00',
    '--no-unidade': '#56B4E9',
    '--no-objeto': '#0072B2',
    '--no-habilidade': '#D55E00',
  },
}
