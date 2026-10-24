# Decisões de projeto — EduGraph (TCC)

> **O que é este arquivo:** o registro das decisões importantes do projeto, escrito
> para **preparar a defesa e a escrita da monografia**. Cada entrada explica o
> problema, o que foi decidido, o que foi considerado e rejeitado, traz uma **fala
> pronta para a banca** (oral) e um **parágrafo de monografia** (texto acadêmico,
> pronto para adaptar ao capítulo indicado).
>
> **Regra (ver ESTADO_ATUAL.md §6):** toda decisão relevante — de escopo,
> arquitetura, biblioteca, dado ou acessibilidade — ganha uma entrada aqui no
> momento em que é tomada, **sempre com todos os campos abaixo, inclusive o
> parágrafo de monografia**. Formato de cada entrada:
>
> ```
> ## D<N> — Título curto
> **Quando** · **Onde no código**
> **O problema** — que dilema existia.
> **A decisão** — o que foi feito.
> **Alternativas rejeitadas** — o que se considerou e por que não.
> **Para a banca** — fala pronta (oral), em 1–3 frases.
> **Monografia** — parágrafo em tom acadêmico (impessoal, terceira pessoa),
>   pronto para adaptar ao texto do TCC, indicando o capítulo/seção onde encaixa.
> ```

---

## D1 — Front-end primeiro, com um "dublê" fiel do back-end

**Quando:** início do projeto / Etapa 8 (G2) · **Onde:** [src/data/mockFuseki.js](src/data/mockFuseki.js)

> **Superada pela D14 (2026-10-09):** o servidor passou a ser um Neo4j (Cypher), e o
> dublê é aposentado ao fim da integração. O raciocínio abaixo continua valendo
> como registro de como as telas foram construídas antes de os dados existirem.
> **Encerrada pela D17 (2026-10-15, N10):** o `mockFuseki.js` foi apagado.

**O problema.** O TCC precisa de um servidor de grafos (Apache Jena Fuseki) para
responder consultas SPARQL, mas construir front-end e back-end ao mesmo tempo
dispersaria o esforço e atrasaria a parte visível do trabalho.

**A decisão.** Construir primeiro o front-end completo sobre um **mock do Fuseki**:
um módulo que imita o contrato exato do servidor real — recebe os mesmos parâmetros,
devolve o mesmo formato oficial (`application/sparql-results+json`), simula latência
e até erro HTTP 503. As consultas SPARQL **reais** são geradas e exibidas desde já
(gaveta SPARQL). Quando o Fuseki existir, troca-se **apenas o corpo de uma função**
(`consultarFuseki`) por um `fetch` — nenhuma tela muda.

**Alternativas rejeitadas.** (a) Subir o Fuseki primeiro: atrasaria meses de UI por
causa de infraestrutura; (b) mock informal (JSON qualquer): exigiria reescrever as
telas na integração. O mock **com contrato real** custa quase o mesmo e elimina o
retrabalho.

**Para a banca.** *"O sistema consome um endpoint SPARQL simulado que respeita o
contrato exato do Apache Jena Fuseki — mesmo formato de resposta, mesma latência,
mesmos erros. As consultas exibidas na interface são SPARQL válido. A integração
real é a substituição do corpo de uma única função por um fetch."*

**Monografia** *(cap. de Arquitetura/Metodologia de desenvolvimento):*
"Para desacoplar o desenvolvimento da interface da disponibilidade do servidor de
grafos, adotou-se a técnica de *mock* com contrato fiel: um módulo que simula o
endpoint SPARQL do Apache Jena Fuseki, aceitando os mesmos parâmetros e retornando
respostas no formato padronizado `application/sparql-results+json` (W3C), incluindo
a simulação de latência de rede e de falhas HTTP. As consultas SPARQL geradas pela
interface são sintaticamente válidas e exibidas ao usuário, de modo que o front-end
foi integralmente desenvolvido e validado contra o contrato real do serviço. Assim, a
integração com o triplestore reduz-se à substituição da função de transporte por uma
chamada HTTP, sem alterações nas camadas de apresentação."

---

## D2 — Sistema de contas fora do escopo; telas e perfil como especificação

**Quando:** decisão de escopo, consolidada na Etapa 15 (G10) · **Onde:**
[src/pages/Login.jsx](src/pages/Login.jsx), [src/pages/Signup.jsx](src/pages/Signup.jsx),
[src/components/GrafoPerfil.jsx](src/components/GrafoPerfil.jsx)

> **Revista pela D17 (2026-10-15, N10):** as turmas saíram do perfil (eram dados do
> mock); ele ficou com a identidade e as preferências de acessibilidade.

**O problema.** Um produto real precisa de autenticação, mas implementá-la (servidor,
banco de usuários, hash de senha, sessões) não agrega contribuição acadêmica — é
infraestrutura resolvida por qualquer framework.

**A decisão.** As telas de Login/Signup existem como **especificação visual** (com as
regras de validação já definidas no cliente), e a página de grafos exibe um **perfil
mock** ("Profa. Mariana") que demonstra a experiência-alvo: identidade, turmas e
preferências. Nada é enviado a servidor; nenhum usuário é criado. As **preferências**
persistem em `localStorage['edugraphPrefs']` — simulando o "salvo na sua conta" com o
mesmo JSON que, no futuro, irá para o banco associado ao usuário.

**Alternativas rejeitadas.** (a) Autenticação completa: tempo alto, contribuição
nula; (b) nenhuma tela de conta: a defesa não conseguiria mostrar a visão de produto.
O mock de alta fidelidade fica no meio-termo: especifica sem implementar.

**Para a banca.** *"O sistema de contas está especificado pela interface, mas não
implementado — decisão de escopo para concentrar o trabalho no grafo de conhecimento,
que é a contribuição do TCC. O perfil exibido é um mock da experiência-alvo, e as
preferências persistem localmente pelo mesmo contrato que usarão quando houver
servidor."* Se perguntarem o caminho real: back-end junto ao Fuseki, senha com hash
(bcrypt/argon2), sessão por token, e as turmas do professor podem virar triplas RDF
na própria ontologia (`edu:lecionaTurma`), unificando contas e grafo.

**Monografia** *(cap. de Escopo/Delimitação, com retomada em Trabalhos Futuros):*
"O sistema de autenticação e gerenciamento de contas foi deliberadamente excluído do
escopo de implementação, por constituir infraestrutura consolidada que não agrega
contribuição ao objeto central do trabalho — o grafo de conhecimento curricular.
Optou-se por especificá-lo por meio de protótipos funcionais de alta fidelidade: as
telas de cadastro e acesso implementam as regras de validação previstas, e a página
de exploração exibe um perfil simulado que demonstra a experiência-alvo (identidade
do docente, turmas cadastradas e preferências de acessibilidade). As preferências do
usuário são persistidas localmente (*Web Storage*) sob o mesmo contrato de dados que,
em trabalhos futuros, será transferido ao servidor mediante autenticação com
armazenamento seguro de credenciais (funções de *hash* como bcrypt ou Argon2) e
sessões baseadas em token."

---

## D3 — Motor de visualização próprio (canvas 2D + física portada), sem biblioteca

**Quando:** Etapa 7 (G1), resolvendo um "a definir" antigo · **Onde:**
[src/components/GrafoCanvas.jsx](src/components/GrafoCanvas.jsx)

> **Revista pela D18 (2026-10-18, N11):** o motor continua próprio e sem biblioteca,
> mas a física passou a ser a do Neo4j Browser (as forças do d3-force, reimplementadas
> e verificadas como idênticas), e ganhou um layout hierárquico. As molas não dependem
> mais do tipo de relação — o argumento das "molas semânticas" abaixo descreve o motor
> do protótipo, não o atual.

**O problema.** Como renderizar o grafo interativo? Bibliotecas prontas (D3.js,
Cytoscape.js, vis.js, react-force-graph) entregam rápido, mas impõem sua aparência,
seu modelo de interação e uma dependência pesada.

**A decisão.** Portar o **motor do protótipo aprovado**: canvas 2D puro com física
própria (repulsão + anti-colisão + molas por tipo de relação + gravidade + damping),
hit-test, câmera com zoom ancorado no cursor e HiDPI. Zero dependências novas.

**Alternativas rejeitadas.** D3/Cytoscape: (a) o design aprovado no protótipo teria
que ser recriado por cima das abstrações da lib — mais trabalho, não menos; (b) o
bundle cresceria ordens de grandeza para usar uma fração da lib; (c) perderia-se o
controle fino (anti-colisão garantida, molas por relação semântica — `progrideDe` tem
comprimento de repouso maior que `desenvolve`, por exemplo).

**Para a banca.** *"A visualização usa um motor próprio de ~400 linhas — simulação de
forças com anti-colisão e molas cujo comprimento reflete a semântica da relação. A
escolha por não usar biblioteca deu controle total sobre o design aprovado e mantém o
projeto sem dependências de visualização."*

**Monografia** *(cap. de Implementação, seção de visualização do grafo):*
"Para a renderização do grafo optou-se por um motor de visualização próprio, baseado
em Canvas 2D, em detrimento de bibliotecas consolidadas como D3.js e Cytoscape.js. O
layout é calculado por um algoritmo dirigido por forças (*force-directed*) que
combina repulsão entre pares de nós, restrição de anti-colisão (distância mínima
entre centros), atração por molas ao longo das arestas e gravidade central, com
resfriamento progressivo da simulação. Destaca-se que o comprimento de repouso das
molas é função do tipo semântico da relação — arestas de progressão curricular
(`progrideDe`) possuem repouso maior que as de desenvolvimento de conceito
(`desenvolve`) —, de modo que a própria geometria do layout reflete a estrutura da
ontologia. A decisão eliminou dependências externas de visualização e garantiu
controle integral sobre o comportamento interativo especificado no protótipo."

