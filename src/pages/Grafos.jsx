import { useEffect, useRef, useState } from 'react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Footer from '../components/Footer'
import GrafoFiltros from '../components/GrafoFiltros'
import GrafoCanvas from '../components/GrafoCanvas'
import GrafoPainel from '../components/GrafoPainel'
import labotim from '../assets/labotim.png'
import ufes from '../assets/ufes.png'
import { ANOS, NOS, LISTA_HABILIDADES, buscar, conexoesDe, consultarFuseki } from '../data/mockFuseki'

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

const FILTROS_VAZIOS = { ano: '', disciplina: '', conceito: '' }
const TIPOS_TODOS = { habilidade: true, conceito: true, disciplina: true }

// mapa reverso uri -> id para ler os bindings sparql-results+json do endpoint
const URI_PARA_ID = new Map([...NOS.values()].map((n) => [n.uri, n.id]))

// pontos do skeleton de carregamento (verbatim do protótipo)
const SKELETON = [
  { l: 22, t: 30, d: 18, delay: 0 },
  { l: 30, t: 55, d: 14, delay: 0.15 },
  { l: 38, t: 22, d: 12, delay: 0.3 },
  { l: 45, t: 62, d: 22, delay: 0.1 },
  { l: 50, t: 38, d: 16, delay: 0.45 },
  { l: 57, t: 18, d: 12, delay: 0.25 },
  { l: 60, t: 70, d: 14, delay: 0.5 },
  { l: 66, t: 44, d: 20, delay: 0.05 },
  { l: 72, t: 26, d: 12, delay: 0.38 },
  { l: 76, t: 60, d: 16, delay: 0.2 },
  { l: 35, t: 75, d: 12, delay: 0.55 },
  { l: 84, t: 40, d: 14, delay: 0.32 },
  { l: 18, t: 60, d: 12, delay: 0.42 },
  { l: 88, t: 66, d: 10, delay: 0.12 },
]

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

