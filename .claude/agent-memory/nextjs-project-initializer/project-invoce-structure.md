---
name: project-invoce-structure
description: Invoce 프로젝트의 라우트 구조, 기술 스택, 주요 설정 비표준 사항 요약
metadata:
  type: project
---

## Invoce 프로젝트 구조 (2026-06-04 기준)

### 앱 목적
프리랜서·소규모 사업자가 Notion 견적서를 클라이언트에게 웹 링크로 공유하는 서비스.

### 라우트 구조 (src/app/)
- `/` → `/login` 리디렉션 (정적)
- `/(auth)/login`, `/(auth)/signup` — 비로그인 전용
- `/(protected)/dashboard` — 로그인 필수, 견적서 목록
- `/(protected)/settings/notion` — 로그인 필수, Notion 연동 설정
- `/quote/[slug]` — 공개 견적서 보기 (인증 불필요)
- API: `/api/auth/{login,signup,logout}`, `/api/notion/{connect,quotes}`, `/api/quote/[slug]`

### 기술 스택
- Next.js 16.2.6 (App Router, Turbopack)
- React 19.2.4, TypeScript 5.x
- Tailwind CSS v4 (postcss 방식)
- shadcn 4.7.0 (style: radix-nova, components.json에 설정됨)
- @tanstack/react-query 5.x, react-hook-form 7.x + zod 4.x
- sonner 2.x (토스트), lucide-react 1.x
- @notionhq/client (Notion SDK), bcryptjs, jose (JWT)

### 주요 비표준 사항 (주의)
1. **루트 app/ 폴더 문제**: 이전 스타터킷 코드가 루트에 `app/`, `components/` 등으로 있었음. 빌드 충돌을 막기 위해 `_app_legacy/`, `_components_legacy/` 등으로 이름 변경함. 절대 복구하지 말 것.
2. **tsconfig include 범위**: `src/**/*.ts`, `src/**/*.tsx`로 한정함. `**/*.ts` 형태로 변경하면 _legacy 폴더 코드가 타입 체크에 포함되어 오류 발생.
3. **컴포넌트 이중화**: `src/components/forms/` (구 파일 유지) + `src/components/auth/`, `dashboard/`, `notion/`, `quote/` (PRD 기준 신규). 구 파일은 일부 페이지에서 여전히 사용 중.
4. **lib/utils 경로**: `src/lib/utils/index.ts`가 실제 구현, `src/lib/utils.ts`는 re-export 래퍼.
5. **ROUTES 변경**: 구 `ROUTES.QUOTES` → `ROUTES.DASHBOARD`, `ROUTES.NOTION_SETUP` → `ROUTES.SETTINGS_NOTION`, 공개 견적서 `ROUTES.QUOTE_VIEW(slug)` → `ROUTES.QUOTE(slug)` (경로 `/q/` → `/quote/`)

**Why:** 프로젝트 초기화 시 기존 스타터킷 파일과의 충돌 해결.
**How to apply:** 새 컴포넌트는 반드시 `src/` 내 PRD 기준 폴더 구조에 생성.
