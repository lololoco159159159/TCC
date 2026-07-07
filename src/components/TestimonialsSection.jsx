import { useEffect, useRef, useState } from 'react'
import depoimentos from '../data/depoimentos'
import series from '../data/series'
import MateriaPopover from './MateriaPopover'

// Seção "Quem ensina, sabe o que funciona." — depoimentos + grade de séries.
// Porte SIMPLIFICADO do protótipo (que usa three.js/WebGL numa parede 3D): aqui é
// puro DOM/CSS. Um único scroll-zone sticky de 520vh prende a seção e tem DUAS
// fases, como no protótipo:
//   Fase 1 (desfile): a legenda (nº + nome + função/etapa) fica à esquerda e UM
//     card grande à direita, inclinado, desliza dando lugar ao próximo depoimento.
//   Fase 2 (cortina): a camada da frente (os depoimentos) desliza para a ESQUERDA
//     e sai, revelando pela DIREITA a grade "Encontre as habilidades da sua turma."
// Sem three.js nem dependências novas.

const N = depoimentos.length
const clamp01 = (x) => Math.max(0, Math.min(1, x))
const dois = (n) => String(n).padStart(2, '0')

// Card de uma série na grade "Explore por série": nº de habilidades + o ano.
// No hover/aberto ganha destaque (fundo/borda dourada e texto escuro). Clicar
// abre o MateriaPopover ancorado ao card — o grid não se mexe (o balão é
// position:absolute, fora do fluxo). Só um card fica aberto por vez (estado no pai).
function GradeCard({ ano, habilidades, aberto, onToggle }) {
  const [hover, setHover] = useState(false)
  const [placement, setPlacement] = useState('baixo')
  const cardRef = useRef(null)

  const aoClicar = () => {
    if (aberto) {
      onToggle(null)
      return
    }
    // decide a direção do balão para não ser cortado pelo rodapé da <section>
    const r = cardRef.current?.getBoundingClientRect()
    setPlacement(r && r.bottom + 340 > window.innerHeight ? 'cima' : 'baixo')
    onToggle(ano)
  }

  const destaque = hover || aberto
  return (
    <div
      ref={cardRef}
      onClick={aoClicar}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        zIndex: aberto ? 20 : undefined,
        background: destaque ? 'var(--grade-card-hover)' : 'var(--grade-card)',
        border: `1px solid ${destaque ? 'var(--gold)' : 'var(--pill-border)'}`,
        borderRadius: 12,
        padding: '20px 16px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'background .25s ease, border-color .25s ease',
      }}
    >
      <div style={{ font: "700 28px/1 'Spectral', serif", color: destaque ? 'var(--text)' : 'var(--gold)' }}>
        {habilidades}
      </div>
      <div
        style={{
          font: "12px/1 'JetBrains Mono', monospace",
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginTop: 8,
          color: destaque ? 'var(--text)' : 'var(--muted)',
        }}
      >
        {ano}
      </div>
      {aberto && (
        <MateriaPopover ano={ano} placement={placement} anchorRef={cardRef} onClose={() => onToggle(null)} />
      )}
    </div>
  )
}

function TestimonialsSection({ onGrafos }) {
  const zoneRef = useRef(null)
  const [sp, setSp] = useState(0) // progresso de scroll 0..1 no zone inteiro
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1400)
  const [wh, setWh] = useState(typeof window !== 'undefined' ? window.innerHeight : 900)
  const [anoAberto, setAnoAberto] = useState(null) // série com o popover de matérias aberto

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
          const pct = clamp01(-r.top / sh) // 0..1 cru no zone inteiro
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

  // Duas fases do scroll (sp 0..1 no zone inteiro):
  //   fase 1 (desfile dos depoimentos): sp 0 .. SPLIT
  //   fase 2 (cortina revelando a grade): sp SPLIT .. REVEAL_END
  //   descanso: sp REVEAL_END .. 1 — a grade fica revelada e fixada antes de soltar o pin.
  const SPLIT = 0.6
  const REVEAL_END = 0.9
  const p1 = clamp01(sp / (SPLIT - 0.04)) // desfile — último card assenta antes do corte
  const p2 = clamp01((sp - SPLIT) / (REVEAL_END - SPLIT)) // cortina/revelação da grade

  // posição contínua (0..N-1) e card ativo — dirigida só pela fase 1
  const pos = p1 * (N - 1)
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
    <div ref={zoneRef} id="testiScrollZone" style={{ position: 'relative', height: '520vh' }}>
      <section
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: 'var(--bg2)',
          borderTop: '1px solid var(--pill-border)',
        }}
      >
        {/* ===== CAMADA DE FUNDO · grade "Encontre as habilidades da sua turma." =====
            Revelada na fase 2: entra da DIREITA (deriva de leve para o centro)
            conforme a cortina dos depoimentos desliza para a esquerda. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translateX(${((1 - p2) * 4).toFixed(2)}vw)`,
          }}
        >
          <div
            style={{
              maxWidth: 1080,
              width: '100%',
              padding: '0 64px',
              display: 'grid',
              gridTemplateColumns: '380px 1fr',
              gap: 64,
              alignItems: 'center',
            }}
          >
            {/* coluna esquerda: kicker + título + parágrafo + link */}
            <div style={{ maxWidth: 380 }}>
              <div
                style={{
                  font: "12px/1 'JetBrains Mono', monospace",
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--testi-accent)',
                  marginBottom: 16,
                }}
              >
                Explore por série
              </div>
              <h2
                style={{
                  margin: 0,
                  font: "700 clamp(30px, 3.2vw, 44px)/1.06 'Spectral', serif",
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                  marginBottom: 20,
                }}
              >
                Encontre as habilidades
                <br />
                da sua turma.
              </h2>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: 'var(--muted)', marginBottom: 28 }}>
                Cada série tem seu mapa de habilidades. Clique para ver o grafo e entender o que conecta o
                currículo.
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
                  gap: 8,
                  font: "600 15px/1 'Figtree', sans-serif",
                  color: 'var(--testi-accent)',
                  textDecoration: 'none',
                  borderBottom: '1px solid',
                  paddingBottom: 3,
                }}
              >
                Ver todos os grafos →
              </a>
            </div>

            {/* coluna direita: grade com os cards de série */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {series.map((s) => (
                <GradeCard
                  key={s.ano}
                  ano={s.ano}
                  habilidades={s.habilidades}
                  aberto={anoAberto === s.ano}
                  onToggle={setAnoAberto}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ===== CAMADA DA FRENTE · depoimentos (cortina que desliza p/ esquerda na fase 2) =====
            Fundo opaco (--testi-bg) cobre a grade na fase 1; ao sair pela esquerda,
            a borda direita varre a tela e revela a grade a partir da direita. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background: 'var(--testi-bg)',
            transform: `translateX(${(-p2 * 105).toFixed(2)}vw)`,
            willChange: 'transform',
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
              const scale = 1 - Math.min(ad, 2) * 0.5 // encolhe "muito pouco"
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
              <div style={{ height: '100%', width: `${(p1 * 100).toFixed(1)}%`, background: 'var(--gold)' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TestimonialsSection
