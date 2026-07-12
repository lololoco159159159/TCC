// ============================================================================
// mock-fuseki.js — Endpoint SPARQL simulado (Apache Jena Fuseki)
// ----------------------------------------------------------------------------
// Este módulo imita o contrato do Fuseki: recebe uma consulta SPARQL e devolve
// resultados no formato application/sparql-results+json (head.vars +
// results.bindings). Na implementação real, basta substituir o corpo de
// `consultarFuseki` por um fetch:
//
//   fetch(FUSEKI_URL, { method:'POST',
//     headers:{ 'Content-Type':'application/sparql-query',
//               'Accept':'application/sparql-results+json' },
//     body: consulta })
//
// Os dados abaixo são PLAUSÍVEIS (não oficiais) — substituir pelo grafo real.
//
// Proveniência: extraído do bundle design/prototipo_grafo.html
// (asset `mock-fuseki.js` do manifest — receita de extração no ESTADO_ATUAL.md §5).
// Etapa G2 do roadmap da página de grafos (ESTADO_ATUAL.md §4.1).
//
// Ajustes locais sobre o original do protótipo:
//  - Recorte apenas 5.º–9.º ano: o Ensino Médio foi removido (ANOS e as 8
//    habilidades EM13CO*) — o site cobre o ensino fundamental.
//  - estatisticas(): agregados para a banda de estatísticas da Home.
// ============================================================================

export const PREFIXOS = `PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX edu:  <https://edugraph.ufes.br/ontologia#>`;

export const EIXOS = {
  pc: { id: 'pc', label: 'Pensamento Computacional', uri: 'edu:PensamentoComputacional' },
  md: { id: 'md', label: 'Mundo Digital',            uri: 'edu:MundoDigital' },
  cd: { id: 'cd', label: 'Cultura Digital',          uri: 'edu:CulturaDigital' },
};

export const ANOS = [
  { id: '5',  label: '5.º ano' },
  { id: '6',  label: '6.º ano' },
  { id: '7',  label: '7.º ano' },
  { id: '8',  label: '8.º ano' },
  { id: '9',  label: '9.º ano' },
];

export const RELACOES = {
  desenvolve:           { uri: 'edu:desenvolve',           saida: 'desenvolve',              entrada: 'desenvolvido nas habilidades' },
  podeSerTrabalhadaEm:  { uri: 'edu:podeSerTrabalhadaEm',  saida: 'pode ser trabalhada em',  entrada: 'trabalha as habilidades' },
  progrideDe:           { uri: 'edu:progrideDe',           saida: 'progride de',             entrada: 'prepara para' },
};

// ── Disciplinas (componentes curriculares) ──────────────────────────────────
const DISCIPLINAS = [
  { id: 'matematica', label: 'Matemática',        area: 'Matemática' },
  { id: 'portugues',  label: 'Língua Portuguesa', area: 'Linguagens' },
  { id: 'artes',      label: 'Arte',              area: 'Linguagens' },
  { id: 'edfisica',   label: 'Educação Física',   area: 'Linguagens' },
  { id: 'ingles',     label: 'Língua Inglesa',    area: 'Linguagens' },
  { id: 'ciencias',   label: 'Ciências',          area: 'Ciências da Natureza' },
  { id: 'historia',   label: 'História',          area: 'Ciências Humanas' },
  { id: 'geografia',  label: 'Geografia',         area: 'Ciências Humanas' },
];

// ── Conceitos (BNCC-Computação, agrupados por eixo) ─────────────────────────
const CONCEITOS = [
  { id: 'decomposicao', label: 'Decomposição',               eixo: 'pc', def: 'Dividir um problema complexo em partes menores, mais fáceis de compreender e resolver.' },
  { id: 'padroes',      label: 'Reconhecimento de Padrões',  eixo: 'pc', def: 'Identificar semelhanças e regularidades que permitem generalizar soluções.' },
  { id: 'abstracao',    label: 'Abstração',                  eixo: 'pc', def: 'Destacar as informações essenciais de um problema, ignorando detalhes irrelevantes.' },
  { id: 'algoritmos',   label: 'Algoritmos',                 eixo: 'pc', def: 'Descrever soluções como sequências finitas e ordenadas de passos executáveis.' },
  { id: 'dados',        label: 'Representação de Dados',     eixo: 'md', def: 'Formas de codificar, organizar e armazenar informações em sistemas computacionais.' },
  { id: 'hardware',     label: 'Hardware e Software',        eixo: 'md', def: 'Componentes físicos e lógicos que constituem os sistemas computacionais.' },
  { id: 'redes',        label: 'Redes e Internet',           eixo: 'md', def: 'Estruturas e protocolos que permitem a comunicação entre dispositivos.' },
  { id: 'seguranca',    label: 'Segurança da Informação',    eixo: 'md', def: 'Princípios e práticas de proteção de dados, sistemas e pessoas no meio digital.' },
  { id: 'letramento',   label: 'Letramento Digital',         eixo: 'cd', def: 'Capacidade de usar, compreender e produzir tecnologias e mídias digitais.' },
  { id: 'cidadania',    label: 'Cidadania Digital',          eixo: 'cd', def: 'Participação ética, crítica e segura na sociedade mediada por tecnologias.' },
  { id: 'tecsoc',       label: 'Tecnologia e Sociedade',     eixo: 'cd', def: 'Relações entre desenvolvimento tecnológico e transformações sociais e culturais.' },
];

// ── Habilidades (códigos e textos PLAUSÍVEIS — substituir pelos oficiais) ───
// c=código, ano, eixo, resumo (rótulo curto p/ listas), conceitos, disc, prog
const HABILIDADES = [
  // 5.º ano
  { c: 'EF05CO01', ano: '5', eixo: 'pc', resumo: 'Algoritmos do cotidiano',      conceitos: ['algoritmos', 'decomposicao'], disc: ['matematica', 'edfisica'], texto: 'Construir e simular algoritmos em linguagem natural ou pictográfica para resolver problemas do cotidiano, decompondo-os em etapas menores e ordenadas.' },
  { c: 'EF05CO02', ano: '5', eixo: 'pc', resumo: 'Padrões e sequências',         conceitos: ['padroes'],                    disc: ['matematica', 'artes'],    texto: 'Identificar padrões e regularidades em sequências numéricas, textos e imagens, descrevendo-os como regras que podem ser generalizadas para novos casos.' },
  { c: 'EF05CO03', ano: '5', eixo: 'md', resumo: 'Representar informações',      conceitos: ['dados'],                      disc: ['matematica', 'portugues'], texto: 'Compreender que informações podem ser representadas por números, textos, imagens e sons, organizando dados simples em listas e tabelas.' },
  { c: 'EF05CO04', ano: '5', eixo: 'md', resumo: 'Partes do computador',         conceitos: ['hardware'],                   disc: ['ciencias'],               texto: 'Reconhecer os componentes básicos de um computador e suas funções, diferenciando dispositivos de entrada, processamento, armazenamento e saída.' },
  { c: 'EF05CO05', ano: '5', eixo: 'cd', resumo: 'Segurança e respeito online',  conceitos: ['cidadania'],                  disc: ['portugues', 'historia'],  texto: 'Discutir o uso seguro e respeitoso de ambientes digitais, reconhecendo situações de risco e a importância de proteger informações pessoais.' },
  { c: 'EF05CO06', ano: '5', eixo: 'cd', resumo: 'Criar e compartilhar',         conceitos: ['letramento'],                 disc: ['portugues', 'artes'],     texto: 'Utilizar tecnologias digitais para criar e compartilhar conteúdos simples, reconhecendo autoria e citando fontes de forma adequada.' },
  // 6.º ano
  { c: 'EF06CO01', ano: '6', eixo: 'pc', resumo: 'Representações essenciais',    conceitos: ['abstracao'],                  disc: ['matematica', 'ciencias'], texto: 'Elaborar representações simplificadas de objetos e fenômenos, destacando as características essenciais para a resolução de um problema e descartando detalhes irrelevantes.' },
  { c: 'EF06CO02', ano: '6', eixo: 'pc', resumo: 'Repetições e decisões',        conceitos: ['algoritmos'],                 disc: ['matematica'],             prog: 'EF05CO01', texto: 'Criar algoritmos com sequências, repetições e decisões simples, representando-os em fluxogramas ou programação em blocos para automatizar tarefas.' },
  { c: 'EF06CO03', ano: '6', eixo: 'pc', resumo: 'Dividir problemas',            conceitos: ['decomposicao'],               disc: ['matematica', 'geografia'], texto: 'Decompor problemas do cotidiano escolar em subproblemas independentes, propondo soluções parciais que possam ser combinadas em uma solução completa.' },
  { c: 'EF06CO04', ano: '6', eixo: 'md', resumo: 'Coletar e organizar dados',    conceitos: ['dados'],                      disc: ['matematica', 'geografia', 'ciencias'], prog: 'EF05CO03', texto: 'Coletar, organizar e classificar dados em tabelas e gráficos simples, utilizando ferramentas digitais para registrar observações de diferentes áreas.' },
  { c: 'EF06CO05', ano: '6', eixo: 'md', resumo: 'Como a internet circula',      conceitos: ['redes'],                      disc: ['geografia'],              texto: 'Compreender, em nível introdutório, como as informações circulam na internet, identificando os papéis de dispositivos, conexões e provedores.' },
  { c: 'EF06CO06', ano: '6', eixo: 'md', resumo: 'Dispositivos do cotidiano',    conceitos: ['hardware'],                   disc: ['ciencias'],               prog: 'EF05CO04', texto: 'Comparar diferentes dispositivos computacionais presentes no cotidiano, relacionando suas características às tarefas que executam.' },
  { c: 'EF06CO07', ano: '6', eixo: 'cd', resumo: 'Convivência digital',          conceitos: ['cidadania'],                  disc: ['portugues', 'historia'],  prog: 'EF05CO05', texto: 'Analisar normas de convivência em ambientes digitais, discutindo cyberbullying, exposição de dados e formas de buscar ajuda.' },
  { c: 'EF06CO08', ano: '6', eixo: 'cd', resumo: 'Tecnologia e práticas sociais', conceitos: ['tecsoc'],                    disc: ['historia', 'geografia'],  texto: 'Investigar como as tecnologias digitais transformaram práticas sociais e culturais, comparando modos de vida antes e depois de sua adoção.' },
  // 7.º ano
  { c: 'EF07CO01', ano: '7', eixo: 'pc', resumo: 'Repetições e condicionais',    conceitos: ['algoritmos'],                 disc: ['matematica', 'edfisica'], prog: 'EF06CO02', texto: 'Construir algoritmos que envolvam estruturas de repetição e seleção condicional, representando-os em fluxogramas ou programação em blocos para resolver problemas de diferentes áreas.' },
  { c: 'EF07CO02', ano: '7', eixo: 'pc', resumo: 'Planejar por decomposição',    conceitos: ['decomposicao'],               disc: ['portugues', 'artes'],     prog: 'EF06CO03', texto: 'Aplicar a decomposição para planejar projetos coletivos, dividindo tarefas complexas em etapas atribuíveis e verificáveis.' },
  { c: 'EF07CO03', ano: '7', eixo: 'pc', resumo: 'Regras a partir de padrões',   conceitos: ['padroes'],                    disc: ['matematica', 'ciencias'], prog: 'EF05CO02', texto: 'Reconhecer padrões em conjuntos de dados e fenômenos naturais, formulando regras gerais e testando sua validade em novos exemplos.' },
  { c: 'EF07CO04', ano: '7', eixo: 'pc', resumo: 'Modelos e simulações',         conceitos: ['abstracao'],                  disc: ['ciencias', 'geografia'],  prog: 'EF06CO01', texto: 'Construir modelos que representem fenômenos ou processos, identificando variáveis relevantes e simulando comportamentos em ferramentas digitais.' },
  { c: 'EF07CO05', ano: '7', eixo: 'md', resumo: 'Qualidade dos dados',          conceitos: ['dados'],                      disc: ['matematica', 'geografia'], prog: 'EF06CO04', texto: 'Realizar coleta e organização sistemática de dados, avaliando sua qualidade e adequação para responder a uma pergunta de investigação.' },
  { c: 'EF07CO06', ano: '7', eixo: 'md', resumo: 'Percurso da informação',       conceitos: ['redes'],                      disc: ['geografia'],              prog: 'EF06CO05', texto: 'Descrever o percurso de uma informação na internet, compreendendo conceitos de endereçamento, roteamento e armazenamento em servidores.' },
  { c: 'EF07CO07', ano: '7', eixo: 'md', resumo: 'Proteção de dados',            conceitos: ['seguranca'],                  disc: ['ciencias', 'portugues'],  texto: 'Adotar práticas de proteção de dados e dispositivos, compreendendo senhas seguras, autenticação e riscos de compartilhamento indevido.' },
  { c: 'EF07CO08', ano: '7', eixo: 'cd', resumo: 'Produção de mídias',           conceitos: ['letramento'],                 disc: ['portugues', 'artes', 'ingles'], prog: 'EF05CO06', texto: 'Produzir conteúdos digitais em diferentes formatos e mídias, avaliando a confiabilidade das fontes utilizadas e respeitando direitos autorais.' },
  { c: 'EF07CO09', ano: '7', eixo: 'cd', resumo: 'Trabalho e consumo digitais',  conceitos: ['tecsoc'],                     disc: ['historia', 'geografia'],  prog: 'EF06CO08', texto: 'Debater os impactos das tecnologias digitais nas relações de trabalho e consumo, considerando diferentes contextos sociais e regionais.' },
  // 8.º ano
  { c: 'EF08CO01', ano: '8', eixo: 'pc', resumo: 'Modularização',                conceitos: ['algoritmos', 'decomposicao'], disc: ['matematica'],             prog: 'EF07CO01', texto: 'Elaborar algoritmos com modularização, reutilizando procedimentos para resolver problemas semelhantes e comparando diferentes soluções quanto à clareza e eficiência.' },
  { c: 'EF08CO02', ano: '8', eixo: 'pc', resumo: 'Generalizar soluções',         conceitos: ['abstracao', 'padroes'],       disc: ['matematica', 'ciencias'], prog: 'EF07CO04', texto: 'Utilizar abstrações para generalizar soluções, identificando quando um mesmo modelo computacional pode ser aplicado a problemas distintos.' },
  { c: 'EF08CO03', ano: '8', eixo: 'md', resumo: 'Estruturas e visualização',    conceitos: ['dados'],                      disc: ['matematica', 'geografia', 'portugues'], prog: 'EF07CO05', texto: 'Organizar dados em estruturas adequadas e produzir visualizações que apoiem a interpretação e a comunicação de resultados de investigações.' },
  { c: 'EF08CO04', ano: '8', eixo: 'md', resumo: 'Protocolos e padrões abertos', conceitos: ['redes'],                      disc: ['geografia', 'ciencias'],  prog: 'EF07CO06', texto: 'Analisar protocolos e serviços da internet, compreendendo como padrões abertos permitem a comunicação entre sistemas heterogêneos.' },
  { c: 'EF08CO05', ano: '8', eixo: 'md', resumo: 'Criptografia básica',          conceitos: ['seguranca'],                  disc: ['matematica', 'historia'], prog: 'EF07CO07', texto: 'Compreender princípios básicos de criptografia e sua importância para a privacidade e a integridade das comunicações digitais.' },
  { c: 'EF08CO06', ano: '8', eixo: 'cd', resumo: 'Privacidade e termos de uso',  conceitos: ['cidadania'],                  disc: ['portugues', 'historia'],  prog: 'EF06CO07', texto: 'Avaliar políticas de privacidade e termos de uso de serviços digitais, posicionando-se criticamente sobre a coleta e o uso de dados pessoais.' },
  { c: 'EF08CO07', ano: '8', eixo: 'cd', resumo: 'Automação e trabalho',         conceitos: ['tecsoc'],                     disc: ['historia'],               prog: 'EF07CO09', texto: 'Investigar os efeitos da automação sobre o mundo do trabalho, discutindo transformações em profissões e novas demandas de formação.' },
  // 9.º ano
  { c: 'EF09CO01', ano: '9', eixo: 'pc', resumo: 'Custo e eficiência',           conceitos: ['algoritmos'],                 disc: ['matematica'],             prog: 'EF08CO01', texto: 'Comparar algoritmos que resolvem o mesmo problema, analisando noções de custo e eficiência e justificando a escolha da solução mais adequada.' },
  { c: 'EF09CO02', ano: '9', eixo: 'pc', resumo: 'Máquinas que aprendem',        conceitos: ['padroes', 'dados'],           disc: ['matematica', 'ciencias'], prog: 'EF07CO03', texto: 'Compreender, em nível introdutório, como sistemas computacionais aprendem padrões a partir de dados, discutindo aplicações e limitações.' },
  { c: 'EF09CO03', ano: '9', eixo: 'md', resumo: 'Vieses nos dados',             conceitos: ['dados'],                      disc: ['matematica', 'historia'], prog: 'EF08CO03', texto: 'Analisar criticamente conjuntos de dados, identificando vieses de coleta e de representação e seus efeitos sobre decisões automatizadas.' },
  { c: 'EF09CO04', ano: '9', eixo: 'md', resumo: 'Sistemas embarcados',          conceitos: ['hardware', 'algoritmos'],     disc: ['ciencias'],               prog: 'EF06CO06', texto: 'Compreender o funcionamento de sistemas embarcados e dispositivos conectados, relacionando sensores, atuadores e programação.' },
  { c: 'EF09CO05', ano: '9', eixo: 'md', resumo: 'Riscos e prevenção',           conceitos: ['seguranca'],                  disc: ['ciencias'],               prog: 'EF08CO05', texto: 'Avaliar riscos de segurança em aplicações e redes, propondo práticas de prevenção em contextos pessoais e coletivos.' },
  { c: 'EF09CO06', ano: '9', eixo: 'cd', resumo: 'Desinformação',                conceitos: ['cidadania', 'letramento'],    disc: ['portugues', 'historia'],  prog: 'EF08CO06', texto: 'Analisar a circulação de desinformação em plataformas digitais, compreendendo mecanismos de recomendação e estratégias de verificação.' },
  { c: 'EF09CO07', ano: '9', eixo: 'cd', resumo: 'Dilemas éticos',               conceitos: ['tecsoc'],                     disc: ['historia', 'geografia'],  prog: 'EF08CO07', texto: 'Debater dilemas éticos do uso de tecnologias emergentes, considerando impactos sociais, ambientais e econômicos em diferentes escalas.' },
];

