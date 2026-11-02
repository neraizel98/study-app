const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('vocabulary-visual.js','utf8'),context);const api=context.window.VocabularyVisual;
test('authored topics have 5 distinct numbered parts and factual bilingual examples',()=>{
 for(const key of ['plant','body','face','house','bicycle']){const t=api.find(key);assert(t);assert.equal(t.words.length,5);assert.equal(new Set(t.words.map(w=>w[0])).size,5);assert.equal(t.example.length,2);for(const w of t.words){assert(w[0]&&w[1]);assert(w[2]>0&&w[2]<480);assert(w[3]>0&&w[3]<380);assert.equal(api.find(w[0]).id,t.id);}}
 assert.equal(api.find(' Flower ').id,'plant');assert.equal(api.find('bike').id,'bicycle');assert.equal(api.find('bank'),null);assert.equal(api.find('<img src=x>'),null);
});
test('visual sheets are study-only and do not change scoring or saved learning data',()=>{const html=fs.readFileSync('english.html','utf8'),source=fs.readFileSync('vocabulary-visual.js','utf8');assert(html.indexOf('id="vocabularyVisual"')>html.indexOf('id="studyView"'));assert(html.indexOf('id="vocabularyVisual"')<html.indexOf('</main>'));assert(!/localStorage|saveReport|refreshEvidence/.test(source));assert(source.includes("speak(en,'us')"));});
