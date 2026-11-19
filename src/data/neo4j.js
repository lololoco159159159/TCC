// Cliente Cypher do EduGraph. Única porta de entrada do front para o Neo4j,
// sempre pela API do próprio site (pasta api/, em Python), que guarda a
// credencial e impõe o modo somente leitura — o navegador nunca vê a senha:
//  - executarCypher() — a consulta LIVRE do console (POST /api/cypher);
//  - consultarGrafo() — as consultas do PRÓPRIO SITE (anos, áreas, recorte,
//    perguntas da busca, conexões…), que moram na API (api/grafo.py): o site
//    chama a rota de cada uma, e a API devolve a consulta junto da resposta.
//
// Contrato com a Query API (conferido no Neo4j local em 2026-10-09 e 10-12; a
// API do site repassa a resposta sem mudar o formato):
//  - corpo { statement, parameters, accessMode: 'READ' }: o site pede o modo
//    leitura, e a API o impõe de qualquer forma (o Neo4j recusa a escrita com
//    Neo.ClientError.Statement.AccessMode);
//  - Accept: application/vnd.neo4j.query → JSON TIPADO: cada valor chega como
//    { $type, _value }. É o que permite reconhecer nós, relações e caminhos em
//    qualquer lugar do resultado (no JSON simples, um nó é indistinguível de
//    um mapa comum). Inteiros e decimais vêm como texto e são convertidos aqui;
//  - o sucesso responde 202 (não 200), e um erro em tempo de execução (ex.:
//    divisão por zero) TAMBÉM chega com 202 — quem decide é a presença de
//    `errors` no corpo, não só o status HTTP.
//
// Toda falha vira um ErroCypher com `origem`:
//  'rede'      — sem resposta do servidor do site (fora do ar) ou tempo esgotado;
//  'http'      — infraestrutura/configuração: credencial recusada (401), API ou
//                Neo4j fora do ar (502 — EduGraph.Proxy.ApiIndisponivel,
//                EduGraph.Api.Neo4jIndisponivel), Neo4j sem resposta (504),
//                rota inexistente (404);
//  'neo4j'     — a consulta foi recusada ou não pôde ser executada: pelo Neo4j
//                (sintaxe, modo leitura, erro de execução) ou pela API
//                (grande demais, ou com um comando bloqueado como LOAD CSV);
//  'cancelada' — não é falha: outra consulta do mesmo `canal` tomou o lugar, ou
//                quem chamou abortou pelo `signal`. Quem chama só ignora.
//
// N10: toda consulta concluída (com resposta ou com erro; as canceladas não) é
// anunciada a quem se inscreveu em observarConsultas() — é assim que a gaveta
// Cypher da página de grafos mostra o que o site mandou ao Neo4j por conta
// própria. A `descricao` (opção do executarCypher e do consultarGrafo) diz para
// que a consulta serve; a do console não tem, porque quem a escreveu foi a pessoa.

const ROTA_CONSOLE = '/api/cypher'
const TEMPO_LIMITE_MS = 15000 // sem resposta nesse prazo, a consulta vira erro 'rede'

// Valores estruturais do grafo. São classes (e não objetos simples) para que
// `instanceof` os distinga sem ambiguidade de um mapa Cypher que por acaso
// tenha as mesmas chaves.
export class No {
  constructor(id, rotulos, props) {
    this.id = id // elementId — chave dentro da sessão (contrato do §4.5)
    this.rotulos = rotulos
    this.props = props
  }
}

export class Relacao {
  constructor(id, rel, inicio, fim, props) {
    this.id = id
    this.rel = rel // tipo da relação (ex.: TEM_UNIDADE)
    this.inicio = inicio // elementId do nó de origem
    this.fim = fim // elementId do nó de destino
    this.props = props
  }
}

// nos[i] —relacoes[i]— nos[i + 1], na ordem em que o caminho foi percorrido;
// o sentido de cada relação continua em inicio/fim (pode ser o contrário)
export class Caminho {
  constructor(nos, relacoes) {
    this.nos = nos
    this.relacoes = relacoes
  }
}

