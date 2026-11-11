// Renan | renancodando
import {grupoControles,painelExplicacao,textoAlternativo,formatarNumero,criar,buscar,buscarTodos,escapar} from '../aulas/interativos/base.js';

const CATALOGO={lampada:{nome:'Lâmpada 12 Ω',r:12,tipo:'lampada'},resistor6:{nome:'Resistor 6 Ω',r:6,tipo:'resistor'},resistor24:{nome:'Resistor 24 Ω',r:24,tipo:'resistor'},interruptor:{nome:'Interruptor',r:0,tipo:'interruptor'}};

export const definicao={
 objetivo:'Montar um circuito com uma fonte, lâmpadas, resistores e interruptores, organizado em ramos paralelos com componentes em série, atendendo requisitos de funcionamento verificados por cálculo (Lei de Ohm e associações).',
 materiais:['Fonte de tensão ajustável (3 a 24 V).','Lâmpadas de 12 Ω, resistores de 6 Ω e 24 Ω, interruptores.','Ramos em paralelo: cada ramo é uma sequência em série ligada aos dois polos da fonte.'],
 instrucoes:['Adicione ramos e, em cada ramo, componentes em série.','Abra e feche interruptores para ver o efeito nos ramos.','Atenda aos critérios: três lâmpadas, um interruptor que apague apenas uma delas, outro que apague tudo, e corrente total segura.'],
 conhecimentos:['Em série, a corrente é a mesma e as tensões se somam; em paralelo, a tensão é a mesma e as correntes se somam.','Um interruptor aberto interrompe apenas o ramo em que está; para desligar tudo, ele precisa estar no caminho comum.','Potência P = V·I = I²·R; lâmpadas brilham conforme a potência.'],
 criterios:[
  {id:'lampadas',texto:'Pelo menos três lâmpadas acesas com o circuito fechado',verificar:e=>({ok:e.lampadasAcesas>=3,detalhe:`${e.lampadasAcesas} acesa(s)`})},
  {id:'individual',texto:'Um interruptor que apaga apenas uma lâmpada (no ramo dela)',verificar:e=>e.interruptorIndividual},
  {id:'geral',texto:'Um interruptor geral que apaga todas (no caminho comum)',verificar:e=>e.temGeral},
  {id:'corrente',texto:'Corrente total abaixo de 3 A com tudo ligado',verificar:e=>({ok:e.correnteTotalTudo<3&&e.correnteTotalTudo>0,detalhe:`${formatarNumero(e.correnteTotalTudo,2)} A`})},
  {id:'brilho',texto:'Nenhuma lâmpada acima de 15 W (queimaria)',verificar:e=>({ok:e.maxPotencia<=15,detalhe:`máx. ${formatarNumero(e.maxPotencia,1)} W`})},
  {id:'explicar',texto:'Sei explicar por que o interruptor geral precisa ficar fora dos ramos',manual:true}
 ],
 resumo:e=>`${e.ramos} ramos, ${e.lampadasAcesas} lâmpadas acesas, ${formatarNumero(e.correnteTotal,2)} A`,
 montar(area,api){
  let ramos=api.estadoGuardado?.ramos||[[{tipo:'lampada',fechado:true}]],geral={presente:false,fechado:true};
  if(api.estadoGuardado?.geral)geral=api.estadoGuardado.geral;
  const controles=grupoControles(area,[{chave:'tensao',rotulo:'Tensão da fonte',min:3,max:24,passo:1,valor:api.estadoGuardado?.tensao||12,unidade:'V',aoMudar:atualizar}]);
  const barra=criar('div',{classe:'botoes-opcoes'});area.append(barra);
  const btnRamo=criar('button',{type:'button',classe:'botao pequeno',texto:'+ ramo em paralelo'});btnRamo.onclick=()=>{ramos.push([]);atualizar();};
  const btnGeral=criar('button',{type:'button',classe:'botao pequeno secundario','aria-pressed':String(geral.presente),texto:'Interruptor geral no caminho comum'});btnGeral.onclick=()=>{geral.presente=!geral.presente;btnGeral.setAttribute('aria-pressed',String(geral.presente));atualizar();};
  barra.append(btnRamo,btnGeral);
  const lista=criar('div',{classe:'ramos-circuito'});area.append(lista);
  const leitura=criar('div',{classe:'leitura-laboratorio'});area.append(leitura);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  let estado={};
  function calcular(estadoInterruptores){
   const V=controles.tensao.valor;
   const fechadoGeral=!geral.presente||(estadoInterruptores?true:geral.fechado);
   const resultados=ramos.map(ramo=>{
    const aberto=ramo.some(c=>c.tipo==='interruptor'&&!(estadoInterruptores?true:c.fechado));
    const R=ramo.reduce((s,c)=>s+CATALOGO[c.tipo].r,0);
    const corrente=!fechadoGeral||aberto||R===0||!ramo.length?0:V/R;
    return {R,corrente,aberto:aberto||!fechadoGeral,componentes:ramo.map(c=>({...c,potencia:corrente*corrente*CATALOGO[c.tipo].r}))};
   });
   return {V,ramos:resultados,correnteTotal:resultados.reduce((s,r)=>s+r.corrente,0),curto:fechadoGeral&&resultados.some((r,i)=>ramos[i].length&&r.R===0&&!r.aberto)};
  }
  function analisar(){
   const atual=calcular(false),tudo=calcular(true);
   const lampadas=atual.ramos.flatMap(r=>r.componentes.filter(c=>c.tipo==='lampada'));
   const lampadasAcesas=lampadas.filter(c=>c.potencia>.5).length;
   const interruptorIndividual=ramos.some(r=>r.some(c=>c.tipo==='interruptor')&&r.filter(c=>c.tipo==='lampada').length===1)&&ramos.filter(r=>r.some(c=>c.tipo==='lampada')).length>=2;
   const maxPotencia=Math.max(0,...tudo.ramos.flatMap(r=>r.componentes.filter(c=>c.tipo==='lampada').map(c=>c.potencia)));
   estado={tensao:atual.V,ramos:ramos.length,lampadasAcesas,interruptorIndividual,temGeral:geral.presente,correnteTotal:atual.correnteTotal,correnteTotalTudo:tudo.correnteTotal,maxPotencia,curto:atual.curto,atual};
   return estado;
  }
  function desenhar(){
   const an=estado.atual;
   lista.innerHTML=ramos.map((ramo,i)=>`<div class="ramo"><h4>Ramo ${i+1} · ${ramo.length?`${formatarNumero(an.ramos[i].R)} Ω · ${an.ramos[i].aberto?'aberto':formatarNumero(an.ramos[i].corrente,2)+' A'}`:'vazio'}<button type="button" class="botao pequeno secundario" data-remover-ramo="${i}">remover ramo</button></h4><div class="componentes-ramo">${ramo.map((c,k)=>`<span class="componente ${c.tipo==='lampada'?'lampada':''} ${c.tipo==='lampada'&&an.ramos[i].componentes[k].potencia>.5?'acesa':''}">${c.tipo==='interruptor'?`<button type="button" data-alternar="${i}-${k}" aria-pressed="${c.fechado}">${c.fechado?'fechado':'aberto'}</button>`:escapar(CATALOGO[c.tipo].nome)}${c.tipo==='lampada'?` <small>${formatarNumero(an.ramos[i].componentes[k].potencia,1)} W</small>`:''}<button type="button" data-remover="${i}-${k}" aria-label="Remover componente">×</button></span>`).join('')}<select data-adicionar="${i}" aria-label="Adicionar componente ao ramo ${i+1}"><option value="">+ componente…</option>${Object.entries(CATALOGO).map(([k,c])=>`<option value="${k}">${c.nome}</option>`).join('')}</select></div></div>`).join('')+(geral.presente?`<div class="ramo"><h4>Caminho comum (fonte)</h4><div class="componentes-ramo"><span class="componente">Interruptor geral <button type="button" data-geral aria-pressed="${geral.fechado}">${geral.fechado?'fechado':'aberto'}</button></span></div></div>`:'');
   buscarTodos('[data-adicionar]',lista).forEach(s=>s.onchange=()=>{if(!s.value)return;ramos[Number(s.dataset.adicionar)].push({tipo:s.value,fechado:true});atualizar();});
   buscarTodos('[data-remover]',lista).forEach(b=>b.onclick=()=>{const [i,k]=b.dataset.remover.split('-').map(Number);ramos[i].splice(k,1);atualizar();});
   buscarTodos('[data-remover-ramo]',lista).forEach(b=>b.onclick=()=>{ramos.splice(Number(b.dataset.removerRamo),1);atualizar();});
   buscarTodos('[data-alternar]',lista).forEach(b=>b.onclick=()=>{const [i,k]=b.dataset.alternar.split('-').map(Number);ramos[i][k].fechado=!ramos[i][k].fechado;atualizar();});
   const g=buscar('[data-geral]',lista);if(g)g.onclick=()=>{geral.fechado=!geral.fechado;atualizar();};
  }
  function atualizar(){
   analisar();desenhar();
   leitura.innerHTML=`<div><small>Corrente total agora</small><strong>${estado.curto?'∞':formatarNumero(estado.correnteTotal,2)}<small>A</small></strong></div><div><small>Com tudo ligado</small><strong>${formatarNumero(estado.correnteTotalTudo,2)}<small>A</small></strong></div><div><small>Lâmpadas acesas</small><strong>${estado.lampadasAcesas}</strong></div><div><small>Maior potência</small><strong>${formatarNumero(estado.maxPotencia,1)}<small>W</small></strong></div>`;
   explicacao.definir(estado.curto?'<strong>Curto-circuito!</strong> Um ramo fechado sem resistência deixa a corrente sem limite. Adicione um componente resistivo ou abra o ramo.':`<strong>${formatarNumero(estado.tensao)} V sobre ${ramos.length} ramo(s).</strong> Cada ramo recebe a tensão inteira da fonte; a corrente total é a soma das correntes dos ramos (${estado.atual.ramos.map(r=>formatarNumero(r.corrente,2)).join(' + ')} A). ${geral.presente?'O interruptor geral, no caminho comum, interrompe todos os ramos de uma vez.':'Sem interruptor no caminho comum, cada interruptor afeta só o seu ramo.'}`);
   alternativo(`${ramos.length} ramos, ${estado.lampadasAcesas} lâmpadas acesas, corrente total ${formatarNumero(estado.correnteTotal,2)} amperes.`);
   api.guardar({ramos,geral,tensao:estado.tensao});api.atualizar(estado);
  }
  atualizar();
  return {estado:()=>estado,reiniciar(){ramos=[[{tipo:'lampada',fechado:true}]];geral={presente:false,fechado:true};btnGeral.setAttribute('aria-pressed','false');controles.tensao.valor=12;atualizar();}};
 }
};
