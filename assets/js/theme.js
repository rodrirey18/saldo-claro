'use strict';
/** Modo claro/oscuro: respeta el teléfono, permite elegir y recuerda la elección.
 *  Solo guarda la preferencia visual ("saldo-claro-theme"); no toca tus datos. */
(function(){
  const KEY='saldo-claro-theme',root=document.documentElement;
  const mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
  const stored=()=>{try{const v=localStorage.getItem(KEY);return v==='dark'||v==='light'?v:null}catch{return null}};
  const current=()=>root.dataset.theme==='dark'?'dark':'light';
  function paint(theme){
    root.dataset.theme=theme;
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',theme==='dark'?'#0a141c':'#f3f7f8');
    const btn=document.getElementById('theme-toggle');
    if(btn){
      const dark=theme==='dark';
      btn.setAttribute('aria-pressed',String(dark));
      btn.setAttribute('aria-label',dark?'Cambiar a modo claro':'Cambiar a modo oscuro');
      btn.title=dark?'Modo claro':'Modo oscuro';
    }
  }
  function choose(theme){
    root.classList.add('theme-anim');                 // transición suave solo durante el cambio
    paint(theme);
    try{localStorage.setItem(KEY,theme)}catch{}
    setTimeout(()=>root.classList.remove('theme-anim'),450);
  }
  paint(stored()||(mq&&mq.matches?'dark':'light'));
  const btn=document.getElementById('theme-toggle');
  if(btn)btn.addEventListener('click',()=>choose(current()==='dark'?'light':'dark'));
  // Si nunca elegiste, sigue los cambios del sistema (por ejemplo, modo nocturno automático).
  const follow=e=>{if(!stored()){root.classList.add('theme-anim');paint(e.matches?'dark':'light');setTimeout(()=>root.classList.remove('theme-anim'),450)}};
  if(mq){mq.addEventListener?mq.addEventListener('change',follow):mq.addListener&&mq.addListener(follow)}
})();
