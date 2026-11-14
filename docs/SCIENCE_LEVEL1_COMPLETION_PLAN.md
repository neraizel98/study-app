# 과학 Level 1 완성 구현 계약

2026-11-13 설계. 최신 사용자 승인에 따라 기존 검토안의 준비 단원을 실제 학습으로 완성하는 범위다. 이 문서 자체는 구현 완료 증거가 아니다.

## 범위·수량·교육과정 표현

- **초등 핵심28 + 중학교 연결4 = 32단원**. 모두 levelId=`level1`. 기존8개 ID/기록 유지, 신규24개 추가.
- 단원당 연습20 + 평가전용60 = 80개. 전체 **연습640 + 평가1920 = 2560문항**. 기존640개를 보존하므로 신규1920개가 필요하다. 회당 연습10, 과학 모의20 및 같은 주1~3회 무중복 계약 유지.
- 연결4개도 학습기록으로 과학모의 범위에 들어간다면 동일하게20+60을 갖춘다. 빈 은행 상태에서 학습 가능으로 표시하지 않는다.
- 공개 명칭은 `초등 과학 핵심과 중학교 연결 탐구`. **초등 전 성취기준 완전충족, 중1 첫학기 전체, 특정학교 시험범위**라고 주장하지 않는다. 학년·학기 내부값은 검증 전 null. 2022 개정 고시 원문 ZIP 위치는 확인했으나 이 실행환경에서 전문 추출은 실패했다.
- 공식 교육기관이 제공한 성취기준에서 **별/별자리 관찰, 태양고도와 그림자, 용해·증발 분리**를 직접 확인했다. 따라서 기존안에 이를 실제 소주제로 보완한다. 균류·미생물, 굴절·렌즈, 기후변화도 아래 단원의 소주제로 작성하여 제목만 채우는 누락을 막는다.
- 중학교 연결4는 탐구 방법·힘의 자료·입자모형·생물분류이며 학교별 학기 순서는 미확정이다. 경기도교육청 중1 자료에서 생물의 구성과 다양성·기체 주제를 확인했지만 이것으로 인헌중 첫학기를 확정하지 않는다.

## 단원별 시각화 계약

아래 ID가 고정 API다. E=기존, N=신규. `3D+SVG`는 공간 모형과 읽기 쉬운 도식의 결합이며 모든 장면을 억지로3D화하지 않는다. 각 행의 조건과 관찰은 실제 조작 결과로 연결한다.

