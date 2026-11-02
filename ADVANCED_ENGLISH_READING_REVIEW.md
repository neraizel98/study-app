# 고난도 영어 독해 집중 검토

검토일: 2026-11-02. 검토 대상은 `scratch/high-reading-review.json`의 고정 스냅샷 8개 지문(72개 문장, 48개 문항)이다. 원본 작성자가 수정 중인 런타임 파일은 수정하지 않았다. 아래 ID는 스냅샷 ID이며 최종 파일의 unit1/2, p4/5/6 ID와 다를 수 있으므로 제목으로 함께 대조한다.

문장 번호와 문항 번호는 1부터 센다. `evidence` 배열의 값은 0부터 시작한다.

## 결론

핵심 논지와 대부분의 정답·근거는 일치한다. 가장 먼저 고칠 항목은 Pond 6번 문항의 판단 범위, 주어·동사·조건절의 명백한 오표기, incidental의 해석, 추가 제거 중단과 기존 피해 복구의 혼동이다. 아래는 스냅샷에서 발견한 사항이며, 작성자가 이미 수정한 항목도 포함한다. 마지막 절에 최신 파일의 집중 재확인 결과를 기록했다.

## 의미·해석·문항 수정

### 1. hr2-unit3-p3 — The Pond with Two Clocks

- **Q6: 단일 정답을 위한 판단 범위 수정 필요.** 현재 질문은 “첫 주에 식물이 달라 보이지 않았다는 사실만으로 할 수 없는 결론은?”이다. 그 사실 하나만으로는 B의 계절 규칙 존재나 C의 물고기 생존을 비교한다는 내용도 도출되지 않는다. 의도한 D를 유일한 오답 결론으로 만들려면 “글 전체의 내용으로 볼 때 정당화할 수 없는 결론은?” / “Which conclusion is not justified by the passage as a whole?”로 수정한다. 선택지와 `answerIndex: 3`은 유지 가능하다.
- **문장 1 문법 해설: 목적어 범위 수정.** `helps`의 목적어는 `fish` 단독이 아니라 `an invented species of fish` 전체다. “helps 뒤 an invented species of fish가 목적어이고 survive cold nights가 원형부정사 목적격보어입니다.”로 바꾼다.

### 2. hr2-unit4-p3 — The Handle That Changed the Cup

- **문장 5 문법 해설: `If removed` 오인용.** 실제 구문은 `If they removed the wooden grip`이다. `If removed`라고 쓰면 수동 축약절로 오해할 수 있다. “If they removed는 현재의 가상 선택이며 might resemble은 가능성, would remove는 그 선택에 따르는 결과를 나타냅니다.”로 수정한다.
- **문장 5 한국어: might의 가능성 유지.** “이전 모습과 더 닮겠지만” → “이전 모습과 더 닮을 수도 있지만”. Q5 해설도 “이전 외형에 가까워질 수 있지만”으로 맞춘다.

### 3. hr3-unit3-p1 — One Word, Three Voices

- **문장 5 한국어·문법 해설: incidental은 여기서 ‘우연한’보다 ‘부수적인’.** 문맥과 Q3의 정답은 구조적으로 중요하지 않은 요소라는 의미다. 반복이 우연히 생겼는지는 논지의 조건이 아니다. “공통된 단어가 부수적인 요소였더라면 …”, “실제 원문에서는 반복이 부수적이지 않고 구조적으로 중요합니다.”로 수정한다. Q3 정답은 그대로 타당하다.

### 4. hr3-unit4-p2 — Restoration with an Exit

- **문장 8: 중단 가능성과 가역성을 구별해야 함.** `preserves enough vine ... to stop further removal`은 덩굴을 남기는 것이 제거를 중단할 능력 자체의 필요 조건인 것처럼 읽힌다. 이어지는 `reversible` / `route back`은 추가 제거를 멈추는 것과 이미 제거한 식생·노출된 둥지의 영향을 복구하는 것을 섞는다. 본문은 피해 복구 방법이나 성공을 제시하지 않았다.
- **권장 대체문:** `Its plan also leaves most of the vine outside the trial area untouched, so the team can halt further removal if warning signs appear, without claiming that damage already caused would be easy to reverse.`
- **권장 해석:** “계획은 시험 구역 밖 덩굴 대부분을 그대로 두어 경고 신호가 나타나면 추가 제거를 중단할 수 있게 하되, 이미 생긴 피해를 쉽게 되돌릴 수 있다고 주장하지는 않는다.”
- **권장 해설:** “if절은 경고 신호에 따른 중단 조건입니다. halt further removal은 추가 행동의 중단이며 reverse damage는 이미 생긴 피해의 복구이므로 구별합니다.” Q4와 Q6의 정답·근거 문장 번호는 유지 가능하다.

### 5. hr3-unit4-p3 — The Object Missing from the Shelf

