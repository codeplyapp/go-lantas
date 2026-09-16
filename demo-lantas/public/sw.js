// Service Worker for SIGAP Korlantas Background Push Notifications & Alarms
const CACHE_NAME = 'sigap-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Background Push Event (FCM / Web Push Protocol)
self.addEventListener('push', (event) => {
  let data = {
    title: '🚨 SIGAP Korlantas POLRI',
    body: 'Pemberitahuan keselamatan berkendara dari Korlantas.',
    icon: '/favicon.svg',
    tag: 'sigap_push'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'sigap_schedule',
    requireInteraction: true,
    data: { url: '/' },
    actions: [
      { action: 'open_app', title: '🚀 Buka Aplikasi' },
      { action: 'dismiss', title: 'Tutup' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle Notification Click (Focus or open SIGAP app)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Handle scheduled message alarms from client application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_SCHEDULED_NOTIFICATION') {
    const { title, body, icon, tag } = event.data;
    self.registration.showNotification(title, {
      body: body,
      icon: icon || '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [250, 100, 250],
      tag: tag || 'sigap_schedule_' + Date.now(),
      requireInteraction: true,
      actions: [
        { action: 'open_app', title: 'Buka SIGAP' },
        { action: 'dismiss', title: 'Tutup' }
      ]
    });
  }
});
