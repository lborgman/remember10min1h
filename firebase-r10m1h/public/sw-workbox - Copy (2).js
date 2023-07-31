// version: 0.0.2
// throw Error("Test worker error");
console.log("sw-worker-input.js is here");
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.precaching.precacheAndRoute([{"revision":"0a27a4163254fc8fce870c8cc3a3f94f","url":"404-old.html"},{"revision":"960bef6e33832efcbfa50d46e38fbbe5","url":"css/rem10m1h.css"},{"revision":"4b08ad333383bdacae33955042a73f8f","url":"ext/fontawesome/5.13.0/css/all.css"},{"revision":"0cb5a5c0d251c109458c85c6afeffbaa","url":"ext/fontawesome/5.13.0/webfonts/fa-brands-400.svg"},{"revision":"89ffa3aba80d30ee0a9371b25c968bbb","url":"ext/fontawesome/5.13.0/webfonts/fa-regular-400.svg"},{"revision":"ec763292e583294612f124c0b0def500","url":"ext/fontawesome/5.13.0/webfonts/fa-solid-900.svg"},{"revision":"a35154e0b0e92414a64ce898c5d98682","url":"ext/mdc/6.0.0/material-components-web - css variables.css"},{"revision":"a4270fb7d659c569e7056ad70fa0c53c","url":"ext/mdc/6.0.0/material-components-web.css"},{"revision":"4e09df88279ccb9c6a75d9053922d560","url":"ext/mdc/6.0.0/material-components-web.min.css"},{"revision":"8c609bcdb8a5a8fe5b060813a5ef273b","url":"ext/mdc/6.0.0/material-components-web.min.js"},{"revision":"08b2e16a1840155c6c45f8579610fc3b","url":"ext/mdc/material-components-web.min.css"},{"revision":"f9c0a8964ddad170fcc29efae0ed74da","url":"img/mental-capacity-intelligence-remember-intellect-svgrepo-com.svg"},{"revision":"f9c0a8964ddad170fcc29efae0ed74da","url":"img/rem10m1h.svg"},{"revision":"8abeda6a60384697734bfd439cee1309","url":"index.html"},{"revision":"f98c438d23ab56e4109c161d5812a791","url":"manifest.json"},{"revision":"0ecc88811c40a4f2e04fc8a30f6756b6","url":"rem10m1h.html"},{"revision":"61ddcd2e42a139721dc5348687c9c86a","url":"service-worker.js"},{"revision":"c62547443437d1f2e46b69cd1b9881fd","url":"share.html"},{"revision":"8c3c629bcf4740cb468a631abd99f03c","url":"src/js/common.js"},{"revision":"7e56fc895eb3e894a7946d679ee97844","url":"src/js/database.js"},{"revision":"54c3499a0115e2e99faf067f0a80cc19","url":"src/js/db.js"},{"revision":"615084dd04f8b49f2b20df9d195a0ce0","url":"src/js/error.js"},{"revision":"99da8711c154ba2db07369ab4e485dd9","url":"src/js/main-rem10m1h.js"},{"revision":"4974e05477d419fa2d76cae88c3a0e5b","url":"src/js/mod/util-mdc.js"},{"revision":"b81b666732ace92fd3b5536aff9220fd","url":"src/js/share.js"},{"revision":"becc2fb9a5723b96e3e58f2d93390bec","url":"src/js/umd/idb.js"},{"revision":"562d58a273a89e0c11a1b7237a5eb98a","url":"sw-workbox - Copy.js"}])
workbox.routing.registerRoute(
  /\.(?:js|css|webp|png|svg|html)$/,
  new workbox.strategies.StaleWhileRevalidate()
  // new workbox.strategies.NetworkFirst()
);
// https://web.dev/workbox-share-targets/
workbox.routing.registerRoute(
    "/share",
    shareTargetHandler,
    "GET"
);

async function shareTargetHandler(evt) {
    console.warn({evt});
    const formData = await evt.request.formData();
    console.warn({formData});
}

importScripts("src/js/umd/idb.js");
importScripts("src/js/database.js");
console.log("service-worker.js after import workbox-sw.js, idb.js and database.js");


// https://stackoverflow.com/questions/38168276/navigator-serviceworker-controller-is-null-until-page-refresh
self.addEventListener("install", (evt) => {
    // console.warn("service-worker install event");
    evt.waitUntil(self.skipWaiting()); // Activate worker immediately
});
self.addEventListener("activate", (evt) => {
    console.warn("service-worker activate event");
    evt.waitUntil(self.clients.claim()); // Become available to all pages
});


async function checkToNotify() {
    const db = await getDb();
    console.log("service-worker", { idb, db });
    const toNotify = await getToNotifyNow();
    console.log("service-worker", { toNotify });
    const toNot0 = toNotify[0];
    if (toNot0) { displayRememberNotification(toNot0); }
}
setTimeout(checkToNotify, 1000);

// Notification seems to be not available here???
// const greeting = new Notification('Hi, I am web worker');

function displayNotification(title, body, url) {
    // https://stackoverflow.com/questions/29774836/failed-to-construct-notification-illegal-constructor
    const action = "display-url";
    const data = { url, action }
    const tag = "rem10m1h";
    const options = {
        body, data, tag,
        // silent: true,
    }
    if (Notification.permission !== "granted") return false;
    console.log("displayNotification", { title, options });
    self.registration.showNotification(title, options);
    return true;
}
async function displayRememberNotification(objRem) {
    console.log("displayRememberNotification", { objRem });
    const title = `Remember ${objRem.title}`;
    const body = objRem.desc;
    const url = objRem.url;
    const displayed = displayNotification(title, body, url);
    console.log({displayed});
}
self.addEventListener('notificationclick', (evt) => {
    console.log("notificationclick", { evt });
    if (!evt.notification.data.action) {
        // Was a normal notification click
        console.log('Notification Click.');
        return;
    }
    switch (evt.notification.data.action) {
        case 'display-url':
            const url = evt.notification.data.url;
            console.log(`Display url ${url}`);
            clients.openWindow(url);
            break;
        default:
            console.log(`Unknown action clicked: '${evt.action}'`);
            break;
    }
});

setTimeout(() => {
    // console.log("service-worker test");
    // displayNotification("from sw");
    // debugger;
}, 6000);

/*
addEventListener('fetch', (event) => {
    // console.log("our fetch");
    // Prevent the default, and handle the request ourselves.
    event.respondWith((async () => {
        // Try to get the response from a cache.
        const cachedResponse = await caches.match(event.request);
        // Return it if we found one.
        if (cachedResponse) return cachedResponse;
        // If we didn't find a match in the cache, use the network.
        const er = event.request;
        const u = new URL(er.url);
        if (u.hostname == location.hostname) {
            // console.log({ er, u });
        }
        return fetch(event.request);
    })());
});
*/

let tmrCheck;
self.addEventListener("message", (evt) => {
    console.log("service-worker", evt);
    if (evt.data) {
        switch (evt.data.type) {
            case "CHECK_NOTIFY":
                const msDelay = evt.data.msDelay;
                // const msDelay = 2000;
                clearTimeout(tmrCheck);
                tmrCheck = setTimeout(checkToNotify, msDelay)
                break;
            default:
                console.error("Unknown message data.type", { evt });
        }
    }
})