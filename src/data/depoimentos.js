// Depoimentos de professores (dados mockados).
// Conteúdo verbatim do protótipo final. Mantidos aqui, separados da interface,
// para facilitar a troca futura por uma consulta SPARQL ao grafo de conhecimento.
// Cada item: { nome, funcao, etapa, texto }.

const depoimentos = [
  {
    nome: 'Ana P.',
    funcao: 'Professora de Ciências',
    etapa: '6.º ao 9.º ano',
    texto:
      '"Pela primeira vez consegui mostrar para a coordenação como Ciências e Matemática se conectam na BNCC. Isso mudou o planejamento da escola."',
  },
  {
    nome: 'Carlos M.',
    funcao: 'Coordenador pedagógico',
    etapa: 'Ensino Médio',
    texto:
      '"Uso o grafo para preparar interdisciplinaridade real, não só no papel. Os alunos percebem a diferença."',
  },
  {
    nome: 'Mariana S.',
    funcao: 'Professora de Matemática',
    etapa: '8.º ano',
    texto:
      '"Ver Matemática como base para Algoritmo deixou óbvio onde reforçar antes de entrar em programação. Economizo semanas de planejamento."',
  },
  {
    nome: 'João R.',
    funcao: 'Diretor escolar',
    etapa: 'Rede municipal',
    texto:
      '"A escola inteira passou a falar a mesma língua sobre competências. O mapa virou referência nas nossas reuniões."',
  },
  {
    nome: 'Beatriz L.',
    funcao: 'Professora de Língua Portuguesa',
    etapa: '7.º ano',
    texto:
      '"Descobri que Português sustenta a leitura de dados e a comunicação computacional. Meus projetos ficaram muito mais conectados."',
  },
]

export default depoimentos
