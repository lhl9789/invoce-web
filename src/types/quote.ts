/** 견적서 공유 링크 */
export interface QuoteLink {
  id: string
  slug: string
  userId: string
  notionPageId: string
  createdAt: string
  shareUrl?: string
}

/** 견적서 항목 */
export interface QuoteItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

/** 견적서 공개 보기 데이터 */
export interface Quote {
  id: string
  title: string
  issueDate: string
  clientName: string
  totalAmount: number
  items: QuoteItem[]
  supplierInfo?: string
}

/** 견적서 공개 보기에서 사용하는 Notion 페이지 데이터 */
export interface QuotePageData {
  slug: string
  notionPageId: string
  title: string
  createdAt: string
  blocks: import("./notion").NotionBlock[]
}
