// Layout hierárquico — o "Hierarchical layout" do Neo4j Browser (N11 —
// ESTADO_ATUAL.md §4.5; D18). O Browser usa o dagre (desenho em camadas, de
// Sugiyama) com uma configuração própria; por decisão do autor, o algoritmo foi
// escrito AQUI, sem dependência nova, seguindo as mesmas etapas do dagre:
//   1. quebra de ciclos (busca em profundidade, invertendo as arestas de volta);
//   2. níveis: caminho mais longo + "árvore justa" (ranqueador tight-tree);
//   3. arestas que atravessam mais de um nível ganham nós fictícios;
//   4. ordem dentro de cada nível: varreduras por baricentro, guardando a de
//      menos cruzamentos (para depois de 4 sem melhora, como o dagre);
//   5. x pelo método de Brandes–Köpf (4 alinhamentos + equilíbrio); y por nível.
// e com a configuração que o Browser passa ao dagre: de cima para baixo,
// nodesep 75, ranksep 75, caixa de tamanho × 2,63 por nó, uma aresta por par de
// nós, partes desconectadas arranjadas sozinhas e empacotadas ("bin", 100 px de
// folga) e o resultado deslocado para o centroide das posições anteriores (o
// grafo não sai do lugar). Fica PARECIDO com o do Browser, não idêntico: o
// dagre ainda reserva um nível intermediário para rótulos de aresta e liga
// todos os nós a uma raiz auxiliar no ranqueamento — detalhes que mudam pouco o
// desenho e ficaram de fora.
//
// Módulo puro (sem React): recebe nós { id, x, y } e arestas { a, b } e devolve
// as posições finais e os pontos de dobra das arestas longas.

const SEPARACAO_NOS = 75 // nodesep
const SEPARACAO_NIVEIS = 75 // ranksep
const SEPARACAO_ARESTAS = 20 // edgesep (padrão do dagre; vale entre nós fictícios)
const FATOR_CAIXA = 1 / 0.38 // caixa do nó = tamanho × 2,63 (o Browser)
const FOLGA_COMPONENTE = 100 // folga entre partes desconectadas no empacotamento

export function layoutHierarquico(nos, arestas, { tamanho = 25 } = {}) {
  const posicoes = new Map()
  const dobras = new Map()
  const total = nos.length
  if (!total) return { posicoes, dobras }
  const lado = tamanho * FATOR_CAIXA

  // centroide das posições de antes: o resultado é deslocado para ele
  let cx = 0
  let cy = 0
  for (const n of nos) {
    cx += n.x || 0
    cy += n.y || 0
  }
  cx /= total
  cy /= total

  // uma aresta por par de nós (o sentido da 1.ª relação decide quem fica
  // acima); laços e pontas fora do conjunto são ignorados
  const ids = nos.map((n) => n.id)
  const existe = new Set(ids)
  const pares = new Set()
  const arcos = []
  for (const ar of arestas) {
    if (ar.a === ar.b || !existe.has(ar.a) || !existe.has(ar.b)) continue
    const chave = ar.a < ar.b ? `${ar.a}\u0000${ar.b}` : `${ar.b}\u0000${ar.a}`
    if (pares.has(chave)) continue
    pares.add(chave)
    arcos.push({ v: ar.a, w: ar.b })
  }

  const comps = componentes(ids, arcos)
  if (comps.length === 1) {
    const r = arranjar(ids, arcos, lado)
    r.pos.forEach((p, id) => posicoes.set(id, { ...p }))
    r.pontos.forEach((pts, arco) => dobras.set(arco, pts))
  } else {
    // partes desconectadas: cada uma sozinha, depois empacotadas ("bin") —
    // as maiores primeiro, nós soltos por último. Como no Browser, sem dobras
    // neste caso (os pontos das partes não são aproveitados lá).
    const arranjos = comps.map((c) => ({ ...arranjar(c.ids, c.arcos, lado), n: c.ids.length }))
    const grandes = arranjos.filter((a) => a.n !== 1).sort((a, b) => b.n - a.n)
    const soltos = arranjos.filter((a) => a.n === 1)
    const caixas = [...grandes, ...soltos].map((a) => {
      const l = limites(a.pos, lado)
      return { a, l, width: l.width + FOLGA_COMPONENTE, height: l.height + FOLGA_COMPONENTE }
    })
    empacotar(caixas)
    for (const c of caixas) {
      c.a.pos.forEach((p, id) =>
        posicoes.set(id, {
          x: p.x - c.l.xOffset + c.x + FOLGA_COMPONENTE / 2,
          y: p.y - c.l.yOffset + c.y + FOLGA_COMPONENTE / 2,
        }),
      )
    }
  }

  // desloca tudo para o centroide anterior
  let hx = 0
  let hy = 0
  posicoes.forEach((p) => {
    hx += p.x
    hy += p.y
  })
  const dx = cx - hx / total
  const dy = cy - hy / total
  posicoes.forEach((p) => {
    p.x += dx
    p.y += dy
  })
  const deslocadas = new Map()
  dobras.forEach((pts, arco) => deslocadas.set(arco, pts.map((p) => ({ x: p.x + dx, y: p.y + dy }))))
  return { posicoes, dobras: deslocadas }
}

