export class WritingPad {
 constructor(container,index,labels,onchange){
 this.strokes=[];this.active=null;this.onchange=onchange;
 const div=document.createElement('div');div.className='pad';
 const text=document.createElement('p');text.className='label';text.textContent=`${labels.character} ${index+1}`;
 this.canvas=document.createElement('canvas');this.canvas.setAttribute('role','img');this.canvas.setAttribute('aria-label',`${labels.character} ${index+1} — ${labels.hint}`);
 const controls=document.createElement('div');controls.className='controls';
 for(const [label,fn] of [[labels.undo,()=>{this.strokes.pop();this.redraw();onchange();}],[labels.clear,()=>this.clear()]]){const b=document.createElement('button');b.textContent=label;b.onclick=fn;controls.append(b);}
 div.append(text,this.canvas,controls);container.append(div);
 this.canvas.addEventListener('pointerdown',e=>{if(this.active!==null||e.button!==0)return;e.preventDefault();this.canvas.setPointerCapture(e.pointerId);this.active=e.pointerId;this.strokes.push([this.point(e)]);this.redraw();onchange();});
 this.canvas.addEventListener('pointermove',e=>{if(e.pointerId!==this.active)return;e.preventDefault();const points=e.getCoalescedEvents?.();for(const p of points?.length?points:[e])this.strokes.at(-1).push(this.point(p));this.redraw();});
 const end=e=>{if(e.pointerId!==this.active)return;if(e.type==='pointercancel')this.strokes.pop();else this.strokes.at(-1).push(this.point(e));this.active=null;this.redraw();};
 this.canvas.addEventListener('pointerup',end);this.canvas.addEventListener('pointercancel',end);
 this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(this.canvas);this.resize();
 }
 point(e){const r=this.canvas.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];}
 resize(){const r=this.canvas.getBoundingClientRect();const dpr=window.devicePixelRatio||1;this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);this.redraw();}
 redraw(){const c=this.canvas,ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.strokeStyle='#182c45';ctx.lineWidth=c.width*.014;ctx.lineCap='round';ctx.lineJoin='round';for(const s of this.strokes){ctx.beginPath();s.forEach(([x,y],i)=>i?ctx.lineTo(x*c.width,y*c.height):ctx.moveTo(x*c.width,y*c.height));ctx.stroke();}}
 clear(){this.strokes=[];this.redraw();this.onchange();}
 destroy(){this.observer.disconnect();}
}
