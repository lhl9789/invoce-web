"use client"

import { useQueryClient, useQuery } from "@tanstack/react-query"
import { RefreshCw, AlertCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { InvoiceListCard } from "@/components/admin/InvoiceListCard"
import type { ApiResponse, ParsedInvoice } from "@/types"

async function fetchInvoices(): Promise<ParsedInvoice[]> {
  const res = await fetch("/api/admin/invoices")
  const data: ApiResponse<ParsedInvoice[]> = await res.json()

  if (!data.success) {
    throw new Error(data.error.message)
  }

  return data.data
}

function InvoiceSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="h-3.5 w-48" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export default function AdminInvoicesPage() {
  const queryClient = useQueryClient()

  const {
    data: invoices,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "invoices"],
    queryFn: fetchInvoices,
  })

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] })
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">견적서 목록</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Notion 데이터베이스에 연결된 견적서 목록입니다.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="gap-1.5"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <InvoiceSkeleton key={i} />
          ))}
        </div>
      )}

      {/* 에러 상태 */}
      {isError && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <div className="space-y-1">
            <p className="font-medium">목록을 불러오지 못했습니다.</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      )}

      {/* 빈 목록 */}
      {!isLoading && !isError && invoices && invoices.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <FileText className="size-8 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium">견적서가 없습니다.</p>
            <p className="text-sm text-muted-foreground">
              Notion 데이터베이스에 견적서를 추가하면 여기에 표시됩니다.
            </p>
          </div>
        </div>
      )}

      {/* 견적서 목록 */}
      {!isLoading && !isError && invoices && invoices.length > 0 && (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <InvoiceListCard key={invoice.id} invoice={invoice} />
          ))}
          <p className="text-xs text-muted-foreground text-center pt-2">
            총 {invoices.length}건
          </p>
        </div>
      )}
    </div>
  )
}
