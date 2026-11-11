// Renan | renancodando
import {criarTela,grupoControles,botoesOpcoes,painelExplicacao,textoAlternativo,animador,movimentoReduzido,paleta,formatarNumero,criar,buscar,buscarTodos,escapar} from './base.js';
import {adaptarExperimento} from './adaptador.js';
export const montarCirculacao=adaptarExperimento(()=>import('../../laboratorios/interior.js'),'circulacao').montar;

const ORGANELAS=[
 {id:'membrana',nome:'Membrana plasmática',forma:'<ellipse cx="200" cy="150" rx="190" ry="130" fill="none" stroke="#86b4d8" stroke-width="6"/>',texto:'Bicamada de lipídios com proteínas. Controla o que entra e sai da célula (permeabilidade seletiva) e recebe sinais do ambiente.',animal:true,vegetal:true},
 {id:'parede',nome:'Parede celular',forma:'<ellipse cx="200" cy="150" rx="198" ry="138" fill="none" stroke="#7fc3a4" stroke-width="6"/>',texto:'Camada rígida de celulose externa à membrana, presente em células vegetais. Dá sustentação e limita a expansão da célula.',animal:false,vegetal:true},
 {id:'nucleo',nome:'Núcleo',forma:'<circle cx="200" cy="150" r="42" fill="#b8a8ec"/><circle cx="200" cy="150" r="14" fill="#8f7dd6"/>',texto:'Delimitado por um envoltório com poros, guarda o DNA organizado em cromossomos. É onde o DNA é copiado e transcrito em RNA.',animal:true,vegetal:true},
 {id:'mitocondria',nome:'Mitocôndria',forma:'<ellipse cx="110" cy="110" rx="34" ry="16" fill="#e0a85a"/><path d="M84 110c10-8 16 8 26 0s16 8 26 0" fill="none" stroke="#5a3f17" stroke-width="2"/>',texto:'Realiza a respiração celular: usa oxigênio para extrair energia da glicose e produzir ATP, a moeda energética da célula. Tem DNA próprio.',animal:true,vegetal:true},
 {id:'cloroplasto',nome:'Cloroplasto',forma:'<ellipse cx="300" cy="200" rx="36" ry="20" fill="#5fa37a"/><rect x="278" y="194" width="44" height="4" fill="#2c6b48"/><rect x="278" y="202" width="44" height="4" fill="#2c6b48"/>',texto:'Realiza a fotossíntese: captura luz com clorofila e produz glicose a partir de CO₂ e água, liberando oxigênio. Exclusivo de plantas e algas.',animal:false,vegetal:true},
 {id:'reticulo',nome:'Retículo endoplasmático',forma:'<path d="M250 110c20 0 30 10 30 25s-10 25-30 25-30-10-30-25 10-25 30-25Zm0 8c-14 0-22 7-22 17s8 17 22 17 22-7 22-17-8-17-22-17Z" fill="#d296a8"/>',texto:'Rede de membranas ligada ao núcleo. A parte rugosa (com ribossomos) sintetiza proteínas; a lisa produz lipídios e processa toxinas.',animal:true,vegetal:true},
 {id:'ribossomo',nome:'Ribossomos',forma:'<circle cx="140" cy="200" r="5" fill="#f1dca6"/><circle cx="155" cy="212" r="5" fill="#f1dca6"/><circle cx="128" cy="218" r="5" fill="#f1dca6"/>',texto:'Montam proteínas lendo a sequência do RNA mensageiro. Estão livres no citoplasma ou presos ao retículo.',animal:true,vegetal:true},
 {id:'vacuolo',nome:'Vacúolo',forma:'<ellipse cx="120" cy="170" rx="40" ry="28" fill="#9fd8ff55" stroke="#9fd8ff"/>',texto:'Nas células vegetais, um grande vacúolo armazena água e solutos e mantém a pressão interna que sustenta a planta. Em células animais, vacúolos são pequenos e transitórios.',animal:false,vegetal:true},
 {id:'golgi',nome:'Complexo de Golgi',forma:'<path d="M250 190h60M248 198h64M250 206h60M252 214h56" stroke="#e39a6d" stroke-width="5" stroke-linecap="round" fill="none"/>',texto:'Modifica, empacota e endereça proteínas e lipídios vindos do retículo, enviando-os para a membrana ou para fora da célula.',animal:true,vegetal:true},
 {id:'lisossomo',nome:'Lisossomo',forma:'<circle cx="150" cy="250" r="12" fill="#d47a72"/>',texto:'Vesícula com enzimas digestivas que degrada materiais capturados e organelas velhas. Típico de células animais.',animal:true,vegetal:false}
];
export function montar(area,parametros={},contexto={}){
 let tipo=parametros.tipo||'animal',vistas=new Set();
 const caixa=criar('div',{classe:'bancada'});area.append(caixa);
 const svgArea=criar('div'),painel=criar('div',{classe:'painel-orgao'});caixa.append(svgArea,painel);
 botoesOpcoes(area,[{valor:'animal',rotulo:'Célula animal'},{valor:'vegetal',rotulo:'Célula vegetal'}],{selecionado:tipo,aoEscolher:v=>{tipo=v;desenhar();},rotulo:'Tipo de célula'});
 const explicacao=painelExplicacao(area);
 function desenhar(){
  const lista=ORGANELAS.filter(o=>o[tipo]);
  svgArea.innerHTML=`<svg class="corpo-svg tela" viewBox="0 0 400 300" role="group" aria-label="Esquema de célula ${tipo}"><ellipse cx="200" cy="150" rx="190" ry="130" fill="#132431"/>${[...lista].reverse().map(o=>`<g class="orgao" data-organela="${o.id}" tabindex="0" role="button" aria-label="${o.nome}">${o.forma}</g>`).join('')}</svg>`;
  buscarTodos('.orgao',svgArea).forEach(g=>{const abrir=()=>{const o=ORGANELAS.find(x=>x.id===g.dataset.organela);vistas.add(o.id);buscarTodos('.orgao',svgArea).forEach(x=>x.classList.toggle('ativo',x===g));painel.innerHTML=`<h4>${o.nome}</h4><p>${o.texto}</p><p class="nota-modelo">${o.animal&&o.vegetal?'Presente em células animais e vegetais.':o.vegetal?'Típico de células vegetais.':'Típico de células animais.'}</p>`;contexto.aoAtualizar?.({tipo,vistas:[...vistas]});};g.onclick=abrir;g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();abrir();}};});
  painel.innerHTML='<p class="texto-apoio">Clique em uma estrutura para ler sua função.</p>';
  explicacao.definir(tipo==='vegetal'?'A célula vegetal tem parede celular, cloroplastos e um grande vacúolo, estruturas ausentes na animal. Ambas têm núcleo, mitocôndrias, retículo, ribossomos e Golgi.':'A célula animal não tem parede, cloroplastos nem vacúolo central; tem lisossomos abundantes. Este esquema é simplificado e sem escala.');
 }
 desenhar();
 return ()=>{};
}

