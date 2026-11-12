// Renan | renancodando
import {buscar,buscarTodos,escapar,icone} from '../utilitarios/dom.js';
import {formatarData,diaDe,duracaoLegivel,plural,formatarNumero} from '../utilitarios/texto.js';
import {perfil,progressoNivel,sequenciaDias,maiorSequencia,RECOMPENSAS} from '../progresso/perfil.js';
import {resumoProgresso} from '../progresso/registro.js';
import {carregarCatalogo} from '../conteudos/catalogo.js';
import {mapaDeEstados,etapasDaJornada,resumoDaJornada,ESTADOS} from '../jornadas/estados.js';
import {situacaoDoCartao} from '../revisoes/agendador.js';
import {conquistas,conquistaLiberada} from '../santuario/interface.js';

export const estilos=['/css/ambientes/minha-jornada.css'];

export async function montar({raiz,definirTitulo}){
 definirTitulo('Minha Jornada','Progresso individual: aulas concluídas, exercícios, conceitos dominados, revisões e evolução.');
 const [catalogo,dados,mapa]=await Promise.all([carregarCatalogo(),resumoProgresso(),mapaDeEstados()]);
 const nivel=progressoNivel();
 const hoje=diaDe();
 const concluidas=dados.aulas.filter(a=>a.concluidaEm);
 const disciplinasEstudadas=new Set(dados.aulas.map(a=>a.disciplina));
 const primeiras=new Map();dados.tentativas.forEach(t=>{const k=t.aula+'|'+t.exercicio;if(!primeiras.has(k))primeiras.set(k,t);});
 const taxaPrimeira=primeiras.size?[...primeiras.values()].filter(t=>t.correta).length/primeiras.size:0;
 const taxaGeral=dados.tentativas.length?dados.tentativas.filter(t=>t.correta).length/dados.tentativas.length:0;
 const consolidados=dados.revisoes.filter(c=>situacaoDoCartao(c,hoje)==='consolidado');
 const conceitosDominados=new Set(consolidados.map(c=>c.conceito).filter(Boolean));
 const pendentes=dados.revisoes.filter(c=>c.proxima<=hoje).length;
 const tempo=concluidas.reduce((s,a)=>s+(a.tempoEstimado||catalogo.aulas.find(x=>x.id===a.aula)?.duracao||20),0)+dados.tentativas.reduce((s,t)=>s+Math.min(10,(t.tempo||0)/60),0)+dados.atividades.filter(a=>a.tipo==='revisao').length*1+dados.laboratorios.reduce((s,l)=>s+(l.visitas||0)*8,0);
 const projetosConcluidos=dados.projetos.filter(p=>p.concluidoEm);
 const semanas=[];for(let i=11;i>=0;i--){const fim=new Date();fim.setDate(fim.getDate()-i*7);const inicio=new Date(fim);inicio.setDate(inicio.getDate()-6);const di=diaDe(inicio),df=diaDe(fim);const t=dados.tentativas.filter(x=>x.dia>=di&&x.dia<=df);const at=dados.atividades.filter(x=>x.dia>=di&&x.dia<=df);semanas.push({rotulo:`${inicio.getDate()}/${inicio.getMonth()+1}`,tentativas:t.length,acerto:t.length?t.filter(x=>x.correta).length/t.length:null,atividades:at.length,xp:at.reduce((s,a)=>s+(a.xp||0),0)});}
 const maxAtividades=Math.max(1,...semanas.map(s=>s.atividades));
 const dias=[];for(let i=83;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);dias.push(diaDe(d));}
 const diasAtivos=new Set(perfil.diasEstudo);
 const porDisciplina=catalogo.disciplinas.map(d=>{const etapas=etapasDaJornada(d,catalogo,mapa.obter);const r=resumoDaJornada(etapas);const tent=dados.tentativas.filter(t=>t.disciplina===d.id);return {d,r,tentativas:tent.length,acerto:tent.length?tent.filter(t=>t.correta).length/tent.length:null};});
 const atividades=[...dados.atividades].sort((a,b)=>b.data.localeCompare(a.data)).slice(0,12);
 raiz.innerHTML=`<div class="pagina-ambiente pagina-minha-jornada">
  <header class="cabecalho-ambiente"><p class="sobretitulo">PROGRESSO INDIVIDUAL${perfil.demonstracao?' · PERFIL DE DEMONSTRAÇÃO':''}</p><h1>${escapar(perfil.nome)}, <em>nível ${nivel.nivel}</em>.</h1><p class="introducao">Todos os números abaixo vêm do que você realmente fez neste navegador: aulas concluídas, exercícios respondidos, revisões feitas, laboratórios e projetos. Nada é estimado a partir de páginas abertas.${perfil.demonstracao?' <strong>Este é um perfil de demonstração carregado em Configurações; os dados não são seus.</strong>':''}</p></header>
  <section class="placa pergaminho faixa-nivel"><div class="alinhado"><div class="medalha"><strong>${nivel.nivel}</strong><small>nível</small></div><div class="espaco"><p class="texto-apoio">${formatarNumero(perfil.xp)} XP · faltam ${formatarNumero(nivel.falta)} XP para o nível ${nivel.nivel+1}</p><div class="barra-progresso"><i style="--valor:${Math.round(nivel.proporcao*100)}%"></i></div><p class="nota-modelo">XP é atribuída por aulas concluídas (${RECOMPENSAS.concluirAula}), exercícios corretos (${RECOMPENSAS.exercicioPrimeira} de primeira), práticas (${RECOMPENSAS.praticaAula}), atividades de laboratório (${RECOMPENSAS.atividadeGuiada} e ${RECOMPENSAS.desafioLaboratorio}), projetos (${RECOMPENSAS.projeto}), revisões (${RECOMPENSAS.revisao}–${RECOMPENSAS.revisaoFacil}) e descobertas (${RECOMPENSAS.descoberta}). Os níveis existem para marcar o caminho, não para substituí-lo.</p></div></div></section>
  <div class="indicadores indicadores-jornada">
   ${[[disciplinasEstudadas.size,'disciplinas estudadas','de 8'],[concluidas.length,'aulas concluídas',`de ${catalogo.aulas.length}`],[primeiras.size,'exercícios realizados',`${dados.tentativas.length} tentativas`],[Math.round(taxaPrimeira*100)+'%','acerto de primeira',`${Math.round(taxaGeral*100)}% geral`],[conceitosDominados.size,'conceitos dominados',`${consolidados.length} perguntas consolidadas`],[pendentes,'revisões pendentes',`${dados.revisoes.length} no ciclo`],[duracaoLegivel(tempo),'tempo de estudo estimado','soma de durações e tentativas'],[sequenciaDias(),'dias seguidos',`maior sequência: ${maiorSequencia()}`],[projetosConcluidos.length,'projetos concluídos',`de ${catalogo.projetos.length}`],[dados.laboratorios.filter(l=>l.desafio).length,'desafios de laboratório',`${dados.laboratorios.filter(l=>l.atividadeGuiada).length} guiadas`]].map(([v,r,s])=>`<div class="placa compacta"><span class="contador">${v}</span><small>${r}</small><em>${s}</em></div>`).join('')}
  </div>
  <div class="grade larga paineis-jornada">
   <section class="placa"><h2>Disciplinas</h2><div class="grafico-barras">${porDisciplina.map(({d,r,tentativas,acerto})=>`<div><span><a href="/jornadas/${d.id}" style="color:${d.cor}">${escapar(d.nome)}</a></span><i style="--valor:${Math.round(r.proporcao*100)}%;background:linear-gradient(90deg,${d.cor}99,${d.cor})"></i><b>${r.concluidas}/${r.total}${acerto!==null?` · ${Math.round(acerto*100)}%`:''}</b></div>`).join('')}</div><p class="nota-modelo">Barra: aulas concluídas; percentual: acerto nos exercícios da disciplina.</p></section>
   <section class="placa"><h2>Evolução nas últimas 12 semanas</h2><div class="semanas-jornada" role="img" aria-label="Atividades e acerto por semana">${semanas.map(s=>`<div class="semana-jornada"><i style="--altura:${Math.round(s.atividades/maxAtividades*100)}%" title="${s.atividades} atividades"></i>${s.acerto!==null?`<b style="--y:${Math.round(s.acerto*100)}%" title="${Math.round(s.acerto*100)}% de acerto"></b>`:''}<small>${s.rotulo}</small></div>`).join('')}</div><p class="nota-modelo">Barras: atividades registradas por semana. Pontos: taxa de acerto da semana (0 a 100%).</p><p class="texto-apoio">${semanas.slice(-4).reduce((s,x)=>s+x.xp,0)} XP nas últimas quatro semanas.</p></section>
   <section class="placa"><h2>Dias de estudo (12 semanas)</h2><div class="sequencia-dias" role="img" aria-label="Calendário de dias com atividade">${dias.map(d=>`<i class="${diasAtivos.has(d)?'ativo':''} ${d===hoje?'hoje':''}" title="${d}"></i>`).join('')}</div><p class="texto-apoio">${plural(diasAtivos.size,'dia com atividade','dias com atividade')} no total.</p></section>
   <section class="placa"><h2>Estados das aulas</h2><div class="grafico-barras">${Object.entries(ESTADOS).map(([k,e])=>{const n=k==='nao-estudada'?catalogo.aulas.length-mapa.estados.size:[...mapa.estados.values()].filter(v=>v===k).length;return `<div><span>${e.rotulo}</span><i style="--valor:${Math.round(n/Math.max(1,catalogo.aulas.length)*100)}%"></i><b>${n}</b></div>`;}).join('')}</div></section>
   <section class="placa"><h2>Conquistas</h2><div class="grade-selos">${conquistas.map(([nome,texto],i)=>`<span class="selo ${conquistaLiberada(i)?'':'inativo'}" title="${escapar(texto)}">${icone(conquistaLiberada(i)?'verificado':'estrela')} ${escapar(nome)}</span>`).join('')}</div><p class="texto-apoio">Conquistas do Santuário, liberadas por ações reais.</p></section>
   <section class="placa"><h2>Atividades recentes</h2>${atividades.length?`<ul class="lista-pontos limpa historico-jornada">${atividades.map(a=>`<li><time>${formatarData(a.data,{day:'2-digit',month:'short'})}</time><span>${escapar(a.descricao)}</span>${a.xp?`<em>+${a.xp}</em>`:''}</li>`).join('')}</ul><p><a href="/acervo?aba=historico" class="botao-texto">Ver histórico completo</a></p>`:'<p class="texto-apoio">Nenhuma atividade registrada. Comece por uma aula ou um laboratório.</p>'}</section>
  </div>
 </div>`;
}
