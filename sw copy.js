/* Service worker Absensi Sam's Coffee — menyimpan tampilan agar cepat dibuka.
   Data absen TIDAK disimpan di sini; selalu dikirim langsung ke server. */
const CACHE = 'absen-sams-v1';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Utamakan versi terbaru dari internet; jika offline pakai simpanan.
  e.respondWith(
    fetch(req).then(res => {
      const salin = res.clone();
      caches.open(CACHE).then(c => c.put(req, salin)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
