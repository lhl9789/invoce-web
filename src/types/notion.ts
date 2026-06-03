/** Notion 연동 정보 (클라이언트용 — encryptedToken 미포함) */
export interface NotionIntegration {
  id: string
  userId: string
  databaseId: string
  updatedAt: string
  isConnected: boolean
}

/** Notion 블록 기본 타입 */
export interface NotionBlock {
  id: string
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any>
}

/** Notion 연동 폼 값 */
export interface NotionConnectFormValues {
  integrationToken: string
  databaseId: string
}
