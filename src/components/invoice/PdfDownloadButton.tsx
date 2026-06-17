"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PdfDownloadButtonProps {
  invoiceTitle: string
}

export function PdfDownloadButton({ invoiceTitle }: PdfDownloadButtonProps) {
  function handlePrint() {
    const originalTitle = document.title

    // 인쇄 파일명을 견적서 제목으로 변경
    document.title = invoiceTitle

    // 인쇄 완료 후 원래 제목 복원
    const restoreTitle = () => {
      document.title = originalTitle
      window.removeEventListener("afterprint", restoreTitle)
    }
    window.addEventListener("afterprint", restoreTitle)

    window.print()
  }

  return (
    <Button
      onClick={handlePrint}
      size="default"
      className="gap-2 print:hidden"
      aria-label="견적서를 PDF로 다운로드"
    >
      <Printer className="size-4" aria-hidden="true" />
      PDF 다운로드
    </Button>
  )
}
