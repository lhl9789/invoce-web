import { z } from "zod"

export const notionSetupSchema = z.object({
  integrationToken: z
    .string()
    .min(1, "Notion Integration Token을 입력해주세요.")
    .startsWith("secret_", "올바른 Notion Integration Token 형식이 아닙니다."),
  databaseId: z
    .string()
    .min(1, "Notion Database ID를 입력해주세요.")
    .regex(
      /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i,
      "올바른 Database ID 형식이 아닙니다. (UUID 형식)",
    ),
})

export type NotionSetupSchema = z.infer<typeof notionSetupSchema>
