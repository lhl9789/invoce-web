import { NextRequest, NextResponse } from "next/server"
import { validateAdminCredentials, createSession } from "@/lib/auth"
import { success, error } from "@/lib/api-response"

export async function POST(req: NextRequest) {
  let password: string

  try {
    const body = await req.json()
    password = body?.password
  } catch {
    return NextResponse.json(
      error("INVALID_REQUEST", "요청 형식이 올바르지 않습니다."),
      { status: 400 },
    )
  }

  if (!password) {
    return NextResponse.json(
      error("INVALID_REQUEST", "비밀번호를 입력해주세요."),
      { status: 400 },
    )
  }

  try {
    const isValid = await validateAdminCredentials(password)
    if (!isValid) {
      return NextResponse.json(
        error("INVALID_CREDENTIALS", "비밀번호가 올바르지 않습니다."),
        { status: 401 },
      )
    }

    // JWT 생성 후 쿠키 옵션 획득
    const cookieOptions = await createSession()
    const response = NextResponse.json(success({ admin: true }), { status: 200 })
    response.cookies.set(cookieOptions)
    return response
  } catch {
    return NextResponse.json(
      error("INTERNAL_ERROR", "서버 오류가 발생했습니다."),
      { status: 500 },
    )
  }
}
