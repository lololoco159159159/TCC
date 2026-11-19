import { consultarGrafo } from './neo4j'

// Agregados do grafo para a Home: a banda de estatísticas e a grade "Encontre
// as habilidades da sua turma" — tudo o que a Home mostra sai do que o grafo da
// orientadora tem (quando EF3, EF4… forem carregados, aparecem sozinhos). As
// consultas moram na API (api/grafo.py): a contagem anda pelas relações do
// modelo — habilidade é quem um Ano desenvolve; unidade, quem um componente
// curricular tem —, então conta todo componente, inclusive os que ainda vão
// chegar. Só lê o banco.

// número do ano a partir do código (EF1 → 1): o modelo não guarda o número
// como propriedade; 0 quando o código não tem dígito
const numeroDoAno = (codigo) => Number(String(codigo ?? '').replace(/\D/g, '')) || 0

// banda de estatísticas: { habilidades, unidades, anos: [1, …] (números, em ordem) }
export async function estatisticasDoGrafo() {
  const { linhas } = await consultarGrafo('/api/grafo/estatisticas', { descricao: 'Home · banda de estatísticas' })
  const { habilidades, unidades, anos } = linhas[0]
  return {
    habilidades,
    unidades,
    anos: anos
      .map(numeroDoAno)
      .filter(Boolean)
      .sort((a, b) => a - b),
  }
}

// grade da Home: um item por Ano do grafo ({ codigo, nome }), em ordem de ano.
// N12: a busca do professor usa a mesma consulta, com a própria descrição na gaveta
export async function anosDoGrafo({ descricao = 'Home · turmas da grade' } = {}) {
  const { linhas } = await consultarGrafo('/api/grafo/anos', { descricao })
  return linhas.sort(
    (a, b) => numeroDoAno(a.codigo) - numeroDoAno(b.codigo) || String(a.codigo).localeCompare(String(b.codigo)),
  )
}
