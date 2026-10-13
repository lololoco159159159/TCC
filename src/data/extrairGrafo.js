import { Caminho, No, Relacao, executarCypher } from './neo4j'

// Do resultado ao grafo (N4 — ESTADO_ATUAL.md §4.5): transforma a resposta de
// QUALQUER consulta do console em "nós + relações", do jeito que o Neo4j
// Browser faz antes de desenhar. Duas partes:
//  - extrairGrafo(): pura (sem rede) — junta o que veio no resultado;
//  - completarGrafo(): as consultas extras do Browser — busca as pontas que
//    faltam, aplica o limite de nós e (opcional) "conecta os nós do resultado".
// O grafo aparece em texto na aba "Relações" do resultado (para conferir os
// números) e é o que o canvas desenha (N5).

export const LIMITE_NOS = 300 // nós exibidos no máximo (o padrão do Browser clássico)

// Junta os nós e as relações que aparecem em qualquer lugar do resultado — em
// colunas, listas, mapas ou caminhos —, sem repetir (chave: elementId) e na
// ordem em que aparecem.
export function extrairGrafo(linhas) {
  const nos = new Map()
  const relacoes = new Map()
  const visitar = (v) => {
    if (v instanceof No) {
      if (!nos.has(v.id)) nos.set(v.id, v)
    } else if (v instanceof Relacao) {
      if (!relacoes.has(v.id)) relacoes.set(v.id, v)
    } else if (v instanceof Caminho) {
      v.nos.forEach(visitar)
      v.relacoes.forEach(visitar)
    } else if (Array.isArray(v)) {
      v.forEach(visitar)
    } else if (v !== null && typeof v === 'object') {
      Object.values(v).forEach(visitar) // mapa
    }
  }
  linhas.forEach((linha) => Object.values(linha).forEach(visitar))
  return { nos, relacoes }
}

const BUSCAR_PONTAS = 'MATCH (n) WHERE elementId(n) IN $ids RETURN n'
const CONECTAR = 'MATCH (a)-[r]->(b) WHERE elementId(a) IN $ids AND elementId(b) IN $ids RETURN r'

/**
 * Completa o grafo extraído, como o Neo4j Browser:
 *  1) relação cujas pontas não vieram no resultado (ex.: `RETURN r`) → busca
 *     esses nós numa consulta extra;
 *  2) limita a `limite` nós — os do resultado primeiro, depois as pontas, na
 *     ordem em que apareceram; relação com ponta de fora também fica de fora;
 *  3) `conectar` (padrão do Browser, "Connect result nodes"): traz as relações
 *     que existem ENTRE os nós exibidos, mesmo que a consulta não as tenha
 *     pedido (ex.: na árvore, as DESENVOLVE_HABILIDADE do Ano).
 * Só lê o banco (executarCypher usa o modo leitura).
 *
 * @returns {Promise<{ nos: Map, relacoes: Map, total: number, limite: number,
 *   conectar: boolean, extras: object[] }>}  `total`: nós antes do limite;
 *   `extras`: as consultas extras feitas ({ tipo, consulta, adicionados, ms }).
 */
export async function completarGrafo({ nos, relacoes }, { conectar = true, limite = LIMITE_NOS } = {}) {
  // ordem final: os nós do resultado, depois as pontas que faltam
  const ordem = [...nos.keys()]
  const conhecidos = new Set(ordem)
  for (const rel of relacoes.values()) {
    for (const id of [rel.inicio, rel.fim]) {
      if (!conhecidos.has(id)) {
        conhecidos.add(id)
        ordem.push(id)
      }
    }
  }
  const exibidos = ordem.slice(0, limite)
  const extras = []

  // 1) pontas que faltam — só as que vão ser exibidas
  const achados = new Map()
  const faltando = exibidos.filter((id) => !nos.has(id))
  if (faltando.length) {
    const resp = await executarCypher(BUSCAR_PONTAS, { ids: faltando })
    resp.linhas.forEach(({ n }) => achados.set(n.id, n))
    extras.push({ tipo: 'pontas', consulta: BUSCAR_PONTAS, adicionados: achados.size, ms: resp.tempos.totalMs })
  }

  // 2) limite: nós exibidos, na ordem; relações só entre eles (uma ponta que
  // não existe mais no banco também derruba a relação)
  const nosFinais = new Map()
  for (const id of exibidos) {
    const no = nos.get(id) || achados.get(id)
    if (no) nosFinais.set(id, no)
  }
  const relacoesFinais = new Map()
  for (const [id, rel] of relacoes) {
    if (nosFinais.has(rel.inicio) && nosFinais.has(rel.fim)) relacoesFinais.set(id, rel)
  }

  // 3) conectar os nós do resultado
  if (conectar && nosFinais.size) {
    const resp = await executarCypher(CONECTAR, { ids: [...nosFinais.keys()] })
    let adicionados = 0
    resp.linhas.forEach(({ r }) => {
      if (!relacoesFinais.has(r.id)) {
        relacoesFinais.set(r.id, r)
        adicionados++
      }
    })
    extras.push({ tipo: 'conectar', consulta: CONECTAR, adicionados, ms: resp.tempos.totalMs })
  }

  return { nos: nosFinais, relacoes: relacoesFinais, total: ordem.length, limite, conectar, extras }
}
