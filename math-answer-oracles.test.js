const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const oracle=require('./tests/helpers/math-answer-oracles.cjs');
const c={console,Math:Object.create(Math)};c.window=c;vm.createContext(c);
for(const f of ['utils.js','MathQuizData.js','MathQuizMiddle1.js','MathQuizMiddle1Semester2.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});
const templates=Object.entries(c.MathQuizData).flatMap(([unit,data])=>['basic','advanced','word'].flatMap(type=>(data[type]||[]).map((t,i)=>({templateId:`${unit}/${type}/${i}`,unit,type,t}))));
const known=JSON.parse(fs.readFileSync('tests/helpers/math-template-inventory.json','utf8'));
assert.deepEqual(templates.map(x=>x.templateId),known.map(x=>x.templateId),'new or removed templates require explicit inventory review');
let checked=0,unsupported=0,generated=0;const kinds=new Set();
for(const row of templates){let supported=true;for(const seed of [1,2,7,42,255,1024,65535,2147483647,...Array.from({length:Number(process.env.MATH_ORACLE_EXTRA_SEEDS||24)},(_,i)=>Math.imul(i+1,2654435761)>>>0)]){let state=seed;c.Math.random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};const q=c.Utils.generateMathQuiz(row.t);try{const result=oracle.verify(q);supported=supported&&result.supported;if(result.supported){generated++;kinds.add(q.verification.kind);}}catch(e){throw Error(`${row.templateId} seed=${seed}: ${e.message}`);}}if(supported)checked++;else unsupported++;assert.equal(supported,known.find(x=>x.templateId===row.templateId).oracleSupported,row.templateId);}
const q={question:'test',choices:['0.5','0.6','0.7','0.8'],answer:0,verification:{kind:'fractionDivision',operands:[1,1,2,1],renderedQuestion:'test'}};
assert(oracle.verify(q).supported);assert.throws(()=>oracle.verify({...q,answer:1}));assert.throws(()=>oracle.verify({...q,choices:['0.5','\\frac{1}{2}','0.7','0.8']}));assert.throws(()=>oracle.verify({...q,question:'changed'}));assert.throws(()=>oracle.expected({kind:'division',operands:[1,0]}));assert.throws(()=>c.Utils.generateMathQuiz({type:'dynamic',generator:'unregistered'}));
console.log(`Independent math answers: ${checked}/${templates.length} templates, ${generated} fixed-seed cases, ${kinds.size} oracle types; ${unsupported} templates explicitly unsupported. No global random mutation.`);
