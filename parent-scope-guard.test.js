const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('parent-scope-guard.js','utf8');
async function setup(subject,seconds,date='2026-11-24',onTarget=false){
    const context={levelId:'level1',semesterId:'1',unitId:'u1'};
    const filename={english_reading:'english_reading',korean_vocab:'korean_vocab'}[subject]||subject;
    const target=`${filename}.html?level=${subject==='english'?'u1':'level1'}&semester=1&unit=u1`;
    const task={subject,minutes:3,required:true,status:'in_progress',context,targetUrl:target};
    const plan={date:'2026-11-24',tasks:[task]},daily={date,learningTime:{[subject]:seconds},quizTime:{[subject]:999}};
    const listeners={},redirects=[];
    const document={addEventListener:(type,fn)=>listeners[type]=fn,getElementById:()=>null,
        createElement:()=>({style:{},append(){}}),createTextNode:x=>x,querySelector:()=>({prepend(){}})};
    const location={pathname:`/${filename}.html`,href:`https://study.test/${onTarget?target:filename+'.html'}`,replace:url=>redirects.push(url)};
    const root={SmartStudy:{LocalRepository:{ready:Promise.resolve(),getActiveUser:()=> 'learner',getPreference:()=>plan,getUser:()=>({dailyStats:daily}),setPreference(){}}},
        StudyPeriods:{daily:()=>plan.date},document,location,URL,URLSearchParams,console,setTimeout,addEventListener:(type,fn)=>listeners[type]=fn};
    root.window=root;vm.runInNewContext(source,root);await listeners.DOMContentLoaded();
    return {redirects,listeners,daily,location};
}
(async()=>{
    for(const subject of ['reading','korean_vocab','english','english_reading','math']){
        assert.equal((await setup(subject,179)).redirects.length,1,subject+' stays locked before required time, regardless of quiz time');
        assert.equal((await setup(subject,180)).redirects.length,0,subject+' opens at required learning time without a quiz submission');
        assert.equal((await setup(subject,999,'2026-11-23')).redirects.length,1,'previous day cannot unlock '+subject);
        const page=await setup(subject,179,'2026-11-24',true);
        page.daily.learningTime[subject]=180;
        let prevented=false;
        page.listeners.click({target:{closest:()=>({href:'https://study.test/'+subject+'.html?unit=other'})},preventDefault(){prevented=true;},stopImmediatePropagation(){}});
        assert.equal(prevented,false,subject+' unlocks on the same open page');
    }
    console.log('Parent scope: five subjects, time boundary, date isolation and same-page unlock passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
