# PROGRESS.md

## 목표
1. 과학 UI 전반의 폰트 사이즈 및 컴포넌트 스케일을 타 과목(국어·영어·수학·모의고사) 표준 UI 스타일(14~20px 기준)로 일원화
2. 낙타 발 하단의 단순 타원(ellipse) 및 모래색 보호색 제거 -> 해부학적 2엽 구조(발가락 패드+후방 탄성 지방 쿠션) 및 고대비 유한요소/토질역학 Boussinesq 등응력선(Luminous Isobar Bulbs) 고품질 시각화로 전면 교체
3. 모래 침하/지지 메커니즘을 명확히 인지할 수 있도록 모래 표면 융기 림(Sand Displacement Berms) 및 응력 벡터 시각 효과 강화

## 세부 작업
- [x] `science.css`: 폰트 크기 및 여백 스케일 전면 최적화 (h1 42px -> 26px, lesson question 23px -> 18px, svg text 17px -> 12px, 버튼 및 컨트롤 컴팩트화 min-height 38px)
- [x] `science-extension-models.js`: 낙타 발바닥 동적 메커니즘을 단순 타원에서 실제 낙타 발 해부학적 2엽 패드(Dual-Lobe Digital Cushion) 및 고대비 발광 등응력선(Luminous Isobars)으로 전면 리빌딩
- [x] 테스트 스위트 전체 통과 (science-media, science-content, science-integration, architecture-boundaries)

## 남은 일
- PROGRESS.md 삭제 후 PR 병합 및 배포 확인
