// Renan | renancodando
import {buscar,buscarTodos,escapar,icone,criar,avisar,confirmar} from '../utilitarios/dom.js';
import {formatarData,duracaoLegivel} from '../utilitarios/texto.js';
import {carregarCatalogo} from '../conteudos/catalogo.js';
import {listar,obter} from '../armazenamento/banco.js';
import {registrarProjeto} from '../progresso/registro.js';

export const estilos=['/css/ambientes/construir.css'];
const modulos={calculadora:()=>import('../projetos/calculadora.js'),ponte:()=>import('../projetos/ponte.js'),circuito:()=>import('../projetos/circuito.js'),'composicao-visual':()=>import('../projetos/composicao-visual.js'),investigacao:()=>import('../projetos/investigacao.js'),'pagina-web':()=>import('../projetos/pagina-web.js')};

export async function montar({raiz,parametros,definirTitulo}){
 const catalogo=await carregarCatalogo();
 if(parametros.projeto)return montarProjeto(raiz,parametros.projeto,catalogo,definirTitulo);
 definirTitulo('Construir','Projetos práticos que combinam conhecimentos: calculadora, ponte, circuito, composição visual, investigação histórica e página web.');
 const registros=await listar('projetos');
 raiz.innerHTML=`<div class="pagina-ambiente pagina-construir">
  <header class="cabecalho-ambiente"><p class="sobretitulo">APRENDIZAGEM POR PROJETOS</p><h1>Saber é <em>fazer</em> algo com o que se sabe.</h1><p class="introducao">Cada projeto combina conceitos de mais de uma disciplina e termina em algo verificável: um programa que passa nos testes, uma estrutura que suporta a carga, uma página que funciona. O sistema confere automaticamente o que pode ser conferido por regras; o resto fica para a sua autoavaliação honesta.</p></header>
  <div class="oficina">
   ${catalogo.projetos.map((p,i)=>{const r=registros.find(x=>x.id===p.id);return `<a class="projeto-cartao revelar" href="/construir/${p.id}" style="--atraso:${i*70}ms"><span class="cabeca-projeto"><span class="numero-projeto">${String(i+1).padStart(2,'0')}</span><span class="dificuldade" aria-label="Dificuldade ${p.dificuldade} de 3">${'◆'.repeat(p.dificuldade)}${'◇'.repeat(3-p.dificuldade)}</span></span><strong>${escapar(p.nome)}</strong><small>${escapar(p.descricao)}</small><span class="alinhado">${p.disciplinas.map(d=>{const dd=catalogo.disciplinas.find(x=>x.id===d);return dd?`<span class="etiqueta" style="--cor:${dd.cor}">${icone(dd.icone)} ${escapar(dd.nome)}</span>`:''}).join('')}<span class="etiqueta">${duracaoLegivel(p.duracao)}</span>${r?.concluidoEm?`<span class="etiqueta estado-dominio-demonstrado">${icone('verificado')} Concluído</span>`:r?.estado?'<span class="etiqueta estado-em-aprendizagem">Em andamento</span>':''}</span></a>`;}).join('')}
  </div>
 </div>`;
 buscarTodos('.revelar',raiz).forEach(e=>{e.style.animationDelay=e.style.getPropertyValue('--atraso');requestAnimationFrame(()=>e.classList.add('visivel'));});
}