export function montarPunnett(area,parametros={},contexto={}){
 const nomes=parametros.nomes||{dominante:'A',recessivo:'a',traco:'cor da semente',dom:'amarela',rec:'verde'};
 let pai=parametros.pai||'Aa',mae=parametros.mae||'Aa';
 const seletor=criar('div',{classe:'botoes-opcoes'});area.append(seletor);
 const opcoes=['AA','Aa','aa'].map(g=>g.replace(/A/g,nomes.dominante).replace(/a/g,nomes.recessivo));
 const genotipos=['AA','Aa','aa'];
 [['pai','Genitor 1'],['mae','Genitor 2']].forEach(([k,r])=>{const l=criar('label',{texto:r+': ',estilo:'margin:0;display:inline-flex;align-items:center;gap:6px;font-size:12px'});const s=criar('select');genotipos.forEach((g,i)=>s.append(criar('option',{value:g,texto:opcoes[i]})));s.value=k==='pai'?pai:mae;s.onchange=()=>{if(k==='pai')pai=s.value;else mae=s.value;desenhar();};l.append(s);seletor.append(l);});
 const tabela=criar('div',{classe:'rolagem-tabela'});area.append(tabela);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 const rot=g=>g.replace(/A/g,nomes.dominante).replace(/a/g,nomes.recessivo);
 function desenhar(){
  const g1=pai.split(''),g2=mae.split('');
  const filhos=[];g1.forEach(a=>g2.forEach(b=>filhos.push([a,b].sort().join(''))));
  const contagem={};filhos.forEach(f=>contagem[f]=(contagem[f]||0)+1);
  const fen={dom:filhos.filter(f=>f.includes('A')).length,rec:filhos.filter(f=>f==='aa').length};
  tabela.innerHTML=`<table class="tabela" style="text-align:center"><thead><tr><th></th>${g2.map(b=>`<th>${rot(b)}</th>`).join('')}</tr></thead><tbody>${g1.map(a=>`<tr><th>${rot(a)}</th>${g2.map(b=>{const f=[a,b].sort().join('');return `<td style="background:${f==='aa'?'#174a3a66':'#5a431744'}"><strong>${rot(f)}</strong><br><small>${f==='aa'?nomes.rec:nomes.dom}</small></td>`;}).join('')}</tr>`).join('')}</tbody></table>`;
  explicacao.definir(`Cruzamento ${rot(pai)} × ${rot(mae)} para ${nomes.traco}. Genótipos: ${Object.entries(contagem).map(([g,n])=>`${rot(g)} ${n}/4`).join(', ')}. Fenótipos: <strong>${fen.dom}/4 ${nomes.dom}</strong> e <strong>${fen.rec}/4 ${nomes.rec}</strong>. ${fen.dom===3?'A proporção 3:1 é a marca do cruzamento entre dois heterozigotos.':fen.rec===0?'Nenhum descendente mostra o traço recessivo, mas ele pode continuar presente nos heterozigotos.':fen.rec===4?'Com dois genitores recessivos, todos os descendentes são recessivos.':fen.dom===2?'Proporção 1:1: típica do cruzamento-teste entre heterozigoto e recessivo.':''} Cada célula do quadro é uma probabilidade de 1/4, não uma garantia sobre quatro filhos reais.`);
  alternativo(`Quadro de Punnett ${rot(pai)} por ${rot(mae)}: ${fen.dom} de 4 ${nomes.dom}, ${fen.rec} de 4 ${nomes.rec}.`);
  contexto.aoAtualizar?.({pai,mae,fen});
 }
 desenhar();
 return ()=>{};
}

