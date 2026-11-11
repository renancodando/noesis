// Renan | renancodando
import {buscar,buscarTodos,escapar,icone,criar,avisar,confirmar} from '../utilitarios/dom.js';
import {formatarData,identificador,tempoRelativo} from '../utilitarios/texto.js';
import {listar,salvar,remover} from '../armazenamento/banco.js';
import {carregarCatalogo} from '../conteudos/catalogo.js';
import {registrarDescoberta} from '../progresso/registro.js';
import {perfil} from '../progresso/perfil.js';

export const estilos=['/css/ambientes/comunidade.css'];
const MODELOS=[
 {id:'sete-dias',nome:'Desafio de sete dias',descricao:'Uma aula por dia, de disciplinas diferentes, com registro de uma descoberta ao final de cada uma.',itens:['Dia 1: uma aula de Ciências Exatas','Dia 2: uma aula de Ciências da Vida','Dia 3: uma aula de Humanidades','Dia 4: uma aula de Tecnologia','Dia 5: uma aula de Geografia ou Sociedade','Dia 6: uma aula de Artes ou Linguagens','Dia 7: revisão cumulativa de uma jornada']},
 {id:'clube-fontes',nome:'Clube de leitura de fontes',descricao:'Cada participante analisa um dos documentos de CRONO e compara as fichas em grupo.',itens:['Cada pessoa escolhe um documento no laboratório CRONO','Preencher a ficha de análise individualmente','Exportar a descoberta com a interpretação','Comparar as fichas: onde há concordância e divergência?','Registrar no mural uma síntese da discussão']},
 {id:'maratona',nome:'Maratona de laboratórios',descricao:'Cumprir os desafios dos seis laboratórios e comparar soluções diferentes para o mesmo desafio.',itens:['PRISMA: corrente alvo com dois resistores','AXIOMA: três interseções','NÚCLEO: quadrados perfeitos','INTERIOR: suprir a corrida com economia','CRONO: rede multicausal','ATELIÊ: paleta legível de tríade']}
];

