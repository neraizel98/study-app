# 모의고사 미공개 결과 접근권한 후속 설계

작성 2026-11-13. 상태: 조사·설계만 완료. 이 문서의 권한 변경, manifest, 데이터 이행은 구현하거나 배포하지 않았다.

## 결론과 이번 범위

현재 공식 화면은 관리자 공개 전 점수·정답·해설을 숨긴다. 그러나 `firestore.rules`의 `mockExamResults` read는 `canUse(learnerId)`이므로 연결된 학생이 미공개 결과 원문을 직접 읽을 수 있다. **서버가 미공개 결과를 학생에게 차단하는 상태가 아니다.** 과학75 계약 검증 통과를 정답 비공개 보장으로 보고해서는 안 된다.

이번 과학 작업은 기존55/신규75 문항·섹션 계약과 기존 접근권한 동작을 유지하여 검증한다. 아래 변경은 별도 데이터 이행이 필요한 후속 작업으로 남긴다. 운영 변경 전에 이행 범위와 사용자의 승인을 확인한다.

## 코드에서 확인한 원인

- `firestore.rules`: `mockExamResults`에 `allow read: if canUse(resource.data.learnerId)`가 있다.
- `firestore-repository.js`: `MockPublication.get/list`는 원문 payload를 반환한다. `list`는 학습자/주차 조건만 쓰며 published 조건이 없다.
- `mock-exam-ui.js`: list 결과를 과거회차·재응시번호·시험복원·종이시험회차 점유에 사용한다.
- `mock-exam.js`: restore는 questions/sections/initialAttempts가 있는 원문 snapshot을 요구한다. 제출 재시도는 transaction에서 기존 원문을 읽고 비교한다.
- `mock-exam-bank.js`: fingerprint에 정답 평문을 포함한다. 이를 이름만 바꿔 안전 이력에 저장하면 정답이 계속 노출된다.
- 정적 문항은행과 브라우저 draft에는 정답이 있고 브라우저가 채점한다. 일반 학습 보고서에도 최초답안과 correctAnswer가 복제된다.

## 보장 범위 구분

1. 현재: 공식 UI 공개 gate. 서버 원문 차단은 없음.
2. 아래 최소 후속안: 서버 미공개 결과 문서 read 차단 + 공식 UI gate + 답 없는 이력으로 회차/중복회피 유지.
3. 더 강한 정답 비공개: 학생에게 전달하는 문항에서 정답 제거, 정적은행/로컬 draft/보고서 동기화 경로 정리, 신뢰할 수 있는 별도 채점 필요. 아래 최소안만으로는 달성하지 않는다.

3번은 서버 Functions가 반드시 필요한 것은 아니다. 관리자 기기에서 채점하는 방식도 가능하지만 온라인 즉시 채점과 시험 생성 구조를 바꾸므로 별도 제품 결정이다. 이번 후속 최소안에 몰래 포함하지 않는다.

## 최소 후속안

### 원문과 안전 이력 분리

원문 `mockExamResults/{learnerId|assessmentId}`는 기존55/75 payload를 그대로 보존한다.

- 관리자: 해당 원문 읽기 가능.
- 학생: 본인에게 연결된 학습자의 `published == true` 원문만 읽기 가능.
- 학생 list query에도 published==true 조건 필요. 규칙은 조회결과를 자동으로 걸러주는 필터가 아니다.
- 미공개 결과 확인은 아래 이력을 먼저 읽고 `withheld`를 반환한다. 권한거부를 단순 오프라인으로 표시하지 않는다.

신규 `mockExamManifests/{learnerId|assessmentId}`에는 다음 허용 필드만 둔다.

```
schemaVersion, learnerId, assessmentId, scheduledWeekId, attemptNo,
examVersion, total, status(paper/submitted), mode,
startedAt, submittedAt, published, publishedAt,
questionIds, exposureTokens, passageIds,
submissionDigest, createdBy, createdAt
```

questions/attempts/initialAttempts/reports/responses/score/correctAnswer/answer/explanation/평문 fingerprint는 넣지 않는다. 노출 토큰은 canonical fingerprint의 SHA-256 등 결정적 digest로 만들고 후보도 같은 방식으로 비교한다. 이것은 중복회피 식별자이지 정답 암호화 보장이 아니다. 공개된 정적은행과 비교하면 원문 후보를 알아낼 수 있다는 한계가 남는다.

manifest 읽기는 canUse, 쓰기는 엄격한 필드 whitelist·타입·계정·시험ID·버전·55/75 총수·회차·주차·상태 검사. 원문과 atomic batch/transaction으로 생성하고 rules의 getAfter로 대응 원문과 핵심 메타데이터 일치를 확인한다. 학생이 공개 flag를 올리거나 원문 없이 이력만 생성할 수 없게 한다. 정답을 담은 임의 중첩 객체는 허용하지 않는다.

### 제출·종이시험·공개

