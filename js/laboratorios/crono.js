// Renan | renancodando
import {criarTela,botoesOpcoes,painelExplicacao,textoAlternativo,paleta,formatarNumero,criar,buscar,buscarTodos,escapar} from '../aulas/interativos/base.js';

export const EVENTOS=[
 {ano:1450,aprox:true,titulo:'Prensa de tipos móveis de Gutenberg',camada:'tecnologia',texto:'A impressão com tipos móveis metálicos barateia a reprodução de textos na Europa e acelera a circulação de ideias, incluindo as da Reforma e da ciência moderna.'},
 {ano:1453,titulo:'Queda de Constantinopla',camada:'politica',texto:'A tomada da cidade pelos otomanos encerra o Império Bizantino e desloca rotas comerciais e eruditos, participando das transformações do fim da Idade Média.'},
 {ano:1492,titulo:'Chegada de Colombo à América',camada:'politica',texto:'O início da colonização europeia do continente americano, com consequências demográficas, econômicas e culturais em escala global.'},
 {ano:1500,titulo:'Chegada de Cabral ao Brasil',camada:'politica',texto:'A frota portuguesa chega ao litoral do atual Brasil, início da colonização portuguesa de um território já habitado por milhões de pessoas.'},
 {ano:1517,titulo:'As 95 teses de Lutero',camada:'cultura',texto:'A crítica à venda de indulgências desencadeia a Reforma Protestante e a fragmentação religiosa da Europa.'},
 {ano:1543,titulo:'Copérnico publica “Das revoluções dos orbes celestes”',camada:'ciencia',texto:'O modelo heliocêntrico é publicado, abrindo um longo debate que redefiniria a astronomia.'},
 {ano:1609,titulo:'Galileu observa o céu com o telescópio',camada:'ciencia',texto:'Observações das luas de Júpiter, das fases de Vênus e da superfície lunar fortalecem o heliocentrismo e inauguram a astronomia instrumental.'},
 {ano:1687,titulo:'Newton publica os “Principia”',camada:'ciencia',texto:'As leis do movimento e a gravitação universal unificam a física terrestre e a celeste.'},
 {ano:1760,aprox:true,titulo:'Início da Revolução Industrial',camada:'tecnologia',texto:'Na Inglaterra, mecanização têxtil, carvão e máquina a vapor transformam a produção e as relações de trabalho ao longo de décadas.',fim:1840},
 {ano:1776,titulo:'Independência dos Estados Unidos',camada:'politica',texto:'A Declaração de Independência rompe com a coroa britânica e influencia movimentos constitucionais em outros lugares.'},
 {ano:1789,titulo:'Revolução Francesa',camada:'politica',texto:'A queda do Antigo Regime e a Declaração dos Direitos do Homem e do Cidadão marcam a política moderna.'},
 {ano:1804,titulo:'Independência do Haiti',camada:'politica',texto:'A única revolução de pessoas escravizadas que resultou em um Estado independente, com impacto nos debates sobre escravidão nas Américas.'},
 {ano:1822,titulo:'Independência do Brasil',camada:'politica',texto:'A separação de Portugal mantém a monarquia e a escravidão, diferentemente das repúblicas vizinhas.'},
 {ano:1859,titulo:'Darwin publica “A origem das espécies”',camada:'ciencia',texto:'A seleção natural é proposta como mecanismo da evolução, reorganizando a biologia.'},
 {ano:1869,titulo:'Tabela periódica de Mendeleev',camada:'ciencia',texto:'Os elementos são organizados por propriedades periódicas, com previsão de elementos ainda desconhecidos.'},
 {ano:1876,titulo:'Patente do telefone',camada:'tecnologia',texto:'A transmissão de voz por fio inaugura as telecomunicações pessoais.'},
 {ano:1888,titulo:'Lei Áurea',camada:'politica',texto:'A abolição formal da escravidão no Brasil, último país das Américas a fazê-lo, sem políticas de reparação ou integração.'},
 {ano:1889,titulo:'Proclamação da República no Brasil',camada:'politica',texto:'O fim da monarquia, um ano após a abolição, inaugura um regime republicano com voto restrito.'},
 {ano:1903,titulo:'Primeiro voo controlado dos irmãos Wright',camada:'tecnologia',texto:'Um voo motorizado e controlado abre a era da aviação.'},
 {ano:1914,titulo:'Primeira Guerra Mundial',camada:'politica',texto:'Um conflito industrializado em escala global, que redesenha impérios e fronteiras.',fim:1918},
 {ano:1917,titulo:'Revolução Russa',camada:'politica',texto:'A queda do czarismo e a tomada do poder pelos bolcheviques criam o primeiro Estado socialista.'},
 {ano:1928,titulo:'Descoberta da penicilina',camada:'ciencia',texto:'Fleming observa o efeito do fungo Penicillium sobre bactérias; a produção em escala viria na década de 1940.'},
 {ano:1939,titulo:'Segunda Guerra Mundial',camada:'politica',texto:'O conflito mais letal da história, com o Holocausto e o uso de armas nucleares.',fim:1945},
 {ano:1945,titulo:'Fundação da ONU',camada:'politica',texto:'Uma organização internacional é criada para prevenir novas guerras e promover cooperação.'},
 {ano:1948,titulo:'Declaração Universal dos Direitos Humanos',camada:'cultura',texto:'A Assembleia Geral da ONU aprova um conjunto de direitos considerados universais.'},
 {ano:1953,titulo:'Estrutura em dupla hélice do DNA',camada:'ciencia',texto:'Watson e Crick propõem a estrutura do DNA, apoiados em dados de difração de raios X de Rosalind Franklin e Maurice Wilkins.'},
 {ano:1961,titulo:'Primeiro humano no espaço',camada:'tecnologia',texto:'Iuri Gagarin orbita a Terra a bordo da Vostok 1.'},
 {ano:1969,titulo:'Apollo 11 chega à Lua',camada:'tecnologia',texto:'Seres humanos caminham na Lua. No mesmo ano, a ARPANET conecta os primeiros computadores da rede que originaria a internet.'},
 {ano:1988,titulo:'Constituição brasileira',camada:'politica',texto:'A Constituição que encerra a transição da ditadura militar amplia direitos sociais e políticos.'},
 {ano:1989,titulo:'Queda do Muro de Berlim',camada:'politica',texto:'Símbolo do fim da Guerra Fria e da reunificação alemã.'},
 {ano:1991,titulo:'World Wide Web aberta ao público',camada:'tecnologia',texto:'A Web, criada por Tim Berners-Lee no CERN, torna-se disponível fora da instituição e popularizaria a internet.'},
 {ano:2003,titulo:'Conclusão do Projeto Genoma Humano',camada:'ciencia',texto:'A sequência de referência do genoma humano é declarada concluída, com impactos na medicina e na biologia.'}
];
const CAMADAS={politica:{nome:'Política e sociedade',cor:'#d47a72'},ciencia:{nome:'Ciência',cor:'#86b4d8'},tecnologia:{nome:'Tecnologia',cor:'#7fc3a4'},cultura:{nome:'Cultura e ideias',cor:'#e0a85a'}};