export class ErroCypher extends Error {
  constructor({ origem, codigo, mensagem, status = 0, consulta, parametros }) {
    super(mensagem)
    this.name = 'ErroCypher'
    this.origem = origem
    this.codigo = codigo
    this.status = status // status HTTP; 0 quando não houve resposta
    // a consulta que a API executou, quando o erro a traz (as consultas do site,
    // de consultarGrafo; a do console, quem chamou já conhece)
    this.consulta = consulta
    this.parametros = parametros
  }
}

const decodificarMapa = (m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, decodificar(v)]))

// Converte um valor do JSON tipado da Query API em valor JS.
function decodificar(v) {
  if (v === null || typeof v !== 'object' || !('$type' in v)) return v // já é valor simples
  const x = v._value
  switch (v.$type) {
    case 'Null':
      return null
    case 'Boolean':
    case 'String':
      return x
    case 'Integer': {
      // o inteiro do Neo4j tem 64 bits: além do limite seguro do JS, fica texto
      const n = Number(x)
      return Number.isSafeInteger(n) ? n : x
    }
    case 'Float':
      return Number(x) // também cobre "NaN", "Infinity" e "-Infinity"
    case 'List':
      return x.map(decodificar)
    case 'Map':
      return decodificarMapa(x)
    case 'Node':
      return new No(x._element_id, x._labels, decodificarMapa(x._properties || {}))
    case 'Relationship':
      return new Relacao(
        x._element_id,
        x._type,
        x._start_node_element_id,
        x._end_node_element_id,
        decodificarMapa(x._properties || {}),
      )
    case 'Path': {
      const itens = x.map(decodificar) // nó, relação, nó, relação, nó…
      return new Caminho(
        itens.filter((i) => i instanceof No),
        itens.filter((i) => i instanceof Relacao),
      )
    }
    default:
      // datas, horas, durações, pontos e bytes: a Query API já manda em texto
      // (ISO 8601 / WKT / base64) — fica como veio
      return String(x)
  }
}

// Código do Neo4j = a consulta foi recusada ou falhou no banco ('neo4j'),
// exceto os de segurança: credencial é problema de configuração, não da
// consulta. A API também recusa consultas (EduGraph.Api.Consulta*: grande
// demais ou com comando bloqueado) — como num erro de sintaxe, repetir não
// adianta. Os demais códigos do proxy e da API (EduGraph.*) são infraestrutura.
const RECUSA_DA_API = /^EduGraph\.Api\.Consulta/

function origemDoCodigo(codigo = '') {
  if (RECUSA_DA_API.test(codigo)) return 'neo4j'
  return codigo.startsWith('Neo.') && !codigo.startsWith('Neo.ClientError.Security.') ? 'neo4j' : 'http'
}

function mensagemHttp(status, caminho) {
  if (status === 404) return `A rota ${caminho} não existe neste servidor — a API do EduGraph está rodando? (npm run api)`
  if (status >= 500) return `O servidor do site respondeu com erro (HTTP ${status}).`
  return `Resposta inesperada do servidor (HTTP ${status}).`
}

const canais = new Map() // canal → função que cancela a consulta em andamento nele
const observadores = new Set() // quem acompanha as consultas concluídas (N10)

/**
 * Inscreve `aoConcluir` para receber cada consulta concluída:
 * { descricao, consulta, parametros, ms, linhas, erro } — `descricao` vazia na
 * do console; `linhas`: quantas voltaram; `erro`: o código, ou null.
 * @returns {() => void}  cancela a inscrição
 */
export function observarConsultas(aoConcluir) {
  observadores.add(aoConcluir)
  return () => {
    observadores.delete(aoConcluir)
  }
}

