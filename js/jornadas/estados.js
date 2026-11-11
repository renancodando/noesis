// Renan | renancodando
import {listar} from '../armazenamento/banco.js';
import {diaDe} from '../utilitarios/texto.js';

export const ESTADOS={
 'nao-estudada':{rotulo:'Ainda não estudada',icone:'olho',ordem:0},
 'em-aprendizagem':{rotulo:'Em aprendizagem',icone:'lampada',ordem:1},
 'precisa-revisao':{rotulo:'Precisa de revisão',icone:'relogio',ordem:2},
 'dominio-demonstrado':{rotulo:'Domínio demonstrado',icone:'verificado',ordem:3}
};

export function estadoDaAula(progresso,cartoes,hoje=diaDe()){
 if(!progresso)return 'nao-estudada';
 if(!progresso.concluidaEm)return 'em-aprendizagem';
 const doConteudo=cartoes.filter(cartao=>cartao.aula===progresso.aula);
 if(doConteudo.some(cartao=>cartao.proxima<=hoje))return 'precisa-revisao';
 const recentes=doConteudo.flatMap(cartao=>(cartao.historico||[]).slice(-2));
 if(recentes.length&&recentes.filter(item=>item.qualidade<3).length>=2)return 'precisa-revisao';
 const consolidados=doConteudo.filter(cartao=>cartao.repeticoes>=2&&cartao.intervalo>=6);
 if(doConteudo.length&&consolidados.length===doConteudo.length)return 'dominio-demonstrado';
 if(!doConteudo.length)return 'dominio-demonstrado';
 return 'em-aprendizagem';
}

export async function mapaDeEstados(){
 const [progressos,cartoes]=await Promise.all([listar('progressoAulas'),listar('revisoes')]);
 const hoje=diaDe();
 const estados=new Map();
 progressos.forEach(progresso=>estados.set(progresso.aula,estadoDaAula(progresso,cartoes,hoje)));
 return {estados,progressos:new Map(progressos.map(item=>[item.aula,item])),cartoes,obter:id=>estados.get(id)||'nao-estudada'};
}

export function concluida(estado){
 return estado==='precisa-revisao'||estado==='dominio-demonstrado';
}

export function prerequisitosPendentes(aula,catalogo,obterEstado){
 return (aula.prerequisitos||[]).filter(id=>!concluida(obterEstado(id))).map(id=>catalogo.aulas.find(item=>item.id===id)||{id,titulo:id});
}

export function etapasDaJornada(disciplina,catalogo,obterEstado){
 const etapas=disciplina.jornada.etapas.map(chave=>catalogo.aulas.find(aula=>aula.id===`${disciplina.id}/${chave}`)).filter(Boolean);
 return etapas.map((aula,indice)=>{
  const estado=obterEstado(aula.id);
  const pendentes=prerequisitosPendentes(aula,catalogo,obterEstado);
  return {aula,indice,estado,pendentes,bloqueada:pendentes.length>0,concluida:concluida(estado)};
 });
}

export function resumoDaJornada(etapas){
 const concluidas=etapas.filter(etapa=>etapa.concluida).length;
 const emAndamento=etapas.find(etapa=>etapa.estado==='em-aprendizagem')||etapas.find(etapa=>!etapa.concluida&&!etapa.bloqueada)||null;
 return {total:etapas.length,concluidas,proporcao:etapas.length?concluidas/etapas.length:0,proxima:emAndamento,revisoes:etapas.filter(etapa=>etapa.estado==='precisa-revisao').length,dominadas:etapas.filter(etapa=>etapa.estado==='dominio-demonstrado').length};
}
