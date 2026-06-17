# Invoce 개발 로드맵

## 프로젝트 개요

- **목표**: 노션 데이터베이스에 작성한 견적서를 고유 URL로 클라이언트에게 공유하고, 클라이언트는 계정 없이 웹에서 조회 및 PDF 다운로드를 완결할 수 있는 서비스 구축
- **대상 사용자**: 노션에서 직접 견적서를 작성하는 발행자(프리랜서·소규모 사업자), 링크를 전달받는 클라이언트(수신자)
- **핵심 가치**: Notion 데이터 → 세련된 웹 견적서 → 1클릭 PDF 다운로드
- **성공 지표**:
  - 노션 페이지 ID로 생성한 링크 접근 시 견적서 즉시 표시
  - 클라이언트가 링크 접근 후 PDF 다운로드까지 30초 이내
  - 존재하지 않는 견적서 ID 접근 시 404 안내 100% 표시

> **아키텍처 변경 사항**: 별도 계정 시스템(회원가입·로그인) 및 PostgreSQL 데이터베이스를 사용하지 않습니다. 노션 데이터베이스 자체를 유일한 데이터 소스로 사용하며, 서버는 고정된 `NOTION_API_KEY`/`NOTION_DATABASE_ID` 환경변수로 노션 API를 호출합니다.

---

## 기술 아키텍처 개요

```
[Next.js 16 App Router — 풀스택 단일 레포]

클라이언트 레이어 (Browser)
├── React 19 Server / Client Components
├── TailwindCSS v4 + shadcn/ui + Lucide React
└── Sonner (토스트 알림)

서버 레이어 (Next.js Route Handlers / Server Components)
├── Route Handler: /api/invoice/[id]
├── Notion 연동: @notionhq/client (고정 토큰, 서버사이드 전용)
└── PDF 변환: 브라우저 window.print() + Print CSS

데이터 레이어
└── Notion API (견적서 원본 데이터 소스 — 별도 DB 없음)

배포
└── Vercel (NOTION_API_KEY, NOTION_DATABASE_ID 환경변수 관리)
```

### 디렉토리 구조 (목표 기준)

```
src/
├── app/
│   ├── invoice/
│   │   └── [id]/
│   │       ├── page.tsx         # F002, F003, F012 — 견적서 조회 페이지
│   │       └── not-found.tsx    # F011 — 404 안내 페이지
│   └── api/
│       └── invoice/
│           └── [id]/route.ts    # F001, F002 — 노션 데이터 조회 API
├── components/
│   ├── invoice/                  # InvoiceViewer, PdfDownloadButton
│   ├── providers/                # ThemeProvider 등
│   └── ui/                       # shadcn/ui 컴포넌트
├── lib/
│   ├── notion.ts                 # Notion 클라이언트 생성 + 파싱 함수
│   ├── api-response.ts           # success()/error() 헬퍼
│   ├── errors.ts                 # NotFoundError, NotionError 등
│   └── utils.ts
└── types/
    ├── notion.ts                 # NotionInvoicePage, ParsedInvoice 등
    └── invoice.ts
```

> 기존에 작성된 `(auth)/`, `(protected)/`, `q/[slug]`, `quotes`, `notion-setup`, `settings/notion` 등 인증·연동 관련 스텁 디렉토리와 컴포넌트(`NotionConnectForm`, `notion-setup-form`, `useAuth`, `useQuotes`, `src/lib/auth.ts`, `src/types/user.ts` 등)는 본 로드맵 적용 시 제거 대상입니다. 별도 마이그레이션 태스크(SETUP-000)에서 정리합니다.

---

## 우선순위 매트릭스

| 우선순위 | 기능 ID | 기능명 | 분류 | 비고 |
|---------|---------|--------|------|------|
| P0 | F001 | 노션 데이터베이스 연동 | MVP 핵심 | 시스템의 유일한 데이터 소스 |
| P0 | F002 | 견적서 조회 | MVP 핵심 | 고유 URL로 견적서 내용 표시 |
| P0 | F011 | 견적서 유효성 검증 (404) | MVP 핵심 | 잘못된 ID 접근 방지 |
| P1 | F003 | PDF 다운로드 | MVP 핵심 | 클라이언트 저장·인쇄 핵심 니즈 |
| P1 | F012 | 반응형 레이아웃 | MVP 핵심 | 모바일·태블릿·데스크톱 대응 |
| P3 | - | 관리자 대시보드(목록·통계) | MVP 이후 | Phase 2 |
| P3 | - | 견적서 상태 관리 | MVP 이후 | Phase 2 |
| P3 | - | 이메일 자동 발송 | MVP 이후 | Phase 3 |

