const CACHE='kt-multi-interpreter-pwa-v1';
const ROOT='/kt-multi-interpreter/';
const APP_SHELL=[
  ROOT,
  ROOT+'index.html',
  ROOT+'styles.css',
  ROOT+'config.js',
  ROOT+'room.js',
  ROOT+'chat.js',
  ROOT+'app-extra.js',
  ROOT+'android-bridge.js',
  ROOT+'pwa.js',
  ROOT+'manifest.webmanifest',
  ROOT+'icons/kt-icon-192.png',
  ROOT+'icons/kt-icon-512.png'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).catch(()=>{}));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;

  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req);
        const cache=await caches.open(CACHE);
        cache.put(ROOT+'index.html',fresh.clone());
        return fresh;
      }catch(e){
        return (await caches.match(ROOT+'index.html')) || (await caches.match(ROOT));
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(req);
    const network=fetch(req).then(async response=>{
      if(response && response.ok){
        const cache=await caches.open(CACHE);
        cache.put(req,response.clone());
      }
      return response;
    }).catch(()=>null);
    return cached || (await network) || Response.error();
  })());
});
