import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useTheme } from '../../context/useTheme'
import { TOKENS_COR_NO, estiloRelacao } from '../../data/estiloGrafo'
import { TAMANHO_NO, criarSimulacao, posicaoInicial } from '../../data/simulacaoForcas'
import { chaveDobra, layoutHierarquico } from '../../data/layoutHierarquico'

// Canvas 2D do grafo de conhecimento — porte do motor do protótipo
// (design/prototipo_grafo.html). Etapas G4+G5: render (grid pontilhado com
// parallax, câmera com aproximação suave, arestas com seta, nós com
// rótulo+halo, enquadrar fit-to-view) + física. Etapa G6: interações de
// ponteiro — hit-test no mundo, hover (tooltip + vizinhos, cursor
// pointer/grab), clique seleciona (estado no pai, via onSelecionar), arrastar
// nó, pan no vazio (soltar sem mover desseleciona), wheel-zoom ancorado no
// cursor (clamp [0.18, 3]) e a API imperativa { centrarEm, enquadrar,
// reaquecer, assentar, afastarParaCaber, zoomMais, zoomMenos } para os botões
// da página e o painel. Etapa G8: 2×clique seleciona + expande (onExpandir).
// As cores vêm dos tokens CSS (claro/escuro), resolvidas por getComputedStyle.
// Etapa P1 (§4.4): medidor de desempenho dev-only. Etapa P2: RENDERIZAÇÃO SOB
// DEMANDA — o motor só fica acordado enquanto há movimento (física quente,
// arraste, transição, câmera interpolando) ou um pedido pendente; quando não
// há, ele dorme e volta a zero desenho por segundo. Todo ponto que muda algo
// visível chama pedirFrame(), o único lugar que agenda um rAF.
// Etapa N5 (integração com o Neo4j, §4.5): o canvas desenha o grafo de QUALQUER
// consulta. Cor, raio, forma, fonte e legenda de cada nó vêm da tabela de estilo
// (src/data/estiloGrafo.js), já resolvidos no nó pela página (montarGrafo); o
// tracejado vem do tipo da relação; o rótulo da aresta em destaque é o próprio
// tipo (como no Neo4j Browser) e o tooltip mostra o texto completo do nó.
// Etapa N11 (D18): o layout passou a ser o do Neo4j Browser, com os dois modos
// que ele oferece (prop `layout`):
//  - 'forca' — a física do "Force-based layout" (src/data/simulacaoForcas.js:
//    as forças do d3 com os parâmetros do Browser). Consulta nova = 1.ª carga
//    do Browser: pré-cálculo antes do 1.º desenho, depois anima o que sobrar;
//    nó arrastado fica PRESO onde foi solto; mudança no grafo reaquece em 1.
//  - 'hierarquico' — o "Hierarchical layout" (src/data/layoutHierarquico.js),
//    refeito a cada mudança no grafo, com transição de 400 ms e as arestas
//    longas desenhadas dobradas.
// Trocar de modo é uma transição de 400 ms; voltar às forças retoma as posições
// que elas tinham, como no Browser. Tudo o que muda o grafo é aplicado DENTRO do
// quadro (sincronizar()), para nunca simular um conjunto de nós desatualizado.

// Limites do zoom da câmera (clamp do protótipo). Atenção: o fit-to-view do
// enquadrar() usa a própria faixa 0.2–1.5 — é OUTRO limite, não unificar.
const ZOOM_MIN = 0.18
const ZOOM_MAX = 3

// Constantes do Neo4j Browser (N11)
const DURACAO_TRANSICAO = 400 // ms — troca de layout e hierárquico refeito
const ALPHA_ARRASTE = 0.2 // arrastar um nó reaquece a física neste nível
const suavizar = (t) => t * t * (3 - 2 * t) // curva da transição (smoothstep, como no Browser)
// "afastar para caber" depois de uma expansão: folga, em px de tela, entre os
// nós e a borda do espaço livre (o Browser não expõe a dele; valor escolhido aqui)
const MARGEM_AJUSTE = 40

// ---------------------------------------------------------------------------
// Medidor de desempenho (P1 do §4.4) — SÓ em desenvolvimento.
// `import.meta.env.DEV` vira a constante `false` no build de produção: a
// cronometragem, o relatório, o log e a função acumular() saem do bundle por
// eliminação de código morto (conferido no dist — zero ocorrências de
// `__grafoPerf`). Sobra só o inicializador dos refs abaixo: +110 bytes
// medidos, o preço de os hooks não poderem ser condicionais.
// Mede o que a P2/P3 vão atacar: quantos DESENHOS por segundo o motor faz e
// quanto custa cada um.
// Leitura ao vivo no console do navegador: `window.__grafoPerf`.
// ---------------------------------------------------------------------------
const MEDIR = import.meta.env.DEV
const JANELA_RELATO_MS = 2000 // tamanho da janela de amostragem do relatório

// Estilo do <canvas>: 100% estático, então vive fora do componente — não
// realoca a cada render e o React pula o diff de style (mesma identidade).
const ESTILO_CANVAS = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  display: 'block',
  cursor: 'grab',
  touchAction: 'none', // sem isto o navegador rouba o pointermove para rolar a página (touch)
}

