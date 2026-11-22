import {prepare,recognize} from './recognizer.js';
let templates;
onmessage=async({data})=>{try{if(data.type==='load'){const r=await fetch('/assets/kanji/templates.json',{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error(r.status);templates=prepare(await r.json());postMessage({type:'ready',count:templates.length});}else{if(!templates)throw Error('not ready');postMessage({type:'result',id:data.id,results:data.strokes.map(s=>recognize(s,templates))});}}catch(e){postMessage({type:'error',id:data.id,message:String(e)});}};
