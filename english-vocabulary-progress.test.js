const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={};c.window=c;vm.createContext(c);
vm.runInContext(fs.readFileSync('VocabEng.js','utf8'),c);
const original=c.vocabData.level3.slice(0,199).map(w=>JSON.stringify(w));
assert.equal(c.vocabData.level3.length,299);
const added=c.vocabData.level3.slice(199),previous=Object.values(c.vocabData).flat().filter(w=>!added.includes(w));
// 레벨 3 covers all of 중1~3 and 레벨 4 all of 고1~3; the grade files load after VocabEng.js on every page.
const gradeFiles=['VocabEngM1.js','VocabEngM2.js','VocabEngM3.js','VocabEngH1a.js','VocabEngH1b.js','VocabEngH2a.js','VocabEngH2b.js','VocabEngH3a.js','VocabEngH3b.js'];
for(const f of gradeFiles)vm.runInContext(fs.readFileSync(f,'utf8'),c);
for(const page of ['english.html','english_course.html','today.html','mock-exam.html','admin.html','weekly_assessment.html'])
 for(const f of gradeFiles){const h=fs.readFileSync(page,'utf8');assert(h.indexOf(f)>h.indexOf('VocabEng.js'),page+' '+f);}
vm.runInContext(fs.readFileSync('english-vocabulary-progress.js','utf8'),c);
const p=c.EnglishVocabularyProgress;
// Every 영문 뜻 has a Korean reading behind the 한글 보기 button, and the page loads it.
vm.runInContext(fs.readFileSync('VocabEngDefKo.js','utf8'),c);
for(const w of Object.values(c.vocabData).flat())assert(/[가-힣]/.test(c.vocabDefKo[w.word]||''),'defKo '+w.word);
{const h=fs.readFileSync('english.html','utf8');assert(h.includes('id="toggleDefKoBtn"')&&h.indexOf('VocabEngDefKo.js')>h.indexOf('VocabEngH3b.js'));
 assert(fs.readFileSync('service-worker.js','utf8').includes("'./VocabEngDefKo.js'"));}
const words=Object.values(c.vocabData).flat().map(w=>w.word.toLowerCase().trim());
assert.equal(new Set(words).size,words.length,'a word appears in only one level and grade');
for(const level of ['level3','level4'])for(const g of [1,2,3]){
 const n=c.vocabData[level].filter(w=>w.schoolGrade===g).length;assert(n>=250,`${level} grade ${g}: ${n}`);}
for(const w of c.vocabData.level4){for(const field of ['word','pron','meaning','def','ex','exKo','pos'])assert(w[field],w.word+' '+field);
 if(/^v/.test(w.pos)){assert.equal(w.forms?.length,3,w.word);assert.equal(w.tenseExs?.length,3,w.word);}}
assert.equal(p.label('level3',{name:'standard'}),'중2');assert.equal(p.label('level4',{name:'challenge'}),'고3');assert.equal(p.label('level2',{name:'challenge'}),'');
assert(p.eligible('level4',{name:'foundation'}).every(w=>w.schoolGrade===1));
assert.equal(new Set(added.map(w=>w.word)).size,100);
for(const w of added){assert(!previous.some(old=>old.word.toLowerCase()===w.word.toLowerCase()),w.word);for(const field of ['word','pron','meaning','def','ex','exKo','pos'])assert(w[field],w.word+' '+field);}
for(let i=0;i<199;i++){const copy={...c.vocabData.level3[i]};delete copy.schoolGrade;assert.equal(JSON.stringify(copy),original[i]);}
for(const [name,grade] of [['foundation',1],['standard',2],['challenge',3]]){
 const band={name};const eligible=p.eligible('level3',band);assert(eligible.length>35);assert(eligible.every(w=>w.schoolGrade<=grade));
 const pool=p.focused('level3',band,a=>a,6);assert(pool.filter(w=>w.schoolGrade<grade).length<=6);
 assert(pool.filter(w=>w.schoolGrade===grade).length>=29);
 for(const w of pool)assert(c.vocabData.level3.includes(w));
}
assert.equal(p.eligible('level3',{name:'foundation'}).length,p.eligible('level3',{}).length);
assert.equal(p.eligible('level1',{name:'challenge'}).length,250);
assert(p.eligible('level3',{name:'foundation'}).every(w=>w.schoolGrade===1)); // Demotion locks higher grades again.
const main=fs.readFileSync('main.js','utf8'),html=fs.readFileSync('english.html','utf8');
assert(!/id="(?:speakWordUkBtn|speakDefUkBtn|speakExUkBtn|quizSpeakUkBtn)"/.test(html));
assert.equal((html.match(/aria-label="미국 영어 발음 듣기"/g)||[]).length,4);
assert(main.includes("EnglishSpeech?.speak(t, 'us')"));
assert(main.includes('EnglishVocabularyProgress.focused(currentLevel, currentQuizBand'));
assert(!main.includes("'level3'"),'grading is driven by EnglishVocabularyProgress.isGraded, not a hard-coded level');
assert(main.includes('% shuffledStudyIndices.length'));
vm.runInContext(fs.readFileSync('concept-mastery.js','utf8'),c);
const D=c.ConceptMastery.day,base=Date.UTC(2026,8,1);
const row=(id,day,type,band='foundation',correct=6)=>({sessionId:id,subject:'english',date:base+day*D,totalQuestions:6,metadata:{context:'level3',adaptiveBandSnapshot:band,initialAttempts:Array.from({length:6},(_,i)=>({question:id+'-'+i,questionType:type,correct:i<correct}))}});
const reports=[row('a',0,1),row('b',1,2),row('c',4,8,'standard'),row('d',5,7,'standard')],before=JSON.stringify(reports);
const evaluate=(rows,subject,context,now)=>c.ConceptMastery.evaluate(rows,subject,context,now);
assert.equal(p.band(reports.slice(0,1),evaluate,base+30*D).name,'foundation');
assert.equal(p.band(reports.slice(0,2),evaluate,base+30*D).name,'standard');
assert.equal(p.band(reports,evaluate,base+30*D).name,'challenge','new question formats must not reset the vocabulary grade');
assert.equal(p.band([...reports,row('e',6,8,'challenge',0),row('f',7,8,'challenge',0)],evaluate,base+30*D).name,'standard');
assert.equal(JSON.stringify(reports),before,'reading old results does not change history');
console.log('Vocabulary progression: 중1~3 / 고1~3 grade files unique and complete; 100 unique additions; original records preserved; all grade pools, demotion, review limits and US controls passed.');
