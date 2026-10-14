'use strict';
/**
 * Experiencia del primer uso, bloqueo privado opcional y tutorial guiado.
 * Cada paso de la guía enfoca un elemento de la interfaz real.
 */
const WELCOME_TOUR = [
  {page:'home',selector:'.hero',title:'Tu dinero disponible',description:'Aquí ves cuánto puedes gastar. Suma tu dinero digital y efectivo, pero no incluye lo que guardaste en ahorros.'},
  {page:'home',selector:'.metric-grid',title:'Tu resumen del mes',description:'Estos cuadros muestran ingresos, gastos, ahorro del mes y cuántas metas tienes. Puedes cambiar el mes arriba.'},
  {page:'home',selector:'.quick-row',title:'Registra lo que ocurre',description:'Cuando recibas dinero, pulsa “Añadir ingreso”. Cuando pagues algo, usa “Registrar gasto”. Nada se registra automáticamente.'},
  {page:'home',selector:'.wallet-row',title:'Digital y efectivo',description:'Lleva por separado tu dinero de Yape, banco y billetera. Las transferencias entre ambos no cuentan como gastos nuevos.'},
  {page:'movements',selector:'.filter-scroll',title:'Consulta tus movimientos',description:'Aquí puedes buscar, filtrar, editar y revisar cada ingreso, gasto, ahorro o transferencia.'},
  {page:'goals',selector:'.page-heading',title:'Ahorra para tus objetivos',description:'En Metas puedes crear una meta, indicar cuánto cuesta y registrar aportes o retiros cuando quieras.'},
  {page:'goals',selector:'.coach-intro',title:'Mejora tus hábitos',description:'Cada meta tiene un plan para reducir gastos hormiga, comparar productos caros y calcular posibles ahorros. Solo se registra dinero cuando realmente lo apartas.'},
  {page:'goals',selector:'.goals-switch',title:'Planifica antes de gastar',description:'En “Plan mensual” tendrás presupuestos y pagos previstos. Solo los movimientos reales modifican el saldo.'},
  {page:'settings',selector:'#privacy-panel',title:'Tus datos y privacidad',description:'Desde Ajustes puedes activar o cambiar tu contraseña, exportar un respaldo y volver a abrir esta guía.'}
];
let currentStep = -1;
let lastTourFocus = null;
let lockBusy=false;
const welcomeScreen = document.getElementById('welcome-screen');
const lockScreen = document.getElementById('lock-screen');
const tourLayer = document.getElementById('tour-layer');

function showError(screen, message){const el=screen.querySelector('.welcome-error');if(el){el.hidden=false;el.textContent=message;}}
function toggleShell(show){document.getElementById('app-shell').hidden=!show;}
function logoMark(){return '<span class="logo" aria-hidden="true"><span></span><span></span><span></span></span>';}

