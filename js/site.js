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

// Decorative motion never controls content availability or keyboard access.
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
if(!motionPreference.matches){
 const hero=document.querySelector('.page-home .page-heading');
 if(hero){[hero.querySelector('.hero-name'),hero.querySelector('h1'),hero.querySelector('.lead'),document.querySelector('.hero-actions')].filter(Boolean).forEach((el,i)=>{el.style.setProperty('--hero-delay',i*85+'ms');el.classList.add('hero-enter');});}
 if('IntersectionObserver' in window){
  const reveal=el=>{el.classList.remove('reveal-pending');el.classList.add('reveal-visible');};
  // Observe a short, real heading: 15% can be reached even for very tall sections.
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){reveal(entry.target.closest('.editorial-section'));observer.unobserve(entry.target);}},{threshold:.15});
  document.querySelectorAll('main > .editorial-section').forEach(section=>{if(section.getBoundingClientRect().top>innerHeight){section.classList.add('reveal-pending');observer.observe(section.querySelector('.section-label'));}});
  document.addEventListener('focusin',event=>{const section=event.target.closest('.reveal-pending');if(section)reveal(section);});
  motionPreference.addEventListener('change',event=>{if(event.matches){observer.disconnect();document.querySelectorAll('.reveal-pending').forEach(reveal);}});
 }
}

// Native modal viewer; ordinary image links remain usable without JavaScript.
const galleryDialog=document.querySelector('.gallery-lightbox');
if(galleryDialog && typeof galleryDialog.showModal==='function'){
 const links=[...document.querySelectorAll('.game-gallery a')];let selected=0,opener=null;
 const viewerImage=galleryDialog.querySelector('img');
 function showImage(index){selected=(index+links.length)%links.length;const img=links[selected].querySelector('img');viewerImage.src=links[selected].href;viewerImage.alt=img.alt;galleryDialog.querySelector('.gallery-caption').textContent=links[selected].closest('figure').querySelector('figcaption').textContent;galleryDialog.querySelector('.gallery-position').textContent=(selected+1)+' / '+links.length;}
 links.forEach((link,index)=>link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();opener=link;showImage(index);galleryDialog.showModal();}));
 galleryDialog.querySelector('[data-gallery-close]').addEventListener('click',()=>galleryDialog.close());
 galleryDialog.querySelector('[data-gallery-prev]').addEventListener('click',()=>showImage(selected-1));
 galleryDialog.querySelector('[data-gallery-next]').addEventListener('click',()=>showImage(selected+1));
 galleryDialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();showImage(selected+1);}if(event.key==='ArrowLeft'){event.preventDefault();showImage(selected-1);}});
 galleryDialog.addEventListener('click',event=>{if(event.target===galleryDialog){const r=galleryDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)galleryDialog.close();}});
 galleryDialog.addEventListener('close',()=>opener?.focus());
}
