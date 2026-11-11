// Renan | renancodando
import {criarTela,grupoControles,botoesOpcoes,painelExplicacao,textoAlternativo,eixos,tracarCurva,paleta,formatarNumero,criar,buscar,buscarTodos} from '../aulas/interativos/base.js';

function leitura(area,campos){
 const caixa=criar('div',{classe:'leitura-laboratorio'});const saidas={};
 campos.forEach(([chave,rotulo,unidade])=>{const item=criar('div',{html:`<small>${rotulo}</small><strong><span data-valor>—</span>${unidade?`<small>${unidade}</small>`:''}</strong>`});saidas[chave]=buscar('[data-valor]',item);caixa.append(item);});
 area.append(caixa);
 return valores=>Object.entries(valores).forEach(([k,v])=>{if(saidas[k])saidas[k].textContent=v;});
}

const FAMILIAS={
 afim:{nome:'Afim',coef:[['a',-5,5,.1,1],['b',-6,6,.5,0]],f:(c,x)=>c.a*x+c.b,texto:c=>`${formatarNumero(c.a,1)}x ${c.b<0?'−':'+'} ${formatarNumero(Math.abs(c.b),1)}`},
 quadratica:{nome:'Quadrática',coef:[['a',-3,3,.1,1],['b',-6,6,.5,0],['c',-6,6,.5,0]],f:(c,x)=>c.a*x*x+c.b*x+c.c,texto:c=>`${formatarNumero(c.a,1)}x² ${c.b<0?'−':'+'} ${formatarNumero(Math.abs(c.b),1)}x ${c.c<0?'−':'+'} ${formatarNumero(Math.abs(c.c),1)}`},
 exponencial:{nome:'Exponencial',coef:[['a',-4,4,.1,1],['b',.2,3,.05,2]],f:(c,x)=>c.a*Math.pow(c.b,x),texto:c=>`${formatarNumero(c.a,1)}·${formatarNumero(c.b,2)}ˣ`},
 seno:{nome:'Senoidal',coef:[['a',-4,4,.1,2],['b',.2,4,.1,1],['c',-4,4,.5,0]],f:(c,x)=>c.a*Math.sin(c.b*x)+c.c,texto:c=>`${formatarNumero(c.a,1)}·sen(${formatarNumero(c.b,1)}x) ${c.c<0?'−':'+'} ${formatarNumero(Math.abs(c.c),1)}`},
 reciproca:{nome:'Recíproca',coef:[['a',-5,5,.5,1],['b',-4,4,.5,0]],f:(c,x)=>c.a/(x-c.b),texto:c=>`${formatarNumero(c.a,1)}/(x ${c.b<0?'+':'−'} ${formatarNumero(Math.abs(c.b),1)})`}
};

