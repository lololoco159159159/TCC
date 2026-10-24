import { executarCypher } from './neo4j'
import { anosDoGrafo } from './resumoGrafo'
import { CONSULTA_COM_ERRO } from './consultasExemplo'

// Filtros de busca do professor (N12 — ESTADO_ATUAL.md §4.5). Tudo o que a busca
// guiada precisa, sem tela, num arquivo só (pedido do autor). Quatro partes:
//  1. a TABELA DE MATÉRIAS — como o modelo do grafo da orientadora se organiza;
//  2. o FILTRO POR TEXTO — o que o professor digita, filtrado no navegador;
//  3. as OPÇÕES — anos, matérias do ano e o recorte, vindos do Neo4j;
//  4. as PERGUNTAS — o cardápio e a consulta pronta de cada uma.
// Nada aqui é dado do grafo (D17): anos, unidades, objetos e habilidades vêm
// sempre do Neo4j; este arquivo guarda só consultas e a descrição do modelo.

// ===========================================================================
// 1. Tabela de matérias (decisão 13)
// Descreve COMO o modelo da orientadora se organiza em cada matéria — o rótulo
// de cada nível, a relação que liga um nível ao de baixo, o atalho Ano →
// Habilidade e a propriedade que dá nome a cada nó. O modelo dela não muda; é
// esta tabela que se adapta a ele. Matéria nova = uma entrada nova (com os nomes
// que a orientadora usar, ex.: UnidadeTematicaGram / ObjetoConhecimentoGram para
// a Gramática). Uma entrada cujos rótulos ainda não existem no banco, ou sem
// nada no ano escolhido, simplesmente não aparece para o professor
// (materiasDoAno, abaixo).
// ===========================================================================

export const MATERIAS = [
  {
    id: 'matematica', // vai na URL da busca (N15)
    nome: 'Matemática',
    // títulos dos campos que o professor vê (e o plural, para os totais do recorte)
    titulos: { unidade: 'Unidade temática', objeto: 'Objeto de conhecimento', habilidade: 'Habilidade' },
    plurais: { unidade: 'unidades temáticas', objeto: 'objetos de conhecimento', habilidade: 'habilidades' },
    rotulos: { unidade: 'UnidadeTematica', objeto: 'ObjetoConhecimento', habilidade: 'Habilidade' },
    relacoes: {
      anoUnidade: 'TEM_UNIDADE', // Ano → unidade
      unidadeObjeto: 'TEM_OBJETO', // unidade → objeto
      objetoHabilidade: 'DESENVOLVE', // objeto → habilidade
      // atalho Ano → Habilidade: é por ele que o ano é amarrado, porque unidades e
      // objetos são compartilhados entre anos (pergunta 5 da reunião)
      anoHabilidade: 'DESENVOLVE_HABILIDADE',
    },
    // propriedade que dá o texto de cada nível
    propriedades: { unidade: 'nome', objeto: 'descricao', habilidadeCodigo: 'codigo', habilidadeTexto: 'descricao' },
  },
]

export const materiaPorId = (id) => MATERIAS.find((m) => m.id === id) || null

// a entrada da tabela no formato de parâmetro Cypher ($m.…): rótulos e
// relações entram nas consultas como valores, nunca como texto montado
export const parametrosDaMateria = (m) => ({
  rotUnidade: m.rotulos.unidade,
  rotObjeto: m.rotulos.objeto,
  rotHabilidade: m.rotulos.habilidade,
  anoUnidade: m.relacoes.anoUnidade,
  unidadeObjeto: m.relacoes.unidadeObjeto,
  objetoHabilidade: m.relacoes.objetoHabilidade,
  anoHabilidade: m.relacoes.anoHabilidade,
  propUnidade: m.propriedades.unidade,
  propObjeto: m.propriedades.objeto,
  propCodigo: m.propriedades.habilidadeCodigo,
  propTexto: m.propriedades.habilidadeTexto,
})

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
// Tudo o que o professor escolhe vem do Neo4j na hora: os anos (a consulta da
// Home), as matérias que existem no ano escolhido (a tabela acima conferida
// contra o banco) e o RECORTE — as unidades, os objetos e as habilidades de um
// ano numa matéria, trazidos numa única consulta. As listas dos campos e a
// cascata (unidade → objeto → habilidade) saem desse recorte, no navegador, sem
// consulta nova. O ano é amarrado pelas HABILIDADES (o atalho Ano → Habilidade
// da tabela): unidades e objetos são compartilhados entre anos no modelo da
// orientadora, e uma unidade pendurada no ano traria também os objetos de
// outros anos.
// ===========================================================================