function openWelcome(){
  finishTour();
  toggleShell(false);
  lockScreen.hidden=true;
  welcomeScreen.hidden=false;
  welcomeScreen.innerHTML=`<div class="welcome-shell">
    <div class="welcome-brand">${logoMark()} Saldo Claro</div>
    <div class="welcome-card">
      <div class="welcome-art">${ico('wallet',66)}</div><span class="welcome-pill">TU PRIMER DÍA</span>
      <h1>Organiza tu dinero a tu manera</h1>
      <p class="welcome-intro">Registra ingresos, controla gastos y ahorra para lo que realmente quieres. Antes de empezar, personaliza tu espacio.</p>
      <form id="welcome-form" novalidate>
        <label for="welcome-name">¿Cómo quieres que te llamemos? (opcional)</label>
        <input id="welcome-name" name="name" autocomplete="nickname" maxlength="55" placeholder="Ejemplo: Alex">
        <div class="welcome-choice"><label><input type="checkbox" id="welcome-protect"> Proteger mis datos con contraseña</label><p>Puedes activarla ahora o después, desde Ajustes → Privacidad.</p></div>
        <div id="welcome-password-fields" hidden>
          <label for="welcome-pass">Crea una contraseña</label><input type="password" id="welcome-pass" autocomplete="new-password" minlength="8" placeholder="8 caracteres como mínimo">
          <label for="welcome-confirm">Repite la contraseña</label><input type="password" id="welcome-confirm" autocomplete="new-password" placeholder="Confirmar contraseña">
          <p class="field-hint">Se cifrarán tus registros solo en este dispositivo. Si olvidas la contraseña, no podrás recuperar los datos cifrados sin un respaldo previo.</p>
        </div>
        <p class="welcome-error" role="alert" hidden></p>
        <button type="submit" class="welcome-primary">Comenzar y ver la guía →</button>
      </form>
      <button type="button" class="welcome-secondary" id="welcome-skip">Entrar sin configurar nada</button>
    </div>
    <p class="welcome-help">Maqueta gratuita y sin cuentas online. Tu información permanece en este navegador; no se comparte con otros usuarios.</p>
  </div>`;
  const check=welcomeScreen.querySelector('#welcome-protect');
  check.addEventListener('change',()=>welcomeScreen.querySelector('#welcome-password-fields').hidden=!check.checked);
  welcomeScreen.querySelector('#welcome-form').addEventListener('submit',processWelcome);
  welcomeScreen.querySelector('#welcome-skip').addEventListener('click',()=>completeWelcome('',null));
}
async function processWelcome(event){
  event.preventDefault();
  const screen=welcomeScreen;
  const name=screen.querySelector('#welcome-name').value.trim();
  let password=null;
  if(screen.querySelector('#welcome-protect').checked){
    password=screen.querySelector('#welcome-pass').value;
    const confirm=screen.querySelector('#welcome-confirm').value;
    if(!security.available())return showError(screen,'Para activar una contraseña abre la aplicación desde Live Server o GitHub Pages (HTTPS).');
    if(password.length<8)return showError(screen,'La contraseña debe tener 8 caracteres o más.');
    if(password!==confirm)return showError(screen,'Las contraseñas no coinciden.');
  }
  await completeWelcome(name,password);
}
async function completeWelcome(name,password){
  const button=welcomeScreen.querySelector('button[type=submit]');
  if(button)button.disabled=true;
  try{
    db.profile.name=name;
    if(password)await security.enable(password,db);
    else if(!save())throw Error('No se pudieron guardar los datos.');
    security.finishOnboarding();
    welcomeScreen.hidden=true;
    toggleShell(true);
    page='home';
    render();
    window.scrollTo(0,0);
    setTimeout(startTour,180);
  }catch(err){showError(welcomeScreen,err.message||'No se pudo completar la configuración.');}
  finally{if(button)button.disabled=false;}
}

function showLock(){
  finishTour();
  welcomeScreen.hidden=true;
  toggleShell(false);
  lockScreen.hidden=false;
  lockScreen.innerHTML=`<div class="welcome-shell"><div class="welcome-brand">${logoMark()} Saldo Claro</div>
    <div class="welcome-card"><div class="welcome-art">${ico('lock',61)}</div><span class="welcome-pill">ESPACIO PROTEGIDO</span>
      <h1>Bienvenido de vuelta</h1><p class="welcome-intro">Tus registros están cifrados en este navegador. Escribe tu contraseña para abrirlos.</p>
      <form id="unlock-form"><label for="unlock-password">Contraseña</label><input id="unlock-password" type="password" autocomplete="current-password" required placeholder="Tu contraseña">
      <p class="welcome-error" role="alert" hidden></p><button class="welcome-primary" type="submit">Desbloquear mi espacio →</button></form>
      <p class="welcome-help">Si olvidaste tu contraseña, no existe recuperación automática. Solo podrás recuperar tus registros si conservas un respaldo exportado.</p><button type="button" id="lock-reset" class="welcome-secondary">Borrar este espacio y empezar de cero</button>
    </div></div>`;
  lockScreen.querySelector('#lock-reset').addEventListener('click',async()=>{
    const confirmation=prompt('Esto borrará permanentemente tus datos locales cifrados. Para confirmar escribe BORRAR:');
    if(confirmation!=='BORRAR')return;
    try {await security.eraseAll();db=blank();openWelcome();}
    catch {showError(lockScreen,'No se pudieron borrar los datos locales.');}
  });
  lockScreen.querySelector('#unlock-form').addEventListener('submit',async ev=>{
    ev.preventDefault();if(lockBusy)return;lockBusy=true;
    const button=lockScreen.querySelector('button[type=submit]');button.disabled=true;
    try{
      const data=await security.unlock(lockScreen.querySelector('#unlock-password').value);
      db={...blank(),...data,profile:{...blank().profile,...data.profile},opening:{...blank().opening,...data.opening}};
      lockScreen.querySelector('#unlock-password').value='';
      lockScreen.hidden=true;
      toggleShell(true);page='home';month=thisMonth();render();
      toast('Tu espacio está desbloqueado');
    }catch{showError(lockScreen,'Contraseña incorrecta o datos protegidos dañados.');}
    finally{button.disabled=false;lockBusy=false;}
  });
}
async function lockNow(){
  try{await security.lock();db=blank();showLock();}catch{toast('No fue posible bloquear los datos.');}
}