// ── Grafo em memória (nós + arestas dirigidas e rotuladas) ──────────────────
export const NOS = new Map();
DISCIPLINAS.forEach(d => NOS.set(d.id, { id: d.id, tipo: 'disciplina', label: d.label, area: d.area, uri: 'edu:' + d.id.charAt(0).toUpperCase() + d.id.slice(1) }));
CONCEITOS.forEach(c => NOS.set(c.id, { id: c.id, tipo: 'conceito', label: c.label, eixo: c.eixo, def: c.def, uri: 'edu:' + c.id.charAt(0).toUpperCase() + c.id.slice(1) }));
HABILIDADES.forEach(h => NOS.set(h.c, { id: h.c, tipo: 'habilidade', label: h.c, codigo: h.c, resumo: h.resumo, ano: h.ano, eixo: h.eixo, texto: h.texto, uri: 'edu:' + h.c }));

export const ARESTAS = [];
HABILIDADES.forEach(h => {
  h.conceitos.forEach(cid => ARESTAS.push({ a: h.c, rel: 'desenvolve', b: cid }));
  h.disc.forEach(did => ARESTAS.push({ a: h.c, rel: 'podeSerTrabalhadaEm', b: did }));
  if (h.prog) ARESTAS.push({ a: h.c, rel: 'progrideDe', b: h.prog });
});

