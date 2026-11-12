// Renan | renancodando
import {criarTela,grupoControles,painelExplicacao,textoAlternativo,botoesOpcoes,eixos,tracarCurva,paleta,formatarNumero,criar,buscar} from './base.js';
import {registrarTipo} from '../../exercicios/motor.js';

const FAMILIAS={
 afim:{nome:'Afim · y = a·x + b',coeficientes:[['a',-5,5,.1,1],['b',-6,6,.5,0]],calcular:(c,x)=>c.a*x+c.b,descrever:c=>`y = ${formatarNumero(c.a,1)}·x ${c.b<0?'−':'+'} ${formatarNumero(Math.abs(c.b),1)}`,explicar:c=>`<strong>a = ${formatarNumero(c.a,1)}</strong> é o coeficiente angular: a cada unidade que x avança, y ${c.a>=0?'sobe':'desce'} ${formatarNumero(Math.abs(c.a),1)}. <strong>b = ${formatarNumero(c.b,1)}</strong> é onde a reta corta o eixo y. ${c.a===0?'Com a = 0 a função é constante: a reta fica horizontal.':`A raiz (onde y = 0) está em x = ${formatarNumero(-c.b/c.a,2)}.`}`},
 quadratica:{nome:'Quadrática · y = a·x² + b·x + c',coeficientes:[['a',-3,3,.1,1],['b',-6,6,.5,0],['c',-6,6,.5,0]],calcular:(c,x)=>c.a*x*x+c.b*x+c.c,descrever:c=>`y = ${formatarNumero(c.a,1)}·x² ${c.b<0?'−':'+'} ${formatarNumero(Math.abs(c.b),1)}·x ${c.c<0?'−':'+'} ${formatarNumero(Math.abs(c.c),1)}`,explicar:c=>{if(c.a===0)return 'Com a = 0 a parábola vira uma reta: o termo quadrático desapareceu.';const xv=-c.b/(2*c.a),yv=c.a*xv*xv+c.b*xv+c.c,delta=c.b*c.b-4*c.a*c.c;return `A concavidade está voltada para ${c.a>0?'cima (a > 0)':'baixo (a < 0)'}. O vértice fica em (${formatarNumero(xv,2)}, ${formatarNumero(yv,2)}). ${delta>0?`Como Δ = ${formatarNumero(delta,2)} > 0, há duas raízes: x = ${formatarNumero((-c.b-Math.sqrt(delta))/(2*c.a),2)} e x = ${formatarNumero((-c.b+Math.sqrt(delta))/(2*c.a),2)}.`:delta===0?'Como Δ = 0, a parábola toca o eixo x em um único ponto.':`Como Δ = ${formatarNumero(delta,2)} < 0, a parábola não cruza o eixo x.`}`;}},
 exponencial:{nome:'Exponencial · y = a·bˣ',coeficientes:[['a',-4,4,.1,1],['b',.2,3,.05,2]],calcular:(c,x)=>c.a*Math.pow(c.b,x),descrever:c=>`y = ${formatarNumero(c.a,1)}·${formatarNumero(c.b,2)}ˣ`,explicar:c=>`Quando a base b é ${c.b>1?'maior que 1, a função cresce cada vez mais rápido':c.b===1?'igual a 1, a função é constante':'menor que 1, a função decresce e se aproxima de zero'}. O valor em x = 0 é sempre a = ${formatarNumero(c.a,1)}, porque b⁰ = 1.`},
 seno:{nome:'Senoidal · y = a·sen(b·x) + c',coeficientes:[['a',-4,4,.1,2],['b',.2,4,.1,1],['c',-4,4,.5,0]],calcular:(c,x)=>c.a*Math.sin(c.b*x)+c.c,descrever:c=>`y = ${formatarNumero(c.a,1)}·sen(${formatarNumero(c.b,1)}·x) ${c.c<0?'−':'+'} ${formatarNumero(Math.abs(c.c),1)}`,explicar:c=>`A amplitude é |a| = ${formatarNumero(Math.abs(c.a),1)}; o período é 2π/b ≈ ${formatarNumero(2*Math.PI/c.b,2)}; a oscilação acontece em torno de y = ${formatarNumero(c.c,1)}.`}
};