const funcoes={
 id:'funcoes',nome:'Funções lado a lado',
 descricao:'Duas funções no mesmo plano. Ajuste coeficientes, encontre interseções numericamente e leia tabelas de valores.',
 objetivos:['Comparar famílias de funções e o papel de cada coeficiente.','Localizar interseções entre curvas.','Relacionar tabela de valores e gráfico.'],
 instrucoes:['Escolha a família de cada função e ajuste seus coeficientes.','Observe os pontos de interseção marcados em laranja.','Use a tabela para conferir valores exatos em x inteiros.'],
 modelo:['As interseções são encontradas por varredura numérica com bissecção; tangências podem não ser detectadas.','O plano mostra x e y entre −8 e 8 com escala uniforme.'],
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:380,descricao:'Plano cartesiano com duas funções'});
  const lim=8;
  const funcs=[{familia:'afim',cor:paleta.ouro,coef:{}},{familia:'quadratica',cor:paleta.azul,coef:{}}];
  const painel=criar('div',{classe:'comparacao'});area.append(painel);
  const colunas=funcs.map((fn,i)=>{const col=criar('div',{classe:'coluna-comparacao'});col.innerHTML=`<h4 style="color:${fn.cor}">Função ${i+1}</h4>`;painel.append(col);return col;});
  const mostrar=leitura(area,[['intersecoes','Interseções'],['f1','f₁(x₀)'],['f2','f₂(x₀)']]);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  const tabela=criar('div',{classe:'rolagem-tabela'});area.append(tabela);
  let controles=[{},{}],x0=1,intersecoes=[];
  function montarColuna(i){
   const col=colunas[i];col.innerHTML=`<h4 style="color:${funcs[i].cor}">Função ${i+1}</h4>`;
   botoesOpcoes(col,Object.entries(FAMILIAS).map(([v,f])=>({valor:v,rotulo:f.nome})),{selecionado:funcs[i].familia,aoEscolher:v=>{funcs[i].familia=v;montarColuna(i);atualizar();},rotulo:`Família da função ${i+1}`});
   const def=FAMILIAS[funcs[i].familia];
   controles[i]=grupoControles(col,def.coef.map(([chave,min,max,passo,valor])=>({chave,rotulo:chave,min,max,passo,valor:funcs[i].coef[chave]??valor,aoMudar:atualizar})),{ladoALado:false});
  }
  function coeficientes(i){const c={};Object.entries(controles[i]).forEach(([k,v])=>c[k]=v.valor);funcs[i].coef=c;return c;}
  function encontrarIntersecoes(f1,f2){
   const pontos=[];let xa=-lim,ya=f1(xa)-f2(xa);
   for(let i=1;i<=800;i++){const xb=-lim+i*(2*lim/800);const yb=f1(xb)-f2(xb);if(Number.isFinite(ya)&&Number.isFinite(yb)&&Math.abs(ya)<1e4&&Math.abs(yb)<1e4&&ya*yb<0){let lo=xa,hi=xb;for(let k=0;k<40;k++){const m=(lo+hi)/2;const ym=f1(m)-f2(m);if(ym*(f1(lo)-f2(lo))<=0)hi=m;else lo=m;}const x=(lo+hi)/2;pontos.push({x,y:f1(x)});}xa=xb;ya=yb;}
   return pontos.filter(p=>Math.abs(p.y)<=lim);
  }
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
   const {ex,ey}=eixos(c,{largura:L,altura:A,xMin:-lim,xMax:lim,yMin:-lim,yMax:lim,passoX:2,passoY:2});
   funcs.forEach((fn,i)=>{const def=FAMILIAS[fn.familia];const cc=fn.coef;tracarCurva(c,x=>def.f(cc,x),{ex,ey,xMin:-lim,xMax:lim,cor:fn.cor,largura:2.2,amostras:600});c.fillStyle=fn.cor;c.font='500 13px Georgia';c.textAlign='left';c.fillText(`f${i+1}(x) = ${def.texto(cc)}`,10,16+i*18);});
   intersecoes.forEach(p=>{c.fillStyle=paleta.ambar;c.beginPath();c.arc(ex(p.x),ey(p.y),5,0,7);c.fill();c.fillStyle='#f5dfb9';c.font='11px Georgia';c.textAlign='left';c.fillText(`(${formatarNumero(p.x,2)}, ${formatarNumero(p.y,2)})`,ex(p.x)+8,ey(p.y)-8);});
   c.strokeStyle='#ffffff55';c.setLineDash([3,4]);c.beginPath();c.moveTo(ex(x0),0);c.lineTo(ex(x0),A);c.stroke();c.setLineDash([]);
  }
  function atualizar(){
   const c1=coeficientes(0),c2=coeficientes(1);
   const f1=x=>FAMILIAS[funcs[0].familia].f(c1,x),f2=x=>FAMILIAS[funcs[1].familia].f(c2,x);
   intersecoes=encontrarIntersecoes(f1,f2);
   mostrar({intersecoes:String(intersecoes.length),f1:formatarNumero(f1(x0),2),f2:formatarNumero(f2(x0),2)});
   tabela.innerHTML=`<table class="tabela"><thead><tr><th>x</th>${[-3,-2,-1,0,1,2,3].map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody><tr><th>f₁</th>${[-3,-2,-1,0,1,2,3].map(x=>`<td>${Number.isFinite(f1(x))?formatarNumero(f1(x),2):'—'}</td>`).join('')}</tr><tr><th>f₂</th>${[-3,-2,-1,0,1,2,3].map(x=>`<td>${Number.isFinite(f2(x))?formatarNumero(f2(x),2):'—'}</td>`).join('')}</tr></tbody></table>`;
   explicacao.definir(intersecoes.length?`As curvas se cruzam em <strong>${intersecoes.length} ponto${intersecoes.length>1?'s':''}</strong>: ${intersecoes.map(p=>`(${formatarNumero(p.x,2)}, ${formatarNumero(p.y,2)})`).join(', ')}. Em cada interseção, f₁(x) = f₂(x): resolver essa equação é o mesmo que encontrar esses pontos. Clique no gráfico para mover a linha de leitura x₀.`:'As curvas não se cruzam no intervalo visível. A equação f₁(x) = f₂(x) não tem solução aqui, ou a solução fica fora do plano. Clique no gráfico para mover a linha de leitura x₀.');
   alternativo(`f1(x) = ${FAMILIAS[funcs[0].familia].texto(c1)}; f2(x) = ${FAMILIAS[funcs[1].familia].texto(c2)}; ${intersecoes.length} interseções visíveis.`);
   desenhar();
   api.atualizar({funcoes:funcs.map(f=>({familia:f.familia,coef:{...f.coef}})),intersecoes:intersecoes.map(p=>({x:p.x,y:p.y})),x0});
  }
  tela.tela.addEventListener('pointerdown',e=>{const caixa=tela.tela.getBoundingClientRect();x0=Math.round((-lim+(e.clientX-caixa.left)/caixa.width*2*lim)*2)/2;atualizar();});
  tela.tela.addEventListener('redimensionar',desenhar);
  montarColuna(0);montarColuna(1);atualizar();
  return {estado:()=>({funcoes:funcs.map(f=>({familia:f.familia,coef:{...f.coef}})),intersecoes}),reiniciar(){funcs[0]={familia:'afim',cor:paleta.ouro,coef:{}};funcs[1]={familia:'quadratica',cor:paleta.azul,coef:{}};montarColuna(0);montarColuna(1);atualizar();},limpar(){tela.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Faça f₁ ser uma reta com coeficiente angular 2 e f₂ uma parábola com a = 1, b = 0, c = 0. Quantas interseções aparecem?',verificar:e=>e.funcoes[0].familia==='afim'&&e.funcoes[0].coef.a===2&&e.funcoes[1].familia==='quadratica'&&e.funcoes[1].coef.a===1&&e.funcoes[1].coef.b===0&&e.funcoes[1].coef.c===0},
  {texto:'Agora ajuste o coeficiente linear b de f₁ até que a reta toque a parábola em apenas um ponto (tangência) ou não a toque.',verificar:e=>e.funcoes[0].familia==='afim'&&e.funcoes[1].familia==='quadratica'&&e.intersecoes.length<=1},
  {texto:'Troque f₂ para exponencial com base 2 e encontre uma reta que a cruze duas vezes.',verificar:e=>e.funcoes[1].familia==='exponencial'&&Math.abs(e.funcoes[1].coef.b-2)<1e-9&&e.funcoes[0].familia==='afim'&&e.intersecoes.length>=2}
 ]},
 desafio:{titulo:'Três interseções',descricao:'Configure duas funções de famílias <strong>diferentes</strong> que se cruzem em pelo menos <strong>três pontos</strong> dentro do plano visível.',verificar:e=>{if(e.funcoes[0].familia===e.funcoes[1].familia)return {ok:false,mensagem:'As duas funções precisam ser de famílias diferentes.'};const ok=e.intersecoes.length>=3;return {ok,mensagem:ok?`${e.intersecoes.length} interseções entre ${FAMILIAS[e.funcoes[0].familia].nome.toLowerCase()} e ${FAMILIAS[e.funcoes[1].familia].nome.toLowerCase()}.`:`Há ${e.intersecoes.length} interseções. Uma senoide cruzando uma reta pouco inclinada é um bom caminho.`};}}
};