const linha={
 id:'linha-do-tempo',nome:'Linha do tempo',
 descricao:'Mais de trinta marcos entre 1450 e 2003, em quatro camadas. Aproxime, arraste e selecione eventos para ler contextos e perceber simultaneidades.',
 objetivos:['Situar acontecimentos em escala e perceber distâncias temporais.','Comparar camadas: o que acontecia na ciência enquanto a política mudava?','Diferenciar evento pontual de processo de longa duração.'],
 instrucoes:['Use a roda do mouse, o gesto de pinça ou os botões para aproximar.','Arraste para mover no tempo.','Clique em um ponto ou use a lista para abrir o evento.'],
 modelo:['Datas em anos; “c.” indica aproximação.','Processos longos aparecem como barras.','A seleção dos marcos é introdutória e não pretende ser completa nem neutra: toda linha do tempo é um recorte.'],
 montar(area,api){
  const tela=criarTela(area,{largura:640,altura:260,descricao:'Linha do tempo interativa'});
  let inicio=1440,fim=2020,selecionado=null,camadasAtivas=new Set(Object.keys(CAMADAS)),abertos=new Set(api.estadoGuardado?.abertos||[]);
  const filtros=criar('div',{classe:'botoes-opcoes'});area.append(filtros);
  Object.entries(CAMADAS).forEach(([k,c])=>{const b=criar('button',{type:'button',classe:'botao pequeno','aria-pressed':'true',texto:c.nome});b.style.borderColor=c.cor;b.onclick=()=>{if(camadasAtivas.has(k))camadasAtivas.delete(k);else camadasAtivas.add(k);b.setAttribute('aria-pressed',String(camadasAtivas.has(k)));desenhar();api.atualizar(estado());};filtros.append(b);});
  const zoom=criar('div',{classe:'botoes-opcoes'});area.append(zoom);
  [['+ Aproximar',.6],['− Afastar',1.6],['Tudo',0]].forEach(([t,f])=>{const b=criar('button',{type:'button',classe:'botao pequeno secundario',texto:t});b.onclick=()=>{if(!f){inicio=1440;fim=2020;}else{const c=(inicio+fim)/2,l=(fim-inicio)*f/2;inicio=c-l;fim=c+l;}limitar();desenhar();api.atualizar(estado());};zoom.append(b);});
  const painel=criar('div',{classe:'painel-evento',texto:'Selecione um evento para ler seu contexto.'});area.append(painel);
  const lista=criar('div',{classe:'lista-eventos',role:'list'});area.append(lista);
  EVENTOS.forEach((e,i)=>{const b=criar('button',{type:'button',classe:'evento-crono',role:'listitem','aria-pressed':'false',html:`<b>${e.aprox?'c. ':''}${e.ano}${e.fim?'–'+e.fim:''}</b>${escapar(e.titulo)}<small>${CAMADAS[e.camada].nome}</small>`});b.onclick=()=>selecionar(i);lista.append(b);});
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  function limitar(){const l=Math.max(8,Math.min(600,fim-inicio));const c=(inicio+fim)/2;inicio=c-l/2;fim=c+l/2;if(inicio<1400){fim+=1400-inicio;inicio=1400;}if(fim>2030){inicio-=fim-2030;fim=2030;}}
  const px=ano=>(ano-inicio)/(fim-inicio)*tela.largura;
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
   const span=fim-inicio;const passo=span>300?50:span>120?20:span>50?10:span>20?5:1;
   c.strokeStyle='#1d3340';c.fillStyle='#8aa0a8';c.font='10px Arial';c.textAlign='center';
   for(let a=Math.ceil(inicio/passo)*passo;a<=fim;a+=passo){const x=px(a);c.beginPath();c.moveTo(x,0);c.lineTo(x,A-18);c.stroke();c.fillText(String(a),x,A-6);}
   const faixas=Object.keys(CAMADAS);const alturaFaixa=(A-30)/faixas.length;
   faixas.forEach((k,i)=>{const y=10+i*alturaFaixa;c.fillStyle=camadasAtivas.has(k)?CAMADAS[k].cor+'22':'#ffffff05';c.fillRect(0,y,L,alturaFaixa-4);c.fillStyle=CAMADAS[k].cor;c.font='10px Georgia';c.textAlign='left';c.fillText(CAMADAS[k].nome,6,y+12);});
   EVENTOS.forEach((e,i)=>{if(!camadasAtivas.has(e.camada))return;const fi=faixas.indexOf(e.camada);const y=10+fi*alturaFaixa+alturaFaixa/2+4;const x=px(e.ano);if(x<-40||x>L+40)return;const cor=CAMADAS[e.camada].cor;if(e.fim){c.fillStyle=cor+'55';c.fillRect(x,y-7,Math.max(4,px(e.fim)-x),14);}c.fillStyle=i===selecionado?'#f1dca6':cor;c.beginPath();c.arc(x,y,i===selecionado?7:4.5,0,7);c.fill();if(span<140||i===selecionado){c.fillStyle='#e8dcc0';c.font=i===selecionado?'500 11px Georgia':'10px Arial';c.textAlign='left';c.fillText(e.titulo.length>34&&span>60?e.titulo.slice(0,32)+'…':e.titulo,x+9,y+4);}});
   c.fillStyle='#a9bcc2';c.font='10px Arial';c.textAlign='right';c.fillText(`${Math.round(inicio)} – ${Math.round(fim)} · ${Math.round(span)} anos visíveis`,L-6,10);
  }
  function selecionar(i){
   selecionado=i;abertos.add(i);const e=EVENTOS[i];
   buscarTodos('.evento-crono',lista).forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));
   painel.innerHTML=`<span class="etiqueta" style="border-color:${CAMADAS[e.camada].cor}">${CAMADAS[e.camada].nome}</span><span class="etiqueta">${e.aprox?'c. ':''}${e.ano}${e.fim?'–'+e.fim:''}</span><h4>${escapar(e.titulo)}</h4><p>${e.texto}</p>`;
   const vizinhos=EVENTOS.filter((o,j)=>j!==i&&Math.abs(o.ano-e.ano)<=5);
   explicacao.definir(vizinhos.length?`<strong>No mesmo período (±5 anos):</strong> ${vizinhos.map(v=>`${v.titulo} (${v.ano})`).join('; ')}. Simultaneidades ajudam a perguntar por relações, mas não as provam.`:'Nenhum outro marco da lista fica a menos de cinco anos deste. Isso diz mais sobre o recorte do que sobre a época.');
   if(e.ano<inicio||e.ano>fim){const l=Math.max(40,fim-inicio);inicio=e.ano-l/2;fim=e.ano+l/2;limitar();}
   desenhar();api.guardar({abertos:[...abertos]});api.atualizar(estado());
   alternativo(`${e.titulo}, ${e.ano}: ${e.texto}`);
  }
  function estado(){return {inicio,fim,span:fim-inicio,selecionado,abertos:[...abertos],camadas:[...camadasAtivas]};}
  const canvas=tela.tela;let arrasto=null;
  canvas.addEventListener('wheel',e=>{e.preventDefault();const caixa=canvas.getBoundingClientRect();const anoCursor=inicio+(e.clientX-caixa.left)/caixa.width*(fim-inicio);const f=e.deltaY>0?1.15:.87;inicio=anoCursor-(anoCursor-inicio)*f;fim=anoCursor+(fim-anoCursor)*f;limitar();desenhar();api.atualizar(estado());},{passive:false});
  const toques=new Map();
  canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);toques.set(e.pointerId,e.clientX);arrasto={x:e.clientX,inicio,fim,moveu:false};});
  canvas.addEventListener('pointermove',e=>{if(!toques.has(e.pointerId))return;toques.set(e.pointerId,e.clientX);if(toques.size===2){const [a,b]=[...toques.values()];const d=Math.abs(a-b);if(arrasto.dist){const f=arrasto.dist/d;const c=(inicio+fim)/2,l=(fim-inicio)*f/2;inicio=c-l;fim=c+l;limitar();desenhar();}arrasto.dist=d;arrasto.moveu=true;return;}if(!arrasto)return;const caixa=canvas.getBoundingClientRect();const dx=(e.clientX-arrasto.x)/caixa.width*(arrasto.fim-arrasto.inicio);if(Math.abs(e.clientX-arrasto.x)>3)arrasto.moveu=true;inicio=arrasto.inicio-dx;fim=arrasto.fim-dx;limitar();desenhar();});
  canvas.addEventListener('pointerup',e=>{toques.delete(e.pointerId);if(arrasto&&!arrasto.moveu){const caixa=canvas.getBoundingClientRect();const ano=inicio+(e.clientX-caixa.left)/caixa.width*(fim-inicio);const y=(e.clientY-caixa.top)/caixa.height*tela.altura;const faixas=Object.keys(CAMADAS);const alturaFaixa=(tela.altura-30)/faixas.length;const fi=Math.floor((y-10)/alturaFaixa);let melhor=-1,dist=(fim-inicio)/40;EVENTOS.forEach((ev,i)=>{if(!camadasAtivas.has(ev.camada))return;if(faixas[fi]&&ev.camada!==faixas[fi])return;const d=Math.abs(ev.ano-ano);if(d<dist){dist=d;melhor=i;}});if(melhor>=0)selecionar(melhor);}arrasto=null;api.atualizar(estado());});
  canvas.tabIndex=0;canvas.addEventListener('keydown',e=>{const l=fim-inicio;if(e.key==='ArrowLeft'){inicio-=l*.1;fim-=l*.1;}else if(e.key==='ArrowRight'){inicio+=l*.1;fim+=l*.1;}else if(e.key==='+'||e.key==='='){inicio+=l*.15;fim-=l*.15;}else if(e.key==='-'){inicio-=l*.3;fim+=l*.3;}else return;e.preventDefault();limitar();desenhar();api.atualizar(estado());});
  canvas.addEventListener('redimensionar',desenhar);
  desenhar();api.atualizar(estado());
  return {estado,reiniciar(){inicio=1440;fim=2020;selecionado=null;camadasAtivas=new Set(Object.keys(CAMADAS));buscarTodos('button',filtros).forEach(b=>b.setAttribute('aria-pressed','true'));painel.textContent='Selecione um evento para ler seu contexto.';desenhar();},limpar(){tela.destruir();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Aproxime a linha do tempo até ver menos de 120 anos.',verificar:e=>e.span<120},
  {texto:'Abra um evento da camada “Ciência” publicado entre 1500 e 1700.',verificar:e=>e.abertos.some(i=>EVENTOS[i].camada==='ciencia'&&EVENTOS[i].ano>=1500&&EVENTOS[i].ano<=1700)},
  {texto:'Abra os dois marcos brasileiros separados por apenas um ano: 1888 e 1889.',verificar:e=>e.abertos.some(i=>EVENTOS[i].ano===1888)&&e.abertos.some(i=>EVENTOS[i].ano===1889)}
 ]},
 desafio:{titulo:'Ler duas camadas ao mesmo tempo',descricao:'Deixe visíveis <strong>apenas</strong> as camadas Ciência e Tecnologia, enquadre o período de <strong>1840 a 1920</strong> (com margem de 10 anos) e abra ao menos três eventos desse intervalo.',verificar:e=>{const soCT=e.camadas.length===2&&e.camadas.includes('ciencia')&&e.camadas.includes('tecnologia');if(!soCT)return {ok:false,mensagem:'Desative Política e Cultura, mantendo Ciência e Tecnologia.'};if(e.inicio<1830||e.inicio>1850||e.fim<1910||e.fim>1930)return {ok:false,mensagem:`O enquadramento atual vai de ${Math.round(e.inicio)} a ${Math.round(e.fim)}.`};const n=e.abertos.filter(i=>EVENTOS[i].ano>=1840&&EVENTOS[i].ano<=1920&&['ciencia','tecnologia'].includes(EVENTOS[i].camada)).length;return n>=3?{ok:true,mensagem:'Em oitenta anos: evolução, tabela periódica, telefone, voo. Uma pergunta boa: o que essas mudanças têm a ver com a industrialização?'}:{ok:false,mensagem:`Você abriu ${n} evento(s) de ciência ou tecnologia nesse intervalo.`};}}
};

