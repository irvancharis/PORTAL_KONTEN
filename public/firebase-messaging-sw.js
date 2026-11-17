importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Inisialisasi Firebase Cloud Messaging di Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyDf5ceEacu2-mv2FK8Qbeza2QyfsksXSE8",
  authDomain: "jamkosong.firebaseapp.com",
  projectId: "jamkosong",
  storageBucket: "jamkosong.firebasestorage.app",
  messagingSenderId: "134227107647",
  appId: "1:134227107647:web:344ac45f6e6c9b8f41bd8a",
  measurementId: "G-BDFQN9VRYV"
});

const messaging = firebase.messaging();

// Menangani notifikasi saat aplikasi berada di latar belakang (background / closed)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Menerima push notification background:', payload);

  const title = payload.notification?.title || payload.data?.title || 'ngonten.id';
  const body = payload.notification?.body || payload.data?.body || 'Anda memiliki informasi baru di ngonten.id.';
  const icon = payload.notification?.icon || payload.data?.icon || '/favicon.png';
  const badge = '/favicon.png';
  const clickAction = payload.fcmOptions?.link || payload.data?.click_action || payload.data?.url || '/';

  const notificationOptions = {
    body: body,
    icon: icon,
    badge: badge,
    vibrate: [200, 100, 200],
    data: {
      url: clickAction,
      ...payload.data
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Event klik notifikasi: arahkan pengguna ke aplikasi / tab yang sesuai
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          if (targetUrl && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
