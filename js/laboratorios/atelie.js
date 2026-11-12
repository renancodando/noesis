// Renan | renancodando
import {criarTela,grupoControles,botoesOpcoes,painelExplicacao,textoAlternativo,paleta,formatarNumero,criar,buscar,buscarTodos,escapar} from '../aulas/interativos/base.js';

export function hslParaHex(h,s,l){
 s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
 return '#'+[f(0),f(8),f(4)].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');
}
export function hexParaRgb(hex){const n=parseInt(hex.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255];}
export function hexParaHsl(hex){
 let [r,g,b]=hexParaRgb(hex).map(v=>v/255);const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0;const l=(max+min)/2;
 if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);h=max===r?((g-b)/d+(g<b?6:0)):max===g?(b-r)/d+2:(r-g)/d+4;h*=60;}
 return [Math.round(h),Math.round(s*100),Math.round(l*100)];
}
export function luminancia(hex){const [r,g,b]=hexParaRgb(hex).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});return .2126*r+.7152*g+.0722*b;}
export function contraste(a,b){const la=luminancia(a),lb=luminancia(b);return (Math.max(la,lb)+.05)/(Math.min(la,lb)+.05);}

function botaoBaixar(area,tela,nome){
 const b=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Baixar imagem (PNG)'});
 b.onclick=()=>{const a=document.createElement('a');a.download=nome;a.href=tela.toDataURL('image/png');a.click();};
 area.append(b);return b;
}

