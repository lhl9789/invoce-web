import { ParsedInvoice, InvoiceStatus } from "@/types/invoice"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils"

interface InvoiceViewerProps {
  invoice: ParsedInvoice
}

/** 금액을 한국 원화 형식으로 포맷 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount)
}

/** 견적서 상태에 따른 Badge variant 결정 */
function getStatusBadgeVariant(
  status: InvoiceStatus | null
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "승인":
      return "default"
    case "거절":
      return "destructive"
    case "대기":
      return "secondary"
    default:
      return "outline"
  }
}

export function InvoiceViewer({ invoice }: InvoiceViewerProps) {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
  const tax = Math.round(subtotal * 0.1)
  const total = invoice.totalAmount

  return (
    <article className="bg-card rounded-2xl shadow-sm ring-1 ring-border print:shadow-none print:rounded-none print:ring-0">
      {/* 최상위 패딩 래퍼 */}
      <div className="p-8 sm:p-10 md:p-12 print:p-8">

        {/* === 헤더 섹션 === */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* 좌측: 공급자 정보 */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.1em]">
              공급자
            </p>
            {invoice.supplierInfo ? (
              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                {invoice.supplierInfo}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                공급자 정보 없음
              </p>
            )}
          </div>

          {/* 우측: 견적서 메타 정보 */}
          <div className="sm:text-right space-y-3 shrink-0">
            <div className="flex items-center gap-2 sm:justify-end">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                견적서
              </h1>
              {invoice.status && (
                <Badge
                  variant={getStatusBadgeVariant(invoice.status)}
                  className="print:hidden"
                >
                  {invoice.status}
                </Badge>
              )}
            </div>
            <dl className="space-y-1 text-sm">
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-muted-foreground shrink-0">문서 번호</dt>
                <dd className="font-medium text-foreground">
                  {invoice.invoiceNumber || "—"}
                </dd>
              </div>
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-muted-foreground shrink-0">발행일</dt>
                <dd className="font-medium text-foreground">
                  {invoice.issueDate ? formatDate(invoice.issueDate) : "—"}
                </dd>
              </div>
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-muted-foreground shrink-0">유효기간</dt>
                <dd className="font-medium text-foreground">
                  {invoice.validUntil ? formatDate(invoice.validUntil) : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <Separator className="my-8 sm:my-10" />

        {/* === 클라이언트 정보 섹션 === */}
        <section aria-labelledby="client-section-title" className="mb-10">
          <h2
            id="client-section-title"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-4"
          >
            수신
          </h2>
          <div className="bg-muted rounded-lg px-5 py-4 border border-border">
            <p className="text-base font-semibold text-foreground">
              {invoice.clientName || "—"}{" "}
              <span className="font-normal text-muted-foreground text-sm">
                귀중
              </span>
            </p>
          </div>
        </section>

        {/* === 견적 항목 테이블 === */}
        <section aria-labelledby="items-section-title" className="mb-10">
          <h2
            id="items-section-title"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-4"
          >
            견적 내역
          </h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/80 hover:bg-muted/80">
                  <TableHead className="w-full font-semibold text-foreground pl-6 py-4">
                    품목
                  </TableHead>
                  <TableHead className="text-right font-semibold text-foreground min-w-[60px] py-4">
                    수량
                  </TableHead>
                  <TableHead className="text-right font-semibold text-foreground min-w-[100px] py-4">
                    단가
                  </TableHead>
                  <TableHead className="text-right font-semibold text-foreground min-w-[110px] pr-6 py-4">
                    금액
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-medium pl-6 py-5">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground tabular-nums py-5">
                        {item.quantity.toLocaleString("ko-KR")}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground tabular-nums py-5">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums pr-6 py-5">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-10"
                    >
                      견적 항목이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </div>
        </section>

        {/* === 금액 합계 섹션 === */}
        <section aria-labelledby="totals-section-title" className="flex justify-end">
          <div className="w-full max-w-sm" role="group" aria-labelledby="totals-section-title">
            <h2 id="totals-section-title" className="sr-only">금액 합계</h2>

            {/* 소계 · 세금 행 */}
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden mb-2">
              <div className="flex items-center justify-between text-sm px-4 py-3">
                <span className="text-muted-foreground">소계</span>
                <span className="tabular-nums font-medium">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm px-4 py-3">
                <span className="text-muted-foreground">부가세 (10%)</span>
                <span className="tabular-nums font-medium">
                  {formatCurrency(tax)}
                </span>
              </div>
            </div>

            {/* 총액 강조 박스 */}
            <div className="bg-foreground rounded-lg px-5 py-4 flex items-center justify-between print:bg-white print:border-2 print:border-foreground">
              <span className="font-semibold text-base text-background print:text-foreground">
                합계
              </span>
              <span className="text-2xl font-bold tabular-nums text-background print:text-foreground">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </section>

        {/* === 안내 문구 (인쇄 시 표시) === */}
        <footer className="mt-12 pt-6 border-t border-border/50 hidden print:block">
          <p className="text-xs text-muted-foreground text-center">
            본 견적서는 발행일로부터 유효기간까지 유효합니다. 문의사항은 발행자에게 연락하시기 바랍니다.
          </p>
        </footer>

      </div>
    </article>
  )
}
