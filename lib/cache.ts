// Cache en mémoire simple pour les APIs BricoMaroc

interface CacheEntry {
  data: any
  expiry: number
}

const cache = new Map<string, CacheEntry>()

export function setCache(key: string, data: any, ttlSeconds: number = 300) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  })
}

export function getCache(key: string): any | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return null
  }
  return entry.data
}

export function deleteCache(key: string) {
  cache.delete(key)
}

export function clearCache(prefix?: string) {
  if (!prefix) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

export function getCacheStats() {
  const now = Date.now()
  let valid = 0
  let expired = 0
  for (const entry of cache.values()) {
    if (now > entry.expiry) expired++
    else valid++
  }
  return { total: cache.size, valid, expired }
}

// Nettoyer les entrees expirees toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiry) cache.delete(key)
  }
}, 5 * 60 * 1000)