const cores={
 id:'cores',nome:'Cores e harmonias',
 descricao:'Gire o círculo cromático, escolha uma harmonia e teste o contraste entre texto e fundo com a fórmula usada em acessibilidade.',
 objetivos:['Relacionar matiz, saturação e luminosidade.','Construir paletas complementares, análogas, tríades e monocromáticas.','Avaliar contraste de legibilidade (razão WCAG).'],
 instrucoes:['Ajuste matiz, saturação e luminosidade da cor-base.','Escolha uma harmonia e veja as cores derivadas.','Escolha uma cor de texto e uma de fundo entre as da paleta e leia a razão de contraste.'],
 modelo:['Harmonias calculadas por rotação de matiz no espaço HSL (complementar 180°, análogas ±30°, tríade ±120°).','A razão de contraste segue a fórmula WCAG 2 (luminância relativa). Mínimos: 4,5:1 para texto normal, 3:1 para texto grande.'],
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:260,descricao:'Círculo cromático e amostras da paleta'});
  let harmonia='complementar',texto=1,fundo=0,salvas=api.estadoGuardado?.paletas||[];
  const opcoes=botoesOpcoes(area,[{valor:'complementar',rotulo:'Complementar'},{valor:'analoga',rotulo:'Análoga'},{valor:'triade',rotulo:'Tríade'},{valor:'monocromatica',rotulo:'Monocromática'}],{selecionado:harmonia,aoEscolher:v=>{harmonia=v;atualizar();},rotulo:'Harmonia'});
  const controles=grupoControles(area,[{chave:'h',rotulo:'Matiz',min:0,max:359,passo:1,valor:api.estadoGuardado?.h??210,unidade:'°',aoMudar:atualizar},{chave:'s',rotulo:'Saturação',min:0,max:100,passo:1,valor:api.estadoGuardado?.s??60,unidade:'%',aoMudar:atualizar},{chave:'l',rotulo:'Luminosidade',min:5,max:95,passo:1,valor:api.estadoGuardado?.l??45,unidade:'%',aoMudar:atualizar}]);
  const amostras=criar('div',{classe:'amostras-cor'});area.append(amostras);
  const previa=criar('div',{classe:'previa-tipografia',estilo:'font-family:Georgia,serif'});area.append(previa);
  const ferramentas=criar('div',{classe:'ferramentas-atelie'});area.append(ferramentas);
  const mostrar=criar('div',{classe:'leitura-laboratorio'});area.append(mostrar);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  const salvar=criar('button',{type:'button',classe:'botao pequeno',texto:'Guardar paleta'});ferramentas.append(salvar);
  const areaSalvas=criar('div',{classe:'paleta-salva'});area.append(areaSalvas);
  let estado={};
  function gerar(){
   const h=controles.h.valor,s=controles.s.valor,l=controles.l.valor;
   const rot=(d,ds=0,dl=0)=>hslParaHex((h+d+360)%360,Math.max(0,Math.min(100,s+ds)),Math.max(5,Math.min(95,l+dl)));
   const base=rot(0);
   const lista=harmonia==='complementar'?[base,rot(180),rot(0,-20,25),rot(180,-20,-20)]:harmonia==='analoga'?[rot(-30),base,rot(30),rot(0,-30,30)]:harmonia==='triade'?[base,rot(120),rot(240),rot(0,-30,30)]:[rot(0,0,-30),rot(0,0,-15),base,rot(0,0,20),rot(0,0,35)];
   return lista;
  }
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
   const cx=A/2+10,cy=A/2,R=A/2-14;
   for(let a=0;a<360;a+=2){c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R,(a-90)*Math.PI/180,(a-88)*Math.PI/180);c.fillStyle=hslParaHex(a,controles.s.valor,controles.l.valor);c.fill();}
   c.fillStyle='#071219';c.beginPath();c.arc(cx,cy,R*.45,0,7);c.fill();
   const angulos=harmonia==='complementar'?[0,180]:harmonia==='analoga'?[-30,0,30]:harmonia==='triade'?[0,120,240]:[0];
   angulos.forEach((d,i)=>{const a=(controles.h.valor+d-90)*Math.PI/180;c.strokeStyle='#f1dca6';c.lineWidth=2;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(cx+Math.cos(a)*R*.75,cy+Math.sin(a)*R*.75,i===0||(harmonia==='analoga'&&i===1)?8:5,0,7);c.fill();});
   const x0=cx+R+30,w=(L-x0-10)/estado.paleta.length;
   estado.paleta.forEach((cor,i)=>{c.fillStyle=cor;c.fillRect(x0+i*w,20,w-4,A-80);c.fillStyle='#e8dcc0';c.font='11px ui-monospace,monospace';c.textAlign='center';c.fillText(cor,x0+i*w+w/2,A-44);});
   c.fillStyle='#a9bcc2';c.font='11px Georgia';c.textAlign='left';c.fillText(`${estado.nomeHarmonia} · base ${estado.paleta[harmonia==='analoga'?1:harmonia==='monocromatica'?2:0]}`,x0,A-22);
  }
  function atualizar(){
   const lista=gerar();
   texto=Math.min(texto,lista.length-1);fundo=Math.min(fundo,lista.length-1);
   const razao=contraste(lista[texto],lista[fundo]);
   estado={h:controles.h.valor,s:controles.s.valor,l:controles.l.valor,harmonia,paleta:lista,texto:lista[texto],fundo:lista[fundo],contraste:razao,nomeHarmonia:{complementar:'Complementar',analoga:'Análoga',triade:'Tríade',monocromatica:'Monocromática'}[harmonia],salvas};
   amostras.replaceChildren(...lista.map((cor,i)=>{const el=criar('button',{type:'button',classe:'amostra',estilo:`background:${cor}`,texto:cor,'aria-label':`Cor ${cor}`});el.onclick=()=>{if(i===texto){fundo=i;}else texto=i;atualizar();};return el;}));
   previa.style.background=lista[fundo];previa.style.color=lista[texto];previa.innerHTML=`<h4 style="color:${lista[texto]}">Texto em ${lista[texto]} sobre ${lista[fundo]}</h4><p style="color:${lista[texto]}">Clique numa amostra para defini-la como cor do texto; clique na mesma amostra de novo para torná-la fundo. A legibilidade não depende da sua impressão: depende da razão de luminâncias.</p>`;
   mostrar.innerHTML=`<div><small>Razão de contraste</small><strong>${formatarNumero(razao,2)}<small>:1</small></strong></div><div><small>Texto normal (4,5:1)</small><strong>${razao>=4.5?'passa':'não passa'}</strong></div><div><small>Texto grande (3:1)</small><strong>${razao>=3?'passa':'não passa'}</strong></div>`;
   explicacao.definir(`<strong>${estado.nomeHarmonia}.</strong> ${harmonia==='complementar'?'Cores opostas no círculo (180°) criam o contraste de matiz mais forte; usá-las em áreas desiguais evita vibração.':harmonia==='analoga'?'Matizes vizinhos (±30°) produzem unidade; uma versão mais clara e dessaturada serve de fundo.':harmonia==='triade'?'Três matizes equidistantes (120°) dão variedade equilibrada; escolha um dominante.':'Um único matiz com luminosidades diferentes garante harmonia; o contraste vem só da luminosidade.'} Contraste texto/fundo: ${formatarNumero(razao,2)}:1 (${razao>=7?'excelente':razao>=4.5?'suficiente para texto':razao>=3?'só para títulos grandes':'insuficiente'}).`);
   alternativo(`Paleta ${estado.nomeHarmonia}: ${lista.join(', ')}. Contraste ${formatarNumero(razao,2)} para 1.`);
   desenhar();api.atualizar(estado);api.guardar({h:estado.h,s:estado.s,l:estado.l,paletas:salvas});
   areaSalvas.replaceChildren(...salvas.flatMap(p=>p.map(cor=>criar('i',{estilo:`background:${cor}`,title:cor}))));
  }
  salvar.onclick=()=>{salvas=[...salvas,estado.paleta].slice(-6);atualizar();api.avisar('Paleta guardada neste navegador.');};
  tela.tela.addEventListener('redimensionar',desenhar);
  atualizar();
  return {estado:()=>estado,reiniciar(){controles.h.valor=210;controles.s.valor=60;controles.l.valor=45;harmonia='complementar';opcoes.selecionar('complementar');texto=1;fundo=0;atualizar();},limpar(){tela.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Escolha a harmonia complementar e uma cor-base com matiz entre 20° e 40° (laranja). Qual é a complementar?',verificar:e=>e.harmonia==='complementar'&&e.h>=20&&e.h<=40},
  {texto:'Mude para monocromática e encontre um par texto/fundo com contraste de pelo menos 4,5:1.',verificar:e=>e.harmonia==='monocromatica'&&e.contraste>=4.5},
  {texto:'Guarde uma paleta.',verificar:e=>e.salvas.length>0}
 ]},
 desafio:{titulo:'Paleta legível de tríade',descricao:'Com a harmonia <strong>tríade</strong>, obtenha um par texto/fundo com contraste <strong>≥ 7:1</strong> e guarde a paleta.',verificar:e=>{if(e.harmonia!=='triade')return {ok:false,mensagem:'Use a tríade.'};if(e.contraste<7)return {ok:false,mensagem:`Contraste ${formatarNumero(e.contraste,2)}:1. Ajuste a luminosidade da base: a quarta cor da tríade é uma versão clara dela.`};const guardada=e.salvas.some(p=>p.join()===e.paleta.join());return guardada?{ok:true,mensagem:'Contraste excelente e paleta guardada.'}:{ok:false,mensagem:'O contraste está bom; guarde a paleta.'};}}
};

