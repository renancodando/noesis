// Renan | renancodando
import {criarTela,grupoControles,botoesOpcoes,painelExplicacao,textoAlternativo,botaoAcao,paleta,formatarNumero,criar,buscar,buscarTodos,escapar} from './base.js';
import {adaptarExperimento} from './adaptador.js';

const carregarAtelie=()=>import('../../laboratorios/atelie.js');
export const montar=adaptarExperimento(carregarAtelie,'cores').montar;
export const montarComposicao=adaptarExperimento(carregarAtelie,'composicao').montar;
export const montarPerspectiva=adaptarExperimento(carregarAtelie,'perspectiva').montar;
export const montarTipografia=adaptarExperimento(carregarAtelie,'tipografia').montar;

const INSTRUMENTOS=[{id:'grave',nome:'Bumbo',cor:paleta.ambar},{id:'caixa',nome:'Caixa',cor:paleta.rubi},{id:'chimbal',nome:'Chimbal',cor:paleta.azul}];
const PADROES={
 vazio:{nome:'Vazio',passos:{grave:[],caixa:[],chimbal:[]}},
 rock:{nome:'Rock',passos:{grave:[0,8],caixa:[4,12],chimbal:[0,2,4,6,8,10,12,14]}},
 samba:{nome:'Samba (simplificado)',passos:{grave:[0,3,6,8,11,14],caixa:[2,5,7,10,13,15],chimbal:[0,2,4,6,8,10,12,14]}},
 valsa:{nome:'Valsa (3/4)',passos:{grave:[0],caixa:[4,8],chimbal:[0,4,8]},compasso:3}
};

