const toggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('#main-nav');
toggle?.addEventListener('click',()=>{
  const open=toggle.getAttribute('aria-expanded')!=='true';
  toggle.setAttribute('aria-expanded',String(open));
  toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  nav.classList.toggle('is-open',open);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){toggle.click();toggle.focus();}});
const search=document.querySelector('#menu-search');
const filters=[...document.querySelectorAll('[data-category]')];
let active='all';
function filterMenu(){
  const query=search.value.trim().toLowerCase();let count=0;
  document.querySelectorAll('.menu-category').forEach(section=>{
    let visible=0;
    section.querySelectorAll('.menu-item').forEach(item=>{
      const show=(active==='all'||section.id===active)&&item.textContent.toLowerCase().includes(query);
      item.hidden=!show;if(show)visible++;
    });
    section.hidden=!visible;count+=visible;
  });
  document.querySelector('#result-count').textContent=`${count} ${count===1?'item':'items'} to explore`;
  document.querySelector('#no-results').hidden=count>0;
}
if(search){
  search.addEventListener('input',filterMenu);
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    active=btn.dataset.category;
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
    history.replaceState(null,'',active==='all'?location.pathname:'#'+active);
    filterMenu();
  }));
  document.querySelector('#clear-search')?.addEventListener('click',()=>{search.value='';active='all';filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category==='all')));history.replaceState(null,'',location.pathname);filterMenu();search.focus();});
  function applyHash(){
    const selected=filters.find(b=>b.dataset.category===location.hash.slice(1));
    active=selected?.dataset.category||'all';
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===active)));
    filterMenu();
  }
  window.addEventListener('hashchange',applyHash);
  applyHash();
}
document.querySelectorAll('[data-load-map]').forEach(button=>button.addEventListener('click',()=>{
  const frame=document.createElement('iframe');frame.title='Google Maps search for Bahattar Cafe, Itahari';frame.src='https://maps.google.com/maps?q=Bahattar%20Cafe%20Itahari%20Nepal&output=embed';frame.loading='lazy';frame.referrerPolicy='no-referrer-when-downgrade';frame.setAttribute('allowfullscreen','');
  button.closest('.map-preview').replaceChildren(frame);
}));
const lightbox=document.querySelector('#photo-dialog');
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{
  const image=lightbox.querySelector('img');image.src=button.dataset.photo;image.alt=button.dataset.caption;lightbox.querySelector('figcaption').textContent=button.dataset.caption;lightbox.showModal();
}));
lightbox?.querySelector('button').addEventListener('click',()=>lightbox.close());
lightbox?.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});