---

## D4 — Fidelidade ao protótipo como método de migração

**Quando:** desde a Etapa 1 · **Onde:** todo o projeto; receita de leitura no
[ESTADO_ATUAL.md §5](ESTADO_ATUAL.md)

> **Nota (2026-10-15):** a pasta `design/` com os protótipos foi retirada do
> repositório — era o exemplo de referência da migração e não é mais usada. O método
> abaixo continua valendo como registro de como a interface foi construída.
>
> **Revista pela D18 (2026-10-18, N11):** no motor do grafo, a referência de
> fidelidade passou do protótipo para o Neo4j Browser (parâmetros lidos da própria
> ferramenta, física verificada número a número).

**O problema.** O design aprovado vive em protótipos HTML "bundled"
(design/prototipo_final.html e prototipo_grafo.html). Como transformá-los em app
React sem desvios acidentais de design nem retrabalho?

**A decisão.** Migração **por partes, com porte fiel**: cada etapa decodifica o
trecho do protótipo (template JSON + dc-script), porta constantes e comportamentos
verbatim (tempos de animação, constantes da física, clamps de zoom) e **documenta
todo desvio consciente** no código e no ESTADO_ATUAL.md. Regra operacional: uma
etapa por sessão, verificada (lint/build/dev) e registrada antes da próxima.

**Alternativas rejeitadas.** Reescrever "de cabeça" olhando o protótipo: mais rápido
no curto prazo, mas os detalhes (easings, offsets, física) divergem sem que ninguém
perceba, e o resultado deixa de ser o design aprovado.

**Para a banca.** *"O desenvolvimento seguiu um protótipo de alta fidelidade aprovado
previamente; a implementação porta o comportamento verbatim e documenta cada desvio
consciente — o que se vê no ar é o design validado, não uma reinterpretação."*

**Monografia** *(cap. de Metodologia):*
"O desenvolvimento seguiu um processo incremental guiado por protótipo: a interface
foi previamente especificada em protótipos navegáveis de alta fidelidade e, aprovado
o design, a implementação procedeu por etapas curtas e verificáveis, portando de
forma literal os parâmetros de comportamento (tempos de animação, constantes da
simulação física, limites de zoom) e registrando em documentação versionada todo
desvio consciente em relação ao protótipo, com sua justificativa. Cada etapa foi
validada por análise estática, compilação de produção e execução local antes do
início da seguinte, o que manteve a rastreabilidade entre o design aprovado e o
produto final."

---

## D5 — Tema claro/escuro por tokens CSS (o protótipo era só claro)

**Quando:** Etapa 7 · **Onde:** [src/index.css](src/index.css) (autoridade da paleta),
`data-theme` no `<html>` via [src/context/ThemeContext.jsx](src/context/ThemeContext.jsx)

**O problema.** O protótipo da página de grafos só tem tema claro, com cores
hard-coded; o site tem modo escuro.

**A decisão.** Todo hex do protótipo vira um **token CSS** (`var(--…)`) com
contraparte escura obrigatória. O canvas — que não entende `var()` — resolve os
tokens via `getComputedStyle` dentro do loop de desenho, reagindo à troca de tema
(e de paleta) sem recarregar.

**Alternativas rejeitadas.** Duplicar estilos por tema em JS: espalharia a paleta
pelo código; a autoridade única no `index.css` mantém 1 lugar para mudar cor.

**Para a banca.** *"O design system é um conjunto de tokens CSS com variante clara e
escura; até o canvas 2D lê essas variáveis, então tema, paleta de acessibilidade e
componentes mudam juntos, a partir de uma única fonte."*

**Monografia** *(cap. de Implementação, seção de interface/design system):*
"A identidade visual foi implementada como um sistema de *design tokens* — variáveis
CSS customizadas definidas em ponto único, com valores para os temas claro e escuro
selecionados por atributo no elemento raiz do documento. O elemento Canvas, que não
interpreta variáveis CSS nativamente, resolve os tokens em tempo de execução por meio
de `getComputedStyle`, com cache invalidado à troca de tema ou de paleta de
acessibilidade. Essa centralização garante que todos os componentes — incluindo a
visualização do grafo — respondam de forma consistente e simultânea às trocas de
tema, a partir de uma única fonte de verdade cromática."

---

## D6 — Acessibilidade visual: paletas CUD (Okabe & Ito), formas e modo sem animação

**Quando:** Etapas 14–15 (G9–G10); cores CUD em ajuste de 2026-07-11 · **Onde:**
[src/data/paletas.js](src/data/paletas.js),
[src/components/GrafoOverlays.jsx](src/components/GrafoOverlays.jsx),
`tracarNo()` no [src/components/GrafoCanvas.jsx](src/components/GrafoCanvas.jsx)

**O problema.** Um grafo que codifica significado **por cor** exclui usuários
daltônicos; animação constante atrapalha usuários com sensibilidade a movimento.

**A decisão.** Três camadas independentes: (1) **paletas para daltonismo** baseadas
no *Color Universal Design* de Okabe & Ito — padrão da literatura científica para
protanopia/deuteranopia/tritanopia; (2) **formas em vez de cores** (círculo/quadrado/
triângulo) para daltonismo total — redundância de canal visual, aplicada no canvas e
em todos os indicadores DOM via uma única chave CSS (`data-formas`); (3) **modo sem
animação** que desliga a física e assenta o layout de imediato. Tudo persistido.
Além disso, o site inteiro tem zoom de fonte (widget A/A) e o próprio tema escuro.

**Alternativas rejeitadas.** Paletas "bonitas" escolhidas a olho: sem garantia
perceptual; o CUD é validado e citável. Só trocar cores (sem formas): não atende
daltonismo total (acromatopsia).

**Para a banca.** *"A acessibilidade não é cosmética: as paletas seguem o Color
Universal Design de Okabe & Ito, referência para visualização científica; o modo de
formas dá redundância de canal (cor + geometria); e o modo sem animação atende
sensibilidade a movimento. As preferências persistem entre visitas."*

**Monografia** *(seção de Acessibilidade — cite Okabe & Ito, 2008, e as WCAG):*
"Considerando que a visualização codifica o tipo dos nós por cor, foram implementados
recursos de acessibilidade em três camadas complementares: (i) paletas alternativas
para protanopia, deuteranopia e tritanopia, derivadas do *Color Universal Design*
(CUD) de Okabe e Ito, conjunto cromático validado para percepção por pessoas com
daltonismo e amplamente adotado em visualização científica; (ii) modo de codificação
redundante por forma geométrica (círculo, quadrado e triângulo por tipo de nó),
atendendo inclusive à acromatopsia, em conformidade com o princípio das WCAG de não
transmitir informação exclusivamente pela cor; e (iii) modo de redução de movimento,
que desativa a simulação física e apresenta o layout estabilizado imediatamente. As
preferências são persistidas entre sessões, juntamente com o ajuste global de tamanho
de fonte e o tema escuro."

---

## D7 — "Habilidades" não pode ser ocultada na legenda (desvio do protótipo)

**Quando:** ajuste de 2026-07-11, sobre a G9 · **Onde:**
[src/components/GrafoOverlays.jsx](src/components/GrafoOverlays.jsx) (`LegendaTipos`)

> **Revista pela D15 (2026-10-13):** no modelo do Neo4j nem toda aresta passa por uma
> habilidade, então todos os rótulos voltaram a ser alternáveis na legenda (que agora
> oculta só no desenho). O raciocínio abaixo continua válido para o modelo do mock.

**O problema.** O protótipo permite ocultar qualquer tipo de nó pela legenda. Mas na
ontologia **toda aresta passa por uma habilidade** (`desenvolve`, `podeSerTrabalhadaEm`
e `progrideDe` são centradas nelas) — ocultá-las esvaziava o grafo em 100% dos casos.

**A decisão.** A linha "Habilidades" virou um selo fixo (contagem visível, chip
"FIXO", não clicável); só Conceitos e Matérias são alternáveis.

**Para a banca.** *"É um desvio consciente do protótipo, motivado pela estrutura da
ontologia: as habilidades são o eixo de todas as relações, então ocultá-las produziria
sempre um grafo vazio — a interface passou a refletir essa propriedade do modelo."*
(Bônus: demonstra que você entende a topologia do seu próprio grafo.)

**Monografia** *(cap. de Implementação ou discussão de resultados — bom exemplo de
adaptação da interface ao modelo):*
"Durante a implementação da legenda com filtro por tipo de nó, identificou-se uma
propriedade estrutural da ontologia: todas as relações modeladas (`desenvolve`,
`podeSerTrabalhadaEm` e `progrideDe`) têm habilidades como vértice de origem, de modo
que ocultá-las resultaria invariavelmente em um grafo vazio. A interface foi então
ajustada em desvio consciente ao protótipo original: o tipo Habilidade é apresentado
como categoria fixa (com contagem visível, porém não alternável), enquanto Conceitos
e Componentes Curriculares permanecem filtráveis. O caso ilustra como propriedades
topológicas do modelo de conhecimento impõem restrições legítimas ao design da
interface."

---

## D8 — Estilos inline + tokens/classes `.eg-*`, sem Tailwind e sem lib de UI

