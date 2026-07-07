import { useEffect, useRef, useState } from 'react'

// Seção "Cada matéria tem sua rede." — grafo-globo interativo (fiel ao protótipo).
// É puro SVG/DOM: 15 nós numa esfera (vetores unitários) projetados em 2D, que
// gira 360° conforme o scroll prende a seção na tela; o globo desliza para a
// esquerda enquanto o painel de texto surge à direita, e o hover num nó realça
// as conexões (arestas e vizinhos). Sem three.js nem fundo de partículas (são
// de outras seções do protótipo).

// Nós na superfície de uma esfera (vetores unitários); projetados abaixo.
const NODES = [
  { id: 'pc', label: 'Pensamento Computacional', vec: [0, 0, 1], hub: true },
  { id: 'algoritmo', label: 'Algoritmo', vec: [0.875, 0.284, 0.392] },
  { id: 'cultura', label: 'Cultura Digital', vec: [0.0, 0.92, 0.392] },
  { id: 'matematica', label: 'Matemática', vec: [-0.875, 0.284, 0.392] },
  { id: 'programacao', label: 'Programação', vec: [-0.541, -0.744, 0.392] },
  { id: 'logica', label: 'Lógica', vec: [0.541, -0.744, 0.392] },
  { id: 'dados', label: 'Dados', vec: [0.376, 0.518, -0.768] },
  { id: 'portugues', label: 'Português', vec: [-0.376, 0.518, -0.768] },
  { id: 'ciencias', label: 'Ciências', vec: [-0.609, -0.198, -0.768] },
  { id: 'decomposicao', label: 'Decomposição', vec: [0.0, -0.64, -0.768] },
  { id: 'abstracao', label: 'Abstração', vec: [0.609, -0.198, -0.768] },
  { id: 'artes', label: 'Artes', vec: [-0.547, 0.752, 0.367] },
  { id: 'designdig', label: 'Design Digital', vec: [0.564, 0.777, 0.279] },
  { id: 'historia', label: 'História', vec: [-0.856, -0.278, 0.436] },
  { id: 'evoltec', label: 'Evolução Tecnológica', vec: [0.894, -0.29, 0.341] },
]

const EDGES = [
  { a: 'matematica', b: 'algoritmo', label: 'base para' },
  { a: 'matematica', b: 'pc', label: 'apoia' },
  { a: 'matematica', b: 'logica', label: 'fundamenta' },
  { a: 'algoritmo', b: 'logica', label: 'usa' },
  { a: 'algoritmo', b: 'pc', label: 'compõe' },
  { a: 'algoritmo', b: 'dados', label: 'organiza' },
  { a: 'algoritmo', b: 'programacao', label: 'usado em' },
  { a: 'pc', b: 'ciencias', label: 'aplicado em' },
  { a: 'pc', b: 'dados' },
  { a: 'pc', b: 'portugues' },
  { a: 'pc', b: 'cultura', label: 'amplia' },
  { a: 'pc', b: 'programacao', label: 'vira' },
  { a: 'abstracao', b: 'algoritmo', label: 'base para' },
  { a: 'abstracao', b: 'logica', label: 'liga' },
  { a: 'abstracao', b: 'pc', label: 'parte de' },
  { a: 'dados', b: 'programacao', label: 'alimenta' },
  { a: 'decomposicao', b: 'pc', label: 'parte de' },
  { a: 'decomposicao', b: 'portugues', label: 'apoia' },
  { a: 'artes', b: 'designdig', label: 'expande' },
  { a: 'historia', b: 'evoltec', label: 'estuda a' },
  { a: 'evoltec', b: 'cultura', label: 'molda' },
]

// Geometria da esfera projetada no viewBox 1180x680
const CX = 590
const CY = 340
const R = 322
const clamp01 = (x) => Math.max(0, Math.min(1, x))

