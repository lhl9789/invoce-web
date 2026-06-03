import type { Metadata } from "next"
import Link from "next/link"
import { SignupForm } from "@/components/auth/SignupForm"
import { ROUTES } from "@/constants/routes"

export const metadata: Metadata = {
  title: "회원가입",
  description: "Invoce 계정을 만드세요.",
}

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">회원가입</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
      <SignupForm />
    </div>
  )
}
