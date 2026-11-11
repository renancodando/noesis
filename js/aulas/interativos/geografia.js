// Renan | renancodando
import {criarTela,grupoControles,botoesOpcoes,painelExplicacao,textoAlternativo,paleta,formatarNumero,criar,buscar,buscarTodos,escapar} from './base.js';

const LUGARES=[{nome:'Brasília',lat:-15.8,lon:-47.9},{nome:'Lisboa',lat:38.7,lon:-9.1},{nome:'Tóquio',lat:35.7,lon:139.7},{nome:'Nairóbi',lat:-1.3,lon:36.8},{nome:'Sydney',lat:-33.9,lon:151.2},{nome:'Nova York',lat:40.7,lon:-74},{nome:'Quito',lat:-0.2,lon:-78.5},{nome:'Reykjavík',lat:64.1,lon:-21.9}];
export function montar(area,parametros={},contexto={}){
 const tela=criarTela(area,{largura:640,altura:320,descricao:'Mapa-múndi com grade de coordenadas'});
 let imagem=null,projecao='equirretangular',ponto=null,mostrarGrade=true;
 const img=new Image();img.src='/ativos/terra.webp';img.onload=()=>{imagem=img;desenhar();};
 botoesOpcoes(area,[{valor:'equirretangular',rotulo:'Equirretangular'},{valor:'mercator',rotulo:'Mercator'}],{selecionado:projecao,aoEscolher:v=>{projecao=v;desenhar();},rotulo:'Projeção'});
 const leitura=criar('div',{classe:'leitura'});area.append(leitura);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 const LIM=85;
 const projetarY=lat=>{if(projecao==='equirretangular')return (90-lat)/180;const phi=Math.max(-LIM,Math.min(LIM,lat))*Math.PI/180,max=Math.log(Math.tan(Math.PI/4+LIM*Math.PI/360));return (max-Math.log(Math.tan(Math.PI/4+phi/2)))/(2*max);};
 const desprojetarY=f=>{if(projecao==='equirretangular')return 90-f*180;const max=Math.log(Math.tan(Math.PI/4+LIM*Math.PI/360));const y=max-f*2*max;return (2*Math.atan(Math.exp(y))-Math.PI/2)*180/Math.PI;};
 function desenhar(){
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  if(imagem){if(projecao==='equirretangular')c.drawImage(imagem,0,0,L,A);else{const faixas=180;for(let i=0;i<faixas;i++){const lat1=90-i*180/faixas,lat2=90-(i+1)*180/faixas;if(lat1>LIM||lat2<-LIM)continue;const y1=projetarY(lat1)*A,y2=projetarY(lat2)*A;c.drawImage(imagem,0,i*imagem.height/faixas,imagem.width,imagem.height/faixas,0,y1,L,Math.max(1,y2-y1));}}}
  if(mostrarGrade){c.strokeStyle='#ffffff55';c.lineWidth=1;for(let lon=-180;lon<=180;lon+=30){const x=(lon+180)/360*L;c.beginPath();c.moveTo(x,0);c.lineTo(x,A);c.stroke();}for(let lat=-60;lat<=60;lat+=30){const y=projetarY(lat)*A;c.strokeStyle=lat===0?'#f1dca6':'#ffffff55';c.beginPath();c.moveTo(0,y);c.lineTo(L,y);c.stroke();}c.strokeStyle='#9fd8ff';c.setLineDash([4,4]);c.beginPath();c.moveTo(L/2,0);c.lineTo(L/2,A);c.stroke();c.setLineDash([]);c.fillStyle='#fff';c.font='10px Arial';c.textAlign='left';c.fillText('Equador',4,projetarY(0)*A-3);c.fillText('Greenwich',L/2+4,12);}
  LUGARES.forEach(l=>{const x=(l.lon+180)/360*L,y=projetarY(l.lat)*A;c.fillStyle=paleta.ambar;c.beginPath();c.arc(x,y,3.5,0,7);c.fill();c.fillStyle='#fff';c.font='10px Arial';c.textAlign='left';c.fillText(l.nome,x+5,y+3);});
  if(ponto){const x=(ponto.lon+180)/360*L,y=projetarY(ponto.lat)*A;c.strokeStyle='#f1dca6';c.lineWidth=2;c.beginPath();c.arc(x,y,8,0,7);c.stroke();}
 }
 function atualizar(){
  if(ponto){const hemisferio=`${ponto.lat>=0?'Norte':'Sul'}, ${ponto.lon>=0?'Leste':'Oeste'}`;const maisProximo=LUGARES.map(l=>({...l,d:Math.hypot(l.lat-ponto.lat,(l.lon-ponto.lon)*Math.cos(ponto.lat*Math.PI/180))})).sort((a,b)=>a.d-b.d)[0];leitura.innerHTML=`<div><small>Latitude</small><strong>${formatarNumero(Math.abs(ponto.lat),1)}° ${ponto.lat>=0?'N':'S'}</strong></div><div><small>Longitude</small><strong>${formatarNumero(Math.abs(ponto.lon),1)}° ${ponto.lon>=0?'L':'O'}</strong></div><div><small>Hemisférios</small><strong>${hemisferio}</strong></div><div><small>Mais próximo</small><strong>${maisProximo.nome}</strong></div>`;explicacao.definir(`Ponto em <strong>${formatarNumero(ponto.lat,1)}°, ${formatarNumero(ponto.lon,1)}°</strong>. Latitude mede a distância angular ao Equador (0° a 90° N ou S); longitude, ao meridiano de Greenwich (0° a 180° L ou O). ${projecao==='mercator'?'Na projeção de Mercator, as áreas perto dos polos aparecem muito maiores do que são: a Groenlândia parece do tamanho da África, mas tem cerca de um quinze avos da área. Em troca, as direções (ângulos) são preservadas, o que servia à navegação.':'Na projeção equirretangular, cada grau de latitude e de longitude tem o mesmo tamanho na tela: simples, mas as regiões polares ficam esticadas horizontalmente.'}`);}
  else explicacao.definir(`Clique em um ponto do mapa para ler suas coordenadas. ${projecao==='mercator'?'Compare o tamanho da Groenlândia e da África com a projeção equirretangular.':'Troque para Mercator e observe o que acontece com as altas latitudes.'}`);
  alternativo(ponto?`Coordenadas ${formatarNumero(ponto.lat,1)} e ${formatarNumero(ponto.lon,1)} graus.`:'Mapa-múndi com grade de 30 graus.');
  desenhar();contexto.aoAtualizar?.({ponto,projecao});
 }
 tela.tela.addEventListener('pointerdown',e=>{const caixa=tela.tela.getBoundingClientRect();const fx=(e.clientX-caixa.left)/caixa.width,fy=(e.clientY-caixa.top)/caixa.height;ponto={lon:fx*360-180,lat:desprojetarY(fy)};atualizar();});
 tela.tela.addEventListener('redimensionar',desenhar);
 atualizar();
 return ()=>tela.destruir();
}

