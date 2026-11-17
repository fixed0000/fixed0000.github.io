// Progressive enhancement: content and native case disclosure work without JS.
document.documentElement.classList.add('js');
const toggle=document.querySelector('.menu-toggle'), navigation=document.querySelector('#site-navigation');
function setMenu(open){toggle?.setAttribute('aria-expanded',String(open));navigation?.classList.toggle('is-open',open);if(toggle)toggle.innerHTML=(open?toggle.dataset.close:toggle.dataset.open)+' <span aria-hidden="true">'+(open?'−':'＋')+'</span>';}
toggle?.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){setMenu(false);toggle.focus();}});
navigation?.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false);});
matchMedia('(min-width:701px)').addEventListener('change',()=>setMenu(false));
function revealCase(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(target?.matches('details.case-detail')){target.open=true;target.scrollIntoView({block:'start'});}}
addEventListener('hashchange',revealCase);revealCase();
// GitHub Pages serves the root 404 for nested unknown routes.
if(document.body.classList.contains('page-notfound')&&location.pathname.startsWith('/en/')&&document.documentElement.lang==='ja')location.replace('/en/404.html?from='+encodeURIComponent(location.pathname));

// Reveal only below-fold editorial sections; keep no-JS and reduced-motion content visible.
if(!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
 const revealObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.remove('reveal-pending');entry.target.classList.add('reveal-visible');revealObserver.unobserve(entry.target);}},{threshold:0,rootMargin:'0px 0px 32px 0px'});
 document.querySelectorAll('main > .editorial-section').forEach(section=>{if(section.getBoundingClientRect().top>innerHeight){section.classList.add('reveal-pending');revealObserver.observe(section);}});
}
