const CACHE='mehanicar-v6';
const SHELL=['./','./index.html','./icon.svg','./manifest.json','./apple-touch-icon.png','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const url=new URL(e.request.url);
 if(url.pathname.startsWith('/api/'))return;
 e.respondWith(
  caches.match(e.request).then(cached=>{
   const fresh=fetch(e.request).then(r=>{
    if(r.ok&&r.type==='basic'){const c=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c))}
    return r;
   }).catch(()=>cached||new Response('Offline',{status:503,headers:{'Content-Type':'text/plain'}}));
   return cached||fresh;
  })
 );
});

self.addEventListener('push',e=>{
 const d=e.data?e.data.json():{};
 e.waitUntil(self.registration.showNotification(d.title||'mehanicar',{
  body:d.body||'Neue Anfrage eingegangen',
  icon:'./icon.svg',badge:'./icon.svg',
  vibrate:[200,100,200],tag:'anfrage'
 }));
});
