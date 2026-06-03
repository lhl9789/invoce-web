// 공통 API 응답 타입 (Spring Boot 레이어드 아키텍처 응답 형식 기준)
export interface ApiResponse<T = unknown> {
  data: T
  message: string
  status: number
  success: boolean
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

// 공통 UI 타입
export interface NavItem {
  title: string
  href: string
  disabled?: boolean
  external?: boolean
}

// 도메인 타입 re-export
export type { QuoteLink, QuoteItem, Quote, QuotePageData } from "./quote"
export type { User, LoginFormValues, SignupFormValues } from "./user"
export type { NotionIntegration, NotionBlock, NotionConnectFormValues } from "./notion"