function openPasswordSettings(){
  const enabled=security.hasVault();
  modal('Privacidad y contraseña',`<form id="password-form">
    <p class="info-line">${enabled?'Para cambiar o quitar tu contraseña actual debes escribirla primero.':'La contraseña es opcional y cifra tus registros en este navegador, no en otros dispositivos.'}</p>
    ${enabled?`<div class="form-group"><label for="privacy-current">Contraseña actual</label><input id="privacy-current" name="current" type="password" autocomplete="current-password" required minlength="8"></div><div class="form-group"><label for="privacy-operation">¿Qué quieres hacer?</label><select name="operation" id="privacy-operation"><option value="change">Cambiar contraseña</option><option value="remove">Quitar contraseña</option></select></div>`:'<input name="operation" type="hidden" value="add">'}
    <div id="privacy-new-fields"><div class="form-group"><label for="privacy-new">Nueva contraseña (mínimo 8 caracteres)</label><input id="privacy-new" name="password" type="password" autocomplete="new-password" minlength="8"></div><div class="form-group"><label for="privacy-repeat">Confirma la contraseña</label><input id="privacy-repeat" name="repeat" type="password" autocomplete="new-password" minlength="8"></div></div>
    <p class="info-line">Si olvidas la contraseña, no podremos recuperarla. Guarda respaldos con cuidado: se exportan sin cifrar.</p><p class="welcome-error" role="alert" hidden></p>
    <div class="modal-buttons"><button type="button" class="secondary-btn" data-action="close-modal">Cancelar</button><button type="submit" class="primary-btn">Guardar</button></div>
  </form>`);
  const op=document.getElementById('privacy-operation');
  if(op)op.addEventListener('change',()=>document.getElementById('privacy-new-fields').hidden=op.value==='remove');
  document.getElementById('password-form').addEventListener('submit',savePasswordSettings);
}
async function savePasswordSettings(ev){
  ev.preventDefault();
  const f=ev.currentTarget, d=Object.fromEntries(new FormData(f));
  const operation=d.operation;
  const saveButton=f.querySelector('button[type=submit]');
  saveButton.disabled=true;
  try{
    if(!security.available())throw Error('La contraseña requiere HTTPS o un servidor local.');
    if(security.hasVault())await security.verify(d.current||'');
    if(operation==='remove'){
      if(!confirm('Al quitar la contraseña, los datos de este navegador se guardarán sin cifrar. ¿Continuar?'))return;
      await security.disable(db);
    }else{
      if(!d.password || d.password.length<8)throw Error('La contraseña debe tener al menos 8 caracteres.');
      if(d.password!==d.repeat)throw Error('Las contraseñas nuevas no coinciden.');
      await security.enable(d.password,db);
    }
    closeModal();render();toast(operation==='remove'?'Contraseña eliminada':'Contraseña configurada');
  }catch(err){
    const e=f.querySelector('.welcome-error');e.hidden=false;
    e.textContent=/decrypt|operation|incorrect|auth/i.test(String(err))?'La contraseña actual es incorrecta.':(err.message||'No se pudo actualizar la contraseña.');
  }finally{saveButton.disabled=false;}
}

