// Renan | renancodando
import {criarTela,botoesOpcoes,painelExplicacao,textoAlternativo,paleta,formatarNumero,criar,buscar,buscarTodos,escapar} from '../aulas/interativos/base.js';

const PORTAS={AND:{nome:'AND',f:(a,b)=>a&&b,simbolo:'∧'},OR:{nome:'OR',f:(a,b)=>a||b,simbolo:'∨'},XOR:{nome:'XOR',f:(a,b)=>a!==b,simbolo:'⊕'},NAND:{nome:'NAND',f:(a,b)=>!(a&&b),simbolo:'⊼'},NOR:{nome:'NOR',f:(a,b)=>!(a||b),simbolo:'⊽'},NOT:{nome:'NOT',f:a=>!a,simbolo:'¬',unaria:true}};

function desenharPorta(c,x,y,tipo,ativa){
 c.save();c.lineWidth=2;c.strokeStyle=ativa?paleta.ouro:'#8aa0a8';c.fillStyle='#0d1f2a';
 const l=56,a=40;
 c.beginPath();
 if(tipo==='AND'||tipo==='NAND'){c.moveTo(x,y-a/2);c.lineTo(x+l/2,y-a/2);c.arc(x+l/2,y,a/2,-Math.PI/2,Math.PI/2);c.lineTo(x,y+a/2);c.closePath();}
 else if(tipo==='OR'||tipo==='NOR'||tipo==='XOR'){c.moveTo(x,y-a/2);c.quadraticCurveTo(x+l*.7,y-a/2,x+l,y);c.quadraticCurveTo(x+l*.7,y+a/2,x,y+a/2);c.quadraticCurveTo(x+l*.3,y,x,y-a/2);c.closePath();}
 else{c.moveTo(x,y-a/2);c.lineTo(x+l,y);c.lineTo(x,y+a/2);c.closePath();}
 c.fill();c.stroke();
 if(tipo==='XOR'){c.beginPath();c.moveTo(x-7,y-a/2);c.quadraticCurveTo(x+l*.3-7,y,x-7,y+a/2);c.stroke();}
 if(tipo==='NAND'||tipo==='NOR'||tipo==='NOT'){c.beginPath();c.arc(x+l+5,y,4.5,0,7);c.fill();c.stroke();}
 c.fillStyle=ativa?'#f1dca6':'#a9bcc2';c.font='500 11px Georgia';c.textAlign='center';c.fillText(tipo,x+l/2-(tipo==='NOT'?8:0),y+4);
 c.restore();
}
function fio(c,x1,y1,x2,y2,ligado){c.save();c.lineWidth=ligado?2.5:1.6;c.strokeStyle=ligado?'#9fe0c0':'#5f7580';c.beginPath();c.moveTo(x1,y1);c.lineTo((x1+x2)/2,y1);c.lineTo((x1+x2)/2,y2);c.lineTo(x2,y2);c.stroke();c.restore();}

