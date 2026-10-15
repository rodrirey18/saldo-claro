'use strict';
/** Modelo de finanzas: datos, saldos y reglas contables. */
const KEY = 'saldo-claro-mobile-v2';
const CATS = {income:['Sueldo','Trabajo extra','Propina','Regalo','Otros ingresos'], expense:['Casa','Alimentación','Transporte','Servicios','Suscripciones','Entretenimiento','Educación','Salud','Compras','Viajes','Otros gastos']};
const GOAL_ICONS=['laptop','plane','book','house','gift','car','target','shield'];
const now=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const thisMonth=()=>now().slice(0,7);
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const round=n=>Math.round((Number(n)+Number.EPSILON)*100)/100;
const amt=n=>Number.isFinite(Number(n))?Number(n):0;
const humanDate=s=>new Date(Number(s.slice(0,4)),Number(s.slice(5,7))-1,Number(s.slice(8,10))).toLocaleDateString('es-PE',{day:'numeric',month:'short'});
const monthLabel=m=>new Date(Number(m.slice(0,4)),Number(m.slice(5,7))-1,1).toLocaleDateString('es-PE',{month:'long',year:'numeric'});
const caps=s=>s.charAt(0).toUpperCase()+s.slice(1);
const nameOf=a=>({digital:'Digital',cash:'Efectivo',savings:'Ahorros'})[a]||'Cuenta';
const typeName=t=>({income:'Ingreso',expense:'Gasto',save:'Aporte a ahorro',withdraw:'Retiro de ahorro',transfer:'Transferencia',adjustment:'Diferencia por identificar'})[t]||'Movimiento';
const blank=()=>({schema:2,profile:{name:'',currency:'PEN'},opening:{digital:0,cash:0,savings:0},openingMonth:null,categories:structuredClone(CATS),transactions:[],goals:[],budgets:{},recurring:[],strategies:[],skippedRecurring:[],demo:false});
function load(){if(security.hasVault())return blank();try{const a=JSON.parse(localStorage.getItem(KEY));if(a?.schema!==2||!Array.isArray(a.transactions)||!Array.isArray(a.goals))return blank();const b=blank();return {...b,...a,profile:{...b.profile,...a.profile},opening:{...b.opening,...a.opening},categories:{...b.categories,...a.categories}}}catch{return blank()}}
// El modo de prueba guarda sus modificaciones SOLO en sessionStorage, separado de los datos reales.
const DEMO_ACTIVE_KEY='saldo-claro:demo-active-v9';
const DEMO_SESSION_KEY='saldo-claro:demo-data-v9';
let demoMode=false;
let previousRealData=null;
function restoreDemoSession(){
 try{
  if(sessionStorage.getItem(DEMO_ACTIVE_KEY)!=='1')return null;
  const stored=JSON.parse(sessionStorage.getItem(DEMO_SESSION_KEY)||'null');
  if(stored?.schema===2 && stored.demo===true && Array.isArray(stored.transactions) && Array.isArray(stored.goals)){
    demoMode=true;return {...blank(),...stored};
  }
 }catch{};
 try{sessionStorage.removeItem(DEMO_ACTIVE_KEY);sessionStorage.removeItem(DEMO_SESSION_KEY)}catch{}
 return null;
}
function keepDemoSession(){
 try{sessionStorage.setItem(DEMO_SESSION_KEY,JSON.stringify(db));sessionStorage.setItem(DEMO_ACTIVE_KEY,'1');return true}
 catch{return false}
}
function forgetDemoSession(){
 try{sessionStorage.removeItem(DEMO_ACTIVE_KEY);sessionStorage.removeItem(DEMO_SESSION_KEY)}catch{}
}
let db=restoreDemoSession()||load();let coachGoalId='';let coachSmallLimit=20;let page='home';let goalTab='goals';let month=thisMonth();let filter='all';let searchOpen=false;let searchText='';let showBalance=true;let focusReturn=null;
const $=id=>document.getElementById(id);
function save(){try{if(demoMode)return keepDemoSession();if(security.isUnlocked()){security.persist(db).catch(()=>toast('No se pudo guardar el archivo cifrado.'));return true}if(security.hasVault())return false;localStorage.setItem(KEY,JSON.stringify(db));return true}catch{alert('No se pudo guardar. Revisa el espacio disponible del navegador.');return false}}
function money(n){try{return new Intl.NumberFormat('es-PE',{style:'currency',currency:db.profile.currency||'PEN',minimumFractionDigits:2,maximumFractionDigits:2}).format(round(amt(n)))}catch{return `S/ ${round(amt(n)).toFixed(2)}`}}
function maybeMoney(n){return showBalance?money(n):'••••••'}
function changed(t,w){const a=amt(t.amount);switch(t.type){case'income':return t.to===w?a:0;case'expense':return t.from===w?-a:0;case'save':return w==='savings'?a:t.from===w?-a:0;case'withdraw':return w==='savings'?-a:t.to===w?a:0;case'transfer':return (t.to===w?a:0)-(t.from===w?a:0);case'adjustment':return t.account===w?(t.direction==='increase'?a:-a):0;default:return 0}}
function balances(m=month){const b={...db.opening};const end=m+'-31';for(const t of db.transactions){if(t.date>end)continue;for(const k of ['digital','cash','savings'])b[k]=round(amt(b[k])+changed(t,k))}return b}
/** Saldo de apertura del mes seleccionado. Incluye la base inicial y los
 * movimientos hasta el último día del mes anterior, NO los del mes actual.
 * Transferencias y aportes no se vuelven ingresos al cambiar de mes.
 */
