// Rebuild from a separate KanjiVG checkout: node tools/build-templates.cjs /path/to/kanjivg
const fs=require('fs'), path=require('path');
const {chromium}=require('playwright');
(async()=>{const root=process.argv[2], files=fs.readdirSync(path.join(root,'kanji')).filter(f=>/^[0-9a-f]{5}\.svg$/.test(f));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}); const page=await browser.newPage();
let templates=[];
for(let i=0;i<files.length;i+=100){const batch=files.slice(i,i+100).map(f=>[String.fromCodePoint(parseInt(f,16)),fs.readFileSync(path.join(root,'kanji',f),'utf8')]);
templates.push(...await page.evaluate(batch=>batch.map(([char,xml])=>{const doc=new DOMParser().parseFromString(xml,'image/svg+xml');const paths=[...doc.querySelectorAll('path')].filter(p=>p.hasAttribute('d')); const strokes=paths.map(p=>{let l=p.getTotalLength();return Array.from({length:16},(_,i)=>{let q=p.getPointAtLength(l*i/15);return [Math.round(q.x*10)/10,Math.round(q.y*10)/10]})});return {char,strokes}}),batch));}
fs.writeFileSync(path.join(__dirname,'../assets/kanji/templates.json'),JSON.stringify(templates.map(t=>({char:t.char,data:Buffer.from(t.strokes.flat(2).map(v=>Math.max(0,Math.min(255,Math.round(v))))).toString('base64')}))));await browser.close(); console.log(templates.length+' independent character templates');})();