// chave de uma aresta para os pontos de dobra (os dois sentidos são gravados)
export const chaveDobra = (a, b) => `${a}\u0000${b}`

// componentes conexas (sem sentido), na ordem de uma busca em profundidade —
// como o graphlib: sucessores, depois predecessores
function componentes(ids, arcos) {
  const suc = new Map(ids.map((id) => [id, []]))
  const pred = new Map(ids.map((id) => [id, []]))
  for (const a of arcos) {
    if (!suc.get(a.v).includes(a.w)) suc.get(a.v).push(a.w)
    if (!pred.get(a.w).includes(a.v)) pred.get(a.w).push(a.v)
  }
  const visto = new Set()
  const comps = []
  for (const id of ids) {
    if (visto.has(id)) continue
    const membros = []
    const dfs = (v) => {
      if (visto.has(v)) return
      visto.add(v)
      membros.push(v)
      suc.get(v).forEach(dfs)
      pred.get(v).forEach(dfs)
    }
    dfs(id)
    // as arestas de cada parte, na ordem: para cada nó (ordem da busca), as que saem dele
    const deles = new Set(membros)
    const arcosComp = []
    for (const v of membros) for (const a of arcos) if (a.v === v && deles.has(a.w)) arcosComp.push(a)
    comps.push({ ids: membros, arcos: arcosComp })
  }
  return comps
}

// limites de uma parte já arranjada (o "ti" do Browser): caixa e deslocamentos
function limites(pos, lado) {
  const meio = Math.ceil(lado / 2)
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let minCX = Infinity
  let minCY = Infinity
  pos.forEach((p) => {
    minCX = Math.min(minCX, p.x)
    minCY = Math.min(minCY, p.y)
    minX = Math.min(minX, p.x - meio)
    minY = Math.min(minY, p.y - meio)
    maxX = Math.max(maxX, p.x + meio)
    maxY = Math.max(maxY, p.y + meio)
  })
  return { width: maxX - minX, height: maxY - minY, xOffset: minCX - minX, yOffset: minCY - minY }
}

// empacotador que cresce (algoritmo "growing packer", o que o Browser usa):
// caixas da maior área para a menor; cada uma vai para o 1.º espaço livre que
// couber, e o retângulo total cresce para a direita ou para baixo quando não há
function empacotar(caixas) {
  const lista = [...caixas].sort((a, b) => b.width * b.height - a.width * a.height)
  if (!lista.length) return
  let raiz = { x: 0, y: 0, w: lista[0].width, h: lista[0].height }
  const achar = (no, w, h) => {
    if (no.usado) return achar(no.direita, w, h) || achar(no.baixo, w, h)
    return w <= no.w && h <= no.h ? no : null
  }
  const dividir = (no, w, h) => {
    no.usado = true
    no.baixo = { x: no.x, y: no.y + h, w: no.w, h: no.h - h }
    no.direita = { x: no.x + w, y: no.y, w: no.w - w, h }
    return no
  }
  const crescerDireita = (w, h) => {
    raiz = { usado: true, x: 0, y: 0, w: raiz.w + w, h: raiz.h, baixo: raiz, direita: { x: raiz.w, y: 0, w, h: raiz.h } }
    const no = achar(raiz, w, h)
    return no ? dividir(no, w, h) : null
  }
  const crescerBaixo = (w, h) => {
    raiz = { usado: true, x: 0, y: 0, w: raiz.w, h: raiz.h + h, baixo: { x: 0, y: raiz.h, w: raiz.w, h }, direita: raiz }
    const no = achar(raiz, w, h)
    return no ? dividir(no, w, h) : null
  }
  const crescer = (w, h) => {
    const podeBaixo = w <= raiz.w
    const podeDireita = h <= raiz.h
    const deveDireita = podeDireita && raiz.h >= raiz.w + w
    const deveBaixo = podeBaixo && raiz.w >= raiz.h + h
    if (deveDireita) return crescerDireita(w, h)
    if (deveBaixo) return crescerBaixo(w, h)
    if (podeDireita) return crescerDireita(w, h)
    if (podeBaixo) return crescerBaixo(w, h)
    return null
  }
  for (const c of lista) {
    const no = achar(raiz, c.width, c.height)
    const lugar = no ? dividir(no, c.width, c.height) : crescer(c.width, c.height)
    c.x = lugar ? lugar.x : 0
    c.y = lugar ? lugar.y : 0
  }
}

