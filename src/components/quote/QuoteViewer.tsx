"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import type { QuotePageData } from "@/types"

interface QuoteViewerProps {
  slug: string
}

// TODO: TanStack Query (useQuote 훅)로 실제 Notion 데이터 연동 예정
export function QuoteViewer({ slug }: QuoteViewerProps) {
  const [data, setData] = useState<QuotePageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuote() {
      try {
        setIsLoading(true)
        // TODO: 실제 API 호출로 교체
        // const response = await apiClient.get<QuotePageData>(`/api/quote/${slug}`)
        // setData(response.data)

        // 임시 목업 데이터
        await new Promise((resolve) => setTimeout(resolve, 500))
        setData({
          slug,
          notionPageId: "mock-page-id",
          title: "견적서 — 웹사이트 개발",
          createdAt: new Date().toISOString(),
          blocks: [],
        })
      } catch {
        setError("견적서를 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuote()
  }, [slug])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p>{error ?? "견적서를 찾을 수 없습니다."}</p>
      </div>
    )
  }

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>{data.title}</h1>
      {/* TODO: Notion 블록 렌더러 구현 */}
      <div className="rounded-lg border bg-muted/50 p-6 not-prose">
        <p className="text-sm text-muted-foreground">
          Notion 페이지 콘텐츠가 여기에 렌더링됩니다.
          <br />
          페이지 ID: {data.notionPageId}
        </p>
      </div>
    </article>
  )
}
