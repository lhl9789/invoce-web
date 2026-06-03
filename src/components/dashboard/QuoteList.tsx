"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getShareUrl, copyToClipboard, formatDate } from "@/lib/utils"
import { Copy, ExternalLink, Trash2, Plus } from "lucide-react"
import type { QuoteLink } from "@/types"
import { QuoteCard } from "./QuoteCard"

// TODO: TanStack Query (useQuotes 훅)로 실제 데이터 연동 예정
const MOCK_QUOTES: QuoteLink[] = [
  {
    id: "1",
    slug: "abc123",
    userId: "user1",
    notionPageId: "notion-page-1",
    createdAt: new Date().toISOString(),
  },
]

export function QuoteList() {
  const [quotes, setQuotes] = useState<QuoteLink[]>(MOCK_QUOTES)

  function handleDelete(id: string) {
    // TODO: 실제 삭제 API 연동
    setQuotes((prev) => prev.filter((q) => q.id !== id))
    toast.success("견적서 링크가 삭제되었습니다.")
  }

  if (quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground mb-4">
          아직 생성된 견적서 링크가 없습니다.
        </p>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          견적서 링크 생성
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          새 링크 생성
        </Button>
      </div>

      <div className="grid gap-4">
        {quotes.map((quote) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}
