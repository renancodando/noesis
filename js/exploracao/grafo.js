// Renan | renancodando
export function construirGrafo(catalogo,obterEstado){
 const nos=[],arestas=[],indice=new Map();
 const adicionar=no=>{indice.set(no.id,nos.length);nos.push(no);};
 catalogo.disciplinas.forEach(d=>adicionar({id:'d:'+d.id,tipo:'disciplina',nome:d.nome,cor:d.cor,raio:22,url:`/saberes/${d.id}`,disciplina:d.id,descricao:d.descricao}));
 catalogo.aulas.forEach(a=>{const d=catalogo.disciplinas.find(x=>x.id===a.disciplina);adicionar({id:'a:'+a.id,tipo:'aula',nome:a.titulo,cor:d?.cor||'#d1ad6c',raio:11,url:`/saberes/${a.id}`,disciplina:a.disciplina,estado:obterEstado(a.id),descricao:a.resumo});arestas.push({de:'d:'+a.disciplina,para:'a:'+a.id,tipo:'pertence'});});
 catalogo.aulas.forEach(a=>{(a.prerequisitos||[]).forEach(p=>{if(indice.has('a:'+p))arestas.push({de:'a:'+p,para:'a:'+a.id,tipo:'prerequisito'});});(a.relacionados||[]).forEach(r=>{if(indice.has('a:'+r)&&!arestas.some(e=>(e.de==='a:'+a.id&&e.para==='a:'+r)||(e.de==='a:'+r&&e.para==='a:'+a.id)))arestas.push({de:'a:'+a.id,para:'a:'+r,tipo:'relacionado'});});});
 catalogo.conceitos.forEach(c=>{const primeira=catalogo.aulas.find(a=>a.id===c.aulas[0]);const d=catalogo.disciplinas.find(x=>x.id===primeira?.disciplina);adicionar({id:'c:'+c.id,tipo:'conceito',nome:c.nome,cor:d?.cor||'#aeb9b7',raio:5,url:`/saberes/${c.aulas[0]}#conceito-${c.id}`,disciplina:primeira?.disciplina,descricao:c.definicao});c.aulas.forEach(a=>arestas.push({de:'a:'+a,para:'c:'+c.id,tipo:'conceito'}));});
 catalogo.laboratorios.forEach(l=>{adicionar({id:'l:'+l.id,tipo:'laboratorio',nome:l.nome,cor:l.cor,raio:13,url:`/laboratorios/${l.id}`,disciplina:l.disciplina,descricao:l.descricao});(l.aulas||[]).forEach(a=>{if(indice.has('a:'+a))arestas.push({de:'a:'+a,para:'l:'+l.id,tipo:'laboratorio'});});});
 catalogo.projetos.forEach(p=>{adicionar({id:'p:'+p.id,tipo:'projeto',nome:p.nome,cor:'#e0a85a',raio:12,url:`/construir/${p.id}`,disciplina:p.disciplinas[0],descricao:p.descricao});(p.conhecimentos||[]).forEach(a=>{if(indice.has('a:'+a))arestas.push({de:'a:'+a,para:'p:'+p.id,tipo:'projeto'});});});
 arestas.forEach(e=>{e.i=indice.get(e.de);e.j=indice.get(e.para);});
 return {nos,arestas:arestas.filter(e=>e.i!==undefined&&e.j!==undefined),indice};
}

export function criarSimulacao(grafo,largura,altura){
 const {nos,arestas}=grafo;
 nos.forEach((no,i)=>{const a=i/nos.length*Math.PI*2;const r=no.tipo==='disciplina'?120:no.tipo==='conceito'?320:220;no.x=largura/2+Math.cos(a)*r+(Math.random()-.5)*40;no.y=altura/2+Math.sin(a)*r+(Math.random()-.5)*40;no.vx=0;no.vy=0;});
 const vizinhos=nos.map(()=>new Set());arestas.forEach(e=>{vizinhos[e.i].add(e.j);vizinhos[e.j].add(e.i);});
 let temperatura=1;
 function passo(visiveis){
  const n=nos.length;
  for(let i=0;i<n;i++){const a=nos[i];if(!visiveis[i])continue;for(let j=i+1;j<n;j++){const b=nos[j];if(!visiveis[j])continue;let dx=b.x-a.x,dy=b.y-a.y;let d2=dx*dx+dy*dy;if(d2<1){dx=(Math.random()-.5);dy=(Math.random()-.5);d2=1;}if(d2>90000)continue;const forca=(a.raio+b.raio+18)*(a.raio+b.raio+18)/d2*.6;const fx=dx*forca,fy=dy*forca;if(!a.fixo){a.vx-=fx;a.vy-=fy;}if(!b.fixo){b.vx+=fx;b.vy+=fy;}}}
  arestas.forEach(e=>{if(!visiveis[e.i]||!visiveis[e.j])return;const a=nos[e.i],b=nos[e.j];const dx=b.x-a.x,dy=b.y-a.y;const d=Math.hypot(dx,dy)||1;const ideal=e.tipo==='pertence'?90:e.tipo==='conceito'?40:110;const k=(d-ideal)/d*(e.tipo==='conceito'?.08:.04);if(!a.fixo){a.vx+=dx*k;a.vy+=dy*k;}if(!b.fixo){b.vx-=dx*k;b.vy-=dy*k;}});
  const cx=largura/2,cy=altura/2;
  nos.forEach((no,i)=>{if(!visiveis[i]||no.fixo)return;no.vx+=(cx-no.x)*.004;no.vy+=(cy-no.y)*.004;no.vx*=.72;no.vy*=.72;const v=Math.hypot(no.vx,no.vy),max=12*temperatura+.5;if(v>max){no.vx*=max/v;no.vy*=max/v;}no.x+=no.vx;no.y+=no.vy;});
  temperatura=Math.max(0,temperatura-.004);
  return temperatura>0;
 }
 return {passo,aquecer(){temperatura=Math.max(temperatura,.5);},vizinhos};
}
