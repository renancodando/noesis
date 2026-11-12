// Renan | renancodando
import {botoesOpcoes,painelExplicacao,botaoAcao,formatarNumero,criar,buscar,buscarTodos,escapar} from './base.js';

const TEXTO_CAMADAS={
 titulo:'Aviso na porta de um prédio',
 trechos:[
  {texto:'Prezados moradores,',camadas:{literal:'Saudação formal dirigida a quem mora no prédio.',inferencia:'Quem escreve não é morador: provavelmente a administração ou o síndico.',critica:'O tom formal prepara um pedido ou uma cobrança.'}},
  {texto:'informamos que, a partir de segunda-feira, a água será desligada das 9h às 15h para manutenção da caixa.',camadas:{literal:'Haverá corte de água por seis horas em um dia determinado.',inferencia:'“Manutenção da caixa” sugere limpeza ou reparo programado; não é emergência.',critica:'Não se diz qual segunda-feira nem a data de publicação: um aviso sem data pode ser lido na semana errada.'}},
  {texto:'Pedimos a compreensão de todos e lembramos que o problema foi causado pelo uso indevido das áreas comuns.',camadas:{literal:'Pede paciência e atribui a causa ao mau uso das áreas comuns.',inferencia:'Há uma acusação implícita a algum grupo de moradores, sem nomes.',critica:'A causa alegada não é explicada nem comprovada; a frase transfere responsabilidade sem informação, e pode gerar conflito.'}},
  {texto:'A administração.',camadas:{literal:'Assinatura institucional.',inferencia:'Nenhuma pessoa assina: dilui a responsabilidade pelo aviso.',critica:'Sem nome e sem contato, o morador não tem a quem pedir esclarecimentos.'}}
 ]
};
const CAMADAS=[{id:'literal',nome:'O que o texto diz',cor:'#86b4d8'},{id:'inferencia',nome:'O que se deduz',cor:'#e0a85a'},{id:'critica',nome:'O que se pode questionar',cor:'#d47a72'}];

export function montar(area,parametros={},contexto={}){
 const dados=parametros.texto||TEXTO_CAMADAS;
 let camada='literal',abertos=new Set();
 const seletor=botoesOpcoes(area,CAMADAS.map(c=>({valor:c.id,rotulo:c.nome})),{selecionado:camada,aoEscolher:v=>{camada=v;render();},rotulo:'Camada de leitura'});
 const caixa=criar('div',{classe:'texto-camadas'});area.append(caixa);
 const explicacao=painelExplicacao(area);
 function render(){
  const cor=CAMADAS.find(c=>c.id===camada).cor;
  caixa.innerHTML=`<p class="titulo-documento">${escapar(dados.titulo)}</p>`+dados.trechos.map((t,i)=>`<button type="button" class="trecho-camada" data-i="${i}" aria-expanded="${abertos.has(i+camada)}" style="--cor:${cor}">${escapar(t.texto)}</button>${abertos.has(i+camada)?`<div class="nota-camada" style="--cor:${cor}"><strong>${escapar(CAMADAS.find(c=>c.id===camada).nome)}:</strong> ${escapar(t.camadas[camada])}</div>`:''}`).join('');
  buscarTodos('.trecho-camada',caixa).forEach(b=>b.onclick=()=>{const chave=b.dataset.i+camada;abertos.has(chave)?abertos.delete(chave):abertos.add(chave);render();});
  const lidas=new Set([...abertos].map(c=>c.replace(/^\d+/,'')));
  explicacao.definir(`Clique em cada trecho para ver a leitura na camada <strong>${escapar(CAMADAS.find(c=>c.id===camada).nome.toLowerCase())}</strong>. ${lidas.size===3?'Você percorreu as três camadas: ler bem é fazer as três perguntas a cada trecho, sem pular a primeira (o que está escrito) nem parar nela.':`Camadas já visitadas: ${lidas.size} de 3.`}`);
  contexto.aoAtualizar?.({camada,abertos:abertos.size,camadasVisitadas:lidas.size});
 }
 render();
 return ()=>{};
}

const PARAGRAFO=[
 {texto:'Muita gente acredita que ler rápido é ler bem.',papel:'Apresenta a ideia que será contestada.'},
 {texto:'No entanto, velocidade e compreensão não andam juntas automaticamente.',papel:'Marca a oposição (“no entanto”) e introduz a tese.'},
 {texto:'Quem lê depressa um texto difícil costuma reter apenas a superfície.',papel:'Primeiro argumento: consequência da leitura apressada.'},
 {texto:'Além disso, a releitura, que a pressa elimina, é justamente o momento em que as ideias se conectam.',papel:'Segundo argumento, acrescentado por “além disso”.'},
 {texto:'Por isso, ler bem é ajustar a velocidade ao texto, e não maximizá-la.',papel:'Conclusão, introduzida por “por isso”.'}
];