export function montarFotossintese(area,parametros={},contexto={}){
 const tela=criarTela(area,{largura:640,altura:260,descricao:'Taxa de fotossíntese em função da intensidade luminosa'});
 const controles=grupoControles(area,[{chave:'luz',rotulo:'Intensidade da luz',min:0,max:100,passo:1,valor:40,unidade:'%',aoMudar:desenhar},{chave:'co2',rotulo:'CO₂ disponível',min:10,max:100,passo:5,valor:60,unidade:'%',aoMudar:desenhar},{chave:'temperatura',rotulo:'Temperatura',min:5,max:45,passo:1,valor:25,unidade:'°C',aoMudar:desenhar}]);
 const leitura=criar('div',{classe:'leitura'});area.append(leitura);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 function taxa(luz,co2,temp){const fLuz=luz/(luz+25);const fCo2=co2/(co2+20);const fTemp=Math.max(0,1-Math.pow((temp-28)/17,2));return 100*fLuz*fCo2*fTemp;}
 function desenhar(){
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const co2=controles.co2.valor,temp=controles.temperatura.valor,luz=controles.luz.valor;
  const m=40,ex=x=>m+x/100*(L-2*m),ey=y=>A-m-y/100*(A-2*m);
  c.strokeStyle='#8aa0a8';c.beginPath();c.moveTo(m,A-m);c.lineTo(L-m,A-m);c.moveTo(m,A-m);c.lineTo(m,m);c.stroke();
  c.fillStyle='#a9bcc2';c.font='11px Arial';c.textAlign='center';c.fillText('intensidade de luz →',L/2,A-10);c.save();c.translate(12,A/2);c.rotate(-Math.PI/2);c.fillText('taxa de fotossíntese →',0,0);c.restore();
  c.strokeStyle=paleta.verde;c.lineWidth=2.2;c.beginPath();for(let x=0;x<=100;x++){const y=taxa(x,co2,temp);x?c.lineTo(ex(x),ey(y)):c.moveTo(ex(x),ey(y));}c.stroke();
  c.strokeStyle='#ffffff33';c.setLineDash([3,4]);c.beginPath();for(let x=0;x<=100;x++){const y=taxa(x,100,28);x?c.lineTo(ex(x),ey(y)):c.moveTo(ex(x),ey(y));}c.stroke();c.setLineDash([]);
  const atual=taxa(luz,co2,temp);c.fillStyle=paleta.ouro;c.beginPath();c.arc(ex(luz),ey(atual),6,0,7);c.fill();
  c.fillStyle='#a9bcc2';c.font='10px Arial';c.textAlign='left';c.fillText('tracejado: CO₂ e temperatura ideais',m+6,m+4);
  const limitante=luz<30?'luz':co2<40?'CO₂':Math.abs(temp-28)>10?'temperatura':'nenhum fator claramente';
  leitura.innerHTML=`<div><small>Taxa relativa</small><strong>${formatarNumero(atual,0)}<small>%</small></strong></div><div><small>Fator limitante</small><strong>${limitante}</strong></div>`;
  explicacao.definir(`A curva sobe rápido com pouca luz e depois satura: a partir de certo ponto, mais luz não aumenta a taxa, porque outro fator passa a limitar (${co2<60?'o CO₂ disponível':'a temperatura ou a capacidade das enzimas'}). ${Math.abs(temp-28)>10?'A temperatura está longe do ótimo das enzimas: a taxa cai mesmo com luz e CO₂ abundantes.':''} Modelo didático: as formas das curvas seguem o padrão observado em plantas, mas os números são relativos.`);
  alternativo(`Luz ${luz}%, CO2 ${co2}%, temperatura ${temp} graus: taxa relativa ${formatarNumero(atual,0)}%.`);
  contexto.aoAtualizar?.({luz,co2,temp,taxa:atual});
 }
 tela.tela.addEventListener('redimensionar',desenhar);
 desenhar();
 return ()=>tela.destruir();
}

