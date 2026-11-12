// Renan | renancodando
import {buscar,buscarTodos,reduzirMovimento,anunciar} from '../utilitarios/dom.js';

const ROTAS=[
 ['/',{ambiente:'santuario'}],
 ['/jornadas',{ambiente:'jornadas'}],
 ['/jornadas/:disciplina',{ambiente:'jornadas'}],
 ['/saberes',{ambiente:'saberes'}],
 ['/saberes/:disciplina',{ambiente:'saberes'}],
 ['/saberes/:disciplina/:aula',{ambiente:'aula'}],
 ['/laboratorios',{ambiente:'laboratorios'}],
 ['/laboratorios/:laboratorio',{ambiente:'laboratorios'}],
 ['/construir',{ambiente:'construir'}],
 ['/construir/:projeto',{ambiente:'construir'}],
 ['/comunidade',{ambiente:'comunidade'}],
 ['/acervo',{ambiente:'acervo'}],
 ['/configuracoes',{ambiente:'configuracoes'}],
 ['/minha-jornada',{ambiente:'minha-jornada'}],
 ['/revisoes',{ambiente:'revisoes'}],
 ['/exploracao',{ambiente:'exploracao'}],
 ['/pesquisa',{ambiente:'pesquisa'}]
];
const SECAO_DO_AMBIENTE={aula:'saberes'};
const DESCRICAO_PADRAO='NÓESIS — Um Universo de Aprendizagem Interativa. Explore disciplinas, laboratórios, projetos e conexões entre conhecimentos.';

let atual={ambiente:null,parametros:{},desmontar:null,caminho:''},geracao=0;
const estilosCarregados=new Map();

export function normalizarCaminho(caminho){
 let limpo=decodeURI(caminho||'/').replace(/\/index\.html$/,'').replace(/\/+$/,'');
 if(!limpo.startsWith('/'))limpo='/'+limpo;
 return limpo||'/';
}

export function resolver(caminho){
 const partes=normalizarCaminho(caminho).split('/').filter(Boolean);
 for(const [padrao,definicao] of ROTAS){
  const modelo=padrao.split('/').filter(Boolean);
  if(modelo.length!==partes.length)continue;
  const parametros={};
  const combina=modelo.every((parte,indice)=>{
   if(parte.startsWith(':')){parametros[parte.slice(1)]=partes[indice];return true;}
   return parte===partes[indice];
  });
  if(combina)return {...definicao,parametros,caminho:'/'+partes.join('/')};
 }
 return {ambiente:'nao-encontrado',parametros:{},caminho:normalizarCaminho(caminho)};
}

export function carregarEstilo(href){
 if(estilosCarregados.has(href))return estilosCarregados.get(href);
 const promessa=new Promise(resolver=>{
  if(buscar(`link[href="${href}"]`)){resolver();return;}
  const ligacao=document.createElement('link');
  ligacao.rel='stylesheet';ligacao.href=href;
  ligacao.onload=()=>resolver();ligacao.onerror=()=>resolver();
  document.head.append(ligacao);
 });
 estilosCarregados.set(href,promessa);
 return promessa;
}

export function definirTitulo(titulo,descricao=DESCRICAO_PADRAO){
 const completo=titulo?`${titulo} · NÓESIS`:'NÓESIS — Um Universo de Aprendizagem Interativa';
 document.title=completo;
 buscar('meta[name="description"]')?.setAttribute('content',descricao);
 buscar('meta[property="og:title"]')?.setAttribute('content',completo);
 buscar('meta[property="og:description"]')?.setAttribute('content',descricao);
 buscar('meta[property="og:url"]')?.setAttribute('content',location.origin+location.pathname);
 buscar('link[rel="canonical"]')?.setAttribute('href',location.origin+location.pathname);
}

function marcarNavegacao(ambiente){
 const secao=SECAO_DO_AMBIENTE[ambiente]||ambiente;
 buscarTodos('#navegacao a').forEach(ligacao=>{
  const ativo=ligacao.dataset.secao===secao;
  ligacao.classList.toggle('ativo',ativo);
  if(ativo)ligacao.setAttribute('aria-current','page');else ligacao.removeAttribute('aria-current');
 });
}

function esperar(ms){return new Promise(resolver=>setTimeout(resolver,ms));}

