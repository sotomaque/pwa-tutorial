const staticCacheName = 'site-static-v3';
const dynamicCacheName = 'site-dynamic-v1';
const assets = [
    '/', 
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v52/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    '/pages/fallback.html'
]
const CACHE_SIZE_LIMIT = 3;

const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size))
            }
        })
    });
}

// install service worker
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            cache.addAll(assets)
        })
    );
});


/**
 * - when we activate a new service worker
 *   erase previously versions of cache(s)
 */
self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName)
                .map(key => caches.delete(key))
            )
        })
    )
});

/**
 * - intercept fetch requests
 * - check if we already have resource cached, 
 *  - if so return it
 *  - if not, fetch it then cache it for the future 
 *      - if fetch fails, send user to fallback page if fetch was an html page
 */
self.addEventListener('fetch', evt => {
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request).then(fetchResp => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url, fetchResp.clone());
                    limitCacheSize(dynamicCacheName, CACHE_SIZE_LIMIT);
                    return fetchResp;
                })
            }) 
        }).catch(() => {
            if (evt.request.url.indexOf('.html') > -1) {
                caches.match('/pages/fallback.html')
            } 
        })
    );
});