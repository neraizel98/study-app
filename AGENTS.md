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

## Multi-agent workflow

사용자 요청은 아래 흐름으로 처리한다. 분배·통합·최종 검증은 오케스트레이터(기본: Claude Code)가 맡는다.

### 분담 기준

- 파일 1~2개 수준의 작은 요청: 에이전트 하나가 처리하고, 다른 에이전트가 검수만 한다.
- 독립적으로 나눌 수 있는 큰 요청만 여러 에이전트에 분담한다.
- 배정 기준:
  - Antigravity: 퀴즈·단어 데이터 추가, 문구 수정, 단순 UI 수정
  - Codex: 범위가 명확한 기능 추가, 버그 수정
  - Claude Code: Firebase 동기화·저장 구조, 여러 화면에 걸친 수정, 원인 불명 버그, 통합
- 공용 파일(`main.js`, `firebase-sync.js`, `styles.css` 등)은 한 에이전트에만 배정해 동시 수정을 피한다.

### 진행 순서

1. 분석·분배: 작업을 나누고 배정 계획을 사용자에게 보여 승인받는다.
2. 구현: 에이전트별 워크트리·`agent/<작업명>` 브랜치에서 병렬 작업한다.
3. 개별 검증: 각 브랜치에서 관련 `tests/*.cjs`를 실행한다.
4. 통합: 하나의 통합 브랜치로 합치고 충돌을 해결한다.
5. 교차 검수: 구현하지 않은 다른 에이전트가 코드를 리뷰한다.
6. 최종 검증: 전체 관련 테스트와 실제 화면(브라우저)을 확인한다.
7. 보고 후 병합: 검증 결과를 사용자에게 보고하고, 최종 확인이 끝나면 오케스트레이터가 PR을 `main`에 병합한다. 테스트 실패나 미검증 항목이 있으면 병합하지 않고 보고한다.

Firebase 실제 동기화·모바일 동작처럼 자동 검증할 수 없는 항목은 보고에 명시하고 사용자 확인을 요청한다.

### 토큰·사용 한도 소진 시

- 작업 중인 에이전트의 토큰·사용 한도가 소진되면 임의로 다른 에이전트로 넘기지 않는다.
- 진행 상황(완료된 부분, 남은 작업, 브랜치)을 정리해 사용자에게 보고하고, 어느 에이전트로 이어서 진행할지 묻는다.
- 사용자가 고른 에이전트가 같은 브랜치에서 남은 작업을 이어받는다.

### 작업 인계 대비

언제든 토큰 소진 등으로 중단될 수 있으므로, 다른 에이전트가 바로 이어받을 수 있게 작업한다.

- 작업 단위 하나가 끝날 때마다 작업 브랜치에 중간 커밋한다. 테스트가 아직 통과하지 않은 상태면 커밋 메시지 앞에 `WIP:`를 붙인다.
- 작업 브랜치 루트에 `PROGRESS.md`를 두고 커밋할 때마다 갱신한다: 목표, 완료한 일, 남은 일, 주의할 점(시도했다 실패한 방법 포함).
- 이어받는 에이전트는 `PROGRESS.md`와 `git log`·`git diff`를 먼저 읽고 시작한다.
- `PROGRESS.md`는 `main`에 병합하기 전에 삭제한다.
