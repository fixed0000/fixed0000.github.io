import fs from 'node:fs';import assert from 'node:assert/strict';
import {analyzeStrokeOrder} from '../js/kanji/stroke-order.js';
import {referenceFor,transform} from './fixtures/stroke-order-fixtures.mjs';
const handwriting=JSON.parse(fs.readFileSync('tests/fixtures/direction-handwriting.json'));
const chars=[...'一二三十口日田木本山川同思持待'],states=()=>({likely:0,review:0,partial:0,unable:0});
const report={fixtureProvenance:'Independent hand-authored control points, plus KanjiVG controls. Browser test records dispatched pointer trajectories separately. No physical human handwriting corpus or accuracy claim.',totalTests:0,statuses:states(),sequence:states(),direction:states(),byCharacter:{},reasons:{},refusalReasons:{},declinedViolations:[],detectedReversedStrokes:0,detectedPermutations:0,falsePositives:[],missedObviousViolations:[],cases:[]};
const len=s=>s.slice(1).reduce((n,p,i)=>n+Math.hypot(p[0]-s[i][0],p[1]-s[i][1]),0);
for(const char of chars){const ref=referenceFor(char);report.byCharacter[char]={tests:0,statuses:states(),sequence:states(),direction:states()};
 for(const [origin,ink]of [['kanjivg-control',ref],['independent-authored',handwriting[char]]]){
  const baseline=analyzeStrokeOrder(ink,ref),rank=ink.map((s,i)=>({i,len:len(s)})).sort((a,b)=>b.len-a.len).map(x=>x.i),first=rank[0],second=rank[1];
  const swap=structuredClone(ink);if(ink.length>1)[swap[first],swap[second]]=[swap[second],swap[first]];
  const reverse=structuredClone(ink);reverse[first].reverse();const many=ink.map(s=>s.toReversed());
  const tilted=transform(ink,(x,y)=>[.5+(x-.5)*Math.cos(.04)-(y-.5)*Math.sin(.04),.5+(x-.5)*Math.sin(.04)+(y-.5)*Math.cos(.04)]);
  const short=structuredClone(ink),last=rank.at(-1),start=short[last][0];short[last]=short[last].map(p=>[start[0]+(p[0]-start[0])*.1,start[1]+(p[1]-start[1])*.1]);
  const variants=[['correct',ink],['one-reversed',reverse],['several-reversed',many],['sequence-correct-direction-wrong',reverse],['translation',transform(ink,(x,y)=>[x+.17,y-.13])],['scale',transform(ink,(x,y)=>[x*.55+.2,y*.55+.12])],['tilt',tilted],['imperfect-shape',transform(ink,(x,y,i)=>[x+Math.sin(i*2)*.006,y+Math.cos(i)*.006])],['missing',ink.slice(0,-1)],['short-stroke',short]];
  if(ink.length>1)variants.push(['swapped',swap],['sequence-wrong-direction-correct',swap],['joined',[[...ink[0],...ink[1]],...ink.slice(2)]]);
  for(const [name,input]of variants){const r=analyzeStrokeOrder(input,ref),row={char,origin,name,reason:r.reason,status:r.status,sequence:r.sequence.status,direction:r.direction.status,matched:r.matched||0,reasons:[...new Set(r.strokes.flatMap(s=>[s.reason,s.sequenceReason,s.directionReason]).filter(x=>x&&x!=='matched'))],reversed:r.strokes.filter(s=>s.directionStatus==='review').map(s=>s.userStrokeIndex),inversions:r.strokes.filter(s=>s.sequenceStatus==='review').map(s=>s.userStrokeIndex)};if(['partial','unable'].includes(r.status))report.refusalReasons[r.reason]=(report.refusalReasons[r.reason]||0)+1;report.cases.push(row);report.totalTests++;report.statuses[r.status]++;report.sequence[r.sequence.status]++;report.direction[r.direction.status]++;const c=report.byCharacter[char];c.tests++;c.statuses[r.status]++;c.sequence[r.sequence.status]++;c.direction[r.direction.status]++;for(const reason of row.reasons)report.reasons[reason]=(report.reasons[reason]||0)+1;
   if(['correct','translation','scale','tilt','imperfect-shape'].includes(name)&&r.status==='review')report.falsePositives.push(row);
   if(['one-reversed','several-reversed','sequence-correct-direction-wrong'].includes(name)){report.detectedReversedStrokes+=row.reversed.length;if(r.direction.status==='unable')report.declinedViolations.push({char,origin,name,reason:r.reason});if(baseline.direction.status==='likely'&&r.direction.status!=='review')report.missedObviousViolations.push(row);}
   if(['swapped','sequence-wrong-direction-correct'].includes(name)){report.detectedPermutations+=row.inversions.length?1:0;if(baseline.sequence.status==='likely'&&r.sequence.status!=='review')report.missedObviousViolations.push(row);assert.notEqual(r.sequence.status,'likely',char+' missed swap');}
   if(name==='sequence-correct-direction-wrong'&&baseline.sequence.status==='likely')assert.equal(r.sequence.status,'likely',char+' reversal must not change sequence');
   if(name==='sequence-wrong-direction-correct'&&baseline.direction.status==='likely')assert.equal(r.direction.status,'likely',char+' swap must not change direction');
   if(origin==='kanjivg-control'&&name==='correct'){assert.equal(r.sequence.status,'likely');assert.equal(r.direction.status,'likely');}
   if(['missing','joined'].includes(name))assert.notEqual(r.sequence.status,'likely');
  }
 }
}
// Deliberately ambiguous pairs, a zero-length dot, and reliable unrelated strokes.
const line=[[.1,.7],[.9,.7]],dot=[[.15,.15],[.15,.15]],ambiguous=[[.3,.1],[.3,.4]];
const partial=analyzeStrokeOrder([ambiguous,ambiguous,line,[[.8,.1],[.8,.45]],[[.1,.9],[.6,.9]]],[ambiguous,ambiguous,line,[[.8,.1],[.8,.45]],[[.1,.9],[.6,.9]]]);assert.equal(partial.direction.status,'partial');assert.equal(partial.strokes[2].directionStatus,'likely');assert.equal(partial.strokes[0].referenceStrokeIndex,null);
const uncertain=analyzeStrokeOrder([dot,line],[dot,line]);assert.equal(uncertain.sequence.status,'likely');assert.equal(uncertain.direction.status,'partial');assert.equal(uncertain.strokes[0].directionStatus,'unable');assert.equal(uncertain.strokes[1].directionStatus,'likely');
report.additionalControls={ambiguousPairs:partial.status,zeroLengthDot:uncertain.status};
report.knownHistoricalFixtureCorrection={character:'国',finding:'The old repair fixture writes strokes 4 and 5 in the opposite order to KanjiVG. It previously abstained; the new sequence review is a genuine inversion, not a false positive.'};
report.characterCaseCount=report.totalTests;report.controlTestCount=2;
for(const r of [partial,uncertain]){report.totalTests++;report.statuses[r.status]++;report.sequence[r.sequence.status]++;report.direction[r.direction.status]++;}
fs.writeFileSync('artifacts/stroke-order/diagnostics.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({tests:report.totalTests,statuses:report.statuses,sequence:report.sequence,direction:report.direction,reversedStrokes:report.detectedReversedStrokes,detectedPermutations:report.detectedPermutations,falsePositives:report.falsePositives.map(x=>({char:x.char,origin:x.origin,name:x.name})),misses:report.missedObviousViolations.map(x=>({char:x.char,origin:x.origin,name:x.name}))},null,2));
assert.deepEqual(report.falsePositives,[]);assert.deepEqual(report.missedObviousViolations,[]);