async function montarProjeto(raiz,id,catalogo,definirTitulo){
 const meta=catalogo.projetos.find(p=>p.id===id);
 if(!meta||!modulos[id]){raiz.innerHTML='<section class="pagina-ambiente"><header class="cabecalho-ambiente"><h1>Projeto não encontrado.</h1><div class="acoes-painel"><a class="botao" href="/construir">Ver todos os projetos</a></div></header></section>';definirTitulo('Projeto não encontrado');return;}
 definirTitulo(meta.nome,meta.descricao);
 const modulo=await modulos[id]();
 const definicao=modulo.definicao;
 let registro=await obter('projetos',id)||null;
 const conhecimentos=(meta.conhecimentos||[]).map(a=>catalogo.aulas.find(x=>x.id===a)).filter(Boolean);
 raiz.innerHTML=`<div class="pagina-ambiente pagina-projeto">
  <header class="cabecalho-ambiente"><nav class="caminho" aria-label="Você está em"><a href="/construir">Construir</a><span>›</span><em>${escapar(meta.nome)}</em></nav><p class="sobretitulo">PROJETO · ${meta.disciplinas.map(d=>catalogo.disciplinas.find(x=>x.id===d)?.nome||d).join(' + ').toUpperCase()}</p><h1>${escapar(meta.nome)}</h1><p class="introducao">${definicao.objetivo}</p></header>
  <div class="oficina-projeto">
   <div class="area-trabalho"><div class="mesa" data-mesa></div></div>
   <aside class="paineis-projeto">
    <section class="placa compacta"><h3>${icone('alvo')} Critérios de conclusão</h3><ul class="lista-criterios" data-criterios></ul><div class="acoes-painel"><button class="botao" data-concluir disabled>Registrar conclusão</button><button class="botao secundario pequeno" data-refazer>${icone('reiniciar')} Refazer</button></div><div data-situacao></div></section>
    <details class="placa compacta" open><summary>${icone('documento')} Instruções</summary><ol class="instrucoes-projeto">${definicao.instrucoes.map(i=>`<li>${i}</li>`).join('')}</ol></details>
    <details class="placa compacta"><summary>${icone('cubo')} Materiais virtuais</summary><ul class="lista-pontos compacta">${definicao.materiais.map(m=>`<li>${m}</li>`).join('')}</ul></details>
    <details class="placa compacta"><summary>${icone('livro')} Conhecimentos necessários</summary><div class="grade-selos">${conhecimentos.map(a=>`<a class="selo" href="/saberes/${a.id}">${escapar(a.titulo)}</a>`).join('')}</div>${definicao.conhecimentos?`<ul class="lista-pontos compacta" style="margin-top:8px">${definicao.conhecimentos.map(c=>`<li>${c}</li>`).join('')}</ul>`:''}</details>
    <details class="placa compacta"><summary>${icone('relogio')} Registro de resultados</summary><div data-historico></div></details>
   </aside>
  </div></div>`;
 const mesa=buscar('[data-mesa]',raiz),listaCriterios=buscar('[data-criterios]',raiz),botaoConcluir=buscar('[data-concluir]',raiz),situacao=buscar('[data-situacao]',raiz);
 const manuais=new Set(registro?.manuais||[]);
 let estadoAtual=null,resultadoCriterios=[];
 const api={estadoGuardado:registro?.estado||null,atualizar(estado){estadoAtual=estado;avaliar();},guardar(estado){registrarProjeto(id,{estado}).then(r=>registro=r);},avisar};
 const instancia=definicao.montar(mesa,api)||{};
 function avaliar(){
  const estado=estadoAtual||instancia.estado?.()||{};
  resultadoCriterios=definicao.criterios.map(c=>{if(c.manual)return {...c,ok:manuais.has(c.id),manual:true};let ok=false,detalhe='';try{const r=c.verificar(estado);if(typeof r==='object'&&r){ok=Boolean(r.ok);detalhe=r.detalhe||'';}else ok=Boolean(r);}catch{ok=false;}return {...c,ok,detalhe};});
  listaCriterios.innerHTML=resultadoCriterios.map(c=>`<li class="${c.ok?'ok':''}">${c.manual?`<label class="criterio"><input type="checkbox" data-manual="${c.id}" ${c.ok?'checked':''}><span>${c.texto} <em>(autoavaliação)</em></span></label>`:`${icone(c.ok?'verificado':'alvo')} <span>${c.texto}${c.detalhe?`<small>${escapar(c.detalhe)}</small>`:''}</span>`}</li>`).join('');
  buscarTodos('[data-manual]',listaCriterios).forEach(caixa=>caixa.onchange=()=>{if(caixa.checked)manuais.add(caixa.dataset.manual);else manuais.delete(caixa.dataset.manual);registrarProjeto(id,{manuais:[...manuais]}).then(r=>registro=r);avaliar();});
  const completo=resultadoCriterios.every(c=>c.ok);
  botaoConcluir.disabled=!completo;
  if(registro?.concluidoEm)situacao.innerHTML=`<p class="mensagem sucesso"><strong>Projeto concluído em ${formatarData(registro.concluidoEm)}.</strong>Você pode refazer e registrar novos resultados.</p>`;
  else situacao.innerHTML=completo?'<p class="mensagem sucesso"><strong>Todos os critérios atendidos.</strong>Registre a conclusão para contar na sua jornada.</p>':`<p class="texto-apoio">${resultadoCriterios.filter(c=>c.ok).length} de ${resultadoCriterios.length} critérios atendidos.</p>`;
  desenharHistorico();
 }
 function desenharHistorico(){
  const h=buscar('[data-historico]',raiz);
  const itens=(registro?.resultados||[]).slice().reverse();
  h.innerHTML=itens.length?`<ul class="lista-pontos compacta">${itens.map(r=>`<li>${formatarData(r.data)} · ${escapar(r.resumo||'')}</li>`).join('')}</ul>`:'<p class="texto-apoio">Nenhum resultado registrado ainda.</p>';
 }
 botaoConcluir.onclick=async()=>{
  const resumo=definicao.resumo?.(estadoAtual||instancia.estado?.())||'Critérios atendidos';
  registro=await registrarProjeto(id,{concluido:true,resultados:{resumo,criterios:resultadoCriterios.map(c=>c.ok)},nome:meta.nome,estado:estadoAtual||instancia.estado?.()});
  avaliar();
 };
 buscar('[data-refazer]',raiz).onclick=async()=>{if(await confirmar('Refazer apaga o estado atual do projeto. O histórico de resultados é mantido.',{titulo:'Refazer projeto',confirmacao:'Refazer'})){instancia.reiniciar?.();manuais.clear();registrarProjeto(id,{manuais:[]}).then(r=>registro=r);avaliar();}};
 avaliar();
 return ()=>{try{instancia.limpar?.()}catch{}};
}
