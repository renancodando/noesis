// Renan | renancodando
import {buscar,buscarTodos,escapar,icone,criar,avisar,confirmar} from '../utilitarios/dom.js';
import {formatarData,identificador,tempoRelativo,normalizar} from '../utilitarios/texto.js';
import {listar,salvar,remover,obter} from '../armazenamento/banco.js';
import {carregarCatalogo} from '../conteudos/catalogo.js';

export const estilos=['/css/ambientes/acervo.css'];

export async function montar({raiz,consulta,definirTitulo}){
 definirTitulo('Acervo','Biblioteca pessoal: aulas salvas, favoritos, coleções, anotações, referências e histórico.');
 const catalogo=await carregarCatalogo();
 let aba=consulta.get('aba')||'salvos',termo='';
 raiz.innerHTML=`<div class="pagina-ambiente pagina-acervo">
  <header class="cabecalho-ambiente"><p class="sobretitulo">BIBLIOTECA PESSOAL</p><h1>O que você <em>guardou</em> no caminho.</h1><p class="introducao">Aulas e laboratórios salvos, favoritos, coleções temáticas, anotações feitas durante o estudo, referências externas e o histórico de atividades. Tudo fica neste navegador; exporte quando quiser levar para outro lugar.</p></header>
  <div class="abas" role="tablist">${[['salvos','Salvos'],['colecoes','Coleções'],['anotacoes','Anotações'],['referencias','Referências'],['historico','Histórico']].map(([k,v])=>`<button role="tab" aria-selected="${k===aba}" data-aba="${k}">${v}</button>`).join('')}</div>
  <div class="fita-filtros"><label class="campo-busca">${icone('busca')}<input type="search" placeholder="Filtrar neste acervo…" aria-label="Filtrar" data-filtro></label><button class="botao pequeno secundario" data-exportar>${icone('baixar')} Exportar anotações (Markdown)</button></div>
  <div class="conteudo-acervo" data-conteudo role="tabpanel"></div>
 </div>`;
 const conteudo=buscar('[data-conteudo]',raiz);
 buscarTodos('[role=tab]',raiz).forEach(b=>b.onclick=()=>{aba=b.dataset.aba;buscarTodos('[role=tab]',raiz).forEach(x=>x.setAttribute('aria-selected',String(x===b)));const url=new URL(location.href);url.searchParams.set('aba',aba);history.replaceState(history.state,'',url);desenhar();});
 buscar('[data-filtro]',raiz).oninput=e=>{termo=normalizar(e.target.value);desenhar();};
 buscar('[data-exportar]',raiz).onclick=exportarAnotacoes;
 const nomeDe=item=>item.tipo==='aula'?catalogo.aulas.find(a=>a.id===item.referencia)?.titulo:item.tipo==='laboratorio'?catalogo.laboratorios.find(l=>l.id===item.referencia)?.nome:item.tipo==='projeto'?catalogo.projetos.find(p=>p.id===item.referencia)?.nome:item.titulo;
 const urlDe=item=>item.tipo==='aula'?`/saberes/${item.referencia}`:item.tipo==='laboratorio'?`/laboratorios/${item.referencia}`:item.tipo==='projeto'?`/construir/${item.referencia}`:item.url||'#';
 const combina=texto=>!termo||normalizar(texto).includes(termo);
 async function desenhar(){
  if(aba==='salvos'){
   const itens=(await listar('acervo')).sort((a,b)=>(b.salvoEm||'').localeCompare(a.salvoEm||''));
   const colecoes=await listar('colecoes');
   const visiveis=itens.filter(i=>combina((nomeDe(i)||'')+' '+(i.titulo||'')));
   conteudo.innerHTML=visiveis.length?`<div class="estante-acervo">${visiveis.map(i=>`<article class="item-acervo ${i.favorito?'favorito':''}"><header><span class="etiqueta">${{aula:'Aula',laboratorio:'Laboratório',projeto:'Projeto',referencia:'Referência'}[i.tipo]||i.tipo}</span><button class="botao-texto" data-favorito="${i.id}" aria-pressed="${Boolean(i.favorito)}" aria-label="${i.favorito?'Remover dos favoritos':'Marcar como favorito'}">${i.favorito?'★':'☆'}</button></header><h3><a href="${urlDe(i)}">${escapar(nomeDe(i)||i.titulo||i.referencia)}</a></h3><small>Guardado ${tempoRelativo(i.salvoEm)}${i.disciplina?` · ${escapar(catalogo.disciplinas.find(d=>d.id===i.disciplina)?.nome||'')}`:''}</small><div class="colecoes-item">${(i.colecoes||[]).map(c=>`<span class="etiqueta">${escapar(colecoes.find(x=>x.id===c)?.nome||'')}</span>`).join('')}</div><footer><select data-colecao="${i.id}" aria-label="Adicionar a uma coleção"><option value="">+ coleção…</option>${colecoes.filter(c=>!(i.colecoes||[]).includes(c.id)).map(c=>`<option value="${c.id}">${escapar(c.nome)}</option>`).join('')}</select><button class="botao-texto" data-remover="${i.id}">Remover</button></footer></article>`).join('')}</div>`:`<div class="painel-vazio"><p>${termo?'Nada corresponde ao filtro.':'Nada guardado ainda. Nas aulas, use “Guardar no acervo”; nos laboratórios e projetos, o botão de salvar.'}</p><a class="botao" href="/saberes">Explorar aulas</a></div>`;
   buscarTodos('[data-favorito]',conteudo).forEach(b=>b.onclick=async()=>{const item=await obter('acervo',b.dataset.favorito);item.favorito=!item.favorito;await salvar('acervo',item);desenhar();});
   buscarTodos('[data-remover]',conteudo).forEach(b=>b.onclick=async()=>{await remover('acervo',b.dataset.remover);avisar('Item removido do acervo.');desenhar();});
   buscarTodos('[data-colecao]',conteudo).forEach(s=>s.onchange=async()=>{if(!s.value)return;const item=await obter('acervo',s.dataset.colecao);item.colecoes=[...new Set([...(item.colecoes||[]),s.value])];await salvar('acervo',item);desenhar();});
  }
  if(aba==='colecoes'){
   const colecoes=await listar('colecoes'),itens=await listar('acervo');
   conteudo.innerHTML=`<form class="placa compacta form-colecao"><label for="nova-colecao">Nova coleção</label><div class="campo-inline"><input id="nova-colecao" type="text" maxlength="60" placeholder="Ex.: Para a prova de física" required><button class="botao" type="submit">Criar</button></div></form><div class="grade">${colecoes.map(c=>{const seus=itens.filter(i=>(i.colecoes||[]).includes(c.id)&&combina(nomeDe(i)||''));return `<section class="placa colecao"><h3>${escapar(c.nome)}</h3><p class="texto-apoio">${seus.length} item(ns) · criada em ${formatarData(c.criadaEm)}</p><ul class="lista-pontos limpa">${seus.map(i=>`<li><a href="${urlDe(i)}">${escapar(nomeDe(i)||i.titulo)}</a> <button class="botao-texto" data-tirar="${i.id}" data-de="${c.id}">tirar</button></li>`).join('')}</ul><button class="botao-texto" data-apagar-colecao="${c.id}">Apagar coleção</button></section>`;}).join('')||'<p class="texto-apoio">Nenhuma coleção. Crie uma para agrupar materiais por tema, prova ou projeto.</p>'}</div>`;
   buscar('.form-colecao',conteudo).onsubmit=async e=>{e.preventDefault();const nome=buscar('#nova-colecao',conteudo).value.trim();if(!nome)return;await salvar('colecoes',{id:identificador('colecao'),nome,criadaEm:new Date().toISOString()});desenhar();};
   buscarTodos('[data-tirar]',conteudo).forEach(b=>b.onclick=async()=>{const item=await obter('acervo',b.dataset.tirar);item.colecoes=(item.colecoes||[]).filter(c=>c!==b.dataset.de);await salvar('acervo',item);desenhar();});
   buscarTodos('[data-apagar-colecao]',conteudo).forEach(b=>b.onclick=async()=>{if(!await confirmar('Apagar a coleção? Os itens continuam no acervo.',{titulo:'Apagar coleção',confirmacao:'Apagar',perigo:true}))return;await remover('colecoes',b.dataset.apagarColecao);for(const i of itens){if((i.colecoes||[]).includes(b.dataset.apagarColecao)){i.colecoes=i.colecoes.filter(c=>c!==b.dataset.apagarColecao);await salvar('acervo',i);}}desenhar();});
  }
  if(aba==='anotacoes'){
   const anotacoes=(await listar('anotacoes')).filter(a=>combina(a.texto+' '+(a.titulo||''))).sort((a,b)=>b.criadaEm.localeCompare(a.criadaEm));
   const grupos=new Map();anotacoes.forEach(a=>{const k=a.referencia||'geral';if(!grupos.has(k))grupos.set(k,[]);grupos.get(k).push(a);});
   conteudo.innerHTML=`<form class="placa compacta form-anotacao-geral"><label for="anotacao-geral">Nova anotação livre</label><textarea id="anotacao-geral" rows="3" maxlength="2000" placeholder="Uma ideia, uma conexão, uma pergunta para depois…"></textarea><button class="botao pequeno" type="submit" style="margin-top:8px">Guardar</button></form>${grupos.size?[...grupos.entries()].map(([ref,lista])=>`<section class="grupo-anotacoes"><h3>${ref==='geral'?'Anotações livres':`<a href="/saberes/${ref}">${escapar(lista[0].titulo||ref)}</a>`}</h3>${lista.map(a=>`<article class="anotacao-acervo" data-id="${a.id}"><p class="texto-anotacao" contenteditable="false"></p><footer><time>${formatarData(a.criadaEm)}${a.atualizadaEm&&a.atualizadaEm!==a.criadaEm?' · editada':''}</time><span><button class="botao-texto" data-editar>Editar</button><button class="botao-texto" data-apagar>Apagar</button></span></footer></article>`).join('')}</section>`).join(''):'<div class="painel-vazio"><p>Nenhuma anotação ainda. Elas podem ser feitas aqui ou dentro de cada aula.</p></div>'}`;
   buscarTodos('.anotacao-acervo',conteudo).forEach(el=>{const a=anotacoes.find(x=>x.id===el.dataset.id);const p=buscar('.texto-anotacao',el);p.textContent=a.texto;const botaoEditar=buscar('[data-editar]',el);botaoEditar.onclick=async()=>{if(p.contentEditable==='true'){p.contentEditable='false';a.texto=p.textContent.trim();a.atualizadaEm=new Date().toISOString();await salvar('anotacoes',a);botaoEditar.textContent='Editar';avisar('Anotação atualizada.');}else{p.contentEditable='true';p.focus();botaoEditar.textContent='Salvar';}};buscar('[data-apagar]',el).onclick=async()=>{await remover('anotacoes',a.id);desenhar();};});
   buscar('.form-anotacao-geral',conteudo).onsubmit=async e=>{e.preventDefault();const texto=buscar('#anotacao-geral',conteudo).value.trim();if(!texto)return;await salvar('anotacoes',{id:identificador('anotacao'),referencia:null,tipo:'livre',titulo:'',texto,criadaEm:new Date().toISOString(),atualizadaEm:new Date().toISOString()});desenhar();};
  }
  if(aba==='referencias'){
   const refs=(await listar('acervo',i=>i.tipo==='referencia')).filter(r=>combina(r.titulo+' '+(r.autor||'')+' '+(r.nota||'')));
   conteudo.innerHTML=`<form class="placa compacta form-referencia"><h3>Nova referência</h3><div class="campo-inline"><label>Título<input name="titulo" type="text" maxlength="160" required></label><label>Autoria ou fonte<input name="autor" type="text" maxlength="120"></label></div><div class="campo-inline"><label>Endereço (opcional)<input name="url" type="url" maxlength="300" placeholder="https://"></label><label>Disciplina<select name="disciplina"><option value="">—</option>${catalogo.disciplinas.map(d=>`<option value="${d.id}">${escapar(d.nome)}</option>`).join('')}</select></label></div><label>Nota<textarea name="nota" rows="2" maxlength="600"></textarea></label><button class="botao" type="submit" style="margin-top:8px">Guardar referência</button></form><div class="grade">${refs.map(r=>`<article class="placa compacta referencia"><h3>${r.url?`<a href="${escapar(r.url)}" target="_blank" rel="noopener noreferrer">${escapar(r.titulo)} ↗</a>`:escapar(r.titulo)}</h3><p class="texto-apoio">${escapar(r.autor||'')}${r.disciplina?` · ${escapar(catalogo.disciplinas.find(d=>d.id===r.disciplina)?.nome||'')}`:''}</p>${r.nota?`<p>${escapar(r.nota)}</p>`:''}<button class="botao-texto" data-remover-ref="${r.id}">Remover</button></article>`).join('')||'<p class="texto-apoio">Nenhuma referência registrada. Guarde livros, artigos, vídeos ou sites que complementam o estudo.</p>'}</div>`;
   buscar('.form-referencia',conteudo).onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);await salvar('acervo',{id:identificador('ref'),tipo:'referencia',titulo:f.get('titulo').trim(),autor:f.get('autor').trim(),url:f.get('url').trim(),disciplina:f.get('disciplina')||null,nota:f.get('nota').trim(),colecoes:[],favorito:false,salvoEm:new Date().toISOString()});desenhar();};
   buscarTodos('[data-remover-ref]',conteudo).forEach(b=>b.onclick=async()=>{await remover('acervo',b.dataset.removerRef);desenhar();});
  }
  if(aba==='historico'){
   const atividades=(await listar('atividades')).filter(a=>combina(a.descricao)).sort((a,b)=>b.data.localeCompare(a.data)).slice(0,150);
   const porDia=new Map();atividades.forEach(a=>{if(!porDia.has(a.dia))porDia.set(a.dia,[]);porDia.get(a.dia).push(a);});
   conteudo.innerHTML=porDia.size?[...porDia.entries()].map(([dia,lista])=>`<section class="dia-historico"><h3>${formatarData(dia+'T00:00:00',{weekday:'long',day:'2-digit',month:'long'})}</h3><ul class="lista-pontos limpa">${lista.map(a=>`<li><time>${new Date(a.data).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</time> ${escapar(a.descricao)}${a.xp?` <span class="etiqueta">+${a.xp} XP</span>`:''}</li>`).join('')}</ul></section>`).join(''):'<div class="painel-vazio"><p>Nenhuma atividade registrada ainda.</p></div>';
  }
 }
 async function exportarAnotacoes(){
  const anotacoes=(await listar('anotacoes')).sort((a,b)=>a.criadaEm.localeCompare(b.criadaEm));
  if(!anotacoes.length){avisar('Não há anotações para exportar.');return;}
  const linhas=['# Anotações do NÓESIS',`Exportado em ${formatarData(new Date())}`,''];
  const grupos=new Map();anotacoes.forEach(a=>{const k=a.titulo||'Anotações livres';if(!grupos.has(k))grupos.set(k,[]);grupos.get(k).push(a);});
  grupos.forEach((lista,titulo)=>{linhas.push(`## ${titulo}`,'');lista.forEach(a=>linhas.push(`- ${formatarData(a.criadaEm)}: ${a.texto.replace(/\n/g,' ')}`));linhas.push('');});
  const blob=new Blob([linhas.join('\n')],{type:'text/markdown'});const a=document.createElement('a');a.download='anotacoes-noesis.md';a.href=URL.createObjectURL(blob);a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 }
 desenhar();
}
