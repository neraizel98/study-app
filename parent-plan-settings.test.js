const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function repositoryFor({ role, authUid = 'google-user' }) {
    const writes = [];
    const docs = new Map([
        [`access/${authUid}`, { role, learnerIds:['우준'] }],
        ['learnerPlanSettings/우준', { budgetMinutes:45, grade:6, semester:2, publisher:'' }]
    ]);
    const db = { collection(name) { return {
        doc(id) { const path = `${name}/${id}`; return {
            collection(child) { return db.collection(`${path}/${child}`); },
            async get() { const data=docs.get(path); return { exists:Boolean(data), data:()=>data }; },
            async set(value) { writes.push({path,value}); docs.set(path,value); },
            async update(value) { writes.push({path,value}); }
        }; },
        async get() { return { forEach(){} }; }
    }; } };
    const context={window:null,console}; context.window=context;
    context.firebase={firestore:{FieldValue:{serverTimestamp:()=>({serverTimestamp:true})}}};
    context.SmartStudy={FirebaseClient:{getDB:async()=>db,getCurrentUser:async()=>({uid:authUid})}};
    vm.createContext(context);
    vm.runInContext(fs.readFileSync('firestore-repository.js','utf8'),context);
    return { repository:context.SmartStudy.FirestoreRepository,writes };
}

(async()=>{
    const learner=repositoryFor({role:'learner'});
    await assert.rejects(
        learner.repository.saveLearnerPlanSettings('우준',{budgetMinutes:30,grade:6,semester:2,publisher:''}),
        error=>error.code==='permission-denied',
        'renaming the local profile to a parent name must not grant the authenticated account admin access'
    );
    assert.equal(learner.writes.length,0);

    const admin=repositoryFor({role:'admin'});
    await admin.repository.saveLearnerPlanSettings('우준',{budgetMinutes:60,grade:6,semester:2,publisher:'미확인'});
    assert.equal(admin.writes.length,1);
    assert.equal(admin.writes[0].path,'learnerPlanSettings/우준');
    assert.equal(admin.writes[0].value.updatedBy,'google-user');
    await assert.rejects(()=>admin.repository.saveLearnerPlanSettings('우준',{budgetMinutes:20,grade:6,semester:2}));

    const rules=fs.readFileSync('firestore.rules','utf8');
    assert.match(rules,/match \/learnerPlanSettings\/\{userId\}/);
    assert.match(rules,/allow get: if canUse\(userId\)/);
    assert.match(rules,/allow create, update: if isAdmin\(\) && validLearnerPlanSettings\(\)/);
    assert.match(rules,/request\.resource\.data\.updatedBy == request\.auth\.uid/);
    assert.match(rules,/request\.resource\.data\.updatedAt == request\.time/);
    assert.match(rules,/allow delete: if false/);

    const today=fs.readFileSync('today.html','utf8');
    assert(!today.includes('id="budget"'),'learners must not receive a budget selector');
    assert(!today.includes('saveProfile'),'learners must not receive a school-profile setter');
    assert(!today.includes('updateBudget'),'learners must not receive a budget-update path');
    assert(today.indexOf('render();') < today.indexOf('refreshParentSettings();'),'cached settings must render before the cloud read starts');
    const adminPage=fs.readFileSync('admin.html','utf8');
    assert(adminPage.includes("access?.role !== 'admin'"),'admin UI must verify the authenticated access document');
    const index=fs.readFileSync('index.html','utf8');
    assert(index.includes("access?.role === 'admin'"),'the admin entry point must verify the authenticated access document');
    console.log('Parent plan settings authorization, validation, read-only learner UI, and server metadata verified.');
})().catch(error=>{console.error(error);process.exitCode=1;});