---

## 개발 마일스톤

### Phase 0: 프로젝트 셋업 및 정리 (Week 1, 1.5일)

> 목표: 불필요한 인증/DB 관련 코드 제거, 환경 변수 정리, 공통 모듈 확정

#### 0-1. 레거시 정리

- [x] **SETUP-000** 인증·Postgres 관련 레거시 코드 제거
  - 담당 레이어: 인프라
  - 예상 공수: 0.5일
  - 상세:
    - `src/app/(auth)/`, `src/app/(protected)/`, `src/app/q/[slug]/` 디렉토리 제거
    - `src/components/auth/`, `src/components/dashboard/`, `src/components/notion/`, `src/components/forms/` (login/signup/notion-setup-form) 제거
    - `src/lib/auth.ts`, `src/hooks/useAuth.ts`, `src/hooks/useQuotes.ts`, `src/types/user.ts`, `src/types/quote.ts` 제거 또는 `src/types/invoice.ts`로 대체
    - `src/lib/validations/auth.ts` 제거, `src/lib/validations/notion.ts`는 필요 시 ID 형식 검증용으로 축소
    - 루트 `proxy.ts`(미들웨어 스텁)가 있다면 제거 — 보호 라우트 없음
    - **완료**: `(auth)/`, `(protected)/`, `app/q/[slug]`, `app/quote/[slug]`, `api/auth/*`, `api/notion/*`, `api/quote/[slug]`, `components/auth`, `components/dashboard`, `components/notion`, 인증/Notion 설정 폼, `lib/auth.ts`, `lib/validations/auth.ts`, `lib/validations/notion.ts`, `hooks/useAuth.ts`, `hooks/useQuotes.ts`, `types/user.ts`, 루트 `proxy.ts` 모두 삭제 완료. 당초 Phase 2 재활용 대상으로 보존했던 `components/quote/`, `components/common/quote-viewer.tsx`, `components/common/quote-list.tsx`와 이들이 의존하던 `types/quote.ts`(`QuoteLink`/`QuotePageData`), `lib/api/client.ts`(`apiClient`)는 실제 Phase 2 설계(`src/components/invoice/`에 신규 작성)와 맞지 않는 구 `/q/[slug]` 구조의 mock stub으로 확인되어 추가 정리 단계에서 모두 삭제. `types/index.ts`의 TODO 재노출도 제거. `lib/utils`의 `getShareUrl`(구 `/q/{slug}` URL 생성)도 함께 제거, `formatDate`/`copyToClipboard`/`cn`은 유지

#### 0-2. 환경 변수 및 공통 유틸리티