const composicao={
 id:'composicao',nome:'Composição com formas',
 descricao:'Adicione retângulos, círculos e triângulos, mova-os, mude cores e tamanhos. Guias de terços e proporção áurea ajudam a decidir onde o olhar deve pousar.',
 objetivos:['Usar regra dos terços e proporção áurea como guias, não regras.','Criar hierarquia por tamanho, contraste e posição.','Equilibrar pesos visuais.'],
 instrucoes:['Clique em “+ forma” para adicionar; arraste para mover; use os controles para tamanho e cor.','Ative as guias e aproxime o ponto focal de uma interseção.','Baixe a imagem ou guarde a composição neste navegador.'],
 modelo:['Peso visual estimado pela área da forma e pelo contraste com o fundo (medida didática).','Canvas de 640 × 400 unidades.'],
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:400,descricao:'Tela de composição'});
  let formas=api.estadoGuardado?.formas||[{tipo:'retangulo',x:120,y:140,tamanho:160,cor:'#d1ad6c'},{tipo:'circulo',x:430,y:150,tamanho:90,cor:'#86b4d8'}],selecionada=0,guia='tercos',fundo=api.estadoGuardado?.fundo||'#15242c',arrasto=null;
  const ferramentas=criar('div',{classe:'ferramentas-atelie'});area.append(ferramentas);
  [['retangulo','+ retângulo'],['circulo','+ círculo'],['triangulo','+ triângulo'],['linha','+ linha']].forEach(([t,r])=>{const b=criar('button',{type:'button',classe:'botao pequeno',texto:r});b.onclick=()=>{formas.push({tipo:t,x:320,y:200,tamanho:100,cor:hslParaHex(Math.random()*360,55,55)});selecionada=formas.length-1;atualizar();};ferramentas.append(b);});
  const remover=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Remover selecionada'});remover.onclick=()=>{if(formas.length){formas.splice(selecionada,1);selecionada=Math.max(0,selecionada-1);atualizar();}};ferramentas.append(remover);
  const lFundo=criar('label',{html:'Fundo <input type="color">'});buscar('input',lFundo).value=fundo;buscar('input',lFundo).oninput=e=>{fundo=e.target.value;atualizar();};ferramentas.append(lFundo);
  const lCor=criar('label',{html:'Cor da forma <input type="color">'});ferramentas.append(lCor);
  buscar('input',lCor).oninput=e=>{if(formas[selecionada]){formas[selecionada].cor=e.target.value;atualizar();}};
  botoesOpcoes(area,[{valor:'nenhuma',rotulo:'Sem guias'},{valor:'tercos',rotulo:'Terços'},{valor:'aurea',rotulo:'Proporção áurea'},{valor:'centro',rotulo:'Centro'}],{selecionado:guia,aoEscolher:v=>{guia=v;desenhar();},rotulo:'Guias'});
  const controles=grupoControles(area,[{chave:'tamanho',rotulo:'Tamanho',min:20,max:300,passo:5,valor:160,unidade:'px',aoMudar:v=>{if(formas[selecionada]){formas[selecionada].tamanho=v;atualizar();}}}]);
  const mostrar=criar('div',{classe:'leitura-laboratorio'});area.append(mostrar);
  const acoes=criar('div',{classe:'botoes-opcoes'});area.append(acoes);
  botaoBaixar(acoes,tela.tela,'composicao-noesis.png');
  const guardar=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Guardar composição'});guardar.onclick=()=>{api.guardar({formas,fundo});api.avisar('Composição guardada neste navegador.');};acoes.append(guardar);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  const esc=()=>tela.largura/640;
  function desenharForma(c,f,k){
   c.fillStyle=f.cor;c.strokeStyle=f.cor;const t=f.tamanho*k,x=f.x*k,y=f.y*k;
   if(f.tipo==='retangulo')c.fillRect(x-t/2,y-t*.35,t,t*.7);
   else if(f.tipo==='circulo'){c.beginPath();c.arc(x,y,t/2,0,7);c.fill();}
   else if(f.tipo==='triangulo'){c.beginPath();c.moveTo(x,y-t/2);c.lineTo(x+t/2,y+t/2);c.lineTo(x-t/2,y+t/2);c.closePath();c.fill();}
   else{c.lineWidth=Math.max(2,t/30);c.beginPath();c.moveTo(x-t/2,y+t/6);c.lineTo(x+t/2,y-t/6);c.stroke();}
  }
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;const k=esc();
   c.fillStyle=fundo;c.fillRect(0,0,L,A);
   formas.forEach((f,i)=>{desenharForma(c,f,k);if(i===selecionada){c.strokeStyle='#f1dca6';c.setLineDash([4,4]);c.lineWidth=1;c.strokeRect(f.x*k-f.tamanho*k/2-4,f.y*k-f.tamanho*k/2-4,f.tamanho*k+8,f.tamanho*k+8);c.setLineDash([]);}});
   c.strokeStyle='#ffffff55';c.lineWidth=1;c.setLineDash([5,5]);
   if(guia==='tercos'){[1/3,2/3].forEach(p=>{c.beginPath();c.moveTo(L*p,0);c.lineTo(L*p,A);c.stroke();c.beginPath();c.moveTo(0,A*p);c.lineTo(L,A*p);c.stroke();});}
   if(guia==='aurea'){[.382,.618].forEach(p=>{c.beginPath();c.moveTo(L*p,0);c.lineTo(L*p,A);c.stroke();c.beginPath();c.moveTo(0,A*p);c.lineTo(L,A*p);c.stroke();});}
   if(guia==='centro'){c.beginPath();c.moveTo(L/2,0);c.lineTo(L/2,A);c.stroke();c.beginPath();c.moveTo(0,A/2);c.lineTo(L,A/2);c.stroke();}
   c.setLineDash([]);
  }
  function analisar(){
   const pesos=formas.map(f=>{const areaF=f.tipo==='circulo'?Math.PI*(f.tamanho/2)**2:f.tipo==='retangulo'?f.tamanho*f.tamanho*.7:f.tipo==='triangulo'?f.tamanho*f.tamanho/2:f.tamanho*4;return areaF*Math.min(3,contraste(f.cor,fundo))/3;});
   const total=pesos.reduce((s,p)=>s+p,0)||1;
   const cx=formas.reduce((s,f,i)=>s+f.x*pesos[i],0)/total,cy=formas.reduce((s,f,i)=>s+f.y*pesos[i],0)/total;
   const focal=pesos.length?formas[pesos.indexOf(Math.max(...pesos))]:null;
   const pontosTercos=[[640/3,400/3],[640*2/3,400/3],[640/3,400*2/3],[640*2/3,400*2/3]];
   const distFocal=focal?Math.min(...pontosTercos.map(([px,py])=>Math.hypot(focal.x-px,focal.y-py))):Infinity;
   const dominancia=pesos.length>1?Math.max(...pesos)/total:1;
   return {formas:formas.map(f=>({...f})),fundo,centroPeso:{x:cx,y:cy},focal,distanciaFocal:distFocal,dominancia,equilibrio:Math.hypot(cx-320,cy-200),quantidade:formas.length};
  }
  function atualizar(){
   const f=formas[selecionada];
   if(f){controles.tamanho.valor=f.tamanho;buscar('input',lCor).value=f.cor;}
   const an=analisar();
   mostrar.innerHTML=`<div><small>Formas</small><strong>${an.quantidade}</strong></div><div><small>Dominância do foco</small><strong>${Math.round(an.dominancia*100)}<small>%</small></strong></div><div><small>Foco até um terço</small><strong>${Number.isFinite(an.distanciaFocal)?formatarNumero(an.distanciaFocal,0):'—'}<small>px</small></strong></div><div><small>Desvio do centro de peso</small><strong>${formatarNumero(an.equilibrio,0)}<small>px</small></strong></div>`;
   explicacao.definir(`${an.focal?`A forma de maior peso visual (<strong>${an.focal.tipo}</strong> em ${an.focal.cor}) ${an.distanciaFocal<40?'está sobre uma interseção dos terços: posição clássica para um ponto focal.':'está longe das interseções dos terços; experimente aproximá-la, ou decida conscientemente por outra posição.'} `:'Adicione formas para começar. '}${an.dominancia>.6?'Há um elemento claramente dominante: a hierarquia está definida.':an.quantidade>1?'Os pesos estão parecidos: o olhar não sabe por onde começar. Aumente ou contraste um elemento.':''} ${an.equilibrio>120?'O centro de peso está deslocado: a composição é assimétrica. Isso pode ser intencional; se parecer que tomba, compense do outro lado.':'O peso está relativamente equilibrado.'}`);
   alternativo(`${an.quantidade} formas sobre fundo ${fundo}.`);
   desenhar();api.atualizar(an);
  }
  const canvas=tela.tela;
  canvas.addEventListener('pointerdown',e=>{const caixa=canvas.getBoundingClientRect();const x=(e.clientX-caixa.left)/caixa.width*640,y=(e.clientY-caixa.top)/caixa.height*400;let achou=-1;for(let i=formas.length-1;i>=0;i--){const f=formas[i];if(Math.abs(f.x-x)<=f.tamanho/2&&Math.abs(f.y-y)<=f.tamanho/2){achou=i;break;}}if(achou>=0){selecionada=achou;arrasto={dx:formas[achou].x-x,dy:formas[achou].y-y};canvas.setPointerCapture(e.pointerId);}atualizar();});
  canvas.addEventListener('pointermove',e=>{if(!arrasto)return;const caixa=canvas.getBoundingClientRect();const x=(e.clientX-caixa.left)/caixa.width*640,y=(e.clientY-caixa.top)/caixa.height*400;formas[selecionada].x=Math.max(0,Math.min(640,x+arrasto.dx));formas[selecionada].y=Math.max(0,Math.min(400,y+arrasto.dy));atualizar();});
  canvas.addEventListener('pointerup',()=>arrasto=null);
  canvas.tabIndex=0;canvas.addEventListener('keydown',e=>{const f=formas[selecionada];if(!f)return;const d={ArrowUp:[0,-10],ArrowDown:[0,10],ArrowLeft:[-10,0],ArrowRight:[10,0]}[e.key];if(d){e.preventDefault();f.x+=d[0];f.y+=d[1];atualizar();}if(e.key==='Tab'&&formas.length>1&&!e.shiftKey){e.preventDefault();selecionada=(selecionada+1)%formas.length;atualizar();}});
  canvas.addEventListener('redimensionar',desenhar);
  atualizar();
  return {estado:analisar,reiniciar(){formas=[{tipo:'retangulo',x:120,y:140,tamanho:160,cor:'#d1ad6c'},{tipo:'circulo',x:430,y:150,tamanho:90,cor:'#86b4d8'}];selecionada=0;fundo='#15242c';buscar('input',lFundo).value=fundo;atualizar();},limpar(){tela.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Ative as guias de terços e leve a forma dominante para menos de 40 px de uma interseção.',verificar:e=>e.distanciaFocal<40},
  {texto:'Adicione uma terceira forma.',verificar:e=>e.quantidade>=3},
  {texto:'Faça uma forma dominar: aumente-a ou dê mais contraste até a dominância passar de 55%.',verificar:e=>e.quantidade>=3&&e.dominancia>.55}
 ]},
 desafio:{titulo:'Equilíbrio assimétrico',descricao:'Com pelo menos <strong>quatro formas</strong>, um foco sobre um terço (até 40 px) e dominância acima de 50%, mantenha o centro de peso a <strong>menos de 60 px do centro</strong> da tela.',verificar:e=>{if(e.quantidade<4)return {ok:false,mensagem:`${e.quantidade} forma(s); precisa de 4.`};if(e.distanciaFocal>=40)return {ok:false,mensagem:'O foco ainda não está sobre uma interseção dos terços.'};if(e.dominancia<=.5)return {ok:false,mensagem:`Dominância ${Math.round(e.dominancia*100)}%.`};return e.equilibrio<60?{ok:true,mensagem:'Foco fora do centro, mas composição equilibrada: pesos menores do outro lado compensam o dominante.'}:{ok:false,mensagem:`O centro de peso está a ${formatarNumero(e.equilibrio,0)} px do centro. Distribua formas menores do lado oposto ao foco.`};}}
};

