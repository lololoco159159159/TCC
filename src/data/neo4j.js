// Cliente do EduGraph para os dados do grafo. Única porta de entrada do front
// para o Neo4j, sempre pela API do próprio site (pasta api/, em Python), que
// guarda a credencial e impõe o modo somente leitura — o navegador nunca vê a
// senha. As consultas (anos, áreas, recorte, perguntas da busca, conexões…)
// moram na API (api/grafo.py): o site chama a rota de cada uma com
// consultarGrafo(), e a API devolve a resposta do Neo4j.
//
// A resposta é a da Query API do Neo4j (conferida no Neo4j local em 2026-10-09
// e 10-12), que a API do site repassa sem mudar o formato:
//  - JSON TIPADO (Accept: application/vnd.neo4j.query): cada valor chega como
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
//  'neo4j'     — a consulta foi recusada ou não pôde ser executada pelo Neo4j
//                (sintaxe, modo leitura, erro de execução);
//  'cancelada' — não é falha: outra consulta do mesmo `canal` tomou o lugar, ou
//                quem chamou abortou pelo `signal`. Quem chama só ignora.

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
  constructor({ origem, codigo, mensagem, status = 0 }) {
    super(mensagem)
    this.name = 'ErroCypher'
    this.origem = origem
    this.codigo = codigo
    this.status = status // status HTTP; 0 quando não houve resposta
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
// consulta. Os códigos do proxy e da API (EduGraph.*) são infraestrutura.
function origemDoCodigo(codigo = '') {
  return codigo.startsWith('Neo.') && !codigo.startsWith('Neo.ClientError.Security.') ? 'neo4j' : 'http'
}

function mensagemHttp(status, caminho) {
  if (status === 404) return `A rota ${caminho} não existe neste servidor — a API do EduGraph está rodando? (npm run api)`
  if (status >= 500) return `O servidor do site respondeu com erro (HTTP ${status}).`
  return `Resposta inesperada do servidor (HTTP ${status}).`
}

const canais = new Map() // canal → função que cancela a consulta em andamento nele

/**
 * Uma consulta do site, pela rota da API que a executa (ex.: '/api/grafo/anos'):
 * as consultas moram na API (api/grafo.py). Ela devolve { consulta, parametros,
 * resposta }; a `resposta` é a do Neo4j, em JSON tipado.
 *
 * @param {string} caminho  a rota da API
 * @param {object} [opcoes]
 * @param {object} [opcoes.corpo]  com ele o pedido é um POST em JSON; sem, um GET
 * @param {string} [opcoes.canal]  consultas do mesmo canal são exclusivas: uma
 *   nova cancela a anterior (ex.: 'palco' — só a última busca importa; 'painel'
 *   — só o último nó clicado). Sem canal, a consulta nunca é cancelada por outra.
 * @param {AbortSignal} [opcoes.signal]  cancelamento externo
 * @param {number} [opcoes.tempoLimiteMs]  padrão 15000
 * @returns {Promise<{ linhas: object[], tempos: { totalMs: number } }>}
 *   `linhas`: um objeto por linha, com os valores já convertidos e chaveados
 *   pelos campos do RETURN; `totalMs`: o tempo do pedido no navegador.
 * @throws {ErroCypher}
 */
export async function consultarGrafo(caminho, opcoes = {}) {
  const { json, status, totalMs } = await pedir(caminho, opcoes)
  return resultado(json.resposta, totalMs, caminho, status)
}

/**
 * Um pedido à API que não é consulta ao Neo4j (ex.: o cardápio de perguntas da
 * busca). Os erros chegam como nas consultas, em ErroCypher.
 * @returns {Promise<any>}  o JSON da resposta
 */
export async function pedirApi(caminho, opcoes = {}) {
  return (await pedir(caminho, opcoes)).json
}

// a resposta do Neo4j (JSON tipado) → o resultado que o site usa
function resultado(neo4j, totalMs, caminho, status) {
  if (!neo4j?.data)
    throw new ErroCypher({ origem: 'http', codigo: `HTTP ${status}`, mensagem: mensagemHttp(status, caminho), status })
  const { fields: campos, values } = neo4j.data
  return {
    linhas: values.map((valores) => Object.fromEntries(campos.map((c, i) => [c, decodificar(valores[i])]))),
    tempos: { totalMs },
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
    })
  if (!resp.ok || json === null)
    throw new ErroCypher({ origem: 'http', codigo: `HTTP ${resp.status}`, mensagem: mensagemHttp(resp.status, caminho), status: resp.status })
  return { json, status: resp.status, totalMs }
}
