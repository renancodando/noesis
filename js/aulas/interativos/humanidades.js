// Renan | renancodando
import {painelExplicacao,botoesOpcoes,criar,buscar,buscarTodos,escapar} from './base.js';
import {adaptarExperimento} from './adaptador.js';
const carregarCrono=()=>import('../../laboratorios/crono.js');
export const montarLinhaDoTempo=adaptarExperimento(carregarCrono,'linha-do-tempo').montar;
export const montarFontes=adaptarExperimento(carregarCrono,'documentos').montar;

const CLASSES={valido:'Válido',invalido:'Inválido (forma incorreta)',adhominem:'Falácia: ataque à pessoa',dicotomia:'Falácia: falsa dicotomia',popularidade:'Falácia: apelo à popularidade',generalizacao:'Falácia: generalização apressada'};
const ARGUMENTOS=[
 {texto:'Se chove, a rua fica molhada. Está chovendo. Logo, a rua está molhada.',classe:'valido',explicacao:'Forma “se P, então Q; P; logo Q” (modus ponens): a conclusão segue necessariamente das premissas.'},
 {texto:'Se chove, a rua fica molhada. A rua está molhada. Logo, está chovendo.',classe:'invalido',explicacao:'Afirmação do consequente: a rua pode estar molhada por outro motivo (um caminhão-pipa). A forma não garante a conclusão.'},
 {texto:'A proposta de reforma não pode ser boa, porque quem a apresentou já foi multado por estacionar em local proibido.',classe:'adhominem',explicacao:'Ataca a pessoa em vez de examinar a proposta. O histórico do proponente não diz nada sobre o mérito do argumento.'},
 {texto:'Ou investimos tudo em segurança, ou aceitamos viver no caos. Como ninguém quer o caos, devemos investir tudo em segurança.',classe:'dicotomia',explicacao:'Apresenta só duas opções quando há muitas intermediárias. A conclusão depende da falsa escassez de alternativas.'},
 {texto:'Milhões de pessoas usam esse remédio natural, portanto ele funciona.',classe:'popularidade',explicacao:'Popularidade não é evidência de eficácia; muitas pessoas podem estar erradas ao mesmo tempo.'},
 {texto:'Conheci dois moradores daquela cidade e ambos eram grosseiros. As pessoas de lá são grosseiras.',classe:'generalizacao',explicacao:'Dois casos não sustentam uma afirmação sobre toda uma população.'},
 {texto:'Se o reator estivesse superaquecendo, o alarme tocaria. O alarme não tocou. Logo, o reator não está superaquecendo.',classe:'valido',explicacao:'Forma “se P, então Q; não Q; logo não P” (modus tollens): válida. Observe que a validade não garante a verdade da primeira premissa (o alarme pode estar quebrado), mas a forma é correta.'},
 {texto:'Todos os cientistas sérios discordam dessa teoria; só pessoas desinformadas a defendem, então quem a defende está desinformado.',classe:'adhominem',explicacao:'Desqualifica quem discorda em vez de apresentar as razões contra a teoria. Mesmo que a teoria seja ruim, o argumento é falacioso.'}
];

