import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"
import { success } from "@/lib/api-response"

export async function POST() {
  // 세션 쿠키 삭제 — 페이지 이동은 클라이언트(router.push)가 처리
  const cookieOptions = deleteSession()
  const response = NextResponse.json(success({ loggedOut: true }))
  response.cookies.set(cookieOptions)
  return response
}
