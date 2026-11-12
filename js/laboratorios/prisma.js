// Renan | renancodando
import {criarTela,grupoControles,botoesOpcoes,painelExplicacao,textoAlternativo,animador,movimentoReduzido,eixos,tracarCurva,paleta,formatarNumero,criar,buscar} from '../aulas/interativos/base.js';

function leitura(area,campos){
 const caixa=criar('div',{classe:'leitura-laboratorio'});
 const saidas={};
 campos.forEach(([chave,rotulo,unidade])=>{const item=criar('div',{html:`<small>${rotulo}</small><strong><span data-valor>—</span>${unidade?`<small>${unidade}</small>`:''}</strong>`});saidas[chave]=buscar('[data-valor]',item);caixa.append(item);});
 area.append(caixa);
 return (valores)=>Object.entries(valores).forEach(([chave,valor])=>{if(saidas[chave])saidas[chave].textContent=valor;});
}

const circuitos={
 id:'circuitos',nome:'Circuitos elétricos',
 descricao:'Uma fonte, resistores e um interruptor. A corrente é calculada pela Lei de Ohm sobre a resistência equivalente do arranjo escolhido.',
 objetivos:['Relacionar tensão, resistência e corrente (I = V/R).','Comparar a resistência equivalente em série e em paralelo.','Interpretar potência dissipada como brilho das lâmpadas.'],
 instrucoes:['Feche o interruptor para permitir a passagem de corrente.','Altere a tensão e a resistência e acompanhe a corrente no visor.','Troque o arranjo entre simples, série e paralelo e compare as leituras.'],
 modelo:['Fios ideais, sem resistência.','Fonte ideal: a tensão não cai com a corrente.','Os resistores representam lâmpadas de resistência constante; na prática o filamento aquece e a resistência aumenta.','A corrente é calculada como estacionária: não há efeitos transitórios.'],
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:300,descricao:'Esquema do circuito com fonte, interruptor e resistores'});
  let modo='simples',fechado=false,fase=0;
  const opcoes=botoesOpcoes(area,[{valor:'simples',rotulo:'Um resistor'},{valor:'serie',rotulo:'Dois em série'},{valor:'paralelo',rotulo:'Dois em paralelo'}],{selecionado:modo,aoEscolher:v=>{modo=v;atualizar();},rotulo:'Arranjo'});
  const botaoInterruptor=criar('button',{type:'button',classe:'botao pequeno','aria-pressed':'false',texto:'Fechar interruptor'});
  botaoInterruptor.onclick=()=>{fechado=!fechado;botaoInterruptor.setAttribute('aria-pressed',String(fechado));botaoInterruptor.textContent=fechado?'Abrir interruptor':'Fechar interruptor';atualizar();};
  opcoes.grupo.append(botaoInterruptor);
  const controles=grupoControles(area,[
   {chave:'tensao',rotulo:'Tensão da fonte',min:1,max:24,passo:.5,valor:api.estadoGuardado?.tensao??12,unidade:'V',aoMudar:atualizar},
   {chave:'r1',rotulo:'Resistor 1',min:5,max:500,passo:5,valor:api.estadoGuardado?.r1??60,unidade:'Ω',aoMudar:atualizar},
   {chave:'r2',rotulo:'Resistor 2',min:5,max:500,passo:5,valor:api.estadoGuardado?.r2??120,unidade:'Ω',aoMudar:atualizar}
  ]);
  const mostrar=leitura(area,[['req','Resistência equivalente','Ω'],['corrente','Corrente total','A'],['potencia','Potência total','W'],['v1','Tensão em R1','V'],['v2','Tensão em R2','V']]);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  function calcular(){
   const V=controles.tensao.valor,R1=controles.r1.valor,R2=controles.r2.valor;
   const Req=modo==='simples'?R1:modo==='serie'?R1+R2:(R1*R2)/(R1+R2);
   const I=fechado?V/Req:0;
   const I1=modo==='paralelo'?(fechado?V/R1:0):I,I2=modo==='simples'?0:modo==='paralelo'?(fechado?V/R2:0):I;
   const V1=I1*R1,V2=modo==='simples'?0:I2*R2;
   return {modo,fechado,tensao:V,r1:R1,r2:R2,req:Req,corrente:I,potencia:V*I,i1:I1,i2:I2,v1:V1,v2:V2,p1:V1*I1,p2:V2*I2};
  }
  let estado=calcular();
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;
   c.clearRect(0,0,L,A);
   const e=estado;
   const esq=70,dir=L-70,topo=60,base=A-50;
   c.lineWidth=2.2;c.strokeStyle='#8aa0a8';c.lineCap='round';
   c.beginPath();c.moveTo(esq,topo+30);c.lineTo(esq,topo);c.lineTo(L/2-60,topo);c.moveTo(L/2+10,topo);c.lineTo(dir,topo);c.lineTo(dir,base);c.lineTo(esq,base);c.lineTo(esq,base-30);c.stroke();
   c.strokeStyle='#e5c17d';c.lineWidth=3;c.beginPath();c.moveTo(esq-14,topo+30);c.lineTo(esq+14,topo+30);c.stroke();c.lineWidth=1.6;c.beginPath();c.moveTo(esq-8,topo+42);c.lineTo(esq+8,topo+42);c.stroke();
   c.strokeStyle='#8aa0a8';c.lineWidth=2.2;c.beginPath();c.moveTo(esq,topo+42);c.lineTo(esq,base-30);c.stroke();
   c.fillStyle='#d9c48f';c.font='12px Georgia';c.textAlign='center';c.fillText(`${formatarNumero(e.tensao,1)} V`,esq-32,topo+40);
   c.strokeStyle=e.fechado?'#e5c17d':'#8aa0a8';c.lineWidth=2.2;c.beginPath();c.moveTo(L/2-60,topo);c.lineTo(e.fechado?L/2+10:L/2-4,e.fechado?topo:topo-26);c.stroke();
   c.fillStyle='#e5c17d';c.beginPath();c.arc(L/2-60,topo,3.5,0,7);c.fill();c.beginPath();c.arc(L/2+10,topo,3.5,0,7);c.fill();
   const lampada=(x,y,r,potencia,rotulo,texto)=>{const brilho=Math.min(1,potencia/4);c.beginPath();c.arc(x,y,r,0,Math.PI*2);const g=c.createRadialGradient(x,y,2,x,y,r*2.2);g.addColorStop(0,`rgba(255,235,170,${.15+brilho*.85})`);g.addColorStop(1,'rgba(255,235,170,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r*2.2,0,7);c.fill();c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=`rgba(${120+brilho*135},${110+brilho*120},${70+brilho*90},1)`;c.fill();c.strokeStyle='#d9c48f';c.lineWidth=1.5;c.stroke();c.fillStyle='#e8dcc0';c.font='11px Georgia';c.textAlign='center';c.fillText(rotulo,x,y+r+14);c.fillText(texto,x,y+r+27);};
   if(e.modo==='simples'){lampada(dir,(topo+base)/2,18,e.p1,'R1',`${formatarNumero(e.r1)} Ω · ${formatarNumero(e.p1,2)} W`);}
   else if(e.modo==='serie'){lampada(dir,topo+80,16,e.p1,'R1',`${formatarNumero(e.r1)} Ω · ${formatarNumero(e.p1,2)} W`);lampada(dir,base-80,16,e.p2,'R2',`${formatarNumero(e.r2)} Ω · ${formatarNumero(e.p2,2)} W`);}
   else{const y=(topo+base)/2;c.strokeStyle='#8aa0a8';c.lineWidth=2.2;c.beginPath();c.moveTo(dir-70,topo);c.lineTo(dir-70,base);c.stroke();lampada(dir-70,y,16,e.p1,'R1',`${formatarNumero(e.r1)} Ω · ${formatarNumero(e.i1,2)} A`);lampada(dir,y,16,e.p2,'R2',`${formatarNumero(e.r2)} Ω · ${formatarNumero(e.i2,2)} A`);}
   if(e.fechado&&e.corrente>0){const trilha=[[esq,base-30],[esq,base],[dir,base],[dir,topo],[L/2+10,topo],[L/2-60,topo],[esq,topo],[esq,topo+30]];const comprimento=trilha.slice(1).reduce((s,p,i)=>s+Math.hypot(p[0]-trilha[i][0],p[1]-trilha[i][1]),0);const n=Math.max(6,Math.round(comprimento/36));for(let k=0;k<n;k++){let d=((k/n)+fase)%1*comprimento;let i=0;while(i<trilha.length-1){const seg=Math.hypot(trilha[i+1][0]-trilha[i][0],trilha[i+1][1]-trilha[i][1]);if(d<=seg)break;d-=seg;i++;}if(i>=trilha.length-1)continue;const seg=Math.hypot(trilha[i+1][0]-trilha[i][0],trilha[i+1][1]-trilha[i][1]);const t=d/seg;const x=trilha[i][0]+(trilha[i+1][0]-trilha[i][0])*t,y=trilha[i][1]+(trilha[i+1][1]-trilha[i][1])*t;c.fillStyle='#9fd8ff';c.beginPath();c.arc(x,y,2.4,0,7);c.fill();}}
   c.fillStyle='#a9bcc2';c.font='11px Arial';c.textAlign='left';c.fillText(e.fechado?'Interruptor fechado':'Interruptor aberto: não há caminho fechado, logo I = 0',L/2-60,topo-34);
  }
  const anim=animador(delta=>{fase=(fase+delta*Math.min(2,estado.corrente*3))%1;desenhar();});
  function atualizar(){
   estado=calcular();
   mostrar({req:formatarNumero(estado.req,1),corrente:formatarNumero(estado.corrente,3),potencia:formatarNumero(estado.potencia,2),v1:formatarNumero(estado.v1,2),v2:estado.modo==='simples'?'—':formatarNumero(estado.v2,2)});
   const texto=estado.modo==='paralelo'?`Em paralelo, os dois resistores recebem a mesma tensão (${formatarNumero(estado.tensao,1)} V) e a corrente se divide: I₁ = ${formatarNumero(estado.i1,3)} A e I₂ = ${formatarNumero(estado.i2,3)} A. A resistência equivalente (${formatarNumero(estado.req,1)} Ω) é menor que qualquer uma das duas.`:estado.modo==='serie'?`Em série, a mesma corrente (${formatarNumero(estado.corrente,3)} A) atravessa os dois resistores e a tensão se reparte proporcionalmente às resistências: ${formatarNumero(estado.v1,2)} V + ${formatarNumero(estado.v2,2)} V = ${formatarNumero(estado.tensao,1)} V.`:`Com um único resistor, I = V/R = ${formatarNumero(estado.tensao,1)}/${formatarNumero(estado.r1)} = ${formatarNumero(estado.corrente,3)} A${estado.fechado?'':' quando o interruptor estiver fechado'}.`;
   explicacao.definir(`<strong>I = V / R<sub>eq</sub></strong> · ${texto}`);
   alternativo(`Estado: ${estado.fechado?'circuito fechado':'circuito aberto'}, arranjo ${estado.modo}, tensão ${formatarNumero(estado.tensao,1)} volts, resistência equivalente ${formatarNumero(estado.req,1)} ohms, corrente ${formatarNumero(estado.corrente,3)} amperes.`);
   api.atualizar(estado);
   if(estado.fechado&&!movimentoReduzido())anim.iniciar();else{anim.parar();desenhar();}
   api.guardar({tensao:estado.tensao,r1:estado.r1,r2:estado.r2});
  }
  tela.tela.addEventListener('redimensionar',desenhar);
  atualizar();
  return {estado:()=>estado,reiniciar(){controles.tensao.valor=12;controles.r1.valor=60;controles.r2.valor=120;modo='simples';opcoes.selecionar('simples');fechado=false;botaoInterruptor.setAttribute('aria-pressed','false');botaoInterruptor.textContent='Fechar interruptor';atualizar();},limpar(){anim.parar();tela.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Feche o interruptor e observe os pontos de corrente percorrendo o circuito.',verificar:e=>e.fechado},
  {texto:'Com um único resistor, ajuste a fonte para 12 V e R1 para 60 Ω. A corrente deve marcar 0,200 A.',verificar:e=>e.fechado&&e.modo==='simples'&&e.tensao===12&&e.r1===60},
  {texto:'Mantenha 12 V e troque para dois resistores em série. Veja a corrente total cair, porque a resistência equivalente aumentou.',verificar:e=>e.fechado&&e.modo==='serie'&&e.tensao===12&&e.req>e.r1},
  {texto:'Troque para paralelo. Confirme no visor que a resistência equivalente ficou menor que R1 e que R2.',verificar:e=>e.fechado&&e.modo==='paralelo'&&e.req<Math.min(e.r1,e.r2)}
 ]},
 desafio:{titulo:'Corrente alvo com dois resistores',descricao:'Com a fonte em <strong>9 V</strong> e dois resistores em <strong>paralelo</strong>, obtenha uma corrente total entre 0,29 A e 0,31 A. Dica: pense primeiro na resistência equivalente necessária.',verificar:e=>{if(!e.fechado)return {ok:false,mensagem:'O interruptor precisa estar fechado.'};if(e.modo!=='paralelo')return {ok:false,mensagem:'O desafio pede o arranjo em paralelo.'};if(e.tensao!==9)return {ok:false,mensagem:`A fonte está em ${formatarNumero(e.tensao,1)} V, mas o desafio pede 9 V.`};const ok=e.corrente>=.29&&e.corrente<=.31;return {ok,mensagem:ok?`Resistência equivalente de ${formatarNumero(e.req,1)} Ω: ${formatarNumero(e.r1)} Ω e ${formatarNumero(e.r2)} Ω em paralelo entregam ${formatarNumero(e.corrente,3)} A.`:`A corrente atual é ${formatarNumero(e.corrente,3)} A. Para 0,30 A com 9 V, a resistência equivalente precisa ser 30 Ω.`};}}
};

