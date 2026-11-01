/* Offline mode. Network first: online you always get the fresh build (and skip the 10-minute Pages cache);
   without a connection the last copy from the cache opens. Fonts are cached too. */
const CACHE='ryzhik-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.add('./')).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const url=new URL(r.url),own=url.origin===location.origin;
  if(!own&&!/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname))return;
  e.respondWith(
    (own?fetch(r.url,{cache:'no-cache',credentials:'same-origin'}):fetch(r)).then(res=>{
      if(res.ok||res.type==='opaque'){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}
      return res;
    }).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('./'):Response.error())))
  );
});