**Quando:** convenção desde a Etapa 1 · **Onde:** todos os componentes;
[ESTADO_ATUAL.md §6](ESTADO_ATUAL.md)

**O problema.** Como estilizar um projeto que nasce de um protótipo com estilos
inline, mantido por uma pessoa?

**A decisão.** Híbrido deliberado: **layout e estilo dinâmico inline** (`style={{}}`,
mapeando 1:1 do protótipo e casando com estilos calculados por estado, ex.: progresso
de scroll); **o que o inline não faz** — tokens de tema, `:hover`, `:focus`,
`@keyframes` — vive em classes `.eg-*` no `index.css`. Sem Tailwind, sem biblioteca
de componentes.

**Alternativas rejeitadas.** Tailwind/styled-components: dependência e curva sem
ganho para um time de um; CSS Modules por componente: separaria o estilo da lógica
que o calcula, e o projeto tem muito estilo dirigido por estado (animações de scroll,
física).

**Para a banca.** *"A estilização segue o protótipo: inline para estrutura e estilo
dinâmico, e um design system central de tokens e classes para tema e interação — sem
dependências de CSS."*

**Monografia** *(cap. de Implementação, nota sobre tecnologias — parágrafo curto):*
"A estilização adota uma abordagem híbrida sem dependências externas: estilos inline
para estrutura e para propriedades calculadas em função do estado da aplicação (como
animações dirigidas por rolagem e pela simulação física), e uma folha central
contendo os *tokens* de tema e as classes utilitárias responsáveis por
pseudo-classes (`:hover`, `:focus`) e quadros de animação. A escolha preservou o
mapeamento direto com o protótipo aprovado e dispensou *frameworks* de CSS,
mantendo o conjunto de dependências do projeto restrito ao React e à ferramenta de
build."

---

## D9 — Roteamento por estado, sem react-router

**Quando:** convenção inicial; deep-link ajustado na Etapa 9 · **Onde:**
[src/App.jsx](src/App.jsx)

**O problema.** O site tem 4 telas (home, login, signup, grafos). Vale a pena um
roteador?

**A decisão.** Um `useState('tela')` com callbacks (`onHome/onGrafos/...`). O
**deep-link com recorte** (`?serie=7&disciplina=matematica`) é suportado lendo a URL
no boot e sincronizando filtros via `history.replaceState` — sem lib.

**Alternativas rejeitadas.** react-router: resolve navegação que o projeto não tem
(rotas aninhadas, guards); a URL que importa — a do recorte do grafo — precisou de
tratamento manual de qualquer forma.

**Para a banca.** *"Com quatro telas, um roteador seria dependência sem função; a
navegação é estado React, e a única URL semanticamente importante — a do recorte do
grafo, usada para compartilhar visões — é sincronizada manualmente."*

**Monografia** *(cap. de Implementação, nota sobre tecnologias — parágrafo curto):*
"A navegação entre as quatro telas da aplicação é controlada por estado React, sem
biblioteca de roteamento. A única URL com valor semântico — a que codifica o recorte
do grafo (série, componente curricular e conceito) e permite o compartilhamento de
visões — é sincronizada manualmente com a *History API* do navegador, sendo lida e
validada na inicialização (suporte a *deep-linking*) e atualizada a cada consulta
aplicada."

---

## D10 — Recorte curricular: 5.º–9.º ano (sem Ensino Médio)

**Quando:** ajuste da Etapa 8 · **Onde:** [src/data/mockFuseki.js](src/data/mockFuseki.js)

> **Revista pela D16 (2026-10-15):** o recorte deixou de ser fixado pelo site — agora é o
> que o grafo da orientadora contém (hoje, o 1.º ano de Matemática). O princípio de
> "todo número da interface é agregação sobre o grafo" continua valendo.

**O problema.** O protótipo trazia habilidades do EM (`EM13CO*`) junto com as do
fundamental, mas o produto e o discurso do site cobrem o ensino fundamental.

**A decisão.** Remover o EM do mock (ficam 56 nós / 136 arestas, 5.º–9.º ano) e
derivar **toda estatística exibida dos dados** (`estatisticas()`,
`habilidadesPorAno()`): a banda da Home e a grade de séries mostram números reais do
grafo, não valores digitados.

**Para a banca.** *"O recorte é o ensino fundamental (5.º–9.º), e todos os números da
interface são agregações calculadas sobre o grafo — quando o endpoint real existir,
serão consultas SPARQL de agregação, sem mudança de UI."* (Nota de honestidade: os
textos das habilidades do mock são **plausíveis, não oficiais** — a carga oficial da
BNCC-Computação é trabalho da integração.)

**Monografia** *(cap. de Delimitação/Materiais, junto da descrição do conjunto de
dados):*
"O domínio foi delimitado aos anos finais do ensino fundamental (5.º ao 9.º ano),
recorte em que a articulação entre a BNCC-Computação e os componentes curriculares é
mais direta. O conjunto de dados de demonstração compreende 56 vértices (8
componentes curriculares, 11 conceitos de computação e 37 habilidades) e 136 arestas
tipadas. Ressalta-se que os enunciados das habilidades são plausíveis, elaborados
para fins de demonstração, e que a carga do texto normativo oficial constitui etapa
da integração com o repositório definitivo. Todos os indicadores quantitativos
exibidos na interface (totais da página inicial, contagens por série e por tipo) são
agregações computadas sobre o próprio grafo, e não valores fixados manualmente."

---

## D11 — Convenções consolidadas na revisão de código (pós-roadmap)

**Quando:** revisão R0–R7, 2026-07-12 · **Onde:** [ESTADO_ATUAL.md §4.2 e §6](ESTADO_ATUAL.md),
[src/index.css](src/index.css) (topo), [src/components/grafo/](src/components/grafo/)

**O problema.** Com Home e página de grafos completas (16 etapas), o código
acumulou pequenas inconsistências naturais de um desenvolvimento incremental:
dois padrões de nome de handler, valores de z-index espalhados sem documentação,
todos os componentes numa pasta única e arquivos grandes demais para revisão
confortável (a página de grafos chegou a 1.149 linhas).

**A decisão.** Uma revisão de limpeza pura (zero mudança de comportamento), em
fases commitadas separadamente, consolidou três convenções: (1) **handlers** —
props de navegação entre telas mantêm o prefixo `on*` e os demais callbacks usam
`ao*`; a convenção foi **documentada em vez de imposta por renomeação em massa**,
preservando o histórico do git; (2) **escala de z-index** documentada em tabela
única (1–8 camadas da landing · 20 card aberto · 30 painéis/popovers · 32
overlays de estado · 40 barra de filtros · 60 dropdowns · 120 widget de fonte ·
190/200 perfil), com a regra de não criar valores intermediários; (3)
**organização por domínio** — os componentes exclusivos da página de grafos
moveram para `src/components/grafo/`, e arquivos grandes foram fragmentados por
seção (Home 281→65 linhas; Grafos 1.149→799) apenas onde o corte era um
movimento puro de JSX.

**Alternativas rejeitadas.** Renomear todos os handlers para um padrão único:
diff gigante e histórico ilegível, sem ganho funcional; pastas por página
(`components/Home/`): componentes compartilhados ficam sem casa e migram de
pasta quando ganham segundo uso — o critério adotado é posse/domínio;
fragmentar o motor do canvas: rejeitado por coesão (a física, o hit-test e a
câmera compartilham o mesmo estado por refs — decisão D3).

**Para a banca.** *"Ao final da implementação fizemos uma revisão sistemática de
limpeza com regra explícita de zero mudança de comportamento: cada remoção exigiu
busca por referências inclusive dentro de strings, o linter terminou sem nenhum
aviso, o bundle ficou menor e as convenções do projeto — nomes, camadas de
z-index, organização por domínio — foram consolidadas por escrito."*

**Monografia** *(cap. de Metodologia ou Implementação, fechamento — parágrafo
curto):*
"Concluída a implementação, realizou-se uma etapa de refatoração conservadora
(*refactoring*), com a restrição explícita de não alterar comportamento nem
aparência: remoção de código morto verificada por busca textual exaustiva
(incluindo referências construídas dinamicamente), consolidação de duplicações
triviais, nomeação de constantes de interação, reorganização dos módulos por
domínio e documentação das convenções do projeto (nomenclatura de *callbacks* e
escala de empilhamento visual). A verificação por fase — análise estática sem
avisos, compilação de produção com *bundle* final menor que o inicial e teste de
regressão manual guiado por um checklist derivado dos critérios de aceitação de
cada etapa — garantiu a equivalência funcional do resultado."

---

## D12 — Telas de conta: páginas com header unificado e card/footer de vidro (desvios conscientes do overlay)

**Quando:** roadmap A0–A5, consolidada na A3 (2026-07-16) · **Onde:**
[src/components/conta/MolduraConta.jsx](src/components/conta/MolduraConta.jsx),
[src/components/conta/FundoVertices.jsx](src/components/conta/FundoVertices.jsx),
[src/components/conta/estilos.js](src/components/conta/estilos.js),
[src/pages/Login.jsx](src/pages/Login.jsx), [src/pages/Signup.jsx](src/pages/Signup.jsx)

**O problema.** No protótipo final, Entrar/Criar conta são um **overlay**
full-screen sobre a landing, com header próprio (73px, o logo fecha o overlay)
e card **opaco** sobre o fundo animado de vértices. O site real navega por
**páginas** (roteamento por estado, D9) e tem um **header único** (SiteHeader,
60px) compartilhado por todas as telas — copiar o overlay ao pé da letra
criaria um segundo header divergente e esconderia o fundo animado atrás de um
card opaco.

