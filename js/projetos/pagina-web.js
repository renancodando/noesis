// Renan | renancodando
import {painelExplicacao,criar,buscar,buscarTodos,escapar} from '../aulas/interativos/base.js';

const MODELO_HTML=`<header>
  <h1>Clube de Astronomia</h1>
  <nav>
    <a href="#sobre">Sobre</a>
    <a href="#eventos">Eventos</a>
  </nav>
</header>
<main>
  <section id="sobre">
    <h2>Sobre o clube</h2>
    <p>Observamos o céu toda sexta-feira.</p>
    <img src="" alt="Telescópio apontado para o céu noturno">
  </section>
  <section id="eventos">
    <h2>Próximo evento</h2>
    <p id="contador">Faltam 3 dias.</p>
    <button id="botao-inscricao">Quero participar</button>
  </section>
</main>
<footer>
  <p>Clube de Astronomia</p>
</footer>`;
const MODELO_CSS=`body {
  font-family: Georgia, serif;
  margin: 0;
  background: #f4ecd8;
  color: #2a2419;
}
header {
  padding: 20px;
  background: #132431;
  color: #f1dca6;
}
nav a {
  color: #f1dca6;
  margin-right: 12px;
}
main {
  padding: 20px;
}
.inscrito {
  background: #7fc3a4;
  padding: 8px;
  border-radius: 6px;
}`;
const MODELO_JS=`const botao = document.querySelector('#botao-inscricao');
botao.addEventListener('click', () => {
  const aviso = document.querySelector('#contador');
  aviso.textContent = 'Inscrição confirmada!';
  aviso.classList.add('inscrito');
});`;

