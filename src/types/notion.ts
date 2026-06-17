import type { PageObjectResponse } from "@notionhq/client"

/** Notion Invoices DB 페이지 원시 응답 타입 */
export type NotionInvoicePage = PageObjectResponse

/** Notion Items DB 페이지 원시 응답 타입 */
export type NotionItemPage = PageObjectResponse

/** Notion 블록 기본 타입 (페이지 본문 표 블록 파싱 fallback 용도) */
export interface NotionBlock {
  id: string
  type: string
  content: Record<string, unknown>
}

/** Invoices DB 속성명 (Notion 데이터베이스 실제 컬럼명 기준) */
export const INVOICE_PROPERTY_NAMES = {
  invoiceNumber: "이름",
  clientName: "클라언트명",
  issueDate: "발행일",
  validUntil: "유효기간",
  supplierInfo: "공급자 정보",
  status: "상태",
  totalAmount: "총 금액",
  items: "항목",
} as const

/** Items DB 속성명 (Notion 데이터베이스 실제 컬럼명 기준) */
export const ITEM_PROPERTY_NAMES = {
  description: "항목명",
  quantity: "수량",
  unitPrice: "단가",
  amount: "금액",
} as const
