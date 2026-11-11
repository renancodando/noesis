// Renan | renancodando
import {obter,salvar,listar} from '../armazenamento/banco.js';
import {adicionarXp,RECOMPENSAS,registrarDiaEstudo} from './perfil.js';
import {diaDe,identificador} from '../utilitarios/texto.js';

async function registrarAtividade(tipo,descricao,referencia,xp=0,extra={}){
 const agora=new Date();
 await salvar('atividades',{tipo,descricao,referencia,xp,data:agora.toISOString(),dia:diaDe(agora),...extra});
 registrarDiaEstudo();
 document.dispatchEvent(new CustomEvent('noesis:atividade',{detail:{tipo,referencia}}));
}

export async function progressoDaAula(aulaId){
 return (await obter('progressoAulas',aulaId))||null;
}

export async function iniciarAula(aula){
 const existente=await progressoDaAula(aula.id);
 if(existente){
  existente.ultimoAcesso=new Date().toISOString();
  await salvar('progressoAulas',existente);
  return existente;
 }
 const registro={aula:aula.id,disciplina:aula.disciplina,iniciadaEm:new Date().toISOString(),ultimoAcesso:new Date().toISOString(),concluidaEm:null,blocosVistos:[],exerciciosCorretos:[],exerciciosTentados:[],praticaConcluida:false,tempoEstimado:0};
 await salvar('progressoAulas',registro);
 await registrarAtividade('aula-iniciada',`Começou a aula “${aula.titulo}”`,aula.id);
 return registro;
}

export async function marcarBlocoVisto(aulaId,indice){
 const registro=await progressoDaAula(aulaId);
 if(!registro||registro.blocosVistos.includes(indice))return;
 registro.blocosVistos.push(indice);
 await salvar('progressoAulas',registro);
}

export async function registrarTentativa({aula,exercicio,conceito,correta,resposta,tentativa,usouDica,tempo}){
 const agora=new Date();
 await salvar('tentativas',{aula:aula.id,disciplina:aula.disciplina,exercicio,conceito:conceito||null,correta,resposta:typeof resposta==='object'?JSON.stringify(resposta).slice(0,400):String(resposta??'').slice(0,400),tentativa,usouDica:Boolean(usouDica),tempo:tempo||0,data:agora.toISOString(),dia:diaDe(agora)});
 const registro=(await progressoDaAula(aula.id))||await iniciarAula(aula);
 if(!registro.exerciciosTentados.includes(exercicio))registro.exerciciosTentados.push(exercicio);
 let xp=0;
 if(correta&&!registro.exerciciosCorretos.includes(exercicio)){
  registro.exerciciosCorretos.push(exercicio);
  xp=tentativa===1&&!usouDica?RECOMPENSAS.exercicioPrimeira:tentativa<=2?RECOMPENSAS.exercicioSegunda:RECOMPENSAS.exercicioTardia;
 }
 await salvar('progressoAulas',registro);
 registrarDiaEstudo();
 if(xp)adicionarXp(xp,tentativa===1&&!usouDica?'Resposta correta de primeira':'Resposta correta');
 document.dispatchEvent(new CustomEvent('noesis:atividade',{detail:{tipo:'tentativa'}}));
 return {registro,xp};
}

export async function concluirPratica(aula,resultado={}){
 const registro=(await progressoDaAula(aula.id))||await iniciarAula(aula);
 if(registro.praticaConcluida)return {registro,xp:0};
 registro.praticaConcluida=true;
 registro.resultadoPratica=resultado;
 await salvar('progressoAulas',registro);
 adicionarXp(RECOMPENSAS.praticaAula,'Atividade prática concluída');
 await registrarAtividade('pratica',`Concluiu a prática da aula “${aula.titulo}”`,aula.id,RECOMPENSAS.praticaAula);
 return {registro,xp:RECOMPENSAS.praticaAula};
}

export function criteriosDeConclusao(aula,registro){
 const total=(aula.exercicios||[]).length;
 const corretos=registro?.exerciciosCorretos.length||0;
 const tentados=registro?.exerciciosTentados.length||0;
 const minimo=Math.ceil(total*0.7);
 return {
  total,corretos,tentados,minimo,
  exercicios:total===0||(tentados>=total&&corretos>=minimo),
  pratica:!aula.pratica||Boolean(registro?.praticaConcluida),
  get completa(){return this.exercicios&&this.pratica;}
 };
}