function GraphSection({ onGrafos }) {
  const zoneRef = useRef(null)
  const [sp, setSp] = useState(0) // progresso de scroll 0..1
  const [hover, setHover] = useState(null)
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1400)

  // Progresso de scroll por rAF (imune a throttling de evento), espelhando o
  // protótipo: o globo gira/desliza enquanto a seção fica presa (sticky).
  useEffect(() => {
    let alive = true
    let raf = 0
    const tick = () => {
      if (!alive) return
      const zone = zoneRef.current
      if (zone) {
        const sh = zone.offsetHeight - window.innerHeight
        if (sh > 0) {
          const r = zone.getBoundingClientRect()
          const pct = clamp01(-r.top / (sh * 0.68))
          setSp((prev) => (Math.abs(pct - prev) > 0.0012 ? pct : prev))
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [])

  // O transform do globo depende da largura da janela — re-renderiza no resize.
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // easeInOutCubic para uma aceleração/desaceleração suave do deslize
  const ease = sp < 0.5 ? 4 * sp * sp * sp : 1 - Math.pow(-2 * sp + 2, 3) / 2
  const smoothEase = 'cubic-bezier(.22,.61,.36,1)'

  // Globo desliza para a esquerda e cresce um pouco ao "encaixar"
  const shiftPx = (ease * vw * 0.42).toFixed(1)
  const globeScale = (1.06 + ease * 0.1).toFixed(3)
  const globeCanvasStyle = {
    position: 'relative',
    width: 1180,
    maxWidth: '100%',
    aspectRatio: '1180 / 680',
    height: 'auto',
    margin: '0 auto',
    transform: `translateX(-${shiftPx}px) scale(${globeScale})`,
    transformOrigin: 'center',
    transition: `transform .55s ${smoothEase}`,
    willChange: 'transform',
  }

  // Painel de texto surge/desliza no lado direito depois que o globo passa
  const textOp = clamp01((ease - 0.32) / 0.5)
  const textTransX = ((1 - ease) * 64).toFixed(1)
  const textPanelStyle = {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    display: 'flex',
    alignItems: 'center',
    padding: '0 clamp(40px, 5vw, 88px)',
    opacity: textOp,
    transform: `translateX(${textTransX}px)`,
    transition: `opacity .55s ease, transform .55s ${smoothEase}`,
    pointerEvents: textOp > 0.6 ? 'auto' : 'none',
    zIndex: 8,
  }

  const tooltipOp = Math.max(0, 1 - sp * 4)

  // ---- projeção do globo (gira 360° em torno do eixo vertical conforme o scroll) ----
  const spin = sp * Math.PI * 2
  const spinCos = Math.cos(spin)
  const spinSin = Math.sin(spin)
  const nodes = NODES.map((n) => {
    const [vx, vy, vz] = n.vec
    const x = vx * spinCos + vz * spinSin
    const y = vy
    const z = -vx * spinSin + vz * spinCos
    const len = Math.hypot(x, y, z) || 1
    const uz = z / len
    return {
      ...n,
      cx: CX + (x / len) * R,
      cy: CY + (y / len) * R,
      z: uz,
      depthScale: 0.62 + ((uz + 1) / 2) * 0.52, // 0.62 (fundo) .. 1.14 (frente)
      depthOp: 0.42 + ((uz + 1) / 2) * 0.58, // 0.42 (fundo) .. 1 (frente)
    }
  })
  const nodeMap = {}
  nodes.forEach((n) => {
    nodeMap[n.id] = n
  })

  // adjacência para escurecer o que não está conectado no hover
  const connected = new Set()
  if (hover) {
    connected.add(hover)
    EDGES.forEach((e) => {
      if (e.a === hover) connected.add(e.b)
      if (e.b === hover) connected.add(e.a)
    })
  }

  const edges = EDGES.map((e, i) => {
    const A = nodeMap[e.a]
    const B = nodeMap[e.b]
    const avgZ = (A.z + B.z) / 2
    const active = hover ? e.a === hover || e.b === hover : false
    const sw = active ? 2.4 : 0.7 + ((avgZ + 1) / 2) * 1.1
    const op = hover ? (active ? 1 : 0.18) : active ? 1 : 0.22 + ((avgZ + 1) / 2) * 0.45
    const showLabel = !!e.label && (hover ? active : false)
    return {
      key: 'e' + i,
      x1: A.cx,
      y1: A.cy,
      x2: B.cx,
      y2: B.cy,
      stroke: active ? 'var(--green)' : 'var(--edge)',
      sw,
      op,
      label: e.label,
      showLabel,
      lx: (A.cx + B.cx) / 2,
      ly: (A.cy + B.cy) / 2,
    }
  })

  return (
    <div ref={zoneRef} id="graphScrollZone" style={{ position: 'relative', height: '280vh' }}>
      <section
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          background: 'var(--bg2)',
          borderTop: '1px solid var(--pill-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* fundo pontilhado */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(var(--dot-color) 1.3px, transparent 1.3px)',
            backgroundSize: '24px 24px',
            opacity: 0.55,
            pointerEvents: 'none',
          }}
        />

        {/* tooltip flutuante (some conforme o scroll) */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 20,
            padding: '20px 0 6px',
            opacity: tooltipOp,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 16px',
              borderRadius: 999,
              border: '1px solid var(--pill-border)',
              background: 'color-mix(in srgb, var(--bg2) 72%, transparent)',
              backdropFilter: 'blur(7px)',
              WebkitBackdropFilter: 'blur(7px)',
              boxShadow: '0 6px 20px -10px rgba(0,0,0,.25)',
            }}
          >
            <span
              style={{
                font: "12.5px/1 'JetBrains Mono', monospace",
                letterSpacing: '.04em',
                color: 'var(--muted)',
              }}
            >
              Passe o mouse nas matérias para ver as conexões
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--green)',
                color: '#fff',
                fontSize: 11,
              }}
            >
              ›
            </span>
          </div>
        </div>

        {/* área principal: globo + painel de texto */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* canvas do grafo (desliza para a esquerda no scroll) */}
          <div style={globeCanvasStyle}>
            <svg
              viewBox="0 0 1180 680"
              width="100%"
              height="100%"
              style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
            >
              <defs>
                <radialGradient id="globeGlow" cx="50%" cy="42%" r="60%">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity="0.16" />
                  <stop offset="55%" stopColor="var(--green)" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="590" cy="340" r="322" fill="url(#globeGlow)" />
              {/* wireframe do globo */}
              <g stroke="var(--edge)" fill="none" opacity="0.55">
                <circle cx="590" cy="340" r="322" strokeWidth="1.4" />
                <ellipse cx="590" cy="340" rx="322" ry="167" strokeWidth="1" />
                <ellipse cx="590" cy="340" rx="322" ry="81" strokeWidth="1" />
                <ellipse cx="590" cy="340" rx="167" ry="322" strokeWidth="1" />
                <ellipse cx="590" cy="340" rx="81" ry="322" strokeWidth="1" />
                <line x1="590" y1="18" x2="590" y2="662" strokeWidth="1" />
                <line x1="268" y1="340" x2="912" y2="340" strokeWidth="1" />
              </g>
              {/* arestas */}
              {edges.map((e) => (
                <line
                  key={e.key}
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  stroke={e.stroke}
                  strokeWidth={e.sw}
                  strokeLinecap="round"
                  opacity={e.op}
                  style={{ transition: 'opacity .3s' }}
                />
              ))}
            </svg>

            {/* rótulos das arestas (aparecem no hover) */}
            {edges.map((e) => (
              <div
                key={e.key + 'l'}
                style={{
                  position: 'absolute',
                  left: `${((e.lx / 1180) * 100).toFixed(3)}%`,
                  top: `${((e.ly / 680) * 100).toFixed(3)}%`,
                  transform: 'translate(-50%, -50%)',
                  display: e.showLabel ? 'flex' : 'none',
                  alignItems: 'center',
                  padding: '3px 11px',
                  borderRadius: 999,
                  background: 'var(--bg)',
                  color: 'var(--green)',
                  border: '1px solid var(--green)',
                  font: "12px/1 'JetBrains Mono', monospace",
                  whiteSpace: 'nowrap',
                  zIndex: 6,
                }}
              >
                {e.label}
              </div>
            ))}

            {/* nós */}
            {nodes.map((n) => {
              const isHub = !!n.hub
              const hovered = hover === n.id
              const active = !hover || connected.has(n.id) || isHub
              const filled = isHub || hovered
              const op = active ? n.depthOp : n.depthOp * 0.32
              const scale = n.depthScale * (hovered ? 1.16 : 1)
              const zIndex = Math.round((n.z + 1) * 100) + (isHub ? 400 : 0) + (hovered ? 900 : 0)
              const bg = filled ? 'var(--green)' : 'var(--pill-bg)'
              const color = filled ? '#fff' : 'var(--text)'
              const border = filled ? 'var(--green)' : 'var(--pill-border)'
              const dotColor = filled ? '#fff' : 'var(--muted)'
              const shadow = isHub
                ? '0 4px 14px -9px rgba(0,0,0,0.30)'
                : filled
                  ? '0 8px 22px -8px var(--green)'
                  : `0 ${4 + (n.z + 1) * 4}px ${10 + (n.z + 1) * 8}px -8px rgba(0,0,0,${(
                      0.1 +
                      (n.z + 1) * 0.07
                    ).toFixed(3)})`
              return (
                <div
                  key={n.id}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    position: 'absolute',
                    left: `${((n.cx / 1180) * 100).toFixed(3)}%`,
                    top: `${((n.cy / 680) * 100).toFixed(3)}%`,
                    zIndex,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transformOrigin: 'center',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 999,
                    background: bg,
                    color,
                    border: `1px solid ${border}`,
                    boxShadow: shadow,
                    fontWeight: 600,
                    fontSize: isHub ? 15 : 13,
                    padding: isHub ? '9px 17px' : '6px 13px',
                    cursor: 'pointer',
                    opacity: op,
                    whiteSpace: 'nowrap',
                    transition:
                      'opacity .35s ease, box-shadow .35s ease, transform .4s cubic-bezier(.4,1.25,.5,1)',
                    userSelect: 'none',
                  }}
                >
                  <span
                    style={{ width: 7, height: 7, borderRadius: '50%', flex: 'none', background: dotColor }}
                  />
                  <span>{n.label}</span>
                </div>
              )
            })}
          </div>

          {/* painel de texto (surge da direita no scroll) */}
          <div style={textPanelStyle}>
            <div style={{ maxWidth: 420, color: 'var(--text)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  font: "12px/1 'JetBrains Mono', monospace",
                  letterSpacing: '.14em',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  marginBottom: 22,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)' }} />
                <span>Conexões da BNCC</span>
              </div>
              <h2
                style={{
                  margin: '0 0 22px',
                  font: "700 clamp(34px, 3vw, 52px)/1.06 'Spectral', serif",
                  letterSpacing: '-.02em',
                  color: 'var(--text)',
                }}
              >
                Cada matéria
                <br />
                tem sua <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>rede.</em>
              </h2>
              <p style={{ margin: '0 0 30px', fontSize: 17, lineHeight: 1.65, color: 'var(--muted)' }}>
                A BNCC de Computação não existe isolada — matemática fundamenta algoritmos, português
                sustenta a comunicação de dados, ciências ganham uma camada computacional.
              </p>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onGrafos?.()
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--green)',
                  textDecoration: 'none',
                  borderBottom: '1px solid',
                  paddingBottom: 3,
                }}
              >
                Ver todos os grafos →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default GraphSection
