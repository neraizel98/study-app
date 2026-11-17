# PROGRESS.md

## 목표
- 1. 화면 레이아웃 변경: 메인인 인터랙티브 이미지 패널과 설명 부분을 가로로 넓게 쓸 수 있도록 단일 열 수직 스택으로 전환
- 2. 설명 카드(2번 이미지) 하단 배치: `.science-visual-panel` 아래로 `.science-lesson-copy`를 이동하고, 질문(Q 배지)·본문·원리 심화 카드로 UI 스타일 퀄리티업
- 3. 상단 헤더 텍스트(3번 이미지) UI 스타일 개선:
  - `← 단원 바꾸기`: 라운드 필 버튼 스타일
  - `unitContext`: `Level 1` 배지와 구분자가 적용된 브레드크럼 UI
  - `unitTitle`: 선명하고 고급스러운 타이포그래피
  - `unitGoal`: 기존의 날것 슬래시(`/`) 구분 텍스트를 깔끔한 체크마크 목표 칩(`✓ 목표`) UI로 전환
  - `scienceLessons`: 단원 내 장면 전환 탭을 일체형 세그먼트 컨트롤 바 스타일로 퀄리티업
- 4. 캐시 버전 갱신(`20261117-layout-refresh`) 및 테스트 검증, PR 병합 및 배포

## 진행 상황
- [x] 요구사항 분석 및 기존 스타일/테스트 영향도 확인
- [x] `science.css` 레이아웃 및 텍스트/탭/카드 스타일 개선
- [x] `science-app.js` 브레드크럼 및 학습 목표 칩 렌더링 개선
- [x] `science.html` 및 `service-worker.js` 캐시 버전 갱신
- [x] 전체 과학 및 모의고사 테스트 스위트 검증 완료
- [ ] PROGRESS.md 삭제 후 PR 생성, 병합 및 GitHub Pages 배포 확인
