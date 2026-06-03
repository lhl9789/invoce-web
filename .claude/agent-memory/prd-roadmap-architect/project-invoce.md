---
name: project-invoce
description: Invoce 프로젝트 핵심 컨텍스트 — Notion 기반 견적서 공유 서비스 MVP
metadata:
  type: project
---

Invoce는 Next.js 16 (App Router) 풀스택 프로젝트로, PRD와 ROADMAP.md가 `docs/` 디렉토리에 있다.

**핵심 아키텍처 결정사항:**
- 인증: jose (JWT) + bcryptjs, httpOnly 쿠키 기반 세션
- ORM: Prisma (PostgreSQL) 권장 — `src/lib/db.ts` 싱글톤 패턴
- Notion 토큰 암호화: AES-256-GCM, `ENCRYPTION_KEY` 환경변수 기반
- PDF: `window.print()` + Print CSS (별도 라이브러리 없음)
- 공개 URL 구조: `/q/[slug]` (UUID 슬러그)

**DB 모델 3개:** User, NotionIntegration (encryptedToken), QuoteLink (slug = UUID)

**기능 ID 매핑:**
- F001/F011: Notion 연동 + 토큰 암호화 (`/notion-setup`)
- F002/F003/F006: 견적서 목록 + 공유 링크 (`/quotes`)
- F004/F005/F006: 공개 열람 + PDF (`/q/[slug]`)
- F010: 인증 (`/login`, `/signup`)

**Why:** PRD 작성 완료, ROADMAP.md 생성 완료 (2026-06-04). MVP 5주 일정.

**How to apply:** 새 기능 구현 시 위 기능 ID로 PRD 요구사항 추적, 보안 체크리스트(토큰 노출 여부) 항상 확인.
