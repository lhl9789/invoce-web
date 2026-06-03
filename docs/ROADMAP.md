# Invoce 개발 로드맵

## 프로젝트 개요

- **목표**: 프리랜서·소규모 사업자가 Notion에 작성한 견적서를 웹 링크 하나로 클라이언트에게 공유하고, 클라이언트는 계정 없이 열람 및 PDF 다운로드를 완결할 수 있는 서비스 구축
- **대상 사용자**: Notion을 업무 도구로 사용하는 프리랜서·디자이너·개발자·소규모 에이전시 운영자 (공급자), 링크를 전달받는 클라이언트 (수신자)
- **핵심 가치**: Notion 데이터 → 세련된 웹 견적서 → 1클릭 PDF 다운로드
- **성공 지표**:
  - Notion 연동 후 첫 공유 링크 생성까지 5분 이내
  - 클라이언트가 링크 접근 후 PDF 다운로드까지 30초 이내
  - 잘못된 슬러그 접근 시 404 안내 100% 표시

---

## 기술 아키텍처 개요

```
[Next.js 16 App Router — 풀스택 단일 레포]

클라이언트 레이어 (Browser)
├── React 19 Server / Client Components
├── TailwindCSS v4 + shadcn/ui + Lucide React
├── React Hook Form + Zod (폼 검증)
├── TanStack Query v5 (서버 상태 캐싱)
└── Sonner (토스트 알림)

서버 레이어 (Next.js API Routes / Server Actions)
├── Route Handlers: /api/auth/**, /api/notion/**, /api/quote/**
├── 인증: jose (JWT) + bcryptjs (비밀번호 해싱)
├── Notion 연동: @notionhq/client
└── 암호화: Node.js crypto (AES-256 — Notion 토큰 암호화)

데이터 레이어
├── PostgreSQL (User, NotionIntegration, QuoteLink)
└── Notion API (견적서 원본 데이터 소스)

배포
└── Vercel (환경변수로 암호화 키 관리)
```

### 디렉토리 구조 (현재 기준)

```
src/
├── app/
│   ├── (auth)/                    # 비로그인 전용 레이아웃
│   │   ├── login/page.tsx         # F010 — 로그인 페이지
│   │   └── signup/page.tsx        # F010 — 회원가입 페이지
│   ├── (protected)/               # 로그인 필수 레이아웃
│   │   ├── notion-setup/page.tsx  # F001, F011 — Notion 연동 페이지
│   │   ├── quotes/page.tsx        # F002, F003, F006 — 견적서 목록 페이지
│   │   └── settings/notion/page.tsx
│   ├── q/[slug]/page.tsx          # F004, F005, F006 — 공개 견적서 열람 페이지
│   └── api/
│       ├── auth/login/route.ts    # F010
│       ├── auth/logout/route.ts   # F010
│       ├── auth/signup/route.ts   # F010
│       ├── notion/connect/route.ts # F001, F011
│       ├── notion/quotes/route.ts  # F002, F006
│       └── quote/[slug]/route.ts  # F003, F004
├── components/
│   ├── auth/                      # LoginForm, SignupForm
│   ├── dashboard/                 # QuoteCard, QuoteList
│   ├── forms/                     # login-form, signup-form, notion-setup-form
│   ├── notion/                    # NotionConnectForm
│   ├── quote/                     # QuoteViewer, PdfDownloadButton
│   ├── layout/                    # Header, Footer
│   ├── providers/                 # QueryProvider, ThemeProvider
│   └── ui/                        # shadcn/ui 컴포넌트
├── hooks/
│   ├── useAuth.ts
│   └── useQuotes.ts
├── lib/
│   ├── auth.ts                    # JWT 발급·검증 유틸
│   ├── notion.ts                  # Notion API 래퍼
│   ├── api/client.ts              # fetch 클라이언트
│   ├── utils/index.ts
│   └── validations/               # auth.ts, notion.ts (Zod 스키마)
├── types/
│   ├── index.ts
│   ├── notion.ts
│   ├── quote.ts
│   └── user.ts
└── constants/
    ├── index.ts
    └── routes.ts
```

---

## 우선순위 매트릭스

