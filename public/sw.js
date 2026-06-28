self.addEventListener('push', function(event) {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url ?? '/',
    },
    actions: [
      { action: 'open', title: 'Voir' },
      { action: 'close', title: 'Fermer' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  if (event.action === 'close') return

  const url = event.notification.data?.url ?? '/'

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())