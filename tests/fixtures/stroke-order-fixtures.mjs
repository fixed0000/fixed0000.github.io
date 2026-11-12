import fs from 'node:fs';
const raw=JSON.parse(fs.readFileSync(new URL('../../assets/kanji/templates.json',import.meta.url)));
export function referenceFor(char){const t=raw.find(x=>x.char===char),bytes=Buffer.from(t.data,'base64');return Array.from({length:bytes.length/32},(_,i)=>Array.from({length:16},(_,j)=>[bytes[i*32+j*2]/109,bytes[i*32+j*2+1]/109]));}
export const handwritten=JSON.parse(fs.readFileSync(new URL('../handwriting.json',import.meta.url)));
export const transform=(strokes,fn)=>strokes.map(s=>s.map(([x,y],i)=>fn(x,y,i)));
export const original=referenceFor('山');
export const context={expected:'山',recognized:'山'};
