// Renan | renancodando
import {criar,escapar,buscar,buscarTodos,icone} from '../utilitarios/dom.js';
import {normalizar,compararNumeros,formatarNumero} from '../utilitarios/texto.js';

const TIPOS={};
export function registrarTipo(nome,definicao){TIPOS[nome]=definicao;}
export const rotulosTipos={'multipla-escolha':'Múltipla escolha','verdadeiro-falso':'Verdadeiro ou falso',numerica:'Resposta numérica',lacunas:'Preencher lacunas',ordenacao:'Ordenar etapas',associacao:'Associar conceitos',grafico:'Construir gráfico',interpretacao:'Interpretar documento','identificar-erro':'Identificar o erro','programacao-visual':'Programação visual',problema:'Resolver problema','resposta-aberta':'Resposta construída'};

function embaralhar(lista,semente){
 const copia=[...lista];let estado=semente;
 for(let i=copia.length-1;i>0;i--){estado=(estado*9301+49297)%233280;const j=Math.floor(estado/233280*(i+1));[copia[i],copia[j]]=[copia[j],copia[i]];}
 return copia;
}
function sementeDe(texto){let h=7;for(const c of String(texto))h=(h*31+c.charCodeAt(0))%1000003;return h;}
function textoCorresponde(resposta,aceitas){
 const dada=normalizar(resposta).replace(/\s+/g,' ');
 return [aceitas].flat().some(aceita=>normalizar(aceita).replace(/\s+/g,' ')===dada);
}

