# 지구·태양·은하 Three.js 적용 최소 설계

2026-11-13. 설계 Astra / 구현 Sol. 적용 범위는 `l1-earth-motion`의 `sceneId:'orbit'` 모형뿐이다. 기존 640문항, quiz policy, 보고서·저장 스키마, 55/75 모의고사 계약은 변경하지 않는다. 영상은 학습 화면의 실시간 3D 모션을 뜻하며 별도 MP4 제작·내보내기는 이번 범위에 넣지 않는다.

## 의존성

사용자 지정 원본은 `gh repo clone mrdoob/three.js`이다. root가 r187 공식 clone/build를 준비 중이다. 실제 checkout 태그/commit과 빌드 산출물을 확인한 뒤 해당 버전으로 고정한다. r187 설치 완료를 이 문서만으로 주장하지 않는다.

- 배포는 필요한 ESM build만 `vendor/three/`에 복사하여 동일 origin에서 로드한다. 원본 LICENSE와 버전·commit·출처 기록을 함께 보존한다.
- ESM의 상대 import 대상까지 복사한다. `three.module.js` 하나만 가져오고 내부 참조 파일을 누락하지 않는다. addons를 쓰면 동일 버전만 사용한다.
- CDN, 원격 텍스처, 실행 시 npm 다운로드에 의존하지 않는다. 실제 앱의 서비스워커/캐시 목록에 필요한 vendor·adapter 파일을 반영한다.
- 의존성 로드 실패 시 기존 SVG를 유지한다. 3D 실패가 학습·퀴즈 진입을 막아서는 안 된다.

## 연결 구조

권장 신규 파일 `science-orbit-three.js`와 vendor 산출물. 기존 `ScienceModels.render('orbit',model)`은 fallback·컨트롤·캡션을 위해 유지한다.

```
await ScienceOrbitThree.mount(host, {onFallback})
  -> { update(model), resize(), dispose() }
```

어댑터는 model의 `condition`(0자전/1공전/2은하공전), `step`, `time`만 읽는다. 저장되는 model 구조를 바꾸지 않는다. 카메라 위치 등 렌더링 임시 상태는 어댑터 내부에 둔다.

현재 `science-app.js.renderModel()`은 매 프레임 `scienceScene.innerHTML=result.svg`를 실행한다. **3D 활성 중 이 경로를 그대로 호출하면 canvas가 지워진다.** orbit은 canvas를 한 번 mount하고 이후 update만 수행하도록 분기한다. 캡션·범례·제목은 별도 DOM으로 갱신하며 매 프레임 모든 DOM을 재작성하지 않는다. 비동기 mount 중 단원/화면이 바뀌면 generation token으로 오래된 완료를 무시하고 즉시 dispose한다.

RAF의 소유자는 기존 science-app 하나다. 어댑터 안에 별도 requestAnimationFrame/setAnimationLoop를 만들지 않는다. 현재 SVG의 약65ms 갱신 제한은 유지할 수 있고 3D만 약30fps 목표로 별도 제한한다. dt가 큰 탭 복귀 프레임은 제한하고 last timestamp를 초기화한다. pause에서도 단계/조건/resize를 바꾸면 한 프레임 렌더한다.

## 세 장면의 교육·시각 계약

### 0. 지구 자전

- 구체 지구, 단순화한 대륙/바다, 분명한 낮밤 경계, 자전축, 지표 관찰점. 텍스처가 없으면 절차적 단순 모형을 쓰되 실제 지형 정확도를 주장하지 않는다.
- 태양빛은 세계 좌표에 고정된 DirectionalLight. 지구 또는 회전 parent에 light를 넣지 않는다. 태양 방향 화살표와 밝은 반구가 일치해야 한다.
- 자전축 기울기 group 아래 지구의 local Y 회전을 두고 관찰점은 회전 지구에 붙인다. 관찰점이 실제로 밤 반구로 들어가며 뒷면에서는 가려진다.
- 낮/밤 판정은 관찰점의 world normal과 태양 방향의 내적으로 판단한다. 화면 x좌표나 단순 sin 값으로 별도 판정하지 않는다.
- `약 하루의 자전 / 공전은 생략 / 크기·거리·속도 비례 아님`을 장면 가까이 표시한다.

### 1. 태양 주위 지구 공전

