---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hist: [message]
description: git 커밋 생성
model: claude-sonnet-4-6
---
커밋 메시지: $ARGUMENTS
현재 변경사항을 분석하고 커밋을 생성해주세요.