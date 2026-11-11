import * as T from './bibliotecas/three.module.min.js';

export const ruidoNatural=`
float acaso(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float ruido(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(acaso(i),acaso(i+vec2(1.,0.)),f.x),mix(acaso(i+vec2(0.,1.)),acaso(i+vec2(1.,1.)),f.x),f.y);}
float camadas(vec2 p){return ruido(p)*.57+ruido(p*2.03)*.28+ruido(p*4.13)*.15;}
`;

export function prepararReflexos(renderizador,cena){
 const sala=new T.Scene();
 const parede=new T.Mesh(new T.BoxGeometry(18,12,16),new T.MeshBasicMaterial({color:'#31302b',side:T.BackSide}));
 sala.add(parede);
 function abertura(cor,intensidade,x,y,z,largura,altura,rotacao=0){
  const luz=new T.Mesh(new T.PlaneGeometry(largura,altura),new T.MeshBasicMaterial({color:new T.Color(cor).multiplyScalar(intensidade),side:T.DoubleSide}));
  luz.position.set(x,y,z);luz.rotation.y=rotacao;sala.add(luz);
 }
 abertura('#c9e9ff',4,4,2,-7.8,6,7);
 abertura('#ffcf8f',3,-8.8,1,-2,1.1,5,Math.PI/2);
 abertura('#fff4d8',3,-2,5,-6,5,.55);
 abertura('#b5d5e8',1.4,8.8,-1,1,3,5,Math.PI/2);
 abertura('#f0ad54',2,0,-5,-3,8,.35);
 const gerador=new T.PMREMGenerator(renderizador);
 const reflexos=gerador.fromScene(sala,.08,.1,50);
 cena.environment=reflexos.texture;cena.environmentIntensity=.8;
 sala.traverse(objeto=>{objeto.geometry?.dispose();objeto.material?.dispose();});gerador.dispose();
 return reflexos;
}

export function criarTexturasFisicas(){
 let semente=41;
 function acaso(){semente=(semente*16807)%2147483647;return semente/2147483647;}
 function textura(tipo){
  const tela=document.createElement('canvas');tela.width=tela.height=256;
  const contexto=tela.getContext('2d'),imagem=contexto.createImageData(256,256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
   const i=(y*256+x)*4,grao=acaso(),veio=Math.pow(Math.abs(Math.sin(x*.027+y*.039+Math.sin(y*.064)*1.8+Math.sin(x*.041+y*.03))),18);
   let r,g,b;
   if(tipo==='pedra'){const valor=222-veio*49+grao*12;r=valor;g=valor*.94;b=valor*.82;}
   else if(tipo==='metal'){const risco=Math.sin(y*16.7+x*.05)*7,patina=Math.max(0,Math.sin(x*.075+Math.sin(y*.037)*3)-.65)*35;const valor=222+grao*23+risco-patina;r=valor;g=valor;b=valor;}
   else{const valor=224+grao*22-Math.sin(y*.2)*3;r=valor;g=valor*.93;b=valor*.77;}
   imagem.data.set([r,g,b,255],i);
  }
  contexto.putImageData(imagem,0,0);
  const resultado=new T.CanvasTexture(tela);resultado.wrapS=resultado.wrapT=T.RepeatWrapping;resultado.colorSpace=T.SRGBColorSpace;resultado.anisotropy=4;
  return resultado;
 }
 return {pedra:textura('pedra'),metal:textura('metal'),papel:textura('papel')};
}