function poligono(pontos){
 let area=0,perimetro=0;
 for(let i=0;i<pontos.length;i++){const a=pontos[i],b=pontos[(i+1)%pontos.length];area+=a.x*b.y-b.x*a.y;perimetro+=Math.hypot(b.x-a.x,b.y-a.y);}
 return {area:Math.abs(area)/2,perimetro};
}
function angulosInternos(p){
 return p.map((v,i)=>{const a=p[(i+p.length-1)%p.length],b=p[(i+1)%p.length];const v1={x:a.x-v.x,y:a.y-v.y},v2={x:b.x-v.x,y:b.y-v.y};const ang=Math.acos((v1.x*v2.x+v1.y*v2.y)/(Math.hypot(v1.x,v1.y)*Math.hypot(v2.x,v2.y)||1))*180/Math.PI;return ang;});
}

const geometria={
 id:'geometria',nome:'Geometria com pontos móveis',
 descricao:'Arraste os vértices de uma figura sobre a grade e acompanhe área, perímetro e ângulos calculados em tempo real.',
 objetivos:['Relacionar a posição dos vértices com área e perímetro.','Reconhecer que figuras de mesmo perímetro podem ter áreas diferentes.','Verificar a soma dos ângulos internos de triângulos e quadriláteros.'],
 instrucoes:['Escolha o número de vértices e arraste cada ponto (os vértices se encaixam na grade).','Leia área, perímetro e ângulos no visor.','Compare figuras: tente manter o perímetro e aumentar a área.'],
 modelo:['A área é calculada pela fórmula do cadarço (Gauss); figuras com lados que se cruzam produzem valores sem significado geométrico.','Unidades de grade: cada quadrado tem lado 1.'],
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:400,descricao:'Grade com figura de vértices arrastáveis'});
  const lim=10;
  let pontos=api.estadoGuardado?.pontos||[{x:2,y:2},{x:8,y:2},{x:5,y:7}];
  const opcoes=botoesOpcoes(area,[{valor:3,rotulo:'Triângulo'},{valor:4,rotulo:'Quadrilátero'},{valor:5,rotulo:'Pentágono'},{valor:6,rotulo:'Hexágono'}],{selecionado:pontos.length,aoEscolher:n=>{pontos=Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2-Math.PI/2;return {x:Math.round(5+3.5*Math.cos(a)),y:Math.round(5+3.5*Math.sin(a))};});atualizar();},rotulo:'Figura'});
  const mostrar=leitura(area,[['area','Área','u²'],['perimetro','Perímetro','u'],['angulos','Soma dos ângulos','°'],['tipo','Classificação']]);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  const lista=criar('p',{classe:'texto-alternativo'});area.append(lista);
  let arrastando=-1,estado={};
  const ex=x=>x/lim*tela.largura,ey=y=>tela.altura-y/lim*tela.altura;
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
   c.strokeStyle='#1d3340';c.lineWidth=1;for(let i=0;i<=lim;i++){c.beginPath();c.moveTo(ex(i),0);c.lineTo(ex(i),A);c.stroke();c.beginPath();c.moveTo(0,ey(i));c.lineTo(L,ey(i));c.stroke();}
   c.fillStyle='#e5c17d22';c.strokeStyle=paleta.ouro;c.lineWidth=2;c.beginPath();pontos.forEach((p,i)=>i?c.lineTo(ex(p.x),ey(p.y)):c.moveTo(ex(p.x),ey(p.y)));c.closePath();c.fill();c.stroke();
   pontos.forEach((p,i)=>{c.fillStyle=i===arrastando?paleta.ambar:'#f1dca6';c.beginPath();c.arc(ex(p.x),ey(p.y),7,0,7);c.fill();c.fillStyle='#e8dcc0';c.font='11px Georgia';c.textAlign='left';c.fillText(`${String.fromCharCode(65+i)} (${p.x}, ${p.y})`,ex(p.x)+10,ey(p.y)-8);});
   const ang=estado.angulos||[];pontos.forEach((p,i)=>{if(!ang[i])return;c.fillStyle='#9fd8ff';c.font='10px Arial';c.fillText(`${formatarNumero(ang[i],0)}°`,ex(p.x)+10,ey(p.y)+14);});
   pontos.forEach((p,i)=>{const q=pontos[(i+1)%pontos.length];const d=Math.hypot(q.x-p.x,q.y-p.y);c.fillStyle='#a9bcc2';c.font='10px Arial';c.textAlign='center';c.fillText(formatarNumero(d,2),(ex(p.x)+ex(q.x))/2,(ey(p.y)+ey(q.y))/2-4);});
  }
  function classificar(){
   const n=pontos.length,lados=pontos.map((p,i)=>{const q=pontos[(i+1)%n];return Math.hypot(q.x-p.x,q.y-p.y);});
   const ang=estado.angulos;
   if(n===3){const iguais=lados.filter((l,i)=>lados.some((m,j)=>j!==i&&Math.abs(l-m)<1e-6)).length;const reto=ang.some(a=>Math.abs(a-90)<.5);return (iguais===3?'equilátero':iguais>=2?'isósceles':'escaleno')+(reto?', retângulo':ang.some(a=>a>90)?', obtusângulo':', acutângulo');}
   if(n===4){const paralelo=(i,j)=>{const a=pontos[i],b=pontos[(i+1)%4],c2=pontos[j],d=pontos[(j+1)%4];return Math.abs((b.x-a.x)*(d.y-c2.y)-(b.y-a.y)*(d.x-c2.x))<1e-6;};const par1=paralelo(0,2),par2=paralelo(1,3);const retos=ang.filter(a=>Math.abs(a-90)<.5).length;const ladosIguais=lados.every(l=>Math.abs(l-lados[0])<1e-6);if(par1&&par2){if(retos===4)return ladosIguais?'quadrado':'retângulo';return ladosIguais?'losango':'paralelogramo';}if(par1||par2)return 'trapézio';return 'quadrilátero irregular';}
   return `polígono de ${n} lados`;
  }
  function atualizar(){
   const {area:ar,perimetro}=poligono(pontos);
   const angulos=angulosInternos(pontos);
   estado={pontos:pontos.map(p=>({...p})),area:ar,perimetro,angulos,soma:angulos.reduce((s,a)=>s+a,0),n:pontos.length};
   estado.tipo=classificar();
   mostrar({area:formatarNumero(ar,2),perimetro:formatarNumero(perimetro,2),angulos:formatarNumero(estado.soma,0),tipo:estado.tipo});
   explicacao.definir(`Figura de ${pontos.length} vértices: <strong>${estado.tipo}</strong>. A soma dos ângulos internos de um polígono simples de n lados é (n − 2)·180° = ${(pontos.length-2)*180}°${Math.abs(estado.soma-(pontos.length-2)*180)>1?'; a soma medida é diferente porque a figura está cruzada ou tem um vértice reentrante':''}. A área ${formatarNumero(ar,2)} u² foi obtida pela fórmula do cadarço com as coordenadas dos vértices.`);
   alternativo(`Vértices: ${pontos.map((p,i)=>`${String.fromCharCode(65+i)}(${p.x}, ${p.y})`).join(', ')}. Área ${formatarNumero(ar,2)}, perímetro ${formatarNumero(perimetro,2)}, ângulos ${angulos.map(a=>formatarNumero(a,0)+'°').join(', ')}.`);
   desenhar();api.atualizar(estado);api.guardar({pontos:estado.pontos});
  }
  const canvas=tela.tela;
  const posicao=e=>{const caixa=canvas.getBoundingClientRect();return {x:(e.clientX-caixa.left)/caixa.width*lim,y:(1-(e.clientY-caixa.top)/caixa.height)*lim};};
  canvas.addEventListener('pointerdown',e=>{const p=posicao(e);let melhor=-1,dist=.8;pontos.forEach((q,i)=>{const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<dist){dist=d;melhor=i;}});arrastando=melhor;if(melhor>=0)canvas.setPointerCapture(e.pointerId);desenhar();});
  canvas.addEventListener('pointermove',e=>{if(arrastando<0)return;const p=posicao(e);pontos[arrastando]={x:Math.max(0,Math.min(lim,Math.round(p.x))),y:Math.max(0,Math.min(lim,Math.round(p.y)))};atualizar();});
  canvas.addEventListener('pointerup',()=>{arrastando=-1;desenhar();});
  canvas.tabIndex=0;
  canvas.addEventListener('keydown',e=>{const teclas={ArrowUp:[0,1],ArrowDown:[0,-1],ArrowLeft:[-1,0],ArrowRight:[1,0]};if(e.key==='Tab')return;if(/^[1-6]$/.test(e.key)){selecionado=Math.min(pontos.length,Number(e.key))-1;e.preventDefault();desenhar();return;}if(teclas[e.key]){e.preventDefault();const p=pontos[selecionado];p.x=Math.max(0,Math.min(lim,p.x+teclas[e.key][0]));p.y=Math.max(0,Math.min(lim,p.y+teclas[e.key][1]));atualizar();}});
  let selecionado=0;
  lista.textContent='Teclado: pressione 1 a 6 para escolher um vértice e as setas para movê-lo.';
  tela.tela.addEventListener('redimensionar',desenhar);
  atualizar();
  return {estado:()=>estado,reiniciar(){pontos=[{x:2,y:2},{x:8,y:2},{x:5,y:7}];opcoes.selecionar(3);atualizar();},limpar(){tela.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Construa um triângulo retângulo (um ângulo de 90°) com área 12 u².',verificar:e=>e.n===3&&e.angulos.some(a=>Math.abs(a-90)<.5)&&Math.abs(e.area-12)<1e-6},
  {texto:'Monte um quadrilátero que seja um retângulo com perímetro 20 u e anote a área.',verificar:e=>e.n===4&&e.tipo==='retângulo'&&Math.abs(e.perimetro-20)<1e-6},
  {texto:'Ainda com perímetro 20 u, transforme-o em um quadrado e compare a área (ela aumenta para 25).',verificar:e=>e.n===4&&e.tipo==='quadrado'&&Math.abs(e.perimetro-20)<1e-6}
 ]},
 desafio:{titulo:'Área máxima com perímetro fixo',descricao:'Com um <strong>hexágono</strong>, obtenha a maior área que conseguir mantendo o perímetro entre <strong>18 e 20 unidades</strong>. Vale qualquer figura com área ≥ 26 u².',verificar:e=>{if(e.n!==6)return {ok:false,mensagem:'Use um hexágono (6 vértices).'};if(e.perimetro<18||e.perimetro>20)return {ok:false,mensagem:`Perímetro atual ${formatarNumero(e.perimetro,2)} u; precisa ficar entre 18 e 20.`};const ok=e.area>=26;return {ok,mensagem:ok?`Área ${formatarNumero(e.area,2)} u² com perímetro ${formatarNumero(e.perimetro,2)} u. Quanto mais próxima de um polígono regular, maior a área para o mesmo perímetro.`:`Área ${formatarNumero(e.area,2)} u². Aproxime a figura de um hexágono regular e convexo.`};}}
};

