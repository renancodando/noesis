// Renan | renancodando
import {buscar,buscarTodos,escapar,icone} from '../utilitarios/dom.js';
import {duracaoLegivel} from '../utilitarios/texto.js';
import {carregarCatalogo} from '../conteudos/catalogo.js';
import {mapaDeEstados,etapasDaJornada,resumoDaJornada,ESTADOS} from '../jornadas/estados.js';

export const estilos=['/css/ambientes/saberes.css'];

export async function montar({raiz,parametros,definirTitulo}){
 const catalogo=await carregarCatalogo();
 const mapa=await mapaDeEstados();
 if(parametros.disciplina)return montarDisciplina(raiz,parametros.disciplina,catalogo,mapa,definirTitulo);
 definirTitulo('Saberes','Biblioteca de disciplinas e aulas do NÓESIS: oito áreas do conhecimento com aulas, exercícios e experiências próprias.');
 const totalAulas=catalogo.aulas.length;
 raiz.innerHTML=`<div class="pagina-ambiente pagina-saberes">
  <header class="cabecalho-ambiente"><p class="sobretitulo">BIBLIOTECA DE DISCIPLINAS</p><h1>Oito salas. <em>Um só</em> conhecimento.</h1><p class="introducao">Cada disciplina do NÓESIS é um ambiente próprio, com aulas estruturadas em compreender, explorar, experimentar, resolver, aplicar e revisar. Escolha uma sala para entrar.</p></header>
  <div class="atlas">
   ${catalogo.disciplinas.map((d,i)=>{
    const etapas=etapasDaJornada(d,catalogo,mapa.obter);
    const resumo=resumoDaJornada(etapas);
    return `<a class="sala sala-${d.id} revelar" href="/saberes/${d.id}" style="--cor:${d.cor};--atraso:${i*60}ms"><span class="lombada" aria-hidden="true"></span><span class="icone-sala">${icone(d.icone)}</span><span class="texto-sala"><strong>${escapar(d.nome)}</strong><small>${escapar(d.descricao)}</small><span class="progresso-sala"><span class="barra-progresso"><i style="--valor:${Math.round(resumo.proporcao*100)}%"></i></span><em>${resumo.concluidas} de ${resumo.total} aulas${resumo.revisoes?` · ${resumo.revisoes} para revisar`:''}</em></span></span><span class="seta-sala" aria-hidden="true">›</span></a>`;
   }).join('')}
  </div>
  <section class="placa pergaminho rodape-saberes"><div class="alinhado"><div><h2>Como as aulas funcionam</h2><p>Cada aula tem objetivos claros, blocos de explicação, experiências interativas, exercícios com feedback específico, uma atividade prática e perguntas de recuperação que alimentam as revisões espaçadas. A conclusão exige exercícios realmente resolvidos, não apenas páginas abertas.</p></div><div class="indicadores-saberes"><div><span class="contador">${totalAulas}</span><small>aulas publicadas</small></div><div><span class="contador">${catalogo.conceitos.length}</span><small>conceitos conectados</small></div><div><span class="contador">${catalogo.laboratorios.length}</span><small>laboratórios</small></div></div></div></section>
 </div>`;
 revelar(raiz);
}