export function montarExercicio(raiz,exercicio,contexto={}){
 const definicao=TIPOS[exercicio.tipo];
 const numero=contexto.numero||1;
 const identificador=exercicio.id||`exercicio-${numero}`;
 const artigo=criar('article',{classe:'exercicio',id:identificador,dados:{tipo:exercicio.tipo}});
 const conceitoNome=contexto.nomeConceito?.(exercicio.conceito)||exercicio.conceito;
 artigo.innerHTML=`<header class="cabecalho-exercicio"><span class="numero-exercicio">${numero}</span><div><p class="tipo-exercicio">${rotulosTipos[exercicio.tipo]||exercicio.tipo}${conceitoNome?` · <a href="#conceito-${escapar(exercicio.conceito)}" class="conceito-exercicio">${escapar(conceitoNome)}</a>`:''}</p><div class="enunciado">${exercicio.enunciado||''}</div></div><span class="situacao-exercicio" aria-live="polite"></span></header><div class="corpo-exercicio"></div><div class="feedback" role="status" hidden></div><div class="dicas" hidden></div><div class="acoes-exercicio"><button class="botao verificar" type="button">Verificar</button><button class="botao secundario dica" type="button" ${exercicio.dicas?.length?'':'hidden'}>${icone('lampada')} Dica</button><button class="botao secundario tentar" type="button" hidden>Tentar novamente</button><button class="botao secundario revelar" type="button" hidden>Ver resolução</button></div>`;
 raiz.append(artigo);
 if(!definicao){buscar('.corpo-exercicio',artigo).innerHTML='<p class="mensagem alerta">Este formato de exercício ainda não está disponível.</p>';buscar('.acoes-exercicio',artigo).hidden=true;return null;}
 const corpo=buscar('.corpo-exercicio',artigo),feedback=buscar('.feedback',artigo),dicas=buscar('.dicas',artigo),situacao=buscar('.situacao-exercicio',artigo);
 const botaoVerificar=buscar('.verificar',artigo),botaoDica=buscar('.dica',artigo),botaoTentar=buscar('.tentar',artigo),botaoRevelar=buscar('.revelar',artigo);
 const semente=sementeDe(contexto.aula?.id+identificador);
 const instancia=definicao.montar(corpo,exercicio,{semente,embaralhar:lista=>embaralhar(lista,semente)});
 let tentativa=0,dicasVistas=0,resolvido=false,inicio=Date.now();
 const estadoInicial=contexto.estadoInicial;
 if(estadoInicial?.correta){
  resolvido=true;
  artigo.classList.add('resolvido');
  situacao.textContent='Resolvido';
  if(instancia.restaurar&&estadoInicial.resposta)try{instancia.restaurar(JSON.parse(estadoInicial.resposta))}catch{}
  instancia.desativar?.();
  botaoVerificar.hidden=true;botaoDica.hidden=true;
  botaoRevelar.hidden=false;botaoRevelar.textContent='Rever a explicação';
 }
 function mostrarFeedback(classe,titulo,texto){
  feedback.className='feedback '+classe;
  feedback.innerHTML=`<strong>${escapar(titulo)}</strong>${texto?`<div>${texto}</div>`:''}`;
  feedback.hidden=false;
 }
 botaoDica.onclick=()=>{
  if(dicasVistas>=exercicio.dicas.length)return;
  const item=criar('p',{classe:'dica-item',html:`<span>Dica ${dicasVistas+1}</span>${exercicio.dicas[dicasVistas]}`});
  dicas.hidden=false;dicas.append(item);
  dicasVistas++;
  if(dicasVistas>=exercicio.dicas.length){botaoDica.disabled=true;botaoDica.textContent='Todas as dicas vistas';}
 };
 botaoVerificar.onclick=()=>{
  const resultado=instancia.verificar();
  if(resultado.incompleta){mostrarFeedback('alerta','Resposta incompleta',resultado.mensagem||'Preencha sua resposta antes de verificar.');return;}
  tentativa++;
  const correta=Boolean(resultado.correta);
  contexto.aoResponder?.({correta,resposta:resultado.resposta,tentativa,usouDica:dicasVistas>0,tempo:Math.round((Date.now()-inicio)/1000),parcial:resultado.parcial});
  if(correta){
   resolvido=true;
   artigo.classList.add('resolvido');artigo.classList.remove('errado');
   situacao.textContent='Resolvido';
   mostrarFeedback('sucesso',tentativa===1?'Correto.':'Correto, depois de insistir.',(exercicio.feedback?.correta||'')+(exercicio.explicacao?`<p class="explicacao">${exercicio.explicacao}</p>`:''));
   instancia.desativar?.();
   botaoVerificar.hidden=true;botaoDica.hidden=true;botaoTentar.hidden=true;botaoRevelar.hidden=true;
   artigo.dispatchEvent(new CustomEvent('exercicio:resolvido',{bubbles:true,detail:{id:identificador,tentativa}}));
  }else{
   artigo.classList.add('errado');
   situacao.textContent=`Tentativa ${tentativa}`;
   const especifico=resultado.feedback||exercicio.feedback?.incorreta||'Reveja o conceito e tente de novo.';
   mostrarFeedback('erro',resultado.parcial?'Quase lá.':'Ainda não.',especifico+(resultado.detalhe?`<p>${resultado.detalhe}</p>`:'')+(exercicio.dicas?.length&&dicasVistas<exercicio.dicas.length?'<p class="sugestao-dica">Se quiser, peça uma dica antes da próxima tentativa.</p>':''));
   botaoVerificar.hidden=true;botaoTentar.hidden=false;
   if(tentativa>=3)botaoRevelar.hidden=false;
   botaoTentar.focus();
  }
 };
 botaoTentar.onclick=()=>{
  artigo.classList.remove('errado');
  feedback.hidden=true;
  botaoTentar.hidden=true;botaoVerificar.hidden=false;
  instancia.reiniciar?.();
  inicio=Date.now();
 };
 botaoRevelar.onclick=()=>{
  instancia.revelar?.();
  mostrarFeedback('neutra','Resolução',(exercicio.resolucao||exercicio.explicacao||instancia.resolucao?.()||'')+(resolvido?'':'<p class="sugestao-dica">Este exercício fica registrado como não resolvido por você. Ele voltará nas revisões.</p>'));
  if(!resolvido){
   contexto.aoResponder?.({correta:false,resposta:'revelado',tentativa:tentativa+1,usouDica:true,revelado:true,tempo:Math.round((Date.now()-inicio)/1000)});
   situacao.textContent='Resolução vista';
   artigo.classList.add('revelado');
   botaoVerificar.hidden=true;botaoTentar.hidden=true;botaoDica.hidden=true;
   instancia.desativar?.();
  }
  botaoRevelar.hidden=true;
 };
 corpo.addEventListener('keydown',evento=>{if(evento.key==='Enter'&&evento.target.matches('input:not([type=checkbox]):not([type=radio])')&&!botaoVerificar.hidden){evento.preventDefault();botaoVerificar.click();}});
 return {artigo,resolvido:()=>resolvido};
}

