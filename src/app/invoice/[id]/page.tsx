import { cache } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { FileText } from "lucide-react"
import { InvoiceViewer } from "@/components/invoice/InvoiceViewer"
import { PdfDownloadButton } from "@/components/invoice/PdfDownloadButton"
import { fetchCachedInvoice } from "@/lib/notion"
import { isValidInvoiceId } from "@/lib/validations/invoice"
import type { ParsedInvoice } from "@/types/invoice"

interface InvoicePageProps {
  params: Promise<{ id: string }>
}

/** 동일 요청 내 generateMetadata와 InvoicePage 간 중복 호출 방지 (요청 간 캐싱은 fetchCachedInvoice가 담당) */
const getInvoice = cache(async (id: string): Promise<ParsedInvoice> => {
  return fetchCachedInvoice(id)
})

export async function generateMetadata({
  params,
}: InvoicePageProps): Promise<Metadata> {
  const { id } = await params

  if (!isValidInvoiceId(id)) {
    return { title: "견적서 | Invoce" }
  }

  try {
    const invoice = await getInvoice(id)
    return {
      title: `${invoice.invoiceNumber} — 견적서 | Invoce`,
      description: `${invoice.clientName} 귀중 견적서입니다.`,
    }
  } catch {
    return { title: "견적서 | Invoce" }
  }
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params

  if (!isValidInvoiceId(id)) {
    notFound()
  }

  let invoice: ParsedInvoice
  try {
    invoice = await getInvoice(id)
  } catch (err) {
    // 'use cache' 경계 통과 시 에러가 직렬화되므로 .name으로 판별
    if (err instanceof Error && err.name === "NotFoundError") {
      notFound()
    }
    throw err
  }

  const invoiceTitle = `${invoice.invoiceNumber}_${invoice.clientName}_견적서`

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">

      {/* 상단 액션 바 — 인쇄 시 숨김 */}
      <div className="print:hidden sticky top-0 z-10 backdrop-blur-sm bg-white/95 border-b border-border/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground tracking-tight">
                Invoce
              </span>
            </div>
            <span className="text-border/60">·</span>
            <p className="text-sm text-muted-foreground truncate">
              <span className="font-medium text-foreground">
                {invoice.invoiceNumber}
              </span>
              <span className="mx-1.5 text-border">·</span>
              {invoice.clientName} 귀중
            </p>
          </div>
          <PdfDownloadButton invoiceTitle={invoiceTitle} />
        </div>
      </div>

      {/* 견적서 본문 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 print:px-0 print:py-0 print:max-w-none">
        <InvoiceViewer invoice={invoice} />
      </main>

    </div>
  )
}
