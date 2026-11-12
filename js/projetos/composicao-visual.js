// Renan | renancodando
import {criarTela,grupoControles,botoesOpcoes,painelExplicacao,textoAlternativo,formatarNumero,criar,buscar,buscarTodos,escapar} from '../aulas/interativos/base.js';
import {contraste,hslParaHex} from '../laboratorios/atelie.js';

export const definicao={
 objetivo:'Compor um cartaz para divulgar um evento de ciência, aplicando hierarquia tipográfica, contraste, paleta limitada e alinhamento. Critérios de legibilidade e hierarquia são verificados por cálculo; clareza e intenção, por autoavaliação.',
 materiais:['Tela de 640 × 800 (proporção de cartaz A-série).','Título, subtítulo e texto de apoio editáveis.','Paleta de até três cores, forma de destaque e grade de alinhamento.'],
 instrucoes:['Escreva título, subtítulo e informações (data, local).','Escolha fundo, cor de texto e cor de destaque; confira o contraste.','Ajuste tamanhos para que o título seja pelo menos o dobro do texto de apoio.','Alinhe os blocos à grade e exporte a imagem.'],
 conhecimentos:['Hierarquia: o olhar deve encontrar primeiro o mais importante.','Contraste mínimo de 4,5:1 entre texto e fundo para leitura confortável.','Poucas cores com funções claras comunicam melhor do que muitas.'],
 criterios:[
  {id:'titulo',texto:'Título com até 6 palavras e subtítulo preenchidos',verificar:e=>e.titulo.trim().split(/\s+/).filter(Boolean).length>0&&e.titulo.trim().split(/\s+/).length<=6&&e.subtitulo.trim().length>0},
  {id:'hierarquia',texto:'Título pelo menos 2× maior que o texto de apoio',verificar:e=>({ok:e.tamanhoTitulo>=2*e.tamanhoApoio,detalhe:`${formatarNumero(e.tamanhoTitulo/e.tamanhoApoio,1)}×`})},
  {id:'contraste',texto:'Contraste texto/fundo ≥ 4,5:1',verificar:e=>({ok:e.contrasteTexto>=4.5,detalhe:`${formatarNumero(e.contrasteTexto,2)}:1`})},
  {id:'destaque',texto:'Cor de destaque diferente das outras duas e com contraste ≥ 3:1 com o fundo',verificar:e=>({ok:e.contrasteDestaque>=3&&e.destaque!==e.texto&&e.destaque!==e.fundo,detalhe:`${formatarNumero(e.contrasteDestaque,2)}:1`})},
  {id:'margens',texto:'Blocos dentro das margens de 40 px',verificar:e=>e.dentroMargens},
  {id:'clareza',texto:'Quem vê o cartaz entende o quê, quando e onde em poucos segundos',manual:true},
  {id:'focal',texto:'Há um ponto focal claro e nada compete com ele',manual:true}
 ],
 resumo:e=>`“${e.titulo}” · contraste ${formatarNumero(e.contrasteTexto,1)}:1`,
 montar(area,api){
  const salvo=api.estadoGuardado||{};
  const tela=criarTela(area,{largura:640,altura:800,descricao:'Cartaz em composição'});
  let dados={titulo:salvo.titulo||'Noite das Estrelas',subtitulo:salvo.subtitulo||'Observação do céu com telescópios',apoio:salvo.apoio||'Sábado, 20h · Praça Central · Entrada livre',fundo:salvo.fundo||'#132431',texto:salvo.texto||'#f1dca6',destaque:salvo.destaque||'#d47a72',forma:salvo.forma||'circulo',alinhamento:salvo.alinhamento||'esquerda',posicao:salvo.posicao||62};
  const campos=criar('div',{classe:'campo-inline',estilo:'margin-top:10px'});area.append(campos);
  [['titulo','Título'],['subtitulo','Subtítulo'],['apoio','Data, local e informações']].forEach(([k,r])=>{const l=criar('label',{texto:r});const i=criar('input',{type:'text',value:dados[k],maxlength:'80'});i.oninput=()=>{dados[k]=i.value;atualizar();};l.append(i);campos.append(l);});
  const cores=criar('div',{classe:'ferramentas-atelie'});area.append(cores);
  [['fundo','Fundo'],['texto','Texto'],['destaque','Destaque']].forEach(([k,r])=>{const l=criar('label',{html:`${r} <input type="color">`});const i=buscar('input',l);i.value=dados[k];i.oninput=()=>{dados[k]=i.value;atualizar();};cores.append(l);});
  botoesOpcoes(area,[{valor:'circulo',rotulo:'Destaque: círculo'},{valor:'faixa',rotulo:'Destaque: faixa'},{valor:'nenhum',rotulo:'Sem forma'}],{selecionado:dados.forma,aoEscolher:v=>{dados.forma=v;atualizar();},rotulo:'Forma de destaque'});
  botoesOpcoes(area,[{valor:'esquerda',rotulo:'Alinhar à esquerda'},{valor:'centro',rotulo:'Centralizar'}],{selecionado:dados.alinhamento,aoEscolher:v=>{dados.alinhamento=v;atualizar();},rotulo:'Alinhamento'});
  const controles=grupoControles(area,[{chave:'titulo',rotulo:'Tamanho do título',min:28,max:96,passo:2,valor:salvo.tamanhoTitulo||64,unidade:'px',aoMudar:atualizar},{chave:'apoio',rotulo:'Tamanho do texto de apoio',min:14,max:40,passo:1,valor:salvo.tamanhoApoio||22,unidade:'px',aoMudar:atualizar},{chave:'posicao',rotulo:'Posição vertical do título',min:15,max:80,passo:1,valor:dados.posicao,unidade:'%',aoMudar:v=>{dados.posicao=v;atualizar();}}]);
  const acoes=criar('div',{classe:'botoes-opcoes'});area.append(acoes);
  const baixar=criar('button',{type:'button',classe:'botao pequeno secundario',texto:'Baixar cartaz (PNG)'});baixar.onclick=()=>{const a=document.createElement('a');a.download='cartaz-noesis.png';a.href=tela.tela.toDataURL('image/png');a.click();};acoes.append(baixar);
  const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
  let estado={};
  function quebrar(c,texto,largura){const palavras=texto.split(/\s+/);const linhas=[];let atual='';palavras.forEach(p=>{const teste=atual?atual+' '+p:p;if(c.measureText(teste).width>largura&&atual){linhas.push(atual);atual=p;}else atual=teste;});if(atual)linhas.push(atual);return linhas;}
  function desenhar(){
   const {contexto:c,largura:L,altura:A}=tela;const k=L/640;
   c.fillStyle=dados.fundo;c.fillRect(0,0,L,A);
   const margem=40*k,larguraUtil=L-2*margem;
   const yTitulo=dados.posicao/100*A;
   if(dados.forma==='circulo'){c.fillStyle=dados.destaque;c.beginPath();c.arc(L*.72,yTitulo-130*k,120*k,0,7);c.fill();}
   if(dados.forma==='faixa'){c.fillStyle=dados.destaque;c.fillRect(0,yTitulo-20*k,L,14*k);}
   c.textAlign=dados.alinhamento==='centro'?'center':'left';const x=dados.alinhamento==='centro'?L/2:margem;
   c.fillStyle=dados.texto;c.font=`500 ${controles.titulo.valor*k}px Georgia, serif`;
   const linhasTitulo=quebrar(c,dados.titulo,larguraUtil);let y=yTitulo;let ultimoY=y;
   linhasTitulo.forEach((l,i)=>{c.fillText(l,x,y+i*controles.titulo.valor*k*1.08);ultimoY=y+i*controles.titulo.valor*k*1.08;});
   y=ultimoY+controles.apoio.valor*k*2.2;
   c.font=`italic ${controles.apoio.valor*k*1.25}px Georgia, serif`;quebrar(c,dados.subtitulo,larguraUtil).forEach((l,i)=>{c.fillText(l,x,y+i*controles.apoio.valor*k*1.6);ultimoY=y+i*controles.apoio.valor*k*1.6;});
   y=ultimoY+controles.apoio.valor*k*2.4;
   c.font=`${controles.apoio.valor*k}px Arial, sans-serif`;c.fillStyle=dados.destaque;quebrar(c,dados.apoio,larguraUtil).forEach((l,i)=>{c.fillText(l,x,y+i*controles.apoio.valor*k*1.5);ultimoY=y+i*controles.apoio.valor*k*1.5;});
   c.font=`${12*k}px Arial`;c.fillStyle=dados.texto;c.globalAlpha=.6;c.textAlign='left';c.fillText('NÓESIS · divulgação científica',margem,A-margem*.6);c.globalAlpha=1;
   estado.dentroMargens=ultimoY<A-margem&&yTitulo-controles.titulo.valor*k>margem;
   c.strokeStyle='#ffffff22';c.setLineDash([4,4]);c.strokeRect(margem,margem,larguraUtil,A-2*margem);c.setLineDash([]);
  }
  function atualizar(){
   estado={...dados,tamanhoTitulo:controles.titulo.valor,tamanhoApoio:controles.apoio.valor,contrasteTexto:contraste(dados.texto,dados.fundo),contrasteDestaque:contraste(dados.destaque,dados.fundo),dentroMargens:true};
   desenhar();
   explicacao.definir(`Contraste texto/fundo <strong>${formatarNumero(estado.contrasteTexto,2)}:1</strong> (${estado.contrasteTexto>=4.5?'legível':'insuficiente: clareie o texto ou escureça o fundo'}); destaque/fundo ${formatarNumero(estado.contrasteDestaque,2)}:1. Razão título/apoio ${formatarNumero(estado.tamanhoTitulo/estado.tamanhoApoio,1)}×. ${estado.dentroMargens?'Tudo dentro das margens.':'Algum bloco invade as margens: suba o título ou reduza tamanhos.'} A linha tracejada marca a margem de 40 px.`);
   alternativo(`Cartaz “${dados.titulo}”, fundo ${dados.fundo}, texto ${dados.texto}, destaque ${dados.destaque}.`);
   api.guardar({...dados,tamanhoTitulo:controles.titulo.valor,tamanhoApoio:controles.apoio.valor});api.atualizar(estado);
  }
  tela.tela.addEventListener('redimensionar',desenhar);
  atualizar();
  return {estado:()=>estado,reiniciar(){dados={titulo:'Noite das Estrelas',subtitulo:'Observação do céu com telescópios',apoio:'Sábado, 20h · Praça Central · Entrada livre',fundo:'#132431',texto:'#f1dca6',destaque:'#d47a72',forma:'circulo',alinhamento:'esquerda',posicao:62};buscarTodos('input[type=text]',campos).forEach((i,k)=>i.value=dados[['titulo','subtitulo','apoio'][k]]);buscarTodos('input[type=color]',cores).forEach((i,k)=>i.value=dados[['fundo','texto','destaque'][k]]);controles.titulo.valor=64;controles.apoio.valor=22;controles.posicao.valor=62;atualizar();},limpar(){tela.destruir();}};
 }
};