export function montar(area,parametros={},contexto={}){
 let indice=0,acertos=0,respondidos=0;
 const caixa=criar('div',{classe:'placa compacta',estilo:'background:#0c1b23aa'});area.append(caixa);
 const explicacao=painelExplicacao(area);
 function mostrar(){
  if(indice>=ARGUMENTOS.length){caixa.innerHTML=`<p class="sobretitulo">CONCLUÍDO</p><p>Você classificou ${acertos} de ${ARGUMENTOS.length} argumentos corretamente.</p><button type="button" class="botao pequeno" data-reiniciar>Recomeçar</button>`;buscar('[data-reiniciar]',caixa).onclick=()=>{indice=0;acertos=0;respondidos=0;mostrar();};return;}
  const a=ARGUMENTOS[indice];
  caixa.innerHTML=`<p class="sobretitulo">ARGUMENTO ${indice+1} DE ${ARGUMENTOS.length}</p><blockquote class="documento-exercicio" style="font-size:15px">${escapar(a.texto)}</blockquote><p class="texto-apoio">Como você classifica este argumento?</p><div class="opcoes">${Object.entries(CLASSES).map(([k,v])=>`<button type="button" class="opcao" data-classe="${k}" style="text-align:left">${v}</button>`).join('')}</div><div class="feedback" hidden></div>`;
  buscarTodos('[data-classe]',caixa).forEach(b=>b.onclick=()=>{const certa=b.dataset.classe===a.classe;respondidos++;if(certa)acertos++;buscarTodos('[data-classe]',caixa).forEach(x=>{x.disabled=true;x.classList.toggle('certa',x.dataset.classe===a.classe);x.classList.toggle('errada',x===b&&!certa);});const f=buscar('.feedback',caixa);f.hidden=false;f.className='feedback '+(certa?'sucesso':'erro');f.innerHTML=`<strong>${certa?'Correto.':'Não é isso.'}</strong>${a.explicacao}<p><button type="button" class="botao pequeno" data-proximo>Próximo</button></p>`;buscar('[data-proximo]',f).onclick=()=>{indice++;mostrar();};contexto.aoAtualizar?.({respondidos,acertos});});
  explicacao.definir(`Um argumento é <strong>válido</strong> quando a conclusão segue necessariamente das premissas, independentemente de elas serem verdadeiras. Falácias são erros de raciocínio que parecem argumentos. Acertos até agora: ${acertos} de ${respondidos}.`);
 }
 mostrar();
 return ()=>{};
}

