import { useEffect, useRef } from 'react'
import { useTheme } from '../../context/useTheme'

// Fundo de vértices das telas de conta (A2 do roadmap, ESTADO_ATUAL.md §4.3).
// Porte VERBATIM do custom element <particle-network> do protótipo final
// (adaptação sem jQuery de JulianLaval/canvas-particle-network): partículas
// criadas todas no mount derivam pela tela e se conectam por arestas quando
// próximas — um grafo "vivo" de fundo. Uso no overlay de auth do protótipo:
// line-color #B3A988 · particle-colors #2F9E5F,#8C3E18,#C9A23F,#A89D80 ·
// velocity 0.6 (density e line-distance ficam nos defaults 13000/200).
//
// Desvios documentados do protótipo:
// - Cores via tokens --conta-* resolvidos por getComputedStyle e re-lidos na
//   troca de data-theme (padrão GrafoCanvas): a partícula guarda o ÍNDICE da
//   cor, não o hex, para o campo recolorir na hora sem ser recriado.
// - Dimensões e coordenadas via getBoundingClientRect() (o App aplica
//   `zoom: fontZoom` no root — offsetWidth é pré-zoom e desalinharia os
//   cliques com A/A ≠ 100%). O zoom não dispara o ResizeObserver (o box em
//   px CSS não muda), então fontZoom é dependência do efeito: mudou, o campo
//   é recriado — mesmo comportamento do resize.
// - edugraphPrefs.semAnim ligado → campo ESTÁTICO (D6): partículas com
//   opacity 1, frame único, sem nó-cursor nem spawn por clique; um
//   MutationObserver repinta o frame na troca de tema (não há loop RAF).
// - No resize o protótipo recria só as partículas ambientes e o nó-cursor
//   vira referência órfã fora do array; aqui ele é zerado (o mousemove
//   seguinte o recria — sem partícula fantasma).
// - Parâmetros do campo POR TEMA (decisão do autor): o modo ESCURO segue o
//   protótipo verbatim (density 13000 · lineWidth 0.7 · raio 1.4–2.6); o
//   CLARO usa o ajuste do autor (campo mais denso, nós menores e arestas
//   mais finas). Trocar o tema recria o campo (a densidade muda).

// Constantes do protótipo (uso do overlay + defaults do elemento)
const VELOCIDADE = 0.6 // atributo velocity do overlay
const DISTANCIA_ARESTA = 200 // D: arestas só entre pares mais próximos que isso
const FADE_POR_FRAME = 0.012 // fade-in das partículas novas
const RAJADA_CLIQUE = 3 // spawnQuantity: 3 no clique, depois 1 por tick
const TICK_SPAWN_MS = 50 // gotejamento enquanto o botão fica pressionado
const MARGEM_BOUNCE = 100 // partícula rebate a ±100px além das bordas
const DPR_MAX = 2

// Parâmetros por tema (densidade = px² por partícula → qtd = w·h/densidade)
const PARAMS_CAMPO = {
  light: { densidade: 7500, larguraAresta: 0.4, raioMin: 2, raioMax: 1.4 }, // ajuste do autor
  dark: { densidade: 13000, larguraAresta: 0.7, raioMin: 2.4, raioMax: 2.6 }, // protótipo verbatim
}

function rand(min, max) {
  return Math.random() * (max - min) + min
}

// Lê os tokens do design system para uso no canvas (que não entende var()).
function lerCores() {
  const css = getComputedStyle(document.documentElement)
  const v = (nome) => css.getPropertyValue(nome).trim()
  return {
    aresta: v('--conta-aresta'),
    nos: [v('--conta-no-1'), v('--conta-no-2'), v('--conta-no-3'), v('--conta-no-4')],
  }
}

