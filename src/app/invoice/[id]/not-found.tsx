import { FileX2, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function InvoiceNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-sm max-w-md w-full p-8 sm:p-10 text-center">

        {/* 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center">
            <FileX2
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* 제목 */}
        <h1 className="text-xl font-bold text-foreground mb-2">
          견적서를 찾을 수 없습니다
        </h1>

        {/* 설명 */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          입력하신 링크에 해당하는 견적서가 존재하지 않거나,
          <br className="hidden sm:block" />
          링크가 만료되었을 수 있습니다.
        </p>

        <Separator className="mb-6" />

        {/* 안내 가이드 */}
        <div className="text-left space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest text-center mb-4">
            해결 방법
          </p>
          <ul className="space-y-3 text-sm text-foreground">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 size-5 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-medium text-muted-foreground">
                1
              </span>
              <span>
                견적서를 보내준 담당자에게 올바른 링크를 다시 요청하세요.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 size-5 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-medium text-muted-foreground">
                2
              </span>
              <span>
                이메일 또는 메신저에서 받은 원본 링크를 다시 확인해 보세요.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 size-5 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-medium text-muted-foreground">
                3
              </span>
              <span>
                링크가 올바른데도 이 페이지가 표시된다면, 담당자에게 문의해
                주세요.
              </span>
            </li>
          </ul>
        </div>

        {/* 문의 안내 */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Mail className="size-3.5" aria-hidden="true" />
          <span>문의: 견적서를 보내준 담당자에게 연락하세요</span>
        </div>

      </div>
    </div>
  )
}