- **문장 5: 비교 대상 명시 권장.** `uncertain details ... as well established as the surviving jars`는 세부 사실의 확실성과 물건 자체를 비교한다. `as well established as the observable features of the surviving jars`로 수정하면 불확실한 재현 정보와 확인 가능한 실물 정보를 정확히 비교한다. 한국어도 “남아 있는 항아리에서 직접 확인할 수 있는 특징만큼 확실한 것처럼”으로 맞춘다. 논지와 문항 정답은 유지된다.

## 문장 성분 표시의 명백한 수정

독립적으로 잘라 표시한 구간의 역할을 기준으로 한다. 명사구 안의 모든 수식어를 분리하라는 요구는 아니다. 아래 코드는 제공된 정의(S 주어, V 동사, F 조건, T 시간, I 목적, D 분사구문, E 동격 등)를 따른다.

| 스냅샷 ID / 제목 | 문장 | 현재 문제 | 권장 교정 |
|---|---:|---|---|
| hr2-unit3-p3 / The Pond with Two Clocks | 4 | `SHaving read the seasonal rule`가 주어로 표시됨 | `DHaving read the seasonal rule,~Sa second team~Vobjects...` |
| hr2-unit4-p3 / The Handle That Changed the Cup | 4 | 콜론 뒤 history의 예시 목록이 별도 목적어 O로 표시됨 | `Ethe maker's original design, the years of family use, or the moment...` |
| hr2-unit4-p3 / The Handle That Changed the Cup | 9 | `while~Vdistinguishing`이 독립 서술동사처럼 표시됨 | `Dwhile distinguishing what the surviving modification demonstrates from what the students can only imagine about the people who used it.` 전체를 축약 부사절로 묶음 |
| hr3-unit3-p1 / One Word, Three Voices | 2 | `For...`가 S이고 실제 주어가 V에 포함됨 | `AFor the returning traveler,~Sthe word~Vevokes...~Kwhereas~Afor the youngest resident,~Sit~Vnames...` |
| hr3-unit3-p1 / One Word, Three Voices | 5 | 도치 조건절이 S | `FHad the shared word been incidental,~Sthis solution~Vmight have cost...` |
| hr3-unit3-p1 / One Word, Three Voices | 6 | 장면 부사구가 S, readers가 V에 포함됨 | `PIn that scene,~Sreaders~Vmust recognize...` |
| hr3-unit3-p2 / A Perfect Fit to the Wrong Target | 1 | 명령문 `Imagine a workshop` 전체가 S | `VImagine~Oa workshop~Rthat builds...`; 명령문의 주어 you는 생략됨 |
| hr3-unit3-p2 / A Perfect Fit to the Wrong Target | 2 | until 시간절이 F | `Tuntil its readings closely match repeated measurements under that procedure,` |
| hr3-unit3-p2 / A Perfect Fit to the Wrong Target | 3 | 동격 `a question...`이 O | `Ea question involving duration and movement that the one-minute weight test does not include.` |
| hr3-unit3-p2 / A Perfect Fit to the Wrong Target | 9 | 동격 `two achievements...`이 O | `Etwo achievements that neither precision nor confidence can make interchangeable.` |
| hr3-unit3-p3 / The Rule Beneath the Example | 1 | 실제 사건을 서술하는 when 시간절이 F | `Twhen a new problem describes...` (해설도 이미 시간절이라고 설명함) |
| hr3-unit3-p3 / The Rule Beneath the Example | 2 | 콜론 뒤 what의 내용을 풀어주는 명사구가 O | `Ethe visible arrangement of the example rather than the relation...` |
| hr3-unit3-p3 / The Rule Beneath the Example | 5 | 목적 부정사가 S, she가 V에 포함됨 | `ITo test her explanation,~Sshe~Vconstructs...` |
| hr3-unit3-p3 / The Rule Beneath the Example | 9 | become 뒤 주격보어가 O | `Sthey~Vbecome~Cobjects to compare and question rather than scripts to follow,` |
| hr3-unit4-p1 / A Tempo No One Owns | 5 | Once 시간절이 S, the group이 V에 포함됨 | `TOnce that relationship is audible,~Sthe group~Vassigns...` |
| hr3-unit4-p1 / A Tempo No One Owns | 7 | 도치 조건절이 S | `FHad the performers merely selected one person to follow unquestioningly,~Sthey...` |
| hr3-unit4-p2 / Restoration with an Exit | 1 | 명령문이 S이고 `also exposes`도 S | `VImagine~Oa fictional island model~Rin which removing an invented vine gives low-growing plants more space but also exposes the nests of an imaginary ground bird that has begun using the vine for cover.` 관계절 안의 병렬을 통째로 R로 유지하는 방법이 가장 명료함 |
| hr3-unit4-p2 / Restoration with an Exit | 5 | specifying이 주절 동사 V로 표시됨 | `Dkeeping another comparable section unchanged and specifying in advance what observations would trigger a pause or a change of plan.` 전체를 병렬 분사구문으로 묶음 |
| hr3-unit4-p3 / The Object Missing from the Shelf | 1 | 도입 부사구가 S, students가 V에 포함됨 | `AIn an original archive-design exercise,~Sstudents~Vreceive...` (도입문 자체 변경 시 새 문장에 맞춰 적용) |
| hr3-unit4-p3 / The Object Missing from the Shelf | 7 | `Vit` | `Sit~Vstill gives...` |

