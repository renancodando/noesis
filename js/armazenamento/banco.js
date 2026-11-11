// Renan | renancodando
const NOME='noesis',VERSAO=1;
const ARMAZENS={
 progressoAulas:{keyPath:'aula',indices:[['disciplina','disciplina']]},
 tentativas:{autoIncrement:true,indices:[['exercicio','exercicio'],['aula','aula'],['dia','dia']]},
 revisoes:{keyPath:'id',indices:[['proxima','proxima'],['aula','aula']]},
 anotacoes:{keyPath:'id',indices:[['referencia','referencia']]},
 acervo:{keyPath:'id',indices:[['tipo','tipo']]},
 colecoes:{keyPath:'id'},
 projetos:{keyPath:'id'},
 laboratorios:{keyPath:'id'},
 descobertas:{keyPath:'id',indices:[['dia','dia']]},
 atividades:{autoIncrement:true,indices:[['dia','dia'],['tipo','tipo']]},
 meta:{keyPath:'chave'}
};
let conexao=null,memoria=null;
const ouvintes=new Set();

function abrir(){
 if(conexao)return Promise.resolve(conexao);
 if(memoria)return Promise.resolve(null);
 if(!('indexedDB' in window)){memoria=criarMemoria();return Promise.resolve(null);}
 return new Promise(resolver=>{
  let pedido;
  try{pedido=indexedDB.open(NOME,VERSAO);}catch{memoria=criarMemoria();resolver(null);return;}
  pedido.onupgradeneeded=()=>{
   const banco=pedido.result;
   for(const [nome,definicao] of Object.entries(ARMAZENS)){
    if(banco.objectStoreNames.contains(nome))continue;
    const armazem=banco.createObjectStore(nome,{keyPath:definicao.keyPath,autoIncrement:definicao.autoIncrement});
    (definicao.indices||[]).forEach(([indice,caminho])=>armazem.createIndex(indice,caminho));
   }
  };
  pedido.onsuccess=()=>{conexao=pedido.result;conexao.onversionchange=()=>{conexao.close();conexao=null;};resolver(conexao);};
  pedido.onerror=()=>{memoria=criarMemoria();resolver(null);};
  pedido.onblocked=()=>{memoria=criarMemoria();resolver(null);};
 });
}

function criarMemoria(){
 const dados={};
 for(const nome of Object.keys(ARMAZENS))dados[nome]=new Map();
 return {dados,contadores:{}};
}

function chaveDe(nome,registro){
 const definicao=ARMAZENS[nome];
 if(definicao.keyPath)return registro[definicao.keyPath];
 memoria.contadores[nome]=(memoria.contadores[nome]||0)+1;
 return memoria.contadores[nome];
}

function transacao(nome,modo,operacao){
 return abrir().then(banco=>{
  if(!banco){
   const mapa=memoria.dados[nome];
   return operacao({
    get:chave=>({resultado:mapa.get(chave)}),
    put:registro=>{const chave=chaveDe(nome,registro);mapa.set(chave,structuredClone(registro));return {resultado:chave};},
    delete:chave=>{mapa.delete(chave);return {resultado:undefined};},
    clear:()=>{mapa.clear();return {resultado:undefined};},
    getAll:()=>({resultado:[...mapa.values()].map(valor=>structuredClone(valor))}),
    count:()=>({resultado:mapa.size})
   },true);
  }
  return new Promise((resolver,rejeitar)=>{
   let resultado;
   const t=banco.transaction(nome,modo);
   t.oncomplete=()=>resolver(resultado);
   t.onerror=()=>rejeitar(t.error);
   t.onabort=()=>rejeitar(t.error||new Error('Transação interrompida'));
   Promise.resolve(operacao(t.objectStore(nome),false)).then(valor=>{resultado=valor}).catch(erro=>{try{t.abort()}catch{}rejeitar(erro)});
  });
 }).catch(erro=>{
  if(erro?.name==='QuotaExceededError')notificar('cota');
  throw erro;
 });
}

