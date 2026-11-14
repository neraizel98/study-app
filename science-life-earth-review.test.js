const {test}=require('node:test'),assert=require('node:assert/strict');
const data=require('./ScienceData');
require('./ScienceLifeEarthExpansion');
require('./ScienceMockData');
const bank=require('./ScienceMockLifeEarthExpansion');
test('all720 life and earth assessment items identify an existing learning scene',()=>{
 assert.equal(bank.items.length,720);
 for(const q of bank.items){const u=data.units.find(u=>u.id===q.unitId);assert(u.lessons.some(l=>l.id===q.lessonId),q.id);assert.equal(new Set(q.choices).size,4,q.id);assert.equal(q.choices.filter(c=>c===q.answer).length,1,q.id);}
});
test('prediction questions state the actual condition and correct causal relationship',()=>{
 const prediction=id=>data.units.find(u=>u.id===id).prediction;
 const weather=prediction('l1-earth-weather');assert.match(weather.prompt,/낮/);assert.match(weather.choices[weather.answerIndex],/바다에서 육지/);
 const moon=prediction('l1-earth-moon-seasons');assert.match(moon.choices[moon.answerIndex],/위치 변화/);
 const flower=prediction('l1-life-reproduction');assert.equal(flower.choices[flower.answerIndex],'꽃가루');
});
