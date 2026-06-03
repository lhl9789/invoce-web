---
name: project-sdk-datasource-migration
description: Notion SDK 최신 버전은 databases.query 대신 dataSources.query를 사용 (2025-09-03 API 버전 변경)
metadata:
  type: project
---

최신 `@notionhq/client`(API 버전 2025-09-03 이상)는 데이터베이스 쿼리 방식이 바뀌었다.

- 구버전: `notion.databases.query({ database_id })`
- 신버전: `notion.dataSources.query({ data_source_id })`
- 하나의 Notion 데이터베이스는 여러 data source를 가질 수 있고, 쿼리는 data_source_id 단위로 수행된다.
- Client 생성 시 `notionVersion` 옵션으로 버전 고정 가능 (기본값 2025-09-03, 최신 2026-03-11).
- SDK는 기본적으로 자동 재시도(`retry`) 내장. 직접 백오프 구현하려면 `retry: false`로 끄고 처리.

**Why:** 훈련 데이터 기준 databases.query를 쓰면 최신 SDK에서 동작이 달라질 수 있음. Context7 문서로 확인한 사실.
**How to apply:** 이 프로젝트에 Notion 쿼리 코드 작성 시 data_source_id 기반 dataSources.query를 우선 사용하고, 사용자에게 데이터베이스의 data source ID 확인을 안내할 것. 에러 핸들링은 `isNotionClientError` + `APIErrorCode` 타입가드 사용.
