const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('version-check.js','utf8'),release=JSON.parse(fs.readFileSync('version.json','utf8')).v;
test('update checker version must match the deployed release',()=>{assert.equal(code.match(/const APP_VERSION = '([^']+)'/)[1],release,'Bump version-check.js APP_VERSION with version.json on every release');});
async function check(server){const appended=[],document={getElementById:()=>null,createElement:()=>({style:{}}),head:{appendChild:()=>{}},body:{appendChild:x=>appended.push(x)}};const context={window:{},document,fetch:async()=>({json:async()=>({v:server})}),Date};vm.runInNewContext(code,context);await new Promise(resolve=>setImmediate(resolve));return appended;}
test('current release does not show an update banner after reload',async()=>{assert.equal((await check(release)).length,0);assert.equal((await check(release)).length,0);});
test('a different deployed release still shows an update banner',async()=>{assert.equal((await check('future-release')).length,1);});
