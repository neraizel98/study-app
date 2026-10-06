const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
(async()=>{
 let now=Date.parse('2026-10-07T03:00:00Z'),active='user',quota=false,interval;const prefs=new Map(),events={},stats=[];
 class ClockDate extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
 const box={innerHTML:'',textContent:'',nodes:{},addEventListener(k,f){this[k]=f;},insertAdjacentHTML(_,html){this.innerHTML+=html;},querySelectorAll(){this.nodes={};return [0,1,2].map(i=>this.nodes['answer'+i]={dataset:{warmup:String(i)}});},querySelector(s){return this.nodes[s]||(this.nodes[s]={});}};
 const repo={ready:Promise.resolve(),getActiveUser:()=>active,listReports:()=>[],getPreference:(k,d)=>prefs.get(k)||d,setPreference(k,v){if(quota){events['smartstudy:storage-error']({detail:{key:k,memoryOnly:true}});return v;}prefs.set(k,JSON.parse(JSON.stringify(v)));return v;}};
 const root={console,Date:ClockDate,SmartStudy:{LocalRepository:repo},document:{visibilityState:'visible',hidden:false,getElementById:()=>box,addEventListener(){}},addEventListener:(k,f)=>events[k]=f,setInterval:f=>(interval=f,1),clearInterval:()=>{},UserSession:{updateDailyStat:(type,subject,value)=>stats.push({type,subject,value})}};root.window=root;vm.createContext(root);
 for(const file of ['learning-session.js','english-warmup.js','english-warmup-ui.js'])vm.runInContext(fs.readFileSync(file,'utf8'),root);
 await new Promise(r=>setImmediate(r));
 const advance=seconds=>{for(let i=0;i<seconds;i++){now+=1000;interval();}};
 advance(12);assert.equal(stats.length,0,'opening the page is not active learning');
 box.pointerdown();advance(12);assert(stats.some(s=>s.subject==='grammar'&&s.value===10));assert(!stats.some(s=>s.subject==='english'));
 box.nodes.answer0.onclick();box.querySelector('#warmupNext').onclick();box.nodes.answer1.onclick();box.querySelector('#warmupNext').onclick();box.pointerdown();advance(12);assert(stats.some(s=>s.subject==='english_reading'));
 quota=true;box.nodes.answer1.onclick();assert(box.innerHTML.includes('기기에 저장하지 못했습니다'),'real memory-only event must be visible');
 quota=false;box.querySelector('#warmupSave').onclick();assert(!box.innerHTML.includes('role="alert"'));
 const snapshot=JSON.stringify([...prefs]);active='other';events.focus();assert(box.textContent.includes('계정이 바뀌었습니다'));assert.equal(JSON.stringify([...prefs]),snapshot);
 active='user';now+=86400000;events.focus();assert(box.innerHTML.includes('새로운 날짜'));assert.equal(JSON.stringify([...prefs]),snapshot);
 console.log('Warmup UI audit: active time by subject, quota warning/retry, account ownership, midnight preservation passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
