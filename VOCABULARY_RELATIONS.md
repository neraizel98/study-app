# 영어 어휘 관계·표현 보충 자료

작성·확인일: 2026-11-02. 학습 화면에서 읽는 별도 자료이며 정답 인정 범위를 넓히는 데이터가 아니다.

## 범위와 확인 수준

- `english.html`의 실제 스크립트 순서로 `VocabEng.js`, 중1~3·고1~3 파일, `VocabEngDefKo.js`를 Node VM에 로드했다. 현재 원본은 고유 표제어 2,279개다.
- 보충 자료는 현재 원본에 존재하는 **161개 표제어**, **유의어 236개**, **반의어 149개**, **표현 40개**를 포함한다. 관계의 개수는 표제어별 항목을 합산한 수이며 중복을 제거한 영어 단어 수가 아니다.
- 표현은 관용구(`idiom`) 12개, 구동사(`phrasal verb`) 6개, 정형 표현(`fixed phrase`) 12개, 자주 함께 쓰는 말(`collocation`) 10개로 구분한다. 사전에 따라 범주 경계는 달라질 수 있다.
- 전체 원본에서 표제어 중복과 연결 식별자를 검사했다. 보충한 모든 항목은 실제 품사와 현재 한국어 뜻에 맞춰 확인했다. **원본 2,279개 전체의 정의·예문·퀴즈 정답을 사전과 대조해 교정한 것은 아니다.**
- 새 유의어·반의어·번역·예문은 직접 작성하고 문맥·품사·강도 차이를 검토했다. 모든 관계를 외부 사전으로 전수 검증했다는 의미는 아니다. 아래 자료는 지정한 표현과 문법을 선택적으로 확인한 근거다.

## 편집 기준

1. 뜻이 비슷해도 항상 서로 바꿔 쓸 수 있는 것은 아니다. `happy → joyful`, `cold → freezing`처럼 강도 차이가 있는 항목과 격식·목적어·문형 제한에 설명을 붙였다.
2. `fast`는 현재 원본의 부사 뜻이므로 `quickly`, `rapidly`와 `slowly`를 연결한다. 형용사 `fast`를 새 뜻으로 붙이지 않는다.
3. `old`, `short`, `hard`처럼 원본에 여러 뜻이 있으면 반대말의 적용 뜻을 개별 표시한다. 예: `hard ↔ soft`는 단단함, `hard ↔ easy`는 난이도.
4. 거래의 상대 역할인 `buy/sell`, `borrow/lend`를 단순한 반의어로 넣지 않았다. 적절한 관계가 없으면 배열을 비운다. 단어당 개수 할당을 채우지 않는다.
5. 직접 대체하기 어려운 `mild → warm`, 상태와 성향이 다른 `idle → lazy`, 공간의 여유와 폭이 다른 `spacious → wide` 등은 최종 검토에서 제외했다.
6. 관용구는 현재 표제어를 포함하면서 단독 뜻과 달라질 수 있다. `by the book`, `a piece of cake`, `keep in touch` 등에 관용 의미를 명시한다. `take notice of`의 `notice`가 원본의 동사와 달리 명사라는 점도 표시한다.
7. `look forward to + -ing`, `put it off`, `give it back`처럼 학습자가 자주 틀리는 문형을 설명한다. 예문과 한국어 번역은 이 자료용으로 새로 작성했으며 미국 영어에서 자연스럽게 쓰이는 표현을 사용한다.

학습 카드에는 다음 안내를 함께 표시하는 것을 권한다: **“뜻과 문맥에 따라 쓰임이 달라요. 항상 바꾸어 쓸 수 있는 것은 아니에요.”**

## 읽기 API

`VocabularyRelations.js`가 `window.VocabularyRelations`를 제공한다. HTML/서비스 워커 등록과 화면 표시는 소비하는 쪽에서 담당한다.

```js
const extra = window.VocabularyRelations.get(currentWord);
// null, 또는 동결된 다음 구조:
// { word, pos, meaning,
//   synonyms: [{ word, meaning, note? }],
//   antonyms: [{ word, meaning, note? }],
//   expressions: [{ phrase, kind, meaning, ex, exKo, note? }] }
```

`get()`은 객체만 받는다. 표제어의 앞뒤 공백·영문 대소문자를 정규화하되, 품사와 한국어 뜻은 원본의 전체 문자열과 맞아야 한다. 내부 연속 공백은 하나로 정규화한다. 새 뜻·새 품사·누락된 필드·미등록 표제어에는 `null`을 반환한다. 원본 뜻이 바뀌면 내용을 재검토하기 전까지 숨겨지는 방식이다.

`entries`는 검토용으로 공개한 동결된 전체 배열이다. `metadata`는 `{version: 1, headwords: 161, expressions: 40, role: 'study-supplement'}`다. 반환 객체와 하위 배열·항목도 모두 동결되므로 소비하는 쪽은 복사 후 가공해야 한다.

원본 `vocabData`, `altWords`, `phrasalVerbs`와 채점 규칙은 수정하지 않는다. 보충 항목을 정답 보기·오답 생성·채점 허용 목록에 합치지 않는다.

## 선택적으로 확인한 1차 사전 자료

일부 Cambridge 사전 URL의 직접 열기는 403을 반환했다. 같은 발행사의 검색 색인이 반환한 정의·분류·문법 본문으로 확인했으며, 사전 페이지 전체를 직접 열람했다고 주장하지 않는다.

- [Cambridge: by the book](https://dictionary.cambridge.org/us/dictionary/english/by-the-book)와 [Collins: by the book, American English](https://www.collinsdictionary.com/us/dictionary/english/by-the-book): 규칙에 따라 행동한다는 관용 의미. Collins가 반환한 미국 영어 정의도 대조했다.
- [Cambridge: break the ice](https://dictionary.cambridge.org/us/dictionary/english/break-the-ice): 처음 만난 사람들 사이의 어색함을 줄이는 관용구.
- [Cambridge: once in a blue moon](https://dictionary.cambridge.org/us/dictionary/english/once-in-a-blue-moon): 아주 드물게라는 의미와 관용구 분류.
- [Cambridge: keep an eye on](https://dictionary.cambridge.org/us/dictionary/english/keep-an-eye-on): 살피거나 돌본다는 관용 의미.
- [Cambridge: look forward to](https://dictionary.cambridge.org/us/dictionary/english/look-forward-to): 구동사 분류와 기대한다는 의미.
- [Cambridge English Grammar Today: look forward to](https://dictionary.cambridge.org/grammar/british-grammar/look-forward-to): `to`가 전치사이며 뒤에 명사구 또는 `-ing`형을 쓴다는 규칙.
- [Cambridge: take notice of](https://dictionary.cambridge.org/us/dictionary/english/take-notice-of): 주의를 기울인다는 관용 의미. 원본 동사 `notice`와 표현 안의 명사 품사를 구분했다.

## 자동 검증

실행: `node vocabulary-relations.test.js`

검증 범위: 실제 HTML 로드 순서, 원본 표제어의 고유성, 보충 항목의 실제 존재·품사·뜻 일치, 표제어·관계·표현 중복, 표현 분류와 영한 예문 필드, 기존 `phrasalVerbs`와 같은 표현의 중복 방지, 품사·뜻 불일치 차단, 중첩 데이터 동결, 원본·한글 정의 무변경, 메타데이터 개수 일치. 언어 내용의 자연스러움은 이 구조 검사만으로 증명되지 않으며 위 편집 검토와 별개다.