registrarTipo('multipla-escolha',{
 montar(corpo,exercicio,{embaralhar}){
  const ordem=exercicio.manterOrdem?exercicio.opcoes.map((_,i)=>i):embaralhar(exercicio.opcoes.map((_,i)=>i));
  const nome='opcao-'+Math.random().toString(36).slice(2,8);
  corpo.innerHTML=`<div class="opcoes" role="radiogroup">${ordem.map(indice=>`<label class="opcao"><input type="radio" name="${nome}" value="${indice}"><span>${exercicio.opcoes[indice]}</span></label>`).join('')}</div>`;
  const entradas=buscarTodos('input',corpo);
  return {
   verificar(){
    const marcada=entradas.find(entrada=>entrada.checked);
    if(!marcada)return {incompleta:true,mensagem:'Escolha uma alternativa.'};
    const indice=Number(marcada.value);
    const correta=indice===exercicio.correta;
    marcada.closest('.opcao').classList.add(correta?'certa':'errada');
    return {correta,resposta:indice,feedback:exercicio.feedback?.porOpcao?.[indice]};
   },
   reiniciar(){entradas.forEach(entrada=>{entrada.checked=false;entrada.closest('.opcao').classList.remove('errada')});},
   revelar(){entradas.forEach(entrada=>entrada.closest('.opcao').classList.toggle('certa',Number(entrada.value)===exercicio.correta));},
   restaurar(valor){const entrada=entradas.find(e=>Number(e.value)===Number(valor));if(entrada){entrada.checked=true;entrada.closest('.opcao').classList.add('certa');}},
   desativar(){entradas.forEach(entrada=>entrada.disabled=true);}
  };
 }
});

registrarTipo('verdadeiro-falso',{
 montar(corpo,exercicio){
  corpo.innerHTML=`<div class="afirmacoes">${exercicio.afirmacoes.map((item,i)=>`<fieldset class="afirmacao"><legend>${item.texto}</legend><label><input type="radio" name="vf-${i}-${exercicio.id||''}" value="true">Verdadeiro</label><label><input type="radio" name="vf-${i}-${exercicio.id||''}" value="false">Falso</label><p class="explicacao-afirmacao" hidden>${item.explicacao||''}</p></fieldset>`).join('')}</div>`;
  const grupos=buscarTodos('.afirmacao',corpo);
  return {
   verificar(){
    const respostas=grupos.map(grupo=>buscar('input:checked',grupo)?.value);
    if(respostas.some(valor=>valor===undefined))return {incompleta:true,mensagem:'Classifique todas as afirmações.'};
    let acertos=0;
    grupos.forEach((grupo,i)=>{const certa=(respostas[i]==='true')===exercicio.afirmacoes[i].valor;grupo.classList.toggle('certa',certa);grupo.classList.toggle('errada',!certa);buscar('.explicacao-afirmacao',grupo).hidden=certa;if(certa)acertos++;});
    const correta=acertos===grupos.length;
    return {correta,resposta:respostas,parcial:!correta&&acertos>0,feedback:correta?'':`Você acertou ${acertos} de ${grupos.length}. As afirmações destacadas merecem outra leitura.`};
   },
   reiniciar(){grupos.forEach(grupo=>{grupo.classList.remove('errada');buscarTodos('input',grupo).forEach(e=>{if(grupo.classList.contains('certa'))return;e.checked=false});});},
   revelar(){grupos.forEach((grupo,i)=>{buscarTodos('input',grupo).forEach(e=>e.checked=(e.value==='true')===exercicio.afirmacoes[i].valor);buscar('.explicacao-afirmacao',grupo).hidden=false;grupo.classList.add('certa');grupo.classList.remove('errada');});},
   restaurar(valores){if(Array.isArray(valores))grupos.forEach((grupo,i)=>{const e=buscar(`input[value="${valores[i]}"]`,grupo);if(e)e.checked=true;grupo.classList.add('certa');});},
   desativar(){buscarTodos('input',corpo).forEach(e=>e.disabled=true);}
  };
 }
});

