# Science daily required

## 목표
- 과학 과목을 일일 필수 학습(Today) 및 관리자 설정(Admin)에 포함
- 월~목 1개 분야(월: 생명, 화: 물리, 수: 화학, 목: 지구), 금요일 서로 다른 2개 안정 분야 배정
- 분야마다 5분 · 10문항, 분야 내 단원 자율 변경 지원
- 기본 8개 과목 목표 유지 및 타이머/제출/대시보드 링 연동

## 완료한 작업
- `learning-budget-policy.js`: `scienceDomains(user, date)` 요일별/해시 배정 및 plan migrate 지원
- `unified-learning.js`: `ensureScience(p)` 일일 과학 과제 추가, 분야 내 단원 선택 검증, 일일 증거 갱신
- `today-flow.js` & `today-journey.js`: 과학 퀴즈/결과 화면 플로우 및 하단 내비게이션 바 연동
- `today.html`: 선택적 과학 카드 대신 정규 학습 일정 및 과제 목록 배치
- `admin.html`: 기본 8과목 안내 문구 보존 및 과학 일일 필수 과제 안내 문구 반영
- `parent-plan-settings.test.js`: 관리자 설정 검증 통과
- `service-worker.js`: 캐시 버전 `smart-study-20261118-science-daily-required` 갱신 및 자산 등록
- 전체 110개 단위/통합 테스트 스위트 전원 통과 확인

## 남은 작업
- PR 생성 및 main 병합
