import { useEffect, useRef, useState } from 'react'
import depoimentos from '../data/depoimentos'

// Seção "Quem ensina, sabe o que funciona." — depoimentos.
// Porte SIMPLIFICADO do protótipo (que usa three.js/WebGL numa parede 3D): aqui é
// puro DOM/CSS. Layout fiel ao protótipo: cabeçalho no topo-esquerda; legenda
// (nº + nome + função/etapa) à esquerda; UM card grande à direita, levemente
// inclinado, com o depoimento em destaque; barra de progresso na base. Uma zona
// sticky de 300vh prende a seção e o scroll avança pelos 5 depoimentos — o card
// ativo desliza dando lugar ao próximo. Sem three.js nem dependências novas.

const N = depoimentos.length
const clamp01 = (x) => Math.max(0, Math.min(1, x))
const dois = (n) => String(n).padStart(2, '0')

function TestimonialsSection() {
  const zoneRef = useRef(null)
  const [sp, setSp] = useState(0) // progresso de scroll 0..1
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1400)
  const [wh, setWh] = useState(typeof window !== 'undefined' ? window.innerHeight : 900)

  // Progresso de scroll por rAF (imune a throttling de evento), como em GraphSection.
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
          // 0.82: o último card "descansa" antes do fim do pin (igual ao protótipo)
          const pct = clamp01(-r.top / (sh * 0.82))
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

  // O tamanho do card depende das dimensões da janela.
  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth)
      setWh(window.innerHeight)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // posição contínua (0..N-1) e card ativo
  const pos = sp * (N - 1)
  const activeIndex = Math.round(pos)
  const ativo = depoimentos[activeIndex]

  // dimensões responsivas do card (retrato 14:18) — o maior possível pela altura
  // disponível, sem invadir a barra de progresso, e limitado pela largura da área.
  let cardH = Math.max(520, Math.min(wh - 150, 960))
  let cardW = cardH * (14 / 18)
  if (cardW > vw * 0.54) {
    cardW = vw * 0.54
    cardH = cardW * (18 / 14)
  }

  return (
    <div ref={zoneRef} id="testiScrollZone" style={{ position: 'relative', height: '300vh' }}>
      <section
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: 'var(--testi-bg)',
          borderTop: '1px solid var(--pill-border)',
        }}
      >
        {/* ---- faixas decorativas (linhas da "parede") ---- */}
        <svg
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
        >
          {/* faixas hugando os cantos, inclinadas como a "parede" em perspectiva
              (topo sobe para a direita; base desce para a direita) */}
          <line x1="-2%" y1="10%" x2="102%" y2="-6%" stroke="var(--edge)" strokeWidth="1" opacity="0.75" />
          <line x1="-2%" y1="90%" x2="102%" y2="106%" stroke="var(--edge)" strokeWidth="1" opacity="0.75" />
        </svg>

        {/* ---- cabeçalho (topo-esquerda) ---- */}
        <div
          style={{
            position: 'absolute',
            top: 46,
            left: 64,
            maxWidth: 520,
            zIndex: 6,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              font: "12px/1 'JetBrains Mono', monospace",
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--testi-accent)',
              marginBottom: 12,
            }}
          >
            O que dizem os professores
          </div>
          <h2
            style={{
              margin: 0,
              font: "700 clamp(26px, 3vw, 42px)/1.02 'Spectral', serif",
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            Quem ensina,{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 600, color: 'var(--testi-accent)' }}>
              sabe o que funciona.
            </em>
          </h2>
        </div>

        {/* ---- legenda (esquerda, centralizada na vertical) ---- */}
        <div
          style={{
            position: 'absolute',
            left: 64,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '33%',
            maxWidth: 380,
            zIndex: 5,
          }}
        >
          <div key={activeIndex} style={{ animation: 'egFadeUp .5s ease' }}>
            <div
              style={{
                display: 'inline-block',
                font: "11px/1 'JetBrains Mono', monospace",
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'var(--testi-num)',
                borderBottom: '1px solid var(--edge)',
                paddingBottom: 6,
                marginBottom: 22,
              }}
            >
              {dois(activeIndex + 1)} / Depoimentos
            </div>
            <div
              style={{
                font: "italic 400 clamp(38px, 4.4vw, 60px)/0.98 'Spectral', serif",
                color: 'var(--text)',
                marginBottom: 28,
              }}
            >
              {ativo.nome}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '86px 1fr',
                rowGap: 11,
                borderTop: '1px solid var(--edge)',
                paddingTop: 20,
              }}
            >
              <div
                style={{
                  font: "10.5px/1 'JetBrains Mono', monospace",
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--testi-label)',
                  alignSelf: 'center',
                }}
              >
                Função
              </div>
              <div style={{ font: "italic 400 18px/1.25 'Spectral', serif", color: 'var(--testi-value)' }}>
                {ativo.funcao}
              </div>
              <div
                style={{
                  font: "10.5px/1 'JetBrains Mono', monospace",
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--testi-label)',
                  alignSelf: 'center',
                }}
              >
                Etapa
              </div>
              <div style={{ font: "italic 400 18px/1.25 'Spectral', serif", color: 'var(--testi-value)' }}>
                {ativo.etapa}
              </div>
            </div>
          </div>
        </div>

        {/* ---- card grande (direita) ---- */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            perspective: 1600,
            zIndex: 2,
          }}
        >
          {depoimentos.map((d, i) => {
            const dist = i - pos
            const ad = Math.abs(dist)
            // desliza p/ esquerda e encolhe de leve (sem fade) — como a câmera
            // "afastando" do protótipo; o card ativo descansa em centro-direita.
            const stepX = cardW + vw * 0.7 // separação entre cards
            const baseX = vw * 0.19 // mantém o ativo em centro-direita (~69%)
            const x = baseX + dist * stepX
            const scale = 1 - Math.min(ad, 2) * 0.055 // encolhe "muito pouco"
            const opacity = ad > 1.8 ? Math.max(0, 1 - (ad - 1.8) * 2) : 1 // só some já fora da tela
            const zIndex = 100 - Math.round(ad * 10)
            const shOff = Math.round(cardW * 0.05) // sombra quadrada (offset ~ protótipo)
            return (
              <article
                key={d.nome}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: cardW,
                  height: cardH,
                  marginLeft: -cardW / 2,
                  marginTop: -cardH / 2,
                  zIndex,
                  opacity,
                  transform: `translateX(${x.toFixed(1)}px) scale(${scale.toFixed(3)}) rotateY(-14deg)`,
                  transformStyle: 'preserve-3d',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '40px 40px 34px',
                  borderRadius: 0,
                  border: '1px solid var(--text)',
                  background: 'var(--testi-card)',
                  boxShadow: `${shOff}px ${shOff}px 0 0 rgba(0,0,0,0.16)`,
                }}
              >
                {/* índice no topo-direito */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    font: "12px/1 'JetBrains Mono', monospace",
                    letterSpacing: '0.1em',
                    color: 'var(--testi-num)',
                  }}
                >
                  {dois(i + 1)} / {dois(N)}
                </div>

                {/* aspas */}
                <div
                  style={{
                    font: "700 clamp(90px, 9vw, 150px)/0.7 'Spectral', serif",
                    color: 'var(--gold)',
                    marginTop: 4,
                  }}
                >
                  &ldquo;
                </div>

                {/* texto do depoimento (grande — é o foco) */}
                <p
                  style={{
                    flex: 1,
                    margin: '6px 0 0',
                    font: "italic 600 clamp(22px, 2.1vw, 32px)/1.4 'Spectral', serif",
                    color: 'var(--testi-value)',
                  }}
                >
                  {d.texto}
                </p>

                {/* atribuição */}
                <div style={{ marginTop: 22, borderTop: '1px solid var(--edge)', paddingTop: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{d.nome}</div>
                  <div
                    style={{
                      font: "12px/1.3 'JetBrains Mono', monospace",
                      color: 'var(--testi-label)',
                      marginTop: 6,
                    }}
                  >
                    {d.funcao} · {d.etapa}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* ---- barra de progresso (base, quase largura total) ---- */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 64,
            right: 64,
            zIndex: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <div
            style={{
              font: "11px/1 'JetBrains Mono', monospace",
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              whiteSpace: 'nowrap',
            }}
          >
            Role para ver mais →
          </div>
          <div
            style={{
              flex: 1,
              height: 2,
              background: 'var(--pill-border)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div style={{ height: '100%', width: `${(sp * 100).toFixed(1)}%`, background: 'var(--gold)' }} />
          </div>
        </div>
      </section>
    </div>
  )
}

export default TestimonialsSection