const perspectiva={
 id:'perspectiva',nome:'Perspectiva linear',
 descricao:'Mova a linha do horizonte e os pontos de fuga; desenhe caixas em perspectiva de um ou dois pontos e veja como a altura do observador muda tudo.',
 objetivos:['Entender horizonte como altura do olhar.','Construir caixas em perspectiva com um e dois pontos de fuga.','Perceber como a distância entre pontos de fuga afeta a distorção.'],
 instrucoes:['Escolha um ou dois pontos de fuga.','Arraste o horizonte e os pontos de fuga com os controles.','Ajuste posição e tamanho da caixa e observe as linhas convergindo.'],
 modelo:['Perspectiva linear idealizada: o observador é um ponto e não há distorção de lente.','As arestas verticais permanecem verticais (sem terceiro ponto de fuga).'],
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:400,descricao:'Caixa em perspectiva com pontos de fuga'});
  let modo=api.estadoGuardado?.modo||'um';
  const opcoes=botoesOpcoes(area,[{valor:'um',rotulo:'Um ponto de fuga'},{valor:'dois',rotulo:'Dois pontos de fuga'}],{selecionado:modo,aoEscolher:v=>{modo=v;atualizar();},rotulo:'Modo'});
  const controles=grupoControles(area,[{chave:'horizonte',rotulo:'Altura do horizonte',min:10,max:90,passo:1,valor:45,unidade:'%',aoMudar:atualizar},{chave:'fuga',rotulo:'Ponto de fuga (x)',min:5,max:95,passo:1,valor:50,unidade:'%',aoMudar:atualizar},{chave:'distancia',rotulo:'Distância entre pontos (2 pontos)',min:40,max:160,passo:5,valor:110,unidade:'%',aoMudar:atualizar},{chave:'caixaX',rotulo:'Posição da caixa',min:10,max:90,passo:1,valor:35,unidade:'%',aoMudar:atualizar},{chave:'caixaY',rotulo:'Base da caixa',min:10,max:95,passo:1,valor:85,unidade:'%',aoMudar:atualizar},{chave:'altura',rotulo:'Altura da caixa',min:10,max:70,passo:1,valor:35,unidade:'%',aoMudar:atualizar},{chave:'profundidade',rotulo:'Profundidade',min:10,max:90,passo:1,valor:45,unidade:'%',aoMudar:atualizar}]);
  const acoes=criar('div',{classe:'botoes-opcoes'});area.append(acoes);botaoBaixar(acoes,tela.tela,'perspectiva-noesis.png');
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  let estado={};
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;c.fillStyle='#f4ecd8';c.fillRect(0,0,L,A);
   const hy=controles.horizonte.valor/100*A,fx=controles.fuga.valor/100*L,d=controles.distancia.valor/100*L;
   const bx=controles.caixaX.valor/100*L,by=controles.caixaY.valor/100*A,h=controles.altura.valor/100*A,prof=controles.profundidade.valor/100;
   c.strokeStyle='#7a6a4a';c.lineWidth=1;c.setLineDash([6,4]);c.beginPath();c.moveTo(0,hy);c.lineTo(L,hy);c.stroke();c.setLineDash([]);
   c.fillStyle='#8a5a2a';c.font='11px Georgia';c.textAlign='left';c.fillText('horizonte (altura do olhar)',6,hy-5);
   const pontoFuga=(x)=>{c.fillStyle='#b63f3f';c.beginPath();c.arc(x,hy,5,0,7);c.fill();};
   const linhaAte=(x1,y1,x2,y2,cor='#2a2419',largura=1.6)=>{c.strokeStyle=cor;c.lineWidth=largura;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};
   const interp=(x1,y1,x2,y2,t)=>[x1+(x2-x1)*t,y1+(y2-y1)*t];
   const guia=(x1,y1,x2,y2)=>linhaAte(x1,y1,x2,y2,'#b63f3f44',1);
   if(modo==='um'){
    pontoFuga(fx);const w=h*1.1;
    const frente=[[bx-w/2,by],[bx+w/2,by],[bx+w/2,by-h],[bx-w/2,by-h]];
    frente.forEach(([x,y])=>guia(x,y,fx,hy));
    const tras=frente.map(([x,y])=>interp(x,y,fx,hy,prof*.6));
    c.fillStyle='#d1ad6c55';c.beginPath();tras.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
    for(let i=0;i<4;i++){linhaAte(...frente[i],...tras[i]);linhaAte(...tras[i],...tras[(i+1)%4]);}
    c.fillStyle='#d1ad6c99';c.beginPath();frente.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();for(let i=0;i<4;i++)linhaAte(...frente[i],...frente[(i+1)%4]);
    estado={modo,horizonte:controles.horizonte.valor,fuga:controles.fuga.valor,distancia:controles.distancia.valor,caixaY:controles.caixaY.valor,acimaHorizonte:by-h<hy};
   }else{
    const f1=fx-d/2,f2=fx+d/2;pontoFuga(f1);pontoFuga(f2);
    const topo=by-h;
    guia(bx,by,f1,hy);guia(bx,by,f2,hy);guia(bx,topo,f1,hy);guia(bx,topo,f2,hy);
    const e1=interp(bx,by,f1,hy,prof*.5),e2=interp(bx,by,f2,hy,prof*.5);
    const t1=interp(bx,topo,f1,hy,prof*.5),t2=interp(bx,topo,f2,hy,prof*.5);
    c.fillStyle='#d1ad6c99';c.beginPath();c.moveTo(bx,by);c.lineTo(...e1);c.lineTo(...t1);c.lineTo(bx,topo);c.closePath();c.fill();
    c.fillStyle='#d1ad6c66';c.beginPath();c.moveTo(bx,by);c.lineTo(...e2);c.lineTo(...t2);c.lineTo(bx,topo);c.closePath();c.fill();
    [[bx,by,bx,topo],[bx,by,...e1],[bx,by,...e2],[bx,topo,...t1],[bx,topo,...t2],[...e1,...t1],[...e2,...t2]].forEach(l=>linhaAte(...l));
    if(topo<hy){const tt1=interp(...t1,f2,hy,.4),tt2=interp(...t2,f1,hy,.4);c.fillStyle='#d1ad6c33';c.beginPath();c.moveTo(bx,topo);c.lineTo(...t1);c.lineTo((tt1[0]+tt2[0])/2,(tt1[1]+tt2[1])/2);c.lineTo(...t2);c.closePath();c.fill();}
    estado={modo,horizonte:controles.horizonte.valor,fuga:controles.fuga.valor,distancia:controles.distancia.valor,caixaY:controles.caixaY.valor,acimaHorizonte:topo<hy};
   }
   const tamanhoFonte=10;c.fillStyle='#2a2419';c.font=`${tamanhoFonte}px Arial`;c.textAlign='right';c.fillText(modo==='um'?'perspectiva de um ponto: face frontal paralela ao observador':'perspectiva de dois pontos: aresta vertical de frente para o observador',L-6,A-8);
  }
  function atualizar(){
   desenhar();
   explicacao.definir(`${controles.horizonte.valor<35?'Horizonte baixo: o observador está perto do chão ou olhando de baixo; as formas ganham monumentalidade.':controles.horizonte.valor>65?'Horizonte alto: visão de cima, como de uma janela; vemos o topo dos objetos.':'Horizonte médio: altura dos olhos de uma pessoa em pé.'} ${modo==='dois'?(controles.distancia.valor<70?'Pontos de fuga próximos exageram a convergência: o efeito é de lente grande-angular, com distorção.':'Pontos de fuga afastados dão convergência suave, mais natural.'):'Com um ponto, todas as linhas de profundidade correm para o mesmo lugar: ideal para corredores, ruas e interiores vistos de frente.'} ${estado.acimaHorizonte?'A caixa ultrapassa o horizonte: não vemos seu topo.':'A caixa fica abaixo do horizonte: seu topo é visível.'}`);
   alternativo(`Perspectiva de ${modo==='um'?'um':'dois'} ponto(s), horizonte a ${controles.horizonte.valor}% da altura.`);
   api.atualizar(estado);api.guardar({modo});
  }
  tela.tela.addEventListener('redimensionar',desenhar);
  atualizar();
  return {estado:()=>estado,reiniciar(){modo='um';opcoes.selecionar('um');['horizonte','fuga','distancia','caixaX','caixaY','altura','profundidade'].forEach((k,i)=>controles[k].valor=[45,50,110,35,85,35,45][i]);atualizar();},limpar(){tela.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Com um ponto de fuga, baixe o horizonte para menos de 30% e observe a caixa ganhar imponência.',verificar:e=>e.modo==='um'&&e.horizonte<30},
  {texto:'Suba o horizonte acima de 70%: agora vemos o topo da caixa.',verificar:e=>e.horizonte>70&&!e.acimaHorizonte},
  {texto:'Mude para dois pontos de fuga e aproxime-os (distância menor que 70%) para ver a distorção.',verificar:e=>e.modo==='dois'&&e.distancia<70}
 ]},
 desafio:{titulo:'Vista natural de dois pontos',descricao:'Em dois pontos de fuga, configure horizonte entre 40% e 55%, distância entre pontos de pelo menos 120% e a caixa inteira abaixo do horizonte (topo visível).',verificar:e=>{if(e.modo!=='dois')return {ok:false,mensagem:'Use dois pontos de fuga.'};if(e.horizonte<40||e.horizonte>55)return {ok:false,mensagem:'Horizonte entre 40% e 55% (altura dos olhos).'};if(e.distancia<120)return {ok:false,mensagem:'Afaste os pontos de fuga a pelo menos 120%.'};return e.acimaHorizonte?{ok:false,mensagem:'A caixa ultrapassa o horizonte. Reduza a altura ou baixe a base.'}:{ok:true,mensagem:'Vista natural: convergência suave, topo visível, observador em pé.'};}}
};