registrarTipo('numerica',{
 montar(corpo,exercicio){
  corpo.innerHTML=`<div class="resposta-numerica"><label>${exercicio.rotulo||'Sua resposta'}<span class="campo-unidade"><input type="text" inputmode="decimal" autocomplete="off" placeholder="${exercicio.exemplo||'0'}">${exercicio.unidade?`<span class="unidade">${exercicio.unidade}</span>`:''}</span></label></div>`;
  const entrada=buscar('input',corpo);
  return {
   verificar(){
    const bruto=entrada.value.trim();
    if(!bruto)return {incompleta:true,mensagem:'Digite um valor numérico.'};
    const valor=Number(bruto.replace(',','.'));
    if(!Number.isFinite(valor))return {incompleta:true,mensagem:'Use apenas números, com vírgula ou ponto para decimais.'};
    const correta=compararNumeros(valor,exercicio.resposta,exercicio.tolerancia||0);
    entrada.classList.toggle('errada',!correta);
    let feedback='';
    if(!correta&&exercicio.feedback?.faixas){
     const faixa=exercicio.feedback.faixas.find(f=>(f.min===undefined||valor>=f.min)&&(f.max===undefined||valor<=f.max));
     if(faixa)feedback=faixa.texto;
    }
    if(!correta&&!feedback){
     const razao=exercicio.resposta?valor/exercicio.resposta:0;
     if(Math.abs(razao-10)<.01||Math.abs(razao-.1)<.001)feedback='O valor está deslocado por um fator de 10. Confira as unidades e as casas decimais.';
     else if(exercicio.resposta&&Math.abs(valor+exercicio.resposta)<1e-9)feedback='O módulo está certo, mas o sinal está trocado. Pense na direção ou no sentido da grandeza.';
    }
    return {correta,resposta:valor,feedback};
   },
   reiniciar(){entrada.classList.remove('errada');entrada.select();},
   revelar(){entrada.value=String(exercicio.resposta).replace('.',',');entrada.classList.remove('errada');},
   restaurar(valor){entrada.value=String(valor).replace('.',',');},
   resolucao(){return `A resposta esperada é <strong>${formatarNumero(exercicio.resposta,exercicio.casas??2)}${exercicio.unidade?' '+exercicio.unidade:''}</strong>.`;},
   desativar(){entrada.disabled=true;}
  };
 }
});

registrarTipo('lacunas',{
 montar(corpo,exercicio){
  const chaves=[];
  const html=exercicio.texto.replace(/\{\{(\w+)\}\}/g,(_,chave)=>{chaves.push(chave);const opcoes=exercicio.opcoes?.[chave];return opcoes?`<select data-lacuna="${chave}" aria-label="Lacuna ${chaves.length}"><option value="">…</option>${opcoes.map(o=>`<option>${escapar(o)}</option>`).join('')}</select>`:`<input data-lacuna="${chave}" type="text" autocomplete="off" aria-label="Lacuna ${chaves.length}" size="${Math.max(6,String([exercicio.lacunas[chave]].flat()[0]).length+2)}">`;});
  corpo.innerHTML=`<p class="texto-lacunas">${html}</p>${exercicio.banco?`<p class="banco-palavras">Palavras possíveis: ${exercicio.banco.map(p=>`<span>${escapar(p)}</span>`).join('')}</p>`:''}`;
  const campos=buscarTodos('[data-lacuna]',corpo);
  return {
   verificar(){
    if(campos.some(campo=>!campo.value.trim()))return {incompleta:true,mensagem:'Preencha todas as lacunas.'};
    let acertos=0;
    campos.forEach(campo=>{const certa=textoCorresponde(campo.value,exercicio.lacunas[campo.dataset.lacuna]);campo.classList.toggle('certa',certa);campo.classList.toggle('errada',!certa);if(certa)acertos++;});
    const correta=acertos===campos.length;
    return {correta,resposta:campos.map(c=>c.value),parcial:!correta&&acertos>0,feedback:correta?'':`${acertos} de ${campos.length} lacunas corretas. As destacadas precisam de outra palavra.`};
   },
   reiniciar(){campos.forEach(campo=>campo.classList.remove('errada'));},
   revelar(){campos.forEach(campo=>{campo.value=[exercicio.lacunas[campo.dataset.lacuna]].flat()[0];campo.classList.add('certa');campo.classList.remove('errada');});},
   restaurar(valores){if(Array.isArray(valores))campos.forEach((campo,i)=>{campo.value=valores[i]??'';campo.classList.add('certa');});},
   desativar(){campos.forEach(campo=>campo.disabled=true);}
  };
 }
});