// Lê os tokens do design system para uso no canvas (que não entende var()).
// `no`: as cores por rótulo, indexadas pelo nome do token (o `cor` de cada nó).
function lerPaleta() {
  const css = getComputedStyle(document.documentElement)
  const v = (nome) => css.getPropertyValue(nome).trim()
  return {
    no: Object.fromEntries(TOKENS_COR_NO.map((t) => [t, v(t)])),
    grid: v('--dot-color'),
    aresta: v('--grafo-aresta'),
    arestaDestaque: v('--grafo-aresta-destaque'),
    anel: v('--grafo-anel'),
    halo: v('--grafo-halo'),
    rotulo: v('--body'),
    apagado: v('--faint'),
    tooltipBg: v('--grafo-tooltip-bg'),
    tooltipFg: v('--grafo-tooltip-fg'),
    chipBg: v('--pill-bg'),
    chipBorda: v('--edge'),
    chipTexto: v('--muted'),
  }
}

// Quebra o texto do tooltip em linhas que caibam em `largura` (medida com a
// fonte já aplicada no ctx), até `maxLinhas` — a última ganha "…" se sobrar.
function quebrarLinhas(ctx, texto, largura, maxLinhas) {
  const linhas = []
  let atual = ''
  for (const palavra of texto.split(/\s+/)) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra
    if (!atual || ctx.measureText(tentativa).width <= largura) atual = tentativa
    else {
      linhas.push(atual)
      atual = palavra
    }
  }
  if (atual) linhas.push(atual)
  if (linhas.length <= maxLinhas) return linhas
  const cortadas = linhas.slice(0, maxLinhas)
  cortadas[maxLinhas - 1] += '…'
  return cortadas
}

// ponto que fica na metade do comprimento de uma poligonal (chip da aresta dobrada)
function pontoMedio(pts) {
  let total = 0
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
  let falta = total / 2
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
    if (d >= falta && d > 0) {
      const t = falta / d
      return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t }
    }
    falta -= d
  }
  return pts[pts.length - 1]
}

const hierVazio = () => ({ dobras: new Map(), visiveis: false, movidos: new Set() })

