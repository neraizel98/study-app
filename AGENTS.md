# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Project: 스마트 학습 앱

- 영어·한자·수학·국어 학습 PWA. 정적 HTML/JS (빌드 없음), `service-worker.js`로 오프라인 지원.
- 데이터 동기화: Firebase (`firebase-sync.js`).
- 테스트: `tests/*.cjs` (`node tests/<name>.cjs`로 개별 실행).
- 기능별 설계 문서는 루트의 대문자 `*.md` 파일을 먼저 확인.

## Multi-agent collaboration

이 저장소는 Codex, Claude Code, Antigravity가 함께 작업한다. 이 파일이 공통 지침의 원본이며, `CLAUDE.md`·`GEMINI.md`는 이 파일을 가져오기만 한다.

- 작업 시작 전 `git pull`로 최신 `main`을 받는다.
- `main`에 직접 커밋하지 않는다. `agent/<작업명>` 브랜치에서 작업하고 PR로 합친다.
- 다른 도구가 작업 중인 브랜치·파일을 동시에 수정하지 않는다.
- 공통 규칙 변경은 이 파일(`AGENTS.md`)에서만 한다.
