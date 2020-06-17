const staticCacheName = 'site-static-v3';
const dynamicCache = 'site-dynamic-v1';
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

// install service worker
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            cache.addAll(assets)
        })
    );
});

// listen for activate event
self.addEventListener('activate', evt => {
    //console.log('service worker has been activated');
    // delete old cache
    // get keys of all caches
        // use promise.all to recieve all those keys,
        // filter out keys array to only store keys of prev version 
        // map through filtered array and call caches.delete for each key
    // calling caches.delete returns a promise, so now promise.all will hold an array of promises as it should
        evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName )
                .map(key => caches.delete(key))
            )
        })
    )
});

// listen for fetch events
self.addEventListener('fetch', evt => {
    // intercept every request, check if we have it in our cache, if so return it, if not fetch it and cache it
    evt.respondWith(
        caches.match(evt.request).then((cacheRes) => {
            return cacheRes || fetch(evt.request).then(fetchResp => {
                return caches.open(dynamicCache).then(cache => {
                    // use put bc we have already made the request, cache.addAll makes the request for us 
                    // key -> url; value -> response
                    cache.put(evt.request.url, fetchResp.clone());
                    return fetchResp;
                })
            }) 
        })
    );
});