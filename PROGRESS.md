# PROGRESS: 과학 시각화 고도화 (1·2·3단계 구현 완료)

## 목표
- 1단계: 32개 단원 핵심 인터랙티브 SVG 도식의 시각적 퀄리티(크림색 종이 질감, 잉크 라인, 부드러운 그라디언트, 명확한 음영) 대폭 향상
- 2단계: Three.js 3D 모형 확장 (`moon-seasons` 달의 위상 및 사계절 공전 궤도 입체화)
- 3단계: 인터랙티브 타임라인 조작 UI(스크러버 슬라이더) 도입

## 완료한 일
- [x] 최신 `origin/main` 동기화 (`git pull`)
- [x] 작업 브랜치 `agent/science-visual-stage1-svg` 생성 및 계획 수립
- [x] **1단계: SVG 도식 디테일 & 텍스처 전면 고도화**
  - `science-models.js` 기본 8개 핵심 도식(식물 물 이동, 생태계 먹이망, 힘과 마찰, 열과 온도, 상태 변화, 혼합물 분리, 물의 순환, 지구 운동) 일러스트 퀄리티 및 디테일 강화
  - 크림색 종이 배경 그라디언트, 부드러운 그림자 필터(`softShadow`), 비커 유리 반사 및 메니스커스 수면 표현
  - 가독성 높은 라벨 뱃지 및 모바일(390px) 텍스트 겹침 방지
  - `science-extension-models.js` 25개 확장 도식(동물 적응, 한살이, 식물 생장, 꽃과 씨, 인체 소화/호흡/순환계, 세포 분류, 자석/자기장, 소리 파형, 광학 반사/굴절, 전기 회로, 에너지 전환, 용수철 그래프, 재료, 용해, 기체 압축, 지시약, 연소, 입자 모형, 침식/퇴적, 지층/화석, 화산/단층, 해륙풍/기후, 달의 위상, 공정한 탐구, 별자리) 디테일 및 텍스처 전면 고도화
  - 커밋 완료 (`ed11e96`)
- [x] **2단계: Three.js 3D 모형 확장 (`moon-seasons`)**
  - `science-moon-three.js` 구현: Three.js r187 기반 달의 공전·위상 변화(조건 0) 및 지구 23.5° 자전축 기울기와 사계절 공전 궤도(조건 1) 3D 씬 구현
  - 캔버스 텍스처 프로그래밍 생성 (절차적 지구 대륙/해양/구름 및 달 바다/크레이터 텍스처, 태양광 글로우)
  - 관찰자 시점 달 위상 프리뷰 뱃지 및 궤도 라벨 오버레이 지원
  - SVG 안전 폴백 지원: WebGL 컨텍스트 유실 또는 조건 2~3 / 상세 원리(step 1)에서는 고품질 SVG로 자동 전환
  - `science-app.js` 렌더러 어댑터 연동 및 동적 설명 라벨 갱신
  - `science.html` 스크립트 태그 등록
- [x] **3단계: 인터랙티브 타임라인 스크러버(재생/일시정지 외 원하는 시점 드래그 조작 UI) 도입**
  - `science.css`에 `.science-timeline-wrap`, `.science-timeline-slider` 반응형 스타일 추가
  - `science-app.js` `renderControls()` 내 재생/일시정지, 초기화 버튼과 나란히 동작하는 시간 제어 range 슬라이더 마운트
  - `loop(now)` 애니메이션 루프 중 슬라이더 위치 자동 동기화 및 유저 드래그 시 즉각 일시정지 & 원하는 시점(0~100%) 탐구 가능
- [x] **오프라인 및 회귀 안전성 확보**
  - `service-worker.js` 캐시 목록에 `science-moon-three.js` 추가 및 캐시 무결성 유지
  - `tests/science-media-browser.cjs` 셀렉터 유연화 (`#scienceScene svg, #scienceScene canvas`)
- [x] **검증 테스트 전체 통과 (0 실패)**:
  - `node science-media.test.js` (86 unique conditions pass)
  - `node science-content.test.js` (pass 3)
  - `node science-integration.test.js` (pass 5)
  - `node science-physical-expansion.test.js` (pass 5)
  - `node science-life-earth-review.test.js` (pass 2)
  - `node science-lab.test.js` (pass 2)
  - `node mock25-science-integration.test.js` (pass 2)
  - `node science-mock25-supply.test.js` (pass 1)
  - `node science-authored-mock-integration.test.js` (pass 1)
  - `node science-expanded-mock-integration.test.js` (pass 1)
  - `node architecture-boundaries.test.js` (Architecture boundaries verified)
  - 전체 루트 단위 테스트 슈트 (총 70여 개 테스트 파일 전수 통과)

## 남은 일
- [ ] 사용자 보고 및 변경 사항 최종 확인 후 PR / 머지 준비

## 주의할 점
- `PROGRESS.md`는 `main` 브랜치 병합 전 삭제할 것 (`AGENTS.md` 지침 준수)
- 32개 단원 계약(단원 ID, 문항 수, 모의고사 공급) 및 무빌드 정적 PWA 구조 100% 보존
