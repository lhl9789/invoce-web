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
