// Renan | renancodando
import {criar,buscar,buscarTodos,escapar,reduzirMovimento} from '../../utilitarios/dom.js';
import {formatarNumero} from '../../utilitarios/texto.js';

export function criarTela(area,{largura=640,altura=360,descricao='Visualização'}={}){
 const tela=criar('canvas',{role:'img','aria-label':descricao});
 area.append(tela);
 const contexto=tela.getContext('2d');
 let proporcao=1;
 function ajustar(){
  const disponivel=Math.max(240,Math.min(largura,area.clientWidth-2));
  proporcao=Math.min(devicePixelRatio||1,2);
  const alturaReal=Math.round(disponivel*altura/largura);
  tela.width=Math.round(disponivel*proporcao);tela.height=Math.round(alturaReal*proporcao);
  tela.style.width=disponivel+'px';tela.style.height=alturaReal+'px';
  contexto.setTransform(proporcao,0,0,proporcao,0,0);
  return {largura:disponivel,altura:alturaReal};
 }
 let medidas=ajustar();
 const observador=new ResizeObserver(()=>{const novas=ajustar();if(novas.largura!==medidas.largura){medidas=novas;tela.dispatchEvent(new Event('redimensionar'));}});
 observador.observe(area);
 return {tela,contexto,get largura(){return medidas.largura},get altura(){return medidas.altura},destruir(){observador.disconnect();}};
}

export function controleDeslizante({id,rotulo,min,max,passo=1,valor,unidade='',formatar,aoMudar}){
 const linha=criar('div',{classe:'controle'});
 const identificador=id||'controle-'+Math.random().toString(36).slice(2,8);
 linha.innerHTML=`<label for="${identificador}">${rotulo}</label><input id="${identificador}" type="range" min="${min}" max="${max}" step="${passo}" value="${valor}"><output for="${identificador}"></output>`;
 const entrada=buscar('input',linha),saida=buscar('output',linha);
 const mostrar=()=>saida.textContent=(formatar?formatar(Number(entrada.value)):formatarNumero(Number(entrada.value),String(passo).includes('.')?String(passo).split('.')[1].length:0))+(unidade?' '+unidade:'');
 mostrar();
 entrada.addEventListener('input',()=>{mostrar();aoMudar?.(Number(entrada.value));});
 return {elemento:linha,entrada,get valor(){return Number(entrada.value)},set valor(v){entrada.value=v;mostrar();}};
}

export function grupoControles(area,definicoes,{ladoALado=true}={}){
 const grupo=criar('div',{classe:'controles'+(ladoALado?' lado-a-lado':'')});
 const controles={};
 definicoes.forEach(definicao=>{const controle=controleDeslizante(definicao);controles[definicao.chave]=controle;grupo.append(controle.elemento);});
 area.append(grupo);
 return controles;
}

export function botoesOpcoes(area,opcoes,{selecionado,aoEscolher,rotulo='Opções'}={}){
 const grupo=criar('div',{classe:'botoes-opcoes',role:'group','aria-label':rotulo});
 const botoes=opcoes.map(opcao=>{const botao=criar('button',{type:'button',classe:'botao pequeno secundario','aria-pressed':String(opcao.valor===selecionado),texto:opcao.rotulo});botao.onclick=()=>{botoes.forEach(b=>b.setAttribute('aria-pressed','false'));botao.setAttribute('aria-pressed','true');aoEscolher?.(opcao.valor);};grupo.append(botao);return botao;});
 area.append(grupo);
 return {grupo,selecionar(valor){botoes.forEach((b,i)=>b.setAttribute('aria-pressed',String(opcoes[i].valor===valor)));}};
}

export function painelExplicacao(area){
 const painel=criar('p',{classe:'explicacao-interativo','aria-live':'polite'});
 area.append(painel);
 return {definir(html){painel.innerHTML=html;}};
}

export function textoAlternativo(area){
 const paragrafo=criar('p',{classe:'texto-alternativo'});
 area.append(paragrafo);
 return texto=>paragrafo.textContent=texto;
}

export function botaoAcao(area,texto,aoClicar,{secundario=true}={}){
 let grupo=buscar(':scope>.acoes-painel',area);
 if(!grupo){grupo=criar('div',{classe:'acoes-painel'});area.append(grupo);}
 const botao=criar('button',{type:'button',classe:'botao pequeno'+(secundario?' secundario':''),texto});
 botao.onclick=aoClicar;
 grupo.append(botao);
 return botao;
}

