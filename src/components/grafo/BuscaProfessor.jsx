import { useEffect, useState } from 'react'
import { PERGUNTAS, anosDaBusca, carregarRecorte, materiaPorId, materiasDoAno, perguntaPorId } from '../../data/filtrosDeBusca'
import { MONO_LABEL } from './estilos'

// Barra da busca do professor (N13 — ESTADO_ATUAL.md §4.5, decisões 1–6): o
// professor monta a busca só escolhendo opções — Ano → Matéria → Pergunta —, sem
// ver código. Fica logo acima do console Cypher, que continua visível (o autor o
// usa; sai bem depois). Tudo vem do Neo4j na hora (src/data/filtrosDeBusca.js):
// os anos, as matérias que existem no ano escolhido e o recorte do ano na
// matéria (uma consulta só). A matéria nunca vem escolhida sozinha, mesmo quando
// há uma só (decisão 4). Os campos da pergunta e o "Ver no grafo" chegam na N14.
// As escolhas vivem aqui, e não na página: mexer na busca não re-renderiza a
// página inteira (o mesmo cuidado do console).

const BARRA = {
  flex: 'none',
  padding: '10px 26px 8px',
  background: 'var(--pill-bg)',
  borderBottom: '1px solid var(--pill-border)',
  position: 'relative',
  zIndex: 40,
}
const ROTULO = { ...MONO_LABEL, color: 'var(--green)', flex: 'none' }
const SELECT = {
  padding: '9px 26px 9px 11px',
  border: '1px solid var(--pill-border)',
  borderRadius: 10,
  background: 'var(--bg)',
  font: "600 13px/1.3 'Figtree', sans-serif",
  color: 'var(--body)',
  cursor: 'pointer',
  outline: 'none',
  flex: 'none',
}
const SELECT_DESLIGADO = { ...SELECT, opacity: 0.5, cursor: 'default' }
const EXPLICACAO = { flex: 1, minWidth: 0, font: "400 12.5px/1.4 'Figtree', sans-serif", color: 'var(--muted)' }
const STATUS = { minHeight: 15, marginTop: 6, font: "10.5px/1.4 'JetBrains Mono', monospace", color: 'var(--muted)' }
const TENTAR = {
  marginLeft: 8,
  padding: 0,
  border: 'none',
  background: 'transparent',
  font: 'inherit',
  color: 'var(--green)',
  textDecoration: 'underline',
  cursor: 'pointer',
}

// carrega algo do Neo4j com estado { estado: ocioso | carregando | pronto | erro,
// dados }; `chave` muda → recarrega; `tentativa` muda → tenta de novo. A
// resposta que chegar depois de a chave mudar é descartada (troca rápida de ano).
// O estado guarda a chave a que pertence: enquanto a carga da chave atual não
// começou (1.º desenho, ou o quadro logo depois de trocar o ano), ela conta como
// "carregando" — senão apareceriam por um instante a mensagem de "vazio" ou as
// matérias do ano anterior.
function useCarga(carregar, chave, tentativa) {
  const [carga, setCarga] = useState({ chave: null, estado: 'ocioso', dados: null })
  useEffect(() => {
    if (!chave) return undefined
    let ativo = true
    setCarga({ chave, estado: 'carregando', dados: null })
    carregar()
      .then((dados) => {
        if (ativo) setCarga({ chave, estado: 'pronto', dados })
      })
      .catch(() => {
        if (ativo) setCarga({ chave, estado: 'erro', dados: null })
      })
    return () => {
      ativo = false
    }
    // `carregar` é refeita a cada render; quem decide recarregar é a chave
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, tentativa])
  if (!chave) return { estado: 'ocioso', dados: null }
  if (carga.chave !== chave) return { estado: 'carregando', dados: null }
  return carga
}

