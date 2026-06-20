import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

export const SESSION_COOKIE_NAME = "invoce_session"

const SESSION_EXPIRES_IN_MS = 24 * 60 * 60 * 1000

/** Set-Cookie 헤더에 전달할 쿠키 옵션 */
export interface SessionCookieOptions {
  name: string
  value: string
  httpOnly: boolean
  sameSite: "lax" | "strict" | "none"
  path: string
  expires: Date
  secure?: boolean
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error("SESSION_SECRET 환경변수가 설정되지 않았습니다.")
  }
  return new TextEncoder().encode(secret)
}

/** Edge-safe: 토큰 문자열만 받아 JWT 검증 */
export async function verifySessionToken(token: string): Promise<{ admin: true } | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret())
    if (payload.admin !== true) return null
    return { admin: true }
  } catch {
    return null
  }
}

/** Route Handler용: next/headers cookies에서 세션 토큰 읽어 검증 */
export async function verifySession(): Promise<{ admin: true } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

/** JWT 생성 후 쿠키 옵션 반환 — Route Handler에서 response.cookies.set()에 전달 */
export async function createSession(): Promise<SessionCookieOptions> {
  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSessionSecret())

  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + SESSION_EXPIRES_IN_MS),
    secure: process.env.NODE_ENV === "production",
  }
}

/** 세션 쿠키 삭제용 만료 쿠키 옵션 반환 */
export function deleteSession(): SessionCookieOptions {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  }
}

/** 관리자 자격증명 검증 */
export async function validateAdminCredentials(password: string): Promise<boolean> {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminPasswordHash) {
    throw new Error("관리자 자격증명 환경변수(ADMIN_PASSWORD_HASH)가 설정되지 않았습니다.")
  }

  return bcrypt.compare(password, adminPasswordHash)
}