export function animador(desenhar){
 let quadro=0,ativo=false,anterior=0;
 function passo(agora){
  if(!ativo)return;
  const delta=anterior?Math.min(.05,(agora-anterior)/1000):0;
  anterior=agora;
  desenhar(delta,agora/1000);
  quadro=requestAnimationFrame(passo);
 }
 return {
  iniciar(){if(ativo)return;ativo=true;anterior=0;quadro=requestAnimationFrame(passo);},
  parar(){ativo=false;cancelAnimationFrame(quadro);},
  get ativo(){return ativo},
  alternar(){ativo?this.parar():this.iniciar();}
 };
}

export function movimentoReduzido(){return reduzirMovimento.matches||document.documentElement.classList.contains('movimento-pausado');}

export function eixos(contexto,{largura,altura,xMin,xMax,yMin,yMax,passoX=1,passoY=1,rotuloX='x',rotuloY='y',grade=true}){
 const ex=x=>(x-xMin)/(xMax-xMin)*largura,ey=y=>altura-(y-yMin)/(yMax-yMin)*altura;
 contexto.save();
 if(grade){
  contexto.strokeStyle='#1d3340';contexto.lineWidth=1;
  for(let x=Math.ceil(xMin/passoX)*passoX;x<=xMax;x+=passoX){contexto.beginPath();contexto.moveTo(ex(x),0);contexto.lineTo(ex(x),altura);contexto.stroke();}
  for(let y=Math.ceil(yMin/passoY)*passoY;y<=yMax;y+=passoY){contexto.beginPath();contexto.moveTo(0,ey(y));contexto.lineTo(largura,ey(y));contexto.stroke();}
 }
 contexto.strokeStyle='#8aa0a8';contexto.lineWidth=1.2;
 contexto.beginPath();contexto.moveTo(0,ey(0));contexto.lineTo(largura,ey(0));contexto.moveTo(ex(0),0);contexto.lineTo(ex(0),altura);contexto.stroke();
 contexto.fillStyle='#9fb4bb';contexto.font='11px Arial';contexto.textAlign='center';contexto.textBaseline='top';
 for(let x=Math.ceil(xMin/passoX)*passoX;x<=xMax;x+=passoX){if(Math.abs(x)<1e-9)continue;contexto.fillText(formatarNumero(x,Number.isInteger(passoX)?0:1),ex(x),Math.min(altura-14,ey(0)+4));}
 contexto.textAlign='right';contexto.textBaseline='middle';
 for(let y=Math.ceil(yMin/passoY)*passoY;y<=yMax;y+=passoY){if(Math.abs(y)<1e-9)continue;contexto.fillText(formatarNumero(y,Number.isInteger(passoY)?0:1),Math.max(22,ex(0)-5),ey(y));}
 contexto.fillStyle='#d9c48f';contexto.font='italic 12px Georgia';contexto.textAlign='right';contexto.textBaseline='bottom';contexto.fillText(rotuloX,largura-6,ey(0)-4);
 contexto.textAlign='left';contexto.textBaseline='top';contexto.fillText(rotuloY,ex(0)+6,4);
 contexto.restore();
 return {ex,ey};
}

export function tracarCurva(contexto,funcao,{ex,ey,xMin,xMax,amostras=300,cor='#f1dca6',largura=2,limiteY=1e4}){
 contexto.save();contexto.strokeStyle=cor;contexto.lineWidth=largura;contexto.lineJoin='round';contexto.beginPath();
 let desenhando=false;
 for(let i=0;i<=amostras;i++){
  const x=xMin+(xMax-xMin)*i/amostras,y=funcao(x);
  if(!Number.isFinite(y)||Math.abs(y)>limiteY){desenhando=false;continue;}
  if(!desenhando){contexto.moveTo(ex(x),ey(y));desenhando=true;}else contexto.lineTo(ex(x),ey(y));
 }
 contexto.stroke();contexto.restore();
}

export const paleta={ouro:'#f1dca6',ambar:'#e0a85a',verde:'#7fc3a4',azul:'#86b4d8',rubi:'#d47a72',lilas:'#b8a8ec',rosa:'#d296a8',cinza:'#8aa0a8'};
export {formatarNumero,escapar,criar,buscar,buscarTodos};