function ruido(x,y,s){return Math.sin(x*1.3+s)*Math.cos(y*1.7+s*.5)*.5+Math.sin(x*3.1+y*2.3+s)*.25+Math.sin(x*6.7-y*5.1+s*2)*.125;}
export function montarRelevo(area,parametros={},contexto={}){
 const tela=criarTela(area,{largura:640,altura:360,descricao:'Mapa de relevo com curvas de nível e perfil'});
 const N=80;let semente=parametros.semente||3,alturas=[],perfil=null;
 const controles=grupoControles(area,[{chave:'intervalo',rotulo:'Intervalo entre curvas',min:50,max:300,passo:50,valor:100,unidade:'m',aoMudar:desenhar},{chave:'agua',rotulo:'Nível da água',min:0,max:800,passo:25,valor:0,unidade:'m',aoMudar:desenhar}]);
 const acoes=criar('div',{classe:'botoes-opcoes'});area.append(acoes);
 const novo=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Novo terreno'});novo.onclick=()=>{semente+=1.7;gerar();desenhar();};acoes.append(novo);
 const leitura=criar('div',{classe:'leitura'});area.append(leitura);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 function gerar(){alturas=[];for(let j=0;j<N;j++){const linha=[];for(let i=0;i<N;i++){const x=i/N*4,y=j/N*4;linha.push(Math.max(0,600+ruido(x,y,semente)*700));}alturas.push(linha);}}
 function desenhar(){
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const mapaL=L*.62,cel=mapaL/N,celA=A/N;const intervalo=controles.intervalo.valor,agua=controles.agua.valor;
  let max=0;alturas.forEach(l=>l.forEach(v=>max=Math.max(max,v)));
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const h=alturas[j][i];c.fillStyle=h<=agua?'#1f4a6a':`hsl(${100-h/max*70} ${35+h/max*20}% ${25+h/max*40}%)`;c.fillRect(i*cel,j*celA,cel+.5,celA+.5);}
  c.strokeStyle='#1b1a1488';c.lineWidth=1;
  for(let j=0;j<N-1;j++)for(let i=0;i<N-1;i++){const h=alturas[j][i];for(let n=intervalo;n<=max;n+=intervalo){const cruza=(h-n)*(alturas[j][i+1]-n)<0||(h-n)*(alturas[j+1][i]-n)<0;if(cruza){c.beginPath();c.moveTo(i*cel+cel/2,j*celA);c.lineTo(i*cel+cel/2,j*celA+celA);c.stroke();break;}}}
  if(perfil){c.strokeStyle='#f1dca6';c.lineWidth=2;c.beginPath();c.moveTo(perfil.x0*cel,perfil.y0*celA);c.lineTo(perfil.x1*cel,perfil.y1*celA);c.stroke();
   const gx=L*.66,gl=L-gx-10,gy=30,ga=A-60;c.fillStyle='#071219';c.fillRect(gx,gy,gl,ga);c.strokeStyle='#1d3340';c.strokeRect(gx,gy,gl,ga);
   const pontos=[];for(let t=0;t<=60;t++){const i=Math.round(perfil.x0+(perfil.x1-perfil.x0)*t/60),j=Math.round(perfil.y0+(perfil.y1-perfil.y0)*t/60);pontos.push(alturas[Math.max(0,Math.min(N-1,j))][Math.max(0,Math.min(N-1,i))]);}
   c.strokeStyle=paleta.verde;c.lineWidth=2;c.beginPath();pontos.forEach((h,t)=>{const x=gx+t/60*gl,y=gy+ga-h/max*ga;t?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();
   if(agua>0){c.strokeStyle='#9fd8ff';c.setLineDash([3,3]);c.beginPath();c.moveTo(gx,gy+ga-agua/max*ga);c.lineTo(gx+gl,gy+ga-agua/max*ga);c.stroke();c.setLineDash([]);}
   c.fillStyle='#a9bcc2';c.font='10px Arial';c.textAlign='center';c.fillText('perfil topográfico ao longo da linha',gx+gl/2,A-14);c.textAlign='left';c.fillText(`${formatarNumero(max,0)} m`,gx+2,gy+10);c.fillText('0 m',gx+2,gy+ga-3);
   const subida=pontos[pontos.length-1]-pontos[0];const desnivel=Math.max(...pontos)-Math.min(...pontos);leitura.innerHTML=`<div><small>Altitude inicial</small><strong>${formatarNumero(pontos[0],0)}<small>m</small></strong></div><div><small>Altitude final</small><strong>${formatarNumero(pontos[pontos.length-1],0)}<small>m</small></strong></div><div><small>Desnível no trajeto</small><strong>${formatarNumero(desnivel,0)}<small>m</small></strong></div>`;
   explicacao.definir(`Onde as curvas de nível estão <strong>próximas</strong>, o terreno é íngreme; onde estão afastadas, é suave. O perfil mostra isso como inclinação. ${subida>0?'O trajeto sobe':subida<0?'O trajeto desce':'O trajeto termina na mesma altitude'} ${formatarNumero(Math.abs(subida),0)} m no total. ${agua>0?`A água em ${agua} m inunda os vales: compare as áreas azuis com as curvas.`:'Suba o nível da água para ver quais áreas um reservatório inundaria.'}`);
  }else{leitura.innerHTML='';explicacao.definir(`Curvas de nível a cada <strong>${intervalo} m</strong>: cada linha liga pontos de mesma altitude. Arraste no mapa para traçar um trajeto e ver seu perfil topográfico.`);}
  alternativo(`Terreno com altitude máxima ${formatarNumero(max,0)} metros e curvas a cada ${intervalo} metros.`);
  contexto.aoAtualizar?.({intervalo,agua,perfil});
 }
 const canvas=tela.tela;let arrasto=null;
 const pos=e=>{const caixa=canvas.getBoundingClientRect();return {i:(e.clientX-caixa.left)/caixa.width*tela.largura/(tela.largura*.62/N),j:(e.clientY-caixa.top)/caixa.height*N};};
 canvas.addEventListener('pointerdown',e=>{const p=pos(e);if(p.i>N)return;canvas.setPointerCapture(e.pointerId);arrasto={x0:p.i,y0:p.j};perfil={x0:p.i,y0:p.j,x1:p.i,y1:p.j};});
 canvas.addEventListener('pointermove',e=>{if(!arrasto)return;const p=pos(e);perfil={x0:arrasto.x0,y0:arrasto.y0,x1:Math.min(N-1,p.i),y1:p.j};desenhar();});
 canvas.addEventListener('pointerup',()=>{arrasto=null;desenhar();});
 tela.tela.addEventListener('redimensionar',desenhar);
 gerar();desenhar();
 return ()=>tela.destruir();
}

export function montarClima(area,parametros={},contexto={}){
 const tela=criarTela(area,{largura:640,altura:240,descricao:'Temperatura média estimada ao longo do ano'});
 const controles=grupoControles(area,[{chave:'latitude',rotulo:'Latitude',min:-70,max:70,passo:1,valor:-23,unidade:'°',aoMudar:desenhar},{chave:'altitude',rotulo:'Altitude',min:0,max:4000,passo:100,valor:700,unidade:'m',aoMudar:desenhar},{chave:'oceano',rotulo:'Distância do oceano',min:0,max:2000,passo:50,valor:100,unidade:'km',aoMudar:desenhar}]);
 const leitura=criar('div',{classe:'leitura'});area.append(leitura);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 function modelo(lat,alt,oc){const base=28-24*Math.pow(Math.abs(lat)/90,1.4);const continental=Math.min(1,oc/1500);const amplitude=(2+14*continental)*Math.pow(Math.abs(lat)/90,.7)+1;const lapso=alt*.0065;const meses=Array.from({length:12},(_,m)=>{const fase=(m-(lat>=0?0:6))/12*Math.PI*2;return base-lapso-amplitude*Math.cos(fase);});return {media:base-lapso,amplitude:amplitude*2,meses};}
 function desenhar(){
  const lat=controles.latitude.valor,alt=controles.altitude.valor,oc=controles.oceano.valor;
  const r=modelo(lat,alt,oc);
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const m=36,tmin=-30,tmax=35;const ex=i=>m+i/11*(L-2*m),ey=t=>A-m-(t-tmin)/(tmax-tmin)*(A-2*m);
  c.strokeStyle='#1d3340';for(let t=-30;t<=30;t+=10){c.beginPath();c.moveTo(m,ey(t));c.lineTo(L-m,ey(t));c.stroke();c.fillStyle='#8aa0a8';c.font='10px Arial';c.textAlign='right';c.fillText(t+'°',m-4,ey(t)+3);}
  c.strokeStyle='#ffffff55';c.beginPath();c.moveTo(m,ey(0));c.lineTo(L-m,ey(0));c.stroke();
  c.strokeStyle=paleta.ambar;c.lineWidth=2.2;c.beginPath();r.meses.forEach((t,i)=>i?c.lineTo(ex(i),ey(t)):c.moveTo(ex(i),ey(t)));c.stroke();
  ['J','F','M','A','M','J','J','A','S','O','N','D'].forEach((n,i)=>{c.fillStyle='#a9bcc2';c.font='10px Arial';c.textAlign='center';c.fillText(n,ex(i),A-m+14);});
  const tipo=r.media>22&&r.amplitude<6?'tropical quente e pouco variável':r.media>18?'quente com estações marcadas':r.media>10?'temperado':r.media>0?'frio':'polar ou de alta montanha';
  leitura.innerHTML=`<div><small>Média anual</small><strong>${formatarNumero(r.media,1)}<small>°C</small></strong></div><div><small>Amplitude térmica</small><strong>${formatarNumero(r.amplitude,1)}<small>°C</small></strong></div><div><small>Caráter</small><strong>${tipo}</strong></div>`;
  explicacao.definir(`<strong>Latitude</strong> define quanta energia solar chega: a média cai do Equador aos polos. <strong>Altitude</strong> resfria cerca de 0,65 °C a cada 100 m: a ${alt} m, ${formatarNumero(alt*.0065,1)} °C a menos. <strong>Continentalidade</strong>: longe do oceano, a amplitude entre verão e inverno cresce, porque a água aquece e esfria devagar. ${lat<0?'No hemisfério Sul, o verão fica em dezembro a fevereiro.':'No hemisfério Norte, o verão fica em junho a agosto.'} Modelo didático: ignora correntes marítimas, ventos e relevo ao redor.`);
  alternativo(`Latitude ${lat}, altitude ${alt} m, ${oc} km do oceano: média ${formatarNumero(r.media,1)} graus, amplitude ${formatarNumero(r.amplitude,1)}.`);
  contexto.aoAtualizar?.({lat,alt,oc,...r});
 }
 tela.tela.addEventListener('redimensionar',desenhar);
 desenhar();
 return ()=>tela.destruir();
}

export function montarPiramide(area,parametros={},contexto={}){
 const tela=criarTela(area,{largura:640,altura:300,descricao:'Pirâmide etária projetada'});
 const controles=grupoControles(area,[{chave:'natalidade',rotulo:'Filhos por mulher',min:1,max:7,passo:.1,valor:2.1,aoMudar:desenhar},{chave:'esperanca',rotulo:'Esperança de vida',min:45,max:90,passo:1,valor:76,unidade:'anos',aoMudar:desenhar},{chave:'anos',rotulo:'Anos de projeção',min:0,max:60,passo:5,valor:0,unidade:'anos',aoMudar:desenhar}]);
 const leitura=criar('div',{classe:'leitura'});area.append(leitura);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 function simular(){
  const n=controles.natalidade.valor,e=controles.esperanca.valor,anos=controles.anos.valor;
  let faixas=Array.from({length:18},(_,i)=>100*Math.pow(.96,i)*(i>=14?Math.max(.1,1-(i-13)*.22):1));
  const sobrev=i=>{const idade=i*5;return idade<e-10?.99:idade<e+5?.8:.4;};
  for(let passo=0;passo<anos/5;passo++){const mulheresFerteis=faixas.slice(3,10).reduce((s,v)=>s+v,0)/2;const nascimentos=mulheresFerteis*n/7;const novas=[nascimentos];for(let i=0;i<17;i++)novas.push(faixas[i]*sobrev(i));faixas=novas;}
  return faixas;
 }
 function desenhar(){
  const faixas=simular();const total=faixas.reduce((s,v)=>s+v,0);
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const max=Math.max(...faixas),ch=(A-40)/18,cx=L/2;
  faixas.forEach((v,i)=>{const w=v/max*(L/2-60);const y=A-30-(i+1)*ch;c.fillStyle=paleta.azul;c.fillRect(cx-4-w/2,y,w/2,ch-2);c.fillStyle=paleta.rosa;c.fillRect(cx+4,y,w/2,ch-2);c.fillStyle='#a9bcc2';c.font='9px Arial';c.textAlign='center';if(i%2===0)c.fillText(`${i*5}`,cx,y+ch-4);});
  c.fillStyle='#e8dcc0';c.font='11px Arial';c.textAlign='left';c.fillText('homens',20,16);c.textAlign='right';c.fillText('mulheres',L-20,16);c.textAlign='center';c.fillText('idade',cx,A-8);
  const jovens=faixas.slice(0,3).reduce((s,v)=>s+v,0)/total,idosos=faixas.slice(13).reduce((s,v)=>s+v,0)/total;
  leitura.innerHTML=`<div><small>Menos de 15 anos</small><strong>${formatarNumero(jovens*100,0)}<small>%</small></strong></div><div><small>65 anos ou mais</small><strong>${formatarNumero(idosos*100,0)}<small>%</small></strong></div><div><small>Razão de dependência</small><strong>${formatarNumero((jovens+idosos)/(1-jovens-idosos)*100,0)}<small>%</small></strong></div>`;
  const n=controles.natalidade.valor;
  explicacao.definir(`${jovens>.35?'<strong>Pirâmide de base larga:</strong> população jovem, típica de alta natalidade; pressão sobre escolas e empregos futuros.':idosos>.18?'<strong>Pirâmide invertida:</strong> população envelhecida, com natalidade abaixo da reposição (2,1 filhos por mulher); pressão sobre aposentadorias e saúde.':'<strong>Pirâmide em transição:</strong> base estreitando e topo crescendo, como no Brasil das últimas décadas.'} Com ${formatarNumero(n,1)} filhos por mulher, ${n>2.1?'a população tende a crescer':n<2.1?'cada geração é menor que a anterior':'a população tende a se estabilizar'} no longo prazo. Avance a projeção para ver a forma mudar. Modelo didático simplificado, sem migração.`);
  alternativo(`${formatarNumero(jovens*100,0)}% jovens e ${formatarNumero(idosos*100,0)}% idosos.`);
  contexto.aoAtualizar?.({natalidade:n,jovens,idosos});
 }
 tela.tela.addEventListener('redimensionar',desenhar);
 desenhar();
 return ()=>tela.destruir();
}

export function montarRecursos(area,parametros={},contexto={}){
 const itens=[['agua','Consumo de água',10,300,120,'L/dia por pessoa'],['energia','Energia elétrica',20,600,150,'kWh/mês por domicílio'],['residuos','Resíduos gerados',0.2,2,1,'kg/dia por pessoa'],['reciclagem','Taxa de reciclagem',0,80,4,'%']];
 const controles=grupoControles(area,itens.map(([chave,rotulo,min,max,valor,unidade])=>({chave,rotulo,min,max,passo:(max-min)/100,valor,unidade,aoMudar:desenhar})));
 const leitura=criar('div',{classe:'leitura'});area.append(leitura);
 const explicacao=painelExplicacao(area);
 function desenhar(){
  const agua=controles.agua.valor,energia=controles.energia.valor,res=controles.residuos.valor,rec=controles.reciclagem.valor;
  const cidade=200000;
  const aguaCidade=agua*cidade/1000,resAno=res*cidade*365/1000,aterro=resAno*(1-rec/100);
  leitura.innerHTML=`<div><small>Água da cidade</small><strong>${formatarNumero(aguaCidade,0)}<small>m³/dia</small></strong></div><div><small>Resíduos por ano</small><strong>${formatarNumero(resAno,0)}<small>t</small></strong></div><div><small>Para o aterro</small><strong>${formatarNumero(aterro,0)}<small>t/ano</small></strong></div>`;
  explicacao.definir(`Para uma cidade de 200 mil habitantes: ${formatarNumero(agua)} L por pessoa por dia viram <strong>${formatarNumero(aguaCidade,0)} m³ diários</strong> (${agua>150?'acima dos 110 L que a ONU considera suficientes para necessidades básicas':'dentro de uma faixa de consumo moderado'}). ${formatarNumero(res,1)} kg de resíduos por pessoa por dia somam ${formatarNumero(resAno,0)} toneladas por ano; com ${formatarNumero(rec,0)}% de reciclagem, ${formatarNumero(aterro,0)} t vão para aterros. Pequenas mudanças individuais, multiplicadas pela população, mudam a escala do problema; mas a escala também mostra que políticas públicas (saneamento, coleta seletiva, tarifas) pesam mais que gestos isolados.`);
  contexto.aoAtualizar?.({agua,energia,res,rec,aterro});
 }
 desenhar();
 return ()=>{};
}
