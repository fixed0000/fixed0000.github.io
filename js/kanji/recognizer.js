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
export function prepare(data){return data.map(t=>{if(t.data){const bytes=Uint8Array.from(atob(t.data),c=>c.charCodeAt(0));t={char:t.char,strokes:Array.from({length:bytes.length/32},(_,i)=>Array.from({length:16},(_,j)=>[bytes[i*32+j*2],bytes[i*32+j*2+1]]))};}return {char:t.char,strokes:normalize(t.strokes)};}).filter(t=>t.strokes.length);}
export function recognize(strokes,templates){
 if(!strokes.length||strokes.some(s=>s.length<2))return {char:null,candidates:[]};
 const all=strokes.flat();if(Math.max(...all.map(p=>p[0]))-Math.min(...all.map(p=>p[0]))<.025&&Math.max(...all.map(p=>p[1]))-Math.min(...all.map(p=>p[1]))<.025)return {char:null,candidates:[]};
 const a=normalize(strokes), candidates=[];
 for(const t of templates){if(t.strokes.length!==a.length)continue;const cost=a.map(s=>t.strokes.map(b=>distance(s,b))); candidates.push({char:t.char,score:assignment(cost)});}
 candidates.sort((a,b)=>a.score-b.score); const top=candidates.slice(0,3),first=top[0];
 return {char:first&&first.score<.105&&(!top[1]||top[1].score-first.score>.012)?first.char:null,candidates:top};
}
