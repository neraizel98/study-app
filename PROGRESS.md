# PROGRESS: Every Joule 스타일 과학 시각화 고도화

## 목표
- Every Joule (`iamtechartist.com/every-joule`) 스타일을 벤치마킹하여, 과학 도식을 고해상도 교과서 일러스트 에셋(WebP)과 발광 물리/에너지 벡터 오버레이, 에너지 보존 Sankey 다이어그램으로 전면 개편.

## 완료한 일
- [x] Every Joule 디자인 분석 및 비교 기획안 수립
- [x] 작업 브랜치 `agent/science-every-joule-visuals` 생성
- [x] **동물 적응 (`animal-adaptation`) 일러스트 에셋 및 Every Joule 인터랙션 완료**:
  - `assets/science/camel-desert.webp` (낙타 사막 일러스트, 70KB)
  - `assets/science/duck-pond.webp` (오리 연못 일러스트, 133KB)
  - `assets/science/penguin-polar.webp` (펭귄 극지 일러스트, 46KB)
  - 낙타: 발광 압력 분산 벡터($P = F / A$) 및 [좁은 발 침하 vs 넓은 발 지지] 비교 단면도
  - 오리: 발광 청록 유체 추진력 벡터 및 물갈퀴 단면 구조도
  - 펭귄: 유선형 공기역학 흐름선 및 체온 유지 발광 단열층, 깃털 공기 단열 단면도
- [x] **에너지 전환 (`energy-transfer`) Every Joule 스타일 시뮬레이션 완료**:
  - 공급원(발전기/전지/태양전지) → 전기 에너지 발광 흐름선(움직이는 파티클 펄스) → 변환 장치(전구/모터) 및 손실 열에너지 분기 방출
  - 상세 보기(Step 1): Every Joule 시그니처 에너지 보존 법칙(Sankey 다이어그램, 100 Joule 입력 = 유용 에너지 + 열손실)
- [x] `service-worker.js` 오프라인 캐시 등록 (`assets/science/*.webp`)
- [x] 과학 단위 테스트 슈트 전수 통과:
  - `node science-media.test.js` (86개 도식 조건 검증 통과)
  - `node science-content.test.js`, `science-integration.test.js`, `science-lab.test.js` 통과
  - `node science-physical-expansion.test.js`, `science-life-earth-review.test.js` 통과
  - `node mock25-science-integration.test.js`, `science-mock25-supply.test.js` 통과
  - `node architecture-boundaries.test.js` 통과

## 남은 일
- [ ] 사용자 피드백 확인 후 원격 브랜치 푸시 및 PR 생성/배포 준비

## 주의할 점
- `PROGRESS.md`는 `main` 브랜치 병합 전 삭제 (`AGENTS.md` 지침 준수)
