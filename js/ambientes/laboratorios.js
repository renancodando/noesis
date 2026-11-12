// Renan | renancodando
import {buscar,buscarTodos,escapar,icone,criar,avisar,anunciar} from '../utilitarios/dom.js';
import {carregarCatalogo} from '../conteudos/catalogo.js';
import {listar,obter} from '../armazenamento/banco.js';
import {registrarLaboratorio,registrarVisitaLaboratorio} from '../progresso/registro.js';

export const estilos=['/css/ambientes/laboratorios.css'];
const modulos={prisma:()=>import('../laboratorios/prisma.js'),axioma:()=>import('../laboratorios/axioma.js'),nucleo:()=>import('../laboratorios/nucleo.js'),interior:()=>import('../laboratorios/interior.js'),crono:()=>import('../laboratorios/crono.js'),atelie:()=>import('../laboratorios/atelie.js')};

export async function montar({raiz,parametros,consulta,definirTitulo,navegar}){
 const catalogo=await carregarCatalogo();
 if(parametros.laboratorio)return montarLaboratorio(raiz,parametros.laboratorio,consulta,catalogo,definirTitulo,navegar);
 definirTitulo('Laboratórios','Laboratórios interativos de ciências, matemática, computação, corpo humano, história e criação.');
 const registros=await listar('laboratorios');
 raiz.innerHTML=`<div class="pagina-ambiente pagina-laboratorios">
  <header class="cabecalho-ambiente"><p class="sobretitulo">EXPERIÊNCIAS REAIS</p><h1>Mude um parâmetro. <em>Veja</em> a consequência.</h1><p class="introducao">Cada laboratório é um instrumento com controles de verdade: os resultados são calculados a partir do estado da simulação, não de animações decorativas. Todos têm instruções, uma atividade guiada e um desafio independente que contam para a sua jornada.</p></header>
  <div class="bancada-laboratorios">
   ${catalogo.laboratorios.map((l,i)=>{const r=registros.find(x=>x.id===l.id);const d=catalogo.disciplinas.find(x=>x.id===l.disciplina);return `<a class="instrumento-cartao revelar" href="/laboratorios/${l.id}" style="--cor:${l.cor};--atraso:${i*70}ms"><span class="visor"><span class="sigla">${escapar(l.nome)}</span><span class="luzes" aria-hidden="true"><i class="${r?.atividadeGuiada?'acesa':''}"></i><i class="${r?.desafio?'acesa':''}"></i></span></span><span class="texto-instrumento"><strong>${escapar(l.subtitulo)}</strong><small>${escapar(l.descricao)}</small><span class="alinhado"><span class="etiqueta" style="--cor:${d?.cor}">${icone(d?.icone||'frasco')} ${escapar(d?.nome||'')}</span><span class="etiqueta">${l.experimentos.length} experimentos</span>${r?.atividadeGuiada?'<span class="etiqueta estado-em-aprendizagem">Guiada feita</span>':''}${r?.desafio?'<span class="etiqueta estado-dominio-demonstrado">Desafio cumprido</span>':''}</span></span></a>`;}).join('')}
  </div>
  <section class="placa pergaminho"><h2>Como usar um laboratório</h2><div class="comparacao"><div class="coluna-comparacao"><h4>1. Leia as hipóteses do modelo</h4><p>Toda simulação simplifica. Cada experimento declara o que o modelo considera e o que ignora. Isso faz parte do aprendizado científico.</p></div><div class="coluna-comparacao"><h4>2. Faça a atividade guiada</h4><p>Passos curtos que verificam o estado real do instrumento: o laboratório reconhece quando você atingiu o que foi pedido.</p></div><div class="coluna-comparacao"><h4>3. Encare o desafio</h4><p>Sem passos: apenas um objetivo e a verificação. Planeje, teste hipóteses, ajuste.</p></div></div></section>
 </div>`;
 buscarTodos('.revelar',raiz).forEach(e=>{e.style.animationDelay=e.style.getPropertyValue('--atraso');requestAnimationFrame(()=>e.classList.add('visivel'));});
}

