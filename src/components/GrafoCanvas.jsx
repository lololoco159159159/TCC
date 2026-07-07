import { useEffect, useRef } from 'react'
import { RELACOES } from '../data/mockFuseki'

// Canvas 2D do grafo de conhecimento — porte fiel do motor do protótipo
// (design/prototipo_grafo.html). Etapas G4+G5: render (grid pontilhado com
// parallax, câmera com aproximação suave, arestas com seta — tracejadas em
// progrideDe —, nós por tipo com rótulo+halo, enquadrar fit-to-view) + FÍSICA
// (fisica(): repulsão + anti-colisão + molas por relação + gravidade ao centro,
// com esfriamento por alpha; assentar(N) resolve o layout de uma vez para o
// modo "sem animação" da G10). As interações de ponteiro (G6) entram na próxima
// etapa — hoverRef/selecionadoRef/dragRef já existem para elas. As cores vêm
// dos tokens CSS (claro/escuro), resolvidas por getComputedStyle.

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

function GrafoCanvas({ nos, arestas, versao, semAnim = false }) {
  const canvasRef = useRef(null)
  const cam = useRef({ x: 0, y: 0, k: 1 })
  const alvoCam = useRef(null)
  const paleta = useRef(null)
  const temaLido = useRef('') // tema cujos tokens estão em `paleta`
  const alpha = useRef(0) // "temperatura" da simulação (esfria a cada frame)
  const hoverRef = useRef(null) // preenchidos na G6 (interações)
  const selecionadoRef = useRef(null)
  const dragRef = useRef(null) // nó em arraste (G6) — a física não integra a posição dele

  // dados/props sempre atuais para o loop de desenho (sem religar o RAF a cada render)
  const dados = useRef({ nos, arestas })
  dados.current = { nos, arestas }
  const semAnimRef = useRef(semAnim)
  semAnimRef.current = semAnim

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
  }

  // recorte novo: reaquece a simulação (alpha = 1) e enquadra depois que o
  // layout abriu (~420ms, como o protótipo); sem animação, assenta na hora
  useEffect(() => {
    if (semAnimRef.current) {
      assentar(260)
      enquadrar()
      return undefined
    }
    alpha.current = 1
    const t = setTimeout(enquadrar, 420)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versao])

  // G7: quando o painel de detalhe existir, descontar sua largura do palco
  const offsetPainel = () => 0

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
  }

  // forma do nó por tipo (círculo hoje; quadrado/triângulo entram no modo
  // "formas em vez de cores" da G10)
  function tracarNo(ctx, n, r) {
    ctx.arc(n.x, n.y, r, 0, 7)
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

    // foco (hover/seleção) destaca vizinhos e esmaece o resto — ativo na G6
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
      // chip com o rótulo da relação, só na aresta em destaque (G6)
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

    // tooltip do hover em habilidade (ativa na G6)
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

  // loop de desenho: HiDPI + câmera com aproximação suave (lerp 0.14/frame).
  // A física (G5) será chamada daqui quando existir.
  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const cv = canvasRef.current
      if (!cv) return
      // Re-resolve os tokens quando o data-theme do <html> troca. Lemos o
      // atributo aqui (e não num efeito atrelado ao ThemeContext) porque o
      // efeito do filho roda ANTES de o Provider aplicar o atributo — a
      // paleta ficaria sempre um toggle atrasada (halo/grid do tema anterior).
      const tema = document.documentElement.getAttribute('data-theme') || 'light'
      if (!paleta.current || tema !== temaLido.current) {
        temaLido.current = tema
        paleta.current = lerPaleta()
      }
      const rt = cv.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      if (cv.width !== Math.round(rt.width * dpr) || cv.height !== Math.round(rt.height * dpr)) {
        cv.width = Math.round(rt.width * dpr)
        cv.height = Math.round(rt.height * dpr)
      }
      // física roda enquanto a simulação está quente (ou durante um arraste, G6)
      if (!semAnimRef.current && (alpha.current > 0.012 || dragRef.current)) fisica()
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
      desenhar(cv, rt)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas
      ref={canvasRef}
      data-grafo-canvas="1"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  )
}

export default GrafoCanvas
