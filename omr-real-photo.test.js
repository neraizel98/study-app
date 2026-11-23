const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),sharp=require('sharp');
const set=JSON.parse(fs.readFileSync('tests/fixtures/omr-curved25-set.json','utf8'));
function reader(){const c={};c.window=c;vm.createContext(c);for(const f of ['mock-paper.js','omr-layout.js','omr-reader.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});return c;}
const expected={reading:[2,2,1,2,3,1,1,2,2,3,1,2,3,1,4,4,2,4,3,1,2,2,1,1,1],math:[null,null,1,2,4,3,1,4,3,1,2,2,2,4,3,2,4,2,4,4,4,4,null,2,2],english:[1,3,4,2,4,3,1,4,1,1,2,3,4,1,4,3,1,2,2,4,1,4,3,1,4],hanja:[2,4,2,1,2,2,1,1,1,1,1,2,1,2,1,4,1,2,1,null,2,4,3,1,3]};
async function photo(){const {data,info}=await sharp('tests/fixtures/omr-curved25.jpg').ensureAlpha().raw().toBuffer({resolveWithObject:true});return {width:info.width,height:info.height,data:new Uint8ClampedArray(data)};}
test('real curved25-row photo recovers verified card, never misreads clean marks or X corrections',async()=>{
 const c=reader(),image=await photo(),r=c.OmrReader.read(image,set);
 assert.equal(c.OmrLayout.code(set).hashHex,'69A4');assert.equal(r.ok,true,JSON.stringify(r));assert.equal(r.quality.geometryRecovered,true);
 assert.equal(r.answers.length,98);assert.equal(r.writtenCrops.length,2);
 for(const a of r.answers){const choice=expected[a.area][a.number-1];if(choice===null){assert.equal(a.status,'multiple');assert.equal(a.choice,null);}else if(a.status==='ok')assert.equal(a.choice,choice,a.area+' '+a.number);else assert(['faint','blank','multiple'].includes(a.status));}
 assert(r.answers.filter(a=>a.status==='ok').length>=80);
});
test('curved-photo recovery cannot authorize a different round or question set',async()=>{
 const c=reader(),image=await photo();
 for(const wrong of [{...set,attemptNo:2},{...set,items:set.items.map((q,i)=>i?{...q}:{...q,id:'different-exam'})}])assert.equal(c.OmrReader.read(image,wrong).ok,false);
});

test('real photo stays safe after rotation and resize',async()=>{
 const c=reader();
 for(const variant of [{angle:90},{angle:180},{angle:270},{height:1500},{height:1200}]){
  let pipeline=sharp('tests/fixtures/omr-curved25.jpg');if(variant.angle)pipeline=pipeline.rotate(variant.angle);if(variant.height)pipeline=pipeline.resize({height:variant.height});
  const {data,info}=await pipeline.ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const r=c.OmrReader.read({width:info.width,height:info.height,data:new Uint8ClampedArray(data)},set);
  assert.equal(r.ok,true,JSON.stringify(variant));
  for(const a of r.answers)if(expected[a.area][a.number-1]===null){assert.equal(a.choice,null);assert.equal(a.status,'multiple');}else if(a.status==='ok')assert.equal(a.choice,expected[a.area][a.number-1],JSON.stringify(variant)+' '+a.area+' '+a.number);
 }
});
