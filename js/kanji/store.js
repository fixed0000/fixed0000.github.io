export const KEY='kanji-recall-v2',OLD_KEY='kanji-recall-v1';
const counts=['attempts','correct','errors','unrecognized','skips','reveals'];
export const fresh=()=>({version:2,records:{},history:[],favorites:[],custom:[],daily:[],bestStreak:0,settings:{brush:1.4,dark:false},legacy:null});
const single=c=>typeof c==='string'&&/^\p{Script=Han}$/u.test(c)&&[...c].length===1;
export function validate(d){
 if(!d||d.version!==2||!d.records||typeof d.records!=='object'||Array.isArray(d.records)||!Array.isArray(d.history)||d.history.length>10000||!['favorites','custom','daily'].every(k=>Array.isArray(d[k])&&d[k].length<=10000)||!d.favorites.every(single)||!d.custom.every(single)||!d.daily.every(x=>typeof x==='string'&&x.length<32)||!Number.isSafeInteger(d.bestStreak)||d.bestStreak<0)throw Error('Invalid progress schema');
 if(Object.keys(d.records).some(c=>!single(c))||Object.values(d.records).some(r=>!r||!counts.every(k=>Number.isSafeInteger(r[k])&&r[k]>=0)||typeof r.difficult!=='boolean'||typeof r.completed!=='boolean'||!(r.lastReviewed===null||typeof r.lastReviewed==='string')))throw Error('Invalid records');
 if(d.history.some(h=>!h||!single(h.char)||!['correct','incorrect','unrecognized','skips','reveals'].includes(h.kind)||typeof h.date!=='string'||typeof h.recognized!=='string'||h.recognized.length>64||typeof h.level!=='string'||h.level.length>32))throw Error('Invalid history');
 if(!d.settings||typeof d.settings.dark!=='boolean'||!Number.isFinite(d.settings.brush)||d.settings.brush<.5||d.settings.brush>4)throw Error('Invalid settings');
 return d;
}
export function migrate(old,oldWords){const d=fresh();if(!old||old.version!==1||!old.words||typeof old.words!=='object')return d;
 d.legacy=old;d.daily=Array.isArray(old.daily)?old.daily.filter(x=>typeof x==='string'):[];d.bestStreak=Number.isSafeInteger(old.bestStreak)?old.bestStreak:0;
 for(const [id,r]of Object.entries(old.words)){const word=oldWords.find(w=>w.id===id)?.word;if(single(word)&&r&&counts.every(k=>Number.isSafeInteger(r[k])&&r[k]>=0))d.records[word]={...r};}
 return d;
}
export function emptyRecord(){return {attempts:0,correct:0,errors:0,unrecognized:0,skips:0,reveals:0,completed:false,difficult:false,lastReviewed:null};}
export function addAttempt(d,char,kind,recognized,level){const r=d.records[char]??=emptyRecord();if(['correct','incorrect','unrecognized'].includes(kind))r.attempts++;
 if(kind==='correct'){r.correct++;r.completed=true;r.difficult=false;}else if(kind==='incorrect'){r.errors++;r.difficult=true;}else if(kind==='unrecognized'){r.unrecognized++;}else{r[kind]++;if(kind==='reveals')r.difficult=true;}
 r.lastReviewed=new Date().toISOString();d.history.push({char,kind,recognized:recognized||'',date:r.lastReviewed,level});return r;}
