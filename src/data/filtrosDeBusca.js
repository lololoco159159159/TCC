import { consultarGrafo, pedirApi } from './neo4j'
import { anosDoGrafo } from './resumoGrafo'

// Filtros de busca do professor. Tudo o que a busca guiada precisa, sem tela,
// num arquivo só (pedido do autor). Cinco partes:
//  1. o MODELO — como o grafo da orientadora se organiza;
//  2. o FILTRO POR TEXTO — o que o professor digita, filtrado no navegador;
//  3. as OPÇÕES — anos, áreas, componentes e o recorte, vindos do Neo4j;
//  4. as PERGUNTAS — o cardápio e a resposta de cada uma;
//  5. a CONSULTA ESCRITA — a consulta executada com os valores, para o console.
// Nada aqui é dado do grafo: anos, áreas, componentes, unidades, objetos e
// habilidades vêm sempre do Neo4j. E nada aqui é consulta: as consultas Cypher
// moram na API (api/grafo.py), que as executa e as devolve junto da resposta;
// este arquivo pede pelas rotas e organiza o que chega.

// ===========================================================================
// 1. O modelo do grafo (o da orientadora — D21, 2026-11-03; D22, 2026-11-11)
//   (:Ano)-[:TEM_AREA]->(:AreaConhecimento {codigo, nome})
//     -[:TEM_COMPONENTE]->(:ComponenteCurricular {codigo, nome})
//     -[:TEM_UNIDADE]->(unidade temática {nome})
//     -[:TEM_OBJETO]->(objeto de conhecimento {descricao})
//     -[:DESENVOLVE]->(habilidade {codigo, descricao})
//   e o atalho (:Ano)-[:DESENVOLVE_HABILIDADE]->(habilidade)
// Cada componente tem os seus rótulos (UnidadeTematicaMat, UnidadeTematicaCien…),
// mas as consultas da busca (na API) não citam rótulo nenhum além de Ano,
// AreaConhecimento e ComponenteCurricular: andam pelas RELAÇÕES, que são as
// mesmas em todo componente. Por isso um componente novo entra na busca sozinho,
// sem mudar o código — basta seguir o modelo. (Antes o componente se chamava
// Disciplina e saía direto do Ano.)
// O ano é amarrado pelo atalho Ano → Habilidade: a área, o componente, as
// unidades e os objetos são compartilhados entre os anos (um nó "Ciências" para
// todos — não existe "Habilidade2Cien"), e descer por eles traria também o que é
// de outros anos.
// ===========================================================================

// títulos dos campos que o professor vê (os mesmos em toda matéria) e o plural,
// para os totais do recorte
export const TITULOS = { unidade: 'Unidade temática', objeto: 'Objeto de conhecimento', habilidade: 'Habilidade' }
export const PLURAIS = { unidade: 'unidades temáticas', objeto: 'objetos de conhecimento', habilidade: 'habilidades' }

// ===========================================================================
// 2. Filtro por texto (decisões 19–27)
// Puro, sem rede: roda no navegador a cada tecla sobre o recorte já carregado —
// nenhuma consulta ao Neo4j enquanto o professor digita, e por isso sem
// intervalo de tempo (debounce). Ignora maiúsculas e acentos ("numeros" acha
// "Números"); com várias palavras, a opção precisa conter TODAS, em qualquer
// ordem; as que COMEÇAM com o que foi digitado vêm antes das que só o contêm, e
// dentro de cada grupo vale a ordem que a lista já tinha.
// ===========================================================================

// sem acento e em minúsculas, caractere a caractere — o índice de cada letra
// do texto normalizado aponta para a letra correspondente do original (é o que
// permite marcar o trecho encontrado no texto com acento)
function normalizarComMapa(texto) {
  let norm = ''
  const origem = []
  const s = String(texto ?? '')
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
    for (const ch of c) {
      norm += ch
      origem.push(i)
    }
  }
  return { norm, origem }
}

export const normalizar = (texto) => normalizarComMapa(texto).norm

// as palavras do que foi digitado, normalizadas (espaços repetidos não contam)
const palavrasDe = (consulta) => normalizar(consulta).split(/\s+/).filter(Boolean)

/**
 * Filtra e ordena as opções de um campo.
 * @param {object[]} opcoes  cada uma com `busca`: os textos onde procurar
 *   (ex.: [código, descrição]); a ordem da lista é a ordem "natural"
 * @param {string} consulta  o que o professor digitou
 * @returns {object[]}  as opções que contêm todas as palavras (campo vazio =
 *   todas), primeiro as que começam com o texto digitado
 */
