// Renan | renancodando
import * as T from '../../bibliotecas/three.module.min.js';
import {ruidoNatural,prepararReflexos,criarTexturasFisicas} from './materiais.js';

export function iniciarUniverso(dominios) {
 const tela=document.querySelector('#cenario-vivo'),palco=document.querySelector('.palco-orbital');
 const reduzir=matchMedia('(prefers-reduced-motion: reduce)'),ponteiroFino=matchMedia('(pointer:fine)');
 const renderizador=new T.WebGLRenderer({canvas:tela,alpha:true,antialias:true,powerPreference:'low-power'});
 renderizador.outputColorSpace=T.SRGBColorSpace;renderizador.toneMapping=T.ACESFilmicToneMapping;renderizador.toneMappingExposure=1.1;renderizador.autoClear=false;
 const cena=new T.Scene(),ambiente=new T.Scene(),cameraAmbiente=new T.OrthographicCamera(-1,1,1,-1,0,10),camera=new T.OrthographicCamera(-6.5,6.5,3,-3,.1,100);
 camera.position.set(0,0,20);camera.lookAt(0,0,0);cameraAmbiente.position.z=1;
 const reflexos=prepararReflexos(renderizador,cena),texturasFisicas=criarTexturasFisicas();
 cena.add(new T.HemisphereLight(0xd0e8fa,0x644529,.68));const luzQuente=new T.DirectionalLight(0xffe1ad,2.1);luzQuente.position.set(-3,5,8);cena.add(luzQuente);const luzFria=new T.DirectionalLight(0xa5cfff,1.15);luzFria.position.set(5,-1,4);cena.add(luzFria);
 const grupo=new T.Group();cena.add(grupo);let largura=innerWidth,altura=innerHeight,area,alturaMundo=6,tempo=0,anterior=0,ultimoQuadro=0,quadro=0,pausado=false,oculto=document.body.dataset.ambiente&&document.body.dataset.ambiente!=='santuario',qualidade='equilibrada',foco='',intensidade=0;
 const alvoParalaxe=new T.Vector2(),texturas=[...Object.values(texturasFisicas),reflexos.texture],animacoes=[],aneis=[],objetos=new Map();
 const uniformes={imagem:{value:null},tempo:{value:0},recorte:{value:new T.Vector4(0,0,1,1)}};
 const materialAmbiente=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:uniformes,vertexShader:'varying vec2 coordenada;void main(){coordenada=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`precision mediump float;varying vec2 coordenada;uniform sampler2D imagem;uniform mediump float tempo;uniform vec4 recorte;${ruidoNatural}
 void main(){vec2 p=vec2(coordenada.x,1.-coordenada.y)*recorte.zw+recorte.xy;vec3 original=texture2D(imagem,p).rgb;
 float quedaA=smoothstep(.69,.71,p.x)*(1.-smoothstep(.75,.765,p.x))*smoothstep(.14,.16,p.y)*(1.-smoothstep(.28,.31,p.y));
 float quedaB=smoothstep(.645,.665,p.x)*(1.-smoothstep(.724,.745,p.x))*smoothstep(.29,.32,p.y)*(1.-smoothstep(.43,.46,p.y));float agua=max(quedaA,quedaB);
 float corrente=camadas(vec2(p.x*390.+sin(p.y*18.)*.8,p.y*82.-tempo*3.2));
 float filetes=ruido(vec2(p.x*870.,p.y*110.-tempo*5.4));
 float luzAgua=smoothstep(.15,.55,dot(original,vec3(.25,.55,.2)));
 agua*=luzAgua;
 vec2 deslocamento=vec2((corrente-.5)*.0032,(camadas(vec2(p.x*200.,p.y*72.-tempo*2.7))-.5)*.008)*agua;
 float verde=smoothstep(.015,.07,original.g-original.r*.9)*max(1.-smoothstep(.15,.29,p.y),1.-smoothstep(.19,.3,p.x));
 deslocamento.x+=verde*(sin(p.y*23.+tempo*.6+p.x*18.)+sin(p.x*39.+tempo*.8))*.0013;
 deslocamento.y+=verde*sin(p.x*30.+tempo*.4+p.y*11.)*.0008;
 float rio=exp(-pow((p.y-.49)*25.,2.))*smoothstep(.4,.6,p.x)*(1.-smoothstep(.75,.85,p.x));deslocamento+=rio*vec2(sin(p.y*160.-tempo*3.)*.0006,cos(p.x*120.-tempo*4.)*.0007);
 vec3 cor=texture2D(imagem,p+deslocamento).rgb;float lanterna=exp(-dot((p-vec2(.294,.267))*vec2(15.,17.),(p-vec2(.294,.267))*vec2(15.,17.)));float chama=.04+sin(tempo*4.3)*.012+sin(tempo*7.7+.3)*.009;
 cor+=vec3(.42,.22,.06)*lanterna*chama;float nevoa=exp(-pow((p.x-.69)*22.,2.)-pow((p.y-.445)*33.,2.));cor+=vec3(.05,.065,.07)*nevoa*(.3+camadas(vec2(p.x*50.-tempo*.13,p.y*60.+tempo*.07)));
 cor=mix(cor,vec3(.71,.88,.94),agua*smoothstep(.56,.84,corrente+filetes*.19)*.32);cor+=vec3(.02,.055,.072)*agua*(filetes-.5);cor+=vec3(.035,.05,.055)*nevoa*ruido(vec2(p.x*180.-tempo*.3,p.y*420.+tempo*.6));float sombra=.23*exp(-dot((p-vec2(.5,.31))*vec2(2.5,2.),(p-vec2(.5,.31))*vec2(2.5,2.)));cor*=1.-sombra;gl_FragColor=vec4(cor,1.);}`});
 const plano=new T.Mesh(new T.PlaneGeometry(2,2),materialAmbiente);plano.frustumCulled=false;plano.renderOrder=-10;plano.visible=false;ambiente.add(plano);
 new T.TextureLoader().load('/ativos/biblioteca.webp',textura=>{textura.flipY=false;textura.colorSpace=T.NoColorSpace;uniformes.imagem.value=textura;texturas.push(textura);plano.visible=true;desenhar();});
 const posicoes=new Float32Array(140*3),sementes=new Float32Array(140);
 for(let i=0;i<140;i++){posicoes[i*3]=Math.random()*2-1;posicoes[i*3+1]=Math.random()*2-1;posicoes[i*3+2]=Math.random();sementes[i]=Math.random();}
 const geometriaPoeira=new T.BufferGeometry();geometriaPoeira.setAttribute('position',new T.BufferAttribute(posicoes,3));geometriaPoeira.setAttribute('semente',new T.BufferAttribute(sementes,1));
 const poeiraMaterial=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:T.AdditiveBlending,uniforms:{tempo:{value:0}},vertexShader:'attribute float semente;uniform mediump float tempo;varying float transparencia;void main(){vec3 p=position;p.x+=sin(tempo*.08+semente*31.)*.03;p.y=mod(p.y+tempo*(.005+semente*.012)+1.,2.)-1.;transparencia=(1.-abs(p.y))*(.12+semente*.4);gl_Position=vec4(p.xy,0.,1.);gl_PointSize=1.+semente*2.2;}',fragmentShader:'precision mediump float;varying float transparencia;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(1.,.83,.52,exp(-d*d*20.)*transparencia);}'});
 const poeira=new T.Points(geometriaPoeira,poeiraMaterial);poeira.frustumCulled=false;poeira.renderOrder=5;ambiente.add(poeira);
 const gotasMaterial=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:T.AdditiveBlending,uniforms:{tempo:uniformes.tempo,recorte:uniformes.recorte},vertexShader:'attribute float semente;uniform mediump float tempo;uniform vec4 recorte;varying float transparencia;void main(){float fase=mod(tempo*(.2+semente*.18)+position.y+1.,1.);vec2 p=vec2(.66+semente*.075,.30+fase*.15);vec2 tela=(p-recorte.xy)/recorte.zw;gl_Position=vec4(tela.x*2.-1.,1.-tela.y*2.,0.,1.);gl_PointSize=1.+semente*1.2;transparencia=sin(fase*3.14159)*.32;}',fragmentShader:'precision mediump float;varying float transparencia;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(.8,.93,1.,exp(-d*d*14.)*transparencia);}'});const gotas=new T.Points(geometriaPoeira,gotasMaterial);gotas.frustumCulled=false;gotas.renderOrder=6;ambiente.add(gotas);
 function material(cor,opcoes={}){return new T.MeshStandardMaterial({color:cor,roughness:.42,metalness:.25,...opcoes});}
 function brilho(cor){const desenho=document.createElement('canvas');desenho.width=desenho.height=64;const contexto=desenho.getContext('2d'),gradiente=contexto.createRadialGradient(32,32,0,32,32,32);gradiente.addColorStop(0,'#ffffff');gradiente.addColorStop(.18,cor);gradiente.addColorStop(1,'transparent');contexto.fillStyle=gradiente;contexto.fillRect(0,0,64,64);const textura=new T.CanvasTexture(desenho);texturas.push(textura);return textura;}
 const brilhoDourado=brilho('#ffd377'),brilhoBranco=brilho('#d8f1ff');
 function aura(cor,tamanho=1.6){const desenho=new T.Sprite(new T.SpriteMaterial({map:cor==='ouro'?brilhoDourado:brilhoBranco,color:cor==='ouro'?0xffd28a:new T.Color(cor),transparent:true,opacity:.2,blending:T.AdditiveBlending,depthWrite:false}));desenho.scale.set(tamanho,tamanho,1);return desenho;}
 function letra(texto,cor='#e6d8bd'){const desenho=document.createElement('canvas');desenho.width=desenho.height=64;const contexto=desenho.getContext('2d');contexto.fillStyle=cor;contexto.textAlign='center';contexto.textBaseline='middle';contexto.font='42px Georgia';contexto.fillText(texto,32,35);const textura=new T.CanvasTexture(desenho);texturas.push(textura);const imagem=new T.Sprite(new T.SpriteMaterial({map:textura,transparent:true,depthWrite:false}));imagem.scale.set(.27,.27,1);return imagem;}
 function mundo(x,y,z=0){return new T.Vector3((x/100-.5)*13,(.5-y/100)*alturaMundo,z);}
 function casca(cor){
  const vidro=new T.Mesh(new T.SphereGeometry(.71,48,32),new T.MeshPhysicalMaterial({color:cor,metalness:0,roughness:.065,transparent:true,opacity:.16,clearcoat:1,clearcoatRoughness:.035,ior:1.46,envMapIntensity:1.8,depthWrite:false}));
  vidro.renderOrder=3;
  const atmosfera=new T.Mesh(new T.SphereGeometry(.716,40,28),new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{cor:{value:new T.Color(cor)}},vertexShader:'varying vec3 normalLocal;void main(){normalLocal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'precision mediump float;uniform vec3 cor;varying vec3 normalLocal;void main(){vec3 n=normalize(normalLocal);float borda=pow(1.-max(0.,n.z),3.2);float luz=.3+.7*max(0.,dot(n,normalize(vec3(-.5,.8,1.))));float janela=exp(-pow((n.x+.34)*9.,2.)-pow((n.y-.62)*5.5,2.));float recorte=pow(max(0.,dot(n,normalize(vec3(.6,.17,.75)))),80.);vec3 reflexo=mix(cor,vec3(.8,.91,1.),.35)*luz+vec3(janela*.65+recorte*.45);gl_FragColor=vec4(reflexo,borda*.58+janela*.29+recorte*.23);}'}));
  atmosfera.renderOrder=4;vidro.add(atmosfera);
  const interior=new T.Mesh(new T.SphereGeometry(.69,40,28),new T.ShaderMaterial({side:T.BackSide,transparent:true,depthWrite:false,uniforms:{cor:{value:new T.Color(cor)},paisagem:uniformes.imagem},vertexShader:'varying vec3 normalLocal;void main(){normalLocal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'precision mediump float;uniform vec3 cor;uniform sampler2D paisagem;varying vec3 normalLocal;void main(){vec3 n=normalize(normalLocal);float borda=pow(1.-abs(n.z),1.6);vec3 reflexo=texture2D(paisagem,vec2(.55+n.x*.13,.27-n.y*.15)).rgb;vec3 volume=mix(cor*.18,reflexo*.48,.4)*(1.-borda*.65);gl_FragColor=vec4(volume,.46+borda*.18);}'}));
  interior.renderOrder=1;vidro.add(interior);
  return vidro;
 }
 function esferaPlaneta(){return new T.Mesh(new T.SphereGeometry(.64,40,28),new T.ShaderMaterial({uniforms:{tempo:{value:0}},vertexShader:'varying vec3 ponto;varying vec3 normalLocal;void main(){ponto=position;normalLocal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`precision mediump float;uniform mediump float tempo;varying vec3 ponto;varying vec3 normalLocal;void main(){vec3 p=normalize(ponto);float terra=sin(p.x*9.+p.z*5.)+sin(p.y*11.-p.z*6.)*.6+sin(p.x*18.+p.y*7.)*.3;vec3 cor=mix(vec3(.035,.15,.4),vec3(.22,.37,.16),smoothstep(.05,.32,terra));float nuvem=sin(atan(p.z,p.x)*15.+p.y*20.+tempo*.1)+sin(p.y*32.-p.x*13.);cor=mix(cor,vec3(.7,.8,.83),smoothstep(1.3,1.8,nuvem)*.65);float luz=.28+.85*max(0.,dot(normalize(normalLocal),normalize(vec3(-.6,.8,1.))));gl_FragColor=vec4(cor*luz,1.);}`}));}
 function criarExatas(conjunto){conjunto.add(casca('#7c83d0'));const centro=new T.Mesh(new T.SphereGeometry(.09,12,10),material('#ffcfbd',{emissive:'#d76550',emissiveIntensity:2}));conjunto.add(centro,aura('#d9a0ff',1.55));const particulas=[];for(let i=0;i<3;i++){const anel=new T.Mesh(new T.TorusGeometry(.5,.009,6,80),new T.MeshBasicMaterial({color:[0xeebd7d,0xb9a8ec,0xf0a6bd][i],transparent:true,opacity:.8}));anel.rotation.set(i*.9,.4+i*.7,.3);conjunto.add(anel);const ponto=new T.Mesh(new T.SphereGeometry(.035,8,6),new T.MeshBasicMaterial({color:0xfff0cd}));anel.add(ponto);particulas.push(ponto);}['π','∑','∞'].forEach((texto,i)=>{const simbolo=letra(texto);simbolo.position.set(Math.sin(i*2.1)*.43,Math.cos(i*2.1)*.38,.25);conjunto.add(simbolo)});return t=>{particulas.forEach((p,i)=>p.position.set(Math.cos(t*.6+i*2)*.5,Math.sin(t*.6+i*2)*.5,0));};}
 function criarVida(conjunto){conjunto.add(casca('#38c7b7'));const estrutura=new T.Group();estrutura.rotation.z=-.35;conjunto.add(estrutura);const fios=[[],[]],barras=[],auxiliar=new T.Object3D(),nos=new T.InstancedMesh(new T.SphereGeometry(.044,12,8),material('#a4e5c2',{emissive:'#1b7972',emissiveIntensity:.5}),32);for(let i=0;i<16;i++){const y=-.48+i*.064,angulo=i*.52;for(let lado=0;lado<2;lado++){const p=new T.Vector3(Math.cos(angulo+lado*Math.PI)*.21,y,Math.sin(angulo+lado*Math.PI)*.21);fios[lado].push(p);auxiliar.position.copy(p);auxiliar.updateMatrix();nos.setMatrixAt(i*2+lado,auxiliar.matrix)}barras.push(...fios[0][i].toArray(),...fios[1][i].toArray())}fios.forEach(pontos=>estrutura.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pontos),64,.018,6,false),material('#84e7d4',{emissive:'#229b8e',emissiveIntensity:.5}))));const geometria=new T.BufferGeometry();geometria.setAttribute('position',new T.Float32BufferAttribute(barras,3));estrutura.add(nos,new T.LineSegments(geometria,new T.LineBasicMaterial({color:'#bad9b7',transparent:true,opacity:.6})));return t=>estrutura.rotation.y=t*.32;}
 function criarTemplo(conjunto){
  conjunto.add(casca('#b1a2b6'));
  const templo=new T.Group();templo.position.y=-.19;templo.rotation.x=.06;conjunto.add(templo);
  const pedra=material('#ded4c0',{map:texturasFisicas.pedra,bumpMap:texturasFisicas.pedra,bumpScale:.008,roughness:.73,metalness:0});
  const sombra=material('#685c4f',{roughness:1,metalness:0});
  function bloco(largura,altura,fundo,y,z=0,acabamento=pedra){const bloco=new T.Mesh(new T.BoxGeometry(largura,altura,fundo),acabamento);bloco.position.set(0,y,z);templo.add(bloco);return bloco;}
  bloco(1.14,.055,.75,-.27);bloco(1.06,.055,.69,-.215);bloco(.98,.045,.63,-.165);
  bloco(.76,.42,.045,.06,-.215,sombra);
  bloco(1.04,.055,.69,.365);bloco(1.08,.034,.72,.414);bloco(1.12,.025,.74,.45);
  const formato=new T.Shape();formato.moveTo(-.55,0);formato.lineTo(0,.21);formato.lineTo(.55,0);formato.closePath();
  const telhado=new T.Mesh(new T.ExtrudeGeometry(formato,{depth:.7,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2}),pedra);telhado.position.set(0,.468,-.35);templo.add(telhado);
  const frontao=new T.Mesh(new T.ShapeGeometry(formato),material('#998d79',{map:texturasFisicas.pedra,roughness:.8,metalness:0}));frontao.scale.set(.82,.72,1);frontao.position.set(0,.49,.361);templo.add(frontao);
  const geometriaColuna=new T.CylinderGeometry(.033,.047,.47,32,1);
  const posicoes=geometriaColuna.attributes.position;
  for(let i=0;i<posicoes.count;i++){const x=posicoes.getX(i),z=posicoes.getZ(i),angulo=Math.atan2(z,x),fator=1-Math.pow((1+Math.cos(angulo*16))*.5,2)*.105;posicoes.setX(i,x*fator);posicoes.setZ(i,z*fator);}
  geometriaColuna.computeVertexNormals();
  const colunas=new T.InstancedMesh(geometriaColuna,pedra,12),bases=new T.InstancedMesh(new T.CylinderGeometry(.057,.061,.035,20),pedra,24),capiteis=new T.InstancedMesh(new T.BoxGeometry(.105,.035,.105),pedra,12),auxiliar=new T.Object3D();
  for(let i=0;i<12;i++){
   const x=-.4+(i%6)*.16,z=i<6?.25:-.25;auxiliar.position.set(x,.095,z);auxiliar.updateMatrix();colunas.setMatrixAt(i,auxiliar.matrix);
   auxiliar.position.y=-.13;auxiliar.updateMatrix();bases.setMatrixAt(i*2,auxiliar.matrix);auxiliar.position.y=.325;auxiliar.updateMatrix();bases.setMatrixAt(i*2+1,auxiliar.matrix);
   auxiliar.position.y=.345;auxiliar.updateMatrix();capiteis.setMatrixAt(i,auxiliar.matrix);
  }
  templo.add(colunas,bases,capiteis);
  const juntas=[];for(let i=0;i<10;i++){const x=-.48+i*.107;juntas.push(x,.398,.351,x,.373,.351);}
  templo.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(juntas,3)),new T.LineBasicMaterial({color:'#8b795c',transparent:true,opacity:.6})));
  return t=>templo.rotation.y=.33+Math.sin(t*.16)*.13;
 }
 function engrenagem(raio,dentes,cor){
  const forma=new T.Shape(),passos=dentes*4;
  for(let i=0;i<=passos;i++){const angulo=i/passos*Math.PI*2,r=raio*(i%4===0||i%4===3?.85:1);const x=Math.cos(angulo)*r,y=Math.sin(angulo)*r;if(i===0)forma.moveTo(x,y);else forma.lineTo(x,y);}
  const furo=new T.Path();furo.absarc(0,0,raio*.2,0,Math.PI*2,true);forma.holes.push(furo);
  for(let i=0;i<6;i++){const angulo=i*Math.PI/3,janela=new T.Path();janela.absarc(Math.cos(angulo)*raio*.54,Math.sin(angulo)*raio*.54,raio*.13,0,Math.PI*2,true);forma.holes.push(janela);}
  const roda=new T.Mesh(new T.ExtrudeGeometry(forma,{depth:.09,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:3,curveSegments:20}),material(cor,{map:texturasFisicas.metal,bumpMap:texturasFisicas.metal,bumpScale:.002,metalness:.91,roughness:.26}));
  const eixo=new T.Mesh(new T.CylinderGeometry(raio*.12,raio*.12,.14,20),material('#625843',{metalness:.9,roughness:.25}));eixo.rotation.x=Math.PI/2;eixo.position.z=.04;roda.add(eixo);
  const sulco=new T.Mesh(new T.TorusGeometry(raio*.76,.006,6,48),material('#d6bd83',{metalness:1,roughness:.22}));sulco.position.z=.104;roda.add(sulco);
  return roda;
 }
 function criarTecnologia(conjunto){conjunto.rotation.y=-.18;conjunto.add(casca('#789eb5'));const rodas=[engrenagem(.3,14,'#c6b99b'),engrenagem(.22,11,'#9da6a7'),engrenagem(.16,8,'#b99762')];rodas[0].position.set(-.2,-.16,.23);rodas[1].position.set(.22,.13,.2);rodas[2].position.set(-.25,.32,.19);rodas.forEach(roda=>conjunto.add(roda));return t=>{rodas[0].rotation.z=t*.18;rodas[1].rotation.z=-t*.18*.3/.22+.16;rodas[2].rotation.z=-t*.18*.3/.16;};}
 function criarGeografia(conjunto){
  conjunto.add(casca('#90bdd5'));
  const paisagem=new T.Group();paisagem.position.y=-.27;paisagem.rotation.x=.22;conjunto.add(paisagem);
  const terreno=new T.PlaneGeometry(1.22,1.12,64,60);terreno.rotateX(-Math.PI/2);
  const posicoes=terreno.attributes.position,cores=new Float32Array(posicoes.count*3),cor=new T.Color();
  function relevo(x,z){
   const cristas=.66*Math.exp(-((x+.09)**2*30+(z+.12)**2*17))+.43*Math.exp(-((x-.32)**2*36+(z+.04)**2*33))+.36*Math.exp(-((x+.37)**2*54+(z-.04)**2*35));
   const fraturas=Math.sin(x*28+z*19)*Math.sin(z*23-x*12)*.043+Math.sin(x*67-z*32)*.016;
   return Math.max(-.04,cristas+fraturas-.05)*Math.max(0,1-Math.pow(Math.hypot(x,z)/.74,6));
  }
  for(let i=0;i<posicoes.count;i++){
   const x=posicoes.getX(i),z=posicoes.getZ(i),y=relevo(x,z);posicoes.setY(i,y);
   const declive=Math.abs(relevo(x+.012,z)-y)+Math.abs(relevo(x,z+.012)-y),grao=Math.sin(x*211+z*127)*.025;
   if(y>.38+Math.sin(x*32+z*17)*.055)cor.set('#dce5df');else if(declive>.045||y>.26)cor.set('#788c91');else if(y>.06)cor.set('#3e6253');else cor.set('#426b62');
   cor.multiplyScalar(.88+grao+y*.3);cores.set(cor.toArray(),i*3);
  }
  terreno.setAttribute('color',new T.BufferAttribute(cores,3));terreno.computeVertexNormals();
  paisagem.add(new T.Mesh(terreno,material('#ffffff',{vertexColors:true,roughness:.94,metalness:0,side:T.DoubleSide})));
  const lago=new T.Mesh(new T.CircleGeometry(.56,48),new T.MeshPhysicalMaterial({color:'#2d7f91',roughness:.18,metalness:.32,clearcoat:1,transparent:true,opacity:.8}));lago.rotation.x=-Math.PI/2;lago.position.y=-.033;paisagem.add(lago);
  const arvores=new T.InstancedMesh(new T.ConeGeometry(.018,.075,6),material('#234839',{roughness:.85,metalness:0}),55),auxiliar=new T.Object3D();
  for(let i=0;i<55;i++){const angulo=i*2.399,raio=.15+(Math.sin(i*71.3)*.5+.5)*.36,x=Math.cos(angulo)*raio,z=Math.sin(angulo)*raio,y=relevo(x,z);auxiliar.position.set(x,y+.032,z);auxiliar.scale.setScalar(.65+(Math.sin(i*42)*.5+.5)*.6);auxiliar.updateMatrix();arvores.setMatrixAt(i,auxiliar.matrix);}paisagem.add(arvores);
  const nuvens=[];for(let i=0;i<4;i++){const nuvem=new T.Sprite(new T.SpriteMaterial({map:brilhoBranco,color:0xc7dce2,transparent:true,opacity:.13,depthWrite:false}));nuvem.scale.set(.65,.14,1);nuvem.position.set((i-1.5)*.22,.19+i%2*.11,.38);conjunto.add(nuvem);nuvens.push(nuvem);}
  return t=>{nuvens.forEach((n,i)=>n.position.x=(i-1.5)*.22+Math.sin(t*.1+i)*.09);lago.material.roughness=.16+Math.sin(t*.7)*.025;};
 }
 function criarArtes(conjunto){
  const tinta=new T.MeshPhysicalMaterial({roughness:.23,metalness:.08,clearcoat:1,clearcoatRoughness:.14});
  const relogio={value:0};
  tinta.onBeforeCompile=sombreador=>{
   sombreador.uniforms.tempo=relogio;
   sombreador.vertexShader=sombreador.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 pontoPigmento;').replace('#include <begin_vertex>','#include <begin_vertex>\npontoPigmento=position;');
   sombreador.fragmentShader=sombreador.fragmentShader.replace('#include <common>',`#include <common>\nuniform mediump float tempo;varying vec3 pontoPigmento;${ruidoNatural}`);
   sombreador.fragmentShader=sombreador.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    vec3 p=pontoPigmento*2.;float dobra=camadas(p.xy*2.3+vec2(p.z,tempo*.025));
    float veio=sin(p.x*4.+p.y*4.+dobra*11.+sin(p.z*4.)*1.4);
    vec3 pigmento=mix(vec3(.12,.28,.48),vec3(.66,.18,.19),smoothstep(-.9,-.1,veio));
    pigmento=mix(pigmento,vec3(.83,.58,.2),smoothstep(.15,.58,veio));
    pigmento=mix(pigmento,vec3(.46,.3,.56),smoothstep(.72,1.,veio));
    float linha=pow(1.-abs(sin(veio*6.+dobra*2.)),14.);diffuseColor.rgb=pigmento+linha*.11;
   `);
  };
  const arte=new T.Mesh(new T.SphereGeometry(.65,64,40),tinta);conjunto.add(arte);
  return t=>{relogio.value=t;arte.rotation.y=t*.045;arte.rotation.z=Math.sin(t*.08)*.04;};
 }
 function criarLivro(conjunto){conjunto.add(casca('#b5956e'));const livro=new T.Group();livro.rotation.x=.18;livro.position.y=-.09;conjunto.add(livro);const capa=new T.Mesh(new T.BoxGeometry(1.09,.65,.07),material('#54301c',{map:texturasFisicas.metal,bumpMap:texturasFisicas.metal,bumpScale:.007,metalness:.05,roughness:.65}));capa.position.z=-.06;livro.add(capa);const paginas=[];for(let lado=0;lado<2;lado++){const pagina=new T.Group(),papel=new T.Mesh(new T.PlaneGeometry(.49,.57,5,5),material('#fff4d8',{map:texturasFisicas.papel,bumpMap:texturasFisicas.papel,bumpScale:.002,side:T.DoubleSide,metalness:0,roughness:.87}));const malha=papel.geometry.attributes.position;for(let i=0;i<malha.count;i++)malha.setZ(i,Math.sin((malha.getX(i)+.245)/.49*Math.PI)*.055);papel.geometry.computeVertexNormals();papel.position.x=(lado?1:-1)*.25;pagina.add(papel);
  for(let folha=0;folha<5;folha++){const borda=new T.Mesh(papel.geometry,papel.material);borda.position.copy(papel.position);borda.position.z=-.009-folha*.008;borda.scale.setScalar(1-folha*.006);pagina.add(borda);}
  const douradura=new T.Mesh(new T.BoxGeometry(.009,.59,.008),material('#d3ad60',{metalness:.85,roughness:.3}));douradura.position.set((lado?1:-1)*.51,0,-.032);pagina.add(douradura);
  const marcas=[];for(let i=0;i<6;i++){const y=.19-i*.065;marcas.push((lado?1:-1)*.065,y,.09,(lado?1:-1)*.43,y,.09)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(marcas,3));pagina.add(new T.LineSegments(g,new T.LineBasicMaterial({color:'#967a4e',transparent:true,opacity:.6})));pagina.rotation.y=(lado?-1:1)*.12;livro.add(pagina);paginas.push(pagina)}['A','Ω','文'].forEach((texto,i)=>{const simbolo=letra(texto,'#f0d9a1');simbolo.scale.set(.16,.16,1);simbolo.position.set((i-1)*.37,.39+i%2*.08,.15);conjunto.add(simbolo);animacoes.push(t=>simbolo.position.y=.39+i%2*.08+Math.sin(t*.4+i)*.035)});return t=>paginas.forEach((pagina,i)=>pagina.rotation.y=(i?-1:1)*(.12+Math.sin(t*.45+i)*.045));}
 const criadores={exatas:criarExatas,vida:criarVida,humanidades:criarTemplo,tecnologia:criarTecnologia,geografia:criarGeografia,artes:criarArtes,linguagens:criarLivro};
 dominios.forEach(dominio=>{const conjunto=new T.Group(),conteudo=new T.Group();conjunto.add(conteudo);let atualizar;if(dominio.id==='sociedade'){const planeta=esferaPlaneta();const nuvens=new T.Mesh(new T.SphereGeometry(.65,32,22),new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{tempo:uniformes.tempo},vertexShader:'varying vec3 ponto;void main(){ponto=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`precision mediump float;uniform mediump float tempo;varying vec3 ponto;${ruidoNatural}void main(){vec2 p=vec2(atan(ponto.z,ponto.x)*2.1,ponto.y*6.);float vapor=camadas(p*3.+vec2(tempo*.006,0.));float filetes=camadas(p*7.+vapor*3.);float mascara=smoothstep(.49,.72,vapor*.76+filetes*.24);float luz=.3+.7*max(0.,dot(ponto,normalize(vec3(-.6,.8,1.))));gl_FragColor=vec4(vec3(.83,.91,.96)*luz,mascara*.42);}`}));conteudo.add(planeta,nuvens,casca('#80b9e9'));animacoes.push(t=>nuvens.rotation.y=t*.075);new T.TextureLoader().load('ativos/terra.webp',textura=>{textura.colorSpace=T.SRGBColorSpace;texturas.push(textura);planeta.material.dispose();planeta.material=material('#ffffff',{map:textura,metalness:.08,roughness:.58});});atualizar=t=>{planeta.rotation.y=t*.055;if(planeta.material.uniforms)planeta.material.uniforms.tempo.value=t};}else atualizar=criadores[dominio.id](conteudo);const halo=aura(dominio.cor,1.65);conjunto.add(halo);grupo.add(conjunto);objetos.set(dominio.id,{conjunto,conteudo,halo,atualizar,dominio});});
 const nucleo=new T.Group(),cristal=new T.Group();nucleo.add(cristal);grupo.add(nucleo);
 const vertices=[],cores=[];const paleta=['#fff8e5','#f1d2a6','#fce4bd','#e2e7e5','#d5c5df'].map(cor=>new T.Color(cor));
 const cintura=[],coroa=[];for(let i=0;i<6;i++){const angulo=i/6*Math.PI*2;cintura.push(new T.Vector3(Math.cos(angulo)*.42,-.1,Math.sin(angulo)*.42));coroa.push(new T.Vector3(Math.cos(angulo+.08)*.29,.29,Math.sin(angulo+.08)*.29));}
 for(let i=0;i<6;i++){const proximo=(i+1)%6;const faces=[[new T.Vector3(0,.88,0),coroa[i],coroa[proximo]],[coroa[i],cintura[i],cintura[proximo]],[coroa[i],cintura[proximo],coroa[proximo]],[new T.Vector3(0,-.72,0),cintura[proximo],cintura[i]]];faces.forEach((face,j)=>face.forEach(ponto=>{vertices.push(...ponto.toArray());cores.push(...paleta[(i+j)%paleta.length].toArray())}));}
 const geometriaCristal=new T.BufferGeometry();geometriaCristal.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometriaCristal.setAttribute('color',new T.Float32BufferAttribute(cores,3));geometriaCristal.computeVertexNormals();
 const pedra=new T.Mesh(geometriaCristal,new T.MeshPhysicalMaterial({vertexColors:true,metalness:0,roughness:.055,transmission:.48,dispersion:.2,iridescence:.13,thickness:.55,ior:1.55,attenuationColor:new T.Color('#ffd8a1'),attenuationDistance:1.3,clearcoat:1,envMapIntensity:1.8,emissive:'#c88631',emissiveIntensity:.13,side:T.DoubleSide}));pedra.material.onBeforeCompile=sombreador=>{
  sombreador.vertexShader=sombreador.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 pontoCristal;').replace('#include <begin_vertex>','#include <begin_vertex>\npontoCristal=position;');
  sombreador.fragmentShader=sombreador.fragmentShader.replace('#include <common>',`#include <common>\nvarying vec3 pontoCristal;${ruidoNatural}`);
  sombreador.fragmentShader=sombreador.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float falha=pow(1.-abs(sin(pontoCristal.x*31.+pontoCristal.y*13.+pontoCristal.z*17.+camadas(pontoCristal.xy*8.)*2.)),28.);
   float inclusao=pow(camadas(pontoCristal.xy*23.),7.);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.98,.94,.82),falha*.28+inclusao*.16);
  `);
 };
 cristal.add(pedra);cristal.add(new T.LineSegments(new T.EdgesGeometry(geometriaCristal),new T.LineBasicMaterial({color:'#fff0c6',transparent:true,opacity:.45})));const alma=aura('ouro',2.1);alma.position.z=-.15;cristal.add(alma);const centroBrilhante=new T.Mesh(new T.OctahedronGeometry(.075),new T.MeshBasicMaterial({color:'#fff6cf'}));cristal.add(centroBrilhante);const luzNucleo=new T.PointLight(0xffd78e,2.1,7);luzNucleo.position.set(0,.4,2);nucleo.add(luzNucleo);
 const materialOuro=material('#c8a567',{map:texturasFisicas.metal,bumpMap:texturasFisicas.metal,bumpScale:.003,metalness:.91,roughness:.32,emissive:'#9a651f',emissiveIntensity:.08});
 for(let i=0;i<5;i++){const suporte=new T.Group();suporte.rotation.x=1.45;const anel=new T.Group();suporte.add(anel);const raio=4.3+i*.28;anel.add(new T.Mesh(new T.TorusGeometry(raio,.021,10,192),materialOuro));const faixa=new T.Mesh(new T.RingGeometry(raio-.045,raio+.045,192),materialOuro);faixa.position.z=-.017;anel.add(faixa);const marcas=new T.InstancedMesh(new T.BoxGeometry(.022,.1,.018),materialOuro,64),auxiliar=new T.Object3D();for(let j=0;j<64;j++){const angulo=j/64*Math.PI*2;auxiliar.position.set(Math.cos(angulo)*raio,Math.sin(angulo)*raio,0);auxiliar.rotation.z=angulo-Math.PI/2;auxiliar.updateMatrix();marcas.setMatrixAt(j,auxiliar.matrix)}anel.add(marcas);const ponto=new T.Mesh(new T.SphereGeometry(.035,8,6),new T.MeshBasicMaterial({color:'#ffe3a2'}));ponto.position.x=raio;anel.add(ponto);grupo.add(suporte);aneis.push({suporte,anel,velocidade:(i%2?-.025:.02)*(1+i*.12)});}
 const linhas=[];[1,1.7,2.45].forEach((raio,i)=>{const pontos=[];for(let j=0;j<=100;j++){const a=j/100*Math.PI*2;pontos.push(new T.Vector3(Math.cos(a)*raio,Math.sin(a)*raio*.22-.3,.1));}const linha=new T.Line(new T.BufferGeometry().setFromPoints(pontos),new T.LineBasicMaterial({color:'#d6b465',transparent:true,opacity:.35}));grupo.add(linha);linhas.push(linha);});
 const pontosOrbitais=new T.Points(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(Array.from({length:72},()=>[(Math.random()-.5)*10,(Math.random()-.5)*3,.5]).flat(),3)),new T.PointsMaterial({color:'#f4d48b',size:.025,transparent:true,opacity:.7,depthWrite:false}));grupo.add(pontosOrbitais);
 function redimensionar(){if(oculto)return;const medida=palco.getBoundingClientRect();if(!medida.width)return;renderizador.transmissionResolutionScale=qualidade==='alta'?1:qualidade==='economica'?.5:.75;largura=innerWidth;altura=innerHeight;area=palco.getBoundingClientRect();alturaMundo=13*area.height/area.width;camera.left=-6.5;camera.right=6.5;camera.top=alturaMundo/2;camera.bottom=-alturaMundo/2;camera.updateProjectionMatrix();renderizador.setPixelRatio(qualidade==='alta'?Math.min(devicePixelRatio,1.5):qualidade==='economica'?.8:Math.min(devicePixelRatio,1.35));renderizador.setSize(largura,altura,false);objetos.forEach(o=>o.conjunto.position.copy(mundo(o.dominio.x,o.dominio.y,.2)));nucleo.position.copy(mundo(50,48,.6));aneis.forEach(o=>o.suporte.position.copy(mundo(50,87,-.8)));const escala=Math.max(largura/1672,altura/941),x=(largura-1672*escala)*(largura<700?.65:.5),y=(altura-941*escala)/2;uniformes.recorte.value.set(-x/(1672*escala),-y/(941*escala),largura/(1672*escala),altura/(941*escala));desenhar();}
 function atualizar(){uniformes.tempo.value=tempo;poeiraMaterial.uniforms.tempo.value=tempo;intensidade=T.MathUtils.lerp(intensidade,foco==='nucleo'?1:0,.05);objetos.forEach((o,id)=>{o.atualizar(tempo);const alvo=(foco===id?1.09:1)*(innerWidth<700?1.18:1);o.conjunto.scale.lerp(new T.Vector3(alvo,alvo,alvo),.08);o.halo.material.opacity=foco===id?.4:.16;o.conteudo.position.y=Math.sin(tempo*.5+o.dominio.x)*.025;});cristal.rotation.y=tempo*.17;cristal.position.y=Math.sin(tempo*.8)*.065;alma.material.opacity=.3+Math.sin(tempo*1.6)*.045+intensidade*.17;pedra.material.emissiveIntensity=.10+intensidade*.2+Math.sin(tempo*1.2)*.025;luzNucleo.intensity=2.1+intensidade*1.4;aneis.forEach(o=>o.anel.rotation.z=tempo*o.velocidade*(1+intensidade*.4));linhas.forEach((l,i)=>{l.material.opacity=.23+Math.sin(tempo*.6+i)*.07+(foco?.07:0)});pontosOrbitais.rotation.z=Math.sin(tempo*.08)*.04;animacoes.forEach(a=>a(tempo));grupo.rotation.y=T.MathUtils.lerp(grupo.rotation.y,ponteiroFino.matches?alvoParalaxe.x*.009:0,.03);grupo.rotation.x=T.MathUtils.lerp(grupo.rotation.x,ponteiroFino.matches?alvoParalaxe.y*.007:0,.03);}
 function desenhar(){if(!area)return;atualizar();renderizador.setScissorTest(false);renderizador.setViewport(0,0,largura,altura);renderizador.clear();if(plano.visible)renderizador.render(ambiente,cameraAmbiente);renderizador.clearDepth();const retangulo=palco.getBoundingClientRect();if(retangulo.bottom>0&&retangulo.top<altura){renderizador.setViewport(retangulo.left,altura-retangulo.bottom,retangulo.width,retangulo.height);renderizador.setScissor(retangulo.left,altura-retangulo.bottom,retangulo.width,retangulo.height);renderizador.setScissorTest(true);renderizador.render(cena,camera);renderizador.setScissorTest(false);}}
 function animar(agora){if(pausado||oculto||reduzir.matches||document.hidden){quadro=0;return;}quadro=requestAnimationFrame(animar);if(agora-ultimoQuadro<(qualidade==='alta'?24:qualidade==='economica'?50:33))return;if(anterior)tempo+=Math.min((agora-anterior)/1000,.08);anterior=agora;ultimoQuadro=agora;desenhar();}
 function sincronizar(){cancelAnimationFrame(quadro);anterior=0;if(oculto)return;if(!pausado&&!reduzir.matches&&!document.hidden)quadro=requestAnimationFrame(animar);else desenhar();}
 addEventListener('pointermove',e=>{if(ponteiroFino.matches&&!reduzir.matches)alvoParalaxe.set(e.clientX/largura*2-1,e.clientY/altura*2-1)},{passive:true});
 document.addEventListener('noesis:ambiente',e=>{oculto=e.detail!=='santuario';if(!oculto)requestAnimationFrame(()=>{redimensionar();sincronizar()});else cancelAnimationFrame(quadro)});
 document.addEventListener('noesis:foco',e=>{foco=e.detail||'';if(pausado||reduzir.matches)desenhar()});
 document.addEventListener('noesis:preferencias',e=>{pausado=!e.detail.movimento;qualidade=e.detail.qualidade||qualidade;redimensionar();sincronizar()});
 addEventListener('resize',redimensionar);addEventListener('scroll',()=>{if(pausado||reduzir.matches)desenhar()},{passive:true});document.addEventListener('visibilitychange',sincronizar);reduzir.addEventListener('change',sincronizar);
 tela.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(quadro);document.body.classList.remove('cena-pronta');});
 redimensionar();sincronizar();document.body.classList.add('cena-pronta');document.dispatchEvent(new CustomEvent('noesis:cena-pronta'));
 return {pausar:valor=>{pausado=valor;sincronizar()},redimensionar};
}
