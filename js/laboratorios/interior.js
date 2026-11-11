// Renan | renancodando
import {criarTela,grupoControles,botoesOpcoes,painelExplicacao,textoAlternativo,animador,movimentoReduzido,paleta,formatarNumero,criar,buscar,buscarTodos,escapar} from '../aulas/interativos/base.js';

const ORGAOS=[
 {id:'cerebro',nome:'Cérebro',sistema:'nervoso',forma:'<ellipse cx="100" cy="42" rx="26" ry="22"/>',cor:'#d9a7c7',funcao:'Centro de processamento do sistema nervoso: integra informações sensoriais, coordena movimentos, regula funções vitais e sustenta memória, linguagem e raciocínio.',relacoes:['Depende de fluxo sanguíneo constante: recebe cerca de um quinto do sangue bombeado em repouso.','Regula a frequência respiratória pelo tronco encefálico, a partir da concentração de CO₂ no sangue.'],escala:'Cerca de 1,3 a 1,4 kg em adultos, com dezenas de bilhões de neurônios.'},
 {id:'traqueia',nome:'Traqueia',sistema:'respiratorio',forma:'<rect x="94" y="80" width="12" height="40" rx="5"/>',cor:'#9fd8ff',funcao:'Tubo sustentado por anéis de cartilagem que conduz o ar da laringe aos brônquios.',relacoes:['Ramifica-se em brônquios, bronquíolos e alvéolos, onde ocorre a troca gasosa.'],escala:'Cerca de 10 a 12 cm de comprimento.'},
 {id:'pulmoes',nome:'Pulmões',sistema:'respiratorio',forma:'<path d="M92 118c-26 4-40 36-38 74 2 22 20 30 34 22 8-5 6-30 6-50Z"/><path d="M108 118c26 4 40 36 38 74-2 22-20 30-34 22-8-5-6-30-6-50Z"/>',cor:'#86b4d8',funcao:'Órgãos esponjosos onde o oxigênio do ar passa para o sangue e o gás carbônico faz o caminho inverso, nos alvéolos.',relacoes:['Recebem todo o sangue bombeado pelo lado direito do coração.','A ventilação é controlada pelo sistema nervoso conforme o CO₂ no sangue.'],escala:'Centenas de milhões de alvéolos somam uma superfície de troca de dezenas de metros quadrados.'},
 {id:'coracao',nome:'Coração',sistema:'circulatorio',forma:'<path d="M100 134c-8-12-28-10-28 6 0 16 20 28 28 38 8-10 28-22 28-38 0-16-20-18-28-6Z"/>',cor:'#d47a72',funcao:'Bomba muscular com quatro câmaras. O lado direito envia sangue aos pulmões; o lado esquerdo envia sangue oxigenado ao resto do corpo.',relacoes:['Trabalha em par com os pulmões na circulação pulmonar.','O volume bombeado por minuto (débito cardíaco) ajusta-se à demanda dos músculos e órgãos.'],escala:'Bate cerca de 100 mil vezes por dia em repouso.'},
 {id:'figado',nome:'Fígado',sistema:'digestorio',forma:'<path d="M62 196c10-14 46-14 60-6 6 4 4 20-6 24-26 8-50 2-54-18Z"/>',cor:'#b86a4a',funcao:'Maior glândula do corpo: produz bile, armazena glicogênio, processa nutrientes absorvidos no intestino e transforma substâncias tóxicas.',relacoes:['Recebe o sangue que vem do intestino pela veia porta, antes de ele seguir ao coração.','Regula a glicose no sangue em conjunto com o pâncreas.'],escala:'Cerca de 1,5 kg; fica na parte superior direita do abdome.'},
 {id:'estomago',nome:'Estômago',sistema:'digestorio',forma:'<path d="M126 192c16 0 22 16 14 30-8 12-26 14-36 8-10-6-10-22 0-30 6-6 14-8 22-8Z"/>',cor:'#e0a85a',funcao:'Bolsa muscular que mistura o alimento com suco gástrico ácido, iniciando a digestão de proteínas.',relacoes:['Entrega o conteúdo parcialmente digerido ao intestino delgado.','O ácido gástrico também ajuda a eliminar microrganismos.'],escala:'Pode se expandir para conter mais de um litro.'},
 {id:'rins',nome:'Rins',sistema:'urinario',forma:'<ellipse cx="72" cy="236" rx="9" ry="15"/><ellipse cx="128" cy="236" rx="9" ry="15"/>',cor:'#a48be0',funcao:'Filtram o sangue, removem resíduos do metabolismo e regulam água, sais e pressão arterial, produzindo a urina.',relacoes:['Recebem cerca de um quinto do débito cardíaco.','Interagem com o sistema circulatório no controle da pressão.'],escala:'Filtram cerca de 180 litros de plasma por dia; quase tudo é reabsorvido.'},
 {id:'intestinos',nome:'Intestinos',sistema:'digestorio',forma:'<path d="M70 262c0-16 60-16 60 0s-60 16-60 32 60 16 60 32-60 16-60 0" fill="none" stroke-width="14" stroke-linecap="round"/>',cor:'#d9b06e',funcao:'O intestino delgado absorve a maior parte dos nutrientes; o intestino grosso absorve água e forma as fezes, com a participação da microbiota.',relacoes:['Os nutrientes absorvidos seguem ao fígado pela circulação.','Abriga trilhões de microrganismos que participam da digestão e da imunidade.'],escala:'O intestino delgado tem vários metros de comprimento, com vilosidades que ampliam a superfície de absorção.'},
 {id:'bexiga',nome:'Bexiga',sistema:'urinario',forma:'<ellipse cx="100" cy="346" rx="16" ry="12"/>',cor:'#8fd1c8',funcao:'Armazena a urina produzida pelos rins até a eliminação.',relacoes:['Recebe urina pelos ureteres; o esvaziamento é controlado pelo sistema nervoso.'],escala:'Comporta confortavelmente 300 a 500 mL.'}
];
const SISTEMAS={todos:'Todos',circulatorio:'Circulatório',respiratorio:'Respiratório',digestorio:'Digestório',nervoso:'Nervoso',urinario:'Urinário'};