export const LISTA_DISCIPLINAS = DISCIPLINAS;
export const LISTA_CONCEITOS = CONCEITOS;
export const LISTA_HABILIDADES = HABILIDADES;

// ── Estatísticas agregadas (banda de estatísticas da Home) ──────────────────
// Futuro: substituir por uma consulta SPARQL de agregação (COUNT / GROUP BY)
// ao Fuseki, pelo mesmo caminho de consultarFuseki().
export function estatisticas() {
  const anosNum = ANOS.map(a => Number(a.id)).filter(n => !Number.isNaN(n));
  return {
    habilidades: HABILIDADES.length,
    componentes: DISCIPLINAS.length,
    anoInicial: Math.min(...anosNum),
    anoFinal: Math.max(...anosNum),
  };
}

// Habilidades por série (grade "Encontre as habilidades da sua turma." na Home).
// `id` alimenta o deep-link "Ver o grafo desta turma" (?serie=<id>, G11).
// Futuro: consulta SPARQL de agregação (COUNT ... GROUP BY ?etapa) ao Fuseki.
export function habilidadesPorAno() {
  return ANOS.map(a => ({
    id: a.id,
    ano: a.label,
    habilidades: HABILIDADES.filter(h => h.ano === a.id).length,
  }));
}

// ── Índice de busca (nome, código, texto normativo, conceito) ───────────────
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export const INDICE = [...NOS.values()].map(n => ({
  id: n.id, tipo: n.tipo, label: n.label, codigo: n.codigo || '', resumo: n.resumo || '',
  ano: n.ano || '', eixo: n.eixo || '', area: n.area || '',
  chave: norm([n.label, n.codigo, n.resumo, n.texto, n.def, n.area].filter(Boolean).join(' ')),
}));

