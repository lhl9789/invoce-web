import type { Metadata } from "next"
import { NotionConnectForm } from "@/components/notion/NotionConnectForm"

export const metadata: Metadata = {
  title: "Notion 연동 설정",
  description: "Notion Integration Token을 연결하여 견적서를 가져오세요.",
}

export default function NotionSettingsPage() {
  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Notion 연동 설정</h1>
        <p className="mt-2 text-muted-foreground">
          Notion Integration Token과 Database ID를 입력하여 견적서 데이터베이스를
          연결하세요.
        </p>
      </div>

      {/* 연동 안내 */}
      <div className="mb-6 rounded-lg border bg-muted/50 p-4 text-sm space-y-2">
        <p className="font-medium">연동 방법</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Notion Integrations
            </a>
            에서 새 Integration을 생성하세요.
          </li>
          <li>생성된 Internal Integration Token을 복사하세요.</li>
          <li>견적서 데이터베이스 페이지에서 Integration을 연결하세요.</li>
          <li>데이터베이스 URL에서 Database ID를 복사하세요.</li>
        </ol>
      </div>

      {/* TODO: 연동 상태 확인 및 폼 렌더링 */}
      <NotionConnectForm />
    </div>
  )
}
