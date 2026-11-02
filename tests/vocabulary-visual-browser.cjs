const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const root=process.cwd(),server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));});await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());try{
await page.route('**/*',route=>{const u=route.request().url();if(!u.startsWith('http://127.0.0.1:')||/firebase-sync.js|notification-client.js|version-check.js/.test(u))return route.fulfill({body:'',contentType:'application/javascript'});return route.continue();});await page.addInitScript(()=>localStorage.setItem('SmartStudy_ActiveUser','english-guide-test'));
const base=`http://127.0.0.1:${server.address().port}`;
await page.goto(`${base}/english.html`);await page.waitForSelector('#englishWord');
await page.waitForFunction(()=>document.querySelector('#englishWord').textContent!=='ability');
await page.evaluate(()=>{currentLevel='level1';refreshStudyOrder();const i=shuffledStudyIndices.findIndex(i=>vocabData.level1[i].word==='flower');if(i<0)throw Error('flower missing');currentIndex=i;updateCard();EnglishSpeech.speak=(word,accent)=>window.__spoken={word,accent};});
await page.waitForSelector('#vocabularyVisual:not([hidden])');assert.equal(await page.locator('.vocab-visual-word').count(),5);
await page.locator('.vocab-visual-speak').first().click();assert.deepEqual(await page.evaluate(()=>__spoken),{word:'flower',accent:'us'});
for(const key of ['plant','body','face','house','bicycle']){
 await page.evaluate(key=>VocabularyVisual.render(document.getElementById('vocabularyVisual'),key),key);
 assert.equal(await page.locator('.vocab-visual-figure svg text').count(),5);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile overflow '+key);
 await page.locator('#vocabularyVisual').screenshot({path:`scratch/vocab-visual-${key}-mobile.png`});
}
await page.setViewportSize({width:1280,height:900});await page.evaluate(()=>VocabularyVisual.render(document.getElementById('vocabularyVisual'),'plant'));await page.locator('#vocabularyVisual').screenshot({path:'scratch/vocab-visual-desktop.png'});
await page.evaluate(()=>VocabularyVisual.render(document.getElementById('vocabularyVisual'),'bank'));assert.equal(await page.locator('#vocabularyVisual:visible').count(),0);
await page.evaluate(()=>VocabularyVisual.render(document.getElementById('vocabularyVisual'),'flower'));await page.locator('#nextBtn').click();assert.equal(await page.locator('#vocabularyVisual:visible').count(),0,'navigation clears old topic');
assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: actual vocabulary page integration, 5 topics, numbered SVG labels, US pronunciation, unrelated word cleanup, navigation, mobile and desktop layouts.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
