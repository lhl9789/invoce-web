import type { Metadata } from "next"
import { QuoteList } from "@/components/common/quote-list"

export const metadata: Metadata = {
  title: "내 견적서",
  description: "생성한 견적서 링크 목록을 관리하세요.",
}

export default function QuotesPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">내 견적서</h1>
          <p className="mt-1 text-muted-foreground">
            Notion 견적서에서 생성한 공유 링크 목록입니다.
          </p>
        </div>
      </div>

      <QuoteList />
    </div>
  )
}