export function buscar(termo, max = 9) {
  const t = norm(termo.trim());
  if (t.length < 2) return [];
  const pontua = e => {
    if (e.codigo && norm(e.codigo).startsWith(t)) return 0;
    if (norm(e.label).startsWith(t)) return 1;
    if (norm(e.label).includes(t) || (e.resumo && norm(e.resumo).includes(t))) return 2;
    if (e.chave.includes(t)) return 3;
    return -1;
  };
  return INDICE.map(e => ({ e, p: pontua(e) })).filter(x => x.p >= 0)
    .sort((x, y) => x.p - y.p).slice(0, max).map(x => x.e);
}

// ── Construção das consultas SPARQL (texto exibido e enviado ao endpoint) ───
const anoLabel = a => (ANOS.find(x => x.id === a) || {}).label || a;

export function construirConsultaGrafo(p) {
  const filtros = [];
  if (p.ano)        filtros.push(`  ?habilidade edu:etapa "${anoLabel(p.ano)}" .`);
  if (p.eixo)       filtros.push(`  ?habilidade edu:pertenceAoEixo ${EIXOS[p.eixo].uri} .`);
  if (p.conceito)   filtros.push(`  ?habilidade edu:desenvolve ${NOS.get(p.conceito).uri} .`);
  if (p.disciplina) filtros.push(`  ?habilidade edu:podeSerTrabalhadaEm ${NOS.get(p.disciplina).uri} .`);
  if (p.componentes && p.componentes.length)
    filtros.push(`  ?habilidade edu:podeSerTrabalhadaEm ?comp .\n  VALUES ?comp { ${p.componentes.map(c => NOS.get(c).uri).join(' ')} }`);
  const tiposOcultos = ['habilidade', 'conceito', 'disciplina'].filter(t => p.tipos && p.tipos[t] === false);
  const filtroTipo = tiposOcultos.length
    ? `\n  FILTER (?origemTipo NOT IN (${tiposOcultos.map(t => 'edu:' + t.charAt(0).toUpperCase() + t.slice(1)).join(', ')})\n       && ?destinoTipo NOT IN (${tiposOcultos.map(t => 'edu:' + t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}))` : '';
  return `${PREFIXOS}

SELECT ?origem ?origemTipo ?origemRotulo ?relacao ?destino ?destinoTipo ?destinoRotulo
WHERE {
${filtros.join('\n')}
  { ?habilidade ?relacao ?destino . BIND(?habilidade AS ?origem) }
  UNION
  { ?habilidade edu:progrideDe ?anterior .
    BIND(?habilidade AS ?origem) BIND(?anterior AS ?destino) }
  VALUES ?relacao { edu:desenvolve edu:podeSerTrabalhadaEm edu:progrideDe }
  ?origem  rdf:type ?origemTipo  ; rdfs:label ?origemRotulo .
  ?destino rdf:type ?destinoTipo ; rdfs:label ?destinoRotulo .${filtroTipo}
}`;
}

