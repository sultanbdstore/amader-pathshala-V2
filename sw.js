/* Offline cache (network-first so updates show immediately). Bump VERSION after editing. */
const VERSION='pa-v7';
const FILES=['./','./index.html','./manifest.webmanifest','./icons/logo-192.png','./icons/logo-512.png','./icons/apple-touch-icon.png','./lib/pdf.min.mjs','./lib/pdf.worker.min.mjs'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION&&x!=='pa-meta').map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
async function callKids(){
  let m={kids:[],on:false};
  try{const c=await caches.open('pa-meta');const r=await c.match('meta.json');if(r)m=await r.json()}catch(e){}
  if(!m.on||!m.kids.length)return;
  const h=new Date().getHours();if(h<8||h>=21)return;
  return self.registration.showNotification('টুনি ডাকছে 🐥',{body:m.kids.map(k=>k.n).join(', ')+' — চলো আজ একটু পড়ি!',icon:'icons/logo-192.png',badge:'icons/favicon-32.png',tag:'tuni',renotify:true,vibrate:[120,60,120]});
}
self.addEventListener('periodicsync',e=>{if(e.tag==='tuni-call')e.waitUntil(callKids())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():clients.openWindow('./index.html')))});
