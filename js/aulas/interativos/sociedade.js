// Renan | renancodando
import {criarTela,grupoControles,botoesOpcoes,painelExplicacao,textoAlternativo,paleta,formatarNumero,criar,buscar,buscarTodos,escapar} from './base.js';

export function montar(area,parametros={},contexto={}){
 const tela=criarTela(area,{largura:640,altura:300,descricao:'Curvas de oferta e demanda'});
 const controles=grupoControles(area,[{chave:'demanda',rotulo:'Interesse dos compradores',min:50,max:150,passo:5,valor:100,aoMudar:desenhar},{chave:'oferta',rotulo:'Capacidade dos vendedores',min:50,max:150,passo:5,valor:100,aoMudar:desenhar},{chave:'tabelado',rotulo:'Preço fixado por lei (0 = livre)',min:0,max:20,passo:1,valor:0,unidade:'R$',aoMudar:desenhar}]);
 const leitura=criar('div',{classe:'leitura'});area.append(leitura);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 function desenhar(){
  const D=controles.demanda.valor,O=controles.oferta.valor,tab=controles.tabelado.valor;
  const demanda=p=>Math.max(0,D-5*p),oferta=p=>Math.max(0,O*.2+6*p-60);
  let pe=0;for(let p=0;p<=20;p+=.05){if(oferta(p)>=demanda(p)){pe=p;break;}}
  const qe=demanda(pe);
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const m=40,ex=q=>m+q/160*(L-2*m),ey=p=>A-m-p/20*(A-2*m);
  c.strokeStyle='#8aa0a8';c.beginPath();c.moveTo(m,A-m);c.lineTo(L-m,A-m);c.moveTo(m,A-m);c.lineTo(m,m);c.stroke();
  c.fillStyle='#a9bcc2';c.font='11px Arial';c.textAlign='center';c.fillText('quantidade →',L/2,A-10);c.save();c.translate(12,A/2);c.rotate(-Math.PI/2);c.fillText('preço →',0,0);c.restore();
  [[demanda,paleta.azul,'demanda'],[oferta,paleta.ambar,'oferta']].forEach(([f,cor,r])=>{c.strokeStyle=cor;c.lineWidth=2;c.beginPath();for(let p=0;p<=20;p+=.5){const q=f(p);if(q>160)continue;p?c.lineTo(ex(q),ey(p)):c.moveTo(ex(q),ey(p));}c.stroke();c.fillStyle=cor;c.font='11px Arial';c.textAlign='left';c.fillText(r,ex(Math.min(160,f(r==='demanda'?1:19)))+4,ey(r==='demanda'?1:19));});
  c.fillStyle=paleta.verde;c.beginPath();c.arc(ex(qe),ey(pe),6,0,7);c.fill();c.fillStyle='#e8dcc0';c.font='11px Arial';c.textAlign='left';c.fillText(`equilíbrio: R$ ${formatarNumero(pe,1)} · ${formatarNumero(qe,0)} un.`,ex(qe)+10,ey(pe)-8);
  let texto='';
  if(tab){c.strokeStyle=paleta.rubi;c.setLineDash([4,4]);c.beginPath();c.moveTo(m,ey(tab));c.lineTo(L-m,ey(tab));c.stroke();c.setLineDash([]);const qd=demanda(tab),qo=oferta(tab);const falta=qd-qo;texto=tab<pe?`<strong>Preço tabelado abaixo do equilíbrio:</strong> compradores querem ${formatarNumero(qd,0)} unidades, vendedores oferecem ${formatarNumero(qo,0)}. Faltam ${formatarNumero(falta,0)}: filas, mercado paralelo ou desabastecimento. O preço baixo ajuda quem consegue comprar e prejudica quem fica sem.`:tab>pe?`<strong>Preço tabelado acima do equilíbrio:</strong> vendedores oferecem ${formatarNumero(qo,0)}, compradores levam ${formatarNumero(qd,0)}. Sobram ${formatarNumero(-falta,0)}: estoques encalhados. Protege a renda dos vendedores e reduz o consumo.`:'O preço tabelado coincide com o equilíbrio: sem efeito.';}
  else texto=`No <strong>equilíbrio</strong>, a quantidade que os compradores querem a esse preço iguala a que os vendedores aceitam oferecer: R$ ${formatarNumero(pe,1)} e ${formatarNumero(qe,0)} unidades. ${D>100?'Mais interesse dos compradores desloca a demanda para a direita: preço e quantidade sobem.':D<100?'Menos interesse reduz preço e quantidade.':''} ${O>100?'Mais capacidade de produção desloca a oferta: o preço cai e a quantidade sobe.':O<100?'Menos capacidade (uma seca, uma greve) eleva o preço e reduz a quantidade.':''}`;
  leitura.innerHTML=`<div><small>Preço de equilíbrio</small><strong>R$ ${formatarNumero(pe,1)}</strong></div><div><small>Quantidade</small><strong>${formatarNumero(qe,0)}</strong></div>`;
  explicacao.definir(texto+' Modelo simplificado: curvas lineares, concorrência perfeita, sem custos de transação.');
  alternativo(`Equilíbrio em ${formatarNumero(pe,1)} reais e ${formatarNumero(qe,0)} unidades.`);
  contexto.aoAtualizar?.({pe,qe,tab});
 }
 tela.tela.addEventListener('redimensionar',desenhar);
 desenhar();
 return ()=>tela.destruir();
}

