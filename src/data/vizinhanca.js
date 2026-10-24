import { executarCypher } from './neo4j'
import { visualDoNo } from './estiloGrafo'

// Vizinhança de um nó no Neo4j (ESTADO_ATUAL.md §4.5): as conexões que o
// painel de detalhe mostra, agrupadas por tipo de relação e por sentido (N7),
// e a EXPANSÃO de um nó no desenho (N8), como no Neo4j Browser.
// Só lê o banco (executarCypher usa o modo leitura).

const LIMITE_CONEXOES = 200 // conexões listadas no painel (o resto é avisado como "200+")
const LIMITE_VIZINHOS = 100 // vizinhos trazidos por expansão (o "Max Neighbours" do Browser clássico)

const CONEXOES = 'MATCH (n)-[r]-(m) WHERE elementId(n) = $id RETURN r, m LIMIT $limite'
// relações entre os nós que chegaram na expansão e todos os da tela (os novos
// inclusive); o padrão sem sentido acha cada uma a partir do lado novo
const CONECTAR_NOVOS = 'MATCH (a)-[r]-(b) WHERE elementId(a) IN $novos AND elementId(b) IN $todos RETURN r'

// "Retrato" de um nó para o painel e para os "vistos por último": identidade,
// rótulos e propriedades + o visual da tabela de estilo (tipo, cor, forma,
// legenda curta e texto completo). Um retrato basta para reabrir o detalhe de
// um nó mesmo que ele não esteja (ou não esteja mais) no desenho.
export const retratoDoNo = (no) => ({ id: no.id, rotulos: no.rotulos, props: no.props, ...visualDoNo(no) })

/**
 * Conexões de um nó, agrupadas por tipo de relação e sentido — primeiro as que
 * SAEM do nó, depois as que CHEGAM; dentro de cada sentido, por tipo; os itens
 * em ordem de legenda (EF01MA01 antes de EF01MA02).
 *
 * @param {string} id  elementId do nó
 * @param {object} [opcoes]  repassadas ao executarCypher (ex.: { canal })
 * @returns {Promise<{ grupos: { chave, rel, sentido: 'saida'|'entrada',
 *   itens: object[] }[], total: number, mais: boolean }>}  cada item é o
 *   retrato do nó vizinho + `relId` (a relação que o liga — chave estável
 *   mesmo com duas relações para o mesmo vizinho); `mais`: passou do limite.
 */
export async function conexoesDoNo(id, opcoes = {}) {
  const resp = await executarCypher(
    CONEXOES,
    { id, limite: LIMITE_CONEXOES + 1 },
    { descricao: 'conexões do nó (painel)', ...opcoes },
  )
  const linhas = resp.linhas.slice(0, LIMITE_CONEXOES)
  const grupos = new Map()
  for (const { r, m } of linhas) {
    const sentido = r.inicio === id ? 'saida' : 'entrada'
    const chave = `${sentido}|${r.rel}`
    if (!grupos.has(chave)) grupos.set(chave, { chave, rel: r.rel, sentido, itens: [] })
    grupos.get(chave).itens.push({ relId: r.id, ...retratoDoNo(m) })
  }
  const lista = [...grupos.values()].sort((a, b) =>
    a.sentido === b.sentido ? a.rel.localeCompare(b.rel) : a.sentido === 'saida' ? -1 : 1,
  )
  lista.forEach((g) => g.itens.sort((x, y) => x.label.localeCompare(y.label, 'pt-BR', { numeric: true })))
  return { grupos: lista, total: linhas.length, mais: resp.linhas.length > LIMITE_CONEXOES }
}

/**
 * Expande um nó do desenho (N8), como o Neo4j Browser: sempre consulta o
 * banco. (1) os vizinhos do nó, até LIMITE_VIZINHOS; (2) se `conectar` (a chave
 * "Conectar nós do resultado"), as relações entre os nós que chegaram e todos
 * os que já estão na tela — ex.: expandir um objeto de conhecimento traz as
 * habilidades dele já ligadas ao Ano.
 *
 * @param {string} id  elementId do nó expandido
 * @param {Set<string>} idsNaTela  nós já no grafo (inclusive os ocultos pela legenda)
 * @returns {Promise<{ nos: Map, relacoes: Map, consultas: object[] }>}  `nos`:
 *   só os vizinhos que ainda NÃO estão na tela; `relacoes`: todas as trazidas
 *   (quem funde descarta as que já tem); `consultas`: { tipo, ms } de cada uma
 */
export async function expandirNo(id, idsNaTela, { conectar = true } = {}) {
  const resp = await executarCypher(CONEXOES, { id, limite: LIMITE_VIZINHOS }, { descricao: 'expandir · vizinhos' })
  const nos = new Map()
  const relacoes = new Map()
  for (const { r, m } of resp.linhas) {
    relacoes.set(r.id, r)
    if (!idsNaTela.has(m.id)) nos.set(m.id, m)
  }
  const consultas = [{ tipo: 'vizinhos', ms: resp.tempos.totalMs }]
  if (conectar && nos.size) {
    const novos = [...nos.keys()]
    const c = await executarCypher(
      CONECTAR_NOVOS,
      { novos, todos: [...idsNaTela, ...novos] },
      { descricao: 'expandir · conectar os novos' },
    )
    c.linhas.forEach(({ r }) => relacoes.set(r.id, r))
    consultas.push({ tipo: 'conectar', ms: c.tempos.totalMs })
  }
  return { nos, relacoes, consultas }
}
