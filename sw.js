// Renan | renancodando
const VERSAO='noesis-v1';
const BASE=['/','/css/santuario.css','/css/ambientes.css','/js/principal.js','/ativos/simbolo.svg','/ativos/icones.svg','/manifesto.webmanifest'];
self.addEventListener('install',evento=>{evento.waitUntil(caches.open(VERSAO).then(cache=>cache.addAll(BASE).catch(()=>{})).then(()=>self.skipWaiting()));});
self.addEventListener('activate',evento=>{evento.waitUntil(caches.keys().then(chaves=>Promise.all(chaves.filter(c=>c!==VERSAO).map(c=>caches.delete(c)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',evento=>{
 const pedido=evento.request;
 if(pedido.method!=='GET'||new URL(pedido.url).origin!==location.origin)return;
 const destino=pedido.destination;
 if(pedido.mode==='navigate'){evento.respondWith(fetch(pedido).then(resposta=>{const copia=resposta.clone();caches.open(VERSAO).then(cache=>cache.put(pedido,copia));return resposta;}).catch(()=>caches.match(pedido).then(r=>r||caches.match('/'))));return;}
 if(['script','style','image','font'].includes(destino)||pedido.url.includes('/conteudos/')||pedido.url.includes('/bibliotecas/')){
  evento.respondWith(caches.match(pedido).then(cacheado=>{const rede=fetch(pedido).then(resposta=>{if(resposta.ok)caches.open(VERSAO).then(cache=>cache.put(pedido,resposta.clone()));return resposta;}).catch(()=>cacheado);return cacheado||rede;}));
 }
});