| 우선순위 | 기능 ID | 기능명 | 분류 | 비고 |
|---------|---------|--------|------|------|
| P0 | F010 | 기본 인증 (회원가입·로그인·로그아웃) | MVP 핵심 | 다른 모든 기능의 전제조건 |
| P0 | F011 | Notion 토큰 암호화 보관 | MVP 핵심 | 보안 필수 — 클라이언트 토큰 노출 방지 |
| P0 | F001 | Notion 연동 등록 (Token + DB ID) | MVP 핵심 | 데이터 소스 연결 없이 서비스 불가 |
| P0 | F006 | Notion 데이터 파싱 | MVP 핵심 | 원시 Notion 블록 → 구조화 데이터 변환 |
| P1 | F002 | 견적서 목록 조회 | MVP 핵심 | 공유할 견적서 선택 핵심 흐름 |
| P1 | F003 | 공유 링크 생성·복사 | MVP 핵심 | 클라이언트 전달 유일한 채널 |
| P1 | F004 | 견적서 공개 열람 (비로그인) | MVP 핵심 | 클라이언트 핵심 가치 |
| P1 | F005 | PDF 다운로드 (window.print()) | MVP 핵심 | 내부 결재·보관용 클라이언트 니즈 |
| P3 | - | 견적서 상태 관리 | MVP 이후 | Phase 2 |
| P3 | - | 이메일 자동 발송 | MVP 이후 | Phase 3 |
| P3 | - | 열람 이벤트 추적 | MVP 이후 | Phase 2 |

---

## 개발 마일스톤

### Phase 0: 프로젝트 셋업 및 인프라 (Week 1)

> 목표: 개발 환경 구성, DB 스키마 확정, 공통 모듈 완성

#### 0-1. 환경 변수 및 DB 연결 설정

- [ ] **SETUP-001** 환경 변수 스키마 정의 및 `.env.local.example` 작성
  - 담당 레이어: 인프라
  - 예상 공수: 0.5일
  - 상세:
    - `DATABASE_URL` (PostgreSQL 연결 문자열)
    - `JWT_SECRET` (jose 서명 키)
    - `ENCRYPTION_KEY` (AES-256 — Notion 토큰 암호화용, 32바이트)
    - `NEXT_PUBLIC_APP_URL` (공개 URL 생성 기준)

- [ ] **SETUP-002** PostgreSQL 연결 및 ORM 설정
  - 담당 레이어: 데이터
  - 예상 공수: 1일
  - 상세:
    - ORM 선택 결정 (Prisma 권장 — Next.js App Router와 호환성 우수)
    - `prisma/schema.prisma` 작성 (User, NotionIntegration, QuoteLink 모델)
    - 마이그레이션 스크립트 초기 실행
    - `src/lib/db.ts` — Prisma Client 싱글톤 인스턴스 (개발환경 핫리로드 대응)

#### 0-2. 공통 유틸리티 및 타입 확정

- [ ] **SETUP-003** 공통 API 응답 타입 및 에러 처리 유틸 정의
  - 담당 레이어: 공통
  - 예상 공수: 0.5일
  - 상세:
    - `src/types/api.ts` — `ApiResponse<T>`, `ApiError` 타입 정의
    - `src/lib/api-response.ts` — `success()`, `error()` 헬퍼 함수 (일관된 JSON 응답 형식)
    - `src/lib/errors.ts` — 도메인별 커스텀 에러 클래스 (AuthError, NotionError, NotFoundError)

- [ ] **SETUP-004** 암호화 유틸리티 구현 (F011 사전 준비)
  - 담당 레이어: 공통
  - 예상 공수: 0.5일
  - 의존성: SETUP-001
  - 상세:
    - `src/lib/crypto.ts` — AES-256-GCM encrypt/decrypt 함수
    - `ENCRYPTION_KEY` 환경변수 기반 동작
    - 단위 테스트 작성

- [ ] **SETUP-005** 인증 미들웨어 (middleware.ts) 구현
  - 담당 레이어: 공통
  - 예상 공수: 0.5일
  - 의존성: SETUP-003
  - 상세:
    - `src/middleware.ts` — 쿠키의 JWT 검증
    - 보호 경로 (`/quotes`, `/notion-setup`, `/settings/**`) → 미인증 시 `/login` 리디렉션
    - 인증 경로 (`/login`, `/signup`) → 인증 상태면 `/quotes` 리디렉션

- [ ] **SETUP-006** Zod 검증 스키마 정비
  - 담당 레이어: 공통
  - 예상 공수: 0.5일
  - 상세:
    - `src/lib/validations/auth.ts` — 회원가입·로그인 스키마 확정
    - `src/lib/validations/notion.ts` — Notion 연동 폼 스키마 확정
    - 비밀번호 최소 8자, 이메일 형식 검증 규칙 명문화

---

### Phase 1: 인증 시스템 구축 (Week 1~2) — F010

> 목표: 회원가입·로그인·로그아웃 완전 동작, 세션 쿠키 기반 인증 흐름 완성

#### 1-1. 인증 API Routes

