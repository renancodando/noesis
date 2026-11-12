// Renan | renancodando
import {criarTela,grupoControles,botoesOpcoes,painelExplicacao,textoAlternativo,paleta,formatarNumero,criar,buscar} from './base.js';

function mdc(a,b){return b?mdc(b,a%b):Math.abs(a);}

export function montar(area,parametros={},contexto={}){
 const tela=criarTela(area,{largura:640,altura:300,descricao:'Frações representadas em círculos e na reta numérica'});
 const controles=grupoControles(area,[
  {chave:'n1',rotulo:'Numerador A',min:0,max:12,passo:1,valor:parametros.n1??3,aoMudar:desenhar},
  {chave:'d1',rotulo:'Denominador A',min:1,max:12,passo:1,valor:parametros.d1??4,aoMudar:desenhar},
  {chave:'n2',rotulo:'Numerador B',min:0,max:12,passo:1,valor:parametros.n2??5,aoMudar:desenhar},
  {chave:'d2',rotulo:'Denominador B',min:1,max:12,passo:1,valor:parametros.d2??8,aoMudar:desenhar}
 ]);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 function pizza(c,x,y,r,n,d,cor){for(let i=0;i<d;i++){const a0=i/d*Math.PI*2-Math.PI/2,a1=(i+1)/d*Math.PI*2-Math.PI/2;c.beginPath();c.moveTo(x,y);c.arc(x,y,r,a0,a1);c.closePath();c.fillStyle=i<n?cor:'#132431';c.fill();c.strokeStyle='#8aa0a8';c.lineWidth=1;c.stroke();}if(n>d){c.fillStyle='#f5dfb9';c.font='11px Arial';c.textAlign='center';c.fillText(`${n}/${d} > 1: ${Math.floor(n/d)} inteiro(s) e ${n%d}/${d}`,x,y+r+16);}}
 function desenhar(){
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const n1=controles.n1.valor,d1=controles.d1.valor,n2=controles.n2.valor,d2=controles.d2.valor;
  const v1=n1/d1,v2=n2/d2;
  pizza(c,110,110,70,Math.min(n1,d1),d1,paleta.ouro);pizza(c,330,110,70,Math.min(n2,d2),d2,paleta.azul);
  c.fillStyle='#e8dcc0';c.font='500 16px Georgia';c.textAlign='center';c.fillText(`A = ${n1}/${d1}`,110,205);c.fillText(`B = ${n2}/${d2}`,330,205);
  const x0=40,x1=L-40,y=260;const max=Math.max(1,Math.ceil(Math.max(v1,v2,1)));
  const px=v=>x0+v/max*(x1-x0);
  c.strokeStyle='#8aa0a8';c.lineWidth=1.5;c.beginPath();c.moveTo(x0,y);c.lineTo(x1,y);c.stroke();
  for(let k=0;k<=max;k++){c.beginPath();c.moveTo(px(k),y-8);c.lineTo(px(k),y+8);c.stroke();c.fillStyle='#a9bcc2';c.font='11px Arial';c.fillText(String(k),px(k),y+22);}
  const comum=d1*d2/mdc(d1,d2);for(let k=0;k<=max*comum;k++){const x=px(k/comum);c.strokeStyle='#ffffff22';c.beginPath();c.moveTo(x,y-4);c.lineTo(x,y+4);c.stroke();}
  c.fillStyle=paleta.ouro;c.beginPath();c.arc(px(v1),y-14,6,0,7);c.fill();c.fillStyle=paleta.azul;c.beginPath();c.arc(px(v2),y+14,6,0,7);c.fill();
  c.fillStyle='#e8dcc0';c.font='11px Arial';c.fillText(`A = ${formatarNumero(v1,3)}`,px(v1),y-26);c.fillText(`B = ${formatarNumero(v2,3)}`,px(v2),y+36);
  c.fillStyle='#a9bcc2';c.font='11px Georgia';c.textAlign='left';c.fillText(`denominador comum: ${comum}`,L-180,30);
  const g1=mdc(n1,d1),g2=mdc(n2,d2);
  const comparacao=v1===v2?'A e B são equivalentes: representam o mesmo ponto na reta.':v1>v2?'A é maior que B.':'B é maior que A.';
  explicacao.definir(`<strong>${comparacao}</strong> Com denominador comum ${comum}: A = ${n1*comum/d1}/${comum} e B = ${n2*comum/d2}/${comum}. ${g1>1?`A simplifica para ${n1/g1}/${d1/g1}. `:''}${g2>1?`B simplifica para ${n2/g2}/${d2/g2}. `:''}Em decimal: A = ${formatarNumero(v1,3)} (${formatarNumero(v1*100,1)}%) e B = ${formatarNumero(v2,3)} (${formatarNumero(v2*100,1)}%). Soma A + B = ${n1*comum/d1+n2*comum/d2}/${comum}.`);
  alternativo(`Fração A ${n1}/${d1} igual a ${formatarNumero(v1,3)}; fração B ${n2}/${d2} igual a ${formatarNumero(v2,3)}.`);
  contexto.aoAtualizar?.({n1,d1,n2,d2});
 }
 tela.tela.addEventListener('redimensionar',desenhar);
 desenhar();
 return ()=>tela.destruir();
}

export function montarProporcao(area,parametros={},contexto={}){
 const receita=parametros.receita||[['farinha',250,'g'],['ovos',2,'unidades'],['leite',300,'mL'],['açúcar',120,'g']];
 const base=parametros.base||4;
 const controles=grupoControles(area,[{chave:'pessoas',rotulo:parametros.rotulo||'Pessoas servidas',min:1,max:24,passo:1,valor:base,aoMudar:desenhar}]);
 const tabela=criar('div',{classe:'rolagem-tabela'});area.append(tabela);
 const explicacao=painelExplicacao(area);
 function desenhar(){
  const p=controles.pessoas.valor,fator=p/base;
  tabela.innerHTML=`<table class="tabela"><thead><tr><th>Ingrediente</th><th>Para ${base}</th><th>Para ${p}</th></tr></thead><tbody>${receita.map(([nome,qtd,un])=>`<tr><td>${nome}</td><td>${qtd} ${un}</td><td><strong>${formatarNumero(qtd*fator,qtd*fator%1?1:0)} ${un}</strong></td></tr>`).join('')}</tbody></table>`;
  explicacao.definir(`Fator de proporcionalidade: ${p} ÷ ${base} = <strong>${formatarNumero(fator,3)}</strong>. Cada quantidade é multiplicada pelo mesmo fator: a razão entre dois ingredientes nunca muda (${receita[0][0]}/${receita[2][0]} = ${formatarNumero(receita[0][1]/receita[2][1],3)} em qualquer tamanho). ${fator%1&&receita.some(r=>r[2]==='unidades')?'Repare que “ovos” dá um valor não inteiro: na prática, arredondamos ou escolhemos um múltiplo conveniente.':''}`);
  contexto.aoAtualizar?.({pessoas:p,fator});
 }
 desenhar();
 return ()=>{};
}