| ID / 상태 | 제목·필수 소주제 | 매체 / 조건 → 관찰 | 막을 오개념 |
|---|---|---|---|
| l1-life-animals N | 동물의 생김새와 생활 | SVG 비교그림 / 서식지 선택→발·몸·이동 비교 | 환경 바꾸면 한 개체의 몸이 즉시 진화하지 않음 |
| l1-life-lifecycle N | 동물의 한살이 | SVG 단계모션 / 나비·개구리 선택→단계·형태 비교 | 모든 동물이 번데기 단계를 거치지 않음 |
| l1-life-germination N | 식물의 한살이와 씨의 퍼짐; 식물 생활형 | 3D+단계도 / 물·온도·빛 한조건씩→발아/이후생장·씨확산 비교 | 모든 씨의 발아에 빛이 필수라는 일반화 금지 |
| l1-life-plants E | 식물의 몸과 물의 이동 | 3D 절개+경로 / 잎·물공급→줄기통로·잎맥의 물이동 | 물흡수와 빛으로 양분만들기는 다름 |
| l1-life-reproduction N | 꽃·열매·씨의 연결 | 3D 분해/단면 / 단계선택→꽃의부분과열매·씨연결 | 모든식물이꽃·열매를만드는것은아님 |
| l1-life-body N | 우리 몸의 기관과 협력 | SVG 인체레이어 / 음식·공기선택→소화·호흡·혈액운반경로 | 음식이기도·혈관으로그대로이동하지않음 |
| l1-life-ecosystem E | 먹이관계·환경; 균류·미생물·분해자 | SVG 먹이망/확대그림 / 먹이·환경선택→연결강조·분해과정 | 화살표는먹이→먹는생물,미생물모두유해아님 |
| l1-physics-force E | 힘과 물체의 움직임 | 3D 수레+벡터 / 마찰·밀기→운동차이 | 힘없으면항상즉시정지한다는설명금지 |
| l1-physics-magnets N | 자석과 자기력; 나침반 | 3D 자석+SVG방향 / 극·거리→끌림/밀림·바늘 | 모든금속이자석에붙지않음 |
| l1-physics-sound N | 소리와 진동 | SVG 진동+파형 / 진폭·진동빠르기별도→크기/높이비교 | 큰소리와높은소리를혼동하지않음 |
| l1-physics-light N | 빛·그림자·거울; 굴절·렌즈 | 3D 광학대+광선 / 광원·거울각·렌즈→그림자/경로/모임 | 눈에서빛이나와물체를보는것아님 |
| l1-physics-heat E | 온도와 열의 이동 | 3D 비커·온도계 / 물의양·초기온도→같은가열의변화 | 온도와열량같지않음;가정/단위표시 |
| l1-physics-electricity N | 전기회로와 전자석 | 3D 회로+배선도 / 스위치·연결·코일→전구/자기반응 | 전류가전구에서전부소모된다는표현금지 |
| l1-physics-energy N | 에너지 이동·전환 | 3D 발전장치+흐름 / 에너지원·부하→회전/빛/열 | 에너지소멸·무한생성아님;색입자는설명표시 |
| l1-chemistry-materials N | 물체와 물질의 성질 | 3D 재료표본+비교표 / 재료·시험선택→휘어짐/투명/물반응 | 물체용도와재료성질을동일시하지않음 |
| l1-chemistry-states E | 물의 상태 변화 | 3D 용기+입자확대 / 가열·냉각→상태/배열 | 입자자체크기팽창아님;하얀김은물방울 |
| l1-chemistry-mixtures E | 혼합물 분리; 용해·증발·비혼합액체 | 3D 도구단면 / 체·거름·층분리·증발선택→남음/통과 | 녹은소금은일반거름종이로분리안됨 |
| l1-chemistry-solutions N | 용해와 용액 | 3D 비커+확대 / 같은용질의양·온도→남는양/녹는과정 | 녹으면물질이없어지는것아님 |
| l1-chemistry-gases N | 여러 기체와 기체의 성질 | 3D 주사기+입자 / 닫힌부피·기체종류→간격/성질비교 | 기체는아무것도없는빈공간아님 |
| l1-chemistry-acids N | 산성·염기성과 지시약 | 3D 시험관+색표 / 용액·지시약→색변화비교 | 모든지시약의색규칙같지않음 |
| l1-chemistry-combustion N | 연소와 소화 | 3D 가상장치 / 산소공급·냉각→불꽃변화 | 산소는연료와다름;위험실험실행유도금지 |
| l1-earth-erosion N | 땅의 변화·흐르는 물; 바다·해안 | 3D 지형단면 / 경사·흐름→침식/운반/퇴적·해안 | 모든지형이한번의홍수로형성되지않음 |
| l1-earth-rocks N | 지층·암석·화석 | 3D 층단면 / 퇴적단계·관찰면→겹침/화석위치 | 모든암석에화석이있는것아님 |
| l1-earth-volcano N | 화산과 지진 | 3D 절개 / 화산/단층선택→다른원인과변화 | 모든지진이화산폭발때문아님 |
| l1-earth-weather N | 날씨·공기운동; 기후변화 | 3D 해륙단면+기간그래프 / 가열조건·자료기간→바람/날씨와기후비교 | 하루추위로장기기후변화를부정못함 |
| l1-earth-water E | 물의 순환과 날씨 | 3D 지형+경로 / 따뜻함·차가움→증발/응결/여러물길 | 모든물이같은순서·속도로돌지않음 |
| l1-earth-motion E | 지구·태양계운동; 별·별자리 | 승인된Three통합cosmos+하늘도 / 관찰기준·시간→자전/태양공전/은하이동 | fallback과canvas중복금지;은하중심=태양/단일블랙홀아님 |
| l1-earth-moon-seasons N | 달위상·계절; 태양고도·그림자 | 3D+지표관찰창 / 달위치/계절장면→밝은면·입사각·그림자 | 달위상은지구그림자아님;계절은거리하나때문아님 |
| l1-bridge-classification N | 연결: 생물의 구성과 분류 | SVG 현미경단계+특징표 / 표본·분류기준→세포/공통차이 | 모습비슷함만으로같은분류확정금지 |
| l1-bridge-force-graphs N | 연결: 힘과 그래프 | 3D 용수철/수레+그래프 / 하중·시간→측정점/추세 | 그래프선은물체의실제이동경로아님 |
| l1-bridge-particles N | 연결: 입자로 상태 설명 | 3D 입자+상태도 / 상태·조건→배열/거리/운동 | 색구슬은실물입자사진아님 |
| l1-bridge-investigation N | 연결: 한 조건만 바꾸는 탐구 | SVG 양쪽실험+결과표 / 가열·용기·양선택→공정비교여부 | 조건여러개변하면원인을하나로단정못함 |