export function montarReorganizar(area,parametros={},contexto={}){
 const frases=parametros.frases||PARAGRAFO;
 let ordem=embaralhar(frases.map((_,i)=>i));
 const lista=criar('ol',{classe:'lista-frases','aria-label':'Frases do parágrafo'});area.append(lista);
 const explicacao=painelExplicacao(area);
 botaoAcao(area,'Verificar',verificar);
 botaoAcao(area,'Embaralhar',()=>{ordem=embaralhar(frases.map((_,i)=>i));render();});
 function embaralhar(v){const a=[...v];do{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}}while(a.every((x,i)=>x===i));return a;}
 function mover(pos,delta){const j=pos+delta;if(j<0||j>=ordem.length)return;[ordem[pos],ordem[j]]=[ordem[j],ordem[pos]];render();buscar(`li:nth-child(${j+1}) .mover-${delta<0?'cima':'baixo'}`,lista)?.focus();}
 function render(){
  lista.innerHTML='';
  ordem.forEach((idx,pos)=>{const item=criar('li',{classe:'frase-movel'});item.innerHTML=`<span class="posicao-quadro">${pos+1}</span><p>${escapar(frases[idx].texto)}</p><span class="mover"><button type="button" class="botao pequeno secundario mover-cima" aria-label="Mover frase ${pos+1} para cima"${pos===0?' disabled':''}>↑</button><button type="button" class="botao pequeno secundario mover-baixo" aria-label="Mover frase ${pos+1} para baixo"${pos===ordem.length-1?' disabled':''}>↓</button></span>`;buscar('.mover-cima',item).onclick=()=>mover(pos,-1);buscar('.mover-baixo',item).onclick=()=>mover(pos,1);lista.append(item);});
  explicacao.definir('Reordene as frases até formar um parágrafo coeso. Procure as palavras que ligam uma frase à anterior (“no entanto”, “além disso”, “por isso”): elas são as pistas.');
 }
 function verificar(){
  const acertos=ordem.filter((idx,pos)=>idx===pos).length;
  if(acertos===ordem.length)explicacao.definir('<strong>Parágrafo reconstruído.</strong> '+frases.map((f,i)=>`<br>${i+1}. ${escapar(f.papel)}`).join(''));
  else explicacao.definir(`<strong>${acertos} de ${ordem.length}</strong> frases na posição esperada. Dica: a primeira frase não pode começar com conectivo de oposição ou conclusão; a última costuma concluir (“por isso”).`);
  contexto.aoAtualizar?.({acertos,total:ordem.length});
 }
 render();
 return ()=>{};
}

const CONECTIVOS={
 oposicao:{nome:'Oposição',exemplos:['mas','porém','no entanto','embora','apesar de']},
 causa:{nome:'Causa',exemplos:['porque','já que','visto que','uma vez que']},
 consequencia:{nome:'Consequência',exemplos:['portanto','por isso','logo','assim']},
 adicao:{nome:'Adição',exemplos:['além disso','também','e','ainda']},
 condicao:{nome:'Condição',exemplos:['se','caso','desde que','contanto que']},
 exemplificacao:{nome:'Exemplificação',exemplos:['por exemplo','como','isto é']}
};
const FRASES_CONECTIVOS=[
 {a:'O rio transbordou',b:'choveu três dias seguidos.',relacao:'causa'},
 {a:'A prova era difícil',b:'quase todos foram bem.',relacao:'oposicao'},
 {a:'A ponte foi interditada',b:'o trânsito foi desviado pela avenida.',relacao:'consequencia'},
 {a:'O projeto reduziu custos',b:'melhorou a qualidade do ar.',relacao:'adicao'},
 {a:'A biblioteca abrirá aos domingos',b:'houver verba para os funcionários.',relacao:'condicao'},
 {a:'Alguns alimentos fermentados fazem parte da dieta brasileira',b:'o pão de fermentação natural e a coalhada.',relacao:'exemplificacao'}
];

