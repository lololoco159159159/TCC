import { useEffect, useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import BotoesConta from '../components/BotoesConta'
import CabecalhoPagina from '../components/CabecalhoPagina'
import { EIXOS } from '../data/arquiteturas'

// Arquiteturas pedagógicas (2026-11-26, pedido do autor): o professor monta a
// arquitetura da aula em quatro eixos (metodológico, organizacional, conteúdo e
// tecnológico) e baixa um documento no fim. SÓ FRONT-END: não fala com a API nem
// com o Neo4j. As opções das caixas são exemplos (src/data/arquiteturas.js), e o
// que o professor preenche fica salvo só neste navegador (localStorage).

const LARGURA = 1080
const CHAVE = 'edugraphArquiteturas'
const NOME_ARQUIVO = 'arquitetura-pedagogica.txt'
const ROTULO = {
  display: 'block',
  marginBottom: 6,
  font: "10.5px/1.2 'JetBrains Mono', monospace",
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--green)',
}
const BOTAO = {
  padding: '13px 24px',
  borderRadius: 999,
  border: 'none',
  background: 'var(--green)',
  color: '#fff',
  font: "700 14.5px/1 'Figtree', sans-serif",
  cursor: 'pointer',
}

// tudo em branco: as caixas sem escolha e os campos de escrever vazios
const emBranco = (lista) => Object.fromEntries(lista.map((c) => [c.id, '']))
const vazio = () =>
  Object.fromEntries(EIXOS.map((e) => [e.id, { selecoes: emBranco(e.campos), escritos: emBranco(e.escritos), texto: '' }]))

// lê o que ficou salvo, campo a campo: um valor fora das opções atuais é descartado
function lerSalvo() {
  const escolhas = vazio()
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || '{}')
    for (const e of EIXOS) {
      const s = salvo?.[e.id]
      if (!s || typeof s !== 'object') continue
      for (const c of e.campos) {
        if (c.opcoes.includes(s.selecoes?.[c.id])) escolhas[e.id].selecoes[c.id] = s.selecoes[c.id]
      }
      for (const c of e.escritos) {
        if (typeof s.escritos?.[c.id] === 'string') escolhas[e.id].escritos[c.id] = s.escritos[c.id]
      }
      if (typeof s.texto === 'string') escolhas[e.id].texto = s.texto
    }
  } catch {
    // sem localStorage (modo privado) ou dado corrompido: começa em branco
  }
  return escolhas
}

// O conteúdo do documento. Por enquanto é um texto fixo, só para mostrar que o
// download funciona; quando o formato for definido, esta função passa a montar o
// documento a partir das escolhas, e nada mais muda.
function gerarDocumento() {
  return 'tudo funcionando'
}

function baixarTexto(texto, nome) {
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url))
}

const feitosDe = (eixo, valor) => eixo.campos.filter((c) => valor.selecoes[c.id]).length

// o círculo que enche conforme as caixas do eixo são escolhidas
function Progresso({ feitos, total, tamanho = 14 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: tamanho,
        height: tamanho,
        flex: 'none',
        borderRadius: '50%',
        border: '2px solid var(--green)',
        background: `conic-gradient(var(--green) ${(feitos / total) * 360}deg, transparent 0deg)`,
      }}
    />
  )
}

