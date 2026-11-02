const CACHE_NAME="korean-study-v14";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon.svg","./mood-theme.css","./study-core.js","./grammar-master.js","./grammar-ui.js","./study-practice.js","./study-progress.js","./study-plus.js","./level-plan.js","./hangul-pronunciation.js","./vocab-expanded-loader.js","./vocab-a1.js","./vocab-a2.js","./vocab-b1.js","./vocab-b2.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  const same=u.origin===self.location.origin;
  const fresh=same&&(e.request.mode==="navigate"||["script","style","worker"].includes(e.request.destination)||/\.(?:js|css|html)$/.test(u.pathname));
  if(fresh){
    e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(x=>x||caches.match("./index.html"))));
  }else{
    e.respondWith(caches.match(e.request).then(x=>x||fetch(e.request).then(r=>{const copy=r.clone();if(same)caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match("./index.html"))));
  }
});