export function montarConectivos(area,parametros={},contexto={}){
 const frases=parametros.frases||FRASES_CONECTIVOS;
 const escolhas={};
 const caixa=criar('div',{classe:'lista-conectivos'});area.append(caixa);
 const explicacao=painelExplicacao(area);
 botaoAcao(area,'Verificar',verificar);
 function render(){
  caixa.innerHTML=frases.map((f,i)=>`<div class="frase-conectivo"><span>${escapar(f.a)}</span> <select aria-label="Conectivo para a frase ${i+1}" data-i="${i}"><option value="">…</option>${Object.entries(CONECTIVOS).map(([k,c])=>`<option value="${k}"${escolhas[i]===k?' selected':''}>${escapar(c.exemplos[0])}</option>`).join('')}</select> <span>${escapar(f.b)}</span><span class="resultado-conectivo" aria-live="polite"></span></div>`).join('');
  buscarTodos('select',caixa).forEach(s=>s.onchange=()=>{escolhas[s.dataset.i]=s.value;});
  explicacao.definir('Escolha, para cada par, o conectivo que exprime a relação lógica correta entre as duas partes. Repare que trocar o conectivo muda o sentido, não só o estilo.');
 }
 function verificar(){
  let acertos=0;
  frases.forEach((f,i)=>{const r=buscar(`.frase-conectivo:nth-child(${i+1}) .resultado-conectivo`,caixa);const ok=escolhas[i]===f.relacao;if(ok)acertos++;r.textContent=escolhas[i]?(ok?`✓ ${CONECTIVOS[f.relacao].nome.toLowerCase()}`:`✗ a relação é de ${CONECTIVOS[f.relacao].nome.toLowerCase()}`):'escolha um conectivo';r.className='resultado-conectivo '+(ok?'certo':'errado');});
  explicacao.definir(acertos===frases.length?'<strong>Todas corretas.</strong> Outros conectivos da mesma família funcionariam: '+Object.values(CONECTIVOS).map(c=>`<em>${c.nome.toLowerCase()}</em> (${c.exemplos.join(', ')})`).join('; ')+'.':`<strong>${acertos} de ${frases.length}.</strong> Para cada erro, pergunte: a segunda parte explica a primeira (causa), resulta dela (consequência), a contraria (oposição), soma a ela (adição), a condiciona (condição) ou a ilustra (exemplo)?`);
  contexto.aoAtualizar?.({acertos,total:frases.length});
 }
 render();
 return ()=>{};
}

const PARTES_ARGUMENTO=[
 {id:'tese',nome:'Tese',descricao:'A posição que você defende, em uma frase afirmativa.',minimo:6},
 {id:'razao',nome:'Razão',descricao:'Por que a tese é verdadeira ou desejável.',minimo:8},
 {id:'evidencia',nome:'Evidência',descricao:'Fato, dado, exemplo ou fonte que sustenta a razão.',minimo:8},
 {id:'objecao',nome:'Objeção',descricao:'A melhor crítica que alguém faria à sua tese.',minimo:8},
 {id:'resposta',nome:'Resposta à objeção',descricao:'Por que a objeção não derruba a tese (ou o que você concede).',minimo:8},
 {id:'conclusao',nome:'Conclusão',descricao:'Retome a tese com o que foi ganho no caminho.',minimo:6}
];