const anatomia={
 id:'anatomia',nome:'Exploração anatômica',
 descricao:'Selecione órgãos em uma representação vetorial do tronco humano, leia suas funções e descubra como os sistemas dependem uns dos outros.',
 objetivos:['Localizar órgãos principais e associá-los a sistemas.','Descrever a função de cada órgão.','Identificar relações entre sistemas (circulação, respiração, digestão, excreção, controle nervoso).'],
 instrucoes:['Clique em um órgão (ou use Tab e Enter) para abrir sua ficha.','Filtre por sistema para destacar os órgãos correspondentes.','Leia as relações: cada órgão depende de outros.'],
 modelo:['Representação esquemática e simplificada, sem escala real nem todos os órgãos.','As posições são aproximadas; a ficha indica dados típicos de adultos.','Conteúdo educacional: não é um atlas clínico.'],
 montar(area,api){
  let sistema='todos',selecionado=null,vistos=new Set(api.estadoGuardado?.vistos||[]);
  const caixa=criar('div',{classe:'bancada'});area.append(caixa);
  const svg=criar('div',{html:`<svg class="corpo-svg tela" viewBox="0 0 200 380" role="group" aria-label="Representação esquemática do corpo humano" style="max-height:460px"><defs><radialGradient id="pele"><stop offset="0" stop-color="#2a3b47"/><stop offset="1" stop-color="#15242c"/></radialGradient></defs><circle cx="100" cy="42" r="30" fill="url(#pele)" stroke="#3f5563"/><path d="M60 92c-20 10-30 40-30 90v170c0 10 8 18 18 18h104c10 0 18-8 18-18V182c0-50-10-80-30-90Z" fill="url(#pele)" stroke="#3f5563"/>${ORGAOS.map(o=>`<g class="orgao" data-orgao="${o.id}" data-sistema="${o.sistema}" tabindex="0" role="button" aria-label="${o.nome}, sistema ${SISTEMAS[o.sistema].toLowerCase()}" fill="${o.cor}" stroke="#0b1a22" stroke-width="1">${o.forma.replace(/stroke-width="14"/,`stroke="${o.cor}" stroke-width="14"`)}</g>`).join('')}</svg>`});
  const painel=criar('div',{classe:'painel-orgao'});
  caixa.append(svg,painel);
  botoesOpcoes(area,Object.entries(SISTEMAS).map(([v,r])=>({valor:v,rotulo:r})),{selecionado:sistema,aoEscolher:v=>{sistema=v;aplicarFiltro();},rotulo:'Sistema'});
  const explicacao=painelExplicacao(area);
  function aplicarFiltro(){
   buscarTodos('.orgao',svg).forEach(g=>g.classList.toggle('apagado',sistema!=='todos'&&g.dataset.sistema!==sistema));
   const lista=ORGAOS.filter(o=>sistema==='todos'||o.sistema===sistema).map(o=>o.nome).join(', ');
   explicacao.definir(sistema==='todos'?`${ORGAOS.length} órgãos representados. Você já abriu ${vistos.size}.`:`Sistema <strong>${SISTEMAS[sistema]}</strong>: ${lista}.`);
   api.atualizar({sistema,selecionado,vistos:[...vistos]});
  }
  function selecionar(id){
   selecionado=id;vistos.add(id);
   buscarTodos('.orgao',svg).forEach(g=>g.classList.toggle('ativo',g.dataset.orgao===id));
   const o=ORGAOS.find(x=>x.id===id);
   painel.innerHTML=`<p class="sobretitulo">SISTEMA ${SISTEMAS[o.sistema].toUpperCase()}</p><h4>${o.nome}</h4><p>${o.funcao}</p><p class="rotulo-trilho">Relações com outros sistemas</p><ul class="lista-pontos compacta">${o.relacoes.map(r=>`<li>${r}</li>`).join('')}</ul><p class="nota-modelo">${o.escala}</p>`;
   api.guardar({vistos:[...vistos]});
   aplicarFiltro();
  }
  buscarTodos('.orgao',svg).forEach(g=>{g.onclick=()=>selecionar(g.dataset.orgao);g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selecionar(g.dataset.orgao);}};});
  painel.innerHTML='<p class="texto-apoio">Escolha um órgão para abrir sua ficha.</p>';
  aplicarFiltro();
  return {estado:()=>({sistema,selecionado,vistos:[...vistos]}),reiniciar(){sistema='todos';selecionado=null;buscarTodos('.orgao',svg).forEach(g=>g.classList.remove('ativo'));painel.innerHTML='<p class="texto-apoio">Escolha um órgão para abrir sua ficha.</p>';aplicarFiltro();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Abra a ficha do coração.',verificar:e=>e.vistos.includes('coracao')},
  {texto:'Filtre pelo sistema digestório e abra a ficha do fígado.',verificar:e=>e.vistos.includes('figado')},
  {texto:'Abra as fichas dos pulmões e dos rins e compare: os dois recebem grande parte do sangue bombeado.',verificar:e=>e.vistos.includes('pulmoes')&&e.vistos.includes('rins')}
 ]},
 desafio:{titulo:'Percurso completo',descricao:'Abra a ficha de <strong>todos os órgãos</strong> representados e identifique, em cada uma, pelo menos uma relação com o sistema circulatório.',verificar:e=>{const faltam=ORGAOS.filter(o=>!e.vistos.includes(o.id));return faltam.length?{ok:false,mensagem:`Faltam: ${faltam.map(o=>o.nome).join(', ')}.`}:{ok:true,mensagem:'Todos os órgãos visitados. Note como quase todas as fichas mencionam o sangue: a circulação conecta os sistemas.'};}}
};