function CardEixo({ eixo, valor, aoMudar }) {
  const feitos = feitosDe(eixo, valor)
  const total = eixo.campos.length
  const id = (parte) => `arq-${eixo.id}-${parte}`

  return (
    <section
      aria-labelledby={id('titulo')}
      style={{ padding: '28px 30px 30px', background: 'var(--pill-bg)', border: '1px solid var(--pill-border)', borderRadius: 18 }}
    >
      <header
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}
      >
        <div style={{ maxWidth: 640 }}>
          <h2 id={id('titulo')} style={{ margin: 0, font: "600 27px/1.15 'Spectral', serif", letterSpacing: '-0.01em', color: 'var(--text)' }}>
            {eixo.nome}
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, lineHeight: 1.6, color: 'var(--muted)' }}>{eixo.frase}</p>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 6,
            font: "11px/1 'JetBrains Mono', monospace",
            color: feitos === total ? 'var(--green)' : 'var(--faint)',
          }}
        >
          <Progresso feitos={feitos} total={total} />
          {feitos} de {total} escolhas
        </span>
      </header>

      <div className="eg-arq-campos">
        {eixo.campos.map((c) => (
          <div key={c.id}>
            <label htmlFor={id(c.id)} style={ROTULO}>
              {c.rotulo}
            </label>
            <select
              id={id(c.id)}
              className="eg-arq-campo"
              value={valor.selecoes[c.id]}
              onChange={(ev) => aoMudar('selecoes', c.id, ev.target.value)}
            >
              <option value="">Escolha…</option>
              {c.opcoes.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="eg-arq-campos" style={{ marginTop: 20, paddingTop: 20, borderTop: '1px dashed var(--pill-border)' }}>
        {eixo.escritos.map((c) => (
          <div key={c.id}>
            <label htmlFor={id(c.id)} style={ROTULO}>
              {c.rotulo}
            </label>
            <input
              id={id(c.id)}
              type="text"
              className="eg-arq-campo"
              value={valor.escritos[c.id]}
              maxLength={200}
              placeholder={c.dica}
              onChange={(ev) => aoMudar('escritos', c.id, ev.target.value)}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <label htmlFor={id('texto')} style={ROTULO}>
          {eixo.texto}
        </label>
        <textarea
          id={id('texto')}
          className="eg-arq-campo eg-arq-texto"
          rows={4}
          value={valor.texto}
          placeholder="Escreva o que as caixas não cobrem: objetivos, cuidados, ideias para a aula."
          onChange={(ev) => aoMudar('texto', null, ev.target.value)}
        />
      </div>
    </section>
  )
}

function Arquiteturas({ onHome, onLogin, onSignup, onGrafos, onForum, onOntologias, onArquiteturas }) {
  const [escolhas, setEscolhas] = useState(lerSalvo)
  const [baixado, setBaixado] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(escolhas))
    } catch {
      // sem localStorage: a página funciona, só não guarda
    }
  }, [escolhas])

  // grupo: 'selecoes' ou 'escritos' (com o campo) ou 'texto' (o espaço livre)
  const mudar = (eixo, grupo, campo, valor) =>
    setEscolhas((a) => ({
      ...a,
      [eixo]: { ...a[eixo], [grupo]: grupo === 'texto' ? valor : { ...a[eixo][grupo], [campo]: valor } },
    }))

  const completos = EIXOS.filter((e) => feitosDe(e, escolhas[e.id]) === e.campos.length).length
  const faltam = EIXOS.length - completos
  const algoPreenchido = EIXOS.some(
    (e) =>
      feitosDe(e, escolhas[e.id]) > 0 ||
      Object.values(escolhas[e.id].escritos).some((t) => t.trim()) ||
      escolhas[e.id].texto.trim(),
  )

  function baixar() {
    baixarTexto(gerarDocumento(escolhas), NOME_ARQUIVO)
    setBaixado(true)
  }

  function limpar() {
    if (window.confirm('Apagar as escolhas e as anotações dos quatro eixos?')) {
      setEscolhas(vazio())
      setBaixado(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <SiteHeader
        paginaAtiva="arquiteturas"
        onHome={onHome}
        onGrafos={onGrafos}
        onForum={onForum}
        onOntologias={onOntologias}
        onArquiteturas={onArquiteturas}
      >
        <BotoesConta onLogin={onLogin} onSignup={onSignup} />
      </SiteHeader>

      <CabecalhoPagina
        migalha="EduGraph › Arquiteturas pedagógicas"
        titulo="Arquiteturas"
        destaque="pedagógicas."
        frase="Monte a arquitetura da sua aula em quatro eixos: o método, a organização, o conteúdo e a tecnologia. Escolha as opções, escreva o que faltar e baixe o documento no fim da página."
        aviso="Prévia: as opções são exemplos e o documento baixado é de teste"
      />

      <main style={{ maxWidth: LARGURA, margin: '0 auto', padding: '30px 32px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {EIXOS.map((e) => (
            <CardEixo
              key={e.id}
              eixo={e}
              valor={escolhas[e.id]}
              aoMudar={(grupo, campo, v) => mudar(e.id, grupo, campo, v)}
            />
          ))}
        </div>

        <section
          aria-labelledby="arq-documento"
          style={{
            marginTop: 34,
            padding: '28px 30px',
            background: 'var(--bg2)',
            border: '1px solid var(--pill-border)',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <h2 id="arq-documento" style={{ margin: 0, font: "600 24px/1.15 'Spectral', serif", letterSpacing: '-0.01em', color: 'var(--text)' }}>
              Documento da arquitetura
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: 14.5, lineHeight: 1.6, color: 'var(--muted)' }}>
              {faltam === 0
                ? 'Os quatro eixos estão completos.'
                : `Faltam escolhas em ${faltam} ${faltam === 1 ? 'eixo' : 'eixos'}.`}{' '}
              Baixe o documento com as escolhas dos quatro eixos.
            </p>
            <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
              {EIXOS.map((e) => (
                <li
                  key={e.id}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, font: "600 13px/1 'Figtree', sans-serif", color: 'var(--body)' }}
                >
                  <Progresso feitos={feitosDe(e, escolhas[e.id])} total={e.campos.length} tamanho={12} />
                  {e.nome}
                </li>
              ))}
            </ul>
            <p style={{ margin: '14px 0 0', font: "11px/1.4 'JetBrains Mono', monospace", color: 'var(--faint)' }}>
              As escolhas ficam salvas só neste navegador.
            </p>
          </div>

          <div className="eg-arq-acoes" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button type="button" className="eg-arq-limpar" disabled={!algoPreenchido} onClick={limpar}>
                Limpar tudo
              </button>
              <button type="button" className="eg-grafo-filtrar" onClick={baixar} style={BOTAO}>
                ↓ Baixar documento
              </button>
            </div>
            <p role="status" style={{ margin: 0, minHeight: 16, font: "11px/1.4 'JetBrains Mono', monospace", color: 'var(--green)' }}>
              {baixado ? `Documento baixado: ${NOME_ARQUIVO}` : ''}
            </p>
          </div>
        </section>
      </main>

      <Footer onSignup={onSignup} onGrafos={onGrafos} onForum={onForum} onOntologias={onOntologias} onArquiteturas={onArquiteturas} />
    </div>
  )
}

export default Arquiteturas