- [ ] **AUTH-001** `POST /api/auth/signup` — 회원가입 API 구현
  - 담당 레이어: API Route
  - 예상 공수: 1일
  - 의존성: SETUP-002, SETUP-003, SETUP-006
  - 상세:
    - Zod 스키마 검증 (이메일, 비밀번호, 비밀번호 확인 일치)
    - 이메일 중복 여부 DB 조회
    - bcryptjs로 비밀번호 해싱 (saltRounds: 12)
    - User 레코드 생성 후 JWT 쿠키 발급 (httpOnly, sameSite: strict)
    - 성공 응답: 201, 실패 응답: 400(검증 실패) / 409(이메일 중복)
  - 테스트: Playwright MCP로 `/api/auth/signup` 호출 시 정상 가입, 이메일 중복, 검증 실패 케이스 확인

- [ ] **AUTH-002** `POST /api/auth/login` — 로그인 API 구현
  - 담당 레이어: API Route
  - 예상 공수: 0.5일
  - 의존성: SETUP-002, SETUP-003, SETUP-006
  - 상세:
    - 이메일로 User 조회, bcryptjs.compare로 비밀번호 검증
    - 검증 성공 시 JWT 쿠키 발급 (유효기간 7일)
    - 실패 응답: 401 (이메일·비밀번호 불일치 — 구분 없이 동일 메시지)
  - 테스트: Playwright MCP로 로그인 성공/실패 및 JWT 쿠키 발급 확인

- [ ] **AUTH-003** `POST /api/auth/logout` — 로그아웃 API 구현
  - 담당 레이어: API Route
  - 예상 공수: 0.25일
  - 상세:
    - JWT 쿠키 만료 처리 (maxAge: 0)
    - 응답: 200
  - 테스트: Playwright MCP로 로그아웃 후 쿠키 만료 및 보호 페이지 접근 차단 확인

- [ ] **AUTH-004** `src/lib/auth.ts` — JWT 유틸 완성
  - 담당 레이어: 라이브러리
  - 예상 공수: 0.5일
  - 의존성: SETUP-001
  - 상세:
    - `signJwt(payload)` — jose로 JWT 서명 및 발급
    - `verifyJwt(token)` — JWT 검증 및 payload 반환
    - `getCurrentUser(request)` — 요청 쿠키에서 인증된 사용자 정보 추출
    - 만료 토큰 처리 (verifyJwt에서 null 반환)

#### 1-2. 인증 UI 컴포넌트

- [ ] **AUTH-005** 로그인 페이지 UI 구현 (`/login`)
  - 담당 레이어: Frontend
  - 예상 공수: 1일
  - 의존성: AUTH-002, SETUP-006
  - 상세:
    - `src/components/forms/login-form.tsx` — React Hook Form + Zod
    - 이메일·비밀번호 입력 필드, 인라인 에러 메시지
    - 로그인 실패 시 서버 에러 메시지 표시 (toast 또는 인라인)
    - "회원가입" 링크 (`/signup`)
    - `src/app/(auth)/login/page.tsx` 연결
    - 로딩 상태 버튼 처리 (isPending 상태)
  - 테스트: Playwright MCP로 로그인 폼 입력 → 성공 시 `/quotes` 리디렉션, 실패 시 에러 메시지 표시 확인

- [ ] **AUTH-006** 회원가입 페이지 UI 구현 (`/signup`)
  - 담당 레이어: Frontend
  - 예상 공수: 1일
  - 의존성: AUTH-001, SETUP-006
  - 상세:
    - `src/components/forms/signup-form.tsx` — React Hook Form + Zod
    - 이메일·비밀번호·비밀번호 확인 입력 필드
    - 이메일 중복 에러, 비밀번호 불일치 에러 인라인 표시
    - 가입 성공 후 `/notion-setup` 리디렉션
    - "로그인" 링크 (`/login`)
  - 테스트: Playwright MCP로 회원가입 폼 → 성공 시 `/notion-setup` 리디렉션 확인

- [ ] **AUTH-007** 헤더 컴포넌트 인증 상태 반영
  - 담당 레이어: Frontend
  - 예상 공수: 0.5일
  - 의존성: AUTH-003, AUTH-004
  - 상세:
    - `src/components/layout/Header.tsx` 수정
    - 비로그인: "로그인" / "회원가입" 링크 표시
    - 로그인: "내 견적서 목록" / "Notion 연동" / "로그아웃" 버튼 표시
    - 로그아웃 클릭 → `POST /api/auth/logout` 호출 후 `/login` 리디렉션

- [ ] **AUTH-008** `useAuth` 훅 구현
  - 담당 레이어: Frontend
  - 예상 공수: 0.5일
  - 의존성: AUTH-004
  - 상세:
    - `src/hooks/useAuth.ts` — 현재 사용자 정보 조회, 로그아웃 액션 제공
    - Server Component에서 직접 `getCurrentUser` 호출 방식과 구분

---

### Phase 2: Notion 연동 시스템 구축 (Week 2~3) — F001, F011

> 목표: Notion Integration Token과 DB ID를 암호화하여 저장, 연동 테스트 동작 완성