/**
 * Executa uma consulta Cypher (somente leitura) no Neo4j, via API do site.
 *
 * @param {string} consulta  texto Cypher
 * @param {object} [parametros]  valores dos $parâmetros — use SEMPRE parâmetros
 *   em vez de concatenar texto na consulta
 * @param {object} [opcoes]
 * @param {string} [opcoes.canal]  consultas do mesmo canal são exclusivas: uma
 *   nova cancela a anterior (ex.: 'palco' — console e busca do professor: só a
 *   última execução importa).
 *   Sem canal, a consulta nunca é cancelada por outra.
 * @param {string} [opcoes.descricao]  para que o site fez a consulta (aparece
 *   na gaveta Cypher; ex.: 'pontas das relações do resultado')
 * @param {AbortSignal} [opcoes.signal]  cancelamento externo
 * @param {number} [opcoes.tempoLimiteMs]  padrão 15000
 * @returns {Promise<{ campos: string[], linhas: object[], tempos: { disponivelApos:
 *   number, consumidoApos: number, totalMs: number }, tipoConsulta: string,
 *   avisos: object[], bruto: object }>}  `linhas`: um objeto por linha, com os
 *   valores já convertidos e chaveados pelos `campos` (na ordem do RETURN);
 *   `avisos`: as notificações do Neo4j (ex.: rótulo inexistente no banco);
 *   `bruto`: a resposta exatamente como chegou.
 * @throws {ErroCypher}
 */
export async function executarCypher(consulta, parametros = {}, opcoes = {}) {
  const t0 = performance.now()
  const aviso = { descricao: opcoes.descricao || '', consulta, parametros }
  try {
    const corpo = { statement: consulta, parameters: parametros, accessMode: 'READ' }
    const { json, status, totalMs } = await pedir(ROTA_CONSOLE, { ...opcoes, corpo })
    const r = resultado(json, totalMs, ROTA_CONSOLE, status)
    anunciar({ ...aviso, ms: totalMs, linhas: r.linhas.length, erro: null })
    return r
  } catch (e) {
    if (e?.origem !== 'cancelada') anunciar({ ...aviso, ms: Math.round(performance.now() - t0), linhas: 0, erro: e?.codigo || String(e) })
    throw e
  }
}

/**
 * Uma consulta do PRÓPRIO SITE, pela rota da API que a executa (ex.:
 * '/api/grafo/anos'): as consultas moram na API (api/grafo.py). Ela devolve
 * { consulta, parametros, resposta }, e o resultado é o mesmo do executarCypher
 * mais a `consulta` e os `parametros` que ela executou — que vão também para a
 * gaveta Cypher, como antes.
 *
 * @param {string} caminho  a rota da API
 * @param {object} [opcoes]  as do executarCypher (canal, descricao, signal,
 *   tempoLimiteMs), mais `corpo`: com ele o pedido é um POST em JSON; sem, um GET
 * @returns {Promise<object>}  { ...o do executarCypher, consulta, parametros }
 * @throws {ErroCypher}  com `consulta` e `parametros` quando a API os mandou
 */
export async function consultarGrafo(caminho, opcoes = {}) {
  const t0 = performance.now()
  const avisar = (consulta, parametros, ms, linhas, erro) =>
    anunciar({ descricao: opcoes.descricao || '', consulta: consulta || caminho, parametros: parametros || {}, ms, linhas, erro })
  try {
    const { json, status, totalMs } = await pedir(caminho, opcoes)
    const r = { ...resultado(json.resposta, totalMs, caminho, status), consulta: json.consulta, parametros: json.parametros }
    avisar(r.consulta, r.parametros, totalMs, r.linhas.length, null)
    return r
  } catch (e) {
    if (e?.origem !== 'cancelada') avisar(e?.consulta, e?.parametros, Math.round(performance.now() - t0), 0, e?.codigo || String(e))
    throw e
  }
}

/**
 * Um pedido à API que não é consulta ao Neo4j (ex.: o cardápio de perguntas da
 * busca). Os erros chegam como nas consultas, em ErroCypher.
 * @returns {Promise<any>}  o JSON da resposta
 */
export async function pedirApi(caminho, opcoes = {}) {
  return (await pedir(caminho, opcoes)).json
}

const anunciar = (aviso) => observadores.forEach((f) => f(aviso))