연결4의 domainId는 위에서부터 life/physics/chemistry/earth다. 마지막 탐구의 영역배치는 메뉴균형을 위한 제품분류이며 공식지구과학전용 성취기준이 아니다. 각영역8개(기존2+신규6)로 총32개.

## 콘텐츠·API 계약

- 기존 `ScienceData.units` 배열, `domains[{id,title,icon}]`, `levels`, `getUnit` 등 공개API 유지. 확장파일을 써도 앱이 보는 최종객체와 Node require 결과가 같아야 한다. 기존8 ID와문항ID변경금지.
- 신규 unit: 기존필수 `id,levelId,domainId,title,sceneId,goals,concepts,misconceptions,prediction,lessons,questions,sourceRefs` 유지. `internalBand:'elementary'|'bridge'`, `curriculumMapping:null`(실제검증후만채움), `available:true`는 모든완료조건 충족후만.
- 단원은 최소2개 lesson. 넓은주제(빛/전기/생태계/달계절 등)는 소주제에 맞춰3~4개도 허용. 문항 lessonId는 기존 `index<10` 규칙을신규에복붙하지말고실제내용에명시매핑.
- 각lesson은 목표질문1·근거설명·조건선택·시각장면을 연결. sceneId는위ID별고유키권장,동일물리원리의렌더러공유는가능하지만조건/관찰/그림이실제로달라야한다. 제목만바꾼행성/구슬/원통복제금지.
- 연습20은 개념/도식/조건비교/적용/근거를고르게. 평가60은 연습과별도, 서로독립상황/질문을직접작성. 하나의사실을어순·숫자·선택지로바꿔60개채우기금지. 같은상황을복수질문으로쓰면서로다른추론대상인지검수.
- q의 `answer,correctAnswer,answerIndex,choices,question,prompt,givens,unitId,levelId,domainId,context,sourceRefs` 기존정합유지. 선택지중유일정답·명확한해설. 동일주3회20문항은최소단원1개학습범위에서도보장.
- 별도 `ScienceMockData.items` 집계는 모든32단원각60을확인. 기존8문항을재생성하거나기록을초기화하지않는다. 작성/실행중partial bank를완성본처럼배포하지않는다.

## UI·모형 완료 조건

- 4개영역그림카드·청록크림·선택레벨독립·단원목록접기 유지. Level2/3 선택에서 영역클릭해도Level1콘텐츠가끼어들지않음.
- unit/lesson/condition변경 시 제목·질문·본문·모형·범례 동기화. 단순정적그림위에의미없는입자만돌리는것은미완성.
- 주매체가SVG인단원도충분히구체적인삽화/단면/데이터를사용. 3D는공간관계가필요할때사용하며설명용표시는항상보임. 교육용모션은재생/정지/초기화와조건변경가능. 의미있는느린과정을기본으로함.
- 최종UI계약우선: cosmos-local condition0은 사용자승인국소이동trail 장면이며 은하이미지는없음. 실제은하전체를보여준다고설명하지않는다. 태양계움직임의국소설명모형이며크기·거리·시간비율조정명시. 이전3모드안/은하전체한canvas강제안은이번최종scene계약으로대체한다.
- Three는로컬vendor와단일RAF,단원전환dispose,hidden중지,reducedmotion,실패시SVG. SVGfallback/canvas는상호배타. 데이터로모션을평가하거나예측을점수에포함하지않음.

## 작업 분담과 필수 검수