#### 2-1. Notion 연동 API Routes

- [ ] **NOTION-001** `POST /api/notion/connect` — Notion 연동 저장 API 구현
  - 담당 레이어: API Route
  - 예상 공수: 1일
  - 의존성: AUTH-004, SETUP-002, SETUP-004
  - 상세:
    - JWT 쿠키로 인증된 사용자 확인
    - Zod 검증: Integration Token (필수, `secret_` 접두사 형식), Database ID (필수)
    - 연동 테스트 로직: `@notionhq/client`로 `databases.retrieve()` 호출 — 성공 여부 확인
    - 성공 시 `encryptToken(token)` 으로 암호화 후 NotionIntegration 테이블 upsert (userId 기준)
    - 응답: 201(신규 생성) / 200(업데이트) / 400(검증 실패) / 422(Notion API 연결 실패)
  - 테스트: Playwright MCP로 유효/무효 토큰 제출 시 서버 응답 및 토스트 메시지 확인

- [ ] **NOTION-002** `GET /api/notion/connect` — 현재 연동 상태 조회 API
  - 담당 레이어: API Route
  - 예상 공수: 0.5일
  - 의존성: AUTH-004, SETUP-002
  - 상세:
    - 인증된 사용자의 NotionIntegration 조회
    - 응답 시 `encryptedToken`은 포함하지 않고 마스킹 처리 (`secret_****...`)
    - `databaseId`와 `updatedAt`만 반환
    - 미연동 상태: 404

#### 2-2. Notion 연동 UI

- [ ] **NOTION-003** Notion 연동 폼 컴포넌트 구현
  - 담당 레이어: Frontend
  - 예상 공수: 1.5일
  - 의존성: NOTION-001, NOTION-002, SETUP-006
  - 상세:
    - `src/components/forms/notion-setup-form.tsx` 완성
    - Integration Token 입력 필드 (type: password, 마스킹 표시 토글)
    - Database ID 입력 필드
    - **연동 테스트** 버튼 — POST 요청 후 성공/실패 피드백 (Sonner 토스트)
    - **저장** 버튼 — 테스트 성공 후에만 활성화 (또는 항상 활성화 후 서버에서 테스트)
    - Notion Integration 발급 방법 안내 텍스트 링크 포함
    - 기존 연동 정보 있으면 현재 상태 표시 (마스킹된 토큰, DB ID)
  - 테스트: Playwright MCP로 연동 테스트 버튼 → 성공/실패 피드백, 저장 후 리디렉션 확인

- [ ] **NOTION-004** Notion 연동 페이지 연결
  - 담당 레이어: Frontend
  - 예상 공수: 0.25일
  - 의존성: NOTION-003
  - 상세:
    - `src/app/(protected)/notion-setup/page.tsx` — NOTION-003 컴포넌트 마운트
    - 저장 성공 후 `/quotes` 리디렉션

---

### Phase 3: Notion 데이터 파싱 엔진 (Week 3) — F006

> 목표: Notion API 응답에서 견적서 항목·금액·날짜 등을 구조화된 데이터로 변환

#### 3-1. Notion 데이터 파싱 라이브러리

- [ ] **PARSE-001** Notion 타입 정의
  - 담당 레이어: 타입
  - 예상 공수: 0.5일
  - 상세:
    - `src/types/notion.ts` 확정
      - `NotionQuotePage` — Notion DB 페이지 원시 타입
      - `ParsedQuote` — 파싱 후 구조화된 견적서 타입 (title, issueDate, totalAmount, items 등)
      - `ParsedQuoteItem` — 품목·수량·단가·금액 타입
    - `src/types/quote.ts` 확정 — QuoteLink와 결합된 공개 견적서 타입

- [ ] **PARSE-002** `src/lib/notion.ts` — Notion 데이터 파싱 함수 구현
  - 담당 레이어: 라이브러리
  - 예상 공수: 2일
  - 의존성: PARSE-001, SETUP-002
  - 상세:
    - `createNotionClient(decryptedToken)` — 사용자별 Notion 클라이언트 생성
    - `fetchQuoteList(client, databaseId)` — DB 쿼리로 견적서 목록 조회 (페이지네이션 지원)
    - `fetchQuotePage(client, pageId)` — 특정 페이지 프로퍼티 + 블록 조회
    - `parseQuoteProperties(page)` — Notion 프로퍼티 → `ParsedQuote` 변환
      - Title 프로퍼티 → `title`
      - Date 프로퍼티 → `issueDate` (ISO 문자열)
      - Number 프로퍼티 → `totalAmount`
      - Select 프로퍼티 → 상태값
    - `parseQuoteBlocks(blocks)` — Notion 블록 → 견적 항목 파싱 (테이블 블록 기준)
    - 파싱 실패 시 기본값 처리 (null 안전성 확보)
  - 테스트: Playwright MCP로 `/api/notion/quotes` 응답에 파싱된 견적서 데이터 포함 여부 확인