- 학생 submit은 기존 비공개 원문 tx.get에 의존하지 않는다. 읽을 수 있는 manifest의 submissionDigest/제출시각/작성자 receipt로 동일 재시도를 확인한다. 같으면 저장완료, 다르면 충돌. 신규 원문+manifest는 함께 생성한다.
- 제출 digest는 정규화된 제출 snapshot의 비교값이다. 점수의 서버 진실성을 증명하는 전자서명처럼 취급하지 않는다.
- 관리자 savePaper는 원문과 manifest를 함께 생성한다. 미채점 종이시험도 회차와 문항 노출을 점유한다.
- savePaperResult는 관리자만 기존 원문을 채점 결과로 전환하고 manifest status도 함께 갱신한다.
- publish는 관리자만 원문과 manifest의 공개상태를 함께 갱신한다. 원문 점수·답안 불변 계약 유지.

### 이력과 복원 경로

- `listHistory`는 manifest를 반환하고 공개 결과 list/admin 전체 list와 분리한다.
- manifest를 가짜 questions snapshot으로 만들어 `MockExam.restore`에 넣지 않는다. 별도 이력 인덱스를 둔다.
- 시험 생성/재응시 UI는 로컬 full snapshot과 manifest를 assessmentId로 중복제거하여 최대 회차를 계산한다.
- 문항은행은 manifest exposureTokens/questionIds/passageIds를 기존 최근 노출·동일주 중복회피에 반영한다.
- 미공개 과거 시험은 대기 상태 행으로 표시한다. 원문 답안/점수 복원은 공개 후 진행한다. 미공개 종이 OMR 보고서를 학생 보고서로 미리 복사하지 않는다.
- 같은 기기의 진행 중 draft는 그대로 이어간다. manifest로 로컬 답안을 덮어쓰지 않는다.
- 이력 읽기 실패는 빈 이력과 다르다. 검증되지 않은 상태에서 1회차/다음회차를 새로 시작하지 않는다.

## 기존 데이터 이행

가장 큰 호환성 위험은 기존 미공개55/75 문서에 manifest가 없다는 점이다. read를 먼저 막으면 학생이 과거 시험을 찾거나 안전하게 새 회차를 준비할 수 없다. 학생에게 잠시 원문 read를 다시 허용하는 fallback은 보안 수정과 모순된다.

1. 관리자 권한 클라이언트에서 학습자별 기존 원문 전체를 조회하고 페이지를 끝까지 순회한다.
2. 55/75, 종이/온라인, 미공개/공개 모두 안전 manifest를 idempotent backfill한다. 기존 원문은 수정하지 않는다.
3. 원문 수·assessmentId·필수 메타데이터·이력 토큰 누락이 없는지 확인한다.
4. 관리자 전용 학습자 migration marker에 historySchemaVersion=1과 전체 백필 완료시각을 기록한다. 주마다 관리자 확인을 요구하지 않도록 학습자 단위로 관리한다.
5. 신규 쓰기에 paired manifest를 강제하는 규칙과 새 클라이언트를 맞춰 배포한다. 동시 쓰기가 가능한 이행 구간은 마지막 재조사로 누락을 확인한 뒤 marker를 확정한다.
6. marker 없는 학습자는 '빈 이력'인지 '이행 누락'인지 학생 권한으로 구분할 수 없으므로 새 회차 시작을 차단하고 관리자 동기화가 필요함을 설명한다. 신규 학습자는 관리자 최초 설정 시 빈 이력을 확인하고 marker를 만든다.
7. 오래된 클라이언트는 권한거부/paired write 실패를 숨기지 않고 새 버전으로 갱신하도록 유도한다.

이 때문에 단순 read 한 줄 수정은 독립적으로 배포하면 안 된다. 백필·marker·새 클라이언트·rules·이력 검사까지 하나의 이행으로 수행해야 한다.

## 완료 검사

- 실제 Firestore rules emulator에서 학생 unpublished get/list 거부, published query 허용, 관리자 전체 허용, 다른 학생 거부.
- manifest 금지필드, 원문 없이 manifest 쓰기, manifest 없는 새 원문 쓰기, 학생 공개상태 변경, 메타데이터 불일치 거부.
- 동일 제출 재전송은 성공하고 다른 답안/digest는 충돌. 기존 immutable 원문 유지.
- legacy55/science75 각각 paper/submitted × published/withheld 백필·조회·공개·OMR 흐름 확인.
- 한 기기/다른 기기에서 1~3회 회차 점유와 동주 문항 중복금지 확인. 미채점 종이시험도 포함.
- 이력 query 실패·marker 없음·불완전 백필에서는 새 시험 시작 차단.
- 공개 전 원문 서버 read 차단과 정적은행/로컬 채점의 한계를 최종 보고에서 별도로 명시.

위 검사와 운영 이행을 하기 전에는 이 문서를 보안 수정 완료 증거로 사용하지 않는다.
