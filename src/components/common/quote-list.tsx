"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getShareUrl, copyToClipboard, formatDate } from "@/lib/utils"
import { Copy, ExternalLink, Trash2, Plus } from "lucide-react"
import type { QuoteLink } from "@/types"

// TODO: TanStack Query로 실제 데이터 연동 예정
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

  async function handleCopyLink(slug: string) {
    const url = getShareUrl(slug)
    const success = await copyToClipboard(url)
    if (success) {
      toast.success("링크가 클립보드에 복사되었습니다.")
    } else {
      toast.error("링크 복사에 실패했습니다.")
    }
  }

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
          <Card key={quote.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-medium">
                  견적서 {quote.slug}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  공개
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>생성일: {formatDate(quote.createdAt)}</p>
                  <p className="mt-0.5 font-mono text-xs">
                    /q/{quote.slug}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyLink(quote.slug)}
                    title="링크 복사"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    title="새 탭에서 보기"
                  >
                    <a
                      href={getShareUrl(quote.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(quote.id)}
                    title="삭제"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
