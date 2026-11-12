// Renan | renancodando
import {buscar,buscarTodos,escapar,icone,criar,limitarTaxa} from '../utilitarios/dom.js';
import {normalizar,tokenizar,formatarData} from '../utilitarios/texto.js';
import {carregarIndiceBusca,carregarCatalogo} from '../conteudos/catalogo.js';
import {listar} from '../armazenamento/banco.js';

export const estilos=['/css/ambientes/pesquisa.css'];
const TIPOS={disciplina:'Disciplinas',aula:'Aulas',conceito:'Conceitos',laboratorio:'Laboratórios',projeto:'Projetos',exercicio:'Exercícios',anotacao:'Suas anotações',descoberta:'Suas descobertas'};
const ICONES={disciplina:'livro',aula:'documento',conceito:'lampada',laboratorio:'frasco',projeto:'cubo',exercicio:'alvo',anotacao:'lapis',descoberta:'estrela'};

export function pontuar(entrada,termos,termoCompleto){
 const titulo=normalizar(entrada.titulo),texto=normalizar(entrada.texto||'');
 let pontos=0;
 if(termoCompleto&&titulo.includes(termoCompleto))pontos+=40;
 if(termoCompleto&&titulo.startsWith(termoCompleto))pontos+=20;
 termos.forEach(t=>{if(titulo.includes(t))pontos+=12;if(titulo.split(/\s+/).some(p=>p.startsWith(t)))pontos+=4;const ocorrencias=texto.split(t).length-1;if(ocorrencias)pontos+=Math.min(10,3+ocorrencias);});
 if(entrada.tipo==='disciplina')pontos*=1.1;
 if(entrada.tipo==='exercicio')pontos*=.6;
 return pontos;
}

