// 비로그인 전용 레이아웃 — 인증된 사용자는 미들웨어에서 리다이렉트 처리

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Invoce</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Notion 견적서 공유 서비스
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