function montarListaOrdenavel(corpo,itens,ordemInicial,rotulo){
 const lista=criar('ol',{classe:'lista-ordenavel',role:'list','aria-label':rotulo});
 let ordem=[...ordemInicial];
 function desenhar(){
  lista.replaceChildren(...ordem.map((indice,posicao)=>criar('li',{classe:'item-ordenavel',draggable:'true',dados:{indice:String(indice)},html:`<span class="alca" aria-hidden="true">⋮⋮</span><span class="posicao">${posicao+1}</span><span class="texto-item">${itens[indice]}</span><span class="mover"><button type="button" class="botao pequeno secundario" data-mover="-1" aria-label="Mover para cima">↑</button><button type="button" class="botao pequeno secundario" data-mover="1" aria-label="Mover para baixo">↓</button></span>`})));
  buscarTodos('[data-mover]',lista).forEach(botao=>botao.onclick=()=>{const li=botao.closest('li'),posicao=[...lista.children].indexOf(li),nova=posicao+Number(botao.dataset.mover);if(nova<0||nova>=ordem.length)return;[ordem[posicao],ordem[nova]]=[ordem[nova],ordem[posicao]];desenhar();buscar(`li:nth-child(${nova+1}) [data-mover="${botao.dataset.mover}"]`,lista)?.focus();});
 }
 let arrastado=null;
 lista.addEventListener('dragstart',e=>{arrastado=e.target.closest('li');e.dataTransfer.effectAllowed='move';arrastado?.classList.add('arrastando');});
 lista.addEventListener('dragover',e=>{e.preventDefault();const alvo=e.target.closest('li');if(!alvo||alvo===arrastado)return;const caixa=alvo.getBoundingClientRect();const depois=e.clientY>caixa.top+caixa.height/2;lista.insertBefore(arrastado,depois?alvo.nextSibling:alvo);});
 lista.addEventListener('drop',e=>e.preventDefault());
 lista.addEventListener('dragend',()=>{arrastado?.classList.remove('arrastando');ordem=[...lista.children].map(li=>Number(li.dataset.indice));desenhar();});
 desenhar();
 corpo.append(lista);
 return {lista,obterOrdem:()=>ordem,definirOrdem(nova){ordem=[...nova];desenhar();},marcar(correcoes){[...lista.children].forEach((li,i)=>{li.classList.toggle('certa',correcoes[i]);li.classList.toggle('errada',!correcoes[i]);});},limpar(){[...lista.children].forEach(li=>li.classList.remove('errada'));},desativar(){lista.classList.add('desativada');buscarTodos('button',lista).forEach(b=>b.disabled=true);buscarTodos('li',lista).forEach(li=>li.draggable=false);}};
}

registrarTipo('ordenacao',{
 montar(corpo,exercicio,{embaralhar}){
  const correta=exercicio.ordem||exercicio.itens.map((_,i)=>i);
  let inicial=embaralhar(exercicio.itens.map((_,i)=>i));
  if(inicial.every((v,i)=>v===correta[i]))inicial=[...inicial.slice(1),inicial[0]];
  const controle=montarListaOrdenavel(corpo,exercicio.itens,inicial,'Itens para ordenar');
  return {
   verificar(){
    const ordem=controle.obterOrdem();
    const marcas=ordem.map((indice,posicao)=>indice===correta[posicao]);
    controle.marcar(marcas);
    const acertos=marcas.filter(Boolean).length;
    const corretaTudo=acertos===ordem.length;
    return {correta:corretaTudo,resposta:ordem,parcial:!corretaTudo&&acertos>=ordem.length/2,feedback:corretaTudo?'':`${acertos} de ${ordem.length} posições corretas. Observe quais itens dependem de outros para acontecer.`};
   },
   reiniciar(){controle.limpar();},
   revelar(){controle.definirOrdem(correta);controle.marcar(correta.map(()=>true));},
   restaurar(ordem){if(Array.isArray(ordem)){controle.definirOrdem(ordem);controle.marcar(ordem.map(()=>true));}},
   desativar(){controle.desativar();}
  };
 }
});

