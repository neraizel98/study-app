const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const files=['EnglishReadingData.js','EnglishReadingMore1.js','EnglishReadingMore2.js','EnglishReadingSecondary.js','EnglishReadingExpansion.js','EnglishReadingMiddleExpansion.js','EnglishReadingHighExpansion.js','ReadingSentenceNotesPrimary.js','ReadingSentenceNotesSecondary.js','reading-sentence-guide.js'];
function load(){const c={console};c.window=c;vm.createContext(c);for(const f of files)vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});return c;}
test('every current passage has authored, source-aligned sentence structure, grammar and contextual vocabulary',()=>{
 const c=load(),passages=c.EnglishReadingData.units.flatMap(u=>u.passages);let count=0;
 assert.equal(passages.length,116);
 for(const p of passages){const notes=c.EnglishReadingSentenceNotes[p.id];assert(notes,p.id);assert.equal(notes.length,p.sentences.length,p.id);
  for(let i=0;i<p.sentences.length;i++){const row=notes[i],id=`${p.id}:${i+1}`;assert(c.ReadingSentenceGuide.valid(row,p.sentences[i]),id);assert(row.chunks.length>=2,id+' useful chunks');
   for(const v of row.vocabulary)assert(p.sentences[i].toLowerCase().includes(v.word.toLowerCase()),id+' contextual vocabulary '+v.word);
   assert(row.grammar.every(g=>g.explanation.length>=8),id+' actual explanation');count++;
  }
 }
 assert(count>=800,'all new sentences have guides');
});
class Element{
 constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.listeners={};this.attributes={};this.textContent='';this.open=false;}
 append(...n){this.children.push(...n);}replaceChildren(...n){this.children=n;}setAttribute(k,v){this.attributes[k]=String(v);}addEventListener(name,fn){this.listeners[name]=fn;}
}
const all=n=>[n,...n.children.flatMap(all)];
test('guide is accessible, escaped, translated from the original source, and replaced on passage changes',()=>{
 const c=load();c.document={createElement:tag=>new Element(tag),createTextNode:text=>Object.assign(new Element('#text'),{textContent:text})};
 const p=c.EnglishReadingData.units[0].passages[0],before=JSON.stringify(p),host=new Element('div');let opened=0;c.ReadingSentenceGuide.mount(host,p,{onOpen:()=>opened++});
 const nodes=all(host),shell=nodes.find(n=>n.tagName==='details'),items=nodes.filter(n=>n.dataset.sentence);assert.equal(items.length,p.sentences.length);assert.equal(shell.open,false,'translation initially closed');
 const title=['① 구조','② 핵심 문법','③ 어휘','④ 기존 해석'];for(const item of items)assert.deepEqual(all(item).filter(n=>n.tagName==='h4').map(n=>n.textContent),title);
 assert.deepEqual(nodes.filter(n=>n.className==='sentence-guide-translation').map(n=>n.textContent),Array.from(p.translations));
 const expand=nodes.find(n=>n.tagName==='button');expand.onclick();assert(items.every(n=>n.open));assert.equal(expand.attributes['aria-expanded'],'true');assert.equal(opened,1);expand.onclick();assert(items.every(n=>!n.open));
 assert.equal(JSON.stringify(p),before,'study content not mutated');const next=c.EnglishReadingData.units.at(-1).passages[0];c.ReadingSentenceGuide.mount(host,next);assert.equal(all(host).filter(n=>n.dataset.sentence).length,next.sentences.length);
 const unsafe={id:'unsafe',sentences:['<img src=x onerror=alert(1)>'],translations:['<script>unsafe</script>']};c.ReadingSentenceGuide.mount(host,unsafe);assert(all(host).some(n=>n.textContent===unsafe.sentences[0]));assert(!all(host).some(n=>n.tagName==='img'||n.tagName==='script'));
 const changed=JSON.parse(JSON.stringify(p));changed.sentences[0]+=' Updated.';c.ReadingSentenceGuide.mount(host,changed);assert(all(host).some(n=>n.className==='sentence-guide-unavailable'),'stale analysis not attached to changed source');
});


test('reviewed difficult constructions retain precise clause roles and interpretation',()=>{
 const c=load(),notes=c.EnglishReadingSentenceNotes;
 const n=(id,i)=>notes[id][i];
 assert(n('hr2-unit1-p1',1).chunks.some(p=>p.label==='앞 절 전체를 받는 관계절'));
 assert(!n('hr2-unit1-p2',2).chunks.some(p=>p.label.includes('목적')&&p.text.startsWith('to stop')));
 assert(n('hr3-unit2-p3',4).grammar[0].explanation.includes('특정 계획에는'));
 assert(n('hr3-unit2-p3',6).grammar[0].explanation.includes('미리 논의한'));
 const hungry=Object.values(notes).flat().find(n=>n.sentence.includes('nobody has to stay hungry'));
 assert(hungry.chunks.find(c=>c.text.includes('hungry')).label.includes('주어의 상태'));
});