// remove pontos alinhados de uma poligonal (o "ci" do Browser)
function simplificar(pts) {
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
  const r = [pts[0]]
  let anterior = { p1: pts[0], p2: pts[1] }
  let dAnt = dist(anterior.p1, anterior.p2)
  for (let i = 2; i < pts.length; i++) {
    let seg = { p1: pts[i - 1], p2: pts[i] }
    let d = dist(seg.p1, seg.p2)
    const atalho = { p1: anterior.p1, p2: seg.p2 }
    const dAtalho = dist(atalho.p1, atalho.p2)
    if (d + dAnt - dAtalho < 0.1) {
      r.pop()
      seg = atalho
      d = dAtalho
    }
    r.push(seg.p1)
    anterior = seg
    dAnt = d
  }
  r.push(pts[pts.length - 1])
  return r
}

// ---------------------------------------------------------------------------
// Arranjo de UMA parte conexa: as 5 etapas do dagre. Devolve as posições (com
// a caixa mais à esquerda/acima encostada em 0, como o translateGraph do dagre)
// e, para cada aresta longa, os pontos de dobra (do nó v para o nó w).
// ---------------------------------------------------------------------------
function arranjar(idsComp, arcosComp, lado) {
  const nos = new Map() // id → { id, w, h, ficticio, nivel, ordem, x, y }
  idsComp.forEach((id) => nos.set(id, { id, w: lado, h: lado, ficticio: false }))
  // arestas dirigidas, em ordem de inserção (o graphlib preserva essa ordem)
  let ares = arcosComp.map((a) => ({ v: a.v, w: a.w, peso: 1, minlen: 1, orig: a, invertida: false }))
  // listas de saída/entrada por nó, na ordem de `ares` (refeitas quando `ares` muda)
  let saida = new Map()
  let entrada = new Map()
  const indexar = () => {
    saida = new Map(idsComp.map((id) => [id, []]))
    entrada = new Map(idsComp.map((id) => [id, []]))
    for (const e of ares) {
      saida.get(e.v).push(e)
      entrada.get(e.w).push(e)
    }
  }
  indexar()
  const saidas = (v) => saida.get(v)
  const entradas = (v) => entrada.get(v)

  // 1. ciclos: busca em profundidade; aresta que volta para a pilha é invertida
  {
    const fas = []
    const naPilha = new Set()
    const visto = new Set()
    const dfs = (v) => {
      if (visto.has(v)) return
      visto.add(v)
      naPilha.add(v)
      for (const e of saidas(v)) {
        if (naPilha.has(e.w)) fas.push(e)
        else dfs(e.w)
      }
      naPilha.delete(v)
    }
    nos.forEach((_n, id) => dfs(id))
    if (fas.length) {
      const inverter = new Set(fas)
      ares = [...ares.filter((x) => !inverter.has(x)), ...fas.map((e) => ({ ...e, v: e.w, w: e.v, invertida: true }))]
      indexar()
    }
  }

  // 2. níveis: caminho mais longo (sumidouros no 0, quem aponta fica acima)…
  const nivel = new Map()
  {
    const visto = new Set()
    const dfs = (v) => {
      if (visto.has(v)) return nivel.get(v)
      visto.add(v)
      let r = Infinity
      for (const e of saidas(v)) r = Math.min(r, dfs(e.w) - e.minlen)
      if (r === Infinity) r = 0
      nivel.set(v, r)
      return r
    }
    nos.forEach((_n, id) => {
      if (!entradas(id).length) dfs(id)
    })
  }
  // …e a "árvore justa": aproxima os nós dos vizinhos enquanto houver folga
  {
    const folga = (e) => nivel.get(e.w) - nivel.get(e.v) - e.minlen
    const arvore = new Set([idsComp[0]])
    const crescerJusta = () => {
      const dfs = (v) => {
        for (const e of [...entradas(v), ...saidas(v)]) {
          const w = v === e.v ? e.w : e.v
          if (!arvore.has(w) && !folga(e)) {
            arvore.add(w)
            dfs(w)
          }
        }
      }
      ;[...arvore].forEach(dfs)
      return arvore.size
    }
    while (crescerJusta() < nos.size) {
      let melhor = null
      let menor = Infinity
      for (const e of ares) {
        if (arvore.has(e.v) === arvore.has(e.w)) continue
        const f = folga(e)
        if (f < menor) {
          menor = f
          melhor = e
        }
      }
      if (!melhor) break
      const delta = arvore.has(melhor.v) ? folga(melhor) : -folga(melhor)
      arvore.forEach((v) => nivel.set(v, nivel.get(v) + delta))
    }
  }
  {
    let min = Infinity
    nivel.forEach((r) => (min = Math.min(min, r)))
    nos.forEach((n, id) => (n.nivel = nivel.get(id) - min))
  }

  // 3. arestas longas viram cadeias de nós fictícios (um por nível atravessado);
  // como no dagre, as arestas da cadeia vão para o fim da lista
  const cadeias = [] // { orig, invertida, ficticios: [ids] }
  {
    let k = 0
    const curtas = []
    const novas = []
    for (const e of ares) {
      const nv = nos.get(e.v).nivel
      const nw = nos.get(e.w).nivel
      if (nw === nv + 1) {
        curtas.push(e)
        continue
      }
      const ficticios = []
      let v = e.v
      for (let r = nv + 1; r < nw; r++) {
        const id = `\u0000f${k++}`
        nos.set(id, { id, w: 0, h: 0, ficticio: true, nivel: r })
        novas.push({ v, w: id, peso: e.peso, minlen: 1 })
        ficticios.push(id)
        v = id
      }
      novas.push({ v, w: e.w, peso: e.peso, minlen: 1 })
      cadeias.push({ orig: e.orig, invertida: e.invertida, ficticios })
    }
    ares = [...curtas, ...novas]
  }

  // adjacências fixas a partir daqui (ordem de inserção)
  const suc = new Map()
  const pred = new Map()
  const saidaArestas = new Map()
  const entradaArestas = new Map()
  nos.forEach((_n, id) => {
    suc.set(id, [])
    pred.set(id, [])
    saidaArestas.set(id, [])
    entradaArestas.set(id, [])
  })
  for (const e of ares) {
    saidaArestas.get(e.v).push(e)
    entradaArestas.get(e.w).push(e)
    if (!suc.get(e.v).includes(e.w)) suc.get(e.v).push(e.w)
    if (!pred.get(e.w).includes(e.v)) pred.get(e.w).push(e.v)
  }
  let maxNivel = 0
  nos.forEach((n) => (maxNivel = Math.max(maxNivel, n.nivel)))
  const porNivel = Array.from({ length: maxNivel + 1 }, () => []) // ordem de inserção
  nos.forEach((n, id) => porNivel[n.nivel].push(id))

  // 4. ordem dentro dos níveis
  {
    // ordem inicial: busca em profundidade a partir dos nós em ordem de nível
    const camadas = Array.from({ length: maxNivel + 1 }, () => [])
    const visto = new Set()
    const dfs = (v) => {
      if (visto.has(v)) return
      visto.add(v)
      camadas[nos.get(v).nivel].push(v)
      suc.get(v).forEach(dfs)
    }
    ;[...nos.keys()].sort((a, b) => nos.get(a).nivel - nos.get(b).nivel).forEach(dfs)
    const atribuir = (cs) => cs.forEach((c) => c.forEach((v, i) => (nos.get(v).ordem = i)))
    atribuir(camadas)

    const matriz = () =>
      porNivel.map((c) => [...c].sort((a, b) => nos.get(a).ordem - nos.get(b).ordem))
    const cruzamentos = (cs) => {
      let cc = 0
      for (let r = 1; r < cs.length; r++) {
        const posSul = new Map(cs[r].map((v, i) => [v, i]))
        const lista = []
        for (const v of cs[r - 1]) {
          const es = saidaArestas
            .get(v)
            .map((e) => ({ pos: posSul.get(e.w), peso: e.peso }))
            .sort((a, b) => a.pos - b.pos)
          lista.push(...es)
        }
        for (let i = 0; i < lista.length; i++)
          for (let j = i + 1; j < lista.length; j++) if (lista[i].pos > lista[j].pos) cc += lista[i].peso * lista[j].peso
      }
      return cc
    }
    // uma varredura: cada nível se ordena pelo baricentro dos vizinhos no nível
    // já fixado (o de cima, descendo; o de baixo, subindo). Sem vizinho, o nó
    // fica no índice que tinha na ordem de inserção.
    const varrer = (descendo, viesDireita) => {
      const niveis = []
      if (descendo) for (let r = 1; r <= maxNivel; r++) niveis.push(r)
      else for (let r = maxNivel - 1; r >= 0; r--) niveis.push(r)
      for (const r of niveis) {
        const itens = porNivel[r].map((v, i) => {
          const es = descendo ? entradaArestas.get(v) : saidaArestas.get(v)
          if (!es.length) return { v, i }
          let soma = 0
          let peso = 0
          for (const e of es) {
            const u = descendo ? e.v : e.w
            soma += e.peso * nos.get(u).ordem
            peso += e.peso
          }
          return { v, i, baricentro: soma / peso }
        })
        const ordenaveis = itens.filter((x) => x.baricentro !== undefined)
        const fixos = itens.filter((x) => x.baricentro === undefined).sort((a, b) => b.i - a.i)
        ordenaveis.sort((a, b) =>
          a.baricentro < b.baricentro ? -1 : a.baricentro > b.baricentro ? 1 : viesDireita ? b.i - a.i : a.i - b.i,
        )
        const vs = []
        const consumir = () => {
          while (fixos.length && fixos[fixos.length - 1].i <= vs.length) vs.push(fixos.pop().v)
        }
        consumir()
        for (const x of ordenaveis) {
          vs.push(x.v)
          consumir()
        }
        while (fixos.length) vs.push(fixos.pop().v)
        vs.forEach((v, i) => (nos.get(v).ordem = i))
      }
    }
    let melhor = null
    let melhorCC = Infinity
    for (let i = 0, semMelhora = 0; semMelhora < 4; ++i, ++semMelhora) {
      varrer(i % 2 === 1, i % 4 >= 2)
      const cs = matriz()
      const cc = cruzamentos(cs)
      if (cc < melhorCC) {
        semMelhora = 0
        melhor = cs.map((c) => [...c])
        melhorCC = cc
      }
    }
    atribuir(melhor)
  }
  const camadas = porNivel.map((c) => [...c].sort((a, b) => nos.get(a).ordem - nos.get(b).ordem))

  // 5a. y por nível
  {
    let y = 0
    for (const c of camadas) {
      const alt = Math.max(0, ...c.map((v) => nos.get(v).h))
      c.forEach((v) => (nos.get(v).y = y + alt / 2))
      y += alt + SEPARACAO_NIVEIS
    }
  }
  // 5b. x por Brandes–Köpf
  const xs = posicaoX(camadas, nos, pred, suc)
  nos.forEach((n, id) => (n.x = xs[id]))

  // encosta a caixa mais à esquerda/acima em 0 (só nós reais contam)
  let minX = Infinity
  let minY = Infinity
  nos.forEach((n) => {
    if (n.ficticio) return
    minX = Math.min(minX, n.x - n.w / 2)
    minY = Math.min(minY, n.y - n.h / 2)
  })
  const pos = new Map()
  idsComp.forEach((id) => {
    const n = nos.get(id)
    pos.set(id, { x: n.x - minX, y: n.y - minY })
  })
  // pontos de dobra das arestas longas, orientados do v ao w da relação
  const pontos = new Map()
  for (const c of cadeias) {
    if (!c.ficticios.length) continue
    let seq = [c.invertida ? c.orig.w : c.orig.v, ...c.ficticios, c.invertida ? c.orig.v : c.orig.w].map((id) => {
      const n = nos.get(id)
      return { x: n.x - minX, y: n.y - minY }
    })
    if (c.invertida) seq = seq.reverse()
    const dobra = simplificar(seq).slice(1, -1)
    pontos.set(chaveDobra(c.orig.v, c.orig.w), dobra)
    pontos.set(chaveDobra(c.orig.w, c.orig.v), [...dobra].reverse())
  }
  return { pos, pontos }
}

