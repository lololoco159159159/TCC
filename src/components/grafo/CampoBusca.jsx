import { useEffect, useId, useRef, useState } from 'react'
import { filtrarOpcoes, marcarTrechos } from '../../data/filtrosDeBusca'
import { MONO_LABEL } from './estilos'

// Campo da busca do professor (N14 — ESTADO_ATUAL.md §4.5, decisões 19–28): uma
// caixa de texto que filtra uma lista de opções, no padrão *combobox* das
// WAI-ARIA Authoring Practices (caixa + lista, com aria-activedescendant). O
// filtro é o de src/data/filtrosDeBusca.js e roda a cada tecla, no navegador:
// nenhuma consulta ao Neo4j enquanto o professor digita, e por isso sem
// intervalo de tempo. Campo vazio = a lista inteira (clicar na caixa já a
// abre). Teclado: ↓/↑ percorrem, Enter escolhe, Esc fecha; mouse também.
// O escolhido aparece na caixa (código — texto); ao entrar nela, a caixa fica
// livre para digitar e o escolhido passa para o placeholder.
// (O campo de várias escolhas, com etiquetas, saiu em 2026-10-24 junto com a
// única pergunta que o usava.)

const LIMITE_LISTA = 100 // opções desenhadas de uma vez; o resto aparece ao digitar

const ROTULO = { ...MONO_LABEL, display: 'block', marginBottom: 5 }
const CAIXA = {
  display: 'flex',
  alignItems: 'center',
  minHeight: 38,
  padding: '4px 10px',
  border: '1px solid var(--pill-border)',
  borderRadius: 10,
  background: 'var(--bg)',
  cursor: 'text',
}
const ENTRADA = {
  flex: 1,
  minWidth: 0,
  padding: '5px 0',
  border: 'none',
  background: 'transparent',
  font: "600 13px/1.3 'Figtree', sans-serif",
  color: 'var(--body)',
  outline: 'none',
  textOverflow: 'ellipsis',
}
const LISTA = {
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: 4,
  width: 'min(460px, calc(100vw - 32px))',
  maxHeight: 340,
  overflowY: 'auto',
  padding: 4,
  listStyle: 'none',
  background: 'var(--pill-bg)',
  border: '1px solid var(--pill-border)',
  borderRadius: 12,
  boxShadow: '0 14px 36px -12px rgba(0,0,0,.28)',
}
const OPCAO = { display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }
const OPCAO_ATIVA = { ...OPCAO, background: 'var(--grafo-previa-bg)' }
const TITULO_OPCAO = { font: "600 13px/1.35 'Figtree', sans-serif", color: 'var(--text)' }
const TEXTO_OPCAO = { marginTop: 2, font: "400 12.5px/1.4 'Figtree', sans-serif", color: 'var(--body)' }
const DETALHE_OPCAO = { marginTop: 3, font: "10.5px/1.4 'JetBrains Mono', monospace", color: 'var(--muted)' }
const MARCA = { background: 'color-mix(in srgb, var(--green) 20%, transparent)', color: 'inherit', borderRadius: 3 }
const AVISO = { ...LISTA, padding: '12px 14px', font: "400 12.5px/1.4 'Figtree', sans-serif", color: 'var(--muted)' }

// o texto com o trecho digitado marcado (também quando foi digitado sem acento)
const comMarcas = (texto, busca) =>
  marcarTrechos(texto, busca).map((t, i) =>
    t.marcado ? (
      <mark key={i} style={MARCA}>
        {t.texto}
      </mark>
    ) : (
      <span key={i}>{t.texto}</span>
    ),
  )

// o escolhido escrito na caixa / no placeholder: "EF01MA17 — Reconhecer…"
const escrito = (op) => (op.texto ? `${op.titulo} — ${op.texto}` : op.titulo)

/**
 * @param {object} props
 * @param {string} props.rotulo  o nome do campo, acima da caixa
 * @param {object[]} props.opcoes  as opções do campo, no formato de
 *   opcoesDoCampo(): { id, titulo, texto?, detalhe, busca }
 * @param {string|null} props.valor  o id escolhido
 * @param {(valor: string) => void} props.aoMudar
 * @param {number} [props.largura]
 */
