import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { API_ENDPOINTS } from "@/constants"
import type { QuoteLink } from "@/types"

// 쿼리 키 상수
const QUERY_KEYS = {
  quotes: ["quotes"] as const,
}

// 견적서 목록 조회 훅
export function useQuotes() {
  return useQuery({
    queryKey: QUERY_KEYS.quotes,
    queryFn: async () => {
      // TODO: 실제 API 응답 타입 연동
      const response = await apiClient.get<QuoteLink[]>(API_ENDPOINTS.NOTION.QUOTES)
      return response.data
    },
  })
}

// 견적서 링크 생성 훅
export function useCreateQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notionPageId: string) => {
      // TODO: 실제 API 호출
      const response = await apiClient.post<QuoteLink>(
        API_ENDPOINTS.NOTION.QUOTES,
        { notionPageId },
      )
      return response.data
    },
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quotes })
    },
  })
}

// 견적서 링크 삭제 훅
export function useDeleteQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (slug: string) => {
      await apiClient.delete(API_ENDPOINTS.QUOTE.VIEW(slug))
    },
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quotes })
    },
  })
}
