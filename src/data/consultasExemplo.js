// Consultas Cypher de exemplo do site (ESTADO_ATUAL.md §4.5): o menu
// "Exemplos…" do console da página de grafos (N3) e a consulta que o "Ver o grafo
// desta turma" da Home abre (N9); a busca do professor as refaz com campos
// (src/data/filtrosDeBusca.js). São as consultas de teste que a orientadora
// passou — inclusive os títulos e a 7.ª, que tem um erro de sintaxe (falta o `)`
// depois de `:UnidadeTematica`) e serve para testar o card de erro. O arquivo
// original dela (neo4j/consultas) saiu do repositório em 2026-10-15; este módulo
// é a cópia que o site usa.
// D21 (2026-11-03): com o modelo novo do grafo (Ano → Disciplina → unidade →
// objeto → habilidade, com rótulos por matéria), as 6 que funcionavam foram
// reescritas para ele, com a mesma pergunta e os mesmos códigos (os de
// Matemática agora usam UnidadeTematicaMat, HabilidadeMat…; a "árvore completa"
// e o "ano direto" valem para todas as matérias). A 7.ª ficou como veio: o erro
// de sintaxe é o que ela testa.
// D22 (2026-11-11): o Ano chega ao componente pela área — Ano → AreaConhecimento
// → ComponenteCurricular (era Ano → Disciplina).

// "ano direto p habilidade" (até a N19 era também a consulta do "Ver o grafo desta
// turma" da Home, que hoje abre a busca já filtrada)
export const CONSULTA_ANO_HABILIDADES = `MATCH p = (:Ano)-[:DESENVOLVE_HABILIDADE]->()
RETURN p`

// a 7.ª, com o erro de sintaxe original — também é o "Teste de erro" da busca do
// professor (src/data/filtrosDeBusca.js)
export const CONSULTA_COM_ERRO = `MATCH p = (:Ano)-[:TEM_UNIDADE]->(:UnidadeTematica-[:TEM_OBJETO]->(:ObjetoConhecimento)-[:DESENVOLVE]->(h:Habilidade)
WHERE h.codigo IN ["EF01MA06", "EF01MA07", "EF01MA08", "EF01MA19"]
RETURN p`

export const CONSULTAS_EXEMPLO = [
  {
    titulo: 'arvore completa',
    consulta: `MATCH p = (:Ano)-[:TEM_AREA]->(:AreaConhecimento)-[:TEM_COMPONENTE]->(:ComponenteCurricular)-[:TEM_UNIDADE]->()-[:TEM_OBJETO]->()-[:DESENVOLVE]->()
RETURN p`,
  },
  {
    titulo: 'geometria completa',
    consulta: `MATCH p = (ut:UnidadeTematicaMat {nome:"Geometria"})-[:TEM_OBJETO]->(:ObjetoConhecimentoMat)-[:DESENVOLVE]->(:HabilidadeMat)
RETURN p`,
  },
  {
    titulo: 'de onde vem a habilidade',
    consulta: `MATCH p = (:Ano)-[:TEM_AREA]->(:AreaConhecimento)-[:TEM_COMPONENTE]->(:ComponenteCurricular)-[:TEM_UNIDADE]->(:UnidadeTematicaMat)-[:TEM_OBJETO]->(:ObjetoConhecimentoMat)-[:DESENVOLVE]->(:HabilidadeMat {codigo:"EF01MA17"})
RETURN p`,
  },
  { titulo: 'ano direto p habilidade', consulta: CONSULTA_ANO_HABILIDADES },
  {
    titulo: 'caminho entre 2 habilidades',
    consulta: `MATCH p = shortestPath((h1:HabilidadeMat {codigo:"EF01MA01"})-[:DESENVOLVE|TEM_OBJETO|TEM_UNIDADE*..10]-(h2:HabilidadeMat {codigo:"EF01MA21"}))
RETURN p`,
  },
  {
    titulo: 'habiludade irma',
    consulta: `MATCH p = (:HabilidadeMat {codigo:"EF01MA16"})<-[:DESENVOLVE]-(:ObjetoConhecimentoMat)-[:DESENVOLVE]->(:HabilidadeMat)
RETURN p`,
  },
  { titulo: 'professor colocar as habilidades que precisa ensinar no ano', consulta: CONSULTA_COM_ERRO },
]
