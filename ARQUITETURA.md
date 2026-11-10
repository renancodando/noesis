# Cena e interações

Um único renderizador Three.js compõe dois planos: ambiente fotográfico com água e vegetação animadas por shader, e cena ortográfica com cristal, oito domínios e anéis independentes. O plano de fundo não contém texto, esferas ou controles. As legendas e os alvos de interação são HTML; o mapa é SVG acessível.

A cena orbital usa coordenadas de tela convertidas em um espaço de 13 × 6 unidades. A câmera fica estável; o ponteiro produz uma mudança pequena de perspectiva apenas em dispositivos com mouse. As esferas mantêm posições fixas para não trocar o alvo sob o ponteiro. Seleção, foco e ativação são independentes da animação.

Cada esfera tem geometria e movimento próprios. Há um relógio comum, limite de resolução e quadros, pausa em abas ocultas, movimento reduzido e qualidade ajustável. Sem WebGL, o fundo permanece e a cena é substituída por uma composição SVG com os mesmos controles e conteúdos.

As expedições abrem experiências locais na mesma tela. As atividades alteram o progresso local quando concluídas. O armazenamento é opcional e protegido contra indisponibilidade. Nenhum dado sai do navegador. Não há cadastro, autenticação, banco ou serviço externo.

Validação focada: carregamento do cenário, alvos orbitais, cristal, menus, busca, expedições, missão e mapa; enquadramentos desktop e celular. As partículas são ambientais e não representam métricas ou pessoas.
