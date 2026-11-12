const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced&&'IntersectionObserver'in window){
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}},{threshold:.06});
 document.querySelectorAll('.section').forEach(s=>{s.classList.add('reveal-section');observer.observe(s);});
}
// Progressive enhancement: native details and links remain functional without JS.
document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open&&!reduced)d.querySelector(':scope > :not(summary)')?.animate([{opacity:.5,transform:'translateY(-3px)'},{opacity:1,transform:'none'}],{duration:150});}));