// Preferência de acessibilidade "desativar animações" (mesma chave e validação
// campo a campo da página de grafos — ver lerPrefs em Grafos.jsx)
function lerSemAnim() {
  try {
    const p = JSON.parse(localStorage.getItem('edugraphPrefs') || '{}')
    return typeof p.semAnim === 'boolean' ? p.semAnim : false
  } catch {
    return false
  }
}

function FundoVertices() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const { fontZoom } = useTheme() // zoom do widget A/A — muda o rect sem disparar o RO

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const semAnim = lerSemAnim()
    wrap.style.cursor = semAnim ? 'default' : 'crosshair'

    let w = 0
    let h = 0
    let particulas = []
    let interacao = null // o nó que segue o cursor
    let segurando = false
    let spawnId = 0
    let raf = 0
    let cores = lerCores()
    let temaDasCores = document.documentElement.getAttribute('data-theme') || 'light'
    let params = PARAMS_CAMPO[temaDasCores] || PARAMS_CAMPO.light

    // ---- partículas (Particle do protótipo) ----
    function novaParticula(x, y) {
      return {
        idxCor: Math.floor(Math.random() * cores.nos.length),
        raio: rand(params.raioMin, params.raioMax),
        opacidade: semAnim ? 1 : 0, // estático nasce visível (não há frames de fade)
        x: x ?? Math.random() * w,
        y: y ?? Math.random() * h,
        vx: (Math.random() - 0.5) * VELOCIDADE,
        vy: (Math.random() - 0.5) * VELOCIDADE,
      }
    }

    function atualizar(p) {
      if (p.opacidade < 1) p.opacidade += FADE_POR_FRAME
      else p.opacidade = 1
      if (p.x > w + MARGEM_BOUNCE || p.x < -MARGEM_BOUNCE) p.vx = -p.vx
      if (p.y > h + MARGEM_BOUNCE || p.y < -MARGEM_BOUNCE) p.vy = -p.vy
      p.x += p.vx
      p.y += p.vy
    }

    // ---- dimensões e campo ----
    function dimensionar() {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX)
      const r = wrap.getBoundingClientRect() // pós-zoom: casa com clientX/clientY
      w = r.width
      h = r.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function criarParticulas() {
      particulas = []
      interacao = null
      const qtd = (w * h) / params.densidade
      for (let i = 0; i < qtd; i++) particulas.push(novaParticula())
    }

    // ---- desenho (update() do protótipo) ----
    function pintar(anima) {
      // re-resolve tokens E parâmetros quando o data-theme do <html> troca
      // (padrão GrafoCanvas); densidade/raio mudam com o tema → recria o campo
      const tema = document.documentElement.getAttribute('data-theme') || 'light'
      if (tema !== temaDasCores) {
        temaDasCores = tema
        cores = lerCores()
        params = PARAMS_CAMPO[tema] || PARAMS_CAMPO.light
        criarParticulas()
      }
      const D = DISTANCIA_ARESTA
      ctx.clearRect(0, 0, w, h)
      ctx.globalAlpha = 1
      for (let i = 0; i < particulas.length; i++) {
        for (let j = particulas.length - 1; j > i; j--) {
          const p1 = particulas[i]
          const p2 = particulas[j]
          // rejeição barata antes da distância euclidiana (como no protótipo)
          let d = Math.min(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y))
          if (d > D) continue
          d = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
          if (d > D) continue
          ctx.beginPath()
          ctx.strokeStyle = cores.aresta
          ctx.globalAlpha = ((D - d) / D) * p1.opacidade * p2.opacidade
          ctx.lineWidth = params.larguraAresta
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      }
      for (let k = 0; k < particulas.length; k++) {
        const p = particulas[k]
        if (anima) atualizar(p)
        ctx.beginPath()
        ctx.fillStyle = cores.nos[p.idxCor]
        ctx.globalAlpha = p.opacidade
        ctx.arc(p.x, p.y, p.raio, 0, 2 * Math.PI)
        ctx.fill()
      }
    }

    function quadro() {
      pintar(true)
      raf = requestAnimationFrame(quadro)
    }

    // ---- interação (bindInteraction do protótipo) ----
    function posDe(e) {
      const r = wrap.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    function criarNoCursor() {
      interacao = novaParticula()
      interacao.vx = 0
      interacao.vy = 0
      interacao.opacidade = 1
      particulas.push(interacao)
    }
    function removerNoCursor() {
      const i = particulas.indexOf(interacao)
      if (i > -1) particulas.splice(i, 1)
      interacao = null
    }
    function iniciarSpawn(x, y) {
      // clique (e segurar) cria vértices no ponto do cursor
      segurando = true
      if (!interacao) criarNoCursor()
      interacao.x = x
      interacao.y = y
      let contador = 0
      let qtd = RAJADA_CLIQUE
      clearInterval(spawnId)
      spawnId = setInterval(() => {
        if (segurando && interacao) {
          if (contador === 1) qtd = 1 // rajada no clique, depois gotejamento
          for (let i = 0; i < qtd; i++) particulas.push(novaParticula(interacao.x, interacao.y))
        } else {
          clearInterval(spawnId)
        }
        contador++
      }, TICK_SPAWN_MS)
    }
    const aoMover = (e) => {
      const p = posDe(e)
      if (!interacao) criarNoCursor()
      interacao.x = p.x
      interacao.y = p.y
    }
    const aoPressionar = (e) => {
      const p = posDe(e)
      iniciarSpawn(p.x, p.y)
    }
    const aoSoltar = () => {
      segurando = false
    }
    const aoSair = () => {
      segurando = false
      removerNoCursor()
    }
    const aoToqueMover = (e) => {
      const t = e.changedTouches[0]
      const r = wrap.getBoundingClientRect()
      if (!interacao) criarNoCursor()
      interacao.x = t.clientX - r.left
      interacao.y = t.clientY - r.top
    }
    const aoToqueIniciar = (e) => {
      const t = e.changedTouches[0]
      const r = wrap.getBoundingClientRect()
      iniciarSpawn(t.clientX - r.left, t.clientY - r.top)
    }
    const aoToqueFim = () => {
      segurando = false
      removerNoCursor()
    }

    // ---- montagem ----
    dimensionar()
    criarParticulas()

    // resize recria o campo (perde os nós clicados — fiel ao protótipo)
    const ro = new ResizeObserver(() => {
      dimensionar()
      criarParticulas()
      if (semAnim) pintar(false)
    })
    ro.observe(wrap)

    let mo = null
    if (semAnim) {
      // frame único; só a troca de tema repinta (pintar re-lê os tokens)
      pintar(false)
      mo = new MutationObserver(() => pintar(false))
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    } else {
      wrap.addEventListener('mousemove', aoMover)
      wrap.addEventListener('mousedown', aoPressionar)
      wrap.addEventListener('mouseleave', aoSair)
      window.addEventListener('mouseup', aoSoltar) // soltar fora do canvas também para o spawn
      wrap.addEventListener('touchmove', aoToqueMover, { passive: true })
      wrap.addEventListener('touchstart', aoToqueIniciar, { passive: true })
      wrap.addEventListener('touchend', aoToqueFim)
      raf = requestAnimationFrame(quadro)
    }

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(spawnId)
      ro.disconnect()
      if (mo) mo.disconnect()
      if (!semAnim) {
        wrap.removeEventListener('mousemove', aoMover)
        wrap.removeEventListener('mousedown', aoPressionar)
        wrap.removeEventListener('mouseleave', aoSair)
        window.removeEventListener('mouseup', aoSoltar)
        wrap.removeEventListener('touchmove', aoToqueMover)
        wrap.removeEventListener('touchstart', aoToqueIniciar)
        wrap.removeEventListener('touchend', aoToqueFim)
      }
    }
  }, [fontZoom])

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}

export default FundoVertices
