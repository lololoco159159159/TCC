import { useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import BotoesConta from '../components/BotoesConta'
import CabecalhoPagina from '../components/CabecalhoPagina'
import PontoNo from '../components/grafo/PontoNo'
import { TOPICOS } from '../data/forum'

// Fórum dos professores (D23, 2026-11-18 — pedido da orientadora): conversas
// abertas em que os professores escrevem e dialogam. SÓ FRONT-END: o conteúdo é
// ilustrativo (src/data/forum.js) e uma resposta nova fica só na memória da
// tela (some ao recarregar).
// Revisão de 2026-11-18 (pedido do autor: "não ter muita coisa"): sem
// categorias nem coluna lateral — só as conversas em andamento; clicar numa já
// abre a conversa. A ASSINATURA vem do próprio EduGraph: a conversa é desenhada
// como um caminho no grafo — cada mensagem é um nó (o avatar) sobre uma aresta
// vertical na cor das arestas do canvas, e a caixa de resposta é o próximo nó,
// tracejado. Na lista, os códigos da BNCC que a conversa discute aparecem com o
// pontinho da cor de Habilidade, como na legenda do grafo.

const LARGURA = 820
const NO = 44 // diâmetro do avatar-nó na conversa
const CORES_AVATAR = ['var(--green)', 'var(--gold)', 'var(--no-objeto)', 'var(--no-unidade)', 'var(--no-componente)']
const MONO = { font: "11px/1.4 'JetBrains Mono', monospace", color: 'var(--faint)' }
const VOCE = { nome: 'Você', funcao: 'Professor(a)', etapa: 'nesta visita' }

const iniciais = (nome) =>
  nome
    .split(/\s+/)
    .filter((p) => /^[A-ZÀ-Ú]/.test(p))
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
// a mesma pessoa tem sempre a mesma cor
const corDe = (nome) => CORES_AVATAR[[...nome].reduce((s, c) => s + c.charCodeAt(0), 0) % CORES_AVATAR.length]

// avatar com as iniciais; `contorno`: anel na cor do fundo (para empilhar ou
// para "furar" a aresta da conversa)
function Avatar({ nome, tamanho = 30, contorno }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: tamanho,
        height: tamanho,
        flex: 'none',
        borderRadius: '50%',
        background: corDe(nome),
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        font: `700 ${Math.round(tamanho * 0.36)}px/1 'Figtree', sans-serif`,
        boxShadow: contorno ? `0 0 0 3px ${contorno}` : 'none',
      }}
    >
      {iniciais(nome)}
    </span>
  )
}

// códigos da BNCC que a conversa discute, com o pontinho de Habilidade do grafo
function Codigos({ lista }) {
  if (!lista.length) return null
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6 }}>
      {lista.map((c) => (
        <span
          key={c}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 9px 4px 7px',
            borderRadius: 999,
            border: '1px solid var(--pill-border)',
            background: 'var(--bg)',
            font: "600 11px/1 'JetBrains Mono', monospace",
            color: 'var(--body)',
          }}
        >
          <PontoNo forma="circulo" cor="var(--no-habilidade)" tamanho={8} />
          {c}
        </span>
      ))}
    </span>
  )
}

// quem participa (sem repetir), empilhado
function Participantes({ mensagens }) {
  const nomes = [...new Set(mensagens.map((m) => m.autor.nome))]
  return (
    <span style={{ display: 'inline-flex' }} title={nomes.join(', ')}>
      {nomes.slice(0, 4).map((n, i) => (
        <span key={n} style={{ marginLeft: i ? -8 : 0 }}>
          <Avatar nome={n} tamanho={26} contorno="var(--pill-bg)" />
        </span>
      ))}
    </span>
  )
}

const respostasDe = (n) => (n === 0 ? 'sem respostas ainda' : n === 1 ? '1 resposta' : `${n} respostas`)

