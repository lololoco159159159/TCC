import { Fragment, useEffect, useRef, useState } from 'react'
import { estatisticasDoGrafo } from '../data/resumoGrafo'

// Banda de estatísticas: 3 números que contam de 0 até o valor final quando a
// faixa entra na tela (uma única vez), espelhando o protótipo. Um único
// progresso `cp` (0→1, easeInOutCubic em 1.4s) move os três em sincronia.
// N9 (integração com o Neo4j): os valores vêm de uma consulta de agregação no
// grafo (src/data/resumoGrafo.js) — habilidades, unidades temáticas (no lugar
// de "componentes curriculares", que o modelo ainda não tem; decisão do autor)
// e os anos disponíveis. A contagem só começa quando o dado CHEGOU e a faixa
// está visível; com o Neo4j fora do ar, os números ficam em "—" e a página segue.

const DUR = 1400 // ms

function StatsBand() {
  const ref = useRef(null)
  const [cp, setCp] = useState(0)
  const [est, setEst] = useState(null) // { habilidades, unidades, anos } — null enquanto não chega (ou se falhou)

  useEffect(() => {
    let vivo = true
    estatisticasDoGrafo()
      .then((e) => vivo && setEst(e))
      .catch(() => {}) // sem dado: fica no "—"
    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || !est) return undefined
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
  }, [est])

  const contar = (v) => (est ? String(Math.round(v * cp)) : '—')
  // anos: um só → conta "0.º ano" → "1.º ano"; vários → "1.º – N.º ano" (o último
  // conta, como antes). Com um ano só, a contagem é de um único passo: com
  // Math.round ele viraria na METADE da animação (rápido demais, a pedido do
  // autor); com Math.floor vira só no fim, junto com os outros números
  const anos = est ? est.anos : []
  let valorAnos = '—'
  if (anos.length === 1) valorAnos = `${Math.floor(anos[0] * cp)}.º ano`
  else if (anos.length > 1) valorAnos = `${anos[0]}.º – ${Math.round(anos[anos.length - 1] * cp)}.º ano`
  const stats = [
    { value: contar(est?.habilidades), label: 'habilidades BNCC mapeadas' },
    { value: contar(est?.unidades), label: 'unidades temáticas conectadas' },
    {
      value: valorAnos,
      label: anos.length > 1 ? 'anos do fundamental disponíveis agora' : 'ano do fundamental disponível agora',
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
