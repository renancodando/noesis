# Cena e interações

Um único renderizador Three.js compõe dois planos: ambiente fotográfico com água e vegetação animadas por shader, e cena ortográfica com cristal, oito domínios e anéis independentes. O plano de fundo não contém texto, esferas ou controles. As legendas e os alvos de interação são HTML; o mapa é SVG acessível.

A cena orbital usa coordenadas de tela convertidas em um espaço de 13 × 6 unidades. A câmera fica estável; o ponteiro produz uma mudança pequena de perspectiva apenas em dispositivos com mouse. As esferas mantêm posições fixas para não trocar o alvo sob o ponteiro. Seleção, foco e ativação são independentes da animação.

Cada esfera tem geometria e movimento próprios. Um ambiente de reflexão pré-calculado reproduz a abertura azul do exterior e as fontes quentes da biblioteca. Vidro, quartzo e metal usam materiais físicos; mármore, bronze e papel recebem texturas procedurais locais. O relevo da Geografia tem cristas, neve e árvores, enquanto o templo combina degraus, frontão e colunas caneladas. Há um relógio comum, limite de resolução e quadros, pausa em abas ocultas, movimento reduzido e qualidade ajustável. O ambiente de reflexão e as texturas são calculados uma única vez; árvores e peças repetidas usam instâncias. A refração usa resolução proporcional à preferência de qualidade. Sem WebGL, o fundo permanece e a cena é substituída por uma composição SVG com os mesmos controles e conteúdos.

As expedições abrem experiências locais na mesma tela. As atividades alteram o progresso local quando concluídas. O armazenamento é opcional e protegido contra indisponibilidade. Nenhum dado sai do navegador. Não há cadastro, autenticação, banco ou serviço externo.

Validação focada: carregamento do cenário, alvos orbitais, cristal, menus, busca, expedições, missão e mapa; enquadramentos desktop e celular. As partículas são ambientais e não representam métricas ou pessoas.
