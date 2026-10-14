'use strict';
/** Sueldos, ingresos y cargos mensuales. Los importes futuros son pronósticos;
 * el registro automático (optativo) se agrega solo cuando se alcanza el día,
 * sin conexión al banco: siempre debe revisarse contra el cobro real. */
function recurringDueDate(r,m){
 const [y,n]=m.split('-').map(Number);
 const last=new Date(y,n,0).getDate();
 const d=Math.min(Math.max(1,Number(r.day)||1),last);
 return `${m}-${String(d).padStart(2,'0')}`;
}
function activeRecurring(r,m){return !r.startMonth || m>=r.startMonth;}
function recurringProjection(m=month){
 const entries=db.recurring.filter(r=>activeRecurring(r,m));
 const income=round(entries.filter(r=>r.type==='income').reduce((a,r)=>a+amt(r.amount),0));
 const expense=round(entries.filter(r=>r.type==='expense').reduce((a,r)=>a+amt(r.amount),0));
 return {income,expense,remainder:round(income-expense),entries};
}
function recordedRecurring(r,m){return db.transactions.some(t=>t.recurringId===r.id&&t.recurringMonth===m);}
function dismissedRecurring(r,m){return (db.skippedRecurring||[]).includes(`${r.id}|${m}`);}
function applyFixedSchedules(){
 const today=now(),end=thisMonth();
 let added=0;
 for(const r of db.recurring){
  if(r.auto!==true)continue;
  let start=r.startMonth||end;
  // No se rellenan años históricos: máximo 12 meses, solo posteriores a activar la regla.
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(start))start=end;
  if(start>end)continue;
  let [y,m]=start.split('-').map(Number);
  let count=0;
  while(`${y}-${String(m).padStart(2,'0')}`<=end&&count++<12){
    const mo=`${y}-${String(m).padStart(2,'0')}`;
    const date=recurringDueDate(r,mo);
    if(date<=today&&!recordedRecurring(r,mo)&&!dismissedRecurring(r,mo)){
      const value=round(amt(r.amount));
      if(value>0&&['income','expense'].includes(r.type)){
        db.transactions.push({id:uid(),type:r.type,date,amount:value,description:r.title,
        category:r.category|| (r.type==='income'?'Sueldo':'Servicios'),
        from:r.type==='expense'?r.account:'',to:r.type==='income'?r.account:'',
        goalId:'',note:'Registro automático según tu plan. Verifica que el cobro o pago se realizó y ajusta el importe si cambió.',
        recurringId:r.id,recurringMonth:mo,automatic:true,created:new Date().toISOString()});
        added++;
      }
    }
    m++;if(m===13){m=1;y++;}
  }
 }
 if(added)save();
 return added;
}
