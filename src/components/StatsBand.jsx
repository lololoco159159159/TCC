import { Fragment, useEffect, useRef, useState } from 'react'
import { estatisticas } from '../data/mockFuseki'

// Banda de estatísticas: 3 números que contam de 0 até o valor final quando a
// faixa entra na tela (uma única vez), espelhando o protótipo. Um único
// progresso `cp` (0→1, easeInOutCubic em 1.4s) move os três em sincronia.
// Os valores vêm do "back-end" (mock do Fuseki em src/data/mockFuseki.js) —
// quando o endpoint SPARQL real existir, esta banda o refletirá sem mudanças.

const DUR = 1400 // ms
const EST = estatisticas() // { habilidades, componentes, anoInicial, anoFinal }

function StatsBand() {
  const ref = useRef(null)
  const [cp, setCp] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let raf = 0
    let started = false

    const startCount = () => {
      if (started) return
      started = true
      const t0 = performance.now()
      const tick = () => {
        const p = Math.min(1, (performance.now() - t0) / DUR)
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2 // easeInOutCubic
        setCp(e)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    // Dispara uma única vez quando ~35% da faixa está visível. `threshold` é
    // robusto a altura de viewport e zoom de fonte (um `rootMargin` negativo
    // embaixo já prendeu os contadores em 0 quando a faixa era o último
    // elemento da página).
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect()
          startCount()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  const stats = [
    { value: String(Math.round(EST.habilidades * cp)), label: 'habilidades BNCC mapeadas' },
    { value: String(Math.round(EST.componentes * cp)), label: 'componentes curriculares conectados' },
    {
      value: `${EST.anoInicial}.º – ${Math.round(EST.anoFinal * cp)}.º ano`,
      label: 'anos disponíveis agora',
    },
  ]

  return (
    <section
      ref={ref}
      id="statsBand"
      style={{
        background: 'var(--bg2)',
        borderTop: '1px solid var(--pill-border)',
        borderBottom: '1px solid var(--pill-border)',
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '48px 48px',
          display: 'flex',
          alignItems: 'stretch',
          gap: 0,
        }}
      >
        {stats.map((s, i) => (
          <Fragment key={s.label}>
            {i > 0 && <div style={{ width: 1, background: 'var(--edge)', flex: 'none' }} />}
            <div style={{ flex: 1, textAlign: 'center', padding: '0 20px' }}>
              <div style={{ font: "700 clamp(40px, 5vw, 64px)/1 'Spectral', serif", color: 'var(--gold)' }}>
                {s.value}
              </div>
              <div
                style={{
                  font: "12px/1 'JetBrains Mono', monospace",
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginTop: 14,
                }}
              >
                {s.label}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  )
}

export default StatsBand