const TEXTO_EXEMPLO='O conhecimento não deve ser apenas transmitido. Deve ser explorado, experimentado, questionado e compreendido. Uma página bem composta não chama atenção para si: ela desaparece, e o que fica é o texto. O tamanho da letra, o espaço entre linhas e a largura da coluna decidem, antes de qualquer palavra, se a leitura vai ser confortável ou cansativa.';
const tipografia={
 id:'tipografia',nome:'Tipografia e leitura',
 descricao:'Ajuste família, tamanho, entrelinha, largura da coluna e espaçamento. O laboratório calcula caracteres por linha e sinaliza medidas confortáveis.',
 objetivos:['Relacionar tamanho, entrelinha e largura da coluna.','Reconhecer a medida (caracteres por linha) como variável de conforto.','Comparar serifadas, sem serifa e monoespaçadas.'],
 instrucoes:['Escolha a família e ajuste os controles.','Observe o número de caracteres por linha: entre 45 e 75 costuma ser confortável.','Compare o mesmo texto com entrelinha apertada e folgada.'],
 modelo:['Caracteres por linha estimados a partir da largura média dos caracteres do texto na fonte escolhida.','Faixas de conforto são orientações de design editorial, não regras absolutas.'],
 montar(area,api){
  let familia='Georgia, serif';
  const opcoes=botoesOpcoes(area,[{valor:'Georgia, serif',rotulo:'Serifada'},{valor:'Arial, Helvetica, sans-serif',rotulo:'Sem serifa'},{valor:'ui-monospace, Consolas, monospace',rotulo:'Monoespaçada'}],{selecionado:familia,aoEscolher:v=>{familia=v;atualizar();},rotulo:'Família'});
  const controles=grupoControles(area,[{chave:'tamanho',rotulo:'Tamanho',min:12,max:28,passo:1,valor:17,unidade:'px',aoMudar:atualizar},{chave:'entrelinha',rotulo:'Entrelinha',min:1,max:2.2,passo:.05,valor:1.5,unidade:'×',aoMudar:atualizar},{chave:'largura',rotulo:'Largura da coluna',min:30,max:100,passo:5,valor:70,unidade:'%',aoMudar:atualizar},{chave:'espaco',rotulo:'Espaçamento entre letras',min:-1,max:3,passo:.25,valor:0,unidade:'px',aoMudar:atualizar}]);
  const previa=criar('div',{classe:'previa-tipografia'});area.append(previa);
  const mostrar=criar('div',{classe:'leitura-laboratorio'});area.append(mostrar);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  let estado={};
  function atualizar(){
   const t=controles.tamanho.valor,el=controles.entrelinha.valor,lg=controles.largura.valor,es=controles.espaco.valor;
   previa.innerHTML=`<div style="font-family:${familia};font-size:${t}px;line-height:${el};letter-spacing:${es}px;max-width:${lg}%"><h4 style="font-size:${t*1.6}px;line-height:1.15;letter-spacing:${es*.5}px">Um universo de aprendizagem</h4><p>${TEXTO_EXEMPLO}</p></div>`;
   const medidor=document.createElement('canvas').getContext('2d');medidor.font=`${t}px ${familia}`;
   const larguraMedia=medidor.measureText(TEXTO_EXEMPLO).width/TEXTO_EXEMPLO.length+es;
   const larguraPx=previa.clientWidth*lg/100-52;
   const cpl=Math.round(larguraPx/larguraMedia);
   estado={familia,tamanho:t,entrelinha:el,largura:lg,espaco:es,caracteresPorLinha:cpl,confortavel:cpl>=45&&cpl<=75&&el>=1.35&&el<=1.7&&t>=15};
   mostrar.innerHTML=`<div><small>Caracteres por linha</small><strong>${cpl}</strong></div><div><small>Medida</small><strong>${cpl<45?'curta':cpl>75?'longa':'confortável'}</strong></div><div><small>Entrelinha</small><strong>${el<1.3?'apertada':el>1.75?'folgada':'adequada'}</strong></div>`;
   explicacao.definir(`<strong>${cpl} caracteres por linha.</strong> ${cpl<45?'Linhas curtas fragmentam a leitura e multiplicam as quebras.':cpl>75?'Linhas longas dificultam encontrar o início da próxima linha; aumente o tamanho ou reduza a coluna.':'A medida está na faixa confortável (45–75).'} ${el<1.3?'Entrelinha apertada embaralha as linhas.':el>1.75?'Entrelinha muito folgada desconecta as linhas; cabe em textos curtos.':'A entrelinha dá respiro sem separar demais.'} ${familia.includes('monospace')?'Fontes monoespaçadas são boas para código, mas ocupam mais espaço e cansam em texto corrido.':familia.includes('Georgia')?'Serifas ajudam a guiar o olho em textos longos impressos; na tela, a escolha depende do tamanho e da renderização.':'Sem serifa funciona bem em tamanhos pequenos e interfaces.'}`);
   alternativo(`${familia.split(',')[0]} a ${t} px, entrelinha ${el}, coluna ${lg}%, ${cpl} caracteres por linha.`);
   api.atualizar(estado);
  }
  const observador=new ResizeObserver(()=>atualizar());observador.observe(previa);
  atualizar();
  return {estado:()=>estado,reiniciar(){familia='Georgia, serif';opcoes.selecionar(familia);controles.tamanho.valor=17;controles.entrelinha.valor=1.5;controles.largura.valor=70;controles.espaco.valor=0;atualizar();},limpar(){observador.disconnect();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Alargue a coluna para 100% com letra pequena (≤ 13 px) e veja a medida ficar longa.',verificar:e=>e.largura===100&&e.tamanho<=13},
  {texto:'Aperte a entrelinha para 1,0 e observe as linhas se embaralharem.',verificar:e=>e.entrelinha<=1.05},
  {texto:'Encontre uma combinação confortável: 45–75 caracteres por linha, entrelinha entre 1,35 e 1,7 e tamanho ≥ 15 px.',verificar:e=>e.confortavel}
 ]},
 desafio:{titulo:'Conforto em sem serifa',descricao:'Com a família <strong>sem serifa</strong>, obtenha entre 55 e 65 caracteres por linha, entrelinha entre 1,45 e 1,6 e tamanho de pelo menos 16 px.',verificar:e=>{if(!e.familia.includes('Arial'))return {ok:false,mensagem:'Use a família sem serifa.'};if(e.tamanho<16)return {ok:false,mensagem:'Tamanho mínimo: 16 px.'};if(e.entrelinha<1.45||e.entrelinha>1.6)return {ok:false,mensagem:`Entrelinha ${e.entrelinha}; use entre 1,45 e 1,6.`};return e.caracteresPorLinha>=55&&e.caracteresPorLinha<=65?{ok:true,mensagem:`${e.caracteresPorLinha} caracteres por linha: medida clássica de livro.`}:{ok:false,mensagem:`${e.caracteresPorLinha} caracteres por linha. Ajuste a largura da coluna.`};}}
};

export const definicao={titulo:'Laboratório criativo',descricao:'Cor com medidas de contraste, composição com pesos visuais, perspectiva com pontos de fuga e tipografia com caracteres por linha. Tudo o que você cria pode ser guardado neste navegador ou baixado como imagem.',experimentos:[cores,composicao,perspectiva,tipografia]};