**A decisão.** Três desvios conscientes, documentados no código e no
ESTADO_ATUAL.md (§4.3): (1) **header unificado** — o prompt de troca do
overlay ("Novo por aqui? Criar conta" / "Já tem conta? Entrar") entra no slot
de conta de largura fixa do SiteHeader; logo, nav, logos institucionais e
ThemeToggle ficam pixel-idênticos aos das demais telas; (2) **card de vidro**
— o fundo opaco (`--pill-bg`) vira translúcido
(`color-mix(in srgb, var(--pill-bg) 72%, transparent)` +
`backdrop-filter: blur(14px) saturate(1.15)`, receita do painel da página de
grafos), deixando o fundo de vértices visível através do card; geometria,
cores e fontes internas seguem o protótipo à risca; (3) **footer de vidro
opt-in** — prop `vidro` no Footer compartilhado (A4), para não alterar o
footer da Home/Grafos.

**Alternativas rejeitadas.** (a) Overlay literal sobre a Home: segundo header
divergente do design system consolidado e conflito com o roteamento por
estado (D9); (b) card opaco do protótipo: esconderia o fundo de vértices — o
elemento mais vivo da tela; (c) vidro global no footer: mudaria a cor do
footer nas outras páginas, quebrando a regra de zero regressão da revisão.

**Para a banca.** *"As telas de conta seguem o protótipo aprovado com três
desvios conscientes e documentados: o header é o componente único do site —
consistência entre telas vale mais que os 13px de diferença do overlay —, e o
card e o footer ganharam translucidez com desfoque para manter visível o fundo
animado de vértices, que no protótipo ficava escondido atrás de superfícies
opacas."*

**Monografia** *(cap. de Implementação, seção das telas de conta — retoma D2
e D4):*
"Na implementação das telas de acesso e cadastro, o overlay do protótipo foi
adaptado ao modelo de navegação por páginas da aplicação, com três desvios
conscientes registrados em documentação versionada, conforme o método adotado
(porte fiel com desvios justificados): o cabeçalho próprio do overlay foi
substituído pelo componente único de cabeçalho do sistema, preservando a
consistência visual entre telas; e o cartão do formulário e o rodapé — opacos
no protótipo — receberam tratamento translúcido com desfoque de fundo
(*backdrop blur*), mantendo perceptível a animação de fundo que remete ao
grafo de conhecimento. As demais propriedades do cartão (geometria,
tipografia, cores e estados de validação) seguem a especificação do protótipo,
e o rodapé translúcido foi implementado como variação opcional (*opt-in*) do
componente compartilhado, garantindo a não-regressão das demais páginas."

---

> *D13 — reservada para a decisão de desempenho do motor do grafo (renderização sob
> demanda, ESTADO_ATUAL.md §4.4), registrada quando a P5 for concluída.*

---

## D14 — Neo4j (Cypher) no lugar do Fuseki (SPARQL): integração real, atrás de um proxy

**Quando:** 2026-10-09 (decisão do autor com a orientadora; implementação a partir
da N1 do roadmap — ESTADO_ATUAL.md §4.5) · **Onde:** [vite.config.js](vite.config.js)
(proxy `/api/cypher`), [.env.example](.env.example) (variáveis de conexão)

**O problema.** Todo o front-end foi construído sobre um dublê fiel do Apache Jena
Fuseki (D1), na expectativa de um triplestore consultado em SPARQL. Nas reuniões
com a orientadora, o grafo de conhecimento passou a ser construído num **Neo4j** —
banco de grafos de propriedades, consultado em **Cypher** —, com um modelo próprio
(Ano → Unidade Temática → Objeto de Conhecimento → Habilidade). Além disso, o site
vai ser **publicado**: o mock não pode continuar como plano B (mostraria dados
fictícios como se fossem reais), e a senha do banco não pode chegar ao navegador —
na edição Community do Neo4j não existe usuário só-leitura, então quem tivesse a
senha teria acesso total de escrita ao grafo.

**A decisão.** (1) O Neo4j substitui o Fuseki como fonte de dados, e as consultas
passam a ser Cypher; (2) integração **real**, sem mock como plano B — ele é
removido ao fim da integração (N10); (3) transporte pela **Query API HTTP** do
próprio Neo4j (`POST /db/<banco>/query/v2`) com `fetch`, sem dependência nova;
(4) o navegador **nunca fala direto com o Neo4j**: chama `POST /api/cypher` no
servidor do próprio site, e um **proxy** acrescenta a credencial — lida de
variáveis de ambiente do servidor, sem o prefixo `VITE_`, portanto fora do bundle —
e repassa a consulta. Em desenvolvimento é o proxy do Vite (N1); no site
publicado, outro proxy no mesmo caminho (a definir); (5) toda consulta em **modo
somente leitura** — o cliente pede (N2) e o proxy de produção impõe; (6) respostas no
**JSON tipado** da Query API, em que cada valor declara o próprio tipo (nó,
relação, caminho, inteiro…), o que permite remontar o grafo a partir de qualquer
consulta, como o Neo4j Browser faz. A D14 **supera a D1**, que fica como registro
histórico: o dublê cumpriu o papel de permitir construir as telas antes dos dados.

**Alternativas rejeitadas.** (a) *Driver oficial (Bolt via WebSocket):* dependência
pesada para uma aplicação que só lê, e ainda exigiria credencial no navegador ou a
porta Bolt exposta; (b) *navegador chamando a Query API direto, com a senha no
código:* qualquer visitante leria a senha no bundle e, sem usuário só-leitura na
edição Community, poderia apagar o grafo; (c) *manter o mock como plano B:* o site
publicado poderia exibir dados fictícios em silêncio — inaceitável numa ferramenta
educacional; (d) *back-end próprio (Express etc.) já no desenvolvimento:*
infraestrutura além do necessário — o proxy do Vite resolve o desenvolvimento em
poucas linhas, e a hospedagem de produção ainda será decidida; (e)
*permanecer no Fuseki:* os dados agora são produzidos no Neo4j pelo grupo da
orientadora.

**Para a banca.** *"O grafo da orientadora vive num Neo4j e é consultado em Cypher
pela API HTTP do próprio banco, sem biblioteca nova. O navegador nunca vê a senha:
ele chama um endereço do próprio site, e um proxy do lado do servidor acrescenta a
credencial e restringe as consultas à leitura. O dublê que permitiu construir as
telas antes dos dados foi aposentado — o site publicado mostra apenas dados
reais."*

**Monografia** *(cap. de Arquitetura — atualiza o parágrafo da D1; retomar na
seção de implementação da integração):*
"A fonte de dados do sistema é um banco de grafos de propriedades Neo4j, mantido
pelo grupo de pesquisa e consultado na linguagem Cypher por meio da Query API HTTP
do próprio servidor de banco de dados. Por razões de segurança, a aplicação
cliente não se comunica diretamente com o banco: as consultas são enviadas a um
*endpoint* do servidor da aplicação, que atua como intermediário (*proxy*
reverso), acrescenta as credenciais de acesso — armazenadas exclusivamente em
variáveis de ambiente do servidor — e restringe as transações ao modo somente
leitura. A opção pela API HTTP, em detrimento do *driver* oficial baseado no
protocolo Bolt, dispensou dependências adicionais no cliente, uma vez que a
aplicação apenas consulta o grafo. As respostas são solicitadas no formato JSON
tipado da Query API, no qual cada valor declara seu tipo (nó, relação, caminho,
inteiro, entre outros), o que permite reconstruir a estrutura do grafo a partir de
resultados arbitrários de consulta. O simulador do servidor empregado nas fases
iniciais do desenvolvimento foi descontinuado com a integração, de modo que a
versão publicada exibe exclusivamente dados do repositório definitivo."

---

## D15 — Acessibilidade no modelo do Neo4j: paletas escolhidas por simulação de daltonismo, forma por rótulo e legenda que oculta só no desenho (revê D6 e D7)

**Quando:** 2026-10-13, N6 do roadmap (ESTADO_ATUAL.md §4.5) · **Onde:**
[src/data/paletas.js](src/data/paletas.js), [src/data/estiloGrafo.js](src/data/estiloGrafo.js)
(forma por rótulo), [src/components/grafo/GrafoOverlays.jsx](src/components/grafo/GrafoOverlays.jsx)
(`LegendaTipos`, `OpcoesAcessibilidade`), [src/index.css](src/index.css) (tokens
`--no-X-padrao`, classes `.eg-forma-*`)

**O problema.** As camadas de acessibilidade da D6 (paletas CUD, formas, modo sem
animação) e a legenda com filtro da D7 foram feitas para os 3 tipos do mock
(habilidade, conceito, disciplina). O grafo da orientadora tem 4 rótulos (Ano,
UnidadeTematica, ObjetoConhecimento, Habilidade) e vai ganhar outros. Três
problemas apareceram: (a) com 4 cores, escolher "a olho" dentro do CUD não garante
distinção — o CUD é um conjunto acessível de 8 cores, mas nem todo grupo de 4 delas
é bem distinguível sob cada tipo de daltonismo (os piores grupos ficam entre 16 e 21
de ΔE na simulação); (b) a legenda reconsultava o servidor com um filtro por tipo,
algo que não existe para uma consulta Cypher qualquer; (c) a D7 travava Habilidade
porque, no mock, toda aresta passava por uma habilidade — no modelo novo isso não é
mais verdade.