const DILEMAS=[
 {id:'remedio',titulo:'O remédio escasso',situacao:'Um posto de saúde recebeu dez doses de um medicamento e tem vinte pacientes que precisam dele. Dez estão em estado grave, com baixa chance de recuperação mesmo com a dose; dez estão em estado moderado, com alta chance de cura.',opcoes:[{id:'graves',texto:'Dar as doses aos dez mais graves'},{id:'moderados',texto:'Dar as doses aos dez com maior chance de cura'},{id:'sorteio',texto:'Sortear entre os vinte'},{id:'metade',texto:'Dividir: cinco para cada grupo'}],
  analises:{consequencialismo:{graves:'Tende a salvar menos vidas no total, já que a chance de recuperação é baixa; um consequencialista veria isso como pior resultado.',moderados:'Maximiza o número esperado de vidas salvas; é a escolha mais alinhada a “o maior bem para o maior número”.',sorteio:'Não maximiza resultados; um consequencialista só o aceitaria se o sorteio evitasse conflitos com custo maior.',metade:'Resultado intermediário; sacrifica parte do ganho em vidas salvas por outro valor (equidade).'},deontologia:{graves:'Pode ser defendido pelo dever de socorrer primeiro quem está em maior perigo, independentemente do resultado.',moderados:'Pode ser criticado por tratar pessoas como números; mas um deontologista também pode ver dever de usar bem um recurso escasso.',sorteio:'Trata todos como iguais em dignidade, sem julgar quem “vale mais”: uma posição deontológica forte.',metade:'Tenta respeitar duas obrigações ao mesmo tempo; o conflito de deveres permanece.'},virtudes:{graves:'Expressa compaixão pelos mais vulneráveis; a pergunta é se também expressa prudência.',moderados:'Expressa prudência e responsabilidade; a pergunta é se falta compaixão com os mais graves.',sorteio:'Expressa justiça e humildade diante de uma escolha trágica; pode parecer fuga da responsabilidade.',metade:'Busca equilíbrio, uma virtude; pode ser visto como indecisão.'}}},
 {id:'segredo',titulo:'O segredo da amiga',situacao:'Sua amiga conta, em confiança, que copiou um trabalho inteiro da internet. O professor pergunta à turma se alguém sabe de algo e diz que, sem informação, todos perderão pontos.',opcoes:[{id:'contar',texto:'Contar ao professor'},{id:'silencio',texto:'Guardar o segredo'},{id:'convencer',texto:'Pressionar a amiga a se entregar'},{id:'anonimo',texto:'Avisar anonimamente'}],
  analises:{consequencialismo:{contar:'Evita a punição coletiva, mas rompe a confiança; o saldo depende de quanto cada consequência pesa.',silencio:'Protege a amizade, mas prejudica a turma inteira: resultado ruim para muitos.',convencer:'Se funcionar, evita o dano coletivo e preserva parte da confiança; é a tentativa de melhor resultado.',anonimo:'Evita o dano coletivo com menor custo pessoal, mas ainda rompe a confiança.'},deontologia:{contar:'Honestidade é um dever; mas quebrar uma confidência também viola um dever. Conflito de regras.',silencio:'Cumpre o dever de lealdade e rompe o de honestidade; a mentira por omissão continua sendo problema.',convencer:'Respeita a autonomia da amiga e os dois deveres: ela é tratada como agente responsável.',anonimo:'Cumpre a honestidade com o professor, mas de forma que evita assumir a própria ação.'},virtudes:{contar:'Pode expressar coragem e honestidade, ou falta de lealdade; depende de como e por quê.',silencio:'Lealdade sem honestidade não é uma virtude completa.',convencer:'Combina lealdade, honestidade e coragem: a resposta que uma pessoa íntegra provavelmente daria primeiro.',anonimo:'Resolve o problema sem a coragem de assumir; a virtude fica pela metade.'}}}
];
export function montarDilema(area,parametros={},contexto={}){
 let atual=DILEMAS.find(d=>d.id===parametros.dilema)||DILEMAS[0],escolha=null;
 const seletor=botoesOpcoes(area,DILEMAS.map(d=>({valor:d.id,rotulo:d.titulo})),{selecionado:atual.id,aoEscolher:v=>{atual=DILEMAS.find(d=>d.id===v);escolha=null;desenhar();},rotulo:'Dilema'});
 const caixa=criar('div');area.append(caixa);
 const explicacao=painelExplicacao(area);
 function desenhar(){
  caixa.innerHTML=`<div class="placa compacta" style="background:#0c1b23aa"><h4 style="font:500 17px Georgia,serif;color:#f0e1bd;margin:0 0 8px">${escapar(atual.titulo)}</h4><p>${escapar(atual.situacao)}</p><p class="texto-apoio">O que você faria?</p><div class="opcoes">${atual.opcoes.map(o=>`<button type="button" class="opcao ${escolha===o.id?'certa':''}" data-opcao="${o.id}" style="text-align:left">${escapar(o.texto)}</button>`).join('')}</div></div>${escolha?`<div class="comparacao" style="margin-top:12px">${[['consequencialismo','Consequencialismo','Julga pelos resultados: o melhor ato é o que produz mais bem-estar no total.'],['deontologia','Deontologia','Julga por deveres e regras: certos atos são devidos ou proibidos, independentemente do resultado.'],['virtudes','Ética das virtudes','Julga pelo caráter: o que uma pessoa justa, prudente e corajosa faria?']].map(([k,nome,desc])=>`<div class="coluna-comparacao"><h4>${nome}</h4><p class="texto-apoio">${desc}</p><p>${escapar(atual.analises[k][escolha])}</p></div>`).join('')}</div><p class="nota-modelo">Nenhuma coluna dá a resposta certa. As três tradições iluminam aspectos diferentes da escolha, e é comum que discordem entre si; parte do trabalho ético é decidir, com razões, qual aspecto pesa mais neste caso.</p>`:''}`;
  buscarTodos('[data-opcao]',caixa).forEach(b=>b.onclick=()=>{escolha=b.dataset.opcao;desenhar();contexto.aoAtualizar?.({dilema:atual.id,escolha});});
  explicacao.definir(escolha?'Compare as três leituras. Qual delas se aproxima mais do seu motivo real? Há algum argumento nas outras que mudaria sua decisão?':'Escolha uma ação para ver como três tradições éticas a avaliariam.');
 }
 desenhar();
 return ()=>{};
}
