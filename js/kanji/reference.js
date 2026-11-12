const NS='http://www.w3.org/2000/svg',cache=new Map();
export async function pathsFor(char){const key=(char.codePointAt(0)>>8).toString(16);if(!cache.has(key))cache.set(key,fetch(`/assets/kanji/shapes/${key}.json`).then(r=>{if(!r.ok)throw Error('SVG unavailable');return r.json();}).catch(e=>{cache.delete(key);throw e;}));const data=await cache.get(key);if(!data[char])throw Error('Unsupported kanji');return data[char];}
export class Reference {
 constructor(host,oncount){this.host=host;this.oncount=oncount;this.frame=null;this.speed=1;this.position=0;this.playing=false;this.svg=document.createElementNS(NS,'svg');this.svg.setAttribute('viewBox','0 0 109 109');this.svg.setAttribute('aria-hidden','true');this.svg.classList.add('kanji-reference');host.append(this.svg);}
 setPaths(data){this.pause();this.paths=data.map(d=>{const p=document.createElementNS(NS,'path');p.setAttribute('d',d);p.setAttribute('pathLength','1');return p;});this.svg.replaceChildren(...this.paths);this.position=0;this.full();}
 full(){this.pause();this.svg.classList.remove('animating');for(const p of this.paths||[]){p.style.strokeDasharray='none';p.style.strokeDashoffset='0';p.classList.remove('current-stroke');}this.oncount(0,this.paths?.length||0);}
 show(show){this.svg.hidden=!show;this.svg.style.display=show?'block':'none';}
 play(){if(!this.paths?.length||this.playing)return;if(this.position>=this.paths.length)this.position=0;this.playing=true;this.svg.classList.add('animating');this.last=performance.now();const step=now=>{if(!this.playing)return;this.position+=Math.min(now-this.last,100)*this.speed/700;this.last=now;this.render();if(this.position>=this.paths.length){this.playing=false;this.full();this.oncount(this.paths.length,this.paths.length);return;}this.frame=requestAnimationFrame(step);};this.frame=requestAnimationFrame(step);}
 render(){const current=Math.floor(this.position);this.paths.forEach((p,i)=>{p.style.strokeDasharray='1';p.style.strokeDashoffset=i<current?'0':i===current?String(1-(this.position-current)):'1';p.classList.toggle('current-stroke',i===current);});this.oncount(Math.min(current+1,this.paths.length),this.paths.length);}
 pause(){this.playing=false;cancelAnimationFrame(this.frame);}
 restart(){this.pause();this.position=0;this.render();}
 destroy(){this.pause();this.svg.remove();}
}
