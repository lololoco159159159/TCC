// Tabela de estilo do grafo (N5 — ESTADO_ATUAL.md §4.5): o equivalente ao
// "estilo" do Neo4j Browser. Para cada RÓTULO de nó: a cor (token CSS --no-*,
// com contraparte escura no index.css), o raio, a forma (modo "formas em vez de
// cores", D6), a fonte da legenda, a propriedade usada como legenda, as que vão
// no tooltip e o anel da semente (distância ao centro na posição inicial — o
// Ano no meio, as habilidades por fora; a física assenta o resto). Para cada
// TIPO de relação: o comprimento de repouso da mola da física (D3: a geometria
// reflete a semântica) e se a linha é tracejada.
// Rótulo ou tipo que não estiver aqui (a orientadora vai acrescentar outros)
// cai no PADRÃO: o site nunca quebra por causa de um rótulo novo — só o desenha
// em cinza, até ele ganhar uma linha nesta tabela.

export const ESTILO_NO = {
  Ano: {
    cor: '--no-ano',
    raio: 19,
    forma: 'losango',
    anel: 0,
    legenda: 'nome',
    fonte: { peso: 700, tamanho: 13, mono: false },
  },
  UnidadeTematica: {
    cor: '--no-unidade',
    raio: 16,
    forma: 'quadrado',
    anel: 150,
    legenda: 'nome',
    fonte: { peso: 700, tamanho: 12, mono: false },
  },
  ObjetoConhecimento: {
    cor: '--no-objeto',
    raio: 13,
    forma: 'triangulo',
    anel: 280,
    legenda: 'descricao',
    fonte: { peso: 600, tamanho: 11.5, mono: false },
  },
  Habilidade: {
    cor: '--no-habilidade',
    raio: 11,
    forma: 'circulo',
    anel: 400,
    legenda: 'codigo',
    dica: ['codigo', 'descricao'], // tooltip: "EF01MA17 — Reconhecer períodos do dia..."
    fonte: { peso: 600, tamanho: 10.5, mono: true },
  },
}

const ESTILO_NO_PADRAO = {
  cor: '--no-outro',
  raio: 12,
  forma: 'circulo',
  anel: 220,
  legenda: null, // escolhida pelas propriedades do nó (PROPS_LEGENDA)
  fonte: { peso: 600, tamanho: 11.5, mono: false },
}

export const ESTILO_RELACAO = {
  TEM_UNIDADE: { mola: 150 },
  TEM_OBJETO: { mola: 130 },
  DESENVOLVE: { mola: 120 },
  // atalho Ano → Habilidade (aparece com "conectar nós do resultado"): mola
  // longa, para não dobrar a árvore puxando as habilidades para o meio
  DESENVOLVE_HABILIDADE: { mola: 280 },
}

const ESTILO_RELACAO_PADRAO = { mola: 150, tracejado: false } // 150 = o padrão do protótipo

// tokens de cor que o canvas resolve via getComputedStyle (ele não entende var())
export const TOKENS_COR_NO = [...new Set([...Object.values(ESTILO_NO).map((e) => e.cor), ESTILO_NO_PADRAO.cor])]

// estilo de um rótulo (o padrão, se ele não estiver na tabela) — usado pela
// legenda e pelas amostras de paleta (N6), que mostram cor e forma por rótulo
export const estiloNo = (rotulo) => ESTILO_NO[rotulo] || ESTILO_NO_PADRAO

export const estiloRelacao = (rel) => ESTILO_RELACAO[rel] || ESTILO_RELACAO_PADRAO

const LEGENDA_MAX = 28 // caracteres da legenda sob o nó (o texto inteiro vai no tooltip)
// rótulo sem estilo: a legenda é a 1.ª destas propriedades que o nó tiver
const PROPS_LEGENDA = ['nome', 'name', 'titulo', 'title', 'codigo', 'code', 'descricao', 'description']

const texto = (v) => {
  if (v === null || v === undefined) return ''
  return typeof v === 'object' ? JSON.stringify(v) : String(v)
}
const encurtar = (s) => (s.length > LEGENDA_MAX ? `${s.slice(0, LEGENDA_MAX - 1)}…` : s)

// Como um nó do Neo4j aparece no canvas: rótulo principal (o 1.º que tiver
// estilo na tabela; senão o 1.º que vier), cor, raio, forma, fonte, anel da
// semente, legenda curta e o texto completo do tooltip (`dica`).
export function visualDoNo(no) {
  const tipo = no.rotulos.find((r) => ESTILO_NO[r]) || no.rotulos[0] || '(sem rótulo)'
  const e = estiloNo(tipo)
  const prop = e.legenda ?? PROPS_LEGENDA.find((p) => no.props[p] !== undefined && no.props[p] !== null)
  const completo = texto(prop !== undefined ? no.props[prop] : Object.values(no.props)[0]) || tipo
  const dica = (e.dica || [])
    .map((p) => texto(no.props[p]))
    .filter(Boolean)
    .join(' — ')
  return {
    tipo,
    cor: e.cor,
    r: e.raio,
    forma: e.forma,
    fonte: e.fonte,
    anel: e.anel,
    label: encurtar(completo),
    dica: dica || completo,
  }
}
