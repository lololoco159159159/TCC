// Arquiteturas pedagógicas: os quatro eixos da página e as opções das caixas.
// As opções são EXEMPLOS ILUSTRATIVOS, para trocar quando as listas reais
// estiverem definidas. Cada eixo tem sete caixas de seleção (`campos`), quatro
// campos curtos de escrever (`escritos`) e o espaço de escrita livre (`texto`).
// Trocar uma opção não quebra o que o professor já salvou no navegador: na
// leitura, um valor que não está mais na lista é descartado.

const DICA = 'Escreva aqui'

export const EIXOS = [
  {
    id: 'metodologico',
    nome: 'Metodológico',
    frase: 'Como a aula é conduzida: a estratégia, os papéis do professor e dos alunos e a avaliação.',
    campos: [
      {
        id: 'estrategia',
        rotulo: 'Estratégia',
        opcoes: [
          'Aula expositiva dialogada',
          'Resolução de problemas',
          'Aprendizagem baseada em projetos',
          'Sala de aula invertida',
          'Atividade desplugada',
        ],
      },
      { id: 'papel', rotulo: 'Papel do professor', opcoes: ['Mediador', 'Expositor', 'Orientador'] },
      { id: 'papel-aluno', rotulo: 'Papel do aluno', opcoes: ['Protagonista', 'Colaborador', 'Investigador'] },
      { id: 'atividade', rotulo: 'Tipo de atividade', opcoes: ['Exploração', 'Prática guiada', 'Desafio', 'Produção'] },
      { id: 'avaliacao', rotulo: 'Avaliação', opcoes: ['Diagnóstica', 'Formativa', 'Somativa'] },
      {
        id: 'instrumento',
        rotulo: 'Instrumento de avaliação',
        opcoes: ['Observação', 'Portfólio', 'Rubrica', 'Prova escrita', 'Autoavaliação'],
      },
      { id: 'retorno', rotulo: 'Retorno aos alunos', opcoes: ['Na hora', 'No fim da aula', 'No fim da sequência'] },
    ],
    escritos: [
      { id: 'outra-estrategia', rotulo: 'Outra estratégia', dica: DICA },
      { id: 'objetivo', rotulo: 'Objetivo de aprendizagem', dica: DICA },
      { id: 'criterio', rotulo: 'Critério de avaliação', dica: DICA },
      { id: 'adaptacao', rotulo: 'Adaptação ou inclusão', dica: DICA },
    ],
    texto: 'Anotações sobre o eixo metodológico',
  },
  {
    id: 'organizacional',
    nome: 'Organizacional',
    frase: 'Como a turma, o tempo e o espaço se organizam.',
    campos: [
      { id: 'agrupamento', rotulo: 'Agrupamento', opcoes: ['Individual', 'Duplas', 'Pequenos grupos', 'Turma inteira'] },
      { id: 'tamanho', rotulo: 'Tamanho da turma', opcoes: ['Até 15 alunos', '16 a 30 alunos', 'Mais de 30 alunos'] },
      { id: 'duracao', rotulo: 'Duração', opcoes: ['Uma aula', 'Duas aulas', 'Sequência de aulas'] },
      { id: 'frequencia', rotulo: 'Frequência', opcoes: ['Semanal', 'Quinzenal', 'Mensal'] },
      { id: 'turno', rotulo: 'Turno', opcoes: ['Manhã', 'Tarde', 'Integral'] },
      { id: 'espaco', rotulo: 'Espaço', opcoes: ['Sala de aula', 'Laboratório de informática', 'Área externa'] },
      { id: 'rotacao', rotulo: 'Rotação', opcoes: ['Sem rotação', 'Rotação por estações', 'Rotação individual'] },
    ],
    escritos: [
      { id: 'outro-espaco', rotulo: 'Outro espaço ou tempo', dica: DICA },
      { id: 'materiais', rotulo: 'Materiais a preparar', dica: DICA },
      { id: 'apoio', rotulo: 'Apoio de outros profissionais', dica: DICA },
      { id: 'combinados', rotulo: 'Combinados com a turma', dica: DICA },
    ],
    texto: 'Anotações sobre o eixo organizacional',
  },
  {
    id: 'conteudo',
    nome: 'Conteúdo',
    frase: 'O que a aula ensina: o ano, o componente curricular, a unidade temática e a Computação.',
    campos: [
      {
        id: 'ano',
        rotulo: 'Ano',
        opcoes: ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano'],
      },
      {
        id: 'componente',
        rotulo: 'Componente',
        opcoes: [
          'Língua Portuguesa',
          'Arte',
          'Educação Física',
          'Língua Inglesa',
          'Matemática',
          'Ciências',
          'Geografia',
          'História',
          'Ensino Religioso',
        ],
      },
      {
        id: 'unidade',
        rotulo: 'Unidade temática',
        opcoes: [
          'Números',
          'Álgebra',
          'Geometria',
          'Grandezas e medidas',
          'Probabilidade e estatística',
          'Matéria e energia',
          'Vida e evolução',
          'Terra e Universo',
        ],
      },
      {
        id: 'computacao',
        rotulo: 'Eixo da Computação',
        opcoes: ['Pensamento Computacional', 'Mundo Digital', 'Cultura Digital'],
      },
      {
        id: 'conceito',
        rotulo: 'Conceito da Computação',
        opcoes: ['Abstração', 'Decomposição', 'Reconhecimento de padrões', 'Algoritmos'],
      },
      { id: 'nivel', rotulo: 'Momento do conteúdo', opcoes: ['Introdução', 'Aprofundamento', 'Revisão'] },
      {
        id: 'integracao',
        rotulo: 'Integração',
        opcoes: ['Só o componente', 'Com outro componente', 'Projeto interdisciplinar'],
      },
    ],
    escritos: [
      { id: 'habilidade', rotulo: 'Habilidade ou tema', dica: 'Ex.: EF01CI05' },
      { id: 'objeto', rotulo: 'Objeto de conhecimento', dica: DICA },
      { id: 'previos', rotulo: 'Conhecimentos prévios', dica: DICA },
      { id: 'palavras', rotulo: 'Palavras-chave', dica: DICA },
    ],
    texto: 'Anotações sobre o eixo de conteúdo',
  },
  {
    id: 'tecnologico',
    nome: 'Tecnológico',
    frase: 'Com que recursos a aula acontece: os equipamentos, a internet, as ferramentas e os materiais.',
    campos: [
      {
        id: 'recurso',
        rotulo: 'Recurso',
        opcoes: ['Sem computador (desplugada)', 'Computadores', 'Tablets', 'Kits de robótica'],
      },
      {
        id: 'quantidade',
        rotulo: 'Equipamentos',
        opcoes: ['Um por aluno', 'Um por dupla', 'Um por grupo', 'Só o do professor'],
      },
      { id: 'internet', rotulo: 'Internet', opcoes: ['Com internet', 'Sem internet'] },
      {
        id: 'ferramenta',
        rotulo: 'Ferramenta',
        opcoes: ['Programação em blocos', 'Planilha', 'Editor de texto', 'Simulador'],
      },
      { id: 'projecao', rotulo: 'Projeção', opcoes: ['Projetor', 'TV', 'Sem projeção'] },
      { id: 'impresso', rotulo: 'Material impresso', opcoes: ['Fichas', 'Cartões', 'Tabuleiro', 'Nenhum'] },
      {
        id: 'producao',
        rotulo: 'Produção dos alunos',
        opcoes: ['Texto', 'Apresentação', 'Programa', 'Vídeo', 'Protótipo'],
      },
    ],
    escritos: [
      { id: 'outro-recurso', rotulo: 'Outro recurso', dica: DICA },
      { id: 'programa', rotulo: 'Programa ou site', dica: DICA },
      { id: 'plano-b', rotulo: 'Plano B sem tecnologia', dica: DICA },
      { id: 'cuidados', rotulo: 'Cuidados com os equipamentos', dica: DICA },
    ],
    texto: 'Anotações sobre o eixo tecnológico',
  },
]
