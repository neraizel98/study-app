# PROGRESS: Every Joule 스타일 과학 시각화 고도화 (1단계: 동물 적응 완료)

## 목표
- Every Joule (`iamtechartist.com/every-joule`) 스타일을 벤치마킹하여, 동물 적응 단원(`animal-adaptation`: 낙타, 오리, 펭귄)의 투박한 기하학 선화를 고해상도 교과서 일러스트 에셋(WebP)과 발광 물리/에너지 벡터 오버레이로 전면 개편.

## 완료한 일
- [x] Every Joule 디자인 분석 및 비교 기획안 수립
- [x] 작업 브랜치 `agent/science-every-joule-visuals` 생성
- [x] 낙타, 오리, 펭귄 고품질 자연사 교과서 일러스트 에셋 생성
- [x] `assets/science/` 디렉터리에 WebP 경량화 최적화 변환
  - `camel-desert.webp` (70KB)
  - `duck-pond.webp` (133KB)
  - `penguin-polar.webp` (46KB)
- [x] `science-extension-models.js`의 `animal-adaptation` 모형을 Every Joule 스타일로 전면 재구현
  - 오리: 고해상도 일러스트 플레이트 + 발광 청록 유체 추진력 벡터 + 물갈퀴 단면 구조도
  - 낙타: 사막 일러스트 플레이트 + 발광 압력 분산 벡터($P = F / A$) + 좁은 발(말굽 침하) vs 넓은 발(지지) 비교 단면도
  - 펭귄: 극지 일러스트 플레이트 + 유선형 공기역학 흐름선 및 체온 유지 발광 단열층 + 깃털 공기 단열 단면도
- [x] `service-worker.js` 오프라인 캐시 등록 (`assets/science/*.webp`)
- [x] 테스트 전수 검증 통과:
  - `node science-media.test.js` (86개 조건 통과)
  - `node science-content.test.js`, `science-integration.test.js`, `science-lab.test.js` 통과
  - `node science-physical-expansion.test.js`, `science-life-earth-review.test.js` 통과
  - `node mock25-science-integration.test.js`, `science-mock25-supply.test.js` 통과
  - `node architecture-boundaries.test.js` 통과

## 남은 일
- [ ] 2단계: 핵심 물리 단원(`l1-physics-force`, `l1-physics-heat`, `l1-physics-energy` 등)에 Every Joule식 Three.js 3D 에너지/물리 시뮬레이션 적용

## 주의할 점
- `PROGRESS.md`는 `main` 브랜치 병합 전 삭제 (`AGENTS.md` 지침 준수)
