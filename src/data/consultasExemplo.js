// Consultas Cypher de exemplo do site (ESTADO_ATUAL.md §4.5): o menu
// "Exemplos…" do console da página de grafos (N3) e a consulta que o "Ver o grafo
// desta turma" da Home abre (N9). São as consultas de teste que a orientadora
// passou, copiadas sem mudança — inclusive os títulos e a 7.ª, que tem um erro de
// sintaxe (falta o `)` depois de `:UnidadeTematica`) e serve para testar o card de
// erro. O arquivo original dela (neo4j/consultas) saiu do repositório em
// 2026-10-15; este módulo é a cópia que o site usa.

// "ano direto p habilidade" — também é a consulta do "Ver o grafo desta turma"
export const CONSULTA_ANO_HABILIDADES = `MATCH p = (:Ano)-[:DESENVOLVE_HABILIDADE]->(:Habilidade)
RETURN p`

export const CONSULTAS_EXEMPLO = [
  {
    titulo: 'arvore completa',
    consulta: `MATCH p = (:Ano)-[:TEM_UNIDADE]->(:UnidadeTematica)-[:TEM_OBJETO]->(:ObjetoConhecimento)-[:DESENVOLVE]->(:Habilidade)
RETURN p`,
  },
  {
    titulo: 'geometria completa',
    consulta: `MATCH p = (ut:UnidadeTematica {nome:"Geometria"})-[:TEM_OBJETO]->(:ObjetoConhecimento)-[:DESENVOLVE]->(:Habilidade)
RETURN p`,
  },
  {
    titulo: 'de onde vem a habilidade',
    consulta: `MATCH p = (:Ano)-[:TEM_UNIDADE]->(:UnidadeTematica)-[:TEM_OBJETO]->(:ObjetoConhecimento)-[:DESENVOLVE]->(:Habilidade {codigo:"EF01MA17"})
RETURN p`,
  },
  { titulo: 'ano direto p habilidade', consulta: CONSULTA_ANO_HABILIDADES },
  {
    titulo: 'caminho entre 2 habilidades',
    consulta: `MATCH p = shortestPath((h1:Habilidade {codigo:"EF01MA01"})-[:DESENVOLVE|TEM_OBJETO|TEM_UNIDADE*..10]-(h2:Habilidade {codigo:"EF01MA21"}))
RETURN p`,
  },
  {
    titulo: 'habiludade irma',
    consulta: `MATCH p = (:Habilidade {codigo:"EF01MA16"})<-[:DESENVOLVE]-(:ObjetoConhecimento)-[:DESENVOLVE]->(:Habilidade)
RETURN p`,
  },
  {
    titulo: 'professor colocar as habilidades que precisa ensinar no ano',
    consulta: `MATCH p = (:Ano)-[:TEM_UNIDADE]->(:UnidadeTematica-[:TEM_OBJETO]->(:ObjetoConhecimento)-[:DESENVOLVE]->(h:Habilidade)
WHERE h.codigo IN ["EF01MA06", "EF01MA07", "EF01MA08", "EF01MA19"]
RETURN p`,
  },
]
