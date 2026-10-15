'use strict';
/**
 * Experiencia del primer uso, bloqueo privado opcional y tutorial guiado.
 * Cada paso de la guía enfoca un elemento de la interfaz real.
 */
const WELCOME_TOUR = [
  {page:'home',selector:'.hero',title:'Tu dinero disponible',description:'Aquí ves cuánto puedes gastar. Suma tu dinero digital y efectivo, pero no incluye lo que guardaste en ahorros.'},
  {page:'home',selector:'.metric-grid',title:'Tu resumen del mes',description:'Estos cuadros muestran ingresos, gastos, ahorro del mes y cuántas metas tienes. Puedes cambiar el mes arriba.'},
  {page:'home',selector:'.quick-row',title:'Registra lo que ocurre',description:'Añade tus gastos diarios aquí. Los sueldos y recibos fijos se pueden programar una sola vez.'},
  {page:'home',selector:'.wallet-row',title:'Digital y efectivo',description:'Lleva por separado tu dinero de Yape, banco y billetera. Las transferencias entre ambos no cuentan como gastos nuevos.'},
  {page:'movements',selector:'.filter-scroll',title:'Consulta tus movimientos',description:'Aquí puedes buscar, filtrar, editar y revisar cada ingreso, gasto, ahorro o transferencia.'},
  {page:'goals',selector:'.page-heading',title:'Ahorra para tus objetivos',description:'En Metas puedes crear una meta, indicar cuánto cuesta y registrar aportes o retiros cuando quieras.'},
  {page:'goals',selector:'.coach-intro',title:'Mejora tus hábitos',description:'Cada meta tiene un plan para reducir gastos hormiga, comparar productos caros y calcular posibles ahorros. Solo se registra dinero cuando realmente lo apartas.'},
  {page:'goals',selector:'.goals-switch',title:'Planifica antes de gastar',description:'En Plan mensual calculas sueldo y gastos fijos. Puedes anotarlos al llegar su fecha, cuando abras la app. Revisa que sean correctos.'},
  {page:'profile',selector:'#profile-form',title:'Tu perfil está aquí',description:'Pulsa el ícono de usuario de arriba para editar tu nombre y saldos iniciales cuando quieras.'},
  {page:'settings',selector:'#privacy-panel',title:'Privacidad y respaldos',description:'Los datos quedan en este navegador. En Ajustes puedes respaldarlos; para resolver dudas usa el signo ? del encabezado.'}
];
let currentStep = -1;
let lastTourFocus = null;
let lockBusy=false;
let onRecoveryFinished=null;
let tourAnchorScroll=0;
const stopTourScroll=ev=>{if(currentStep>=0)ev.preventDefault();};
window.addEventListener('wheel',stopTourScroll,{passive:false});
window.addEventListener('touchmove',stopTourScroll,{passive:false});
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
      <p class="welcome-intro">Registra tus ingresos, controla tus gastos y ahorra para tus metas. Personaliza tu espacio para comenzar.</p>
      <form id="welcome-form">
        <label for="welcome-name">¿Cómo quieres que te llamemos? (opcional)</label>
        <input id="welcome-name" name="name" autocomplete="nickname" maxlength="55" placeholder="Ejemplo: Alex">
        <p class="field-hint">Tu información se guarda solo en este navegador. No necesitas contraseña para probar la app.</p>
        <p class="welcome-error" role="alert" hidden></p>
        <button type="submit" class="welcome-primary">Comenzar y ver la guía →</button>
      </form>
      <button type="button" class="welcome-secondary" id="welcome-skip">Entrar sin escribir mi nombre</button>
    </div>
    <p class="welcome-help">Maqueta sin cuentas en línea. Evita guardar información sensible en navegadores compartidos.</p>
  </div>`;
  welcomeScreen.querySelector('#welcome-form').addEventListener('submit',ev=>{ev.preventDefault();completeWelcome(welcomeScreen.querySelector('#welcome-name').value.trim());});
  welcomeScreen.querySelector('#welcome-skip').addEventListener('click',()=>completeWelcome(''));
}
function completeWelcome(name){
  db.profile.name=name;
  if(!save())return showError(welcomeScreen,'No se pudieron guardar los datos.');
  security.finishOnboarding();
  welcomeScreen.hidden=true;
  toggleShell(true);
  page='home';render();window.scrollTo(0,0);
  setTimeout(startTour,180);
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
      <button type="button" id="lock-recover" class="welcome-secondary">${security.hasRecovery()?'Olvidé mi contraseña · Usar código de recuperación':'¿Olvidaste la contraseña? Ver opciones'}</button>
      <p class="welcome-help">${security.hasRecovery()?'El código que guardaste al crear la contraseña permite restablecerla.':'Esta cuenta se creó antes de incorporar códigos de recuperación. Necesitas la contraseña original o un respaldo previamente exportado.'}</p><button type="button" id="lock-reset" class="welcome-secondary">Borrar este espacio y empezar de cero</button>
    </div></div>`;
  lockScreen.querySelector('#lock-recover').addEventListener('click',openForgotPassword);
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
      await security.disable(db); // Se deja atrás la contraseña antigua, sin perder movimientos.
      applyFixedSchedules();
      lockScreen.querySelector('#unlock-password').value='';
      lockScreen.hidden=true;
      toggleShell(true);page='home';month=thisMonth();render();
      toast('Datos anteriores recuperados: ahora entras sin contraseña.');
    }catch{showError(lockScreen,'Contraseña incorrecta o datos protegidos dañados.');}
    finally{button.disabled=false;lockBusy=false;}
  });
}
async function lockNow(){
  try{await security.lock();db=blank();showLock();}catch{toast('No fue posible bloquear los datos.');}
}