function Grafos({ onHome, onLogin, onSignup, onGrafos }) {
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
  const [painel, setPainel] = useState({ x: 12, w: 392, esc: false }) // persiste em localStorage na G10
  const seq = useRef(0) // descarta respostas fora de ordem
  const nosRef = useRef(new Map()) // recorte anterior (estabilidade de posição)
  const selRef = useRef(null) // espelho de selecionadoId para closures assíncronas
  const canvasApi = useRef(null) // { centrarEm, enquadrar, zoomMais, zoomMenos } (G6)
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
    setVistos((v) => [id, ...v.filter((x) => x !== id)].slice(0, 5))
    setDetalhe({ id, carregando: true, texto: '', grupos: conexoesDe(id) })
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
  }

  // Vai até um nó a partir do painel (conexões / vistos). Fora do recorte,
  // vira expansão na G8 — por ora só os nós presentes respondem.
  function irPara(id) {
    if (!grafo.nos.has(id)) return
    selecionar(id)
    canvasApi.current?.centrarEm(id)
  }

  function aplicarFiltros(f) {
    clearTimeout(tSel.current) // recorte novo cancela uma seleção agendada pela busca
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
    const params = { ...f, eixo: '', componentes: [], tipos: TIPOS_TODOS }
    const meuSeq = ++seq.current
    setStatus('carregando')
    setMsgErro('')
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
          }, 770)
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
    if (okS || okD || okC) aplicarFiltros({ ano: okS, disciplina: okD, conceito: okC })
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
    }
    window.addEventListener('keydown', aoTecla)
    return () => window.removeEventListener('keydown', aoTecla)
  }, [])

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
        {/* ============ HEADER da página (60px) ============ */}
        <header
          style={{
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            height: 60,
            padding: '0 26px',
            borderBottom: '1px solid var(--edge)',
            background: 'var(--bg)',
          }}
        >
          <Logo tamanho={34} onClick={onHome} />

          <nav style={{ display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap', flex: 'none' }}>
            {/* item ativo: sublinhado verde, como no protótipo */}
            <span
              style={{
                font: "600 14px/1 'Figtree', sans-serif",
                color: 'var(--green)',
                borderBottom: '2px solid var(--green)',
                paddingBottom: 4,
                cursor: 'default',
              }}
            >
              Grafos
            </span>
            <span className="eg-link-nav">BNCC</span>
            <span className="eg-link-nav">Para escolas</span>
            <span className="eg-link-nav">Ajuda</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 'none' }}>
            <a
              href="https://labotim.inf.ufes.br"
              target="_blank"
              rel="noopener"
              title="LabOtim · Laboratório de Otimização e Modelagem Computacional"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#fff',
                border: '1px solid rgba(28,38,32,.08)',
                borderRadius: 9,
                padding: '5px 10px',
                boxShadow: '0 2px 7px -4px rgba(0,0,0,.25)',
              }}
            >
              <img src={labotim} alt="LabOtim" style={{ height: 22, display: 'block' }} />
            </a>
            <a
              href="https://www.ufes.br"
              target="_blank"
              rel="noopener"
              title="Universidade Federal do Espírito Santo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#fff',
                border: '1px solid rgba(28,38,32,.08)',
                borderRadius: 9,
                padding: '5px 10px',
                boxShadow: '0 2px 7px -4px rgba(0,0,0,.25)',
              }}
            >
              <img src={ufes} alt="UFES" style={{ height: 22, display: 'block' }} />
            </a>
            <span style={{ width: 1, height: 24, background: 'var(--edge)' }} />
            <ThemeToggle />
            {/* Na etapa G10 este trecho vira o perfil (mock) do protótipo */}
            <span
              onClick={onLogin}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Entrar
            </span>
            <button
              onClick={onSignup}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                background: 'var(--green)',
                padding: '8px 16px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Criar conta
            </button>
          </div>
        </header>

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
            offsetEsquerda={painel.esc ? 0 : painel.x + painel.w}
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
            </div>
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

          {/* estado início: card-convite */}
          {status === 'inicio' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
              }}
            >
              <div
                style={{
                  maxWidth: 560,
                  textAlign: 'center',
                  background: 'var(--pill-bg)',
                  border: '1px solid var(--pill-border)',
                  borderRadius: 18,
                  padding: '42px 44px 40px',
                  boxShadow: '0 18px 50px -24px rgba(0,0,0,.3)',
                }}
              >
                <div
                  style={{
                    font: "12px/1 'JetBrains Mono', monospace",
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--green)',
                    marginBottom: 16,
                  }}
                >
                  Explorar grafos
                </div>
                <h1
                  style={{
                    margin: 0,
                    font: "700 clamp(26px, 3vw, 38px)/1.1 'Spectral', serif",
                    letterSpacing: '-0.02em',
                    color: 'var(--text)',
                    marginBottom: 16,
                  }}
                >
                  Monte um recorte e explore o grafo.
                </h1>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: 'var(--muted)' }}>
                  Use a barra acima: escolha série, matéria ou conceito e clique em{' '}
                  <strong style={{ color: 'var(--text)' }}>Filtrar</strong> para consultar o endpoint e ver
                  as habilidades da BNCC Computação conectadas ao currículo que você já ensina.
                </p>
              </div>
            </div>
          )}

          {/* estado carregando: skeleton de nós pulsando + spinner */}
          {status === 'carregando' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'color-mix(in srgb, var(--grafo-bg) 82%, transparent)',
                zIndex: 32,
              }}
            >
              {SKELETON.map((sk, i) => (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${sk.l}%`,
                    top: `${sk.t}%`,
                    width: sk.d,
                    height: sk.d,
                    borderRadius: '50%',
                    background: 'var(--grafo-aresta)',
                    animation: `egPulsar 1.3s ease-in-out ${sk.delay}s infinite`,
                  }}
                />
              ))}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 64,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'var(--pill-bg)',
                  border: '1px solid var(--pill-border)',
                  borderRadius: 999,
                  padding: '9px 18px',
                  boxShadow: '0 10px 26px rgba(28,38,32,.10)',
                }}
              >
                <div
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: '50%',
                    border: '2.5px solid var(--pill-border)',
                    borderTopColor: 'var(--green)',
                    animation: 'egGirar .8s linear infinite',
                  }}
                />
                <span
                  style={{
                    font: "10.5px/1 'JetBrains Mono', monospace",
                    letterSpacing: '0.12em',
                    color: 'var(--body)',
                    textTransform: 'uppercase',
                  }}
                >
                  Consultando endpoint SPARQL…
                </span>
                <span style={{ fontSize: 11, color: 'var(--faint)' }}>Apache Jena Fuseki</span>
              </div>
            </div>
          )}

          {/* estado erro */}
          {status === 'erro' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                zIndex: 32,
              }}
            >
              <div
                style={{
                  width: 460,
                  maxWidth: '92%',
                  background: 'var(--pill-bg)',
                  border: '1px solid var(--gold)',
                  borderRadius: 18,
                  padding: '28px 30px',
                  boxShadow: '0 24px 60px rgba(28,38,32,.14)',
                  animation: 'egSurgir .18s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />
                  <span
                    style={{
                      font: "10px/1 'JetBrains Mono', monospace",
                      letterSpacing: '0.16em',
                      color: 'var(--gold)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Falha na consulta
                  </span>
                </div>
                <h2 style={{ font: "700 22px/1.2 'Spectral', serif", margin: '0 0 8px', color: 'var(--text)' }}>
                  Não foi possível consultar o grafo
                </h2>
                <p
                  style={{
                    font: "11.5px/1.6 'JetBrains Mono', monospace",
                    color: 'var(--muted)',
                    margin: '0 0 20px',
                    background: 'var(--bg)',
                    border: '1px dashed var(--pill-border)',
                    borderRadius: 10,
                    padding: '10px 12px',
                  }}
                >
                  {msgErro}
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="eg-grafo-filtrar"
                    onClick={() => aplicarFiltros({ ...filtros })}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 999,
                      border: 'none',
                      background: 'var(--green)',
                      color: '#fff',
                      font: "600 14px/1 'Figtree', sans-serif",
                      cursor: 'pointer',
                    }}
                  >
                    Tentar novamente
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarFiltros(FILTROS_VAZIOS)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 999,
                      border: '1px solid var(--pill-border)',
                      background: 'transparent',
                      color: 'var(--body)',
                      font: "500 14px/1 'Figtree', sans-serif",
                      cursor: 'pointer',
                    }}
                  >
                    Voltar ao início
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* estado vazio */}
          {status === 'vazio' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                zIndex: 32,
              }}
            >
              <div
                style={{
                  width: 440,
                  maxWidth: '92%',
                  background: 'var(--pill-bg)',
                  border: '1px solid var(--pill-border)',
                  borderRadius: 18,
                  padding: '28px 30px',
                  boxShadow: '0 24px 60px rgba(28,38,32,.12)',
                  animation: 'egSurgir .18s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />
                  <span
                    style={{
                      font: "10px/1 'JetBrains Mono', monospace",
                      letterSpacing: '0.16em',
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Sem resultados
                  </span>
                </div>
                <h2 style={{ font: "700 22px/1.2 'Spectral', serif", margin: '0 0 8px', color: 'var(--text)' }}>
                  Nenhuma conexão neste recorte
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 20px' }}>
                  A combinação de série e matéria não retornou habilidades. Tente ampliar o recorte —
                  trocar a matéria ou liberar a série.
                </p>
                <button
                  type="button"
                  className="eg-grafo-filtrar"
                  onClick={() => aplicarFiltros(FILTROS_VAZIOS)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 999,
                    border: 'none',
                    background: 'var(--green)',
                    color: '#fff',
                    font: "600 14px/1 'Figtree', sans-serif",
                    cursor: 'pointer',
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          )}

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
          />
        </main>
      </div>

      {/* footer abaixo da dobra (aparece ao rolar) */}
      <Footer onSignup={onSignup} onGrafos={onGrafos} />
    </>
  )
}

export default Grafos