export function montarVotacao(area,parametros={},contexto={}){
 const candidatos=[{nome:'A',cor:paleta.azul},{nome:'B',cor:paleta.ambar},{nome:'C',cor:paleta.verde},{nome:'D',cor:paleta.rosa}];
 const controles=grupoControles(area,candidatos.map(c=>({chave:c.nome,rotulo:`Votos para ${c.nome} (milhares)`,min:0,max:100,passo:1,valor:{A:38,B:32,C:20,D:10}[c.nome],aoMudar:desenhar})));
 const tabela=criar('div',{classe:'rolagem-tabela'});area.append(tabela);
 const explicacao=painelExplicacao(area);
 function desenhar(){
  const votos=candidatos.map(c=>({...c,v:controles[c.nome].valor}));const total=votos.reduce((s,c)=>s+c.v,0)||1;
  const cadeiras=10;
  const quociente=total/cadeiras;
  const prop=votos.map(c=>({...c,inteiro:Math.floor(c.v/quociente),resto:c.v/quociente-Math.floor(c.v/quociente)}));
  let distribuidas=prop.reduce((s,c)=>s+c.inteiro,0);
  const ordem=[...prop].sort((a,b)=>b.resto-a.resto);for(let i=0;distribuidas<cadeiras;i++){ordem[i%ordem.length].inteiro++;distribuidas++;}
  const vencedor=[...votos].sort((a,b)=>b.v-a.v)[0];
  const segundo=[...votos].sort((a,b)=>b.v-a.v)[1];
  const maioriaAbsoluta=vencedor.v/total>.5;
  tabela.innerHTML=`<table class="tabela"><thead><tr><th>Candidato</th><th>Votos</th><th>%</th><th>Majoritário (1 cadeira)</th><th>Proporcional (10 cadeiras)</th></tr></thead><tbody>${votos.map(c=>`<tr><td style="color:${c.cor}"><strong>${c.nome}</strong></td><td>${c.v} mil</td><td>${formatarNumero(c.v/total*100,1)}%</td><td>${c===vencedor?'eleito':'—'}</td><td>${prop.find(p=>p.nome===c.nome).inteiro}</td></tr>`).join('')}</tbody></table>`;
  explicacao.definir(`No sistema <strong>majoritário</strong>, ${vencedor.nome} vence com ${formatarNumero(vencedor.v/total*100,1)}% dos votos${maioriaAbsoluta?' (maioria absoluta)':`; como não tem maioria absoluta, em muitos países haveria segundo turno entre ${vencedor.nome} e ${segundo.nome}`}. Os ${formatarNumero((total-vencedor.v)/total*100,1)}% restantes ficam sem representação direta. No <strong>proporcional</strong>, as 10 cadeiras se distribuem pelo quociente eleitoral (${formatarNumero(quociente,1)} mil votos por cadeira), com sobras pelos maiores restos: minorias ganham assento, mas é preciso formar coalizões para governar. Nenhum sistema é neutro: cada um favorece algo (governabilidade ou representatividade).`);
  contexto.aoAtualizar?.({votos:votos.map(c=>c.v),vencedor:vencedor.nome,cadeiras:prop.map(p=>p.inteiro)});
 }
 desenhar();
 return ()=>{};
}

