// Renan | renancodando
import {buscar,buscarTodos,escapar,icone,criar,reduzirMovimento} from '../utilitarios/dom.js';
import {normalizar} from '../utilitarios/texto.js';
import {carregarCatalogo} from '../conteudos/catalogo.js';
import {mapaDeEstados,ESTADOS} from '../jornadas/estados.js';
import {construirGrafo,criarSimulacao} from '../exploracao/grafo.js';

export const estilos=['/css/ambientes/exploracao.css'];
const TIPOS={disciplina:'Disciplina',aula:'Aula',conceito:'Conceito',laboratorio:'Laboratório',projeto:'Projeto'};
const CORES_ESTADO={'nao-estudada':null,'em-aprendizagem':'#e5c17d','precisa-revisao':'#e39a6d','dominio-demonstrado':'#7fc3a4'};

export async function montar({raiz,consulta,definirTitulo,navegar}){
 definirTitulo('Exploração','Mapa interativo das conexões entre disciplinas, aulas e conceitos.');
 const [catalogo,mapa]=await Promise.all([carregarCatalogo(),mapaDeEstados()]);
 const grafo=construirGrafo(catalogo,mapa.obter);
 const filtros={disciplina:consulta.get('disciplina')||'todas',conceitos:consulta.get('conceitos')!=='0',estudados:false};
 let selecionado=null,escala=1,dx=0,dy=0,arrastando=null,moveu=false,quadro=0,visiveis=[],termo='';
 raiz.innerHTML=`<div class="pagina-ambiente pagina-exploracao">
  <header class="cabecalho-ambiente"><p class="sobretitulo">MAPA DO CONHECIMENTO</p><h1>Um saber <em>ilumina</em> o outro.</h1><p class="introducao">Disciplinas, aulas, conceitos, laboratórios e projetos como uma rede. As ligações têm significado: pré-requisito, conhecimento relacionado, conceito compartilhado, laboratório ou projeto que usa a aula. Aproxime com a roda ou a pinça, arraste o fundo para mover e os nós para reorganizar.</p></header>
  <div class="fita-filtros"><label class="campo-busca">${icone('busca')}<input type="search" placeholder="Localizar um nó…" aria-label="Localizar nó" data-localizar></label><select data-filtro-disciplina aria-label="Filtrar disciplina"><option value="todas">Todas as disciplinas</option>${catalogo.disciplinas.map(d=>`<option value="${d.id}" ${filtros.disciplina===d.id?'selected':''}>${escapar(d.nome)}</option>`).join('')}</select><button class="botao pequeno" data-alternar="conceitos" aria-pressed="${filtros.conceitos}">Conceitos</button><button class="botao pequeno" data-alternar="estudados" aria-pressed="false">Só estudados</button><button class="botao pequeno secundario" data-centrar>${icone('alvo')} Centrar</button></div>
  <div class="mapa-exploracao"><canvas class="tela-grafo" role="img" aria-label="Grafo do conhecimento; use a lista ao lado para navegar por teclado" tabindex="0"></canvas>
   <aside class="painel-no" aria-live="polite"><div data-detalhe><p class="sobretitulo">LEGENDA</p><ul class="legenda-grafo"><li><i style="background:#8aa0a8"></i> disciplina (grande) · aula (média) · conceito (pequeno)</li><li><i style="background:${CORES_ESTADO['em-aprendizagem']}"></i> em aprendizagem</li><li><i style="background:${CORES_ESTADO['precisa-revisao']}"></i> precisa de revisão</li><li><i style="background:${CORES_ESTADO['dominio-demonstrado']}"></i> domínio demonstrado</li><li><b class="seta-legenda">→</b> pré-requisito</li><li><b class="linha-legenda"></b> relacionado / pertence</li></ul><p class="texto-apoio">Selecione um nó para ver detalhes e abrir o conteúdo.</p></div><details class="lista-nos"><summary>Navegar pela lista</summary><div data-lista></div></details></aside>
  </div></div>`;
 const tela=buscar('canvas',raiz),contexto=tela.getContext('2d'),detalhe=buscar('[data-detalhe]',raiz),lista=buscar('[data-lista]',raiz);
 let largura=800,altura=560;
 const proporcao=Math.min(devicePixelRatio||1,2);
 function ajustar(){const caixa=tela.parentElement.getBoundingClientRect();largura=Math.max(300,caixa.width-(innerWidth>980?300:0));altura=Math.min(640,Math.max(380,innerHeight-260));tela.width=largura*proporcao;tela.height=altura*proporcao;tela.style.width=largura+'px';tela.style.height=altura+'px';contexto.setTransform(proporcao,0,0,proporcao,0,0);}
 ajustar();
 const simulacao=criarSimulacao(grafo,largura,altura);
 function calcularVisiveis(){visiveis=grafo.nos.map(no=>{if(filtros.disciplina!=='todas'&&no.disciplina!==filtros.disciplina&&no.tipo!=='disciplina')return false;if(filtros.disciplina!=='todas'&&no.tipo==='disciplina'&&no.disciplina!==filtros.disciplina)return false;if(!filtros.conceitos&&no.tipo==='conceito')return false;if(filtros.estudados&&no.tipo==='aula'&&no.estado==='nao-estudada')return false;if(filtros.estudados&&no.tipo==='conceito'){const aulasDo=grafo.arestas.filter(e=>e.tipo==='conceito'&&grafo.nos[e.j]===no).map(e=>grafo.nos[e.i]);if(!aulasDo.some(a=>a.estado!=='nao-estudada'))return false;}return true;});}
 const mundo=(x,y)=>({x:(x-largura/2)/escala+largura/2-dx,y:(y-altura/2)/escala+altura/2-dy});
 function desenhar(){
  contexto.clearRect(0,0,largura,altura);
  contexto.save();contexto.translate(largura/2,altura/2);contexto.scale(escala,escala);contexto.translate(-largura/2+dx,-altura/2+dy);
  const vizinhosSel=selecionado!=null?simulacao.vizinhos[selecionado]:null;
  grafo.arestas.forEach(e=>{if(!visiveis[e.i]||!visiveis[e.j])return;const a=grafo.nos[e.i],b=grafo.nos[e.j];const ligado=selecionado!=null&&(e.i===selecionado||e.j===selecionado);contexto.strokeStyle=ligado?'#f1dca6':e.tipo==='prerequisito'?'#e39a6d66':e.tipo==='conceito'?'#ffffff14':e.tipo==='relacionado'?'#86b4d855':'#c9a96733';contexto.lineWidth=(ligado?2:e.tipo==='conceito'?.7:1.2)/escala;contexto.beginPath();contexto.moveTo(a.x,a.y);contexto.lineTo(b.x,b.y);contexto.stroke();if(e.tipo==='prerequisito'){const ang=Math.atan2(b.y-a.y,b.x-a.x);const px=b.x-Math.cos(ang)*(b.raio+4),py=b.y-Math.sin(ang)*(b.raio+4);contexto.fillStyle=ligado?'#f1dca6':'#e39a6d99';contexto.beginPath();contexto.moveTo(px,py);contexto.lineTo(px-Math.cos(ang-.5)*7/escala,py-Math.sin(ang-.5)*7/escala);contexto.lineTo(px-Math.cos(ang+.5)*7/escala,py-Math.sin(ang+.5)*7/escala);contexto.fill();}});
  grafo.nos.forEach((no,i)=>{if(!visiveis[i])return;const sel=i===selecionado,viz=vizinhosSel?.has(i);const apagado=selecionado!=null&&!sel&&!viz;contexto.globalAlpha=apagado?.35:1;const corEstado=no.tipo==='aula'?CORES_ESTADO[no.estado]:null;contexto.beginPath();contexto.arc(no.x,no.y,no.raio+(sel?3:0),0,7);contexto.fillStyle=no.tipo==='conceito'?no.cor+'aa':'#132431';contexto.fill();contexto.lineWidth=(sel?3:no.tipo==='disciplina'?2:1.4)/escala;contexto.strokeStyle=sel?'#f1dca6':corEstado||no.cor;contexto.stroke();if(no.tipo==='disciplina'){contexto.fillStyle=no.cor+'33';contexto.fill();}if(corEstado){contexto.fillStyle=corEstado;contexto.beginPath();contexto.arc(no.x,no.y,no.raio*.45,0,7);contexto.fill();}if(no.tipo!=='conceito'||escala>1.6||sel||viz){contexto.fillStyle=apagado?'#8aa0a8':'#e8dcc0';contexto.font=`${no.tipo==='disciplina'?'500 13px Georgia':no.tipo==='conceito'?'9px Arial':'11px Arial'}`;contexto.textAlign='center';contexto.textBaseline='top';const texto=no.nome.length>28&&!sel?no.nome.slice(0,26)+'…':no.nome;contexto.fillText(texto,no.x,no.y+no.raio+3);}contexto.globalAlpha=1;});
  contexto.restore();
 }
 function animar(){const continua=simulacao.passo(visiveis);desenhar();if(continua&&!reduzirMovimento.matches)quadro=requestAnimationFrame(animar);else{quadro=0;for(let k=0;k<(reduzirMovimento.matches?200:0);k++)simulacao.passo(visiveis);desenhar();}}
 function iniciar(){calcularVisiveis();simulacao.aquecer();cancelAnimationFrame(quadro);if(reduzirMovimento.matches){for(let k=0;k<300;k++)simulacao.passo(visiveis);desenhar();}else quadro=requestAnimationFrame(animar);desenharLista();}
 function selecionar(i,centrar=false){
  selecionado=i;
  if(i==null){desenhar();return;}
  const no=grafo.nos[i];
  const ligacoes=grafo.arestas.filter(e=>e.i===i||e.j===i).map(e=>({outro:grafo.nos[e.i===i?e.j:e.i],tipo:e.tipo,saida:e.i===i}));
  const grupos={prerequisito:[],relacionado:[],conceito:[],pertence:[],laboratorio:[],projeto:[]};ligacoes.forEach(l=>grupos[l.tipo]?.push(l));
  const rotulo=l=>l.tipo==='prerequisito'?(l.saida?'é pré-requisito de':'tem como pré-requisito'):l.tipo==='relacionado'?'relacionado a':l.tipo==='conceito'?(no.tipo==='conceito'?'aparece em':'conceito'):l.tipo==='pertence'?(no.tipo==='disciplina'?'aula':'disciplina'):l.tipo==='laboratorio'?'laboratório':'projeto';
  const d=catalogo.disciplinas.find(x=>x.id===no.disciplina);
  detalhe.innerHTML=`<p class="sobretitulo">${TIPOS[no.tipo].toUpperCase()}${d?` · ${escapar(d.nome).toUpperCase()}`:''}</p><h2>${escapar(no.nome)}</h2>${no.estado?`<span class="etiqueta estado-${no.estado}">${ESTADOS[no.estado].rotulo}</span>`:''}<p class="texto-apoio">${escapar(no.descricao||'')}</p><ul class="lista-ligacoes">${ligacoes.slice(0,14).map(l=>`<li><small>${rotulo(l)}</small><button type="button" class="botao-texto" data-ir="${grafo.indice.get(l.outro.id)}">${escapar(l.outro.nome)}</button></li>`).join('')}${ligacoes.length>14?`<li><small>e mais ${ligacoes.length-14} ligações</small></li>`:''}</ul><div class="acoes-painel"><a class="botao" href="${no.url}">Abrir ${TIPOS[no.tipo].toLowerCase()}</a></div>`;
  buscarTodos('[data-ir]',detalhe).forEach(b=>b.onclick=()=>selecionar(Number(b.dataset.ir),true));
  if(centrar){dx=largura/2-no.x;dy=altura/2-no.y;}
  desenhar();
 }
 function desenharLista(){const itens=grafo.nos.map((no,i)=>({no,i})).filter(({no,i})=>visiveis[i]&&(!termo||normalizar(no.nome).includes(termo))).slice(0,120);lista.innerHTML=`<ul class="lista-pontos limpa">${itens.map(({no,i})=>`<li><button type="button" class="botao-texto" data-no="${i}">${escapar(no.nome)} <small>${TIPOS[no.tipo]}</small></button></li>`).join('')}</ul>`;buscarTodos('[data-no]',lista).forEach(b=>b.onclick=()=>selecionar(Number(b.dataset.no),true));}
 const noEm=(x,y)=>{const p=mundo(x,y);let melhor=null,dist=Infinity;grafo.nos.forEach((no,i)=>{if(!visiveis[i])return;const d=Math.hypot(no.x-p.x,no.y-p.y);if(d<no.raio+6/escala&&d<dist){dist=d;melhor=i;}});return melhor;};
 const toques=new Map();let distPinca=0;
 tela.addEventListener('pointerdown',e=>{tela.setPointerCapture(e.pointerId);const caixa=tela.getBoundingClientRect();const x=e.clientX-caixa.left,y=e.clientY-caixa.top;toques.set(e.pointerId,{x,y});const i=noEm(x,y);arrastando={no:i,x,y,dx,dy,moveu:false};if(i!=null){grafo.nos[i].fixo=true;}moveu=false;});
 tela.addEventListener('pointermove',e=>{if(!arrastando)return;const caixa=tela.getBoundingClientRect();const x=e.clientX-caixa.left,y=e.clientY-caixa.top;toques.set(e.pointerId,{x,y});if(toques.size===2){const [a,b]=[...toques.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(distPinca)escala=Math.max(.3,Math.min(4,escala*d/distPinca));distPinca=d;desenhar();return;}if(Math.hypot(x-arrastando.x,y-arrastando.y)>3)arrastando.moveu=true;if(arrastando.no!=null){const p=mundo(x,y);const no=grafo.nos[arrastando.no];no.x=p.x;no.y=p.y;simulacao.aquecer();if(!quadro&&!reduzirMovimento.matches)quadro=requestAnimationFrame(animar);else desenhar();}else{dx=arrastando.dx+(x-arrastando.x)/escala;dy=arrastando.dy+(y-arrastando.y)/escala;desenhar();}});
 tela.addEventListener('pointerup',e=>{toques.delete(e.pointerId);distPinca=0;if(!arrastando)return;if(arrastando.no!=null){grafo.nos[arrastando.no].fixo=false;if(!arrastando.moveu)selecionar(arrastando.no);}else if(!arrastando.moveu)selecionar(null);arrastando=null;});
 tela.addEventListener('wheel',e=>{e.preventDefault();const f=e.deltaY>0?.9:1.1;escala=Math.max(.3,Math.min(4,escala*f));desenhar();},{passive:false});
 tela.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='='){escala=Math.min(4,escala*1.15);}else if(e.key==='-'){escala=Math.max(.3,escala/1.15);}else if(e.key==='ArrowLeft')dx+=30/escala;else if(e.key==='ArrowRight')dx-=30/escala;else if(e.key==='ArrowUp')dy+=30/escala;else if(e.key==='ArrowDown')dy-=30/escala;else return;e.preventDefault();desenhar();});
 buscar('[data-filtro-disciplina]',raiz).onchange=e=>{filtros.disciplina=e.target.value;iniciar();};
 buscarTodos('[data-alternar]',raiz).forEach(b=>b.onclick=()=>{filtros[b.dataset.alternar]=!filtros[b.dataset.alternar];b.setAttribute('aria-pressed',String(filtros[b.dataset.alternar]));iniciar();});
 buscar('[data-centrar]',raiz).onclick=()=>{escala=1;dx=0;dy=0;selecionar(null);};
 buscar('[data-localizar]',raiz).oninput=e=>{termo=normalizar(e.target.value);desenharLista();if(termo.length>=3){const i=grafo.nos.findIndex((no,k)=>visiveis[k]&&normalizar(no.nome).includes(termo));if(i>=0)selecionar(i,true);}};
 const redimensionar=()=>{ajustar();desenhar();};
 addEventListener('resize',redimensionar);
 iniciar();
 const alvo=consulta.get('no');
 if(alvo){const i=grafo.nos.findIndex(no=>no.id==='d:'+alvo||no.id==='a:'+alvo||no.id==='c:'+alvo);if(i>=0)setTimeout(()=>selecionar(i,true),400);}
 return ()=>{cancelAnimationFrame(quadro);removeEventListener('resize',redimensionar);};
}
