// Renan | renancodando
import {buscar,buscarTodos,escapar,icone,criar,avisar} from '../utilitarios/dom.js';
import {duracaoLegivel,formatarData} from '../utilitarios/texto.js';
import {carregarCatalogo,carregarAula} from '../conteudos/catalogo.js';
import {mapaDeEstados,etapasDaJornada,resumoDaJornada,ESTADOS} from '../jornadas/estados.js';
import {listar,obter} from '../armazenamento/banco.js';
import {montarExercicio} from '../exercicios/motor.js';
import {registrarTentativa} from '../progresso/registro.js';
import {adicionarXp} from '../progresso/perfil.js';
import {salvar} from '../armazenamento/banco.js';
import {diaDe} from '../utilitarios/texto.js';

export const estilos=['/css/ambientes/jornadas.css'];

export async function montar({raiz,parametros,definirTitulo}){
 const catalogo=await carregarCatalogo();
 const mapa=await mapaDeEstados();
 if(parametros.disciplina)return montarTrilha(raiz,parametros.disciplina,catalogo,mapa,definirTitulo);
 definirTitulo('Jornadas','Percursos de aprendizagem por disciplina, com etapas conectadas, pré-requisitos e revisões.');
 const resumos=catalogo.disciplinas.map(d=>{const etapas=etapasDaJornada(d,catalogo,mapa.obter);return {disciplina:d,etapas,resumo:resumoDaJornada(etapas)};});
 const emAndamento=resumos.filter(r=>r.resumo.concluidas>0&&r.resumo.concluidas<r.resumo.total||r.etapas.some(e=>e.estado==='em-aprendizagem'));
 const progressos=[...mapa.progressos.values()].sort((a,b)=>(b.ultimoAcesso||'').localeCompare(a.ultimoAcesso||''));
 const ultima=progressos[0]?catalogo.aulas.find(a=>a.id===progressos[0].aula):null;
 raiz.innerHTML=`<div class="pagina-ambiente pagina-jornadas">
  <header class="cabecalho-ambiente"><p class="sobretitulo">PERCURSOS DE APRENDIZAGEM</p><h1>Caminhos que se <em>cruzam</em>.</h1><p class="introducao">Cada disciplina tem uma jornada introdutória: etapas conectadas, com pré-requisitos quando eles importam, ramificações para laboratórios e projetos, e uma revisão cumulativa ao final. O avanço depende do que você realmente resolve.</p></header>
  ${ultima?`<section class="placa pergaminho retomar"><div class="alinhado"><div class="espaco"><p class="sobretitulo">RETOMAR</p><h2>${escapar(ultima.titulo)}</h2><p>${escapar(catalogo.disciplinas.find(d=>d.id===ultima.disciplina)?.nome||'')} · último acesso ${formatarData(progressos[0].ultimoAcesso)} · ${ESTADOS[mapa.obter(ultima.id)].rotulo}</p></div><a class="botao" href="/saberes/${ultima.id}">Continuar de onde parei ${icone('seta')}</a></div></section>`:''}
  <div class="mapa-trilhas">
   ${resumos.map(({disciplina:d,etapas,resumo},i)=>`<a class="trilha-cartao revelar" href="/jornadas/${d.id}" style="--cor:${d.cor};--atraso:${i*60}ms">
    <div class="cabeca-trilha"><span class="icone-trilha">${icone(d.icone)}</span><div><strong>${escapar(d.nome)}</strong><small>${escapar(d.jornada.titulo)}</small></div></div>
    <svg class="mini-trilha" viewBox="0 0 300 60" aria-hidden="true">${miniTrilha(etapas)}</svg>
    <div class="rodape-trilha"><span class="etiqueta">${resumo.concluidas}/${resumo.total} etapas</span>${resumo.revisoes?`<span class="etiqueta estado-precisa-revisao">${resumo.revisoes} para revisar</span>`:''}${resumo.dominadas?`<span class="etiqueta estado-dominio-demonstrado">${resumo.dominadas} dominadas</span>`:''}${!resumo.concluidas&&!resumo.proxima?'':''}</div>
   </a>`).join('')}
  </div>
  <section class="placa legenda-estados"><h2>Como os estados são calculados</h2><ul class="lista-pontos"><li><strong>Ainda não estudada:</strong> nenhuma atividade registrada na aula.</li><li><strong>Em aprendizagem:</strong> a aula foi aberta, mas os critérios de conclusão (todos os exercícios tentados, pelo menos 70% corretos e prática feita) ainda não foram atingidos.</li><li><strong>Precisa de revisão:</strong> a aula foi concluída e há perguntas de recuperação com revisão vencida, ou as duas últimas revisões tiveram desempenho baixo.</li><li><strong>Domínio demonstrado:</strong> a aula foi concluída e todas as suas perguntas de recuperação já foram revisadas pelo menos duas vezes com intervalos de seis dias ou mais.</li></ul></section>
 </div>`;
 buscarTodos('.revelar',raiz).forEach(e=>{e.style.animationDelay=e.style.getPropertyValue('--atraso');requestAnimationFrame(()=>e.classList.add('visivel'));});
}