registrarTipo('associacao',{
 montar(corpo,exercicio,{embaralhar}){
  const direitos=embaralhar(exercicio.pares.map((_,i)=>i));
  corpo.innerHTML=`<div class="associacao">${exercicio.pares.map((par,i)=>`<div class="par"><span class="lado-esquerdo">${par[0]}</span><select aria-label="Correspondência para: ${escapar(par[0].replace(/<[^>]+>/g,''))}"><option value="">Escolha…</option>${direitos.map(j=>`<option value="${j}">${escapar(exercicio.pares[j][1].replace(/<[^>]+>/g,''))}</option>`).join('')}</select></div>`).join('')}</div>`;
  const seletores=buscarTodos('select',corpo);
  return {
   verificar(){
    if(seletores.some(s=>!s.value))return {incompleta:true,mensagem:'Associe todos os itens.'};
    let acertos=0;
    seletores.forEach((s,i)=>{const certa=Number(s.value)===i;s.closest('.par').classList.toggle('certa',certa);s.closest('.par').classList.toggle('errada',!certa);if(certa)acertos++;});
    const correta=acertos===seletores.length;
    const repetidos=new Set(seletores.map(s=>s.value)).size<seletores.length;
    return {correta,resposta:seletores.map(s=>Number(s.value)),parcial:!correta&&acertos>0,feedback:correta?'':repetidos?'Um mesmo item foi usado mais de uma vez. Cada correspondência é única.':`${acertos} de ${seletores.length} associações corretas.`};
   },
   reiniciar(){seletores.forEach(s=>s.closest('.par').classList.remove('errada'));},
   revelar(){seletores.forEach((s,i)=>{s.value=String(i);s.closest('.par').classList.add('certa');s.closest('.par').classList.remove('errada');});},
   restaurar(valores){if(Array.isArray(valores))seletores.forEach((s,i)=>{s.value=String(valores[i]);s.closest('.par').classList.add('certa');});},
   desativar(){seletores.forEach(s=>s.disabled=true);}
  };
 }
});

registrarTipo('identificar-erro',{
 montar(corpo,exercicio){
  corpo.innerHTML=`<p class="instrucao-exercicio">${exercicio.instrucao||'Selecione a linha ou o trecho que contém o erro.'}</p><ol class="linhas-erro">${exercicio.linhas.map((linha,i)=>`<li><button type="button" class="linha-opcao" data-linha="${i}" aria-pressed="false"><span class="numero-linha">${i+1}</span><code>${escapar(linha)}</code></button></li>`).join('')}</ol>`;
  const botoes=buscarTodos('.linha-opcao',corpo);let escolhida=null;
  botoes.forEach(botao=>botao.onclick=()=>{escolhida=Number(botao.dataset.linha);botoes.forEach(b=>b.setAttribute('aria-pressed',String(b===botao)));});
  return {
   verificar(){
    if(escolhida===null)return {incompleta:true,mensagem:'Selecione uma linha.'};
    const correta=escolhida===exercicio.erro;
    botoes[escolhida].classList.add(correta?'certa':'errada');
    return {correta,resposta:escolhida,feedback:correta?'':exercicio.feedback?.porLinha?.[escolhida]||'Essa linha está correta. Procure o trecho em que a regra foi violada.'};
   },
   reiniciar(){botoes.forEach(b=>{b.classList.remove('errada');b.setAttribute('aria-pressed','false');});escolhida=null;},
   revelar(){botoes[exercicio.erro].classList.add('certa');},
   restaurar(valor){botoes[Number(valor)]?.classList.add('certa');},
   desativar(){botoes.forEach(b=>b.disabled=true);}
  };
 }
});

