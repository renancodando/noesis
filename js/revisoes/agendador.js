// Renan | renancodando
import {listar,salvar,obter,salvarVarios} from '../armazenamento/banco.js';
import {diaDe,diasEntre} from '../utilitarios/texto.js';
import {buscar} from '../utilitarios/dom.js';

export const QUALIDADES=[
 {valor:1,rotulo:'Errei',descricao:'Não lembrei ou errei a resposta.'},
 {valor:3,rotulo:'Difícil',descricao:'Lembrei com esforço ou com ajuda.'},
 {valor:4,rotulo:'Bom',descricao:'Lembrei depois de pensar um pouco.'},
 {valor:5,rotulo:'Fácil',descricao:'Lembrei imediatamente.'}
];

export function somarDias(dia,quantidade){
 const data=new Date(dia+'T00:00:00');
 data.setDate(data.getDate()+quantidade);
 return diaDe(data);
}

export function calcularProximaRevisao(cartao,qualidade,hoje=diaDe()){
 let {facilidade=2.5,intervalo=0,repeticoes=0}=cartao;
 if(qualidade<3){repeticoes=0;intervalo=1;}
 else{
  repeticoes+=1;
  intervalo=repeticoes===1?1:repeticoes===2?6:Math.round(intervalo*facilidade);
 }
 facilidade=Math.max(1.3,facilidade+(0.1-(5-qualidade)*(0.08+(5-qualidade)*0.02)));
 facilidade=Math.round(facilidade*100)/100;
 return {facilidade,intervalo,repeticoes,proxima:somarDias(hoje,intervalo)};
}

export function criarCartao({id,aula,disciplina,conceito,pergunta,resposta,tipo='pergunta',dados=null}){
 return {id,aula,disciplina,conceito:conceito||null,pergunta,resposta,tipo,dados,facilidade:2.5,intervalo:0,repeticoes:0,proxima:somarDias(diaDe(),1),historico:[],criadoEm:new Date().toISOString()};
}

export async function registrarCartoesDaAula(aula){
 const existentes=new Set((await listar('revisoes')).map(cartao=>cartao.id));
 const novos=(aula.revisao||[]).map((item,indice)=>criarCartao({id:`${aula.id}#revisao-${indice+1}`,aula:aula.id,disciplina:aula.disciplina,conceito:item.conceito,pergunta:item.pergunta,resposta:item.resposta,tipo:item.tipo||'pergunta',dados:item.dados||null})).filter(cartao=>!existentes.has(cartao.id));
 if(novos.length)await salvarVarios('revisoes',novos);
 await atualizarPendencias();
 return novos.length;
}

export async function responderCartao(id,qualidade){
 const cartao=await obter('revisoes',id);
 if(!cartao)return null;
 const atualizado={...cartao,...calcularProximaRevisao(cartao,qualidade),historico:[...(cartao.historico||[]),{data:new Date().toISOString(),qualidade}].slice(-60),ultimaRevisao:new Date().toISOString()};
 await salvar('revisoes',atualizado);
 await atualizarPendencias();
 return atualizado;
}

export async function cartoesPendentes(hoje=diaDe()){
 const cartoes=await listar('revisoes');
 return cartoes.filter(cartao=>cartao.proxima<=hoje).sort((a,b)=>prioridade(b,hoje)-prioridade(a,hoje));
}

export function prioridade(cartao,hoje=diaDe()){
 const atraso=Math.max(0,diasEntre(cartao.proxima,hoje));
 const fragilidade=(3-Math.min(3,cartao.facilidade-1.3))*10;
 const erros=(cartao.historico||[]).slice(-3).filter(item=>item.qualidade<3).length*8;
 return atraso*4+fragilidade+erros;
}

export async function atualizarPendencias(){
 const pendentes=await cartoesPendentes();
 document.body.dataset.revisoesPendentes=pendentes.length?String(pendentes.length):'';
 const marca=buscar('.notificacoes b');
 if(marca&&pendentes.length)marca.hidden=false;
 document.dispatchEvent(new CustomEvent('noesis:revisoes',{detail:{pendentes:pendentes.length}}));
 return pendentes.length;
}

export function situacaoDoCartao(cartao,hoje=diaDe()){
 if(cartao.proxima<=hoje)return 'pendente';
 if(cartao.repeticoes>=3&&cartao.intervalo>=14&&cartao.facilidade>=2.3)return 'consolidado';
 return 'agendado';
}