function CampoBusca({ rotulo, opcoes, valor, aoMudar, largura = 270 }) {
  const id = useId()
  const [texto, setTexto] = useState('')
  const [aberto, setAberto] = useState(false)
  const [focado, setFocado] = useState(false)
  const [ativo, setAtivo] = useState(0)
  const entrada = useRef(null)
  const lista = useRef(null)

  const escolhido = valor ? opcoes.find((o) => o.id === valor) || null : null
  const filtradas = aberto ? filtrarOpcoes(opcoes, texto) : []
  const visiveis = filtradas.slice(0, LIMITE_LISTA)
  const iAtivo = Math.min(ativo, visiveis.length - 1)
  const idOpcao = (i) => `${id}-opcao-${i}`

  // a opção ativa fica sempre à vista na lista (↓/↑ além da borda rolam)
  useEffect(() => {
    if (aberto) lista.current?.querySelector(`[data-i="${iAtivo}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [aberto, iAtivo])

  const abrir = () => {
    setAberto(true)
    setAtivo(0)
  }
  const fechar = () => {
    setAberto(false)
    setTexto('')
  }
  const escolher = (op) => {
    aoMudar(op.id)
    fechar()
  }

  const aoTeclar = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const n = visiveis.length
      if (!aberto) abrir()
      else if (n) setAtivo((iAtivo + (e.key === 'ArrowDown' ? 1 : n - 1)) % n)
    } else if (e.key === 'Enter') {
      if (aberto && visiveis[iAtivo]) {
        e.preventDefault()
        escolher(visiveis[iAtivo])
      }
    } else if (e.key === 'Escape') {
      // fecha só a lista: o Esc da página (limpar a seleção do grafo) não recebe
      if (aberto) {
        e.stopPropagation()
        fechar()
      }
    }
  }

  return (
    <div style={{ position: 'relative', flex: 'none', width: largura }}>
      <label htmlFor={`${id}-caixa`} style={ROTULO}>
        {rotulo}
      </label>
      {/* clicar em qualquer ponto da caixa (não só no texto) entra nela e abre a lista */}
      <div
        className="eg-campo-busca"
        style={CAIXA}
        onClick={() => {
          entrada.current?.focus()
          if (!aberto) abrir()
        }}
      >
        <input
          ref={entrada}
          id={`${id}-caixa`}
          className={escolhido ? 'eg-campo-busca-entrada eg-campo-busca-entrada--escolhido' : 'eg-campo-busca-entrada'}
          role="combobox"
          aria-expanded={aberto}
          aria-controls={`${id}-lista`}
          aria-autocomplete="list"
          aria-activedescendant={aberto && visiveis[iAtivo] ? idOpcao(iAtivo) : undefined}
          value={focado || !escolhido ? texto : escrito(escolhido)}
          placeholder={escolhido ? escrito(escolhido) : 'Digite o código ou parte do texto'}
          title={escolhido ? escrito(escolhido) : undefined}
          onChange={(e) => {
            setTexto(e.target.value)
            setAberto(true)
            setAtivo(0)
          }}
          onFocus={() => setFocado(true)}
          onBlur={() => {
            setFocado(false)
            fechar()
          }}
          onKeyDown={aoTeclar}
          autoComplete="off"
          spellCheck={false}
          style={ENTRADA}
        />
      </div>
      {aberto && visiveis.length > 0 && (
        // mousedown sem efeito padrão: clicar numa opção não tira o foco da caixa
        <ul ref={lista} id={`${id}-lista`} role="listbox" aria-label={rotulo} style={LISTA} onMouseDown={(e) => e.preventDefault()}>
          {visiveis.map((op, i) => (
            <li
              key={op.id}
              id={idOpcao(i)}
              data-i={i}
              role="option"
              aria-selected={op.id === valor}
              style={i === iAtivo ? OPCAO_ATIVA : OPCAO}
              onMouseMove={() => i !== iAtivo && setAtivo(i)}
              onClick={() => escolher(op)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={TITULO_OPCAO}>{comMarcas(op.titulo, texto)}</div>
                {op.texto ? <div style={TEXTO_OPCAO}>{comMarcas(op.texto, texto)}</div> : null}
                {op.detalhe ? <div style={DETALHE_OPCAO}>{op.detalhe}</div> : null}
              </div>
              <span aria-hidden="true" style={{ flex: 'none', width: 14, color: 'var(--green)', fontWeight: 700 }}>
                {op.id === valor ? '✓' : ''}
              </span>
            </li>
          ))}
          {filtradas.length > LIMITE_LISTA ? (
            <li role="presentation" style={{ ...DETALHE_OPCAO, padding: '6px 10px' }}>
              Mostrando {LIMITE_LISTA} de {filtradas.length} — digite para filtrar.
            </li>
          ) : null}
        </ul>
      )}
      {aberto && visiveis.length === 0 && (
        <div role="status" style={AVISO}>
          {texto.trim() ? `Nada encontrado com “${texto.trim()}” neste ano e matéria.` : 'Nada para escolher aqui.'}
        </div>
      )}
    </div>
  )
}

export default CampoBusca
