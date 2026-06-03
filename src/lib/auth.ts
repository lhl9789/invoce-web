// 인증 유틸리티 — JWT 발급/검증 (jose 라이브러리 사용)
// TODO: jose 패키지 설치 후 구현

// JWT 시크릿 키
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다.")
}

// TODO: JWT 토큰 발급
export async function signToken(_payload: Record<string, unknown>): Promise<string> {
  // TODO: jose SignJWT 구현
  throw new Error("signToken 미구현")
}

// TODO: JWT 토큰 검증
export async function verifyToken(_token: string): Promise<Record<string, unknown>> {
  // TODO: jose jwtVerify 구현
  throw new Error("verifyToken 미구현")
}

// TODO: 요청 쿠키에서 사용자 정보 추출
export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  // TODO: Next.js cookies() 또는 headers() 활용
  return null
}
