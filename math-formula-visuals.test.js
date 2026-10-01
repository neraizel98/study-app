const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const ctx={Math,console};ctx.window=ctx;ctx.addEventListener=()=>{};vm.createContext(ctx);
for(const file of ['MathFormulaData.js','MathFormulaDataExtra.js','MathFormulaDataVolume2.js','MathFormulaDataVolume3.js','MathFormulaDataVolume4.js','MathFormulaVisuals.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
vm.runInContext(fs.readFileSync('MathFormulaApp.js','utf8').replace('return { init, createCalculationQuestions };','return { init, createCalculationQuestions, diagramSvg };')+'\nwindow.diagramSvg=MathFormulaApp.diagramSvg;',ctx);
const f=n=>ctx.MATH_FORMULAS.find(f=>f.number===n),v=ctx.MathFormulaVisuals;
test('every later formula has a specific example and never a category-wide unrelated diagram',()=>{
 for(let n=61;n<=120;n++){
   assert.equal(f(n).diagram,`example-${n}`);assert(v.intuition[n].length>20);
   const html=v.render(f(n));assert(html.includes(`data-formula-visual="${n}"`));assert(!/undefined|NaN|공차 \+2/.test(html));
   if(n<82||n>90)assert.equal((html.match(/<li>/g)||[]).length,f(n).example.work.length+1);
 }
 assert.equal(new Set(Array.from({length:60},(_,i)=>v.render(f(i+61)))).size,60);
});
test('sequence examples independently match term, sum, and convergence identities',()=>{
 const cases={82:[3,7,11,15,19],83:[2,5,8,11,14],84:[3,6,12,24,48],85:[1,2,4,8,16],86:[1,.5,.25,.125,.0625],87:[.5,.25,.125,.0625,.03125],89:[.5,.5,.375,.25,.15625],90:[2,3,5,8,12]};
 for(const [n,values] of Object.entries(cases)){
   const data=v.sequenceExample(Number(n));assert.deepEqual(Array.from(data.terms),values);
   values.forEach((_,i)=>assert.equal(data.sums[i],values.slice(0,i+1).reduce((a,b)=>a+b,0)));
 }
 assert.equal(v.sequenceExample(83).sums[4],5*(2+14)/2);
 assert.equal(v.sequenceExample(85).sums[4],(1-2**5)/(1-2));
 for(let n=1;n<=5;n++)assert.equal(v.sequenceExample(86).sums[n-1],2*(1-2**(-n)));
 assert(v.sequenceExample(86).sums.every(x=>x<2));assert(v.sequenceExample(87).terms.every(x=>x>0));
 assert(v.render(f(88)).includes('30'));assert(v.render(f(88)).includes('100'));assert.equal(f(88).formulaLines.length,3);
});
test('plane diagrams preserve square and regular-polygon geometry and circle incidence',()=>{
 const square=ctx.diagramSvg('square',f(15));const rect=/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/.exec(square);assert.equal(rect[3],rect[4]);
 for(const n of [23,24,25,26,27,28,29,30]){
   const svg=ctx.diagramSvg(f(n).diagram,f(n)),points=/polygon points="([^"]+)"/.exec(svg)[1].split(' ').map(p=>p.split(',').map(Number));
   const lengths=points.map((p,i)=>Math.hypot(p[0]-points[(i+1)%points.length][0],p[1]-points[(i+1)%points.length][1]));
   assert(Math.max(...lengths)-Math.min(...lengths)<.2,`formula ${n}`);
 }
 assert(Math.abs(Math.hypot(344-260,74-137)-105)<1e-10);
 assert(ctx.diagramSvg('tangent-chord',f(36)).includes('M60 242H460'));assert.equal(137+105,242);
 const triangle=ctx.diagramSvg('pyramid',f(51));assert(triangle.includes('M115 220 L405 220 L330 120 Z'));assert(!triangle.includes('30L170 145'));assert(!/L\s*"/.test(triangle));
 assert.equal((ctx.diagramSvg('polygon-diagonals',f(27)).match(/<line /g)||[]).length,20);
 const net=ctx.diagramSvg('cube-net',f(59));assert.equal((net.match(/<rect/g)||[]).length,6);
});
