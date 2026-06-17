/** 애플리케이션 공통 에러 베이스 클래스 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message)
    this.name = "AppError"
  }
}

/** 리소스를 찾을 수 없을 때 발생 (404) */
export class NotFoundError extends AppError {
  constructor(message = "리소스를 찾을 수 없습니다.") {
    super(message, "NOT_FOUND", 404)
    this.name = "NotFoundError"
  }
}

/** Notion API 호출 실패 시 발생 (500) */
export class NotionError extends AppError {
  constructor(message = "Notion API 요청에 실패했습니다.") {
    super(message, "NOTION_API_ERROR", 500)
    this.name = "NotionError"
  }
}