registrarTipo('programacao-visual',{
 montar(corpo,exercicio,{embaralhar}){
  const correta=exercicio.ordem||exercicio.blocos.map((_,i)=>i);
  let inicial=embaralhar(exercicio.blocos.map((_,i)=>i));
  if(inicial.every((v,i)=>v===correta[i]))inicial=[...inicial.slice(1),inicial[0]];
  corpo.innerHTML=`<p class="instrucao-exercicio">${exercicio.instrucao||'Organize os blocos para que o algoritmo produza o resultado esperado.'}</p>${exercicio.saidaEsperada?`<p class="saida-esperada">Resultado esperado: <code>${escapar(exercicio.saidaEsperada)}</code></p>`:''}`;
  const controle=montarListaOrdenavel(corpo,exercicio.blocos.map(b=>`<code class="bloco-codigo">${escapar(b)}</code>`),inicial,'Blocos do algoritmo');
  const saida=criar('p',{classe:'saida-algoritmo',hidden:true});corpo.append(saida);
  return {
   verificar(){
    const ordem=controle.obterOrdem();
    const marcas=ordem.map((indice,posicao)=>indice===correta[posicao]);
    const certa=marcas.every(Boolean);
    controle.marcar(marcas);
    if(exercicio.saidas){const chave=ordem.join(',');const texto=exercicio.saidas[chave]||exercicio.saidaErrada||'O programa não produz o resultado esperado nesta ordem.';saida.hidden=false;saida.innerHTML=`Resultado desta ordem: <code>${escapar(certa?exercicio.saidaEsperada||texto:texto)}</code>`;}
    return {correta:certa,resposta:ordem,parcial:!certa&&marcas.filter(Boolean).length>=ordem.length/2,feedback:certa?'':'A sequência produz um resultado diferente. Pense no que precisa existir antes de cada passo poder ser executado.'};
   },
   reiniciar(){controle.limpar();saida.hidden=true;},
   revelar(){controle.definirOrdem(correta);controle.marcar(correta.map(()=>true));},
   restaurar(ordem){if(Array.isArray(ordem)){controle.definirOrdem(ordem);controle.marcar(ordem.map(()=>true));}},
   desativar(){controle.desativar();}
  };
 }
});

registrarTipo('problema',{
 montar(corpo,exercicio){
  corpo.innerHTML=`<ol class="etapas-problema">${exercicio.etapas.map((etapa,i)=>`<li class="etapa-problema"><div class="enunciado-etapa">${etapa.enunciado}</div><label>${etapa.rotulo||'Resposta'}<span class="campo-unidade"><input type="text" inputmode="decimal" autocomplete="off" data-etapa="${i}">${etapa.unidade?`<span class="unidade">${etapa.unidade}</span>`:''}</span></label><p class="explicacao-etapa" hidden>${etapa.explicacao||''}</p></li>`).join('')}</ol>`;
  const campos=buscarTodos('input',corpo);
  return {
   verificar(){
    if(campos.some(c=>!c.value.trim()))return {incompleta:true,mensagem:'Responda todas as etapas.'};
    let acertos=0,primeiroErro=-1;
    campos.forEach((campo,i)=>{const etapa=exercicio.etapas[i];const certa=compararNumeros(campo.value,etapa.resposta,etapa.tolerancia||0);campo.classList.toggle('certa',certa);campo.classList.toggle('errada',!certa);if(certa)acertos++;else if(primeiroErro<0)primeiroErro=i;});
    const correta=acertos===campos.length;
    return {correta,resposta:campos.map(c=>c.value),parcial:!correta&&acertos>0,feedback:correta?'':primeiroErro>=0?(exercicio.etapas[primeiroErro].feedback||`A etapa ${primeiroErro+1} precisa ser revista. Os passos seguintes dependem dela.`):''};
   },
   reiniciar(){campos.forEach(c=>c.classList.remove('errada'));},
   revelar(){campos.forEach((c,i)=>{c.value=String(exercicio.etapas[i].resposta).replace('.',',');c.classList.add('certa');c.classList.remove('errada');buscarTodos('.explicacao-etapa',corpo)[i].hidden=false;});},
   restaurar(valores){if(Array.isArray(valores))campos.forEach((c,i)=>{c.value=valores[i]??'';c.classList.add('certa');});},
   desativar(){campos.forEach(c=>c.disabled=true);}
  };
 }
});