function miniTrilha(etapas){
 const n=etapas.length+1;
 const pontos=Array.from({length:n},(_,i)=>({x:20+i*(260/Math.max(1,n-1)),y:30+(i%2?-12:12)}));
 const caminho=pontos.map((p,i)=>i?`L${p.x} ${p.y}`:`M${p.x} ${p.y}`).join('');
 return `<path d="${caminho}" class="linha-mini"/>${pontos.map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="${i===n-1?6:5}" class="no-mini ${i===n-1?'final':'estado-'+etapas[i].estado}"/>`).join('')}`;
}

async function montarTrilha(raiz,id,catalogo,mapa,definirTitulo){
 const disciplina=catalogo.disciplinas.find(d=>d.id===id);
 if(!disciplina){raiz.innerHTML='<section class="pagina-ambiente"><header class="cabecalho-ambiente"><h1>Jornada não encontrada.</h1><div class="acoes-painel"><a class="botao" href="/jornadas">Ver todas as jornadas</a></div></header></section>';definirTitulo('Jornada não encontrada');return;}
 definirTitulo(`Jornada de ${disciplina.nome}`,disciplina.jornada.descricao);
 const etapas=etapasDaJornada(disciplina,catalogo,mapa.obter);
 const resumo=resumoDaJornada(etapas);
 const [laboratoriosFeitos,projetosFeitos]=await Promise.all([listar('laboratorios'),listar('projetos')]);
 const ramos=(disciplina.jornada.ramos||[]).map(r=>({...r,dados:r.tipo==='laboratorio'?catalogo.laboratorios.find(l=>l.id===r.id):catalogo.projetos.find(p=>p.id===r.id),feito:r.tipo==='laboratorio'?laboratoriosFeitos.find(l=>l.id===r.id)?.atividadeGuiada:Boolean(projetosFeitos.find(p=>p.id===r.id)?.concluidoEm)})).filter(r=>r.dados);
 const nos=[...etapas.map((e,i)=>({tipo:'aula',chave:e.aula.chave,etapa:e,indice:i})),{tipo:'revisao',indice:etapas.length}];
 const alturaPasso=ramos.length?200:150,margem=80;
 const altura=margem*2+alturaPasso*(nos.length-1);
 const posicoes=nos.map((no,i)=>({x:i%2?74:26,y:margem+i*alturaPasso}));
 const caminho=posicoes.map((p,i)=>{if(!i)return `M${p.x} ${p.y}`;const a=posicoes[i-1];const c=(p.y-a.y)*0.55;return `C${a.x} ${a.y+c} ${p.x} ${p.y-c} ${p.x} ${p.y}`;}).join('');
 const concluidasAte=nos.findIndex(no=>no.tipo==='aula'&&!no.etapa.concluida);
 const comprimentoFeito=concluidasAte<0?1:concluidasAte/(nos.length-1);
 const posicaoRamo=ramo=>{const i=etapas.findIndex(e=>e.aula.chave===ramo.apos);if(i<0)return null;const base=posicoes[i];const mesmos=ramos.filter(r=>r.apos===ramo.apos);const k=mesmos.indexOf(ramo);return {x:base.x<50?base.x+40:base.x-40,y:base.y+92+k*56,base,ordem:i*10+1+k};};
 const revisaoDisponivel=resumo.concluidas>=2;
 raiz.innerHTML=`<div class="pagina-ambiente pagina-trilha" style="--cor:${disciplina.cor}">
  <header class="cabecalho-ambiente"><nav class="caminho" aria-label="Você está em"><a href="/jornadas">Jornadas</a><span>›</span><em>${escapar(disciplina.nome)}</em></nav><p class="sobretitulo">JORNADA · ${escapar(disciplina.nome).toUpperCase()}</p><h1>${escapar(disciplina.jornada.titulo)}</h1><p class="introducao">${escapar(disciplina.jornada.descricao)}</p>
   <div class="resumo-trilha"><div class="barra-progresso"><i style="--valor:${Math.round(resumo.proporcao*100)}%"></i></div><p>${resumo.concluidas} de ${resumo.total} etapas concluídas${resumo.revisoes?` · ${resumo.revisoes} precisando de revisão`:''}${resumo.dominadas?` · ${resumo.dominadas} com domínio demonstrado`:''}</p></div>
   <div class="acoes-painel">${resumo.proxima?`<a class="botao" href="/saberes/${resumo.proxima.aula.id}">${resumo.concluidas?'Retomar':'Iniciar'} a jornada: ${escapar(resumo.proxima.aula.titulo)}</a>`:'<a class="botao" href="#revisao-cumulativa">Jornada concluída · fazer revisão cumulativa</a>'}<a class="botao secundario" href="/saberes/${disciplina.id}">${icone('livro')} Ver a sala</a></div></header>
  <div class="duas-colunas invertida corpo-trilha">
   <div class="trilha" style="--altura:${altura}px">
    <svg class="desenho-trilha" viewBox="0 0 100 ${altura}" preserveAspectRatio="none" aria-hidden="true"><path class="caminho-base" d="${caminho}"/><path class="caminho-feito" d="${caminho}" pathLength="1" style="--feito:${comprimentoFeito}"/>${ramos.map(r=>{const p=posicaoRamo(r);return p?`<path class="caminho-ramo" d="M${p.base.x} ${p.base.y} Q${p.base.x} ${p.y} ${p.x} ${p.y}"/>`:''}).join('')}</svg>
    ${nos.map((no,i)=>{const p=posicoes[i];if(no.tipo==='revisao')return `<button type="button" class="no-trilha no-revisao ${revisaoDisponivel?'':'bloqueado'}" style="--x:${p.x}%;--y:${p.y}px;--ordem:${i*10}" data-no="revisao" aria-pressed="false"><span class="marca-no">✦</span><span class="rotulo-no"><strong>Revisão cumulativa</strong><small>${revisaoDisponivel?'Disponível':'Conclua duas aulas'}</small></span></button>`;const e=no.etapa;return `<button type="button" class="no-trilha estado-${e.estado} ${e.bloqueada?'bloqueado':''}" style="--x:${p.x}%;--y:${p.y}px;--ordem:${i*10}" data-no="${i}" aria-pressed="false" aria-label="Etapa ${i+1}: ${escapar(e.aula.titulo)}, ${ESTADOS[e.estado].rotulo}${e.bloqueada?', pré-requisito pendente':''}"><span class="marca-no">${e.concluida?icone('verificado'):e.bloqueada?icone('cadeado'):i+1}</span><span class="rotulo-no"><strong>${escapar(e.aula.titulo)}</strong><small>${ESTADOS[e.estado].rotulo}</small></span></button>`;}).join('')}
    ${ramos.map((r,k)=>{const p=posicaoRamo(r);if(!p)return '';return `<a class="no-trilha no-ramo ${r.feito?'feito':''}" style="--x:${p.x}%;--y:${p.y}px;--ordem:${p.ordem}" href="/${r.tipo==='laboratorio'?'laboratorios':'construir'}/${r.id}" aria-label="${r.tipo==='laboratorio'?'Laboratório':'Projeto'} ${escapar(r.dados.nome)}"><span class="marca-no">${icone(r.tipo==='laboratorio'?'frasco':'cubo')}</span><span class="rotulo-no"><strong>${escapar(r.dados.nome)}</strong><small>${r.tipo==='laboratorio'?'Laboratório':'Projeto'}${r.feito?' · feito':''}</small></span></a>`;}).join('')}
   </div>
   <aside class="detalhe-trilha coluna-fixa"><div class="placa" data-detalhe><p class="sobretitulo">ETAPA</p><h2>Escolha uma etapa</h2><p class="texto-apoio">Toque em um ponto do caminho para ver objetivos, pré-requisitos e o que falta para concluir.</p></div></aside>
  </div>
  <section class="placa pergaminho revisao-cumulativa" id="revisao-cumulativa"><h2>${icone('relogio')} Revisão cumulativa</h2><p>Exercícios intercalados de todas as aulas já concluídas nesta jornada, em ordem misturada. Intercalar assuntos é mais difícil do que revisar um de cada vez, e é justamente isso que fortalece a memória. ${revisaoDisponivel?'':'<strong>Disponível quando pelo menos duas aulas estiverem concluídas.</strong>'}</p><div class="acoes-painel"><button class="botao" data-iniciar-revisao ${revisaoDisponivel?'':'disabled'}>Iniciar revisão com ${Math.min(8,etapas.filter(e=>e.concluida).reduce((s,e)=>s+e.aula.exercicios,0))} exercícios</button></div><div class="area-revisao"></div></section>
 </div>`;

 const detalhe=buscar('[data-detalhe]',raiz);
 async function mostrarDetalhe(indice){
  buscarTodos('.no-trilha[data-no]',raiz).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.no===String(indice))));
  if(indice==='revisao'){detalhe.innerHTML=`<p class="sobretitulo">ETAPA FINAL</p><h2>Revisão cumulativa</h2><p>${revisaoDisponivel?'Misture exercícios de todas as aulas concluídas e descubra o que ficou sólido.':'Conclua pelo menos duas aulas para liberar a revisão cumulativa.'}</p><div class="acoes-painel"><a class="botao ${revisaoDisponivel?'':'secundario'}" href="#revisao-cumulativa">Ir para a revisão</a></div>`;return;}
  const e=etapas[Number(indice)];
  const progresso=mapa.progressos.get(e.aula.id);
  const cartoes=mapa.cartoes.filter(c=>c.aula===e.aula.id);
  const pendentes=cartoes.filter(c=>c.proxima<=diaDe()).length;
  detalhe.innerHTML=`<p class="sobretitulo">ETAPA ${Number(indice)+1} DE ${etapas.length}</p><h2>${escapar(e.aula.titulo)}</h2><p class="texto-apoio">${escapar(e.aula.resumo||'')}</p><div class="alinhado" style="margin:10px 0"><span class="etiqueta estado-${e.estado}">${ESTADOS[e.estado].rotulo}</span><span class="etiqueta">${duracaoLegivel(e.aula.duracao||20)}</span><span class="etiqueta">${e.aula.exercicios} exercícios</span></div>
   ${e.bloqueada?`<p class="mensagem alerta"><strong>Pré-requisito recomendado</strong>${e.pendentes.map(p=>`<a href="/saberes/${p.id}">${escapar(p.titulo)}</a>`).join(', ')} ainda não foi concluída. Você pode abrir a aula mesmo assim.</p>`:''}
   <h3>Objetivos</h3><ul class="lista-pontos compacta">${(e.aula.objetivos||[]).slice(0,4).map(o=>`<li>${escapar(o)}</li>`).join('')}</ul>
   ${progresso?`<h3>Seu registro</h3><ul class="lista-pontos compacta"><li>${progresso.exerciciosCorretos.length} de ${e.aula.exercicios} exercícios corretos</li>${e.aula.pratica?`<li>Prática ${progresso.praticaConcluida?'concluída':'pendente'}</li>`:''}${progresso.concluidaEm?`<li>Concluída em ${formatarData(progresso.concluidaEm)}</li>`:''}${cartoes.length?`<li>${cartoes.length} perguntas de revisão${pendentes?` · <strong>${pendentes} vencidas</strong>`:''}</li>`:''}</ul>`:''}
   ${e.aula.conceitos?.length?`<h3>Conceitos</h3><div class="grade-selos">${e.aula.conceitos.map(c=>`<span class="selo">${escapar(catalogo.conceitos.find(x=>x.id===c)?.nome||c)}</span>`).join('')}</div>`:''}
   <div class="acoes-painel"><a class="botao" href="/saberes/${e.aula.id}">${progresso?progresso.concluidaEm?'Revisitar a aula':'Retomar a aula':'Iniciar a aula'}</a>${pendentes?`<a class="botao secundario" href="/revisoes?aula=${encodeURIComponent(e.aula.id)}">Revisar agora</a>`:''}</div>`;
 }
 buscarTodos('.no-trilha[data-no]',raiz).forEach(b=>b.onclick=()=>mostrarDetalhe(b.dataset.no));
 const inicial=resumo.proxima?resumo.proxima.indice:etapas.length?etapas.length-1:'revisao';
 mostrarDetalhe(inicial);

 buscar('[data-iniciar-revisao]',raiz).onclick=()=>iniciarRevisaoCumulativa();
 async function iniciarRevisaoCumulativa(){
  const area=buscar('.area-revisao',raiz);
  const botao=buscar('[data-iniciar-revisao]',raiz);
  botao.disabled=true;
  area.innerHTML='<p class="texto-apoio">Preparando exercícios…</p>';
  const concluidas=etapas.filter(e=>e.concluida);
  const aulas=await Promise.all(concluidas.map(e=>carregarAula(e.aula.id)));
  const filas=aulas.map(a=>({aula:a,exercicios:[...(a.exercicios||[])].sort(()=>Math.random()-.5)}));
  const selecionados=[];
  while(selecionados.length<8&&filas.some(f=>f.exercicios.length)){for(const fila of filas){if(selecionados.length>=8)break;const ex=fila.exercicios.shift();if(ex)selecionados.push({aula:fila.aula,exercicio:ex});}}
  area.innerHTML=`<p class="texto-apoio">${selecionados.length} exercícios de ${aulas.length} aulas, em ordem intercalada. Resolva todos para ver o resultado.</p><div class="lista-exercicios"></div><div class="resultado-revisao" hidden></div>`;
  const lista=buscar('.lista-exercicios',area);
  const placar={total:selecionados.length,corretos:0,respondidos:0,porAula:new Map()};
  selecionados.forEach(({aula,exercicio},i)=>{
   const idEx=exercicio.id||`exercicio-${(aula.exercicios||[]).indexOf(exercicio)+1}`;
   const nomeConceito=c=>(aula.conceitos||[]).find(x=>(x.id||x)===c)?.nome||c;
   const copia={...exercicio,id:`cumulativa-${i+1}`,enunciado:`<p class="origem-exercicio">${escapar(aula.titulo)}</p>${exercicio.enunciado||''}`};
   let respondido=false;
   montarExercicio(lista,copia,{numero:i+1,aula,nomeConceito,aoResponder:async r=>{
    await registrarTentativa({aula,exercicio:idEx,conceito:exercicio.conceito,correta:r.correta,resposta:r.resposta,tentativa:r.tentativa,usouDica:r.usouDica,tempo:r.tempo});
    if(respondido)return;
    if(r.correta||r.tentativa>=3||r.revelado){respondido=true;placar.respondidos++;if(r.correta&&r.tentativa===1)placar.corretos++;const atual=placar.porAula.get(aula.id)||{titulo:aula.titulo,total:0,corretos:0};atual.total++;if(r.correta&&r.tentativa===1)atual.corretos++;placar.porAula.set(aula.id,atual);if(placar.respondidos===placar.total)concluirRevisao();}
   }});
  });
  async function concluirRevisao(){
   const resultado=buscar('.resultado-revisao',area);
   const proporcao=placar.corretos/placar.total;
   const xp=placar.corretos*5;
   if(xp)adicionarXp(xp,'Revisão cumulativa concluída');
   await salvar('atividades',{tipo:'revisao-cumulativa',descricao:`Revisão cumulativa de ${disciplina.nome}: ${placar.corretos} de ${placar.total} de primeira`,referencia:disciplina.id,xp,data:new Date().toISOString(),dia:diaDe()});
   resultado.hidden=false;
   resultado.innerHTML=`<div class="mensagem ${proporcao>=.7?'sucesso':'alerta'}"><strong>${placar.corretos} de ${placar.total} corretos na primeira tentativa (${Math.round(proporcao*100)}%).</strong>${proporcao>=.7?'Boa retenção. Continue revisando conforme o agendador indicar.':'Alguns assuntos pedem reforço. As aulas abaixo com menor desempenho são o melhor lugar para voltar.'}</div><div class="grafico-barras">${[...placar.porAula.values()].map(a=>`<div><span>${escapar(a.titulo)}</span><i style="--valor:${Math.round(a.corretos/a.total*100)}%"></i><b>${a.corretos}/${a.total}</b></div>`).join('')}</div>`;
   botao.disabled=false;botao.textContent='Fazer outra rodada';
   resultado.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
 }
}
