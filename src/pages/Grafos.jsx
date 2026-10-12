import { useEffect, useRef, useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import ConsoleCypher from '../components/grafo/ConsoleCypher'
import ResultadoCypher from '../components/grafo/ResultadoCypher'
import GrafoCanvas from '../components/grafo/GrafoCanvas'
import GrafoPainel from '../components/grafo/GrafoPainel'
import GrafoPerfil from '../components/grafo/GrafoPerfil'
import { PaletaPopover } from '../components/grafo/GrafoOverlays'
import GrafoEstados from '../components/grafo/GrafoEstados'
import { PALETAS } from '../data/paletas'
import { executarCypher } from '../data/neo4j'
import { ANOS, NOS, conexoesDe, consultarFuseki } from '../data/mockFuseki'

// Página "Grafos" — a tela que exibe o grafo de conhecimento. Protótipo:
// design/prototipo_grafo.html. Está em transição para o Neo4j (integração,
// ESTADO_ATUAL.md §4.5):
//  - N3: a barra de busca/filtros do protótipo saiu de cena (vai ser
//    redesenhada) e, com ela, o fluxo de filtros do mock (seleção pendente,
//    busca, ?serie= na URL, legenda que reconsultava, gaveta SPARQL). No lugar,
//    o CONSOLE CYPHER (ConsoleCypher) executa consultas no Neo4j via
//    executarCypher() e a resposta aparece no palco em Tabela/JSON
//    (ResultadoCypher). O canvas ainda não recebe esses dados (N4/N5).
//  - Do porte do protótipo continuam o canvas com física e interações
//    (G4–G6: seleção, Esc, +/−/recentrar), o painel de contexto (G7; sua
//    largura é descontada do palco), expandir/desfazer com histórico de
//    snapshots (G8), paleta para daltonismo, modo formas, sem animação e a
//    PERSISTÊNCIA das preferências em localStorage['edugraphPrefs'] (G9–G10).
//    selecionar/expandir ainda leem o mock: sem nós no canvas, nada os aciona
//    até voltarem com dados reais (N7/N8).
//  - Perfil mock no header (GrafoPerfil, G10) intocado: as contas vão sair do
//    site em roadmap próprio.

const PAINEL_PADRAO = { x: 12, w: 392, esc: false }

// Tempos e limites da interação (valores do protótipo — não alterar)
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

// mapa reverso uri -> id para ler os bindings sparql-results+json do mock
// (só a expansão ainda o usa, até a N8)
const URI_PARA_ID = new Map([...NOS.values()].map((n) => [n.uri, n.id]))

function Grafos({ onHome, onSignup, onGrafos }) {
  const [status, setStatus] = useState('inicio') // inicio | carregando | pronto | erro (vazio: sem uso desde a N3)
  const [resultado, setResultado] = useState(null) // última resposta do console Cypher (N3)
  const [erro, setErro] = useState(null) // falha da última consulta: { origem, codigo, mensagem }
  const [grafo, setGrafo] = useState({ nos: new Map(), arestas: [], versao: 0 })
  const [contagens, setContagens] = useState({ habilidade: 0, conceito: 0, disciplina: 0, conexoes: 0 })
  const [tempoMs, setTempoMs] = useState(0)
  const [selecionadoId, setSelecionadoId] = useState(null) // nó selecionado (anel no canvas + painel)
  const [detalhe, setDetalhe] = useState(null) // { id, carregando, texto, grupos } do painel (G7)
  const [vistos, setVistos] = useState([]) // últimos 5 nós selecionados (chips do painel)
  const [painel, setPainel] = useState(PREFS.painel) // posição/largura persistem (G10)
  const [expandindo, setExpandindo] = useState(false) // consulta de expansão em voo (G8)
  const [desfaziveis, setDesfaziveis] = useState(0) // tamanho do histórico de expansões
  const [paleta, setPaleta] = useState(PREFS.paleta) // paleta de cores dos nós (G9/G10)
  const [paletaAberta, setPaletaAberta] = useState(false)
  const [formas, setFormas] = useState(PREFS.formas) // formas em vez de cores (G10)
  const [semAnim, setSemAnim] = useState(PREFS.semAnim) // desativar animações e física (G10)
  const [turmas, setTurmas] = useState(PREFS.turmas) // turmas do perfil mock (G10)
  const [perfilAberto, setPerfilAberto] = useState(false)
  const seq = useRef(0) // descarta respostas fora de ordem
  const nosRef = useRef(new Map()) // nós do grafo ATUAL (estabilidade de posição + closures assíncronas)
  const histExp = useRef([]) // snapshots pré-expansão (máx. 10, G8)
  const selRef = useRef(null) // espelho de selecionadoId para closures assíncronas
  const canvasApi = useRef(null) // API do canvas: { centrarEm, enquadrar, reaquecer, assentar, zoomMais, zoomMenos }
  const ultimaConsulta = useRef('') // texto da última execução do console (o "Tentar novamente" do erro)

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
        setErro({ mensagem: String(err.message || err) })
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

  // Console Cypher (N3): executa a consulta no Neo4j e mostra a resposta no
  // palco (Tabela/JSON). Canal 'console': uma execução nova cancela a anterior
  // ainda em voo — o cancelamento chega como origem 'cancelada' e é ignorado.
  // O canvas ainda não recebe os dados (N4/N5).
  async function executarConsulta(consulta) {
    ultimaConsulta.current = consulta
    setStatus('carregando')
    setErro(null)
    try {
      const r = await executarCypher(consulta, {}, { canal: 'console' })
      setResultado(r)
      setTempoMs(r.tempos.totalMs)
      setStatus('pronto')
    } catch (e) {
      if (e?.origem === 'cancelada') return
      setResultado(null)
      setErro({ origem: e?.origem, codigo: e?.codigo, mensagem: String(e?.message || e) })
      setStatus('erro')
    }
  }

  function voltarAoInicio() {
    setResultado(null)
    setErro(null)
    setStatus('inicio')
  }

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
  // pontinhos DOM (classes .eg-no-* no index.css); o canvas recebe via prop
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

  // paleta para daltonismo: sobrescreve os tokens --no-* no <html> (vale para
  // o canvas e todos os pontinhos DOM de uma vez); 'padrao' remove o override
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
  const totalNos = contagens.habilidade + contagens.conceito + contagens.disciplina
  const resumoRecorte = `${totalNos} nós · ${contagens.conexoes} conexões · ${tempoMs} ms`
  const temGrafo = grafo.nos.size > 0 // sem nós (toda a N3), zoom/paleta/resumo ficam ocultos
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
        <ConsoleCypher status={status} resultado={resultado} erro={erro} aoExecutar={executarConsulta} />

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
            offsetEsquerda={offsetPainel}
            semAnim={semAnim}
            formas={formas}
          />

          {/* controles de zoom + recentrar (topo-direita, sobre o canvas) */}
          {status === 'pronto' && temGrafo && (
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

          {/* legenda "Tipos de nó" e gaveta SPARQL (G9) saíram da tela na N3:
              dependiam do modelo do mock e voltam adaptadas (N6 e N10) */}

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

          {/* resumo do grafo (pill topo-centro) */}
          {status === 'pronto' && temGrafo && (
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

          {/* resposta do console Cypher (N3): Tabela/JSON à direita do painel */}
          {status === 'pronto' && resultado ? (
            <ResultadoCypher resultado={resultado} offsetEsquerda={offsetPainel} />
          ) : null}

          {/* overlays de estado do palco (início/carregando/erro — R7b) */}
          <GrafoEstados
            status={status}
            erro={erro}
            aoTentarNovamente={() => executarConsulta(ultimaConsulta.current)}
            aoLimpar={voltarAoInicio}
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