function startApplication(){
  if(security.hasVault())return showLock();
  const stored=localStorage.getItem(KEY);
  const existing=Boolean(stored&&(db.transactions.length||db.goals.length||db.recurring.length||db.profile.name||db.demo));
  if(!security.hasOnboarded()&&!existing)return openWelcome();
  if(existing)security.finishOnboarding();
  toggleShell(true);render();
}

function startTour(){
  if(!document.getElementById('app-shell').hidden){
    lastTourFocus=document.activeElement;
    currentStep=0;tourLayer.hidden=false;
    renderTourStep();
  }
}
function finishTour(){
  currentStep=-1;tourLayer.hidden=true;
  document.body.classList.remove('tour-active');
  if(lastTourFocus?.isConnected)lastTourFocus.focus({preventScroll:true});
  lastTourFocus=null;
}
function renderTourStep(){
  if(currentStep<0)return;
  const info=WELCOME_TOUR[currentStep];
  if(page!==info.page){
    page=info.page;
    if(page==='goals')goalTab='goals';
    render();window.scrollTo(0,0);
  }
  document.getElementById('tour-title').textContent=info.title;
  document.getElementById('tour-description').textContent=info.description;
  document.getElementById('tour-count').textContent=`${currentStep+1} de ${WELCOME_TOUR.length}`;
  document.getElementById('tour-next').textContent=currentStep===WELCOME_TOUR.length-1?'¡Entendido! ✓':'Siguiente →';
  document.getElementById('tour-back').hidden=currentStep===0;
  requestAnimationFrame(()=>{
    const target=document.querySelector(info.selector);
    if(!target)return;
    const bounds=target.getBoundingClientRect();
    const availableTop=75;
    if(bounds.bottom>window.innerHeight-availableTop || bounds.top<availableTop)target.scrollIntoView({block:'center',behavior:'instant'});
    requestAnimationFrame(positionTour);
  });
}
function positionTour(){
  if(currentStep<0||tourLayer.hidden)return;
  const target=document.querySelector(WELCOME_TOUR[currentStep].selector);
  if(!target)return;
  const r=target.getBoundingClientRect();
  const pad=5, spotlight=tourLayer.querySelector('.tour-spotlight');
  const top=Math.max(4,r.top-pad),left=Math.max(4,r.left-pad);
  spotlight.style.top=top+'px';spotlight.style.left=left+'px';
  spotlight.style.width=Math.min(window.innerWidth-left-4,r.width+pad*2)+'px';
  spotlight.style.height=Math.min(window.innerHeight-top-4,r.height+pad*2)+'px';
  const bubble=tourLayer.querySelector('.tour-bubble');
  bubble.style.visibility='hidden';
  bubble.style.top='0px';bubble.style.left='0px';
  const b=bubble.getBoundingClientRect();
  const gap=16;
  // Prefer the side with enough space; otherwise keep callout safely on screen.
  const below=window.innerHeight-r.bottom-gap;
  const above=r.top-gap;
  const positionAbove=below<b.height+14 && above>below;
  let y=positionAbove?r.top-b.height-gap:r.bottom+gap;
  y=Math.min(Math.max(13,y),window.innerHeight-b.height-13);
  const x=Math.min(Math.max(14,r.left+r.width/2-b.width/2),window.innerWidth-b.width-14);
  bubble.style.left=x+'px';bubble.style.top=y+'px';
  const center=r.left+r.width/2;
  bubble.style.setProperty('--pointer-x',Math.max(20,Math.min(b.width-32,center-x-8))+'px');
  bubble.dataset.arrow=positionAbove?'down':'up';
  bubble.style.visibility='visible';
}
document.getElementById('tour-next').addEventListener('click',()=>{
  if(currentStep===WELCOME_TOUR.length-1)finishTour();
  else{currentStep++;renderTourStep();}
});
document.getElementById('tour-back').addEventListener('click',()=>{
  if(currentStep>0){currentStep--;renderTourStep();}
});
document.getElementById('tour-skip').addEventListener('click',finishTour);
window.addEventListener('resize',()=>{if(currentStep>=0)requestAnimationFrame(positionTour);});
window.addEventListener('scroll',()=>{if(currentStep>=0)requestAnimationFrame(positionTour);},{passive:true});
document.addEventListener('keydown',ev=>{if(currentStep>=0&&ev.key==='Escape')finishTour();});
startApplication();
