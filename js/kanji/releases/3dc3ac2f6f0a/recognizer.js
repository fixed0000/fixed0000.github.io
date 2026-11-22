import {describe,fixedCost,elasticCost,aspectCost,closedContour} from './geometry.js';
// Experimental KanjiVG nearest-shape matching; independent of the expected answer.
export function sample(stroke, count=16) {
 const lengths=[0]; for(let i=1;i<stroke.length;i++) lengths.push(lengths[i-1]+Math.hypot(stroke[i][0]-stroke[i-1][0],stroke[i][1]-stroke[i-1][1]));
 const total=lengths.at(-1); if(!total)return Array.from({length:count},()=>stroke[0]);
 return Array.from({length:count},(_,i)=>{const d=total*i/(count-1);let k=1;while(k<lengths.length-1&&lengths[k]<d)k++; const f=(d-lengths[k-1])/(lengths[k]-lengths[k-1]||1);return [stroke[k-1][0]+f*(stroke[k][0]-stroke[k-1][0]),stroke[k-1][1]+f*(stroke[k][1]-stroke[k-1][1])];});
}
export function normalize(strokes) {
 const pts=strokes.flat(), xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
 const minX=Math.min(...xs),minY=Math.min(...ys),w=Math.max(...xs)-minX,h=Math.max(...ys)-minY, size=Math.max(w,h)||1;
 return strokes.map(s=>sample(s).map(([x,y])=>[(x-minX+(size-w)/2)/size,(y-minY+(size-h)/2)/size]));
}
function distance(a,b){let f=0,r=0;for(let i=0;i<16;i++){f+=Math.hypot(a[i][0]-b[i][0],a[i][1]-b[i][1]);r+=Math.hypot(a[i][0]-b[15-i][0],a[i][1]-b[15-i][1]);}return Math.min(f,r)/16;}
// Minimum cost assignment permits different stroke orders; this does not grade 書き順.
function assignment(cost){const n=cost.length,u=Array(n+1).fill(0),v=[...u],p=[...u],way=[...u];for(let i=1;i<=n;i++){p[0]=i;let j0=0;const min=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);do{used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=cost[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0;}if(min[j]<delta){delta=min[j];j1=j;}}for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else min[j]-=delta;j0=j1;}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);}return -v[0]/n;}
export function prepare(data){return data.filter(t=>/^\p{Script=Han}$/u.test(t.char)).map(t=>{if(t.data){const bytes=Uint8Array.from(atob(t.data),c=>c.charCodeAt(0));t={char:t.char,strokes:Array.from({length:bytes.length/32},(_,i)=>Array.from({length:16},(_,j)=>[bytes[i*32+j*2],bytes[i*32+j*2+1]]))};}const descriptor=describe(t.strokes);return {char:t.char,strokes:descriptor.strokes,aspect:descriptor.aspect,closed:closedContour(descriptor.strokes)};}).filter(t=>t.strokes.length);}
export function recognize(strokes,templates){
 // Bound input before normalization/assignment. A malformed or interrupted
 // pointer stream must not hang the worker or turn NaN into a confident result.
 if(!Array.isArray(strokes)||!strokes.length||strokes.length>64||strokes.some(s=>!Array.isArray(s)||s.length<2||s.length>10000||s.some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite))))return {char:null,candidates:[],reason:'invalid-input'};
 if(strokes.reduce((n,s)=>n+s.length,0)>20000)return {char:null,candidates:[],reason:'input-limit'};
 const all=strokes.flat();if(Math.max(...all.map(p=>p[0]))-Math.min(...all.map(p=>p[0]))<.025&&Math.max(...all.map(p=>p[1]))-Math.min(...all.map(p=>p[1]))<.025)return {char:null,candidates:[],reason:'insufficient-input'};
 const descriptor=describe(strokes),a=descriptor.strokes,candidates=[];
 for(const t of templates){if(t.strokes.length!==a.length)continue;const cost=a.map(s=>t.strokes.map(b=>Math.min(fixedCost(s,b),fixedCost(s,b,true))));candidates.push({template:t,coarse:assignment(cost)+aspectCost(descriptor.aspect,t.aspect)});}
 candidates.sort((a,b)=>a.coarse-b.coarse);
 const ranked=candidates.slice(0,24).map(({template:t})=>({char:t.char,score:assignment(a.map(s=>t.strokes.map(b=>Math.min(elasticCost(s,b),elasticCost(s,b,true)))))+aspectCost(descriptor.aspect,t.aspect)})).sort((a,b)=>a.score-b.score);
 const top=ranked.slice(0,3),first=top[0],margin=top.length>1?top[1].score-first.score:null;
 const contourAmbiguity=first&&closedContour(a)&&candidates.slice(0,24).filter(c=>c.template.closed).length>1;
 const reason=!first?'no-stroke-count-candidates':first.score>=.105?'shape-distance':contourAmbiguity||margin!==null&&margin<=.012?'ambiguous-candidates':'matched';
 return {char:reason==='matched'?first.char:null,candidates:top,reason,strokeCount:strokes.length,margin};
}