export function montarArgumento(area,parametros={},contexto={}){
 const guardado=parametros.estadoInicial||{};
 const formulario=criar('div',{classe:'construtor-argumento'});area.append(formulario);
 formulario.innerHTML=`<p class="instrucao-argumento">${escapar(parametros.tema||'Escolha um tema que você defende de verdade e construa o argumento parte a parte.')}</p>`+PARTES_ARGUMENTO.map(p=>`<label class="parte-argumento"><span><strong>${p.nome}</strong> <small>${escapar(p.descricao)}</small></span><textarea rows="2" data-parte="${p.id}" aria-label="${p.nome}">${escapar(guardado[p.id]||'')}</textarea></label>`).join('');
 const previa=criar('div',{classe:'previa-argumento'});area.append(previa);
 const explicacao=painelExplicacao(area);
 botaoAcao(area,'Montar parágrafo',montarParagrafo,{secundario:false});
 botaoAcao(area,'Limpar',()=>{buscarTodos('textarea',formulario).forEach(t=>t.value='');previa.innerHTML='';atualizar();});
 const conectores={evidencia:'De fato,',objecao:'Pode-se objetar que',resposta:'Contudo,',conclusao:'Por isso,'};
 const limpar=t=>t.replace(/[.。]+$/,'').trim();
 const minuscula=t=>t.charAt(0).toLowerCase()+t.slice(1);
 function valores(){const v={};buscarTodos('textarea',formulario).forEach(t=>v[t.dataset.parte]=t.value.trim());return v;}
 function contar(s){return s?s.split(/\s+/).filter(Boolean).length:0;}
 function atualizar(){
  const v=valores();
  const prontas=PARTES_ARGUMENTO.filter(p=>contar(v[p.id])>=p.minimo);
  const faltando=PARTES_ARGUMENTO.filter(p=>contar(v[p.id])<p.minimo).map(p=>p.nome.toLowerCase());
  const temPorque=/porque|pois|já que|uma vez que|visto que/i.test(v.razao||'');
  const temConcreto=/\d|por exemplo|segundo|conforme|caso|quando/i.test(v.evidencia||'');
  explicacao.definir(`<strong>${prontas.length} de ${PARTES_ARGUMENTO.length}</strong> partes com conteúdo suficiente${faltando.length?` (faltam: ${faltando.join(', ')})`:''}. ${v.razao&&!temPorque?'A razão costuma soar como resposta a “por quê?”: experimente começar com “porque”. ':''}${v.evidencia&&!temConcreto?'A evidência ganha força com algo concreto: um número, um caso, uma fonte. ':''}${v.objecao&&v.objecao.length<40?'Objeções curtas tendem a ser fracas; formule a melhor crítica, não a mais fácil. ':''}`);
  contexto.aoAtualizar?.({partes:prontas.length,total:PARTES_ARGUMENTO.length,valores:v});
 }
 function montarParagrafo(){
  const v=valores();
  const frases=[];
  if(v.tese){let base=limpar(v.tese);if(v.razao){const r=limpar(v.razao);base+=/^(porque|pois|já que|uma vez que|visto que)\b/i.test(r)?`, ${minuscula(r)}`:`, porque ${minuscula(r)}`;}frases.push(base+'.');}
  else if(v.razao)frases.push(limpar(v.razao)+'.');
  ['evidencia','objecao','resposta','conclusao'].forEach(chave=>{if(!v[chave])return;const t=limpar(v[chave]);const c=conectores[chave];const inicio=/^(pode-se objetar|alguns|há quem|contudo|porém|no entanto|por isso|portanto|de fato|segundo|conforme|de acordo)/i.test(t);frases.push((inicio?t:`${c} ${minuscula(t)}`)+'.');});
  previa.innerHTML=frases.length?`<h4>Parágrafo montado</h4><p>${escapar(frases.join(' '))}</p><p class="nota-modelo">As ligações foram inseridas automaticamente; reescreva o parágrafo com suas próprias palavras antes de usá-lo.</p>`:'<p class="mensagem alerta">Preencha ao menos a tese e uma razão.</p>';
  atualizar();
 }
 buscarTodos('textarea',formulario).forEach(t=>t.addEventListener('input',atualizar));
 atualizar();
 return ()=>{};
}

const FUNCOES_OFICINA={
 narrar:{nome:'Narrar',dica:'Conte um acontecimento em ordem, com quem, onde, quando e o que mudou.',verificar:t=>({criterios:[['Tem marcadores de tempo (então, depois, quando, enquanto, no dia seguinte)',/então|depois|quando|enquanto|no dia seguinte|antes|logo|de repente/i.test(t)],['Tem verbos no passado',/\b\w+(ou|eu|iu|ava|ia|aram|eram|iram|avam|iam)\b/i.test(t)],['Tem pelo menos uma personagem nomeada ou identificada',/\b[A-ZÁÉÍÓÚÂÊÔÃÕ][a-záéíóúâêôãõç]+\b/.test(t.replace(/^\s*\S+/,''))||/ele|ela|menino|menina|mulher|homem|professora|professor|avó|avô/i.test(t)]]})},
 descrever:{nome:'Descrever',dica:'Faça o leitor ver, ouvir, sentir: detalhes concretos, sem contar o que aconteceu.',verificar:t=>({criterios:[['Usa adjetivos ou comparações',/\bcomo\b|\bparec|\bmais\b.*\bque\b|oso|osa|ado|ada|ente\b/i.test(t)],['Menciona ao menos dois sentidos (cor, som, cheiro, textura, temperatura)',[/cor|verde|azul|vermelh|amarel|branc|pret|cinz|dourad|escur|clar/i,/som|ruído|barulho|silêncio|sussurr|grit|música|zumb/i,/cheir|odor|perfum|aroma/i,/áspero|liso|macio|frio|quente|úmido|seco|gelad|morno/i].filter(r=>r.test(t)).length>=2],['Evita contar ação (poucos “então/depois”)',(t.match(/então|depois|em seguida/gi)||[]).length<=1]]})},
 instruir:{nome:'Instruir',dica:'Diga ao leitor o que fazer, passo a passo, em ordem e com verbos de comando.',verificar:t=>({criterios:[['Tem verbos no imperativo ou infinitivo no início de frases',/(^|[.!?]\s+)(misture|adicione|coloque|abra|clique|ligue|corte|aqueça|espere|retire|pressione|escolha|leve|deixe|mexa|misturar|adicionar|colocar|abrir|clicar|ligar|cortar|aquecer|esperar|retirar|pressionar|escolher|levar|deixar|mexer)/im.test(t)],['Tem sequência numerada ou marcadores de ordem',/\b(primeiro|segundo|terceiro|em seguida|depois|por fim|finalmente)\b|^\s*\d+[.)]/im.test(t)],['Tem pelo menos três passos',(t.match(/[.!?](\s|$)|\n/g)||[]).length>=3]]})},
 argumentar:{nome:'Argumentar',dica:'Defenda uma posição com razões e antecipe uma objeção.',verificar:t=>({criterios:[['Tem uma tese clara (defendo, acredito, é preciso, deve)',/defend|acredit|é preciso|deve|dever|é necessário|é melhor|sou a favor|sou contra/i.test(t)],['Tem conectivo de causa ou consequência',/porque|pois|já que|portanto|por isso|logo|assim/i.test(t)],['Antecipa uma objeção',/embora|mesmo que|ainda que|pode-se objetar|alguns dizem|dirão que|no entanto|porém|mas/i.test(t)]]})}
};

