import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/LoginForm"
import { ROUTES } from "@/constants/routes"

export const metadata: Metadata = {
  title: "로그인",
  description: "Invoce 계정으로 로그인하세요.",
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">로그인</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link
            href={ROUTES.SIGNUP}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
