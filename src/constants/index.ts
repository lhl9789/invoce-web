// 라우트 상수 re-export
export { ROUTES } from "./routes"

// 앱 메타데이터
export const APP_NAME = "Invoce"
export const APP_DESCRIPTION =
  "Notion 견적서를 클라이언트에게 웹 링크로 공유하는 서비스"
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

// API 기본 URL
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

// API 엔드포인트 상수
export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
    LOGOUT: "/api/auth/logout",
  },
  // Notion 연동
  NOTION: {
    CONNECT: "/api/notion/connect",
    QUOTES: "/api/notion/quotes",
  },
  // 공개 견적서
  QUOTE: {
    VIEW: (slug: string) => `/api/quote/${slug}`,
  },
} as const
