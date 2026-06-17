# Invoce 개발 로드맵

## 프로젝트 개요

- **목표**: 노션 데이터베이스에 작성한 견적서를 고유 URL로 클라이언트에게 공유하고, 클라이언트는 계정 없이 웹에서 조회 및 PDF 다운로드를 완결할 수 있는 서비스
- **아키텍처**: Next.js 16 App Router 풀스택, Notion API 단일 데이터 소스, 별도 DB 없음
- **핵심 가치**: Notion 데이터 → 세련된 웹 견적서 → 1클릭 PDF 다운로드

---

## 기술 아키텍처 개요

```
[Next.js 16 App Router — 풀스택 단일 레포]

클라이언트 레이어 (Browser)
├── React 19 Server / Client Components
├── TailwindCSS v4 + shadcn/ui + Lucide React
├── TanStack React Query 5 (클라이언트 상태 캐싱)
└── Sonner (토스트 알림) · next-themes (다크모드)

서버 레이어 (Next.js Route Handlers / Server Components)
├── 공개: /invoice/[id] — Notion 데이터 조회 및 렌더링
├── 관리자: /admin/* — 인증 보호 라우트
├── API: /api/invoice/[id], /api/admin/invoices
└── Middleware: /admin/* JWT 세션 검증

데이터 레이어
└── Notion API (견적서 원본 데이터 소스 — 별도 DB 없음)

인증 레이어 (Phase 4 신규)
└── JWT 쿠키 기반 단일 관리자 세션 (jose, 환경변수 자격증명)

배포
└── Vercel (환경변수: NOTION_API_KEY, NOTION_DATABASE_ID,
          NEXT_PUBLIC_APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, SESSION_SECRET)
```

### 전체 디렉토리 구조 (목표 기준)

```
src/
├── app/
│   ├── layout.tsx                     # 루트 레이아웃
│   ├── page.tsx                       # 홈 안내 페이지
│   ├── globals.css                    # 전역 스타일 (다크모드 CSS 변수 포함)
│   │
│   ├── invoice/[id]/
│   │   ├── page.tsx                   # 공개 견적서 조회 페이지 ✅
│   │   └── not-found.tsx              # 404 안내 페이지 ✅
│   │
│   ├── (admin)/                       # 관리자 라우트 그룹 [Phase 4 신규]
│   │   ├── layout.tsx                 # 관리자 레이아웃 (AdminHeader)
│   │   └── admin/
│   │       ├── login/page.tsx         # 로그인 페이지
│   │       └── invoices/page.tsx      # 견적서 목록 페이지
│   │
│   └── api/
│       ├── invoice/[id]/route.ts      # 견적서 단건 조회 ✅
│       └── admin/
│           ├── login/route.ts         # 로그인 처리 [Phase 4 신규]
│           ├── logout/route.ts        # 로그아웃 처리 [Phase 4 신규]
│           └── invoices/route.ts      # 견적서 목록 조회 [Phase 4 신규]
│
├── components/
│   ├── invoice/                       # InvoiceViewer, PdfDownloadButton ✅
│   ├── admin/                         # AdminHeader, InvoiceListCard [Phase 4 신규]
│   ├── ui/
│   │   └── theme-toggle.tsx           # 다크모드 토글 버튼 [Phase 5 신규]
│   └── providers/                     # ThemeProvider, QueryProvider ✅
│
├── lib/
│   ├── notion.ts                      # fetchCachedInvoice + fetchInvoiceList [fetchInvoiceList 신규]
│   ├── auth.ts                        # JWT 세션 관리 [Phase 4 신규]
│   └── (기존: errors, api-response, logger, rate-limit, utils, validations) ✅
│
└── middleware.ts                      # /admin/* 라우트 보호 [Phase 4 신규]
```

---

## MVP 완료 현황 (Phase 0~3)

> 상세 내역: `docs/roadmaps/ROADMAP_v1.md` 참조

- [x] **Phase 0**: 레거시 정리, 환경변수, Notion 클라이언트 싱글톤, 공통 에러/응답 유틸
- [x] **Phase 1**: Notion 데이터 파싱 엔진 (타입 정의, 파싱 함수, 유닛 테스트)
- [x] **Phase 2**: 공개 견적서 조회·PDF 다운로드 (`/invoice/[id]`, API Route, 404 페이지)
- [x] **Phase 3**: E2E 검증, 보안 점검, 프로덕션 빌드 성공

---

## Phase 4: 관리자 기능 (Admin Dashboard)

> 목표: 관리자가 로그인 후 Notion DB의 견적서 목록을 확인하고 클라이언트 공유 링크를 복사할 수 있는 관리 페이지 구축

### 아키텍처 결정 사항

