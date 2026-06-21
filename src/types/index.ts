// 공통 API 응답 타입 — 판별 유니온 (success 필드로 분기)
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } }

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
export type { NotionBlock, NotionInvoicePage, NotionItemPage } from "./notion"
export { INVOICE_PROPERTY_NAMES, ITEM_PROPERTY_NAMES } from "./notion"
export type {
  ParsedInvoice,
  ParsedInvoiceItem,
  InvoiceStatus,
  CreateInvoiceInput,
  CreateInvoiceItemInput,
  CreateInvoiceResult,
} from "./invoice"
