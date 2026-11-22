const {chromium,devices}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const fixtures=JSON.parse(fs.readFileSync('tests/fixtures/repair-handwriting.json'));
const root='http://localhost:8000';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'/usr/bin/chromium')});
 const reports=[];
 async function setup(page,lang,char){await page.goto(root+(lang==='en'?'/en':'')+'/projects/kanji-recall/');await page.waitForFunction(()=>!document.querySelector('#custom-practice').disabled);await page.evaluate(c=>{const d=JSON.parse(localStorage.getItem('kanji-recall-v2'));d.custom=[c];localStorage.setItem('kanji-recall-v2',JSON.stringify(d));},char);await page.reload();await page.waitForFunction(()=>!document.querySelector('#custom-practice').disabled);if(await page.locator('.practice-options').getAttribute('open')===null)await page.locator('.practice-options summary').click();await page.locator('#custom-practice').click();await page.waitForFunction(()=>document.querySelector('.kanji-reference path')&&/ready|準備完了/.test(document.querySelector('#practice-loading').textContent));}
 async function draw(page,strokes){const b=await page.locator('canvas').boundingBox();for(const s of strokes){await page.mouse.move(b.x+s[0][0]*b.width,b.y+s[0][1]*b.height);await page.mouse.down();for(const [x,y] of s.slice(1))await page.mouse.move(b.x+x*b.width,b.y+y*b.height,{steps:3});await page.mouse.up();}}
 const ink=page=>page.locator('canvas').evaluate(c=>Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data).reduce((a,v,i)=>a+(i%4===3?v:0),0));
 for(const lang of ['en','ja'])for(const char of ['思','同']){
  const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await setup(page,lang,char);
  assert.equal(await page.locator('#reading').innerText(),char==='思'?'おもう':'おなじ');
  await draw(page,fixtures[char]);await page.locator('#check').click();await page.waitForSelector('#result.correct');await page.waitForSelector('#stroke-order-assessment.likely');
  const before=await ink(page);assert(before>0);assert.equal(await page.locator('#practice').getAttribute('data-state'),'review');assert(await page.locator('.pad button').first().isDisabled());assert(await page.locator('.pad button').last().isDisabled());
  await draw(page,[[[.1,.1],[.9,.9]]]);assert.equal(await ink(page),before);await page.locator('.pad button').evaluateAll(buttons=>buttons.forEach(b=>b.click()));assert.equal(await ink(page),before);
  await page.screenshot({path:`artifacts/repair/after-${char}-${lang}.png`});
  await page.locator('#stroke-order').click();await page.locator('#pause').click();await page.locator('#retry').click();
  assert.equal(await page.locator('#practice').getAttribute('data-state'),'writing');assert.equal(await ink(page),0);assert(await page.locator('.kanji-reference').isHidden());assert.equal(await page.locator('.matched-stroke').count(),0);
  await draw(page,[...fixtures[char]].reverse());await page.locator('#check').click();await page.waitForSelector('#result.correct');await page.waitForSelector('#stroke-order-assessment.review');
  await page.locator('#next').click();assert.equal(await page.locator('#summary li').count(),1);
  let progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('kanji-recall-v2')));assert.equal(progress.history.length,2);assert.equal(progress.results.length,1);assert.equal(progress.bestStreak,1);
  await page.reload();progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('kanji-recall-v2')));assert.equal(progress.results.length,1);assert.equal(progress.history.length,2);assert(await page.locator('#practice').isHidden());assert.deepEqual(errors,[]);reports.push({lang,char,result:'correct',order:'likely; swapped=review',summaryRows:1,reload:'no duplicates'});await context.close();
 }
 // Delay real worker results: UI and programmatic clicks must not transition away.
 const context=await browser.newContext(),page=await context.newPage();
 await page.addInitScript(()=>{const Native=window.Worker;window.Worker=class extends Native{constructor(...a){super(...a);this.addEventListener('message',e=>{if(e.data.type==='result'&&!e.data.delayed){e.stopImmediatePropagation();setTimeout(()=>this.dispatchEvent(new MessageEvent('message',{data:{...e.data,delayed:true}})),600);}},true);}};});
 await setup(page,'en','思');await draw(page,fixtures['思']);await page.locator('#check').click();await page.evaluate(()=>{for(const id of ['check','check','next','retry','skip','reveal'])document.getElementById(id).click();});assert.equal(await page.locator('#practice').getAttribute('data-state'),'checking');await page.waitForSelector('#result.correct');assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('kanji-recall-v2')))).history.length,1);
 await page.locator('#retry').click();await draw(page,fixtures['思']);await page.locator('#check').click();await page.locator('#finish').click();if(await page.locator('.practice-options').getAttribute('open')===null)await page.locator('.practice-options summary').click();await page.locator('#custom-practice').click();await page.waitForTimeout(800);assert.equal(await page.locator('#practice').getAttribute('data-state'),'writing');assert(await page.locator('.kanji-reference').isHidden());assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('kanji-recall-v2')))).history.length,1);await context.close();
 // Mobile pointer capture, cancellation and local selection prevention.
 const mobile=await browser.newContext({...devices['iPhone 13']}),p=await mobile.newPage();await setup(p,'en','同');const b=await p.locator('canvas').boundingBox();await p.mouse.move(b.x+20,b.y+20);await p.mouse.down();await p.mouse.move(b.x+b.width+30,b.y+b.height+30);await p.mouse.up();assert.equal(await p.evaluate(()=>getSelection().toString()),'');await p.locator('.pad button').first().click();assert.equal(await ink(p),0);
 const cdp=await mobile.newCDPSession(p);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+20,y:b.y+20}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+80,y:b.y+80}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.equal(await ink(p),0);
 await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:b.x+20,y:b.y+20,button:'left',buttons:1,clickCount:1,pointerType:'pen'});
 await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:b.x+90,y:b.y+90,button:'left',buttons:1,pointerType:'pen'});
 await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:b.x+90,y:b.y+90,button:'left',buttons:0,clickCount:1,pointerType:'pen'});
 assert((await ink(p))>0);await p.locator('.pad button').first().click();assert.equal(await ink(p),0);
 // Revealing via keyboard/second pointer during an active stroke cancels it.
 await p.mouse.move(b.x+20,b.y+20);await p.mouse.down();await p.mouse.move(b.x+80,b.y+80);await p.locator('#reveal').evaluate(x=>x.click());const lockedInk=await ink(p);await p.mouse.move(b.x+140,b.y+140);await p.mouse.up();assert.equal(await ink(p),lockedInk);assert.equal(lockedInk,0);
 await p.screenshot({path:'artifacts/repair/after-mobile.png'});await mobile.close();
 fs.writeFileSync('artifacts/repair/browser-results.json',JSON.stringify({reports,races:'passed',mobile:'mouse boundary, native CDP touch cancel and pen events, reveal during active stroke'},null,2));console.log(reports);await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
