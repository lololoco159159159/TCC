import { useEffect, useRef, useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import GrafoFiltros from '../components/grafo/GrafoFiltros'
import GrafoCanvas from '../components/grafo/GrafoCanvas'
import GrafoPainel from '../components/grafo/GrafoPainel'
import GrafoPerfil from '../components/grafo/GrafoPerfil'
import { GavetaSparql, LegendaTipos, PaletaPopover } from '../components/grafo/GrafoOverlays'
import GrafoEstados from '../components/grafo/GrafoEstados'
import { PALETAS } from '../data/paletas'
import {
  ANOS,
  NOS,
  LISTA_HABILIDADES,
  buscar,
  conexoesDe,
  construirConsultaDetalhe,
  construirConsultaExpansao,
  construirConsultaGrafo,
  consultarFuseki,
  setConfig,
} from '../data/mockFuseki'

// Página "Grafos" — a tela que exibe o grafo de conhecimento (BNCC ×
// Pensamento Computacional). Protótipo: design/prototipo_grafo.html.
// Etapas G3–G6 do roadmap (ESTADO_ATUAL.md §4.1): barra de busca/filtros com
// SELEÇÃO PENDENTE (só aplica no Filtrar), máquina de estados
// início/carregando/pronto/vazio/erro, sincronização com a URL
// (?serie=&disciplina=&conceito=), o canvas do recorte — espiral áurea como
// semente + FÍSICA (repulsão/anti-colisão/molas) assentando o layout — e as
// interações (G6): seleção de nó (estado aqui; anel/esmaecer no canvas), Esc
// limpa, botões +/−/recentrar sobre o canvas e busca de habilidade que
// seleciona/centra o nó. G7: selecionar dispara consultarFuseki('detalhe') +
// conexoesDe() e alimenta o GrafoPainel (vidro flutuante, arrastável); a
// largura ocupada pelo painel é descontada do palco (offsetEsquerda do canvas).
// G8: expandir (2×clique, botão do painel ou item "fora do recorte") →
// consultarFuseki('expansao') funde os vizinhos ao grafo SEM re-enquadrar
// (versao não muda; só reaquece a física), com histórico de snapshots
// (máx. 10) e o botão "Desfazer expansão" no topo do palco.
// G9: overlays finais — legenda "Tipos de nó" (toggle por tipo reconsulta com
// o filtro `tipos` na consulta), gaveta SPARQL (última consulta gerada + ms +
// simular falha 503 via setConfig) e popover de paleta (daltonismo — escreve
// os tokens --no-* no <html>; o canvas detecta o override e relê as cores).
// G10: perfil mock no header (GrafoPerfil — identidade, turmas, acessibilidade),
// filtro "Turmas" na barra, modo formas (data-formas no <html> + prop do
// canvas), modo sem animação (prop semAnim + assentar) e PERSISTÊNCIA das
// preferências em localStorage['edugraphPrefs'] (paleta, formas, semAnim,
// turmas e posição/largura do painel — lidas com validação no mount).

const TIPOS_TODOS = { habilidade: true, conceito: true, disciplina: true }
const FILTROS_VAZIOS = { ano: '', disciplina: '', conceito: '', tipos: TIPOS_TODOS }
const PAINEL_PADRAO = { x: 12, w: 392, esc: false }

// Tempos e limites da interação (valores do protótipo — não alterar)
const ATRASO_SELECAO_BUSCA = 770 // 420ms do enquadrar + 350ms até selecionar/centrar
const ATRASO_POS_EXPANSAO = 250 // espera o layout abrir antes de ir ao nó recém-chegado
const ATRASO_ASSENTAR = 30 // a prop semAnim precisa chegar ao canvas antes do salto
const DEBOUNCE_PREFS_MS = 150 // o arrasto do painel muda o estado a cada pointermove
const VISTOS_MAX = 5 // chips "Vistos por último" no painel
const HISTORICO_EXPANSAO_MAX = 10 // snapshots do Desfazer

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

// mapa reverso uri -> id para ler os bindings sparql-results+json do endpoint
const URI_PARA_ID = new Map([...NOS.values()].map((n) => [n.uri, n.id]))

// Monta o grafo em memória a partir do sparql-results+json (fiel ao protótipo):
// posições iniciais em espiral de ângulo áureo, raio por tipo (habilidade
// 70+, conceito 230, disciplina 330; visual 11/14/17); nós que já existiam no
// recorte anterior mantêm a posição (estabilidade entre filtros).
function montarGrafo(json, antigos) {
  const novos = new Map()
  const arestas = []
  const vistas = new Set()
  let idx = 0
  const garantir = (id) => {
    if (novos.has(id)) return novos.get(id)
    const base = NOS.get(id)
    const velho = antigos.get(id)
    const raio = base.tipo === 'disciplina' ? 17 : base.tipo === 'conceito' ? 14 : 11
    const angulo = idx++ * 2.399963
    const dist = base.tipo === 'habilidade' ? 70 + (idx % 5) * 38 : base.tipo === 'conceito' ? 230 : 330
    const no = {
      id,
      tipo: base.tipo,
      label: base.label,
      resumo: base.resumo || '',
      ano: base.ano || '',
      x: velho ? velho.x : Math.cos(angulo) * dist + (Math.random() - 0.5) * 30,
      y: velho ? velho.y : Math.sin(angulo) * dist + (Math.random() - 0.5) * 30,
      vx: 0,
      vy: 0,
      r: raio,
    }
    novos.set(id, no)
    return no
  }
  json.results.bindings.forEach((b) => {
    const a = URI_PARA_ID.get(b.origem.value)
    const c = URI_PARA_ID.get(b.destino.value)
    if (!a || !c) return
    garantir(a)
    garantir(c)
    const rel = b.relacao.value.replace('edu:', '')
    const chave = `${a}|${rel}|${c}`
    if (vistas.has(chave)) return
    vistas.add(chave)
    arestas.push({ a, b: c, rel })
  })
  ;(json.nosIsolados || []).forEach((id) => garantir(id))
  return { nos: novos, arestas }
}

// Prévia de vértices do recorte pendente (habilidades filtradas + conceitos e
// matérias conectados a elas) — antecipação do que o Filtrar vai retornar.
function contarVertices(p) {
  if (!p.ano && !p.disciplina && !p.conceito) return 0
  const habs = LISTA_HABILIDADES.filter(
    (h) =>
      (!p.ano || h.ano === p.ano) &&
      (!p.disciplina || h.disc.includes(p.disciplina)) &&
      (!p.conceito || h.conceitos.includes(p.conceito)),
  )
  const concs = new Set()
  const discs = new Set()
  habs.forEach((h) => {
    h.conceitos.forEach((c) => concs.add(c))
    h.disc.forEach((d) => discs.add(d))
  })
  return habs.length + concs.size + discs.size
}

// Estado do filtro na URL (?serie=7&disciplina=matematica&conceito=algoritmos)
function sincronizarURL(f) {
  try {
    const u = new URL(location.href)
    ;['serie', 'ano', 'disciplina', 'materia', 'conceito'].forEach((k) => u.searchParams.delete(k))
    if (f.ano) u.searchParams.set('serie', f.ano)
    if (f.disciplina) u.searchParams.set('disciplina', f.disciplina)
    if (f.conceito) u.searchParams.set('conceito', f.conceito)
    history.replaceState(null, '', u.toString())
  } catch {
    /* ambientes sem history */
  }
}

function Grafos({ onHome, onSignup, onGrafos }) {
  const [status, setStatus] = useState('inicio') // inicio | carregando | pronto | vazio | erro
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS) // recorte aplicado
  const [pend, setPend] = useState(FILTROS_VAZIOS) // seleção pendente (aplica no Filtrar)
  const [busca, setBusca] = useState('')
  const [sugestoes, setSugestoes] = useState([])
  const [grafo, setGrafo] = useState({ nos: new Map(), arestas: [], versao: 0 })
  const [contagens, setContagens] = useState({ habilidade: 0, conceito: 0, disciplina: 0, conexoes: 0 })
  const [tempoMs, setTempoMs] = useState(0)
  const [msgErro, setMsgErro] = useState('')
  const [selecionadoId, setSelecionadoId] = useState(null) // nó selecionado (anel no canvas + painel)
  const [detalhe, setDetalhe] = useState(null) // { id, carregando, texto, grupos } do painel (G7)
  const [vistos, setVistos] = useState([]) // últimos 5 nós selecionados (chips do painel)
  const [painel, setPainel] = useState(PREFS.painel) // posição/largura persistem (G10)
  const [expandindo, setExpandindo] = useState(false) // consulta de expansão em voo (G8)
  const [desfaziveis, setDesfaziveis] = useState(0) // tamanho do histórico de expansões
  const [consulta, setConsulta] = useState('') // última consulta SPARQL gerada (gaveta, G9)
  const [simErro, setSimErro] = useState(false) // simular falha do endpoint (gaveta, G9)
  const [paleta, setPaleta] = useState(PREFS.paleta) // paleta de cores dos nós (G9/G10)
  const [paletaAberta, setPaletaAberta] = useState(false)
  const [formas, setFormas] = useState(PREFS.formas) // formas em vez de cores (G10)
  const [semAnim, setSemAnim] = useState(PREFS.semAnim) // desativar animações e física (G10)
  const [turmas, setTurmas] = useState(PREFS.turmas) // turmas do perfil mock (G10)
  const [perfilAberto, setPerfilAberto] = useState(false)
  const [turmasAberto, setTurmasAberto] = useState(false)
  const seq = useRef(0) // descarta respostas fora de ordem
  const nosRef = useRef(new Map()) // nós do grafo ATUAL (estabilidade de posição + closures assíncronas)
  const histExp = useRef([]) // snapshots pré-expansão (máx. 10, G8)
  const selRef = useRef(null) // espelho de selecionadoId para closures assíncronas
  const canvasApi = useRef(null) // API do canvas: { centrarEm, enquadrar, reaquecer, assentar, zoomMais, zoomMenos }
  const pendenteSel = useRef(null) // habilidade escolhida na busca, a selecionar quando o recorte chegar
  const tSel = useRef(0)

  // Seleciona um nó: registra nos "vistos", abre o painel com as conexões
  // (síncronas, do mock) e consulta o texto normativo/definição no endpoint —
  // com fallback local se a consulta falhar (fiel ao protótipo).
  function selecionar(id) {
    const base = NOS.get(id)
    if (!base) return
    selRef.current = id
    setSelecionadoId(id)
    setVistos((v) => [id, ...v.filter((x) => x !== id)].slice(0, VISTOS_MAX))
    setDetalhe({ id, carregando: true, texto: '', grupos: conexoesDe(id) })
    setConsulta(construirConsultaDetalhe(id))
    consultarFuseki('detalhe', { id })
      .then(({ json }) => {
        if (selRef.current !== id) return // seleção mudou enquanto consultava
        let texto = ''
        json.results.bindings.forEach((b) => {
          if (b.propriedade.value === 'edu:textoNormativo' || b.propriedade.value === 'edu:definicao')
            texto = b.valor.value
        })
        setDetalhe((d) => (d && d.id === id ? { ...d, carregando: false, texto } : d))
      })
      .catch(() => {
        if (selRef.current !== id) return
        setDetalhe((d) => (d && d.id === id ? { ...d, carregando: false, texto: base.texto || base.def || '' } : d))
      })
  }

  function desselecionar() {
    selRef.current = null
    setSelecionadoId(null)
    setDetalhe(null)
    setPaletaAberta(false) // clicar no vazio também fecha os popovers (protótipo)
    setTurmasAberto(false)
  }

  // Expande as conexões de um nó (G8): consultarFuseki('expansao') traz os
  // vizinhos de fora do recorte e os funde ao grafo — nós novos nascem num
  // círculo de 90px ao redor da origem e a física os assenta (reaquecer 0.8,
  // SEM re-enquadrar: `versao` não muda). Antes de fundir, tira um snapshot
  // para o Desfazer (histórico de até 10). Fiel ao protótipo.
  function expandir(id, aposExpandir) {
    if (!nosRef.current.has(id) || expandindo) return
    const meuSeq = ++seq.current
    setExpandindo(true)
    setConsulta(construirConsultaExpansao(id))
    consultarFuseki('expansao', { id })
      .then(({ json, ms }) => {
        if (meuSeq !== seq.current) return
        const foto = {
          nos: [...nosRef.current.values()].map((n) => ({ ...n })),
          arestas: grafo.arestas.map((a) => ({ ...a })),
        }
        const origem = nosRef.current.get(id)
        const novosNos = new Map(nosRef.current)
        const novasArestas = [...grafo.arestas]
        const vistas = new Set(novasArestas.map((ar) => `${ar.a}|${ar.rel}|${ar.b}`))
        let mudou = false
        json.results.bindings.forEach((b) => {
          const a = URI_PARA_ID.get(b.origem.value)
          const c = URI_PARA_ID.get(b.destino.value)
          if (!a || !c) return
          const rel = b.relacao.value.replace('edu:', '')
          ;[a, c].forEach((nid) => {
            if (novosNos.has(nid)) return
            const base = NOS.get(nid)
            const ang = Math.random() * Math.PI * 2
            novosNos.set(nid, {
              id: nid,
              tipo: base.tipo,
              label: base.label,
              resumo: base.resumo || '',
              ano: base.ano || '',
              x: origem.x + Math.cos(ang) * 90,
              y: origem.y + Math.sin(ang) * 90,
              vx: 0,
              vy: 0,
              r: base.tipo === 'disciplina' ? 17 : base.tipo === 'conceito' ? 14 : 11,
            })
            mudou = true
          })
          const chave = `${a}|${rel}|${c}`
          if (!vistas.has(chave)) {
            vistas.add(chave)
            novasArestas.push({ a, b: c, rel })
            mudou = true
          }
        })
        if (mudou) {
          histExp.current.push(foto)
          if (histExp.current.length > HISTORICO_EXPANSAO_MAX) histExp.current.shift()
          setDesfaziveis(histExp.current.length)
        }
        nosRef.current = novosNos
        const cont = { habilidade: 0, conceito: 0, disciplina: 0, conexoes: novasArestas.length }
        novosNos.forEach((n) => cont[n.tipo]++)
        setContagens(cont)
        setTempoMs(ms)
        setGrafo((g) => ({ ...g, nos: novosNos, arestas: novasArestas }))
        setStatus('pronto')
        setExpandindo(false)
        canvasApi.current?.reaquecer(0.8)
        if (aposExpandir) setTimeout(aposExpandir, ATRASO_POS_EXPANSAO)
      })
      .catch((err) => {
        if (meuSeq !== seq.current) return
        setExpandindo(false)
        setMsgErro(String(err.message || err))
        setStatus('erro')
      })
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
    const cont = { habilidade: 0, conceito: 0, disciplina: 0, conexoes: arestas.length }
    nos.forEach((n) => cont[n.tipo]++)
    setContagens(cont)
    setGrafo((g) => ({ ...g, nos, arestas }))
    if (!(selRef.current && nos.has(selRef.current))) desselecionar()
    canvasApi.current?.reaquecer(0.5)
  }

  // Vai até um nó a partir do painel (conexões / vistos), como no protótipo:
  // presente no grafo → seleciona e centra; fora do recorte com um nó
  // selecionado → expande o selecionado e então vai ao alvo se ele chegou;
  // fora e sem seleção → só seleciona (o painel mostra o detalhe).
  function irPara(id) {
    if (grafo.nos.has(id)) {
      selecionar(id)
      canvasApi.current?.centrarEm(id)
      return
    }
    if (selRef.current) {
      expandir(selRef.current, () => {
        if (nosRef.current.has(id)) {
          selecionar(id)
          canvasApi.current?.centrarEm(id)
        }
      })
    } else {
      selecionar(id)
    }
  }

  function aplicarFiltros(f) {
    clearTimeout(tSel.current) // recorte novo cancela uma seleção agendada pela busca
    histExp.current = [] // recorte novo invalida o histórico de expansões (protótipo)
    setDesfaziveis(0)
    setExpandindo(false)
    sincronizarURL(f)
    setPend({ ano: f.ano, disciplina: f.disciplina, conceito: f.conceito })
    setFiltros(f)
    const vazio = !f.ano && !f.disciplina && !f.conceito
    if (vazio) {
      nosRef.current = new Map()
      pendenteSel.current = null
      desselecionar()
      setGrafo((g) => ({ nos: new Map(), arestas: [], versao: g.versao + 1 }))
      setStatus('inicio')
      return
    }
    const params = { ...f, eixo: '', componentes: [], tipos: f.tipos || TIPOS_TODOS }
    const meuSeq = ++seq.current
    setStatus('carregando')
    setMsgErro('')
    setConsulta(construirConsultaGrafo(params))
    consultarFuseki('grafo', params)
      .then(({ json, ms }) => {
        if (meuSeq !== seq.current) return
        const montado = montarGrafo(json, nosRef.current)
        nosRef.current = montado.nos
        const cont = { habilidade: 0, conceito: 0, disciplina: 0, conexoes: montado.arestas.length }
        montado.nos.forEach((n) => cont[n.tipo]++)
        setContagens(cont)
        setTempoMs(ms)
        setGrafo((g) => ({ ...montado, versao: g.versao + 1 }))
        setStatus(montado.nos.size === 0 ? 'vazio' : 'pronto')
        // a seleção (e o painel) só sobrevive se o nó continua no recorte novo
        if (!(selRef.current && montado.nos.has(selRef.current))) desselecionar()
        // habilidade vinda da busca: seleciona e centra quando o layout assentar
        // (420ms do enquadrar + 350ms, os mesmos tempos do protótipo)
        const alvo = pendenteSel.current
        pendenteSel.current = null
        if (alvo && montado.nos.has(alvo)) {
          tSel.current = setTimeout(() => {
            selecionar(alvo)
            canvasApi.current?.centrarEm(alvo)
          }, ATRASO_SELECAO_BUSCA)
        }
      })
      .catch((err) => {
        if (meuSeq !== seq.current) return
        setMsgErro(String(err.message || err))
        setStatus('erro')
      })
  }

  // lê o recorte da URL uma única vez, ao montar (deep-link da G3/G11)
  useEffect(() => {
    const q = new URLSearchParams(location.search)
    const serie = q.get('serie') || q.get('ano') || ''
    const disciplina = q.get('disciplina') || q.get('materia') || ''
    const conceito = q.get('conceito') || ''
    const okS = ANOS.some((a) => a.id === serie) ? serie : ''
    const okD = disciplina && NOS.get(disciplina)?.tipo === 'disciplina' ? disciplina : ''
    const okC = conceito && NOS.get(conceito)?.tipo === 'conceito' ? conceito : ''
    if (okS || okD || okC) aplicarFiltros({ ano: okS, disciplina: okD, conceito: okC, tipos: TIPOS_TODOS })
    return () => clearTimeout(tSel.current)
    // roda uma única vez, no mount — aplicarFiltros muda a cada render por design
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Esc limpa a seleção do grafo (e fecha as sugestões da busca), como no protótipo
  useEffect(() => {
    const aoTecla = (ev) => {
      if (ev.key !== 'Escape') return
      selRef.current = null
      setSelecionadoId(null)
      setDetalhe(null)
      setSugestoes([])
      setPaletaAberta(false)
      setPerfilAberto(false)
      setTurmasAberto(false)
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
  // pontinhos DOM (classes .eg-no-* no index.css); o canvas recebe via prop
  useEffect(() => {
    const el = document.documentElement
    if (formas) el.setAttribute('data-formas', '1')
    else el.removeAttribute('data-formas')
    return () => el.removeAttribute('data-formas')
  }, [formas])

  // gaveta SPARQL: o checkbox liga o modo de falha do mock (próxima consulta → 503)
  useEffect(() => {
    setConfig({ erro: simErro })
    return () => setConfig({ erro: false }) // sair da página desliga a simulação
  }, [simErro])

  // popover de paleta aberto: avisa pelo <html> para o FontSizeWidget (global,
  // renderizado no App) deslizar para baixo e não ser coberto pelo popover
  useEffect(() => {
    const el = document.documentElement
    if (paletaAberta) el.setAttribute('data-paleta-aberta', '1')
    else el.removeAttribute('data-paleta-aberta')
    return () => el.removeAttribute('data-paleta-aberta')
  }, [paletaAberta])

  // paleta para daltonismo: sobrescreve os tokens --no-* no <html> (vale para
  // canvas, painel, legenda e filtros de uma vez); 'padrao' remove o override
  useEffect(() => {
    const raiz = document.documentElement.style
    const cores = PALETAS[paleta]
    const aplicar = (c) => {
      if (c) {
        raiz.setProperty('--no-habilidade', c.habilidade)
        raiz.setProperty('--no-conceito', c.conceito)
        raiz.setProperty('--no-disciplina', c.disciplina)
      } else {
        raiz.removeProperty('--no-habilidade')
        raiz.removeProperty('--no-conceito')
        raiz.removeProperty('--no-disciplina')
      }
    }
    aplicar(cores)
    return () => aplicar(null)
  }, [paleta])

  // ---- busca com autocomplete ----
  const aoBuscar = (termo) => {
    setBusca(termo)
    setSugestoes(termo ? buscar(termo) : [])
  }
  const aoEscolherSugestao = (s) => {
    setBusca('')
    setSugestoes([])
    if (s.tipo === 'disciplina') aplicarFiltros({ ...filtros, disciplina: s.id })
    else if (s.tipo === 'conceito') aplicarFiltros({ ...filtros, conceito: s.id })
    else if (grafo.nos.has(s.id)) {
      // habilidade já no recorte atual: seleciona e centra sem reconsultar
      selecionar(s.id)
      canvasApi.current?.centrarEm(s.id)
    } else {
      // habilidade fora do recorte: abre o recorte do ano dela (limpando os
      // demais filtros, como o protótipo) e seleciona quando o grafo assentar
      pendenteSel.current = s.id
      aplicarFiltros({ ano: s.ano, disciplina: '', conceito: '' })
    }
  }

  // ---- turmas do perfil mock (G10) ----
  const rotuloTurma = (t) =>
    `${(ANOS.find((a) => a.id === t.ano) || {}).label || t.ano} · ${NOS.get(t.disciplina)?.label || t.disciplina}`
  const turmasUI = turmas.map((t, i) => ({ ...t, label: rotuloTurma(t), indice: i }))
  const aoAddTurma = (ano, disciplina) =>
    setTurmas((ts) =>
      ts.some((t) => t.ano === ano && t.disciplina === disciplina) ? ts : [...ts, { ano, disciplina }],
    )
  const aoRemoverTurma = (i) => setTurmas((ts) => ts.filter((_, j) => j !== i))
  const aoFiltrarTurma = (t) => {
    setTurmasAberto(false)
    setPerfilAberto(false)
    aplicarFiltros({ ...filtros, ano: t.ano, disciplina: t.disciplina, conceito: '' })
  }

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

  // ---- derivados da barra ----
  const temPend = !!(pend.ano || pend.disciplina || pend.conceito)
  const pendDiff =
    pend.ano !== filtros.ano || pend.disciplina !== filtros.disciplina || pend.conceito !== filtros.conceito
  const filtrosAtivos = !!(filtros.ano || filtros.disciplina || filtros.conceito || temPend)
  const prevQtd = contarVertices(pend)

  // resumo do recorte aplicado (pill topo-centro quando pronto)
  const partes = []
  if (filtros.ano) partes.push((ANOS.find((a) => a.id === filtros.ano) || {}).label)
  if (filtros.disciplina) partes.push(NOS.get(filtros.disciplina)?.label)
  if (filtros.conceito) partes.push(NOS.get(filtros.conceito)?.label)
  const totalNos = contagens.habilidade + contagens.conceito + contagens.disciplina
  const resumoRecorte =
    (partes.length ? `${partes.join(' · ')}  —  ` : '') +
    `${totalNos} nós · ${contagens.conexoes} conexões · ${tempoMs} ms`

  return (
    <>
      {/* quadro de exatamente 1 viewport: header + filtros + área de trabalho;
          o footer fica abaixo da dobra e aparece ao rolar, como no protótipo */}
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        {/* ============ HEADER (compartilhado com a Home) ============ */}
        <SiteHeader paginaAtiva="grafos" onHome={onHome} onGrafos={onGrafos}>
          {/* perfil mock (G10) — substitui o Entrar/Criar conta do protótipo */}
          <GrafoPerfil
            aberto={perfilAberto}
            aoAlternar={() => {
              setPerfilAberto((a) => !a)
              setTurmasAberto(false)
            }}
            aoFechar={() => setPerfilAberto(false)}
            turmas={turmasUI}
            aoAddTurma={aoAddTurma}
            aoRemoverTurma={aoRemoverTurma}
            aoFiltrarTurma={aoFiltrarTurma}
            {...acessibilidade}
          />
        </SiteHeader>

        {/* ============ BARRA DE BUSCA E FILTROS (G3) ============ */}
        <GrafoFiltros
          pend={pend}
          aoMudarPend={setPend}
          filtros={filtros}
          status={status}
          busca={busca}
          sugestoes={sugestoes}
          aoBuscar={aoBuscar}
          aoFecharSugestoes={() => setSugestoes([])}
          aoEscolherSugestao={aoEscolherSugestao}
          prevQtd={prevQtd}
          temPend={temPend}
          pendDiff={pendDiff}
          filtrosAtivos={filtrosAtivos}
          aoFiltrar={() => aplicarFiltros({ ...filtros, ...pend })}
          aoLimpar={() => aplicarFiltros(FILTROS_VAZIOS)}
          turmas={turmasUI}
          turmasAberto={turmasAberto}
          aoToggleTurmas={() => {
            setTurmasAberto((a) => !a)
            setPerfilAberto(false)
          }}
          aoFiltrarTurma={aoFiltrarTurma}
          aoAbrirPerfil={() => {
            setTurmasAberto(false)
            setPerfilAberto(true)
          }}
        />

        {/* ============ ÁREA DE TRABALHO: canvas + overlays de estado ============ */}
        <main style={{ flex: 1, position: 'relative', background: 'var(--grafo-bg)', overflow: 'hidden', minHeight: 0 }}>
          <GrafoCanvas
            ref={canvasApi}
            nos={grafo.nos}
            arestas={grafo.arestas}
            versao={grafo.versao}
            selecionadoId={selecionadoId}
            onSelecionar={(id) => (id ? selecionar(id) : desselecionar())}
            onExpandir={expandir}
            offsetEsquerda={painel.esc ? 0 : painel.x + painel.w}
            semAnim={semAnim}
            formas={formas}
          />

          {/* controles de zoom + recentrar (topo-direita, sobre o canvas) */}
          {status === 'pronto' && (
            <div
              style={{
                position: 'absolute',
                top: 14,
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

          {/* legenda "Tipos de nó" + gaveta SPARQL (G9) — também no vazio,
              para reabilitar um tipo oculto / inspecionar a consulta */}
          {(status === 'pronto' || status === 'vazio') && (
            <>
              <LegendaTipos
                tipos={filtros.tipos || TIPOS_TODOS}
                contagens={contagens}
                aoAlternar={(t) =>
                  aplicarFiltros({
                    ...filtros,
                    tipos: { ...(filtros.tipos || TIPOS_TODOS), [t]: (filtros.tipos || TIPOS_TODOS)[t] === false },
                  })
                }
              />
              <GavetaSparql consulta={consulta} tempoMs={tempoMs} simErro={simErro} aoSimErro={setSimErro} />
            </>
          )}

          {/* desfazer expansão (pill abaixo do resumo, G8) */}
          {status === 'pronto' && desfaziveis > 0 && (
            <button
              type="button"
              className="eg-grafo-desfazer"
              title="Desfazer a última expansão (volta um passo)"
              onClick={desfazerExpansao}
              style={{
                position: 'absolute',
                top: 52,
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

          {/* resumo do recorte (pill topo-centro) */}
          {status === 'pronto' && (
            <div
              style={{
                position: 'absolute',
                top: 14,
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

          {/* overlays de estado do palco (início/carregando/erro/vazio — R7b) */}
          <GrafoEstados
            status={status}
            msgErro={msgErro}
            aoTentarNovamente={() => aplicarFiltros({ ...filtros })}
            aoLimpar={() => aplicarFiltros(FILTROS_VAZIOS)}
          />

          {/* painel de contexto (G7) — zIndex 30: acima do card-convite,
              abaixo dos overlays de carregando/erro/vazio (32) */}
          <GrafoPainel
            painel={painel}
            aoMudarPainel={(patch) => setPainel((p) => ({ ...p, ...patch }))}
            detalhe={detalhe}
            noGrafo={(id) => grafo.nos.has(id)}
            vistos={vistos}
            aoIr={irPara}
            aoFechar={desselecionar}
            aoExpandir={() => selecionadoId && expandir(selecionadoId)}
            expandindo={expandindo}
          />
        </main>
      </div>

      {/* footer abaixo da dobra (aparece ao rolar) */}
      <Footer onSignup={onSignup} onGrafos={onGrafos} />
    </>
  )
}

export default Grafos