export function construirConsultaExpansao(id) {
  const uri = NOS.get(id).uri;
  return `${PREFIXOS}

SELECT ?origem ?origemTipo ?origemRotulo ?relacao ?destino ?destinoTipo ?destinoRotulo
WHERE {
  { ${uri} ?relacao ?destino . BIND(${uri} AS ?origem) }
  UNION
  { ?origem ?relacao ${uri} . BIND(${uri} AS ?destino) }
  VALUES ?relacao { edu:desenvolve edu:podeSerTrabalhadaEm edu:progrideDe }
  ?origem  rdf:type ?origemTipo  ; rdfs:label ?origemRotulo .
  ?destino rdf:type ?destinoTipo ; rdfs:label ?destinoRotulo .
}`;
}

export function construirConsultaDetalhe(id) {
  const uri = NOS.get(id).uri;
  return `${PREFIXOS}

SELECT ?propriedade ?valor
WHERE {
  ${uri} ?propriedade ?valor .
  FILTER (?propriedade IN (rdfs:label, edu:textoNormativo,
          edu:pertenceAoEixo, edu:etapa, edu:areaConhecimento))
}`;
}

// ── Execução simulada ───────────────────────────────────────────────────────
export const config = { latencia: 500, erro: false, vazio: false };
export function setConfig(p) { Object.assign(config, p); }

const TIPO_URI = { habilidade: 'edu:Habilidade', conceito: 'edu:Conceito', disciplina: 'edu:Disciplina' };
const bind = v => ({ type: v.startsWith('edu:') ? 'uri' : 'literal', value: v });
const linhaAresta = ar => {
  const A = NOS.get(ar.a), B = NOS.get(ar.b);
  return {
    origem: bind(A.uri), origemTipo: bind(TIPO_URI[A.tipo]), origemRotulo: bind(A.label),
    relacao: bind(RELACOES[ar.rel].uri),
    destino: bind(B.uri), destinoTipo: bind(TIPO_URI[B.tipo]), destinoRotulo: bind(B.label),
  };
};

function filtrarHabilidades(p) {
  return HABILIDADES.filter(h =>
    (!p.ano || h.ano === p.ano) &&
    (!p.eixo || h.eixo === p.eixo) &&
    (!p.conceito || h.conceitos.includes(p.conceito)) &&
    (!p.disciplina || h.disc.includes(p.disciplina)) &&
    (!p.componentes || !p.componentes.length || h.disc.some(d => p.componentes.includes(d)))
  ).map(h => h.c);
}

function arestasDoRecorte(p) {
  const habs = new Set(filtrarHabilidades(p));
  const t = Object.assign({ habilidade: true, conceito: true, disciplina: true }, p.tipos || {});
  return ARESTAS.filter(ar => {
    if (!habs.has(ar.a)) return false;
    const A = NOS.get(ar.a), B = NOS.get(ar.b);
    if (ar.rel === 'progrideDe' && !habs.has(ar.b)) return false; // progressão só dentro do recorte
    return t[A.tipo] !== false && t[B.tipo] !== false;
  });
}

