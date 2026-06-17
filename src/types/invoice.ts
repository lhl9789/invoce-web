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
