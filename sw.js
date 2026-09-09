const CACHE='kt-multi-interpreter-pwa-v3-20260910';
const ROOT='/kt-multi-interpreter/';
const APP_SHELL=[
  ROOT,
  ROOT+'index.html',
  ROOT+'styles.css?v=20260910-3',
  ROOT+'config.js?v=20260910-3',
  ROOT+'room.js?v=20260910-3',
  ROOT+'chat.js?v=20260910-3',
  ROOT+'app-extra.js?v=20260910-3',
  ROOT+'android-bridge.js?v=20260910-3',
  ROOT+'pwa.js?v=20260910-3',
  ROOT+'manifest.webmanifest?v=20260910-3',
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

  event.respondWith((async()=>{
    try{
      const fresh=await fetch(req,{cache:'no-store'});
      if(fresh && fresh.ok){
        const cache=await caches.open(CACHE);
        cache.put(req,fresh.clone()).catch(()=>{});
      }
      return fresh;
    }catch(e){
      return (await caches.match(req)) ||
             (req.mode==='navigate' ? (await caches.match(ROOT+'index.html') || await caches.match(ROOT)) : Response.error());
    }
  })());
});
