// Física "Force-based layout" do Neo4j Browser (N11 — ESTADO_ATUAL.md §4.5; D18).
// Reproduz a simulação que o Browser servido pelo Neo4j 2026.09 usa para desenhar
// resultados: os parâmetros foram LIDOS do código que o próprio Neo4j entrega
// (classe d3ForceLayout do pacote de visualização) e o algoritmo é o do d3-force
// e do d3-quadtree (Mike Bostock, licença ISC), que o Browser embute. Nada do
// código do Browser foi copiado: as forças abaixo foram escritas aqui, seguindo
// o algoritmo publicado do d3 — inclusive a aproximação de Barnes–Hut na
// repulsão e o gerador pseudoaleatório de semente fixa, para que a mesma
// entrada dê sempre o mesmo desenho, como lá.
//
// O Browser trabalha em pixels do DISPOSITIVO (multiplica as distâncias pelo
// devicePixelRatio); o canvas do site trabalha em pixels CSS, então os números
// abaixo são os do Browser com devicePixelRatio = 1.
//
// Módulo puro (sem React): a simulação MUTA os objetos de nó que recebe (x, y,
// vx, vy, fx, fy, index) — os mesmos do estado da página, como o motor fazia
// desde a G5; só o canvas lê as posições.

// Tamanho de nó usado nas contas: o padrão do Browser (decisão do autor na
// N11 — o espaçamento sai idêntico; o desenho continua com os raios da tabela
// de estilo).
export const TAMANHO_NO = 25

export const ALPHA_MIN = 0.05 // abaixo disso a simulação para (o loop do canvas dorme)
const ALPHA_DECAY = 1 - Math.pow(0.001, 1 / 300) // ≈ 2,28% por passo (padrão do d3)
const VELOCIDADE = 1 - 0.4 // velocityDecay 0,4: a velocidade é multiplicada por 0,6 a cada passo
const CARGA = -400 // repulsão entre nós (forceManyBody)
const CARGA_PRE_CALCULO = 2 * CARGA // repulsão dobrada no pré-cálculo da 1.ª carga
const THETA2 = 0.81 // θ = 0,9 da aproximação de Barnes–Hut (ao quadrado)
const DISTANCIA_MIN2 = 1 // distância mínima (ao quadrado) da repulsão
const FORCA_CENTRO = 0.03 // forceX/forceY puxando para (0, 0)
const RAIO_COLISAO = TAMANHO_NO + 25 // forceCollide
const DISTANCIA_MOLA = TAMANHO_NO + TAMANHO_NO + 90 // forceLink: tamanho A + tamanho B + 90
const FORCA_MOLA_MIN = 0.06
const FORCA_MOLA_MAX = 1
const PRE_PASSOS = 200 // pré-cálculo da 1.ª carga: até 200 passos…
const PRE_MS = 300 // …ou 300 ms, com alpha fixo em 1
const POS_MS = 100 // depois, até 100 ms com a repulsão normal, enquanto estiver quente
const RAIO_CIRCULO = 45 // 1.ª carga: círculo de raio 45·√n
const RAIO_FILOTAXIA = 10 // nó sem posição numa mudança: espiral do d3 (10·√(0,5 + i))
const ANGULO_FILOTAXIA = Math.PI * (3 - Math.sqrt(5)) // ângulo áureo

// Posição de um nó na 1.ª carga: círculo de raio 45·√n em volta da origem.
export function posicaoInicial(i, n) {
  const raio = RAIO_CIRCULO * Math.sqrt(n)
  return { x: raio * Math.sin((2 * Math.PI * i) / n), y: raio * Math.cos((2 * Math.PI * i) / n) }
}

// Posição de um nó que chega sem lugar (ex.: expansão): a espiral que o d3 usa
// para nós sem posição, pelo índice do nó na simulação — nasce perto do centro.
export function posicaoFilotaxia(i) {
  const raio = RAIO_FILOTAXIA * Math.sqrt(0.5 + i)
  const angulo = i * ANGULO_FILOTAXIA
  return { x: raio * Math.cos(angulo), y: raio * Math.sin(angulo) }
}

// Gerador congruencial linear do d3 (semente 1). Só é usado para desempatar nós
// exatamente sobrepostos ("jiggle"); com ele, o resultado é determinístico.
function geradorD3() {
  let s = 1
  return () => (s = (1664525 * s + 1013904223) % 4294967296) / 4294967296
}
const tremer = (aleatorio) => (aleatorio() - 0.5) * 1e-6

