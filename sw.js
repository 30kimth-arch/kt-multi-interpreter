// Phase 1: deployment-path-independent PWA shell cache.
// Network-first strategy keeps translations and app assets fresh when online.
// Only static, same-origin app files are cached; API calls are never cached.
const CACHE = 'kt-multi-interpreter-shell-v5-20261017';
const ROOT = new URL(self.registration.scope);
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=20260910-5',
  './config.js?v=20260910-5',
  './room.js?v=20260910-5',
  './chat.js?v=20260910-5',
  './app-extra.js?v=20260910-5',
  './android-bridge.js?v=20260910-5',
  './pwa.js?v=20260910-5',
  './ui-info.js?v=20260910-5',
  './usage-cost.js?v=20260910-5',
  './manifest.webmanifest?v=20260910-5',
  './icons/kt-icon-192.png',
  './icons/kt-icon-512.png'
].map(path => new URL(path, ROOT).href);
const ALLOWED_PATHS = new Set(ASSETS.map(url => new URL(url).pathname));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // An unavailable optional asset must not prevent SW installation.
    await Promise.allSettled(ASSETS.map(url => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('kt-multi-interpreter-') && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  // Never store arbitrary data, requests with Authorization, or API results.
  if (!req.mode.includes('navigate') && !ALLOWED_PATHS.has(url.pathname)) return;
  if (req.headers.has('authorization')) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(req, { cache: 'no-store' });
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE);
        event.waitUntil(cache.put(req, response.clone()).catch(() => {}));
      }
      return response;
    } catch (_) {
      const cached = await caches.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate') {
        return (await caches.match(new URL('./index.html', ROOT).href)) || Response.error();
      }
      return Response.error();
    }
  })());
});