const TETO_RECORTE = 2000 // linhas; passou disso, o recorte vem cortado e avisa (decisão 18)

// ordem natural em português: "Álgebra" junto do A (o Neo4j a põe no fim) e
// EF01MA2 antes de EF01MA10
const comparar = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' }).compare

export const anosDaBusca = () => anosDoGrafo({ descricao: 'busca · anos' })

// as matérias da tabela que têm alguma habilidade no ano — uma consulta para
// todas; rótulo que ainda não existe no banco simplesmente não acha nada
const MATERIAS_DO_ANO = `UNWIND $materias AS m
RETURN m.id AS id,
  EXISTS { MATCH (:Ano {codigo: $ano})-[:$any([m.anoHabilidade])]->(:$any([m.rotHabilidade]))<-[:$any([m.objetoHabilidade])]-(:$any([m.rotObjeto])) } AS temDados`

/**
 * @param {string} ano  código do Ano (ex.: 'EF1')
 * @returns {Promise<{ id: string, nome: string }[]>}  na ordem da tabela
 */
export async function materiasDoAno(ano, tabela = MATERIAS) {
  const materias = tabela.map((m) => ({ id: m.id, ...parametrosDaMateria(m) }))
  const { linhas } = await executarCypher(MATERIAS_DO_ANO, { ano, materias }, { descricao: 'busca · matérias do ano' })
  const comDados = new Set(linhas.filter((l) => l.temDados).map((l) => l.id))
  return tabela.filter((m) => comDados.has(m.id)).map((m) => ({ id: m.id, nome: m.nome }))
}

// o recorte: uma linha por (habilidade do ano, objeto, unidade)
const RECORTE = `MATCH (:Ano {codigo: $ano})-[:$any([$m.anoHabilidade])]->(h:$any([$m.rotHabilidade]))
      <-[:$any([$m.objetoHabilidade])]-(o:$any([$m.rotObjeto]))
      <-[:$any([$m.unidadeObjeto])]-(u:$any([$m.rotUnidade]))
RETURN elementId(u) AS idUnidade, u[$m.propUnidade] AS unidade,
       elementId(o) AS idObjeto, o[$m.propObjeto] AS objeto,
       elementId(h) AS idHabilidade, h[$m.propCodigo] AS codigo, h[$m.propTexto] AS texto
LIMIT $limite`

// cache da visita: voltar a um recorte já visto não consulta de novo. Fica só
// na memória (some ao recarregar); nada vai para o localStorage (decisão 17).
// Guarda a promessa: dois pedidos seguidos do mesmo recorte fazem uma consulta
// só; se ela falhar, sai do cache e o próximo pedido tenta de novo.
const recortes = new Map()

/**
 * As unidades, os objetos e as habilidades de um ano numa matéria.
 * @returns {Promise<{ ano, materia, unidades: object[], objetos: object[],
 *   habilidades: object[], cortado: boolean }>}
 *   unidade { id, nome } · objeto { id, nome, unidades: [id] } ·
 *   habilidade { id, codigo, texto, objetos: [id] } — cada lista em ordem natural
 */
export function carregarRecorte(ano, idMateria) {
  const chave = `${ano}\u0000${idMateria}`
  if (!recortes.has(chave)) {
    const pedido = consultarRecorte(ano, idMateria)
    pedido.catch(() => recortes.delete(chave))
    recortes.set(chave, pedido)
  }
  return recortes.get(chave)
}

