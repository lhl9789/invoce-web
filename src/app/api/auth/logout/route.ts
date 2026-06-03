import { NextResponse } from "next/server"

// POST /api/auth/logout — 로그아웃 (쿠키 삭제)
export async function POST() {
  try {
    // TODO: HttpOnly 쿠키에서 JWT 토큰 삭제

    const response = NextResponse.json(
      {
        success: true,
        status: 200,
        message: "로그아웃 성공",
        data: null,
      },
      { status: 200 },
    )

    // TODO: 쿠키 만료 처리
    // response.cookies.delete("token")

    return response
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: "서버 오류가 발생했습니다.",
        data: null,
      },
      { status: 500 },
    )
  }
}