- [ ] **PARSE-003** Notion 파싱 유닛 테스트
  - 담당 레이어: 테스트
  - 예상 공수: 1일
  - 의존성: PARSE-002
  - 상세:
    - Notion API 응답 Mock 데이터 작성
    - `parseQuoteProperties` 정상 케이스 / 누락 프로퍼티 케이스 테스트
    - `parseQuoteBlocks` 테이블 파싱 케이스 테스트

---

### Phase 4: 견적서 목록 및 공유 링크 (Week 3~4) — F002, F003

> 목표: 로그인된 사용자가 Notion 견적서 목록을 조회하고 공유 링크를 생성·복사할 수 있음

#### 4-1. 견적서 목록 API

- [ ] **QUOTE-001** `GET /api/notion/quotes` — 견적서 목록 조회 API 구현
  - 담당 레이어: API Route
  - 예상 공수: 1일
  - 의존성: AUTH-004, SETUP-002, PARSE-002
  - 상세:
    - 인증된 사용자의 NotionIntegration 조회 → 없으면 402 (Notion 미연동 상태 안내)
    - `decryptToken(encryptedToken)` 후 Notion 클라이언트 생성
    - `fetchQuoteList` 호출 → `parseQuoteProperties` 적용
    - 각 견적서에 대해 QuoteLink 존재 여부 조회 (slug 포함)
    - TanStack Query 캐싱 지원을 위한 응답 구조 일관성 유지
    - 에러: 500(Notion API 실패) / 402(연동 미설정)
  - 테스트: Playwright MCP로 인증된 사용자의 견적서 목록 응답 구조 확인

- [ ] **QUOTE-002** `POST /api/quote/[slug]` — 공유 링크 생성 API 구현
  - 담당 레이어: API Route
  - 예상 공수: 0.5일
  - 의존성: AUTH-004, SETUP-002
  - 상세:
    - 인증된 사용자 확인
    - 요청 body: `{ notionPageId: string }`
    - QuoteLink 테이블에서 동일 `notionPageId` + `userId` 조합 조회 → 있으면 기존 slug 반환
    - 없으면 UUID v4 slug 생성 후 QuoteLink 레코드 생성
    - 응답: `{ slug, publicUrl }` — `NEXT_PUBLIC_APP_URL/q/[slug]`
  - 테스트: Playwright MCP로 링크 생성 후 반환된 publicUrl 접근 가능 여부 확인

#### 4-2. 견적서 목록 UI

- [ ] **QUOTE-003** `QuoteCard` 컴포넌트 구현
  - 담당 레이어: Frontend
  - 예상 공수: 1일
  - 의존성: PARSE-001
  - 상세:
    - `src/components/dashboard/QuoteCard.tsx` 완성
    - 표시 항목: 견적서 제목, 발행일, 총액, 상태 배지
    - **링크 복사** 버튼 — `POST /api/quote/[slug]` 호출 후 URL 클립보드 복사
    - 복사 완료 시 Sonner 토스트 `"링크가 복사되었습니다"` 표시
    - 버튼 상태: 로딩(생성 중) / 완료(복사됨, 2초 후 초기화)
    - 카드 클릭 시 `/q/[slug]` 새 탭 열기 (미리보기)
  - 테스트: Playwright MCP로 링크 복사 버튼 클릭 → 토스트 알림 표시 확인

- [ ] **QUOTE-004** `QuoteList` 컴포넌트 및 TanStack Query 연동
  - 담당 레이어: Frontend
  - 예상 공수: 1일
  - 의존성: QUOTE-001, QUOTE-003
  - 상세:
    - `src/components/dashboard/QuoteList.tsx` 완성
    - `useQuotes` 훅 — `GET /api/notion/quotes` 조회, staleTime: 5분
    - 로딩 스켈레톤 (Card 스켈레톤 3개)
    - 에러 상태: 에러 메시지 + 재시도 버튼
    - Notion 미연동 상태: "Notion 연동 설정" 링크 안내
    - 수동 새로고침 버튼 (`refetch()` 호출)

- [ ] **QUOTE-005** 내 견적서 목록 페이지 완성
  - 담당 레이어: Frontend
  - 예상 공수: 0.5일
  - 의존성: QUOTE-004
  - 상세:
    - `src/app/(protected)/quotes/page.tsx` — QuoteList 마운트
    - 페이지 제목, 설명 텍스트
    - 헤더 "내 견적서 목록" 링크 활성 상태 표시

---

### Phase 5: 견적서 공개 열람 및 PDF (Week 4~5) — F004, F005, F006

> 목표: 비로그인 클라이언트가 공유 링크로 견적서를 열람하고 PDF 다운로드 가능