async function renderizar({foco=true,rolar=true}={}){
 const destino=resolver(location.pathname);
 const minhaGeracao=++geracao;
 const santuario=buscar('#conteudo'),ambiente=buscar('#ambiente');
 const mesmoAmbiente=destino.ambiente===atual.ambiente&&JSON.stringify(destino.parametros)===JSON.stringify(atual.parametros);
 if(mesmoAmbiente&&destino.caminho===atual.caminho)return;
 document.body.classList.add('navegando');
 const anterior=destino.ambiente==='santuario'?null:ambiente;
 if(!reduzirMovimento.matches&&atual.ambiente&&atual.ambiente!==destino.ambiente){
  (atual.ambiente==='santuario'?santuario:ambiente).classList.add('saindo');
  await esperar(160);
  if(minhaGeracao!==geracao)return;
 }
 if(atual.desmontar){try{atual.desmontar()}catch{}atual.desmontar=null;}
 santuario.classList.remove('saindo');ambiente.classList.remove('saindo');
 document.body.dataset.ambiente=destino.ambiente;
 marcarNavegacao(destino.ambiente);
 if(destino.ambiente==='santuario'){
  santuario.hidden=false;ambiente.hidden=true;ambiente.replaceChildren();
  buscar('.painel-jornada').hidden=false;
  definirTitulo('');
  santuario.classList.add('entrando');
  document.dispatchEvent(new CustomEvent('noesis:ambiente',{detail:'santuario'}));
 }else{
  santuario.hidden=true;buscar('.painel-jornada').hidden=true;
  ambiente.hidden=false;
  ambiente.replaceChildren();
  ambiente.className='ambiente carregando';
  ambiente.dataset.ambienteNome=destino.ambiente;
  document.dispatchEvent(new CustomEvent('noesis:ambiente',{detail:destino.ambiente}));
  try{
   const modulo=await import(`../ambientes/${destino.ambiente}.js`);
   if(minhaGeracao!==geracao)return;
   await Promise.all((modulo.estilos||[]).map(carregarEstilo));
   if(minhaGeracao!==geracao)return;
   ambiente.classList.remove('carregando');
   const desmontar=await modulo.montar({raiz:ambiente,parametros:destino.parametros,consulta:new URLSearchParams(location.search),definirTitulo,navegar});
   if(minhaGeracao!==geracao){try{desmontar?.()}catch{}return;}
   atual.desmontar=typeof desmontar==='function'?desmontar:null;
  }catch(erro){
   console.error(erro);
   ambiente.classList.remove('carregando');
   ambiente.innerHTML=`<section class="pagina-ambiente"><header class="cabecalho-ambiente"><p class="sobretitulo">ALGO SAIU DO CAMINHO</p><h1>Não foi possível abrir este ambiente.</h1><p class="introducao">${erro?.message?String(erro.message).replace(/[<>]/g,''):'Verifique a conexão e tente novamente.'}</p><div class="acoes-painel"><a class="botao" href="/">Voltar ao Santuário</a><button class="botao secundario" data-recarregar>Tentar de novo</button></div></header></section>`;
   buscar('[data-recarregar]',ambiente).onclick=()=>location.reload();
  }
  ambiente.classList.add('entrando');
 }
 atual={...atual,ambiente:destino.ambiente,parametros:destino.parametros,caminho:destino.caminho};
 document.body.classList.remove('navegando');
 if(rolar&&!location.hash)scrollTo({top:0,behavior:'instant'});
 if(foco){
  const alvo=destino.ambiente==='santuario'?buscar('.boas-vindas h1'):buscar('#ambiente h1')||ambiente;
  if(alvo){alvo.setAttribute('tabindex','-1');alvo.focus({preventScroll:true});}
  const titulo=destino.ambiente==='santuario'?'Santuário':document.title.split(' · ')[0];
  anunciar(`Você está em ${titulo}.`);
 }
 setTimeout(()=>{santuario.classList.remove('entrando');ambiente.classList.remove('entrando');},600);
}

export function navegar(caminho,{substituir=false,foco=true,rolar=true}={}){
 const url=new URL(caminho,location.origin);
 const destino=normalizarCaminho(url.pathname)+url.search+url.hash;
 if(destino===location.pathname+location.search+location.hash&&!substituir)return renderizar({foco,rolar});
 history[substituir?'replaceState':'pushState']({caminho:destino},'',destino);
 return renderizar({foco,rolar});
}

export function caminhoAtual(){return atual;}

export function iniciarRoteador(){
 document.addEventListener('click',evento=>{
  if(evento.defaultPrevented||evento.button!==0||evento.metaKey||evento.ctrlKey||evento.shiftKey||evento.altKey)return;
  const ligacao=evento.target.closest('a[href]');
  if(!ligacao||ligacao.target||ligacao.hasAttribute('download')||ligacao.origin!==location.origin)return;
  const href=ligacao.getAttribute('href');
  if(href.startsWith('#')||href.startsWith('mailto:'))return;
  if(ligacao.pathname===location.pathname&&ligacao.hash){return;}
  evento.preventDefault();
  navegar(ligacao.pathname+ligacao.search+ligacao.hash);
 });
 addEventListener('popstate',()=>renderizar({rolar:false}));
 const limpo=normalizarCaminho(location.pathname);
 if(limpo!==location.pathname)history.replaceState({caminho:limpo},'',limpo+location.search+location.hash);
 return renderizar({foco:false,rolar:false});
}
