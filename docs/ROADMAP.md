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
│   ├── (admin)/                       # 관리자 라우트 그룹 ✅
│   │   ├── layout.tsx                 # 관리자 레이아웃 (AdminHeader) ✅
│   │   └── admin/
│   │       ├── login/page.tsx         # 로그인 페이지 ✅
│   │       └── invoices/
│   │           ├── page.tsx           # 견적서 목록 페이지 ✅
│   │           └── new/page.tsx       # 견적서 작성 페이지 ✅
│   │
│   └── api/
│       ├── invoice/[id]/route.ts      # 견적서 단건 조회 ✅
│       └── admin/
│           ├── login/route.ts         # 로그인 처리 ✅
│           ├── logout/route.ts        # 로그아웃 처리 ✅
│           └── invoices/route.ts      # 견적서 목록 조회 ✅ + 작성(POST) ✅
│
├── components/
│   ├── invoice/                       # InvoiceViewer, PdfDownloadButton ✅
│   ├── admin/                         # AdminHeader, InvoiceListCard ✅
│   ├── ui/
│   │   └── theme-toggle.tsx           # 다크모드 토글 버튼 ✅
│   └── providers/                     # ThemeProvider, QueryProvider ✅
│
├── lib/
│   ├── notion.ts                      # fetchCachedInvoice + fetchInvoiceList + createInvoiceItem + createInvoice ✅
│   ├── auth.ts                        # JWT 세션 관리 ✅
│   └── (기존: errors, api-response, logger, rate-limit, utils, validations) ✅
│
└── proxy.ts                           # /admin/* 라우트 보호 ✅ (Next.js 16: middleware.ts → proxy.ts로 이름 변경)
```

---

## MVP 완료 현황 (Phase 0~3)

> 상세 내역: `docs/roadmaps/ROADMAP_v1.md` 참조

- [x] **Phase 0**: 레거시 정리, 환경변수, Notion 클라이언트 싱글톤, 공통 에러/응답 유틸
- [x] **Phase 1**: Notion 데이터 파싱 엔진 (타입 정의, 파싱 함수, 유닛 테스트)
- [x] **Phase 2**: 공개 견적서 조회·PDF 다운로드 (`/invoice/[id]`, API Route, 404 페이지)
- [x] **Phase 3**: E2E 검증, 보안 점검, 프로덕션 빌드 성공

---

## Phase 4·5 완료 현황

- [x] **Phase 4**: 관리자 인증(JWT 쿠키), Notion 견적서 목록 API, 로그인·목록 페이지, `/admin/*` 라우트 보호
  - AUTH-001~003, ADMIN-001~007 전체 완료 (2026-06-18, 커밋 `ec5fa56`)
  - 구현 편차: `ADMIN-001`은 Notion SDK v5에서 `databases.query()`가 제거되어 `client.search()` 기반으로 구현. `AUTH-003`은 Next.js 16에서 `middleware.ts`가 `proxy.ts`로 명명 변경되어 `src/proxy.ts`로 구현
- [x] **Phase 5**: 다크모드 토글 컴포넌트 및 관리자·공개 페이지 통합 완료 (커밋 `dab1c5b`)
- [x] **Phase 6**: 견적서 작성 (F012) — Notion 쓰기 API, 작성 폼, 공유 링크 다이얼로그 완료 (아래 6-1~6-3 상세 참조)
  - WRITE-001~008 전체 완료. 구현 편차: ROADMAP 초안 작성 시 `ADMIN_EMAIL` 기반 세션을 가정했으나, 실제 인증은 비밀번호 단독(`{ admin: true }`) 단일 세션으로 구현되어 있어 `POST /api/admin/invoices`의 rate limit 키는 이메일 대신 고정 키(`admin-invoices-post`) 사용

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

#### AUTH-001 — 환경변수 확장 ✅
- 담당 레이어: 인프라
- 예상 공수: 0.25일
- 상세:
  - `.env.example` 및 `.env.local`에 추가
    - `ADMIN_EMAIL` — 관리자 이메일
    - `ADMIN_PASSWORD_HASH` — bcryptjs 해시값 (`bcrypt.hashSync(password, 10)`)
    - `SESSION_SECRET` — JWT 서명 키 (최소 32자 랜덤 문자열)
  - README 또는 설정 안내에 `ADMIN_PASSWORD_HASH` 생성 방법 추가 (`node -e "require('bcryptjs').hash('pw', 10).then(console.log)"`)

#### AUTH-002 — `src/lib/auth.ts` 구현 ✅
- 담당 레이어: 라이브러리
- 예상 공수: 0.5일
- 의존성: AUTH-001
- 상세:
  - `createSession(email: string): Promise<void>` — `jose` SignJWT로 24시간 JWT 생성, `Set-Cookie` httpOnly 쿠키 설정
  - `verifySession(): Promise<{ email: string } | null>` — `cookies()` 헤더에서 세션 쿠키 읽어 JWT 검증
  - `deleteSession(): Promise<void>` — 세션 쿠키 삭제 (만료 시간 과거로 설정)
  - `validateAdminCredentials(email, password): Promise<boolean>` — 환경변수 `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH`와 비교

#### AUTH-003 — `src/middleware.ts` 구현 ✅ (실제 파일명: `src/proxy.ts` — Next.js 16에서 `middleware.ts`가 deprecated되어 `proxy.ts`로 명명 변경됨)
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

#### ADMIN-001 — `fetchInvoiceList()` 구현 (`src/lib/notion.ts` 확장) ✅ (Notion SDK v5에서 `databases.query()` 제거되어 `client.search()` 기반으로 구현)
- 담당 레이어: 라이브러리
- 예상 공수: 0.5일
- 의존성: (없음 — 기존 `getNotionClient()` 재사용)
- 상세:
  - `fetchInvoiceList(client): Promise<ParsedInvoice[]>`
  - `client.databases.query({ database_id: NOTION_DATABASE_ID, sorts: [{ property: '발행일', direction: 'descending' }] })`
  - 각 페이지에 `parseInvoiceProperties()` 적용 (기존 함수 재사용)
  - `items`는 빈 배열 (`[]`) — 목록에서는 항목 상세 불필요
  - 결과 페이지네이션: `start_cursor` 처리 (MVP: 최대 100건)

#### ADMIN-002 — `GET /api/admin/invoices` Route Handler ✅
- 담당 레이어: API Route
- 예상 공수: 0.5일
- 의존성: AUTH-002, ADMIN-001
- 상세:
  - `src/app/api/admin/invoices/route.ts`
  - `verifySession()` 실패 시 401 반환
  - `fetchInvoiceList()` 호출
  - 응답: `ApiResponse<ParsedInvoice[]>` (기존 `success()`/`error()` 헬퍼 재사용)
  - `NotionError` → 500, 기타 → 500

#### ADMIN-003 — `POST /api/admin/login` Route Handler ✅
- 담당 레이어: API Route
- 예상 공수: 0.25일
- 의존성: AUTH-002
- 상세:
  - `src/app/api/admin/login/route.ts`
  - 요청 body: `{ email, password }`
  - `validateAdminCredentials()` 검증
  - 성공: `createSession()` 후 200 + `{ success: true }`
  - 실패: 401 + `{ success: false, error: { code: 'INVALID_CREDENTIALS', message: '...' } }`

#### ADMIN-004 — `POST /api/admin/logout` Route Handler ✅
- 담당 레이어: API Route
- 예상 공수: 0.1일
- 의존성: AUTH-002
- 상세:
  - `src/app/api/admin/logout/route.ts`
  - `deleteSession()` 후 `/admin/login` 리디렉션

---

### 4-3. 관리자 UI 구성

#### ADMIN-005 — `(admin)/layout.tsx` + `AdminHeader` 컴포넌트 ✅
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

#### ADMIN-006 — `/admin/login` 페이지 ✅
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

#### ADMIN-007 — `/admin/invoices` 페이지 (견적서 목록) ✅
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

#### DARK-001 — `ThemeToggle` 컴포넌트 ✅
- 담당 레이어: Frontend
- 예상 공수: 0.25일
- 상세:
  - `src/components/ui/theme-toggle.tsx` — Client Component (`"use client"`)
  - `useTheme()` 훅으로 현재 테마 읽기
  - 라이트 모드: Sun 아이콘 → 클릭 시 다크 전환
  - 다크 모드: Moon 아이콘 → 클릭 시 라이트 전환
  - `shadcn/ui Button` (variant="ghost", size="icon") 활용
  - `suppressHydrationWarning` 또는 `mounted` 상태로 hydration 불일치 방지

#### DARK-002 — AdminHeader에 ThemeToggle 통합 ✅
- 담당 레이어: Frontend
- 예상 공수: 0.1일
- 의존성: DARK-001, ADMIN-005
- 상세:
  - `src/components/admin/AdminHeader.tsx` 우측에 `<ThemeToggle />` 배치
  - 로그아웃 버튼 옆 위치

#### DARK-003 — 공개 견적서 페이지 액션바에 ThemeToggle 통합 ✅
- 담당 레이어: Frontend
- 예상 공수: 0.25일
- 의존성: DARK-001
- 상세:
  - `src/app/invoice/[id]/page.tsx` 상단 액션바 우측에 `<ThemeToggle />` 추가
  - `print:hidden` 클래스로 인쇄 시 숨김 처리

---

## Phase 6: 견적서 작성 (F012)

> 목표: 관리자가 Notion을 직접 열지 않고도 웹 폼으로 견적서를 작성·제출해 Items DB → Invoices DB 순서로 Notion 페이지를 생성하고, 생성된 견적서의 공유 링크를 즉시 받아볼 수 있는 기능 구축
> PRD 반영: `docs/PRD.md` F012 신규 추가, 정합성 검증 1~4단계에서 "미구현"으로 표시됨

### 아키텍처 결정 사항

| 결정 항목 | 선택 | 근거 |
|-----------|------|------|
| 인증 방식 | 기존 관리자 JWT 세션 재사용 (`verifySession()`) | PRD의 "로그인 필수"는 별도 회원가입 없이 Phase 4 admin 세션으로 충족, 신규 인증 불필요 |
| 진입 라우트 | `/admin/invoices/new` (관리자 라우트 그룹 하위) | 기존 `(admin)` 레이아웃·`proxy.ts` 보호 그대로 재사용 |
| Items DB 식별 | `NOTION_ITEMS_DATABASE_ID` 환경변수 신규 추가 | Items DB가 Invoices DB와 별도 데이터베이스이므로 기존 `NOTION_DATABASE_ID`(Invoices 전용)와 분리 필요 |
| 쓰기 순서 | Items DB 페이지 먼저 생성 → 생성된 ID 목록을 Invoices DB 신규 페이지의 "항목" relation에 연결 | PRD "Notion DB 쓰기 구조" 절 명세 그대로 따름 |
| 폼 상태·검증 | React Hook Form + Zod (이미 설치됨) | 기존 로그인 폼과 동일한 패턴 재사용 |
| 합계 계산 | 클라이언트에서 수량×단가 실시간 계산, 서버에서 재계산 후 저장 | 클라이언트 값 신뢰하지 않고 서버사이드에서 최종 `총 금액` 확정 |
| 공유 링크 노출 | 생성된 Invoices 페이지 ID로 기존 `/invoice/{id}` URL 패턴 재사용 + `copyToClipboard()` | F003 인프라 그대로 재사용 |

---

### 6-1. 환경변수 및 검증 스키마

- [x] **WRITE-001** `NOTION_ITEMS_DATABASE_ID` 환경변수 추가
  - 담당 레이어: 인프라
  - 예상 공수: 0.1일
  - 상세:
    - `.env.example`, `.env.local`에 `NOTION_ITEMS_DATABASE_ID` 추가 (Items DB URL에서 추출한 32자리 ID)
    - Items DB 우측 상단 `···` → `Add connections`에서 기존 Integration 연결 필요 (안내 주석 추가)

- [x] **WRITE-002** 견적서 작성 폼 검증 스키마 정의
  - 담당 레이어: 공통
  - 예상 공수: 0.5일
  - 의존성: WRITE-001
  - 상세:
    - `src/lib/validations/invoice.ts` 확장 — `createInvoiceSchema` (Zod)
      - `clientName: z.string().min(1)`, `issueDate`/`validUntil: z.string()` (ISO date), `supplierInfo: z.string().optional()`
      - `items: z.array(z.object({ description: z.string().min(1), quantity: z.number().positive(), unitPrice: z.number().nonnegative() })).min(1)`
    - 타입: `CreateInvoiceInput` (`src/types/invoice.ts`에 추가)

---

### 6-2. Notion 쓰기 API

- [x] **WRITE-003** `createInvoiceItem()` 구현 (`src/lib/notion.ts` 확장)
  - 담당 레이어: 라이브러리
  - 예상 공수: 0.5일
  - 의존성: WRITE-001
  - 상세:
    - `createInvoiceItem(client, item: { description, quantity, unitPrice }): Promise<string>` — Items DB에 페이지 생성, 생성된 page ID 반환
    - `ITEM_PROPERTY_NAMES` 상수 재사용 (항목명/수량/단가), `금액`은 Formula 속성이므로 쓰기 대상 아님
    - 실패 시 `NotionError`

- [x] **WRITE-004** `createInvoice()` 구현 (`src/lib/notion.ts` 확장)
  - 담당 레이어: 라이브러리
  - 예상 공수: 0.5일
  - 의존성: WRITE-003
  - 상세:
    - `createInvoice(client, data: CreateInvoiceInput, itemPageIds: string[]): Promise<string>` — Invoices DB에 페이지 생성, "항목" relation에 `itemPageIds` 연결, `총 금액`은 항목별 `quantity × unitPrice` 합산 후 서버에서 계산하여 기록, `상태`는 기본값 "대기"로 생성
    - `INVOICE_PROPERTY_NAMES` 상수 재사용
    - 생성된 Invoices 페이지 ID 반환 (공유 URL 생성에 사용)

- [x] **WRITE-005** `POST /api/admin/invoices` Route Handler 구현
  - 담당 레이어: API Route
  - 예상 공수: 0.75일
  - 의존성: AUTH-002, WRITE-002, WRITE-004
  - 상세:
    - `src/app/api/admin/invoices/route.ts`에 `POST` 핸들러 추가 (기존 `GET`과 동일 파일)
    - `verifySession()` 실패 시 401
    - 요청 body `createInvoiceSchema` 검증 실패 시 400
    - `items`를 순차(또는 `Promise.all`)로 Items DB에 생성 → 생성된 ID 목록으로 `createInvoice()` 호출
    - 응답: `ApiResponse<{ id: string; shareUrl: string }>` (`${NEXT_PUBLIC_APP_URL}/invoice/{id}`)
    - Notion API 오류(연결 실패, 속성 누락 등) 시 500 + 입력값 유지 가능하도록 에러 메시지만 반환 (서버는 부분 생성된 Items 페이지를 별도 롤백하지 않음 — MVP 범위 외, 리스크 표에 기재)

---

### 6-3. 견적서 작성 UI

- [x] **WRITE-006** `/admin/invoices/new` 페이지 구현
  - 담당 레이어: Frontend
  - 예상 공수: 1.5일
  - 의존성: WRITE-002, WRITE-005, ADMIN-005
  - 상세:
    - `src/app/(admin)/admin/invoices/new/page.tsx` — Client Component
    - React Hook Form + Zod(`createInvoiceSchema`)로 폼 상태 관리
    - 공급자 정보·클라이언트명·발행일·유효기간 입력 필드
    - 견적 항목(품목·수량·단가) `useFieldArray` 기반 동적 추가·삭제 (최소 1개 강제)
    - 수량×단가 기반 항목별 금액·소계·합계 실시간 계산 (클라이언트 표시용, 최종 값은 서버에서 재계산)
    - 제출 시 `POST /api/admin/invoices` 호출 (TanStack React Query mutation)
    - Notion API 오류 시 인라인 에러 메시지 표시, 입력값 유지 (폼 리셋하지 않음)

- [x] **WRITE-007** 제출 성공 피드백 (공유 링크 노출)
  - 담당 레이어: Frontend
  - 예상 공수: 0.5일
  - 의존성: WRITE-006
  - 상세:
    - 제출 성공 시 응답의 `shareUrl`을 Dialog 또는 Sonner 토스트로 즉시 노출
    - **"링크 복사"** 버튼 — 기존 `copyToClipboard()` 재사용 (F003 인프라)
    - "내 견적서 목록으로 이동" / "계속 작성" 선택 옵션 제공

- [x] **WRITE-008** 네비게이션 진입점 추가
  - 담당 레이어: Frontend
  - 예상 공수: 0.25일
  - 의존성: WRITE-006
  - 상세:
    - `src/components/admin/AdminHeader.tsx`에 "견적서 작성" 메뉴 추가 (`/admin/invoices/new` 링크)
    - `src/app/(admin)/admin/invoices/page.tsx` (목록 페이지)에 "새 견적서" 버튼 추가

---

## 우선순위 매트릭스

| 우선순위 | 태스크 ID | 기능명 | Phase | 상태 |
|---------|----------|--------|-------|------|
| P0 | AUTH-001~003 | 관리자 인증 기반 | 4 | ✅ |
| P0 | ADMIN-001~004 | Notion 목록 API | 4 | ✅ |
| P0 | ADMIN-005 | 관리자 레이아웃 | 4 | ✅ |
| P1 | ADMIN-006 | 로그인 페이지 | 4 | ✅ |
| P1 | ADMIN-007 | 견적서 목록 페이지 + 링크 복사 | 4 | ✅ |
| P1 | DARK-001 | ThemeToggle 컴포넌트 | 5 | ✅ |
| P2 | DARK-002 | AdminHeader 다크모드 | 5 | ✅ |
| P2 | DARK-003 | 공개 페이지 다크모드 | 5 | ✅ |
| P1 | WRITE-001~002 | 환경변수·검증 스키마 | 6 | ✅ |
| P1 | WRITE-003~005 | Notion 쓰기 API | 6 | ✅ |
| P1 | WRITE-006~008 | 견적서 작성 UI | 6 | ✅ |

---

## 신규 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `ADMIN_EMAIL` | 관리자 로그인 이메일 | `admin@example.com` |
| `ADMIN_PASSWORD_HASH` | bcryptjs 해시된 비밀번호 | `$2b$10$...` |
| `SESSION_SECRET` | JWT 서명 비밀키 (최소 32자) | `(랜덤 생성 문자열)` |
| `NOTION_ITEMS_DATABASE_ID` | 견적 항목(Items) 데이터베이스 ID | `xxxxxxxxxxxxx` |

**`ADMIN_PASSWORD_HASH` 생성 방법:**
```bash
node -e "require('bcryptjs').hash('your_password', 10).then(console.log)"
```

---

## API 엔드포인트 목록

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/invoice/[id]` | 불필요 | 견적서 단건 조회 ✅ |
| POST | `/api/admin/login` | 불필요 | 관리자 로그인 ✅ |
| POST | `/api/admin/logout` | 세션 쿠키 | 관리자 로그아웃 ✅ |
| GET | `/api/admin/invoices` | 세션 쿠키 | 견적서 목록 조회 ✅ |
| POST | `/api/admin/invoices` | 세션 쿠키 | 견적서 작성 (Notion 쓰기) ✅ |

---

## 라우팅 및 페이지 구조

| 경로 | 접근 제어 | 설명 |
|------|---------|------|
| `/` | 공개 | 서비스 홈 안내 ✅ |
| `/invoice/[id]` | 공개 | 견적서 공개 조회 ✅ |
| `/admin/login` | 비인증 전용 | 관리자 로그인 ✅ |
| `/admin/invoices` | 인증 필수 | 견적서 목록 + 링크 복사 ✅ |
| `/admin/invoices/new` | 인증 필수 | 견적서 작성 (F012) ✅ |

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

### Phase 6: 견적서 작성 (예상 3.6일)

| 단계 | 태스크 | 예상 공수 |
|------|--------|----------|
| 환경변수·검증 스키마 | WRITE-001, WRITE-002 | 0.6일 |
| Notion 쓰기 API | WRITE-003, WRITE-004, WRITE-005 | 1.75일 |
| 견적서 작성 UI | WRITE-006, WRITE-007, WRITE-008 | 2.25일 |

| Phase | 기간 | 주요 산출물 |
|-------|------|------------|
| Phase 4: 관리자 기능 | Week 4 (5일) | 로그인·목록·링크 복사 |
| Phase 5: 다크모드 | Week 4 (0.6일) | 전체 페이지 다크모드 토글 |
| Phase 6: 견적서 작성 | Week 5 (3.6일) | 웹 폼 → Notion 쓰기 → 공유 링크 즉시 발급 |
| **합계** | **약 9.2일** | **F012 포함 고도화 완성** |

---

## 리스크 및 의존성

| 리스크 | 심각도 | 완화 전략 |
|--------|--------|---------|
| Notion `databases.query()` 응답 구조 상이 | 중 | 기존 `parseInvoiceProperties()` 재사용, 타입 가드 강화 |
| JWT 미들웨어 Edge 환경 호환성 | 중 | `jose`는 Edge-compatible, Node.js API 사용 금지 |
| `ADMIN_PASSWORD_HASH` 초기 설정 복잡성 | 저 | 환경변수 설정 가이드 문서화 |
| 다크모드 인쇄 CSS 충돌 | 저 | `@media print`에서 강제 라이트모드 (`color-scheme: light`) |
| 견적서 작성 중 Items 페이지 생성 후 Invoices 생성 실패 시 부분 데이터 잔존 (Phase 6) | 중 | MVP는 자동 롤백 미구현 — 에러 메시지에 생성된 Items 페이지 존재 가능성 안내, 향후 보상 트랜잭션 또는 정리 배치 고려 |
| Items DB·Invoices DB 동시 연동 권한 누락 (Phase 6) | 저 | `NOTION_ITEMS_DATABASE_ID` 설정 가이드에 Integration 연결 단계 명시 |

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
