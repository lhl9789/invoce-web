"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { notionSetupSchema, type NotionSetupSchema } from "@/lib/validations/notion"
import { ROUTES } from "@/constants"
import { useRouter } from "next/navigation"

export function NotionSetupForm() {
  const router = useRouter()

  const form = useForm<NotionSetupSchema>({
    resolver: zodResolver(notionSetupSchema),
    defaultValues: {
      integrationToken: "",
      databaseId: "",
    },
  })

  async function onSubmit(values: NotionSetupSchema) {
    try {
      // TODO: 실제 Notion 연동 API 연동 (토큰 암호화 후 저장)
      console.log("Notion 연동 설정:", values.databaseId)
      toast.success("Notion 연동이 완료되었습니다!")
      router.push(ROUTES.DASHBOARD)
    } catch {
      toast.error("Notion 연동에 실패했습니다. 설정을 확인해주세요.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="integrationToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Integration Token</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Notion Integration 페이지에서 발급받은 Internal Integration Token입니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="databaseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Database ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                견적서 Notion 데이터베이스 URL에서 추출한 ID입니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "연동 중..." : "Notion 연동 저장"}
        </Button>
      </form>
    </Form>
  )
}
