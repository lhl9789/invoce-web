import { Client, APIErrorCode, APIResponseError, isFullPage, type PageObjectResponse } from "@notionhq/client"
import { NotFoundError, NotionError } from "./errors"
import {
  INVOICE_PROPERTY_NAMES,
  ITEM_PROPERTY_NAMES,
  type NotionInvoicePage,
  type NotionItemPage,
} from "@/types/notion"
import type {
  ParsedInvoice,
  ParsedInvoiceItem,
  InvoiceStatus,
  CreateInvoiceInput,
  CreateInvoiceItemInput,
} from "@/types/invoice"

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

/** Notion 견적서 DB 목록 조회 — search API 사용, DB parent 기준 필터링, 발행일 내림차순 */
export async function fetchInvoiceList(client: Client): Promise<ParsedInvoice[]> {
  const databaseId = process.env.NOTION_DATABASE_ID
  if (!databaseId) {
    throw new NotionError("NOTION_DATABASE_ID 환경변수가 설정되지 않았습니다.")
  }

  // databases.query()는 v5에서 제거됨 — search()로 전체 페이지 조회 후 DB parent 필터링
  try {
    const allPages: PageObjectResponse[] = []
    let cursor: string | null | undefined = undefined
    let hasMore = true

    while (hasMore && allPages.length < 100) {
      const response = await client.search({
        filter: { property: "object", value: "page" },
        sort: { timestamp: "last_edited_time", direction: "descending" },
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      })

      // 지정된 DB의 자식 페이지만 추출
      const dbPages = response.results.filter((result): result is PageObjectResponse => {
        if (!isFullPage(result)) return false
        const parent = result.parent
        // Notion API 2025-09-03+: DB 자식 페이지의 parent.type은 "data_source_id"이며,
        // database_id는 그 형태 안에 부가 필드로 포함됨 (parent.type === "database_id"는 더 이상 발생하지 않음)
        if (parent.type !== "database_id" && parent.type !== "data_source_id") return false
        const parentDatabaseId = "database_id" in parent ? parent.database_id : undefined
        if (!parentDatabaseId) return false
        // 하이픈 정규화 후 비교 (Notion ID는 하이픈 있는/없는 형태가 혼재할 수 있음)
        return parentDatabaseId.replace(/-/g, "") === databaseId.replace(/-/g, "")
      })

      allPages.push(...dbPages)
      hasMore = response.has_more
      cursor = response.next_cursor
    }

    return allPages
      .slice(0, 100)
      .map((page) => parseInvoiceProperties(page as NotionInvoicePage))
  } catch (err) {
    if (err instanceof NotionError) throw err
    throw new NotionError("견적서 목록을 가져오는 중 오류가 발생했습니다.")
  }
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

/** Items DB에 견적 항목 페이지 1개 생성 후 page ID 반환. "금액"은 Formula 속성이라 쓰기 대상에서 제외 */
export async function createInvoiceItem(
  client: Client,
  item: CreateInvoiceItemInput,
): Promise<string> {
  const databaseId = process.env.NOTION_ITEMS_DATABASE_ID
  if (!databaseId) {
    throw new NotionError("NOTION_ITEMS_DATABASE_ID 환경변수가 설정되지 않았습니다.")
  }

  try {
    const page = await client.pages.create({
      parent: { database_id: databaseId },
      properties: {
        [ITEM_PROPERTY_NAMES.description]: {
          title: [{ text: { content: item.description } }],
        },
        [ITEM_PROPERTY_NAMES.quantity]: { number: item.quantity },
        [ITEM_PROPERTY_NAMES.unitPrice]: { number: item.unitPrice },
      },
    })

    return page.id
  } catch {
    throw new NotionError("견적 항목 생성 중 오류가 발생했습니다.")
  }
}

/** Invoices DB에 견적서 페이지 1개 생성, "항목" relation에 itemPageIds 연결. 총 금액은 서버에서 재계산하여 기록 */
export async function createInvoice(
  client: Client,
  data: CreateInvoiceInput,
  itemPageIds: string[],
): Promise<{ id: string; invoiceNumber: string }> {
  const databaseId = process.env.NOTION_DATABASE_ID
  if (!databaseId) {
    throw new NotionError("NOTION_DATABASE_ID 환경변수가 설정되지 않았습니다.")
  }

  const totalAmount = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  )
  const invoiceNumber = `INV-${data.issueDate.replace(/-/g, "")}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`

  try {
    const page = await client.pages.create({
      parent: { database_id: databaseId },
      properties: {
        [INVOICE_PROPERTY_NAMES.invoiceNumber]: {
          title: [{ text: { content: invoiceNumber } }],
        },
        [INVOICE_PROPERTY_NAMES.clientName]: {
          rich_text: [{ text: { content: data.clientName } }],
        },
        [INVOICE_PROPERTY_NAMES.issueDate]: { date: { start: data.issueDate } },
        [INVOICE_PROPERTY_NAMES.validUntil]: { date: { start: data.validUntil } },
        [INVOICE_PROPERTY_NAMES.supplierInfo]: {
          rich_text: [{ text: { content: data.supplierInfo ?? "" } }],
        },
        [INVOICE_PROPERTY_NAMES.status]: { status: { name: "대기" } },
        [INVOICE_PROPERTY_NAMES.totalAmount]: { number: totalAmount },
        [INVOICE_PROPERTY_NAMES.items]: {
          relation: itemPageIds.map((id) => ({ id })),
        },
      },
    })

    return { id: page.id, invoiceNumber }
  } catch {
    throw new NotionError("견적서 생성 중 오류가 발생했습니다.")
  }
}
