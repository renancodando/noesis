// Renan | renancodando
import {criar,buscar,buscarTodos,escapar,painelExplicacao} from '../aulas/interativos/base.js';
import {criarExecutorIsolado} from '../laboratorios/nucleo.js';

const TESTES=[
 {expressao:'2+3',esperado:5,grupo:'basico'},{expressao:'7-10',esperado:-3,grupo:'basico'},{expressao:'6*7',esperado:42,grupo:'basico'},{expressao:'10/4',esperado:2.5,grupo:'basico'},
 {expressao:'2+3*4',esperado:14,grupo:'prioridade'},{expressao:'20-6/2',esperado:17,grupo:'prioridade'},{expressao:'(2+3)*4',esperado:20,grupo:'parenteses'},{expressao:'2*(3+(4-1))',esperado:12,grupo:'parenteses'},
 {expressao:'1/0',esperado:'Erro',grupo:'erro'},{expressao:'2+',esperado:'Erro',grupo:'erro'},{expressao:'3.5*2',esperado:7,grupo:'decimal'}
];
const MODELO=`// Implemente a função calcular(expressao).
// Ela recebe um texto como "2+3*4" e deve devolver um número,
// ou o texto "Erro" quando a expressão for inválida (incluindo divisão por zero).
// Sugestão de caminho: 1) separar números e operadores; 2) resolver * e / primeiro;
// 3) resolver + e -; 4) tratar parênteses resolvendo o conteúdo interno antes.

function calcular(expressao) {
  const limpa = expressao.replace(/\\s+/g, '');
  if (!/^[0-9+\\-*/().]+$/.test(limpa)) return 'Erro';
  // continue a partir daqui
  return 'Erro';
}
`;

