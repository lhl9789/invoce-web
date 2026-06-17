/**
 * MVP용 In-memory Rate Limiter
 * Vercel 서버리스 멀티 인스턴스 환경에서는 인스턴스별 독립 카운트 — MVP 허용 오차로 수용
 * 추후 Upstash Redis 등으로 교체 시 checkRateLimit 내부만 수정
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const WINDOW_MS = 60_000
const MAX_REQUESTS = 10

// 핫리로드 시 상태 유실 방지 — Notion 클라이언트 싱글톤과 동일 패턴
const g = globalThis as typeof globalThis & {
  __rateLimitStore?: Map<string, RateLimitEntry>
}
if (!g.__rateLimitStore) {
  g.__rateLimitStore = new Map()
}
const store = g.__rateLimitStore

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: MAX_REQUESTS - entry.count }
}