분사구문 전용 D가 있으므로 다음 A 구간도 D로 일치시키는 것이 맞다. 문법 해설은 이미 분사구문이라고 설명하는 경우가 많다.

- Pond 문장 6 `tracking...`
- Cup 문장 3 `thus suggesting...`
- One Word 문장 4 `making... but removing...`
- Wrong Target 문장 1 `defining...` (문장 구조를 재작성하면 그 구조에 맞춤)
- Rule 문장 9 `allowing...`
- Tempo 문장 2 `expecting...`, 문장 9 `showing...`
- Restoration 문장 5 `keeping... and specifying...`
- Shelf 문장 9 `asking...`

`without inventing`, `without resolving`, `rather than allowing`처럼 전치사/연결 표현 뒤 동명사 전체를 A로 잡은 구간을 이 목록만 보고 일괄 D로 바꾸지는 않는다. 또한 generic A는 포괄적인 수식어 표기이므로 이 D 통일은 잘못된 S/V 표기보다 우선순위가 낮다.

## 확인한 정확성 및 한계

- 고2 2개는 각각 257·269단어, 고3 6개는 266~289단어다. 공백 기준으로 역할 코드를 제거한 스냅샷 본문을 집계했다. 9문장 안에 추상 개념과 복문을 압축해 상대적으로 어려운 지문이지만 고2 band2와 고3 대상에 명백히 부적합하다고 단정할 근거는 없다. 실제 학생 난도 측정이나 공식 CEFR 인증은 수행하지 않았다.
- 가정법, 부분 부정, 관계사 선행사, 지시어 문항을 확인했다. `Neither`, `Not all`, `Not every`의 해설은 대체로 부정 범위를 보존한다. Cup의 might 해석과 위 성분 표기 외에 의도한 조건·가능성을 뒤집는 명백한 오류는 찾지 못했다.
- 대상 48문항에서 위 Pond Q6 외에 수정이 필요한 또 다른 복수 정답은 확인하지 못했다. 기존 evidence 인덱스는 의도한 근거 문장과 맞는다. 최종 영문 질문 재작성 후에는 질문 범위와 evidence를 다시 대조해야 한다.
- 가상의 생태 규칙, 쿠션 지표, 소설·합주·전시 사례는 가정으로 제시되어 있다. 실제 생태계에 대한 인과 추정이나 특정 학습법의 보편 효과로 확대하지 않도록 본문이 제한하고 있어 이 범위에서 별도 외부 사실 확인이 필요한 실재 주장은 찾지 못했다.
- 전체 36개가 아닌 고난도 8개만 검토했다. 영어 질문 누락 및 문장별 단어 누락은 별도 작업 중이라는 지시에 따라 검토 결함으로 집계하지 않았다. 전역 however 코드와 일반적인 창작 이야기 도입문의 수정도 별도 작성자 작업이다.
- 이 문서만 작성했다. 런타임 코드, 원문 스냅샷, 배포 상태는 변경하지 않았다.

## 수정 후 집중 재확인

작성자의 수정 완료 알림 뒤 `EnglishReadingHighExpansion.js`를 읽고 등록 데이터를 메모리에서 로드하여 위 지적 위치를 대조했다. 의미·문항의 주요 수정, S/V 및 조건절 오류 수정, 동격 E 교정, Cup Q5 해설의 가능성 표현이 반영되었다. Wrong Target 문장 1은 추가로 `a workshop that builds ... and defines ...`로 변경되어 두 행동의 주체도 명확해졌다. 이 집중 검토에서 남은 배포 차단 수준의 내용 오류는 확인하지 못했다.

- 마지막 확인 파일 SHA-256: `5AEF9757A71D34EF0AC29FE446BC3B39649AA0086A0F6B52AF08964BB8ED8445`
- ID 대응: Pond `hr2-unit1-p6`, Cup `hr2-unit2-p6`, One Word `hr3-unit1-p4`, Wrong Target `hr3-unit1-p5`, Rule `hr3-unit1-p6`, Tempo `hr3-unit2-p4`, Restoration `hr3-unit2-p5`, Shelf `hr3-unit2-p6`.
- 36개 전체 재검토, UI 검증, 저장·동기화 검증, 배포 확인은 이 보고서 범위 밖이다. 위 단어 수는 변경 전 고정 스냅샷의 집계다.