// ---------------------------------------------------------------------------
// Coordenada x — Brandes & Köpf (2001), como no dagre: quatro alinhamentos
// verticais (cima/baixo × esquerda/direita), compactação horizontal de cada um,
// alinhamento pelo mais estreito e, no fim, a média dos dois do meio.
// ---------------------------------------------------------------------------
function posicaoX(camadas, nos, pred, suc) {
  const conflitos = conflitosTipo1(camadas, nos, pred)
  const xss = {}
  for (const vert of ['u', 'd']) {
    let ajustada = vert === 'u' ? camadas : [...camadas].reverse()
    for (const horiz of ['l', 'r']) {
      if (horiz === 'r') ajustada = ajustada.map((c) => [...c].reverse())
      const vizinhos = vert === 'u' ? pred : suc
      const { raiz, alinhado } = alinhamentoVertical(ajustada, conflitos, vizinhos)
      let xs = compactar(ajustada, raiz, alinhado, nos)
      if (horiz === 'r') xs = Object.fromEntries(Object.entries(xs).map(([v, x]) => [v, -x]))
      xss[vert + horiz] = xs
    }
  }
  // o alinhamento mais estreito serve de referência
  let maisEstreito = null
  let menorLargura = Infinity
  for (const xs of Object.values(xss)) {
    let max = -Infinity
    let min = Infinity
    for (const [v, x] of Object.entries(xs)) {
      const meia = nos.get(v).w / 2
      max = Math.max(x + meia, max)
      min = Math.min(x - meia, min)
    }
    if (max - min < menorLargura) {
      menorLargura = max - min
      maisEstreito = xs
    }
  }
  const refVals = Object.values(maisEstreito)
  const refMin = Math.min(...refVals)
  const refMax = Math.max(...refVals)
  for (const vert of ['u', 'd']) {
    for (const horiz of ['l', 'r']) {
      const k = vert + horiz
      const xs = xss[k]
      if (xs === maisEstreito) continue
      const vals = Object.values(xs)
      const delta = horiz === 'l' ? refMin - Math.min(...vals) : refMax - Math.max(...vals)
      if (delta) xss[k] = Object.fromEntries(Object.entries(xs).map(([v, x]) => [v, x + delta]))
    }
  }
  // equilíbrio: média dos dois valores do meio
  const resultado = {}
  for (const v of Object.keys(xss.ul)) {
    const vals = [xss.ul[v], xss.ur[v], xss.dl[v], xss.dr[v]].sort((a, b) => a - b)
    resultado[v] = (vals[1] + vals[2]) / 2
  }
  return resultado
}

