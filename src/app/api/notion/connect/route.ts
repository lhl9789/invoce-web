import { NextRequest, NextResponse } from "next/server"

// POST /api/notion/connect — Notion Integration Token 및 Database ID 저장
export async function POST(request: NextRequest) {
  try {
    // TODO: JWT 쿠키로 사용자 인증 확인
    // TODO: 요청 바디 파싱 (integrationToken, databaseId)
    // TODO: Notion API로 토큰 유효성 검증
    // TODO: 토큰 암호화 후 DB 저장 (ENCRYPTION_KEY 사용)

    const _body = await request.json()

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "Notion 연동이 완료되었습니다.",
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

// GET /api/notion/connect — Notion 연동 상태 조회
export async function GET() {
  try {
    // TODO: JWT 쿠키로 사용자 인증 확인
    // TODO: DB에서 연동 정보 조회

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "연동 상태 조회 성공",
        data: { isConnected: false },
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