- 콘텐츠 Sol A: life+earth 각8=16단원(기존4보존/신규12),연습320+평가960.
- 콘텐츠 Sol B: physics+chemistry 각8=16단원(기존4보존/신규12),연습320+평가960.
- UI Sol/root: 공통앱·시각모형·집계연결. 두콘텐츠작업자는서로다른확장파일로작성하고기존공통집계수정은root한곳에서수행.
- 데이터검사:32단원/4영역각8/각20+60/총2560/ID·의미fingerprint/정답·해설·lesson연결. 숫자통과만으로문항품질완료판정금지.
- 각단원1회실제10문항진입→제출→오답→refresh. 각단원만학습한조건에서모의1~3회각20무중복. 최근노출소진후명시복습10,최초점수보존,학습범위바깥fallback없음.
- 시각검사32단원모두조건전후대표2상태를검사하며390px/1280px에서글자·그림겹침확인. 최소각영역2개는모션과실제조작을끝까지확인. 나머지는검사한범위를정확히보고.
- 신규단원미완성·소주제미구현·은행부족을표시하고완료배지로숨기지않음. 전체완성은32단원콘텐츠/시각/기록/퀴즈까지완결할때만선언.

## 확인 근거와 한계

1. [교육부2022-33 고시](https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&search=): 과학은별책9,첨부과목ZIP확인. ZIP web추출불가,로컬요청DNS실패로이실행에서전문대조미완료.
2. [경남교육청 과학교육원 성취기준연계](https://gnse.gne.go.kr/gnse/cm/cntnts/cntntsView.do?cntntsId=3788&mi=5709): 별관찰[4과13-03],용해·증발분리[6과05-02],태양고도/그림자[6과13-01],태양·별위치[6과12-01],계절별별자리[6과12-03]를직접확인. 해당범위만근거로사용.
3. [경기도교육청 중학교 과학활용자료](https://www.goe.go.kr/resource/old/BBSMSTR_000000030137/BBS_202501060958556440.pdf): 공식검색색인에서중1생물구성·다양성/기체관련자료확인,전체PDF는크기제한으로미열람. 학교학기배치증거로사용하지않음.

위근거는제품의32단원수나각단원학기배치를확정하는자료가아니다. 완전교육과정일치로광고하지않고실제완성된초등핵심+연결탐구로표현한다.

## 최종 lesson scene API — 구현팀 고정 계약

`lessons[].sceneId`가 실제 renderer kind이며 unit.sceneId는 기본값일 뿐이다. `lessons[].modelCondition`은 숫자. 단원/lesson전환 시 두값을동시에적용하고제목/본문/범례도같이전환한다. 새kind의기본modelCondition=0,소주제조건은renderer가제공하는순서와lesson에서맞춘다. 신규kind는아래고정명으로작성해UI팀에연결한다.

| unitId | lesson sceneId / modelCondition |
|---|---|
| l1-life-animals | animal-adaptation / 0 |
| l1-life-lifecycle | animal-lifecycle / 0 |
| l1-life-germination | plant-lifecycle / 0 |
| l1-life-plants | plant / 0 |
| l1-life-reproduction | flower-seed / 0 |
| l1-life-body | body-systems / 0 |
| l1-life-ecosystem | ecosystem / 0; 분해자소주제 ecosystem / 2 |
| l1-physics-force | force / 0 |
| l1-physics-magnets | magnets / 0 |
| l1-physics-sound | sound / 0 |
| l1-physics-light | optics / 0 |
| l1-physics-heat | heat / 3(접촉); heat / 0(질량비교) |
| l1-physics-electricity | electricity / 0 |
| l1-physics-energy | energy-transfer / 0 |
| l1-chemistry-materials | materials / 0 |
| l1-chemistry-states | states / 0 |
| l1-chemistry-mixtures | mixtures / 0 |
| l1-chemistry-solutions | solutions / 0 |
| l1-chemistry-gases | gases / 0 |
| l1-chemistry-acids | indicators / 0 |
| l1-chemistry-combustion | combustion / 0 |
| l1-earth-erosion | erosion / 0 |
| l1-earth-rocks | strata / 0 |
| l1-earth-volcano | earth-interior / 0 |
| l1-earth-weather | weather-climate / 0 |
| l1-earth-water | water-cycle / 0 |
| l1-earth-motion | orbit / 0(자전); orbit / 1(공전); cosmos-local / 0(국소이동trail) |
| l1-earth-moon-seasons | moon-seasons / 0(달); moon-seasons / 1(계절) |
| l1-bridge-classification | classification / 0 |
| l1-bridge-force-graphs | force-graph / 0 |
| l1-bridge-particles | particle-model / 0 |
| l1-bridge-investigation | fair-test / 0 |

기존kind에새condition을추가하는곳도실제renderer분기구현필수. 미지원condition을다른그림으로조용히대체하지않는다. 신규kind 내부세부조건숫자는UI담당이정한뒤데이터담당과공유하되위대표0/heat/orbit/cosmos-local계약은변경하지않는다.
