import type { ApiResponse } from "@/types"

/** 성공 응답 생성 */
export function success<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

/** 실패 응답 생성 */
export function error(code: string, message: string): ApiResponse<never> {
  return { success: false, error: { code, message } }
}
