(function (root) {
    'use strict';

    const ADMIN_UID = '우준아빠';
    const client = root.SmartStudy.FirebaseClient;
    const normalizeReports = reports => (reports || []).map(report => {
        const totalQuestions = Math.max(0, Math.floor(Number(report.totalQuestions) || 0));
        const clampScore = value => Math.min(totalQuestions, Math.max(0, Math.floor(Number(value) || 0)));
        return {
            ...report,
            totalQuestions,
            initialScore: clampScore(report.initialScore),
            finalScore: clampScore(report.finalScore)
        };
    });
    const refs = async userId => {
        const db = await client.getDB();
        const user = db.collection('users').doc(userId);
        const data = user.collection('data');
        return { db, user, reports: data.doc('reports'), wrongAnswers: data.doc('wrongAnswers') };
    };

    const Repository = {
        async getLearnerPlanSettings(userId) {
            const db = await client.getDB();
            const snap = await db.collection('learnerPlanSettings').doc(userId).get();
            return snap.exists ? snap.data() : null;
        },
        async saveLearnerPlanSettings(userId, settings) {
            const authUser = await client.getCurrentUser();
            if (!authUser) throw Object.assign(new Error('Google 로그인이 필요합니다.'), { code: 'auth/login-required' });
            const access = await this.getAccess(authUser.uid);
            if (access?.role !== 'admin') throw Object.assign(new Error('관리자 권한이 필요합니다.'), { code: 'permission-denied' });
            const budgetMinutes = Number(settings?.budgetMinutes);
            const grade = Number(settings?.grade);
            const semester = Number(settings?.semester);
            const rawEnglishActivity = settings?.englishActivity;
            if (rawEnglishActivity != null && !['vocabulary', 'reading'].includes(rawEnglishActivity)) throw new Error('학습 계획 설정값이 올바르지 않습니다.');
            const englishActivity = rawEnglishActivity || 'vocabulary';
            const scopes = { ...(settings?.scopes || {}), english_reading: settings?.scopes?.english_reading || { mode:'auto' }, korean_vocab: settings?.scopes?.korean_vocab || { mode:'auto' } };
            const SUBJECTS = ['reading', 'korean_vocab', 'english', 'english_reading', 'math'];
            const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(value);
            const sameKeys = (value, expected) => Object.keys(value || {}).sort().join('|') === expected.slice().sort().join('|');
            const validScope = (subject, scope) => scope && (scope.mode === 'auto'
                ? sameKeys(scope, ['mode'])
                : scope.mode === 'assigned' && validId(scope.unitId)
                    && (subject === 'english' ? sameKeys(scope, ['mode', 'unitId'])
                        : subject === 'english_reading' ? sameKeys(scope, ['mode', 'levelId', 'unitId']) && (root.EnglishCurriculum?.validReadingScope(scope) ?? (scope.levelId === 'grade6' && /^er[1-6]$/.test(scope.unitId)))
                        : subject === 'korean_vocab' ? sameKeys(scope, ['mode', 'levelId', 'unitId']) && ['level1', 'level2'].includes(scope.levelId)
                        : subject === 'reading' ? sameKeys(scope, ['mode', 'levelId', 'unitId']) && validId(scope.levelId)
                            : sameKeys(scope, ['mode', 'levelId', 'semesterId', 'unitId']) && validId(scope.levelId)
                                && ['1', '2'].includes(String(scope.semesterId))));
            if (![30, 45, 60].includes(budgetMinutes) || !Number.isInteger(grade) || grade < 1 || grade > 12
                || ![1, 2].includes(semester) || !scopes || !SUBJECTS.every(subject => validScope(subject, scopes[subject]))
                || Object.keys(scopes).some(subject => !SUBJECTS.includes(subject))) {
                throw new Error('학습 계획 설정값이 올바르지 않습니다.');
            }
            const db = await client.getDB();
            return db.collection('learnerPlanSettings').doc(userId).set({
                budgetMinutes, grade, semester, englishActivity,
                ...(settings.weekly ? {weekly:root.WeeklySchedule.normalize(settings.weekly)} : {}),
                scopes: Object.fromEntries(SUBJECTS.map(subject => [subject, {
                    mode: scopes[subject].mode,
                    ...(scopes[subject].mode === 'assigned' ? {
                        unitId: scopes[subject].unitId,
                        ...(scopes[subject].levelId ? { levelId: scopes[subject].levelId } : {}),
                        ...(scopes[subject].semesterId ? { semesterId: String(scopes[subject].semesterId) } : {})
                    } : {})
                }])),
                updatedAt: root.firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: authUser.uid
            }, { mergeFields: ['budgetMinutes', 'grade', 'semester', 'englishActivity', 'scopes', 'updatedAt', 'updatedBy', ...(settings.weekly ? ['weekly'] : [])] });
        },
        async getUserBundle(userId) {
            const r = await refs(userId);
            const [user, reports, wrongAnswers] = await Promise.all([
                r.user.get(), r.reports.get(), r.wrongAnswers.get()
            ]);
            return {
                user: user.exists ? user.data() : null,
                reports: reports.exists ? normalizeReports(reports.data().reports || []) : null,
                wrongAnswers: wrongAnswers.exists ? wrongAnswers.data().wrongAnswers || {} : null
            };
        },
        async putUser(userId, data) {
            const r = await refs(userId);
            return r.user.set({ ...data, _updatedAt: Date.now() }, { merge: true });
        },
        async putReports(userId, reports) {
            const r = await refs(userId);
            return r.reports.set({ reports: normalizeReports(reports), _updatedAt: Date.now() });
        },
        async putWrongAnswers(userId, wrongAnswers) {
            const r = await refs(userId);
            return r.wrongAnswers.set({ wrongAnswers, _updatedAt: Date.now() });
        },
        async getStudyTimeConfig() {
            const r = await refs(ADMIN_UID);
            const snap = await r.user.get();
            return snap.exists ? snap.data().studyTimeConfig || null : null;
        },
        async saveStudyTimeConfig(config) {
            const r = await refs(ADMIN_UID);
            return r.user.set({ studyTimeConfig: config }, { merge: true });
        },
        async listLearners() {
            const db = await client.getDB();
            const snap = await db.collection('users').get();
            const result = [];
            snap.forEach(doc => result.push({ userId: doc.id, ...doc.data() }));
            return result;
        },
        async markRewardUsed(userId, rewards) {
            const r = await refs(userId);
            return r.user.update({ 'missionProgress.rewards': rewards, _updatedAt: Date.now() });
        },
        async getAccess(uid) {
            const db = await client.getDB();
            const snap = await db.collection('access').doc(uid).get();
            return snap.exists ? snap.data() : null;
        },
        async createStudyRequest(learnerId) {
            const authUser = await client.getCurrentUser();
            if (!authUser) throw new Error('Google 로그인이 필요합니다.');
            const access = await this.getAccess(authUser.uid);
            if (access?.role !== 'admin') throw Object.assign(new Error('관리자 권한이 필요합니다.'), { code: 'permission-denied' });
            const db = await client.getDB(), ref = db.collection('learnerStudyRequests').doc(learnerId);
            const requestId = `request-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            await ref.set({ learnerId, requestId, requestedAt: root.firebase.firestore.FieldValue.serverTimestamp(), requestedBy: authUser.uid, status: 'pending' });
            return requestId;
        },
        watchStudyRequest(learnerId, next, error) {
            return client.getDB().then(db => db.collection('learnerStudyRequests').doc(learnerId)
                .onSnapshot(snap => next(snap.exists ? snap.data() : null), error));
        },
        watchLearnerActivity(learnerId, next, error) {
            return client.getDB().then(db => db.collection('learnerActivity').doc(learnerId)
                .onSnapshot(snap => next(snap.exists ? snap.data() : null), error));
        },
        async recordActualStudyStart(learnerId, event) {
            const authUser = await client.getCurrentUser();
            if (!authUser || !learnerId) return { recorded: false };
            const db = await client.getDB(), activityRef = db.collection('learnerActivity').doc(learnerId);
            const requestRef = db.collection('learnerStudyRequests').doc(learnerId);
            const eventStartedAt = Number(event?.startedAt || Date.now());
            const activityId = String(event?.activityId || `${event?.source || 'study'}-${eventStartedAt}`);
            return db.runTransaction(async transaction => {
                const [activitySnap, requestSnap] = await Promise.all([transaction.get(activityRef), transaction.get(requestRef)]);
                if (activitySnap.exists && activitySnap.data().activityId === activityId) return { recorded: false, duplicate: true };
                const request = requestSnap.exists ? requestSnap.data() : null;
                const requestMillis = request?.requestedAt?.toMillis?.() || 0;
                const acknowledge = request?.status === 'pending' && eventStartedAt >= requestMillis;
                transaction.set(activityRef, {
                    learnerId, activityId, source: String(event?.source || 'study').slice(0, 40),
                    ...(event?.subject ? { subject: String(event.subject).slice(0, 40) } : {}),
                    occurredAt: root.firebase.firestore.Timestamp.fromMillis(eventStartedAt),
                    startedAt: root.firebase.firestore.FieldValue.serverTimestamp(), startedBy: authUser.uid
                });
                if (acknowledge) transaction.update(requestRef, {
                    status: 'started', startedAt: root.firebase.firestore.FieldValue.serverTimestamp(), startedBy: authUser.uid
                });
                return { recorded: true, acknowledged: acknowledge, requestId: acknowledge ? request.requestId : null };
            });
        },
        async saveNotificationDevice(deviceId, data) {
            const db = await client.getDB();
            return db.collection('notificationDevices').doc(deviceId).set({
                ...data,
                updatedAt: root.firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        },
        async removeNotificationDevice(deviceId) {
            const db = await client.getDB();
            return db.collection('notificationDevices').doc(deviceId).delete();
        },
        async createNotificationEvent(eventId, data) {
            const db = await client.getDB();
            return db.collection('notificationEvents').doc(eventId).set({
                ...data,
                createdAt: root.firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });
        },
        getDB: () => client.getDB()
    };

    root.SmartStudy.FirestoreRepository = Repository;
})(window);

// Assessment publication stays inside the Firestore repository boundary.
(function(root){
 'use strict';const app=root.SmartStudy=root.SmartStudy||{},client=app.FirebaseClient;
 // Firestore maps may return keys in a different order. Arrays (question/choice order)
 // and every stored value must still match; JSON.stringify is not map equality.
 function sameSnapshot(a,b){
  if(a===b)return true;
  if(a===null||b===null||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;
  if(Array.isArray(a))return a.length===b.length&&a.every((value,i)=>sameSnapshot(value,b[i]));
  const keys=Object.keys(a);
  return keys.length===Object.keys(b).length&&keys.every(key=>Object.prototype.hasOwnProperty.call(b,key)&&sameSnapshot(a[key],b[key]));
 }
 const id=(user,assessment)=>{if(String(user).includes('/')||String(assessment).includes('/'))throw new Error('시험 식별자가 올바르지 않습니다.');return user+'|'+assessment;};
 async function ref(user,assessment){return (await client.getDB()).collection('mockExamResults').doc(id(user,assessment));}
 const timed=p=>{let timer;return Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('서버 확인 시간이 초과되었습니다. 다시 시도해 주세요.')),10000);})]).finally(()=>clearTimeout(timer));};
 function markPublished(data){
  const local=app.LocalRepository;if(!data.published||local?.getActiveUser?.()!==data.learnerId||!local.listReports||!local.saveReports)return;
  const rows=local.listReports(data.learnerId);if(!rows.some(r=>r.metadata?.assessmentId===data.assessmentId&&r.metadata.resultVisibility!=='published'))return;
  local.saveReports(data.learnerId,rows.map(r=>r.metadata?.assessmentId===data.assessmentId?{...r,updatedAt:Date.now(),metadata:{...r.metadata,resultVisibility:'published',publicationConfirmedAt:Date.now()}}:r));
 }
 async function get(user,assessment){const doc=await timed((await ref(user,assessment)).get({source:'server'}));if(!doc.exists)return {published:false};const data=doc.data();if(data.learnerId!==user||data.assessmentId!==assessment)throw new Error('시험 정보가 일치하지 않습니다.');markPublished(data);return {published:data.published===true,publishedAt:data.publishedAt?.toMillis?.()||null,snapshot:app.MockExam?.hydrateSnapshot?.(data.payload)||data.payload};}
 async function submit(user,snapshot){const auth=await client.getCurrentUser();if(!auth)throw new Error('계정 연결 후 다시 저장해 주세요.');const r=await ref(user,snapshot.assessmentId);await timed((await client.getDB()).runTransaction(async tx=>{const old=await tx.get(r);if(old.exists){if(old.data().payload.submittedAt!==snapshot.submittedAt||!sameSnapshot(old.data().payload.questions,snapshot.questions)||!sameSnapshot(old.data().payload.initialAttempts,snapshot.initialAttempts))throw new Error('다른 기기의 제출 기록이 있습니다. 관리자 확인이 필요합니다.');return;}tx.set(r,{learnerId:user,assessmentId:snapshot.assessmentId,payload:JSON.parse(JSON.stringify(snapshot)),published:false,publishedAt:null,publishedBy:null,createdBy:auth.uid,createdAt:root.firebase.firestore.FieldValue.serverTimestamp()});}));return {saved:true};}
 async function list(user,options={}){
  const count=Math.max(1,Math.min(12,Number(options.weeks)||1)),dates=[];
  for(let i=0;i<count;i++){const k=new Date(Date.now()+9*3600000-i*7*86400000);k.setUTCDate(k.getUTCDate()-(k.getUTCDay()+6)%7);dates.push(k.toISOString().slice(0,10));}
  if(options.week&&/^\d{4}-\d{2}-\d{2}$/.test(options.week))dates.splice(0,dates.length,options.week);
  const db=await client.getDB();
  const pages=await timed(Promise.all(dates.map(week=>db.collection('mockExamResults').where('learnerId','==',user).where('payload.scheduledWeekId','==',week).get({source:'server'}))));
  const rows=[];for(const page of pages)for(const doc of page.docs){const data=doc.data();if(data.learnerId!==user||data.payload?.userId!==user)throw new Error('시험 계정이 일치하지 않습니다.');markPublished(data);rows.push({...data,payload:app.MockExam?.hydrateSnapshot?.(data.payload)||data.payload,documentId:doc.id});}
  return rows.sort((a,b)=>Number(b.payload.submittedAt||b.payload.generatedAt)-Number(a.payload.submittedAt||a.payload.generatedAt));
 }
 // A parent's printed exam takes the week's next round like an online attempt, without answers or
 // scores. It is stored beside the online rounds so every device skips that round and its questions.
 function mockContract(p){const version=p?.examVersion||'legacy55-v1';return version==='science75-v1'?{total:75,order:['reading','english','math','hanja','science'],reports:9}:version==='legacy55-v1'?{total:55,order:['reading','english','math','hanja'],reports:8}:null;}
 async function savePaper(user,payload){
  const auth=await client.getCurrentUser(),access=auth&&await app.FirestoreRepository.getAccess(auth.uid);if(access?.role!=='admin')throw new Error('관리자 권한이 필요합니다.');
  const c=mockContract(payload),n=Number(payload?.attemptNo);if(payload?.status!=='paper'||payload.mode!=='paper'||payload.kind!=='mock'||payload.userId!==user||!Number.isInteger(n)||n<1||n>3||!Array.isArray(payload.questions)||payload.questions.length!==c?.total||payload.submittedAt!==undefined||payload.initialAttempts!==undefined)throw new Error('종이 시험 정보가 올바르지 않습니다.');
  const taken=(await list(user,{week:payload.scheduledWeekId})).map(r=>Number(r.payload.attemptNo)||1);
  if(taken.includes(n)||Math.max(0,...taken)+1!==n)throw new Error(`${n}회차는 이미 기록이 있거나 아직 만들 차례가 아닙니다. 기존 기록을 덮어쓰지 않았습니다.`);
  const r=await ref(user,payload.assessmentId);await timed((await client.getDB()).runTransaction(async tx=>{const old=await tx.get(r);if(old.exists)throw new Error('같은 시험 기록이 이미 있습니다. 덮어쓰지 않았습니다.');tx.set(r,{learnerId:user,assessmentId:payload.assessmentId,payload:JSON.parse(JSON.stringify(payload)),published:false,publishedAt:null,publishedBy:null,createdBy:auth.uid,createdAt:root.firebase.firestore.FieldValue.serverTimestamp()});}));return {saved:true};
 }
 // The parent's OMR scoring turns the printed round into a submitted, still unpublished result, once.
 // The round, assessmentId and questions stay; a scored or published round is never re-scored.
 async function savePaperResult(user,payload){
  const auth=await client.getCurrentUser(),access=auth&&await app.FirestoreRepository.getAccess(auth.uid);if(access?.role!=='admin')throw new Error('관리자 권한이 필요합니다.');
  const sections=payload?.sections||[],c=mockContract(payload),order=c?.order||[];
  if(payload?.status!=='submitted'||payload.mode!=='paper'||payload.kind!=='mock'||payload.userId!==user||payload.integrity?.source!=='paper-omr'||!Number.isInteger(payload.submittedAt)
   ||sections.length!==order.length||!sections.every((s,i)=>s.id===order[i]&&s.state==='ended')||payload.questions?.length!==c?.total||payload.initialAttempts?.length!==c?.total||!(payload.reports?.length>=4&&payload.reports.length<=c?.reports))throw new Error('채점 결과가 올바르지 않습니다.');
  const r=await ref(user,payload.assessmentId);
  await timed((await client.getDB()).runTransaction(async tx=>{const old=await tx.get(r);if(!old.exists)throw new Error('종이 시험지 기록이 없습니다.');const data=old.data(),p=data.payload||{};
   if(data.published)throw new Error('이미 공개한 결과는 다시 채점할 수 없습니다.');
   if(p.status!=='paper')throw new Error('이미 채점한 회차입니다. 기존 결과를 덮어쓰지 않았습니다.');
   if(data.learnerId!==user||p.userId!==user||p.assessmentId!==payload.assessmentId||Number(p.attemptNo)!==payload.attemptNo||p.scheduledWeekId!==payload.scheduledWeekId||(p.examVersion||'legacy55-v1')!==(payload.examVersion||'legacy55-v1')||!sameSnapshot(p.questions,payload.questions))throw new Error('시험지와 채점 정보가 일치하지 않습니다.');
   tx.update(r,{payload:JSON.parse(JSON.stringify(payload))});}));
  return {saved:true};
 }
 async function publish(user,assessment){const auth=await client.getCurrentUser(),access=auth&&await app.FirestoreRepository.getAccess(auth.uid);if(access?.role!=='admin')throw new Error('관리자 권한이 필요합니다.');const r=await ref(user,assessment),db=await client.getDB();await timed(db.runTransaction(async tx=>{const doc=await tx.get(r);if(!doc.exists)throw new Error('저장된 시험이 없습니다.');if(doc.data().payload?.status==='paper')throw new Error('종이 시험은 채점 기록이 없어 공개할 수 없습니다.');if(doc.data().published)return;tx.update(r,{published:true,publishedAt:root.firebase.firestore.FieldValue.serverTimestamp(),publishedBy:auth.uid});}));return get(user,assessment);}
 // Diagnostic selection is a separate admin-owned document, never an exam payload edit.
 const settingsRef=async user=>{
  if(typeof user!=='string'||!user.trim()||user.includes('/')||user.length>160)throw new Error('학습자 식별자가 올바르지 않습니다.');
  return (await client.getDB()).collection('mockLearningSettings').doc(String(user));
 };
 const settingsData=data=>({...data,updatedAt:data.updatedAt?.toMillis?.()||Number(data.updatedAt)||0});
 const validAssessmentId=(user,value)=>typeof value==='string'&&value.startsWith(`mock:${user}:`)&&value.length<=300&&!value.includes('/');
 async function getLearningSettings(user){
  const doc=await timed((await settingsRef(user)).get({source:'server'}));if(!doc.exists)return null;
  const d=doc.data(),normalized=settingsData(d),keys=['schemaVersion','learnerId','scope','assessmentId','confirmedUnassisted','updatedAt','updatedBy'];
  if(Object.keys(d).length!==keys.length||!keys.every(k=>Object.prototype.hasOwnProperty.call(d,k))||d.learnerId!==user||d.schemaVersion!==1||d.scope!=='english'||!Number.isFinite(normalized.updatedAt)||normalized.updatedAt<=0||typeof d.updatedBy!=='string'||!d.updatedBy||!(d.assessmentId===null?d.confirmedUnassisted===false:validAssessmentId(user,d.assessmentId)&&d.confirmedUnassisted===true))throw new Error('진단 기준 정보를 확인하지 못했습니다.');
  return normalized;
 }
 async function setLearningSettings(user,value){
  const auth=await client.getCurrentUser(),access=auth&&await app.FirestoreRepository.getAccess(auth.uid);
  if(access?.role!=='admin')throw new Error('관리자만 진단 기준을 지정할 수 있습니다.');
  const assessmentId=value?.assessmentId;
  if(!(assessmentId===null?value?.confirmedUnassisted===false:validAssessmentId(user,assessmentId)&&value?.confirmedUnassisted===true))throw new Error('채점 내용과 도움 없이 응시했는지 먼저 확인해 주세요.');
  const r=await settingsRef(user),db=await client.getDB();
  await timed(db.runTransaction(async tx=>{
   if(assessmentId!==null){const exam=await tx.get(await ref(user,assessmentId)),d=exam.exists?exam.data():null,p=d?.payload;
    const c=mockContract(p),order=c?.order||[];
    if(!d||d.learnerId!==user||d.assessmentId!==assessmentId||p?.userId!==user||p.assessmentId!==assessmentId||p.kind!=='mock'||p.status!=='submitted'||!Number.isInteger(p.submittedAt)||p.submittedAt<=0||!Array.isArray(p.sections)||p.sections.length!==order.length||!p.sections.every((s,i)=>s?.id===order[i]&&s.state==='ended')||!Array.isArray(p.questions)||p.questions.length!==c?.total||!p.questions.every(q=>typeof q?.id==='string'&&q.id&&typeof q.subject==='string')||!Array.isArray(p.initialAttempts)||p.initialAttempts.length!==c?.total||new Set(p.questions.map(q=>q?.id)).size!==c?.total||new Set(p.initialAttempts.map(a=>a?.questionId)).size!==c?.total||!p.initialAttempts.every(a=>a&&typeof a.correct==='boolean'&&p.questions.some(q=>q?.id===a.questionId&&q.subject===a.subject)))throw new Error('채점과 제출이 완료된 시험만 진단 기준으로 지정할 수 있습니다.');
    if(p.integrity?.translationDetected===true)throw new Error('번역이 감지된 시험은 진단 기준에서 제외해 주세요.');
   }
   tx.set(r,{schemaVersion:1,learnerId:user,scope:'english',assessmentId,confirmedUnassisted:assessmentId!==null,updatedBy:auth.uid,updatedAt:root.firebase.firestore.FieldValue.serverTimestamp()});
  }));
  return getLearningSettings(user);
 }
 const reviewKeys=['eventId','assessmentId','questionId','correct','status','reviewedAt'];
 function validReviewEvent(user,value){
  return value&&typeof value==='object'&&Object.keys(value).length===reviewKeys.length&&reviewKeys.every(k=>Object.prototype.hasOwnProperty.call(value,k))
   &&typeof value.eventId==='string'&&/^[A-Za-z0-9_.:-]{1,160}$/.test(value.eventId)&&validAssessmentId(user,value.assessmentId)
   &&typeof value.questionId==='string'&&value.questionId.trim().length>0&&value.questionId.length<=300
   &&typeof value.correct==='boolean'&&value.status===(value.correct?'correct':'wrong')&&Number.isInteger(value.reviewedAt)&&value.reviewedAt>0;
 }
 async function reviewCollection(user){
  await settingsRef(user);const auth=await client.getCurrentUser(),access=auth&&await app.FirestoreRepository.getAccess(auth.uid);
  if(!auth||(access?.role!=='admin'&&!access?.learnerIds?.includes(user)))throw new Error('이 학습자의 복습 기록에 접근할 수 없습니다.');
  return (await client.getDB()).collection('mockLearningReviews').doc(user).collection('events');
 }
 async function listReviewEvents(user){
  const page=await timed((await reviewCollection(user)).get({source:'server'}));
  return page.docs.map(doc=>{const value=doc.data();if(!validReviewEvent(user,value)||value.eventId!==doc.id)throw new Error('복습 기록 정보를 확인하지 못했습니다.');return value;});
 }
 async function saveReviewEvent(user,value){
  if(!validReviewEvent(user,value)||value.reviewedAt>Date.now()+300000)throw new Error('복습 기록 정보가 올바르지 않습니다.');
  const event=JSON.parse(JSON.stringify(value)),r=(await reviewCollection(user)).doc(event.eventId),db=await client.getDB();
  await timed(db.runTransaction(async tx=>{
   const old=await tx.get(r);
   if(old.exists){if(!sameSnapshot(old.data(),event))throw new Error('이미 저장된 복습 기록과 내용이 다릅니다. 기존 기록은 유지됩니다.');return;}
   const source=await tx.get(await ref(user,event.assessmentId)),d=source.exists?source.data():null,p=d?.payload;
   if(!d||d.learnerId!==user||d.assessmentId!==event.assessmentId||d.published!==true||p?.userId!==user||p.assessmentId!==event.assessmentId||p.kind!=='mock'||p.status!=='submitted'||!Number.isInteger(p.submittedAt)||event.reviewedAt<=p.submittedAt||!Array.isArray(p.questions)||p.questions.filter(q=>q?.id===event.questionId).length!==1)throw new Error('공개된 시험의 문항만 복습 기록으로 저장할 수 있습니다.');
   tx.set(r,event);
  }));
  return event;
 }
 app.MockLearningRepository={get:getLearningSettings,set:setLearningSettings,listReviewEvents,saveReviewEvent};
 app.MockPublication={get,submit,list,publish,savePaper,savePaperResult,id};
})(window);