export function filtrarOpcoes(opcoes, consulta) {
  const palavras = palavrasDe(consulta)
  if (!palavras.length) return opcoes
  const inteira = palavras.join(' ')
  const comeca = []
  const contem = []
  for (const op of opcoes) {
    const textos = op.busca.map(normalizar)
    const tudo = textos.join(' ')
    if (!palavras.every((p) => tudo.includes(p))) continue
    if (textos.some((t) => t.startsWith(inteira))) comeca.push(op)
    else contem.push(op)
  }
  return [...comeca, ...contem]
}

/**
 * Divide um texto em trechos marcados/não marcados conforme as palavras
 * digitadas — para destacar na opção o que o professor escreveu, mesmo quando
 * ele digitou sem acento.
 * @returns {{ texto: string, marcado: boolean }[]}
 */
export function marcarTrechos(texto, consulta) {
  const s = String(texto ?? '')
  const palavras = palavrasDe(consulta)
  if (!s || !palavras.length) return [{ texto: s, marcado: false }]
  const { norm, origem } = normalizarComMapa(s)
  const marcado = new Array(s.length).fill(false)
  for (const p of palavras) {
    let i = norm.indexOf(p)
    while (i !== -1) {
      for (let k = i; k < i + p.length; k++) marcado[origem[k]] = true
      i = norm.indexOf(p, i + p.length)
    }
  }
  const trechos = []
  for (let i = 0; i < s.length; i++) {
    const ultimo = trechos[trechos.length - 1]
    if (ultimo && ultimo.marcado === marcado[i]) ultimo.texto += s[i]
    else trechos.push({ texto: s[i], marcado: marcado[i] })
  }
  return trechos
}

// ===========================================================================
// 3. Opções (decisões 12–18)
// Tudo o que o professor escolhe vem do Neo4j na hora, pela API: os anos (a
// consulta da Home), as áreas do ano escolhido, os componentes da área (em cada
// caso, só os que têm alguma habilidade naquele ano) e o RECORTE — as unidades,
// os objetos e as habilidades de um ano num componente, trazidos numa única
// consulta. As listas dos campos saem desse recorte, no navegador, sem consulta
// nova. O ano é amarrado pelas HABILIDADES (o atalho Ano → Habilidade — ver a
// parte 1).
// ===========================================================================

const TETO_RECORTE = 2000 // linhas; passou disso, o recorte vem cortado e avisa (decisão 18)

// ordem natural em português: "Álgebra" junto do A (o Neo4j a põe no fim) e
// EF01MA2 antes de EF01MA10
const comparar = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' }).compare

// a rota da API de uma consulta da busca; os códigos vão no caminho
// (ex.: /api/grafo/anos/EF1/areas)
const rota = (...partes) => `/api/grafo/${partes.map(encodeURIComponent).join('/')}`

export const anosDaBusca = () => anosDoGrafo({ descricao: 'busca · anos' })

const emOrdem = (linhas) =>
  linhas
    .map((l) => ({ codigo: String(l.codigo ?? ''), nome: String(l.nome ?? l.codigo ?? '') }))
    .sort((a, b) => comparar(a.nome, b.nome))

/**
 * @param {string} ano  código do Ano (ex.: 'EF1')
 * @returns {Promise<{ codigo: string, nome: string }[]>}  em ordem alfabética
 *   (`codigo`: o da área, ex.: 'CN')
 */
export async function areasDoAno(ano) {
  const { linhas } = await consultarGrafo(rota('anos', ano, 'areas'), { descricao: 'busca · áreas do ano' })
  return emOrdem(linhas)
}

/**
 * @param {string} ano  código do Ano (ex.: 'EF1')
 * @param {string} area  código da área (ex.: 'CN')
 * @returns {Promise<{ codigo: string, nome: string }[]>}  em ordem alfabética
 *   (`codigo`: o do componente, ex.: 'CI')
 */
export async function componentesDaArea(ano, area) {
  const { linhas } = await consultarGrafo(rota('anos', ano, 'areas', area, 'componentes'), {
    descricao: 'busca · componentes da área',
  })
  return emOrdem(linhas)
}

// todos os componentes do ano (de qualquer área), cada um com a sua área — o
// balão da turma na Home (N19), que abre a busca já com o ano, a área e o
// componente escolhidos
/**
 * @param {string} ano  código do Ano (ex.: 'EF1')
 * @returns {Promise<{ codigo: string, nome: string, area: string }[]>}  em
 *   ordem alfabética (`area`: o código da área do componente, ex.: 'CN')
 */
