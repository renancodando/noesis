// Renan | renancodando
const cache=new Map();

async function carregarJson(caminho){
 if(cache.has(caminho))return cache.get(caminho);
 const promessa=fetch(caminho,{cache:'force-cache'}).then(resposta=>{
  if(!resposta.ok)throw new Error(`Conteúdo indisponível: ${caminho}`);
  return resposta.json();
 }).catch(erro=>{cache.delete(caminho);throw erro;});
 cache.set(caminho,promessa);
 return promessa;
}

export function carregarCatalogo(){return carregarJson('/conteudos/catalogo.json');}
export function carregarIndiceBusca(){return carregarJson('/conteudos/busca.json');}

export async function carregarAula(id){
 const [disciplina,chave]=String(id).split('/');
 if(!disciplina||!chave)throw new Error('Identificador de aula inválido');
 const aula=await carregarJson(`/conteudos/${disciplina}/${chave}.json`);
 return {...aula,id:`${disciplina}/${chave}`,chave,disciplina};
}

export async function disciplinaDe(id){
 const catalogo=await carregarCatalogo();
 return catalogo.disciplinas.find(item=>item.id===id)||null;
}

export async function aulasDaDisciplina(id){
 const catalogo=await carregarCatalogo();
 const disciplina=catalogo.disciplinas.find(item=>item.id===id);
 if(!disciplina)return [];
 return disciplina.jornada.etapas.map(chave=>catalogo.aulas.find(aula=>aula.id===`${id}/${chave}`)).filter(Boolean);
}

export async function resumoAula(id){
 const catalogo=await carregarCatalogo();
 return catalogo.aulas.find(aula=>aula.id===id)||null;
}

export async function laboratorioDe(id){
 const catalogo=await carregarCatalogo();
 return catalogo.laboratorios.find(item=>item.id===id)||null;
}

export async function projetoDe(id){
 const catalogo=await carregarCatalogo();
 return catalogo.projetos.find(item=>item.id===id)||null;
}