const circulacao={
 id:'circulacao',nome:'Circulação simplificada',
 descricao:'Ajuste a frequência cardíaca e o nível de atividade. O modelo calcula o débito cardíaco e compara a oferta de oxigênio com a demanda dos tecidos.',
 objetivos:['Relacionar frequência cardíaca, volume sistólico e débito cardíaco.','Entender por que o coração acelera durante o esforço.','Interpretar oferta e demanda de oxigênio em um modelo simples.'],
 instrucoes:['Escolha o nível de atividade: a demanda de oxigênio muda.','Ajuste a frequência cardíaca até que a oferta cubra a demanda.','Observe o volume sistólico, que o modelo aumenta com o esforço.'],
 modelo:['Débito cardíaco = frequência × volume sistólico; o volume sistólico varia de 70 mL (repouso) a 100 mL (esforço intenso).','Conteúdo arterial de O₂ fixo em 200 mL por litro de sangue.','Extração de O₂ pelos tecidos: 25% em repouso, até 75% em esforço intenso.','Demandas típicas de um adulto: repouso 250 mL/min, caminhada 700 mL/min, corrida 1800 mL/min. Valores ilustrativos, não clínicos.'],
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:260,descricao:'Esquema da circulação com coração e dois circuitos'});
  const atividades={repouso:{nome:'Repouso',demanda:250,vs:70,extracao:.25},caminhada:{nome:'Caminhada',demanda:700,vs:85,extracao:.5},corrida:{nome:'Corrida',demanda:1800,vs:100,extracao:.75}};
  let atividade='repouso',fase=0;
  const opcoes=botoesOpcoes(area,Object.entries(atividades).map(([v,a])=>({valor:v,rotulo:a.nome})),{selecionado:atividade,aoEscolher:v=>{atividade=v;atualizar();},rotulo:'Atividade'});
  const controles=grupoControles(area,[{chave:'fc',rotulo:'Frequência cardíaca',min:40,max:190,passo:1,valor:70,unidade:'bpm',aoMudar:atualizar}]);
  const caixa=criar('div',{classe:'leitura-laboratorio'});area.append(caixa);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  let estado={};
  function calcular(){const a=atividades[atividade];const fc=controles.fc.valor;const dc=fc*a.vs/1000;const oferta=dc*200*a.extracao;return {atividade,fc,vs:a.vs,debito:dc,oferta,demanda:a.demanda,razao:oferta/a.demanda,atende:oferta>=a.demanda};}
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);const e=estado;
   const cx=L/2,cy=A/2,batida=1+Math.max(0,Math.sin(fase*Math.PI*2))*.08;
   const circuito=(x,r,cor,rotulo)=>{c.strokeStyle=cor;c.lineWidth=10;c.beginPath();c.ellipse(x,cy,r,A*.33,0,0,7);c.stroke();c.fillStyle='#e8dcc0';c.font='12px Georgia';c.textAlign='center';c.fillText(rotulo,x,cy-A*.33-8);};
   circuito(cx-130,110,'#3c6c8a','Circuito pulmonar (pulmões)');circuito(cx+130,110,'#8a3c3c','Circuito sistêmico (corpo)');
   const n=Math.max(6,Math.round(e.debito*2));for(let k=0;k<n;k++){const t=(k/n+fase*.25)%1;[[cx-130,'#9fd8ff',1],[cx+130,'#f09a93',-1]].forEach(([x,cor,s])=>{const ang=t*Math.PI*2*s;c.fillStyle=cor;c.beginPath();c.arc(x+Math.cos(ang)*110,cy+Math.sin(ang)*A*.33,3,0,7);c.fill();});}
   c.save();c.translate(cx,cy);c.scale(batida,batida);c.fillStyle='#d47a72';c.beginPath();c.moveTo(0,-14);c.bezierCurveTo(-30,-44,-60,-4,0,36);c.bezierCurveTo(60,-4,30,-44,0,-14);c.fill();c.restore();
   c.fillStyle='#e8dcc0';c.font='500 13px Georgia';c.textAlign='center';c.fillText(`${e.fc} bpm · ${formatarNumero(e.debito,1)} L/min`,cx,cy+60);
   const barra=(y,rotulo,valor,max,cor)=>{c.fillStyle='#132a36';c.fillRect(20,y,L-40,10);c.fillStyle=cor;c.fillRect(20,y,(L-40)*Math.min(1,valor/max),10);c.fillStyle='#a9bcc2';c.font='10px Arial';c.textAlign='left';c.fillText(`${rotulo}: ${formatarNumero(valor)} mL O₂/min`,20,y-3);};
   barra(A-32,'Oferta de O₂',e.oferta,2400,e.atende?'#7fc3a4':'#e0a85a');barra(A-8,'Demanda de O₂',e.demanda,2400,'#86b4d8');
  }
  const anim=animador(delta=>{fase=(fase+delta*estado.fc/60)%1;desenhar();});
  function atualizar(){
   estado=calcular();
   caixa.innerHTML=`<div><small>Volume sistólico</small><strong>${estado.vs}<small>mL</small></strong></div><div><small>Débito cardíaco</small><strong>${formatarNumero(estado.debito,1)}<small>L/min</small></strong></div><div><small>Oferta de O₂</small><strong>${formatarNumero(estado.oferta)}<small>mL/min</small></strong></div><div><small>Demanda</small><strong>${formatarNumero(estado.demanda)}<small>mL/min</small></strong></div>`;
   explicacao.definir(`<strong>Débito cardíaco = ${estado.fc} × ${estado.vs} mL = ${formatarNumero(estado.debito,1)} L/min.</strong> Com extração de ${Math.round(atividades[atividade].extracao*100)}% do oxigênio arterial, a oferta é ${formatarNumero(estado.oferta)} mL/min para uma demanda de ${estado.demanda} mL/min: ${estado.atende?'os tecidos estão supridos':'há déficit, o corpo tenderia a acelerar o coração e a respiração'}${estado.razao>2&&atividade==='repouso'?'. Em repouso, uma frequência tão alta seria desnecessária e o organismo a reduziria':''}.`);
   alternativo(`Atividade ${atividades[atividade].nome}, ${estado.fc} batimentos por minuto, débito ${formatarNumero(estado.debito,1)} litros por minuto, oferta ${formatarNumero(estado.oferta)} e demanda ${estado.demanda} mililitros de oxigênio por minuto.`);
   api.atualizar(estado);
   if(movimentoReduzido()){anim.parar();desenhar();}else anim.iniciar();
  }
  tela.tela.addEventListener('redimensionar',desenhar);
  atualizar();
  return {estado:()=>estado,reiniciar(){atividade='repouso';opcoes.selecionar('repouso');controles.fc.valor=70;atualizar();},limpar(){anim.parar();tela.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Em repouso, com 70 bpm, confira que o débito cardíaco fica perto de 5 L/min e a oferta cobre a demanda.',verificar:e=>e.atividade==='repouso'&&e.fc>=65&&e.fc<=75&&e.atende},
  {texto:'Mude para corrida sem alterar a frequência: a demanda salta e aparece déficit.',verificar:e=>e.atividade==='corrida'&&!e.atende},
  {texto:'Aumente a frequência cardíaca até a oferta cobrir a demanda da corrida.',verificar:e=>e.atividade==='corrida'&&e.atende}
 ]},
 desafio:{titulo:'Suprir a corrida com economia',descricao:'Na <strong>corrida</strong>, encontre a <strong>menor frequência cardíaca inteira</strong> que ainda cobre a demanda de oxigênio. A resposta correta está entre 118 e 122 bpm.',verificar:e=>{if(e.atividade!=='corrida')return {ok:false,mensagem:'Selecione corrida.'};if(!e.atende)return {ok:false,mensagem:`Com ${e.fc} bpm a oferta (${formatarNumero(e.oferta)}) ainda é menor que a demanda.`};const ok=e.fc<=122;return {ok,mensagem:ok?`${e.fc} bpm × 100 mL = ${formatarNumero(e.debito,1)} L/min, suficiente com extração de 75%.`:`${e.fc} bpm atende, mas há margem para reduzir. Calcule: demanda ÷ (0,2 × 0,75) dá o débito mínimo.`};}}
};

