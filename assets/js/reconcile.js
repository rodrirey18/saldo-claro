'use strict';
/** Revisión del saldo real: NO clasifica una diferencia como gasto ni ingreso. */
function reconciliationForm(){
 const start=db.transactions.length===0;
 const b=balances(thisMonth());
 const grouped=Object.entries(db.categories.expense).length?db.categories.expense.map(c=>({name:c,value:categorySpent(c,thisMonth())})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value).slice(0,4):[];
 modal(start?'Mi dinero para comenzar':'Comprobar mi dinero',`<form id="reconcile-form"><p class="info-line">${start?'Como aún no registraste movimientos, estos serán tus saldos iniciales.':'Cuenta cuánto tienes en este momento. Compararemos con lo que registra Saldo Claro.'}</p>
 <div class="reconcile-table"><div><span>Digital según la app</span><strong>${money(b.digital)}</strong></div><div><span>Efectivo según la app</span><strong>${money(b.cash)}</strong></div></div>
 <div class="form-grid"><div class="form-group"><label for="real-digital">¿Cuánto tienes en Digital?</label><input id="real-digital" name="digital" type="number" inputmode="decimal" min="0" step="0.01" required value="${Math.max(0,b.digital)}"></div><div class="form-group"><label for="real-cash">¿Cuánto tienes en Efectivo?</label><input id="real-cash" name="cash" type="number" inputmode="decimal" min="0" step="0.01" required value="${Math.max(0,b.cash)}"></div></div>
 ${!start?`<div class="reconcile-warning"><strong>Importante:</strong> si los números no coinciden, solo sabremos <strong>cuánto</strong> falta o sobra, no <strong>en qué</strong> se utilizó. También podría haber ingresos o transferencias sin registrar. No se contará como gasto conocido.</div>`:''}
 ${grouped.length?`<div class="form-group"><label>Gastos que sí registraste este mes</label><div class="reconcile-results">${grouped.map(x=>`<span>${esc(x.name)}: ${money(x.value)}</span>`).join('')}</div></div>`:''}
 ${formEnd(start?'Guardar mi dinero inicial':'Comparar y guardar diferencias')}</form>`);
}
function storeReconciliation(form){
 const values=Object.fromEntries(new FormData(form));
 if(['digital','cash'].some(k=>values[k]===''||!Number.isFinite(Number(values[k]))||Number(values[k])<0))return toast('Escribe montos válidos en ambos bolsillos.');
 const actual={digital:round(Number(values.digital)),cash:round(Number(values.cash))};
 if(db.transactions.length===0){db.opening.digital=actual.digital;db.opening.cash=actual.cash;save();closeModal();render();return toast('Dinero inicial guardado.');}
 const b=balances(thisMonth()), adjustments=[];
 for(const wallet of ['digital','cash']){
  const delta=round(actual[wallet]-b[wallet]);if(Math.abs(delta)<0.005)continue;
  adjustments.push({id:uid(),type:'adjustment',amount:round(Math.abs(delta)),account:wallet,direction:delta>0?'increase':'decrease',date:now(),description:'Diferencia por identificar · '+nameOf(wallet),category:'',from:'',to:'',goalId:'',note:'Resultado de contar el dinero real. Causa desconocida. Si encuentras el movimiento original, elimina este ajuste y registra la operación correcta.',created:new Date().toISOString()});
 }
 if(!adjustments.length){closeModal();return toast('¡Todo cuadra! Tus saldos coinciden con tu dinero contado.');}
 db.transactions.push(...adjustments);save();closeModal();render();toast(`Se guardaron ${adjustments.length} diferencia(s) por identificar, sin atribuir gastos inventados.`);
}
function adjustmentDetails(t){modal('Diferencia por identificar',`<div class="reconcile-warning">Este movimiento solo ajusta el dinero calculado para que coincida con el importe que contaste. <strong>No sabemos si fue un gasto, un ingreso olvidado u otra causa.</strong></div><div class="reconcile-table"><div><span>Cuenta</span><strong>${esc(nameOf(t.account))}</strong></div><div><span>Diferencia</span><strong>${t.direction==='increase'?'+':'−'}${money(t.amount)}</strong></div><div><span>Fecha</span><strong>${esc(t.date)}</strong></div></div><p class="info-line">Si descubres a qué correspondía el dinero, borra esta diferencia y registra el movimiento real para evitar contarlo dos veces.</p><button type="button" class="danger-btn btn-full" data-action="delete-transaction" data-id="${esc(t.id)}">Eliminar diferencia y corregir mis registros</button>`);}