async function consultarRecorte(ano, idMateria) {
  const materia = materiaPorId(idMateria)
  if (!materia) throw new Error(`Matéria desconhecida: ${idMateria}`)
  const { linhas } = await executarCypher(
    RECORTE,
    { ano, m: parametrosDaMateria(materia), limite: TETO_RECORTE + 1 },
    { descricao: 'busca · recorte do ano e matéria' },
  )
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
    materia: idMateria,
    unidades: [...unidades.values()].sort((a, b) => comparar(a.nome, b.nome)),
    objetos: [...objetos.values()].sort((a, b) => comparar(a.nome, b.nome)),
    habilidades: [...habilidades.values()].sort((a, b) => comparar(a.codigo, b.codigo)),
    cortado,
  }
}

/**
 * As opções de um campo, já com a cascata aplicada (decisão 16) e no formato
 * do filtro por texto (parte 2): { id, titulo, detalhe, busca }. `detalhe` diz
 * de onde a opção vem (ex.: "Medidas de tempo · Grandezas e medidas"); `busca`
 * são os textos onde o filtro procura (decisão 23).
 * @param {'unidade'|'objeto'|'habilidade'} campo
 * @param {{ unidade?: string, objeto?: string }} [cascata]  ids já escolhidos
 */
export function opcoesDoCampo(recorte, campo, { unidade, objeto } = {}) {
  const nomeUnidade = new Map(recorte.unidades.map((u) => [u.id, u.nome]))
  const nomeObjeto = new Map(recorte.objetos.map((o) => [o.id, o.nome]))
  const objetoDe = new Map(recorte.objetos.map((o) => [o.id, o]))
  if (campo === 'unidade') {
    return recorte.unidades.map((u) => ({ id: u.id, titulo: u.nome, detalhe: '', busca: [u.nome] }))
  }
  if (campo === 'objeto') {
    return recorte.objetos
      .filter((o) => !unidade || o.unidades.includes(unidade))
      .map((o) => ({
        id: o.id,
        titulo: o.nome,
        detalhe: o.unidades.map((id) => nomeUnidade.get(id)).join(' · '),
        busca: [o.nome],
      }))
  }
  return recorte.habilidades
    .filter((h) => (!objeto || h.objetos.includes(objeto)) && (!unidade || h.objetos.some((id) => objetoDe.get(id)?.unidades.includes(unidade))))
    .map((h) => {
      const o = objetoDe.get(h.objetos[0])
      const onde = o ? [nomeObjeto.get(o.id), ...o.unidades.map((id) => nomeUnidade.get(id))] : []
      return { id: h.id, titulo: h.codigo, texto: h.texto, detalhe: onde.join(' · '), busca: [h.codigo, h.texto] }
    })
}

// ===========================================================================
// 4. Perguntas (decisões 7–11)
// Cada pergunta: o título em linguagem de professor, uma explicação de uma
// linha, os campos que ele preenche (escolhidos no recorte, parte 3) e a
// consulta Cypher, sempre com parâmetros. O resultado são caminhos (`RETURN
// p`), que seguem pelo mesmo trajeto do console: extrairGrafo → completarGrafo
// → canvas. Pergunta nova = uma entrada nova. Os rótulos e as relações vêm da
// tabela de matérias ($m.…) e o ano é amarrado pelas habilidades do ano, como no
// recorte. Cada salto do caminho é um tipo dinâmico de UM passo: num caminho de
// tamanho variável o Neo4j ignora o tipo dinâmico (testado em 2026-10-20) —
// por isso a "ligação entre duas habilidades" filtra as relações do caminho.
//
// As perguntas cobrem todas as consultas de teste da orientadora
// (consultasExemplo.js), trocando os códigos fixos por campos que o professor
// escolhe (decisão do autor, 2026-10-24): "arvore completa" → o ano inteiro;
// "geometria completa" → uma unidade temática inteira; "de onde vem a
// habilidade" → caminho até uma habilidade; "ano direto p habilidade" → as
// habilidades do ano; "caminho entre 2 habilidades" → ligação entre duas
// habilidades; "habiludade irma" → habilidades irmãs; "professor colocar as
// habilidades que precisa ensinar no ano" → habilidades que preciso ensinar. A
// versão original desta última, com o erro de sintaxe, fica como "Teste de
// erro" (fixa: não usa o ano nem a matéria).
//
// Campo: { nome (o parâmetro), tipo (unidade | objeto | habilidade — de que
// lista do recorte ele escolhe), rotulo? (quando o título da tabela não serve),
// varias? (escolhe uma lista) }.
// ===========================================================================