const respiracao={
 id:'respiracao',nome:'Ventilação pulmonar',
 descricao:'Combine frequência respiratória e volume de cada respiração. O modelo desconta o espaço morto e calcula quanto ar realmente chega aos alvéolos.',
 objetivos:['Diferenciar ventilação total de ventilação alveolar.','Perceber o custo de respirações rápidas e rasas.','Relacionar ventilação alveolar e eliminação de CO₂.'],
 instrucoes:['Ajuste a frequência respiratória e o volume corrente.','Compare a ventilação total com a alveolar.','Tente atingir a mesma ventilação alveolar com estratégias diferentes.'],
 modelo:['Espaço morto anatômico fixo de 150 mL por respiração (ar que não chega aos alvéolos).','Ventilação alveolar = frequência × (volume corrente − 150 mL).','A pressão de CO₂ é estimada em proporção inversa à ventilação alveolar, com 40 mmHg para 4,2 L/min em repouso. Estimativa didática, não fisiológica completa.'],
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:220,descricao:'Pulmões expandindo e contraindo no ritmo escolhido'});
  let fase=0,estado={};
  const controles=grupoControles(area,[{chave:'fr',rotulo:'Frequência respiratória',min:6,max:40,passo:1,valor:12,unidade:'/min',aoMudar:atualizar},{chave:'vc',rotulo:'Volume corrente',min:200,max:1500,passo:50,valor:500,unidade:'mL',aoMudar:atualizar}]);
  const caixa=criar('div',{classe:'leitura-laboratorio'});area.append(caixa);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  function calcular(){const fr=controles.fr.valor,vc=controles.vc.valor;const total=fr*vc/1000,alveolar=fr*Math.max(0,vc-150)/1000;const co2=Math.min(90,Math.max(15,40*4.2/Math.max(.3,alveolar)));return {fr,vc,total,alveolar,eficiencia:total?alveolar/total:0,co2};}
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);const e=estado;
   const resp=.5-.5*Math.cos(fase*Math.PI*2);const escala=.85+resp*.25*(e.vc/1000);
   [-1,1].forEach(s=>{c.save();c.translate(L/2+s*60,A/2+10);c.scale(escala,escala);c.fillStyle='#3c6c8a';c.strokeStyle='#86b4d8';c.lineWidth=2;c.beginPath();c.moveTo(0,-60);c.bezierCurveTo(s*10,-60,s*60,-30,s*55,40);c.bezierCurveTo(s*50,70,s*10,70,0,50);c.closePath();c.fill();c.stroke();c.restore();});
   c.strokeStyle='#9fd8ff';c.lineWidth=6;c.beginPath();c.moveTo(L/2,20);c.lineTo(L/2,A/2-40);c.stroke();
   c.fillStyle='#e8dcc0';c.font='12px Georgia';c.textAlign='left';c.fillText(`${e.fr} respirações/min · ${e.vc} mL cada`,14,20);
   c.fillStyle='#a9bcc2';c.font='11px Arial';c.textAlign='right';c.fillText(`espaço morto: 150 mL por respiração`,L-14,A-12);
  }
  const anim=animador(delta=>{fase=(fase+delta*estado.fr/60)%1;desenhar();});
  function atualizar(){
   estado=calcular();
   caixa.innerHTML=`<div><small>Ventilação total</small><strong>${formatarNumero(estado.total,1)}<small>L/min</small></strong></div><div><small>Ventilação alveolar</small><strong>${formatarNumero(estado.alveolar,1)}<small>L/min</small></strong></div><div><small>Aproveitamento</small><strong>${Math.round(estado.eficiencia*100)}<small>%</small></strong></div><div><small>CO₂ estimado</small><strong>${formatarNumero(estado.co2,0)}<small>mmHg</small></strong></div>`;
   explicacao.definir(`<strong>Ventilação alveolar = ${estado.fr} × (${estado.vc} − 150) mL = ${formatarNumero(estado.alveolar,1)} L/min.</strong> ${estado.vc<=300?'Respirações muito rasas desperdiçam quase tudo no espaço morto: aumentar a frequência não compensa.':estado.eficiencia>.8?'Respirações profundas aproveitam bem cada ciclo.':'Parte de cada respiração fica nas vias aéreas sem trocar gases.'} ${estado.co2>45?'Com ventilação alveolar baixa, o CO₂ se acumula e o centro respiratório comandaria respirar mais.':estado.co2<35?'Ventilação alveolar alta elimina CO₂ além do necessário (hiperventilação).':'O CO₂ fica na faixa de repouso.'}`);
   alternativo(`${estado.fr} respirações por minuto com ${estado.vc} mililitros: ventilação total ${formatarNumero(estado.total,1)} e alveolar ${formatarNumero(estado.alveolar,1)} litros por minuto.`);
   api.atualizar(estado);
   if(movimentoReduzido()){anim.parar();desenhar();}else anim.iniciar();
  }
  tela.tela.addEventListener('redimensionar',desenhar);
  atualizar();
  return {estado:()=>estado,reiniciar(){controles.fr.valor=12;controles.vc.valor=500;atualizar();},limpar(){anim.parar();tela.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Com 12 respirações/min e 500 mL, confira a ventilação alveolar de 4,2 L/min.',verificar:e=>e.fr===12&&e.vc===500},
  {texto:'Dobre a frequência (24/min) e reduza o volume para 250 mL: a ventilação total é igual, mas a alveolar cai pela metade.',verificar:e=>e.fr===24&&e.vc===250},
  {texto:'Volte a 12/min e aumente o volume para 1000 mL: compare a eficiência.',verificar:e=>e.fr===12&&e.vc===1000}
 ]},
 desafio:{titulo:'Ventilar com calma',descricao:'Obtenha ventilação alveolar de pelo menos <strong>10 L/min</strong> com frequência de <strong>no máximo 16 respirações/min</strong>.',verificar:e=>{if(e.fr>16)return {ok:false,mensagem:`Frequência ${e.fr}/min; o limite é 16.`};const ok=e.alveolar>=10;return {ok,mensagem:ok?`${e.fr} × (${e.vc} − 150) = ${formatarNumero(e.alveolar,1)} L/min.`:`Ventilação alveolar ${formatarNumero(e.alveolar,1)} L/min. Aumente o volume corrente.`};}}
};

export const definicao={titulo:'Corpo humano',descricao:'Uma representação anatômica para explorar órgãos e sistemas, e dois modelos simplificados de circulação e ventilação em que você ajusta parâmetros e lê consequências calculadas.',experimentos:[anatomia,circulacao,respiracao]};
