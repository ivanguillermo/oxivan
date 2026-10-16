// =====================================================
//  OXIVAN — UN SOLO service worker: push (Firebase) + caché offline
//  (antes había dos en el mismo alcance y se pisaban; sw.js además tenía un error de sintaxis)
// =====================================================
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCaYC1twuL7Ibtr6fU3eT6MAlJsQAu2H3o",
  authDomain: "oxivan-b6492.firebaseapp.com",
  projectId: "oxivan-b6492",
  storageBucket: "oxivan-b6492.firebasestorage.app",
  messagingSenderId: "265161051279",
  appId: "1:265161051279:web:23f2c7c95155aed4a374fa"
});

const messaging = firebase.messaging();

// Los envíos del Apps Script son "data-only": título y texto vienen en payload.data.
// Si llegara uno con bloque "notification", el navegador ya lo muestra solo (no duplicar).
messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return;
  const d = payload.data || {};
  return self.registration.showNotification(d.title || 'OXIVAN', {
    body: d.body || '',
    icon: './assets/oxivan_logo.jpg',
    badge: './assets/oxivan_logo.jpg',
    tag: d.tag || 'chat',
    renotify: true,
    data: { url: d.url || self.registration.scope }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const destino = new URL(event.notification.data?.url || self.registration.scope, self.registration.scope).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if (v.url.startsWith(self.registration.scope) && 'focus' in v) return v.focus();
      }
      return clients.openWindow(destino);
    })
  );
});

// ---------- Caché offline ----------
const CACHE_NAME = 'oxivan-chat-v2';
const ASSETS_TO_CACHE = ['./', './index.html', './manifest.json', './assets/oxivan_logo.jpg'];

self.addEventListener('install', (e) => {
  // Si un archivo falta, NO se cae la instalación
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(ASSETS_TO_CACHE.map((u) => cache.add(u).catch(() => console.warn('No se cacheó:', u)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  // El chat, Drive y Firebase siempre van directo a la red
  if (url.includes('script.google.com') || url.includes('googleusercontent.com') ||
      url.includes('drive.google.com') || url.includes('gstatic.com') || url.includes('googleapis.com')) return;

  event.respondWith(
    fetch(req)
      .then((resp) => {
        if (resp.ok && new URL(url).origin === self.location.origin) {
          const copia = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copia));
        }
        return resp;
      })
      .catch(() => caches.match(req))
  );
});