// habilidades do ano escolhido, na matéria (o começo de três das consultas)
const HABILIDADES_DO_ANO = 'MATCH (a:Ano {codigo: $ano})-[:$any([$m.anoHabilidade])]->(h:$any([$m.rotHabilidade]))'
// Ano → unidade → objeto → habilidade (o caminho completo de uma habilidade)
const CAMINHO_DO_ANO = `MATCH p = (a:Ano {codigo: $ano})-[:$any([$m.anoUnidade])]->(:$any([$m.rotUnidade]))
      -[:$any([$m.unidadeObjeto])]->(:$any([$m.rotObjeto]))-[:$any([$m.objetoHabilidade])]->(h)`

export const PERGUNTAS = [
  {
    id: 'caminho',
    titulo: 'Caminho até uma habilidade',
    explicacao: 'De que unidade temática e objeto de conhecimento a habilidade vem',
    campos: [{ nome: 'habilidade', tipo: 'habilidade' }],
    consulta: `${CAMINHO_DO_ANO}
WHERE elementId(h) = $habilidade
RETURN p`,
  },
  {
    id: 'irmas',
    titulo: 'Habilidades irmãs',
    explicacao: 'As outras habilidades do ano que saem do mesmo objeto de conhecimento',
    campos: [{ nome: 'habilidade', tipo: 'habilidade' }],
    consulta: `MATCH (:Ano {codigo: $ano})-[:$any([$m.anoHabilidade])]->(irma:$any([$m.rotHabilidade]))
MATCH p = (h)<-[:$any([$m.objetoHabilidade])]-(:$any([$m.rotObjeto]))-[:$any([$m.objetoHabilidade])]->(irma)
WHERE elementId(h) = $habilidade
RETURN p`,
  },
  {
    id: 'ligacao',
    titulo: 'Ligação entre duas habilidades',
    explicacao: 'O caminho mais curto entre duas habilidades, pelas unidades temáticas e objetos de conhecimento',
    campos: [
      { nome: 'habilidade', tipo: 'habilidade', rotulo: 'Primeira habilidade' },
      { nome: 'habilidade2', tipo: 'habilidade', rotulo: 'Segunda habilidade' },
    ],
    distintos: ['habilidade', 'habilidade2'], // as duas não podem ser a mesma
    // as unidades temáticas são as mesmas em todos os anos: sem a 2.ª condição, o
    // caminho mais curto poderia subir pelo nó de outro ano
    consulta: `MATCH (h1), (h2) WHERE elementId(h1) = $habilidade AND elementId(h2) = $habilidade2
MATCH p = shortestPath((h1)-[*..10]-(h2))
WHERE all(r IN relationships(p) WHERE type(r) IN [$m.anoUnidade, $m.unidadeObjeto, $m.objetoHabilidade])
  AND all(n IN nodes(p) WHERE NOT n:Ano OR n.codigo = $ano)
RETURN p`,
  },
  {
    id: 'ensinar',
    titulo: 'Habilidades que preciso ensinar no ano',
    explicacao: 'De onde vem cada habilidade que você escolher',
    campos: [{ nome: 'habilidades', tipo: 'habilidade', rotulo: 'Habilidades', varias: true }],
    consulta: `${CAMINHO_DO_ANO}
WHERE elementId(h) IN $habilidades
RETURN p`,
  },
  {
    id: 'objeto',
    titulo: 'Um objeto de conhecimento e as suas habilidades',
    explicacao: 'O objeto, as habilidades do ano e a unidade temática de cima',
    campos: [{ nome: 'objeto', tipo: 'objeto' }],
    consulta: `${HABILIDADES_DO_ANO}
MATCH p = (:$any([$m.rotUnidade]))-[:$any([$m.unidadeObjeto])]->(o)-[:$any([$m.objetoHabilidade])]->(h)
WHERE elementId(o) = $objeto
RETURN p`,
  },
  {
    id: 'unidade',
    titulo: 'Uma unidade temática inteira',
    explicacao: 'A unidade, os objetos de conhecimento dela e as habilidades do ano',
    campos: [{ nome: 'unidade', tipo: 'unidade' }],
    consulta: `${HABILIDADES_DO_ANO}
MATCH p = (u)-[:$any([$m.unidadeObjeto])]->(:$any([$m.rotObjeto]))-[:$any([$m.objetoHabilidade])]->(h)
WHERE elementId(u) = $unidade
RETURN p`,
  },
  {
    id: 'habilidadesDoAno',
    titulo: 'As habilidades do ano',
    explicacao: 'O ano ligado direto às habilidades dele nesta matéria',
    campos: [],
    consulta: `MATCH p = (a:Ano {codigo: $ano})-[:$any([$m.anoHabilidade])]->(h:$any([$m.rotHabilidade]))
WHERE EXISTS { (h)<-[:$any([$m.objetoHabilidade])]-(:$any([$m.rotObjeto])) }
RETURN p`,
  },
  {
    id: 'ano',
    titulo: 'O ano inteiro nesta matéria',
    explicacao: 'Todas as unidades temáticas, objetos de conhecimento e habilidades do ano',
    campos: [],
    consulta: `${HABILIDADES_DO_ANO}
MATCH p = (a)-[:$any([$m.anoUnidade])]->(:$any([$m.rotUnidade]))
      -[:$any([$m.unidadeObjeto])]->(:$any([$m.rotObjeto]))-[:$any([$m.objetoHabilidade])]->(h)
RETURN p`,
  },
  {
    id: 'erro',
    titulo: 'Teste de erro',
    explicacao: 'A consulta de teste da orientadora que tem um erro de sintaxe — serve para ver o aviso de erro',
    campos: [],
    fixa: true, // não usa o ano nem a matéria
    consulta: CONSULTA_COM_ERRO,
  },
]

