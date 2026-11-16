# PROGRESS.md

## 목표
Every Joule 스타일의 인터랙티브 물리 동작 시뮬레이션 및 실시간 수치 HUD, 단계별 설명 구현 (`animal-adaptation`)

## 세부 구현 항목
- [x] **낙타 (사막의 낙타)**:
  - **전체 관찰 (Step 0)**:
    - 재생 / 슬라이더 연동 3단계 보행 주기 (1. 접지 -> 2. 하중 재하 및 패드 팽창 -> 3. 모래 반작용 지탱).
    - 체중 벡터, 발바닥 탄성 쿠션 패드의 탄성 변형(면적 $A$ 실시간 팽창), 방사형 분산 압력 벡터 동적 펄스.
    - 실시간 Every Joule HUD: 현재 단계 설명 배너, 실시간 하중 $F$, 접촉면적 $A$, 지면 압력 $P = F / A$, 모래 지지 상태.
  - **원리 비교 / 확대·단면 (Step 1)**:
    - 좁은 발(말굽) vs 낙타의 넓은 쿠션 발바닥 실시간 모래 침하 대조 시뮬레이션.
    - 시간 슬라이더에 따라 좁은 발은 모래를 깊게 파고들며(침하 $15\text{cm}$) 붉은 전단파열 압력 집중.
    - 낙타 발은 쿠션이 좌우로 퍼지며 표면에서 지지(침하 $1.2\text{cm}$)되는 실시간 애니메이션.
    - 실시간 수치 비교 계측기(압력 게이지 바, 침하 깊이 바, 물리 공식 $P = F/A$ 동적 하이라이트).
- [x] **오리 (연못의 오리)**:
  - **전체 관찰 (Step 0)**:
    - 2단계 주기: 추진 스트로크(물갈퀴 활짝 펼쳐 물을 후방으로 강하게 밀어냄, 추력 발생) $\leftrightarrow$ 회수 스트로크(물갈퀴 오므려 전진 저항 최소화).
    - 유체 흐름선(스트림라인) 및 추력/항력 벡터 동적 반응.
    - 실시간 HUD: 스트로크 상태(추진 vs 회수), 물갈퀴 표면적, 유체 저항/추진력 게이지.
  - **확대·단면 (Step 1)**:
    - 물갈퀴 피막의 수압 단면 동적 시뮬레이션: 펼침 각도에 따른 작용-반작용 수압 벡터 크기 변화.
- [x] **펭귄 (극지의 펭귄)**:
  - **전체 관찰 (Step 0)**:
    - 수중/극지 유선형 체형 통과 유체 스트림라인 동적 애니메이션.
    - 체온 앰버 열에너지 펄스 및 외부 냉기 차단 인터랙션.
  - **확대·단면 (Step 1)**:
    - 4중 단열층(외피 깃털 -> 포집된 공기층 -> 피하지방층 -> 심부 체온)의 동적 열역학 구배.
    - 외부 한랭 기류(-30℃) 침투 차단 파티클 및 내부 체온(+38℃) 보온 배리어 펄스, 열전도 차단율(85.4%) 실시간 게이지.
- [x] 관련 테스트 전체 통과 확인:
  - `science-media.test.js`
  - `science-content.test.js`
  - `science-integration.test.js`
  - `science-physical-expansion.test.js`
  - `science-life-earth-review.test.js`
  - `science-lab.test.js`
  - `mock25-science-integration.test.js`
  - `science-mock25-supply.test.js`
  - `science-authored-mock-integration.test.js`
  - `science-expanded-mock-integration.test.js`
  - `architecture-boundaries.test.js`

## 남은 일
- [ ] 중간 커밋 생성
- [ ] 브라우저/사용자 검토 준비
- [ ] 병합 전 `PROGRESS.md` 삭제 및 PR 머지