- 태양, 지구, 궤도, 자전축, 현재 공전 위치를 입체적으로 구분한다. 태양 자체는 발광처럼 보이는 재질을 사용하되 bloom 같은 후처리는 불필요하다.
- 지구 위치를 x/z의 sin/cos로 직접 갱신한다. 지구를 회전하는 orbit parent 아래 넣어 자전축 방향까지 함께 회전시키지 않는다. 지구의 기울기 quaternion은 세계 좌표에서 일정하게 유지한다.
- 빛은 태양 위치에서 지구 방향으로 와야 한다. 태양 위치 PointLight 또는 태양→현재 지구에 맞춘 광원 방향을 사용한다. 자전 장면의 고정 평행광을 공전 전체에 잘못 재사용하지 않는다.
- 공전 장면에서는 자전 애니메이션을 생략해 두 시간척도를 섞지 않는다. `약1년 / 자전은 생략 / 앞 장면과 시간 압축이 다름` 표시.
- 계절 원리를 평가하는 새 콘텐츠는 추가하지 않는다. 현재 설명처럼 `계절은 거리 하나로 설명하지 않아요`만 유지하며, 축이 태양 쪽으로 계속 기울어지는 오개념은 만들지 않는다.

### 2. 태양계의 은하 공전

- 납작한 원반과 중심 팽대부, 여러 별을 Points 또는 소수의 instancing으로 표현한다. 별마다 mesh를 만들지 않는다. 나선 구조는 개념적 표현임을 표시한다.
- 태양계 위치를 눈에 띄게 표시하고 은하 중심 주위를 이동하게 한다. 중심은 태양이나 거대한 단일 블랙홀 물체로 표현하지 않는다.
- `약2억3천만 년 / 앞 장면들과 시간·거리척도가 다름 / 은하 전체에 퍼진 물질의 중력 영향`을 유지한다. 태양계의 위치·궤도는 설명용이며 정확한 동역학 계산이 아니다.
- 세 장면을 동시에 한 비율로 재생하지 않는다. condition 전환 시 모형시간을 초기화하는 기존 동작 유지.

## 단계·카메라·접근성

- 기존 단계 버튼은 같은 model.step을 사용한다. 전체: 안정적인 사선 시점, 확대: 대상에 가까운 시점, 과정: 관찰점/이동 흔적 강조, 직접관찰: 기존 condition 조작을 제공한다. 단계 이름은 현재 ScienceModels.steps와 맞춘다.
- 지구 내부 단면을 보여주는 단계가 현재 SVG에 있다면 우선 그 단계만 SVG로 전환한다. 단면이 없는 3D 화면을 '속 보기'라고 부르지 않는다. 3D 적용 범위를 과장하지 않는다.
- camera orbit controls는 필수 아님. 초기 구현은 고정 프리셋과 전체보기 복귀로 모바일 조작 혼선을 줄인다. 드래그 카메라를 넣으면 손가락 스크롤을 가로막지 않도록 명시적 조작 모드로 제한한다.
- canvas 자체에 장황한 레이블을 그리지 말고 HTML 제목·범례·현재 관찰 설명을 연결한다. 재생/정지/초기화/조건/단계는 키보드와 기존 버튼으로 조작 가능하다.
- `prefers-reduced-motion`에서는 기본 정지. 사용자 명시 재생은 가능하며 설정 변경도 반영한다. 정지 상태만으로 개념을 읽을 수 있어야 한다.

## 성능·수명·fallback

설계 목표(측정 결과 아님): 390px 모바일에서 30fps 목표, 렌더 buffer 약100만 픽셀 이하, device pixel ratio 상한1.5. 실제 크기와 DPR로 buffer를 계산하고 cap을 적용한다. ResizeObserver로 크기와 camera aspect를 갱신한다. 폭/높이0일 때 렌더하지 않는다.

- 불필요한 shadow map·postprocessing·대형 텍스처 제외. 구체 segments는 초기32×24 정도로 시작해 실제 화면으로 조정한다.
- hidden document, 퀴즈/결과/목록 화면, 화면 밖 장면에서는 애니메이션을 중지한다. 화면 복귀는 이전 playing 의사를 보존한다.
- 단원 이탈/계정 변경/pagehide 때 RAF 중지, listeners·ResizeObserver 해제, geometry/material/texture/renderer dispose, DOM canvas 제거. 공유 자원은 소유권을 추적하여 중복 dispose하지 않는다.
- WebGL 생성 실패, 모듈 로드 실패, contextlost, 렌더 중 오류면 정리 후 같은 model 상태의 SVG로 전환한다. 학생에게는 `이 기기에서는 기본 도식으로 보여드려요` 정도만 표시하고 퀴즈는 계속 허용한다.
- bfcache pageshow에서 disposed renderer를 재사용하지 않는다. 필요한 경우 다시 mount한다. context lost 재시도는 무한반복하지 않는다.