export function montarPopulacoes(area,parametros={},contexto={}){
 const tela=criarTela(area,{largura:640,altura:300,descricao:'Populações de presas e predadores ao longo do tempo'});
 const controles=grupoControles(area,[{chave:'nascimento',rotulo:'Natalidade das presas',min:.2,max:1.5,passo:.05,valor:.8,aoMudar:simular},{chave:'predacao',rotulo:'Eficiência da predação',min:.005,max:.05,passo:.005,valor:.02,aoMudar:simular},{chave:'mortalidade',rotulo:'Mortalidade dos predadores',min:.2,max:1.5,passo:.05,valor:.6,aoMudar:simular},{chave:'capacidade',rotulo:'Capacidade do ambiente (presas)',min:50,max:400,passo:10,valor:200,aoMudar:simular}]);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 let serie=[];
 function simular(){
  const r=controles.nascimento.valor,a=controles.predacao.valor,m=controles.mortalidade.valor,K=controles.capacidade.valor,b=a*.5;
  let x=80,y=10;serie=[];const dt=.02;
  for(let i=0;i<4000;i++){const dx=r*x*(1-x/K)-a*x*y,dy=b*x*y-m*y;x=Math.max(0,x+dx*dt);y=Math.max(0,y+dy*dt);if(i%8===0)serie.push({t:i*dt,x,y});}
  desenhar();
  const maxX=Math.max(...serie.map(s=>s.x)),minX=Math.min(...serie.slice(100).map(s=>s.x));
  const extinto=serie.slice(-50).every(s=>s.y<.5);
  explicacao.definir(extinto?'<strong>Os predadores desapareceram.</strong> Com mortalidade alta ou predação pouco eficiente, a população de predadores não se sustenta e as presas tendem à capacidade do ambiente.':maxX-minX>20?'<strong>Oscilações acopladas.</strong> Quando as presas aumentam, os predadores têm mais alimento e crescem com atraso; isso reduz as presas, o que depois reduz os predadores. Os picos de predadores vêm sempre depois dos picos de presas.':'<strong>Equilíbrio.</strong> As oscilações se amortecem e as populações se estabilizam em valores em que nascimentos e mortes se compensam.');
  alternativo(`Presas entre ${formatarNumero(minX,0)} e ${formatarNumero(maxX,0)}; predadores ${extinto?'extintos':'presentes'}.`);
  contexto.aoAtualizar?.({r,a,m,K,extinto});
 }
 function desenhar(){
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const m=36,maxY=Math.max(...serie.map(s=>Math.max(s.x,s.y*4)))*1.1||1;
  const ex=t=>m+t/80*(L-2*m),ey=v=>A-m-v/maxY*(A-2*m);
  c.strokeStyle='#8aa0a8';c.beginPath();c.moveTo(m,A-m);c.lineTo(L-m,A-m);c.moveTo(m,A-m);c.lineTo(m,m);c.stroke();
  [[s=>s.x,paleta.verde,'presas'],[s=>s.y*4,paleta.rubi,'predadores (×4)']].forEach(([f,cor,rot],i)=>{c.strokeStyle=cor;c.lineWidth=2;c.beginPath();serie.forEach((s,k)=>k?c.lineTo(ex(s.t),ey(f(s))):c.moveTo(ex(s.t),ey(f(s))));c.stroke();c.fillStyle=cor;c.font='11px Arial';c.textAlign='left';c.fillText(rot,m+8+i*110,m+2);});
  c.fillStyle='#a9bcc2';c.font='10px Arial';c.textAlign='center';c.fillText('tempo →',L/2,A-8);
 }
 tela.tela.addEventListener('redimensionar',desenhar);
 simular();
 return ()=>tela.destruir();
}