// ---------------------------------------------------------------------------
// Quadtree (algoritmo do d3-quadtree): nó interno = array de 4 filhos; folha =
// { data, next } (pontos coincidentes viram uma lista ligada pela folha).
// ---------------------------------------------------------------------------
function quadtree(dados, px, py) {
  const arv = { raiz: undefined, x0: NaN, y0: NaN, x1: NaN, y1: NaN, px, py }
  const n = dados.length
  const xs = new Array(n)
  const ys = new Array(n)
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (let i = 0; i < n; i++) {
    const x = +px(dados[i])
    const y = +py(dados[i])
    if (isNaN(x) || isNaN(y)) continue
    xs[i] = x
    ys[i] = y
    if (x < x0) x0 = x
    if (x > x1) x1 = x
    if (y < y0) y0 = y
    if (y > y1) y1 = y
  }
  if (x0 > x1 || y0 > y1) return arv
  cobrir(arv, x0, y0)
  cobrir(arv, x1, y1)
  for (let i = 0; i < n; i++) adicionar(arv, xs[i], ys[i], dados[i])
  return arv
}

// estende a extensão da árvore (quadrado que dobra de lado) até conter (x, y)
function cobrir(arv, x, y) {
  if (isNaN(x) || isNaN(y)) return
  let { x0, y0, x1, y1 } = arv
  if (isNaN(x0)) {
    x1 = (x0 = Math.floor(x)) + 1
    y1 = (y0 = Math.floor(y)) + 1
  } else {
    let z = x1 - x0 || 1
    let no = arv.raiz
    while (x0 > x || x >= x1 || y0 > y || y >= y1) {
      const i = ((y < y0) << 1) | (x < x0)
      const pai = new Array(4)
      pai[i] = no
      no = pai
      z *= 2
      if (i === 0) {
        x1 = x0 + z
        y1 = y0 + z
      } else if (i === 1) {
        x0 = x1 - z
        y1 = y0 + z
      } else if (i === 2) {
        x1 = x0 + z
        y0 = y1 - z
      } else {
        x0 = x1 - z
        y0 = y1 - z
      }
    }
    if (arv.raiz && arv.raiz.length) arv.raiz = no
  }
  arv.x0 = x0
  arv.y0 = y0
  arv.x1 = x1
  arv.y1 = y1
}

function adicionar(arv, x, y, d) {
  if (isNaN(x) || isNaN(y)) return
  let no = arv.raiz
  const folha = { data: d }
  let { x0, y0, x1, y1 } = arv
  let pai
  let i
  if (!no) {
    arv.raiz = folha
    return
  }
  while (no.length) {
    const xm = (x0 + x1) / 2
    const ym = (y0 + y1) / 2
    const direita = x >= xm
    const baixo = y >= ym
    if (direita) x0 = xm
    else x1 = xm
    if (baixo) y0 = ym
    else y1 = ym
    pai = no
    i = (baixo << 1) | direita
    no = no[i]
    if (!no) {
      pai[i] = folha
      return
    }
  }
  const xp = +arv.px(no.data)
  const yp = +arv.py(no.data)
  if (x === xp && y === yp) {
    folha.next = no
    if (pai) pai[i] = folha
    else arv.raiz = folha
    return
  }
  let j
  do {
    pai = pai ? (pai[i] = new Array(4)) : (arv.raiz = new Array(4))
    const xm = (x0 + x1) / 2
    const ym = (y0 + y1) / 2
    const direita = x >= xm
    const baixo = y >= ym
    if (direita) x0 = xm
    else x1 = xm
    if (baixo) y0 = ym
    else y1 = ym
    i = (baixo << 1) | direita
    j = ((yp >= ym) << 1) | (xp >= xm)
  } while (i === j)
  pai[j] = no
  pai[i] = folha
}

// visita em pré-ordem; o callback devolve true para não descer nos filhos
function visitar(arv, cb) {
  const pilha = []
  if (arv.raiz) pilha.push([arv.raiz, arv.x0, arv.y0, arv.x1, arv.y1])
  let q
  while ((q = pilha.pop())) {
    const [no, x0, y0, x1, y1] = q
    if (!cb(no, x0, y0, x1, y1) && no.length) {
      const xm = (x0 + x1) / 2
      const ym = (y0 + y1) / 2
      if (no[3]) pilha.push([no[3], xm, ym, x1, y1])
      if (no[2]) pilha.push([no[2], x0, ym, xm, y1])
      if (no[1]) pilha.push([no[1], xm, y0, x1, ym])
      if (no[0]) pilha.push([no[0], x0, y0, xm, ym])
    }
  }
}

// visita em pós-ordem (filhos antes do pai)
function visitarDepois(arv, cb) {
  const pilha = []
  const depois = []
  if (arv.raiz) pilha.push([arv.raiz, arv.x0, arv.y0, arv.x1, arv.y1])
  let q
  while ((q = pilha.pop())) {
    const [no, x0, y0, x1, y1] = q
    if (no.length) {
      const xm = (x0 + x1) / 2
      const ym = (y0 + y1) / 2
      if (no[0]) pilha.push([no[0], x0, y0, xm, ym])
      if (no[1]) pilha.push([no[1], xm, y0, x1, ym])
      if (no[2]) pilha.push([no[2], x0, ym, xm, y1])
      if (no[3]) pilha.push([no[3], xm, ym, x1, y1])
    }
    depois.push(q)
  }
  while ((q = depois.pop())) cb(q[0], q[1], q[2], q[3], q[4])
}

