// Renan | renancodando
import {criarTela,grupoControles,botoesOpcoes,painelExplicacao,textoAlternativo,animador,movimentoReduzido,paleta,formatarNumero,criar,buscar} from './base.js';
import {adaptarExperimento} from './adaptador.js';
const carregar=()=>import('../../laboratorios/prisma.js');
export const {montar}=adaptarExperimento(carregar,'movimento');
export const montarOhm=adaptarExperimento(carregar,'circuitos').montar;

export function montarEnergia(area,parametros={},contexto={}){
 const g=9.81;
 const tela=criarTela(area,{largura:640,altura:300,descricao:'Bola descendo uma rampa com barras de energia potencial e cinética'});
 let atrito=false,t=0,posicao=0;
 const opcoes=botoesOpcoes(area,[{valor:false,rotulo:'Sem atrito'},{valor:true,rotulo:'Com atrito'}],{selecionado:false,aoEscolher:v=>{atrito=v;reiniciar();},rotulo:'Atrito'});
 const controles=grupoControles(area,[{chave:'altura',rotulo:'Altura inicial',min:1,max:10,passo:.5,valor:parametros.altura||6,unidade:'m',aoMudar:reiniciar},{chave:'massa',rotulo:'Massa',min:.5,max:5,passo:.5,valor:1,unidade:'kg',aoMudar:reiniciar}]);
 const leitura=criar('div',{classe:'leitura'});area.append(leitura);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 const botao=criar('button',{type:'button',classe:'botao pequeno',texto:'Soltar a bola'});opcoes.grupo.append(botao);
 let estado={};
 function reiniciar(){t=0;posicao=0;anim.parar();calcular(0);desenhar();}
 function calcular(s){
  const h0=controles.altura.valor,m=controles.massa.valor;
  const h=h0*(1-s)*(1-s);
  const Ep0=m*g*h0;const Ep=m*g*h;
  const perda=atrito?Ep0*.35*s:0;
  const Ec=Math.max(0,Ep0-Ep-perda);
  estado={h0,m,h,Ep,Ec,perda,Etotal:Ep0,v:Math.sqrt(2*Ec/m),vFinal:Math.sqrt(2*g*h0*(atrito?.65:1)),atrito};
  leitura.innerHTML=`<div><small>Altura</small><strong>${formatarNumero(h,2)}<small>m</small></strong></div><div><small>E. potencial</small><strong>${formatarNumero(Ep,1)}<small>J</small></strong></div><div><small>E. cinética</small><strong>${formatarNumero(Ec,1)}<small>J</small></strong></div><div><small>Velocidade</small><strong>${formatarNumero(estado.v,2)}<small>m/s</small></strong></div>${atrito?`<div><small>Dissipada</small><strong>${formatarNumero(perda,1)}<small>J</small></strong></div>`:''}`;
  contexto.aoAtualizar?.(estado);
 }
 function desenhar(){
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const x0=40,x1=L*.55,yTopo=40,yBase=A-40;
  c.strokeStyle='#8aa0a8';c.lineWidth=3;c.beginPath();c.moveTo(x0,yTopo);c.quadraticCurveTo(x0+60,yBase,x1,yBase);c.lineTo(L*.62,yBase);c.stroke();
  const s=posicao;const bx=x0+(x1-x0)*s,by=yTopo+(yBase-yTopo)*(1-(1-s)*(1-s));
  c.fillStyle=paleta.ambar;c.beginPath();c.arc(bx,by-10,10,0,7);c.fill();
  c.fillStyle='#a9bcc2';c.font='11px Arial';c.textAlign='left';c.fillText(`h₀ = ${estado.h0} m`,x0,yTopo-10);
  const barra=(x,rotulo,valor,cor)=>{const alt=(A-80)*(estado.Etotal?valor/estado.Etotal:0);c.fillStyle='#132431';c.fillRect(x,40,46,A-80);c.fillStyle=cor;c.fillRect(x,40+(A-80)-alt,46,alt);c.fillStyle='#e8dcc0';c.font='11px Arial';c.textAlign='center';c.fillText(rotulo,x+23,A-24);c.fillText(formatarNumero(valor,0)+' J',x+23,32);};
  barra(L*.7,'Ep',estado.Ep,paleta.azul);barra(L*.7+60,'Ec',estado.Ec,paleta.ouro);if(atrito)barra(L*.7+120,'calor',estado.perda,paleta.rubi);
 }
 const anim=animador(delta=>{t+=delta;posicao=Math.min(1,t/2.2);calcular(posicao);desenhar();if(posicao>=1)anim.parar();});
 botao.onclick=()=>{t=0;posicao=0;if(movimentoReduzido()){posicao=1;calcular(1);desenhar();}else anim.iniciar();};
 tela.tela.addEventListener('redimensionar',desenhar);
 calcular(0);desenhar();
 explicacao.definir('A energia mecânica total (potencial + cinética) se conserva sem atrito: a barra azul se transforma na dourada enquanto a bola desce. Com atrito, parte vira energia térmica (barra vermelha) e a velocidade final diminui. A massa muda as energias, mas não a velocidade final sem atrito: v = √(2gh).');
 alternativo('Rampa com bola; barras de energia potencial, cinética e dissipada.');
 return ()=>{anim.parar();tela.destruir();};
}
