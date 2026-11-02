const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8');
const base=['EnglishGrammarData.js','EnglishGrammarExpanded.js','english-curriculum.js','EnglishReadingData.js','EnglishReadingMore1.js','EnglishReadingMore2.js','EnglishReadingSecondary.js','ReadingSentenceNotesPrimary.js','ReadingSentenceNotesSecondary.js','reading-sentence-guide.js'];
const additions=['EnglishReadingExpansion.js','EnglishReadingMiddleExpansion.js','EnglishReadingHighExpansion.js'];
function load(files=base){const c={console};c.window=c;vm.createContext(c);for(const f of files)vm.runInContext(read(f),c,{filename:f});return c;}
function run(c,files){for(const f of files)vm.runInContext(read(f),c,{filename:f});}

test('36 new complete graded readings preserve all original content and existing assigned scopes',()=>{
 const c=load(),old=new Map(c.EnglishReadingData.units.flatMap(u=>u.passages.map(p=>[p.id,JSON.stringify(p)]))),oldNotes=JSON.stringify(c.EnglishReadingSentenceNotes),unitIds=c.EnglishReadingData.units.map(u=>u.id).join('|');
 assert.equal(old.size,80);run(c,additions);const data=c.EnglishReadingData,all=data.units.flatMap(u=>u.passages),added=all.filter(p=>!old.has(p.id));
 assert.equal(all.length,116);assert.equal(added.length,36);assert.equal(data.units.map(u=>u.id).join('|'),unitIds,'existing parent-assigned unit identifiers stay valid');
 for(const p of all.filter(p=>old.has(p.id)))assert.equal(JSON.stringify(p),old.get(p.id),'old passage unchanged '+p.id);
 const notesBefore=JSON.parse(oldNotes);for(const id of old.keys())assert.equal(JSON.stringify(c.EnglishReadingSentenceNotes[id]),JSON.stringify(notesBefore[id]),'old guide unchanged '+id);
 for(const stage of ['middle','high'])for(const grade of [1,2,3]){
  const id=stage+grade,units=c.EnglishCurriculum.unitsForGrade(data,id),ps=units.flatMap(u=>u.passages);assert.equal(units.length,2);assert.equal(ps.length,12,id+' doubled');
  for(const band of [0,1,2])assert.equal(ps.filter(p=>p.band===band).length,4,id+' band coverage');
  for(const u of units){assert(c.EnglishCurriculum.validReadingScope({levelId:id,unitId:u.id}));assert.equal(u.passages.length,6);}
 }
 assert.equal(all.filter(p=>(p.gradeId||'grade6')==='grade6').length,44);
 const questions=added.flatMap(p=>p.questions);assert.equal(questions.length,216);assert.equal(new Set(all.flatMap(p=>p.questions.map(q=>q.id))).size,all.reduce((n,p)=>n+p.questions.length,0));
 const positions=[0,1,2,3].map(n=>questions.filter(q=>q.answerIndex===n).length);assert(positions.every(n=>n>=30),'varied answer positions '+positions);
 const sourceTexts=new Set();let sentenceCount=0;
 for(const p of added){
  const minimumWords={middle1:90,middle2:120,middle3:145,high1:170,high2:190,high3:210};assert(p.sentences.join(' ').split(/\s+/).length>=minimumWords[p.gradeId],p.id+' substantive grade-targeted length');assert(!sourceTexts.has(p.sentences.join(' ')));sourceTexts.add(p.sentences.join(' '));assert(p.sentences.length>=7);assert.equal(p.sentences.length,p.translations.length);assert.equal(p.questions.length,6);
  assert.equal(new Set(p.questions.map(q=>q.type)).size,6);assert.equal(p.source.kind,'original');assert(p.grammarNotes.every(g=>g.title&&g.text));
  const notes=c.EnglishReadingSentenceNotes[p.id];assert.equal(notes.length,p.sentences.length);
  p.sentences.forEach((sentence,i)=>{assert(c.ReadingSentenceGuide.valid(notes[i],sentence),p.id+' note'+i);assert(/[가-힣]/.test(p.translations[i]));sentenceCount++;});
  for(const ref of p.grammarRefs){const u=c.EnglishGrammarData[ref.stageId]?.units.find(u=>u.id===ref.unitId);assert(u?.lessons[ref.lessonIndex||0],p.id+' real grammar link');}
  for(const q of p.questions){assert(/[A-Za-z]/.test(q.prompt)&&!/[가-힣]/.test(q.prompt),q.id+' English original question');assert(/[가-힣]/.test(q.promptKo));assert(q.explanation.length>=20);assert.equal(q.choices.length,4);assert(q.choices.every(choice=>!/[가-힣]/.test(choice)),q.id+' English choices');assert.equal(new Set(q.choices).size,4);assert(q.evidence.length>0&&q.evidence.every(i=>Number.isInteger(i)&&i>=0&&i<p.sentences.length));}
 }
 assert(sentenceCount>=270,'complete original sentence notes');
 const before=JSON.stringify(data);run(c,additions);assert.equal(JSON.stringify(data),before,'duplicate bundle loading does not append duplicates or overwrite');
 assert.throws(()=>c.EnglishReadingExpansion.register([{id:'mr1-unit1-p1'}]),/overwrite/);assert.equal(JSON.stringify(data),before,'old passage collision rejected without mutation');
 console.log('New reading inventory: '+added.length+' passages, '+questions.length+' questions, '+sentenceCount+' authored sentence notes; answer positions '+positions.join('/'));
});

test('every reading consumer loads the expansion before using the curriculum, with offline assets registered',()=>{
 const pages=['admin.html','english_course.html','english_reading.html','mock-exam.html','today.html','weekly-review.html','weekly_assessment.html'];
 for(const file of pages){const html=read(file),ids=['EnglishReadingSecondary.js',...additions];let last=-1;for(const id of ids){const at=html.indexOf('src="'+id);assert(at>last,file+' correct order '+id);last=at;}}
 const sw=read('service-worker.js');for(const f of additions)assert(sw.includes(f),'offline '+f);
});

test('reviewed advanced conditionals and inference scopes retain their corrected meaning',()=>{const c=load([...base,...additions]),notes=c.EnglishReadingSentenceNotes;const inverted=notes['hr3-unit1-p4'][4];assert(inverted.chunks[0].label.includes('조건'));assert(inverted.chunks[0].text.startsWith('Had '));const imperative=notes['hr3-unit1-p5'][0];assert.equal(imperative.chunks[0].role,'verb');assert(imperative.chunks[0].text.startsWith('Imagine'));const p=c.EnglishReadingData.units.flatMap(u=>u.passages).find(p=>p.id==='hr2-unit1-p6');const inference=p.questions.find(q=>q.type==='inference');assert(inference.prompt.toLowerCase().includes('as a whole'));assert(inference.promptKo.includes('글 전체'));});
