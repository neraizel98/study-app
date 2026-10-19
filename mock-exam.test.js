const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function harness() {
    const values = new Map(), reports = new Map(); let active = '우준';
    const local = { getActiveUser: () => active, getPreference: (key, fallback) => values.has(key) ? structuredClone(values.get(key)) : fallback,
        setPreference: (key, value) => values.set(key, structuredClone(value)), listReports: user => structuredClone(reports.get(user) || []),
        saveReports: (user, items) => reports.set(user, structuredClone(items)), flush: async () => {} };
    const app = { LocalRepository: local, MockExamBank: { grade: (q, response) => ({ correct: q.answer === response, answer: q.answer }) } };
    const context = { SmartStudy: app, module: { exports: {} }, Date, console, setTimeout, clearTimeout }; context.window = context;
    vm.runInNewContext(fs.readFileSync('mock-exam.js', 'utf8'), context);
    const api = app.MockExam;
    const bank = { complete: true, version: 'test', items: Object.entries(api.areas).flatMap(([subject, count]) => Array.from({length:count}, (_, index) =>
        ({ id:`${subject}:${index}`, subject, question:`${subject} 문항 ${index}`, choices:['A','B','C'], answer:'A', explanation:'설명', context:{unitId:`${subject}-unit`} }))) };
    return { api, app, bank, local, switchUser: user => { active = user; } };
}
const start = Date.parse('2026-10-17T00:00:00Z');
test('55문항·70분 배분, 중복 ID와 영역 부족 차단', () => {
    const h = harness(), draft = h.api.create('우준',h.bank,start);
    assert.equal(draft.questions.length,55); assert.equal(draft.sections.reduce((sum,s)=>sum+s.durationSeconds,0),4200);
    assert.equal(draft.scheduledWeekId,'2026-10-12');
    const duplicate = structuredClone(h.bank); duplicate.items[1].id = duplicate.items[0].id; assert.equal(h.api.validateBank(duplicate),false);
    const missing = structuredClone(h.bank); missing.items.pop(); assert.equal(h.api.validateBank(missing),false);
});
test('종료 과목 불변·다음 과목 진행·새로고침 시 같은 제한시간', () => {
    const h=harness(),draft=h.api.create('우준',h.bank,start),week=draft.scheduledWeekId;
    h.api.answer('우준',week,'reading:0','A',start+1000);
    const ended=h.api.finishSection('우준',week,start+2000),deadline=ended.sections[1].deadline;
    h.api.answer('우준',week,'reading:0','B',start+3000);
    assert.equal(h.api.get('우준',week).responses['reading:0'],'A');
    assert.equal(h.api.reconcile('우준',week,start+10000).sections[1].deadline,deadline);
    assert.equal(h.api.get('우준',week).sections[0].initialAttempts[0].correct,true);
});
test('재접속은 제한시간을 초기화하지 않으며 휴식 5분 뒤 자동 수학 시작',()=>{
    const h=harness(),draft=h.api.create('우준',h.bank,start),week=draft.scheduledWeekId;
    let current=h.api.reconcile('우준',week,start+40*60000);
    assert.equal(current.sections[0].timedOut,true); assert.equal(current.sections[1].timedOut,true);
    assert.equal(current.break.deadline,start+45*60000); assert.equal(current.sections[2].state,'pending');
    current=h.api.reconcile('우준',week,start+46*60000);
    assert.equal(current.sections[2].startedAt,start+45*60000); assert.equal(current.sections[2].deadline,start+65*60000);
    current=h.api.reconcile('우준',week,start+90*60000);
    assert.equal(current.submittedAt,start+75*60000); assert.equal(current.sections[3].initialAttempts.length,10);
    assert.equal(current.resultVisibility,'withheld'); assert.equal(current.sections[3].initialAttempts[0].unanswered,true);
});
test('다른 계정의 수정 차단·학습자별 초안 분리',()=>{
    const h=harness(),draft=h.api.create('우준',h.bank,start),week=draft.scheduledWeekId;
    h.switchUser('다른학생'); assert.throws(()=>h.api.answer('우준',week,'reading:0','B',start+1000),/계정/);
    assert.equal(h.api.get('다른학생',week),null); assert.equal(h.api.getById('다른학생',draft.assessmentId),null);
    const other=h.api.create('다른학생',h.bank,start); assert.notEqual(other.assessmentId,draft.assessmentId);
});
test('과목별 저장 재전송 7보고서 한 번, 공식 원본 과목 보존, 최초 점수 불변',async()=>{
    const h=harness(),draft=h.api.create('우준',h.bank,start),week=draft.scheduledWeekId;
    h.api.answer('우준',week,'reading:0','A',start+1000);
    h.api.finishSection('우준',week,start+2000); await h.api.saveReports('우준',week);
    assert.equal(h.local.listReports('우준').length,1); assert.equal(h.local.listReports('우준')[0].metadata.examComplete,false);
    h.api.reconcile('우준',week,start+90*60000); await h.api.saveReports('우준',week); await h.api.saveReports('우준',week);
    const reports=h.local.listReports('우준'); assert.equal(reports.length,7); assert.equal(reports[0].initialScore,1);
    assert.ok(reports.every(r=>r.metadata.examComplete&&r.metadata.resultVisibility==='withheld'));
    const formula=reports.find(r=>r.metadata.assessmentSubject==='math_formula'); assert.equal(formula.subject,'math'); assert.equal(formula.metadata.source,'math-formula');
    h.api.answer('우준',week,'reading:0','B',start+100*60000); assert.equal(h.api.get('우준',week).responses['reading:0'],'A');
    const snapshot=h.api.submissionSnapshot(h.api.get('우준',week)); assert.equal(snapshot.reports.length,7); assert.equal(snapshot.initialAttempts.length,55);
});
test('문항과 첫 채점 스냅샷은 원본 은행 수정 후에도 보존',()=>{
    const h=harness(),draft=h.api.create('우준',h.bank,start),week=draft.scheduledWeekId;
    h.bank.items[0].answer='B'; h.api.answer('우준',week,'reading:0','A',start+1000); h.api.finishSection('우준',week,start+2000);
    const first=h.api.get('우준',week); first.responses['reading:0']='C'; first.sections[0].initialAttempts[0].correct=false;
    assert.equal(h.api.get('우준',week).sections[0].initialAttempts[0].correct,true);
    assert.equal(h.api.get('우준',week).questions[0].answer,'A');
});
test('KST 일요일 시작·월요일 제출에도 귀속 주 유지',()=>{
    const h=harness(),now=Date.parse('2026-10-18T14:59:00Z'),draft=h.api.create('우준',h.bank,now);
    const result=h.api.reconcile('우준',draft.scheduledWeekId,now+90*60000);
    assert.equal(result.scheduledWeekId,'2026-10-12'); assert.equal(h.api.weekId(now+90*60000),'2026-10-19');
});
test('클라우드 실패는 제출을 보존하고 재시도는 동일 시험 ID',async()=>{
    const h=harness(),draft=h.api.create('우준',h.bank,start),week=draft.scheduledWeekId;
    h.api.reconcile('우준',week,start+90*60000); h.app.MockPublication={submit:async()=>{throw new Error('offline');}};
    assert.equal((await h.api.sync('우준',week)).synced,false); assert.equal(h.api.get('우준',week).syncStatus,'pending');
    let sent; h.app.MockPublication={submit:async(user,snapshot)=>{sent=snapshot; return true;}};
    assert.equal((await h.api.sync('우준',week)).synced,true); assert.equal(sent.assessmentId,draft.assessmentId); assert.equal(h.local.listReports('우준').length,7);
});
test('엄격한 선택지와 시험 시작 후 시간설정 스냅샷',()=>{
    const h=harness(),draft=h.api.create('우준',h.bank,start,{sectionMinutes:{reading:25}}),week=draft.scheduledWeekId;
    assert.equal(draft.sections[0].durationSeconds,1500); assert.throws(()=>h.api.answer('우준',week,'reading:0','D',start+1000),/보기/);
    assert.equal(h.api.create('우준',h.bank,start+5000,{sectionMinutes:{reading:60}}).sections[0].durationSeconds,1500);
});
test('학생 결과 조회는 서버 공개 true 확인 전 결과를 반환하지 않음',async()=>{
    const h=harness(),draft=h.api.create('우준',h.bank,start);h.api.reconcile('우준',draft.scheduledWeekId,start+90*60000);
    const context={SmartStudy:h.app,module:{exports:{}},Date,console};context.window=context;
    vm.runInNewContext(fs.readFileSync('mock-exam-results.js','utf8'),context);
    h.app.MockPublication={get:async()=>({published:false})};assert.equal((await h.app.MockExamResults.load('우준',draft.assessmentId)).published,false);
    h.app.MockPublication={get:async()=>{throw new Error('offline');}};assert.equal((await h.app.MockExamResults.load('우준',draft.assessmentId)).published,false);
    h.app.MockPublication={get:async()=>({published:true,snapshot:h.api.get('우준',draft.scheduledWeekId)})};
    assert.equal((await h.app.MockExamResults.load('우준',draft.assessmentId)).published,true);
    h.switchUser('다른학생');assert.equal((await h.app.MockExamResults.load('우준',draft.assessmentId)).published,false);
});
test('서로 다른 기기의 충돌 제출은 조용히 합치지 않고 거부',async()=>{
    const h=harness(),draft=h.api.create('우준',h.bank,start),week=draft.scheduledWeekId;
    h.api.finishSection('우준',week,start+2000);await h.api.saveReports('우준',week);
    const records=h.local.listReports('우준');records[0].metadata.initialAttempts[0].selectedAnswer='B';h.local.saveReports('우준',records);
    await assert.rejects(()=>h.api.saveReports('우준',week),/다른 기기/);
    assert.equal(h.local.listReports('우준')[0].metadata.initialAttempts[0].selectedAnswer,'B');
});
test('시간 종료와 제출 확인이 겹쳐도 다음 과목을 조기 제출하지 않음',()=>{
    const h=harness(),draft=h.api.create('우준',h.bank,start),week=draft.scheduledWeekId;
    const result=h.api.finishSection('우준',week,start+20*60000+1,'reading');
    assert.equal(result.sections[0].state,'ended');assert.equal(result.sections[1].state,'active');assert.equal(result.sections[1].endedAt,null);
});
test('닫힌 앱의 시험시간은 실제 활동시간으로 추정하지 않음',()=>{
    const h=harness(),draft=h.api.create('우준',h.bank,start),week=draft.scheduledWeekId;
    h.api.recordActivity('우준',week,'reading',10,start+10000);
    const final=h.api.reconcile('우준',week,start+90*60000),reports=h.api.reportsFor(final);
    assert.equal(final.sections[0].activeSeconds,10);assert.equal(final.sections[0].elapsedSeconds,1200);
    assert.equal(final.sections[1].activeSeconds,0);assert.equal(final.sections[2].activeSeconds,0);
    assert.equal(reports.reduce((sum,r)=>sum+r.timeSpentSeconds,0),10);
    assert.equal(reports.reduce((sum,r)=>sum+r.metadata.elapsedSeconds,0),4200);
});
test('영어 세부영역과 수학 공식 활동시간은 과목 안에서 배분하고 중복하지 않음',()=>{
    const h=harness(),draft=h.api.create('우준',h.bank,start),week=draft.scheduledWeekId;
    h.api.finishSection('우준',week,start+1000);
    h.api.recordActivity('우준',week,'english',30,start+31000);h.api.finishSection('우준',week,start+32000);
    assert.equal(h.api.recordActivity('우준',week,'math',100,start+100000).sections[2].activeSeconds,0,'휴식은 수학 시간으로 저장하지 않음');
    h.api.skipBreak('우준',week,start+100000);h.api.recordActivity('우준',week,'math',15,start+115000);h.api.finishSection('우준',week,start+116000);
    const result=h.api.get('우준',week),reports=h.api.reportsFor(result);
    assert.equal(reports.filter(r=>r.metadata.sectionId==='english').reduce((s,r)=>s+r.timeSpentSeconds,0),30);
    assert.equal(reports.filter(r=>r.metadata.sectionId==='math').reduce((s,r)=>s+r.timeSpentSeconds,0),15);
    assert.equal(reports.find(r=>r.metadata.assessmentSubject==='math_formula').timeSpentSeconds,3);
});
test('재접속 활동시간은 저장한 델타만 유지하며 종료 과목과 다른 계정은 변경하지 않음',()=>{
    const h=harness(),draft=h.api.create('우준',h.bank,start),week=draft.scheduledWeekId;
    h.api.recordActivity('우준',week,'reading',5,start+5000);
    assert.equal(h.api.get('우준',week).sections[0].activeSeconds,5);
    h.api.reconcile('우준',week,start+100000);assert.equal(h.api.get('우준',week).sections[0].activeSeconds,5);
    h.api.recordActivity('우준',week,'reading',5,start+105000);h.api.finishSection('우준',week,start+106000);
    assert.equal(h.api.recordActivity('우준',week,'reading',100,start+107000).sections[0].activeSeconds,10);
    h.switchUser('다른학생');assert.throws(()=>h.api.recordActivity('우준',week,'english',10,start+118000),/계정/);
});
test('공개된 모의고사의 첫 시도 오답은 과목별 오답노트에 한 번만 등록',async()=>{
    const h=harness(),saved=[],context={SmartStudy:h.app,module:{exports:{}},Date,console,MATH_FORMULAS:[{number:17,level:'초등 4학년'}],WrongNote:{save:(...args)=>saved.push(args)}};context.window=context;
    vm.runInNewContext(fs.readFileSync('mock-wrong-note.js','utf8'),context);
    const attempt=(subject,extra)=>({subject,questionId:`${subject}:q`,question:'문항',correct:false,selectedAnswer:'x',correctAnswer:'y',choices:['x','y'],...extra});
    const assessmentId='mock:우준:2026-10-12:first',attempts=[
        attempt('math',{generator:'frac_div_frac_compare',context:{levelId:'elementary-6',semesterId:'2',unitId:'e6-2-u1',title:'1. 분수의 나눗셈'}}),
        attempt('math_formula',{conceptId:'formula-recall',context:{unitId:'formula-17',title:'직사각형의 둘레 공식'}}),
        attempt('hanja',{question:'題의 뜻과 음은?',correctAnswer:'제목 제',context:{unitId:'level6'}}),
        attempt('english',{question:'“물고기”의 뜻을 가진 영어 단어는?',correctAnswer:'fish',context:{unitId:'level2'}}),
        attempt('reading',{context:{unitId:'r7'}}),{...attempt('math',{}),correct:true}];
    assert.equal(h.app.MockWrongNote.note('우준',assessmentId,attempts),5);
    const bySubject=Object.fromEntries(saved.map(([subject,data])=>[subject+(data.levelId==='formula'?':formula':''),data]));
    assert.deepEqual([bySubject.math.levelId,bySubject.math.semesterId,bySubject.math.unitId,bySubject.math.type],['elementary-6','2','e6-2-u1','frac_div_frac_compare']);
    assert.deepEqual([bySubject['math:formula'].unitId,bySubject['math:formula'].semesterId,bySubject['math:formula'].type],['formula-17','초등 4학년','formula-recall']);
    assert.deepEqual([bySubject.hanja.hanja,bySubject.hanja.meaning,bySubject.hanja.eum],['題','제목','제']);
    assert.deepEqual([bySubject.english.word,bySubject.english.meaning],['fish','물고기']);
    assert.ok(saved.every(([,,status,session,round])=>status==='wrong'&&session===assessmentId&&round===1));
    assert.equal(h.app.MockWrongNote.note('우준',assessmentId,attempts),0,'a second load does not add the same exam again');
    // A result published earlier is picked up from the device's reports; withheld results are not.
    h.local.saveReports('우준',[{sessionId:'a:math',metadata:{mockExam:true,assessmentId:'mock:a',resultVisibility:'published',initialAttempts:attempts.slice(0,1)}},
        {sessionId:'b:math',metadata:{mockExam:true,assessmentId:'mock:b',resultVisibility:'withheld',initialAttempts:attempts.slice(0,1)}}]);
    saved.length=0;assert.equal(h.app.MockWrongNote.sweep('우준'),1);assert.equal(h.app.MockWrongNote.sweep('우준'),0);assert.equal(saved.length,1);
});
