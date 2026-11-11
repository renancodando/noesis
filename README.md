# NÓESIS

Um Universo de Aprendizagem Interativa.

Primeira tela de uma plataforma educacional, inspirada na biblioteca monumental da referência. A arquitetura é uma imagem separada. O cristal, as oito disciplinas, as órbitas e os anéis são objetos 3D reais; textos, painéis e controles são HTML. O mapa de conhecimento é SVG interativo.

## Abrir o projeto

```sh
python3 -m http.server 3000
```

Abra `http://localhost:3000`. Não há instalação de dependências, compilação, cadastro, servidor de aplicação ou banco. A biblioteca Three.js e sua licença estão incluídas em `bibliotecas/`. A pasta pode ser publicada diretamente em hospedagem estática.

## Organização

- `index.html`: primeira tela, rótulos, painel de jornada e controles acessíveis.
- `estilos.css`: composição, ornamentos, animações e responsividade.
- `interface.js`: conteúdos contextuais, mapa, expedições, preferências e progresso local.
- `universo.js`: renderização Three.js, shaders ambientais e geometrias das disciplinas.
- `materiais.js`: reflexos arquitetônicos, texturas de materiais e ruído natural compartilhado.
- `dados.js`: nomes, perguntas e conexões dos conhecimentos.
- `gerar.py`: fonte dos modelos HTML. Execute `python3 gerar.py` após alterá-los.
- `ativos/simbolo.svg`: símbolo independente da marca.
- `ARQUITETURA.md`: decisões da cena e limites de execução.

## O que funciona

Todos os menus abrem conteúdos dentro da própria tela. Há busca, agenda local, nome de explorador editável, acervo de expedições, reflexões pessoais, conquistas e preferências de leitura. As oito disciplinas têm conexões navegáveis; o cristal apresenta o conceito da plataforma.

INTERIOR ajusta o pulso cardíaco. PRISMA explora pH. NÚCLEO permite fechar um circuito e cumprir a missão. CRONO percorre marcos históricos. As conclusões e descobertas atualizam XP e conquistas sem conceder recompensas repetidas pela mesma ação.

As informações são guardadas apenas no navegador com `localStorage`, quando disponível. Não há publicação de reflexões, comunicação com outras pessoas, autenticação ou chamadas a serviços externos. As atividades são experiências introdutórias.

## Movimento e acessibilidade

Um contexto WebGL reúne o cenário e o universo. A cachoeira combina correntes descendentes em várias escalas, filetes, espuma, névoa e reflexos; a vegetação tem fases de movimento diferentes e as luzes variam suavemente. A plataforma tem anéis independentes. As disciplinas têm geometrias e animações próprias. A iluminação combina reflexos frios da abertura exterior e luz quente das lanternas. Há vidro com reflexos, quartzo com refração e dispersão, metais com marcas superficiais, colunas caneladas, camadas de papel e terreno com neve e vegetação.

Há qualidade econômica, equilibrada e alta, pausa explícita, respeito a `prefers-reduced-motion`, contraste reforçado, texto ampliado e pausa em abas ocultas. Sem WebGL, a composição de reserva mantém o cenário, os oito mundos, os rótulos e todas as interações em HTML/SVG. Os elementos focais são renderizados por um único mecanismo de cada vez.

Os nomes e o XP inicial reproduzem o perfil de exemplo da referência. Não representam uma conta autenticada.

A textura da Terra foi obtida do exemplo público `earth-blue-marble.jpg` de Three Globe (https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg). Os arquivos visuais usados na página estão otimizados em WebP; as imagens originais de geração não são necessárias para executar o projeto.