export const perguntaPorId = (id) => PERGUNTAS.find((p) => p.id === id) || null

/**
 * A consulta pronta de uma pergunta: o texto Cypher, os parâmetros e a
 * descrição que aparece na gaveta Cypher (decisão 31).
 * @param {string} idPergunta
 * @param {{ ano: string, materia: string, escolhas?: object }} busca
 *   `escolhas`: { [nome do campo]: id do recorte (elementId) — ou uma lista de
 *   ids, nos campos `varias` }
 * @returns {{ consulta: string, parametros: object, descricao: string }}
 */
export function consultaDaPergunta(idPergunta, { ano, materia, escolhas = {} }) {
  const pergunta = perguntaPorId(idPergunta)
  const m = materiaPorId(materia)
  if (!pergunta || !m) throw new Error(`Busca desconhecida: ${idPergunta} / ${materia}`)
  const faltando = pergunta.campos.filter((c) => (c.varias ? !escolhas[c.nome]?.length : !escolhas[c.nome]))
  if (faltando.length) throw new Error(`Falta escolher: ${faltando.map((c) => c.nome).join(', ')}`)
  if (pergunta.distintos && new Set(pergunta.distintos.map((n) => escolhas[n])).size < pergunta.distintos.length) {
    throw new Error('Escolha itens diferentes em cada campo.')
  }
  const descricao = `busca · ${pergunta.titulo.toLowerCase()}`
  if (pergunta.fixa) return { consulta: pergunta.consulta, parametros: {}, descricao }
  const parametros = { ano, m: parametrosDaMateria(m) }
  pergunta.campos.forEach((c) => (parametros[c.nome] = escolhas[c.nome]))
  return { consulta: pergunta.consulta, parametros, descricao }
}
