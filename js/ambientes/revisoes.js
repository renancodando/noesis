// Renan | renancodando
import {buscar,buscarTodos,escapar,icone,criar,anunciar} from '../utilitarios/dom.js';
import {formatarData,diaDe,diasEntre,plural} from '../utilitarios/texto.js';
import {listar} from '../armazenamento/banco.js';
import {carregarCatalogo} from '../conteudos/catalogo.js';
import {cartoesPendentes,responderCartao,QUALIDADES,prioridade,situacaoDoCartao,calcularProximaRevisao} from '../revisoes/agendador.js';
import {registrarRevisao} from '../progresso/registro.js';

export const estilos=['/css/ambientes/revisoes.css'];

export async function montar({raiz,consulta,definirTitulo}){
 definirTitulo('Revisões','Recuperação ativa e repetição espaçada com intervalos calculados pelo seu desempenho.');
 const catalogo=await carregarCatalogo();
 const filtroAula=consulta.get('aula');
 const [todos,tentativas,atividades]=await Promise.all([listar('revisoes'),listar('tentativas'),listar('atividades',a=>a.tipo==='revisao')]);
 const hoje=diaDe();
 let pendentes=(await cartoesPendentes()).filter(c=>!filtroAula||c.aula===filtroAula);
 const tituloAula=id=>catalogo.aulas.find(a=>a.id===id)?.titulo||id;
 const nomeConceito=id=>catalogo.conceitos.find(c=>c.id===id)?.nome||id;
 const porConceito=new Map();
 tentativas.forEach(t=>{if(!t.conceito)return;const r=porConceito.get(t.conceito)||{total:0,erros:0};r.total++;if(!t.correta)r.erros++;porConceito.set(t.conceito,r);});
 const reforco=[...porConceito.entries()].filter(([,r])=>r.total>=2&&r.erros/r.total>=.4).map(([id,r])=>({id,nome:nomeConceito(id),taxa:r.erros/r.total,total:r.total,aula:catalogo.conceitos.find(c=>c.id===id)?.aulas?.[0]})).sort((a,b)=>b.taxa-a.taxa).slice(0,8);
 const proximas=todos.filter(c=>c.proxima>hoje).sort((a,b)=>a.proxima.localeCompare(b.proxima)).slice(0,6);
 const consolidados=todos.filter(c=>situacaoDoCartao(c,hoje)==='consolidado').length;
 const semanas=[];for(let i=7;i>=0;i--){const fim=new Date();fim.setDate(fim.getDate()-i*7);const inicio=new Date(fim);inicio.setDate(inicio.getDate()-6);const di=diaDe(inicio),df=diaDe(fim);const feitas=atividades.filter(a=>a.dia>=di&&a.dia<=df);semanas.push({rotulo:`${inicio.getDate()}/${inicio.getMonth()+1}`,quantidade:feitas.length,qualidade:feitas.length?feitas.reduce((s,a)=>s+(a.qualidade||0),0)/feitas.length:0});}
 const maxSemana=Math.max(1,...semanas.map(s=>s.quantidade));
 raiz.innerHTML=`<div class="pagina-ambiente pagina-revisoes">
  <header class="cabecalho-ambiente"><p class="sobretitulo">RECUPERAÇÃO ATIVA · REPETIÇÃO ESPAÇADA</p><h1>Lembrar é <em>reconstruir</em>.</h1><p class="introducao">Cada aula concluída gera perguntas de recuperação. O agendador marca a próxima revisão a partir de como você avaliou a própria lembrança: intervalos crescem quando a memória está firme e encurtam quando falha.${filtroAula?` Filtrando pela aula “${escapar(tituloAula(filtroAula))}”. <a href="/revisoes">Ver todas</a>.`:''}</p></header>
  <div class="painel-sessao" data-sessao>
   <section class="placa chamada-sessao"><div class="alinhado"><div class="espaco"><p class="sobretitulo">HOJE</p><h2>${pendentes.length?`${plural(pendentes.length,'revisão pendente','revisões pendentes')}`:'Nenhuma revisão pendente'}</h2><p class="texto-apoio">${pendentes.length?'Comece pelas prioritárias: atraso, dificuldade e erros recentes definem a ordem.':todos.length?`A próxima revisão agendada é em ${proximas[0]?formatarData(proximas[0].proxima+'T00:00:00'):'breve'}.`:'Conclua uma aula para que suas perguntas de recuperação entrem no ciclo.'}</p></div>${pendentes.length?`<button class="botao" data-iniciar>${icone('executar')} Iniciar sessão</button>`:'<a class="botao secundario" href="/saberes">Ir para as aulas</a>'}</div></section>
  </div>
  <div class="grade larga paineis-revisao">
   <section class="placa"><h2>Prioritárias</h2>${pendentes.length?`<ol class="lista-prioridade">${pendentes.slice(0,6).map(c=>`<li><span class="pergunta-prioridade">${c.pergunta}</span><small>${escapar(tituloAula(c.aula))} · ${diasEntre(c.proxima,hoje)>0?`${diasEntre(c.proxima,hoje)} dia(s) de atraso`:'vence hoje'} · facilidade ${c.facilidade.toFixed(1)}</small></li>`).join('')}</ol>`:'<p class="texto-apoio">Nada vencido por enquanto.</p>'}</section>
   <section class="placa"><h2>Conceitos que exigem reforço</h2>${reforco.length?`<div class="grafico-barras">${reforco.map(r=>`<div><span><a href="/saberes/${r.aula||''}#conceito-${r.id}">${escapar(r.nome)}</a></span><i style="--valor:${Math.round(r.taxa*100)}%;background:linear-gradient(90deg,#c07a4d,#f6c6ab)"></i><b>${Math.round(r.taxa*100)}% erros</b></div>`).join('')}</div><p class="nota-modelo">Calculado a partir das suas tentativas em exercícios: conceitos com pelo menos duas tentativas e 40% ou mais de erros.</p>`:'<p class="texto-apoio">Sem conceitos problemáticos até agora. Isso aparece quando você erra exercícios com frequência.</p>'}</section>
   <section class="placa"><h2>Próximas agendadas</h2>${proximas.length?`<ul class="lista-pontos limpa lista-agendadas">${proximas.map(c=>`<li><time>${formatarData(c.proxima+'T00:00:00',{day:'2-digit',month:'short'})}</time><span>${c.pergunta}</span><small>${escapar(tituloAula(c.aula))}</small></li>`).join('')}</ul>`:'<p class="texto-apoio">Nenhuma revisão agendada.</p>'}</section>
   <section class="placa"><h2>Evolução</h2><div class="indicadores" style="margin-bottom:14px"><div class="placa compacta"><span class="contador">${todos.length}</span><small>perguntas no ciclo</small></div><div class="placa compacta"><span class="contador">${consolidados}</span><small>consolidadas</small></div><div class="placa compacta"><span class="contador">${atividades.length}</span><small>revisões feitas</small></div></div><div class="semanas" role="img" aria-label="Revisões por semana nas últimas oito semanas">${semanas.map(s=>`<div class="semana"><i style="--altura:${Math.round(s.quantidade/maxSemana*100)}%" title="${s.quantidade} revisões"></i><small>${s.rotulo}</small></div>`).join('')}</div><p class="texto-apoio">Revisões por semana (últimas oito). Qualidade média recente: ${atividades.length?(atividades.slice(-20).reduce((s,a)=>s+(a.qualidade||0),0)/Math.min(20,atividades.length)).toFixed(1):'—'} de 5.</p></section>
  </div>
  <details class="placa compacta algoritmo"><summary>${icone('documento')} Como o intervalo é calculado</summary><div class="prosa"><p>O NÓESIS usa uma adaptação do algoritmo <strong>SM-2</strong>. Cada pergunta tem uma <em>facilidade</em> (começa em 2,5), um <em>intervalo</em> em dias e um contador de <em>repetições</em>. Ao revisar, você classifica a lembrança de 1 (errei) a 5 (fácil):</p><ul><li>Qualidade abaixo de 3: as repetições voltam a zero e a próxima revisão é amanhã.</li><li>Qualidade 3 ou mais: a primeira repetição marca 1 dia, a segunda 6 dias, e as seguintes multiplicam o intervalo anterior pela facilidade.</li><li>A facilidade sobe com respostas fáceis e desce com difíceis, nunca abaixo de 1,3.</li></ul><p>A ordem das pendentes considera atraso, facilidade baixa e erros recentes. Nenhuma inteligência artificial participa do cálculo; tudo é determinístico e pode ser conferido.</p></div></details>
 </div>`;
 const areaSessao=buscar('[data-sessao]',raiz);
 buscar('[data-iniciar]',raiz)?.addEventListener('click',()=>iniciarSessao());
 function iniciarSessao(){
  const fila=[...pendentes];let indice=0,respondidas=0,soma=0;const resultados=[];
  areaSessao.innerHTML=`<section class="placa sessao" aria-live="polite"><div class="barra-progresso"><i data-barra></i></div><p class="contagem-sessao" data-contagem></p><div class="cartao-sessao" data-cartao></div></section>`;
  const cartaoEl=buscar('[data-cartao]',areaSessao);
  function mostrar(){
   if(indice>=fila.length)return concluir();
   const c=fila[indice];
   buscar('[data-barra]',areaSessao).style.setProperty('--valor',Math.round(indice/fila.length*100)+'%');
   buscar('[data-contagem]',areaSessao).textContent=`${indice+1} de ${fila.length} · ${tituloAula(c.aula)}`;
   const previsoes=QUALIDADES.map(q=>({...q,...calcularProximaRevisao(c,q.valor,hoje)}));
   cartaoEl.innerHTML=`<p class="sobretitulo">${c.conceito?escapar(nomeConceito(c.conceito)).toUpperCase():'PERGUNTA'}</p><h2 class="pergunta-sessao">${c.pergunta}</h2><p class="texto-apoio">Responda mentalmente, ou em voz alta, antes de revelar.</p><div class="acoes-painel"><button class="botao" data-revelar>Mostrar resposta <kbd>espaço</kbd></button></div><div class="resposta-sessao" hidden><div class="prosa">${c.resposta}</div><p class="texto-apoio">Como foi lembrar?</p><div class="qualidades">${previsoes.map(q=>`<button class="botao secundario" data-qualidade="${q.valor}"><strong>${q.rotulo}</strong><small>${q.descricao}</small><em>próxima em ${q.intervalo} dia${q.intervalo>1?'s':''}</em><kbd>${QUALIDADES.indexOf(QUALIDADES.find(x=>x.valor===q.valor))+1}</kbd></button>`).join('')}</div></div>`;
   buscar('[data-revelar]',cartaoEl).onclick=revelar;
   buscarTodos('[data-qualidade]',cartaoEl).forEach(b=>b.onclick=()=>responder(Number(b.dataset.qualidade)));
   buscar('[data-revelar]',cartaoEl).focus();
  }
  function revelar(){const r=buscar('.resposta-sessao',cartaoEl);if(!r||!r.hidden)return;r.hidden=false;buscar('[data-revelar]',cartaoEl).hidden=true;buscar('[data-qualidade]',cartaoEl).focus();anunciar('Resposta revelada.');}
  async function responder(qualidade){
   const c=fila[indice];
   const atualizado=await responderCartao(c.id,qualidade);
   await registrarRevisao(c,qualidade);
   respondidas++;soma+=qualidade;resultados.push({cartao:c,qualidade,proxima:atualizado?.proxima});
   indice++;mostrar();
  }
  function teclado(e){if(e.target.matches('input,textarea'))return;if(e.key===' '){e.preventDefault();revelar();}const n=Number(e.key);if(n>=1&&n<=4&&!buscar('.resposta-sessao',cartaoEl)?.hidden){e.preventDefault();responder(QUALIDADES[n-1].valor);}}
  document.addEventListener('keydown',teclado);
  function concluir(){
   document.removeEventListener('keydown',teclado);
   const media=respondidas?soma/respondidas:0;
   areaSessao.innerHTML=`<section class="placa pergaminho"><p class="sobretitulo">SESSÃO CONCLUÍDA</p><h2>${respondidas} ${respondidas===1?'pergunta revisada':'perguntas revisadas'} · qualidade média ${media.toFixed(1)}</h2><ul class="lista-pontos limpa lista-agendadas">${resultados.map(r=>`<li><time>${r.proxima?formatarData(r.proxima+'T00:00:00',{day:'2-digit',month:'short'}):'—'}</time><span>${r.cartao.pergunta}</span><small>${QUALIDADES.find(q=>q.valor===r.qualidade)?.rotulo}</small></li>`).join('')}</ul><div class="acoes-painel"><a class="botao" href="/revisoes">Voltar ao painel</a><a class="botao secundario" href="/minha-jornada">Ver minha jornada</a></div></section>`;
   anunciar('Sessão de revisão concluída.');
  }
  mostrar();
  limpezas.push(()=>document.removeEventListener('keydown',teclado));
 }
 const limpezas=[];
 if(consulta.get('iniciar')==='1'&&pendentes.length)iniciarSessao();
 return ()=>limpezas.forEach(l=>l());
}