export const definicao={
 objetivo:'Escrever a lógica de uma calculadora que respeite a prioridade das operações, resolva parênteses e trate erros, verificada por casos de teste automáticos. O teclado visual usa a sua função.',
 materiais:['Editor de código isolado (Worker em iframe com sandbox).','Onze casos de teste com expressões e resultados esperados.','Teclado visual conectado à sua função.'],
 instrucoes:['Leia o modelo inicial: a função <code>calcular</code> recebe um texto e devolve um número ou “Erro”.','Comece pelas operações básicas e rode os testes; depois trate prioridade, parênteses e erros.','Quando todos os testes passarem, experimente a calculadora pelo teclado.'],
 conhecimentos:['Ordem das operações: multiplicação e divisão antes de adição e subtração; parênteses primeiro.','Divisão por zero não tem resultado numérico definido.'],
 criterios:[
  {id:'basico',texto:'Operações básicas corretas (4 testes)',verificar:e=>({ok:e.grupos?.basico===4,detalhe:`${e.grupos?.basico||0}/4`})},
  {id:'prioridade',texto:'Prioridade de operações (2 testes)',verificar:e=>({ok:e.grupos?.prioridade===2,detalhe:`${e.grupos?.prioridade||0}/2`})},
  {id:'parenteses',texto:'Parênteses, inclusive aninhados (2 testes)',verificar:e=>({ok:e.grupos?.parenteses===2,detalhe:`${e.grupos?.parenteses||0}/2`})},
  {id:'erro',texto:'Tratamento de erros e divisão por zero (2 testes)',verificar:e=>({ok:e.grupos?.erro===2,detalhe:`${e.grupos?.erro||0}/2`})},
  {id:'decimal',texto:'Números decimais (1 teste)',verificar:e=>({ok:e.grupos?.decimal===1})},
  {id:'eval',texto:'Sem usar eval ou new Function na solução',verificar:e=>!/\beval\s*\(|new\s+Function/.test(e.codigo||'')},
  {id:'entendi',texto:'Consigo explicar por que 2+3*4 dá 14 e como meu código garante isso',manual:true}
 ],
 resumo:e=>`${e.aprovados} de ${TESTES.length} testes aprovados`,
 montar(area,api){
  area.innerHTML=`<div class="alinhado" style="margin-bottom:8px"><strong style="font:500 15px Georgia,serif;color:#eedcb4">Função calcular(expressao)</strong><span class="espaco"></span><button class="botao pequeno" data-testar>▶ Rodar testes</button></div><textarea class="editor-codigo" aria-label="Código da calculadora" spellcheck="false" style="min-height:260px"></textarea><div class="testes" data-testes></div><div class="calculadora-visual"><div class="visor-calculadora" data-visor aria-live="polite">0</div><div class="teclado" data-teclado></div></div>`;
  const editor=buscar('textarea',area),listaTestes=buscar('[data-testes]',area),visor=buscar('[data-visor]',area);
  editor.value=api.estadoGuardado?.codigo||MODELO;
  const explicacao=painelExplicacao(area);
  let estado={codigo:editor.value,aprovados:0,grupos:{}},expressaoAtual='';
  const executor=criarExecutorIsolado(dados=>{
   if(dados.tipo==='log'){try{const r=JSON.parse(dados.texto);if(r.modo==='testes')aplicarTestes(r.resultados);else if(r.modo==='visor')visor.textContent=String(r.valor);}catch{}}
   if(dados.tipo==='erro'){explicacao.definir(`<strong>Erro de execução:</strong> ${escapar(dados.texto)}`);if(expressaoAtual)visor.textContent='Erro';}
  });
  function codigoTestes(){return `${editor.value}\n;(function(){const testes=${JSON.stringify(TESTES)};const resultados=testes.map(t=>{let obtido;try{obtido=calcular(t.expressao);}catch(e){obtido='Exceção: '+(e&&e.message||e);}const ok=typeof t.esperado==='number'?(typeof obtido==='number'&&Math.abs(obtido-t.esperado)<1e-9):obtido===t.esperado;return {expressao:t.expressao,esperado:t.esperado,obtido:String(obtido),ok,grupo:t.grupo};});console.log(JSON.stringify({modo:'testes',resultados}));})();`;}
  function aplicarTestes(resultados){
   const grupos={};resultados.forEach(r=>{if(r.ok)grupos[r.grupo]=(grupos[r.grupo]||0)+1;});
   estado={codigo:editor.value,aprovados:resultados.filter(r=>r.ok).length,grupos};
   listaTestes.innerHTML=resultados.map(r=>`<div class="teste ${r.ok?'ok':'falha'}"><span>calcular("${escapar(r.expressao)}") → esperado ${escapar(String(r.esperado))}</span><span>${r.ok?'✓':'obtido '+escapar(r.obtido)}</span></div>`).join('');
   explicacao.definir(`<strong>${estado.aprovados} de ${TESTES.length} testes aprovados.</strong> ${estado.aprovados===TESTES.length?'A lógica está completa. Use o teclado para experimentar.':'Leia os testes que falharam: o resultado obtido indica onde a lógica se perde.'}`);
   api.guardar({codigo:editor.value});api.atualizar(estado);
  }
  buscar('[data-testar]',area).onclick=()=>{expressaoAtual='';executor.executar(codigoTestes());explicacao.definir('Rodando os testes…');};
  const teclas=['7','8','9','/','4','5','6','*','1','2','3','-','0','.','(',')','C','=','+'];
  const teclado=buscar('[data-teclado]',area);
  teclas.forEach(t=>{const b=criar('button',{type:'button',classe:/[+\-*/=]/.test(t)?'operador':'',texto:t,'aria-label':t==='C'?'Limpar':t==='='?'Calcular':t});b.onclick=()=>{if(t==='C'){expressaoAtual='';visor.textContent='0';return;}if(t==='='){if(!expressaoAtual)return;executor.executar(`${editor.value}\n;console.log(JSON.stringify({modo:'visor',valor:(function(){try{return calcular(${JSON.stringify(expressaoAtual)});}catch(e){return 'Erro';}})()}));`);return;}expressaoAtual+=t;visor.textContent=expressaoAtual;};teclado.append(b);});
  editor.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const i=editor.selectionStart;editor.setRangeText('  ',i,editor.selectionEnd,'end');}});
  editor.addEventListener('change',()=>api.guardar({codigo:editor.value}));
  explicacao.definir('Escreva a função e rode os testes. O código é executado isoladamente, com limite de 3 segundos.');
  api.atualizar(estado);
  return {estado:()=>estado,reiniciar(){editor.value=MODELO;listaTestes.replaceChildren();estado={codigo:MODELO,aprovados:0,grupos:{}};api.guardar({codigo:MODELO});api.atualizar(estado);},limpar(){executor.destruir();}};
 }
};
