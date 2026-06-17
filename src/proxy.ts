import { NextRequest, NextResponse } from "next/server"
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isLoginPage = pathname === "/admin/login"

  // 세션 쿠키에서 토큰 직접 읽기 — Edge runtime에서 next/headers 사용 불가
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = token ? await verifySessionToken(token) : null

  // 로그인 페이지: 세션이 있으면 목록 페이지로 리디렉션
  if (isLoginPage) {
    if (session) {
      return NextResponse.redirect(new URL("/admin/invoices", req.nextUrl))
    }
    return NextResponse.next()
  }

  // 그 외 /admin/* 경로: 세션 없으면 로그인 페이지로 리디렉션
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
