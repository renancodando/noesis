// Renan | renancodando
import {reduzirMovimento} from '../utilitarios/dom.js';
import {diaDe,diasEntre} from '../utilitarios/texto.js';

const CHAVE='noesis-jornada',VERSAO_PERFIL=2;
export const RECOMPENSAS={
 descobrirDominio:40,expedicao:75,missao:150,
 exercicioPrimeira:15,exercicioSegunda:10,exercicioTardia:5,
 praticaAula:40,concluirAula:120,atividadeGuiada:60,desafioLaboratorio:100,
 projeto:200,revisao:10,revisaoFacil:15,descoberta:10
};
const inicial=()=>({
 versao:VERSAO_PERFIL,nome:'Explorador',xp:0,demonstracao:false,
 visitados:[],salvos:[],concluidos:[],missao:false,anotacoes:[],agenda:[],notificacoesLidas:false,
 diasEstudo:[],criadoEm:new Date().toISOString(),
 preferencias:{movimento:!reduzirMovimento.matches,qualidade:'equilibrada',contraste:false,texto:false,sons:false,avisosRevisao:true}
});

export let perfil=inicial();
const ouvintes=new Set();

function carregar(){
 let salvo=null;
 try{salvo=JSON.parse(localStorage.getItem(CHAVE)||'null');}catch{salvo=null;}
 if(!salvo||typeof salvo!=='object')return;
 const base=inicial();
 const herdado=salvo.versao!==VERSAO_PERFIL;
 perfil={...base,...salvo,versao:VERSAO_PERFIL,preferencias:{...base.preferencias,...(salvo.preferencias||{})}};
 for(const chave of ['visitados','salvos','concluidos','anotacoes','agenda','diasEstudo'])if(!Array.isArray(perfil[chave]))perfil[chave]=[];
 perfil.nome=String(perfil.nome||'Explorador').slice(0,40);
 perfil.xp=Number.isFinite(perfil.xp)?Math.max(0,Math.round(perfil.xp)):0;
 if(herdado){perfil.xp=0;perfil.nome='Explorador';perfil.demonstracao=false;perfil.criadoEm=base.criadoEm;}
}
carregar();

export function guardarPerfil(){
 try{localStorage.setItem(CHAVE,JSON.stringify(perfil));}catch{}
 ouvintes.forEach(ouvinte=>{try{ouvinte(perfil)}catch{}});
}

export function aoMudarPerfil(ouvinte){
 ouvintes.add(ouvinte);
 return ()=>ouvintes.delete(ouvinte);
}

export function limiarNivel(nivel){
 return nivel<=1?0:(nivel-1)*(125*nivel+150);
}

export function nivelDe(xp){
 let nivel=1;
 while(limiarNivel(nivel+1)<=xp&&nivel<99)nivel++;
 return nivel;
}

export function progressoNivel(xp=perfil.xp){
 const nivel=nivelDe(xp),base=limiarNivel(nivel),proximo=limiarNivel(nivel+1);
 return {nivel,base,proximo,falta:Math.max(0,proximo-xp),proporcao:Math.min(1,(xp-base)/Math.max(1,proximo-base))};
}

export function adicionarXp(quantidade,motivo=''){
 if(!Number.isFinite(quantidade)||quantidade<=0)return 0;
 const antes=nivelDe(perfil.xp);
 perfil.xp+=Math.round(quantidade);
 registrarDiaEstudo();
 guardarPerfil();
 const depois=nivelDe(perfil.xp);
 document.dispatchEvent(new CustomEvent('noesis:xp',{detail:{quantidade,motivo,nivel:depois,subiu:depois>antes}}));
 return quantidade;
}

export function registrarDiaEstudo(){
 const hoje=diaDe();
 if(!perfil.diasEstudo.includes(hoje)){
  perfil.diasEstudo.push(hoje);
  perfil.diasEstudo=perfil.diasEstudo.slice(-400);
  guardarPerfil();
 }
}

export function sequenciaDias(){
 const dias=new Set(perfil.diasEstudo);
 const hoje=diaDe();
 let cursor=hoje,sequencia=0;
 if(!dias.has(hoje)){
  const ontem=new Date();ontem.setDate(ontem.getDate()-1);
  cursor=diaDe(ontem);
  if(!dias.has(cursor))return 0;
 }
 while(dias.has(cursor)){
  sequencia++;
  const anterior=new Date(cursor+'T00:00:00');anterior.setDate(anterior.getDate()-1);
  cursor=diaDe(anterior);
 }
 return sequencia;
}

export function maiorSequencia(){
 const dias=[...new Set(perfil.diasEstudo)].sort();
 let maior=0,atual=0;
 dias.forEach((dia,indice)=>{
  atual=indice>0&&diasEntre(dias[indice-1],dia)===1?atual+1:1;
  maior=Math.max(maior,atual);
 });
 return maior;
}

export function definirPreferencia(chave,valor){
 perfil.preferencias[chave]=valor;
 guardarPerfil();
 document.dispatchEvent(new CustomEvent('noesis:preferencias',{detail:perfil.preferencias}));
}

export function redefinirPerfil({manterPreferencias=true}={}){
 const preferencias=perfil.preferencias;
 perfil=inicial();
 if(manterPreferencias)perfil.preferencias=preferencias;
 guardarPerfil();
}

export function substituirPerfil(dados){
 if(!dados||typeof dados!=='object')return false;
 const base=inicial();
 perfil={...base,...dados,versao:VERSAO_PERFIL,preferencias:{...base.preferencias,...(dados.preferencias||{})}};
 carregarNormalizado();
 guardarPerfil();
 return true;
}

function carregarNormalizado(){
 for(const chave of ['visitados','salvos','concluidos','anotacoes','agenda','diasEstudo'])if(!Array.isArray(perfil[chave]))perfil[chave]=[];
 perfil.nome=String(perfil.nome||'Explorador').slice(0,40);
 perfil.xp=Number.isFinite(perfil.xp)?Math.max(0,Math.round(perfil.xp)):0;
}
