// Renan | renancodando
import {criarTela,grupoControles,painelExplicacao,textoAlternativo,paleta,formatarNumero,criar,buscar,buscarTodos} from '../aulas/interativos/base.js';

function resolverSistema(A,b){
 const n=A.length,m=A[0].length;
 const M=A.map((linha,i)=>[...linha,b[i]]);
 let linha=0;const pivos=[];
 for(let col=0;col<m&&linha<n;col++){
  let melhor=linha;for(let i=linha+1;i<n;i++)if(Math.abs(M[i][col])>Math.abs(M[melhor][col]))melhor=i;
  if(Math.abs(M[melhor][col])<1e-9)continue;
  [M[linha],M[melhor]]=[M[melhor],M[linha]];
  for(let i=0;i<n;i++){if(i===linha)continue;const f=M[i][col]/M[linha][col];for(let j=col;j<=m;j++)M[i][j]-=f*M[linha][j];}
  pivos.push(col);linha++;
 }
 for(let i=linha;i<n;i++)if(Math.abs(M[i][m])>1e-6)return {ok:false,motivo:'inconsistente'};
 if(pivos.length<m)return {ok:false,motivo:'indeterminado'};
 const x=new Array(m).fill(0);pivos.forEach((col,i)=>x[col]=M[i][m]/M[i][col]);
 return {ok:true,x};
}

export function analisarTrelica(nos,barras,apoios,cargas){
 const nB=barras.length,nR=3;
 const colunas=nB+nR;
 const A=[],b=[];
 const [apA,apB]=apoios;
 nos.forEach((no,i)=>{
  const fx=new Array(colunas).fill(0),fy=new Array(colunas).fill(0);
  barras.forEach((barra,k)=>{const [p,q]=barra;if(p!==i&&q!==i)return;const outro=nos[p===i?q:p];const L=Math.hypot(outro.x-no.x,outro.y-no.y)||1;fx[k]=(outro.x-no.x)/L;fy[k]=(outro.y-no.y)/L;});
  if(i===apA){fx[nB]=1;fy[nB+1]=1;}
  if(i===apB){fy[nB+2]=1;}
  A.push(fx,fy);b.push(-(cargas[i]?.x||0),-(cargas[i]?.y||0));
 });
 const solucao=resolverSistema(A,b);
 if(!solucao.ok)return {ok:false,motivo:solucao.motivo};
 const forcas=solucao.x.slice(0,nB);
 return {ok:true,forcas,reacoes:solucao.x.slice(nB)};
}

