/** Experimental online-stroke comparison. No OCR, pixels, or character recognition.
 * Match geometry without sequence/direction first, isolate ambiguous edges,
 * then inspect the resulting permutation and oriented trajectories separately.
 * Thresholds are engineering tolerances, not calibrated probabilities.
 */
const POINTS = 32;
const LIMITS = Object.freeze({mean: .11, pair: .19, assignmentGap: .055, directionGap: .04, chord: .035, length: .045});
const unable = (reason, details = {}) => ({status: 'unable', sequence: {status:'unable',reason}, direction: {status:'unable',reason}, reason, issues: [], mapping: [], strokes: [], ...details});
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function length(stroke) { let value = 0; for (let i = 1; i < stroke.length; i++) value += distance(stroke[i - 1], stroke[i]); return value; }
function valid(strokes) {
  return Array.isArray(strokes) && strokes.length > 0 && strokes.length <= 64 &&
    strokes.every(s => Array.isArray(s) && s.length >= 1 && s.length <= 10000 &&
      s.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite)));
}
function resample(stroke) {
  if(length(stroke)<1e-8)return Array.from({length:POINTS},()=>[...stroke[0]]);
  const arc = [0]; for (let i = 1; i < stroke.length; i++) arc.push(arc[i - 1] + distance(stroke[i - 1], stroke[i]));
  let k = 1;
  return Array.from({length: POINTS}, (_, i) => {
    const target = arc.at(-1) * i / (POINTS - 1);
    while (k < arc.length - 1 && arc[k] < target) k++;
    const f = (target - arc[k - 1]) / (arc[k] - arc[k - 1] || 1);
    return [stroke[k - 1][0] + f * (stroke[k][0] - stroke[k - 1][0]), stroke[k - 1][1] + f * (stroke[k][1] - stroke[k - 1][1])];
  });
}
function normalize(strokes) {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const s of strokes) for (const [x, y] of s) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
  const size = Math.max(right - left, bottom - top);
  if (!Number.isFinite(size) || size < 1e-7) return null;
  return strokes.map(s => resample(s).map(([x, y]) => [(x - (left + right) / 2) / size, (y - (top + bottom) / 2) / size]));
}
function orientedCost(a, b, reverse = false) {
  let mean = 0; for (let i = 0; i < POINTS; i++) mean += distance(a[i], b[reverse ? POINTS - 1 - i : i]);
  const endpoints = (distance(a[0], b[reverse ? POINTS - 1 : 0]) + distance(a.at(-1), b[reverse ? 0 : POINTS - 1])) / 2;
  return .8 * mean / POINTS + .2 * endpoints;
}
// Hungarian minimum-cost bijection. Optional forbidden edge measures an alternative.
function assign(cost, forbidden = null) {
  const n = cost.length, u = Array(n + 1).fill(0), v = [...u], p = [...u], way = [...u];
  for (let i = 1; i <= n; i++) {
    p[0] = i; let j0 = 0; const min = Array(n + 1).fill(Infinity), used = Array(n + 1).fill(false);
    do {
      used[j0] = true; const i0 = p[j0]; let delta = Infinity, j1 = 0;
      for (let j = 1; j <= n; j++) if (!used[j]) {
        const edge = forbidden?.[0] === i0 - 1 && forbidden?.[1] === j - 1 ? 1e6 : cost[i0 - 1][j - 1];
        const cur = edge - u[i0] - v[j]; if (cur < min[j]) { min[j] = cur; way[j] = j0; }
        if (min[j] < delta) { delta = min[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j++) if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else min[j] -= delta;
      j0 = j1;
    } while (p[j0]);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
  }
  const mapping = Array(n); for (let j = 1; j <= n; j++) mapping[p[j] - 1] = j - 1;
  return {mapping, total: -v[0]};
}
/** Per-edge tolerances are heuristics, not calibrated probabilities.
 * Assignment never uses sequence or direction as a preference. A bad edge
 * cannot veto unrelated edges. Unmatched neighbors are never called correct.
 */
export function analyzeStrokeOrder(userStrokes, referenceStrokes) {
  if (!valid(userStrokes) || !valid(referenceStrokes) || userStrokes.reduce((n,s)=>n+s.length,0)>20000) return unable('insufficient-input');
  const user=normalize(userStrokes), reference=normalize(referenceStrokes);
  if(!user||!reference)return unable('insufficient-input');
  const n=Math.max(user.length,reference.length);
  const oriented=user.map(a=>reference.map(b=>({forward:orientedCost(a,b),reverse:orientedCost(a,b,true)})));
  const cost=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i<user.length&&j<reference.length?Math.min(oriented[i][j].forward,oriented[i][j].reverse):LIMITS.pair));
  const best=assign(cost), selected=best.mapping.slice(0,user.length).map((j,i)=>cost[i][j]);
  const strokes=user.map((a,i)=>{
    const j=best.mapping[i],b=reference[j],gap=n>1?assign(cost,[i,j]).total-best.total:null;
    const pair=b?oriented[i][j]:null,ratio=b?(length(a)<1e-8&&length(b)<1e-8?1:length(a)/(length(b)||1e-12)):0;
    const reason=!b?'unmatched-stroke':Math.min(pair.forward,pair.reverse)>LIMITS.pair||ratio<.4||ratio>2.5?'geometry':gap!==null&&gap<LIMITS.assignmentGap?'ambiguous-matching':null;
    const reliable=!reason;
    return {userStrokeIndex:i,referenceStrokeIndex:reliable?j:null,
      userStroke:i+1,referenceStroke:reliable?j+1:null,
      matchingCost:pair?Math.min(pair.forward,pair.reverse):null,assignmentGap:gap,
      sequenceStatus:'unable',directionStatus:'unable',
      startPoint:a[0],endPoint:a.at(-1),referenceStartPoint:reliable?b[0]:null,referenceEndPoint:reliable?b.at(-1):null,
      userPoints:a,referencePoints:reliable?b:null,reason:reason||'matched',sequenceReason:reason,directionReason:reason,order:false,direction:false};
  });
  const reliable=strokes.filter(x=>x.referenceStrokeIndex!==null);
  const geometrySupported=reliable.reduce((sum,x)=>sum+x.matchingCost,0)/Math.max(1,reliable.length)<=LIMITS.mean;
  const enough=reliable.length>=Math.max(1,Math.ceil(n*.5)) && geometrySupported;
  const complete=reliable.length===user.length&&user.length===reference.length;
  for(const match of reliable){
    const i=match.userStrokeIndex,j=match.referenceStrokeIndex,a=user[i],b=reference[j],pair=oriented[i][j];
    // A reversal of relative positions proves a swap; an index shift caused
    // by a missing stroke does not. Ambiguous adjacent edges stay unknown.
    const inversion=reliable.some(other=>(other.userStrokeIndex-i)*(other.referenceStrokeIndex-j)<0);
    const neighborsKnown=complete || ((i===0?j===0:strokes[i-1]?.referenceStrokeIndex===j-1)&&(i===strokes.length-1?j===reference.length-1:strokes[i+1]?.referenceStrokeIndex===j+1));
    match.sequenceStatus=inversion?'review':neighborsKnown?'likely':'unable';
    match.sequenceReason=inversion?'sequence-inversion':neighborsKnown?'matched':'uncertain-neighbor';match.order=inversion;
    const av=[a.at(-1)[0]-a[0][0],a.at(-1)[1]-a[0][1]],bv=[b.at(-1)[0]-b[0][0],b.at(-1)[1]-b[0][1]],ca=Math.hypot(...av),cb=Math.hypot(...bv);
    const cosine=(av[0]*bv[0]+av[1]*bv[1])/(ca*cb||1);
    const forwardEnds=distance(a[0],b[0])+distance(a.at(-1),b.at(-1));
    const reverseEnds=distance(a[0],b.at(-1))+distance(a.at(-1),b[0]);
    match.directionEvidence={forwardCost:pair.forward,reverseCost:pair.reverse,forwardEndpoints:forwardEnds,reverseEndpoints:reverseEnds,cosine};
    if(Math.min(ca,cb)<LIMITS.chord||Math.min(length(a),length(b))<LIMITS.length){match.directionReason='short-stroke';}
    else if(Math.abs(pair.forward-pair.reverse)<LIMITS.directionGap||Math.abs(forwardEnds-reverseEnds)<LIMITS.directionGap){match.directionReason='ambiguous-direction';}
    else if(pair.reverse<pair.forward&&reverseEnds<forwardEnds&&cosine<-.45){match.directionStatus='review';match.direction=true;match.directionReason='reversed-direction';}
    else if(pair.forward<pair.reverse&&forwardEnds<reverseEnds&&cosine>.45){match.directionStatus='likely';match.directionReason='matched';}
    else match.directionReason='ambiguous-direction';
  }
  if(!geometrySupported)for(const match of strokes){match.sequenceStatus=match.directionStatus='unable';match.reason=match.sequenceReason=match.directionReason='geometry';match.order=match.direction=false;match.referenceStrokeIndex=match.referenceStroke=match.referencePoints=match.referenceStartPoint=match.referenceEndPoint=null;}
  const aggregate=field=>!enough?'unable':strokes.every(x=>x[field]==='likely')&&complete?'likely':field==='directionStatus'&&strokes.some(x=>x[field]==='review')?'review':complete&&strokes.every(x=>x[field]!=='unable')&&strokes.some(x=>x[field]==='review')?'review':strokes.some(x=>x[field]!=='unable')?'partial':'unable';
  const sequence={status:aggregate('sequenceStatus')},direction={status:aggregate('directionStatus')};
  const status=[sequence.status,direction.status].includes('review')?'review':[sequence.status,direction.status].includes('partial')?'partial':sequence.status==='likely'&&direction.status==='likely'?'likely':'unable';
  const issues=strokes.filter(x=>x.sequenceStatus!=='likely'||x.directionStatus!=='likely');
  const reason=!enough?(user.length!==reference.length?'stroke-count':strokes.every(x=>x.reason==='ambiguous-matching')?'ambiguous-matching':'geometry'):status==='likely'?'matched':status==='review'?'possible-violation':'partial-assessment';
  return {status,sequence,direction,reason,issues,mapping:strokes,strokes,actual:user.length,expected:reference.length,
    matched:strokes.filter(x=>x.referenceStrokeIndex!==null).length,missingReferenceStrokes:reference.map((_,j)=>j).filter(j=>!reliable.some(x=>x.referenceStrokeIndex===j)),
    meanDistance:best.total/n,maxDistance:Math.max(...selected),assignmentGap:null};
}
