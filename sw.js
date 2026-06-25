const CACHE = 'elec-v4';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// شبكة أولاً مع تحديث الكاش في الخلفية، والكاش فقط عند انقطاع الإنترنت
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  e.respondWith(
    fetch(req)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE).then(c => c.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