async function montarDisciplina(raiz,id,catalogo,mapa,definirTitulo){
 const disciplina=catalogo.disciplinas.find(d=>d.id===id);
 if(!disciplina){raiz.innerHTML=`<section class="pagina-ambiente"><header class="cabecalho-ambiente"><p class="sobretitulo">SABERES</p><h1>Disciplina não encontrada.</h1><div class="acoes-painel"><a class="botao" href="/saberes">Ver todas as disciplinas</a></div></header></section>`;definirTitulo('Disciplina não encontrada');return;}
 definirTitulo(disciplina.nome,disciplina.apresentacao);
 const etapas=etapasDaJornada(disciplina,catalogo,mapa.obter);
 const resumo=resumoDaJornada(etapas);
 const laboratorios=catalogo.laboratorios.filter(l=>l.disciplina===id||(disciplina.jornada.ramos||[]).some(r=>r.tipo==='laboratorio'&&r.id===l.id));
 const projetos=catalogo.projetos.filter(p=>p.disciplinas.includes(id));
 const conceitos=catalogo.conceitos.filter(c=>c.aulas.some(a=>a.startsWith(id+'/')));
 const conexoes=new Map();
 etapas.forEach(({aula})=>(aula.relacionados||[]).forEach(r=>{const outra=catalogo.aulas.find(a=>a.id===r);if(outra&&outra.disciplina!==id)conexoes.set(outra.disciplina,(conexoes.get(outra.disciplina)||0)+1);}));
 raiz.innerHTML=`<div class="pagina-ambiente pagina-disciplina" style="--cor:${disciplina.cor}">
  <header class="cabecalho-ambiente cabecalho-disciplina">
   <nav class="caminho" aria-label="Você está em"><a href="/saberes">Saberes</a><span>›</span><em>${escapar(disciplina.nome)}</em></nav>
   <div class="alinhado titulo-disciplina"><span class="emblema-disciplina">${icone(disciplina.icone)}</span><div><p class="sobretitulo">SALA DE ${escapar(disciplina.nome).toUpperCase()}</p><h1>${escapar(disciplina.nome)}</h1></div></div>
   <p class="introducao">${escapar(disciplina.apresentacao)}</p>
   <p class="pergunta-dominio">${escapar(disciplina.pergunta)}</p>
   <div class="acoes-painel">${resumo.proxima?`<a class="botao" href="/saberes/${resumo.proxima.aula.id}">${resumo.concluidas?'Continuar':'Começar'}: ${escapar(resumo.proxima.aula.titulo)}</a>`:''}<a class="botao secundario" href="/jornadas/${id}">${icone('bussola')} Ver a jornada</a><a class="botao secundario" href="/exploracao?disciplina=${id}">${icone('rede')} Ver no mapa</a></div>
  </header>
  <div class="duas-colunas">
   <section aria-labelledby="titulo-aulas">
    <h2 id="titulo-aulas" class="titulo-secao">Aulas da jornada “${escapar(disciplina.jornada.titulo)}”</h2>
    <ol class="estante">
     ${etapas.map(({aula,estado,bloqueada,pendentes},i)=>`<li class="volume revelar estado-${estado}" style="--atraso:${i*70}ms"><a href="/saberes/${aula.id}"><span class="numero-volume">${String(i+1).padStart(2,'0')}</span><span class="texto-volume"><strong>${escapar(aula.titulo)}</strong><small>${escapar(aula.resumo||'')}</small><span class="meta-volume"><span class="etiqueta estado-${estado}">${ESTADOS[estado].rotulo}</span><span class="etiqueta">${duracaoLegivel(aula.duracao||20)}</span><span class="etiqueta">${aula.exercicios} exercícios</span>${bloqueada?`<span class="etiqueta bloqueada">${icone('cadeado')} Recomenda-se antes: ${escapar(pendentes[0].titulo)}</span>`:''}</span></span><span class="seta-sala" aria-hidden="true">›</span></a></li>`).join('')}
     <li class="volume volume-revisao revelar" style="--atraso:${etapas.length*70}ms"><a href="/jornadas/${id}#revisao-cumulativa"><span class="numero-volume">✦</span><span class="texto-volume"><strong>Revisão cumulativa</strong><small>Exercícios intercalados de todas as aulas da jornada. Disponível quando pelo menos duas aulas forem concluídas.</small></span><span class="seta-sala" aria-hidden="true">›</span></a></li>
    </ol>
   </section>
   <aside class="lateral-disciplina">
    <section class="placa"><h3>Progresso nesta sala</h3><div class="barra-progresso"><i style="--valor:${Math.round(resumo.proporcao*100)}%"></i></div><p class="texto-apoio">${resumo.concluidas} de ${resumo.total} aulas concluídas · ${resumo.dominadas} com domínio demonstrado${resumo.revisoes?` · ${resumo.revisoes} precisando de revisão`:''}</p></section>
    ${laboratorios.length?`<section class="placa"><h3>Laboratórios</h3>${laboratorios.map(l=>`<a class="cartao-caminho" href="/laboratorios/${l.id}" style="--cor:${l.cor}">${icone('frasco')}<span><strong>${escapar(l.nome)}</strong><small>${escapar(l.subtitulo)}</small></span></a>`).join('')}</section>`:''}
    ${projetos.length?`<section class="placa"><h3>Projetos</h3>${projetos.map(p=>`<a class="cartao-caminho" href="/construir/${p.id}">${icone('cubo')}<span><strong>${escapar(p.nome)}</strong><small>${escapar(p.descricao)}</small></span></a>`).join('')}</section>`:''}
    ${conceitos.length?`<section class="placa"><h3>Conceitos desta sala</h3><div class="grade-selos">${conceitos.map(c=>`<a class="selo" href="/saberes/${c.aulas[0]}#conceito-${c.id}">${escapar(c.nome)}</a>`).join('')}</div></section>`:''}
    ${conexoes.size?`<section class="placa"><h3>Conversa com</h3><div class="grade-selos">${[...conexoes.entries()].sort((a,b)=>b[1]-a[1]).map(([outra,quantidade])=>{const d=catalogo.disciplinas.find(x=>x.id===outra);return `<a class="selo" href="/saberes/${outra}" style="--cor:${d.cor}">${icone(d.icone)} ${escapar(d.nome)} <small>(${quantidade})</small></a>`}).join('')}</div></section>`:''}
   </aside>
  </div>
 </div>`;
 revelar(raiz);
}

function revelar(raiz){
 buscarTodos('.revelar',raiz).forEach(elemento=>{elemento.style.animationDelay=elemento.style.getPropertyValue('--atraso');requestAnimationFrame(()=>elemento.classList.add('visivel'));});
}
