const NS='http://www.w3.org/2000/svg';let serial=0;
export function svgElement(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;}
// Every marker uses the recorded coordinates, including the true first/last point.
export function strokeTrail(points,index,color){const g=svgElement('g',{'class':'stroke-trail',stroke:'none'});if(!points?.length)return g;
 const id='stroke-arrow-'+(++serial),defs=svgElement('defs'),marker=svgElement('marker',{id,viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:.065,markerHeight:.065,markerUnits:'userSpaceOnUse',orient:'auto'});
 marker.append(svgElement('polygon',{points:'0,0 10,5 0,10 2,5',fill:color}));defs.append(marker);g.append(defs);
 const polyline=svgElement('polyline',{points:points.map(p=>p.join(',')).join(' '),fill:'none',stroke:color,'stroke-width':.018,'stroke-linecap':'round','stroke-linejoin':'round','marker-end':'url(#'+id+')'});
 const first=points[0],last=points.at(-1);g.append(polyline,svgElement('circle',{cx:first[0],cy:first[1],r:.027,fill:'#fff',stroke:color,'stroke-width':.012,'class':'stroke-start'}),svgElement('circle',{cx:last[0],cy:last[1],r:.013,fill:color,'class':'stroke-end'}));
 const label=svgElement('text',{x:first[0]+.035,y:first[1]-.025,fill:color,'font-size':.07,'font-family':'sans-serif','font-weight':'bold'});label.textContent=index+1;g.append(label);return g;}
export function miniStroke(points,index,color,label){const figure=document.createElement('figure'),caption=document.createElement('figcaption');caption.textContent=label;figure.append(caption);if(points?.length){const svg=svgElement('svg',{viewBox:'-.62 -.62 1.24 1.24',role:'img','aria-label':label+' '+(index+1)});svg.append(strokeTrail(points,index,color));figure.append(svg);}else{const p=document.createElement('p');p.textContent=document.documentElement.lang==='en'?'No reliable match':'対応する画は未確定';figure.append(p);}return figure;}
