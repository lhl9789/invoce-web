import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { QuoteViewer } from "@/components/quote/QuoteViewer"
import { PdfDownloadButton } from "@/components/quote/PdfDownloadButton"

interface QuoteViewPageProps {
  params: Promise<{ slug: string }>
}

// 동적 메타데이터 — Notion 페이지 제목을 가져와 설정
export async function generateMetadata({
  params,
}: QuoteViewPageProps): Promise<Metadata> {
  const { slug } = await params
  // TODO: 실제 Notion 페이지 제목 조회 후 반환
  return {
    title: `견적서 — ${slug}`,
    description: "Invoce로 공유된 견적서입니다.",
  }
}

export default async function QuoteViewPage({ params }: QuoteViewPageProps) {
  const { slug } = await params

  if (!slug) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 인쇄 시 숨겨지는 헤더 */}
      <header className="border-b py-3 px-4 print:hidden">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <span className="text-sm font-medium">Invoce</span>
          {/* PDF 다운로드 버튼 */}
          <PdfDownloadButton slug={slug} />
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* TODO: Notion 페이지 데이터 연동 후 QuoteViewer에 전달 */}
        <QuoteViewer slug={slug} />
      </main>
    </div>
  )
}