export const definicao={
 objetivo:'Projetar uma treliça que vença um vão de 8 metros e suporte uma carga no meio, com barras que trabalhem dentro do limite de força. O modelo calcula as forças por equilíbrio de nós (estática), como na análise de estruturas.',
 materiais:['Dois apoios fixos nas extremidades (um articulado, um móvel).','Nós: adicione em qualquer ponto da grade (1 m).','Barras: ligue dois nós; cada barra custa seu comprimento.','Carga de 10 kN aplicada no nó central inferior.'],
 instrucoes:['Clique na grade para adicionar nós; clique em dois nós em sequência para ligar uma barra.','A estrutura precisa ser estaticamente determinada: barras + 3 = 2 × nós. O painel indica o que falta.','Analise: barras em azul estão comprimidas, em vermelho tracionadas. Nenhuma pode passar de 15 kN.','Reduza o custo (metros de barra) mantendo a segurança.'],
 conhecimentos:['Triângulos são rígidos; quadriláteros se deformam sem diagonais.','Em cada nó, a soma das forças é zero (equilíbrio).','Comprimento e inclinação das barras mudam como a carga se distribui.'],
 criterios:[
  {id:'determinada',texto:'Estrutura estável e determinada (barras + 3 = 2 × nós)',verificar:e=>({ok:e.analise?.ok===true,detalhe:e.analise?.ok?'':e.motivo||''})},
  {id:'triangulos',texto:'Composta apenas por triângulos (pelo menos 4)',verificar:e=>({ok:e.triangulos>=4,detalhe:`${e.triangulos||0} triângulos`})},
  {id:'limite',texto:'Nenhuma barra acima de 15 kN',verificar:e=>({ok:e.analise?.ok&&e.maxForca<=15,detalhe:e.analise?.ok?`máx. ${formatarNumero(e.maxForca,1)} kN`:''})},
  {id:'custo',texto:'Custo total abaixo de 40 m de barra',verificar:e=>({ok:e.analise?.ok&&e.custo<40,detalhe:`${formatarNumero(e.custo||0,1)} m`})},
  {id:'reflexao',texto:'Identifiquei quais barras estão comprimidas e quais tracionadas e sei explicar por quê',manual:true}
 ],
 resumo:e=>`${e.barras} barras, ${formatarNumero(e.custo,1)} m, força máxima ${formatarNumero(e.maxForca,1)} kN`,
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:360,descricao:'Grade com nós, barras e apoios da treliça'});
  const VAO=8,ALT=4,CARGA=10;
  const base=()=>({nos:[{x:0,y:0,fixo:true},{x:2,y:0},{x:4,y:0,carga:true},{x:6,y:0},{x:8,y:0,fixo:true}],barras:[[0,1],[1,2],[2,3],[3,4]]});
  let {nos,barras}=api.estadoGuardado||base();
  let selecionado=null,estado={};
  const ferramentas=criar('div',{classe:'botoes-opcoes'});area.append(ferramentas);
  const btnRemover=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Remover nó selecionado'});btnRemover.onclick=()=>{if(selecionado==null||nos[selecionado].fixo||nos[selecionado].carga)return;barras=barras.filter(b=>!b.includes(selecionado)).map(b=>b.map(i=>i>selecionado?i-1:i));nos.splice(selecionado,1);selecionado=null;atualizar();};
  const btnLimpar=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Remover todas as barras'});btnLimpar.onclick=()=>{barras=[];atualizar();};
  const btnExemplo=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Modelo: treliça Warren'});btnExemplo.onclick=()=>{nos=[{x:0,y:0,fixo:true},{x:2,y:0},{x:4,y:0,carga:true},{x:6,y:0},{x:8,y:0,fixo:true},{x:1,y:2},{x:3,y:2},{x:5,y:2},{x:7,y:2}];barras=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,1],[1,6],[6,2],[2,7],[7,3],[3,8],[8,4],[5,6],[6,7],[7,8]];atualizar();};
  ferramentas.append(btnRemover,btnLimpar,btnExemplo);
  const leitura=criar('div',{classe:'leitura-laboratorio'});area.append(leitura);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  const margem=40;
  const px=x=>margem+x/VAO*(tela.largura-2*margem),py=y=>tela.altura-margem-y/ALT*(tela.altura-2*margem-20);
  function contarTriangulos(){let n=0;const liga=(a,b)=>barras.some(([p,q])=>(p===a&&q===b)||(p===b&&q===a));for(let i=0;i<nos.length;i++)for(let j=i+1;j<nos.length;j++)for(let k=j+1;k<nos.length;k++)if(liga(i,j)&&liga(j,k)&&liga(i,k))n++;return n;}
  function analisar(){
   const apoios=[nos.findIndex(n=>n.fixo&&n.x===0),nos.findIndex(n=>n.fixo&&n.x===VAO)];
   const cargas={};nos.forEach((n,i)=>{if(n.carga)cargas[i]={x:0,y:-CARGA};});
   const conectados=new Set(barras.flat());
   const soltos=nos.filter((n,i)=>!conectados.has(i)).length;
   const determinada=barras.length+3===2*nos.length;
   let analise={ok:false,motivo:''};
   if(soltos)analise.motivo=`${soltos} nó(s) sem barras`;
   else if(!determinada)analise.motivo=barras.length+3<2*nos.length?`faltam ${2*nos.length-3-barras.length} barra(s) para a estrutura ser estável`:`há ${barras.length+3-2*nos.length} barra(s) a mais (hiperestática: o modelo simples não resolve)`;
   else{const r=analisarTrelica(nos,barras,apoios,cargas);analise=r.ok?r:{ok:false,motivo:r.motivo==='indeterminado'?'estrutura instável (mecanismo): há um quadrilátero sem diagonal ou barras alinhadas':'equações inconsistentes'};}
   const custo=barras.reduce((s,[p,q])=>s+Math.hypot(nos[q].x-nos[p].x,nos[q].y-nos[p].y),0);
   const maxForca=analise.ok?Math.max(...analise.forcas.map(Math.abs)):Infinity;
   estado={nos:nos.map(n=>({...n})),barras:barras.map(b=>[...b]),analise,motivo:analise.motivo,custo,maxForca,triangulos:contarTriangulos(),barrasTotal:barras.length};
   estado.barras=barras.length;estado.barrasLista=barras.map(b=>[...b]);
   return estado;
  }
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
   c.strokeStyle='#1d3340';c.lineWidth=1;for(let x=0;x<=VAO;x++){c.beginPath();c.moveTo(px(x),py(0));c.lineTo(px(x),py(ALT));c.stroke();}for(let y=0;y<=ALT;y++){c.beginPath();c.moveTo(px(0),py(y));c.lineTo(px(VAO),py(y));c.stroke();}
   c.fillStyle='#a9bcc2';c.font='10px Arial';c.textAlign='center';for(let x=0;x<=VAO;x+=2)c.fillText(x+' m',px(x),py(0)+26);
   const an=estado.analise;
   barras.forEach(([p,q],k)=>{const f=an?.ok?an.forcas[k]:0;const cor=!an?.ok?'#8aa0a8':Math.abs(f)<.05?'#c9a967':f>0?'#d47a72':'#86b4d8';c.strokeStyle=cor;c.lineWidth=an?.ok?2+Math.min(6,Math.abs(f)/3):2;c.beginPath();c.moveTo(px(nos[p].x),py(nos[p].y));c.lineTo(px(nos[q].x),py(nos[q].y));c.stroke();if(an?.ok){c.fillStyle='#e8dcc0';c.font='10px Arial';c.textAlign='center';c.fillText(formatarNumero(Math.abs(f),1),(px(nos[p].x)+px(nos[q].x))/2,(py(nos[p].y)+py(nos[q].y))/2-4);}});
   nos.forEach((n,i)=>{c.fillStyle=i===selecionado?paleta.ambar:n.fixo?'#7fc3a4':n.carga?'#f1dca6':'#e8dcc0';c.beginPath();c.arc(px(n.x),py(n.y),i===selecionado?8:6,0,7);c.fill();if(n.fixo){c.strokeStyle='#7fc3a4';c.beginPath();c.moveTo(px(n.x)-10,py(n.y)+14);c.lineTo(px(n.x),py(n.y));c.lineTo(px(n.x)+10,py(n.y)+14);c.closePath();c.stroke();}if(n.carga){c.strokeStyle='#f1dca6';c.lineWidth=2;c.beginPath();c.moveTo(px(n.x),py(n.y)+8);c.lineTo(px(n.x),py(n.y)+34);c.stroke();c.beginPath();c.moveTo(px(n.x)-5,py(n.y)+28);c.lineTo(px(n.x),py(n.y)+36);c.lineTo(px(n.x)+5,py(n.y)+28);c.fill();c.fillStyle='#f1dca6';c.font='11px Georgia';c.fillText(`${CARGA} kN`,px(n.x)+22,py(n.y)+30);}});
   c.fillStyle='#a9bcc2';c.font='10px Arial';c.textAlign='left';c.fillText('azul: compressão · vermelho: tração · número: kN',8,14);
  }
  function atualizar(){
   analisar();
   leitura.innerHTML=`<div><small>Nós</small><strong>${nos.length}</strong></div><div><small>Barras</small><strong>${barras.length}<small>/ ${2*nos.length-3} necessárias</small></strong></div><div><small>Custo</small><strong>${formatarNumero(estado.custo,1)}<small>m</small></strong></div><div><small>Força máxima</small><strong>${estado.analise.ok?formatarNumero(estado.maxForca,1):'—'}<small>kN</small></strong></div>`;
   explicacao.definir(estado.analise.ok?`<strong>Estrutura resolvida.</strong> Barra mais solicitada: ${formatarNumero(estado.maxForca,1)} kN (${estado.maxForca>15?'acima do limite de 15 kN: redistribua a carga com mais altura ou mais triângulos':'dentro do limite'}). Reações nos apoios: ${estado.analise.reacoes.map(r=>formatarNumero(Math.abs(r),1)).join(' kN, ')} kN. Barras superiores tendem à compressão, inferiores à tração: a estrutura funciona como uma viga que resiste pela geometria.`:`<strong>Ainda não é possível analisar:</strong> ${estado.motivo}. Lembre: triângulos são rígidos e cada nó precisa estar ligado.`);
   alternativo(`${nos.length} nós, ${barras.length} barras, custo ${formatarNumero(estado.custo,1)} metros.`);
   desenhar();api.atualizar(estado);api.guardar({nos,barras});
  }
  const canvas=tela.tela;
  canvas.addEventListener('pointerdown',e=>{const caixa=canvas.getBoundingClientRect();const x=(e.clientX-caixa.left)/caixa.width*tela.largura,y=(e.clientY-caixa.top)/caixa.height*tela.altura;const gx=Math.round((x-margem)/(tela.largura-2*margem)*VAO),gy=Math.round((tela.altura-margem-y)/(tela.altura-2*margem-20)*ALT);if(gx<0||gx>VAO||gy<0||gy>ALT)return;const existente=nos.findIndex(n=>n.x===gx&&n.y===gy);if(existente>=0){if(selecionado!=null&&selecionado!==existente){const a=selecionado,b=existente;if(!barras.some(([p,q])=>(p===a&&q===b)||(p===b&&q===a)))barras.push([a,b]);else barras=barras.filter(([p,q])=>!((p===a&&q===b)||(p===b&&q===a)));selecionado=null;}else selecionado=selecionado===existente?null:existente;}else{nos.push({x:gx,y:gy});selecionado=null;}atualizar();});
  canvas.addEventListener('redimensionar',desenhar);
  atualizar();
  return {estado:()=>estado,reiniciar(){({nos,barras}=base());selecionado=null;atualizar();},limpar(){tela.destruir();}};
 }
};
