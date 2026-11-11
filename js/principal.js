// Renan | renancodando
import {avisar} from './utilitarios/dom.js';
import {perfil,registrarDiaEstudo} from './progresso/perfil.js';
import {iniciarRoteador} from './navegacao/rotas.js';
import {iniciarCena} from './santuario/interface.js';

document.addEventListener('noesis:ambiente',evento=>{
 if(evento.detail==='santuario')iniciarCena();
});

document.addEventListener('noesis:xp',evento=>{
 const {quantidade,motivo,nivel,subiu}=evento.detail;
 avisar(subiu?`${motivo}. +${quantidade} XP · Você alcançou o nível ${nivel}!`:`${motivo}. +${quantidade} XP`);
});

document.addEventListener('noesis:atividade',()=>registrarDiaEstudo());

iniciarRoteador().then(()=>{
 document.body.classList.add('aplicacao-pronta');
 document.body.classList.toggle('modo-demonstracao',Boolean(perfil.demonstracao));
 import('./revisoes/agendador.js').then(modulo=>modulo.atualizarPendencias()).catch(()=>{});
 if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('/sw.js').catch(()=>{});
});