| 결정 항목 | 선택 | 근거 |
|-----------|------|------|
| 인증 방식 | JWT httpOnly 쿠키 (`jose`) | 기존 no-DB 아키텍처 유지, `jose` 이미 설치됨 |
| 자격증명 저장 | `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` 환경변수 | 단일 관리자, DB 불필요 |
| 세션 만료 | 24시간 | 일반적인 관리자 워크플로우 기준 |
| 비밀번호 검증 | `bcryptjs` | 이미 설치됨 |
| Notion 목록 조회 | `notion.databases.query()` | Notion 공식 API |
| 공유 링크 형식 | `${NEXT_PUBLIC_APP_URL}/invoice/{notionPageId}` | 기존 공개 URL 패턴 |
| 링크 복사 | `copyToClipboard()` (기존 유틸) | 재사용 가능 |

---

### 4-1. 인증 기반 구성

#### AUTH-001 — 환경변수 확장
- 담당 레이어: 인프라
- 예상 공수: 0.25일
- 상세:
  - `.env.example` 및 `.env.local`에 추가
    - `ADMIN_EMAIL` — 관리자 이메일
    - `ADMIN_PASSWORD_HASH` — bcryptjs 해시값 (`bcrypt.hashSync(password, 10)`)
    - `SESSION_SECRET` — JWT 서명 키 (최소 32자 랜덤 문자열)
  - README 또는 설정 안내에 `ADMIN_PASSWORD_HASH` 생성 방법 추가 (`node -e "require('bcryptjs').hash('pw', 10).then(console.log)"`)

#### AUTH-002 — `src/lib/auth.ts` 구현
- 담당 레이어: 라이브러리
- 예상 공수: 0.5일
- 의존성: AUTH-001
- 상세:
  - `createSession(email: string): Promise<void>` — `jose` SignJWT로 24시간 JWT 생성, `Set-Cookie` httpOnly 쿠키 설정
  - `verifySession(): Promise<{ email: string } | null>` — `cookies()` 헤더에서 세션 쿠키 읽어 JWT 검증
  - `deleteSession(): Promise<void>` — 세션 쿠키 삭제 (만료 시간 과거로 설정)
  - `validateAdminCredentials(email, password): Promise<boolean>` — 환경변수 `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH`와 비교

#### AUTH-003 — `src/middleware.ts` 구현
- 담당 레이어: 미들웨어
- 예상 공수: 0.25일
- 의존성: AUTH-002
- 상세:
  - `matcher: ['/admin/:path*']`
  - `/admin/login` 제외한 `/admin/*` 경로: 세션 없으면 `/admin/login` 리디렉션
  - 세션 있고 `/admin/login` 접근 시: `/admin/invoices` 리디렉션
  - Edge-compatible: `jose` JWT 검증만 사용 (Node.js API 불사용)

---

### 4-2. Notion 견적서 목록 API

#### ADMIN-001 — `fetchInvoiceList()` 구현 (`src/lib/notion.ts` 확장)
- 담당 레이어: 라이브러리
- 예상 공수: 0.5일
- 의존성: (없음 — 기존 `getNotionClient()` 재사용)
- 상세:
  - `fetchInvoiceList(client): Promise<ParsedInvoice[]>`
  - `client.databases.query({ database_id: NOTION_DATABASE_ID, sorts: [{ property: '발행일', direction: 'descending' }] })`
  - 각 페이지에 `parseInvoiceProperties()` 적용 (기존 함수 재사용)
  - `items`는 빈 배열 (`[]`) — 목록에서는 항목 상세 불필요
  - 결과 페이지네이션: `start_cursor` 처리 (MVP: 최대 100건)

#### ADMIN-002 — `GET /api/admin/invoices` Route Handler
- 담당 레이어: API Route
- 예상 공수: 0.5일
- 의존성: AUTH-002, ADMIN-001
- 상세:
  - `src/app/api/admin/invoices/route.ts`
  - `verifySession()` 실패 시 401 반환
  - `fetchInvoiceList()` 호출
  - 응답: `ApiResponse<ParsedInvoice[]>` (기존 `success()`/`error()` 헬퍼 재사용)
  - `NotionError` → 500, 기타 → 500

#### ADMIN-003 — `POST /api/admin/login` Route Handler
- 담당 레이어: API Route
- 예상 공수: 0.25일
- 의존성: AUTH-002
- 상세:
  - `src/app/api/admin/login/route.ts`
  - 요청 body: `{ email, password }`
  - `validateAdminCredentials()` 검증
  - 성공: `createSession()` 후 200 + `{ success: true }`
  - 실패: 401 + `{ success: false, error: { code: 'INVALID_CREDENTIALS', message: '...' } }`