const GrafoCanvas = forwardRef(function GrafoCanvas(
  {
    nos,
    arestas,
    versao,
    layout = 'forca',
    semAnim = false,
    formas = false,
    selecionadoId = null,
    onSelecionar,
    onExpandir,
    offsetEsquerda = 0,
  },
  ref,
) {
  // zoom do widget A/A: muda o rect (e o backing store HiDPI) SEM disparar o
  // ResizeObserver — o box em px CSS não muda, porque o App aplica `zoom` no
  // root. Mesma armadilha já documentada no FundoVertices (A2): aqui entra como
  // dependência do efeito de redesenho, senão o canvas fica borrado até a
  // próxima interação (regressão que a P2 introduziria ao deixar o loop dormir).
  const { fontZoom } = useTheme()

  const canvasRef = useRef(null)
  const cam = useRef({ x: 0, y: 0, k: 1 })
  const alvoCam = useRef(null)
  const paleta = useRef(null)
  const temaLido = useRef('') // tema cujos tokens estão em `paleta`
  const hoverRef = useRef(null) // nó sob o ponteiro (só o canvas precisa saber — não re-renderiza)
  const selecionadoRef = useRef(null) // espelho da prop para o loop de desenho
  const dragRef = useRef(null) // nó em arraste

  // Estado do layout (N11). Tudo em refs: o React não re-renderiza por nada disto.
  const sim = useRef(null) // a física das forças (uma por consulta: o gerador recomeça)
  if (!sim.current) sim.current = criarSimulacao()
  const versaoSim = useRef(versao) // consulta que a física/o layout já conhecem
  const simDe = useRef({ nos, arestas }) // conjunto de nós/relações que a física/o layout já conhecem
  const layoutAplicado = useRef(layout) // modo em vigor no desenho
  const forcaPronta = useRef(true) // as forças já fizeram a 1.ª carga desta consulta?
  const forcaDesatualizada = useRef(false) // o grafo mudou enquanto o hierárquico estava na tela
  const posForca = useRef(null) // posições das forças guardadas ao entrar no hierárquico
  const hier = useRef(hierVazio()) // dobras das arestas longas (e se já podem ser desenhadas)
  const transicao = useRef(null) // { inicio, de, para, depois } — 400 ms entre posições
  const pendente = useRef({ aquecer: 0, assentar: 0 }) // pedidos da página, aplicados no quadro

  // Acumuladores do medidor (P1). São REFS, não estado: medir não pode causar
  // re-render, ou a medida mudaria o que ela está medindo.
  const medida = useRef({ quadros: 0, somaDesenho: 0, somaFisica: 0, picoDesenho: 0, inicio: 0 })
  const janelaOciosaAnterior = useRef(false) // evita repetir "0 desenhos/s" no console

  // Renderização SOB DEMANDA (P2): o loop não é perpétuo. `rafRef` guarda o
  // handle do quadro agendado (0 = motor dormindo) e `sujo` marca que alguém
  // pediu um redesenho. Quem mexe em qualquer coisa visível chama pedirFrame().
  const rafRef = useRef(0)
  const sujo = useRef(true) // o primeiro quadro sempre acontece (grid inicial)

  // dados/props sempre atuais para o loop de desenho (sem religar o RAF a cada render)
  const dados = useRef({ nos, arestas, versao })
  dados.current = { nos, arestas, versao }
  const layoutRef = useRef(layout)
  layoutRef.current = layout
  const semAnimRef = useRef(semAnim)
  semAnimRef.current = semAnim
  const formasRef = useRef(formas)
  formasRef.current = formas
  selecionadoRef.current = selecionadoId
  const onSelecionarRef = useRef(onSelecionar)
  onSelecionarRef.current = onSelecionar
  const onExpandirRef = useRef(onExpandir)
  onExpandirRef.current = onExpandir
  const offsetRef = useRef(offsetEsquerda)
  offsetRef.current = offsetEsquerda

  // posição para onde o nó vai (fim da transição em curso) — enquadrar e
  // centrar miram o destino, não o meio do caminho
  const posAlvo = (n) => transicao.current?.para.get(n.id) || n

  // ---- transição de 400 ms entre dois conjuntos de posições (Browser) ----
  function iniciarTransicao(para, depois) {
    const de = new Map()
    dados.current.nos.forEach((n, id) => de.set(id, { x: n.x, y: n.y }))
    transicao.current = { inicio: performance.now(), de, para, depois }
    pedirFrame()
  }
  function aplicarTransicao(agora) {
    const tr = transicao.current
    const t = Math.min(1, (agora - tr.inicio) / DURACAO_TRANSICAO)
    const e = suavizar(t)
    const { nos: ns } = dados.current
    tr.para.forEach((p, id) => {
      const n = ns.get(id)
      const o = tr.de.get(id)
      if (!n || !o) return
      n.x = o.x + (p.x - o.x) * e
      n.y = o.y + (p.y - o.y) * e
    })
    if (t >= 1) terminarTransicao()
  }
  function terminarTransicao() {
    const tr = transicao.current
    if (!tr) return
    transicao.current = null
    const { nos: ns } = dados.current
    tr.para.forEach((p, id) => {
      const n = ns.get(id)
      if (n) {
        n.x = p.x
        n.y = p.y
      }
    })
    tr.depois?.()
  }

  // refaz o hierárquico com os nós/relações atuais (com transição ou de uma vez)
  function recalcularHierarquico(animar) {
    const { nos: ns, arestas: ars } = dados.current
    const r = layoutHierarquico([...ns.values()], ars, { tamanho: TAMANHO_NO })
    hier.current = { dobras: r.dobras, visiveis: false, movidos: new Set() }
    // as dobras só aparecem com os nós já no lugar (no meio da transição elas não batem)
    const mostrarDobras = () => (hier.current.visiveis = true)
    if (animar) iniciarTransicao(r.posicoes, mostrarDobras)
    else {
      transicao.current = null
      r.posicoes.forEach((p, id) => {
        const n = ns.get(id)
        if (n) {
          n.x = p.x
          n.y = p.y
        }
      })
      mostrarDobras()
    }
    pedirFrame()
  }

  // consulta nova (prop `versao`): começa do zero, como um quadro novo do Browser
  function novaConsulta() {
    const { nos: ns, arestas: ars } = dados.current
    hoverRef.current = null // id antigo esmaeceria o grafo novo inteiro até o mouse mexer
    transicao.current = null
    posForca.current = null
    sim.current = criarSimulacao()
    simDe.current = { nos: ns, arestas: ars }
    layoutAplicado.current = layoutRef.current
    hier.current = hierVazio()
    forcaDesatualizada.current = false
    forcaPronta.current = true
    if (!ns.size) return
    if (layoutAplicado.current === 'forca') {
      sim.current.definir([...ns.values()], ars)
      // 1.ª carga: o grafo já chega arrumado; sem animação, chega assentado
      sim.current.preCalcular({ ateEsfriar: semAnimRef.current })
    } else {
      forcaPronta.current = false // as forças fazem a 1.ª carga quando o modo for trocado
      recalcularHierarquico(!semAnimRef.current)
    }
    enquadrar() // logo depois do pré-cálculo (decisão do autor na N11)
  }

  // troca de modo (prop `layout`)
  function trocarLayout() {
    const { nos: ns, arestas: ars } = dados.current
    terminarTransicao()
    layoutAplicado.current = layoutRef.current
    simDe.current = { nos: ns, arestas: ars }
    if (!ns.size) return
    const animar = !semAnimRef.current
    if (layoutAplicado.current === 'hierarquico') {
      // guarda o estado das forças: o Browser as retoma ao voltar. A física
      // fica em pausa (o quadro só a avança no modo forças) e, se ainda estava
      // quente, continua de onde parou na volta.
      posForca.current = new Map(
        [...ns].map(([id, n]) => [id, { x: n.x, y: n.y, vx: n.vx, vy: n.vy, fx: n.fx, fy: n.fy }]),
      )
      recalcularHierarquico(animar)
      return
    }
    // de volta às forças
    const lista = [...ns.values()]
    const exibidas = new Map(lista.map((n) => [n.id, { x: n.x, y: n.y }]))
    if (!forcaPronta.current) {
      // o grafo chegou no hierárquico: a 1.ª carga das forças acontece agora
      lista.forEach((n, i) => {
        const p = posicaoInicial(i, lista.length)
        Object.assign(n, { x: p.x, y: p.y, vx: 0, vy: 0, fx: undefined, fy: undefined })
      })
      sim.current.definir(lista, ars)
      sim.current.preCalcular({ ateEsfriar: semAnimRef.current })
      forcaPronta.current = true
    } else {
      // volta às posições das forças; quem chegou durante o hierárquico nasce
      // na espiral do d3 (definir() posiciona os nós sem lugar) e a física
      // reaquece, como o Browser faz com nós novos
      const guardadas = posForca.current || new Map()
      lista.forEach((n) => {
        const g = guardadas.get(n.id)
        if (g) Object.assign(n, g)
        else Object.assign(n, { x: NaN, y: NaN, vx: 0, vy: 0, fx: undefined, fy: undefined })
      })
      sim.current.definir(lista, ars)
      if (forcaDesatualizada.current) sim.current.aquecer(1)
      if (semAnimRef.current) sim.current.assentar()
    }
    forcaDesatualizada.current = false
    posForca.current = null
    hier.current = hierVazio()
    if (animar) {
      const para = new Map(lista.map((n) => [n.id, { x: n.x, y: n.y }]))
      lista.forEach((n) => Object.assign(n, exibidas.get(n.id)))
      iniciarTransicao(para) // a física continua (se ainda quente) quando a transição termina
    }
    pedirFrame()
  }

  // Aplica ao motor o que mudou desde o último quadro: consulta nova, troca de
  // modo ou mudança no conjunto de nós/relações (expansão, desfazer, ocultar
  // pela legenda). Roda no começo de cada quadro — assim nenhum passo da física
  // usa um conjunto de nós desatualizado, mesmo que a página tenha pedido algo
  // (reaquecer, por exemplo) antes de o React entregar as props novas.
  function sincronizar() {
    const d = dados.current
    if (d.versao !== versaoSim.current) {
      versaoSim.current = d.versao
      novaConsulta()
      return
    }
    if (layoutRef.current !== layoutAplicado.current) {
      trocarLayout()
      return
    }
    if (d.nos === simDe.current.nos && d.arestas === simDe.current.arestas) return
    simDe.current = { nos: d.nos, arestas: d.arestas }
    if (layoutAplicado.current === 'forca') sim.current.definir([...d.nos.values()], d.arestas)
    else {
      forcaDesatualizada.current = true
      recalcularHierarquico(!semAnimRef.current)
    }
  }

  // pedidos da página (reaquecer/assentar), aplicados depois de sincronizar()
  function aplicarPendentes() {
    const p = pendente.current
    if (p.aquecer) {
      if (layoutAplicado.current === 'forca') {
        sim.current.aquecer(p.aquecer)
        if (semAnimRef.current) sim.current.assentar() // sem animação: resolve na hora
      }
      p.aquecer = 0
    }
    if (p.assentar) {
      terminarTransicao()
      if (layoutAplicado.current === 'forca') sim.current.assentar(p.assentar)
      p.assentar = 0
    }
  }

  // assenta o layout de imediato (ligar o modo "sem animação" com um grafo em cena)
  function assentar(maxPassos) {
    pendente.current.assentar = maxPassos || Infinity
    pedirFrame()
  }

  // reaquece a física sem re-enquadrar (expansão/desfazer: 1, como o Browser
  // faz em toda mudança no grafo); no hierárquico não há física — o layout é
  // refeito sozinho quando o grafo muda
  function reaquecer(nivel) {
    pendente.current.aquecer = Math.max(pendente.current.aquecer, nivel)
    pedirFrame()
  }

  // largura ocupada pelo painel de contexto (G7) — enquadrar/centrarEm miram
  // o centro do espaço LIVRE à direita dele, como no protótipo
  const offsetPainel = () => offsetRef.current

  function enquadrar() {
    const { nos: ns } = dados.current
    if (!ns.size) return
    let x0 = 1e9
    let y0 = 1e9
    let x1 = -1e9
    let y1 = -1e9
    ns.forEach((n) => {
      const p = posAlvo(n)
      x0 = Math.min(x0, p.x)
      y0 = Math.min(y0, p.y)
      x1 = Math.max(x1, p.x)
      y1 = Math.max(y1, p.y)
    })
    const cv = canvasRef.current
    if (!cv) return
    const rt = cv.getBoundingClientRect()
    const L = offsetPainel()
    const livre = Math.max(240, rt.width - L)
    const k = Math.min(1.5, Math.max(0.2, Math.min(livre / (x1 - x0 + 260), rt.height / (y1 - y0 + 260))))
    alvoCam.current = { x: (x0 + x1) / 2 - L / (2 * k), y: (y0 + y1) / 2, k }
    pedirFrame()
  }

  // Depois de uma expansão, como o Browser: afasta a câmera SÓ o necessário para
  // caberem os nós que estão na tela mais os que chegaram — sem mover o centro e
  // sem nunca aproximar.
  function afastarParaCaber(idsNovos) {
    const cv = canvasRef.current
    if (!cv) return
    sincronizar()
    const { nos: ns } = dados.current
    if (!ns.size) return
    const rt = cv.getBoundingClientRect()
    const L = offsetPainel()
    const c = cam.current
    const meiaDireita = rt.width / 2 - MARGEM_AJUSTE
    const meiaEsquerda = rt.width / 2 - L - MARGEM_AJUSTE
    const meiaAltura = rt.height / 2 - MARGEM_AJUSTE
    const novos = new Set(idsNovos)
    const naTela = (n) => {
      const sx = rt.width / 2 + (n.x - c.x) * c.k
      const sy = rt.height / 2 + (n.y - c.y) * c.k
      return sx >= L && sx <= rt.width && sy >= 0 && sy <= rt.height
    }
    let k = c.k
    ns.forEach((n) => {
      if (!novos.has(n.id) && !naTela(n)) return
      const p = posAlvo(n)
      const dx = p.x - c.x
      const dy = p.y - c.y
      if (dx > 0 && meiaDireita > 0) k = Math.min(k, meiaDireita / (dx + n.r))
      if (dx < 0 && meiaEsquerda > 0) k = Math.min(k, meiaEsquerda / (n.r - dx))
      if (dy !== 0 && meiaAltura > 0) k = Math.min(k, meiaAltura / (Math.abs(dy) + n.r))
    })
    k = Math.max(ZOOM_MIN, k)
    if (k < c.k - 1e-3) {
      alvoCam.current = { x: c.x, y: c.y, k }
      pedirFrame()
    }
  }

  // aproxima/afasta em passos (botões +/− da página), com os clamps do protótipo
  function zoomCam(fator) {
    const c = cam.current
    alvoCam.current = { x: c.x, y: c.y, k: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, c.k * fator)) }
    pedirFrame()
  }

  // leva a câmera até um nó (painel da G7, vistos, expansão)
  function centrarEm(id) {
    const n = dados.current.nos.get(id)
    if (!n) return
    const p = posAlvo(n)
    const k = Math.max(cam.current.k, 1)
    alvoCam.current = { x: p.x - offsetPainel() / (2 * k), y: p.y, k }
    pedirFrame()
  }

  useImperativeHandle(ref, () => ({
    centrarEm,
    enquadrar,
    reaquecer,
    assentar, // usado ao ligar o modo "sem animação" com um grafo em cena (G10)
    afastarParaCaber, // câmera do Browser depois de uma expansão (N11)
    zoomMais: () => zoomCam(1.35),
    zoomMenos: () => zoomCam(1 / 1.35),
  }))

  // forma do nó — modo "formas em vez de cores" (G10, daltonismo total). N5: a
  // forma de cada rótulo vem da tabela de estilo (n.forma). Quadrado e
  // triângulo com as constantes do protótipo; o losango é novo (4.º rótulo).
  function tracarNo(ctx, n, r) {
    if (!formasRef.current || n.forma === 'circulo') {
      ctx.arc(n.x, n.y, r, 0, 7)
      return
    }
    if (n.forma === 'quadrado') {
      const s = r * 0.92
      ctx.rect(n.x - s, n.y - s, s * 2, s * 2)
      return
    }
    if (n.forma === 'losango') {
      const s = r * 1.18
      ctx.moveTo(n.x, n.y - s)
      ctx.lineTo(n.x + s, n.y)
      ctx.lineTo(n.x, n.y + s)
      ctx.lineTo(n.x - s, n.y)
      ctx.closePath()
      return
    }
    const s = r * 1.22 // triângulo
    ctx.moveTo(n.x, n.y - s)
    ctx.lineTo(n.x + s * 0.866, n.y + s * 0.5)
    ctx.lineTo(n.x - s * 0.866, n.y + s * 0.5)
    ctx.closePath()
  }

  function desenhar(cv, rt) {
    const ctx = cv.getContext('2d')
    const C = paleta.current
    const { nos: ns, arestas: ars } = dados.current
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rt.width, rt.height)

    // grid pontilhado com parallax (acompanha a câmera)
    const passo = 34 * cam.current.k
    if (passo > 13) {
      ctx.fillStyle = C.grid
      const ox = (rt.width / 2 - cam.current.x * cam.current.k) % passo
      const oy = (rt.height / 2 - cam.current.y * cam.current.k) % passo
      for (let x = ox; x < rt.width; x += passo)
        for (let y = oy; y < rt.height; y += passo) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, 7)
          ctx.fill()
        }
    }
    if (!ns.size) return

    ctx.save()
    ctx.translate(rt.width / 2, rt.height / 2)
    ctx.scale(cam.current.k, cam.current.k)
    ctx.translate(-cam.current.x, -cam.current.y)

    // foco (hover/seleção) destaca vizinhos e esmaece o resto
    const foco = hoverRef.current || selecionadoRef.current
    const viz = new Set()
    if (foco) {
      viz.add(foco)
      ars.forEach((ar) => {
        if (ar.a === foco) viz.add(ar.b)
        if (ar.b === foco) viz.add(ar.a)
      })
    }
    const k = cam.current.k
    // hierárquico (N11): arestas longas seguem os pontos de dobra — menos as
    // que tocam um nó arrastado depois do layout (os pontos não batem mais)
    const H = hier.current
    const usarDobras = layoutAplicado.current === 'hierarquico' && H.visiveis

    // ---- arestas (com seta; tracejada se o tipo pedir, na tabela de estilo) ----
    ars.forEach((ar) => {
      const a = ns.get(ar.a)
      const b = ns.get(ar.b)
      if (!a || !b) return
      const dobra =
        usarDobras && !H.movidos.has(ar.a) && !H.movidos.has(ar.b) ? H.dobras.get(chaveDobra(ar.a, ar.b)) : null
      const destaque = foco && (ar.a === foco || ar.b === foco)
      ctx.globalAlpha = foco ? (destaque ? 0.95 : 0.1) : 0.55
      ctx.strokeStyle = destaque ? C.arestaDestaque : C.aresta
      ctx.lineWidth = (destaque ? 2 : 1.2) / k
      ctx.setLineDash(estiloRelacao(ar.rel).tracejado ? [6 / k, 5 / k] : [])
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      if (dobra) dobra.forEach((p) => ctx.lineTo(p.x, p.y))
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
      ctx.setLineDash([])
      // a seta segue o último trecho (numa aresta dobrada, o que chega em b)
      const ultimo = dobra && dobra.length ? dobra[dobra.length - 1] : a
      if (k > 0.45) {
        const d = Math.hypot(b.x - ultimo.x, b.y - ultimo.y) || 1
        const ux = (b.x - ultimo.x) / d
        const uy = (b.y - ultimo.y) / d
        const px = b.x - ux * (b.r + 5 / k)
        const py = b.y - uy * (b.r + 5 / k)
        const s = (destaque ? 7 : 5.5) / Math.sqrt(k)
        ctx.fillStyle = destaque ? C.arestaDestaque : C.aresta
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(px - ux * s - uy * s * 0.5, py - uy * s + ux * s * 0.5)
        ctx.lineTo(px - ux * s + uy * s * 0.5, py - uy * s - ux * s * 0.5)
        ctx.closePath()
        ctx.fill()
      }
      // chip com o tipo da relação (como o Neo4j Browser), só na aresta em destaque
      if (destaque && k > 0.5) {
        const meio = dobra && dobra.length ? pontoMedio([a, ...dobra, b]) : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
        const mx = meio.x
        const my = meio.y
        const rot = ar.rel
        ctx.font = `500 ${10 / k}px "JetBrains Mono", monospace`
        const tw = ctx.measureText(rot).width
        ctx.fillStyle = C.chipBg
        ctx.strokeStyle = C.chipBorda
        ctx.lineWidth = 1 / k
        const bx = mx - tw / 2 - 6 / k
        const by = my - 9 / k
        const bw = tw + 12 / k
        const bh = 16 / k
        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 8 / k)
        else ctx.rect(bx, by, bw, bh)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = C.chipTexto
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(rot, mx, my - 0.5 / k)
      }
    })
    ctx.globalAlpha = 1

    // ---- nós (cor por rótulo, anel de seleção, rótulo com halo) ----
    ns.forEach((n) => {
      const apagado = foco && !viz.has(n.id)
      const ehFoco = n.id === foco
      const ehSel = n.id === selecionadoRef.current
      const cor = C.no[n.cor] || C.no['--no-outro']
      ctx.globalAlpha = apagado ? 0.18 : 1
      const r = n.r + (n.id === hoverRef.current ? 2 : 0)
      if (ehSel) {
        ctx.beginPath()
        tracarNo(ctx, n, r + 5.5)
        ctx.strokeStyle = cor
        ctx.globalAlpha = apagado ? 0.18 : 0.45
        ctx.lineWidth = 2.5 / Math.sqrt(k)
        ctx.stroke()
        ctx.globalAlpha = apagado ? 0.18 : 1
      }
      ctx.beginPath()
      tracarNo(ctx, n, r)
      ctx.fillStyle = cor
      ctx.fill()
      ctx.lineWidth = 2 / Math.sqrt(k)
      ctx.strokeStyle = C.anel
      ctx.stroke()

      const mostrarRotulo = k > 0.55 || ehFoco || ehSel || viz.has(n.id)
      if (mostrarRotulo) {
        const f = n.fonte
        ctx.font = `${f.peso} ${f.tamanho / Math.sqrt(k)}px ${f.mono ? '"JetBrains Mono", monospace' : '"Figtree", sans-serif'}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.lineWidth = 4 / Math.sqrt(k)
        ctx.strokeStyle = C.halo
        ctx.strokeText(n.label, n.x, n.y + r + 6 / Math.sqrt(k))
        ctx.fillStyle = apagado ? C.apagado : C.rotulo
        ctx.fillText(n.label, n.x, n.y + r + 6 / Math.sqrt(k))
      }
    })
    ctx.globalAlpha = 1

    // tooltip do hover: o texto completo do nó (n.dica), quando ele diz mais do
    // que a legenda — ex.: "EF01MA17 — Reconhecer…", ou a descrição inteira de
    // um objeto de conhecimento. Mesmo visual do protótipo (1 linha = 22px);
    // textos longos quebram em até 4 linhas de no máximo 300px.
    const hv = hoverRef.current ? ns.get(hoverRef.current) : null
    if (hv && hv.dica && hv.dica !== hv.label) {
      ctx.font = `600 ${11.5 / k}px "Figtree", sans-serif`
      const linhas = quebrarLinhas(ctx, hv.dica, 300 / k, 4)
      const lh = 15 / k
      const tw = Math.max(...linhas.map((l) => ctx.measureText(l).width))
      const bw = tw + 18 / k
      const bh = linhas.length * lh + 7 / k
      const bx = hv.x - bw / 2
      const by = hv.y - hv.r - 12 / k - bh
      ctx.fillStyle = C.tooltipBg
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 7 / k)
      else ctx.rect(bx, by, bw, bh)
      ctx.fill()
      ctx.fillStyle = C.tooltipFg
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      linhas.forEach((l, i) => ctx.fillText(l, hv.x, by + 3.5 / k + lh * (i + 0.5)))
    }
    ctx.restore()
  }

  // soma um quadro à janela corrente do medidor (P1; só roda com MEDIR)
  function acumular(msFisica, msDesenho) {
    const m = medida.current
    m.quadros++
    m.somaDesenho += msDesenho
    m.somaFisica += msFisica
    if (msDesenho > m.picoDesenho) m.picoDesenho = msDesenho
  }

  // O motor continua acordado enquanto houver algo em movimento: física quente,
  // transição, arraste em curso, câmera interpolando — ou um pedido de
  // redesenho pendente. Com o grafo vazio a física não conta.
  function precisaContinuar() {
    if (sujo.current) return true
    if (alvoCam.current) return true
    if (transicao.current) return true
    if (semAnimRef.current) return false // sem animação: nada evolui sozinho
    if (dragRef.current) return true
    return layoutAplicado.current === 'forca' && sim.current.rodando
  }

  // Pede um quadro. Se o motor estiver dormindo, acorda; se já estiver acordado,
  // só marca que o próximo quadro tem trabalho a fazer. É o ÚNICO ponto do
  // arquivo que agenda um requestAnimationFrame (além do reagendamento no fim
  // do próprio quadro).
  function pedirFrame() {
    sujo.current = true
    if (!rafRef.current) rafRef.current = requestAnimationFrame(quadro)
  }

  // um quadro: mudanças do grafo + HiDPI + física/transição + câmera com
  // aproximação suave (lerp 0.14/frame)
  function quadro() {
    rafRef.current = 0
    const cv = canvasRef.current
    if (!cv) return // desmontado entre o agendamento e a execução: o motor dorme
    sujo.current = false // o pedido está sendo atendido AGORA
    sincronizar()
    aplicarPendentes()
    // Re-resolve os tokens quando o data-theme do <html> troca. Lemos o
    // atributo aqui (e não num efeito atrelado ao ThemeContext) porque o
    // efeito do filho roda ANTES de o Provider aplicar o atributo — a
    // paleta ficaria sempre um toggle atrasada (halo/grid do tema anterior).
    // A chave inclui os overrides inline de TODOS os tokens --no-* que o canvas
    // usa (paleta de daltonismo, G9): lê-se o VALOR escrito no <html>, e não
    // uma prop, para o cache só virar quando os tokens novos já estão
    // aplicados. Todos entram na chave porque paletas distintas compartilham
    // cores (protanopia e deuteranopia diferem num único token).
    const tema = document.documentElement.getAttribute('data-theme') || 'light'
    const estilo = document.documentElement.style
    const chave = `${tema}|${TOKENS_COR_NO.map((t) => estilo.getPropertyValue(t)).join('|')}`
    if (!paleta.current || chave !== temaLido.current) {
      temaLido.current = chave
      paleta.current = lerPaleta()
    }
    const rt = cv.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    if (cv.width !== Math.round(rt.width * dpr) || cv.height !== Math.round(rt.height * dpr)) {
      cv.width = Math.round(rt.width * dpr)
      cv.height = Math.round(rt.height * dpr)
    }
    // transição em curso (layout) OU um passo da física das forças
    const t0 = MEDIR ? performance.now() : 0
    if (transicao.current) {
      if (semAnimRef.current) terminarTransicao()
      else aplicarTransicao(performance.now())
    } else if (!semAnimRef.current && layoutAplicado.current === 'forca' && sim.current.rodando) {
      sim.current.passo()
    }
    const msFisica = MEDIR ? performance.now() - t0 : 0
    const a = alvoCam.current
    if (a) {
      const c = cam.current
      if (semAnimRef.current) {
        c.x = a.x
        c.y = a.y
        c.k = a.k
        alvoCam.current = null
      } else {
        c.x += (a.x - c.x) * 0.14
        c.y += (a.y - c.y) * 0.14
        c.k += (a.k - c.k) * 0.14
        if (Math.abs(a.x - c.x) < 0.5 && Math.abs(a.k - c.k) < 0.004) alvoCam.current = null
      }
    }
    const t1 = MEDIR ? performance.now() : 0
    desenhar(cv, rt)
    if (MEDIR) acumular(msFisica, performance.now() - t1)
    // fim do quadro: só reagenda se ainda houver movimento — senão, dorme. (Se
    // algo neste quadro já pediu outro — enquadrar, transição —, não duplica.)
    if (!rafRef.current && precisaContinuar()) rafRef.current = requestAnimationFrame(quadro)
  }

  // Montagem: primeiro quadro + os dois observadores que precisam ACORDAR o
  // motor enquanto ele dorme. Antecipados da P3(b)/(c) porque sem eles a P2
  // regride: com o loop dormindo, redimensionar a janela deixaria o canvas
  // esticado (o backing store HiDPI só é refeito dentro do quadro) e trocar o
  // tema/paleta manteria as cores antigas até a próxima interação.
  useEffect(() => {
    const cv = canvasRef.current
    pedirFrame()

    const ro = new ResizeObserver(() => pedirFrame())
    if (cv) ro.observe(cv)

    // dispara DEPOIS de o atributo estar aplicado no <html> — a leitura da
    // paleta dentro do quadro já encontra os tokens novos (mesmo motivo
    // documentado acima, agora sem precisar sondar a cada quadro)
    const mo = new MutationObserver(() => pedirFrame())
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] })

    return () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      ro.disconnect()
      mo.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Toda mudança de dado ou de prop que altere o desenho pede um quadro — e o
  // quadro aplica o que mudou (sincronizar): consulta nova (versao), troca de
  // modo (layout), expansão/desfazer/legenda (nos/arestas), seleção, formas,
  // sem animação e o zoom A/A.
  useEffect(() => {
    pedirFrame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nos, arestas, versao, layout, selecionadoId, formas, semAnim, fontZoom])

  // Relatório do medidor (P1): fecha uma janela a cada 2s, publica em
  // window.__grafoPerf e loga uma linha. Com a renderização sob demanda (P2), a
  // janela ociosa marca "0 desenhos/s" — a primeira confirma que o motor
  // dormiu e as seguintes são suprimidas para não poluir o console.
  useEffect(() => {
    if (!MEDIR) return undefined
    medida.current.inicio = performance.now()
    const id = setInterval(() => {
      const m = medida.current
      const decorridoS = (performance.now() - m.inicio) / 1000
      const relato = {
        desenhosPorSegundo: +(m.quadros / decorridoS).toFixed(1),
        desenharMs: m.quadros ? +(m.somaDesenho / m.quadros).toFixed(2) : 0,
        picoDesenharMs: +m.picoDesenho.toFixed(2),
        fisicaMs: m.quadros ? +(m.somaFisica / m.quadros).toFixed(2) : 0,
        quadros: m.quadros,
      }
      window.__grafoPerf = relato
      if (m.quadros || !janelaOciosaAnterior.current) {
        console.info(
          `[grafo] ${relato.desenhosPorSegundo} desenhos/s · desenhar ${relato.desenharMs}ms (pico ${relato.picoDesenharMs}ms) · física ${relato.fisicaMs}ms`,
        )
      }
      janelaOciosaAnterior.current = m.quadros === 0
      m.quadros = 0
      m.somaDesenho = 0
      m.somaFisica = 0
      m.picoDesenho = 0
      m.inicio = performance.now()
    }, JANELA_RELATO_MS)
    return () => clearInterval(id)
  }, [])

  // Interações de ponteiro (G6) — porte fiel dos handlers do protótipo.
  // `moveu` distingue clique de arraste/pan: soltar sem ter movido em cima de
  // um nó SELECIONA; soltar sem ter movido no vazio DESSELECIONA.
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return undefined
    let pan = null // { sx, sy, cx, cy } — câmera no início do pan
    let moveu = false

    // converte o evento (tela) para coordenadas do mundo do grafo
    const mundo = (ev) => {
      const rt = cv.getBoundingClientRect()
      const sx = ev.clientX - rt.left
      const sy = ev.clientY - rt.top
      return {
        x: (sx - rt.width / 2) / cam.current.k + cam.current.x,
        y: (sy - rt.height / 2) / cam.current.k + cam.current.y,
        sx,
        sy,
        w: rt.width,
        h: rt.height,
      }
    }

    // hit-test: nó mais próximo cujo raio (+ tolerância de 6px de tela) contém o ponto
    const acertar = (p) => {
      let melhor = null
      let md = 1e9
      dados.current.nos.forEach((n) => {
        const d = Math.hypot(n.x - p.x, n.y - p.y)
        if (d < n.r + 6 / cam.current.k && d < md) {
          md = d
          melhor = n
        }
      })
      return melhor
    }

    const aoDescer = (ev) => {
      const p = mundo(ev)
      const n = acertar(p)
      moveu = false
      if (n) {
        terminarTransicao() // pegar um nó no meio da transição: ela termina na hora
        dragRef.current = { id: n.id, dx: n.x - p.x, dy: n.y - p.y }
        alvoCam.current = null
      } else {
        pan = { sx: p.sx, sy: p.sy, cx: cam.current.x, cy: cam.current.y }
      }
      pedirFrame()
    }

    const aoMover = (ev) => {
      const p = mundo(ev)
      if (dragRef.current) {
        const n = dados.current.nos.get(dragRef.current.id)
        if (n) {
          const x = p.x + dragRef.current.dx
          const y = p.y + dragRef.current.dy
          if (layoutAplicado.current === 'forca') {
            // como no Browser: o nó fica PRESO onde for solto (fx/fy) e a
            // física reaquece em 0,2 — os vizinhos acompanham
            Object.assign(n, { fx: x, fy: y, x, y, vx: 0, vy: 0 })
            if (!semAnimRef.current) sim.current.aquecer(ALPHA_ARRASTE)
          } else {
            n.x = x
            n.y = y
            hier.current.movidos.add(n.id)
          }
        }
        moveu = true
        pedirFrame()
        return
      }
      if (pan) {
        cam.current.x = pan.cx - (p.sx - pan.sx) / cam.current.k
        cam.current.y = pan.cy - (p.sy - pan.sy) / cam.current.k
        if (Math.hypot(p.sx - pan.sx, p.sy - pan.sy) > 3) moveu = true
        alvoCam.current = null
        pedirFrame()
        return
      }
      const n = acertar(p)
      const anterior = hoverRef.current
      hoverRef.current = n ? n.id : null
      cv.style.cursor = n ? 'pointer' : 'grab'
      // só redesenha se o nó sob o ponteiro MUDOU: passear o mouse pelo vazio
      // não pode acordar o motor (é o caso mais comum de todos)
      if (hoverRef.current !== anterior) pedirFrame()
    }

    const aoSoltar = () => {
      if (dragRef.current && !moveu) onSelecionarRef.current?.(dragRef.current.id)
      else if (pan && !moveu) onSelecionarRef.current?.(null)
      const havia = dragRef.current || pan
      dragRef.current = null
      pan = null
      if (havia) pedirFrame() // encerra o gesto; a física ainda pode estar quente
    }

    // 2×clique num nó: seleciona e expande as conexões dele (G8)
    const aoDuploClique = (ev) => {
      const n = acertar(mundo(ev))
      if (!n) return
      onSelecionarRef.current?.(n.id)
      onExpandirRef.current?.(n.id)
    }

    // desvio do protótipo: limpa o hover ao sair do palco (senão o tooltip
    // e o destaque ficariam presos no último nó tocado)
    const aoSair = () => {
      const tinhaHover = hoverRef.current !== null
      hoverRef.current = null
      cv.style.cursor = 'grab'
      if (tinhaHover) pedirFrame() // apagar o destaque também é um desenho
    }

    // zoom ancorado no cursor: o ponto do mundo sob o ponteiro fica parado
    const aoRolar = (ev) => {
      ev.preventDefault()
      const p = mundo(ev)
      const fator = Math.exp(-ev.deltaY * 0.0013)
      const k2 = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, cam.current.k * fator))
      cam.current.x = p.x - (p.sx - p.w / 2) / k2
      cam.current.y = p.y - (p.sy - p.h / 2) / k2
      cam.current.k = k2
      alvoCam.current = null
      pedirFrame()
    }

    cv.addEventListener('pointerdown', aoDescer)
    cv.addEventListener('pointermove', aoMover)
    cv.addEventListener('pointerleave', aoSair)
    window.addEventListener('pointerup', aoSoltar) // soltar fora do canvas também encerra
    cv.addEventListener('dblclick', aoDuploClique)
    cv.addEventListener('wheel', aoRolar, { passive: false }) // precisa de preventDefault (via React seria passivo)
    return () => {
      cv.removeEventListener('pointerdown', aoDescer)
      cv.removeEventListener('pointermove', aoMover)
      cv.removeEventListener('pointerleave', aoSair)
      window.removeEventListener('pointerup', aoSoltar)
      cv.removeEventListener('dblclick', aoDuploClique)
      cv.removeEventListener('wheel', aoRolar)
    }
    // pedirFrame() só mexe em refs: incluí-lo nas deps religaria todos os
    // listeners a cada render, sem mudar comportamento nenhum
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas ref={canvasRef} data-grafo-canvas="1" style={ESTILO_CANVAS} />
})

export default GrafoCanvas
