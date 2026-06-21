/** 견적서 상태 */
export type InvoiceStatus = "대기" | "승인" | "거절"

/** 파싱된 견적 항목 */
export interface ParsedInvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

/** 파싱된 견적서 데이터 */
export interface ParsedInvoice {
  id: string
  invoiceNumber: string
  clientName: string
  issueDate: string | null
  validUntil: string | null
  status: InvoiceStatus | null
  totalAmount: number
  supplierInfo: string
  items: ParsedInvoiceItem[]
}

/** 견적서 작성 폼의 항목 입력값 */
export interface CreateInvoiceItemInput {
  description: string
  quantity: number
  unitPrice: number
}

/** 견적서 작성 폼 입력값 (POST /api/admin/invoices 요청 body) */
export interface CreateInvoiceInput {
  clientName: string
  issueDate: string
  validUntil: string
  supplierInfo?: string
  items: CreateInvoiceItemInput[]
}

/** 견적서 작성 성공 응답 */
export interface CreateInvoiceResult {
  id: string
  shareUrl: string
}
