import fs from 'node:fs';
import {prepare,recognize} from '../js/kanji/recognizer.js';
import {analyzeStrokeOrder} from '../js/kanji/stroke-order.js';
import {referenceFor,transform} from './fixtures/stroke-order-fixtures.mjs';
const templates=prepare(JSON.parse(fs.readFileSync('assets/kanji/templates.json')));
const fixtures=JSON.parse(fs.readFileSync('tests/fixtures/repair-handwriting.json'));
const report={fixtureSource:'Hand-authored pointer trajectories, not a human handwriting corpus',thresholds:{shape:.105,margin:.012,changed:false},characters:[]};
for(const char of '思同持待木本日目口国'){
 const reference=referenceFor(char),input=fixtures[char];
 const variants={canonical:reference,handAuthored:input,scaled:transform(input,(x,y)=>[x*.55+.2,y*.55+.1]),permuted:[...input].reverse(),reversed:input.map(s=>[...s].reverse()),joined:[[...input[0],...input[1]],...input.slice(2)]};
 const results=Object.fromEntries(Object.entries(variants).map(([name,strokes])=>[name,{recognition:recognize(strokes,templates),order:analyzeStrokeOrder(strokes,reference)}]));
 report.characters.push({char,templateStrokes:reference.length,inputStrokes:input.length,results});
}
fs.writeFileSync('artifacts/repair/recognition-diagnostics.json',JSON.stringify(report,null,2));
console.log(report.characters.map(x=>({char:x.char,strokes:x.templateStrokes,recognized:x.results.handAuthored.recognition.char,order:x.results.handAuthored.order.status})));
