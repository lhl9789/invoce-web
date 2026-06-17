"use client"

import { useState } from "react"
import { Link2, Check } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { copyToClipboard, formatDate } from "@/lib/utils/index"
import type { ParsedInvoice, InvoiceStatus } from "@/types/invoice"

const STATUS_VARIANTS: Record<InvoiceStatus, "default" | "secondary" | "destructive"> = {
  대기: "secondary",
  승인: "default",
  거절: "destructive",
}

interface InvoiceListCardProps {
  invoice: ParsedInvoice
}

export function InvoiceListCard({ invoice }: InvoiceListCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopyLink() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const shareUrl = `${appUrl}/invoice/${invoice.id}`

    const ok = await copyToClipboard(shareUrl)
    if (ok) {
      setCopied(true)
      toast.success("링크가 복사되었습니다.")
      // 2초 후 복사 상태 초기화
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error("링크 복사에 실패했습니다.")
    }
  }

  const statusVariant = invoice.status ? STATUS_VARIANTS[invoice.status] : "secondary"

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 py-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">
              {invoice.invoiceNumber || "—"}
            </span>
            {invoice.status && (
              <Badge variant={statusVariant} className="shrink-0 text-xs">
                {invoice.status}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {invoice.clientName || "클라이언트 미설정"}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {invoice.issueDate && (
              <span>{formatDate(invoice.issueDate)}</span>
            )}
            {invoice.totalAmount > 0 && (
              <span className="font-medium text-foreground">
                {invoice.totalAmount.toLocaleString("ko-KR")}원
              </span>
            )}
          </div>
        </div>

        {/* 링크 복사 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="shrink-0 gap-1.5"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-green-600" />
              <span className="text-green-600">복사됨</span>
            </>
          ) : (
            <>
              <Link2 className="size-3.5" />
              <span>링크 복사</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
