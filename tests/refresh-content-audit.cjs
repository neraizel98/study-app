// Explicit maintenance command: node tests/refresh-content-audit.cjs
// Newly added/changed questions are always unreviewed; this script never approves content.
const fs=require('node:fs'),rows=require('./helpers/content-audit-source.cjs')(),file='tests/helpers/content-audit.json';
const old=new Map((fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[]).map(r=>[r.id,r]));
const next=rows.map(r=>{
 const previous=old.get(r.id);
 return previous?.hash===r.hash?previous:{id:r.id,subject:r.subject,passageId:r.passageId,hash:r.hash,semanticStatus:'unreviewed'};
});
fs.writeFileSync(file,JSON.stringify(next,null,2)+'\n');
console.log(`Audit inventory refreshed: ${next.length} questions. Semantic approval is manual.`);
