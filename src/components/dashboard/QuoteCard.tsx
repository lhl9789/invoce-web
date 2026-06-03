"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getShareUrl, copyToClipboard, formatDate } from "@/lib/utils"
import { Copy, ExternalLink, Trash2 } from "lucide-react"
import type { QuoteLink } from "@/types"

interface QuoteCardProps {
  quote: QuoteLink
  onDelete: (id: string) => void
}

export function QuoteCard({ quote, onDelete }: QuoteCardProps) {
  async function handleCopyLink() {
    const url = getShareUrl(quote.slug)
    const success = await copyToClipboard(url)
    if (success) {
      toast.success("링크가 클립보드에 복사되었습니다.")
    } else {
      toast.error("링크 복사에 실패했습니다.")
    }
  }

  return (
    <Card>
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
              /quote/{quote.slug}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyLink}
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
              onClick={() => onDelete(quote.id)}
              title="삭제"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