const movimento={
 id:'movimento',nome:'Movimento e gravidade',
 descricao:'Lance um projétil e acompanhe posição, velocidade e aceleração. Sem resistência do ar, a trajetória é uma parábola; com arrasto, a simulação integra as equações numericamente.',
 objetivos:['Relacionar velocidade inicial, ângulo e gravidade ao alcance e à altura máxima.','Ler gráficos de posição, velocidade e aceleração ao longo do tempo.','Perceber quando a massa importa (com arrasto) e quando não importa (sem arrasto).'],
 instrucoes:['Ajuste a velocidade inicial e o ângulo e pressione “Lançar”.','Compare o alcance com a previsão analítica mostrada no visor.','Ative o arrasto e repita o lançamento com massas diferentes.'],
 modelo:['Aceleração da gravidade constante próxima à superfície.','Arrasto quadrático F = −k·v·|v|, com coeficiente k ajustável; a resistência real depende de forma, área e densidade do ar.','Integração numérica semi-implícita com passo de 5 ms.','Sem rotação do projétil, vento ou curvatura da Terra.'],
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:360,descricao:'Trajetória do projétil e gráficos de posição, velocidade e aceleração'});
  const gravidades={terra:9.81,lua:1.62,marte:3.71};
  let corpo='terra',simulacao=null,tempoAnimacao=0,anterioresAngulos=[];
  const opcoes=botoesOpcoes(area,[{valor:'terra',rotulo:'Terra (9,81 m/s²)'},{valor:'lua',rotulo:'Lua (1,62 m/s²)'},{valor:'marte',rotulo:'Marte (3,71 m/s²)'}],{selecionado:corpo,aoEscolher:v=>{corpo=v;lancar();},rotulo:'Gravidade'});
  const controles=grupoControles(area,[
   {chave:'v0',rotulo:'Velocidade inicial',min:1,max:40,passo:.5,valor:20,unidade:'m/s',aoMudar:lancar},
   {chave:'angulo',rotulo:'Ângulo',min:0,max:90,passo:1,valor:45,unidade:'°',aoMudar:lancar},
   {chave:'massa',rotulo:'Massa',min:.1,max:5,passo:.1,valor:1,unidade:'kg',aoMudar:lancar},
   {chave:'arrasto',rotulo:'Coeficiente de arrasto k',min:0,max:.5,passo:.01,valor:0,unidade:'kg/m',aoMudar:lancar}
  ]);
  const mostrar=leitura(area,[['alcance','Alcance','m'],['altura','Altura máxima','m'],['tempo','Tempo de voo','s'],['analitico','Alcance sem arrasto (fórmula)','m']]);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  function simular(){
   const v0=controles.v0.valor,ang=controles.angulo.valor*Math.PI/180,m=controles.massa.valor,k=controles.arrasto.valor,g=gravidades[corpo];
   let x=0,y=0,vx=v0*Math.cos(ang),vy=v0*Math.sin(ang),t=0;const dt=.005;
   const pontos=[{t,x,y,vx,vy,ay:-g}];let alturaMax=0;
   for(let i=0;i<200000;i++){
    const v=Math.hypot(vx,vy);
    const ax=-(k/m)*v*vx,ay=-g-(k/m)*v*vy;
    vx+=ax*dt;vy+=ay*dt;x+=vx*dt;y+=vy*dt;t+=dt;
    alturaMax=Math.max(alturaMax,y);
    if(i%4===0)pontos.push({t,x,y:Math.max(0,y),vx,vy,ay});
    if(y<0&&t>dt){const u=pontos[pontos.length-1];const f=u.y/(u.y-y);x=u.x+(x-u.x)*f;t=u.t+(t-u.t)*f;pontos.push({t,x,y:0,vx,vy,ay});break;}
   }
   const analitico=v0*v0*Math.sin(2*ang)/g;
   return {v0,angulo:controles.angulo.valor,massa:m,arrasto:k,corpo,g,pontos,alcance:x,alturaMax,tempoVoo:t,analitico};
  }
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;
   c.clearRect(0,0,L,A);
   if(!simulacao)return;
   const s=simulacao;
   const areaTraj={x:40,y:16,l:L*.6-50,a:A-50};
   const maxX=Math.max(5,s.alcance*1.1),maxY=Math.max(3,s.alturaMax*1.25);
   const escala=Math.min(areaTraj.l/maxX,areaTraj.a/maxY);
   const px=x=>areaTraj.x+x*escala,py=y=>areaTraj.y+areaTraj.a-y*escala;
   c.strokeStyle='#1d3340';c.lineWidth=1;for(let gx=0;gx<=maxX;gx+=Math.max(1,Math.round(maxX/8))){c.beginPath();c.moveTo(px(gx),areaTraj.y);c.lineTo(px(gx),py(0));c.stroke();c.fillStyle='#8aa0a8';c.font='10px Arial';c.textAlign='center';c.fillText(gx+' m',px(gx),py(0)+12);}
   c.strokeStyle='#8aa0a8';c.beginPath();c.moveTo(areaTraj.x,py(0));c.lineTo(areaTraj.x+areaTraj.l,py(0));c.stroke();
   c.strokeStyle=paleta.ouro;c.lineWidth=2;c.beginPath();s.pontos.forEach((p,i)=>i?c.lineTo(px(p.x),py(p.y)):c.moveTo(px(p.x),py(p.y)));c.stroke();
   if(s.arrasto>0){c.strokeStyle='#7fc3a466';c.setLineDash([4,4]);c.beginPath();const n=60;for(let i=0;i<=n;i++){const t=s.tempoVoo*0+i/n*(2*s.v0*Math.sin(s.angulo*Math.PI/180)/s.g);const x=s.v0*Math.cos(s.angulo*Math.PI/180)*t,y=s.v0*Math.sin(s.angulo*Math.PI/180)*t-.5*s.g*t*t;if(y<0)break;i?c.lineTo(px(x),py(y)):c.moveTo(px(x),py(y));}c.stroke();c.setLineDash([]);c.fillStyle='#7fc3a4';c.font='10px Arial';c.textAlign='left';c.fillText('tracejado: sem arrasto',areaTraj.x+4,areaTraj.y+10);}
   const indice=Math.min(s.pontos.length-1,Math.floor(tempoAnimacao/s.tempoVoo*(s.pontos.length-1)));const p=s.pontos[indice];
   c.fillStyle=paleta.ambar;c.beginPath();c.arc(px(p.x),py(p.y),5,0,7);c.fill();
   c.strokeStyle='#9fd8ff';c.lineWidth=1.5;c.beginPath();c.moveTo(px(p.x),py(p.y));c.lineTo(px(p.x)+p.vx*2,py(p.y)-p.vy*2);c.stroke();
   const gx=L*.62,gl=L-gx-10,ga=(A-30)/3-8;
   const series=[['y (m)',q=>q.y,paleta.ouro],['vᵧ (m/s)',q=>q.vy,paleta.azul],['aᵧ (m/s²)',q=>q.ay,paleta.rubi]];
   series.forEach(([rotulo,f,cor],i)=>{const gy=10+i*(ga+12);const valores=s.pontos.map(f);let min=Math.min(...valores),max=Math.max(...valores);if(max-min<1e-6){max+=1;min-=1;}const pad=(max-min)*.1;min-=pad;max+=pad;c.fillStyle='#071219';c.fillRect(gx,gy,gl,ga);c.strokeStyle='#1d3340';c.strokeRect(gx,gy,gl,ga);const ty=v=>gy+ga-(v-min)/(max-min)*ga,tx=t=>gx+t/s.tempoVoo*gl;if(min<0&&max>0){c.strokeStyle='#8aa0a855';c.beginPath();c.moveTo(gx,ty(0));c.lineTo(gx+gl,ty(0));c.stroke();}c.strokeStyle=cor;c.lineWidth=1.6;c.beginPath();s.pontos.forEach((q,j)=>j?c.lineTo(tx(q.t),ty(f(q))):c.moveTo(tx(q.t),ty(f(q))));c.stroke();c.fillStyle=cor;c.font='10px Arial';c.textAlign='left';c.fillText(rotulo,gx+4,gy+11);c.beginPath();c.arc(tx(p.t),ty(f(p)),3,0,7);c.fill();c.fillStyle='#a9bcc2';c.textAlign='right';c.fillText(formatarNumero(f(p),1),gx+gl-4,gy+11);});
   c.fillStyle='#a9bcc2';c.font='10px Arial';c.textAlign='center';c.fillText('tempo →',gx+gl/2,A-6);
  }
  const anim=animador(delta=>{tempoAnimacao+=delta;if(simulacao&&tempoAnimacao>=simulacao.tempoVoo){tempoAnimacao=simulacao.tempoVoo;anim.parar();}desenhar();});
  function lancar(){
   simulacao=simular();
   if(!anterioresAngulos.includes(simulacao.angulo))anterioresAngulos.push(simulacao.angulo);
   tempoAnimacao=0;
   mostrar({alcance:formatarNumero(simulacao.alcance,2),altura:formatarNumero(simulacao.alturaMax,2),tempo:formatarNumero(simulacao.tempoVoo,2),analitico:formatarNumero(simulacao.analitico,2)});
   const s=simulacao;
   explicacao.definir(s.arrasto>0?`Com arrasto, a trajetória deixa de ser simétrica: a descida é mais íngreme que a subida e o alcance cai para <strong>${formatarNumero(s.alcance,2)} m</strong> (sem arrasto seria ${formatarNumero(s.analitico,2)} m). Agora a <strong>massa importa</strong>: a mesma força de arrasto desacelera menos um corpo mais pesado.`:`Sem arrasto, a aceleração é constante (−${formatarNumero(s.g,2)} m/s²), a velocidade vertical decresce linearmente e a altura descreve uma parábola. O alcance ${formatarNumero(s.alcance,2)} m coincide com v₀²·sen(2θ)/g. A massa não aparece na equação: corpos leves e pesados caem igual.`);
   alternativo(`Lançamento a ${s.v0} m/s e ${s.angulo} graus em ${corpo}: alcance ${formatarNumero(s.alcance,2)} m, altura máxima ${formatarNumero(s.alturaMax,2)} m, tempo de voo ${formatarNumero(s.tempoVoo,2)} s.`);
   api.atualizar({...s,angulosVisitados:[...anterioresAngulos]});
   if(movimentoReduzido()){tempoAnimacao=s.tempoVoo;desenhar();}else anim.iniciar();
  }
  const botao=criar('button',{type:'button',classe:'botao pequeno',texto:'Lançar de novo'});botao.onclick=lancar;opcoes.grupo.append(botao);
  tela.tela.addEventListener('redimensionar',desenhar);
  lancar();
  return {estado:()=>({...simulacao,angulosVisitados:[...anterioresAngulos]}),reiniciar(){controles.v0.valor=20;controles.angulo.valor=45;controles.massa.valor=1;controles.arrasto.valor=0;corpo='terra';opcoes.selecionar('terra');anterioresAngulos=[];lancar();},limpar(){anim.parar();tela.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Na Terra, sem arrasto e com 20 m/s, encontre o ângulo que produz o maior alcance (entre 43° e 47°).',verificar:e=>e.corpo==='terra'&&e.arrasto===0&&e.v0===20&&e.angulo>=43&&e.angulo<=47},
  {texto:'Mantendo 20 m/s, lance a 30° e depois a 60°. Compare: ângulos complementares dão o mesmo alcance sem arrasto.',verificar:e=>e.arrasto===0&&e.angulosVisitados.includes(30)&&e.angulosVisitados.includes(60)},
  {texto:'Sem arrasto, aumente a massa para mais de 3 kg e confirme que alcance e tempo não mudam.',verificar:e=>e.arrasto===0&&e.massa>3},
  {texto:'Ative o arrasto (k ≥ 0,10) e observe a trajetória tracejada sem arrasto para comparação.',verificar:e=>e.arrasto>=.1}
 ]},
 desafio:{titulo:'Acertar o alvo a 30 metros',descricao:'Na <strong>Terra</strong>, sem arrasto e com velocidade inicial de <strong>20 m/s</strong>, encontre um ângulo que faça o projétil cair entre 29 m e 31 m. Existem duas soluções.',verificar:e=>{if(e.corpo!=='terra'||e.arrasto!==0||e.v0!==20)return {ok:false,mensagem:'Use a Terra, arrasto zero e 20 m/s.'};const ok=e.alcance>=29&&e.alcance<=31;return {ok,mensagem:ok?`Com ${e.angulo}°, o alcance é ${formatarNumero(e.alcance,2)} m. O outro ângulo que funciona é ${90-e.angulo}°.`:`Alcance atual: ${formatarNumero(e.alcance,2)} m. Use v₀²·sen(2θ)/g = 30 para estimar θ.`};}}
};