#### 5-1. 공개 견적서 API

- [ ] **PUBLIC-001** `GET /api/quote/[slug]` — 공개 견적서 데이터 조회 API 구현
  - 담당 레이어: API Route
  - 예상 공수: 1.5일
  - 의존성: SETUP-002, PARSE-002, SETUP-004
  - 상세:
    - 인증 불필요 (공개 접근)
    - slug로 QuoteLink 조회 → 없으면 404
    - QuoteLink의 userId → 해당 User의 NotionIntegration 조회
    - `decryptToken` 후 Notion 클라이언트 생성
    - `fetchQuotePage(client, notionPageId)` → `parseQuoteProperties` + `parseQuoteBlocks` 적용
    - 응답: `ParsedQuote` 전체 (공급자 정보, 클라이언트 정보, 항목 테이블, 합계)
    - 에러: 404(슬러그 미존재) / 500(Notion API 실패)
  - 테스트: Playwright MCP로 유효/무효 slug 접근 시 견적서 데이터 반환 및 404 응답 확인

#### 5-2. 공개 견적서 UI

- [ ] **PUBLIC-002** `QuoteViewer` 컴포넌트 구현 (핵심)
  - 담당 레이어: Frontend
  - 예상 공수: 2일
  - 의존성: PARSE-001
  - 상세:
    - `src/components/quote/QuoteViewer.tsx` 완성
    - 섹션 구성:
      - 헤더: 견적서 번호, 발행일, 유효기간
      - 공급자 정보 섹션
      - 클라이언트 정보 섹션
      - 견적 항목 테이블 (품목 | 수량 | 단가 | 금액)
      - 소계 / 세금 (10%) / **총액** 합계 섹션
    - 반응형 레이아웃 (모바일·태블릿·데스크톱 대응)
    - Print CSS (`@media print`) — 헤더, PDF 버튼, 내비게이션 숨김

- [ ] **PUBLIC-003** `PdfDownloadButton` 컴포넌트 구현 (F005)
  - 담당 레이어: Frontend
  - 예상 공수: 1일
  - 의존성: PUBLIC-002
  - 상세:
    - `src/components/quote/PdfDownloadButton.tsx` 완성
    - `window.print()` 호출 — Print CSS로 PDF 변환·저장
    - 버튼 클릭 전 `document.title` 임시 변경 (저장 파일명 = 견적서 제목)
    - 인쇄 후 `document.title` 복원
    - 모바일 환경 안내 메시지 (인쇄 지원 여부 체크)

- [ ] **PUBLIC-004** 공개 견적서 열람 페이지 구현 (`/q/[slug]`)
  - 담당 레이어: Frontend
  - 예상 공수: 1일
  - 의존성: PUBLIC-001, PUBLIC-002, PUBLIC-003
  - 상세:
    - `src/app/q/[slug]/page.tsx` — Next.js Server Component
    - 서버사이드에서 `GET /api/quote/[slug]` 호출 또는 직접 DB/Notion 조회
    - 슬러그 미존재 시 `notFound()` 호출 → Next.js 404 페이지
    - QuoteViewer 컴포넌트 + PdfDownloadButton 렌더링
    - 페이지 메타데이터 (title: 견적서 제목, description: 공급자명)
    - 헤더·푸터 없이 견적서만 표시 (별도 레이아웃)
  - 테스트: Playwright MCP로 공유 링크 접근 → 견적서 렌더링, PDF 버튼 동작 확인

- [ ] **PUBLIC-005** 404 에러 페이지 구현
  - 담당 레이어: Frontend
  - 예상 공수: 0.5일
  - 상세:
    - `src/app/q/[slug]/not-found.tsx` — 친절한 404 안내
    - "견적서를 찾을 수 없습니다" 메시지
    - "발행자에게 올바른 링크를 요청하세요" 안내 텍스트

---

### Phase 6: 통합 테스트 및 배포 준비 (Week 5)

> 목표: E2E 사용자 여정 검증, Vercel 배포 설정 완성

#### 6-1. 통합 검증

- [ ] **DEPLOY-001** E2E 사용자 여정 수동 테스트
  - 예상 공수: 1일
  - 상세:
    - 공급자 여정: 회원가입 → Notion 연동 → 견적서 목록 조회 → 링크 복사
    - 클라이언트 여정: 공유 링크 접근 → 견적서 열람 → PDF 다운로드
    - 에러 시나리오: 잘못된 슬러그 접근, 잘못된 Notion 토큰, 이메일 중복 가입

- [ ] **DEPLOY-002** 보안 점검
  - 예상 공수: 0.5일
  - 상세:
    - Notion 토큰이 클라이언트 응답에 절대 포함되지 않는지 확인
    - JWT 쿠키 `httpOnly`, `secure` (프로덕션) 설정 확인
    - API Routes에서 인증 누락 엔드포인트 없는지 재확인
    - `ENCRYPTION_KEY` 환경변수 Vercel 등록 확인

