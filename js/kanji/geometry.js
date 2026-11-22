// Shape descriptors only: no expected character, stroke sequence, or correctness.
export function resample(stroke,count=16){const lengths=[0];for(let i=1;i<stroke.length;i++)lengths.push(lengths[i-1]+Math.hypot(stroke[i][0]-stroke[i-1][0],stroke[i][1]-stroke[i-1][1]));const total=lengths.at(-1);if(!total)return Array.from({length:count},()=>[...stroke[0]]);let k=1;return Array.from({length:count},(_,i)=>{const target=total*i/(count-1);while(k<lengths.length-1&&lengths[k]<target)k++;const f=(target-lengths[k-1])/(lengths[k]-lengths[k-1]||1);return[stroke[k-1][0]+f*(stroke[k][0]-stroke[k-1][0]),stroke[k-1][1]+f*(stroke[k][1]-stroke[k-1][1])];});}
export function describe(strokes,count=16){let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;for(const s of strokes)for(const[x,y]of s){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}const w=maxX-minX,h=maxY-minY,size=Math.max(w,h)||1;
 // Independent axis normalization tolerates handwriting proportions. A floor
 // prevents a near-horizontal line's tiny vertical jitter from becoming a box.
 const sx=Math.max(w,size*.5),sy=Math.max(h,size*.5);
 return {strokes:strokes.map(s=>resample(s,count).map(([x,y])=>[(x-(minX+maxX)/2)/sx+.5,(y-(minY+maxY)/2)/sy+.5])),aspect:Math.log(Math.max(w,size*.1)/Math.max(h,size*.1))};}
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export function fixedCost(a,b,reverse=false){return a.reduce((v,p,i)=>v+distance(p,b[reverse?b.length-1-i:i]),0)/a.length;}
// Banded DTW: monotone, endpoint-constrained paths; the narrow window prevents
// a long unrelated segment from being hidden by arbitrary temporal warping.
export function elasticCost(a,b,reverse=false){const n=a.length,m=b.length,bb=reverse?b.toReversed():b,band=Math.max(2,Math.ceil(n*.2));const costs=Array.from({length:n+1},()=>new Float64Array(m+1).fill(Infinity)),steps=Array.from({length:n+1},()=>new Uint16Array(m+1));costs[0][0]=0;
 for(let i=1;i<=n;i++)for(let j=Math.max(1,i-band);j<=Math.min(m,i+band);j++){const options=[[costs[i-1][j-1],steps[i-1][j-1]],[costs[i-1][j]+.002,steps[i-1][j]],[costs[i][j-1]+.002,steps[i][j-1]]];let best=options[0];for(const candidate of options)if(candidate[0]<best[0])best=candidate;
 const av=[a[Math.min(n-1,i+1)][0]-a[Math.max(0,i-2)][0],a[Math.min(n-1,i+1)][1]-a[Math.max(0,i-2)][1]],bv=[bb[Math.min(m-1,j+1)][0]-bb[Math.max(0,j-2)][0],bb[Math.min(m-1,j+1)][1]-bb[Math.max(0,j-2)][1]],den=Math.hypot(...av)*Math.hypot(...bv),angle=den?.015*(1-Math.max(-1,Math.min(1,(av[0]*bv[0]+av[1]*bv[1])/den))):0;
 costs[i][j]=best[0]+distance(a[i-1],bb[j-1])+angle;steps[i][j]=best[1]+1;}
 const endpoints=(distance(a[0],bb[0])+distance(a.at(-1),bb.at(-1)))/2;return .55*costs[n][m]/Math.max(1,steps[n][m])+.45*endpoints;}
export const aspectCost=(a,b)=>Math.min(.05,Math.abs(a-b)*.018);

// A single closed contour has no interior strokes or branching junctions.
// Such a silhouette may name multiple Han glyphs; shape alone cannot resolve it.
export function closedContour(strokes){if(strokes.length<2)return false;const ends=strokes.flatMap(s=>[s[0],s.at(-1)]),pairs=ends.map((p,i)=>{let best=-1,d=.12;ends.forEach((q,j)=>{if((i>>1)===(j>>1))return;const v=Math.hypot(p[0]-q[0],p[1]-q[1]);if(v<d){d=v;best=j;}});return best;});if(pairs.some((j,i)=>j<0||pairs[j]!==i))return false;const seen=new Set(),stack=[0];while(stack.length){const i=stack.pop();if(seen.has(i))continue;seen.add(i);stack.push(i^1,pairs[i]);}return seen.size===ends.length;}
