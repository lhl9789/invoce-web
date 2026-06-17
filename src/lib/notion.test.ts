import { describe, it, expect } from "vitest"
import { parseInvoiceProperties, parseInvoiceItems } from "./notion"
import { INVOICE_PROPERTY_NAMES, ITEM_PROPERTY_NAMES, type NotionInvoicePage, type NotionItemPage } from "@/types/notion"

/** 테스트용 Notion 견적서 페이지 mock 생성 (id/properties만 채움) */
function createMockInvoicePage(properties: Record<string, unknown>, id = "invoice-page-id"): NotionInvoicePage {
  return {
    id,
    properties,
  } as unknown as NotionInvoicePage
}

/** 테스트용 Notion 견적 항목 페이지 mock 생성 (properties만 채움) */
function createMockItemPage(properties: Record<string, unknown>): NotionItemPage {
  return {
    id: "item-page-id",
    properties,
  } as unknown as NotionItemPage
}

/** rich_text/title 배열용 텍스트 항목 생성 */
function textItem(plainText: string) {
  return {
    type: "text",
    text: { content: plainText, link: null },
    plain_text: plainText,
    href: null,
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
    },
  }
}

describe("parseInvoiceProperties", () => {
  it("정상 케이스: 모든 프로퍼티가 채워진 경우 ParsedInvoice로 올바르게 매핑한다", () => {
    const page = createMockInvoicePage(
      {
        [INVOICE_PROPERTY_NAMES.invoiceNumber]: { type: "title", title: [textItem("INV-2026-001")] },
        [INVOICE_PROPERTY_NAMES.clientName]: { type: "rich_text", rich_text: [textItem("ABC 회사")] },
        [INVOICE_PROPERTY_NAMES.issueDate]: { type: "date", date: { start: "2026-06-01", end: null, time_zone: null } },
        [INVOICE_PROPERTY_NAMES.validUntil]: { type: "date", date: { start: "2026-06-30", end: null, time_zone: null } },
        [INVOICE_PROPERTY_NAMES.supplierInfo]: { type: "rich_text", rich_text: [textItem("공급자 정보")] },
        [INVOICE_PROPERTY_NAMES.status]: { type: "select", select: { id: "s1", name: "대기", color: "default" } },
        [INVOICE_PROPERTY_NAMES.totalAmount]: { type: "number", number: 5000000 },
      },
      "invoice-page-id",
    )

    const result = parseInvoiceProperties(page)

    expect(result).toEqual({
      id: "invoice-page-id",
      invoiceNumber: "INV-2026-001",
      clientName: "ABC 회사",
      issueDate: "2026-06-01",
      validUntil: "2026-06-30",
      status: "대기",
      totalAmount: 5000000,
      supplierInfo: "공급자 정보",
      items: [],
    })
  })

  it.each([
    ["대기", "대기"],
    ["승인", "승인"],
    ["거절", "거절"],
    ["기타", null],
  ] as const)("상태값 매핑: select.name이 '%s'이면 status는 %s이다", (name, expected) => {
    const page = createMockInvoicePage({
      [INVOICE_PROPERTY_NAMES.status]: { type: "select", select: { id: "s1", name, color: "default" } },
    })

    expect(parseInvoiceProperties(page).status).toBe(expected)
  })

  it("상태값 매핑: select가 null이면 status는 null이다", () => {
    const page = createMockInvoicePage({
      [INVOICE_PROPERTY_NAMES.status]: { type: "select", select: null },
    })

    expect(parseInvoiceProperties(page).status).toBeNull()
  })

  it("누락 프로퍼티 케이스: properties가 빈 객체이면 기본값으로 채워진다", () => {
    const page = createMockInvoicePage({})

    const result = parseInvoiceProperties(page)

    expect(result).toEqual({
      id: "invoice-page-id",
      invoiceNumber: "",
      clientName: "",
      issueDate: null,
      validUntil: null,
      status: null,
      totalAmount: 0,
      supplierInfo: "",
      items: [],
    })
  })

  it("date 속성의 date 값이 null이면 issueDate/validUntil은 null이다", () => {
    const page = createMockInvoicePage({
      [INVOICE_PROPERTY_NAMES.issueDate]: { type: "date", date: null },
      [INVOICE_PROPERTY_NAMES.validUntil]: { type: "date", date: null },
    })

    const result = parseInvoiceProperties(page)

    expect(result.issueDate).toBeNull()
    expect(result.validUntil).toBeNull()
  })
})

describe("parseInvoiceItems", () => {
  it("정상 케이스: 항목 페이지 목록을 ParsedInvoiceItem[]로 올바르게 매핑한다", () => {
    const items = [
      createMockItemPage({
        [ITEM_PROPERTY_NAMES.description]: { type: "title", title: [textItem("웹사이트 디자인")] },
        [ITEM_PROPERTY_NAMES.quantity]: { type: "number", number: 1 },
        [ITEM_PROPERTY_NAMES.unitPrice]: { type: "number", number: 100000 },
        [ITEM_PROPERTY_NAMES.amount]: { type: "formula", formula: { type: "number", number: 100000 } },
      }),
    ]

    expect(parseInvoiceItems(items)).toEqual([
      { description: "웹사이트 디자인", quantity: 1, unitPrice: 100000, amount: 100000 },
    ])
  })

  it("빈 배열 입력 시 빈 배열을 반환한다", () => {
    expect(parseInvoiceItems([])).toEqual([])
  })

  it("누락 프로퍼티 케이스: properties가 빈 객체이면 기본값으로 채워진다", () => {
    const items = [createMockItemPage({})]

    expect(parseInvoiceItems(items)).toEqual([
      { description: "", quantity: 0, unitPrice: 0, amount: 0 },
    ])
  })

  it("formula 타입이 number가 아니면 amount는 0이다", () => {
    const items = [
      createMockItemPage({
        [ITEM_PROPERTY_NAMES.amount]: { type: "formula", formula: { type: "string", string: "abc" } },
      }),
    ]

    expect(parseInvoiceItems(items)[0].amount).toBe(0)
  })
})