// conflitos "tipo 1": aresta comum que cruza um segmento interno (fictício–fictício)
function conflitosTipo1(camadas, nos, pred) {
  const conflitos = new Map()
  const ordem = (v) => nos.get(v).ordem
  for (let r = 1; r < camadas.length; r++) {
    const anterior = camadas[r - 1]
    const camada = camadas[r]
    let k0 = 0
    let inicio = 0
    const ultimo = camada[camada.length - 1]
    camada.forEach((v, i) => {
      const w = nos.get(v).ficticio ? pred.get(v).find((u) => nos.get(u).ficticio) : undefined
      const k1 = w ? ordem(w) : anterior.length
      if (w || v === ultimo) {
        for (const alvo of camada.slice(inicio, i + 1)) {
          for (const u of pred.get(alvo)) {
            const uPos = ordem(u)
            if ((uPos < k0 || k1 < uPos) && !(nos.get(u).ficticio && nos.get(alvo).ficticio)) {
              marcarConflito(conflitos, u, alvo)
            }
          }
        }
        inicio = i + 1
        k0 = k1
      }
    })
  }
  return conflitos
}

function marcarConflito(conflitos, v, w) {
  if (v > w) [v, w] = [w, v]
  if (!conflitos.has(v)) conflitos.set(v, new Set())
  conflitos.get(v).add(w)
}
function temConflito(conflitos, v, w) {
  if (v > w) [v, w] = [w, v]
  return conflitos.has(v) && conflitos.get(v).has(w)
}

