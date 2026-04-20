importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyCKCtLBwpuGnZ-epxu2gJYmkSHG7NmN_v0',
  authDomain: 'twodo-3741f.firebaseapp.com',
  projectId: 'twodo-3741f',
  storageBucket: 'twodo-3741f.firebasestorage.app',
  messagingSenderId: '1048890631891',
  appId: '1:1048890631891:web:e3c09a4a03405c2ce35626',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'TwoDo 通知'
  const body = payload.notification?.body || payload.data?.message || ''
  const link = payload.data?.link || '/notifications'

  self.registration.showNotification(title, {
    body,
    data: { link },
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const destinationPath = event.notification.data?.link || '/notifications'
  const destinationUrl = new URL(destinationPath, self.location.origin).href

  event.waitUntil(
    clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === destinationUrl && 'focus' in client) {
          return client.focus()
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(destinationUrl)
      }

      return undefined
    }),
  )
})
