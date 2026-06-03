import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Tailwind 클래스 조합 유틸리티 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 날짜를 한국어 형식으로 포맷 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

/** 견적서 공유 URL 생성 */
export function getShareUrl(slug: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  return `${baseUrl}/q/${slug}`
}

/** 클립보드에 텍스트 복사 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
