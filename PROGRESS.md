# PROGRESS.md

## 목표
- 과학 과목 전체 시각 모형 중 "정지된 고품질 삽화로 설명할 단원"의 조악한 기하학 도형을 전면 제거하고 실제 교과서급 정밀 일러스트레이션(WebP) + 정밀 라벨 핀/인터랙티브 오버레이로 전면 개편
- 1단계 대상:
  1. `body-systems` (우리 몸의 소화계, 순환계, 호흡계)
  2. `flower-seed` (꽃의 단면 구조, 열매와 씨앗 결실 단면, 씨앗 퍼짐)
- 2단계 대상:
  3. `animal-lifecycle` (배추흰나비 한살이, 개구리 한살이)
  4. `plant-lifecycle` (강낭콩 씨앗 구조 및 싹트는 과정)
  5. `classification` (원생생물 표본, 동물·식물 세포 단면 비교)
  6. `strata` (지층 퇴적 노두 및 3대 지질 시대 표준 화석 표본)
  7. `earth-interior` (화산 구조 단면 및 지진 단층 블록 다이어그램)

## 진행 상황
- [x] 고화질 교과서 일러스트 10종 생성 및 WebP 최적화 배치 (`assets/science/*.webp`)
- [x] `body-systems` 모형 교체 (소화계·순환계·호흡계 정밀 해부도 + 기관별 번호 핀 및 Step 1 심화 단면)
- [x] `flower-seed` 모형 교체 (꽃·열매 세밀화 + 씨방/밑씨/과육 라벨 핀 및 Step 1 결실 전환 단면)
- [x] `animal-lifecycle`, `plant-lifecycle`, `strata`, `earth-interior` 모형 고화질 삽화 연동 및 Step 1 단면 완성
- [x] 단위 테스트 및 회귀 테스트 검증 통과 (32개 단원, 78개 레슨 바인딩, 86개 조건 렌더 전부 통과)
- [x] 서비스 워커 캐시 갱신 (`smart-study-20261118-textbook-art`) 및 `science.html` 버전 태그 갱신
- [x] PR 병합 준비
