# PROGRESS.md

## 목표
- 1단계: `science-models.js` 핵심 8개 단원 시각 모형 및 가이드 모션 전면 개편
  - `plant` (식물의 몸과 물의 이동)
  - `ecosystem` (먹이 관계와 생태계)
  - `force` (힘과 물체의 움직임)
  - `heat` (온도와 열의 이동)
  - `states` (물의 상태 변화)
  - `mixtures` (혼합물과 분리)
  - `orbit` (지구와 태양의 움직임)
  - `water-cycle` (물의 순환과 날씨)
- 교과서급 입체 도해, Every Joule 스타일 실시간 텔레메트리, 고대비 가이드 모션(CFD 수류선, 열전도 파동, 분자 운동 격자, 마찰 벡터) 적용
- 전체 테스트 통과 검증 및 라이브 배포

## 진행 상황
- [x] `science-models.js` 공통 `<defs>` 마커 및 그라디언트 보강
- [x] `plant`, `ecosystem` 모형 및 가이드 모션 개편
- [x] `force`, `heat` 모형 및 가이드 모션 개편
- [x] `states`, `mixtures` 모형 및 가이드 모션 개편
- [x] `orbit`, `water-cycle` 모형 및 가이드 모션 개편
- [x] 과학 5대 테스트 스위트 및 모의고사 4대 무결성 검증 통과
- [ ] PROGRESS.md 삭제 후 PR 생성 및 병합

## 다음 작업 (2단계 & 3단계)
- 2단계: `science-extension-models.js` 생명·지구 12개 단원 개편
- 3단계: `science-extension-models.js` 물질·에너지 12개 단원 개편
