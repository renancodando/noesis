// Renan | renancodando
import {criar,escapar,buscar,buscarTodos,icone,observarVisibilidade} from '../utilitarios/dom.js';
import {componentes} from './interativos/indice.js';

export const ETAPAS=[
 {id:'compreender',nome:'Compreender',descricao:'Conceitos, exemplos e explicações.'},
 {id:'explorar',nome:'Explorar',descricao:'Manipule representações e observe relações.'},
 {id:'experimentar',nome:'Experimentar',descricao:'Teste hipóteses em simulações.'},
 {id:'resolver',nome:'Resolver',descricao:'Exercícios com correção e feedback.'},
 {id:'aplicar',nome:'Aplicar',descricao:'Uma atividade prática.'},
 {id:'revisar',nome:'Revisar',descricao:'Recupere o essencial e conecte saberes.'}
];
const ETAPA_PADRAO={texto:'compreender',destaque:'compreender',equacao:'compreender',lista:'compreender',passos:'compreender',tabela:'compreender',comparacao:'compreender',diagrama:'compreender',documento:'compreender',codigo:'compreender',pergunta:'compreender',interativo:'explorar',simulacao:'experimentar',grafico:'explorar'};

export function destacarCodigo(codigo,linguagem='javascript'){
 let texto=escapar(codigo);
 if(linguagem==='html')return texto.replace(/(&lt;\/?)([a-zA-Z][\w-]*)([^&]*?)(\/?&gt;)/g,(_,a,tag,resto,f)=>`${a}<span class="c-tag">${tag}</span>${resto.replace(/([\w-]+)=(&quot;.*?&quot;)/g,'<span class="c-chave">$1</span>=<span class="c-texto">$2</span>')}${f}`).replace(/(&lt;!--.*?--&gt;)/g,'<span class="c-coment">$1</span>');
 if(linguagem==='css')return texto.replace(/([\w-]+)(\s*:)/g,'<span class="c-chave">$1</span>$2').replace(/(\/\*.*?\*\/)/g,'<span class="c-coment">$1</span>').replace(/([.#]?[\w-]+)(\s*\{)/g,'<span class="c-tag">$1</span>$2');
 const padrao=/(\/\/[^\n]*)|(&#39;(?:[^&]|&(?!#39;))*?&#39;|&quot;(?:[^&]|&(?!quot;))*?&quot;|`[^`]*`)|\b(const|let|var|function|return|if|else|for|while|of|in|new|true|false|null|undefined|class|import|export|await|async|enquanto|se|senao|retorne|para|repita|escreva|leia)\b|\b(\d+(?:\.\d+)?)\b/g;
 return texto.replace(padrao,(trecho,comentario,cadeia,chave,numero)=>comentario?`<span class="c-coment">${comentario}</span>`:cadeia?`<span class="c-texto">${cadeia}</span>`:chave?`<span class="c-chave">${chave}</span>`:`<span class="c-num">${numero}</span>`);
}

const renderizadores={
 texto(bloco){return `${bloco.titulo?`<h3 class="titulo-bloco">${bloco.titulo}</h3>`:''}<div class="prosa">${bloco.html||''}</div>`;},
 destaque(bloco){const variante=bloco.variante||'definicao';const rotulos={definicao:'Definição',atencao:'Atenção',modelo:'Hipóteses do modelo',curiosidade:'Para pensar',exemplo:'Exemplo',resumo:'Em resumo',interpretacao:'Fato, interpretação ou hipótese?'};return `<aside class="destaque destaque-${variante}"><p class="rotulo-destaque">${bloco.rotulo||rotulos[variante]||variante}</p>${bloco.titulo?`<h3>${bloco.titulo}</h3>`:''}<div class="prosa">${bloco.html||''}</div></aside>`;},
 equacao(bloco){return `<figure class="equacao">${bloco.titulo?`<figcaption class="titulo-equacao">${bloco.titulo}</figcaption>`:''}<div class="corpo-equacao">${bloco.html||`<span class="formula">${escapar(bloco.texto||'')}</span>`}</div>${bloco.legenda?`<figcaption>${bloco.legenda}</figcaption>`:''}</figure>`;},
 lista(bloco){return `${bloco.titulo?`<h3 class="titulo-bloco">${bloco.titulo}</h3>`:''}<ul class="lista-pontos">${(bloco.itens||[]).map(item=>`<li>${typeof item==='string'?item:item.html||''}</li>`).join('')}</ul>`;},
 passos(bloco){return `${bloco.titulo?`<h3 class="titulo-bloco">${bloco.titulo}</h3>`:''}<ol class="passos">${(bloco.itens||[]).map(item=>`<li><div>${typeof item==='string'?item:item.html||''}</div></li>`).join('')}</ol>`;},
 tabela(bloco){return `${bloco.titulo?`<h3 class="titulo-bloco">${bloco.titulo}</h3>`:''}<div class="rolagem-tabela"><table class="tabela">${bloco.cabecalho?`<thead><tr>${bloco.cabecalho.map(c=>`<th scope="col">${c}</th>`).join('')}</tr></thead>`:''}<tbody>${(bloco.linhas||[]).map(linha=>`<tr>${linha.map((celula,i)=>i===0&&bloco.primeiraColunaCabecalho?`<th scope="row">${celula}</th>`:`<td>${celula}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${bloco.legenda?`<p class="legenda-tabela">${bloco.legenda}</p>`:''}`;},
 comparacao(bloco){return `${bloco.titulo?`<h3 class="titulo-bloco">${bloco.titulo}</h3>`:''}<div class="comparacao">${(bloco.colunas||[]).map(coluna=>`<div class="coluna-comparacao"><h4>${coluna.titulo||''}</h4><div class="prosa">${coluna.html||''}</div></div>`).join('')}</div>`;},
 diagrama(bloco){return `<figure class="diagrama">${bloco.titulo?`<figcaption class="titulo-equacao">${bloco.titulo}</figcaption>`:''}<div class="corpo-diagrama" role="img" aria-label="${escapar(bloco.descricao||bloco.legenda||'Diagrama')}">${bloco.svg||''}</div>${bloco.legenda?`<figcaption>${bloco.legenda}</figcaption>`:''}${bloco.descricao?`<p class="apenas-leitor">${escapar(bloco.descricao)}</p>`:''}</figure>`;},
 documento(bloco){return `<figure class="documento-fonte">${bloco.titulo?`<figcaption class="titulo-equacao">${bloco.titulo}</figcaption>`:''}<blockquote>${bloco.html||''}</blockquote>${bloco.fonte?`<figcaption class="fonte-documento">${bloco.fonte}</figcaption>`:''}${bloco.natureza?`<p class="natureza-fonte"><strong>Natureza da fonte:</strong> ${bloco.natureza}</p>`:''}</figure>`;},
 codigo(bloco){return `${bloco.titulo?`<h3 class="titulo-bloco">${bloco.titulo}</h3>`:''}${bloco.html?`<div class="prosa">${bloco.html}</div>`:''}<pre class="caixa-codigo" data-linguagem="${bloco.linguagem||'javascript'}"><code>${destacarCodigo(bloco.codigo||'',bloco.linguagem)}</code></pre>${bloco.legenda?`<p class="legenda-tabela">${bloco.legenda}</p>`:''}`;},
 pergunta(bloco){return `<div class="pergunta-rapida"><p class="rotulo-destaque">Pare e pense</p><p class="enunciado-pergunta">${bloco.enunciado||bloco.html||''}</p><details><summary>Ver uma resposta possível</summary><div class="prosa">${bloco.resposta||''}</div></details></div>`;},
 interativo(bloco){return `${bloco.titulo?`<h3 class="titulo-bloco">${bloco.titulo}</h3>`:''}${bloco.instrucao?`<p class="instrucao-interativo">${bloco.instrucao}</p>`:''}<div class="interativo" data-componente="${escapar(bloco.componente||'')}"><p class="carregando-interativo">Preparando a experiência…</p></div>${bloco.observacao?`<p class="nota-modelo">${bloco.observacao}</p>`:''}`;}
};
renderizadores.simulacao=renderizadores.interativo;
renderizadores.grafico=renderizadores.interativo;

export function etapaDoBloco(bloco){return bloco.etapa||ETAPA_PADRAO[bloco.tipo]||'compreender';}

export function renderizarBlocos(raiz,blocos,contexto={}){
 const limpezas=[];
 let etapaAtual=null,secao=null;const vistas=new Set();
 blocos.forEach((bloco,indice)=>{
  const etapa=etapaDoBloco(bloco);
  if(etapa!==etapaAtual){
   etapaAtual=etapa;
   const definicao=ETAPAS.find(e=>e.id===etapa)||{nome:etapa,descricao:''};
   if(!vistas.has(etapa)){
    vistas.add(etapa);
    secao=criar('section',{classe:'etapa-aula',id:`etapa-${etapa}`,'aria-labelledby':`titulo-etapa-${etapa}-${indice}`});
    secao.innerHTML=`<header class="cabecalho-etapa"><span class="marcador-etapa">${ETAPAS.findIndex(e=>e.id===etapa)+1}</span><div><h2 id="titulo-etapa-${etapa}-${indice}">${definicao.nome}</h2><p>${definicao.descricao}</p></div></header>`;
    raiz.append(secao);
   }else{
    secao=raiz.lastElementChild;
    secao.append(criar('p',{classe:'marcador-inline',html:`<span>${ETAPAS.findIndex(e=>e.id===etapa)+1}</span>${definicao.nome}`}));
   }
  }
  const renderizador=renderizadores[bloco.tipo];
  const elemento=criar('div',{classe:`bloco bloco-${bloco.tipo} revelar`,dados:{indice:String(indice)}});
  elemento.innerHTML=renderizador?renderizador(bloco,contexto):`<p class="mensagem alerta">Bloco “${escapar(bloco.tipo)}” não reconhecido.</p>`;
  secao.append(elemento);
  const parar=observarVisibilidade(elemento,visivel=>{if(!visivel)return;elemento.classList.add('visivel');contexto.aoVerBloco?.(indice);parar();});
  limpezas.push(parar);
  const area=buscar('.interativo',elemento);
  if(area&&(bloco.componente in componentes)){
   let limparComponente=null,montado=false;
   const pararObservacao=observarVisibilidade(area,visivel=>{
    if(!visivel||montado)return;
    montado=true;pararObservacao();
    componentes[bloco.componente]().then(modulo=>{
     area.replaceChildren();
     limparComponente=modulo.montar(area,bloco.parametros||{},{...contexto,bloco})||null;
    }).catch(erro=>{console.error(erro);area.innerHTML='<p class="mensagem alerta">Não foi possível carregar esta experiência interativa.</p>';});
   });
   limpezas.push(()=>{pararObservacao();try{limparComponente?.()}catch{}});
  }else if(area){
   area.innerHTML=`<p class="mensagem alerta">A experiência “${escapar(bloco.componente||'')}” ainda não está disponível.</p>`;
  }
 });
 return ()=>limpezas.forEach(limpar=>{try{limpar()}catch{}});
}

export function renderizarSumario(blocos,aula){
 const presentes=new Set(blocos.map(etapaDoBloco));
 presentes.add('resolver');
 if(aula.pratica)presentes.add('aplicar');
 presentes.add('revisar');
 return `<ol class="sumario-etapas">${ETAPAS.filter(e=>presentes.has(e.id)).map((e,i)=>`<li><a href="#etapa-${e.id}" data-etapa="${e.id}"><span>${i+1}</span>${e.nome}</a></li>`).join('')}</ol>`;
}
