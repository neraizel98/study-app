# Firebase 보안 설정

앱은 인증되지 않은 상태에서도 로컬 학습을 계속할 수 있지만, Firestore 동기화는 Google 인증 후에만 시작합니다.

1. Firebase Console의 Authentication > Sign-in method에서 Google 제공자를 활성화합니다.
2. Firestore에 `access/{Firebase Auth UID}` 문서를 만듭니다.
3. 보호자 문서는 `{ "role": "admin", "learnerIds": ["우준", "우준아빠"] }`, 학습자 문서는 `{ "role": "learner", "learnerIds": ["우준"] }` 형태로 저장합니다.
4. 저장소 루트에서 `firebase deploy --only firestore:rules`를 실행해 `firestore.rules`를 배포합니다.
5. 홈의 `계정 연결` 버튼으로 허용한 Google 계정에 로그인합니다.

`access` 문서가 없거나 학습자 ID가 허용 목록에 없으면 Firestore 요청은 거부되며 로컬 데이터는 그대로 유지됩니다.
