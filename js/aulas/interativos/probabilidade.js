// Renan | renancodando
import {criarTela,grupoControles,botoesOpcoes,painelExplicacao,textoAlternativo,paleta,formatarNumero,criar,buscar} from './base.js';

export function montar(area,parametros={},contexto={}){
 let modo=parametros.modo||'dado',contagens=[],total=0;
 const tela=criarTela(area,{largura:640,altura:300,descricao:'Histograma das frequências observadas e das probabilidades teóricas'});
 const opcoes=botoesOpcoes(area,[{valor:'moeda',rotulo:'Moeda'},{valor:'dado',rotulo:'Um dado'},{valor:'dois',rotulo:'Soma de dois dados'}],{selecionado:modo,aoEscolher:v=>{modo=v;zerar();},rotulo:'Experimento'});
 const botoes=criar('div',{classe:'botoes-opcoes'});area.append(botoes);
 [1,10,100,1000].forEach(n=>{const b=criar('button',{type:'button',classe:'botao pequeno',texto:`Lançar ${n}×`});b.onclick=()=>lancar(n);botoes.append(b);});
 const limpar=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Zerar'});limpar.onclick=zerar;botoes.append(limpar);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 function faces(){return modo==='moeda'?['cara','coroa']:modo==='dado'?[1,2,3,4,5,6]:[2,3,4,5,6,7,8,9,10,11,12];}
 function teorica(i){if(modo==='moeda')return .5;if(modo==='dado')return 1/6;const s=i+2;return (6-Math.abs(7-s))/36;}
 function zerar(){contagens=faces().map(()=>0);total=0;desenhar();}
 function lancar(n){for(let k=0;k<n;k++){let r;if(modo==='moeda')r=Math.floor(Math.random()*2);else if(modo==='dado')r=Math.floor(Math.random()*6);else r=Math.floor(Math.random()*6)+Math.floor(Math.random()*6);contagens[r]++;}total+=n;desenhar();}
 function desenhar(){
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const f=faces(),n=f.length,margem=40,lb=(L-2*margem)/n,base=A-40;
  const maxP=Math.max(...f.map((_,i)=>teorica(i)),...contagens.map(v=>total?v/total:0))*1.15;
  f.forEach((face,i)=>{const x=margem+i*lb;const obs=total?contagens[i]/total:0;const te=teorica(i);c.fillStyle=paleta.ouro+'cc';c.fillRect(x+lb*.15,base-obs/maxP*(base-30),lb*.35,obs/maxP*(base-30));c.fillStyle=paleta.azul+'99';c.fillRect(x+lb*.5,base-te/maxP*(base-30),lb*.35,te/maxP*(base-30));c.fillStyle='#e8dcc0';c.font='11px Arial';c.textAlign='center';c.fillText(String(face),x+lb/2,base+16);if(total){c.fillStyle='#f5dfb9';c.font='9px Arial';c.fillText(formatarNumero(obs*100,1)+'%',x+lb*.33,base-obs/maxP*(base-30)-4);}});
  c.strokeStyle='#8aa0a8';c.beginPath();c.moveTo(margem,base);c.lineTo(L-margem,base);c.stroke();
  c.fillStyle=paleta.ouro;c.fillRect(margem,8,10,10);c.fillStyle='#e8dcc0';c.font='11px Arial';c.textAlign='left';c.fillText(`observado (${total} lançamentos)`,margem+14,17);c.fillStyle=paleta.azul;c.fillRect(margem+200,8,10,10);c.fillStyle='#e8dcc0';c.fillText('probabilidade teórica',margem+214,17);
  const desvio=total?Math.max(...f.map((_,i)=>Math.abs(contagens[i]/total-teorica(i)))):0;
  explicacao.definir(total?`Após <strong>${total}</strong> lançamentos, a maior diferença entre frequência observada e probabilidade teórica é <strong>${formatarNumero(desvio*100,1)} pontos percentuais</strong>. ${total<30?'Com poucos lançamentos, as barras douradas oscilam muito: o acaso domina.':total<300?'As frequências começam a se aproximar das probabilidades, mas ainda com oscilações.':'Com muitos lançamentos, as frequências se estabilizam perto das probabilidades teóricas: é a lei dos grandes números.'} ${modo==='dois'?'A soma 7 é a mais provável porque tem seis combinações (1+6, 2+5, 3+4, 4+3, 5+2, 6+1) entre 36.':''}`:'Lance para começar. Cada resultado individual é imprevisível; o padrão aparece na repetição.');
  alternativo(`${total} lançamentos. Frequências: ${f.map((face,i)=>`${face}: ${contagens[i]}`).join(', ')}.`);
  contexto.aoAtualizar?.({modo,total,contagens:[...contagens]});
 }
 tela.tela.addEventListener('redimensionar',desenhar);
 zerar();
 return ()=>tela.destruir();
}