// alinha cada nó com a mediana dos vizinhos no nível anterior (blocos verticais)
function alinhamentoVertical(camadas, conflitos, vizinhos) {
  const raiz = {}
  const alinhado = {}
  const pos = {}
  for (const c of camadas)
    c.forEach((v, o) => {
      raiz[v] = v
      alinhado[v] = v
      pos[v] = o
    })
  for (const c of camadas) {
    let ultimoIdx = -1
    for (const v of c) {
      let ws = vizinhos.get(v)
      if (!ws.length) continue
      ws = [...ws].sort((a, b) => pos[a] - pos[b])
      const mp = (ws.length - 1) / 2
      for (let i = Math.floor(mp), il = Math.ceil(mp); i <= il; ++i) {
        const w = ws[i]
        if (alinhado[v] === v && ultimoIdx < pos[w] && !temConflito(conflitos, v, w)) {
          alinhado[w] = v
          alinhado[v] = raiz[v] = raiz[w]
          ultimoIdx = pos[w]
        }
      }
    }
  }
  return { raiz, alinhado }
}

// compacta os blocos da esquerda para a direita respeitando a separação
function compactar(camadas, raiz, alinhado, nos) {
  // grafo de blocos: raiz → raiz vizinha à direita, com a separação mínima
  const blocos = []
  const temBloco = new Set()
  const arestas = new Map() // "u\0v" → { v: u, w: v, sep }
  const entra = new Map()
  const sai = new Map()
  const separacao = (v, u) => {
    const a = nos.get(v)
    const b = nos.get(u)
    return a.w / 2 + (a.ficticio ? SEPARACAO_ARESTAS : SEPARACAO_NOS) / 2 + (b.ficticio ? SEPARACAO_ARESTAS : SEPARACAO_NOS) / 2 + b.w / 2
  }
  const addBloco = (b) => {
    if (temBloco.has(b)) return
    temBloco.add(b)
    blocos.push(b)
    entra.set(b, [])
    sai.set(b, [])
  }
  for (const c of camadas) {
    let u
    for (const v of c) {
      const rv = raiz[v]
      addBloco(rv)
      if (u !== undefined) {
        const ru = raiz[u]
        const chave = `${ru}\u0000${rv}`
        const atual = arestas.get(chave)
        const sep = Math.max(separacao(v, u), atual ? atual.sep : 0)
        if (atual) atual.sep = sep
        else {
          const e = { v: ru, w: rv, sep }
          arestas.set(chave, e)
          sai.get(ru).push(e)
          entra.get(rv).push(e)
        }
      }
      u = v
    }
  }
  const xs = {}
  const iterar = (definir, proximos) => {
    let pilha = [...blocos]
    let el = pilha.pop()
    const visto = new Set()
    while (el !== undefined) {
      if (visto.has(el)) definir(el)
      else {
        visto.add(el)
        pilha.push(el)
        pilha = pilha.concat(proximos(el))
      }
      el = pilha.pop()
    }
  }
  // 1.ª passada: menor x possível; 2.ª: puxa para a direita até o limite
  iterar(
    (el) => (xs[el] = entra.get(el).reduce((acc, e) => Math.max(acc, xs[e.v] + e.sep), 0)),
    (el) => [...new Set(entra.get(el).map((e) => e.v))],
  )
  iterar(
    (el) => {
      const min = sai.get(el).reduce((acc, e) => Math.min(acc, xs[e.w] - e.sep), Infinity)
      if (min !== Infinity) xs[el] = Math.max(xs[el], min)
    },
    (el) => [...new Set(sai.get(el).map((e) => e.w))],
  )
  for (const v of Object.values(alinhado)) xs[v] = xs[raiz[v]]
  return xs
}
