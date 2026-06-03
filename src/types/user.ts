/** 사용자 */
export interface User {
  id: string
  email: string
  createdAt: string
}

/** 로그인 폼 값 */
export interface LoginFormValues {
  email: string
  password: string
}

/** 회원가입 폼 값 */
export interface SignupFormValues {
  email: string
  password: string
  confirmPassword: string
}