// a resposta do Neo4j (JSON tipado) → o resultado que o site usa
function resultado(neo4j, totalMs, caminho, status) {
  if (!neo4j?.data)
    throw new ErroCypher({ origem: 'http', codigo: `HTTP ${status}`, mensagem: mensagemHttp(status, caminho), status })
  const { fields: campos, values } = neo4j.data
  return {
    campos,
    linhas: values.map((valores) => Object.fromEntries(campos.map((c, i) => [c, decodificar(valores[i])]))),
    tempos: { disponivelApos: neo4j.resultAvailableAfter, consumidoApos: neo4j.resultConsumedAfter, totalMs },
    tipoConsulta: neo4j.queryType, // 'r' leitura · 'w' escrita · 'rw' · 's' esquema
    avisos: neo4j.notifications || [],
    bruto: neo4j,
  }
}

// Um pedido à API do site, com canal, tempo-limite e cancelamento. Sem `corpo`
// é um GET; com corpo, um POST em JSON. Um erro que vem NO CORPO (do Neo4j ou da
// API, sempre { errors: [{ code, message }] }) também vira ErroCypher.
async function pedir(caminho, { corpo, canal, signal, tempoLimiteMs = TEMPO_LIMITE_MS } = {}) {
  // serializa antes de qualquer preparo: um valor não serializável é erro de
  // programação e deve estourar como tal, não virar "falha de rede"
  const texto = corpo === undefined ? undefined : JSON.stringify(corpo)
  const metodo = texto === undefined ? 'GET' : 'POST'

  const ctrl = new AbortController()
  let motivo = null // por que ESTA consulta foi abortada: 'tempo' | 'cancelada'
  const abortar = (m) => {
    if (motivo) return
    motivo = m
    ctrl.abort()
  }
  const cancelar = () => abortar('cancelada')
  if (canal) {
    canais.get(canal)?.() // a consulta anterior do mesmo canal perde a vez
    canais.set(canal, cancelar)
  }
  if (signal) {
    if (signal.aborted) cancelar()
    else signal.addEventListener('abort', cancelar, { once: true })
  }
  const relogio = setTimeout(() => abortar('tempo'), tempoLimiteMs)

  const t0 = performance.now()
  let resp
  let recebido
  try {
    resp = await fetch(caminho, {
      method: metodo,
      headers: texto === undefined ? {} : { 'Content-Type': 'application/json' },
      body: texto,
      signal: ctrl.signal,
    })
    recebido = await resp.text() // o tempo-limite vale também para a leitura do corpo
  } catch {
    if (motivo === 'cancelada')
      throw new ErroCypher({ origem: 'cancelada', codigo: 'EduGraph.Cliente.Cancelada', mensagem: 'Consulta cancelada.' })
    if (motivo === 'tempo')
      throw new ErroCypher({
        origem: 'rede',
        codigo: 'EduGraph.Cliente.TempoEsgotado',
        mensagem: `Sem resposta em ${tempoLimiteMs / 1000} s — o Neo4j pode estar sobrecarregado ou a consulta é pesada demais.`,
      })
    throw new ErroCypher({
      origem: 'rede',
      codigo: 'EduGraph.Cliente.SemConexao',
      mensagem: `Sem conexão com o servidor do site (${metodo} ${caminho}).`,
    })
  } finally {
    clearTimeout(relogio)
    signal?.removeEventListener('abort', cancelar)
    if (canal && canais.get(canal) === cancelar) canais.delete(canal)
  }
  const totalMs = Math.round(performance.now() - t0)

  let json = null
  try {
    json = recebido ? JSON.parse(recebido) : null
  } catch {
    /* corpo que não é JSON (ex.: página 404 do servidor) — tratado abaixo */
  }
  const erro = json?.errors?.[0]
  if (erro)
    throw new ErroCypher({
      origem: origemDoCodigo(erro.code),
      codigo: erro.code,
      mensagem: erro.message,
      status: resp.status,
      consulta: json.consulta,
      parametros: json.parametros,
    })
  if (!resp.ok || json === null)
    throw new ErroCypher({ origem: 'http', codigo: `HTTP ${resp.status}`, mensagem: mensagemHttp(resp.status, caminho), status: resp.status })
  return { json, status: resp.status, totalMs }
}
