# PROGRESS.md

## 목표
- 2단계: `science-extension-models.js` 생명·지구과학 12개 확장 단원 시각 모형 및 가이드 모션 전면 개편
  1. `lifecycle` (배추흰나비의 한살이)
  2. `germination` (씨가 싹트는 조건)
  3. `flower-seed` (꽃과 열매의 구조)
  4. `body-systems` (우리 몸의 소화와 순환)
  5. `classification` (동물의 분류)
  6. `erosion` (흐르는 물과 지표 변화)
  7. `strata` (지층과 화석)
  8. `earth-interior` (화산과 지진)
  9. `weather-climate` (날씨와 우리 생활)
  10. `moon-seasons` (계절의 변화)
  11. `fair-test` (과학 탐구와 공정한 비교)
  12. `star-sky` (밤하늘의 별과 별자리)
- 교과서급 입체 도해, Every Joule 스타일 실시간 텔레메트리, 고대비 가이드 모션(생장 단계 모핑선, 혈류/소화액 유동선, 침식/퇴적 수류선, 지층 단면, 마그마/단층 응력 벡터) 적용
- 전체 테스트 통과 검증 및 라이브 배포

## 진행 상황
- [x] 생명과학 5개 단원 (`animal-lifecycle`, `plant-lifecycle`, `flower-seed`, `body-systems`, `classification`) 모형 및 가이드 모션 개편
- [x] 지구과학 7개 단원 (`erosion`, `strata`, `earth-interior`, `weather-climate`, `moon-seasons`, `fair-test`, `star-sky`) 모형 및 가이드 모션 개편
- [x] 단위 테스트 및 회귀 테스트 검증 통과 (32개 단원, 78개 레슨, 86개 조건)
- [x] 서비스 워커 캐시 갱신 (`smart-study-20261118-life-earth`)
- [ ] PROGRESS.md 삭제 후 PR 생성 및 병합
