// Renan | renancodando
import {diaDe} from '../utilitarios/texto.js';
import {calcularProximaRevisao,criarCartao} from '../revisoes/agendador.js';

export function gerarDemonstracao(catalogo){
 const agora=new Date();
 const dia=n=>{const d=new Date(agora);d.setDate(d.getDate()-n);return d;};
 const aulas=catalogo.aulas.slice(0,Math.min(9,catalogo.aulas.length));
 const progressoAulas=[],tentativas=[],revisoes=[],atividades=[],laboratorios=[],projetos=[],descobertas=[],acervo=[],anotacoes=[];
 let semente=17;const acaso=()=>{semente=(semente*16807)%2147483647;return semente/2147483647;};
 aulas.forEach((aula,i)=>{
  const concluida=i<6;const inicio=dia(28-i*3);
  const exercicios=aula.exercicios||0;const corretos=[],tentados=[];
  for(let k=1;k<=exercicios;k++){const id=`e${k}`;const correta=acaso()>.3;tentados.push(id);if(correta||concluida)corretos.push(id);tentativas.push({aula:aula.id,disciplina:aula.disciplina,exercicio:id,conceito:aula.conceitos?.[k%Math.max(1,(aula.conceitos||[]).length)]||null,correta:correta||concluida,resposta:'demo',tentativa:correta?1:2,usouDica:!correta,tempo:40+Math.round(acaso()*90),data:inicio.toISOString(),dia:diaDe(inicio)});}
  progressoAulas.push({aula:aula.id,disciplina:aula.disciplina,iniciadaEm:inicio.toISOString(),ultimoAcesso:inicio.toISOString(),concluidaEm:concluida?dia(27-i*3).toISOString():null,blocosVistos:Array.from({length:8},(_,b)=>b),exerciciosCorretos:corretos,exerciciosTentados:tentados,praticaConcluida:concluida,tempoEstimado:aula.duracao||25});
  atividades.push({tipo:'aula-iniciada',descricao:`Começou a aula “${aula.titulo}”`,referencia:aula.id,xp:0,data:inicio.toISOString(),dia:diaDe(inicio)});
  if(concluida){atividades.push({tipo:'aula-concluida',descricao:`Concluiu a aula “${aula.titulo}”`,referencia:aula.id,xp:120,data:dia(27-i*3).toISOString(),dia:diaDe(dia(27-i*3))});
   for(let r=1;r<=(aula.revisoes||0);r++){let cartao=criarCartao({id:`${aula.id}#revisao-${r}`,aula:aula.id,disciplina:aula.disciplina,conceito:aula.conceitos?.[r-1]||null,pergunta:`Pergunta de revisão ${r} de “${aula.titulo}”`,resposta:'<p>Resposta registrada na aula.</p>'});const revisadas=Math.min(3,Math.floor((27-i*3)/6));for(let v=0;v<revisadas;v++){const q=acaso()>.25?4:3;cartao={...cartao,...calcularProximaRevisao(cartao,q,diaDe(dia(27-i*3-v*6)))};cartao.historico.push({data:dia(27-i*3-v*6).toISOString(),qualidade:q});atividades.push({tipo:'revisao',descricao:`Revisou “${cartao.pergunta}”`,referencia:aula.id,xp:10,qualidade:q,data:dia(27-i*3-v*6).toISOString(),dia:diaDe(dia(27-i*3-v*6))});}if(i<2)cartao.proxima=diaDe(dia(1));revisoes.push(cartao);}}
 });
 ['prisma','axioma','nucleo'].forEach((id,i)=>{laboratorios.push({id,atividadeGuiada:true,desafio:i<2,estado:null,visitas:3+i,atualizadoEm:dia(10-i).toISOString()});atividades.push({tipo:'atividade-guiada',descricao:`Atividade guiada concluída em ${id.toUpperCase()}`,referencia:id,xp:60,data:dia(10-i).toISOString(),dia:diaDe(dia(10-i))});});
 projetos.push({id:'calculadora',estado:null,concluidoEm:dia(5).toISOString(),resultados:[{data:dia(5).toISOString(),resumo:'11 de 11 testes aprovados'}],versoes:4,iniciadoEm:dia(8).toISOString()});
 atividades.push({tipo:'projeto',descricao:'Concluiu o projeto “Construir uma calculadora”',referencia:'calculadora',xp:200,data:dia(5).toISOString(),dia:diaDe(dia(5))});
 descobertas.push({id:'descoberta-demo-1',titulo:'Duas reflexões valem uma rotação',texto:'No AXIOMA, refletir uma figura no eixo x e depois no eixo y dá o mesmo resultado de girá-la 180°. Isso explica por que algumas simetrias “parecem” rotações.',disciplina:'exatas',origem:'perfil de demonstração',data:dia(6).toISOString(),dia:diaDe(dia(6))});
 if(aulas[0])acervo.push({id:'aula:'+aulas[0].id,tipo:'aula',referencia:aulas[0].id,titulo:aulas[0].titulo,disciplina:aulas[0].disciplina,colecoes:[],favorito:true,salvoEm:dia(20).toISOString()});
 if(aulas[0])anotacoes.push({id:'anotacao-demo-1',referencia:aulas[0].id,tipo:'aula',titulo:aulas[0].titulo,disciplina:aulas[0].disciplina,texto:'Lembrar: o coeficiente b é onde a reta corta o eixo y. Testar com b negativo.',criadaEm:dia(20).toISOString(),atualizadaEm:dia(20).toISOString()});
 const xp=atividades.reduce((s,a)=>s+(a.xp||0),0)+tentativas.filter(t=>t.correta).length*12;
 const diasEstudo=[...new Set(atividades.map(a=>a.dia))].sort();
 return {perfil:{nome:'Demonstração',xp,demonstracao:true,visitados:['exatas','vida','tecnologia'],salvos:['prisma'],concluidos:['prisma'],missao:false,anotacoes:[],agenda:[],notificacoesLidas:true,diasEstudo,criadoEm:dia(30).toISOString()},armazens:{progressoAulas,tentativas,revisoes,atividades,laboratorios,projetos,descobertas,acervo,anotacoes,colecoes:[],meta:[{chave:'demonstracao',valor:true}]}};
}
