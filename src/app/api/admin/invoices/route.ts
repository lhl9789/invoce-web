import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { getNotionClient, fetchInvoiceList, createInvoiceItem, createInvoice } from "@/lib/notion"
import { success, error } from "@/lib/api-response"
import { createInvoiceSchema } from "@/lib/validations/invoice"
import { checkRateLimit } from "@/lib/rate-limit"

export async function GET() {
  // 세션 검증 — 미인증 시 401 반환
  const session = await verifySession()
  if (!session) {
    return NextResponse.json(
      error("UNAUTHORIZED", "로그인이 필요합니다."),
      { status: 401 },
    )
  }

  try {
    const client = getNotionClient()
    const invoices = await fetchInvoiceList(client)
    return NextResponse.json(success(invoices))
  } catch (err) {
    const errName = err instanceof Error ? err.name : ""
    if (errName === "NotionError" || errName === "AppError") {
      return NextResponse.json(
        error("NOTION_API_ERROR", "Notion 데이터를 불러오는 중 오류가 발생했습니다."),
        { status: 500 },
      )
    }
    return NextResponse.json(
      error("INTERNAL_ERROR", "서버 오류가 발생했습니다."),
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  // 세션 검증 — 미인증 시 401 반환
  const session = await verifySession()
  if (!session) {
    return NextResponse.json(
      error("UNAUTHORIZED", "로그인이 필요합니다."),
      { status: 401 },
    )
  }

  // Notion API 남용 방지를 위한 rate limit (분당 10회) — 단일 관리자 인증이므로 고정 키 사용
  const { allowed } = checkRateLimit("admin-invoices-post")
  if (!allowed) {
    return NextResponse.json(
      error("RATE_LIMITED", "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."),
      { status: 429 },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = createInvoiceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      error("INVALID_INPUT", parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다."),
      { status: 400 },
    )
  }

  try {
    const client = getNotionClient()
    const itemPageIds = await Promise.all(
      parsed.data.items.map((item) => createInvoiceItem(client, item)),
    )
    const invoice = await createInvoice(client, parsed.data, itemPageIds)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    return NextResponse.json(
      success({ id: invoice.id, shareUrl: `${appUrl}/invoice/${invoice.id}` }),
    )
  } catch (err) {
    const errName = err instanceof Error ? err.name : ""
    if (errName === "NotionError" || errName === "AppError") {
      return NextResponse.json(
        error("NOTION_API_ERROR", "견적서 생성 중 오류가 발생했습니다."),
        { status: 500 },
      )
    }
    return NextResponse.json(
      error("INTERNAL_ERROR", "서버 오류가 발생했습니다."),
      { status: 500 },
    )
  }
}