const DOCUMENTOS=[
 {id:'aurea',titulo:'Lei nº 3.353, de 13 de maio de 1888 (Lei Áurea)',texto:'<p>A Princesa Imperial Regente, em nome de Sua Majestade o Imperador, o Senhor D. Pedro II, faz saber a todos os súditos do Império que a Assembleia Geral decretou e ela sancionou a lei seguinte:</p><p>Art. 1º É declarada extinta desde a data desta lei a escravidão no Brasil.</p><p>Art. 2º Revogam-se as disposições em contrário.</p>',fonte:'Brasil, 1888. Grafia atualizada.',tipo:'lei',autoria:'Estado (Império do Brasil)',intencao:'Extinguir juridicamente a escravidão',ausencias:['indenizacao','integracao'],
  comentario:'Um texto de duas linhas encerra formalmente mais de três séculos de escravidão. O que a lei não diz é tão significativo quanto o que diz: não há menção a terra, trabalho, educação ou reparação para as pessoas libertas. Historiadores também destacam que a abolição resultou de décadas de resistência, fugas, pressão abolicionista e mudanças econômicas, e não apenas de um ato da Coroa.'},
 {id:'ddhc',titulo:'Declaração dos Direitos do Homem e do Cidadão, 1789 (artigo 1º)',texto:'<p>Os homens nascem e permanecem livres e iguais em direitos. As distinções sociais só podem fundar-se na utilidade comum.</p>',fonte:'Assembleia Nacional Constituinte francesa, 26 de agosto de 1789. Tradução.',tipo:'declaracao',autoria:'Assembleia Nacional (França revolucionária)',intencao:'Fundar uma nova ordem política em direitos individuais',ausencias:['mulheres','escravizados'],
  comentario:'“Os homens” era, no contexto, uma categoria excludente: mulheres não tinham direitos políticos (Olympe de Gouges publicaria em 1791 uma Declaração dos Direitos da Mulher e da Cidadã), e a escravidão nas colônias francesas continuou até 1794 e foi restabelecida em 1802. Ler um documento exige perguntar quem está incluído no “nós”.'},
 {id:'dudh',titulo:'Declaração Universal dos Direitos Humanos, 1948 (artigo 1º)',texto:'<p>Todos os seres humanos nascem livres e iguais em dignidade e direitos. São dotados de razão e consciência e devem agir em relação uns aos outros com espírito de fraternidade.</p>',fonte:'Assembleia Geral das Nações Unidas, 10 de dezembro de 1948. Tradução oficial em português.',tipo:'declaracao',autoria:'Organização internacional (ONU)',intencao:'Estabelecer um padrão comum de direitos após a Segunda Guerra',ausencias:['mecanismos'],
  comentario:'A expressão “todos os seres humanos” responde às exclusões de textos anteriores e ao contexto do pós-guerra. A Declaração, porém, não é um tratado com força obrigatória: seus mecanismos de garantia viriam depois, em pactos e tribunais. Comparar 1789 e 1948 mostra como a linguagem dos direitos mudou.'}
];
const OPCOES_TIPO=[['lei','Lei'],['declaracao','Declaração de princípios'],['carta','Carta pessoal'],['cronica','Crônica de jornal']];
const OPCOES_AUSENCIA={indenizacao:'Qualquer indenização ou reparação às pessoas libertas',integracao:'Políticas de terra, trabalho ou educação para os libertos',mulheres:'Direitos políticos das mulheres',escravizados:'A situação das pessoas escravizadas nas colônias',mecanismos:'Mecanismos obrigatórios para garantir os direitos',monarquia:'A existência da monarquia'};

