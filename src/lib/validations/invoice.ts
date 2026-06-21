import { z } from "zod"

const UUID_HYPHENATED =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
const UUID_NO_HYPHEN = /^[0-9a-fA-F]{32}$/

/** Notion 페이지 ID 형식 검증 스키마 (하이픈 포함/미포함 UUID 모두 허용) */
export const invoiceIdSchema = z
  .string()
  .refine(
    (id) => UUID_HYPHENATED.test(id) || UUID_NO_HYPHEN.test(id),
    "유효하지 않은 견적서 ID 형식입니다.",
  )

/** 견적서 ID 형식이 유효한지 여부 반환 */
export function isValidInvoiceId(id: string): boolean {
  return invoiceIdSchema.safeParse(id).success
}

/** 견적서 작성 폼 항목 입력값 검증 스키마 */
const createInvoiceItemSchema = z.object({
  description: z.string().min(1, "품목명을 입력해주세요."),
  quantity: z.number().positive("수량은 0보다 커야 합니다."),
  unitPrice: z.number().nonnegative("단가는 0 이상이어야 합니다."),
})

/** 견적서 작성 폼(POST /api/admin/invoices) 요청 body 검증 스키마 */
export const createInvoiceSchema = z.object({
  clientName: z.string().min(1, "클라이언트명을 입력해주세요."),
  issueDate: z.string().min(1, "발행일을 입력해주세요."),
  validUntil: z.string().min(1, "유효기간을 입력해주세요."),
  supplierInfo: z.string().optional(),
  items: z.array(createInvoiceItemSchema).min(1, "최소 1개 항목이 필요합니다."),
})
