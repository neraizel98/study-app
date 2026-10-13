const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const c={};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('EnglishReadingData.js','utf8'),c);const original=c.EnglishReadingData.units.flatMap(u=>u.passages).reduce((n,p)=>n+p.questions.length,0);vm.runInContext(fs.readFileSync('reading-question-variants.js','utf8'),c);let added=0;for(const p of c.EnglishReadingData.units.flatMap(u=>u.passages)){assert.equal(new Set(p.questions.map(q=>q.id)).size,p.questions.length);for(const q of p.questions.filter(q=>q.variant)){added++;assert.equal(new Set(q.choices).size,4);assert(p.vocabulary.some(w=>w.word===q.choices[q.answerIndex]));assert(p.sentences[q.evidence[0]].toLowerCase().includes(q.choices[q.answerIndex].toLowerCase()));assert(q.prompt.includes('_____'));assert(q.promptKo);}}
assert.equal(original,80);assert.equal(added,77);vm.runInContext(fs.readFileSync('reading-question-variants.js','utf8'),c);assert.equal(c.EnglishReadingData.units.flatMap(u=>u.passages).reduce((n,p)=>n+p.questions.length,0),157,'loading twice does not duplicate questions');console.log('English reading: 77 unique context variants, correct vocabulary/evidence and original 80 questions retained.');

const positions=new Set(c.EnglishReadingData.units.flatMap(u=>u.passages).flatMap(p=>p.questions.filter(q=>q.variant).map(q=>q.answerIndex)));assert.equal(positions.size,4,'correct answers must not always appear first');

// Validate the actual browser load order, including the expanded bank.
c.location={search:''};c.document={addEventListener(){}};c.URLSearchParams=URLSearchParams;
vm.runInContext(fs.readFileSync('EnglishReadingApp.js','utf8'),c);
assert.equal(c.EnglishReadingApp.validateContent(),true,'expanded passage bank must remain usable');
const first=c.EnglishReadingData.units[0].passages[0],saved=first.questions;
first.questions=saved.slice(0,4);assert.equal(c.EnglishReadingApp.validateContent(),false,'too few questions rejected');
first.questions=saved.concat(saved[0]);assert.equal(c.EnglishReadingApp.validateContent(),false,'duplicate ids rejected');
first.questions=saved;const answer=saved[0].answerIndex;saved[0].answerIndex=4;assert.equal(c.EnglishReadingApp.validateContent(),false,'invalid answer rejected');saved[0].answerIndex=answer;
assert.equal(c.EnglishReadingApp.validateContent(),true);
const units=c.EnglishReadingData.units;c.EnglishReadingData.units=[];assert.equal(c.EnglishReadingApp.validateContent(),false,'empty bank rejected');c.EnglishReadingData.units=units;
console.log('Expanded content passes app validation; incomplete, duplicate, invalid and empty content rejected.');
