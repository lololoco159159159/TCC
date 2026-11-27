import { useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import BotoesConta from '../components/BotoesConta'
import CabecalhoPagina from '../components/CabecalhoPagina'
import { ONTOLOGIAS } from '../data/ontologias'

// Ontologias (D23, 2026-11-18 — pedido da orientadora): o site disponibiliza as
// ontologias criadas por ela, para baixar e reutilizar. SÓ FRONT-END e, por ora,
// com EXEMPLOS ILUSTRATIVOS (src/data/ontologias.js): o botão "Baixar" fica
// desligado até o item ter `arquivo`.
// Revisão visual de 2026-11-18: cartões em duas colunas (uma no celular), cada
// um com o FORMATO numa aba de arquivo presa ao topo (OWL verde, TTL dourado),
// título em Spectral, a descrição, uma ficha com os dados e o "Baixar"; a
// explicação dos formatos virou uma nota no fim, no lugar da coluna lateral.

const LARGURA = 1080
const COR_FORMATO = { OWL: 'var(--green)', TTL: 'var(--gold)' }
const MONO = { font: "11px/1.4 'JetBrains Mono', monospace", color: 'var(--faint)' }

// a aba do arquivo, presa à borda de cima do cartão
function AbaFormato({ formato }) {
  return (
    <span
      style={{
        position: 'absolute',
        top: -1,
        left: 22,
        padding: '6px 12px 7px',
        borderRadius: '0 0 9px 9px',
        background: COR_FORMATO[formato] || 'var(--muted)',
        color: '#fff',
        font: "700 11px/1 'JetBrains Mono', monospace",
        letterSpacing: '0.1em',
      }}
    >
      {formato}
    </span>
  )
}

function Ficha({ itens }) {
  return (
    <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', rowGap: 10, columnGap: 18 }}>
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo}>
          <dt style={{ ...MONO, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{rotulo}</dt>
          <dd style={{ margin: '2px 0 0', font: "600 13.5px/1.35 'Figtree', sans-serif", color: 'var(--body)' }}>{valor}</dd>
        </div>
      ))}
    </dl>
  )
}

const BOTAO = {
  flex: 'none',
  padding: '11px 20px',
  borderRadius: 999,
  border: 'none',
  background: 'var(--green)',
  color: '#fff',
  font: "700 13.5px/1 'Figtree', sans-serif",
  textDecoration: 'none',
}

function Ontologias({ onHome, onLogin, onSignup, onGrafos, onForum, onOntologias, onArquiteturas }) {
  const [filtro, setFiltro] = useState('Todas')
  const componentes = ['Todas', ...new Set(ONTOLOGIAS.map((o) => o.componente))]
  const lista = ONTOLOGIAS.filter((o) => filtro === 'Todas' || o.componente === filtro)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <SiteHeader paginaAtiva="ontologias" onHome={onHome} onGrafos={onGrafos} onForum={onForum} onOntologias={onOntologias} onArquiteturas={onArquiteturas}>
        <BotoesConta onLogin={onLogin} onSignup={onSignup} />
      </SiteHeader>

      <CabecalhoPagina
        migalha="EduGraph › Ontologias"
        titulo="Ontologias do"
        destaque="currículo."
        frase="Ontologias criadas pela orientadora do projeto para descrever a BNCC e o pensamento computacional. Baixe, abra num editor como o Protégé e reutilize nos seus projetos."
        aviso="Exemplos ilustrativos: as ontologias reais entram em breve"
      />

      <main style={{ maxWidth: LARGURA, margin: '0 auto', padding: '30px 32px 80px' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}
        >
          <div role="group" aria-label="Filtrar por componente" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {componentes.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={filtro === c}
                onClick={() => setFiltro(c)}
                className={filtro === c ? 'eg-materia-chip eg-materia-chip--sel' : 'eg-materia-chip'}
              >
                {c}
              </button>
            ))}
          </div>
          <span style={MONO}>
            {lista.length} {lista.length === 1 ? 'ontologia' : 'ontologias'}
          </span>
        </div>

        <div className="eg-ontologias-grade">
          {lista.map((o) => (
            <article
              key={o.id}
              className="eg-ontologia-card"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                padding: '44px 24px 22px',
                background: 'var(--pill-bg)',
                border: '1px solid var(--pill-border)',
                borderRadius: 16,
              }}
            >
              <AbaFormato formato={o.formato} />
              {o.exemplo ? (
                <span style={{ position: 'absolute', top: 14, right: 18, ...MONO, color: 'var(--gold)' }}>exemplo</span>
              ) : null}
              <h2 style={{ margin: 0, font: "600 24px/1.15 'Spectral', serif", letterSpacing: '-0.01em', color: 'var(--text)' }}>{o.titulo}</h2>
              <p style={{ margin: '10px 0 20px', fontSize: 14.5, lineHeight: 1.6, color: 'var(--muted)', flex: 1 }}>{o.descricao}</p>
              <div style={{ borderTop: '1px dashed var(--pill-border)', paddingTop: 16, marginBottom: 18 }}>
                <Ficha
                  itens={[
                    ['Componente', o.componente],
                    ['Anos', o.anos],
                    ['Classes', o.classes],
                    ['Versão', o.versao],
                  ]}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={MONO}>
                  {o.tamanho} · atualizada em {o.atualizada}
                </span>
                {o.arquivo ? (
                  <a className="eg-grafo-filtrar" href={o.arquivo} download style={BOTAO}>
                    ↓ Baixar {o.formato}
                  </a>
                ) : (
                  <button type="button" className="eg-grafo-filtrar" disabled title="Arquivo em breve" style={BOTAO}>
                    ↓ Baixar {o.formato}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        <p style={{ margin: '30px 0 0', fontSize: 13.5, lineHeight: 1.7, color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--body)' }}>Formatos.</strong> OWL é a Web Ontology Language, o padrão do W3C;
          TTL (Turtle) descreve a mesma coisa num texto mais fácil de ler. Os dois abrem em editores de ontologia como o
          Protégé. Os grafos do EduGraph seguem a mesma estrutura —{' '}
          <span className="eg-link-nav" onClick={onGrafos} style={{ color: 'var(--green)', fontWeight: 600 }}>
            explore o grafo
          </span>
          .
        </p>
      </main>

      <Footer onSignup={onSignup} onGrafos={onGrafos} onForum={onForum} onOntologias={onOntologias} onArquiteturas={onArquiteturas} />
    </div>
  )
}

export default Ontologias