export function montarRitmo(area,parametros={},contexto={}){
 let compasso=parametros.compasso||4,passos=compasso*4,bpm=parametros.bpm||100,grade={grave:new Set(),caixa:new Set(),chimbal:new Set()},tocando=false,contextoAudio=null,proximoPasso=0,tempoRelativo=0,inicioRelogio=0,inicioAudio=0,temporizador=0;
 const compassoOpcoes=botoesOpcoes(area,[{valor:4,rotulo:'4 tempos por compasso'},{valor:3,rotulo:'3 tempos por compasso'}],{selecionado:compasso,aoEscolher:v=>{compasso=v;passos=compasso*4;construirGrade();},rotulo:'Compasso'});
 const presets=botoesOpcoes(area,Object.entries(PADROES).map(([valor,p])=>({valor,rotulo:p.nome})),{selecionado:'vazio',aoEscolher:v=>{const p=PADROES[v];if(p.compasso&&p.compasso!==compasso){compasso=p.compasso;passos=compasso*4;compassoOpcoes.selecionar(compasso);}grade={grave:new Set(p.passos.grave),caixa:new Set(p.passos.caixa),chimbal:new Set(p.passos.chimbal)};construirGrade();},rotulo:'Padrões'});
 const controles=grupoControles(area,[{chave:'bpm',rotulo:'Andamento',min:50,max:180,passo:1,valor:bpm,unidade:'bpm',aoMudar:v=>{bpm=v;atualizarTexto();}},{chave:'volume',rotulo:'Volume',min:0,max:100,passo:1,valor:60,unidade:'%'}]);
 const sequenciador=criar('div',{classe:'sequenciador',role:'grid','aria-label':'Sequenciador de ritmo'});area.append(sequenciador);
 const leitura=criar('div',{classe:'leitura'});area.append(leitura);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 const botaoTocar=botaoAcao(area,'Tocar',()=>alternarReproducao(),{secundario:false});
 botaoAcao(area,'Limpar',()=>{grade={grave:new Set(),caixa:new Set(),chimbal:new Set()};construirGrade();});
 function construirGrade(){
  sequenciador.innerHTML='';sequenciador.style.setProperty('--passos',passos);
  const cabecalho=criar('div',{classe:'linha-sequenciador cabecalho',role:'row'});cabecalho.append(criar('span',{classe:'rotulo-instrumento',texto:'tempo'}));
  for(let i=0;i<passos;i++)cabecalho.append(criar('span',{classe:'numero-passo'+(i%4===0?' forte':''),texto:i%4===0?String(i/4+1):'·'}));
  sequenciador.append(cabecalho);
  INSTRUMENTOS.forEach(inst=>{
   const linha=criar('div',{classe:'linha-sequenciador',role:'row'});linha.append(criar('span',{classe:'rotulo-instrumento',texto:inst.nome,style:`color:${inst.cor}`}));
   for(let i=0;i<passos;i++){const b=criar('button',{type:'button',classe:'passo'+(i%4===0?' forte':''),role:'gridcell','aria-label':`${inst.nome}, passo ${i+1}`,'aria-pressed':String(grade[inst.id].has(i)),'data-inst':inst.id,'data-passo':i});b.style.setProperty('--cor',inst.cor);b.onclick=()=>{grade[inst.id].has(i)?grade[inst.id].delete(i):grade[inst.id].add(i);b.setAttribute('aria-pressed',String(grade[inst.id].has(i)));atualizarTexto();};linha.append(b);}
   sequenciador.append(linha);
  });
  proximoPasso=0;atualizarTexto();
 }
 function atualizarTexto(){
  const total=INSTRUMENTOS.reduce((s,i)=>s+grade[i.id].size,0);
  const fortes=INSTRUMENTOS.reduce((s,i)=>s+[...grade[i.id]].filter(p=>p%4===0).length,0);
  const contratempos=INSTRUMENTOS.reduce((s,i)=>s+[...grade[i.id]].filter(p=>p%4===2).length,0);
  const sincopas=INSTRUMENTOS.reduce((s,i)=>s+[...grade[i.id]].filter(p=>p%2===1).length,0);
  const duracaoCompasso=60/bpm*compasso;
  leitura.innerHTML=`<div><small>Batidas marcadas</small><strong>${total}</strong></div><div><small>Nos tempos fortes</small><strong>${fortes}</strong></div><div><small>Em contratempos</small><strong>${contratempos}</strong></div><div><small>Duração do compasso</small><strong>${formatarNumero(duracaoCompasso,2)}<small>s</small></strong></div>`;
  explicacao.definir(total===0?'Marque células na grade: cada coluna é uma semicolcheia, cada grupo de quatro é um tempo. Os números marcam o início de cada tempo.':`A ${bpm} bpm, cada tempo dura ${formatarNumero(60/bpm,2)} s e o compasso de ${compasso} tempos dura ${formatarNumero(duracaoCompasso,2)} s. ${sincopas>0?`<strong>${sincopas}</strong> batida${sincopas>1?'s':''} caem fora das divisões principais do tempo: isso é <strong>síncope</strong>, deslocamento do acento para onde não se espera.`:'Todas as batidas caem em tempos ou contratempos: um padrão regular, sem síncopes.'} ${contratempos>0?'Batidas no contratempo criam balanço contra os tempos fortes.':''}`);
  alternativo(INSTRUMENTOS.map(i=>`${i.nome}: ${[...grade[i.id]].sort((a,b)=>a-b).map(p=>p+1).join(', ')||'nenhum passo'}`).join('. ')+'.');
  contexto.aoAtualizar?.({bpm,compasso,total,sincopas,contratempos});
 }
 function tocarSom(inst,tempo){
  const ctx=contextoAudio,ganho=ctx.createGain();const vol=controles.volume.valor/100;ganho.connect(ctx.destination);
  if(inst==='grave'){const osc=ctx.createOscillator();osc.frequency.setValueAtTime(150,tempo);osc.frequency.exponentialRampToValueAtTime(45,tempo+.12);ganho.gain.setValueAtTime(vol,tempo);ganho.gain.exponentialRampToValueAtTime(.001,tempo+.25);osc.connect(ganho);osc.start(tempo);osc.stop(tempo+.26);}
  else{const tamanho=ctx.sampleRate*.2,buffer=ctx.createBuffer(1,tamanho,ctx.sampleRate),dados=buffer.getChannelData(0);for(let i=0;i<tamanho;i++)dados[i]=Math.random()*2-1;const fonte=ctx.createBufferSource();fonte.buffer=buffer;const filtro=ctx.createBiquadFilter();filtro.type=inst==='caixa'?'bandpass':'highpass';filtro.frequency.value=inst==='caixa'?1800:7000;ganho.gain.setValueAtTime(vol*(inst==='caixa'?.7:.35),tempo);ganho.gain.exponentialRampToValueAtTime(.001,tempo+(inst==='caixa'?.15:.05));fonte.connect(filtro);filtro.connect(ganho);fonte.start(tempo);fonte.stop(tempo+.2);
   if(inst==='caixa'){const osc=ctx.createOscillator();const g2=ctx.createGain();osc.frequency.setValueAtTime(220,tempo);osc.frequency.exponentialRampToValueAtTime(120,tempo+.08);g2.gain.setValueAtTime(vol*.5,tempo);g2.gain.exponentialRampToValueAtTime(.001,tempo+.1);osc.connect(g2);g2.connect(ctx.destination);osc.start(tempo);osc.stop(tempo+.11);}}
 }
 function agendar(){
  if(!tocando)return;
  const duracaoPasso=60/bpm/4,agora=(performance.now()-inicioRelogio)/1000;
  while(tempoRelativo<agora+.12){
   const passo=proximoPasso,instante=tempoRelativo;
   INSTRUMENTOS.forEach(i=>{if(grade[i.id].has(passo))tocarSom(i.id,inicioAudio+instante);});
   setTimeout(()=>marcarPasso(passo),Math.max(0,(instante-agora)*1000));
   tempoRelativo+=duracaoPasso;proximoPasso=(proximoPasso+1)%passos;
  }
  temporizador=setTimeout(agendar,40);
 }
 function marcarPasso(passo){
  if(!tocando)return;
  buscarTodos('.passo.atual',sequenciador).forEach(b=>b.classList.remove('atual'));
  buscarTodos(`.passo[data-passo="${passo}"]`,sequenciador).forEach(b=>b.classList.add('atual'));
 }
 function alternarReproducao(){
  if(tocando){parar();return;}
  if(!contextoAudio){const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx){explicacao.definir('Este navegador não oferece síntese de áudio; a grade continua utilizável para estudar a notação.');return;}contextoAudio=new Ctx();}
  if(contextoAudio.state==='suspended')contextoAudio.resume();
  tocando=true;botaoTocar.textContent='Parar';proximoPasso=0;tempoRelativo=0;inicioRelogio=performance.now();inicioAudio=contextoAudio.currentTime+.05;agendar();
 }
 function parar(){tocando=false;botaoTocar.textContent='Tocar';clearTimeout(temporizador);buscarTodos('.passo.atual',sequenciador).forEach(b=>b.classList.remove('atual'));}
 if(parametros.padrao&&PADROES[parametros.padrao]){const p=PADROES[parametros.padrao];grade={grave:new Set(p.passos.grave),caixa:new Set(p.passos.caixa),chimbal:new Set(p.passos.chimbal)};presets.selecionar(parametros.padrao);}
 construirGrade();
 return ()=>{parar();try{contextoAudio?.close()}catch{}};
}

