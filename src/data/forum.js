// Conteúdo ILUSTRATIVO do Fórum (D23, 2026-11-18): a tela é só de front-end —
// não há back-end nem contas (D2) —, então as conversas ficam aqui, separadas
// da interface, como os depoimentos (src/data/depoimentos.js). Não é dado do
// grafo (D17). Autores fictícios e genéricos; nenhuma pessoa real. Quando o
// fórum tiver servidor, este arquivo dá lugar às consultas dele.
// Revisão de 2026-11-18 (pedido do autor): sem categorias — só as conversas em
// andamento, da mais recente para a mais antiga (a ordem deste arquivo).

// autores: { nome, funcao, etapa }
const ANA = { nome: 'Ana P.', funcao: 'Professora de Ciências', etapa: 'Anos iniciais' }
const CARLOS = { nome: 'Carlos M.', funcao: 'Coordenador pedagógico', etapa: 'Ensino Fundamental' }
const JULIA = { nome: 'Júlia R.', funcao: 'Professora de Matemática', etapa: '1º ao 5º ano' }
const MARCOS = { nome: 'Marcos T.', funcao: 'Professor de Tecnologia', etapa: 'Anos finais' }
const BEATRIZ = { nome: 'Beatriz S.', funcao: 'Professora polivalente', etapa: '2º ano' }
const EQUIPE = { nome: 'Equipe EduGraph', funcao: 'Moderação', etapa: 'LabOtim · UFES' }

// cada conversa: { id, titulo, habilidades (códigos da BNCC discutidos — podem
// faltar), mensagens: [{ autor, quando, texto }] } — a 1.ª mensagem abre a conversa
export const TOPICOS = [
  {
    id: 'ciencias-matematica',
    titulo: 'Como conectar Ciências e Matemática no 1º ano?',
    habilidades: ['EF01CI05', 'EF01MA16'],
    mensagens: [
      {
        autor: ANA,
        quando: 'há 5 h',
        texto:
          'Estou planejando o bimestre e queria juntar "Escalas de tempo" (EF01CI05) com "Medidas de tempo" (EF01MA16–18). Alguém já fez algo parecido?',
      },
      {
        autor: JULIA,
        quando: 'há 4 h',
        texto:
          'Fiz um calendário da turma: cada dia os alunos marcam o período (manhã, tarde, noite) e, no fim da semana, contamos os dias. Funcionou muito bem para as duas habilidades.',
      },
      {
        autor: CARLOS,
        quando: 'há 2 h',
        texto:
          'Boa! No grafo, a busca "Caminho até uma habilidade" mostra de qual unidade cada uma vem — ajuda a justificar o plano para a coordenação.',
      },
    ],
  },
  {
    id: 'plantas-2ano',
    titulo: 'Sugestões para trabalhar as plantas no 2º ano',
    habilidades: ['EF02CI04', 'EF02CI05', 'EF02CI06'],
    mensagens: [
      {
        autor: BEATRIZ,
        quando: 'há 8 h',
        texto:
          'Vou começar "Seres vivos no ambiente; Plantas". Pensei em montar uma horta pequena na sala. Que cuidados vocês tomam?',
      },
      {
        autor: ANA,
        quando: 'há 6 h',
        texto: 'Feijão no algodão é o clássico: dá para comparar com e sem luz, e já entra a EF02CI05.',
      },
    ],
  },
  {
    id: 'exportar-grafo',
    titulo: 'É possível salvar o grafo como imagem?',
    habilidades: [],
    mensagens: [
      {
        autor: JULIA,
        quando: 'há 6 h',
        texto: 'Queria colocar o grafo de uma unidade no meu plano de aula. Existe como salvar em imagem?',
      },
    ],
  },
  {
    id: 'desplugada-sequencias',
    titulo: 'Atividade desplugada de sequências para o 1º ano',
    habilidades: ['EF01MA10'],
    mensagens: [
      {
        autor: MARCOS,
        quando: 'há 1 dia',
        texto:
          'Compartilho uma atividade com cartões coloridos: os alunos completam sequências e depois criam as próprias regras para um colega descobrir.',
      },
      {
        autor: BEATRIZ,
        quando: 'há 20 h',
        texto: 'Usei com o 2º ano trocando os cartões por sons — palmas e batidas na mesa. Eles adoraram.',
      },
    ],
  },
  {
    id: 'busca-professor',
    titulo: 'Usando a busca do professor para montar o plano de aula',
    habilidades: [],
    mensagens: [
      {
        autor: CARLOS,
        quando: 'há 2 dias',
        texto:
          'Um passo a passo: escolha o ano, a área e o componente; depois "O ano inteiro nesta matéria" para ter a visão geral e "Habilidades irmãs" para achar o que pode ir junto na mesma aula.',
      },
      {
        autor: JULIA,
        quando: 'há 1 dia',
        texto: 'Clicar num nó também ajuda: o painel mostra as conexões dele, e dá para entender como o grafo está organizado.',
      },
      {
        autor: MARCOS,
        quando: 'há 1 dia',
        texto: 'E com dois cliques num nó ele traz os vizinhos para o desenho — ótimo para explorar com os alunos maiores.',
      },
    ],
  },
  {
    id: 'cores-grafo',
    titulo: 'O que significa cada cor no grafo?',
    habilidades: [],
    mensagens: [
      {
        autor: BEATRIZ,
        quando: 'há 1 dia',
        texto: 'Vi nós de cores e formas diferentes. Existe uma legenda?',
      },
      {
        autor: EQUIPE,
        quando: 'há 1 dia',
        texto:
          'Sim: cada cor é um nível — ano, área, componente, unidade, objeto e habilidade —, e a legenda fica no canto do grafo. Para daltonismo, há paletas próprias e o modo "formas em vez de cores" no botão de cores.',
      },
    ],
  },
  {
    id: 'robotica-baixo-custo',
    titulo: 'Robótica de baixo custo vale a pena nos anos iniciais?',
    habilidades: [],
    mensagens: [
      {
        autor: MARCOS,
        quando: 'há 3 dias',
        texto: 'Tenho um kit com sucata e alguns motores. A dúvida é se vale começar pela robótica ou pelas atividades desplugadas.',
      },
      {
        autor: CARLOS,
        quando: 'há 2 dias',
        texto: 'Na nossa escola, começamos desplugado, e a robótica entrou como projeto no fim do ano. Deu certo.',
      },
      {
        autor: ANA,
        quando: 'há 2 dias',
        texto: 'Concordo — e a robótica fica mais rica quando os alunos já pensam em sequências e padrões.',
      },
    ],
  },
]