## 검증과 완료 기준

1. 브라우저에서 실제 WebGL canvas와 r187 또는 검증된 고정버전 로드 확인. screenshot만으로 Three 실행을 추정하지 않는다.
2. 자전 0/¼/½/¾ 회전에서 광원방향·관찰점낮밤 일치. 공전 네 위치에서 자전축 world 방향 같음. 은하 별도척도 문구 확인.
3. play/pause/reset/조건/단계 전환, reduced-motion, tab hide/show, quiz→study, 목록→다른단원, 새로고침 복원 확인.
4. WebGL 비활성/모듈실패/contextlost 강제 시 SVG fallback과 퀴즈 진입 성공.
5. 모바일390px와 데스크톱1280px 실제 화면 확인. canvas/범례잘림, GPU오류, 과도한높이, 터치스크롤 검사.
6. 단원 출입10회 후 canvas·RAF·listener 증가 없음, renderer.info의 자원 수가 반복적으로 누적되지 않음 확인. 내부 캐시가 0이 아닌 것만으로 누수라고 단정하지 않는다.
7. 기존 과학 quiz/640문항·55/75 계약 검사는 변경 없이 통과. offline은 실제 앱캐시 준비 후 네트워크차단 재진입으로 확인하며 첫 방문까지 오프라인이라고 주장하지 않는다.

## 공식 기술 근거

- https://threejs.org/manual/pages/responsive.html — canvas CSS 크기와 drawing buffer 구분, 높은 DPR의 GPU 비용과 최대 buffer 제한.
- https://threejs.org/manual/pages/how-to-dispose-of-objects.html — scene 제거만으로 GPU자원이 해제되지 않으며 geometry/material/texture 등의 명시적 dispose 필요.
- https://threejs.org/docs/pages/WebGLRenderer — 현재 공식 WebGL renderer 문서. 실제 설치한 버전과 API 일치를 구현 시 확인한다.

최종 보고에서는 'Three.js 설치/번들 준비', '3D 구현', '실제 브라우저 검증', '운영배포'를 구분한다.

## 2026-11-13 구현·로컬 검증

- 공식 r187, commit `7e89746a687bb88271253698fa108b1dd59825d0`의 `three.module.js`와 상대 참조 `three.core.js`를 `vendor/three/`에 원본 그대로 복사했다. LICENSE와 출처 README를 함께 보존했다. 두 파일 합계는 2,214,398바이트다.
- `science-orbit-three.js`가 세 장면을 담당한다. 지구의 자전 광원은 세계 좌표에 고정하고 지표 관찰점의 세계 법선과 태양 방향의 내적으로 낮밤을 판정한다. 공전은 지구 위치만 갱신하며 자전축의 세계 방향을 유지한다. 은하의 원반·별·중심의 별 무리·태양계는 개념적인 모형이며 실제 지리·은하 동역학 자료로 표방하지 않는다.
- 기존 앱 RAF만 사용한다. 문서 숨김·모형 화면 밖·퀴즈·목록에서 애니메이션을 중단한다. 단면 단계는 기존 SVG를 사용한다. 비동기 진입 취소, 페이지 이탈, context loss에서 자원을 해제하며, 모듈·WebGL 실패 시 동일 상태의 SVG와 퀴즈를 유지한다.
- `tests/science-three-browser.cjs`에서 Chrome의 **SwiftShader WebGL2**로 r187 실행을 확인했다. 이는 실제 모바일 기기 GPU 성능 측정이 아니다. 자전 네 위치 낮밤, 공전 네 위치 축 방향, 390/1280px, 정지·재개, 100만 픽셀 buffer 상한, 10회 출입의 일정한 geometry 개수와 단일 live renderer, 퀴즈 왕복을 확인했다.
- 모듈404·WebGL 비활성·context lost를 각각 강제하여 SVG 복구와 10문항 진입을 확인했다. 실제 앱 서비스워커의 캐시 준비 후 네트워크를 차단하고 페이지를 새로 열어 r187 3D 및 은하 장면 전환을 확인했다. 첫 방문 오프라인 사용을 검증한 것은 아니다.
- `tests/science-browser.cjs`의 기존 저장·복원·최초점수·실패 복구·학생 격리 흐름은 SVG/canvas 양쪽을 허용하도록 검사만 조정했다. 문항, 저장 형식, 55/75 모의고사 계약은 3D 작업에서 변경하지 않았다.
- 화면 캡처: `artifacts/science-three/orbit-{0,1,2}-{390,1280}.png`. 운영 배포·실계정·실제 저사양 모바일 성능은 이번 검증 범위가 아니다.
