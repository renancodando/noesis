// Renan | renancodando
import {buscar,buscarTodos,criar,escapar,icone,avisar,anunciar} from '../utilitarios/dom.js';
import {duracaoLegivel,formatarData} from '../utilitarios/texto.js';
import {carregarAula,carregarCatalogo} from '../conteudos/catalogo.js';
import {renderizarBlocos,renderizarSumario,ETAPAS} from '../aulas/renderizador.js';
import {montarExercicio} from '../exercicios/motor.js';
import {iniciarAula,marcarBlocoVisto,registrarTentativa,concluirPratica,concluirAula,criteriosDeConclusao,progressoDaAula} from '../progresso/registro.js';
import {mapaDeEstados,prerequisitosPendentes,ESTADOS,concluida} from '../jornadas/estados.js';
import {listar,obter,salvar,remover} from '../armazenamento/banco.js';
import {identificador} from '../utilitarios/texto.js';
import {componentes} from '../aulas/interativos/indice.js';

export const estilos=['/css/ambientes/aula.css'];

export async function montar({raiz,parametros,definirTitulo,navegar}){
 const id=`${parametros.disciplina}/${parametros.aula}`;
 const limpezas=[];
 let aula,catalogo;
 try{[aula,catalogo]=await Promise.all([carregarAula(id),carregarCatalogo()]);}
 catch{
  raiz.innerHTML=`<section class="pagina-ambiente"><header class="cabecalho-ambiente"><p class="sobretitulo">SABERES</p><h1>Esta aula ainda não existe.</h1><p class="introducao">O caminho “${escapar(id)}” não corresponde a nenhuma aula publicada.</p><div class="acoes-painel"><a class="botao" href="/saberes/${escapar(parametros.disciplina)}">Ver a disciplina</a><a class="botao secundario" href="/saberes">Todas as disciplinas</a></div></header></section>`;
  definirTitulo('Aula não encontrada');
  return;
 }
 const disciplina=catalogo.disciplinas.find(d=>d.id===aula.disciplina);
 const resumoCatalogo=catalogo.aulas.find(a=>a.id===aula.id)||{};
 definirTitulo(aula.titulo,aula.resumo);
 const mapa=await mapaDeEstados();
 const pendentes=prerequisitosPendentes({...aula,prerequisitos:aula.prerequisitos||[]},catalogo,mapa.obter);
 const estado=mapa.obter(aula.id);
 const tentativas=await listar('tentativas',t=>t.aula===aula.id);
 const nomeConceito=idConceito=>(aula.conceitos||[]).find(c=>(c.id||c)===idConceito)?.nome||catalogo.conceitos.find(c=>c.id===idConceito)?.nome||idConceito;
 const etapasJornada=disciplina.jornada.etapas;
 const posicao=etapasJornada.indexOf(aula.chave);
 const anterior=posicao>0?catalogo.aulas.find(a=>a.id===`${disciplina.id}/${etapasJornada[posicao-1]}`):null;
 const proxima=posicao<etapasJornada.length-1?catalogo.aulas.find(a=>a.id===`${disciplina.id}/${etapasJornada[posicao+1]}`):null;
 const relacionados=(aula.relacionados||[]).map(rid=>catalogo.aulas.find(a=>a.id===rid)).filter(Boolean);
 const laboratorios=(aula.laboratorios||[]).map(lid=>catalogo.laboratorios.find(l=>l.id===lid)).filter(Boolean);
 const noAcervo=Boolean(await obter('acervo','aula:'+aula.id));

 raiz.innerHTML=`<div class="pagina-ambiente pagina-aula" style="--cor-disciplina:${disciplina.cor}">
 <header class="cabecalho-ambiente cabecalho-aula">
  <nav class="caminho" aria-label="Você está em"><a href="/saberes">Saberes</a><span>›</span><a href="/saberes/${disciplina.id}">${disciplina.nome}</a><span>›</span><em>Aula ${posicao+1}</em></nav>
  <h1>${aula.titulo}</h1>
  <p class="introducao">${aula.resumo||''}</p>
  <div class="meta-aula"><span class="etiqueta estado-${estado}" data-estado>${ESTADOS[estado].rotulo}</span><span class="etiqueta">${icone('relogio')} ${duracaoLegivel(aula.duracao||20)}</span><span class="etiqueta">${icone('alvo')} ${(aula.exercicios||[]).length} exercícios</span>${aula.nivel?`<span class="etiqueta">Nível ${aula.nivel}</span>`:''}<button class="botao pequeno secundario" data-acervo aria-pressed="${noAcervo}">${icone('salvar')} <span>${noAcervo?'No acervo':'Guardar no acervo'}</span></button></div>
  ${pendentes.length?`<div class="mensagem alerta aviso-prerequisito"><strong>Recomendamos concluir antes:</strong> ${pendentes.map(p=>`<a href="/saberes/${p.id}">${escapar(p.titulo)}</a>`).join(', ')}. Você pode continuar mesmo assim, mas alguns conceitos serão assumidos como conhecidos.</div>`:''}
 </header>
 <div class="corpo-aula">
  <div class="conteudo-aula">
   <section class="placa objetivos-aula"><h2>${icone('alvo')} Ao final desta aula, você deve conseguir</h2><ul class="lista-pontos">${(aula.objetivos||[]).map(o=>`<li>${o}</li>`).join('')}</ul></section>
   <div class="blocos-aula"></div>
   <section class="etapa-aula" id="etapa-resolver" aria-labelledby="titulo-resolver"><header class="cabecalho-etapa"><span class="marcador-etapa">4</span><div><h2 id="titulo-resolver">Resolver</h2><p>Exercícios com correção e feedback. Erros fazem parte do caminho: cada um vem com uma explicação.</p></div></header><div class="lista-exercicios"></div></section>
   ${aula.pratica?`<section class="etapa-aula" id="etapa-aplicar" aria-labelledby="titulo-aplicar"><header class="cabecalho-etapa"><span class="marcador-etapa">5</span><div><h2 id="titulo-aplicar">Aplicar</h2><p>Uma atividade prática para usar o que você aprendeu.</p></div></header><div class="area-pratica"></div></section>`:''}
   <section class="etapa-aula" id="etapa-revisar" aria-labelledby="titulo-revisar"><header class="cabecalho-etapa"><span class="marcador-etapa">6</span><div><h2 id="titulo-revisar">Revisar</h2><p>O essencial desta aula, os conceitos e as conexões com outros saberes.</p></div></header>
    <div class="grade revisao-aula">
     <section class="placa"><h3>Conceitos desta aula</h3><dl class="lista-conceitos">${(aula.conceitos||[]).map(c=>`<div id="conceito-${escapar(c.id||c)}"><dt>${escapar(c.nome||c)}</dt><dd>${c.definicao||''}</dd></div>`).join('')}</dl></section>
     <section class="placa"><h3>Perguntas de recuperação</h3><p class="texto-apoio">Tente responder de cabeça antes de abrir cada resposta. Depois que a aula for concluída, estas perguntas entram no seu ciclo de revisões espaçadas.</p>${(aula.revisao||[]).map(r=>`<details class="cartao-revisao"><summary>${r.pergunta}</summary><div class="prosa">${r.resposta}</div></details>`).join('')}</section>
    </div>
    ${relacionados.length||laboratorios.length?`<section class="placa conexoes-aula"><h3>${icone('rede')} Conhecimentos que se encontram</h3><div class="grade">${relacionados.map(r=>`<a class="cartao-caminho" href="/saberes/${r.id}" style="--cor:${catalogo.disciplinas.find(d=>d.id===r.disciplina)?.cor}">${icone(catalogo.disciplinas.find(d=>d.id===r.disciplina)?.icone||'livro')}<span><strong>${escapar(r.titulo)}</strong><small>${escapar(catalogo.disciplinas.find(d=>d.id===r.disciplina)?.nome||'')}</small></span></a>`).join('')}${laboratorios.map(l=>`<a class="cartao-caminho" href="/laboratorios/${l.id}" style="--cor:${l.cor}">${icone('frasco')}<span><strong>${escapar(l.nome)}</strong><small>${escapar(l.subtitulo)}</small></span></a>`).join('')}</div></section>`:''}
    ${aula.material?.length?`<section class="placa"><h3>Material complementar</h3><ul class="lista-pontos">${aula.material.map(m=>`<li><strong>${escapar(m.titulo)}</strong>${m.descricao?` — ${m.descricao}`:''}</li>`).join('')}</ul></section>`:''}
    <section class="placa pergaminho conclusao-aula" aria-live="polite"><h3>Conclusão da aula</h3><div class="criterios-conclusao"></div><div class="acoes-painel"><button class="botao" data-concluir disabled>Concluir aula</button>${proxima?`<a class="botao secundario" href="/saberes/${proxima.id}">Próxima: ${escapar(proxima.titulo)} →</a>`:`<a class="botao secundario" href="/jornadas/${disciplina.id}">Ver a jornada completa</a>`}</div></section>
   </section>
   <nav class="navegacao-aulas" aria-label="Aulas vizinhas">${anterior?`<a href="/saberes/${anterior.id}">${icone('seta-esquerda')}<span><small>Anterior</small>${escapar(anterior.titulo)}</span></a>`:'<span></span>'}${proxima?`<a href="/saberes/${proxima.id}" class="seguinte"><span><small>Próxima</small>${escapar(proxima.titulo)}</span>${icone('seta')}</a>`:''}</nav>
  </div>
  <aside class="trilho-aula coluna-fixa" aria-label="Progresso nesta aula">
   <div class="placa compacta"><p class="rotulo-trilho">Nesta aula</p>${renderizarSumario(aula.blocos||[],aula)}<p class="rotulo-trilho">Progresso</p><div class="barra-progresso"><i data-barra></i></div><p class="resumo-trilho" data-resumo></p></div>
   <details class="placa compacta anotacoes-aula"><summary>${icone('lapis')} Minhas anotações</summary><div class="lista-anotacoes"></div><form class="form-anotacao"><label for="nova-anotacao">Nova anotação</label><textarea id="nova-anotacao" rows="3" maxlength="2000" placeholder="Uma ideia, uma dúvida, uma conexão…"></textarea><button class="botao pequeno" type="submit">Guardar</button></form></details>
  </aside>
 </div></div>`;

 const areaBlocos=buscar('.blocos-aula',raiz);
 let registro=await iniciarAula(aula);
 const contexto={aula,disciplina,aoVerBloco:indice=>marcarBlocoVisto(aula.id,indice)};
 limpezas.push(renderizarBlocos(areaBlocos,aula.blocos||[],contexto));

 const listaExercicios=buscar('.lista-exercicios',raiz);
 const ultimaTentativa=idEx=>{const lista=tentativas.filter(t=>t.exercicio===idEx);const correta=lista.find(t=>t.correta);return correta?{correta:true,resposta:correta.resposta}:null;};
 const contagemTentativas=new Map();
 (aula.exercicios||[]).forEach((exercicio,indice)=>{
  const idEx=exercicio.id||`exercicio-${indice+1}`;
  exercicio.id=idEx;
  contagemTentativas.set(idEx,tentativas.filter(t=>t.exercicio===idEx).length);
  montarExercicio(listaExercicios,exercicio,{numero:indice+1,aula,nomeConceito,estadoInicial:ultimaTentativa(idEx),aoResponder:async resposta=>{
   const total=(contagemTentativas.get(idEx)||0)+1;contagemTentativas.set(idEx,total);
   const {registro:novo}=await registrarTentativa({aula,exercicio:idEx,conceito:exercicio.conceito,correta:resposta.correta,resposta:resposta.resposta,tentativa:total,usouDica:resposta.usouDica,tempo:resposta.tempo});
   registro=novo;atualizarProgresso();
  }});
 });
 if(!(aula.exercicios||[]).length)listaExercicios.innerHTML='<p class="texto-apoio">Esta aula não possui exercícios automáticos.</p>';

 if(aula.pratica)montarPratica(buscar('.area-pratica',raiz));

 function montarPratica(area){
  const pratica=aula.pratica;
  area.innerHTML=`<article class="placa pratica"><h3>${escapar(pratica.titulo)}</h3><div class="prosa">${pratica.descricao||''}</div>${pratica.passos?`<ol class="passos">${pratica.passos.map(p=>`<li><div>${p}</div></li>`).join('')}</ol>`:''}${pratica.componente?`<div class="interativo area-componente-pratica"><p class="carregando-interativo">Preparando…</p></div>`:''}${pratica.laboratorio?`<p><a class="botao secundario" href="/laboratorios/${escapar(pratica.laboratorio)}${pratica.experimento?'?experimento='+escapar(pratica.experimento):''}">${icone('frasco')} Abrir o laboratório</a></p>`:''}<div class="verificacao-pratica"></div></article>`;
  if(pratica.componente&&componentes[pratica.componente]){
   const areaComponente=buscar('.area-componente-pratica',area);
   componentes[pratica.componente]().then(modulo=>{areaComponente.replaceChildren();const limpar=modulo.montar(areaComponente,pratica.parametros||{},{aula,pratica:true,aoConcluir:resultado=>finalizarPratica(resultado)});if(limpar)limpezas.push(limpar);}).catch(()=>areaComponente.innerHTML='<p class="mensagem alerta">Não foi possível carregar a atividade.</p>');
  }
  const verificacao=buscar('.verificacao-pratica',area);
  if(registro.praticaConcluida){verificacao.innerHTML=`<p class="mensagem sucesso"><strong>Prática concluída</strong>${registro.resultadoPratica?.resumo||'Você já realizou esta atividade. Pode refazê-la quando quiser.'}</p>`;}
  else if(pratica.verificacao?.tipo==='checklist'){
   verificacao.innerHTML=`<p class="texto-apoio">Marque cada item quando tiver feito. A conclusão depende de todos.</p>${pratica.verificacao.itens.map((item,i)=>`<label class="criterio"><input type="checkbox" data-item="${i}"><span>${item}</span></label>`).join('')}<div class="acoes-painel"><button class="botao" data-concluir-pratica disabled>Registrar prática concluída</button></div>`;
   const caixas=buscarTodos('[data-item]',verificacao),botao=buscar('[data-concluir-pratica]',verificacao);
   caixas.forEach(c=>c.onchange=()=>botao.disabled=!caixas.every(x=>x.checked));
   botao.onclick=()=>finalizarPratica({resumo:'Todos os itens da prática foram realizados.'});
  }
 }
 async function finalizarPratica(resultado){
  const {registro:novo,xp}=await concluirPratica(aula,resultado||{});
  registro=novo;
  const verificacao=buscar('.verificacao-pratica',raiz);
  if(verificacao)verificacao.innerHTML=`<p class="mensagem sucesso"><strong>Prática concluída${xp?` · +${xp} XP`:''}</strong>${resultado?.resumo||''}</p>`;
  atualizarProgresso();
 }

 const botaoConcluir=buscar('[data-concluir]',raiz);
 function atualizarProgresso(){
  const criterios=criteriosDeConclusao(aula,registro);
  const blocos=(aula.blocos||[]).length;
  const partes=[registro.blocosVistos.length/Math.max(1,blocos)*0.3,criterios.total?criterios.corretos/criterios.total*0.5:0.5,aula.pratica?(criterios.pratica?0.2:0):0.2];
  const proporcao=registro.concluidaEm?1:Math.min(.99,partes.reduce((a,b)=>a+b,0));
  buscar('[data-barra]',raiz).style.setProperty('--valor',Math.round(proporcao*100)+'%');
  buscar('[data-resumo]',raiz).textContent=registro.concluidaEm?`Concluída em ${formatarData(registro.concluidaEm)}`:`${criterios.corretos} de ${criterios.total} exercícios corretos${aula.pratica?` · prática ${criterios.pratica?'feita':'pendente'}`:''}`;
  const lista=buscar('.criterios-conclusao',raiz);
  if(registro.concluidaEm){lista.innerHTML=`<p class="mensagem sucesso"><strong>Aula concluída em ${formatarData(registro.concluidaEm)}.</strong>As perguntas de recuperação já fazem parte das suas revisões. Você pode refazer exercícios a qualquer momento.</p>`;botaoConcluir.hidden=true;return;}
  lista.innerHTML=`<ul class="lista-criterios"><li class="${criterios.exercicios?'ok':''}">${icone(criterios.exercicios?'verificado':'alvo')} Tentar todos os exercícios e acertar pelo menos ${criterios.minimo} de ${criterios.total} <small>(${criterios.corretos} corretos, ${criterios.tentados} tentados)</small></li>${aula.pratica?`<li class="${criterios.pratica?'ok':''}">${icone(criterios.pratica?'verificado':'alvo')} Realizar a atividade prática</li>`:''}</ul>`;
  botaoConcluir.disabled=!criterios.completa;
 }
 atualizarProgresso();
 botaoConcluir.onclick=async()=>{
  const resultado=await concluirAula(aula);
  registro=resultado.registro;
  if(resultado.nova){
   buscar('[data-estado]',raiz).textContent=ESTADOS['dominio-demonstrado'].rotulo;
   buscar('[data-estado]',raiz).className='etiqueta estado-dominio-demonstrado';
   anunciar('Aula concluída.');
  }
  atualizarProgresso();
 };

 const botaoAcervo=buscar('[data-acervo]',raiz);
 botaoAcervo.onclick=async()=>{
  const chave='aula:'+aula.id;
  if(await obter('acervo',chave)){await remover('acervo',chave);botaoAcervo.setAttribute('aria-pressed','false');buscar('span',botaoAcervo).textContent='Guardar no acervo';avisar('Aula removida do acervo.');}
  else{await salvar('acervo',{id:chave,tipo:'aula',referencia:aula.id,titulo:aula.titulo,disciplina:aula.disciplina,colecoes:[],favorito:false,salvoEm:new Date().toISOString()});botaoAcervo.setAttribute('aria-pressed','true');buscar('span',botaoAcervo).textContent='No acervo';avisar('Aula guardada no seu acervo.');}
 };

 const listaAnotacoes=buscar('.lista-anotacoes',raiz),formulario=buscar('.form-anotacao',raiz);
 async function listarAnotacoes(){
  const anotacoes=(await listar('anotacoes',a=>a.referencia===aula.id)).sort((a,b)=>b.criadaEm.localeCompare(a.criadaEm));
  listaAnotacoes.replaceChildren(...anotacoes.map(a=>{const item=criar('article',{classe:'anotacao'});item.innerHTML=`<p></p><footer><time>${formatarData(a.criadaEm)}</time><button type="button" class="botao-texto" data-apagar>Apagar</button></footer>`;buscar('p',item).textContent=a.texto;buscar('[data-apagar]',item).onclick=async()=>{await remover('anotacoes',a.id);listarAnotacoes();};return item;}));
  if(!anotacoes.length)listaAnotacoes.innerHTML='<p class="texto-apoio">Nenhuma anotação ainda.</p>';
 }
 formulario.onsubmit=async evento=>{
  evento.preventDefault();
  const area=buscar('textarea',formulario),texto=area.value.trim();
  if(!texto)return;
  await salvar('anotacoes',{id:identificador('anotacao'),referencia:aula.id,tipo:'aula',titulo:aula.titulo,disciplina:aula.disciplina,texto,criadaEm:new Date().toISOString(),atualizadaEm:new Date().toISOString()});
  area.value='';listarAnotacoes();avisar('Anotação guardada.');
 };
 listarAnotacoes();

 const ligacoesSumario=buscarTodos('.sumario-etapas a',raiz);
 const secoes=buscarTodos('.etapa-aula',raiz);
 const observador=new IntersectionObserver(entradas=>{entradas.forEach(entrada=>{if(!entrada.isIntersecting)return;const idEtapa=entrada.target.id.replace('etapa-','');ligacoesSumario.forEach(l=>l.classList.toggle('atual',l.dataset.etapa===idEtapa));});},{rootMargin:'-30% 0px -60% 0px'});
 secoes.forEach(s=>observador.observe(s));
 limpezas.push(()=>observador.disconnect());
 ligacoesSumario.forEach(l=>l.onclick=evento=>{evento.preventDefault();buscar(l.getAttribute('href'),raiz)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
 if(location.hash){const alvo=buscar(location.hash,raiz);if(alvo)setTimeout(()=>alvo.scrollIntoView({block:'start'}),80);}
 return ()=>limpezas.forEach(l=>l());
}
