import { NextRequest, NextResponse } from "next/server"

// POST /api/auth/login — 이메일/비밀번호로 로그인
export async function POST(request: NextRequest) {
  try {
    // TODO: 요청 바디 파싱 및 검증
    // TODO: 사용자 조회 및 비밀번호 검증 (bcryptjs)
    // TODO: JWT 토큰 발급 (jose)
    // TODO: HttpOnly 쿠키에 토큰 저장

    const _body = await request.json()

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "로그인 성공",
        data: null,
      },
      { status: 200 },
    )
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
