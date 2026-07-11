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

*Última atualização: 2026-07-11. Novas decisões: adicionar ao fim da lista como
D<N+1>, seguindo o formato do cabeçalho — **sempre com o parágrafo de monografia**.*
