import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api/client"
import { API_ENDPOINTS, ROUTES } from "@/constants"
import type { User } from "@/types"

interface LoginPayload {
  email: string
  password: string
}

interface SignupPayload {
  email: string
  password: string
}

// 로그인 훅
export function useLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await apiClient.post<User>(
        API_ENDPOINTS.AUTH.LOGIN,
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      // 로그인 성공 후 대시보드로 이동
      router.push(ROUTES.DASHBOARD)
    },
  })
}

// 회원가입 훅
export function useSignup() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (payload: SignupPayload) => {
      const response = await apiClient.post<User>(
        API_ENDPOINTS.AUTH.SIGNUP,
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      // 회원가입 성공 후 대시보드로 이동
      router.push(ROUTES.DASHBOARD)
    },
  })
}

// 로그아웃 훅
export function useLogout() {
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    },
    onSuccess: () => {
      // 로그아웃 후 로그인 페이지로 이동
      router.push(ROUTES.LOGIN)
    },
  })
}
