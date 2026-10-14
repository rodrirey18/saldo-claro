'use strict';
/** Creación, edición y eliminación de movimientos, metas y planes. */
function storeTransaction(f){const d=Object.fromEntries(new FormData(f)),amount=round(Number(d.amount)),type=d.type;
 if(!Number.isFinite(amount)||amount<=0)return toast('Introduce un importe mayor que cero.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||d.date>now()||Number.isNaN(new Date(d.date+'T12:00:00').getTime()))return toast('Selecciona una fecha real que no sea futura.');
 if(!d.description?.trim())return toast('Escribe una descripción.');
 if(type==='transfer'&&d.account===d.destination)return toast('Elige dos bolsillos diferentes para la transferencia.');
 if(type==='withdraw'&&d.goalId){const prev=db.transactions.find(x=>x.id===d.id);const available=goalAmount(d.goalId)+(prev?.goalId===d.goalId&&prev.type==='withdraw'?amt(prev.amount):0);if(amount>available+.001)return toast('La meta no tiene esa cantidad disponible.');}
 const before=db.transactions.find(x=>x.id===d.id);
 const t={id:d.id||uid(),type,date:d.date,amount,description:d.description.trim(),category:['expense','income'].includes(type)?d.category:'',from:['expense','save','transfer'].includes(type)?d.account:'',to:['income','withdraw'].includes(type)?d.account:type==='transfer'?d.destination:'',goalId:['save','withdraw'].includes(type)?d.goalId:'',note:d.note?.trim()||'',recurringId:d.recurringId||'',recurringMonth:d.recurringMonth||'',automatic:before?.automatic||false,created:before?.created||new Date().toISOString()};
 const original=db.transactions;db.transactions=d.id?original.map(x=>x.id===d.id?t:x):[...original,t];
 if(db.goals.some(g=>goalAmount(g.id)<-0.001)){db.transactions=original;return toast('El cambio dejaría una meta con ahorro negativo. Revisa sus aportes.')}
 save();closeModal();render();toast(d.id?'Movimiento actualizado':'Movimiento registrado');
}
function storeGoal(f){const d=Object.fromEntries(new FormData(f)),target=round(Number(d.target));if(!d.name.trim()||!Number.isFinite(target)||target<=0)return toast('Revisa el nombre y el objetivo de ahorro.');const g={id:d.id||uid(),name:d.name.trim(),target,note:d.note?.trim()||'',icon:GOAL_ICONS.includes(d.icon)?d.icon:'target',deadline:d.deadline||''};if(d.id)db.goals=db.goals.map(x=>x.id===d.id?g:x);else db.goals.push(g);save();closeModal();render();toast(d.id?'Meta actualizada':'Meta creada')}
function storeBudget(f){const d=Object.fromEntries(new FormData(f)),v=round(Number(d.amount));if(!Number.isFinite(v)||v<0)return toast('El presupuesto no puede ser negativo.');db.budgets[month]??={};db.budgets[month][d.category]=v;save();closeModal();render();toast('Presupuesto guardado')}
function storeRecurring(f){const d=Object.fromEntries(new FormData(f)),v=round(Number(d.amount));if(!d.title?.trim()||!Number.isFinite(v)||v<=0)return toast('Revisa el concepto y el importe.');const existing=db.recurring.find(x=>x.id===d.id);const r={id:d.id||uid(),title:d.title.trim(),type:d.type,amount:v,day:Number(d.day),category:d.category,account:d.account,auto:d.auto==='on',startMonth:existing?.startMonth||thisMonth()};if(d.id)db.recurring=db.recurring.map(x=>x.id===d.id?r:x);else db.recurring.push(r);save();applyFixedSchedules();closeModal();render();toast('Ingreso o gasto fijo guardado')}

function storeSalary(f){
 const d=Object.fromEntries(new FormData(f));
 const total=round(Number(d.amount));
 if(!Number.isFinite(total)||total<=0)return toast('Escribe un sueldo válido.');
 if(d.schedule!=='one'&&d.schedule!=='two')return toast('Selecciona cómo recibes tu sueldo.');
 const label=(d.title||'Sueldo').trim().slice(0,80)||'Sueldo';
 const salaryRules=d.schedule==='two'?[
   {title:label+' · Quincena',amount:round(total/2),day:15},
   {title:label+' · Fin de mes',amount:round(total-round(total/2)),day:31}
 ]:[{title:label,amount:total,day:31}];
 if(salaryRules.some(r=>r.amount<=0))return toast('Para dos pagos, el sueldo debe ser de al menos 0.02.');
 for(const x of salaryRules)db.recurring.push({id:uid(),...x,type:'income',category:'Sueldo',account:d.account||'digital',auto:d.auto==='on',startMonth:thisMonth()});
 save();applyFixedSchedules();closeModal();render();toast('Sueldo fijo configurado: '+salaryRules.length+' pago(s) por mes');
}
function storeProfile(f){const d=Object.fromEntries(new FormData(f));for(const field of ['digital','cash','savings'])if(!Number.isFinite(Number(d[field]))||Number(d[field])<0)return toast('Los saldos iniciales deben ser valores válidos.');if(db.profile.currency!==d.currency&&db.transactions.length&&!confirm('Cambiar moneda NO convertirá los importes de tus movimientos. ¿Continuar?'))return;db.profile.name=d.name?.trim()||'';db.profile.currency=d.currency;for(const x of ['digital','cash','savings'])db.opening[x]=round(Number(d[x]));save();render();toast('Mi perfil se guardó correctamente')}
function storeCategory(f){const d=Object.fromEntries(new FormData(f)),s=(d.name||'').trim();if(!s)return;const existing=db.categories[d.type];if(existing.some(c=>c.toLowerCase()===s.toLowerCase()))return toast('Esta categoría ya existe.');existing.push(s);save();render();toast('Categoría añadida')}
function sample(){if((db.transactions.length||db.goals.length||db.recurring.length||db.profile.name)&&!confirm('Esto reemplazará tus datos actuales por datos FICTICIOS. Exporta una copia antes si deseas conservarlos. ¿Continuar?'))return;
 const b=blank();b.demo=true;b.profile.name=db.profile.name||'Alex';b.opening={digital:750,cash:160,savings:200};const mo=thisMonth(),previous=(()=>{let[y,m]=mo.split('-').map(Number),d=new Date(y,m-2,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`})();
 const g1={id:uid(),name:'Laptop',target:3000,note:'Para mis estudios y trabajo',icon:'laptop',deadline:''};const g2={id:uid(),name:'Viaje a Cusco',target:2000,note:'Aventura y descanso',icon:'plane',deadline:''};b.goals=[g1,g2];b.strategies=[
 {id:uid(),goalId:g1.id,title:'Reducir snacks y antojos',kind:'hormiga',description:'Llevar una merienda preparada en vez de comprarla varios días.',before:35,after:15,frequency:'week',active:true},
 {id:uid(),goalId:g1.id,title:'Comparar marcas y precios',kind:'precio',description:'Buscar una alternativa de calidad similar que cueste menos.',before:100,after:75,frequency:'month',active:true},
 {id:uid(),goalId:g2.id,title:'Reducir pedidos de comida',kind:'habito',description:'Cocinar algunos días antes de pedir delivery.',before:60,after:30,frequency:'week',active:true}
];
 b.recurring=[{id:uid(),title:'Quincena',amount:1250,day:15,type:'income',category:'Sueldo',account:'digital'},{id:uid(),title:'HBO',amount:34.90,day:14,type:'expense',category:'Suscripciones',account:'digital'},{id:uid(),title:'YouTube Music',amount:20.9,day:12,type:'expense',category:'Suscripciones',account:'digital'},{id:uid(),title:'Aporte al hogar',amount:200,day:8,type:'expense',category:'Casa',account:'digital'}];
 const add=(day,type,amount,description,category='',from='',to='',goalId='',recId='',rm='')=>b.transactions.push({id:uid(),date:day,type,amount,description,category,from,to,goalId,note:'',recurringId:recId,recurringMonth:rm,created:new Date().toISOString()});
 // Una meta se fondea con movimientos históricos, no con un porcentaje artificial.
 add(previous+'-05','income',4800,'Ingreso anterior','Sueldo','','digital');add(previous+'-06','save',2400,'Ahorro para laptop','','digital','',g1.id);add(previous+'-07','save',1200,'Ahorro para viaje','','digital','',g2.id);add(previous+'-09','expense',96.30,'Supermercado','Alimentación','digital');add(previous+'-10','transfer',150,'Retiro de efectivo','','digital','cash');
 // Fechas de demostración no deben quedar en el futuro.
 for(const [day,type,value,title,cat,from,to,gid,rid] of [
 [1,'income',1250,'Quincena','Sueldo','','digital','',b.recurring[0].id],[2,'expense',34.90,'HBO','Suscripciones','digital','','',b.recurring[1].id],[3,'expense',20.90,'YouTube Music','Suscripciones','digital','','',b.recurring[2].id],[4,'expense',60,'Baile','Entretenimiento','digital'],[5,'expense',200,'Aporte casa','Casa','digital','','',b.recurring[3].id],[6,'expense',45,'Restaurante','Alimentación','cash'],[7,'transfer',100,'Digital a efectivo','','digital','cash']]){
 const d=`${mo}-${String(day).padStart(2,'0')}`;if(d<=now())add(d,type,value,title,cat,from,to,gid,rid,mo)
 }
 b.budgets[mo]={Casa:250,Alimentación:180,Suscripciones:90,Transporte:80,Entretenimiento:180,Educación:150};db=b;save();month=mo;filter='all';searchText='';goalTab='goals';page='home';render();toast('Datos ficticios cargados para la demostración')
}
function exportBackup(){const data=JSON.stringify(db,null,2);const blob=new Blob([data],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`saldo-claro-respaldo-${now()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Respaldo descargado. Guárdalo de forma privada.')}
function importBackup(file){if(!file)return;if(file.size>5_000_000)return toast('El archivo es demasiado grande.');const reader=new FileReader();reader.onload=()=>{try{const d=JSON.parse(reader.result);if(d.schema!==2||!Array.isArray(d.transactions)||!Array.isArray(d.goals)||!Array.isArray(d.recurring)||typeof d.profile!=='object'||typeof d.opening!=='object'||!d.budgets||!d.categories||!Array.isArray(d.categories.expense)||!Array.isArray(d.categories.income))throw new Error('Formato');if(!confirm('Se reemplazarán todos los datos de este navegador por el respaldo seleccionado. ¿Continuar?'))return;db={...blank(),...d,profile:{...blank().profile,...d.profile},opening:{...blank().opening,...d.opening}};save();applyFixedSchedules();page='home';render();toast('Respaldo importado')}catch{toast('Archivo incompatible o inválido.')}finally{$('import-file').value=''}};reader.readAsText(file)}