export async function componentesDoAno(ano) {
  const { linhas } = await consultarGrafo(rota('anos', ano, 'componentes'), { descricao: 'Home · componentes da turma' })
  const area = new Map(linhas.map((l) => [String(l.codigo ?? ''), String(l.area ?? '')]))
  return emOrdem(linhas).map((c) => ({ ...c, area: area.get(c.codigo) }))
}

// o recorte chega com uma linha por (habilidade do ano, objeto, unidade) do
// componente; aqui ele vira as três listas, sem repetição

// cache da visita: voltar a um recorte já visto não consulta de novo. Fica só
// na memória (some ao recarregar); nada vai para o localStorage (decisão 17).
// Guarda a promessa: dois pedidos seguidos do mesmo recorte fazem uma consulta
// só; se ela falhar, sai do cache e o próximo pedido tenta de novo.
const recortes = new Map()

/**
 * As unidades, os objetos e as habilidades de um ano num componente.
 * @param {string} ano  código do Ano (ex.: 'EF1')
 * @param {string} componente  código do ComponenteCurricular (ex.: 'MA')
 * @returns {Promise<{ ano, componente, unidades: object[], objetos: object[],
 *   habilidades: object[], cortado: boolean }>}
 *   unidade { id, nome } · objeto { id, nome, unidades: [id] } ·
 *   habilidade { id, codigo, texto, objetos: [id] } — cada lista em ordem natural
 */
export function carregarRecorte(ano, componente) {
  const chave = `${ano}\u0000${componente}`
  if (!recortes.has(chave)) {
    const pedido = consultarRecorte(ano, componente)
    pedido.catch(() => recortes.delete(chave))
    recortes.set(chave, pedido)
  }
  return recortes.get(chave)
}

async function consultarRecorte(ano, componente) {
  const { linhas } = await consultarGrafo(`${rota('anos', ano, 'componentes', componente, 'recorte')}?limite=${TETO_RECORTE + 1}`, {
    descricao: 'busca · recorte do ano e componente',
  })
  const cortado = linhas.length > TETO_RECORTE
  const unidades = new Map()
  const objetos = new Map()
  const habilidades = new Map()
  for (const l of linhas.slice(0, TETO_RECORTE)) {
    if (!unidades.has(l.idUnidade)) unidades.set(l.idUnidade, { id: l.idUnidade, nome: String(l.unidade ?? '') })
    if (!objetos.has(l.idObjeto)) objetos.set(l.idObjeto, { id: l.idObjeto, nome: String(l.objeto ?? ''), unidades: [] })
    if (!habilidades.has(l.idHabilidade)) {
      habilidades.set(l.idHabilidade, { id: l.idHabilidade, codigo: String(l.codigo ?? ''), texto: String(l.texto ?? ''), objetos: [] })
    }
    const o = objetos.get(l.idObjeto)
    if (!o.unidades.includes(l.idUnidade)) o.unidades.push(l.idUnidade)
    const h = habilidades.get(l.idHabilidade)
    if (!h.objetos.includes(l.idObjeto)) h.objetos.push(l.idObjeto)
  }
  return {
    ano,
    componente,
    unidades: [...unidades.values()].sort((a, b) => comparar(a.nome, b.nome)),
    objetos: [...objetos.values()].sort((a, b) => comparar(a.nome, b.nome)),
    habilidades: [...habilidades.values()].sort((a, b) => comparar(a.codigo, b.codigo)),
    cortado,
  }
}

/**
 * As opções de um campo, no formato do filtro por texto (parte 2): { id,
 * titulo, detalhe, busca }. `detalhe` diz de onde a opção vem (ex.: "Medidas
 * de tempo · Grandezas e medidas"); `busca` são os textos onde o filtro procura
 * (decisão 23). (A cascata da decisão 16 saiu a pedido do autor, 2026-10-24:
 * cada pergunta mostra só o campo que ela pede.)
 * @param {'unidade'|'objeto'|'habilidade'} campo
 */
