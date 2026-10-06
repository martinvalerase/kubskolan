// Service worker: gör att appen fungerar utan internet.
// Höj versionen när filerna ändras så hämtas de nya.
const VERSION = 'kubskolan-v13';
const FILES = [
  './', 'index.html', 'css/style.css', 'js/app.js', 'js/cube.js', 'js/content.js', 'js/icons.js', 'js/diagram.js',
  'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png',
];

self.addEventListener('install', e => {
  // cache: 'reload' går förbi webbläsarens HTTP-cache, så att den nya versionen inte fylls med gamla filer
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Nätverket först (så uppdateringar syns direkt), cachen om vi är offline.
// Egna filer frågar alltid servern (no-cache), annars kan HTTP-cachen ge en gammal fil i upp till 10 minuter.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const own = new URL(e.request.url).origin === location.origin;
  e.respondWith(
    fetch(e.request, own ? { cache: 'no-cache' } : undefined)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