export function montar(area,parametros={},contexto={}){
 const familias=(parametros.familias||Object.keys(FAMILIAS)).filter(f=>FAMILIAS[f]);
 let familiaAtual=parametros.familia&&FAMILIAS[parametros.familia]?parametros.familia:familias[0];
 const xMin=parametros.xMin??-6,xMax=parametros.xMax??6,yMin=parametros.yMin??-6,yMax=parametros.yMax??6;
 const alvo=parametros.alvo||null;
 const tela=criarTela(area,{largura:640,altura:360,descricao:'Gráfico da função com coeficientes ajustáveis'});
 let seletor=null;
 if(familias.length>1)seletor=botoesOpcoes(area,familias.map(f=>({valor:f,rotulo:FAMILIAS[f].nome.split(' · ')[0]})),{selecionado:familiaAtual,aoEscolher:f=>{familiaAtual=f;montarControles();desenhar();},rotulo:'Família de funções'});
 const areaControles=criar('div');area.append(areaControles);
 const explicacao=painelExplicacao(area);
 const alternativo=textoAlternativo(area);
 let controles={},coeficientes={};
 let pontoMarcado=null;
 function montarControles(){
  areaControles.replaceChildren();
  const familia=FAMILIAS[familiaAtual];
  controles=grupoControles(areaControles,familia.coeficientes.map(([chave,min,max,passo,valor])=>({chave,rotulo:`Coeficiente ${chave}`,min,max,passo,valor:parametros.iniciais?.[chave]??valor,aoMudar:()=>desenhar()})));
 }
 function lerCoeficientes(){coeficientes={};Object.entries(controles).forEach(([chave,controle])=>coeficientes[chave]=controle.valor);return coeficientes;}
 function desenhar(){
  const familia=FAMILIAS[familiaAtual],c=lerCoeficientes();
  const {contexto:ctx,largura,altura}=tela;
  ctx.clearRect(0,0,largura,altura);
  const {ex,ey}=eixos(ctx,{largura,altura,xMin,xMax,yMin,yMax});
  if(alvo&&alvo.familia===familiaAtual)tracarCurva(ctx,x=>familia.calcular(alvo.coeficientes,x),{ex,ey,xMin,xMax,cor:'#7fc3a488',largura:6});
  tracarCurva(ctx,x=>familia.calcular(c,x),{ex,ey,xMin,xMax,cor:paleta.ouro,largura:2.4});
  if(pontoMarcado){const y=familia.calcular(c,pontoMarcado);if(Number.isFinite(y)&&y>=yMin&&y<=yMax){ctx.fillStyle=paleta.ambar;ctx.beginPath();ctx.arc(ex(pontoMarcado),ey(y),5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f5dfb9';ctx.font='12px Georgia';ctx.textAlign='left';ctx.fillText(`(${formatarNumero(pontoMarcado,1)}, ${formatarNumero(y,2)})`,ex(pontoMarcado)+8,ey(y)-8);}}
  ctx.fillStyle='#f1dca6';ctx.font='500 14px Georgia';ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(familia.descrever(c),10,8);
  explicacao.definir(familia.explicar(c)+(pontoMarcado!==null?` Toque ou clique no gráfico para ler outro ponto.`:' Toque ou clique no gráfico para ler o valor de y em um ponto.'));
  alternativo(`Função ${familia.descrever(c)} no intervalo de x entre ${xMin} e ${xMax}. ${familia.explicar(c).replace(/<[^>]+>/g,'')}`);
  contexto.aoAtualizar?.({familia:familiaAtual,coeficientes:{...c}});
 }
 tela.tela.addEventListener('pointerdown',evento=>{const caixa=tela.tela.getBoundingClientRect();pontoMarcado=xMin+(evento.clientX-caixa.left)/caixa.width*(xMax-xMin);desenhar();});
 tela.tela.addEventListener('redimensionar',desenhar);
 montarControles();desenhar();
 return Object.assign(()=>tela.destruir(),{lerCoeficientes,get familia(){return familiaAtual},definir(valores){Object.entries(valores).forEach(([chave,v])=>{if(controles[chave])controles[chave].valor=v;});desenhar();}});
}

registrarTipo('grafico',{
 montar(corpo,exercicio){
  const alvo=exercicio.alvo;
  const descricao=criar('p',{classe:'instrucao-exercicio',html:exercicio.instrucao||'Ajuste os coeficientes até que a curva dourada coincida com a curva verde.'});
  const area=criar('div',{classe:'interativo'});
  corpo.append(descricao,area);
  const api=montar(area,{familias:[alvo.familia],familia:alvo.familia,alvo,iniciais:exercicio.iniciais,xMin:exercicio.xMin,xMax:exercicio.xMax,yMin:exercicio.yMin,yMax:exercicio.yMax},{});
  const tolerancia=exercicio.tolerancia??.25;
  return {
   verificar(){
    const c=api.lerCoeficientes();
    const diferencas=Object.entries(alvo.coeficientes).map(([chave,valor])=>({chave,erro:Math.abs((c[chave]??0)-valor)}));
    const correta=diferencas.every(d=>d.erro<=tolerancia);
    const pior=diferencas.sort((a,b)=>b.erro-a.erro)[0];
    return {correta,resposta:c,parcial:!correta&&diferencas.filter(d=>d.erro<=tolerancia).length>0,feedback:correta?'':(exercicio.feedback?.porCoeficiente?.[pior.chave]||`O coeficiente ${pior.chave} ainda está distante. Observe o que ele controla na curva.`)};
   },
   revelar(){api.definir(alvo.coeficientes);},
   restaurar(valores){if(valores&&typeof valores==='object')api.definir(valores);},
   desativar(){buscar('.controles',area)?.querySelectorAll('input').forEach(e=>e.disabled=true);}
  };
 }
});
