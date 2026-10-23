const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {build}=require('./math-session-questions');
const c={console,Math};c.window=c;vm.createContext(c);
for(const file of ['utils.js','MathQuizData.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
const result=vm.runInContext(`MathQuizData`,c);
// Real grade6 templates: three templates must produce ten distinct number problems.
const rows=Object.values(result).find(row=>row.basic?.length>=3);
assert(rows,'real template unit exists');
const generate=q=>vm.runInContext('Utils',c).generateMathQuiz(q);
const questions=build(rows.basic.slice(0,3),generate,10);
assert.equal(questions.length,10);
assert.equal(new Set(questions.map(q=>q.question)).size,10);
assert.equal(build([{question:'Only known question'}],q=>q,10).length,1,'finite static content must not be padded with duplicates');
assert.deepEqual(build([],q=>q),[]);
console.log('Real math templates produce ten distinct problems; finite pools remain honest.');