**A decisão.** (1) **Paletas por simulação:** para cada deficiência (protanopia,
deuteranopia, tritanopia), a paleta é o grupo de 4 cores do CUD com a **maior
diferença perceptual mínima** entre pares (ΔE CIE76, em CIELAB) depois de simular a
deficiência pelo modelo de Machado, Oliveira e Fernandes (2009, severidade 1). O
preto e o amarelo saem da disputa (somem no fundo escuro e no creme claro,
respectivamente); empates são desfeitos pelo maior contraste com o fundo claro.
Resultado: ΔE mínimo simulado de **25,2** (protanopia), **24,9** (deuteranopia) e
**24,8** (tritanopia), e pelo menos 19,8 contra o cinza dos rótulos sem estilo.
(2) **Forma por rótulo** na tabela de estilo — círculo, quadrado, triângulo e o
**losango** (novo, para o 4.º rótulo) —, a mesma no canvas e nos pontinhos da
interface; as classes CSS são por forma, não por tipo, e servem a rótulos futuros.
(3) **Legenda** com os rótulos presentes no grafo da tela, que oculta/mostra **só no
desenho**: a página entrega ao canvas o grafo filtrado, nada é reconsultado, e o nó
que volta reaparece no mesmo lugar. (4) **Todos os rótulos são alternáveis** — revê a
D7, cuja justificativa era uma propriedade do modelo do mock. (5) A cor de fábrica de
cada rótulo ganhou um token próprio (`--no-X-padrao`), para a amostra "Padrão" do
popover mostrá-la mesmo com outra paleta ativa — sem repetir hexadecimais no código.

**Alternativas rejeitadas.** (a) *4 cores do CUD escolhidas a olho:* nada garantiria
que o grupo escolhido não fosse um dos ruins (ΔE 16–21); (b) *uma paleta única para
as três deficiências:* o melhor grupo comum fica em ΔE 20,7, abaixo dos três grupos
dedicados (≈ 25); (c) *reconsultar o Neo4j ao ocultar um rótulo:* uma consulta Cypher
arbitrária não aceita um filtro automático sem ser reescrita; (d) *manter Habilidade
fixa na legenda:* sem a justificativa do modelo antigo, seria só uma restrição.

**Para a banca.** *"As paletas para daltonismo não foram escolhidas a olho: para cada
tipo de daltonismo simulei como as cores do Color Universal Design são percebidas,
pelo modelo de Machado e colegas, e escolhi o grupo de quatro cores com a maior
diferença perceptual mínima — cerca de 25 unidades de ΔE, folga grande para as cores
não se confundirem. Cada rótulo também tem uma forma própria, e a legenda oculta
rótulos só no desenho, porque uma consulta Cypher qualquer não tem como ser
refiltrada automaticamente."*

**Monografia** *(cap. de Implementação, seção de Acessibilidade — retoma a D6; citar
Okabe & Ito, 2008, e Machado, Oliveira & Fernandes, 2009):*
"Com a adoção do modelo de dados definitivo, que distingue quatro categorias de
vértices, as paletas alternativas para daltonismo foram redefinidas por um
procedimento objetivo. Para cada tipo de deficiência — protanopia, deuteranopia e
tritanopia —, simulou-se a percepção das cores do conjunto *Color Universal Design*
(OKABE; ITO, 2008) por meio do modelo de Machado, Oliveira e Fernandes (2009) e
selecionou-se, entre as combinações de quatro cores, aquela que maximiza a menor
diferença perceptual (ΔE CIE76, no espaço CIELAB) entre pares de cores simuladas,
excluídas previamente as cores de baixo contraste com algum dos fundos da interface.
As paletas resultantes apresentam diferença mínima entre 24,8 e 25,2 unidades de ΔE
sob a deficiência correspondente, contra valores de 16 a 21 nas piores combinações
do mesmo conjunto. A codificação redundante por forma geométrica foi estendida a
quatro formas (círculo, quadrado, triângulo e losango), associadas às categorias por
uma tabela de estilo que também acomoda categorias futuras, e a legenda passou a
ocultar categorias apenas na visualização, uma vez que consultas Cypher arbitrárias
não admitem refiltragem automática no servidor."

---

## D16 — A Home mostra o que o grafo tem: recorte dirigido pelos dados do Neo4j (revê D10)

**Quando:** 2026-10-15, N9 do roadmap (ESTADO_ATUAL.md §4.5), decisões do autor ·
**Onde:** [src/data/resumoGrafo.js](src/data/resumoGrafo.js),
[src/components/StatsBand.jsx](src/components/StatsBand.jsx),
[src/components/TestimonialsSection.jsx](src/components/TestimonialsSection.jsx),
[src/components/GradeCard.jsx](src/components/GradeCard.jsx),
[src/components/MateriaPopover.jsx](src/components/MateriaPopover.jsx)

**O problema.** A Home exibia números e séries do mock (37 habilidades, 8 componentes
curriculares, 5.º–9.º ano, 8 matérias no balão). O grafo real da orientadora é, por
ora, uma versão resumida — só o 1.º ano de Matemática, sem nó de componente
curricular —, mas que respeita a estrutura definitiva e vai crescer (EF2, EF3…, outras
matérias). Manter qualquer número ou lista "do site" mentiria sobre o que existe; criar
artificialmente o que o modelo não tem (componente curricular) anteciparia uma
modelagem que é da orientadora.

**A decisão.** Tudo o que a Home mostra passa a ser **consulta de agregação no Neo4j**,
sem valor fixado no código: (1) banda de estatísticas — habilidades
(`COUNT { (:Habilidade) }`), **unidades temáticas** no lugar de "componentes
curriculares", que o modelo ainda não tem, e os anos disponíveis (hoje "1.º ano");
(2) a grade "Encontre as habilidades da sua turma" tem **um card por nó `Ano`**,
mostrando o `nome` do nó ("1º Ano") — EF2, EF3… viram cards novos sozinhos; (3) o balão
do card perde as **matérias** (vinham do mock) e fica só com **"Ver o grafo desta
turma"**, que abre a página de grafos já executando no console a consulta de exemplo
`MATCH p = (:Ano)-[:DESENVOLVE_HABILIDADE]->(:Habilidade) RETURN p`. As matérias voltam
quando o grafo tiver o componente curricular. Com o Neo4j fora do ar, a Home abre
normalmente (números em "—", grade com aviso). Revê a **D10**: o recorte deixa de ser
uma escolha do site (5.º–9.º) e passa a ser o conteúdo do grafo.

**Alternativas rejeitadas.** (a) *Manter os números do mock até o grafo completo:*
contradiz a integração real (D14) — o site publicado mostraria dados fictícios;
(b) *contar "componentes" pelo prefixo do código das habilidades (MA = Matemática):*
inventaria uma entidade que o modelo da orientadora não tem; (c) *esconder a banda e a
grade até o grafo crescer:* a Home perderia a ligação com os dados, que é justamente o
que ela demonstra.

**Para a banca.** *"Nada do que a página inicial mostra é digitado no código: os
números da banda e os cards de série são consultas de agregação ao Neo4j. Hoje o grafo
tem só o 1.º ano de Matemática, e é isso que a página mostra; quando a orientadora
carregar os outros anos, eles aparecem sem nenhuma alteração no site."*

**Monografia** *(cap. de Implementação, seção da página inicial — retoma a D10 e a
D14):*
"A página inicial apresenta exclusivamente indicadores derivados do grafo de
conhecimento: o número de habilidades e de unidades temáticas e os anos escolares
disponíveis são obtidos por consultas de agregação em Cypher, e a grade de navegação
por série é gerada a partir dos vértices do tipo Ano existentes no banco. Com isso, o
recorte curricular exibido deixa de ser um parâmetro da aplicação e passa a refletir o
conteúdo efetivamente modelado — na versão atual do grafo, o primeiro ano do ensino
fundamental em Matemática —, de modo que a inclusão de novos anos ou componentes pelo
grupo de pesquisa se reflete na interface sem alteração de código. Elementos que
dependem de entidades ainda não modeladas, como a seleção por componente curricular,
foram suspensos até que o modelo as contemple."

---

## D17 — Nenhum dado local do grafo: o mock sai, o perfil perde as turmas e as consultas do site ficam à vista (fecha D1, revê D2)

**Quando:** 2026-10-15, N10 do roadmap (ESTADO_ATUAL.md §4.5), decisões do autor ·
**Onde:** [src/data/neo4j.js](src/data/neo4j.js) (`observarConsultas`),
[src/components/grafo/GrafoOverlays.jsx](src/components/grafo/GrafoOverlays.jsx)
(`GavetaCypher`), [src/components/grafo/GrafoPerfil.jsx](src/components/grafo/GrafoPerfil.jsx),
[src/pages/Grafos.jsx](src/pages/Grafos.jsx), [src/App.jsx](src/App.jsx); apagados
`src/data/mockFuseki.js` e `src/components/grafo/GrafoFiltros.jsx`

> **Exceção (2026-10-18, decisão do autor):** o grafo-globo da seção "Cada matéria tem
> sua rede." da Home ([src/components/GraphSection.jsx](src/components/GraphSection.jsx))
> continua com os nós e arestas escritos no código, como conteúdo ilustrativo da seção
> (como os depoimentos) — faz mais sentido que puxá-los do Neo4j. Na fala para a banca
> abaixo, "nenhum dado do grafo no código" vale para tudo o que vem do grafo da
> orientadora; o globo é ilustração, não consulta.