const portas={
 id:'portas',nome:'Portas lógicas',
 descricao:'Ligue e desligue entradas, troque portas e veja a tabela-verdade preencher-se sozinha. Componha duas portas e monte um meio-somador.',
 objetivos:['Descrever o comportamento de AND, OR, NOT, XOR, NAND e NOR.','Ler e construir tabelas-verdade.','Compreender como portas compostas somam bits.'],
 instrucoes:['Clique nos interruptores A, B e C para alternar entre 0 e 1.','Escolha as portas pelos botões; a tabela destaca a linha correspondente ao estado atual.','No modo meio-somador, observe as duas saídas: soma e “vai-um”.'],
 modelo:['Lógica ideal: sem atrasos de propagação nem níveis de tensão intermediários.','Cada porta tem no máximo duas entradas.'],
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:300,descricao:'Diagrama do circuito lógico'});
  let modo='porta',g1='AND',g2='OR',entradas={A:false,B:false,C:false};
  const opcoesModo=botoesOpcoes(area,[{valor:'porta',rotulo:'Uma porta'},{valor:'composicao',rotulo:'Duas portas'},{valor:'somador',rotulo:'Meio-somador'}],{selecionado:modo,aoEscolher:v=>{modo=v;montarSeletores();atualizar();},rotulo:'Modo'});
  const linhaBits=criar('div',{classe:'botoes-opcoes'});area.append(linhaBits);
  const botoesBits={};
  ['A','B','C'].forEach(k=>{const b=criar('button',{type:'button',classe:'botao pequeno interruptor-bit','aria-pressed':'false',texto:`${k} = 0`});b.onclick=()=>{entradas[k]=!entradas[k];atualizar();};botoesBits[k]=b;linhaBits.append(b);});
  const seletores=criar('div',{classe:'botoes-opcoes'});area.append(seletores);
  const tabela=criar('div',{classe:'rolagem-tabela'});area.append(tabela);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  function montarSeletores(){
   seletores.replaceChildren();
   if(modo==='somador')return;
   const nomes=modo==='porta'?['Porta']:['Porta 1 (A, B)','Porta 2 (resultado, C)'];
   nomes.forEach((rotulo,i)=>{const l=criar('label',{texto:rotulo+': '});l.style.cssText='margin:0;display:inline-flex;align-items:center;gap:6px;font-size:12px';const s=criar('select');Object.keys(PORTAS).filter(p=>i===0||p!=='NOT').forEach(p=>s.append(criar('option',{value:p,texto:p})));s.value=i===0?g1:g2;s.onchange=()=>{if(i===0)g1=s.value;else g2=s.value;atualizar();};l.append(s);seletores.append(l);});
  }
  function avaliar(A,B,C){
   if(modo==='somador')return {S:A!==B,V:A&&B};
   const p1=PORTAS[g1];const r1=p1.unaria?p1.f(A):p1.f(A,B);
   if(modo==='porta')return {S:r1};
   return {S:PORTAS[g2].f(r1,C),R1:r1};
  }
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
   const {A:a,B:b,C:cc}=entradas;const r=avaliar(a,b,cc);
   const bit=(x,y,nome,v)=>{c.fillStyle=v?'#1f5a46':'#1b2a32';c.strokeStyle=v?'#9fe0c0':'#5f7580';c.lineWidth=1.5;c.beginPath();c.roundRect(x-16,y-14,32,28,6);c.fill();c.stroke();c.fillStyle=v?'#d8f5e6':'#a9bcc2';c.font='500 13px ui-monospace,monospace';c.textAlign='center';c.fillText(`${nome}=${v?1:0}`,x,y+5);};
   const saida=(x,y,nome,v)=>{c.fillStyle=v?'#e5c17d':'#1b2a32';c.strokeStyle=v?'#f1dca6':'#5f7580';c.beginPath();c.arc(x,y,13,0,7);c.fill();c.stroke();c.fillStyle=v?'#1b1a14':'#a9bcc2';c.font='500 12px ui-monospace,monospace';c.textAlign='center';c.fillText(v?1:0,x,y+4);c.fillStyle='#e8dcc0';c.font='11px Georgia';c.fillText(nome,x,y+30);};
   if(modo==='porta'){const un=PORTAS[g1].unaria;bit(60,un?A/2:A/2-40,'A',a);if(!un)bit(60,A/2+40,'B',b);fio(c,76,un?A/2:A/2-40,L/2-30,A/2-(un?0:12),a);if(!un)fio(c,76,A/2+40,L/2-30,A/2+12,b);desenharPorta(c,L/2-30,A/2,g1,r.S);fio(c,L/2+32,A/2,L/2+120,A/2,r.S);saida(L/2+135,A/2,'saída',r.S);}
   else if(modo==='composicao'){bit(50,70,'A',a);bit(50,130,'B',b);bit(50,230,'C',cc);fio(c,66,70,180,88,a);fio(c,66,130,180,112,b);desenharPorta(c,180,100,g1,r.R1);fio(c,242,100,360,148,r.R1);fio(c,66,230,360,172,cc);desenharPorta(c,360,160,g2,r.S);fio(c,422,160,520,160,r.S);saida(540,160,'saída',r.S);}
   else{bit(50,90,'A',a);bit(50,190,'B',b);fio(c,66,90,230,78,a);fio(c,66,190,230,102,b);desenharPorta(c,230,90,'XOR',r.S);fio(c,66,90,230,198,a);fio(c,66,190,230,222,b);desenharPorta(c,230,210,'AND',r.V);fio(c,292,90,420,90,r.S);fio(c,292,210,420,210,r.V);saida(440,90,'soma (S)',r.S);saida(440,210,'vai-um (C)',r.V);c.fillStyle='#a9bcc2';c.font='12px Georgia';c.textAlign='left';c.fillText(`${a?1:0} + ${b?1:0} = ${r.V?1:0}${r.S?1:0} (binário)`,480,150);}
  }
  function montarTabela(){
   const vars=modo==='composicao'?['A','B','C']:['A','B'];
   const linhas=[];const n=vars.length;
   for(let i=0;i<(1<<n);i++){const v=vars.map((_,j)=>Boolean((i>>(n-1-j))&1));const r=avaliar(v[0],v[1]||false,v[2]||false);linhas.push({v,r});}
   const colunasSaida=modo==='somador'?['S','V']:modo==='composicao'?['R1','S']:['S'];
   const nomes={S:modo==='somador'?'soma':'saída',V:'vai-um',R1:'porta 1'};
   const atual=vars.map(k=>entradas[k]);
   tabela.innerHTML=`<table class="tabela-verdade"><thead><tr>${vars.map(v=>`<th>${v}</th>`).join('')}${colunasSaida.map(k=>`<th>${nomes[k]}</th>`).join('')}</tr></thead><tbody>${linhas.map(l=>`<tr class="${l.v.every((x,i)=>x===atual[i])?'atual':''}">${l.v.map(x=>`<td class="${x?'um':'zero'}">${x?1:0}</td>`).join('')}${colunasSaida.map(k=>`<td class="${l.r[k]?'um':'zero'}">${l.r[k]?1:0}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
   return linhas.map(l=>l.r.S?1:0);
  }
  function atualizar(){
   Object.entries(botoesBits).forEach(([k,b])=>{b.textContent=`${k} = ${entradas[k]?1:0}`;b.setAttribute('aria-pressed',String(entradas[k]));b.hidden=(modo!=='composicao'&&k==='C')||(modo==='porta'&&PORTAS[g1].unaria&&k==='B');});
   const tabelaSaida=montarTabela();
   const r=avaliar(entradas.A,entradas.B,entradas.C);
   const descricoes={AND:'só produz 1 quando todas as entradas são 1',OR:'produz 1 quando pelo menos uma entrada é 1',XOR:'produz 1 quando as entradas são diferentes',NAND:'é o inverso de AND: só produz 0 quando todas são 1',NOR:'é o inverso de OR: só produz 1 quando todas são 0',NOT:'inverte a entrada'};
   explicacao.definir(modo==='somador'?`O meio-somador soma dois bits: a <strong>soma</strong> é A XOR B e o <strong>vai-um</strong> é A AND B. Com A = ${entradas.A?1:0} e B = ${entradas.B?1:0}, o resultado binário é ${r.V?1:0}${r.S?1:0}. Encadeando somadores, um processador soma números de muitos bits.`:modo==='porta'?`<strong>${g1}</strong> ${descricoes[g1]}. Saída atual: ${r.S?1:0}.`:`A porta 1 (<strong>${g1}</strong>) combina A e B e entrega ${r.R1?1:0}; a porta 2 (<strong>${g2}</strong>) combina esse resultado com C e produz ${r.S?1:0}. A coluna “saída” da tabela é a assinatura do circuito: ${tabelaSaida.join('')}.`);
   alternativo(`Modo ${modo}, entradas A=${entradas.A?1:0}, B=${entradas.B?1:0}, C=${entradas.C?1:0}, saída ${r.S?1:0}.`);
   desenhar();
   api.atualizar({modo,g1,g2,entradas:{...entradas},saida:r.S,vaiUm:r.V,tabela:tabelaSaida});
  }
  tela.tela.addEventListener('redimensionar',desenhar);
  montarSeletores();atualizar();
  return {estado:()=>({modo,g1,g2,entradas:{...entradas},saida:avaliar(entradas.A,entradas.B,entradas.C).S,tabela:montarTabela()}),reiniciar(){modo='porta';g1='AND';g2='OR';entradas={A:false,B:false,C:false};opcoesModo.selecionar('porta');montarSeletores();atualizar();},limpar(){tela.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'No modo “uma porta”, escolha XOR e ligue A e B ao mesmo tempo. A saída deve ser 0.',verificar:e=>e.modo==='porta'&&e.g1==='XOR'&&e.entradas.A&&e.entradas.B&&!e.saida},
  {texto:'Vá para o meio-somador e some 1 + 1. Observe soma 0 e vai-um 1: dez em binário.',verificar:e=>e.modo==='somador'&&e.entradas.A&&e.entradas.B},
  {texto:'No modo de duas portas, monte (A AND B) OR C.',verificar:e=>e.modo==='composicao'&&e.g1==='AND'&&e.g2==='OR'}
 ]},
 desafio:{titulo:'Reproduzir uma tabela-verdade',descricao:'Com duas portas, construa um circuito cuja saída seja 1 quando <strong>A e B forem diferentes ou C estiver ligada</strong>. A tabela-verdade da saída, de ABC = 000 até 111, deve ser <code>0 1 1 1 1 1 0 1</code>.',verificar:e=>{if(e.modo!=='composicao')return {ok:false,mensagem:'Use o modo de duas portas.'};const alvo=[0,1,1,1,1,1,0,1];const ok=e.tabela.join('')===alvo.join('');return {ok,mensagem:ok?`(A ${e.g1} B) ${e.g2} C reproduz a tabela pedida.`:`A assinatura atual é ${e.tabela.join(' ')}. Pense em qual porta detecta “diferentes” e qual combina com “ou C”.`};}}
};

const TIPOS_BLOCO={
 definir:{rotulo:'definir',campos:[['var','texto','x'],['valor','numero',0]],texto:b=>`${b.var} = ${b.valor}`},
 somar:{rotulo:'somar',campos:[['var','texto','x'],['valor','expr',1]],texto:b=>`${b.var} = ${b.var} + ${b.valor}`},
 multiplicar:{rotulo:'multiplicar',campos:[['var','texto','x'],['valor','expr',2]],texto:b=>`${b.var} = ${b.var} × ${b.valor}`},
 escrever:{rotulo:'escrever',campos:[['valor','expr','x']],texto:b=>`escrever ${b.valor}`},
 repetir:{rotulo:'repetir',campos:[['vezes','expr',3]],texto:b=>`repetir ${b.vezes} vezes {`},
 se:{rotulo:'se',campos:[['var','texto','x'],['op','op','>'],['valor','expr',3]],texto:b=>`se ${b.var} ${b.op} ${b.valor} {`},
 fim:{rotulo:'fim',campos:[],texto:()=>'}'}
};
const PRESETS={
 contagem:{nome:'Contagem de 1 a 5',blocos:[{tipo:'definir',var:'n',valor:0},{tipo:'repetir',vezes:5},{tipo:'somar',var:'n',valor:1},{tipo:'escrever',valor:'n'},{tipo:'fim'}]},
 potencia:{nome:'Potência 2⁵',blocos:[{tipo:'definir',var:'p',valor:1},{tipo:'repetir',vezes:5},{tipo:'multiplicar',var:'p',valor:2},{tipo:'fim'},{tipo:'escrever',valor:'p'}]},
 condicional:{nome:'Só os maiores que 3',blocos:[{tipo:'definir',var:'i',valor:0},{tipo:'repetir',vezes:6},{tipo:'somar',var:'i',valor:1},{tipo:'se',var:'i',op:'>',valor:3},{tipo:'escrever',valor:'i'},{tipo:'fim'},{tipo:'fim'}]}
};
function executarBlocos(blocos){
 const trace=[],saida=[],vars={};let passos=0;
 function valorDe(expr){if(typeof expr==='number')return expr;const t=String(expr).trim();if(/^-?\d+(\.\d+)?$/.test(t))return Number(t);if(t in vars)return vars[t];const m=t.match(/^([a-zA-Z_]\w*)\s*([+\-*])\s*(\d+|[a-zA-Z_]\w*)$/);if(m){const a=valorDe(m[1]),b=valorDe(m[3]);return m[2]==='+'?a+b:m[2]==='-'?a-b:a*b;}return NaN;}
 function compilar(inicio,fim){const seq=[];let i=inicio;while(i<fim){const b=blocos[i];if(b.tipo==='repetir'||b.tipo==='se'){let prof=1,j=i+1;while(j<fim&&prof>0){if(blocos[j].tipo==='repetir'||blocos[j].tipo==='se')prof++;if(blocos[j].tipo==='fim')prof--;j++;}if(prof>0)throw new Error(`O bloco “${TIPOS_BLOCO[b.tipo].texto(b)}” não tem um “fim”.`);seq.push({indice:i,bloco:b,corpo:compilar(i+1,j-1)});i=j;}else if(b.tipo==='fim'){throw new Error('Há um “fim” sem bloco correspondente.');}else{seq.push({indice:i,bloco:b});i++;}}return seq;}
 function registrar(indice,mensagem){trace.push({indice,vars:{...vars},saida:[...saida],mensagem});if(++passos>400)throw new Error('Limite de 400 passos atingido. Verifique repetições muito longas.');}
 function rodar(seq){for(const no of seq){const b=no.bloco;if(b.tipo==='definir'){vars[b.var]=valorDe(b.valor);registrar(no.indice,`${b.var} recebe ${vars[b.var]}`);}else if(b.tipo==='somar'||b.tipo==='multiplicar'){if(!(b.var in vars))throw new Error(`A variável “${b.var}” não foi definida antes de ser usada.`);const v=valorDe(b.valor);vars[b.var]=b.tipo==='somar'?vars[b.var]+v:vars[b.var]*v;registrar(no.indice,`${b.var} agora vale ${vars[b.var]}`);}else if(b.tipo==='escrever'){const v=valorDe(b.valor);const texto=Number.isNaN(v)?String(b.valor):String(v);saida.push(texto);registrar(no.indice,`escreve ${texto}`);}else if(b.tipo==='repetir'){const n=Math.min(100,Math.max(0,Math.floor(valorDe(b.vezes))||0));for(let k=0;k<n;k++){registrar(no.indice,`repetição ${k+1} de ${n}`);rodar(no.corpo);}}else if(b.tipo==='se'){const a=valorDe(b.var),v=valorDe(b.valor);const ok={'>':a>v,'<':a<v,'=':a===v,'≥':a>=v,'≤':a<=v,'≠':a!==v}[b.op];registrar(no.indice,`${b.var} ${b.op} ${v}? ${ok?'sim':'não'}`);if(ok)rodar(no.corpo);}}}
 try{rodar(compilar(0,blocos.length));return {trace,saida,vars,erro:null};}catch(e){return {trace,saida,vars,erro:e.message};}
}

const algoritmos={
 id:'algoritmos',nome:'Construtor de algoritmos',
 descricao:'Monte um programa com blocos (definir, somar, multiplicar, escrever, repetir, se) e acompanhe a execução passo a passo, com o valor de cada variável.',
 objetivos:['Sequenciar instruções para produzir um resultado.','Usar repetições e condicionais.','Acompanhar o estado das variáveis durante a execução.'],
 instrucoes:['Adicione blocos pela paleta ou carregue um exemplo.','Todo “repetir” e “se” precisa de um “fim” correspondente.','Use “Próximo passo” para executar uma instrução de cada vez.'],
 modelo:['Variáveis guardam apenas números; textos entre aspas não são necessários em “escrever”: um nome não definido é escrito literalmente.','Expressões aceitas: número, variável, ou variável ± número/variável.','Execução limitada a 400 passos.'],
 montar(area,api){
  let blocos=api.estadoGuardado?.blocos||structuredClone(PRESETS.contagem.blocos),resultado=null,passo=-1;
  const barra=criar('div',{classe:'botoes-opcoes'});area.append(barra);
  Object.entries(PRESETS).forEach(([k,p])=>{const b=criar('button',{type:'button',classe:'botao pequeno secundario',texto:p.nome});b.onclick=()=>{blocos=structuredClone(p.blocos);desenhar();};barra.append(b);});
  const paleta=criar('div',{classe:'paleta-blocos'});area.append(paleta);
  Object.entries(TIPOS_BLOCO).forEach(([tipo,def])=>{const b=criar('button',{type:'button',classe:'botao pequeno',texto:'+ '+def.rotulo});b.onclick=()=>{const novo={tipo};def.campos.forEach(([c,,padrao])=>novo[c]=padrao);blocos.push(novo);desenhar();};paleta.append(b);});
  const lista=criar('div',{classe:'blocos-algoritmo',role:'list'});area.append(lista);
  const acoes=criar('div',{classe:'botoes-opcoes'});area.append(acoes);
  const botaoPasso=criar('button',{type:'button',classe:'botao pequeno',texto:'Próximo passo'}),botaoTudo=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Executar tudo'}),botaoZerar=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Voltar ao início'});
  acoes.append(botaoPasso,botaoTudo,botaoZerar);
  const variaveis=criar('div',{classe:'variaveis-programa'});const saida=criar('pre',{classe:'saida-programa','aria-live':'polite'});area.append(variaveis,saida);
  const explicacao=painelExplicacao(area);
  function desenhar(){
   lista.replaceChildren();let prof=0;
   blocos.forEach((b,i)=>{const def=TIPOS_BLOCO[b.tipo];if(b.tipo==='fim')prof=Math.max(0,prof-1);const el=criar('div',{classe:'bloco-alg'+(prof>0?' aninhado':''),role:'listitem'});el.style.marginLeft=(prof*26)+'px';el.append(criar('span',{texto:def.rotulo,estilo:'color:#e2b56d'}));def.campos.forEach(([campo,tipo])=>{let entrada;if(tipo==='op'){entrada=criar('select');['>','<','=','≥','≤','≠'].forEach(o=>entrada.append(criar('option',{value:o,texto:o})));entrada.value=b[campo];}else{entrada=criar('input',{type:tipo==='numero'?'number':'text',value:String(b[campo]),'aria-label':campo,size:tipo==='texto'?3:6});}entrada.onchange=()=>{b[campo]=tipo==='numero'?Number(entrada.value):entrada.value;resultado=null;passo=-1;api.guardar({blocos});atualizarSaida();};el.append(entrada);});
    const mover=criar('span',{classe:'mover'});[['↑',-1],['↓',1]].forEach(([t,d])=>{const m=criar('button',{type:'button',classe:'botao pequeno secundario',texto:t,'aria-label':d<0?'Mover para cima':'Mover para baixo'});m.onclick=()=>{const j=i+d;if(j<0||j>=blocos.length)return;[blocos[i],blocos[j]]=[blocos[j],blocos[i]];desenhar();};mover.append(m);});
    const rem=criar('button',{type:'button',classe:'remover',texto:'×','aria-label':'Remover bloco'});rem.onclick=()=>{blocos.splice(i,1);desenhar();};
    el.append(mover,rem);lista.append(el);if(b.tipo==='repetir'||b.tipo==='se')prof++;});
   resultado=null;passo=-1;api.guardar({blocos});atualizarSaida();
  }
  function garantirResultado(){if(!resultado)resultado=executarBlocos(blocos);return resultado;}
  function atualizarSaida(){
   const r=garantirResultado();
   const atual=passo>=0?r.trace[Math.min(passo,r.trace.length-1)]:null;
   buscarTodos('.bloco-alg',lista).forEach((el,i)=>el.classList.toggle('executando',atual?.indice===i));
   const vars=atual?atual.vars:(passo>=r.trace.length?r.vars:{});
   variaveis.replaceChildren(...Object.entries(vars).map(([k,v])=>criar('span',{texto:`${k} = ${v}`})));
   const linhas=atual?atual.saida:(passo>=r.trace.length-1&&passo>=0?r.saida:[]);
   saida.textContent=linhas.join('\n')||(passo<0?'(saída vazia: execute o programa)':'');
   if(r.erro&&(passo>=r.trace.length-1))saida.textContent+=`\n⚠ ${r.erro}`;
   explicacao.definir(atual?`Passo ${passo+1} de ${r.trace.length}: <strong>${escapar(atual.mensagem)}</strong>.`:r.erro?`O programa tem um problema: <strong>${escapar(r.erro)}</strong>`:`Programa com ${blocos.length} blocos, ${r.trace.length} passos de execução e ${r.saida.length} linhas de saída. Use “Próximo passo” para ver cada instrução.`);
   api.atualizar({blocos:structuredClone(blocos),saida:r.saida,erro:r.erro,passos:r.trace.length,executado:passo>=r.trace.length-1&&passo>=0});
  }
  botaoPasso.onclick=()=>{const r=garantirResultado();if(passo<r.trace.length-1)passo++;atualizarSaida();};
  botaoTudo.onclick=()=>{const r=garantirResultado();passo=r.trace.length-1;atualizarSaida();};
  botaoZerar.onclick=()=>{passo=-1;atualizarSaida();};
  desenhar();
  return {estado:()=>{const r=garantirResultado();return {blocos:structuredClone(blocos),saida:r.saida,erro:r.erro,executado:passo>=r.trace.length-1&&passo>=0};},reiniciar(){blocos=structuredClone(PRESETS.contagem.blocos);desenhar();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Carregue “Contagem de 1 a 5” e execute tudo. A saída deve listar 1, 2, 3, 4, 5.',verificar:e=>e.executado&&e.saida.join(',')==='1,2,3,4,5'},
  {texto:'Monte um programa que escreva 32 usando “repetir” e “multiplicar” (sem escrever o número 32 diretamente).',verificar:e=>e.executado&&e.saida.includes('32')&&e.blocos.some(b=>b.tipo==='repetir')&&e.blocos.some(b=>b.tipo==='multiplicar')&&!e.blocos.some(b=>String(b.valor)==='32')},
  {texto:'Use um bloco “se” dentro de uma repetição para escrever apenas os números maiores que 3 de uma contagem até 6.',verificar:e=>e.executado&&e.saida.join(',')==='4,5,6'&&e.blocos.some(b=>b.tipo==='se')}
 ]},
 desafio:{titulo:'Quadrados perfeitos',descricao:'Construa um programa que escreva exatamente <code>1, 4, 9, 16, 25</code>, uma linha por número, sem digitar nenhum desses valores diretamente nos blocos. Dica: um quadrado pode ser obtido somando ímpares sucessivos.',verificar:e=>{const alvo='1,4,9,16,25';if(!e.executado)return {ok:false,mensagem:'Execute o programa até o fim.'};if(e.saida.join(',')!==alvo)return {ok:false,mensagem:`Saída atual: ${e.saida.join(', ')||'(vazia)'}.`};const digitado=e.blocos.some(b=>['4','9','16','25'].includes(String(b.valor))||['4','9','16','25'].includes(String(b.vezes)));return digitado?{ok:false,mensagem:'A saída está certa, mas um dos valores foi digitado diretamente. Calcule-os com as variáveis.'}:{ok:true,mensagem:'Os quadrados foram calculados pelo próprio programa.'};}}
};

const EXEMPLOS={
 soma:{nome:'Somar uma lista',codigo:`const notas = [7.5, 8, 6.5, 9];\nlet soma = 0;\nfor (const nota of notas) {\n  soma += nota;\n}\nconsole.log('Soma:', soma);\nconsole.log('Média:', soma / notas.length);`},
 funcao:{nome:'Função e condição',codigo:`function classificar(temperatura) {\n  if (temperatura < 15) return 'frio';\n  if (temperatura < 25) return 'ameno';\n  return 'quente';\n}\n\nfor (const t of [10, 18, 30]) {\n  console.log(t + ' °C é ' + classificar(t));\n}`},
 texto:{nome:'Trabalhar com texto',codigo:`const frase = 'o conhecimento ganha vida quando um saber ilumina outro';\nconst palavras = frase.split(' ');\nconsole.log('Palavras:', palavras.length);\nconsole.log('Maior palavra:', palavras.sort((a, b) => b.length - a.length)[0]);\nconsole.log(frase.toUpperCase());`}
};
const SCRIPT_ISOLADO=`<!doctype html><script>
const codigoTrabalhador=\`self.onmessage=function(e){const enviar=(tipo,args)=>postMessage({tipo,texto:args.map(a=>{try{return typeof a==='object'?JSON.stringify(a):String(a)}catch(_){return String(a)}}).join(' ')});const consoleFalso={log:(...a)=>enviar('log',a),info:(...a)=>enviar('log',a),warn:(...a)=>enviar('aviso',a),error:(...a)=>enviar('erro',a)};try{(new Function('console',e.data))(consoleFalso);}catch(erro){enviar('erro',[erro&&erro.message?erro.name+': '+erro.message:String(erro)]);}postMessage({tipo:'fim'});};\`;
let trabalhador=null;
addEventListener('message',evento=>{if(typeof evento.data!=='string')return;if(trabalhador)trabalhador.terminate();const url=URL.createObjectURL(new Blob([codigoTrabalhador],{type:'text/javascript'}));trabalhador=new Worker(url);trabalhador.onmessage=e=>parent.postMessage(e.data,'*');trabalhador.onerror=e=>{parent.postMessage({tipo:'erro',texto:e.message||'Erro desconhecido'},'*');parent.postMessage({tipo:'fim'},'*');};trabalhador.postMessage(evento.data);});
parent.postMessage({tipo:'pronto'},'*');
<\/script>`;

export function criarExecutorIsolado(aoMensagem,{limite=3000}={}){
 let quadro=null,temporizador=0,pronto=false,fila=null;
 function preparar(){
  if(quadro)quadro.remove();
  pronto=false;
  quadro=document.createElement('iframe');
  quadro.setAttribute('sandbox','allow-scripts');
  quadro.setAttribute('aria-hidden','true');
  quadro.style.display='none';
  quadro.srcdoc=SCRIPT_ISOLADO;
  document.body.append(quadro);
 }
 function ouvinte(evento){
  if(!quadro||evento.source!==quadro.contentWindow)return;
  const dados=evento.data||{};
  if(dados.tipo==='pronto'){pronto=true;if(fila){quadro.contentWindow.postMessage(fila,'*');fila=null;}return;}
  if(dados.tipo==='fim'){clearTimeout(temporizador);}
  aoMensagem(dados);
 }
 addEventListener('message',ouvinte);
 return {
  executar(codigo){
   preparar();
   clearTimeout(temporizador);
   temporizador=setTimeout(()=>{aoMensagem({tipo:'erro',texto:`Execução interrompida após ${limite/1000} s. Verifique se há um laço infinito.`});aoMensagem({tipo:'fim'});quadro?.remove();quadro=null;},limite);
   fila=codigo;
   if(pronto&&quadro){quadro.contentWindow.postMessage(codigo,'*');fila=null;}
  },
  destruir(){removeEventListener('message',ouvinte);clearTimeout(temporizador);quadro?.remove();quadro=null;}
 };
}

const codigo={
 id:'codigo',nome:'Editor isolado',
 descricao:'Escreva JavaScript e execute em um ambiente isolado: um Web Worker dentro de um iframe sem acesso à página, com limite de tempo. Nada do que você escreve toca o NÓESIS.',
 objetivos:['Executar código real e ler a saída do console.','Usar variáveis, laços, funções e condições.','Interpretar mensagens de erro.'],
 instrucoes:['Carregue um exemplo ou escreva seu código.','Use console.log para mostrar resultados.','Pressione “Executar” (ou Ctrl+Enter).'],
 modelo:['O código roda em um Worker isolado: não há acesso ao DOM, ao armazenamento nem à rede da página.','Execuções com mais de 3 segundos são interrompidas.','Apenas console.log, info, warn e error produzem saída.'],
 montar(area,api){
  const barra=criar('div',{classe:'botoes-opcoes'});area.append(barra);
  const editorArea=criar('div',{classe:'editor-area'});area.append(editorArea);
  const editor=criar('textarea',{classe:'editor-codigo','aria-label':'Código JavaScript',spellcheck:'false'});
  editor.value=api.estadoGuardado?.codigo||EXEMPLOS.soma.codigo;
  const console_=criar('div',{classe:'console-saida',role:'log','aria-live':'polite',texto:'Saída do console aparecerá aqui.'});
  editorArea.append(editor,console_);
  Object.values(EXEMPLOS).forEach(ex=>{const b=criar('button',{type:'button',classe:'botao pequeno secundario',texto:ex.nome});b.onclick=()=>{editor.value=ex.codigo;};barra.append(b);});
  const botaoExecutar=criar('button',{type:'button',classe:'botao pequeno',texto:'▶ Executar'});barra.append(botaoExecutar);
  const explicacao=painelExplicacao(area);
  let linhas=[],erros=0,execucoes=0,emExecucao=false;
  const executor=criarExecutorIsolado(dados=>{
   if(dados.tipo==='fim'){emExecucao=false;botaoExecutar.disabled=false;explicacao.definir(`Execução ${execucoes} concluída: ${linhas.length} linha${linhas.length===1?'':'s'} de saída${erros?`, ${erros} erro${erros>1?'s':''}`:''}.`);api.atualizar({codigo:editor.value,saida:linhas.filter(l=>l.tipo==='log').map(l=>l.texto),erros,execucoes});return;}
   if(!dados.tipo)return;
   linhas.push(dados);if(dados.tipo==='erro')erros++;
   const el=criar('div',{classe:dados.tipo==='erro'?'erro':dados.tipo==='aviso'?'aviso':'',texto:dados.texto});
   if(console_.dataset.limpo!=='1'){console_.replaceChildren();console_.dataset.limpo='1';}
   console_.append(el);
  });
  function executar(){
   if(emExecucao)return;
   emExecucao=true;botaoExecutar.disabled=true;linhas=[];erros=0;execucoes++;
   console_.replaceChildren();console_.dataset.limpo='1';
   api.guardar({codigo:editor.value});
   executor.executar(editor.value);
   explicacao.definir('Executando em ambiente isolado…');
  }
  botaoExecutar.onclick=executar;
  editor.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();executar();}if(e.key==='Tab'){e.preventDefault();const i=editor.selectionStart;editor.setRangeText('  ',i,editor.selectionEnd,'end');}});
  explicacao.definir('Pronto. O código será executado em um Worker dentro de um iframe com sandbox, com limite de 3 segundos.');
  return {estado:()=>({codigo:editor.value,saida:linhas.filter(l=>l.tipo==='log').map(l=>l.texto),erros,execucoes}),reiniciar(){editor.value=EXEMPLOS.soma.codigo;console_.textContent='Saída do console aparecerá aqui.';console_.dataset.limpo='0';},limpar(){executor.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Execute o exemplo “Somar uma lista” e confira a média 7,75.',verificar:e=>e.execucoes>0&&e.saida.some(l=>l.includes('7.75'))},
  {texto:'Altere a lista para incluir a nota 10 e execute de novo: a média deve mudar para 8,2.',verificar:e=>e.saida.some(l=>l.includes('8.2'))},
  {texto:'Escreva uma função que receba um número e devolva o dobro, e mostre o dobro de 21.',verificar:e=>e.saida.some(l=>/\b42\b/.test(l))&&/function|=>/.test(e.codigo)}
 ]},
 desafio:{titulo:'Soma de 1 a 100',descricao:'Escreva um programa que calcule a soma de todos os inteiros de 1 a 100 usando um laço e mostre o resultado com console.log. A saída deve conter <code>5050</code>, e o código não pode conter o número 5050.',verificar:e=>{if(!e.execucoes)return {ok:false,mensagem:'Execute o programa.'};if(/5050/.test(e.codigo))return {ok:false,mensagem:'O resultado precisa ser calculado, não digitado.'};if(!/for|while/.test(e.codigo))return {ok:false,mensagem:'Use um laço (for ou while).'};const ok=e.saida.some(l=>/\b5050\b/.test(l));return {ok,mensagem:ok?'A soma foi calculada por um laço. Gauss faria em uma linha: 100·101/2.':`A saída atual não contém 5050: ${e.saida.slice(-1)[0]||'(vazia)'}.`};}}
};

export const definicao={titulo:'Laboratório computacional',descricao:'Portas lógicas que se combinam em somadores, um construtor de algoritmos com execução passo a passo e um editor de código que roda em isolamento real.',experimentos:[portas,algoritmos,codigo]};