const optica={
 id:'optica',nome:'Óptica geométrica',
 descricao:'Reflexão e refração em uma interface entre dois meios, com a Lei de Snell, e formação de imagens por uma lente convergente delgada.',
 objetivos:['Aplicar a Lei de Snell e prever o desvio do raio refratado.','Identificar o ângulo crítico e a reflexão total interna.','Localizar a imagem formada por uma lente convergente com a equação dos pontos conjugados.'],
 instrucoes:['Escolha os meios e varie o ângulo de incidência.','Observe quando o raio refratado desaparece (reflexão total).','Troque para o modo lente e mova o objeto para dentro e para fora da distância focal.'],
 modelo:['Raios geométricos: a luz é tratada como linhas, sem difração ou interferência.','Índices de refração fixos; na realidade variam com a cor da luz (dispersão).','Lente delgada ideal, sem aberrações.'],
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:360,descricao:'Diagrama de raios de luz'});
  const meios={ar:['Ar',1.0003],agua:['Água',1.333],vidro:['Vidro',1.52],diamante:['Diamante',2.42]};
  let modo='refracao',n1='ar',n2='agua';
  const opcoesModo=botoesOpcoes(area,[{valor:'refracao',rotulo:'Reflexão e refração'},{valor:'lente',rotulo:'Lente convergente'}],{selecionado:modo,aoEscolher:v=>{modo=v;montarControles();atualizar();},rotulo:'Modo'});
  const areaControles=criar('div');area.append(areaControles);
  const mostrar=leitura(area,[['a','Ângulo de incidência','°'],['b','Ângulo de refração','°'],['c','Ângulo crítico','°'],['d','Distância da imagem','cm'],['e','Ampliação','×']]);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  let controles={};
  function montarControles(){
   areaControles.replaceChildren();
   if(modo==='refracao'){
    const sel=criar('div',{classe:'botoes-opcoes'});
    [['n1','Meio de origem'],['n2','Meio de destino']].forEach(([chave,rot])=>{const rotulo=criar('label',{texto:rot+': '});const s=criar('select');Object.entries(meios).forEach(([id,[nome,n]])=>s.append(criar('option',{value:id,texto:`${nome} (n = ${n})`})));s.value=chave==='n1'?n1:n2;s.onchange=()=>{if(chave==='n1')n1=s.value;else n2=s.value;atualizar();};rotulo.append(s);sel.append(rotulo);});
    areaControles.append(sel);
    controles=grupoControles(areaControles,[{chave:'angulo',rotulo:'Ângulo de incidência',min:0,max:89,passo:1,valor:35,unidade:'°',aoMudar:atualizar}]);
   }else{
    controles=grupoControles(areaControles,[{chave:'foco',rotulo:'Distância focal f',min:5,max:40,passo:1,valor:15,unidade:'cm',aoMudar:atualizar},{chave:'objeto',rotulo:'Distância do objeto',min:2,max:100,passo:1,valor:40,unidade:'cm',aoMudar:atualizar}]);
   }
  }
  let estado={};
  function calcular(){
   if(modo==='refracao'){
    const N1=meios[n1][1],N2=meios[n2][1],a=controles.angulo.valor*Math.PI/180;
    const seno=N1*Math.sin(a)/N2;
    const total=seno>1;
    const critico=N1>N2?Math.asin(N2/N1)*180/Math.PI:null;
    return {modo,n1,n2,N1,N2,angulo:controles.angulo.valor,refracao:total?null:Math.asin(seno)*180/Math.PI,total,critico};
   }
   const f=controles.foco.valor,o=controles.objeto.valor;
   const di=o===f?Infinity:o*f/(o-f);const m=o===f?Infinity:-di/o;
   return {modo,foco:f,objeto:o,imagem:di,ampliacao:m,real:Number.isFinite(di)&&di>0};
  }
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);const e=estado;
   if(e.modo==='refracao'){
    const cx=L/2,cy=A/2;
    c.fillStyle='#0d2233';c.fillRect(0,cy,L,A-cy);c.fillStyle='#071219';c.fillRect(0,0,L,cy);
    c.fillStyle='#a9bcc2';c.font='12px Georgia';c.textAlign='left';c.fillText(`${meios[e.n1][0]} · n = ${e.N1}`,10,20);c.fillText(`${meios[e.n2][0]} · n = ${e.N2}`,10,cy+20);
    c.strokeStyle='#8aa0a8';c.setLineDash([4,5]);c.beginPath();c.moveTo(cx,0);c.lineTo(cx,A);c.stroke();c.setLineDash([]);c.beginPath();c.moveTo(0,cy);c.lineTo(L,cy);c.stroke();
    const a=e.angulo*Math.PI/180,R=Math.min(L,A)*.45;
    c.lineWidth=2.4;c.strokeStyle=paleta.ouro;c.beginPath();c.moveTo(cx-Math.sin(a)*R,cy-Math.cos(a)*R);c.lineTo(cx,cy);c.stroke();
    c.strokeStyle=e.total?paleta.ouro:'#f1dca688';c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.sin(a)*R,cy-Math.cos(a)*R);c.stroke();
    if(!e.total){const b=e.refracao*Math.PI/180;c.strokeStyle=paleta.azul;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.sin(b)*R,cy+Math.cos(b)*R);c.stroke();}
    c.fillStyle='#e8dcc0';c.font='11px Arial';c.textAlign='left';c.fillText(`incidente ${e.angulo}°`,cx-Math.sin(a)*R*.6-70,cy-Math.cos(a)*R*.6);c.fillText(e.total?'reflexão total':`refletido ${e.angulo}°`,cx+Math.sin(a)*R*.6+6,cy-Math.cos(a)*R*.6);if(!e.total)c.fillText(`refratado ${formatarNumero(e.refracao,1)}°`,cx+Math.sin(e.refracao*Math.PI/180)*R*.6+6,cy+Math.cos(e.refracao*Math.PI/180)*R*.6);
   }else{
    const cy=A/2,escala=Math.min(L/2.6/Math.max(e.objeto,Math.abs(Number.isFinite(e.imagem)?e.imagem:e.objeto)),8),cx=L/2;
    c.strokeStyle='#8aa0a8';c.beginPath();c.moveTo(0,cy);c.lineTo(L,cy);c.stroke();
    c.strokeStyle='#9fd8ff';c.lineWidth=2;c.beginPath();c.ellipse(cx,cy,6,A*.38,0,0,7);c.stroke();
    [-1,1].forEach(s=>{c.fillStyle='#e5c17d';c.beginPath();c.arc(cx+s*e.foco*escala,cy,3,0,7);c.fill();c.fillStyle='#d9c48f';c.font='11px Georgia';c.textAlign='center';c.fillText('F',cx+s*e.foco*escala,cy+16);c.beginPath();c.arc(cx+s*2*e.foco*escala,cy,2,0,7);c.fill();c.fillText('2F',cx+s*2*e.foco*escala,cy+16);});
    const h=Math.min(A*.3,60),ox=cx-e.objeto*escala;
    c.strokeStyle=paleta.ouro;c.lineWidth=3;c.beginPath();c.moveTo(ox,cy);c.lineTo(ox,cy-h);c.stroke();c.fillStyle=paleta.ouro;c.beginPath();c.moveTo(ox,cy-h-8);c.lineTo(ox-5,cy-h+2);c.lineTo(ox+5,cy-h+2);c.fill();
    if(Number.isFinite(e.imagem)){const ix=cx+e.imagem*escala,ih=h*e.ampliacao;c.strokeStyle=e.real?paleta.verde:paleta.rosa;c.setLineDash(e.real?[]:[5,4]);c.lineWidth=3;c.beginPath();c.moveTo(ix,cy);c.lineTo(ix,cy-ih);c.stroke();c.setLineDash([]);
     c.lineWidth=1.3;c.strokeStyle='#f1dca699';c.beginPath();c.moveTo(ox,cy-h);c.lineTo(cx,cy-h);c.lineTo(e.real?ix:cx+(cx-ix)*-1,e.real?cy-ih:cy-h+((cy-ih)-(cy-h))*((cx+(cx-ix)*-1)-cx)/(ix-cx));c.stroke();
     c.beginPath();c.moveTo(ox,cy-h);c.lineTo(cx,cy);c.lineTo(e.real?ix:cx-(ix-cx),e.real?cy-ih:cy+ih);c.stroke();
     if(!e.real){c.setLineDash([3,4]);c.strokeStyle='#d296a899';c.beginPath();c.moveTo(cx,cy-h);c.lineTo(ix,cy-ih);c.moveTo(cx,cy);c.lineTo(ix,cy-ih);c.stroke();c.setLineDash([]);}
     c.fillStyle='#e8dcc0';c.font='11px Arial';c.textAlign='center';c.fillText(e.real?'imagem real, invertida':'imagem virtual, direita',ix,cy+(e.real?30:-h*Math.abs(e.ampliacao)-10));}
    else{c.fillStyle='#e8dcc0';c.font='11px Arial';c.textAlign='center';c.fillText('objeto no foco: raios saem paralelos, imagem no infinito',cx,30);}
    c.fillStyle='#a9bcc2';c.font='11px Arial';c.textAlign='left';c.fillText(`objeto a ${e.objeto} cm · f = ${e.foco} cm`,10,A-10);
   }
  }
  function atualizar(){
   estado=calcular();
   if(estado.modo==='refracao'){mostrar({a:estado.angulo,b:estado.total?'—':formatarNumero(estado.refracao,1),c:estado.critico?formatarNumero(estado.critico,1):'—',d:'—',e:'—'});explicacao.definir(estado.total?`<strong>Reflexão total interna.</strong> Como n₁ > n₂ e o ângulo (${estado.angulo}°) supera o ângulo crítico (${formatarNumero(estado.critico,1)}°), sen θ₂ = n₁·sen θ₁/n₂ seria maior que 1: não existe raio refratado e toda a luz reflete. É o princípio das fibras ópticas.`:`<strong>n₁·sen θ₁ = n₂·sen θ₂.</strong> ${estado.N2>estado.N1?'A luz entra em um meio mais refringente e se aproxima da normal':estado.N2<estado.N1?'A luz entra em um meio menos refringente e se afasta da normal':'Os meios têm o mesmo índice: o raio não se desvia'} (${estado.angulo}° → ${formatarNumero(estado.refracao,1)}°). O raio refletido sempre forma com a normal o mesmo ângulo do incidente.`);alternativo(`Refração de ${meios[estado.n1][0]} para ${meios[estado.n2][0]}, incidência ${estado.angulo} graus, ${estado.total?'reflexão total':'refração a '+formatarNumero(estado.refracao,1)+' graus'}.`);}
   else{mostrar({a:'—',b:'—',c:'—',d:Number.isFinite(estado.imagem)?formatarNumero(estado.imagem,1):'∞',e:Number.isFinite(estado.ampliacao)?formatarNumero(estado.ampliacao,2):'∞'});explicacao.definir(`<strong>1/f = 1/d₀ + 1/dᵢ.</strong> Com f = ${estado.foco} cm e objeto a ${estado.objeto} cm, ${Number.isFinite(estado.imagem)?`a imagem se forma a ${formatarNumero(estado.imagem,1)} cm ${estado.real?'do outro lado da lente (real e invertida)':'do mesmo lado do objeto (virtual e direita, como numa lupa)'}, com ampliação ${formatarNumero(Math.abs(estado.ampliacao),2)}×.`:'o objeto está exatamente no foco e a imagem vai para o infinito.'} ${estado.objeto>2*estado.foco?'Objeto além de 2F: imagem menor.':estado.objeto===2*estado.foco?'Objeto em 2F: imagem do mesmo tamanho, em 2F.':estado.objeto>estado.foco?'Objeto entre F e 2F: imagem maior, além de 2F.':''}`);alternativo(`Lente de foco ${estado.foco} cm, objeto a ${estado.objeto} cm, imagem ${Number.isFinite(estado.imagem)?'a '+formatarNumero(estado.imagem,1)+' cm, ampliação '+formatarNumero(estado.ampliacao,2):'no infinito'}.`);}
   desenhar();api.atualizar(estado);
  }
  tela.tela.addEventListener('redimensionar',desenhar);
  montarControles();atualizar();
  return {estado:()=>estado,reiniciar(){modo='refracao';n1='ar';n2='agua';opcoesModo.selecionar('refracao');montarControles();atualizar();},limpar(){tela.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Faça a luz ir da água para o ar e aumente o ângulo até obter reflexão total. Anote o ângulo crítico mostrado no visor.',verificar:e=>e.modo==='refracao'&&e.n1==='agua'&&e.n2==='ar'&&e.total},
  {texto:'No modo lente, coloque o objeto exatamente a 2f e confirme que a imagem tem o mesmo tamanho (ampliação −1).',verificar:e=>e.modo==='lente'&&e.objeto===2*e.foco},
  {texto:'Leve o objeto para dentro da distância focal e observe a imagem virtual, direita e ampliada.',verificar:e=>e.modo==='lente'&&e.objeto<e.foco}
 ]},
 desafio:{titulo:'Projetar uma imagem ampliada',descricao:'Com a lente convergente, forme uma imagem <strong>real</strong> com ampliação entre 1,9× e 2,1× (em módulo). Onde o objeto precisa ficar em relação a f?',verificar:e=>{if(e.modo!=='lente')return {ok:false,mensagem:'Use o modo lente.'};const ok=e.real&&Math.abs(e.ampliacao)>=1.9&&Math.abs(e.ampliacao)<=2.1;return {ok,mensagem:ok?`Objeto a ${e.objeto} cm com f = ${e.foco} cm: dᵢ = ${formatarNumero(e.imagem,1)} cm e ampliação ${formatarNumero(e.ampliacao,2)}. A condição é d₀ = 1,5·f.`:`Ampliação atual ${Number.isFinite(e.ampliacao)?formatarNumero(e.ampliacao,2):'∞'}. Para |m| = 2 com imagem real, a distância do objeto deve ser 1,5 vezes a focal.`};}}
};

export const definicao={titulo:'Laboratório de ciências',descricao:'Três instrumentos com física real: um circuito regido pela Lei de Ohm, um lançador que integra as equações do movimento e uma bancada óptica com a Lei de Snell e lentes delgadas.',experimentos:[circuitos,movimento,optica]};