- [x] **SETUP-001** 환경 변수 스키마 정의 및 `.env.example` 작성
  - 담당 레이어: 인프라
  - 예상 공수: 0.25일
  - 상세:
    - `NOTION_API_KEY` (Notion Integration Token, 서버사이드 전용)
    - `NOTION_DATABASE_ID` (견적서 데이터베이스 ID)
    - `NEXT_PUBLIC_APP_URL` (공개 URL 생성 기준)
    - 기존 `.env.example`/`.env.local`의 `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, `NEXTAUTH_SECRET` 항목 제거
    - **완료**: `.env.example`/`.env.local`을 `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NEXT_PUBLIC_APP_URL` 세 항목으로 단순화. `DATABASE_URL`/`JWT_SECRET`/`ENCRYPTION_KEY`/`NEXTAUTH_SECRET`/`NEXT_PUBLIC_API_URL` 모두 제거. `.env.local`의 `NOTION_DATABASE_ID`는 아직 placeholder — 사용자가 실제 값 입력 필요

- [x] **SETUP-002** Notion 클라이언트 싱글톤 구성
  - 담당 레이어: 라이브러리
  - 예상 공수: 0.25일
  - 의존성: SETUP-001
  - 상세:
    - `npm install @notionhq/client`
    - `src/lib/notion.ts` — `getNotionClient()`: `NOTION_API_KEY` 기반 `Client` 싱글톤 인스턴스 (개발환경 핫리로드 대응)
    - **완료**: `src/lib/notion.ts`를 `getNotionClient()` 싱글톤 구현으로 전체 교체. 구 아키텍처(사용자별 토큰)용 미구현 스텁(`createNotionClient`/`queryDatabase`/`getPageBlocks`, 참조처 없음)은 제거. `globalThis` 캐싱으로 핫리로드 시 재생성 방지, `NOTION_API_KEY` 누락 시 호출 시점에 에러 발생

- [x] **SETUP-003** 공통 API 응답 타입 및 에러 처리 유틸 정의
  - 담당 레이어: 공통
  - 예상 공수: 0.5일
  - 상세:
    - `src/types/index.ts` — `ApiResponse<T>` 판별 유니온 (`{success:true,data}` / `{success:false,error:{code,message}}`)
    - `src/lib/api-response.ts` — `success()`, `error()` 헬퍼 함수
    - `src/lib/errors.ts` — `AppError`, `NotFoundError`, `NotionError` 클래스
    - **완료**: `src/types/index.ts`의 `ApiResponse<T>`를 구 Spring Boot 스타일(`{data,message,status,success}`)에서 판별 유니온으로 교체. `src/lib/api-response.ts`(`success`/`error`), `src/lib/errors.ts`(`AppError`/`NotFoundError`/`NotionError`) 신규 작성. 타입 변경으로 깨지는 `src/lib/api/client.ts`(Phase 2 레거시, 미사용)의 에러 메시지 추출 로직만 새 유니온에 맞게 최소 수정

- [x] **SETUP-004** 견적서 ID 검증 스키마 정의
  - 담당 레이어: 공통
  - 예상 공수: 0.25일
  - 상세:
    - `src/lib/validations/invoice.ts` — Notion 페이지 ID 형식(UUID, 하이픈 유무 모두 허용) Zod 스키마
    - 잘못된 형식의 ID는 API 진입 시점에서 즉시 400 처리
    - **완료**: `src/lib/validations/invoice.ts` 신규 작성. `invoiceIdSchema`(하이픈 포함 UUID 또는 32자리 16진수 형식만 허용, 혼합 형식 불허) + `isValidInvoiceId()` 헬퍼 제공

---

### Phase 1: Notion 데이터 파싱 엔진 (Week 1~2, 3.5일) — F001

> 목표: Notion API 응답에서 견적서 항목·금액·날짜 등을 구조화된 데이터로 변환

- [x] **PARSE-001** Notion/Invoice 타입 정의
  - 담당 레이어: 타입
  - 예상 공수: 0.5일
  - 상세:
    - `src/types/notion.ts`
      - `NotionInvoicePage` — Notion DB 페이지 원시 타입
      - `NotionBlock` — 블록 기본 타입
    - `src/types/invoice.ts`
      - `ParsedInvoice` — 견적서 번호, 클라이언트명, 발행일, 유효기간, 총액, 상태, 공급자 정보, 항목 목록
      - `ParsedInvoiceItem` — 품목·수량·단가·금액
    - **완료**: `src/types/notion.ts`에 `NotionInvoicePage`, `NotionItemPage`, `NotionBlock`과 실제 Notion DB 컬럼명 상수 `INVOICE_PROPERTY_NAMES`, `ITEM_PROPERTY_NAMES` 정의. `src/types/invoice.ts`에 `InvoiceStatus`, `ParsedInvoiceItem`(description/quantity/unitPrice/amount), `ParsedInvoice`(id/invoiceNumber/clientName/issueDate/validUntil/status/totalAmount/supplierInfo/items) 정의 완료

- [x] **PARSE-002** `src/lib/notion.ts` — Notion 데이터 파싱 함수 구현
  - 담당 레이어: 라이브러리
  - 예상 공수: 2일
  - 의존성: PARSE-001, SETUP-002
  - 상세:
    - `fetchInvoicePage(client, pageId)` — `pages.retrieve()`로 페이지 프로퍼티 조회, 존재하지 않으면 `NotFoundError`
    - `fetchInvoiceItems(client, pageId)` — Invoices 페이지의 "항목" Relation 프로퍼티에서 연결된 Items DB 페이지 ID 목록을 추출한 뒤, 각 Item 페이지를 `pages.retrieve()`로 조회하여 항목 목록 구성 (Items DB Relation 방식으로 확정)
    - `parseInvoiceProperties(page)` — Notion 프로퍼티 → `ParsedInvoice` 변환. `INVOICE_PROPERTY_NAMES` 상수의 실제 컬럼명("이름", "클라언트명", "발행일", "유효기간", "공급자 정보", "상태", "총 금액", "항목")을 키로 사용 (Title→invoiceNumber, Text→clientName/supplierInfo, Date→issueDate/validUntil, Number→totalAmount, Select→status)
    - `parseInvoiceItems(rawItems)` — `ITEM_PROPERTY_NAMES` 상수의 실제 컬럼명("항목명", "수량", "단가", "금액")을 사용하여 `ParsedInvoiceItem[]`(description/quantity/unitPrice/amount)로 변환
    - 누락된 프로퍼티는 기본값(`null`/`0`/`""`) 처리로 null 안전성 확보
    - **완료**: `src/lib/notion.ts`에 `fetchInvoicePage`/`fetchInvoiceItems`/`parseInvoiceProperties`/`parseInvoiceItems` 구현. `fetchInvoicePage`는 `pages.retrieve()` 호출 후 `isFullPage()`로 타입 가드, `APIResponseError`의 `ObjectNotFound` 코드를 `NotFoundError`로, 그 외 실패는 `NotionError`로 변환. `fetchInvoiceItems`는 `fetchInvoicePage`로 페이지를 다시 조회해 "항목" Relation의 페이지 ID들을 추출 후 각각 `pages.retrieve()`. `parseInvoiceProperties`/`parseInvoiceItems`는 title/rich_text/date/number/select/relation/formula 속성별 추출 헬퍼(`getTitleText`, `getRichTextValue`, `getDateValue`, `getNumberValue`, `getStatusValue`, `getFormulaNumberValue`)로 null 안전 변환. `items`는 `parseInvoiceProperties`에서 빈 배열로 두고 `parseInvoiceItems` 결과를 호출부(INVOICE-001)에서 병합하는 구조

- [x] **PARSE-003** Notion 파싱 유닛 테스트
  - 담당 레이어: 테스트
  - 예상 공수: 1일
  - 의존성: PARSE-002
  - 상세:
    - Notion API 응답 Mock 데이터 작성 (정상/누락 프로퍼티 케이스)
    - `parseInvoiceProperties`, `parseInvoiceItems` 단위 테스트
    - **완료**: 테스트 러너 `vitest` 신규 설치, 루트에 `vitest.config.ts`(`@` → `./src` 경로 별칭, `environment: "node"`) 추가, `package.json`에 `test` 스크립트(`vitest run`) 추가. `src/lib/notion.test.ts` 작성 — `createMockInvoicePage`/`createMockItemPage` 헬퍼로 `PageObjectResponse`의 `id`/`properties`만 채운 mock을 `as unknown as` 캐스팅해 구성. `parseInvoiceProperties`: 정상 케이스(모든 프로퍼티 매핑), 상태값 매핑(대기/승인/거절/기타→null/select null→null), 누락 프로퍼티 기본값(""/null/0), `date: null` 케이스 검증. `parseInvoiceItems`: 정상 케이스(formula→amount 매핑 포함), 빈 배열, 누락 프로퍼티 기본값, formula 타입이 number가 아닐 때 amount=0 검증. 총 12개 테스트 모두 통과(`npm run test`), `tsc --noEmit`/`eslint` 모두 클린

---

### Phase 2: 견적서 조회 및 PDF 다운로드 (Week 2~3, 5일) — F002, F003, F011, F012

> 목표: 고유 URL로 견적서를 조회하고 PDF로 다운로드할 수 있는 공개 페이지 완성

#### 2-1. 조회 API

- [x] **INVOICE-001** `GET /api/invoice/[id]` — 견적서 데이터 조회 API 구현
  - 담당 레이어: API Route
  - 예상 공수: 1일
  - 의존성: SETUP-003, SETUP-004, PARSE-002
  - 상세:
    - 인증 불필요 (공개 접근)
    - `id`(Notion 페이지 ID) 형식 검증 → 실패 시 400
    - `fetchInvoicePage` + `fetchInvoiceItems` → `parseInvoiceProperties` + `parseInvoiceItems` 적용
    - 페이지 미존재 시 404, Notion API 실패 시 500
    - 응답: `ApiResponse<ParsedInvoice>` 표준 형식
    - **완료**: `src/app/api/invoice/[id]/route.ts` 신규 생성. `isValidInvoiceId()` 형식 검증 → 400, `NotFoundError` → 404, `NotionError` → 500, 기타 → 500. `ParsedInvoice` 조합 후 `success()` 래퍼로 응답

#### 2-2. 견적서 조회 UI

- [x] **INVOICE-002** `InvoiceViewer` 컴포넌트 구현 (핵심)
  - 담당 레이어: Frontend
  - 예상 공수: 2일
  - 의존성: PARSE-001
  - 상세:
    - `src/components/invoice/InvoiceViewer.tsx`
    - 섹션 구성: 헤더(견적서 번호·발행일·유효기간), 클라이언트 정보, 견적 항목 테이블(품목|수량|단가|금액), 소계/세금(10%)/총액
    - 반응형 레이아웃 (모바일·태블릿·데스크톱)
    - Print CSS (`@media print`) — PDF 버튼 등 비인쇄 요소 숨김
    - **완료**: 구현 및 UI/UX 개선 완료. `rounded-2xl`, `shadow-sm`, `bg-slate-900` 총액 박스, `py-5 pl-6` 테이블 간격, `max-w-3xl` 컨테이너 등 모던 디자인 적용

- [x] **INVOICE-003** `PdfDownloadButton` 컴포넌트 구현 (F003)
  - 담당 레이어: Frontend
  - 예상 공수: 1일
  - 의존성: INVOICE-002
  - 상세:
    - `src/components/invoice/PdfDownloadButton.tsx`
    - `window.print()` 호출 — Print CSS 기반 PDF 변환·저장
    - 클릭 전 `document.title`을 견적서 제목으로 임시 변경 후 인쇄, 완료 후 복원
    - 인쇄 미지원 환경 안내 메시지 처리
    - **완료**: `src/components/invoice/PdfDownloadButton.tsx` 구현 완료

- [x] **INVOICE-004** 견적서 조회 페이지 구현 (`/invoice/[id]`)
  - 담당 레이어: Frontend
  - 예상 공수: 0.75일
  - 의존성: INVOICE-001, INVOICE-002, INVOICE-003
  - 상세:
    - `src/app/invoice/[id]/page.tsx` — Server Component
    - 서버사이드에서 Notion 데이터 조회(직접 `lib/notion.ts` 호출 또는 `/api/invoice/[id]` 호출)
    - 존재하지 않는 ID → `notFound()` 호출
    - `InvoiceViewer` + `PdfDownloadButton` 렌더링, 헤더·푸터 없는 단독 레이아웃
    - 페이지 메타데이터 (title: 견적서 번호, description: 클라이언트명)
    - **완료**: MOCK 데이터 제거, `React.cache()` 기반 `getInvoice()` 헬퍼로 `generateMetadata`·`InvoicePage` 간 Notion API 중복 호출 방지. `NotFoundError` → `notFound()`, 기타 → throw (error boundary)

- [x] **INVOICE-005** 404 에러 페이지 구현
  - 담당 레이어: Frontend
  - 예상 공수: 0.25일
  - 상세:
    - `src/app/invoice/[id]/not-found.tsx`
    - "견적서를 찾을 수 없습니다" 안내 + 발행자에게 올바른 링크 요청 가이드
    - **완료**: `src/app/invoice/[id]/not-found.tsx` 구현 완료

---

### Phase 3: 통합 테스트 및 배포 준비 (Week 3, 1.75일)

#### 3-1. 통합 검증

- [ ] **DEPLOY-001** E2E 시나리오 수동 테스트
  - 예상 공수: 0.5일
  - 상세:
    - 정상 ID 접근 → 견적서 렌더링 → PDF 다운로드
    - 잘못된 ID/형식 오류 ID 접근 → 404 / 400 처리 확인
    - 모바일·태블릿·데스크톱 반응형 확인

- [ ] **DEPLOY-002** 보안 점검
  - 예상 공수: 0.25일
  - 상세:
    - `NOTION_API_KEY`가 클라이언트 응답·번들에 절대 포함되지 않는지 확인
    - API Route에서 try-catch 전역 처리 및 표준 에러 응답 확인

#### 3-2. Vercel 배포

- [ ] **DEPLOY-003** Vercel 환경 변수 등록
  - 예상 공수: 0.25일
  - 상세:
    - `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NEXT_PUBLIC_APP_URL`

- [ ] **DEPLOY-004** 프로덕션 빌드 검증
  - 예상 공수: 0.5일
  - 상세:
    - `npm run build` 로컬 빌드 성공 확인
    - TypeScript 타입 에러 0건, ESLint 경고 0건
    - Vercel 첫 배포 후 URL 동작 확인

---

## 노션 데이터베이스 구조

> **실제 DB 조사 결과 (PARSE-001 진행 중 확인)**: 아래 표는 실제 Notion DB 내보내기 CSV 분석 결과를 반영한 최신 컬럼명입니다. 컬럼명은 `src/types/notion.ts`의 `INVOICE_PROPERTY_NAMES`, `ITEM_PROPERTY_NAMES` 상수에 그대로 정의되어 있으며, 코드에서는 이 상수를 통해 참조합니다.

### Invoices (견적서 데이터베이스)

| 실제 컬럼명 | Notion 타입 | 예시 값 | 매핑 필드 (`ParsedInvoice`) |
|--------|------------|---------|----------------------------|
| 이름 | Title | INV-2026-001 | `invoiceNumber` |
| 클라언트명 (오타 포함 — 실제 컬럼명, 수정 불가) | Text | ABC 회사 | `clientName` |
| 발행일 | Date | 2026년 6월 1일 | `issueDate` |
| 유효기간 | Date | 2026년 6월 30일 | `validUntil` |
| 공급자 정보 | Text (현재 비어있음) | (empty) | `supplierInfo` |
| 상태 | Select (대기/승인/거절) | 대기 | `status` |
| 총 금액 | Number | ₩5,000,000 | `totalAmount` |
| 항목 | Relation → Items DB | 웹사이트 디자인, 로고 제작, 명함 디자인 | `items[]` |

> "클라언트명"은 실제 Notion DB 컬럼명에 포함된 오타이며, DB 스키마 수정이 불가능한 상황이므로 코드에서도 이 이름을 그대로 사용합니다 (`INVOICE_PROPERTY_NAMES.clientName`).

### Items (견적 항목 데이터베이스)

> **구현 방식 확정**: 실제 DB 조사 결과 Items DB를 별도로 두고 Invoices DB의 "항목" 프로퍼티에서 Relation으로 연결하는 구조로 확정되었습니다. `fetchInvoiceItems`는 Relation에 연결된 Items DB 페이지들을 `pages.retrieve()`로 조회하여 파싱합니다. 페이지 본문 표(Table) 블록 파싱 방식은 사용하지 않습니다.

| 실제 컬럼명 | Notion 타입 | 매핑 필드 (`ParsedInvoiceItem`) |
|--------|------------|---------------------------------|
| 항목명 | Title | `description` |
| 수량 | Number | `quantity` |
| 단가 | Number | `unitPrice` |
| 금액 | Formula (수량 × 단가) | `amount` |
| Invoices | Relation → Invoices DB | (역참조, 사용 안 함) |

### Notion 연결 설정

1. [Notion Developers](https://www.notion.so/my-integrations)에서 Integration 생성 → Internal Integration Token을 `NOTION_API_KEY`로 저장
2. Invoices DB(및 Items DB) 우측 상단 `···` → `Add connections`에서 생성한 Integration 연결
3. Invoices DB URL에서 32자리 ID 추출 → `NOTION_DATABASE_ID`로 저장

---

## API 엔드포인트 목록

| 메서드 | 경로 | 기능 ID | 인증 | 설명 |
|--------|------|---------|------|------|
| GET | `/api/invoice/[id]` | F001, F002, F011 | 불필요 | 견적서 데이터 조회 (Notion 직접 조회) |

### API 응답 형식 표준

```typescript
// 성공 응답
{
  "success": true,
  "data": { ... }
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "INVOICE_NOT_FOUND",
    "message": "견적서를 찾을 수 없습니다."
  }
}
```

---

## 라우팅 및 페이지 구조

| 경로 | 접근 제어 | 기능 ID | 설명 |
|------|---------|---------|------|
| `/invoice/[id]` | 공개 접근 | F002, F003, F011, F012 | 견적서 조회 페이지 (id = Notion 페이지 ID) |

---

## 🧪 테스트 전략

### Playwright MCP 테스트 원칙
- API 연동 태스크(INVOICE-001) 완료 후 Playwright MCP로 엔드포인트 동작 검증
- UI 구현(INVOICE-002~005) 완료 후 렌더링·PDF·404 흐름 검증
- Phase 완료 시 해당 Phase 전체 기능 회귀 테스트

### Phase별 Playwright 핵심 시나리오

#### Phase 1 (파싱)
- `/api/invoice/[id]` 응답에 파싱된 견적서 데이터(항목·금액·날짜) 포함 여부 확인

#### Phase 2 (조회·PDF)
- 유효한 ID 접근 → 견적서 전체 렌더링 확인
- PDF 다운로드 버튼 클릭 → 인쇄 다이얼로그 동작 확인
- 잘못된 ID/형식 오류 ID → 404 / 400 응답 확인
- 모바일·태블릿·데스크톱 반응형 확인

---

## 리스크 및 의존성

| 리스크 | 심각도 | 완화 전략 |
|--------|--------|---------|
| Notion API 응답 구조 변경 | 중 | 파싱 로직을 `src/lib/notion.ts`에 집중화, 타입 체크 강화 |
| Notion API Rate Limit (초당 3회) | 중 | 견적서 조회 페이지에 캐싱(`revalidate`) 적용, 에러 시 재시도 backoff |
| `window.print()` PDF 품질 | 중 | Print CSS 최적화, 브라우저별 인쇄 미리보기 테스트 (Chrome, Safari, Firefox) |
| `NOTION_API_KEY` 유출 | 고 | 서버사이드 코드에서만 사용, `NEXT_PUBLIC_` 접두사 절대 금지, Vercel 환경변수로만 관리 |
| 노션 페이지 ID 추측을 통한 무단 접근 | 저 | UUID 기반 ID는 추측 난이도가 높음 — MVP에서는 허용, 이후 별도 만료/접근 제어 고려 (Phase 2) |

---

## 개발 규칙 및 컨벤션

### 파일 네이밍

| 구분 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 | PascalCase | `InvoiceViewer.tsx`, `PdfDownloadButton.tsx` |
| 유틸·훅·라이브러리 | camelCase / kebab-case | `notion.ts`, `api-response.ts` |
| API Route | Next.js 관례 | `route.ts` |
| 타입 파일 | kebab-case | `invoice.ts`, `notion.ts` |

### 코드 규칙

- 주석은 비즈니스 로직에만, 한국어 작성
- 변수명·함수명은 영어 camelCase
- Server Component 기본, 클라이언트 상호작용 필요 시에만 `"use client"` 명시
- API Route에서 try-catch 전역 처리 — 에러 로그 + 표준 에러 응답 반환
- `NOTION_API_KEY`는 서버사이드 코드에서만 처리, 클라이언트 번들에 절대 포함 금지
- `console.log` 커밋 금지 (개발 중 `console.error`만 허용)

### 환경변수 규칙

- `NEXT_PUBLIC_` 접두사: 클라이언트 번들에 포함 (민감 정보 금지)
- 그 외: 서버사이드 전용 (`NOTION_API_KEY`)

---

## Definition of Done

각 태스크 완료 기준:

- [ ] 기능이 PRD 명세대로 동작함
- [ ] TypeScript 타입 에러 없음
- [ ] ESLint 에러 없음
- [ ] 에러 케이스 처리됨 (빈 입력, API 실패, 404 등)
- [ ] 로딩 상태 UI 구현됨 (API 호출 중 스피너/스켈레톤)
- [ ] 반응형 레이아웃 확인 (모바일·데스크톱)
- [ ] `NOTION_API_KEY`가 클라이언트 응답에 노출되지 않음
- [ ] API 응답 형식이 `ApiResponse<T>` 표준을 준수함
- [ ] API 연동·비즈니스 로직 구현 태스크는 Playwright MCP로 검증 완료

---

## 개발 완료 체크리스트 (Playwright MCP 검증 결과)

> 검증 일시: 2026-06-18 | 검증 환경: localhost:3001 | Notion API 실연동

### ✅ INVOICE-001: API Route 검증

| 시나리오 | 기대값 | 결과 |
|---------|--------|------|
| `GET /api/invoice/not-a-valid-id` | 400 + `INVALID_INVOICE_ID` | ✅ 통과 |
| `GET /api/invoice/12345678-1234-4123-8234-123456789012` (존재하지 않는 UUID) | 404 + `INVOICE_NOT_FOUND` | ✅ 통과 |
| `GET /api/invoice/37fbfe1cf6d7808f92a9cdc9a034a412` (실제 Notion 페이지) | 200 + `ParsedInvoice` | ✅ 통과 |
| API 응답 형식 `ApiResponse<T>` 준수 | `{success, data/error}` | ✅ 통과 |

### ✅ INVOICE-004: 견적서 조회 페이지 검증

| 시나리오 | 기대값 | 결과 |
|---------|--------|------|
| `/invoice/37fbfe1cf6d7808f92a9cdc9a034a412` 접속 | 실제 Notion 데이터 렌더링 | ✅ 통과 |
| 페이지 타이틀 | `INV-2026-001 — 견적서 \| Invoce` | ✅ 통과 |
| 견적서 번호, 클라이언트명, 발행일, 유효기간 표시 | 정확한 값 | ✅ 통과 |
| 견적 항목 3개 (웹사이트 디자인·로고 제작·명함 디자인) | 수량·단가·금액 정확 | ✅ 통과 |
| 소계 ₩5,000,000 · 부가세 ₩500,000 · 합계 ₩5,000,000 | 자동 계산 | ✅ 통과 |
| 상태 배지 "대기" 표시 (status type 처리) | `<Badge>대기</Badge>` | ✅ 통과 |
| `/invoice/invalid-format-id` 접속 | not-found.tsx 표시 | ✅ 통과 |
| 모바일(375px) 반응형 레이아웃 | 액션바·카드·합계 정상 표시 | ✅ 통과 |
| 테이블 가로 스크롤 (모바일) | `overflow-x-auto` 적용 | ✅ 통과 |

### ✅ 보안 체크

| 항목 | 결과 |
|------|------|
| `NOTION_API_KEY` 클라이언트 번들 미포함 | ✅ 서버사이드 전용 (`NEXT_PUBLIC_` 미사용) |
| API Route 서버사이드 전용 실행 | ✅ Next.js Route Handler |
| 에러 응답에 민감 정보 미포함 | ✅ 코드·메시지만 반환 |

### ✅ 코드 품질

| 항목 | 결과 |
|------|------|
| `npx tsc --noEmit` | ✅ 에러 0건 |
| `eslint` (신규 파일) | ✅ 에러 0건 |
| `React.cache()` 중복 Notion API 호출 방지 | ✅ 적용 |

### ⏳ 미완료 (배포 단계)

| 태스크 | 상태 | 비고 |
|--------|------|------|
| DEPLOY-001 E2E 전체 시나리오 | ⏳ 대기 | Notion API 연동 검증 완료 |
| DEPLOY-002 보안 점검 심화 | ⏳ 대기 | 기본 체크 완료 |
| DEPLOY-003 Vercel 환경 변수 | ⏳ 대기 | 배포 시 진행 |
| DEPLOY-004 프로덕션 빌드 검증 | ⏳ 대기 | `npm run build` 확인 필요 |

---

## 전체 타임라인 요약

| Phase | 기간 | 주요 산출물 |
|-------|------|------------|
| Phase 0: 셋업 및 정리 | Week 1 (1.5일) | 레거시 제거, 환경변수·공통 유틸 |
| Phase 1: 데이터 파싱 | Week 1~2 (3.5일) | Notion → 구조화된 견적서 데이터 |
| Phase 2: 조회·PDF | Week 2~3 (5일) | 견적서 조회 페이지·PDF 다운로드 |
| Phase 3: 배포 | Week 3 (1.75일) | Vercel 배포·E2E 검증 |
| **합계** | **약 2주 (11.75일)** | **MVP 완성** |

> 버퍼 20% 포함 기준. 단일 개발자 기준 산정.