**O problema.** Depois da N9, o mock do Fuseki (D1) só sobrevivia em três lugares: a
barra de filtros antiga (sem uso desde a N3), o perfil mock ("Minhas turmas", com os
anos 5.º–9.º e as matérias do mock) e os rótulos de turma da página. As turmas eram
dado do grafo **guardado no código** — de um modelo que não existe mais (o grafo real
não tem 5.º–9.º nem componente curricular). E a gaveta SPARQL, que mostrava a consulta
enviada ao mock, tinha perdido o sentido; o site, porém, continua fazendo consultas por
conta própria (completar o resultado, conexões do painel, expansão) que ninguém via.

**A decisão.** (1) **O site não guarda nenhuma informação do grafo** — só consultas
para serem feitas pela API (as de exemplo, em `consultasExemplo.js`); tudo o que
aparece vem do Neo4j. O `mockFuseki.js` foi apagado. (2) O **perfil mock continua** no
header da página de grafos, mas só com a identidade e as **opções de acessibilidade**:
a seção "Minhas turmas" saiu inteira (com ela, o campo `turmas` das preferências
salvas). (3) A barra de filtros antiga (`GrafoFiltros.jsx`) foi **apagada** — o
redesenho dos filtros vai ser sobre o modelo novo, e o código antigo fica no histórico
do git. Saiu também o deep-link `?serie=&disciplina=` do App. (4) A gaveta SPARQL virou
a **gaveta Cypher**: o cliente (`neo4j.js`) anuncia cada consulta concluída, e a gaveta
lista as **10 últimas que o site fez sozinho** — para que serviu cada uma, o texto
Cypher, os parâmetros, quantas linhas voltaram, o tempo e o erro, se houve. Sai o
"Simular falha (HTTP 503)": as falhas agora são reais.

**Alternativas rejeitadas.** (a) *Copiar só a lista de anos e matérias para um arquivo
pequeno e manter as turmas:* continuaria sendo dado do grafo fixado no código, de um
modelo que o grafo real não tem; (b) *adiar a remoção do mock até as contas saírem:* o
site iria ao ar ainda com dados fictícios; (c) *tirar o perfil inteiro agora:*
anteciparia a remoção das contas, que tem roadmap próprio, e esconderia as opções de
acessibilidade do header; (d) *gaveta com uma consulta só:* uma ação (expandir,
completar o resultado) faz duas consultas — mostrar só a última esconderia a outra.

**Para a banca.** *"Desde a remoção do mock, o site não tem nenhum dado do grafo no
código: tudo o que aparece vem do Neo4j. E as consultas que o site faz por conta
própria não ficam escondidas — a gaveta Cypher mostra cada uma, com parâmetros, linhas
e tempo, do mesmo jeito que a gaveta SPARQL mostrava as do protótipo."*

**Monografia** *(cap. de Implementação, seção de integração com o banco de grafos —
encerra a D1 e retoma a D2):*
"Concluída a integração, o módulo de simulação do servidor de grafos foi removido, e a
aplicação deixou de manter qualquer dado curricular em seu código-fonte: todas as
informações exibidas são obtidas por consultas Cypher ao Neo4j, e o único conteúdo
local remanescente são consultas de exemplo. Elementos que dependiam do modelo
simulado — a lista de turmas do perfil de demonstração e a barra de filtros original —
foram retirados, permanecendo apenas as preferências de acessibilidade do usuário. Para
preservar a transparência das operações, a camada de acesso a dados passou a notificar
cada consulta concluída, e a interface disponibiliza um registro das consultas emitidas
automaticamente pela aplicação (complementação do resultado, vizinhança de um vértice e
expansão), com o texto Cypher, os parâmetros, o número de registros retornados e o
tempo de resposta — o que permite auditar, durante o uso, exatamente o que é solicitado
ao banco."

---

## D18 — O grafo se arruma como no Neo4j Browser: física idêntica (d3-force) e layout hierárquico próprio (revê D3 e D4)

**Quando:** 2026-10-18, N11 do roadmap (ESTADO_ATUAL.md §4.5), pedido e decisões do
autor · **Onde:** [src/data/simulacaoForcas.js](src/data/simulacaoForcas.js) (física),
[src/data/layoutHierarquico.js](src/data/layoutHierarquico.js) (hierárquico),
[src/components/grafo/GrafoCanvas.jsx](src/components/grafo/GrafoCanvas.jsx) (modos,
transições, arraste), [src/pages/Grafos.jsx](src/pages/Grafos.jsx) (seletor, preferência
`layout`, semente e expansão), [src/data/estiloGrafo.js](src/data/estiloGrafo.js)
(saíram as molas por relação e o "anel" da semente)

**O problema.** O motor do canvas foi portado do protótipo (D3, D4): uma física própria
em que o comprimento das molas dependia do tipo de relação. Com a integração ao Neo4j
(D14), a referência de quem usa o site passou a ser o **Neo4j Browser** — a ferramenta
oficial de consulta, a mesma que a orientadora usa para montar o grafo. O autor pediu
que o grafo se arrumasse *igual* ao do Browser e que o site oferecesse o layout
hierárquico, *exatamente* como o Browser oferece. "Igual" precisava de um critério
verificável, e não de uma impressão visual.

**A decisão.** (1) **De onde vêm os números:** do próprio Browser servido pelo Neo4j
2026.09 — a classe `d3ForceLayout` do pacote de visualização e o worker do layout
hierárquico. O código foi apenas **lido**: o site reproduz parâmetros e comportamento,
sem copiar código da ferramenta. (2) **Física:** as forças do d3-force, que o Browser
embute (licença ISC), foram reimplementadas no projeto — repulsão −400 com a aproximação
de Barnes–Hut, colisão (tamanho + 25), molas de comprimento tamA + tamB + 90 com força
dependente do grau dos nós, atração ao centro 0,03, `velocityDecay` 0,4, parada em
alpha 0,05 e o gerador pseudoaleatório de semente fixa —, com o **pré-cálculo de 1.ª
carga** do Browser (até 200 passos com repulsão dobrada antes do 1.º desenho). Decisões
do autor: tamanho 25 nas contas (o padrão do Browser), nó arrastado fica preso,
consulta nova recomeça do zero e a expansão segue o Browser (nós novos perto do centro,
reaquecimento em 1, câmera que só afasta). **A equivalência foi verificada
numericamente:** a mesma entrada, nesta física e no d3 extraído do Browser, dá
coordenadas idênticas (diferença de 0 px no grafo real de 45 nós e 66 relações). (3)
**Hierárquico:** escrito no projeto, sem dependência nova (decisão do autor), seguindo as
etapas do dagre que o Browser usa — quebra de ciclos, níveis por caminho mais longo e
"árvore justa", nós fictícios nas arestas longas, redução de cruzamentos por baricentro
e coordenada x pelo método de Brandes–Köpf — com a configuração do Browser: de cima para
baixo, separações de 75 px, caixa de 2,63 × tamanho por nó, uma aresta por par, partes
desconectadas empacotadas, o grafo mantido no lugar (centroide) e transição de 400 ms.
Fica **parecido, não idêntico** (detalhes internos do dagre ficaram de fora). (4) Um
**seletor de dois botões** troca os modos, e a escolha fica salva. Revê a **D3**: o
motor continua próprio, mas o argumento das "molas semânticas" deixa de valer — a
distância das molas passa a depender do tamanho dos nós, e a geometria reflete a
topologia do grafo, como no Browser. Revê a **D4**: no motor do grafo, a fidelidade
passa do protótipo à ferramenta oficial.

**Alternativas rejeitadas.** (a) *Instalar o dagre* (0.8.5 ou `@dagrejs/dagre` 3.x):
dependência nova (contra a D3) e, ainda assim, não a versão do Browser — a 0.8.14 que ele
embute não está publicada; o autor preferiu a implementação própria. (b) *Instalar o
d3-force:* dependência sem necessidade — as cinco forças cabem num módulo do projeto e o
resultado é idêntico. (c) *Copiar o código do Browser:* reproduzir parâmetros e
comportamento, sim; copiar código de uma ferramenta de terceiros, não. (d) *Ajustar as
constantes da física antiga "a olho" até parecer o Browser:* sem garantia nenhuma; a
leitura dos parâmetros mais a comparação número a número é que dá a garantia. (e)
*Manter a física do protótipo:* o grafo do site não se arrumaria como o do Browser, que é
a referência de quem monta e consulta o grafo.

**Para a banca.** *"O grafo se arruma exatamente como no Neo4j Browser. Li os parâmetros
do layout no próprio código que o Neo4j entrega, reimplementei no projeto as forças do
d3 que ele usa e comparei as duas simulações número a número no grafo real: a diferença
foi zero. O layout hierárquico segue o mesmo algoritmo em camadas do Browser, também
implementado no projeto, sem biblioteca nova."*

