// Renan | renancodando
export const buscar=(seletor,raiz=document)=>raiz.querySelector(seletor);
export const buscarTodos=(seletor,raiz=document)=>[...raiz.querySelectorAll(seletor)];
export const reduzirMovimento=matchMedia('(prefers-reduced-motion: reduce)');

export function escapar(valor){
 return String(valor??'').replace(/[&<>"']/g,caractere=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[caractere]));
}

export function criar(marcador,atributos={},...filhos){
 const elemento=document.createElement(marcador);
 for(const [chave,valor] of Object.entries(atributos)){
  if(valor===false||valor==null)continue;
  if(chave==='classe')elemento.className=valor;
  else if(chave==='html')elemento.innerHTML=valor;
  else if(chave==='texto')elemento.textContent=valor;
  else if(chave.startsWith('ao'))elemento.addEventListener(chave.slice(2).toLowerCase(),valor);
  else if(chave==='dados')Object.assign(elemento.dataset,valor);
  else if(chave==='estilo')elemento.style.cssText=valor;
  else elemento.setAttribute(chave,valor===true?'':valor);
 }
 for(const filho of filhos.flat()){
  if(filho==null||filho===false)continue;
  elemento.append(filho instanceof Node?filho:document.createTextNode(String(filho)));
 }
 return elemento;
}

export function moldar(html){
 const modelo=document.createElement('template');
 modelo.innerHTML=html.trim();
 return modelo.content;
}

export function icone(nome,classe=''){
 return `<svg class="icone ${classe}" viewBox="0 0 24 24" aria-hidden="true"><use href="/ativos/icones.svg#${nome}"/></svg>`;
}

export function delegar(raiz,evento,seletor,manipulador){
 const ouvinte=ocorrencia=>{
  const alvo=ocorrencia.target.closest(seletor);
  if(alvo&&raiz.contains(alvo))manipulador(ocorrencia,alvo);
 };
 raiz.addEventListener(evento,ouvinte);
 return ()=>raiz.removeEventListener(evento,ouvinte);
}

let temporizadorAviso;
export function avisar(texto,duracao=4200){
 const aviso=buscar('.aviso');
 if(!aviso)return;
 aviso.textContent=texto;
 aviso.hidden=false;
 clearTimeout(temporizadorAviso);
 temporizadorAviso=setTimeout(()=>aviso.hidden=true,duracao);
}

export function anunciar(texto){
 const regiao=buscar('#anuncios');
 if(!regiao)return;
 regiao.textContent='';
 requestAnimationFrame(()=>regiao.textContent=texto);
}

export function aguardarQuadro(){
 return new Promise(resolver=>requestAnimationFrame(()=>resolver()));
}

export function observarVisibilidade(elemento,aoMudar){
 if(!('IntersectionObserver' in window)){aoMudar(true);return ()=>{};}
 const observador=new IntersectionObserver(entradas=>entradas.forEach(entrada=>aoMudar(entrada.isIntersecting)),{rootMargin:'80px'});
 observador.observe(elemento);
 return ()=>observador.disconnect();
}

export function limitarTaxa(funcao,intervalo=120){
 let agendado=0,ultimosArgumentos;
 return (...argumentos)=>{
  ultimosArgumentos=argumentos;
  if(agendado)return;
  agendado=setTimeout(()=>{agendado=0;funcao(...ultimosArgumentos)},intervalo);
 };
}

export function confirmar(mensagem,{titulo='Confirmar',confirmacao='Confirmar',cancelamento='Cancelar',perigo=false}={}){
 return new Promise(resolver=>{
  const dialogo=criar('dialog',{classe:'dialogo-confirmacao',html:`<h2>${escapar(titulo)}</h2><p>${escapar(mensagem)}</p><div class="acoes-painel"><button class="botao ${perigo?'perigo':''}" value="sim">${escapar(confirmacao)}</button><button class="botao secundario" value="nao">${escapar(cancelamento)}</button></div>`});
  document.body.append(dialogo);
  dialogo.addEventListener('close',()=>{resolver(dialogo.returnValue==='sim');dialogo.remove();});
  buscarTodos('button',dialogo).forEach(botao=>botao.onclick=()=>dialogo.close(botao.value));
  dialogo.showModal();
 });
}