export function montarDesigualdade(area,parametros={},contexto={}){
 const tela=criarTela(area,{largura:640,altura:300,descricao:'Curva de Lorenz'});
 const nomes=['20% mais pobres','20% seguintes','20% do meio','20% seguintes','20% mais ricos'];
 const controles=grupoControles(area,nomes.map((n,i)=>({chave:'q'+i,rotulo:`Renda média: ${n}`,min:1,max:100,passo:1,valor:[4,8,13,20,55][i],unidade:'mil',aoMudar:desenhar})));
 const leitura=criar('div',{classe:'leitura'});area.append(leitura);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 function desenhar(){
  const rendas=nomes.map((_,i)=>controles['q'+i].valor);const total=rendas.reduce((s,v)=>s+v,0);
  const acumulado=[0];rendas.forEach(v=>acumulado.push(acumulado[acumulado.length-1]+v/total));
  let areaLorenz=0;for(let i=0;i<5;i++)areaLorenz+=(acumulado[i]+acumulado[i+1])/2*.2;
  const gini=1-2*areaLorenz;
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const m=40,ex=x=>m+x*(A-2*m)+(L-A)/2,ey=y=>A-m-y*(A-2*m);
  c.strokeStyle='#8aa0a8';c.beginPath();c.moveTo(ex(0),ey(0));c.lineTo(ex(1),ey(0));c.moveTo(ex(0),ey(0));c.lineTo(ex(0),ey(1));c.stroke();
  c.strokeStyle='#ffffff55';c.setLineDash([4,4]);c.beginPath();c.moveTo(ex(0),ey(0));c.lineTo(ex(1),ey(1));c.stroke();c.setLineDash([]);
  c.fillStyle=paleta.ambar+'33';c.beginPath();c.moveTo(ex(0),ey(0));acumulado.forEach((v,i)=>c.lineTo(ex(i/5),ey(v)));c.lineTo(ex(1),ey(1));c.closePath();c.fill();
  c.strokeStyle=paleta.ouro;c.lineWidth=2.2;c.beginPath();acumulado.forEach((v,i)=>i?c.lineTo(ex(i/5),ey(v)):c.moveTo(ex(0),ey(0)));c.stroke();
  c.fillStyle='#a9bcc2';c.font='10px Arial';c.textAlign='center';c.fillText('população acumulada (dos mais pobres aos mais ricos) →',L/2,A-10);c.save();c.translate(ex(0)-26,A/2);c.rotate(-Math.PI/2);c.fillText('renda acumulada →',0,0);c.restore();c.textAlign='left';c.fillText('igualdade perfeita',ex(.55),ey(.6));
  const ricos=rendas[4]/total,pobres=rendas[0]/total;
  leitura.innerHTML=`<div><small>Índice de Gini</small><strong>${formatarNumero(gini,3)}</strong></div><div><small>Renda dos 20% mais ricos</small><strong>${formatarNumero(ricos*100,0)}<small>%</small></strong></div><div><small>Renda dos 20% mais pobres</small><strong>${formatarNumero(pobres*100,0)}<small>%</small></strong></div><div><small>Razão rico/pobre</small><strong>${formatarNumero(rendas[4]/rendas[0],1)}<small>×</small></strong></div>`;
  explicacao.definir(`A <strong>curva de Lorenz</strong> acumula a renda da população ordenada dos mais pobres aos mais ricos. Se todos ganhassem igual, seria a diagonal. Quanto mais a curva se afasta da diagonal, maior a desigualdade; o <strong>índice de Gini</strong> mede essa área: 0 é igualdade total, 1 é concentração total. Aqui, Gini = ${formatarNumero(gini,3)}: os 20% mais ricos ficam com ${formatarNumero(ricos*100,0)}% da renda e os 20% mais pobres com ${formatarNumero(pobres*100,0)}%. ${gini>.5?'Desigualdade alta, na faixa de países como o Brasil nas últimas décadas (Gini em torno de 0,5).':gini>.35?'Desigualdade moderada, típica de vários países de renda média e alta.':'Desigualdade baixa, como em alguns países do norte da Europa (Gini em torno de 0,25 a 0,3).'} Valores de referência aproximados.`);
  alternativo(`Gini ${formatarNumero(gini,3)}; 20% mais ricos com ${formatarNumero(ricos*100,0)}% da renda.`);
  contexto.aoAtualizar?.({gini,rendas});
 }
 tela.tela.addEventListener('redimensionar',desenhar);
 desenhar();
 return ()=>tela.destruir();
}

