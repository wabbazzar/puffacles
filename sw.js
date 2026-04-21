// Puffacles service worker.
//
// Strategy:
//   - Precache the game shell + sprites on install.
//   - Runtime: stale-while-revalidate for same-origin GETs; cache-first
//     (ignoring query strings) for cross-origin fetches that are part of
//     the game (Phaser CDN). The `img.src = 'assets/…?t=' + Date.now()`
//     pattern in PuffySprite would otherwise bypass the cache on every
//     load, so same-origin matching ignores the search component.
//   - Navigation offline fallback: serve the cached shell.
//
// Bump VERSION to invalidate old caches on next activation.

const VERSION = 'v1';
const CACHE_STATIC = `puffacles-static-${VERSION}`;
const CACHE_RUNTIME = `puffacles-runtime-${VERSION}`;

const PHASER_CDN = 'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js';

const PRECACHE_URLS = [
    './',
    './index.html',
    './game/sprites/PuffySprite.js?v=2',
    './game/scenes/PuffyRunnerScene.js?v=2',
    './assets/puffy_4_by_4.png',
    PHASER_CDN,
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_STATIC);
        await Promise.allSettled(PRECACHE_URLS.map(u => cache.add(new Request(u, { cache: 'reload' }))));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(
            names
                .filter(n => n !== CACHE_STATIC && n !== CACHE_RUNTIME)
                .map(n => caches.delete(n))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);

    if (url.origin === self.location.origin) {
        event.respondWith(sameOrigin(req));
        return;
    }
    if (url.href === PHASER_CDN) {
        event.respondWith(cacheFirst(req));
        return;
    }
    // Other cross-origin (e.g. /ascii-art.json from parent site during
    // iframe embedding) — leave to the network; PuffyRunnerScene already
    // silently falls back on failure per the puffacles contract.
});

async function sameOrigin(req) {
    const staticCache = await caches.open(CACHE_STATIC);
    const runtimeCache = await caches.open(CACHE_RUNTIME);
    // Match ignoring query so `?t=<timestamp>` cache-busters still hit.
    const matchOpts = { ignoreSearch: true };
    const cached = (await staticCache.match(req, matchOpts)) || (await runtimeCache.match(req, matchOpts));
    const network = fetch(req)
        .then(res => {
            if (res && res.ok && res.type !== 'opaque') {
                runtimeCache.put(req, res.clone()).catch(() => { });
            }
            return res;
        })
        .catch(() => null);
    const res = cached || (await network);
    if (res) return res;
    if (req.mode === 'navigate') {
        const shell = await staticCache.match('./');
        if (shell) return shell;
    }
    return Response.error();
}

async function cacheFirst(req) {
    const cache = await caches.open(CACHE_RUNTIME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
        const res = await fetch(req);
        if (res && res.ok) cache.put(req, res.clone()).catch(() => { });
        return res;
    } catch {
        return cached || Response.error();
    }
}

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
