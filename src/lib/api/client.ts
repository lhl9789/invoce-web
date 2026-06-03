import type { ApiResponse } from "@/types"

// =============================================================
// API 클라이언트 — Spring Boot 백엔드 연동용 fetch 래퍼
// =============================================================

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  credentials?: RequestCredentials
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, credentials = "include" } = options

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
    credentials,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  }

  const response = await fetch(endpoint, config)

  // 응답 본문 파싱
  let data: ApiResponse<T>
  try {
    data = await response.json()
  } catch {
    throw new ApiError(response.status, "응답 파싱에 실패했습니다.")
  }

  // HTTP 에러 처리
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message ?? "요청에 실패했습니다.",
      data,
    )
  }

  return data
}

// =============================================================
// HTTP 메서드 헬퍼
// =============================================================

export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method">) =>
    request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method">) =>
    request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method">) =>
    request<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
}

export { ApiError }