const QUADROS=[
 {id:'inicio',titulo:'Situação inicial',texto:'Uma farmacêutica abre a loja da família numa manhã comum; a rua está vazia e a vitrine, empoeirada.',tensao:1},
 {id:'incidente',titulo:'Incidente',texto:'Uma criança entra correndo com uma receita rasgada e diz que o avô passou mal no ponto de ônibus.',tensao:3},
 {id:'complicacao',titulo:'Complicação',texto:'O remédio indicado acabou; a entrega só chega amanhã e a farmácia mais próxima fica a quarenta minutos.',tensao:5},
 {id:'climax',titulo:'Clímax',texto:'Ela encontra na gaveta antiga uma amostra do medicamento, confere a validade e corre para o ponto de ônibus.',tensao:8},
 {id:'resolucao',titulo:'Resolução',texto:'O avô se recupera sentado no banco, com a criança abraçada a ele e a ambulância chegando.',tensao:4},
 {id:'fechamento',titulo:'Situação final',texto:'De volta à loja, ela limpa a vitrine e pendura um cartaz: “aberto até mais tarde”.',tensao:2}
];

export function montarArco(area,parametros={},contexto={}){
 const tela=criarTela(area,{largura:640,altura:220,descricao:'Curva de tensão da narrativa'});
 let ordem=parametros.embaralhar===false?QUADROS.map(q=>q.id):embaralhar(QUADROS.map(q=>q.id)),tensoes=Object.fromEntries(QUADROS.map(q=>[q.id,parametros.tensoesIniciais?.[q.id]??5]));
 const lista=criar('ol',{classe:'lista-quadros','aria-label':'Quadros da narrativa em ordem'});area.append(lista);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 botaoAcao(area,'Verificar ordem',()=>verificar());
 botaoAcao(area,'Embaralhar',()=>{ordem=embaralhar(QUADROS.map(q=>q.id));render();});
 function embaralhar(v){const a=[...v];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function mover(id,delta){const i=ordem.indexOf(id),j=i+delta;if(j<0||j>=ordem.length)return;[ordem[i],ordem[j]]=[ordem[j],ordem[i]];render();buscar(`[data-id="${id}"] .mover-${delta<0?'cima':'baixo'}`,lista)?.focus();}
 function render(){
  lista.innerHTML='';
  ordem.forEach((id,i)=>{
   const q=QUADROS.find(x=>x.id===id);
   const item=criar('li',{classe:'quadro-narrativo','data-id':id});
   item.innerHTML=`<div class="texto-quadro"><span class="posicao-quadro">${i+1}</span><p>${escapar(q.texto)}</p></div><div class="controles-quadro"><label>Tensão <input type="range" min="1" max="10" step="1" value="${tensoes[id]}" aria-label="Tensão do quadro ${i+1}"> <output>${tensoes[id]}</output></label><span class="mover"><button type="button" class="botao pequeno secundario mover-cima" aria-label="Mover quadro ${i+1} para cima"${i===0?' disabled':''}>↑</button><button type="button" class="botao pequeno secundario mover-baixo" aria-label="Mover quadro ${i+1} para baixo"${i===ordem.length-1?' disabled':''}>↓</button></span></div>`;
   buscar('input',item).addEventListener('input',e=>{tensoes[id]=Number(e.target.value);buscar('output',item).textContent=e.target.value;desenhar();});
   buscar('.mover-cima',item).onclick=()=>mover(id,-1);buscar('.mover-baixo',item).onclick=()=>mover(id,1);
   lista.append(item);
  });
  desenhar();
 }
 function desenhar(){
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const m=36,ex=i=>m+i/(ordem.length-1)*(L-2*m),ey=t=>A-m-(t-1)/9*(A-2*m);
  c.strokeStyle='#8aa0a855';c.beginPath();c.moveTo(m,A-m);c.lineTo(L-m,A-m);c.moveTo(m,A-m);c.lineTo(m,m-10);c.stroke();
  c.fillStyle='#a9bcc2';c.font='11px Arial';c.textAlign='center';c.fillText('quadros na ordem escolhida →',L/2,A-10);c.save();c.translate(12,A/2);c.rotate(-Math.PI/2);c.fillText('tensão →',0,0);c.restore();
  c.strokeStyle=paleta.ouro;c.lineWidth=2;c.beginPath();ordem.forEach((id,i)=>{const x=ex(i),y=ey(tensoes[id]);i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();
  ordem.forEach((id,i)=>{const x=ex(i),y=ey(tensoes[id]);c.fillStyle=paleta.ambar;c.beginPath();c.arc(x,y,5,0,7);c.fill();c.fillStyle='#e8dcc0';c.font='11px Arial';c.fillText(String(i+1),x,y-10);});
  const pico=ordem.reduce((melhor,id,i)=>tensoes[id]>tensoes[melhor.id]?{id,i}:melhor,{id:ordem[0],i:0});
  const sobe=ordem.slice(0,pico.i+1).every((id,i,arr)=>i===0||tensoes[id]>=tensoes[arr[i-1]]);
  const desce=ordem.slice(pico.i).every((id,i,arr)=>i===0||tensoes[id]<=tensoes[arr[i-1]]);
  alternativo(`Curva de tensão: ${ordem.map((id,i)=>`quadro ${i+1} com tensão ${tensoes[id]}`).join(', ')}.`);
  explicacao.definir(`O ponto mais alto da sua curva é o quadro <strong>${pico.i+1}</strong>. ${sobe&&desce&&pico.i>0&&pico.i<ordem.length-1?'A tensão sobe até ele e cai depois: formato clássico de arco, com clímax perto do fim.':sobe&&desce?'A curva só sobe ou só desce: sem um clímax interno, a história não tem virada.':'A curva sobe e desce mais de uma vez: pode ser intencional (várias peripécias), mas verifique se cada queda serve à história.'} Reordene os quadros e ajuste a tensão para que a sequência faça sentido causal e a curva acompanhe.`);
  contexto.aoAtualizar?.({ordem:[...ordem],tensoes:{...tensoes},pico:pico.i});
 }
 function verificar(){
  const correta=QUADROS.map(q=>q.id);
  const acertos=ordem.filter((id,i)=>id===correta[i]).length;
  const posicoesErradas=ordem.map((id,i)=>id===correta[i]?null:i+1).filter(Boolean);
  if(acertos===ordem.length)explicacao.definir('<strong>Ordem causal correta.</strong> Cada quadro decorre do anterior: situação, incidente que a perturba, complicação que impede a solução fácil, clímax em que a protagonista age, resolução e situação final transformada. Compare agora a curva de tensão: ela sobe até o clímax?');
  else explicacao.definir(`<strong>${acertos} de ${ordem.length}</strong> quadros na posição esperada. Verifique as posições ${posicoesErradas.join(', ')}: pergunte de cada quadro “o que precisa ter acontecido antes para este fazer sentido?”.`);
  contexto.aoAtualizar?.({ordem:[...ordem],tensoes:{...tensoes},acertos});
 }
 tela.tela.addEventListener('redimensionar',desenhar);
 render();
 return ()=>tela.destruir();
}
