'use strict';
/** Planes de ahorro por meta: los montos son POSIBLES, nunca movimientos reales. */
const COACH_TEMPLATES = [
 {id:'snacks',kind:'hormiga',icon:'cart',title:'Reducir antojos y snacks',description:'Preparar una merienda y evitar compras pequeñas por impulso.'},
 {id:'delivery',kind:'hormiga',icon:'receipt',title:'Pedir menos delivery',description:'Organizar algunas comidas en casa para gastar menos.'},
 {id:'brands',kind:'precio',icon:'coins',title:'Elegir alternativas más económicas',description:'Comparar precio por unidad, calidad y duración antes de comprar.'},
 {id:'compare',kind:'precio',icon:'search',title:'Comparar precios antes de comprar',description:'Revisar varias tiendas y esperar ofertas reales sin comprar por impulso.'},
 {id:'subscriptions',kind:'habito',icon:'screen',title:'Pausar una suscripción poco usada',description:'Revisar los servicios que pagas y conservar solo los que utilizas.'},
 {id:'wait',kind:'habito',icon:'clock',title:'Esperar antes de comprar',description:'Dejar pasar 24 o 48 horas antes de una compra no esencial.'}
];
const COACH_KIND = {hormiga:'Gasto hormiga',precio:'Producto caro',habito:'Cambio de hábito'};
const COACH_TONES = {hormiga:'coral',precio:'blue',habito:'aqua'};
const COACH_ICONS = {hormiga:'cart',precio:'coins',habito:'target'};
function validStrategies(){return Array.isArray(db.strategies)?db.strategies:[];}
function strategiesFor(goalId){return validStrategies().filter(s=>s.goalId===goalId)}
function coachMonthlyValue(s){if(!s.active)return 0;const diff=Math.max(0,amt(s.before)-amt(s.after));return round(diff*(s.frequency==='week'?52/12:1));}
function coachPlanMonthly(goalId){return round(strategiesFor(goalId).reduce((n,s)=>n+coachMonthlyValue(s),0))}
function coachSmallExpenses(limit=coachSmallLimit){return sorted(movements().filter(t=>t.type==='expense'&&amt(t.amount)>0&&amt(t.amount)<=limit));}
function renderCoach(){
 const g=db.goals.find(g=>g.id===coachGoalId);
 if(!g)return `<div class="empty-state">Esta meta ya no está disponible.</div>`;
 const balance=goalAmount(g.id),remaining=Math.max(0,round(g.target-balance)),plans=strategiesFor(g.id),potential=coachPlanMonthly(g.id);
 const months=potential>0?Math.ceil(remaining/potential):null;
 const small=coachSmallExpenses(),total=round(small.reduce((n,t)=>n+amt(t.amount),0));
 return `<div class="coach-page">
 <button type="button" class="coach-back" data-action="coach-return">${ico('back',17)} Volver a mis metas</button>
 <div class="coach-heading"><span class="coach-eyebrow">PLAN DE ACCIÓN</span><h2>¿Qué puedo cambiar para lograr mi meta?</h2><p>Pequeños ajustes pueden acercarte a <strong>${esc(g.name)}</strong> sin afectar tus gastos esenciales.</p></div>
 <section class="coach-summary" aria-label="Ahorro potencial para tu meta">
   <div class="coach-summary-name">${tile(GOAL_ICONS.includes(g.icon)?g.icon:'target','blue',true)}<span>${esc(g.name)}</span></div>
   <div class="coach-summary-grid"><div><small>Todavía necesitas</small><strong>${maybeMoney(remaining)}</strong></div><div><small>Posible ahorro al mes</small><strong>${maybeMoney(potential)}</strong></div></div>
   <p>${potential>0 ? remaining===0 ? '¡Tu meta ya está cubierta con los aportes registrados!' : `Si cumples este plan y apartas esa cantidad, podrías cubrir lo que falta en aproximadamente <strong>${months} ${months===1?'mes':'meses'}</strong>.` : 'Activa algunas ideas, escribe tus gastos habituales y compara cuánto gastarías después.'}</p>
   <div class="coach-disclaimer">${ico('info',16)} Es una simulación. No aumenta el saldo ni el ahorro real.</div>
 </section>
 <div class="section-h"><h2>Mi lista de cambios</h2><button type="button" class="text-link" data-action="coach-add">${ico('plus',15)} Añadir</button></div>
 <p class="coach-description">Activa lo que vas a intentar. Cada estimación usa tus propios importes.</p>
 <div class="coach-strategies">${plans.map(s=>`<article class="coach-strategy ${s.active?'':'is-paused'}">
  <div class="coach-strategy-header">${tile(COACH_ICONS[s.kind]||'target',COACH_TONES[s.kind]||'aqua',true)}<div class="coach-strategy-info"><strong>${esc(s.title)}</strong><span>${esc(COACH_KIND[s.kind]||'Cambio personal')}</span></div><button class="coach-edit" data-action="coach-edit" data-id="${esc(s.id)}" type="button" aria-label="Editar ${esc(s.title)}">${ico('edit',17)}</button></div>
  ${s.description?`<p class="coach-strategy-desc">${esc(s.description)}</p>`:''}
  <div class="coach-strategy-foot"><div><small>Podrías ahorrar</small><strong>${maybeMoney(coachMonthlyValue(s))}<span>/mes</span></strong></div><button type="button" class="coach-switch ${s.active?'on':''}" data-action="coach-toggle" data-id="${esc(s.id)}" aria-pressed="${s.active}">${s.active?'En mi plan':'Pausado'} ${ico(s.active?'check':'plus',13)}</button></div>
 </article>`).join('')||`<div class="empty-state">${tile('target','blue')}<strong>Aún no tienes cambios en tu plan</strong>Elige una idea o agrega tus propios hábitos.</div>`}</div>
 <button type="button" class="create-goal" data-action="coach-add">${ico('plus',18)} Añadir mi propia idea</button>
 <div class="section-h"><h2>Ideas para gastar menos</h2></div><div class="coach-templates">${COACH_TEMPLATES.map(t=>`<button type="button" class="coach-template" data-action="coach-template" data-template="${t.id}">${tile(t.icon,COACH_TONES[t.kind],true)}<span><strong>${esc(t.title)}</strong><small>${esc(t.description)}</small></span>${ico('plus',18)}</button>`).join('')}</div>
 <div class="section-h"><h2>Revisa tus gastos pequeños</h2></div>
 <div class="panel"><div class="coach-small-top"><div><span class="coach-small-label">Movimientos de ${esc(caps(monthLabel(month)))}</span><strong>${maybeMoney(total)}</strong></div><div class="coach-limit-pills">${[10,20,30].map(v=>`<button type="button" class="${coachSmallLimit===v?'selected':''}" data-action="coach-limit" data-limit="${v}" aria-pressed="${coachSmallLimit===v}">≤ ${v}</button>`).join('')}</div></div>
 <p class="coach-description">Pagos de hasta ${money(coachSmallLimit)} este mes. No todos son innecesarios: revisa cuáles realmente puedes reducir.</p>
 ${small.length?`<div class="coach-small-list">${small.slice(0,5).map(t=>`<div class="coach-small-item"><span>${esc(t.description||t.category||'Gasto')}<small>${esc(humanDate(t.date))}</small></span><strong>${maybeMoney(t.amount)}</strong></div>`).join('')}</div>${small.length>5?`<p class="field-hint">Y ${small.length-5} registros adicionales, incluidos en el total.</p>`:''}`:`<p class="coach-no-small">Todavía no hay gastos pequeños registrados para este mes y límite.</p>`}</div>
 <div class="coach-bottom"><strong>¿Conseguiste gastar menos?</strong><span>Registra únicamente el dinero que apartaste de verdad; el ahorro potencial no se deposita solo.</span><button type="button" class="primary-btn btn-full" data-action="coach-deposit">${ico('pig',18)} Registrar ahorro real para esta meta</button></div>
 </div>`;
}
function coachForm(x={},templateId=''){
 const template=COACH_TEMPLATES.find(t=>t.id===templateId)||{};
 const {id:unusedTemplateId,...templateFields}=template;
 const s={id:'',goalId:coachGoalId,title:'',description:'',kind:'hormiga',before:'',after:'',frequency:'week',active:true,...templateFields,...x};
 modal(s.id?'Editar cambio de hábito':'Nuevo cambio para ahorrar',`<form id="coach-form">
  <input type="hidden" name="id" value="${esc(s.id)}"><input type="hidden" name="goalId" value="${esc(s.goalId)}">
  <div class="form-group"><label for="coach-title">¿Qué gasto o hábito cambiarás?</label><input id="coach-title" name="title" maxlength="85" required placeholder="Ejemplo: Menos gaseosas" value="${esc(s.title)}"></div>
  <div class="form-group"><label for="coach-kind">Tipo</label><select name="kind" id="coach-kind">${Object.entries(COACH_KIND).map(([key,label])=>`<option value="${key}" ${s.kind===key?'selected':''}>${label}</option>`).join('')}</select></div>
  <div class="form-group"><label for="coach-description">Cómo lo harás (opcional)</label><textarea id="coach-description" name="description" maxlength="200" placeholder="Qué dejarás de comprar o con qué lo reemplazarás">${esc(s.description)}</textarea></div>
  <div class="form-grid"><div class="form-group"><label for="coach-before">Gasto habitual</label><input type="number" id="coach-before" name="before" min="0.01" step="0.01" inputmode="decimal" required placeholder="40.00" value="${s.before===''?'':amt(s.before)}"></div><div class="form-group"><label for="coach-after">Nuevo gasto</label><input type="number" id="coach-after" name="after" min="0" step="0.01" inputmode="decimal" required placeholder="20.00" value="${s.after===''?'':amt(s.after)}"></div></div>
  <div class="form-group"><label for="coach-frequency">¿Cada cuánto es ese gasto?</label><select name="frequency" id="coach-frequency"><option value="week" ${s.frequency==='week'?'selected':''}>Por semana</option><option value="month" ${s.frequency==='month'?'selected':''}>Por mes</option></select></div>
  <label class="coach-form-active"><input type="checkbox" name="active" value="yes" ${s.active?'checked':''}> Incluir este cambio en mi plan</label>
  <p class="info-line">El ahorro mensual será la diferencia entre ambos gastos (si es semanal, se multiplica por 52/12). No se registra como ahorro real.</p>
  ${formEnd(s.id?'Guardar cambio':'Añadir al plan')}
  ${s.id?`<button class="danger-btn btn-full" type="button" data-action="coach-delete" data-id="${esc(s.id)}">${ico('trash',16)} Eliminar este cambio</button>`:''}
 </form>`);
}
function storeCoachStrategy(form){
 const d=Object.fromEntries(new FormData(form));
 const before=round(Number(d.before)),after=round(Number(d.after));
 if(!db.goals.some(g=>g.id===d.goalId))return toast('Selecciona una meta válida.');
 if(!d.title?.trim())return toast('Escribe qué hábito deseas cambiar.');
 if(!Number.isFinite(before)||!Number.isFinite(after)||before<=0||after<0||after>=before)return toast('El nuevo gasto debe ser menor que el habitual.');
 if(!['week','month'].includes(d.frequency)||!COACH_KIND[d.kind])return toast('Revisa el tipo y la frecuencia.');
 const s={id:d.id||uid(),goalId:d.goalId,title:d.title.trim(),description:(d.description||'').trim(),kind:d.kind,before,after,frequency:d.frequency,active:d.active==='yes'};
 db.strategies=validStrategies();
 if(d.id){if(!db.strategies.some(old=>old.id===d.id&&old.goalId===d.goalId))return toast('No se encontró el cambio.');db.strategies=db.strategies.map(old=>old.id===d.id?s:old)}else db.strategies.push(s);
 save();closeModal();render();toast('Plan de ahorro actualizado');
}
function toggleCoachStrategy(id){const s=validStrategies().find(s=>s.id===id&&s.goalId===coachGoalId);if(!s)return;s.active=!s.active;save();render();toast(s.active?'Cambio añadido al plan':'Cambio pausado')}
function deleteCoachStrategy(id){const s=validStrategies().find(s=>s.id===id&&s.goalId===coachGoalId);if(!s)return;if(!confirm('¿Quitar este cambio de tu plan?'))return;db.strategies=db.strategies.filter(x=>x.id!==id);save();closeModal();render();toast('Cambio eliminado del plan')}