export function montarBensComuns(area,parametros={},contexto={}){
 const tela=criarTela(area,{largura:640,altura:260,descricao:'Estoque de peixes ao longo dos anos'});
 const controles=grupoControles(area,[{chave:'pescadores',rotulo:'Número de barcos',min:1,max:20,passo:1,valor:8,aoMudar:simular},{chave:'esforco',rotulo:'Captura por barco por ano',min:1,max:15,passo:.5,valor:5,unidade:'t',aoMudar:simular},{chave:'regra',rotulo:'Cota máxima por barco (0 = sem regra)',min:0,max:15,passo:.5,valor:0,unidade:'t',aoMudar:simular}]);
 const leitura=criar('div',{classe:'leitura'});area.append(leitura);
 const explicacao=painelExplicacao(area),alternativo=textoAlternativo(area);
 let serie=[];
 function simular(){
  const n=controles.pescadores.valor,e=controles.esforco.valor,regra=controles.regra.valor;const captura=regra?Math.min(e,regra):e;
  let estoque=200;serie=[];let totalPescado=0,colapso=null;
  for(let ano=0;ano<=40;ano++){serie.push(estoque);const crescimento=.4*estoque*(1-estoque/250);const pesca=Math.min(estoque,n*captura);totalPescado+=pesca;estoque=Math.max(0,estoque+crescimento-pesca);if(estoque<5&&colapso===null)colapso=ano;}
  desenhar();
  const sustentavel=serie[40]>60;
  leitura.innerHTML=`<div><small>Estoque após 40 anos</small><strong>${formatarNumero(serie[40],0)}<small>t</small></strong></div><div><small>Pescado total</small><strong>${formatarNumero(totalPescado,0)}<small>t</small></strong></div><div><small>Situação</small><strong>${colapso!==null?`colapso no ano ${colapso}`:sustentavel?'sustentável':'em declínio'}</strong></div>`;
  explicacao.definir(colapso!==null?`<strong>Tragédia dos comuns.</strong> Cada barco maximiza a própria captura; somadas, elas superam a capacidade de reprodução (cerca de 25 t/ano no máximo). O estoque colapsa no ano ${colapso} e, depois disso, ninguém pesca nada. Individualmente racional, coletivamente desastroso. Experimente uma cota ou menos barcos.`:sustentavel?`<strong>Uso sustentável.</strong> A captura total (${formatarNumero(n*captura,1)} t/ano) fica abaixo da reprodução do estoque, que se mantém. ${regra?'A cota funciona como regra coletiva: limita cada um para que todos continuem pescando.':'Com poucos barcos ou pouco esforço, a regra não é necessária; o problema aparece quando o número de usuários cresce.'}`:`<strong>Declínio lento.</strong> A pesca supera um pouco a reprodução; o estoque cai e, sem mudança, o colapso vem depois de 40 anos. Elinor Ostrom mostrou que comunidades conseguem evitar isso com regras próprias, monitoramento e sanções graduais, sem depender só do Estado ou da privatização.`);
  alternativo(`${n} barcos, ${captura} toneladas cada: estoque final ${formatarNumero(serie[40],0)}.`);
  contexto.aoAtualizar?.({n,captura,colapso,sustentavel});
 }
 function desenhar(){
  const {contexto:c,largura:L,altura:A}=tela;c.clearRect(0,0,L,A);
  const m=36,ex=t=>m+t/40*(L-2*m),ey=v=>A-m-v/250*(A-2*m);
  c.strokeStyle='#8aa0a8';c.beginPath();c.moveTo(m,A-m);c.lineTo(L-m,A-m);c.moveTo(m,A-m);c.lineTo(m,m);c.stroke();
  c.strokeStyle='#ffffff33';c.setLineDash([3,3]);c.beginPath();c.moveTo(m,ey(60));c.lineTo(L-m,ey(60));c.stroke();c.setLineDash([]);
  c.strokeStyle=paleta.verde;c.lineWidth=2.2;c.beginPath();serie.forEach((v,t)=>t?c.lineTo(ex(t),ey(v)):c.moveTo(ex(t),ey(v)));c.stroke();
  c.fillStyle='#a9bcc2';c.font='10px Arial';c.textAlign='center';c.fillText('anos →',L/2,A-8);c.textAlign='left';c.fillText('estoque de peixes (t)',m+4,m+2);c.fillText('limiar de risco',m+4,ey(60)-4);
 }
 tela.tela.addEventListener('redimensionar',desenhar);
 simular();
 return ()=>tela.destruir();
}

