import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useTheme } from '../../context/useTheme'
import { RELACOES } from '../../data/mockFuseki'

// Canvas 2D do grafo de conhecimento — porte fiel do motor do protótipo
// (design/prototipo_grafo.html). Etapas G4+G5: render (grid pontilhado com
// parallax, câmera com aproximação suave, arestas com seta — tracejadas em
// progrideDe —, nós por tipo com rótulo+halo, enquadrar fit-to-view) + FÍSICA
// (fisica(): repulsão + anti-colisão + molas por relação + gravidade ao centro,
// com esfriamento por alpha; assentar(N) resolve o layout de uma vez para o
// modo "sem animação" da G10). Etapa G6: interações de ponteiro — hit-test no
// mundo, hover (tooltip + vizinhos, cursor pointer/grab), clique seleciona
// (estado no pai, via onSelecionar), arrastar nó (reaquece a física), pan no
// vazio (soltar sem mover desseleciona), wheel-zoom ancorado no cursor (clamp
// [0.18, 3]) e a API imperativa { centrarEm, enquadrar, reaquecer, assentar,
// zoomMais, zoomMenos } para os botões da página, a busca e o painel. Etapa G8:
// 2×clique seleciona + expande (onExpandir); reaquecer(nivel) assenta a
// expansão/desfazer sem re-enquadrar. As cores vêm dos tokens CSS
// (claro/escuro), resolvidas por getComputedStyle. Etapa P1 (§4.4): medidor de
// desempenho dev-only. Etapa P2: o loop de desenho deixou de ser perpétuo —
// RENDERIZAÇÃO SOB DEMANDA. O motor só fica acordado enquanto há movimento
// (física quente, arraste, câmera interpolando) ou um pedido pendente; quando
// não há, ele dorme e volta a zero desenho por segundo. Todo ponto que muda
// algo visível chama pedirFrame(), o único lugar que agenda um rAF.

