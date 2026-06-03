---
name: project-stack-constraints
description: invoce-web은 Next.js 16 프론트엔드 단독 프로젝트, Notion 연동은 Route Handler로 토큰 보호
metadata:
  type: project
---

invoce-web 프로젝트 구조 및 Notion 연동 제약:

- Next.js 16.2.6 + React 19 + TypeScript + Tailwind v4 + shadcn/ui, TanStack React Query 5 사용. Spring Boot 백엔드는 이 레포에 없음(분리됨).
- 경로 별칭: `@/*` → 프로젝트 루트(`./*`). (src 디렉토리 없음)
- QueryProvider는 `components/providers/query-provider.tsx`, 기본 staleTime 60초.
- AGENTS.md 경고: "이건 당신이 아는 Next.js가 아니다" — 코드 작성 전 `node_modules/next/dist/docs/` 확인 필수.
- Next.js 16 Route Handler: `app/api/.../route.ts`, 동적 세그먼트는 `RouteContext<'/path/[id]'>` 헬퍼 사용하며 `ctx.params`는 **await** 필요. Route Handler 기본 캐시 안 됨.
- 데이터 패칭은 `lib/`에 Notion 클라이언트, `app/api/notion/`에 Route Handler 배치가 자연스러움.

**Why:** 토큰(NOTION_TOKEN)은 서버 전용. 프론트 단독 프로젝트이므로 Route Handler가 토큰 보호 경계 역할.
**How to apply:** Notion 호출은 절대 클라이언트 컴포넌트에서 직접 하지 말고 Route Handler 경유. 환경변수는 `NEXT_PUBLIC_` 접두사 금지.