export async function montar({raiz,consulta,definirTitulo,navegar}){
 definirTitulo('Pesquisa','Busca integrada entre disciplinas, aulas, conceitos, laboratórios, projetos, exercícios e suas anotações.');
 const [indice,catalogo,anotacoes,descobertas]=await Promise.all([carregarIndiceBusca(),carregarCatalogo(),listar('anotacoes'),listar('descobertas')]);
 const locais=[...anotacoes.map(a=>({tipo:'anotacao',id:a.id,titulo:a.texto.slice(0,80),texto:a.texto+' '+(a.titulo||''),url:a.tipo==='aula'?`/saberes/${a.referencia}`:'/acervo',disciplina:a.disciplina,data:a.criadaEm})),...descobertas.map(d=>({tipo:'descoberta',id:d.id,titulo:d.titulo,texto:d.texto,url:'/comunidade',disciplina:d.disciplina,data:d.data}))];
 const tudo=[...indice,...locais];
 let filtroTipo='todos',filtroDisciplina='todas',ativo=-1,resultados=[];
 raiz.innerHTML=`<div class="pagina-ambiente pagina-pesquisa">
  <header class="cabecalho-ambiente"><p class="sobretitulo">BUSCA INTEGRADA</p><h1>O que você quer <em>encontrar</em>?</h1><p class="introducao">Procure por título ou por palavras do conteúdo. Acentos são ignorados. Use ↑ e ↓ para navegar pelos resultados e Enter para abrir.</p></header>
  <label class="campo-busca campo-pesquisa">${icone('busca')}<input id="termo-pesquisa" type="search" placeholder="função, célula, argumento, circuito…" autocomplete="off" aria-label="Termo de pesquisa" aria-controls="resultados-pesquisa" aria-expanded="true" role="combobox"><span class="atalho" aria-hidden="true">/</span></label>
  <div class="fita-filtros" role="group" aria-label="Filtros"><button class="botao ativo" data-tipo="todos" aria-pressed="true">Tudo</button>${Object.entries(TIPOS).map(([k,v])=>`<button class="botao" data-tipo="${k}" aria-pressed="false">${v}</button>`).join('')}<select data-disciplina aria-label="Filtrar por disciplina"><option value="todas">Todas as disciplinas</option>${catalogo.disciplinas.map(d=>`<option value="${d.id}">${escapar(d.nome)}</option>`).join('')}</select></div>
  <div id="resultados-pesquisa" class="resultados-pesquisa" role="listbox" aria-label="Resultados"></div>
 </div>`;
 const entrada=buscar('#termo-pesquisa',raiz),areaResultados=buscar('#resultados-pesquisa',raiz);
 entrada.value=consulta.get('q')||'';
 function pesquisar(){
  const bruto=entrada.value.trim(),termoCompleto=normalizar(bruto),termos=tokenizar(bruto);
  let lista=tudo.filter(e=>(filtroTipo==='todos'||e.tipo===filtroTipo)&&(filtroDisciplina==='todas'||e.disciplina===filtroDisciplina));
  if(termos.length){lista=lista.map(e=>({...e,pontos:pontuar(e,termos,termoCompleto)})).filter(e=>e.pontos>0).sort((a,b)=>b.pontos-a.pontos);}
  else lista=lista.filter(e=>e.tipo!=='exercicio').slice(0,60);
  resultados=lista.slice(0,80);ativo=-1;
  const url=new URL(location.href);if(bruto)url.searchParams.set('q',bruto);else url.searchParams.delete('q');history.replaceState(history.state,'',url);
  desenhar(termos);
 }
 function destacar(texto,termos){let saida=escapar(texto);termos.forEach(t=>{const re=new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'ig');saida=saida.replace(re,'<mark>$1</mark>');});return saida;}
 function trecho(e,termos){const texto=e.texto||'';const n=normalizar(texto);const pos=termos.map(t=>n.indexOf(t)).filter(p=>p>=0).sort((a,b)=>a-b)[0]??0;const inicio=Math.max(0,pos-70);return (inicio>0?'…':'')+texto.slice(inicio,inicio+180)+(texto.length>inicio+180?'…':'');}
 function desenhar(termos){
  if(!resultados.length){areaResultados.innerHTML=`<div class="painel-vazio"><p>Nenhum resultado para “${escapar(entrada.value)}”. Tente outra palavra, sem filtros, ou procure por um conceito próximo.</p></div>`;return;}
  const grupos=new Map();resultados.forEach(r=>{if(!grupos.has(r.tipo))grupos.set(r.tipo,[]);grupos.get(r.tipo).push(r);});
  let posicao=0;
  areaResultados.innerHTML=[...grupos.entries()].map(([tipo,itens])=>`<section class="grupo-resultados"><h2>${icone(ICONES[tipo])} ${TIPOS[tipo]} <span>${itens.length}</span></h2>${itens.map(r=>{const d=catalogo.disciplinas.find(x=>x.id===r.disciplina);const i=posicao++;return `<a class="resultado" href="${r.url}" role="option" data-posicao="${i}" id="resultado-${i}" aria-selected="false"><strong>${destacar(r.titulo,termos)}</strong><small>${trecho(r,termos)?destacar(trecho(r,termos),termos):''}</small><span class="meta-resultado">${d?`<span class="etiqueta" style="--cor:${d.cor}">${escapar(d.nome)}</span>`:''}${r.data?`<span class="etiqueta">${formatarData(r.data)}</span>`:''}</span></a>`;}).join('')}</section>`).join('');
 }
 const pesquisarDevagar=limitarTaxa(pesquisar,120);
 entrada.addEventListener('input',pesquisarDevagar);
 entrada.addEventListener('keydown',e=>{const itens=buscarTodos('.resultado',areaResultados);if(!itens.length)return;if(e.key==='ArrowDown'){e.preventDefault();ativo=Math.min(itens.length-1,ativo+1);}else if(e.key==='ArrowUp'){e.preventDefault();ativo=Math.max(0,ativo-1);}else if(e.key==='Enter'&&ativo>=0){e.preventDefault();navegar(itens[ativo].getAttribute('href'));return;}else if(e.key==='Escape'){entrada.value='';pesquisar();return;}else return;itens.forEach((it,i)=>{it.classList.toggle('ativo',i===ativo);it.setAttribute('aria-selected',String(i===ativo));});itens[ativo].scrollIntoView({block:'nearest'});entrada.setAttribute('aria-activedescendant',`resultado-${ativo}`);});
 buscarTodos('[data-tipo]',raiz).forEach(b=>b.onclick=()=>{filtroTipo=b.dataset.tipo;buscarTodos('[data-tipo]',raiz).forEach(x=>{x.classList.toggle('ativo',x===b);x.setAttribute('aria-pressed',String(x===b));});pesquisar();});
 buscar('[data-disciplina]',raiz).onchange=e=>{filtroDisciplina=e.target.value;pesquisar();};
 const atalho=e=>{if(e.key==='/'&&!e.target.matches('input,textarea')){e.preventDefault();entrada.focus();}};
 document.addEventListener('keydown',atalho);
 pesquisar();
 setTimeout(()=>entrada.focus(),80);
 return ()=>document.removeEventListener('keydown',atalho);
}
