import { NextRequest, NextResponse } from "next/server"

// GET /api/notion/quotes — 연동된 Notion DB에서 견적서 목록 조회
export async function GET() {
  try {
    // TODO: JWT 쿠키로 사용자 인증 확인
    // TODO: DB에서 암호화된 Notion 토큰 복호화
    // TODO: Notion SDK로 데이터베이스 쿼리
    // TODO: 견적서 목록을 QuoteLink 형식으로 변환하여 반환

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "견적서 목록 조회 성공",
        data: [],
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

// POST /api/notion/quotes — Notion 페이지로 견적서 공유 링크 생성
export async function POST(request: NextRequest) {
  try {
    // TODO: JWT 쿠키로 사용자 인증 확인
    // TODO: 요청 바디에서 notionPageId 추출
    // TODO: 고유 slug 생성
    // TODO: QuoteLink DB 저장

    const _body = await request.json()

    return NextResponse.json(
      {
        success: true,
        status: 201,
        message: "견적서 링크가 생성되었습니다.",
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