// ---------------------------------------------------------------------------
// A simulação. definir() troca o conjunto de nós/relações (reinicia as forças,
// como o simulation.nodes() do d3, mantendo posições e velocidades); passo()
// avança um tique; preCalcular() é a 1.ª carga do Browser.
// ---------------------------------------------------------------------------
export function criarSimulacao() {
  const aleatorio = geradorD3()
  let nos = []
  let molas = [] // { s, t, vies, forca } — uma por relação (laços ignorados)
  let alpha = 1
  let carga = CARGA
  let rodando = false

  function definir(listaNos, arestas) {
    nos = listaNos
    const porId = new Map()
    nos.forEach((n, i) => {
      n.index = i
      if (n.fx != null) n.x = n.fx
      if (n.fy != null) n.y = n.fy
      if (isNaN(n.x) || isNaN(n.y)) {
        const p = posicaoFilotaxia(i)
        n.x = p.x
        n.y = p.y
      }
      if (isNaN(n.vx) || isNaN(n.vy)) {
        n.vx = 0
        n.vy = 0
      }
      porId.set(n.id, n)
    })
    molas = []
    const grau = new Array(nos.length).fill(0)
    for (const ar of arestas) {
      const s = porId.get(ar.a)
      const t = porId.get(ar.b)
      if (!s || !t || s === t) continue
      molas.push({ s, t })
      grau[s.index]++
      grau[t.index]++
    }
    for (const m of molas) {
      const gs = grau[m.s.index]
      const gt = grau[m.t.index]
      m.vies = gs / (gs + gt)
      const f = 1.2 / (Math.min(gs, gt) + (Math.max(gs, gt) - 1) / 100)
      m.forca = Math.max(Math.min(f, FORCA_MOLA_MAX), FORCA_MOLA_MIN)
    }
  }

  // ---- repulsão (forceManyBody com Barnes–Hut) ----
  let alvo = null
  let alphaAtual = 0
  function acumular(quad) {
    let soma = 0
    if (quad.length) {
      let peso = 0
      let x = 0
      let y = 0
      for (let i = 0; i < 4; ++i) {
        const q = quad[i]
        let c
        if (q && (c = Math.abs(q.value))) {
          soma += q.value
          peso += c
          x += c * q.x
          y += c * q.y
        }
      }
      quad.x = x / peso
      quad.y = y / peso
    } else {
      let q = quad
      q.x = q.data.x
      q.y = q.data.y
      do soma += carga
      while ((q = q.next))
    }
    quad.value = soma
  }
  function repelir(quad, x1, _y1, x2) {
    if (!quad.value) return true
    let x = quad.x - alvo.x
    let y = quad.y - alvo.y
    let w = x2 - x1
    let l = x * x + y * y
    if ((w * w) / THETA2 < l) {
      if (x === 0) {
        x = tremer(aleatorio)
        l += x * x
      }
      if (y === 0) {
        y = tremer(aleatorio)
        l += y * y
      }
      if (l < DISTANCIA_MIN2) l = Math.sqrt(DISTANCIA_MIN2 * l)
      alvo.vx += (x * quad.value * alphaAtual) / l
      alvo.vy += (y * quad.value * alphaAtual) / l
      return true
    } else if (quad.length) return undefined
    if (quad.data !== alvo || quad.next) {
      if (x === 0) {
        x = tremer(aleatorio)
        l += x * x
      }
      if (y === 0) {
        y = tremer(aleatorio)
        l += y * y
      }
      if (l < DISTANCIA_MIN2) l = Math.sqrt(DISTANCIA_MIN2 * l)
    }
    do
      if (quad.data !== alvo) {
        w = (carga * alphaAtual) / l
        alvo.vx += x * w
        alvo.vy += y * w
      }
    while ((quad = quad.next))
    return undefined
  }
  function aplicarRepulsao(a) {
    const arv = quadtree(nos, (d) => d.x, (d) => d.y)
    visitarDepois(arv, acumular)
    alphaAtual = a
    for (const n of nos) {
      alvo = n
      visitar(arv, repelir)
    }
  }

  // ---- centro (forceX/forceY para a origem) ----
  function aplicarCentro(a) {
    for (const n of nos) {
      n.vx += (0 - n.x) * FORCA_CENTRO * a
      n.vy += (0 - n.y) * FORCA_CENTRO * a
    }
  }

  // ---- colisão (forceCollide; não depende de alpha) ----
  let xi = 0
  let yi = 0
  function prepararRaio(quad) {
    if (quad.data) {
      quad.r = RAIO_COLISAO
      return
    }
    quad.r = 0
    for (let i = 0; i < 4; ++i) if (quad[i] && quad[i].r > quad.r) quad.r = quad[i].r
  }
  function colidir(quad, x0, y0, x1, y1) {
    const dado = quad.data
    let rj = quad.r
    let r = RAIO_COLISAO + rj
    if (dado) {
      if (dado.index > alvo.index) {
        let x = xi - dado.x - dado.vx
        let y = yi - dado.y - dado.vy
        let l = x * x + y * y
        if (l < r * r) {
          if (x === 0) {
            x = tremer(aleatorio)
            l += x * x
          }
          if (y === 0) {
            y = tremer(aleatorio)
            l += y * y
          }
          l = Math.sqrt(l)
          l = (r - l) / l
          rj *= rj
          r = rj / (RAIO_COLISAO * RAIO_COLISAO + rj)
          alvo.vx += (x *= l) * r
          alvo.vy += (y *= l) * r
          r = 1 - r
          dado.vx -= x * r
          dado.vy -= y * r
        }
      }
      return undefined
    }
    return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r
  }
  function aplicarColisao() {
    const arv = quadtree(nos, (d) => d.x + d.vx, (d) => d.y + d.vy)
    visitarDepois(arv, prepararRaio)
    for (const n of nos) {
      alvo = n
      xi = n.x + n.vx
      yi = n.y + n.vy
      visitar(arv, colidir)
    }
  }

  // ---- molas (forceLink) ----
  function aplicarMolas(a) {
    for (const m of molas) {
      const { s, t } = m
      let x = t.x + t.vx - s.x - s.vx || tremer(aleatorio)
      let y = t.y + t.vy - s.y - s.vy || tremer(aleatorio)
      let l = Math.sqrt(x * x + y * y)
      l = ((l - DISTANCIA_MOLA) / l) * a * m.forca
      x *= l
      y *= l
      let b = m.vies
      t.vx -= x * b
      t.vy -= y * b
      b = 1 - b
      s.vx += x * b
      s.vy += y * b
    }
  }

  // um tique do d3: esfria, aplica as forças na ordem do Browser (repulsão,
  // centro, colisão, molas) e integra — nó preso (fx/fy) fica onde está
  function tique() {
    alpha += (0 - alpha) * ALPHA_DECAY
    aplicarRepulsao(alpha)
    aplicarCentro(alpha)
    aplicarColisao()
    aplicarMolas(alpha)
    for (const n of nos) {
      if (n.fx == null) n.x += n.vx *= VELOCIDADE
      else {
        n.x = n.fx
        n.vx = 0
      }
      if (n.fy == null) n.y += n.vy *= VELOCIDADE
      else {
        n.y = n.fy
        n.vy = 0
      }
    }
  }

  // um passo do loop animado: como o timer do d3, tica e para quando esfriou
  function passo() {
    tique()
    if (alpha < ALPHA_MIN) rodando = false
  }

  // 1.ª carga, como o Browser: até 200 passos (ou 300 ms) com alpha fixo em 1 e
  // a repulsão dobrada; depois até 100 ms com a repulsão normal, enquanto
  // estiver quente. O que sobrar anima (ou, com `ateEsfriar` — modo sem
  // animação, D6 —, é resolvido aqui mesmo).
  function preCalcular({ ateEsfriar = false } = {}) {
    if (!nos.length) {
      rodando = false
      return
    }
    carga = CARGA_PRE_CALCULO
    const t0 = performance.now()
    for (let i = 0; i < PRE_PASSOS && performance.now() - t0 < PRE_MS; i++) {
      alpha = 1
      tique()
    }
    carga = CARGA
    if (ateEsfriar) {
      while (alpha >= ALPHA_MIN) tique()
      rodando = false
      return
    }
    const t1 = performance.now()
    while (performance.now() - t1 < POS_MS && alpha >= ALPHA_MIN) tique()
    rodando = true // como o restart() do d3: o próximo quadro ainda tica uma vez
  }

  // reaquece (mudança no grafo: 1; arraste: 0,2 — valores do Browser)
  function aquecer(nivel) {
    alpha = nivel
    rodando = true
  }

  // resolve de uma vez o que falta esfriar (modo sem animação)
  function assentar(maxPassos = Infinity) {
    for (let i = 0; rodando && i < maxPassos; i++) passo()
  }

  return {
    definir,
    passo,
    preCalcular,
    aquecer,
    assentar,
    get rodando() {
      return rodando && nos.length > 0
    },
    get alpha() {
      return alpha
    },
  }
}
