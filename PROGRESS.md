# PROGRESS.md

## 목표
1. 일러스트(수채화 도감) 퀄리티에 걸맞은 고급 물리 도해 및 부드러운 동적 벡터 그래픽으로 전면 개편 (유치한 원색 도형/화살표 제거, Every Joule 수준의 정밀한 압력구·등응력선·유체역학 파동 및 해부학 단면 구현)
2. 재생 배속 선택 기능 추가 (0.5x / 1.0x / 2.0x, 기본값 1.0x) 및 지나치게 느렸던 기본 재생 속도 최적화 (18초 -> 자연스러운 3.2초 주기)

## 세부 구현 항목
- [x] `science-app.js`: 배속 선택 컨트롤(0.5x / 1.0x / 2.0x, 기본값 1.0x) 추가 및 자연스러운 주기 시간(기본 3.2초) 적용
- [x] `science.css`: 배속 선택 버튼 그룹 스타일 추가
- [x] `science-extension-models.js`:
  - 낙타: 원색 스티커 화살표/타원 제거 -> 정밀한 토질역학 압력구(Boussinesq Bulb of Pressure) 등응력선, 미세 분산 압력선, 해부학적 탄성 지방 패드 압축/팽창, 정밀 치수선(22cm contact bracket), 단면도 Boussinesq 응력 분포 및 침하 깊이 비교 시각화
  - 오리: 투박한 주황색 다각형 제거 -> 정밀 유체역학 스트림라인, 카르만 소용돌이 후류, 전진 추력 벡터(+18.5 N), 단면도 동압 정체면(Stagnation pressure) 및 회수 시 유체 항력 최소화(1.1 N)
  - 펭귄: 투박한 타원 제거 -> 유선형 층류 흐름선(Cd ≈ 0.03), 미세 깃털 단열 경계층, 4중 단열층 열역학 등온선 및 정밀 온도 구배(Temperature Gradient) 곡선
- [x] 테스트 스위트 전체 통과 (science-media, science-content, science-integration, architecture-boundaries)

## 남은 일
- PROGRESS.md 삭제 후 PR 병합
- 라이브 배포 확인