#### 6-2. Vercel 배포

- [ ] **DEPLOY-003** Vercel 환경 변수 등록
  - 예상 공수: 0.25일
  - 상세:
    - `DATABASE_URL` (Vercel Postgres 또는 외부 PostgreSQL)
    - `JWT_SECRET`
    - `ENCRYPTION_KEY`
    - `NEXT_PUBLIC_APP_URL` (배포 도메인)

- [ ] **DEPLOY-004** 프로덕션 빌드 검증
  - 예상 공수: 0.5일
  - 상세:
    - `npm run build` 로컬 빌드 성공 확인
    - TypeScript 타입 에러 0건 확인
    - ESLint 경고 0건 확인
    - Vercel 첫 배포 후 URL 동작 확인

---

## 데이터베이스 스키마 상세

### 스키마 설계 (Prisma 기준)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())

  notionIntegration NotionIntegration?
  quoteLinks        QuoteLink[]
}

model NotionIntegration {
  id             String   @id @default(uuid())
  userId         String   @unique
  encryptedToken String                 // AES-256-GCM 암호화된 Integration Token
  databaseId     String
  updatedAt      DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model QuoteLink {
  id           String   @id @default(uuid())  // 공개 URL용 slug
  userId       String
  notionPageId String
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, notionPageId])             // 동일 페이지 중복 링크 방지
}
```

### 마이그레이션 전략

- `prisma migrate dev` — 개발 환경 마이그레이션
- `prisma migrate deploy` — 프로덕션 배포 마이그레이션 (Vercel Build Command에 포함)

---

## API 엔드포인트 목록

| 메서드 | 경로 | 기능 ID | 인증 | 설명 |
|--------|------|---------|------|------|
| POST | `/api/auth/signup` | F010 | 불필요 | 회원가입 |
| POST | `/api/auth/login` | F010 | 불필요 | 로그인 (JWT 쿠키 발급) |
| POST | `/api/auth/logout` | F010 | 불필요 | 로그아웃 (쿠키 만료) |
| GET | `/api/notion/connect` | F001 | 필요 | 현재 Notion 연동 상태 조회 |
| POST | `/api/notion/connect` | F001, F011 | 필요 | Notion 연동 저장 (토큰 암호화) |
| GET | `/api/notion/quotes` | F002, F006 | 필요 | Notion 견적서 목록 조회 및 파싱 |
| POST | `/api/quote/[slug]` | F003 | 필요 | 공유 링크 생성 (slug는 생성될 UUID) |
| GET | `/api/quote/[slug]` | F004, F006 | 불필요 | 공개 견적서 데이터 조회 |

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
    "code": "NOTION_CONNECTION_FAILED",
    "message": "Notion API 연결에 실패했습니다. 토큰을 확인해 주세요."
  }
}
```

---

## 라우팅 및 페이지 구조

| 경로 | 접근 제어 | 기능 ID | 설명 |
|------|---------|---------|------|
| `/login` | 비로그인 전용 | F010 | 로그인 페이지 |
| `/signup` | 비로그인 전용 | F010 | 회원가입 페이지 |
| `/notion-setup` | 로그인 필수 | F001, F011 | Notion 연동 설정 페이지 |
| `/quotes` | 로그인 필수 | F002, F003, F006 | 내 견적서 목록 페이지 |
| `/settings/notion` | 로그인 필수 | F001, F011 | Notion 재연동 설정 페이지 |
| `/q/[slug]` | 공개 접근 | F004, F005, F006 | 견적서 공개 열람 페이지 |

---

## 🧪 테스트 전략

### Playwright MCP 테스트 원칙
- API 연동 태스크 완료 후 반드시 Playwright MCP로 엔드포인트 동작 검증
- 비즈니스 로직 구현 완료 후 반드시 UI 흐름 및 에러 케이스 검증
- 각 Phase 완료 시 해당 Phase 전체 기능을 Playwright로 회귀 테스트

### 테스트 체크리스트 (Phase별 적용)
- [ ] 정상 케이스 (Happy Path) 동작 확인
- [ ] 에러 케이스 (잘못된 입력, 존재하지 않는 리소스 등) 확인
- [ ] 로딩/비동기 상태 처리 확인
- [ ] 인증 필요 페이지의 리디렉션 동작 확인 (해당 시)

### Phase별 Playwright 핵심 시나리오

#### Phase 1 (인증)
- 회원가입 → 로그인 → 로그아웃 전체 흐름
- 비로그인 상태에서 `/quotes` 접근 시 `/login` 리디렉션

