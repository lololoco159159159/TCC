// Tabela de estilo do grafo (N5 — ESTADO_ATUAL.md §4.5): o equivalente ao
// "estilo" do Neo4j Browser. Para cada NÍVEL do modelo: a cor (token CSS --no-*,
// com contraparte escura no index.css), o raio, a forma (modo "formas em vez de
// cores", D6), a fonte da legenda, a propriedade usada como legenda e as que vão
// no tooltip. Para cada TIPO de relação: se a linha é tracejada.
// N11 (D18): saíram o "anel da semente" dos rótulos e o comprimento de mola das
// relações — a física passou a ser a do Neo4j Browser, em que a posição inicial
// é um círculo e a distância das molas depende do tamanho dos nós, não do tipo
// da relação (src/data/simulacaoForcas.js). O raio continua: é o do DESENHO.
//
// Cores automáticas (D21, 2026-11-03): no modelo novo da orientadora cada matéria
// tem os seus rótulos — UnidadeTematicaMat, UnidadeTematicaCien, HabilidadeMat… —,
// mas todo rótulo COMEÇA pelo nome do nível. O estilo é por nível, e o nível sai
// do começo do rótulo (sem diferenciar maiúsculas): uma disciplina nova que siga
// a regra (ex.: HabilidadeLP) já chega com a cor, a forma e o tamanho certos, sem
// mudar o código. Rótulo de fora do modelo cai no PADRÃO: o site nunca quebra por
// causa de um rótulo novo — só o desenha em cinza.

// os níveis, de cima para baixo. `rotulo`: o nome que abre o rótulo do Neo4j
// (`exato`: tem de ser igual — "Ano" é curto demais para servir de começo)
export const NIVEIS = [
  {
    id: 'ano',
    nome: 'Ano',
    rotulo: 'Ano',
    exato: true,
    cor: '--no-ano',
    raio: 19,
    forma: 'losango',
    legenda: 'nome',
    fonte: { peso: 700, tamanho: 13, mono: false },
  },
  {
    id: 'disciplina',
    nome: 'Disciplina',
    rotulo: 'Disciplina',
    cor: '--no-disciplina',
    raio: 17.5,
    forma: 'hexagono',
    legenda: 'nome',
    fonte: { peso: 700, tamanho: 12.5, mono: false },
  },
  {
    id: 'unidade',
    nome: 'Unidade temática',
    rotulo: 'UnidadeTematica',
    cor: '--no-unidade',
    raio: 16,
    forma: 'quadrado',
    legenda: 'nome',
    fonte: { peso: 700, tamanho: 12, mono: false },
  },
  {
    id: 'objeto',
    nome: 'Objeto de conhecimento',
    rotulo: 'ObjetoConhecimento',
    cor: '--no-objeto',
    raio: 13,
    forma: 'triangulo',
    legenda: 'descricao',
    fonte: { peso: 600, tamanho: 11.5, mono: false },
  },
  {
    id: 'habilidade',
    nome: 'Habilidade',
    rotulo: 'Habilidade',
    cor: '--no-habilidade',
    raio: 11,
    forma: 'circulo',
    legenda: 'codigo',
    dica: ['codigo', 'descricao'], // tooltip: "EF01MA17 — Reconhecer períodos do dia..."
    fonte: { peso: 600, tamanho: 10.5, mono: true },
  },
]

const ESTILO_NO_PADRAO = {
  cor: '--no-outro',
  raio: 12,
  forma: 'circulo',
  legenda: null, // escolhida pelas propriedades do nó (PROPS_LEGENDA)
  fonte: { peso: 600, tamanho: 11.5, mono: false },
}

// tipos de relação com estilo próprio (hoje nenhum é tracejado; a legenda
// mostra a linha tracejada só se algum tipo da tela pedir)
export const ESTILO_RELACAO = {}

const ESTILO_RELACAO_PADRAO = { tracejado: false }

// tokens de cor que o canvas resolve via getComputedStyle (ele não entende var())
export const TOKENS_COR_NO = [...NIVEIS.map((n) => n.cor), ESTILO_NO_PADRAO.cor]

export const estiloRelacao = (rel) => ESTILO_RELACAO[rel] || ESTILO_RELACAO_PADRAO

/**
 * O nível de um rótulo do Neo4j: o do nome que o abre ("HabilidadeCien" →
 * habilidade; "Ano" → ano), ou null se for de fora do modelo.
 * @param {string} rotulo
 */
export function nivelDoRotulo(rotulo) {
  const r = String(rotulo ?? '').toLowerCase()
  return NIVEIS.find((n) => (n.exato ? r === n.rotulo.toLowerCase() : r.startsWith(n.rotulo.toLowerCase()))) || null
}

const LEGENDA_MAX = 28 // caracteres da legenda sob o nó (o texto inteiro vai no tooltip)
// rótulo sem estilo: a legenda é a 1.ª destas propriedades que o nó tiver
const PROPS_LEGENDA = ['nome', 'name', 'titulo', 'title', 'codigo', 'code', 'descricao', 'description']

const texto = (v) => {
  if (v === null || v === undefined) return ''
  return typeof v === 'object' ? JSON.stringify(v) : String(v)
}
const encurtar = (s) => (s.length > LEGENDA_MAX ? `${s.slice(0, LEGENDA_MAX - 1)}…` : s)

// Como um nó do Neo4j aparece no canvas: o nível (o do 1.º rótulo que for do
// modelo), o `tipo` — o nome do nível, que agrupa a legenda e o "ocultar"; num
// nó de fora do modelo, o próprio rótulo —, cor, raio, forma, fonte, legenda
// curta e o texto completo do tooltip (`dica`).
export function visualDoNo(no) {
  const nivel = no.rotulos.map(nivelDoRotulo).find(Boolean) || null
  const tipo = nivel ? nivel.nome : no.rotulos[0] || '(sem rótulo)'
  const e = nivel || ESTILO_NO_PADRAO
  const prop = e.legenda ?? PROPS_LEGENDA.find((p) => no.props[p] !== undefined && no.props[p] !== null)
  const completo = texto(prop !== undefined ? no.props[prop] : Object.values(no.props)[0]) || tipo
  const dica = (e.dica || [])
    .map((p) => texto(no.props[p]))
    .filter(Boolean)
    .join(' — ')
  return {
    tipo,
    nivel: nivel?.id || null,
    cor: e.cor,
    r: e.raio,
    forma: e.forma,
    fonte: e.fonte,
    label: encurtar(completo),
    dica: dica || completo,
  }
}