function balancesAtMonthStart(m=month){
 const result={digital:round(amt(db.opening.digital)),cash:round(amt(db.opening.cash)),savings:round(amt(db.opening.savings))};
 const cutoff=`${m}-01`;
 for(const t of db.transactions){
  if(!t.date||t.date>=cutoff)continue;
  for(const k of ['digital','cash','savings'])result[k]=round(result[k]+changed(t,k));
 }
 return result;
}
function monthSummary(m=month){
 const start=balancesAtMonthStart(m),end=balances(m);
 const started=round(start.digital+start.cash);
 const finished=round(end.digital+end.cash);
 const delta=round(finished-started);
 const movementsThisMonth=movements(m);
 const classified=monthly(m);
 const unidentified=round(movementsThisMonth.filter(t=>t.type==='adjustment').reduce((s,t)=>s+(t.direction==='increase'?amt(t.amount):-amt(t.amount)),0));
 return {start,end,started,finished,delta,income:classified.income,expense:classified.expense,saved:classified.saved,unidentified};
}
function movements(m=month){return db.transactions.filter(t=>t.date?.slice(0,7)===m)}
function monthly(m=month){let income=0,expense=0,saved=0;for(const t of movements(m)){if(t.type==='income')income+=amt(t.amount);if(t.type==='expense')expense+=amt(t.amount);if(t.type==='save')saved+=amt(t.amount);if(t.type==='withdraw')saved-=amt(t.amount)}const discrepancy=round(movements(m).filter(t=>t.type==='adjustment').reduce((sum,t)=>sum+amt(t.amount),0));return {income:round(income),expense:round(expense),saved:round(saved),discrepancy}}
function goalAmount(id){return round(db.transactions.reduce((total,t)=>t.goalId===id?total+(t.type==='save'?amt(t.amount):t.type==='withdraw'?-amt(t.amount):0):total,0))}
function categorySpent(cat,m=month){return round(movements(m).filter(t=>t.type==='expense'&&t.category===cat).reduce((s,t)=>s+amt(t.amount),0))}
function budgetFor(cat,m=month){return amt(db.budgets[m]?.[cat]||0)}
function sorted(arr){return [...arr].sort((a,b)=>b.date.localeCompare(a.date)||String(b.created||'').localeCompare(String(a.created||'')))}
function monthShift(delta){let [y,m]=month.split('-').map(Number);let d=new Date(y,m-1+delta,1);month=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;render()}
function toast(msg){const n=$('notice');n.textContent=msg;n.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>n.classList.remove('visible'),3100)}
function emptyState(title,sub,kind='wallet'){return `<div class="empty-state">${tile(kind,'blue')}<strong>${esc(title)}</strong><span>${esc(sub)}</span></div>`}
function selectMonth(){return `<div class="month-controls"><button type="button" class="arrow-month" data-action="month-prev" aria-label="Mes anterior">${ico('back',17)}</button><label class="month-pill">${ico('calendar',18)}<input type="month" id="month-select" value="${month}" aria-label="Mes seleccionado"></label><button type="button" class="arrow-month" data-action="month-next" aria-label="Mes siguiente">${ico('chevron',17)}</button></div>`}