**Monografia** *(cap. de Implementação, seção de visualização do grafo — retoma a D3 e
a D4; citar Barnes & Hut, 1986; Sugiyama, Tagawa & Toda, 1981; Gansner et al., 1993;
Brandes & Köpf, 2001; e a biblioteca d3-force):*
"Com a integração ao banco de grafos, a referência de comportamento da visualização
passou a ser o Neo4j Browser, ferramenta oficial de consulta do sistema gerenciador. Os
parâmetros do layout dirigido por forças foram obtidos por inspeção do código da própria
ferramenta, distribuído pelo servidor de banco de dados, e a simulação foi reimplementada
segundo o algoritmo da biblioteca d3-force, que a ferramenta incorpora: repulsão entre
vértices com a aproximação de Barnes–Hut (BARNES; HUT, 1986), restrição de colisão,
molas cuja rigidez decresce com o grau dos vértices e atração ao centro, sob resfriamento
exponencial e com um gerador pseudoaleatório de semente fixa, que torna o resultado
determinístico. A equivalência foi verificada numericamente: submetidas ao mesmo grafo e
às mesmas posições iniciais, a implementação deste trabalho e a da ferramenta de
referência produziram coordenadas idênticas. Implementou-se ainda um layout hierárquico
em camadas, segundo a abordagem de Sugiyama, Tagawa e Toda (1981) — quebra de ciclos,
atribuição de níveis com o refinamento por árvore geradora justa (GANSNER et al., 1993),
inserção de vértices fictícios nas arestas longas, redução de cruzamentos pela
heurística do baricentro e posicionamento horizontal pelo método de Brandes e Köpf
(2001) —, com a configuração de espaçamento e de empacotamento de componentes
desconexos adotada pela ferramenta. Em relação ao motor portado do protótipo, a mudança
substitui o comprimento de mola definido pelo tipo semântico da relação por um
comprimento dependente do tamanho dos vértices, de modo que a geometria do desenho passa
a refletir a topologia do grafo, como na ferramenta de referência."

---

## D19 — Busca guiada do professor: ano → matéria → recorte numa consulta só, e todo o resto no navegador

**Quando:** planejada em 2026-10-24 a partir das conversas de 2026-10-20 com o autor;
N12 (modelo e consultas), N13 (a barra) e N14 (os campos e o "Ver no grafo") do roadmap
(ESTADO_ATUAL.md §4.5, decisões 1–35 da seção "N12–N15") · **Onde:**
[src/data/filtrosDeBusca.js](src/data/filtrosDeBusca.js) (tabela de matérias, filtro por
texto, consultas das opções e das perguntas — tudo num arquivo, pedido do autor),
[src/components/grafo/BuscaProfessor.jsx](src/components/grafo/BuscaProfessor.jsx) (a
barra), [src/components/grafo/CampoBusca.jsx](src/components/grafo/CampoBusca.jsx) (o
campo com filtro por texto), [src/pages/Grafos.jsx](src/pages/Grafos.jsx) (o palco que
executa e desenha), [src/data/resumoGrafo.js](src/data/resumoGrafo.js) (a consulta de
anos, a mesma da Home), [src/data/consultasExemplo.js](src/data/consultasExemplo.js) (as
consultas de teste da orientadora, que viraram as perguntas)

> **Situação em 2026-10-24:** os passos 1–6 abaixo estão na tela (N13 e N14). O link
> compartilhável e o botão da Home (N15) completam esta entrada quando forem feitos.

**O problema.** O professor precisa achar no grafo o que vai ensinar — o caminho de uma
habilidade, uma unidade temática inteira, as habilidades de um ano — **sem saber
Cypher**. Até aqui só existia o console, que exige escrever a consulta. Três restrições
moldaram a solução: (1) o **modelo do grafo é da orientadora e não muda** — o site é que
se adapta a ele, inclusive a rótulos diferentes por matéria (a Gramática deve vir com
`UnidadeTematicaGram`, `ObjetoConhecimentoGram`…); (2) o site **não guarda dados do
grafo** (D17), então anos, matérias, unidades, objetos e habilidades têm de vir do Neo4j
na hora; (3) no modelo da orientadora, **unidades temáticas e objetos de conhecimento são
compartilhados entre os anos** (um nó "Geometria" só, ligado a todos os anos) — partir do
ano pela unidade traria objetos e habilidades de outros anos. Faltava decidir **quantas
consultas** a busca faz, **em que momento** e **o que fica no navegador**, de modo que a
escolha fosse instantânea e a carga sobre o servidor (o da UFES), pequena.

**A decisão.** O professor monta a busca **só escolhendo opções**, em cascata: **Ano →
Matéria → Pergunta → campos da pergunta → "Ver no grafo"**. Cada passo busca o que
precisa assim:

| Passo | O que dispara | Consulta ao Neo4j? | O que ela traz / onde fica |
|---|---|---|---|
| 1. **Ano** | abrir a página | **1**: `MATCH (a:Ano) RETURN a.codigo, a.nome` (a mesma da Home) | os anos do grafo, ordenados no navegador pelo número (o modelo não o guarda) |
| 2. **Matéria** | escolher o ano | **1**, para **todas** as matérias da tabela de uma vez (`UNWIND` + `EXISTS`) | só as matérias que têm habilidade **naquele** ano; nunca vem escolhida sozinha, mesmo havendo uma só (decisão do autor) |
| 3. **Recorte** | escolher a matéria | **1**, que traz o **recorte inteiro** | todas as unidades, objetos e habilidades do ano na matéria, cada um com quem é seu "pai"; fica na **memória da página** (cache por ano + matéria) |
| 4. **Pergunta** | — | **nenhuma** | o cardápio é uma lista do código (`PERGUNTAS`) — 9 perguntas, uma por consulta de teste da orientadora, mais o "Teste de erro" |
| 5. **Campos** (unidade, objeto, habilidade) | escolher a pergunta, digitar | **nenhuma** — nem a cada tecla | as listas saem do recorte, e o filtro por texto roda no navegador; cada pergunta mostra só o campo que pede |
| 6. **Ver no grafo** | o botão | **1** (a consulta da pergunta; sem o "conectar nós do resultado" desde a D20) | caminhos → o mesmo trajeto do console: extrair → completar → canvas |

Ou seja: **até três consultas para preparar a busca** (anos, matérias do ano, recorte) e
**uma para mostrar o resultado**; **zero** enquanto o professor escolhe e digita.
Os detalhes que sustentam o fluxo:

1. **A tabela de matérias descreve o modelo, não guarda dados.** Para cada matéria: o
   nome a mostrar, o rótulo de cada nível, a relação que liga um nível ao de baixo, o
   atalho Ano → Habilidade e a propriedade que dá o texto de cada nó. Matéria nova = uma
   entrada nova; entrada cujos rótulos ainda não existem no banco, ou sem nada no ano,
   **não aparece** (o passo 2 confere a tabela contra o banco). Os rótulos e as relações
   entram nas consultas **como parâmetros** (`$any([...])`, Cypher 25), nunca como texto
   montado.
2. **O ano é amarrado pelas habilidades.** Como unidades e objetos são compartilhados, o
   recorte parte do **atalho Ano → Habilidade** (`DESENVOLVE_HABILIDADE`) e sobe para o
   objeto e a unidade de cada habilidade. As perguntas seguem a mesma regra — e a "ligação
   entre duas habilidades", que usa caminho mais curto, só pode passar pelo ano escolhido.
3. **O recorte é uma consulta só.** Medido no 1.º ano de Matemática: 22 habilidades, 17
   objetos e 5 unidades, ~3 KB e ~12 ms no Neo4j. Vem com teto (2.000 linhas) e aviso se
   passar. Fica em cache **na memória** durante a visita (voltar a um ano/matéria já visto
   não consulta de novo; se a consulta falhar, sai do cache e "Tentar de novo" refaz);
   some ao recarregar, e **nada vai para o `localStorage`** (D17).
4. **O filtro por texto é local e sem intervalo de tempo.** O professor digita o código
   ou parte do texto e só ficam as opções que contêm o que ele escreveu — sem acento e sem
   maiúscula ("numeros" acha "Números"), todas as palavras em qualquer ordem, primeiro as
   que começam com o texto. Como os dados já estão no navegador, a lista se atualiza a
   cada tecla, **sem debounce** e sem ir ao Neo4j.
5. **A escolha vai à consulta final pelo id do nó.** Cada opção do recorte carrega o
   `elementId` do nó, que vai como parâmetro da pergunta — preciso mesmo se dois objetos
   tiverem o mesmo nome. (O link compartilhável, N15, usará o código da habilidade e o
   nome da unidade/objeto, porque o `elementId` não é garantido entre sessões.)
6. **Tudo fica à vista.** Cada consulta da busca aparece na gaveta Cypher (D17), com
   descrição: "busca · anos", "busca · matérias do ano", "busca · recorte do ano e
   matéria", "busca · caminho até uma habilidade"… O **console Cypher continua na tela**,
   logo abaixo da barra da busca (o autor o usa; sai bem depois), e o "Ver no grafo"
   **escreve nele a consulta que gerou o desenho**: a mesma que foi ao Neo4j, com os
   valores no lugar dos parâmetros e um cabeçalho em comentário (a pergunta, o ano, a
   matéria e o que foi escolhido). Executada ali, ela dá o mesmo grafo. O Neo4j continua
   recebendo a versão com parâmetros; a escrita é só para ler (ou mudar e executar).
7. **Os campos seguem um padrão de acessibilidade conhecido** (N14): o *combobox* das
   WAI-ARIA Authoring Practices — caixa de texto + lista, navegável por teclado (↓/↑,
   Enter, Esc) e anunciada por leitores de tela. **Cada pergunta mostra só o campo que
   pede** (decisão do autor): uma habilidade, duas (a ligação, que não deixa repetir a
   mesma), um objeto ou uma unidade — ou nenhum. (Uma cascata de filtros — unidade →
   objeto → habilidade — e um campo de várias habilidades chegaram a ser feitos e saíram
   no mesmo dia: o filtro por texto já estreita a lista, e a tela ficou mais simples.)