// a conversa de um tópico: um caminho de nós (mensagens) sobre uma aresta, e a
// caixa "Responder" como o próximo nó (D23: só na memória da tela)
export function Conversa({ topico, mensagens, texto, aoMudarTexto, aoResponder }) {
  return (
    <div>
      {topico.habilidades.length ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 26 }}>
          <span style={MONO}>Habilidades em discussão</span>
          <Codigos lista={topico.habilidades} />
        </div>
      ) : null}

      <div style={{ position: 'relative' }}>
        {/* a aresta: do centro do 1.º nó ao centro do nó da resposta */}
        <span
          aria-hidden="true"
          style={{ position: 'absolute', left: NO / 2 - 1, top: NO / 2, bottom: NO / 2, width: 2, background: 'var(--grafo-aresta)' }}
        />
        <ol style={{ position: 'relative', listStyle: 'none', margin: 0, padding: 0 }}>
          {mensagens.map((m, i) => (
            <li key={i} style={{ position: 'relative', display: 'grid', gridTemplateColumns: `${NO}px minmax(0, 1fr)`, gap: 18, paddingBottom: 30 }}>
              <Avatar nome={m.autor.nome} tamanho={NO} contorno="var(--bg)" />
              <article>
                <header style={{ display: 'flex', alignItems: 'center', columnGap: 10, rowGap: 2, flexWrap: 'wrap', minHeight: NO }}>
                  <strong style={{ font: "700 15px/1.3 'Figtree', sans-serif", color: 'var(--text)' }}>{m.autor.nome}</strong>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {m.autor.funcao} · {m.autor.etapa}
                  </span>
                  <span style={{ ...MONO, marginLeft: 'auto' }}>
                    {i === 0 ? <span style={{ color: 'var(--gold)' }}>abriu a conversa · </span> : null}
                    {m.quando}
                  </span>
                </header>
                <p
                  style={{
                    margin: '6px 0 0',
                    padding: '16px 20px',
                    borderRadius: '4px 16px 16px 16px',
                    background: 'var(--pill-bg)',
                    border: '1px solid var(--pill-border)',
                    fontSize: i === 0 ? 16.5 : 15.5,
                    lineHeight: 1.7,
                    color: 'var(--body)',
                  }}
                >
                  {m.texto}
                </p>
              </article>
            </li>
          ))}

          {/* o próximo nó: a resposta de quem está lendo */}
          <li style={{ position: 'relative', display: 'grid', gridTemplateColumns: `${NO}px minmax(0, 1fr)`, gap: 18 }}>
            <span
              aria-hidden="true"
              style={{
                width: NO,
                height: NO,
                borderRadius: '50%',
                border: '2px dashed var(--green)',
                background: 'var(--bg)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                font: "700 18px/1 'Figtree', sans-serif",
                color: 'var(--green)',
              }}
            >
              +
            </span>
            <div>
              <label
                htmlFor="eg-forum-resposta"
                style={{ display: 'block', font: "700 15px/1.3 'Figtree', sans-serif", color: 'var(--text)', padding: '12px 0 10px' }}
              >
                Sua resposta
              </label>
              <textarea
                id="eg-forum-resposta"
                className="eg-forum-resposta"
                value={texto}
                onChange={(e) => aoMudarTexto(e.target.value)}
                rows={4}
                placeholder="Escreva para continuar a conversa…"
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                <span style={MONO}>A resposta aparece só nesta tela — o fórum ainda não salva mensagens.</span>
                <button
                  type="button"
                  className="eg-grafo-filtrar"
                  onClick={aoResponder}
                  disabled={!texto.trim()}
                  style={{
                    padding: '11px 22px',
                    borderRadius: 999,
                    border: 'none',
                    background: 'var(--green)',
                    color: '#fff',
                    font: "700 13.5px/1 'Figtree', sans-serif",
                    cursor: 'pointer',
                  }}
                >
                  Responder
                </button>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </div>
  )
}

function Forum({ onHome, onLogin, onSignup, onGrafos, onForum, onOntologias, onArquiteturas }) {
  const [aberto, setAberto] = useState(null) // id da conversa aberta, ou null = a lista
  const [respostas, setRespostas] = useState({}) // { [idTopico]: mensagens novas desta visita }
  const [texto, setTexto] = useState('')

  const mensagensDe = (t) => [...t.mensagens, ...(respostas[t.id] || [])]
  const topico = TOPICOS.find((t) => t.id === aberto) || null

  const abrir = (id) => {
    setAberto(id)
    setTexto('')
    window.scrollTo(0, 0)
  }
  const voltar = () => {
    setAberto(null)
    window.scrollTo(0, 0)
  }
  const responder = () => {
    const corpo = texto.trim()
    if (!corpo) return
    setRespostas((r) => ({ ...r, [topico.id]: [...(r[topico.id] || []), { autor: VOCE, quando: 'agora', texto: corpo }] }))
    setTexto('')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <SiteHeader paginaAtiva="forum" onHome={onHome} onGrafos={onGrafos} onForum={onForum} onOntologias={onOntologias} onArquiteturas={onArquiteturas}>
        <BotoesConta onLogin={onLogin} onSignup={onSignup} />
      </SiteHeader>

      {topico ? (
        <CabecalhoPagina
          migalha="EduGraph › Fórum"
          titulo={topico.titulo}
          frase={`Aberta por ${topico.mensagens[0].autor.nome} · ${respostasDe(mensagensDe(topico).length - 1)}`}
        >
          <button type="button" className="eg-forum-voltar" onClick={voltar}>
            ← Todas as conversas
          </button>
        </CabecalhoPagina>
      ) : (
        <CabecalhoPagina
          migalha="EduGraph › Fórum"
          titulo="Conversas em"
          destaque="andamento."
          frase="Professores trocando ideias sobre o currículo, as aulas e o grafo. Escolha uma conversa para ler e responder."
          aviso="Prévia: as conversas são de exemplo e as respostas ainda não são salvas"
        />
      )}

      <main style={{ maxWidth: LARGURA, margin: '0 auto', padding: '36px 32px 80px' }}>
        {topico ? (
          <Conversa topico={topico} mensagens={mensagensDe(topico)} texto={texto} aoMudarTexto={setTexto} aoResponder={responder} />
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {TOPICOS.map((t) => {
              const msgs = mensagensDe(t)
              const ultima = msgs[msgs.length - 1]
              return (
                <li key={t.id}>
                  <button type="button" className="eg-forum-topico" onClick={() => abrir(t.id)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <Codigos lista={t.habilidades} />
                      <span style={{ ...MONO, marginLeft: 'auto' }}>última mensagem {ultima.quando}</span>
                    </span>
                    <span
                      style={{
                        display: 'block',
                        margin: '12px 0 8px',
                        font: "600 23px/1.2 'Spectral', serif",
                        letterSpacing: '-0.01em',
                        color: 'var(--text)',
                      }}
                    >
                      {t.titulo}
                    </span>
                    <span
                      style={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                        fontSize: 14.5,
                        lineHeight: 1.6,
                        color: 'var(--muted)',
                      }}
                    >
                      <strong style={{ fontWeight: 600, color: 'var(--body)' }}>{ultima.autor.nome}:</strong> {ultima.texto}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                      <Participantes mensagens={msgs} />
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{respostasDe(msgs.length - 1)}</span>
                      <span className="eg-forum-entrar" aria-hidden="true">
                        Entrar na conversa →
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </main>

      <Footer onSignup={onSignup} onGrafos={onGrafos} onForum={onForum} onOntologias={onOntologias} onArquiteturas={onArquiteturas} />
    </div>
  )
}

export default Forum
