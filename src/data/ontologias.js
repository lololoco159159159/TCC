// Ontologias disponibilizadas pelo site (D23, 2026-11-18). Por ora, EXEMPLOS
// ILUSTRATIVOS (`exemplo: true`, `arquivo: null`): as ontologias reais da
// orientadora entram depois, trocando os itens deste arquivo — quando `arquivo`
// tiver o caminho de um arquivo (ex.: '/ontologias/bncc.owl'), o botão "Baixar"
// passa a baixá-lo. Separado da interface, como os depoimentos.
// Cada item: { id, titulo, descricao, componente, anos, formato, classes, versao,
// tamanho, atualizada, exemplo, arquivo }.

export const ONTOLOGIAS = [
  {
    id: 'bncc-estrutura',
    titulo: 'Estrutura da BNCC',
    descricao:
      'O esqueleto do currículo: ano, área de conhecimento, componente curricular, unidade temática, objeto de conhecimento e habilidade, com as relações entre eles.',
    componente: 'Geral',
    anos: 'Todos os anos',
    formato: 'OWL',
    classes: 18,
    versao: '0.3',
    tamanho: '42 KB',
    atualizada: '10/11/2026',
    exemplo: true,
    arquivo: null,
  },
  {
    id: 'matematica-1ano',
    titulo: 'Matemática — 1º ano',
    descricao:
      'As unidades temáticas, os objetos de conhecimento e as 22 habilidades de Matemática do 1º ano, ligados à estrutura da BNCC.',
    componente: 'Matemática',
    anos: '1º ano',
    formato: 'OWL',
    classes: 45,
    versao: '0.2',
    tamanho: '86 KB',
    atualizada: '03/11/2026',
    exemplo: true,
    arquivo: null,
  },
  {
    id: 'ciencias-1-2ano',
    titulo: 'Ciências — 1º e 2º ano',
    descricao:
      'Ciências da Natureza nos dois primeiros anos, com as unidades compartilhadas entre os anos e as habilidades de cada um.',
    componente: 'Ciências',
    anos: '1º e 2º ano',
    formato: 'TTL',
    classes: 26,
    versao: '0.1',
    tamanho: '51 KB',
    atualizada: '12/11/2026',
    exemplo: true,
    arquivo: null,
  },
  {
    id: 'pensamento-computacional',
    titulo: 'Pensamento computacional',
    descricao:
      'Os pilares do pensamento computacional — decomposição, reconhecimento de padrões, abstração e algoritmos — e onde aparecem nas habilidades.',
    componente: 'Geral',
    anos: 'Ensino Fundamental',
    formato: 'OWL',
    classes: 31,
    versao: '0.1',
    tamanho: '64 KB',
    atualizada: '28/10/2026',
    exemplo: true,
    arquivo: null,
  },
  {
    id: 'praticas-pedagogicas',
    titulo: 'Práticas pedagógicas',
    descricao:
      'Um vocabulário para descrever atividades de sala (plugadas, desplugadas, projetos) e ligá-las às habilidades que desenvolvem.',
    componente: 'Geral',
    anos: 'Ensino Fundamental',
    formato: 'TTL',
    classes: 22,
    versao: '0.1',
    tamanho: '37 KB',
    atualizada: '21/10/2026',
    exemplo: true,
    arquivo: null,
  },
]
