import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ slug: string }>
}

// GET /api/quote/[slug] — 공개 견적서 데이터 조회 (인증 불필요)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params

    // TODO: slug로 QuoteLink 조회
    // TODO: 연결된 Notion 페이지 ID 확인
    // TODO: 해당 사용자의 Notion 토큰 복호화
    // TODO: Notion SDK로 페이지 블록 조회
    // TODO: 렌더링 가능한 데이터 형식으로 변환 후 반환

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: "잘못된 요청입니다.",
          data: null,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "견적서 조회 성공",
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

// DELETE /api/quote/[slug] — 견적서 공유 링크 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params

    // TODO: JWT 쿠키로 사용자 인증 확인
    // TODO: 해당 slug의 소유자 확인
    // TODO: QuoteLink DB에서 삭제

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: "잘못된 요청입니다.",
          data: null,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "견적서 링크가 삭제되었습니다.",
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
