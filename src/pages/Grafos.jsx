import { useEffect, useMemo, useRef, useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import ConsoleCypher from '../components/grafo/ConsoleCypher'
import ResultadoCypher from '../components/grafo/ResultadoCypher'
import GrafoCanvas from '../components/grafo/GrafoCanvas'
import GrafoPainel from '../components/grafo/GrafoPainel'
import GrafoPerfil from '../components/grafo/GrafoPerfil'
import { LegendaTipos, PaletaPopover } from '../components/grafo/GrafoOverlays'
import GrafoEstados from '../components/grafo/GrafoEstados'
import { PALETAS } from '../data/paletas'
import { executarCypher } from '../data/neo4j'
import { completarGrafo, extrairGrafo } from '../data/extrairGrafo'
import { estiloRelacao, visualDoNo } from '../data/estiloGrafo'
import { conexoesDoNo, expandirNo, retratoDoNo } from '../data/vizinhanca'
import { ANOS, NOS } from '../data/mockFuseki'

// Página "Grafos" — a tela que exibe o grafo de conhecimento. Protótipo:
// design/prototipo_grafo.html. Está em transição para o Neo4j (integração,
// ESTADO_ATUAL.md §4.5):
//  - N3: a barra de busca/filtros do protótipo saiu de cena (vai ser
//    redesenhada) e, com ela, o fluxo de filtros do mock (seleção pendente,
//    busca, ?serie= na URL, legenda que reconsultava, gaveta SPARQL). No lugar,
//    o CONSOLE CYPHER (ConsoleCypher) executa consultas no Neo4j via
//    executarCypher() e a resposta aparece no palco em Tabela/JSON
//    (ResultadoCypher). N4: a resposta vira "nós + relações" (extrairGrafo +
//    completarGrafo). N5: esse grafo vai para o CANVAS (montarGrafo, abaixo),
//    desenhado com a tabela de estilo (src/data/estiloGrafo.js). A 1.ª aba do
//    resultado, "Grafo", é o próprio desenho: o painel fica fechado (só a
//    barra) e abre/fecha com animação nas abas Tabela/Relações/JSON.
//  - N7: clicar num nó abre o PAINEL com o que o Neo4j sabe dele (rótulos,
//    todas as propriedades e as conexões consultadas no banco —
//    src/data/vizinhanca.js); o painel também mostra nós fora do desenho.
//  - N8: EXPANDIR (2×clique, botão do painel ou item "+ expandir") consulta os
//    vizinhos no Neo4j e os funde ao desenho, como o Browser; Desfazer volta.
//  - Do porte do protótipo continuam o canvas com física e interações
//    (G4–G6: seleção, Esc, +/−/recentrar), o painel de contexto (G7; sua
//    largura é descontada do palco), o desfazer com histórico de snapshots
//    (G8), paleta para daltonismo, modo formas, sem animação e a PERSISTÊNCIA
//    das preferências em localStorage['edugraphPrefs'] (G9–G10).
//  - Perfil mock no header (GrafoPerfil, G10) intocado: as contas vão sair do
//    site em roadmap próprio.

const PAINEL_PADRAO = { x: 12, w: 392, esc: false }

// Tempos e limites da interação (valores do protótipo — não alterar)
const ATRASO_POS_EXPANSAO = 250 // espera o layout abrir antes de ir ao nó recém-chegado
const ATRASO_ASSENTAR = 30 // a prop semAnim precisa chegar ao canvas antes do salto
const DEBOUNCE_PREFS_MS = 150 // o arrasto do painel muda o estado a cada pointermove
const VISTOS_MAX = 5 // chips "Vistos por último" no painel
const HISTORICO_EXPANSAO_MAX = 10 // snapshots do Desfazer
const DISTANCIA_NASCIMENTO = 90 // px da origem em que nascem os nós trazidos por uma expansão

// Lê localStorage['edugraphPrefs'] com validação campo a campo (prefs
// corrompidas viram padrão). Roda uma vez, na carga do módulo (só browser).
function lerPrefs() {
  const padrao = { paleta: 'padrao', formas: false, semAnim: false, turmas: [], painel: PAINEL_PADRAO }
  try {
    const p = JSON.parse(localStorage.getItem('edugraphPrefs') || '{}')
    return {
      paleta: p.paleta === 'padrao' || PALETAS[p.paleta] ? p.paleta : 'padrao',
      formas: typeof p.formas === 'boolean' ? p.formas : false,
      semAnim: typeof p.semAnim === 'boolean' ? p.semAnim : false,
      turmas: Array.isArray(p.turmas) ? p.turmas.filter((t) => t && t.ano && t.disciplina) : [],
      painel: p.painel && typeof p.painel === 'object' ? { ...PAINEL_PADRAO, ...p.painel } : PAINEL_PADRAO,
    }
  } catch {
    return padrao
  }
}
const PREFS = lerPrefs()

// Monta o grafo do CANVAS a partir do grafo do resultado (N4/N5) — porte do
// montarGrafo da G3: posição inicial em espiral de ângulo áureo (2.399963 rad
// entre nós consecutivos), à distância do anel do rótulo (tabela de estilo: o
// Ano no meio, as habilidades por fora) mais uma variação de 0–96px, com
// ±15px de ruído; e o nó que já estava na tela MANTÉM a posição (repetir a
// consulta ou alternar "conectar nós" não faz o grafo pular). Cor, raio,
// forma, fonte, legenda e tooltip saem prontos de visualDoNo(); a aresta
// guarda o tipo da relação (mola e tracejado vêm dele no canvas).
function montarGrafo({ nos, relacoes }, antigos) {
  const novos = new Map()
  let idx = 0
  nos.forEach((no) => {
    const velho = antigos.get(no.id)
    const angulo = idx++ * 2.399963
    const dist = visualDoNo(no).anel + (idx % 5) * 24
    novos.set(
      no.id,
      velho
        ? noDoCanvas(no, velho.x, velho.y)
        : noDoCanvas(no, Math.cos(angulo) * dist + (Math.random() - 0.5) * 30, Math.sin(angulo) * dist + (Math.random() - 0.5) * 30),
    )
  })
  return { nos: novos, arestas: [...relacoes.values()].map(arestaDoCanvas) }
}

// nó e aresta do Neo4j no formato do canvas (contrato do §4.5): identidade,
// dados e o visual da tabela de estilo; posição inicial dada por quem cria
function noDoCanvas(no, x, y) {
  return { id: no.id, rotulos: no.rotulos, props: no.props, ...visualDoNo(no), x, y, vx: 0, vy: 0 }
}
const arestaDoCanvas = (r) => ({ id: r.id, a: r.inicio, b: r.fim, rel: r.rel, props: r.props })

function Grafos({ onHome, onSignup, onGrafos, consultaInicial }) {
  const [status, setStatus] = useState('inicio') // inicio | carregando | pronto | erro
  const [resultado, setResultado] = useState(null) // última resposta do console Cypher (N3) + `grafo` (N4)
  const [erro, setErro] = useState(null) // falha da última consulta: { origem, codigo, mensagem }
  const [conectarNos, setConectarNos] = useState(true) // "Conectar nós do resultado", ligado como no Browser (N4)
  const [abaResultado, setAbaResultado] = useState('tabela') // última aba de conteúdo: tabela | relacoes | json
  const [resultadoAberto, setResultadoAberto] = useState(false) // fechado = aba "Grafo" (o desenho); sobrevive às execuções
  const [ocultos, setOcultos] = useState(() => new Set()) // rótulos ocultos no desenho pela legenda (N6; só na sessão)
  const [grafo, setGrafo] = useState({ nos: new Map(), arestas: [], versao: 0 })
  const [tempoMs, setTempoMs] = useState(0)
  const [selecionadoId, setSelecionadoId] = useState(null) // nó do painel (o canvas só marca se estiver visível)
  const [detalhe, setDetalhe] = useState(null) // { no, carregando, grupos, total, mais, erro } do painel (N7)
  const [vistos, setVistos] = useState([]) // retratos dos últimos 5 nós selecionados (chips do painel)
  const [painel, setPainel] = useState(PREFS.painel) // posição/largura persistem (G10)
  const [expandindo, setExpandindo] = useState(false) // consulta de expansão em voo (G8)
  const [erroExpansao, setErroExpansao] = useState(null) // falha da última expansão (aparece no painel, N8)
  const [desfaziveis, setDesfaziveis] = useState(0) // tamanho do histórico de expansões
  const [paleta, setPaleta] = useState(PREFS.paleta) // paleta de cores dos nós (G9/G10)
  const [paletaAberta, setPaletaAberta] = useState(false)
  const [formas, setFormas] = useState(PREFS.formas) // formas em vez de cores (G10)
  const [semAnim, setSemAnim] = useState(PREFS.semAnim) // desativar animações e física (G10)
  const [turmas, setTurmas] = useState(PREFS.turmas) // turmas do perfil mock (G10)
  const [perfilAberto, setPerfilAberto] = useState(false)
  const seq = useRef(0) // descarta respostas fora de ordem
  const nosRef = useRef(new Map()) // nós do grafo ATUAL (estabilidade de posição + closures assíncronas)
  const histExp = useRef([]) // snapshots pré-expansão (G8; volta a encher com a expansão da N8)
  const selRef = useRef(null) // espelho de selecionadoId para closures assíncronas
  const canvasApi = useRef(null) // API do canvas: { centrarEm, enquadrar, reaquecer, assentar, zoomMais, zoomMenos }
  const ultimaConsulta = useRef('') // texto da última execução do console (o "Tentar novamente" do erro)

  // Seleciona um nó (N7): registra nos "vistos", abre o painel com o retrato do
  // nó (rótulos e TODAS as propriedades, como o inspetor do Neo4j Browser) e
  // consulta as conexões dele no Neo4j. O nó pode estar no desenho ou fora dele
  // (vindo de uma conexão ou dos vistos): o canvas só recebe a seleção se o nó
  // estiver visível — senão esmaeceria o grafo inteiro em volta de um nó que
  // não está lá. Canal 'painel': clicar em outro nó cancela a consulta anterior.
  async function selecionar(no) {
    const retrato = retratoDoNo(no)
    selRef.current = no.id
    setSelecionadoId(no.id)
    setErroExpansao(null) // o erro de expansão era do nó anterior
    setVistos((v) => [retrato, ...v.filter((x) => x.id !== no.id)].slice(0, VISTOS_MAX))
    setDetalhe({ no: retrato, carregando: true, grupos: [], total: 0, mais: false, erro: null })
    try {
      const conexoes = await conexoesDoNo(no.id, { canal: 'painel' })
      if (selRef.current !== no.id) return // a seleção mudou enquanto consultava
      setDetalhe((d) => (d && d.no.id === no.id ? { ...d, ...conexoes, carregando: false } : d))
    } catch (e) {
      if (e?.origem === 'cancelada' || selRef.current !== no.id) return
      setDetalhe((d) => (d && d.no.id === no.id ? { ...d, carregando: false, erro: String(e?.message || e) } : d))
    }
  }

  function desselecionar() {
    selRef.current = null
    setSelecionadoId(null)
    setDetalhe(null)
    setPaletaAberta(false) // clicar no vazio também fecha os popovers (protótipo)
  }

  // Expande um nó do desenho (N8), como o Neo4j Browser: SEMPRE consulta o
  // banco (expandirNo — os vizinhos, até 100, e, com a chave "Conectar nós"
  // ligada, as relações entre os que chegaram e os que já estavam na tela) e
  // funde ao grafo sem repetir. Nós novos nascem num círculo de 90px ao redor
  // da origem e a física os assenta (reaquecer 0.8, SEM re-enquadrar: `versao`
  // não muda). Antes de fundir, tira um snapshot para o Desfazer (até 10) —
  // fiel à G8. Falha aparece no painel, sem derrubar o palco.
  async function expandir(id, aposExpandir) {
    const origem = nosRef.current.get(id)
    if (!origem || expandindo) return
    const meuSeq = ++seq.current // consulta nova no console invalida a expansão em voo
    setExpandindo(true)
    setErroExpansao(null)
    try {
      const { nos, relacoes, consultas } = await expandirNo(id, new Set(nosRef.current.keys()), { conectar: conectarNos })
      if (meuSeq !== seq.current) return
      const foto = { nos: [...nosRef.current.values()].map((n) => ({ ...n })), arestas: grafo.arestas.map((a) => ({ ...a })) }
      const novosNos = new Map(nosRef.current)
      nos.forEach((no) => {
        const ang = Math.random() * Math.PI * 2
        novosNos.set(
          no.id,
          noDoCanvas(no, origem.x + Math.cos(ang) * DISTANCIA_NASCIMENTO, origem.y + Math.sin(ang) * DISTANCIA_NASCIMENTO),
        )
      })
      const jaTem = new Set(grafo.arestas.map((a) => a.id))
      const arestasNovas = [...relacoes.values()]
        .filter((r) => !jaTem.has(r.id) && novosNos.has(r.inicio) && novosNos.has(r.fim))
        .map(arestaDoCanvas)
      if (nos.size || arestasNovas.length) {
        histExp.current.push(foto)
        if (histExp.current.length > HISTORICO_EXPANSAO_MAX) histExp.current.shift()
        setDesfaziveis(histExp.current.length)
        nosRef.current = novosNos
        setGrafo((g) => ({ ...g, nos: novosNos, arestas: [...g.arestas, ...arestasNovas] }))
        canvasApi.current?.reaquecer(0.8)
      }
      setTempoMs(consultas.reduce((s, c) => s + c.ms, 0))
      setExpandindo(false)
      if (aposExpandir) setTimeout(aposExpandir, ATRASO_POS_EXPANSAO)
    } catch (e) {
      if (meuSeq !== seq.current) return
      setExpandindo(false)
      setErroExpansao(String(e?.message || e))
    }
  }

  // Desfaz a última expansão: restaura o snapshot (posições inclusas) e
  // reaquece de leve (0.5). A seleção só sobrevive se o nó ainda existe.
  function desfazerExpansao() {
    const foto = histExp.current.pop()
    if (!foto) return
    setDesfaziveis(histExp.current.length)
    const nos = new Map(foto.nos.map((n) => [n.id, { ...n }]))
    const arestas = foto.arestas.map((a) => ({ ...a }))
    nosRef.current = nos
    setGrafo((g) => ({ ...g, nos, arestas }))
    if (!(selRef.current && nos.has(selRef.current))) desselecionar()
    canvasApi.current?.reaquecer(0.5)
  }

  // Vai até um nó a partir do painel (conexões / vistos), como no protótipo:
  // no desenho → seleciona e centra; fora do desenho com o nó do painel no
  // grafo → EXPANDE esse nó (N8) e vai ao alvo se ele chegou (senão, abre o
  // detalhe); oculto pela legenda ou sem como expandir → abre o detalhe dele.
  function irPara(no) {
    const vaiAte = () => {
      const doDesenho = grafoVisivel.nos.get(no.id)
      selecionar(doDesenho || no)
      if (doDesenho) canvasApi.current?.centrarEm(no.id)
    }
    if (!grafo.nos.has(no.id) && selRef.current && nosRef.current.has(selRef.current)) {
      expandir(selRef.current, () => {
        // depois da expansão o grafo é outro: lê o nó pelo ref, não pelo
        // closure deste render
        const chegou = nosRef.current.get(no.id)
        selecionar(chegou || no)
        if (chegou && !ocultos.has(chegou.tipo)) canvasApi.current?.centrarEm(no.id)
      })
    } else {
      vaiAte()
    }
  }

  // Console Cypher (N3): executa a consulta no Neo4j e mostra a resposta no
  // palco (Tabela/JSON). Canal 'console': uma execução nova cancela a anterior
  // ainda em voo — o cancelamento chega como origem 'cancelada' e é ignorado.
  // N4: a resposta vira "nós + relações" (extrairGrafo) e é completada com as
  // consultas extras do Browser (completarGrafo: pontas que faltam, limite de
  // nós e, se a chave estiver ligada, as relações entre os nós do resultado);
  // o grafo aparece em texto na aba "Relações" e desenhado no canvas (N5).
  // `conectar` vem por parâmetro porque a chave refaz a consulta logo depois de
  // mudar o estado (o valor novo ainda não chegou a este closure).
  async function executarConsulta(consulta, conectar = conectarNos) {
    const meuSeq = ++seq.current // as consultas extras rodam fora do canal: a guarda descarta resposta velha
    ultimaConsulta.current = consulta
    setStatus('carregando')
    setErro(null)
    try {
      const r = await executarCypher(consulta, {}, { canal: 'console' })
      const grafoDoResultado = await completarGrafo(extrairGrafo(r.linhas), { conectar })
      if (meuSeq !== seq.current) return
      // N5: o grafo do resultado vai para o canvas (versao nova → reaquece a
      // física e enquadra a 420ms); resultado novo zera o histórico de
      // expansões, como o recorte novo da G8
      const montado = montarGrafo(grafoDoResultado, nosRef.current)
      nosRef.current = montado.nos
      histExp.current = []
      setDesfaziveis(0)
      setExpandindo(false)
      if (!(selRef.current && montado.nos.has(selRef.current))) desselecionar()
      setGrafo((g) => ({ ...montado, versao: g.versao + 1 }))
      setResultado({ ...r, grafo: grafoDoResultado })
      if (montado.nos.size === 0) setResultadoAberto(true) // sem nada para desenhar, a aba "Grafo" não serve: abre
      setTempoMs(r.tempos.totalMs)
      setStatus('pronto')
    } catch (e) {
      if (meuSeq !== seq.current || e?.origem === 'cancelada') return
      setResultado(null)
      setErro({ origem: e?.origem, codigo: e?.codigo, mensagem: String(e?.message || e) })
      setStatus('erro')
    }
  }

  // Chave "Conectar nós do resultado" (N4): com um resultado na tela, refaz a
  // última consulta já com a opção nova — os números mudam na hora.
  function alternarConectar() {
    const novo = !conectarNos
    setConectarNos(novo)
    if (status === 'pronto' && ultimaConsulta.current) executarConsulta(ultimaConsulta.current, novo)
  }

  // "Voltar ao início" (card de erro): limpa o palco — resultado e desenho
  function voltarAoInicio() {
    setOcultos(new Set())
    nosRef.current = new Map()
    histExp.current = []
    setDesfaziveis(0)
    desselecionar()
    setGrafo((g) => ({ nos: new Map(), arestas: [], versao: g.versao + 1 }))
    setResultado(null)
    setErro(null)
    setStatus('inicio')
  }

  // N9: aberta pelo "Ver o grafo desta turma" da Home, a página já executa a
  // consulta da turma (que também aparece escrita no console)
  useEffect(() => {
    if (consultaInicial) executarConsulta(consultaInicial)
    // roda uma única vez, no mount — executarConsulta muda a cada render por design
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Esc limpa a seleção do grafo e fecha os popovers, como no protótipo
  useEffect(() => {
    const aoTecla = (ev) => {
      if (ev.key !== 'Escape') return
      selRef.current = null
      setSelecionadoId(null)
      setDetalhe(null)
      setPaletaAberta(false)
      setPerfilAberto(false)
    }
    window.addEventListener('keydown', aoTecla)
    return () => window.removeEventListener('keydown', aoTecla)
  }, [])

  // Persistência das preferências (G10). Debounce de 150ms: o arrasto do
  // painel muda o estado a cada pointermove e não vale um write por frame.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem('edugraphPrefs', JSON.stringify({ paleta, formas, semAnim, turmas, painel }))
      } catch {
        /* sem storage */
      }
    }, DEBOUNCE_PREFS_MS)
    return () => clearTimeout(t)
  }, [paleta, formas, semAnim, turmas, painel])

  // modo "formas em vez de cores": o atributo no <html> troca a forma dos
  // pontinhos DOM (classes .eg-forma-* no index.css); o canvas recebe via prop
  useEffect(() => {
    const el = document.documentElement
    if (formas) el.setAttribute('data-formas', '1')
    else el.removeAttribute('data-formas')
    return () => el.removeAttribute('data-formas')
  }, [formas])

  // popover de paleta aberto: avisa pelo <html> para o FontSizeWidget (global,
  // renderizado no App) deslizar para baixo e não ser coberto pelo popover
  useEffect(() => {
    const el = document.documentElement
    if (paletaAberta) el.setAttribute('data-paleta-aberta', '1')
    else el.removeAttribute('data-paleta-aberta')
    return () => el.removeAttribute('data-paleta-aberta')
  }, [paletaAberta])

  // paleta para daltonismo: sobrescreve no <html> os tokens --no-* de cada
  // rótulo (vale para o canvas e todos os pontinhos DOM de uma vez); a limpeza
  // remove exatamente os que a paleta escreveu, e 'padrao' não escreve nenhum
  useEffect(() => {
    const raiz = document.documentElement.style
    const cores = PALETAS[paleta] || {}
    Object.entries(cores).forEach(([token, cor]) => raiz.setProperty(token, cor))
    return () => Object.keys(cores).forEach((token) => raiz.removeProperty(token))
  }, [paleta])

  // ---- turmas do perfil mock (G10) ----
  const rotuloTurma = (t) =>
    `${(ANOS.find((a) => a.id === t.ano) || {}).label || t.ano} · ${NOS.get(t.disciplina)?.label || t.disciplina}`
  const turmasUI = turmas.map((t, i) => ({ ...t, label: rotuloTurma(t), indice: i }))
  const aoAddTurma = (ano, disciplina) =>
    setTurmas((ts) =>
      ts.some((t) => t.ano === ano && t.disciplina === disciplina) ? ts : [...ts, { ano, disciplina }],
    )
  const aoRemoverTurma = (i) => setTurmas((ts) => ts.filter((_, j) => j !== i))
  // "Filtrar" de uma turma: o fluxo de filtros do mock saiu na N3 e os filtros
  // novos ainda não existem — por ora só fecha o perfil. O GrafoPerfil fica
  // intocado (as contas vão sair do site; ESTADO_ATUAL.md §4.5).
  const aoFiltrarTurma = () => setPerfilAberto(false)

  // ---- toggles de acessibilidade (G10) ----
  const aoToggleFormas = () => setFormas((f) => !f)
  const aoToggleSemAnim = () => {
    const novo = !semAnim
    setSemAnim(novo)
    // ligar com um grafo em cena: assenta o layout de uma vez (protótipo);
    // 30ms dão tempo de a prop nova chegar ao canvas antes do salto
    if (novo && grafo.nos.size) setTimeout(() => canvasApi.current?.assentar(200), ATRASO_ASSENTAR)
  }
  // props compartilhadas entre o popover de paleta e o perfil
  const acessibilidade = {
    paleta,
    aoEscolherPaleta: setPaleta,
    formas,
    aoToggleFormas,
    semAnim,
    aoToggleSemAnim,
  }

  // resumo do grafo em cena (pill topo-centro; só aparece com nós no canvas)
  // ---- legenda "Tipos de nó" e grafo visível (N6) ----
  // O canvas recebe o grafo SEM os nós dos rótulos ocultos (e sem as relações
  // que tocam neles): são os MESMOS objetos de nó — a física segue mutando as
  // posições deles, e quem volta a aparecer volta ao mesmo lugar. Nada é
  // reconsultado. useMemo mantém a identidade enquanto nada muda (o canvas pede
  // um quadro a cada Map novo).
  const grafoVisivel = useMemo(() => {
    if (!ocultos.size) return grafo
    const nos = new Map([...grafo.nos].filter(([, n]) => !ocultos.has(n.tipo)))
    return { ...grafo, nos, arestas: grafo.arestas.filter((a) => nos.has(a.a) && nos.has(a.b)) }
  }, [grafo, ocultos])

  // rótulos presentes no grafo (inclusive os ocultos, para poder reexibi-los),
  // na ordem em que aparecem, com a cor e a forma da tabela de estilo
  const rotulosLegenda = useMemo(() => {
    const porTipo = new Map()
    grafo.nos.forEach((n) => {
      const r = porTipo.get(n.tipo)
      if (r) r.quantidade++
      else porTipo.set(n.tipo, { tipo: n.tipo, cor: n.cor, forma: n.forma, quantidade: 1 })
    })
    return [...porTipo.values()].map((r) => ({ ...r, oculto: ocultos.has(r.tipo) }))
  }, [grafo, ocultos])

  // tipos de relação na tela que a tabela de estilo desenha tracejados (chave da legenda)
  const tiposTracejados = useMemo(
    () => [...new Set(grafoVisivel.arestas.map((a) => a.rel))].filter((rel) => estiloRelacao(rel).tracejado),
    [grafoVisivel],
  )

  // ocultar/mostrar um rótulo pela legenda. Se o nó do painel for desse
  // rótulo, o painel continua aberto e só o anel some (a seleção que o canvas
  // recebe é filtrada pelo que está visível — ver selecionadoNoDesenho)
  function alternarOculto(tipo) {
    setOcultos((o) => {
      const novo = new Set(o)
      if (novo.has(tipo)) novo.delete(tipo)
      else novo.add(tipo)
      return novo
    })
  }

  // estado de um nó para o painel: no desenho, oculto pela legenda ou fora do desenho
  const estadoNo = (id) => (grafoVisivel.nos.has(id) ? 'visivel' : grafo.nos.has(id) ? 'oculto' : 'fora')
  // seleção que o canvas recebe: só se o nó estiver visível (um id que não está
  // no desenho faria o canvas esmaecer todo o resto em volta de nada)
  const selecionadoNoDesenho = selecionadoId && grafoVisivel.nos.has(selecionadoId) ? selecionadoId : null

  const temGrafo = grafo.nos.size > 0 // sem nós, zoom/paleta/legenda/resumo ficam ocultos
  const nOcultos = grafo.nos.size - grafoVisivel.nos.size
  const resumoRecorte =
    `${grafoVisivel.nos.size} nós · ${grafoVisivel.arestas.length} relações · ${tempoMs} ms` +
    (nOcultos ? ` · ${nOcultos} ocultos` : '')
  // a barra do resultado (Tabela/Relações/JSON) ocupa o topo do palco: zoom,
  // resumo e "Desfazer" descem para baixo dela (barra: top 12 + ~42px de altura)
  const topoOverlays = status === 'pronto' && resultado ? 66 : 14
  const offsetPainel = painel.esc ? 0 : painel.x + painel.w // largura ocupada pelo painel no palco

  return (
    <>
      {/* quadro de exatamente 1 viewport: header + console + área de trabalho;
          o footer fica abaixo da dobra e aparece ao rolar, como no protótipo */}
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        {/* ============ HEADER (compartilhado com a Home) ============ */}
        <SiteHeader paginaAtiva="grafos" onHome={onHome} onGrafos={onGrafos}>
          {/* perfil mock (G10) — substitui o Entrar/Criar conta do protótipo */}
          <GrafoPerfil
            aberto={perfilAberto}
            aoAlternar={() => setPerfilAberto((a) => !a)}
            aoFechar={() => setPerfilAberto(false)}
            turmas={turmasUI}
            aoAddTurma={aoAddTurma}
            aoRemoverTurma={aoRemoverTurma}
            aoFiltrarTurma={aoFiltrarTurma}
            {...acessibilidade}
          />
        </SiteHeader>

        {/* ============ CONSOLE CYPHER (N3; no lugar da barra de filtros) ============ */}
        <ConsoleCypher
          status={status}
          resultado={resultado}
          erro={erro}
          aoExecutar={executarConsulta}
          conectar={conectarNos}
          aoAlternarConectar={alternarConectar}
          consultaInicial={consultaInicial}
        />

        {/* ============ ÁREA DE TRABALHO: canvas + overlays de estado ============ */}
        <main style={{ flex: 1, position: 'relative', background: 'var(--grafo-bg)', overflow: 'hidden', minHeight: 0 }}>
          <GrafoCanvas
            ref={canvasApi}
            nos={grafoVisivel.nos}
            arestas={grafoVisivel.arestas}
            versao={grafo.versao}
            selecionadoId={selecionadoNoDesenho}
            onSelecionar={(id) => {
              const no = id ? grafoVisivel.nos.get(id) : null
              if (no) selecionar(no)
              else desselecionar()
            }}
            onExpandir={(id) => expandir(id)}
            offsetEsquerda={offsetPainel}
            semAnim={semAnim}
            formas={formas}
          />

          {/* controles de zoom + recentrar (topo-direita, sobre o canvas) */}
          {status === 'pronto' && temGrafo && (
            <div
              style={{
                position: 'absolute',
                top: topoOverlays,
                right: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                alignItems: 'flex-end',
              }}
            >
              <button
                type="button"
                className="eg-grafo-zoom"
                title="Aproximar"
                onClick={() => canvasApi.current?.zoomMais()}
                style={{ fontSize: 17, fontWeight: 600 }}
              >
                +
              </button>
              <button
                type="button"
                className="eg-grafo-zoom"
                title="Afastar"
                onClick={() => canvasApi.current?.zoomMenos()}
                style={{ fontSize: 19 }}
              >
                −
              </button>
              <button
                type="button"
                className="eg-grafo-zoom"
                title="Recentrar o grafo"
                onClick={() => canvasApi.current?.enquadrar()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9V5a2 2 0 0 1 2-2h4" />
                  <path d="M15 3h4a2 2 0 0 1 2 2v4" />
                  <path d="M21 15v4a2 2 0 0 1-2 2h-4" />
                  <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
                  <circle cx="12" cy="12" r="2.4" />
                </svg>
              </button>
              <PaletaPopover
                aberta={paletaAberta}
                aoAlternar={() => setPaletaAberta((a) => !a)}
                {...acessibilidade}
              />
            </div>
          )}

          {/* legenda "Tipos de nó" (N6): os rótulos do grafo da tela; ocultar é
              só no desenho. A gaveta SPARQL (G9) volta como gaveta Cypher na N10 */}
          {status === 'pronto' && temGrafo ? (
            <LegendaTipos rotulos={rotulosLegenda} tiposTracejados={tiposTracejados} aoAlternar={alternarOculto} />
          ) : null}

          {/* desfazer expansão (pill abaixo do resumo, G8) */}
          {status === 'pronto' && desfaziveis > 0 && (
            <button
              type="button"
              className="eg-grafo-desfazer"
              title="Desfazer a última expansão (volta um passo)"
              onClick={desfazerExpansao}
              style={{
                position: 'absolute',
                top: topoOverlays + 38,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'color-mix(in srgb, var(--pill-bg) 90%, transparent)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid var(--pill-border)',
                borderRadius: 999,
                padding: '7px 14px',
                boxShadow: '0 6px 18px rgba(28,38,32,.08)',
                cursor: 'pointer',
                font: "600 12.5px/1 'Figtree', sans-serif",
                color: 'var(--body)',
                animation: 'egSurgir .16s ease',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
              </svg>
              <span>Desfazer expansão</span>
              <span style={{ font: "10px/1 'JetBrains Mono', monospace", color: 'var(--faint)' }}>
                ×{desfaziveis}
              </span>
            </button>
          )}

          {/* resumo do grafo (pill topo-centro) */}
          {status === 'pronto' && temGrafo && (
            <div
              style={{
                position: 'absolute',
                top: topoOverlays,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                background: 'color-mix(in srgb, var(--pill-bg) 85%, transparent)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid var(--pill-border)',
                borderRadius: 999,
                padding: '7px 14px',
                boxShadow: '0 6px 18px rgba(28,38,32,.08)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
              <span style={{ font: "11px/1 'JetBrains Mono', monospace", letterSpacing: '0.05em', color: 'var(--body)' }}>
                {resumoRecorte}
              </span>
            </div>
          )}

          {/* resposta do console Cypher (N3): Tabela/JSON à direita do painel */}
          {status === 'pronto' && resultado ? (
            <ResultadoCypher
              resultado={resultado}
              offsetEsquerda={offsetPainel}
              aba={abaResultado}
              aberto={resultadoAberto}
              aoAbrirAba={(id) => {
                setAbaResultado(id)
                setResultadoAberto(true)
              }}
              aoFechar={() => setResultadoAberto(false)}
              semAnim={semAnim}
            />
          ) : null}

          {/* overlays de estado do palco (início/carregando/erro — R7b) */}
          <GrafoEstados
            status={status}
            erro={erro}
            aoTentarNovamente={() => executarConsulta(ultimaConsulta.current)}
            aoLimpar={voltarAoInicio}
          />

          {/* painel de contexto (G7) — zIndex 30: acima do card-convite,
              abaixo dos overlays de carregando/erro (32) */}
          <GrafoPainel
            painel={painel}
            aoMudarPainel={(patch) => setPainel((p) => ({ ...p, ...patch }))}
            detalhe={detalhe}
            estadoNo={estadoNo}
            vistos={vistos}
            aoIr={irPara}
            aoFechar={desselecionar}
            // expandir só faz sentido com o nó do painel no grafo (um nó aberto
            // a partir de uma conexão, fora do desenho, não tem de onde crescer)
            aoExpandir={detalhe && grafo.nos.has(detalhe.no.id) ? () => expandir(detalhe.no.id) : undefined}
            expandindo={expandindo}
            erroExpansao={erroExpansao}
          />
        </main>
      </div>

      {/* footer abaixo da dobra (aparece ao rolar) */}
      <Footer onSignup={onSignup} onGrafos={onGrafos} />
    </>
  )
}

export default Grafos