export function opcoesDoCampo(recorte, campo) {
  const nomeUnidade = new Map(recorte.unidades.map((u) => [u.id, u.nome]))
  const nomeObjeto = new Map(recorte.objetos.map((o) => [o.id, o.nome]))
  const objetoDe = new Map(recorte.objetos.map((o) => [o.id, o]))
  if (campo === 'unidade') {
    return recorte.unidades.map((u) => ({ id: u.id, titulo: u.nome, detalhe: '', busca: [u.nome] }))
  }
  if (campo === 'objeto') {
    return recorte.objetos.map((o) => ({
      id: o.id,
      titulo: o.nome,
      detalhe: o.unidades.map((id) => nomeUnidade.get(id)).join(' · '),
      busca: [o.nome],
    }))
  }
  return recorte.habilidades.map((h) => {
    const o = objetoDe.get(h.objetos[0])
    const onde = o ? [nomeObjeto.get(o.id), ...o.unidades.map((id) => nomeUnidade.get(id))] : []
    return { id: h.id, titulo: h.codigo, texto: h.texto, detalhe: onde.join(' · '), busca: [h.codigo, h.texto] }
  })
}

// ===========================================================================
// 4. Perguntas (decisões 7–11)
// O cardápio vem da API (GET /api/grafo/perguntas), dona das consultas: cada
// pergunta tem o título em linguagem de professor, uma explicação de uma linha,
// os CAMPOS que ele preenche (escolhidos no recorte, parte 3) e a consulta
// Cypher. O "Ver no grafo" pede à API a resposta da pergunta (executarPergunta):
// ela monta os parâmetros, executa e devolve a consulta junto — que o console
// mostra (parte 5). O resultado são caminhos (`RETURN p`), que seguem pelo
// mesmo trajeto do console: extrairGrafo → completarGrafo → canvas. Pergunta
// nova = uma entrada nova no cardápio da API; a barra a mostra sozinha.
//
// Campo: { nome (o parâmetro), tipo (unidade | objeto | habilidade — de que
// lista do recorte ele escolhe), rotulo? (quando o título de TITULOS não serve) }.
// ===========================================================================

// o cardápio não muda durante a visita: um pedido só, guardado na memória (se
// falhar, sai do cache e o próximo pedido tenta de novo)
let cardapio = null

/**
 * O cardápio da busca, vindo da API.
 * @returns {Promise<{ id: string, titulo: string, explicacao: string, campos: object[],
 *   distintos?: string[], fixa?: boolean, consulta: string }[]>}
 */
export function perguntasDaBusca() {
  if (!cardapio) {
    const pedido = pedirApi('/api/grafo/perguntas')
    pedido.catch(() => {
      if (cardapio === pedido) cardapio = null
    })
    cardapio = pedido
  }
  return cardapio
}

// os campos da pergunta ainda sem escolha — a barra usa para dizer o que falta
// e para ligar o "Ver no grafo" (decisão 6; a API confere de novo)
export const camposFaltando = (pergunta, escolhas = {}) => pergunta.campos.filter((c) => !escolhas[c.nome])

/**
 * A resposta de uma pergunta da busca, executada pela API.
 * @param {string} idPergunta
 * @param {{ ano: string, componente: string, escolhas?: object }} busca
 *   `componente`: o código do ComponenteCurricular (ex.: 'MA'); `escolhas`:
 *   { [nome do campo]: id do recorte (elementId) }
 * @param {object} [opcoes]  as do consultarGrafo (canal, descricao…)
 * @returns o resultado do consultarGrafo — com a `consulta` e os `parametros`
 *   que a API executou
 */
export function executarPergunta(idPergunta, { ano, componente, escolhas = {} }, opcoes = {}) {
  // vazio não vai: a API recusa um código vazio (a pergunta fixa não usa os dois)
  const corpo = { ano: ano || undefined, componente: componente || undefined, escolhas }
  return consultarGrafo(rota('perguntas', idPergunta), { ...opcoes, corpo })
}

// ===========================================================================
// 5. A consulta escrita, para o console (pedido do autor, 2026-10-24)
// O "Ver no grafo" também escreve no console Cypher a consulta que a API
// executou para o desenho (ela a devolve junto da resposta), para quem quiser
// ler — ou mudar e executar de novo. O Neo4j recebe a consulta com parâmetros
// (decisões 29–30); esta é a MESMA consulta com o valor de cada $parâmetro
// escrito no lugar dele, entre aspas. Executada no console, dá o mesmo
// resultado. Os valores vêm da barra (o ano e o componente) e do recorte (ids
// do Neo4j) — nunca do que o professor digitou.
// ===========================================================================

const valorCypher = (v) => {
  if (Array.isArray(v)) return `[${v.map(valorCypher).join(', ')}]`
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

/**
 * A consulta com os valores dos parâmetros escritos no lugar deles.
 * @param {string} consulta  com $parâmetros
 * @param {object} parametros
 */
export function consultaEscrita(consulta, parametros) {
  return consulta.replace(/\$(\w+)/g, (t, k) => (k in parametros ? valorCypher(parametros[k]) : t))
}