export function montarSelecao(area,parametros={},contexto={}){
 const tela=criarTela(area,{largura:640,altura:240,descricao:'Distribuição de cores de uma população ao longo das gerações'});
 const controles=grupoControles(area,[{chave:'ambiente',rotulo:'Cor do ambiente (0 claro, 100 escuro)',min:0,max:100,passo:1,valor:70,aoMudar:reiniciar},{chave:'pressao',rotulo:'Pressão dos predadores',min:0,max:1,passo:.05,valor:.5,aoMudar:reiniciar},{chave:'mutacao',rotulo:'Variação por mutação',min:0,max:10,passo:1,valor:3,aoMudar:reiniciar}]);
 const acoes=criar('div',{classe:'botoes-opcoes'});area.append(acoes);
 const botaoGeracao=criar('button',{type:'button',classe:'botao pequeno',texto:'Avançar 1 geração'}),botaoDez=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Avançar 10'}),botaoZerar=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Reiniciar'});
 acoes.append(botaoGeracao,botaoDez,botaoZerar);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 let populacao=[],geracao=0,historico=[];
 function reiniciar(){populacao=Array.from({length:200},()=>Math.round(20+Math.random()*60));geracao=0;historico=[];desenhar();}
 function passo(){
  const amb=controles.ambiente.valor,p=controles.pressao.valor,mut=controles.mutacao.valor;
  const sobreviventes=populacao.filter(cor=>Math.random()>p*Math.min(1,Math.abs(cor-amb)/60));
  const pais=sobreviventes.length?sobreviventes:populacao;
  populacao=Array.from({length:200},()=>{const cor=pais[Math.floor(Math.random()*pais.length)];return Math.max(0,Math.min(100,cor+(Math.random()*2-1)*mut));});
  geracao++;historico.push(populacao.reduce((s,c)=>s+c,0)/populacao.length);desenhar();
 }
 function desenhar(){
  const {contexto:c,largura:L,altura:A}=tela;const amb=controles.ambiente.valor;
  const tom=v=>`hsl(35 40% ${20+ (100-v)*.6}%)`;
  c.fillStyle=tom(amb);c.fillRect(0,0,L,A);
  populacao.forEach((cor,i)=>{const x=20+(i%25)*(L-40)/25,y=20+Math.floor(i/25)*(A-100)/8;c.fillStyle=tom(cor);c.beginPath();c.arc(x,y,6,0,7);c.fill();c.strokeStyle='#00000055';c.stroke();});
  const faixas=new Array(10).fill(0);populacao.forEach(v=>faixas[Math.min(9,Math.floor(v/10))]++);
  const bx=20,by=A-70,bl=(L-40)/10;faixas.forEach((n,i)=>{c.fillStyle='#ffffffcc';c.fillRect(bx+i*bl+2,by+60-n/Math.max(...faixas)*55,bl-4,n/Math.max(...faixas)*55);});
  c.fillStyle='#fff';c.font='11px Arial';c.textAlign='left';c.fillText(`geração ${geracao} · média ${formatarNumero(populacao.reduce((s,v)=>s+v,0)/populacao.length,0)} · ambiente ${amb}`,20,A-74);
  const media=populacao.reduce((s,v)=>s+v,0)/populacao.length;
  explicacao.definir(geracao===0?'A população começa variada (tons claros a médios). Predadores enxergam melhor os indivíduos que contrastam com o ambiente. Avance gerações e observe a média se deslocar.':`<strong>Geração ${geracao}: média ${formatarNumero(media,0)}</strong> ${Math.abs(media-amb)<10?'A população se aproximou da cor do ambiente: os que contrastavam foram predados com mais frequência e deixaram menos descendentes. Ninguém “decidiu” mudar: a variação já existia e o ambiente selecionou.':'Ainda há diferença entre a média e o ambiente. Com pressão maior ou mais gerações, a mudança é mais rápida.'} ${controles.mutacao.valor===0?'Sem variação nova, a população pode perder diversidade e ficar vulnerável a mudanças.':''}`);
  alternativo(`Geração ${geracao}, cor média ${formatarNumero(media,0)} em ambiente ${amb}.`);
  contexto.aoAtualizar?.({geracao,media,ambiente:amb});
 }
 botaoGeracao.onclick=passo;botaoDez.onclick=()=>{for(let i=0;i<10;i++)passo();};botaoZerar.onclick=reiniciar;
 tela.tela.addEventListener('redimensionar',desenhar);
 reiniciar();
 return ()=>tela.destruir();
}
