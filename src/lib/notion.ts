import { Client, APIErrorCode, APIResponseError, isFullPage } from "@notionhq/client"
import { NotFoundError, NotionError } from "./errors"
import {
  INVOICE_PROPERTY_NAMES,
  ITEM_PROPERTY_NAMES,
  type NotionInvoicePage,
  type NotionItemPage,
} from "@/types/notion"
import type { ParsedInvoice, ParsedInvoiceItem, InvoiceStatus } from "@/types/invoice"

// 개발 환경 핫리로드 시 Notion 클라이언트가 중복 생성되는 것을 방지하기 위한 전역 캐시
const globalForNotion = globalThis as unknown as {
  notionClient: Client | undefined
}

/** NOTION_API_KEY 기반 Notion 클라이언트 싱글톤 반환 */
export function getNotionClient(): Client {
  if (!globalForNotion.notionClient) {
    const apiKey = process.env.NOTION_API_KEY

    if (!apiKey) {
      throw new Error("NOTION_API_KEY 환경변수가 설정되지 않았습니다.")
    }

    globalForNotion.notionClient = new Client({ auth: apiKey })
  }

  return globalForNotion.notionClient
}

/** 견적서(Invoices DB) 페이지 조회 — 존재하지 않으면 NotFoundError, 그 외 실패는 NotionError */
export async function fetchInvoicePage(client: Client, pageId: string): Promise<NotionInvoicePage> {
  try {
    const page = await client.pages.retrieve({ page_id: pageId })

    if (!isFullPage(page)) {
      throw new NotionError("견적서 페이지 정보를 가져올 수 없습니다.")
    }

    return page
  } catch (err) {
    if (
      err instanceof APIResponseError &&
      (err.code === APIErrorCode.ObjectNotFound ||
        err.code === APIErrorCode.RestrictedResource)
    ) {
      throw new NotFoundError("견적서를 찾을 수 없습니다.")
    }
    if (err instanceof NotFoundError || err instanceof NotionError) {
      throw err
    }
    throw new NotionError()
  }
}

/** 견적서 페이지의 "항목" Relation에 연결된 Items DB 페이지 목록 조회 */
export async function fetchInvoiceItems(client: Client, pageId: string): Promise<NotionItemPage[]> {
  const invoicePage = await fetchInvoicePage(client, pageId)
  const itemsProperty = invoicePage.properties[INVOICE_PROPERTY_NAMES.items]

  if (!itemsProperty || itemsProperty.type !== "relation" || itemsProperty.relation.length === 0) {
    return []
  }

  try {
    const itemPages = await Promise.all(
      itemsProperty.relation.map(({ id }) => client.pages.retrieve({ page_id: id })),
    )

    return itemPages.filter(isFullPage)
  } catch {
    throw new NotionError("견적 항목 정보를 가져오는 중 오류가 발생했습니다.")
  }
}

/** Notion 페이지 속성 값 — title/rich_text/date/number/select/relation/formula 등 판별 유니온 */
type NotionPageProperty = NotionInvoicePage["properties"][string]

/** title 속성에서 일반 텍스트 추출 */
function getTitleText(property: NotionPageProperty | undefined): string {
  if (property?.type !== "title") return ""
  return property.title.map((text) => text.plain_text).join("")
}

/** rich_text 속성에서 일반 텍스트 추출 */
function getRichTextValue(property: NotionPageProperty | undefined): string {
  if (property?.type !== "rich_text") return ""
  return property.rich_text.map((text) => text.plain_text).join("")
}

/** date 속성에서 시작일 추출 */
function getDateValue(property: NotionPageProperty | undefined): string | null {
  if (property?.type !== "date") return null
  return property.date?.start ?? null
}

/** number 속성 값 추출 (누락 시 0) */
function getNumberValue(property: NotionPageProperty | undefined): number {
  if (property?.type !== "number") return 0
  return property.number ?? 0
}

/** select 또는 status 속성 값 추출 — 견적서 상태 값으로만 매핑 */
function getStatusValue(property: NotionPageProperty | undefined): InvoiceStatus | null {
  if (!property) return null
  let name: string | null | undefined

  if (property.type === "select") {
    name = property.select?.name
  } else if (property.type === "status") {
    name = property.status?.name
  } else {
    return null
  }

  return name === "대기" || name === "승인" || name === "거절" ? name : null
}

/** formula(number) 속성 값 추출 (누락 시 0) */
function getFormulaNumberValue(property: NotionPageProperty | undefined): number {
  if (property?.type !== "formula" || property.formula.type !== "number") return 0
  return property.formula.number ?? 0
}

/** Notion 견적서 페이지 → ParsedInvoice 변환 (items는 빈 배열로 두고 parseInvoiceItems 결과를 별도 병합) */
export function parseInvoiceProperties(page: NotionInvoicePage): ParsedInvoice {
  const properties = page.properties

  return {
    id: page.id,
    invoiceNumber: getTitleText(properties[INVOICE_PROPERTY_NAMES.invoiceNumber]),
    clientName: getRichTextValue(properties[INVOICE_PROPERTY_NAMES.clientName]),
    issueDate: getDateValue(properties[INVOICE_PROPERTY_NAMES.issueDate]),
    validUntil: getDateValue(properties[INVOICE_PROPERTY_NAMES.validUntil]),
    status: getStatusValue(properties[INVOICE_PROPERTY_NAMES.status]),
    totalAmount: getNumberValue(properties[INVOICE_PROPERTY_NAMES.totalAmount]),
    supplierInfo: getRichTextValue(properties[INVOICE_PROPERTY_NAMES.supplierInfo]),
    items: [],
  }
}

interface InvoiceCacheEntry {
  data: ParsedInvoice
  expiresAt: number
}

// 요청 간 60초 in-memory 캐시 — 핫리로드 대응을 위해 globalThis 사용
const g = globalThis as typeof globalThis & {
  __invoiceCache?: Map<string, InvoiceCacheEntry>
}
if (!g.__invoiceCache) g.__invoiceCache = new Map()
const invoiceCache = g.__invoiceCache

const CACHE_TTL_MS = 60_000

/** Notion 견적서 조회 + 60초 서버사이드 in-memory 캐싱 */
export async function fetchCachedInvoice(id: string): Promise<ParsedInvoice> {
  const now = Date.now()
  const cached = invoiceCache.get(id)

  if (cached && now < cached.expiresAt) {
    return cached.data
  }

  const client = getNotionClient()
  const page = await fetchInvoicePage(client, id)
  const rawItems = await fetchInvoiceItems(client, id)
  const data = {
    ...parseInvoiceProperties(page),
    items: parseInvoiceItems(rawItems),
  }

  invoiceCache.set(id, { data, expiresAt: now + CACHE_TTL_MS })
  return data
}

/** Notion 견적 항목(Items DB) 페이지 목록 → ParsedInvoiceItem[] 변환 */
export function parseInvoiceItems(rawItems: NotionItemPage[]): ParsedInvoiceItem[] {
  return rawItems.map((item) => {
    const properties = item.properties

    return {
      description: getTitleText(properties[ITEM_PROPERTY_NAMES.description]),
      quantity: getNumberValue(properties[ITEM_PROPERTY_NAMES.quantity]),
      unitPrice: getNumberValue(properties[ITEM_PROPERTY_NAMES.unitPrice]),
      amount: getFormulaNumberValue(properties[ITEM_PROPERTY_NAMES.amount]),
    }
  })
}