function pedido(operacao){
 return new Promise((resolver,rejeitar)=>{
  const resultado=operacao;
  if(resultado&&'resultado' in resultado&&!(typeof IDBRequest!=='undefined'&&resultado instanceof IDBRequest)){resolver(resultado.resultado);return;}
  resultado.onsuccess=()=>resolver(resultado.result);
  resultado.onerror=()=>rejeitar(resultado.error);
 });
}

function notificar(tipo,detalhe){
 ouvintes.forEach(ouvinte=>{try{ouvinte(tipo,detalhe)}catch{}});
}

export function aoMudarBanco(ouvinte){
 ouvintes.add(ouvinte);
 return ()=>ouvintes.delete(ouvinte);
}

export async function obter(nome,chave){
 try{return await transacao(nome,'readonly',armazem=>pedido(armazem.get(chave)));}catch{return undefined;}
}

export async function listar(nome,filtro){
 try{
  const registros=await transacao(nome,'readonly',armazem=>pedido(armazem.getAll()));
  return filtro?registros.filter(filtro):registros;
 }catch{return [];}
}

export async function salvar(nome,registro){
 const chave=await transacao(nome,'readwrite',armazem=>pedido(armazem.put(registro)));
 notificar('salvar',{armazem:nome,chave,registro});
 return chave;
}

export async function salvarVarios(nome,registros){
 await transacao(nome,'readwrite',armazem=>Promise.all(registros.map(registro=>pedido(armazem.put(registro)))));
 notificar('salvar',{armazem:nome});
}

export async function remover(nome,chave){
 await transacao(nome,'readwrite',armazem=>pedido(armazem.delete(chave)));
 notificar('remover',{armazem:nome,chave});
}

export async function limpar(nome){
 await transacao(nome,'readwrite',armazem=>pedido(armazem.clear()));
 notificar('limpar',{armazem:nome});
}

export async function contar(nome){
 try{return await transacao(nome,'readonly',armazem=>pedido(armazem.count()));}catch{return 0;}
}

export async function exportarTudo(){
 const conteudo={};
 for(const nome of Object.keys(ARMAZENS))conteudo[nome]=await listar(nome);
 return conteudo;
}

export function validarExportacao(dados){
 if(!dados||typeof dados!=='object')return 'O arquivo não contém um objeto de dados.';
 if(dados.aplicacao!=='noesis')return 'O arquivo não foi gerado pelo NÓESIS.';
 if(!dados.armazens||typeof dados.armazens!=='object')return 'O arquivo não contém os armazéns de dados.';
 for(const [nome,registros] of Object.entries(dados.armazens)){
  if(!(nome in ARMAZENS))return `O armazém “${nome}” não é reconhecido por esta versão.`;
  if(!Array.isArray(registros))return `O armazém “${nome}” está em formato inválido.`;
 }
 return '';
}

export async function importarTudo(dados,{substituir=true}={}){
 for(const [nome,registros] of Object.entries(dados.armazens)){
  if(substituir)await limpar(nome);
  const validos=registros.filter(registro=>registro&&typeof registro==='object');
  if(validos.length)await salvarVarios(nome,validos.map(registro=>{
   const copia={...registro};
   if(!ARMAZENS[nome].keyPath)delete copia.id;
   return copia;
  }));
 }
 notificar('importar');
}

export async function apagarTudo(){
 for(const nome of Object.keys(ARMAZENS))await limpar(nome);
 notificar('apagar');
}

export async function estimarEspaco(){
 try{
  if(!navigator.storage?.estimate)return null;
  const {usage,quota}=await navigator.storage.estimate();
  return {uso:usage||0,cota:quota||0};
 }catch{return null;}
}

export function usandoMemoria(){return Boolean(memoria);}
export const nomesArmazens=Object.keys(ARMAZENS);