/** Muestra un código UNA SOLA VEZ. El código no se guarda en texto claro. */
function showRecoveryCode(code,onFinish=null){
  onRecoveryFinished=onFinish;
  modal('Guarda tu código de recuperación',`<div class="recovery-info">
    <div class="recover-mark">${ico('shield',32)}</div>
    <h3>Esta es tu llave de emergencia</h3>
    <p>Si olvidas tu contraseña, podrás usar este código para crear otra y abrir tus registros. <strong>Solo se muestra ahora.</strong></p>
    <output id="recovery-code" class="recovery-code" aria-label="Código de recuperación">${esc(code)}</output>
    <button type="button" id="recovery-copy" class="secondary-btn btn-full">${ico('download',16)} Copiar código</button>
    <p class="field-hint">Guárdalo en un lugar privado fuera de este navegador. No lo compartas ni lo pongas en GitHub. Si pierdes tanto la contraseña como el código y no tienes un respaldo, los datos no se pueden recuperar.</p>
    <label class="recovery-check"><input type="checkbox" id="recovery-ack"> Ya guardé mi código en un lugar seguro.</label>
    <button type="button" class="primary-btn btn-full" id="recovery-done" disabled>Continuar</button>
  </div>`);
  $('modal-overlay').dataset.recovery='1';
  $('recovery-ack').addEventListener('change',ev=>$('recovery-done').disabled=!ev.target.checked);
  $('recovery-copy').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(code);toast('Código copiado. Guárdalo fuera de la app.');}
    catch{toast('No se pudo copiar. Anota el código manualmente.');}
  });
  $('recovery-done').addEventListener('click',()=>{
    if(!$('recovery-ack').checked)return;
    delete $('modal-overlay').dataset.recovery;
    closeModal();
    const fn=onRecoveryFinished;onRecoveryFinished=null;
    if(fn)setTimeout(fn,220);
  });
}
function openForgotPassword(){
  if(!security.hasRecovery()){
    alert('Esta versión anterior no tiene código de recuperación. Usa tu contraseña original o recupera un respaldo JSON que hayas exportado. Si no tienes ninguno de los dos, no será posible descifrar los datos antiguos.');
    return;
  }
  const card=lockScreen.querySelector('.welcome-card');
  card.innerHTML=`<div class="welcome-art">${ico('shield',55)}</div><span class="welcome-pill">RECUPERAR ACCESO</span>
    <h1>Crear una nueva contraseña</h1><p class="welcome-intro">Escribe el código que guardaste al proteger este dispositivo. No necesitas recordar tu contraseña anterior.</p>
    <form id="forgot-form"><label for="forgot-code">Código de recuperación</label><input id="forgot-code" name="code" required autocapitalize="characters" autocomplete="off" placeholder="XXXX-XXXX-...">
    <label for="forgot-password">Nueva contraseña (mínimo 8 caracteres)</label><input id="forgot-password" name="password" type="password" minlength="8" autocomplete="new-password" required>
    <label for="forgot-confirm">Repetir nueva contraseña</label><input id="forgot-confirm" type="password" minlength="8" autocomplete="new-password" required>
    <p class="welcome-error" role="alert" hidden></p><button class="welcome-primary" type="submit">Restablecer contraseña</button></form>
    <button type="button" class="welcome-secondary" id="forgot-back">Volver a desbloquear</button>`;
  card.querySelector('#forgot-back').addEventListener('click',showLock);
  card.querySelector('#forgot-form').addEventListener('submit',async ev=>{
    ev.preventDefault();if(lockBusy)return;
    const f=ev.currentTarget, password=f.elements.password.value;
    if(password.length<8||password!==f.querySelector('#forgot-confirm').value){showError(lockScreen,'Verifica la nueva contraseña y su confirmación (mínimo 8 caracteres).');return;}
    lockBusy=true;f.querySelector('button[type="submit"]').disabled=true;
    try{
      const {data,code}=await security.recover(f.elements.code.value,password);
      db={...blank(),...data,profile:{...blank().profile,...data.profile},opening:{...blank().opening,...data.opening}};
      await security.disable(db);
      applyFixedSchedules();
      f.reset();lockScreen.hidden=true;toggleShell(true);page='home';render();
      toast('Datos recuperados. Ya no necesitas contraseña en esta versión.');
    }catch{showError(lockScreen,'Código incorrecto o archivo cifrado dañado. Revisa el código y vuelve a intentar.');}
    finally{lockBusy=false;const b=f.querySelector('button[type="submit"]');if(b)b.disabled=false;}
  });
}
function startApplication(){
  if(security.hasVault())return showLock();
  const stored=localStorage.getItem(KEY);
  const existing=Boolean(stored&&(db.transactions.length||db.goals.length||db.recurring.length||db.profile.name||db.demo));
  if(!security.hasOnboarded()&&!existing)return openWelcome();
  if(existing)security.finishOnboarding();
  applyFixedSchedules();
  toggleShell(true);render();
}

function startTour(){
  if(!document.getElementById('app-shell').hidden){
    lastTourFocus=document.activeElement;
    currentStep=0;tourLayer.hidden=false;
    document.documentElement.classList.add('tour-frozen');
    document.body.classList.add('tour-active');
    renderTourStep();
  }
}
function finishTour(){
  currentStep=-1;tourLayer.hidden=true;
  document.body.classList.remove('tour-active');
  document.documentElement.classList.remove('tour-frozen');
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
    tourAnchorScroll=window.scrollY;
    requestAnimationFrame(()=>requestAnimationFrame(positionTour));
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
window.addEventListener('scroll',()=>{
  if(currentStep>=0 && Math.abs(window.scrollY-tourAnchorScroll)>2)window.scrollTo({top:tourAnchorScroll,behavior:'instant'});
},{passive:true});
document.addEventListener('keydown',ev=>{if(currentStep>=0&&ev.key==='Escape')finishTour();});
startApplication();
