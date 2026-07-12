import labotim from '../assets/labotim.png'
import ufes from '../assets/ufes.png'

// Par de logos institucionais (LabOtim + UFES) dos headers (R6): a Home usa
// 24px de altura com padding maior; a página de grafos, 22px. O Footer tem a
// própria variação (cards maiores na faixa "Uma iniciativa de") e de propósito
// NÃO usa este componente — lá é um design distinto, não duplicação acidental.
// Retorna um fragment: os dois <a> continuam filhos diretos do flex do header
// (o espaçamento vem do gap do pai) — DOM idêntico ao que foi extraído.

const ESTILO_LINK = {
  display: 'inline-flex',
  alignItems: 'center',
  background: '#fff',
  border: '1px solid rgba(28,38,32,.08)',
  borderRadius: 9,
  boxShadow: '0 2px 7px -4px rgba(0,0,0,.25)',
}

function LogosInstitucionais({ altura, padding }) {
  return (
    <>
      <a
        href="https://labotim.inf.ufes.br"
        target="_blank"
        rel="noopener"
        title="LabOtim · Laboratório de Otimização e Modelagem Computacional"
        style={{ ...ESTILO_LINK, padding }}
      >
        <img src={labotim} alt="LabOtim" style={{ height: altura, display: 'block' }} />
      </a>
      <a
        href="https://www.ufes.br"
        target="_blank"
        rel="noopener"
        title="Universidade Federal do Espírito Santo"
        style={{ ...ESTILO_LINK, padding }}
      >
        <img src={ufes} alt="UFES" style={{ height: altura, display: 'block' }} />
      </a>
    </>
  )
}

export default LogosInstitucionais