async function montarLaboratorio(raiz,id,consulta,catalogo,definirTitulo,navegar){
 const meta=catalogo.laboratorios.find(l=>l.id===id);
 if(!meta||!modulos[id]){raiz.innerHTML='<section class="pagina-ambiente"><header class="cabecalho-ambiente"><h1>Laboratório não encontrado.</h1><div class="acoes-painel"><a class="botao" href="/laboratorios">Ver todos os laboratórios</a></div></header></section>';definirTitulo('Laboratório não encontrado');return;}
 definirTitulo(`${meta.nome} — ${meta.subtitulo}`,meta.descricao);
 const modulo=await modulos[id]();
 const definicao=modulo.definicao;
 const registro=await registrarVisitaLaboratorio(id);
 const disciplina=catalogo.disciplinas.find(d=>d.id===meta.disciplina);
 const aulas=(meta.aulas||[]).map(a=>catalogo.aulas.find(x=>x.id===a)).filter(Boolean);
 let experimentoAtual=definicao.experimentos.find(e=>e.id===consulta.get('experimento'))||definicao.experimentos[0];
 let limparExperimento=null,instancia=null;
 const progressoGuiada=new Map();
 raiz.innerHTML=`<div class="pagina-ambiente pagina-laboratorio laboratorio-${id}" style="--cor:${meta.cor}">
  <header class="cabecalho-ambiente cabecalho-laboratorio"><nav class="caminho" aria-label="Você está em"><a href="/laboratorios">Laboratórios</a><span>›</span><em>${escapar(meta.nome)}</em></nav><div class="alinhado"><span class="placa-sigla">${escapar(meta.nome)}</span><div><p class="sobretitulo">${escapar(meta.subtitulo).toUpperCase()}</p><h1>${escapar(definicao.titulo||meta.subtitulo)}</h1></div></div><p class="introducao">${escapar(definicao.descricao||meta.descricao)}</p></header>
  <div class="abas abas-experimentos" role="tablist" aria-label="Experimentos">${definicao.experimentos.map(e=>`<button role="tab" id="aba-${e.id}" aria-selected="${e.id===experimentoAtual.id}" aria-controls="painel-experimento" data-experimento="${e.id}">${escapar(e.nome)}</button>`).join('')}</div>
  <div class="bancada" id="painel-experimento" role="tabpanel" aria-labelledby="aba-${experimentoAtual.id}">
   <div class="coluna-instrumento"><div class="instrumento area-experimento" aria-live="off"></div><div class="placa compacta nota-modelo-laboratorio" data-modelo></div></div>
   <div class="painel-controles">
    <section class="placa instrucoes" data-instrucoes></section>
    <section class="placa guiada" data-guiada></section>
    <section class="placa desafio" data-desafio></section>
    <section class="placa compacta"><h3>Conexões</h3><div class="grade-selos">${aulas.map(a=>`<a class="selo" href="/saberes/${a.id}">${icone('livro')} ${escapar(a.titulo)}</a>`).join('')}${disciplina?`<a class="selo" href="/jornadas/${disciplina.id}">${icone('bussola')} Jornada de ${escapar(disciplina.nome)}</a>`:''}</div></section>
   </div>
  </div>
 </div>`;
 const areaExperimento=buscar('.area-experimento',raiz),areaInstrucoes=buscar('[data-instrucoes]',raiz),areaGuiada=buscar('[data-guiada]',raiz),areaDesafio=buscar('[data-desafio]',raiz),areaModelo=buscar('[data-modelo]',raiz);
 let estadoAtual=null,registroAtual=registro;

 async function abrirExperimento(experimento){
  if(limparExperimento){try{limparExperimento()}catch{}limparExperimento=null;}
  experimentoAtual=experimento;
  buscarTodos('[role=tab]',raiz).forEach(b=>b.setAttribute('aria-selected',String(b.dataset.experimento===experimento.id)));
  buscar('#painel-experimento',raiz).setAttribute('aria-labelledby','aba-'+experimento.id);
  const url=new URL(location.href);url.searchParams.set('experimento',experimento.id);history.replaceState(history.state,'',url);
  areaExperimento.replaceChildren();
  const guardado=registroAtual?.estado?.[experimento.id]||null;
  const passos=experimento.atividadeGuiada?.passos||[];
  const feitos=new Set(registroAtual?.guiadas?.[experimento.id]||[]);
  progressoGuiada.set(experimento.id,feitos);
  areaInstrucoes.innerHTML=`<h3>${icone('documento')} ${escapar(experimento.nome)}</h3><p>${experimento.descricao||''}</p><p class="rotulo-trilho">Objetivos</p><ul class="lista-pontos compacta">${(experimento.objetivos||[]).map(o=>`<li>${o}</li>`).join('')}</ul><p class="rotulo-trilho">Instruções</p><ol>${(experimento.instrucoes||[]).map(i=>`<li>${i}</li>`).join('')}</ol><div class="acoes-painel"><button class="botao pequeno secundario" data-reiniciar>${icone('reiniciar')} Reiniciar experimento</button></div>`;
  areaModelo.innerHTML=experimento.modelo?`<p class="rotulo-trilho">Hipóteses do modelo</p><ul class="lista-pontos compacta">${experimento.modelo.map(m=>`<li>${m}</li>`).join('')}</ul>`:'';
  desenharGuiada();
  desenharDesafio();
  const api={
   area:areaExperimento,
   estadoGuardado:guardado,
   atualizar(estado){estadoAtual=estado;verificarGuiada(estado);},
   guardar(estado){const novo={...(registroAtual?.estado||{}),[experimento.id]:estado};registrarLaboratorio(id,{estado:novo}).then(r=>registroAtual=r);},
   avisar
  };
  instancia=experimento.montar(areaExperimento,api)||{};
  limparExperimento=instancia.limpar||null;
  buscar('[data-reiniciar]',areaInstrucoes).onclick=()=>{instancia.reiniciar?.();avisar('Experimento reiniciado.');};
  function desenharGuiada(){
   if(!passos.length){areaGuiada.hidden=true;return;}
   areaGuiada.hidden=false;
   const completa=feitos.size===passos.length;
   areaGuiada.innerHTML=`<h3>${icone('alvo')} Atividade guiada</h3><p class="texto-apoio">${experimento.atividadeGuiada.descricao||'Siga os passos. O laboratório verifica cada um a partir do estado real do instrumento.'}</p><ol class="passos-guiados">${passos.map((p,i)=>`<li class="${feitos.has(i)?'feito':''} ${!feitos.has(i)&&[...Array(i).keys()].every(k=>feitos.has(k))?'atual':''}"><span class="marca-passo">${feitos.has(i)?icone('verificado'):i+1}</span><div>${p.texto}</div></li>`).join('')}</ol>${completa?`<p class="mensagem sucesso"><strong>Atividade guiada concluída.</strong>${registroAtual?.atividadeGuiada?'Registrada na sua jornada.':''}</p>`:''}`;
  }
  function verificarGuiada(estado){
   if(!passos.length)return;
   let mudou=false;
   passos.forEach((p,i)=>{if(feitos.has(i))return;const anteriores=[...Array(i).keys()].every(k=>feitos.has(k));if(!anteriores&&!p.independente)return;let ok=false;try{ok=p.verificar(estado);}catch{}if(ok){feitos.add(i);mudou=true;anunciar(`Passo ${i+1} concluído.`);}});
   if(!mudou)return;
   desenharGuiada();
   const todas=feitos.size===passos.length;
   const guiadas={...(registroAtual?.guiadas||{}),[experimento.id]:[...feitos]};
   registrarLaboratorio(id,{atividadeGuiada:todas,nome:meta.nome,guiadas}).then(r=>{registroAtual=r;if(todas)desenharGuiada();});
  }
  function desenharDesafio(){
   const desafio=experimento.desafio;
   if(!desafio){areaDesafio.hidden=true;return;}
   areaDesafio.hidden=false;
   const cumprido=registroAtual?.desafios?.[experimento.id];
   areaDesafio.innerHTML=`<h3>${icone('trofeu')} Desafio</h3><h4>${escapar(desafio.titulo)}</h4><p>${desafio.descricao}</p>${cumprido?`<p class="mensagem sucesso"><strong>Desafio cumprido.</strong>Você pode continuar explorando ou tentar outra solução.</p>`:''}<div class="acoes-painel"><button class="botao" data-verificar-desafio>Verificar desafio</button></div><div class="resultado-desafio" aria-live="polite"></div>`;
   buscar('[data-verificar-desafio]',areaDesafio).onclick=()=>{
    const estado=instancia.estado?instancia.estado():estadoAtual;
    let resultado;try{resultado=desafio.verificar(estado)||{ok:false};}catch(e){resultado={ok:false,mensagem:'Não foi possível verificar o estado atual.'};}
    const saida=buscar('.resultado-desafio',areaDesafio);
    saida.innerHTML=`<p class="mensagem ${resultado.ok?'sucesso':'alerta'}"><strong>${resultado.ok?'Desafio cumprido!':'Ainda não.'}</strong>${resultado.mensagem||''}</p>`;
    if(resultado.ok&&!registroAtual?.desafios?.[experimento.id]){const desafios={...(registroAtual?.desafios||{}),[experimento.id]:true};registrarLaboratorio(id,{desafio:true,nome:meta.nome,desafios}).then(r=>registroAtual=r);}
   };
  }
 }
 buscarTodos('[role=tab]',raiz).forEach(b=>b.onclick=()=>abrirExperimento(definicao.experimentos.find(e=>e.id===b.dataset.experimento)));
 abrirExperimento(experimentoAtual);
 return ()=>{if(limparExperimento){try{limparExperimento()}catch{}}};
}