function codificar(objeto){return btoa(unescape(encodeURIComponent(JSON.stringify(objeto)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function decodificar(texto){try{const b=texto.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(decodeURIComponent(escape(atob(b+'='.repeat((4-b.length%4)%4)))));}catch{return null;}}

export async function montar({raiz,consulta,definirTitulo}){
 definirTitulo('Comunidade','Mural local de descobertas, registro de projetos e compartilhamento por arquivo ou link.');
 const catalogo=await carregarCatalogo();
 const compartilhado=consulta.get('c')?decodificar(consulta.get('c')):null;
 raiz.innerHTML=`<div class="pagina-ambiente pagina-comunidade">
  <header class="cabecalho-ambiente"><p class="sobretitulo">COMPARTILHAR · SEM CONTAS, SEM SERVIDOR</p><h1>Ideias crescem quando <em>encontram</em> outras.</h1><p class="introducao">Nesta versão não há comunidade online: não existem perfis, comentários ou publicações de outras pessoas. O que existe é um mural pessoal de descobertas, o registro dos seus projetos e formas de levar o que você produziu a outras pessoas por arquivo ou por link, preparando a colaboração que virá.</p></header>
  ${compartilhado?`<section class="placa pergaminho recebido"><p class="sobretitulo">RECEBIDO POR LINK</p><h2>${escapar(compartilhado.titulo||'Produção compartilhada')}</h2><p>${escapar(compartilhado.texto||'')}</p>${compartilhado.itens?`<ul class="lista-pontos">${compartilhado.itens.map(i=>`<li>${escapar(i)}</li>`).join('')}</ul>`:''}<p class="texto-apoio">Tipo: ${escapar(compartilhado.tipo||'descoberta')}${compartilhado.autor?` · de ${escapar(compartilhado.autor)}`:''}. Os dados vieram codificados no endereço desta página; nada foi enviado a servidores.</p><div class="acoes-painel"><button class="botao" data-importar-link>Guardar no meu mural</button><a class="botao secundario" href="/comunidade">Descartar</a></div></section>`:''}
  <div class="duas-colunas">
   <div>
    <section class="placa mural"><h2>${icone('estrela')} Mural de descobertas</h2><form class="form-descoberta"><label for="titulo-descoberta">Título da descoberta</label><input id="titulo-descoberta" type="text" maxlength="100" placeholder="Ex.: Duas reflexões valem uma rotação" required><label for="texto-descoberta">O que você descobriu</label><textarea id="texto-descoberta" rows="3" maxlength="1200" placeholder="Explique com suas palavras, como se contasse a alguém." required></textarea><div class="campo-inline"><label>Disciplina<select id="disciplina-descoberta"><option value="">—</option>${catalogo.disciplinas.map(d=>`<option value="${d.id}">${escapar(d.nome)}</option>`).join('')}</select></label><button class="botao" type="submit">Registrar no mural</button></div></form><div class="lista-mural" data-mural></div></section>
    <section class="placa"><h2>${icone('cubo')} Registro de projetos</h2><div data-projetos></div></section>
   </div>
   <aside class="lateral-comunidade">
    <section class="placa compacta"><h3>${icone('compartilhar')} Compartilhar e importar</h3><p class="texto-apoio">Exporte suas produções (descobertas e projetos concluídos) como arquivo, ou importe o arquivo de outra pessoa para o seu mural.</p><div class="acoes-painel"><button class="botao pequeno" data-exportar>${icone('baixar')} Exportar produções</button><label class="botao pequeno secundario" for="importar-arquivo">${icone('enviar')} Importar arquivo<input id="importar-arquivo" type="file" accept="application/json" hidden></label></div></section>
    <section class="placa compacta"><h3>${icone('documento')} Modelos de desafios coletivos</h3><p class="texto-apoio">Propostas para fazer com uma turma, um grupo de estudos ou amigos. Gere um link e envie; quem abrir verá o desafio e poderá guardá-lo.</p>${MODELOS.map(m=>`<details class="modelo-desafio"><summary>${escapar(m.nome)}</summary><p>${escapar(m.descricao)}</p><ol class="lista-pontos compacta">${m.itens.map(i=>`<li>${escapar(i)}</li>`).join('')}</ol><button class="botao pequeno secundario" data-link-modelo="${m.id}">Gerar link</button></details>`).join('')}</section>
    <section class="placa compacta"><h3>Preparado para o futuro</h3><p class="texto-apoio">As produções usam um formato aberto (JSON com versão). Quando houver colaboração verdadeira, elas poderão ser publicadas sem conversão. Até lá, nada sai do seu dispositivo sem uma ação sua.</p></section>
   </aside>
  </div>
 </div>`;
 const mural=buscar('[data-mural]',raiz);
 async function desenharMural(){
  const descobertas=(await listar('descobertas')).sort((a,b)=>b.data.localeCompare(a.data));
  mural.innerHTML=descobertas.length?descobertas.map(d=>`<article class="descoberta" data-id="${d.id}"><h3>${escapar(d.titulo)}</h3><p>${escapar(d.texto)}</p><footer><span>${formatarData(d.data)}${d.disciplina?` · ${escapar(catalogo.disciplinas.find(x=>x.id===d.disciplina)?.nome||'')}`:''}${d.origem?` · ${escapar(d.origem)}`:''}</span><span><button class="botao-texto" data-link="${d.id}">Copiar link</button><button class="botao-texto" data-apagar="${d.id}">Apagar</button></span></footer></article>`).join(''):'<div class="painel-vazio"><p>Seu mural está vazio. Registre a primeira descoberta: algo que surpreendeu você em uma aula, um laboratório ou um projeto.</p></div>';
  buscarTodos('[data-apagar]',mural).forEach(b=>b.onclick=async()=>{await remover('descobertas',b.dataset.apagar);desenharMural();});
  buscarTodos('[data-link]',mural).forEach(b=>b.onclick=async()=>{const d=descobertas.find(x=>x.id===b.dataset.link);const url=`${location.origin}/comunidade?c=${codificar({tipo:'descoberta',titulo:d.titulo,texto:d.texto,autor:perfil.nome,versao:1})}`;try{await navigator.clipboard.writeText(url);avisar('Link copiado. Ele contém apenas o título e o texto da descoberta.');}catch{prompt('Copie o link:',url);}});
 }
 buscar('.form-descoberta',raiz).onsubmit=async e=>{e.preventDefault();const titulo=buscar('#titulo-descoberta',raiz).value.trim(),texto=buscar('#texto-descoberta',raiz).value.trim();if(!titulo||!texto)return;await registrarDescoberta({titulo,texto,disciplina:buscar('#disciplina-descoberta',raiz).value||null,origem:null});e.target.reset();desenharMural();};
 async function desenharProjetos(){
  const projetos=await listar('projetos');
  const area=buscar('[data-projetos]',raiz);
  const concluidos=projetos.filter(p=>p.concluidoEm);
  area.innerHTML=concluidos.length?`<ul class="lista-pontos limpa lista-projetos">${concluidos.map(p=>{const meta=catalogo.projetos.find(x=>x.id===p.id);return `<li><a href="/construir/${p.id}"><strong>${escapar(meta?.nome||p.id)}</strong></a><small>Concluído em ${formatarData(p.concluidoEm)} · ${p.versoes||0} versões salvas · ${(p.resultados||[]).slice(-1)[0]?.resumo||''}</small></li>`;}).join('')}</ul>`:'<p class="texto-apoio">Nenhum projeto concluído ainda. Os projetos concluídos aparecem aqui e entram na exportação de produções.</p>';
 }
 buscar('[data-exportar]',raiz).onclick=async()=>{
  const [descobertas,projetos]=await Promise.all([listar('descobertas'),listar('projetos')]);
  const producao={aplicacao:'noesis',tipo:'producoes',versao:1,autor:perfil.nome,exportadoEm:new Date().toISOString(),descobertas,projetos:projetos.filter(p=>p.concluidoEm).map(p=>({id:p.id,concluidoEm:p.concluidoEm,resultados:p.resultados,estado:p.estado}))};
  const blob=new Blob([JSON.stringify(producao,null,1)],{type:'application/json'});const a=document.createElement('a');a.download=`producoes-noesis-${new Date().toISOString().slice(0,10)}.json`;a.href=URL.createObjectURL(blob);a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 };
 buscar('#importar-arquivo',raiz).onchange=async e=>{
  const arquivo=e.target.files[0];if(!arquivo)return;
  let dados;try{dados=JSON.parse(await arquivo.text());}catch{avisar('O arquivo não é um JSON válido.');return;}
  if(dados?.aplicacao!=='noesis'||dados.tipo!=='producoes'||!Array.isArray(dados.descobertas)){avisar('O arquivo não contém produções do NÓESIS.');return;}
  if(!await confirmar(`Importar ${dados.descobertas.length} descoberta(s) de ${dados.autor||'alguém'} para o seu mural? Elas serão marcadas com a origem.`,{titulo:'Importar produções',confirmacao:'Importar'}))return;
  for(const d of dados.descobertas){if(!d.titulo||!d.texto)continue;await salvar('descobertas',{id:identificador('descoberta'),titulo:String(d.titulo).slice(0,100),texto:String(d.texto).slice(0,1200),disciplina:d.disciplina||null,origem:`importado de ${dados.autor||'arquivo'}`,data:new Date().toISOString(),dia:new Date().toISOString().slice(0,10)});}
  avisar('Produções importadas para o mural.');desenharMural();e.target.value='';
 };
 buscar('[data-importar-link]',raiz)?.addEventListener('click',async()=>{await salvar('descobertas',{id:identificador('descoberta'),titulo:String(compartilhado.titulo||'Compartilhado').slice(0,100),texto:String(compartilhado.texto||'')+(compartilhado.itens?'\n'+compartilhado.itens.join('\n'):''),disciplina:null,origem:`recebido${compartilhado.autor?' de '+compartilhado.autor:''} por link`,data:new Date().toISOString(),dia:new Date().toISOString().slice(0,10)});avisar('Guardado no seu mural.');history.replaceState(history.state,'','/comunidade');buscar('.recebido',raiz)?.remove();desenharMural();});
 buscarTodos('[data-link-modelo]',raiz).forEach(b=>b.onclick=async()=>{const m=MODELOS.find(x=>x.id===b.dataset.linkModelo);const url=`${location.origin}/comunidade?c=${codificar({tipo:'desafio coletivo',titulo:m.nome,texto:m.descricao,itens:m.itens,autor:perfil.nome,versao:1})}`;try{await navigator.clipboard.writeText(url);avisar('Link do desafio copiado.');}catch{prompt('Copie o link:',url);}});
 desenharMural();desenharProjetos();
}
