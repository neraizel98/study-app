const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('./learning-budget-policy.js');
for(const budget of [30,45,60]){
    const tasks=P.allocate(budget);
    assert.equal(tasks.length,8);assert.equal(tasks.reduce((n,t)=>n+t.minutes,0),budget);
    const plan={budget,tasks:tasks.map(t=>({...t,status:'ready',id:t.subject,context:{unitId:'kept'}}))};
    P.migrate(plan);assert.equal(plan.allocationPolicyVersion,2);assert.equal(plan.tasks[0].context.unitId,'kept');
    const frozen=JSON.stringify(plan);P.migrate(plan);assert.equal(JSON.stringify(plan),frozen);
    for(const status of ['in_progress','completed']){
        const old={budget,tasks:tasks.map(t=>({...t,status,id:t.subject,minutes:15}))};
        const before=JSON.stringify(old);P.migrate(old);assert.equal(JSON.stringify(old),before);
    }
}
assert.equal(P.validateConfiguration(45,{english:10}).conflicts[0].minutes,4);
assert.equal(P.explicitMinimum('english',{unitId:'level1'},{english:10,levels:{english:{level1:0}}}),0);
const prefs=new Map(),date='2026-10-20',user='child';
const task={id:'a',subject:'english',minutes:4,context:{unitId:'level1'},targetUrl:'english.html?level=level1'};
prefs.set(`SmartStudy_DailyPlan_child_${date}`,{userId:user,date,tasks:[task]});
const c={URL,console,sessionStorage:{getItem:()=>JSON.stringify({user,date,taskId:'a'})},location:{href:'https://example.test/english.html?level=level1'},
    SmartStudy:{LocalRepository:{getActiveUser:()=>user,getPreference:k=>prefs.get(k)},LearningPlan:{today:()=>date}}};c.window=c;vm.createContext(c);
vm.runInContext(fs.readFileSync('learning-budget-policy.js','utf8'),c);
assert(c.SmartStudy.LearningBudgetPolicy.activeTask('english'));
c.location.href='https://example.test/english.html?level=level2';assert.equal(c.SmartStudy.LearningBudgetPolicy.activeTask('english'),null);
c.location.href='https://example.test/english.html?level=level1';c.SmartStudy.LocalRepository.getActiveUser=()=> 'other';assert.equal(c.SmartStudy.LearningBudgetPolicy.activeTask('english'),null);
console.log('Budgets: exact sums, safe migration, explicit minimum conflict and daily intent ownership/scope passed.');
