import { NextRequest, NextResponse } from "next/server"
import { fetchCachedInvoice } from "@/lib/notion"
import { isValidInvoiceId } from "@/lib/validations/invoice"
import { success, error } from "@/lib/api-response"
import { logger, extractRequestContext } from "@/lib/logger"
import { checkRateLimit } from "@/lib/rate-limit"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const startedAt = Date.now()
  const { id } = await params
  const ctx = extractRequestContext(req, { invoiceId: id })

  // IP 추출 — Next.js 15+ req.ip 제거됨, x-forwarded-for 헤더 사용
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"

  const { allowed } = checkRateLimit(ip)
  if (!allowed) {
    logger.warn("Rate limit exceeded", ctx)
    return NextResponse.json(
      error("RATE_LIMIT_EXCEEDED", "요청 한도를 초과했습니다. 잠시 후 다시 시도하세요."),
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
        },
      }
    )
  }

  if (!isValidInvoiceId(id)) {
    return NextResponse.json(
      error("INVALID_INVOICE_ID", "유효하지 않은 견적서 ID 형식입니다."),
      { status: 400 }
    )
  }

  try {
    const invoice = await fetchCachedInvoice(id)
    logger.info("Invoice fetched", { ...ctx, durationMs: Date.now() - startedAt })
    return NextResponse.json(success(invoice))
  } catch (err) {
    // 'use cache' 경계를 통과한 에러는 직렬화되어 instanceof 체크가 실패할 수 있으므로 .name으로 판별
    const errName = err instanceof Error ? err.name : ""
    if (errName === "NotFoundError") {
      return NextResponse.json(
        error("INVOICE_NOT_FOUND", "견적서를 찾을 수 없습니다."),
        { status: 404 }
      )
    }
    if (errName === "NotionError" || errName === "AppError") {
      logger.error("Notion API error", {
        ...ctx,
        errorCode: "NOTION_API_ERROR",
        durationMs: Date.now() - startedAt,
      })
      return NextResponse.json(
        error("NOTION_API_ERROR", "Notion 데이터를 불러오는 중 오류가 발생했습니다."),
        { status: 500 }
      )
    }
    logger.error("Unexpected error", {
      ...ctx,
      errorCode: "INTERNAL_ERROR",
      durationMs: Date.now() - startedAt,
    })
    return NextResponse.json(
      error("INTERNAL_ERROR", "서버 오류가 발생했습니다."),
      { status: 500 }
    )
  }
}