const documentos={
 id:'documentos',nome:'Análise de documentos',
 descricao:'Três documentos históricos reais, em texto integral ou trecho. Preencha uma ficha de análise: tipo, autoria, intenção e o que o documento silencia.',
 objetivos:['Identificar a natureza e a autoria de uma fonte.','Distinguir o que um documento diz, o que pretende e o que omite.','Comparar documentos de épocas diferentes sobre temas próximos.'],
 instrucoes:['Escolha um documento e leia com atenção.','Preencha a ficha; o laboratório verifica tipo, autoria, intenção e ausências.','Leia o comentário ao final e compare com sua análise.'],
 modelo:['Os textos são reproduções (com grafia atualizada ou tradução) de documentos públicos; os comentários são sínteses didáticas e não substituem a leitura de historiadores.'],
 montar(area,api){
  let atual=0,analisados=new Set(api.estadoGuardado?.analisados||[]);
  const seletor=botoesOpcoes(area,DOCUMENTOS.map((d,i)=>({valor:i,rotulo:d.titulo.split(',')[0].replace('Declaração dos Direitos do Homem e do Cidadão','DDHC 1789').replace('Declaração Universal dos Direitos Humanos','DUDH 1948')})),{selecionado:0,aoEscolher:v=>{atual=v;montar();},rotulo:'Documento'});
  const caixa=criar('div');area.append(caixa);
  const explicacao=painelExplicacao(area);
  function montar(){
   const d=DOCUMENTOS[atual];
   caixa.innerHTML=`<figure class="documento-fonte"><figcaption class="titulo-equacao">${escapar(d.titulo)}</figcaption><blockquote>${d.texto}</blockquote><figcaption class="fonte-documento">${escapar(d.fonte)}</figcaption></figure>
   <form class="ficha-analise"><label>Tipo de fonte<select name="tipo"><option value="">Escolha…</option>${OPCOES_TIPO.map(([v,r])=>`<option value="${v}">${r}</option>`).join('')}</select></label>
   <label>Quem produziu<select name="autoria"><option value="">Escolha…</option>${['Estado (Império do Brasil)','Assembleia Nacional (França revolucionária)','Organização internacional (ONU)','Um jornalista independente'].map(o=>`<option>${o}</option>`).join('')}</select></label>
   <label>Intenção principal<select name="intencao"><option value="">Escolha…</option>${['Extinguir juridicamente a escravidão','Fundar uma nova ordem política em direitos individuais','Estabelecer um padrão comum de direitos após a Segunda Guerra','Narrar acontecimentos do dia'].map(o=>`<option>${o}</option>`).join('')}</select></label>
   <p class="rotulo-trilho">O que o documento não diz (marque o que se aplica)</p>${Object.entries(OPCOES_AUSENCIA).map(([k,r])=>`<label class="criterio"><input type="checkbox" name="ausencia" value="${k}"><span>${r}</span></label>`).join('')}
   <div class="acoes-painel"><button class="botao pequeno" type="submit">Verificar ficha</button></div><div class="resultado-ficha" aria-live="polite"></div></form>`;
   const form=buscar('form',caixa);
   form.onsubmit=e=>{
    e.preventDefault();
    const dados=new FormData(form);const tipo=dados.get('tipo'),autoria=dados.get('autoria'),intencao=dados.get('intencao'),aus=dados.getAll('ausencia');
    const erros=[];
    if(tipo!==d.tipo)erros.push('O tipo de fonte não corresponde: observe a forma do texto (artigos numerados? princípios gerais?).');
    if(autoria!==d.autoria)erros.push('A autoria não corresponde: releia a referência da fonte.');
    if(intencao!==d.intencao)erros.push('A intenção escolhida não é a principal: o que o texto quer produzir no mundo?');
    const corretas=d.ausencias.filter(a=>aus.includes(a)).length,indevidas=aus.filter(a=>!d.ausencias.includes(a)&&!(a==='monarquia'&&d.id!=='aurea'));
    if(corretas<d.ausencias.length)erros.push('Há silêncios importantes ainda não marcados: pergunte quem fica de fora do texto.');
    if(d.id==='aurea'&&aus.includes('monarquia'))erros.push('A Lei Áurea menciona explicitamente a Princesa Regente e o Imperador: a monarquia está presente no texto.');
    const saida=buscar('.resultado-ficha',form);
    if(erros.length){saida.innerHTML=`<p class="mensagem alerta"><strong>Reveja a ficha.</strong>${erros.join(' ')}</p>`;}
    else{analisados.add(d.id);api.guardar({analisados:[...analisados]});saida.innerHTML=`<p class="mensagem sucesso"><strong>Ficha coerente.</strong></p><div class="destaque destaque-interpretacao"><p class="rotulo-destaque">Comentário</p><div class="prosa">${d.comentario}</div></div>`;}
    api.atualizar({atual:d.id,analisados:[...analisados]});
   };
   explicacao.definir(`Documento ${atual+1} de ${DOCUMENTOS.length}. Analisados: ${analisados.size}.`);
   api.atualizar({atual:d.id,analisados:[...analisados]});
  }
  montar();
  return {estado:()=>({atual:DOCUMENTOS[atual].id,analisados:[...analisados]}),reiniciar(){atual=0;seletor.selecionar(0);montar();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Preencha corretamente a ficha da Lei Áurea.',verificar:e=>e.analisados.includes('aurea')},
  {texto:'Analise a Declaração de 1789.',verificar:e=>e.analisados.includes('ddhc')},
  {texto:'Analise a Declaração de 1948 e compare o sujeito dos dois textos (“os homens” e “todos os seres humanos”).',verificar:e=>e.analisados.includes('dudh')}
 ]},
 desafio:{titulo:'Três fichas coerentes',descricao:'Conclua a análise dos três documentos. Depois, nas suas anotações, escreva em duas frases o que muda na linguagem dos direitos entre 1789 e 1948.',verificar:e=>e.analisados.length>=3?{ok:true,mensagem:'Três documentos, três contextos. A comparação é sua: registre-a nas anotações ou no mural.'}:{ok:false,mensagem:`Faltam ${3-e.analisados.length} documento(s).`}}
};

const NOS={
 capital:{tipo:'causa',nome:'Acúmulo de capital comercial'},carvao:{tipo:'causa',nome:'Carvão e ferro abundantes na Inglaterra'},cercamentos:{tipo:'causa',nome:'Cercamentos e migração para as cidades'},tecnica:{tipo:'causa',nome:'Inovações técnicas (máquina a vapor, teares)'},mercados:{tipo:'causa',nome:'Mercados coloniais e comércio atlântico'},
 revolucao:{tipo:'processo',nome:'Revolução Industrial (c. 1760–1840)'},
 urbanizacao:{tipo:'consequencia',nome:'Urbanização acelerada'},assalariado:{tipo:'consequencia',nome:'Trabalho assalariado em fábricas'},producao:{tipo:'consequencia',nome:'Aumento da produção e queda de preços'},poluicao:{tipo:'consequencia',nome:'Poluição e degradação ambiental'},operarios:{tipo:'consequencia',nome:'Movimentos operários e sindicatos'},
 internet:{tipo:'distrator',nome:'Criação da internet'}
};
const LIGACOES_VALIDAS=new Set(['capital>revolucao','carvao>revolucao','cercamentos>revolucao','tecnica>revolucao','mercados>revolucao','revolucao>urbanizacao','revolucao>assalariado','revolucao>producao','revolucao>poluicao','revolucao>operarios','assalariado>operarios','urbanizacao>poluicao','cercamentos>urbanizacao']);
const DEBATIDAS={'mercados>revolucao':'O peso do comércio colonial e da escravidão atlântica no financiamento da industrialização é objeto de debate historiográfico intenso: a ligação é defendida por alguns autores e relativizada por outros.'};

const causas={
 id:'causas',nome:'Causas e consequências',
 descricao:'Monte uma rede de relações em torno da Revolução Industrial. Ligue causas ao processo e o processo às consequências. O laboratório aceita ligações plausíveis, sinaliza as debatidas e recusa anacronismos.',
 objetivos:['Distinguir causas, processo e consequências.','Reconhecer multicausalidade: nenhum fator explica tudo sozinho.','Identificar anacronismos e relações sem apoio.'],
 instrucoes:['Clique em um nó de origem e depois em um nó de destino para criar uma seta.','Clique em uma seta na lista para removê-la.','Verifique a rede quando tiver ao menos quatro causas e três consequências ligadas.'],
 modelo:['O conjunto de ligações aceitas é um recorte didático a partir de explicações comuns na historiografia; relações marcadas como “em debate” são apresentadas como interpretação, não como fato.'],
 montar(area,api){
  let ligacoes=new Set(api.estadoGuardado?.ligacoes||[]),origem=null;
  const grade=criar('div',{classe:'comparacao'});area.append(grade);
  const colunas={causa:criar('div',{classe:'coluna-comparacao',html:'<h4>Causas</h4>'}),processo:criar('div',{classe:'coluna-comparacao',html:'<h4>Processo</h4>'}),consequencia:criar('div',{classe:'coluna-comparacao',html:'<h4>Consequências</h4>'})};
  Object.values(colunas).forEach(c=>grade.append(c));
  const botoes={};
  Object.entries(NOS).forEach(([id,no])=>{const b=criar('button',{type:'button',classe:'botao pequeno secundario largo','aria-pressed':'false',texto:no.nome,estilo:'margin-bottom:6px;text-align:left;justify-content:flex-start'});b.onclick=()=>clicar(id);botoes[id]=b;(colunas[no.tipo]||colunas.causa).append(b);});
  const listaLig=criar('div',{classe:'grade-selos',estilo:'margin-top:10px'});area.append(listaLig);
  const explicacao=painelExplicacao(area);
  function clicar(id){
   if(!origem){origem=id;botoes[id].setAttribute('aria-pressed','true');explicacao.definir(`Origem: <strong>${NOS[id].nome}</strong>. Agora escolha o destino.`);return;}
   if(origem===id){botoes[id].setAttribute('aria-pressed','false');origem=null;return;}
   const chave=`${origem}>${id}`;ligacoes.add(chave);botoes[origem].setAttribute('aria-pressed','false');origem=null;desenhar();
  }
  function classificar(chave){
   const [a,b]=chave.split('>');
   if(NOS[a].tipo==='distrator'||NOS[b].tipo==='distrator')return {classe:'erro',texto:'Anacronismo: a internet surge dois séculos depois e não se relaciona causalmente com o processo.'};
   if(LIGACOES_VALIDAS.has(chave))return DEBATIDAS[chave]?{classe:'debate',texto:DEBATIDAS[chave]}:{classe:'ok',texto:''};
   if(LIGACOES_VALIDAS.has(`${b}>${a}`))return {classe:'erro',texto:'A seta está invertida: a consequência não pode anteceder a causa.'};
   if(NOS[a].tipo==='consequencia'&&NOS[b].tipo==='causa')return {classe:'erro',texto:'Uma consequência do processo não pode ser causa dele: isso inverte a ordem temporal.'};
   return {classe:'fraca',texto:'Ligação sem apoio claro nas explicações usuais. Ela pode existir, mas exigiria argumentação e evidências.'};
  }
  function desenhar(){
   listaLig.replaceChildren(...[...ligacoes].map(chave=>{const [a,b]=chave.split('>');const c=classificar(chave);const el=criar('button',{type:'button',classe:'selo',title:'Remover ligação',html:`${escapar(NOS[a].nome)} → ${escapar(NOS[b].nome)} <small>${c.classe==='ok'?'✓':c.classe==='debate'?'em debate':c.classe==='erro'?'✕':'?'}</small>`});el.style.borderColor=c.classe==='ok'?'#7fc3a4':c.classe==='debate'?'#e0a85a':c.classe==='erro'?'#d47a72':'#8aa0a8';el.onclick=()=>{ligacoes.delete(chave);desenhar();};return el;}));
   const resumo=estado();
   explicacao.definir(ligacoes.size?`${resumo.validas} ligação(ões) com apoio, ${resumo.debate} em debate, ${resumo.erros} inválida(s), ${resumo.fracas} sem apoio claro. ${[...ligacoes].map(classificar).filter(c=>c.texto).map(c=>c.texto).slice(0,2).join(' ')}`:'Nenhuma ligação ainda. Comece ligando uma causa ao processo.');
   api.guardar({ligacoes:[...ligacoes]});api.atualizar(resumo);
  }
  function estado(){const cls=[...ligacoes].map(classificar);return {ligacoes:[...ligacoes],validas:cls.filter(c=>c.classe==='ok'||c.classe==='debate').length,debate:cls.filter(c=>c.classe==='debate').length,erros:cls.filter(c=>c.classe==='erro').length,fracas:cls.filter(c=>c.classe==='fraca').length,causas:[...ligacoes].filter(l=>l.endsWith('>revolucao')&&LIGACOES_VALIDAS.has(l)).length,consequencias:[...ligacoes].filter(l=>l.startsWith('revolucao>')&&LIGACOES_VALIDAS.has(l)).length};}
  desenhar();
  return {estado,reiniciar(){ligacoes=new Set();origem=null;Object.values(botoes).forEach(b=>b.setAttribute('aria-pressed','false'));desenhar();}};
 },
 atividadeGuiada:{passos:[
  {texto:'Ligue duas causas ao processo.',verificar:e=>e.causas>=2},
  {texto:'Ligue o processo a duas consequências.',verificar:e=>e.consequencias>=2},
  {texto:'Tente ligar a criação da internet a alguma coisa e leia por que o laboratório recusa (depois remova a ligação).',verificar:e=>e.ligacoes.some(l=>l.includes('internet'))}
 ]},
 desafio:{titulo:'Rede multicausal',descricao:'Construa uma rede com pelo menos <strong>quatro causas</strong> ligadas ao processo, <strong>quatro consequências</strong> ligadas a partir dele, <strong>uma ligação entre duas consequências</strong> e <strong>nenhuma</strong> ligação inválida.',verificar:e=>{if(e.erros)return {ok:false,mensagem:`Há ${e.erros} ligação(ões) inválida(s) na rede. Remova-as.`};if(e.causas<4)return {ok:false,mensagem:`${e.causas} causa(s) ligada(s); precisa de 4.`};if(e.consequencias<4)return {ok:false,mensagem:`${e.consequencias} consequência(s) ligada(s); precisa de 4.`};const entre=e.ligacoes.some(l=>{const [a,b]=l.split('>');return NOS[a]?.tipo==='consequencia'&&NOS[b]?.tipo==='consequencia'&&LIGACOES_VALIDAS.has(l);});return entre?{ok:true,mensagem:'Uma rede, não uma linha: várias causas, várias consequências e consequências que geram outras consequências.'}:{ok:false,mensagem:'Falta uma ligação entre duas consequências (por exemplo, trabalho assalariado → movimentos operários).'};}}
};

export const definicao={titulo:'História interativa',descricao:'Uma linha do tempo com camadas e zoom, documentos reais para análise estruturada e uma rede de causas e consequências que recusa anacronismos e sinaliza interpretações em debate.',experimentos:[linha,documentos,causas]};
