# PROGRESS: 과학 시각화 고도화 (1단계 완료 / 2단계 준비)

## 목표
- 1단계: 32개 단원 핵심 인터랙티브 SVG 도식의 시각적 퀄리티(크림색 종이 질감, 잉크 라인, 부드러운 그라디언트, 명확한 음영) 대폭 향상
- 2단계: Three.js 3D 모형 확장 (`moon-seasons` 달의 위상 및 공전 궤도 입체화)
- 3단계: 인터랙티브 타임라인 조작 UI(스크러버 슬라이더) 도입

## 완료한 일
- [x] 최신 `origin/main` 동기화 (`git pull`)
- [x] 작업 브랜치 `agent/science-visual-stage1-svg` 생성 및 계획 수립
- [x] `science-models.js` 기본 8개 핵심 도식(식물 물 이동, 생태계 먹이망, 힘과 마찰, 열과 온도, 상태 변화, 혼합물 분리, 물의 순환, 지구 운동) 일러스트 퀄리티 및 디테일 강화
  - 크림색 종이 배경 그라디언트, 부드러운 그림자 필터(`softShadow`), 비커 유리 반사 및 메니스커스 수면 표현
  - 가독성 높은 라벨 뱃지 및 모바일(390px) 텍스트 겹침 방지
- [x] `science-extension-models.js` 25개 확장 도식(동물 적응, 한살이, 식물 생장, 꽃과 씨, 인체 소화/호흡/순환계, 세포 분류, 자석/자기장, 소리 파형, 광학 반사/굴절, 전기 회로, 에너지 전환, 용수철 그래프, 재료, 용해, 기체 압축, 지시약, 연소, 입자 모형, 침식/퇴적, 지층/화석, 화산/단층, 해륙풍/기후, 달의 위상, 공정한 탐구, 별자리) 디테일 및 텍스처 전면 고도화
- [x] 과학 전체 회귀 테스트 통과:
  - `science-media.test.js` (86 unique conditions pass)
  - `science-content.test.js` (pass 3)
  - `science-integration.test.js` (pass 5)
  - `science-physical-expansion.test.js` (pass 5)
  - `science-life-earth-review.test.js` (pass 2)
  - `science-lab.test.js` (pass 2)
  - `mock25-science-integration.test.js` (pass 2)
  - `science-mock25-supply.test.js` (pass 1)
  - `science-authored-mock-integration.test.js` (pass 1)
  - `science-expanded-mock-integration.test.js` (pass 1)

## 남은 일
- [ ] 2단계: `moon-seasons` 단원의 Three.js 3D 렌더러 구현 및 SVG 폴백 연동
- [ ] 3단계: 과학 학습 화면에 인터랙티브 타임라인 스크러버(재생/일시정지/0~100% 드래그) UI 연결

## 주의할 점
- `ScienceModels.render` 및 `ScienceExtensionModels.render`의 반환 형태(`sceneTitle`, `controls`, `steps`, `svg`, `caption`, `legends`) 계약 불변 유지 완료
- 외부 라이브러리 추가 없이 순수 인라인 SVG + CSS로 오프라인 PWA 100% 호환 보장 완료