export const definicao={
 objetivo:'Construir uma página web completa com estrutura semântica em HTML, apresentação em CSS e comportamento em JavaScript, visualizada em um iframe isolado. O sistema verifica estrutura e estilo por análise do código, e comportamento por um teste automático dentro da própria pré-visualização.',
 materiais:['Três editores (HTML, CSS, JavaScript) com modelo inicial.','Pré-visualização em iframe com sandbox (sem acesso ao NÓESIS).','Verificador estrutural (DOMParser) e sonda de comportamento.'],
 instrucoes:['Personalize o conteúdo: tema, títulos, imagens com texto alternativo.','Use elementos semânticos: header, nav, main, section, footer.','No CSS, estilize pelo menos quatro seletores e use uma classe que o JavaScript vai adicionar.','No JavaScript, responda a um clique alterando texto e classe de um elemento.','Atualize a pré-visualização e confira os critérios.'],
 conhecimentos:['HTML descreve estrutura e significado; CSS, apresentação; JavaScript, comportamento.','Imagens precisam de texto alternativo; títulos precisam de hierarquia (um h1, depois h2).','Eventos ligam ações do usuário a mudanças na página.'],
 criterios:[
  {id:'semantica',texto:'Usa header, nav, main e footer, com um único h1 e ao menos dois h2',verificar:e=>({ok:e.semantica,detalhe:e.detalheSemantica||''})},
  {id:'imagens',texto:'Toda imagem tem atributo alt descritivo (≥ 8 caracteres)',verificar:e=>e.imagensOk},
  {id:'links',texto:'Navegação com pelo menos dois links para seções da página',verificar:e=>e.linksOk},
  {id:'css',texto:'CSS com pelo menos quatro regras e uma classe usada pelo JavaScript',verificar:e=>({ok:e.cssOk,detalhe:`${e.regras||0} regras`})},
  {id:'js',texto:'JavaScript responde a um clique alterando texto e classe (teste automático)',verificar:e=>({ok:e.comportamentoOk,detalhe:e.detalheComportamento||'atualize a pré-visualização'})},
  {id:'original',texto:'Alterei o conteúdo do modelo para um tema meu',verificar:e=>!e.html.includes('Clube de Astronomia')||e.html.length>MODELO_HTML.length+200},
  {id:'acessivel',texto:'Naveguei a pré-visualização só com o teclado e tudo ficou alcançável',manual:true}
 ],
 resumo:e=>`${e.regras} regras CSS, ${e.elementos} elementos, comportamento ${e.comportamentoOk?'ok':'pendente'}`,
 montar(area,api){
  const salvo=api.estadoGuardado||{};
  area.innerHTML=`<div class="editor-tres"><label>HTML<textarea class="editor-codigo" data-html spellcheck="false"></textarea></label><label>CSS<textarea class="editor-codigo" data-css spellcheck="false"></textarea></label><label>JavaScript<textarea class="editor-codigo" data-js spellcheck="false"></textarea></label></div><div class="botoes-opcoes"><button class="botao pequeno" data-atualizar>▶ Atualizar pré-visualização</button><button class="botao pequeno secundario" data-baixar>Baixar página (HTML)</button></div><iframe class="previa-pagina" title="Pré-visualização da página" sandbox="allow-scripts"></iframe>`;
  const eHtml=buscar('[data-html]',area),eCss=buscar('[data-css]',area),eJs=buscar('[data-js]',area),quadro=buscar('iframe',area);
  eHtml.value=salvo.html||MODELO_HTML;eCss.value=salvo.css||MODELO_CSS;eJs.value=salvo.js||MODELO_JS;
  const explicacao=painelExplicacao(area);
  let estado={html:eHtml.value,css:eCss.value,js:eJs.value,comportamentoOk:false};
  const SONDA=`<script>(function(){try{var antes=document.body.innerHTML;var botao=document.querySelector('button');if(!botao){parent.postMessage({sonda:true,ok:false,detalhe:'nenhum botão encontrado'},'*');return;}var classesAntes=new Set();document.querySelectorAll('*').forEach(function(e){e.classList.forEach(function(c){classesAntes.add(c)})});botao.click();setTimeout(function(){var depois=document.body.innerHTML;var classesDepois=new Set();document.querySelectorAll('*').forEach(function(e){e.classList.forEach(function(c){classesDepois.add(c)})});var novaClasse=[...classesDepois].some(function(c){return !classesAntes.has(c)});var mudouTexto=antes!==depois;parent.postMessage({sonda:true,ok:mudouTexto&&novaClasse,detalhe:mudouTexto?(novaClasse?'o clique mudou texto e classe':'o clique mudou o texto, mas nenhuma classe nova foi adicionada'):'o clique não alterou a página'},'*');},50);}catch(e){parent.postMessage({sonda:true,ok:false,detalhe:String(e.message||e)},'*');}})();<\/script>`;
  function analisarEstatico(){
   const html=eHtml.value,css=eCss.value,js=eJs.value;
   const doc=new DOMParser().parseFromString(`<!doctype html><html><body>${html}</body></html>`,'text/html');
   const tem=t=>doc.querySelector(t)!==null;
   const h1=doc.querySelectorAll('h1').length,h2=doc.querySelectorAll('h2').length;
   const faltam=['header','nav','main','footer'].filter(t=>!tem(t));
   const semantica=faltam.length===0&&h1===1&&h2>=2;
   const imagens=[...doc.querySelectorAll('img')];
   const imagensOk=imagens.length>0&&imagens.every(i=>(i.getAttribute('alt')||'').trim().length>=8);
   const links=[...doc.querySelectorAll('nav a[href^="#"]')].filter(a=>doc.querySelector(a.getAttribute('href')));
   const regras=(css.match(/[^{}]+\{[^}]*\}/g)||[]).length;
   const classesCss=[...css.matchAll(/\.([a-zA-Z_-][\w-]*)/g)].map(m=>m[1]);
   const classesJs=[...js.matchAll(/classList\.(?:add|toggle)\(\s*['"]([\w-]+)['"]/g)].map(m=>m[1]);
   const cssOk=regras>=4&&classesCss.some(c=>classesJs.includes(c));
   Object.assign(estado,{html,css,js,semantica,detalheSemantica:faltam.length?`faltam: ${faltam.join(', ')}`:h1!==1?`${h1} h1`:h2<2?`${h2} h2`:'',imagensOk,linksOk:links.length>=2,regras,cssOk,elementos:doc.body.querySelectorAll('*').length});
  }
  function atualizarPrevia(){
   analisarEstatico();
   estado.comportamentoOk=false;estado.detalheComportamento='verificando…';
   quadro.srcdoc=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${eCss.value}</style></head><body>${eHtml.value}<script>${eJs.value}<\/script>${SONDA}</body></html>`;
   api.guardar({html:eHtml.value,css:eCss.value,js:eJs.value});
   explicacao.definir(`Estrutura: ${estado.semantica?'semântica completa':'incompleta ('+estado.detalheSemantica+')'} · ${estado.regras} regras CSS · ${estado.imagensOk?'imagens com alt':'imagens sem alt adequado'}. Aguardando a sonda de comportamento…`);
   api.atualizar(estado);
  }
  function ouvinte(evento){if(evento.source!==quadro.contentWindow||!evento.data?.sonda)return;estado.comportamentoOk=Boolean(evento.data.ok);estado.detalheComportamento=evento.data.detalhe;explicacao.definir(`Estrutura: ${estado.semantica?'semântica completa':'incompleta ('+estado.detalheSemantica+')'} · ${estado.regras} regras CSS · comportamento: ${escapar(estado.detalheComportamento)}.`);api.atualizar(estado);}
  addEventListener('message',ouvinte);
  buscar('[data-atualizar]',area).onclick=atualizarPrevia;
  buscar('[data-baixar]',area).onclick=()=>{const conteudo=`<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Minha página</title>\n<style>\n${eCss.value}\n</style>\n</head>\n<body>\n${eHtml.value}\n<script>\n${eJs.value}\n<\/script>\n</body>\n</html>`;const a=document.createElement('a');a.download='minha-pagina.html';a.href=URL.createObjectURL(new Blob([conteudo],{type:'text/html'}));a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  [eHtml,eCss,eJs].forEach(e=>e.addEventListener('keydown',ev=>{if(ev.key==='Tab'){ev.preventDefault();const i=e.selectionStart;e.setRangeText('  ',i,e.selectionEnd,'end');}if((ev.ctrlKey||ev.metaKey)&&ev.key==='Enter'){ev.preventDefault();atualizarPrevia();}}));
  atualizarPrevia();
  return {estado:()=>estado,reiniciar(){eHtml.value=MODELO_HTML;eCss.value=MODELO_CSS;eJs.value=MODELO_JS;atualizarPrevia();},limpar(){removeEventListener('message',ouvinte);}};
 }
};