// Limites do zoom da câmera (clamp do protótipo). Atenção: o fit-to-view do
// enquadrar() usa a própria faixa 0.2–1.5 — é OUTRO limite, não unificar.
const ZOOM_MIN = 0.18
const ZOOM_MAX = 3

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
function lerPaleta() {
  const css = getComputedStyle(document.documentElement)
  const v = (nome) => css.getPropertyValue(nome).trim()
  return {
    habilidade: v('--no-habilidade'),
    conceito: v('--no-conceito'),
    disciplina: v('--no-disciplina'),
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

const GrafoCanvas = forwardRef(function GrafoCanvas(
  {
    nos,
    arestas,
    versao,
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
  const alpha = useRef(0) // "temperatura" da simulação (esfria a cada frame)
  const hoverRef = useRef(null) // nó sob o ponteiro (só o canvas precisa saber — não re-renderiza)
  const selecionadoRef = useRef(null) // espelho da prop para o loop de desenho
  const dragRef = useRef(null) // nó em arraste — a física não integra a posição dele

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
  const dados = useRef({ nos, arestas })
  dados.current = { nos, arestas }
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

  // Física do layout — porte fiel do protótipo. A cada iteração: repulsão entre
  // todos os pares (com anti-colisão garantindo raio+raio+10px entre centros),
  // molas por aresta com comprimento de repouso por relação, gravidade ao
  // centro, damping e esfriamento (alpha). Muta os nós do Map em `dados` — os
  // mesmos objetos do estado da página; o React não re-renderiza por isso, e
  // não precisa: só o canvas lê x/y, a cada frame.
  function fisica() {
    const { nos: mapa, arestas: ars } = dados.current
    const ns = [...mapa.values()]
    const L = { desenvolve: 130, podeSerTrabalhadaEm: 175, progrideDe: 205 }
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const a = ns[i]
        const b = ns[j]
        let dx = b.x - a.x
        let dy = b.y - a.y
        const d = Math.hypot(dx, dy) || 1
        const f = Math.min(2800 / (d * d), 12) * alpha.current
        dx /= d
        dy /= d
        a.vx -= dx * f
        a.vy -= dy * f
        b.vx += dx * f
        b.vy += dy * f
        const min = a.r + b.r + 10
        if (d < min) {
          const e = (min - d) * 0.35
          a.vx -= dx * e
          a.vy -= dy * e
          b.vx += dx * e
          b.vy += dy * e
        }
      }
    }
    ars.forEach((ar) => {
      const a = mapa.get(ar.a)
      const b = mapa.get(ar.b)
      if (!a || !b) return
      let dx = b.x - a.x
      let dy = b.y - a.y
      const d = Math.hypot(dx, dy) || 1
      const f = (d - (L[ar.rel] || 150)) * 0.028 * alpha.current
      dx /= d
      dy /= d
      a.vx += dx * f
      a.vy += dy * f
      b.vx -= dx * f
      b.vy -= dy * f
    })
    ns.forEach((n) => {
      n.vx -= n.x * 0.0045 * alpha.current
      n.vy -= n.y * 0.0045 * alpha.current
      n.vx *= 0.86
      n.vy *= 0.86
      if (dragRef.current && dragRef.current.id === n.id) return
      n.x += n.vx
      n.y += n.vy
    })
    alpha.current *= 0.988
  }

  // assenta o layout de imediato (modo "sem animação" — preferência da G10)
  function assentar(iteracoes) {
    alpha.current = 1
    for (let i = 0; i < iteracoes; i++) fisica()
    alpha.current = 0
    pedirFrame() // as posições mudaram de uma vez: um quadro mostra o resultado
  }

  // recorte novo: reaquece a simulação (alpha = 1) e enquadra depois que o
  // layout abriu (~420ms, como o protótipo); sem animação, assenta na hora
  useEffect(() => {
    hoverRef.current = null // id antigo esmaeceria o grafo novo inteiro até o mouse mexer
    if (semAnimRef.current) {
      assentar(260)
      enquadrar()
      return undefined
    }
    alpha.current = 1
    pedirFrame() // física quente: o loop se mantém acordado sozinho a partir daqui
    const t = setTimeout(enquadrar, 420)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versao])

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
      x0 = Math.min(x0, n.x)
      y0 = Math.min(y0, n.y)
      x1 = Math.max(x1, n.x)
      y1 = Math.max(y1, n.y)
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

  // aproxima/afasta em passos (botões +/− da página), com os clamps do protótipo
  function zoomCam(fator) {
    const c = cam.current
    alvoCam.current = { x: c.x, y: c.y, k: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, c.k * fator)) }
    pedirFrame()
  }

  // leva a câmera até um nó (busca, painel da G7, deep-link da G11)
  function centrarEm(id) {
    const n = dados.current.nos.get(id)
    if (!n) return
    const k = Math.max(cam.current.k, 1)
    alvoCam.current = { x: n.x - offsetPainel() / (2 * k), y: n.y, k }
    pedirFrame()
  }

  // reaquece a simulação sem re-enquadrar (expansão 0.8 / desfazer 0.5, G8);
  // no modo sem animação assenta o layout de uma vez, como o protótipo
  function reaquecer(nivel) {
    if (semAnimRef.current) assentar(nivel >= 0.8 ? 160 : 120)
    else {
      alpha.current = Math.max(alpha.current, nivel)
      pedirFrame()
    }
  }

  useImperativeHandle(ref, () => ({
    centrarEm,
    enquadrar,
    reaquecer,
    assentar, // usado ao ligar o modo "sem animação" com um grafo em cena (G10)
    zoomMais: () => zoomCam(1.35),
    zoomMenos: () => zoomCam(1 / 1.35),
  }))

  // forma do nó por tipo — modo "formas em vez de cores" (G10, daltonismo
  // total): habilidade continua círculo; conceito vira quadrado; disciplina
  // vira triângulo. Constantes do protótipo.
  function tracarNo(ctx, n, r) {
    if (!formasRef.current || n.tipo === 'habilidade') {
      ctx.arc(n.x, n.y, r, 0, 7)
      return
    }
    if (n.tipo === 'conceito') {
      const s = r * 0.92
      ctx.rect(n.x - s, n.y - s, s * 2, s * 2)
      return
    }
    const s = r * 1.22 // disciplina: triângulo
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

    // ---- arestas (com seta; tracejada na progressão entre anos) ----
    ars.forEach((ar) => {
      const a = ns.get(ar.a)
      const b = ns.get(ar.b)
      if (!a || !b) return
      const destaque = foco && (ar.a === foco || ar.b === foco)
      ctx.globalAlpha = foco ? (destaque ? 0.95 : 0.1) : 0.55
      ctx.strokeStyle = destaque ? C.arestaDestaque : C.aresta
      ctx.lineWidth = (destaque ? 2 : 1.2) / k
      ctx.setLineDash(ar.rel === 'progrideDe' ? [6 / k, 5 / k] : [])
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
      ctx.setLineDash([])
      if (k > 0.45) {
        const d = Math.hypot(b.x - a.x, b.y - a.y) || 1
        const ux = (b.x - a.x) / d
        const uy = (b.y - a.y) / d
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
      // chip com o rótulo da relação, só na aresta em destaque
      if (destaque && k > 0.5) {
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        const rot = RELACOES[ar.rel] ? RELACOES[ar.rel].saida : ar.rel
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

    // ---- nós (cor por tipo, anel de seleção, rótulo com halo) ----
    ns.forEach((n) => {
      const apagado = foco && !viz.has(n.id)
      const ehFoco = n.id === foco
      const ehSel = n.id === selecionadoRef.current
      ctx.globalAlpha = apagado ? 0.18 : 1
      const r = n.r + (n.id === hoverRef.current ? 2 : 0)
      if (ehSel) {
        ctx.beginPath()
        tracarNo(ctx, n, r + 5.5)
        ctx.strokeStyle = C[n.tipo]
        ctx.globalAlpha = apagado ? 0.18 : 0.45
        ctx.lineWidth = 2.5 / Math.sqrt(k)
        ctx.stroke()
        ctx.globalAlpha = apagado ? 0.18 : 1
      }
      ctx.beginPath()
      tracarNo(ctx, n, r)
      ctx.fillStyle = C[n.tipo]
      ctx.fill()
      ctx.lineWidth = 2 / Math.sqrt(k)
      ctx.strokeStyle = C.anel
      ctx.stroke()

      const mostrarRotulo = k > 0.55 || ehFoco || ehSel || viz.has(n.id)
      if (mostrarRotulo) {
        ctx.font =
          n.tipo === 'habilidade'
            ? `600 ${10.5 / Math.sqrt(k)}px "JetBrains Mono", monospace`
            : `${n.tipo === 'disciplina' ? 700 : 600} ${(n.tipo === 'disciplina' ? 12.5 : 11.5) / Math.sqrt(k)}px "Figtree", sans-serif`
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

    // tooltip do hover em habilidade
    const hv = hoverRef.current ? ns.get(hoverRef.current) : null
    if (hv && hv.tipo === 'habilidade' && hv.resumo) {
      ctx.font = `600 ${11.5 / k}px "Figtree", sans-serif`
      const tw = ctx.measureText(hv.resumo).width
      const bx = hv.x - tw / 2 - 9 / k
      const by = hv.y - hv.r - 34 / k
      const bw = tw + 18 / k
      const bh = 22 / k
      ctx.fillStyle = C.tooltipBg
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 7 / k)
      else ctx.rect(bx, by, bw, bh)
      ctx.fill()
      ctx.fillStyle = C.tooltipFg
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(hv.resumo, hv.x, by + bh / 2)
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
  // arraste em curso, câmera interpolando — ou um pedido de redesenho pendente.
  // Com o grafo vazio a física não conta (o alpha do recorte novo esquenta a
  // simulação mesmo sem nós, e manteria o loop girando ~6s à toa).
  function precisaContinuar() {
    if (sujo.current) return true
    if (alvoCam.current) return true
    if (semAnimRef.current) return false // sem animação: nada evolui sozinho
    if (dragRef.current) return true
    return alpha.current > 0.012 && dados.current.nos.size > 0
  }

  // Pede um quadro. Se o motor estiver dormindo, acorda; se já estiver acordado,
  // só marca que o próximo quadro tem trabalho a fazer. É o ÚNICO ponto do
  // arquivo que agenda um requestAnimationFrame.
  function pedirFrame() {
    sujo.current = true
    if (!rafRef.current) rafRef.current = requestAnimationFrame(quadro)
  }

  // um quadro: HiDPI + física + câmera com aproximação suave (lerp 0.14/frame)
  function quadro() {
    rafRef.current = 0
    const cv = canvasRef.current
    if (!cv) return // desmontado entre o agendamento e a execução: o motor dorme
    sujo.current = false // o pedido está sendo atendido AGORA
    // Re-resolve os tokens quando o data-theme do <html> troca. Lemos o
    // atributo aqui (e não num efeito atrelado ao ThemeContext) porque o
    // efeito do filho roda ANTES de o Provider aplicar o atributo — a
    // paleta ficaria sempre um toggle atrasada (halo/grid do tema anterior).
    // A chave inclui os overrides inline dos TRÊS tokens --no-* (paleta de
    // daltonismo, G9): lê-se o VALOR escrito no <html>, e não uma prop,
    // para o cache só virar quando os tokens novos já estão aplicados.
    // Os três entram na chave porque paletas distintas compartilham cores
    // (protanopia e deuteranopia diferem só na disciplina).
    const tema = document.documentElement.getAttribute('data-theme') || 'light'
    const estilo = document.documentElement.style
    const chave = `${tema}|${estilo.getPropertyValue('--no-habilidade')}|${estilo.getPropertyValue('--no-conceito')}|${estilo.getPropertyValue('--no-disciplina')}`
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
    // física roda enquanto a simulação está quente (ou durante um arraste)
    const t0 = MEDIR ? performance.now() : 0
    if (!semAnimRef.current && (alpha.current > 0.012 || dragRef.current)) fisica()
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
    // fim do quadro: só reagenda se ainda houver movimento — senão, dorme
    if (precisaContinuar()) rafRef.current = requestAnimationFrame(quadro)
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

  // Rede de segurança: qualquer mudança de dado ou de prop que altere o desenho
  // pede um quadro. A página já reaquece a física ao expandir/desfazer, mas
  // seleção, formas, recortes fundidos e o zoom A/A não passam por lá.
  useEffect(() => {
    pedirFrame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nos, arestas, selecionadoId, formas, semAnim, fontZoom])

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
          n.x = p.x + dragRef.current.dx
          n.y = p.y + dragRef.current.dy
          n.vx = 0
          n.vy = 0
        }
        if (!semAnimRef.current) alpha.current = Math.max(alpha.current, 0.25) // vizinhos acompanham
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