export async function concluirAula(aula){
 const registro=(await progressoDaAula(aula.id))||await iniciarAula(aula);
 if(registro.concluidaEm)return {registro,nova:false};
 const criterios=criteriosDeConclusao(aula,registro);
 if(!criterios.completa)return {registro,nova:false,pendente:criterios};
 registro.concluidaEm=new Date().toISOString();
 registro.tempoEstimado=aula.duracao||20;
 await salvar('progressoAulas',registro);
 adicionarXp(RECOMPENSAS.concluirAula,`Aula concluída: ${aula.titulo}`);
 await registrarAtividade('aula-concluida',`Concluiu a aula “${aula.titulo}”`,aula.id,RECOMPENSAS.concluirAula);
 const {registrarCartoesDaAula}=await import('../revisoes/agendador.js');
 await registrarCartoesDaAula(aula);
 return {registro,nova:true};
}

export async function registrarLaboratorio(laboratorioId,{atividadeGuiada,desafio,estado,nome}={}){
 const registro=(await obter('laboratorios',laboratorioId))||{id:laboratorioId,atividadeGuiada:false,desafio:false,estado:null,atualizadoEm:null,visitas:0};
 let xp=0,motivo='';
 if(atividadeGuiada&&!registro.atividadeGuiada){registro.atividadeGuiada=true;xp=RECOMPENSAS.atividadeGuiada;motivo=`Atividade guiada concluída em ${nome||laboratorioId.toUpperCase()}`;}
 if(desafio&&!registro.desafio){registro.desafio=true;xp+=RECOMPENSAS.desafioLaboratorio;motivo=`Desafio concluído em ${nome||laboratorioId.toUpperCase()}`;}
 if(estado!==undefined)registro.estado=estado;
 registro.atualizadoEm=new Date().toISOString();
 await salvar('laboratorios',registro);
 if(xp){adicionarXp(xp,motivo);await registrarAtividade(desafio?'desafio':'atividade-guiada',motivo,laboratorioId,xp);}
 return registro;
}

export async function registrarVisitaLaboratorio(laboratorioId){
 const registro=(await obter('laboratorios',laboratorioId))||{id:laboratorioId,atividadeGuiada:false,desafio:false,estado:null,atualizadoEm:null,visitas:0};
 registro.visitas=(registro.visitas||0)+1;
 registro.ultimaVisita=new Date().toISOString();
 await salvar('laboratorios',registro);
 return registro;
}

export async function registrarProjeto(projetoId,{estado,concluido,resultados,nome}={}){
 const registro=(await obter('projetos',projetoId))||{id:projetoId,estado:null,concluidoEm:null,resultados:[],versoes:0,iniciadoEm:new Date().toISOString()};
 if(estado!==undefined){registro.estado=estado;registro.versoes=(registro.versoes||0)+1;}
 if(resultados)registro.resultados=[...(registro.resultados||[]),{data:new Date().toISOString(),...resultados}].slice(-20);
 let xp=0;
 if(concluido&&!registro.concluidoEm){registro.concluidoEm=new Date().toISOString();xp=RECOMPENSAS.projeto;}
 registro.atualizadoEm=new Date().toISOString();
 await salvar('projetos',registro);
 if(xp){adicionarXp(xp,`Projeto concluído: ${nome||projetoId}`);await registrarAtividade('projeto',`Concluiu o projeto “${nome||projetoId}”`,projetoId,xp);}
 return registro;
}

export async function registrarRevisao(cartao,qualidade){
 const xp=qualidade>=4?RECOMPENSAS.revisaoFacil:RECOMPENSAS.revisao;
 adicionarXp(xp,'Revisão realizada');
 await registrarAtividade('revisao',`Revisou “${String(cartao.pergunta).slice(0,60)}”`,cartao.aula,xp,{qualidade});
}

export async function registrarDescoberta({titulo,texto,disciplina,origem}){
 const agora=new Date();
 const descoberta={id:identificador('descoberta'),titulo,texto,disciplina:disciplina||null,origem:origem||null,data:agora.toISOString(),dia:diaDe(agora)};
 await salvar('descobertas',descoberta);
 adicionarXp(RECOMPENSAS.descoberta,'Descoberta registrada');
 await registrarAtividade('descoberta',`Registrou a descoberta “${titulo}”`,descoberta.id,RECOMPENSAS.descoberta);
 return descoberta;
}

export async function resumoProgresso(){
 const [aulas,tentativas,revisoes,projetos,laboratorios,atividades]=await Promise.all(['progressoAulas','tentativas','revisoes','projetos','laboratorios','atividades'].map(nome=>listar(nome)));
 return {aulas,tentativas,revisoes,projetos,laboratorios,atividades};
}
