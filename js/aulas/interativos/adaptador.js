// Renan | renancodando
import {avisar} from '../../utilitarios/dom.js';

export function adaptarExperimento(carregar,id){
 return {
  montar(area,parametros={},contexto={}){
   let instancia=null,cancelado=false;
   carregar().then(modulo=>{
    if(cancelado)return;
    const experimento=modulo.definicao.experimentos.find(e=>e.id===id);
    if(!experimento){area.innerHTML='<p class="mensagem alerta">Experimento indisponível.</p>';return;}
    instancia=experimento.montar(area,{estadoGuardado:parametros.estadoInicial||null,atualizar(estado){contexto.aoAtualizar?.(estado);},guardar(){},avisar})||{};
    if(parametros.nota){const p=document.createElement('p');p.className='nota-modelo';p.textContent=parametros.nota;area.append(p);}
   }).catch(()=>{area.innerHTML='<p class="mensagem alerta">Não foi possível carregar este experimento.</p>';});
   return ()=>{cancelado=true;try{instancia?.limpar?.()}catch{}};
  }
 };
}
