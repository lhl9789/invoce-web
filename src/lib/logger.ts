export interface LogContext {
  requestId: string
  path: string
  method?: string
  invoiceId?: string
  errorCode?: string
  durationMs?: number
}

type LogLevel = "info" | "warn" | "error"

function log(level: LogLevel, message: string, context: LogContext): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  }
  if (level === "error") {
    console.error(JSON.stringify(entry))
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

export const logger = {
  info: (message: string, context: LogContext) => log("info", message, context),
  warn: (message: string, context: LogContext) => log("warn", message, context),
  error: (message: string, context: LogContext) => log("error", message, context),
}

/** NextRequest 또는 Request에서 구조화 로그용 컨텍스트 추출 */
export function extractRequestContext(
  req: Request,
  extraFields?: Partial<Omit<LogContext, "requestId" | "path" | "method">>
): LogContext {
  const url = new URL(req.url)
  // Vercel 인프라 주입 헤더 우선, 없으면 직접 생성
  const requestId =
    req.headers.get("x-request-id") ??
    req.headers.get("x-vercel-id") ??
    crypto.randomUUID()

  return {
    requestId,
    path: url.pathname,
    method: req.method,
    ...extraFields,
  }
}
