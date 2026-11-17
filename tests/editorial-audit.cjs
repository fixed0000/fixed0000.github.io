// Editorial acceptance audit: JA/EN parity, responsive text, links, and interaction.
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.SITE_URL||'http://localhost:8000';
const routes=['','experience/','skills/','education/','research/','research/family/','research/monogatari/','contact/','about/'];
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});const rows=[],errors=[],metadata=[];
for(const width of [320,360,768,1280]){const c=await b.newContext({viewport:{width,height:800},reducedMotion:'reduce'});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
for(const lang of ['','en/'])for(const route of routes){const url='/'+lang+route;await p.goto(base+url+'?editorial-audit=20261117');await p.waitForLoadState('networkidle');assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('.navigation a').count(),6);assert.equal(await p.locator('.language').getAttribute('href'),(lang?'/':'/en/')+route);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),url+' page overflow');
const clipped=await p.locator('h1,h2,h3,.cards .entry,.lead,.duties dd').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.tagName+': '+e.textContent));assert.deepEqual(clipped,[],url+' text overflow');
const h=await p.locator('h1').boundingBox();assert(h.height<350,url+' heading too tall');assert.equal(await p.locator('.page-heading > .label').count(),route?0:1);
assert.equal(await p.locator('.career-focus').count(),0);assert.equal(await p.locator('a[href^="mailto:"]').first().getAttribute('href'),'mailto:borodina.l2097@gmail.com');
if(route==='contact/'){assert.equal(await p.locator('a[href$=".pdf"],.project-card').count(),0);}
if(route==='about/')assert.equal(await p.locator('main > .section').count(),5);
if(route.startsWith('research/')&&route!=='research/')assert(await p.getByRole('heading',{name:lang?'Original title':'原題',exact:true}).isVisible());
rows.push({url,width,headingHeight:Math.round(h.height),overflow:false});
if(width===1280){metadata.push({url,title:await p.title(),description:await p.locator('meta[name="description"]').getAttribute('content'),ogTitle:await p.locator('meta[property="og:title"]').getAttribute('content')});if(['','experience/','contact/','about/'].includes(route)){await p.evaluate(()=>document.querySelectorAll('.reveal-section').forEach(x=>x.classList.add('is-visible')));await p.screenshot({path:'artifacts/editorial/after-'+(route.split('/')[0]||'home')+'-'+(lang?'en':'ja')+'.png',fullPage:true});}}
if(width===360&&['','experience/'].includes(route))await p.screenshot({path:'artifacts/editorial/after-'+(route.split('/')[0]||'home')+'-'+(lang?'en':'ja')+'-360.png',fullPage:true});}
await c.close();}
const p=await b.newPage();await p.goto(base+'/');assert.equal(await p.locator('h1').evaluate(e=>getComputedStyle(e).animationName),'hero-in');await p.keyboard.press('Tab');assert(await p.locator('.skip').evaluate(e=>e===document.activeElement));await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>location.hash),'#main');await p.getByRole('link',{name:'職務経歴を見る',exact:true}).click();await p.waitForURL(base+'/experience/');await p.locator('.language').click();await p.waitForURL(base+'/en/experience/');
assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/editorial/audit.json',JSON.stringify({base,layouts:rows,metadata,errors,keyboard:'passed',animation:'preserved'},null,2));await b.close();console.log('PASS editorial audit: '+rows.length+' layouts, keyboard, animation, bilingual navigation');})().catch(e=>{console.error(e);process.exit(1);});
