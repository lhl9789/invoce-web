import { NextRequest, NextResponse } from "next/server"

// POST /api/auth/signup — 신규 사용자 회원가입
export async function POST(request: NextRequest) {
  try {
    // TODO: 요청 바디 파싱 및 Zod 검증
    // TODO: 이메일 중복 확인
    // TODO: 비밀번호 해싱 (bcryptjs)
    // TODO: 사용자 DB 저장
    // TODO: JWT 토큰 발급 및 쿠키 저장

    const _body = await request.json()

    return NextResponse.json(
      {
        success: true,
        status: 201,
        message: "회원가입 성공",
        data: null,
      },
      { status: 201 },
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
