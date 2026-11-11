// Renan | renancodando
import {criarTela,painelExplicacao,textoAlternativo,botoesOpcoes,animador,movimentoReduzido,paleta,criar,buscar,buscarTodos,escapar} from './base.js';
import {adaptarExperimento} from './adaptador.js';
const carregarNucleo=()=>import('../../laboratorios/nucleo.js');
export const {montar}=adaptarExperimento(carregarNucleo,'portas');
export const montarFluxograma=adaptarExperimento(carregarNucleo,'algoritmos').montar;

export function montarEditorWeb(area,parametros={},contexto={}){
 const modo=parametros.modo||'html';
 const html=parametros.html||'<h1>Minha primeira página</h1>\n<p>Um parágrafo com <strong>destaque</strong> e um <a href="#">link</a>.</p>\n<ul>\n  <li>Primeiro item</li>\n  <li>Segundo item</li>\n</ul>';
 const css=parametros.css||'body { font-family: Georgia, serif; padding: 20px; background: #f4ecd8; color: #2a2419; }\nh1 { color: #132431; border-bottom: 2px solid #d1ad6c; }\nli { margin-bottom: 6px; }';
 const js=parametros.js||'';
 area.innerHTML=`<div class="editor-area"${modo==='css'?' style="grid-template-columns:1fr 1fr"':''}><label style="margin:0"><span class="rotulo-trilho">HTML</span><textarea class="editor-codigo" data-html spellcheck="false" ${modo==='css'?'readonly':''}></textarea></label>${modo!=='html'?`<label style="margin:0"><span class="rotulo-trilho">CSS</span><textarea class="editor-codigo" data-css spellcheck="false"></textarea></label>`:''}${modo==='js'?`<label style="margin:0;grid-column:1/-1"><span class="rotulo-trilho">JavaScript</span><textarea class="editor-codigo" data-js spellcheck="false" style="min-height:120px"></textarea></label>`:''}</div><div class="botoes-opcoes"><button type="button" class="botao pequeno" data-atualizar>▶ Atualizar</button></div><iframe class="previa-pagina" title="Pré-visualização" sandbox="allow-scripts" style="height:${parametros.altura||260}px"></iframe>`;
 const eHtml=buscar('[data-html]',area),eCss=buscar('[data-css]',area),eJs=buscar('[data-js]',area),quadro=buscar('iframe',area);
 eHtml.value=html;if(eCss)eCss.value=css;if(eJs)eJs.value=js;
 const explicacao=painelExplicacao(area);
 function atualizar(){
  const h=eHtml.value,c=eCss?eCss.value:css,j=eJs?eJs.value:'';
  quadro.srcdoc=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${modo==='html'?'body{font-family:Georgia,serif;padding:16px;background:#f4ecd8;color:#2a2419}':c}</style></head><body>${h}${j?`<script>${j}<\/script>`:''}</body></html>`;
  const doc=new DOMParser().parseFromString(`<body>${h}</body>`,'text/html');
  const elementos=doc.body.querySelectorAll('*').length,semanticos=['header','nav','main','section','article','footer','h1','h2','ul','ol','p','a','img'].filter(t=>doc.querySelector(t));
  const regras=(c.match(/[^{}]+\{[^}]*\}/g)||[]).length;
  explicacao.definir(`<strong>${elementos} elementos</strong> no HTML${semanticos.length?` (${semanticos.join(', ')})`:''}${modo!=='html'?` · <strong>${regras} regras</strong> de CSS`:''}. A pré-visualização roda em um iframe isolado: nada do que você escreve afeta o NÓESIS.`);
  contexto.aoAtualizar?.({html:h,css:c,js:j,elementos,regras});
 }
 buscar('[data-atualizar]',area).onclick=atualizar;
 [eHtml,eCss,eJs].filter(Boolean).forEach(e=>e.addEventListener('keydown',ev=>{if(ev.key==='Tab'){ev.preventDefault();const i=e.selectionStart;e.setRangeText('  ',i,e.selectionEnd,'end');}if((ev.ctrlKey||ev.metaKey)&&ev.key==='Enter'){ev.preventDefault();atualizar();}}));
 atualizar();
 return ()=>{};
}

export function montarEstrutura(area,parametros={},contexto={}){
 let tipo=parametros.tipo||'pilha',itens=[],contador=0,historico=[];
 const tela=criarTela(area,{largura:640,altura:220,descricao:'Visualização da estrutura de dados'});
 const opcoes=botoesOpcoes(area,[{valor:'pilha',rotulo:'Pilha (LIFO)'},{valor:'fila',rotulo:'Fila (FIFO)'},{valor:'vetor',rotulo:'Vetor (índices)'}],{selecionado:tipo,aoEscolher:v=>{tipo=v;itens=[];historico=[];desenhar();},rotulo:'Estrutura'});
 const acoes=criar('div',{classe:'botoes-opcoes'});area.append(acoes);
 const entrada=criar('input',{type:'text',maxlength:'8',placeholder:'valor',estilo:'display:inline-block;width:100px;margin:0 6px','aria-label':'Valor a inserir'});
 const btnInserir=criar('button',{type:'button',classe:'botao pequeno',texto:'Inserir'}),btnRemover=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Remover'}),btnBuscar=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Buscar'});
 acoes.append(entrada,btnInserir,btnRemover,btnBuscar);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 function registrar(texto){historico.push(texto);historico=historico.slice(-6);}
 function desenhar(destaque=-1){
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const n=itens.length,lb=Math.min(70,(L-60)/Math.max(1,n));
  itens.forEach((v,i)=>{let x,y;if(tipo==='pilha'){x=L/2-35;y=A-30-i*26;}else{x=30+i*lb;y=A/2-16;}c.fillStyle=i===destaque?paleta.ambar:'#1b2d36';c.strokeStyle=i===destaque?'#f1dca6':'#c9a96788';c.lineWidth=1.5;c.beginPath();c.roundRect(x,y,tipo==='pilha'?70:lb-6,tipo==='pilha'?22:32,5);c.fill();c.stroke();c.fillStyle='#e8dcc0';c.font='500 13px ui-monospace,monospace';c.textAlign='center';c.fillText(String(v),x+(tipo==='pilha'?35:(lb-6)/2),y+(tipo==='pilha'?16:21));if(tipo==='vetor'){c.fillStyle='#a9bcc2';c.font='10px Arial';c.fillText(`[${i}]`,x+(lb-6)/2,y+46);}});
  c.fillStyle='#a9bcc2';c.font='11px Arial';c.textAlign='left';
  if(tipo==='pilha'){c.fillText('topo ↑ (entra e sai por aqui)',L/2+50,A-30-(n-1)*26+14);c.fillText('base',L/2+50,A-16);}
  else if(tipo==='fila'){c.fillText('← sai (início)',30,A/2+40);c.textAlign='right';c.fillText('entra (fim) →',L-30,A/2+40);}
  else{c.fillText('acesso direto por índice: posição = base + índice × tamanho',30,A/2+60);}
  c.fillStyle='#e8dcc0';c.font='11px Arial';c.textAlign='left';historico.forEach((h,i)=>c.fillText(h,10,16+i*14));
  const textos={pilha:'Na <strong>pilha</strong>, o último a entrar é o primeiro a sair (LIFO). É assim que a linguagem controla chamadas de função e o botão “desfazer” guarda ações.',fila:'Na <strong>fila</strong>, o primeiro a entrar é o primeiro a sair (FIFO). Impressoras, pedidos e mensagens em trânsito usam filas.',vetor:'No <strong>vetor</strong>, cada elemento tem um índice e o acesso é imediato; inserir no meio exige deslocar os seguintes. Buscar sem índice percorre um a um.'};
  explicacao.definir(textos[tipo]+` Tamanho atual: ${n}.`);
  alternativo(`${tipo} com ${n} elementos: ${itens.join(', ')||'vazia'}.`);
  contexto.aoAtualizar?.({tipo,itens:[...itens],operacoes:contador});
 }
 btnInserir.onclick=()=>{const v=entrada.value.trim()||String(++contador);if(itens.length>=12){registrar('estrutura cheia (limite didático de 12)');desenhar();return;}itens.push(v);registrar(`inserir(${v})${tipo==='pilha'?' → topo':tipo==='fila'?' → fim':' → índice '+(itens.length-1)}`);entrada.value='';desenhar(itens.length-1);};
 btnRemover.onclick=()=>{if(!itens.length){registrar('remover em estrutura vazia: erro');desenhar();return;}let v;if(tipo==='fila'){v=itens.shift();registrar(`remover → ${v} (o primeiro que entrou)`);}else if(tipo==='pilha'){v=itens.pop();registrar(`remover → ${v} (o último que entrou)`);}else{v=itens.pop();registrar(`remover do fim → ${v}`);}desenhar();};
 btnBuscar.onclick=()=>{const v=entrada.value.trim();if(!v)return;let passos=0,achou=-1;for(let i=0;i<itens.length;i++){passos++;if(itens[i]===v){achou=i;break;}}registrar(achou>=0?`buscar(${v}): encontrado no índice ${achou} após ${passos} comparação(ões)`:`buscar(${v}): não encontrado após ${passos} comparações`);desenhar(achou);};
 tela.tela.addEventListener('redimensionar',()=>desenhar());
 desenhar();
 return ()=>tela.destruir();
}

export function montarPacotes(area,parametros={},contexto={}){
 const tela=criarTela(area,{largura:640,altura:300,descricao:'Rede com roteadores e pacotes em trânsito'});
 const nos=[{id:'A',x:60,y:150,nome:'seu computador'},{id:'R1',x:200,y:80,nome:'roteador 1'},{id:'R2',x:200,y:220,nome:'roteador 2'},{id:'R3',x:360,y:80,nome:'roteador 3'},{id:'R4',x:360,y:220,nome:'roteador 4'},{id:'S',x:520,y:150,nome:'servidor'}];
 const ligacoes=[['A','R1'],['A','R2'],['R1','R3'],['R2','R4'],['R1','R4'],['R2','R3'],['R3','S'],['R4','S']];
 let pacotes=[],recebidos=[],falhas=0,mensagem=parametros.mensagem||'O conhecimento ganha vida quando um saber ilumina outro',caido=null;
 const acoes=criar('div',{classe:'botoes-opcoes'});area.append(acoes);
 const btnEnviar=criar('button',{type:'button',classe:'botao pequeno',texto:'Enviar mensagem'}),btnCair=criar('button',{type:'button',classe:'botao pequeno secundario','aria-pressed':'false',texto:'Derrubar roteador 1'});
 acoes.append(btnEnviar,btnCair);
 const leitura=criar('div',{classe:'leitura'});area.append(leitura);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 const no=id=>nos.find(n=>n.id===id);
 function rota(){const cima=['A','R1','R3','S'],baixo=['A','R2','R4','S'],cruz1=['A','R1','R4','S'],cruz2=['A','R2','R3','S'];const todas=[cima,baixo,cruz1,cruz2].filter(r=>!r.includes(caido));return todas[Math.floor(Math.random()*todas.length)];}
 function enviar(){
  const partes=mensagem.match(/.{1,8}/g)||[];
  pacotes=partes.map((texto,i)=>({seq:i,texto,rota:rota(),progresso:0,velocidade:.25+Math.random()*.35,perdido:Math.random()<.12}));
  recebidos=[];falhas=0;
  if(!movimentoReduzido())anim.iniciar();else{pacotes.forEach(p=>p.progresso=p.rota.length-1);finalizar();desenhar();}
 }
 function finalizar(){pacotes.forEach(p=>{if(p.progresso>=p.rota.length-1&&!p.entregue){p.entregue=true;if(p.perdido){falhas++;p.perdido=false;p.progresso=0;p.entregue=false;p.rota=rota();p.reenviado=true;}else recebidos.push(p);}});}
 function desenhar(){
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);const k=L/640;
  ligacoes.forEach(([a,b])=>{const na=no(a),nb=no(b);c.strokeStyle=(a===caido||b===caido)?'#d47a7255':'#3f5563';c.lineWidth=2;c.setLineDash((a===caido||b===caido)?[4,4]:[]);c.beginPath();c.moveTo(na.x*k,na.y*k);c.lineTo(nb.x*k,nb.y*k);c.stroke();c.setLineDash([]);});
  nos.forEach(n=>{c.fillStyle=n.id===caido?'#5a221c':n.id==='A'||n.id==='S'?'#2b2516':'#1b2d36';c.strokeStyle=n.id===caido?'#d47a72':'#c9a967';c.lineWidth=1.5;c.beginPath();c.arc(n.x*k,n.y*k,18*k,0,7);c.fill();c.stroke();c.fillStyle='#e8dcc0';c.font='500 11px Arial';c.textAlign='center';c.fillText(n.id,n.x*k,n.y*k+4);c.fillStyle='#a9bcc2';c.font='9px Arial';c.fillText(n.nome,n.x*k,n.y*k+32*k);});
  pacotes.forEach(p=>{if(p.entregue)return;const i=Math.floor(p.progresso),t=p.progresso-i;const a=no(p.rota[i]),b=no(p.rota[Math.min(i+1,p.rota.length-1)]);const x=(a.x+(b.x-a.x)*t)*k,y=(a.y+(b.y-a.y)*t)*k;c.fillStyle=p.perdido?paleta.rubi:p.reenviado?paleta.ambar:paleta.verde;c.beginPath();c.roundRect(x-10,y-7,20,14,3);c.fill();c.fillStyle='#1b1a14';c.font='9px ui-monospace,monospace';c.textAlign='center';c.fillText(String(p.seq),x,y+3);});
  const ordenados=[...recebidos].sort((a,b)=>a.seq-b.seq);
  const completo=pacotes.length&&recebidos.length===pacotes.length;
  leitura.innerHTML=`<div><small>Pacotes</small><strong>${pacotes.length}</strong></div><div><small>Recebidos</small><strong>${recebidos.length}</strong></div><div><small>Reenviados</small><strong>${falhas}</strong></div>`;
  explicacao.definir(pacotes.length?`A mensagem foi dividida em <strong>${pacotes.length} pacotes</strong> numerados, cada um seguindo a sua rota pelos roteadores. ${recebidos.length?`Chegaram na ordem ${recebidos.map(p=>p.seq).join(', ')}; o destino os reordena pelo número de sequência.`:''} ${falhas?`${falhas} pacote(s) se perderam e foram reenviados: o protocolo confirma o recebimento e repete o que faltou.`:''} ${completo?`<br>Mensagem remontada: “${escapar(ordenados.map(p=>p.texto).join(''))}”.`:''}`:'Clique em “Enviar mensagem” para dividir o texto em pacotes e vê-los percorrer a rede. Derrube um roteador para ver as rotas mudarem.');
  alternativo(`${recebidos.length} de ${pacotes.length} pacotes recebidos, ${falhas} reenviados.`);
  contexto.aoAtualizar?.({pacotes:pacotes.length,recebidos:recebidos.length,falhas,completo,caido});
 }
 const anim=animador(delta=>{let ativo=false;pacotes.forEach(p=>{if(p.entregue)return;ativo=true;p.progresso=Math.min(p.rota.length-1,p.progresso+delta*p.velocidade*(p.rota.length-1)/2);});finalizar();desenhar();if(!ativo)anim.parar();});
 btnEnviar.onclick=enviar;
 btnCair.onclick=()=>{caido=caido?null:'R1';btnCair.setAttribute('aria-pressed',String(Boolean(caido)));btnCair.textContent=caido?'Restaurar roteador 1':'Derrubar roteador 1';desenhar();};
 tela.tela.addEventListener('redimensionar',desenhar);
 desenhar();
 return ()=>{anim.parar();tela.destruir();};
}