#### Phase 2 (Notion 연동)
- 유효한 Notion 토큰 입력 → 연동 테스트 성공 → 저장 → `/quotes` 리디렉션
- 무효 토큰 입력 → 에러 메시지 표시

#### Phase 3~4 (견적서 목록)
- 연동된 계정으로 견적서 목록 조회 → 카드 렌더링
- 링크 복사 버튼 → 토스트 알림 표시

#### Phase 5 (공개 열람)
- 공유 링크 접근 → 견적서 전체 렌더링
- PDF 다운로드 버튼 동작
- 잘못된 slug → 404 페이지 표시

---

## 리스크 및 의존성

| 리스크 | 심각도 | 완화 전략 |
|--------|--------|---------|
| Notion API 응답 구조 변경 | 중 | 파싱 로직을 `src/lib/notion.ts`에 집중화, 타입 체크 강화 |
| Notion API Rate Limit (초당 3회) | 중 | TanStack Query staleTime 설정으로 불필요한 재요청 방지, 에러 시 재시도 backoff |
| `window.print()` PDF 품질 | 중 | Print CSS 최적화, 브라우저별 인쇄 미리보기 테스트 (Chrome, Safari, Firefox) |
| PostgreSQL 연결 (Vercel 환경) | 저 | Vercel Postgres 또는 Neon, Supabase 등 서버리스 호환 DB 사용 |
| Notion 토큰 탈취 (암호화 키 유출) | 고 | `ENCRYPTION_KEY` Vercel 환경변수로만 관리, 코드에 하드코딩 금지, Git 커밋 방지 |
| 비로그인 사용자의 보호 페이지 접근 | 저 | `src/middleware.ts`에서 JWT 검증 후 리디렉션, 서버사이드 이중 검증 |

---

## 개발 규칙 및 컨벤션

### 파일 네이밍

| 구분 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 | PascalCase | `QuoteViewer.tsx`, `PdfDownloadButton.tsx` |
| 유틸·훅·라이브러리 | camelCase / kebab-case | `useQuotes.ts`, `notion-setup-form.tsx` |
| API Route | Next.js 관례 | `route.ts` |
| 타입 파일 | kebab-case | `quote.ts`, `notion.ts` |

### 코드 규칙

- 주석은 비즈니스 로직에만, 한국어 작성
- 변수명·함수명은 영어 camelCase
- Server Component 기본, 클라이언트 상호작용 필요 시에만 `"use client"` 명시
- API Route에서 try-catch 전역 처리 — 에러 로그 + 표준 에러 응답 반환
- Notion 토큰은 서버사이드 코드에서만 처리, 클라이언트 번들에 절대 포함 금지
- `console.log` 커밋 금지 (개발 중 `console.error`만 허용)

### 환경변수 규칙

- `NEXT_PUBLIC_` 접두사: 클라이언트 번들에 포함 (민감 정보 금지)
- 그 외: 서버사이드 전용 (Notion 토큰, JWT 시크릿, 암호화 키)

---

## Definition of Done

각 태스크 완료 기준:

- [ ] 기능이 PRD 명세대로 동작함
- [ ] TypeScript 타입 에러 없음
- [ ] ESLint 에러 없음
- [ ] 에러 케이스 처리됨 (빈 입력, API 실패, 404 등)
- [ ] 로딩 상태 UI 구현됨 (API 호출 중 스피너/스켈레톤)
- [ ] 반응형 레이아웃 확인 (모바일·데스크톱)
- [ ] Notion 토큰이 클라이언트 응답에 노출되지 않음 (보안 관련 태스크)
- [ ] API 응답 형식이 `ApiResponse<T>` 표준을 준수함
- [ ] API 연동·비즈니스 로직 구현 태스크는 Playwright MCP로 검증 완료

---

## 전체 타임라인 요약

| Phase | 기간 | 주요 산출물 |
|-------|------|------------|
| Phase 0: 셋업 | Week 1 (3일) | DB 스키마, 공통 유틸, 미들웨어 |
| Phase 1: 인증 | Week 1~2 (4일) | 로그인·회원가입 완전 동작 |
| Phase 2: Notion 연동 | Week 2~3 (3일) | 토큰 암호화 저장, 연동 테스트 |
| Phase 3: 데이터 파싱 | Week 3 (3.5일) | Notion 블록 → 구조화 데이터 |
| Phase 4: 견적서 목록 | Week 3~4 (3.5일) | 목록 조회·공유 링크 생성·복사 |
| Phase 5: 공개 열람·PDF | Week 4~5 (5.5일) | 공개 페이지·PDF 다운로드 |
| Phase 6: 배포 | Week 5 (2.25일) | Vercel 배포·E2E 검증 |
| **합계** | **5주 (약 25일)** | **MVP 완성** |

> 버퍼 20% 포함 기준. 단일 개발자 기준 산정.
