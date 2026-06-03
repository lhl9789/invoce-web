// Notion SDK 클라이언트 초기화
// TODO: @notionhq/client 패키지 설치 후 구현
// npm install @notionhq/client

// TODO: 사용자별 토큰으로 Notion 클라이언트 생성
export function createNotionClient(_token: string) {
  // TODO: new Client({ auth: decryptedToken }) 구현
  throw new Error("createNotionClient 미구현 — @notionhq/client 패키지 설치 필요")
}

// TODO: Notion 데이터베이스 쿼리
export async function queryDatabase(_databaseId: string, _notionClient: unknown) {
  // TODO: notion.databases.query() 구현
  throw new Error("queryDatabase 미구현")
}

// TODO: Notion 페이지 블록 조회
export async function getPageBlocks(_pageId: string, _notionClient: unknown) {
  // TODO: notion.blocks.children.list() 구현
  throw new Error("getPageBlocks 미구현")
}