registrarTipo('interpretacao',{
 montar(corpo,exercicio,{embaralhar}){
  corpo.innerHTML=`<blockquote class="documento-exercicio">${exercicio.documento}${exercicio.fonte?`<footer>${exercicio.fonte}</footer>`:''}</blockquote><div class="perguntas-documento">${exercicio.perguntas.map((pergunta,i)=>{const ordem=embaralhar(pergunta.opcoes.map((_,j)=>j));return `<fieldset class="pergunta-documento" data-correta="${pergunta.correta}"><legend>${pergunta.enunciado}</legend>${ordem.map(j=>`<label class="opcao"><input type="radio" name="doc-${i}-${exercicio.id||''}" value="${j}"><span>${pergunta.opcoes[j]}</span></label>`).join('')}<p class="explicacao-afirmacao" hidden>${pergunta.explicacao||''}</p></fieldset>`}).join('')}</div>`;
  const grupos=buscarTodos('.pergunta-documento',corpo);
  return {
   verificar(){
    const respostas=grupos.map(g=>buscar('input:checked',g)?.value);
    if(respostas.some(r=>r===undefined))return {incompleta:true,mensagem:'Responda todas as perguntas sobre o documento.'};
    let acertos=0;
    grupos.forEach((g,i)=>{const certa=Number(respostas[i])===Number(g.dataset.correta);g.classList.toggle('certa',certa);g.classList.toggle('errada',!certa);buscar('.explicacao-afirmacao',g).hidden=!certa;if(certa)acertos++;});
    const correta=acertos===grupos.length;
    return {correta,resposta:respostas,parcial:!correta&&acertos>0,feedback:correta?'':`${acertos} de ${grupos.length} interpretações corretas. Volte ao documento e procure a evidência textual para cada resposta.`};
   },
   reiniciar(){grupos.forEach(g=>{if(g.classList.contains('certa'))return;g.classList.remove('errada');buscarTodos('input',g).forEach(e=>e.checked=false);});},
   revelar(){grupos.forEach(g=>{buscarTodos('input',g).forEach(e=>e.checked=Number(e.value)===Number(g.dataset.correta));buscar('.explicacao-afirmacao',g).hidden=false;g.classList.add('certa');g.classList.remove('errada');});},
   restaurar(valores){if(Array.isArray(valores))grupos.forEach((g,i)=>{const e=buscar(`input[value="${valores[i]}"]`,g);if(e)e.checked=true;g.classList.add('certa');});},
   desativar(){buscarTodos('input',corpo).forEach(e=>e.disabled=true);}
  };
 }
});

registrarTipo('resposta-aberta',{
 montar(corpo,exercicio){
  corpo.innerHTML=`<label>${exercicio.rotulo||'Escreva sua resposta'}<textarea rows="${exercicio.linhas||5}" maxlength="3000" placeholder="${escapar(exercicio.exemplo?'':'Escreva aqui…')}"></textarea></label><div class="autoavaliacao" hidden><p><strong>Compare com os critérios.</strong> Marque os que a sua resposta atende com honestidade. Esta é uma autoavaliação: o sistema não interpreta o texto.</p>${exercicio.criterios.map((c,i)=>`<label class="criterio"><input type="checkbox" data-criterio="${i}"><span>${c}</span></label>`).join('')}${exercicio.exemplo?`<details class="exemplo-resposta"><summary>Ver um exemplo de resposta</summary><div>${exercicio.exemplo}</div></details>`:''}</div>`;
  const area=buscar('textarea',corpo),auto=buscar('.autoavaliacao',corpo),caixas=buscarTodos('[data-criterio]',corpo);
  const minimo=exercicio.minimoCriterios||Math.ceil(exercicio.criterios.length*0.75);
  let fase=0;
  return {
   verificar(){
    if(fase===0){
     if(area.value.trim().split(/\s+/).length<(exercicio.minimoPalavras||20))return {incompleta:true,mensagem:`Desenvolva um pouco mais: a resposta precisa de pelo menos ${exercicio.minimoPalavras||20} palavras.`};
     fase=1;auto.hidden=false;area.readOnly=true;
     return {incompleta:true,mensagem:'Agora compare sua resposta com os critérios abaixo e marque os que ela atende. Depois, verifique de novo.'};
    }
    const marcados=caixas.filter(c=>c.checked).length;
    const correta=marcados>=minimo;
    return {correta,resposta:{texto:area.value.slice(0,1500),criterios:caixas.map(c=>c.checked)},parcial:!correta&&marcados>0,feedback:correta?'':`Sua resposta atende ${marcados} de ${exercicio.criterios.length} critérios. Revise o texto para incluir os que faltam. Você pode editar e verificar novamente.`};
   },
   reiniciar(){area.readOnly=false;fase=0;},
   revelar(){auto.hidden=false;buscar('.exemplo-resposta',corpo)?.setAttribute('open','');},
   restaurar(valor){if(valor?.texto){area.value=valor.texto;auto.hidden=false;(valor.criterios||[]).forEach((v,i)=>{if(caixas[i])caixas[i].checked=v});}},
   desativar(){area.readOnly=true;caixas.forEach(c=>c.disabled=true);}
  };
 }
});