#### ADMIN-004 — `POST /api/admin/logout` Route Handler
- 담당 레이어: API Route
- 예상 공수: 0.1일
- 의존성: AUTH-002
- 상세:
  - `src/app/api/admin/logout/route.ts`
  - `deleteSession()` 후 `/admin/login` 리디렉션

---

### 4-3. 관리자 UI 구성

#### ADMIN-005 — `(admin)/layout.tsx` + `AdminHeader` 컴포넌트
- 담당 레이어: Frontend
- 예상 공수: 0.5일
- 의존성: AUTH-002
- 상세:
  - `src/app/(admin)/layout.tsx` — 관리자 레이아웃 (AdminHeader 포함)
  - `src/components/admin/AdminHeader.tsx`
    - 로고 (Invoce 워드마크)
    - 네비게이션: "견적서 목록" (`/admin/invoices`)
    - 로그아웃 버튼 → `/api/admin/logout` POST 호출
    - 다크모드 토글 (Phase 5 DARK-001 완료 후 통합)
  - 공개 견적서 레이아웃(`/invoice/[id]`)과 완전 분리

#### ADMIN-006 — `/admin/login` 페이지
- 담당 레이어: Frontend
- 예상 공수: 0.75일
- 의존성: ADMIN-003, ADMIN-005
- 상세:
  - `src/app/(admin)/admin/login/page.tsx` — Client Component
  - React Hook Form + Zod 검증 (이미 설치됨)
    - 이메일: `z.string().email()`
    - 비밀번호: `z.string().min(1)`
  - 로그인 실패 시 인라인 에러 메시지
  - 성공 시 `/admin/invoices`로 `router.push()`
  - 인증 상태면 미들웨어가 자동 리디렉션 처리

#### ADMIN-007 — `/admin/invoices` 페이지 (견적서 목록)
- 담당 레이어: Frontend
- 예상 공수: 1일
- 의존성: ADMIN-002, ADMIN-005
- 상세:
  - `src/app/(admin)/admin/invoices/page.tsx`
  - TanStack React Query로 `/api/admin/invoices` 조회 (기존 QueryProvider 재사용)
  - `src/components/admin/InvoiceListCard.tsx` — 카드형 견적서 항목
    - 표시 필드: 견적서 번호, 클라이언트명, 발행일 (`formatDate()` 재사용), 상태 배지, 합계 금액
    - **"링크 복사" 버튼** — `copyToClipboard()` 재사용, 복사 성공 시 Sonner 토스트 (`"링크가 복사되었습니다"`)
    - 링크 형식: `${process.env.NEXT_PUBLIC_APP_URL}/invoice/{invoice.id}`
  - **수동 새로고침 버튼** — `queryClient.invalidateQueries()`
  - 로딩: 스켈레톤 카드 표시
  - 에러: 에러 메시지 + 재시도 버튼
  - 빈 목록: "견적서가 없습니다" 안내

---

## Phase 5: 다크모드

> 목표: 관리자 페이지 및 공개 견적서 페이지 전체에서 라이트/다크 모드 전환 가능

### 현황

다크모드 인프라는 이미 완비되어 있습니다:
- `next-themes` 설치됨 ✅
- `src/components/providers/theme-provider.tsx` — `attribute="class"`, `defaultTheme="system"`, `enableSystem` ✅
- `src/app/globals.css` — `:root`(라이트) / `.dark`(다크) CSS 변수 완전 정의됨 ✅

**토글 UI 컴포넌트만 추가하면 됩니다.**

---

#### DARK-001 — `ThemeToggle` 컴포넌트
- 담당 레이어: Frontend
- 예상 공수: 0.25일
- 상세:
  - `src/components/ui/theme-toggle.tsx` — Client Component (`"use client"`)
  - `useTheme()` 훅으로 현재 테마 읽기
  - 라이트 모드: Sun 아이콘 → 클릭 시 다크 전환
  - 다크 모드: Moon 아이콘 → 클릭 시 라이트 전환
  - `shadcn/ui Button` (variant="ghost", size="icon") 활용
  - `suppressHydrationWarning` 또는 `mounted` 상태로 hydration 불일치 방지

#### DARK-002 — AdminHeader에 ThemeToggle 통합
- 담당 레이어: Frontend
- 예상 공수: 0.1일
- 의존성: DARK-001, ADMIN-005
- 상세:
  - `src/components/admin/AdminHeader.tsx` 우측에 `<ThemeToggle />` 배치
  - 로그아웃 버튼 옆 위치

#### DARK-003 — 공개 견적서 페이지 액션바에 ThemeToggle 통합
- 담당 레이어: Frontend
- 예상 공수: 0.25일
- 의존성: DARK-001
- 상세:
  - `src/app/invoice/[id]/page.tsx` 상단 액션바 우측에 `<ThemeToggle />` 추가
  - `print:hidden` 클래스로 인쇄 시 숨김 처리