export function montarOficina(area,parametros={},contexto={}){
 let funcao=parametros.funcao||'narrar';
 const seletor=botoesOpcoes(area,Object.entries(FUNCOES_OFICINA).map(([k,f])=>({valor:k,rotulo:f.nome})),{selecionado:funcao,aoEscolher:v=>{funcao=v;dica.textContent=FUNCOES_OFICINA[v].dica;avaliar();},rotulo:'Função do texto'});
 const dica=criar('p',{classe:'dica-oficina',texto:FUNCOES_OFICINA[funcao].dica});area.append(dica);
 const tema=criar('p',{classe:'tema-oficina',html:`<strong>Tema:</strong> ${escapar(parametros.tema||'uma manhã de chuva na sua rua')}`});area.append(tema);
 const caixa=criar('textarea',{classe:'caixa-oficina',rows:'7','aria-label':'Seu texto',placeholder:'Escreva aqui. Entre 60 e 200 palavras.'});area.append(caixa);
 const painel=criar('div',{classe:'painel-oficina'});area.append(painel);
 const explicacao=painelExplicacao(area);
 function avaliar(){
  const t=caixa.value;const palavras=t.split(/\s+/).filter(Boolean).length;
  const frases=t.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);
  const media=frases.length?palavras/frases.length:0;
  const repetidas=Object.entries(t.toLowerCase().match(/\b[a-záéíóúâêôãõç]{5,}\b/g)?.reduce((m,p)=>(m[p]=(m[p]||0)+1,m),{})||{}).filter(([,n])=>n>=3).map(([p])=>p);
  const {criterios}=FUNCOES_OFICINA[funcao].verificar(t);
  painel.innerHTML=`<div class="leitura"><div><small>Palavras</small><strong>${palavras}</strong></div><div><small>Frases</small><strong>${frases.length}</strong></div><div><small>Palavras por frase</small><strong>${formatarNumero(media,1)}</strong></div></div><ul class="criterios-oficina">${criterios.map(([nome,ok])=>`<li class="${ok?'ok':''}">${ok?'✓':'○'} ${escapar(nome)}</li>`).join('')}</ul>`;
  const avisos=[];
  if(palavras&&palavras<60)avisos.push('Ainda curto: desenvolva até pelo menos 60 palavras.');
  if(palavras>200)avisos.push('Passou de 200 palavras: corte o que não serve à função.');
  if(media>30)avisos.push('Frases muito longas em média; experimente dividir algumas.');
  if(repetidas.length)avisos.push(`Palavras repetidas três vezes ou mais: ${repetidas.slice(0,4).join(', ')}. Avalie sinônimos ou retomadas por pronome.`);
  const atendidos=criterios.filter(([,ok])=>ok).length;
  explicacao.definir(`<strong>${atendidos} de ${criterios.length}</strong> marcas da função “${FUNCOES_OFICINA[funcao].nome.toLowerCase()}” detectadas. ${avisos.join(' ')} ${atendidos===criterios.length&&palavras>=60&&palavras<=200?'O texto apresenta as marcas esperadas; agora releia em voz alta e corte uma palavra de cada frase.':''} As verificações são automáticas e superficiais: servem para você reler com critério, não para julgar o texto.`);
  contexto.aoAtualizar?.({funcao,palavras,atendidos,total:criterios.length});
 }
 caixa.addEventListener('input',avaliar);
 avaliar();
 return ()=>{};
}
