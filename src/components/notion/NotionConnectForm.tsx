"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { notionSetupSchema, type NotionSetupSchema } from "@/lib/validations/notion"

export function NotionConnectForm() {
  const form = useForm<NotionSetupSchema>({
    resolver: zodResolver(notionSetupSchema),
    defaultValues: {
      integrationToken: "",
      databaseId: "",
    },
  })

  async function onSubmit(values: NotionSetupSchema) {
    try {
      // TODO: Notion 연동 API 호출
      console.log("Notion 연동 시도:", values.databaseId)
      toast.success("Notion이 성공적으로 연동되었습니다!")
    } catch {
      toast.error("Notion 연동에 실패했습니다. 토큰과 Database ID를 확인해주세요.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="integrationToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Integration Token</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="secret_..."
                  {...field}
                />
              </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "연동 중..." : "Notion 연동하기"}
        </Button>
      </form>
    </Form>
  )
}
