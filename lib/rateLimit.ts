const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { success: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    }
  }

  record.count++
  return {
    success: true,
    remaining: maxRequests - record.count,
    resetIn: record.resetTime - now,
  }
}

// Nettoyer les entrées expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)