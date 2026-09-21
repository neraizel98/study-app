# Firebase 보안 설정

앱은 인증되지 않은 상태에서도 로컬 학습을 계속할 수 있지만, Firestore 동기화는 Google 인증 후에만 시작합니다.

1. Firebase Console의 Authentication > Sign-in method에서 Google 제공자를 활성화합니다.
2. Firestore에 `access/{Firebase Auth UID}` 문서를 만듭니다.
3. 보호자 문서는 `{ "role": "admin", "learnerIds": ["우준", "우준아빠"] }`, 학습자 문서는 `{ "role": "learner", "learnerIds": ["우준"] }` 형태로 저장합니다.
4. 저장소 루트에서 `firebase deploy --only firestore:rules`를 실행해 `firestore.rules`를 배포합니다.
5. 보호자 계획은 최상위 `learnerPlanSettings/{learnerId}` 문서에 저장됩니다. `budgetMinutes`는 30/45/60 중 하나이며, `grade`, `semester`, 선택적인 `publisher`, 서버가 기록하는 `updatedAt`, 로그인 UID인 `updatedBy`만 허용됩니다.

관리자 화면은 로컬 이름이 `우준아빠`인 것과 별도로, 현재 Google 로그인 UID의 `access/{uid}.role`이 `admin`인지 확인합니다. 서버 권한의 실제 경계는 Google UID이므로 같은 관리자 계정으로 로그인한 상태라면 로컬 학습자 이름이 아이 프로필이어도 서버는 관리자 요청으로 판단합니다. 같은 Google 관리자 계정을 여러 사람이 공유하면 서버는 그 사람들을 구분할 수 없으므로 관리자 계정은 공유하지 않아야 합니다.
6. 홈의 `계정 연결` 버튼으로 허용한 Google 계정에 로그인합니다.

`access` 문서가 없거나 학습자 ID가 허용 목록에 없으면 Firestore 요청은 거부되며 로컬 데이터는 그대로 유지됩니다.
