"use client"

import { Button } from "@/components/ui/button"

interface PdfDownloadButtonProps {
  slug: string
}

// PDF 다운로드 버튼 — 브라우저 인쇄 기능을 활용
export function PdfDownloadButton({ slug: _slug }: PdfDownloadButtonProps) {
  function handlePrint() {
    window.print()
  }

  return (
    <button
      onClick={handlePrint}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      PDF로 저장
    </button>
  )
}
