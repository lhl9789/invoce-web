import { FileText } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="size-16 rounded-2xl bg-slate-900 flex items-center justify-center">
            <FileText className="size-8 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Invoce</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            견적서 공유 링크를 통해 이 페이지에 접근해 주세요.
            <br />
            공유받은 링크가 있다면 해당 링크를 직접 열어주세요.
          </p>
        </div>
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-400 font-mono">
          /invoice/[견적서 ID]
        </div>
      </div>
    </div>
  )
}
