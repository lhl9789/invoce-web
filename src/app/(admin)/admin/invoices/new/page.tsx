"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Plus, Trash2, Link2, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { createInvoiceSchema } from "@/lib/validations/invoice"
import { copyToClipboard } from "@/lib/utils/index"
import type { ApiResponse, CreateInvoiceInput, CreateInvoiceResult } from "@/types"

async function createInvoiceRequest(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
  const res = await fetch("/api/admin/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const data: ApiResponse<CreateInvoiceResult> = await res.json()

  if (!data.success) {
    throw new Error(data.error.message)
  }

  return data.data
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [result, setResult] = useState<CreateInvoiceResult | null>(null)
  const [copied, setCopied] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      clientName: "",
      issueDate: "",
      validUntil: "",
      supplierInfo: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  const items = watch("items")

  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0,
  )

  const mutation = useMutation({
    mutationFn: createInvoiceRequest,
    onSuccess: (data) => {
      setServerError(null)
      setResult(data)
    },
    onError: (err: Error) => {
      setServerError(err.message || "견적서 생성에 실패했습니다.")
    },
  })

  async function onSubmit(values: CreateInvoiceInput) {
    setServerError(null)
    mutation.mutate(values)
  }

  async function handleCopyLink() {
    if (!result) return
    const ok = await copyToClipboard(result.shareUrl)
    if (ok) {
      setCopied(true)
      toast.success("링크가 복사되었습니다.")
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error("링크 복사에 실패했습니다.")
    }
  }

  function handleContinue() {
    setResult(null)
    setCopied(false)
    reset({
      clientName: "",
      issueDate: "",
      validUntil: "",
      supplierInfo: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    })
  }

  function handleGoToList() {
    router.push("/admin/invoices")
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-semibold">견적서 작성</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          입력한 내용으로 Notion에 새 견적서를 생성합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="clientName">클라이언트명</Label>
            <Input id="clientName" placeholder="ABC 회사" {...register("clientName")} />
            {errors.clientName && (
              <p className="text-xs text-destructive">{errors.clientName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="issueDate">발행일</Label>
              <Input id="issueDate" type="date" {...register("issueDate")} />
              {errors.issueDate && (
                <p className="text-xs text-destructive">{errors.issueDate.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="validUntil">유효기간</Label>
              <Input id="validUntil" type="date" {...register("validUntil")} />
              {errors.validUntil && (
                <p className="text-xs text-destructive">{errors.validUntil.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="supplierInfo">공급자 정보 (선택)</Label>
            <Textarea
              id="supplierInfo"
              placeholder="회사명, 사업자번호, 연락처 등"
              {...register("supplierInfo")}
            />
          </div>
        </div>

        {/* 견적 항목 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>견적 항목</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
            >
              <Plus className="size-3.5" />
              항목 추가
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const quantity = Number(items[index]?.quantity) || 0
              const unitPrice = Number(items[index]?.unitPrice) || 0
              const amount = quantity * unitPrice

              return (
                <div
                  key={field.id}
                  className="flex items-start gap-2 rounded-lg border border-border/60 p-3"
                >
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="품목명"
                      {...register(`items.${index}.description`)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder="수량"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                      <Input
                        type="number"
                        placeholder="단가"
                        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      />
                      <div className="flex items-center justify-end text-sm text-muted-foreground">
                        {amount.toLocaleString("ko-KR")}원
                      </div>
                    </div>
                    {errors.items?.[index]?.description && (
                      <p className="text-xs text-destructive">
                        {errors.items[index]?.description?.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )
            })}
          </div>

          {errors.items?.root && (
            <p className="text-xs text-destructive">{errors.items.root.message}</p>
          )}
        </div>

        {/* 합계 */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
          <span className="text-sm font-medium">합계</span>
          <span className="text-lg font-semibold">
            {totalAmount.toLocaleString("ko-KR")}원
          </span>
        </div>

        {/* 서버 에러 */}
        {serverError && (
          <p className="text-sm text-destructive text-center">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending}>
          {isSubmitting || mutation.isPending ? "제출 중..." : "제출"}
        </Button>
      </form>

      {/* 성공 다이얼로그 */}
      <Dialog open={!!result} onOpenChange={(open) => !open && setResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>견적서가 생성되었습니다</DialogTitle>
            <DialogDescription>
              아래 링크를 클라이언트에게 전달하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
            <span className="flex-1 truncate text-sm text-muted-foreground">
              {result?.shareUrl}
            </span>
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5 shrink-0">
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleContinue}>
              계속 작성
            </Button>
            <Button onClick={handleGoToList}>목록으로 이동</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
