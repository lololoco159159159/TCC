import { executarCypher } from './neo4j'

// Agregados do grafo para a Home (N9 — ESTADO_ATUAL.md §4.5): a banda de
// estatísticas e a grade "Encontre as habilidades da sua turma" deixam de vir
// do mock e passam a ser consultas Cypher no Neo4j — tudo o que a Home mostra
// sai do que o grafo da orientadora tem (hoje, o 1.º ano de Matemática; quando
// EF2, EF3… forem carregados, aparecem sozinhos). Só lê o banco.

// (COLLECT { } e não [(a:Ano) | …]: a compreensão de padrão exige uma relação)
const ESTATISTICAS =
  'RETURN COUNT { (:Habilidade) } AS habilidades, COUNT { (:UnidadeTematica) } AS unidades, ' +
  'COLLECT { MATCH (a:Ano) RETURN a.codigo } AS anos'
const ANOS = 'MATCH (a:Ano) RETURN a.codigo AS codigo, a.nome AS nome'

// número do ano a partir do código (EF1 → 1): o modelo não guarda o número
// como propriedade; 0 quando o código não tem dígito
export const numeroDoAno = (codigo) => Number(String(codigo ?? '').replace(/\D/g, '')) || 0

// banda de estatísticas: { habilidades, unidades, anos: [1, …] (números, em ordem) }
export async function estatisticasDoGrafo() {
  const { linhas } = await executarCypher(ESTATISTICAS)
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

// grade da Home: um item por Ano do grafo ({ codigo, nome }), em ordem de ano
export async function anosDoGrafo() {
  const { linhas } = await executarCypher(ANOS)
  return linhas.sort(
    (a, b) => numeroDoAno(a.codigo) - numeroDoAno(b.codigo) || String(a.codigo).localeCompare(String(b.codigo)),
  )
}