function BuscaProfessor() {
  const [ano, setAno] = useState('')
  const [materia, setMateria] = useState('')
  const [pergunta, setPergunta] = useState('')
  const [tentativa, setTentativa] = useState(0) // "Tentar de novo" depois de uma falha

  const anos = useCarga(anosDaBusca, 'anos', tentativa)
  const materias = useCarga(() => materiasDoAno(ano), ano, tentativa)
  const recorte = useCarga(() => carregarRecorte(ano, materia), ano && materia ? `${ano}|${materia}` : '', tentativa)

  // trocar o ano zera a matéria (ela depende do ano e nunca vem escolhida sozinha)
  const aoEscolherAno = (e) => {
    setAno(e.target.value)
    setMateria('')
  }
  const tentarDeNovo = (
    <button type="button" style={TENTAR} onClick={() => setTentativa((t) => t + 1)}>
      Tentar de novo
    </button>
  )

  const m = materiaPorId(materia)
  const nomeAno = anos.dados?.find((a) => a.codigo === ano)?.nome || ano
  const listaMaterias = materias.dados || []

  // a linha de estado: o passo que falta, o que está carregando, a falha ou o recorte
  let status
  if (anos.estado === 'carregando') status = 'Carregando os anos…'
  else if (anos.estado === 'erro') status = <>Não foi possível carregar os anos agora.{tentarDeNovo}</>
  else if (!anos.dados?.length) status = 'O grafo ainda não tem anos.'
  else if (!ano) status = 'Escolha o ano, a matéria e o que você quer ver.'
  else if (materias.estado === 'carregando') status = 'Carregando as matérias do ano…'
  else if (materias.estado === 'erro') status = <>Não foi possível carregar as matérias agora.{tentarDeNovo}</>
  else if (!listaMaterias.length) status = 'Nenhuma matéria com habilidades neste ano.'
  else if (!materia) status = 'Escolha a matéria.'
  else if (recorte.estado === 'carregando') status = `Carregando ${nomeAno} em ${m?.nome}…`
  else if (recorte.estado === 'erro') status = <>Não foi possível carregar o ano nesta matéria agora.{tentarDeNovo}</>
  else if (recorte.dados) {
    const r = recorte.dados
    status = r.habilidades.length ? (
      <>
        {nomeAno} · {m.nome}: {r.unidades.length} {m.plurais.unidade} · {r.objetos.length} {m.plurais.objeto} ·{' '}
        {r.habilidades.length} {m.plurais.habilidade}
        {r.cortado ? <span style={{ color: 'var(--gold)' }}> · passou do limite e veio cortado</span> : null}
        {pergunta ? null : <span style={{ color: 'var(--faint)' }}> · escolha o que você quer ver</span>}
      </>
    ) : (
      'Nenhuma habilidade neste ano para esta matéria.'
    )
  }

  const anosProntos = anos.estado === 'pronto' && anos.dados?.length > 0
  const materiasProntas = materias.estado === 'pronto' && listaMaterias.length > 0
  const p = perguntaPorId(pergunta)

  return (
    <div style={BARRA}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap' }}>
        <span style={ROTULO}>Busca</span>
        <select
          value={ano}
          onChange={aoEscolherAno}
          disabled={!anosProntos}
          aria-label="Ano"
          style={anosProntos ? SELECT : SELECT_DESLIGADO}
        >
          <option value="" disabled>
            Ano…
          </option>
          {(anos.dados || []).map((a) => (
            <option key={a.codigo} value={a.codigo}>
              {a.nome}
            </option>
          ))}
        </select>
        <select
          value={materia}
          onChange={(e) => setMateria(e.target.value)}
          disabled={!materiasProntas}
          aria-label="Matéria"
          style={materiasProntas ? SELECT : SELECT_DESLIGADO}
        >
          <option value="" disabled>
            Matéria…
          </option>
          {listaMaterias.map((x) => (
            <option key={x.id} value={x.id}>
              {x.nome}
            </option>
          ))}
        </select>
        <select
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          disabled={!materia}
          aria-label="O que você quer ver"
          style={materia ? SELECT : SELECT_DESLIGADO}
        >
          <option value="" disabled>
            O que você quer ver?
          </option>
          {PERGUNTAS.map((x) => (
            <option key={x.id} value={x.id}>
              {x.titulo}
            </option>
          ))}
        </select>
        <span style={EXPLICACAO}>{materia && p ? p.explicacao : ''}</span>
      </div>
      <div aria-live="polite" style={STATUS}>
        {status}
      </div>
    </div>
  )
}

export default BuscaProfessor
