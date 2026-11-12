# NÓESIS

Um Universo de Aprendizagem Interativa.

Plataforma educacional completa que funciona inteiramente no navegador: oito disciplinas com aulas interativas, jornadas com pré-requisitos, laboratórios com simulações reais, projetos práticos, repetição espaçada, mapa do conhecimento, acervo pessoal, comunidade local e pesquisa global. Não há cadastro, servidor de aplicação, banco remoto, API paga ou inteligência artificial em tempo de execução. Todo o progresso fica no próprio navegador e pode ser exportado, importado ou apagado.

## Abrir o projeto

```sh
python3 -m http.server 3000
```

Abra `http://localhost:3000`. Não há instalação de dependências nem etapa de compilação. A biblioteca Three.js e sua licença estão em `bibliotecas/`. A pasta inteira pode ser publicada em hospedagem estática (Vercel, Netlify, GitHub Pages ou qualquer servidor de arquivos): cada rota tem sua própria página `index.html` pré-renderizada e `404.html` cobre endereços inexistentes.

Depois de alterar conteúdos em `conteudos/` ou os modelos em `gerar.py`, execute:

```sh
python3 gerar.py
```

O script regenera as páginas estáticas de todas as rotas, o catálogo (`conteudos/catalogo.json`), o índice de busca (`conteudos/busca.json`) e a folha de ícones (`ativos/icones.svg`).

## Ambientes

| Rota | Ambiente | O que faz |
| --- | --- | --- |
| `/` | Santuário | Primeira tela cinematográfica com a cena Three.js, as oito disciplinas em órbita, missão do dia, conquistas, notificações e preferências. Preservada integralmente. |
| `/jornadas` | Jornadas | Trilhas por disciplina com pré-requisitos, ramificações para laboratórios e projetos e estados de domínio por aula. |
| `/saberes` | Saberes | Catálogo de disciplinas e aulas. Cada aula segue Compreender → Explorar → Experimentar → Resolver → Aplicar → Revisar. |
| `/laboratorios` | Laboratórios | PRISMA (química), AXIOMA (matemática), NÚCLEO (computação), INTERIOR (corpo humano), CRONO (história) e ATELIÊ (artes), cada um com experimentos, atividade guiada e desafio. |
| `/construir` | Construir | Seis projetos: calculadora, ponte, circuito, composição visual, investigação histórica e página web, com critérios verificáveis. |
| `/revisoes` | Revisões | Repetição espaçada determinística com cartões gerados ao concluir aulas. |
| `/exploracao` | Exploração | Mapa do conhecimento: grafo navegável de conceitos, aulas e laboratórios. |
| `/minha-jornada` | Minha Jornada | Painel de progresso real: aulas, exercícios, laboratórios, projetos, revisões e sequência de dias. |
| `/acervo` | Acervo | Anotações, itens salvos e coleções pessoais. |
| `/comunidade` | Comunidade | Reflexões, desafios e registros guardados apenas localmente; não há outros usuários nem publicação. |
| `/pesquisa` | Pesquisa | Busca global com normalização de acentos, pontuação por relevância e navegação por teclado. |
| `/configuracoes` | Configurações | Preferências de leitura, movimento e qualidade; exportação, importação e exclusão dos dados. |

## Conteúdo

Oito disciplinas (Ciências Exatas, Ciências da Vida, Humanidades, Tecnologia, Geografia, Sociedade, Artes e Linguagens) com 41 aulas em `conteudos/<disciplina>/<aula>.json`. Cada aula declara objetivos, pré-requisitos, conceitos, blocos de leitura e componentes interativos, seis exercícios de tipos variados com feedback e dicas, uma prática verificável, cartões de revisão e materiais relacionados. O índice das disciplinas e das jornadas está em `conteudos/indice.json`; laboratórios e projetos, em `conteudos/laboratorios.json` e `conteudos/projetos.json`.

Os textos foram escritos para esta plataforma. Dados históricos e científicos citados são de conhecimento público; exemplos marcados como hipotéticos ou ilustrativos não devem ser lidos como fontes.

## Progresso e dados

O perfil (nome, XP, preferências, missão, agenda) fica em `localStorage`; aulas, tentativas, revisões, anotações, acervo, projetos, laboratórios e descobertas ficam em IndexedDB, com reserva em memória quando o armazenamento não está disponível. Nenhum dado sai do navegador. O perfil de demonstração, quando ativado em Configurações, é marcado explicitamente como tal.

XP, níveis e conquistas seguem regras fixas e verificáveis (`js/progresso/perfil.js`). Uma aula é concluída quando todos os exercícios foram tentados, pelo menos 70% foram acertados e a prática foi registrada; a conclusão gera cartões de revisão agendados por uma adaptação do algoritmo SM-2 (`js/revisoes/agendador.js`).

## Organização

- `index.html`, `404.html` e as pastas de rotas: páginas estáticas geradas por `gerar.py`, todas com a marcação do Santuário e o conteúdo pré-renderizado do ambiente.
- `css/santuario.css`: cena, ornamentos e responsividade da primeira tela. `css/ambientes.css` e `css/ambientes/*.css`: estilos compartilhados e de cada ambiente.
- `js/principal.js`: ponto de entrada. `js/navegacao/rotas.js`: roteador com carregamento dinâmico de ambientes e estilos.
- `js/santuario/`: cena Three.js (`universo.js`, `materiais.js`), interface da primeira tela (`interface.js`) e dados das disciplinas (`dados.js`).
- `js/ambientes/`: um módulo por ambiente, com contrato `montar({raiz, parametros, consulta, definirTitulo, navegar})`.
- `js/aulas/`: renderizador dos blocos de aula e componentes interativos (`interativos/`), com registro em `interativos/indice.js`.
- `js/exercicios/motor.js`: doze tipos de exercício com verificação, dicas e registro de tentativas.
- `js/laboratorios/` e `js/projetos/`: simulações e projetos com estado, atividade guiada, desafio e critérios.
- `js/progresso/`, `js/revisoes/`, `js/jornadas/`, `js/exploracao/`, `js/armazenamento/`, `js/conteudos/`, `js/utilitarios/`: regras de progresso, repetição espaçada, estados de domínio, grafo, persistência, carregamento de conteúdo e utilitários.
- `sw.js` e `manifesto.webmanifest`: cache de leitura para uso sem conexão e instalação como aplicativo (registrados apenas em HTTPS).
- `ARQUITETURA.md`: decisões técnicas e limites.

## Acessibilidade e desempenho

Navegação por teclado em todos os ambientes, foco visível, regiões anunciadas, textos alternativos para visualizações em canvas, `prefers-reduced-motion`, contraste reforçado e texto ampliado. Os módulos de cada ambiente, os componentes interativos, os laboratórios e os projetos são carregados sob demanda; a cena Three.js só é iniciada no Santuário e pausa quando a aba fica oculta.

## Créditos de terceiros

Three.js é distribuída sob a licença MIT (`bibliotecas/LICENCA-THREE.txt`). A textura da Terra foi obtida do exemplo público `earth-blue-marble.jpg` de Three Globe (https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg). Os arquivos visuais estão otimizados em WebP.

Projeto de Renan (renancodando).
