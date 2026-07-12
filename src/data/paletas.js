// Paletas de cores por tipo de nó para daltonismo (G9), baseadas no projeto
// Color Universal Design (CUD) de Okabe & Ito — cores independentes do tema
// claro/escuro. A escolha sobrescreve os tokens --no-* no <html> (efeito em
// Grafos.jsx); 'padrao' remove o override e volta aos tokens do index.css.
// A preferência persiste em localStorage['edugraphPrefs'] (G10).

export const PALETAS = {
  protanopia: { habilidade: '#0072B2', conceito: '#E69F00', disciplina: '#000000' },
  deuteranopia: { habilidade: '#0072B2', conceito: '#E69F00', disciplina: '#CC79A7' },
  tritanopia: { habilidade: '#D55E00', conceito: '#0072B2', disciplina: '#009E73' },
}
