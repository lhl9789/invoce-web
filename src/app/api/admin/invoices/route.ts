import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { getNotionClient, fetchInvoiceList } from "@/lib/notion"
import { success, error } from "@/lib/api-response"

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
