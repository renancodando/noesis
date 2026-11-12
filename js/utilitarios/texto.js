// Renan | renancodando
export function normalizar(texto){
 return String(texto??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
}

export function tokenizar(texto){
 return normalizar(texto).replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).filter(parte=>parte.length>1);
}

export function formatarNumero(valor,casas=0){
 return Number(valor).toLocaleString('pt-BR',{minimumFractionDigits:casas,maximumFractionDigits:casas});
}

export function formatarData(valor,opcoes={day:'2-digit',month:'short',year:'numeric'}){
 const data=valor instanceof Date?valor:new Date(valor);
 return Number.isNaN(data.getTime())?'—':data.toLocaleDateString('pt-BR',opcoes);
}

export function diaDe(valor=new Date()){
 const data=valor instanceof Date?valor:new Date(valor);
 return `${data.getFullYear()}-${String(data.getMonth()+1).padStart(2,'0')}-${String(data.getDate()).padStart(2,'0')}`;
}

export function diasEntre(inicio,fim){
 const a=new Date(inicio+'T00:00:00'),b=new Date(fim+'T00:00:00');
 return Math.round((b-a)/86400000);
}

export function plural(quantidade,singular,pluralForma=singular+'s'){
 return `${formatarNumero(quantidade)} ${quantidade===1?singular:pluralForma}`;
}

export function tempoRelativo(valor){
 const diferenca=(Date.now()-new Date(valor).getTime())/1000;
 if(diferenca<60)return 'agora';
 if(diferenca<3600)return `há ${Math.floor(diferenca/60)} min`;
 if(diferenca<86400)return `há ${Math.floor(diferenca/3600)} h`;
 const dias=Math.floor(diferenca/86400);
 return dias===1?'ontem':`há ${dias} dias`;
}

export function duracaoLegivel(minutos){
 if(minutos<60)return `${Math.round(minutos)} min`;
 const horas=Math.floor(minutos/60),resto=Math.round(minutos%60);
 return resto?`${horas} h ${resto} min`:`${horas} h`;
}

export function compararNumeros(resposta,esperado,tolerancia=0){
 const valor=Number(String(resposta).replace(',','.'));
 if(!Number.isFinite(valor))return false;
 return Math.abs(valor-esperado)<=tolerancia+1e-9;
}

export function identificador(prefixo='id'){
 return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
}