---

## 우선순위 매트릭스

| 우선순위 | 태스크 ID | 기능명 | Phase |
|---------|----------|--------|-------|
| P0 | AUTH-001~003 | 관리자 인증 기반 | 4 |
| P0 | ADMIN-001~004 | Notion 목록 API | 4 |
| P0 | ADMIN-005 | 관리자 레이아웃 | 4 |
| P1 | ADMIN-006 | 로그인 페이지 | 4 |
| P1 | ADMIN-007 | 견적서 목록 페이지 + 링크 복사 | 4 |
| P1 | DARK-001 | ThemeToggle 컴포넌트 | 5 |
| P2 | DARK-002 | AdminHeader 다크모드 | 5 |
| P2 | DARK-003 | 공개 페이지 다크모드 | 5 |

---

## 신규 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `ADMIN_EMAIL` | 관리자 로그인 이메일 | `admin@example.com` |
| `ADMIN_PASSWORD_HASH` | bcryptjs 해시된 비밀번호 | `$2b$10$...` |
| `SESSION_SECRET` | JWT 서명 비밀키 (최소 32자) | `(랜덤 생성 문자열)` |

**`ADMIN_PASSWORD_HASH` 생성 방법:**
```bash
node -e "require('bcryptjs').hash('your_password', 10).then(console.log)"
```

---

## API 엔드포인트 목록

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/invoice/[id]` | 불필요 | 견적서 단건 조회 ✅ |
| POST | `/api/admin/login` | 불필요 | 관리자 로그인 [신규] |
| POST | `/api/admin/logout` | 세션 쿠키 | 관리자 로그아웃 [신규] |
| GET | `/api/admin/invoices` | 세션 쿠키 | 견적서 목록 조회 [신규] |

---

## 라우팅 및 페이지 구조

| 경로 | 접근 제어 | 설명 |
|------|---------|------|
| `/` | 공개 | 서비스 홈 안내 ✅ |
| `/invoice/[id]` | 공개 | 견적서 공개 조회 ✅ |
| `/admin/login` | 비인증 전용 | 관리자 로그인 [신규] |
| `/admin/invoices` | 인증 필수 | 견적서 목록 + 링크 복사 [신규] |

---

## 개발 마일스톤

### Phase 4: 관리자 기능 (예상 5일)

| 단계 | 태스크 | 예상 공수 |
|------|--------|----------|
| 인증 기반 | AUTH-001, AUTH-002, AUTH-003 | 1일 |
| Notion 목록 API | ADMIN-001, ADMIN-002, ADMIN-003, ADMIN-004 | 1.35일 |
| 관리자 UI | ADMIN-005, ADMIN-006, ADMIN-007 | 2.25일 |

### Phase 5: 다크모드 (예상 0.6일)

| 단계 | 태스크 | 예상 공수 |
|------|--------|----------|
| 토글 UI | DARK-001 | 0.25일 |
| 통합 | DARK-002, DARK-003 | 0.35일 |

| Phase | 기간 | 주요 산출물 |
|-------|------|------------|
| Phase 4: 관리자 기능 | Week 4 (5일) | 로그인·목록·링크 복사 |
| Phase 5: 다크모드 | Week 4 (0.6일) | 전체 페이지 다크모드 토글 |
| **합계** | **약 5.6일** | **고도화 완성** |

---

## 리스크 및 의존성

| 리스크 | 심각도 | 완화 전략 |
|--------|--------|---------|
| Notion `databases.query()` 응답 구조 상이 | 중 | 기존 `parseInvoiceProperties()` 재사용, 타입 가드 강화 |
| JWT 미들웨어 Edge 환경 호환성 | 중 | `jose`는 Edge-compatible, Node.js API 사용 금지 |
| `ADMIN_PASSWORD_HASH` 초기 설정 복잡성 | 저 | 환경변수 설정 가이드 문서화 |
| 다크모드 인쇄 CSS 충돌 | 저 | `@media print`에서 강제 라이트모드 (`color-scheme: light`) |

---

## Definition of Done

각 태스크 완료 기준:

- [ ] 기능이 명세대로 동작함
- [ ] TypeScript 타입 에러 없음 (`npx tsc --noEmit`)
- [ ] ESLint 에러 없음
- [ ] 에러 케이스 처리됨 (인증 실패, API 오류, 빈 목록 등)
- [ ] 로딩 상태 UI 구현됨 (스켈레톤/스피너)
- [ ] 반응형 레이아웃 확인 (모바일·데스크톱)
- [ ] `SESSION_SECRET` 및 관리자 자격증명이 클라이언트 응답에 노출되지 않음
- [ ] API 응답 형식이 `ApiResponse<T>` 표준 준수
- [ ] 다크모드에서 UI 정상 표시 확인