const transformacoes={
 id:'transformacoes',nome:'Transformações no plano',
 descricao:'Aplique translações, rotações, reflexões e escalas a uma figura e veja as coordenadas da imagem. Componha transformações e descubra equivalências.',
 objetivos:['Descrever cada transformação pelo efeito sobre as coordenadas.','Compor transformações e prever o resultado.','Reconhecer que duas reflexões em eixos perpendiculares equivalem a uma rotação de 180°.'],
 instrucoes:['Ajuste os parâmetros de cada transformação; as caixas marcadas são aplicadas em ordem.','Compare a figura original (tracejada) com a imagem (preenchida).','Leia as coordenadas de cada vértice transformado.'],
 modelo:['Rotações e escalas têm centro na origem; reflexões são em relação aos eixos x e y.','As transformações são aplicadas na ordem: escala, reflexão, rotação, translação.'],
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:400,descricao:'Figura original e sua imagem após transformações'});
  const lim=8;
  const original=[{x:1,y:1},{x:4,y:1},{x:4,y:3},{x:2,y:4}];
  const caixas=criar('div',{classe:'botoes-opcoes'});area.append(caixas);
  const ativas={escala:false,reflexaoX:false,reflexaoY:false,rotacao:false,translacao:true};
  const rotulos={escala:'Escala',reflexaoX:'Reflexão no eixo x',reflexaoY:'Reflexão no eixo y',rotacao:'Rotação',translacao:'Translação'};
  Object.keys(ativas).forEach(k=>{const l=criar('label',{html:`<input type="checkbox" ${ativas[k]?'checked':''}> ${rotulos[k]}`});buscar('input',l).onchange=e=>{ativas[k]=e.target.checked;atualizar();};l.style.cssText='margin:0;display:inline-flex;align-items:center;gap:4px;font-size:12px';caixas.append(l);});
  const controles=grupoControles(area,[
   {chave:'fator',rotulo:'Fator de escala',min:.5,max:2,passo:.25,valor:1.5,unidade:'×',aoMudar:atualizar},
   {chave:'angulo',rotulo:'Ângulo de rotação',min:-180,max:180,passo:15,valor:90,unidade:'°',aoMudar:atualizar},
   {chave:'dx',rotulo:'Translação em x',min:-6,max:6,passo:1,valor:2,aoMudar:atualizar},
   {chave:'dy',rotulo:'Translação em y',min:-6,max:6,passo:1,valor:1,aoMudar:atualizar}
  ]);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  const tabela=criar('div',{classe:'rolagem-tabela'});area.append(tabela);
  let estado={};
  const ex=x=>(x+lim)/(2*lim)*tela.largura,ey=y=>tela.altura-(y+lim)/(2*lim)*tela.altura;
  function transformar(p){
   let {x,y}=p;
   if(ativas.escala){x*=controles.fator.valor;y*=controles.fator.valor;}
   if(ativas.reflexaoX)y=-y;
   if(ativas.reflexaoY)x=-x;
   if(ativas.rotacao){const a=controles.angulo.valor*Math.PI/180;const nx=x*Math.cos(a)-y*Math.sin(a),ny=x*Math.sin(a)+y*Math.cos(a);x=nx;y=ny;}
   if(ativas.translacao){x+=controles.dx.valor;y+=controles.dy.valor;}
   return {x:Math.round(x*100)/100,y:Math.round(y*100)/100};
  }
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
   eixos(c,{largura:L,altura:A,xMin:-lim,xMax:lim,yMin:-lim,yMax:lim,passoX:2,passoY:2});
   c.setLineDash([5,4]);c.strokeStyle='#8aa0a8';c.lineWidth=1.5;c.beginPath();original.forEach((p,i)=>i?c.lineTo(ex(p.x),ey(p.y)):c.moveTo(ex(p.x),ey(p.y)));c.closePath();c.stroke();c.setLineDash([]);
   c.fillStyle='#e5c17d33';c.strokeStyle=paleta.ouro;c.lineWidth=2;c.beginPath();estado.imagem.forEach((p,i)=>i?c.lineTo(ex(p.x),ey(p.y)):c.moveTo(ex(p.x),ey(p.y)));c.closePath();c.fill();c.stroke();
   original.forEach((p,i)=>{c.fillStyle='#8aa0a8';c.font='11px Georgia';c.textAlign='left';c.fillText(String.fromCharCode(65+i),ex(p.x)+5,ey(p.y)-5);});
   estado.imagem.forEach((p,i)=>{c.fillStyle=paleta.ouro;c.beginPath();c.arc(ex(p.x),ey(p.y),4,0,7);c.fill();c.font='11px Georgia';c.textAlign='left';c.fillText(String.fromCharCode(65+i)+"'",ex(p.x)+6,ey(p.y)-6);});
  }
  function atualizar(){
   const imagem=original.map(transformar);
   const {area:a0}=poligono(original),{area:a1}=poligono(imagem);
   estado={ativas:{...ativas},fator:controles.fator.valor,angulo:controles.angulo.valor,dx:controles.dx.valor,dy:controles.dy.valor,imagem,razaoArea:a1/a0};
   const aplicadas=Object.keys(ativas).filter(k=>ativas[k]).map(k=>rotulos[k].toLowerCase());
   tabela.innerHTML=`<table class="tabela"><thead><tr><th>Vértice</th><th>Original</th><th>Imagem</th></tr></thead><tbody>${original.map((p,i)=>`<tr><th>${String.fromCharCode(65+i)}</th><td>(${p.x}, ${p.y})</td><td>(${formatarNumero(imagem[i].x,2)}, ${formatarNumero(imagem[i].y,2)})</td></tr>`).join('')}</tbody></table>`;
   explicacao.definir(`${aplicadas.length?`Transformações aplicadas, em ordem: <strong>${aplicadas.join(' → ')}</strong>.`:'Nenhuma transformação ativa: a imagem coincide com o original.'} A área ${estado.razaoArea===1?'não muda (isometria)':`fica multiplicada por ${formatarNumero(estado.razaoArea,2)} (o quadrado do fator de escala)`}. ${ativas.reflexaoX&&ativas.reflexaoY?'Duas reflexões em eixos perpendiculares produzem o mesmo efeito de uma rotação de 180°: (x, y) → (−x, −y).':''}${ativas.rotacao&&Math.abs(controles.angulo.valor)===90?' Rotação de 90°: (x, y) → (−y, x) no sentido anti-horário.':''}`);
   alternativo(`Imagem: ${imagem.map((p,i)=>`${String.fromCharCode(65+i)}'(${formatarNumero(p.x,2)}, ${formatarNumero(p.y,2)})`).join(', ')}.`);
   desenhar();api.atualizar(estado);
  }
  tela.tela.addEventListener('redimensionar',desenhar);
  atualizar();
  return {estado:()=>estado,reiniciar(){Object.keys(ativas).forEach(k=>ativas[k]=k==='translacao');buscarTodos('input[type=checkbox]',caixas).forEach((c,i)=>c.checked=ativas[Object.keys(ativas)[i]]);controles.fator.valor=1.5;controles.angulo.valor=90;controles.dx.valor=2;controles.dy.valor=1;atualizar();},limpar(){tela.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Desative a translação e ative apenas a rotação de 90°. Confira na tabela que (x, y) virou (−y, x).',verificar:e=>e.ativas.rotacao&&e.angulo===90&&!e.ativas.translacao&&!e.ativas.escala&&!e.ativas.reflexaoX&&!e.ativas.reflexaoY},
  {texto:'Ative somente as duas reflexões (eixo x e eixo y). Compare com uma rotação de 180°.',verificar:e=>e.ativas.reflexaoX&&e.ativas.reflexaoY&&!e.ativas.rotacao&&!e.ativas.escala&&!e.ativas.translacao},
  {texto:'Ative somente a escala com fator 2 e verifique que a área fica 4 vezes maior.',verificar:e=>e.ativas.escala&&e.fator===2&&!e.ativas.reflexaoX&&!e.ativas.reflexaoY&&!e.ativas.rotacao&&!e.ativas.translacao}
 ]},
 desafio:{titulo:'Levar A até (−2, −1)',descricao:'Usando <strong>rotação de 180°</strong> e <strong>translação</strong> (sem escala nem reflexões), faça o vértice A (1, 1) parar exatamente em <strong>(−2, −1)</strong>.',verificar:e=>{if(e.ativas.escala||e.ativas.reflexaoX||e.ativas.reflexaoY)return {ok:false,mensagem:'Use apenas rotação e translação.'};if(!e.ativas.rotacao||Math.abs(e.angulo)!==180)return {ok:false,mensagem:'A rotação precisa ser de 180°.'};const a=e.imagem[0];const ok=Math.abs(a.x+2)<1e-6&&Math.abs(a.y+1)<1e-6;return {ok,mensagem:ok?'A rotação leva A a (−1, −1); a translação (−1, 0) completa o caminho.':`A' está em (${formatarNumero(a.x,2)}, ${formatarNumero(a.y,2)}). Depois da rotação, A fica em (−1, −1); ajuste a translação.`};}}
};

export const definicao={titulo:'Laboratório matemático',descricao:'Funções que respondem aos coeficientes, figuras cujos vértices você arrasta e transformações que compõem umas com as outras. Toda leitura vem de cálculo sobre o estado atual.',experimentos:[funcoes,geometria,transformacoes]};