const INSTITUICOES=[
 {id:'familia',nome:'Família',funcao:'Cuidado, primeira socialização, transmissão de valores e patrimônio.',regras:'Normas de parentesco, obrigações de cuidado, leis de família.',mudanca:'Novos arranjos (famílias monoparentais, recompostas, casais sem filhos) e divisão do trabalho doméstico em transformação.'},
 {id:'escola',nome:'Escola',funcao:'Transmitir conhecimentos sistemáticos, preparar para o trabalho e para a cidadania.',regras:'Currículo, horários, avaliação, hierarquia professor-aluno.',mudanca:'Tecnologias digitais, debates sobre o que ensinar e sobre desigualdade de acesso.'},
 {id:'estado',nome:'Estado',funcao:'Produzir e aplicar leis, garantir direitos, prover serviços, deter o monopólio legítimo da força.',regras:'Constituição, leis, separação de poderes, eleições.',mudanca:'Disputas sobre o tamanho do Estado, participação direta e transparência.'},
 {id:'mercado',nome:'Mercado',funcao:'Coordenar produção e troca de bens e serviços por meio de preços.',regras:'Contratos, propriedade, concorrência, regulação.',mudanca:'Plataformas digitais, novas formas de trabalho e concentração econômica.'},
 {id:'midia',nome:'Mídia',funcao:'Informar, formar opinião, fiscalizar o poder, entreter.',regras:'Liberdade de imprensa, responsabilidade por conteúdo, ética jornalística.',mudanca:'Redes sociais, desinformação e crise do modelo de negócios do jornalismo.'},
 {id:'religiao',nome:'Religião',funcao:'Dar sentido, organizar comunidades, orientar a moral de grupos.',regras:'Doutrinas, ritos, hierarquias próprias; separação do Estado em regimes laicos.',mudanca:'Pluralismo, mudanças de filiação e debates sobre laicidade.'}
];
export function montarInstituicoes(area,parametros={},contexto={}){
 let atual=null,vistas=new Set();
 const grade=criar('div',{classe:'botoes-opcoes'});area.append(grade);
 const painel=criar('div',{classe:'painel-orgao'});area.append(painel);
 const explicacao=painelExplicacao(area);
 INSTITUICOES.forEach(i=>{const b=criar('button',{type:'button',classe:'botao pequeno secundario','aria-pressed':'false',texto:i.nome});b.onclick=()=>{atual=i;vistas.add(i.id);buscarTodos('button',grade).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));painel.innerHTML=`<h4>${i.nome}</h4><p><strong>Função:</strong> ${i.funcao}</p><p><strong>Regras e práticas:</strong> ${i.regras}</p><p><strong>Em transformação:</strong> ${i.mudanca}</p>`;explicacao.definir(`Instituições vistas: ${vistas.size} de ${INSTITUICOES.length}. Repare como cada uma tem função, regras e tensões próprias, e como todas se cruzam: a escola depende do Estado e da família; o mercado depende de leis; a mídia influencia todas.`);contexto.aoAtualizar?.({atual:i.id,vistas:[...vistas]});};grade.append(b);});
 painel.innerHTML='<p class="texto-apoio">Escolha uma instituição para ver função, regras e transformações.</p>';
 explicacao.definir('Instituições são padrões estáveis de regras e práticas que organizam esferas da vida social. Elas existem antes e depois das pessoas que as ocupam.');
 return ()=>{};
}
