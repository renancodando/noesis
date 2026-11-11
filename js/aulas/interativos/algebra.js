// Renan | renancodando
import {criarTela,painelExplicacao,textoAlternativo,paleta,formatarNumero,criar,buscar,buscarTodos} from './base.js';

export function montar(area,parametros={},contexto={}){
 const inicial=parametros.equacao||{a:3,b:4,c:1,d:10};
 let eq={...inicial},passos=[],x=null;
 const tela=criarTela(area,{largura:640,altura:240,descricao:'Balança com os dois lados da equação'});
 const texto=criar('p',{classe:'corpo-equacao',estilo:'text-align:center;margin:10px 0 6px;font-size:22px'});area.append(texto);
 const botoes=criar('div',{classe:'botoes-opcoes'});area.append(botoes);
 const campo=criar('input',{type:'number',value:'1','aria-label':'Valor da operação',estilo:'display:inline-block;width:80px;margin:0 6px'});
 const acoes=[['−','subtrair o número'],['+','somar o número'],['÷','dividir pelo número'],['×','multiplicar pelo número'],['−x','subtrair x vezes o número']];
 const lista=criar('ol',{classe:'passos',estilo:'margin-top:12px'});area.append(lista);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 const fmt=(a,b)=>`${a===0?'':a===1?'x':a===-1?'−x':`${formatarNumero(a,2)}x`}${a!==0&&b!==0?(b>0?' + ':' − '):''}${b!==0||a===0?formatarNumero(Math.abs(b)||0,2).replace(/,00$/,''):''}`.replace(/,00x/,'x');
 function registrar(descricao){passos.push(descricao);lista.innerHTML=passos.map(p=>`<li><div>${p}</div></li>`).join('');}
 function aplicar(op,v){
  if(!Number.isFinite(v)||(op==='÷'&&v===0))return;
  const antes={...eq};
  if(op==='−'){eq.b-=v;eq.d-=v;}else if(op==='+'){eq.b+=v;eq.d+=v;}else if(op==='÷'){eq.a/=v;eq.b/=v;eq.c/=v;eq.d/=v;}else if(op==='×'){eq.a*=v;eq.b*=v;eq.c*=v;eq.d*=v;}else if(op==='−x'){eq.a-=v;eq.c-=v;}
  registrar(`${op==='−x'?`Subtrair ${v}x`:op==='−'?`Subtrair ${v}`:op==='+'?`Somar ${v}`:op==='÷'?`Dividir por ${v}`:`Multiplicar por ${v}`} dos dois lados: <code>${fmt(antes.a,antes.b)} = ${fmt(antes.c,antes.d)}</code> → <code>${fmt(eq.a,eq.b)} = ${fmt(eq.c,eq.d)}</code>`);
  desenhar();
 }
 acoes.forEach(([op,rot])=>{const b=criar('button',{type:'button',classe:'botao pequeno secundario',texto:op,title:rot,'aria-label':rot});b.onclick=()=>aplicar(op,Number(campo.value));botoes.append(b);});
 botoes.append(campo);
 const reiniciar=criar('button',{type:'button',classe:'botao pequeno',texto:'Reiniciar'});reiniciar.onclick=()=>{eq={...inicial};passos=[];lista.innerHTML='';desenhar();};botoes.append(reiniciar);
 function desenhar(){
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const solucao=(eq.a-eq.c)!==0?(eq.d-eq.b)/(eq.a-eq.c):null;
  const resolvido=Math.abs(eq.a-1)<1e-9&&Math.abs(eq.c)<1e-9&&Math.abs(eq.b)<1e-9;
  x=solucao;
  const pesoEsq=eq.a*(solucao??1)+eq.b,pesoDir=eq.c*(solucao??1)+eq.d;
  const inclinacao=Math.max(-.2,Math.min(.2,(pesoDir-pesoEsq)*.02));
  const cx=L/2,cy=A*.62;
  c.strokeStyle='#8aa0a8';c.lineWidth=4;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx,cy+60);c.stroke();c.beginPath();c.moveTo(cx-40,cy+60);c.lineTo(cx+40,cy+60);c.stroke();
  c.save();c.translate(cx,cy);c.rotate(inclinacao);c.strokeStyle=paleta.ouro;c.lineWidth=5;c.beginPath();c.moveTo(-230,0);c.lineTo(230,0);c.stroke();
  const prato=(x0,a,b,cor)=>{c.strokeStyle='#8aa0a8';c.lineWidth=2;c.beginPath();c.moveTo(x0,0);c.lineTo(x0,-50);c.stroke();c.fillStyle='#132431';c.strokeStyle='#c9a967';c.beginPath();c.roundRect(x0-90,-110,180,60,8);c.fill();c.stroke();c.fillStyle='#f1dca6';c.font='500 20px Georgia';c.textAlign='center';c.fillText(fmt(a,b)||'0',x0,-72);let bx=x0-80;for(let i=0;i<Math.min(6,Math.abs(Math.round(a)));i++){c.fillStyle=cor;c.fillRect(bx,-128,16,14);c.fillStyle='#1b1a14';c.font='10px Arial';c.fillText('x',bx+8,-117);bx+=20;}};
  prato(-150,eq.a,eq.b,paleta.ouro);prato(150,eq.c,eq.d,paleta.azul);
  c.restore();
  texto.innerHTML=`<span class="formula">${fmt(eq.a,eq.b)} = ${fmt(eq.c,eq.d)}</span>`;
  explicacao.definir(resolvido?`<strong>Resolvido: x = ${formatarNumero(eq.d,2)}.</strong> Confira substituindo na equação original: ${formatarNumero(inicial.a)}·(${formatarNumero(eq.d,2)}) + ${formatarNumero(inicial.b)} = ${formatarNumero(inicial.a*eq.d+inicial.b,2)} e ${formatarNumero(inicial.c)}·(${formatarNumero(eq.d,2)}) + ${formatarNumero(inicial.d)} = ${formatarNumero(inicial.c*eq.d+inicial.d,2)}.`:`A balança representa a igualdade: o que se faz de um lado, faz-se do outro, e ela continua equilibrada. Objetivo: deixar <strong>x sozinho</strong> de um lado. ${eq.c!==0?'Há x nos dois lados: comece subtraindo x de ambos. ':''}${eq.c===0&&eq.b!==0?`Elimine o número ${formatarNumero(eq.b,2)} do lado esquerdo com a operação inversa. `:''}${eq.c===0&&eq.b===0&&eq.a!==1?`Divida os dois lados por ${formatarNumero(eq.a,2)}.`:''}`);
  alternativo(`Equação atual: ${fmt(eq.a,eq.b)} = ${fmt(eq.c,eq.d)}.`);
  contexto.aoAtualizar?.({...eq,resolvido,passos:passos.length});
 }
 tela.tela.addEventListener('redimensionar',desenhar);
 desenhar();
 return ()=>tela.destruir();
}