function executar(tipo, params) {
  if (tipo === 'grafo') {
    const arestas = config.vazio ? [] : arestasDoRecorte(params);
    const habsIsoladas = config.vazio ? [] : (params.tipos && params.tipos.habilidade !== false
      ? filtrarHabilidades(params).filter(id => !arestas.some(ar => ar.a === id || ar.b === id)) : []);
    return {
      head: { vars: ['origem', 'origemTipo', 'origemRotulo', 'relacao', 'destino', 'destinoTipo', 'destinoRotulo'] },
      results: { bindings: arestas.map(linhaAresta) },
      nosIsolados: habsIsoladas,
    };
  }
  if (tipo === 'expansao') {
    const arestas = ARESTAS.filter(ar => ar.a === params.id || ar.b === params.id);
    return {
      head: { vars: ['origem', 'origemTipo', 'origemRotulo', 'relacao', 'destino', 'destinoTipo', 'destinoRotulo'] },
      results: { bindings: arestas.map(linhaAresta) },
      nosIsolados: [],
    };
  }
  if (tipo === 'detalhe') {
    const n = NOS.get(params.id);
    const linhas = [['rdfs:label', n.label]];
    if (n.texto) linhas.push(['edu:textoNormativo', n.texto]);
    if (n.def) linhas.push(['edu:definicao', n.def]);
    if (n.eixo) linhas.push(['edu:pertenceAoEixo', EIXOS[n.eixo].uri]);
    if (n.ano) linhas.push(['edu:etapa', anoLabel(n.ano)]);
    if (n.area) linhas.push(['edu:areaConhecimento', n.area]);
    return {
      head: { vars: ['propriedade', 'valor'] },
      results: { bindings: linhas.map(([p, v]) => ({ propriedade: bind(p), valor: bind(v) })) },
    };
  }
  throw new Error('consulta desconhecida: ' + tipo);
}

// Contrato idêntico ao de um fetch ao Fuseki: Promise<sparql-results+json>.
export function consultarFuseki(tipo, params = {}) {
  const espera = Math.max(40, config.latencia * (tipo === 'detalhe' ? 0.55 : 1) * (0.85 + Math.random() * 0.3));
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const t0 = performance.now();
      if (config.erro && tipo !== 'detalhe') {
        reject(new Error('HTTP 503 Service Unavailable — o endpoint SPARQL não respondeu. Verifique se o serviço Fuseki está ativo.'));
        return;
      }
      try {
        const json = executar(tipo, params);
        resolve({ json, ms: Math.round(espera + (performance.now() - t0)) });
      } catch (e) { reject(e); }
    }, espera);
  });
}

// ── Conexões de um nó (para o painel de contexto) ───────────────────────────
export function conexoesDe(id) {
  const grupos = new Map();
  ARESTAS.forEach(ar => {
    let chave = null, outro = null;
    if (ar.a === id) { chave = RELACOES[ar.rel].saida; outro = ar.b; }
    else if (ar.b === id) { chave = RELACOES[ar.rel].entrada; outro = ar.a; }
    if (!chave) return;
    if (!grupos.has(chave)) grupos.set(chave, []);
    const n = NOS.get(outro);
    grupos.get(chave).push({ id: n.id, tipo: n.tipo, label: n.label, codigo: n.codigo || '', resumo: n.resumo || '', ano: n.ano || '' });
  });
  const ordem = ['desenvolve', 'desenvolvido nas habilidades', 'pode ser trabalhada em', 'trabalha as habilidades', 'progride de', 'prepara para'];
  return [...grupos.entries()]
    .sort((a, b) => ordem.indexOf(a[0]) - ordem.indexOf(b[0]))
    .map(([rotulo, itens]) => ({ rotulo, itens: itens.sort((x, y) => (x.ano || '').localeCompare(y.ano || '') || x.label.localeCompare(y.label)) }));
}