8. **Busca e console dividem o mesmo palco** (N14): o resultado da busca percorre
   exatamente o trajeto de uma consulta do console (extrair → completar → canvas, com
   painel, expandir e desfazer), e uma execução nova de qualquer um dos dois cancela a
   anterior. Não há um segundo caminho de desenho para manter.

**Alternativas rejeitadas.** (a) *Uma consulta por passo da cascata* (escolher a unidade
→ consultar os objetos dela → escolher o objeto → consultar as habilidades): uma espera
de rede a cada escolha e mais carga no servidor, para listas que cabem inteiras em ~3 KB.
(b) *Buscar no Neo4j enquanto o professor digita:* exigiria intervalo de tempo
(~250 ms) e cancelamento das consultas antigas, e uma consulta por pausa na digitação —
só valeria se o recorte não coubesse no navegador. (c) *Índice de texto completo no
Neo4j:* exigiria criar um índice no banco da orientadora, cujo modelo não muda; e é
desnecessário neste tamanho — fica como caminho se um recorte passar do teto. (d)
*Carregar o grafo inteiro de uma vez:* cresce com o grafo (todos os anos e matérias) para
usar só um pedaço. (e) *Listas de anos e matérias fixas no código:* dado do grafo guardado
no site (contra a D17), que envelheceria a cada carga nova da orientadora. (f) *Amarrar o
ano pela unidade temática* (Ano → Unidade → Objeto → Habilidade): com unidades e objetos
compartilhados, traria habilidades de outros anos. (g) *Montar a consulta juntando texto*
com os rótulos da matéria ou com o que foi digitado: abre espaço para injeção de Cypher;
tudo vai como parâmetro, e o texto digitado nem sai do navegador. (h) *Escolher a matéria
sozinha quando só há uma:* o autor preferiu que o professor sempre escolha.

**Para a banca.** *"O professor não escreve consulta: escolhe o ano, a matéria e uma
pergunta. Para isso o site faz três consultas pequenas — os anos, as matérias daquele
ano e o recorte inteiro do ano na matéria, que no 1.º ano de Matemática tem uns 3 KB.
Daí em diante tudo acontece no navegador: as listas e a busca por texto, sem nenhuma
consulta enquanto ele digita. O Neo4j só volta a ser consultado quando ele
pede para ver o resultado no grafo. E, como o modelo é da orientadora, o site não
assume nada sobre ele: uma tabela descreve os rótulos de cada matéria e as consultas
recebem esses rótulos como parâmetros."*

**Monografia** *(cap. de Implementação, seção da interface de consulta para o professor —
retoma a D14 e a D17; se for o caso, citar o padrão *combobox* das WAI-ARIA Authoring
Practices, usado nos campos da N14):*
"Para que o professor consulte o grafo sem recorrer à linguagem Cypher, foi
implementada uma busca guiada em cascata, na qual o usuário seleciona sucessivamente o
ano escolar, o componente curricular e uma pergunta de um cardápio predefinido, cujas
consultas parametrizadas derivam das consultas de validação fornecidas pela orientação.
Como o modelo de dados é mantido externamente e varia entre componentes curriculares, a
aplicação não codifica rótulos nem relações nas consultas: uma tabela descritiva
registra, para cada componente, os rótulos dos níveis hierárquicos, os tipos de relação
entre eles e as propriedades textuais, e esses valores são passados ao banco como
parâmetros, por meio dos rótulos e tipos dinâmicos do Cypher. A obtenção das opções foi
organizada para minimizar a comunicação com o servidor: a lista de anos e a dos
componentes com conteúdo no ano escolhido são obtidas por uma consulta cada, e, em
seguida, uma única consulta recupera o recorte completo do ano no componente — unidades
temáticas, objetos de conhecimento e habilidades, com suas relações de pertinência. Como
unidades e objetos são compartilhados entre os anos no modelo adotado, o recorte é
ancorado nas habilidades, por meio da relação direta entre ano e habilidade. A partir
desse recorte, mantido apenas em memória durante a sessão, as listas de opções e a busca
textual — insensível a acentos e a maiúsculas e baseada na ocorrência de todos os termos
digitados — são resolvidas no próprio navegador, sem novas requisições ao banco durante a
digitação. O banco volta a ser consultado somente para obter o subgrafo que responde à
pergunta, identificado pelos elementos selecionados. Todas as consultas emitidas
permanecem registradas na interface, para auditoria, e a consulta que gerou o subgrafo
exibido é apresentada ao usuário no console Cypher, com os valores dos parâmetros já
substituídos, de modo que possa ser lida, alterada e executada novamente."

---

## D20 — O grafo mostra só o que a consulta devolveu: sem o "Conectar nós do resultado" (desvio do Neo4j Browser)

**Quando:** 2026-10-24, logo depois da N14, decisão do autor · **Onde:**
[src/data/extrairGrafo.js](src/data/extrairGrafo.js) (`completarGrafo` perdeu o passo de
conectar), [src/data/vizinhanca.js](src/data/vizinhanca.js) (`expandirNo` perdeu o
"conectar os novos"), [src/components/grafo/ConsoleCypher.jsx](src/components/grafo/ConsoleCypher.jsx)
(saiu a chave), [src/pages/Grafos.jsx](src/pages/Grafos.jsx) (saiu o estado da chave),
[src/components/grafo/ResultadoCypher.jsx](src/components/grafo/ResultadoCypher.jsx) (saiu
a linha "conectar nós do resultado" da aba Relações)

**O problema.** O Neo4j Browser tem, ligada por padrão, a opção *Connect result nodes*: depois
da consulta, ele faz uma consulta extra e desenha também as relações que existem **entre** os
nós devolvidos, mesmo que a consulta não as tenha pedido. O site copiou isso na N4 (a chave
"Conectar nós do resultado", ligada) e, na busca do professor, deixou a opção sempre ligada.
No modelo da orientadora, porém, existe o **atalho Ano → Habilidade** (`DESENVOLVE_HABILIDADE`),
que serve para amarrar o ano às habilidades (D19), e não para ser visto. Com o "conectar", a
pergunta "O ano inteiro nesta matéria" — que devolve a árvore Ano → unidades → objetos →
habilidades — aparecia com o Ano ligado **diretamente** a cada uma das 22 habilidades: 66
relações em vez de 44. Essas 22 arestas repetem a hierarquia, embaralham o desenho e somem
com a leitura em árvore, que é o que o professor quer ver.

**A decisão.** O grafo vem **sempre como se a chave estivesse desligada**, e a chave **saiu
da tela**: o desenho mostra **só as relações que a consulta devolveu**. Vale para tudo — o
console, a busca do professor e a expansão de um nó (que agora traz os vizinhos e a relação
de cada um ao nó expandido, sem as relações entre os que chegaram e os que já estavam na
tela). O código do "conectar" foi **retirado**, e não só escondido (fica no histórico do
git): uma opção sempre desligada seria código morto. As outras consultas extras do Browser
continuam — buscar as pontas que faltam (`RETURN r`) e o limite de 300 nós. Quem **quiser**
ver o atalho pede por ele: a pergunta "As habilidades do ano" (a consulta "ano direto p
habilidade" da orientadora) devolve exatamente essas relações, e no console basta escrevê-las
na consulta. Revê a N4 (a paridade com o Browser nesse ponto) e a decisão 2 da busca do
professor (o "conectar" sempre ligado).

**Alternativas rejeitadas.** (a) *Manter a chave e só desligá-la por padrão:* o autor pediu
que ela saísse; e uma chave que muda o desenho sem a pessoa pedir algo na consulta confunde
quem não conhece o Browser. (b) *Manter o "conectar" e esconder só a `DESENVOLVE_HABILIDADE`:*
o site passaria a decidir sozinho que relações do modelo da orientadora aparecem — e o
"conectar" continuaria trazendo, em outras consultas, relações que ninguém pediu. (c)
*Desligar só na busca do professor:* o mesmo grafo sairia diferente pelo console e pela
busca, e a expansão continuaria ligando o Ano às habilidades.

**Para a banca.** *"O Neo4j Browser liga, por padrão, os nós do resultado entre si; no
nosso modelo isso ligava o ano direto em cada habilidade e bagunçava a árvore. Por isso o
site mostra só o que a consulta devolveu: quem quiser ver o atalho do ano para a
habilidade tem uma pergunta própria para isso."*

**Monografia** *(cap. de Implementação, seção de visualização do grafo — complementa a D18
e a D19):*
"A ferramenta de referência do sistema gerenciador oferece, ativada por padrão, a
complementação do resultado com todas as relações existentes entre os vértices retornados,
ainda que não solicitadas pela consulta. No modelo de dados adotado, essa complementação
mostrou-se inadequada: a relação direta entre ano e habilidade, mantida no modelo para
ancorar as habilidades ao ano escolar, passava a ser desenhada junto da hierarquia completa
— ano, unidade temática, objeto de conhecimento e habilidade —, duplicando visualmente a
estrutura e prejudicando a leitura em árvore. Optou-se, por isso, por exibir exclusivamente
as relações devolvidas pela consulta, tanto nas consultas livres quanto na busca guiada e na
expansão de vértices; a relação direta permanece acessível por uma pergunta específica do
cardápio. A decisão privilegia a correspondência entre a pergunta formulada e o subgrafo
exibido, em detrimento da paridade com a ferramenta de referência nesse aspecto."

---

*Última atualização: 2026-10-24. Novas decisões: adicionar ao fim da lista como
D<N+1>, seguindo o formato do cabeçalho — **sempre com o parágrafo de monografia**.*
