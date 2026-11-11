// Renan | renancodando
const PREFIXO='noesis:';

export function lerPreferencia(chave,padrao=null){
 try{
  const bruto=localStorage.getItem(PREFIXO+chave);
  return bruto===null?padrao:JSON.parse(bruto);
 }catch{return padrao;}
}

export function gravarPreferencia(chave,valor){
 try{localStorage.setItem(PREFIXO+chave,JSON.stringify(valor));return true;}catch{return false;}
}

export function removerPreferencia(chave){
 try{localStorage.removeItem(PREFIXO+chave);}catch{}
}

export function listarChavesLocais(){
 try{return Object.keys(localStorage).filter(chave=>chave.startsWith(PREFIXO)||chave==='noesis-jornada');}catch{return [];}
}

export function limparPreferencias(){
 listarChavesLocais().forEach(chave=>{try{localStorage.removeItem(chave)}catch{}});
}
