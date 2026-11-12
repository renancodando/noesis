# Arquitetura

## Princípios

Aplicação estática em HTML5, CSS e JavaScript modular, sem framework, sem compilação e sem serviço externo. Dados, regras, interface, estado, simulações e estilos ficam em módulos separados. Todo nome de variável, função, módulo e texto está em português.

## Navegação

`js/navegacao/rotas.js` mantém a tabela de rotas e resolve o caminho atual. Em cliques internos, o roteador usa a API de histórico, carrega o módulo do ambiente com `import()` dinâmico, injeta a folha de estilos declarada em `estilos` e chama `montar(...)`, que devolve uma função de limpeza executada ao sair. Cada rota também existe como página estática gerada por `gerar.py`, com o conteúdo principal pré-renderizado: o primeiro carregamento mostra conteúdo real antes do JavaScript, e os mecanismos de busca recebem título, descrição, canônica e metadados sociais por página. `404.html` cobre rotas inexistentes nas hospedagens estáticas.

## Santuário

A primeira tela foi preservada: um renderizador Three.js compõe o ambiente fotográfico com água e vegetação animadas por shader e a cena ortográfica com cristal, oito domínios e anéis. Texto, painéis e controles são HTML; a composição de reserva sem WebGL mantém as mesmas interações em SVG. A cena só é iniciada quando a rota é o Santuário e é ocultada nos outros ambientes, respeitando movimento reduzido, qualidade ajustável e pausa em abas ocultas.

## Conteúdo

As aulas são arquivos JSON em `conteudos/<disciplina>/`. O renderizador (`js/aulas/renderizador.js`) organiza os blocos nas etapas Compreender, Explorar, Experimentar, Resolver, Aplicar e Revisar, criando o cabeçalho de cada etapa na primeira ocorrência. Blocos interativos declaram um componente registrado em `js/aulas/interativos/indice.js`; o componente é importado e montado apenas quando entra na área visível. Experimentos dos laboratórios podem ser reutilizados como componentes de aula por meio de `adaptador.js`.

`gerar.py` lê os conteúdos e gera as páginas estáticas, o catálogo com conceitos e relações e o índice de busca.

## Exercícios e progresso

`js/exercicios/motor.js` registra os tipos de exercício (múltipla escolha, verdadeiro ou falso, numérica com faixas de erro comentadas, lacunas, ordenação, associação, identificação de erro, programação visual, problema em etapas, interpretação, resposta aberta com critérios e construção de gráfico). Cada tentativa é registrada com acerto, dica usada e tempo. `js/progresso/registro.js` guarda o progresso por aula, aplica os critérios de conclusão (todos os exercícios tentados, pelo menos 70% de acerto e prática registrada), concede XP segundo as regras fixas de `perfil.js` e cria os cartões de revisão.

Os estados de domínio por aula (`js/jornadas/estados.js`) derivam de dados reais: não estudada, em aprendizagem, precisa de revisão e domínio demonstrado. A repetição espaçada (`js/revisoes/agendador.js`) adapta o SM-2: qualidade abaixo de 3 reinicia o intervalo; os primeiros intervalos são 1 e 6 dias; depois multiplicam-se pelo fator de facilidade, limitado a 1,3 no mínimo. Não há aleatoriedade nem modelo de linguagem.

## Laboratórios e projetos

Cada laboratório exporta uma `definicao` com experimentos que montam a simulação numa área, expõem o estado, guardam e restauram esse estado, e definem atividade guiada e desafio verificados pelo estado real. Os projetos seguem contrato semelhante, com critérios verificáveis pelo próprio projeto e critérios manuais declarados como tais. O código do usuário em NÚCLEO e no projeto da calculadora roda em um `iframe` isolado (`sandbox="allow-scripts"`) com `Worker` e tempo limite; a prévia da página web usa `iframe` isolado com `srcdoc`.

## Armazenamento

`js/armazenamento/banco.js` abre o IndexedDB `noesis` com os depósitos de progresso, tentativas, revisões, anotações, acervo, coleções, projetos, laboratórios, descobertas, atividades e metadados, com reserva em memória quando indisponível. O perfil fica em `localStorage`. Exportação, importação com validação e exclusão completa estão em Configurações. A comunidade é local: não há outros usuários, publicação nem envio de dados.

## Pesquisa e exploração

O índice de busca contém disciplinas, aulas, conceitos, laboratórios, projetos e ambientes. A pontuação (`js/ambientes/pesquisa.js`) normaliza acentos, pondera correspondências no título, no início de palavras e no texto, e inclui anotações e descobertas locais. O mapa do conhecimento (`js/exploracao/grafo.js`) é um grafo de forças em canvas, com lista alternativa navegável por teclado, construído a partir das relações declaradas nas aulas.

## Desempenho e acessibilidade

Carregamento sob demanda de ambientes, estilos, componentes interativos, laboratórios e projetos; telas em canvas com proporção de pixels do dispositivo e redesenho apenas quando a largura muda; animações com `requestAnimationFrame` que param quando a aba fica oculta ou quando o movimento reduzido está ativo. Regiões anunciadas, foco gerenciado nas trocas de ambiente, textos alternativos para visualizações, controles com rótulos e atalhos de teclado na pesquisa. Um service worker guarda em cache as páginas e os módulos já visitados (registrado apenas em HTTPS).

## Limites

As simulações usam modelos simplificados, declarados em cada experimento. As verificações de texto nos componentes de escrita são superficiais e servem como apoio à releitura, não como avaliação. Dados históricos e científicos citados são de conhecimento público; exemplos marcados como hipotéticos não são fontes.
