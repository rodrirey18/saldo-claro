'use strict';
/** Enrutamiento y eventos de la app. */
function handleAction(btn){const a=btn.dataset.action,id=btn.dataset.id;
 if(a==='navigate')return navigate(btn.dataset.page);
 if(a==='help-center')return navigate('help');
 if(a==='help-tour'){navigate('home');return startTour()}
 if(a==='help-topic'){helpActive=btn.dataset.id;render();return}
 if(a==='help-go'){if(btn.dataset.tab==='plan'){page='goals';goalTab='plan';render();window.scrollTo(0,0);return;}return navigate(btn.dataset.page)}
 if(a==='reconcile')return reconciliationForm();
 if(a==='confirm-income'){const r=db.recurring.find(x=>x.id===id);if(!r||recordedRecurring(r,month))return;return transactionForm({type:'income',amount:r.amount,description:r.title,category:r.category||'Sueldo',date:month===thisMonth()?now():recurringDueDate(r,month),to:r.account,from:r.account,recurringId:r.id,recurringMonth:month});}
 if(a==='open-plan'){page='goals';goalTab='plan';render();return window.scrollTo({top:0,behavior:'instant'})}
 if(a==='goal-tab'){goalTab=btn.dataset.tab;render();return}
 if(a==='month-prev')return monthShift(-1);if(a==='month-next')return monthShift(1);
 if(a==='toggle-balance'){showBalance=!showBalance;return render()}
 if(a==='filter'){filter=btn.dataset.filter;return render()}
 if(a==='search'){searchOpen=!searchOpen;if(!searchOpen)searchText='';render();if(searchOpen)$('tx-search')?.focus();return}
 if(a==='add-transaction')return transactionForm({type:btn.dataset.type||'expense'});
 if(a==='edit-transaction'){const t=db.transactions.find(x=>x.id===id);if(t?.type==='adjustment')return adjustmentDetails(t);if(t)return transactionForm(t)}
 if(a==='delete-transaction'){const t=db.transactions.find(x=>x.id===id);if(t&&confirm(`¿Eliminar el movimiento «${t.description}» por ${money(t.amount)}?`)){if(t.automatic&&t.recurringId){db.skippedRecurring??=[];db.skippedRecurring.push(`${t.recurringId}|${t.recurringMonth}`)}db.transactions=db.transactions.filter(x=>x.id!==id);save();closeModal();render();toast('Movimiento eliminado')}return}
 if(a==='add-goal')return goalForm();if(a==='goal-options'){const g=db.goals.find(x=>x.id===id);if(g)return goalForm(g)}
 if(a==='goal-plan'){if(!db.goals.some(g=>g.id===id))return;coachGoalId=id;goalTab='coach';render();window.scrollTo(0,0);return}
 if(a==='coach-return'){goalTab='goals';render();window.scrollTo(0,0);return}
 if(a==='coach-add')return coachForm({goalId:coachGoalId});
 if(a==='coach-template')return coachForm({goalId:coachGoalId},btn.dataset.template);
 if(a==='coach-edit')return coachForm(db.strategies.find(s=>s.id===id)||{goalId:coachGoalId});
 if(a==='coach-toggle')return toggleCoachStrategy(id);
 if(a==='coach-delete')return deleteCoachStrategy(id);
 if(a==='coach-limit'){coachSmallLimit=Number(btn.dataset.limit)||20;render();return}
 if(a==='coach-deposit'){return transactionForm({type:'save',goalId:coachGoalId,description:'Ahorro real de mis nuevos hábitos'})}
 if(a==='goal-deposit')return transactionForm({type:'save',goalId:id,description:'Aporte a mi meta'});
 if(a==='goal-withdraw')return transactionForm({type:'withdraw',goalId:id,description:'Retiro de mi meta'});
 if(a==='delete-goal'){if(db.transactions.some(t=>t.goalId===id))return toast('Esta meta tiene aportes asociados. Reasígnalos antes de eliminarla.');if(confirm('¿Eliminar esta meta?')){db.goals=db.goals.filter(g=>g.id!==id);db.strategies=(db.strategies||[]).filter(st=>st.goalId!==id);save();closeModal();render();toast('Meta eliminada')}return}
 if(a==='budget')return budgetForm();
 if(a==='setup-salary')return salaryForm();if(a==='add-recurring')return recurringForm({type:btn.dataset.type||'expense'});if(a==='edit-recurring'){const r=db.recurring.find(x=>x.id===id);if(r)return recurringForm(r)}
 if(a==='delete-recurring'){if(confirm('¿Eliminar este compromiso? No se borrarán los movimientos que ya registraste.')){db.recurring=db.recurring.filter(r=>r.id!==id);save();closeModal();render();toast('Compromiso eliminado')}return}
 if(a==='record-recurring'){const r=db.recurring.find(x=>x.id===id);if(!r||paid(r))return;if(month>thisMonth())return toast('Todavía no puedes registrar ingresos o gastos futuros.');const [y,m]=month.split('-').map(Number);const date=recurringDueDate(r,month);return transactionForm({type:r.type,amount:r.amount,description:r.title,category:r.category,date:date>now()?now():date,from:r.account,to:r.account,recurringId:r.id,recurringMonth:month})}
 if(a==='close-modal')return closeModal();if(a==='demo')return sample();if(a==='export')return exportBackup();if(a==='import')return $('import-file').click();
 if(a==='clear'){if(confirm('¿BORRAR todos tus datos y configuración de contraseña en este navegador? Esta acción no se puede deshacer.')){security.eraseAll().then(()=>{db=blank();month=thisMonth();page='home';render();openWelcome()}).catch(()=>toast('No se pudo borrar los datos.'))}return}
  if(a==='tour-replay')return startTour();
}
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-action]');if(b)return handleAction(b);if(ev.target===$('modal-overlay'))closeModal()});
document.addEventListener('change',ev=>{const id=ev.target.id;if(id==='month-select'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(ev.target.value)){month=ev.target.value;render()}if(id==='tx-type')adjustTxForm();if(id==='rec-type')adjustRecForm();if(id==='budget-category')$('budget-amount').value=budgetFor(ev.target.value);if(id==='import-file')importBackup(ev.target.files?.[0])});
document.addEventListener('input',ev=>{if(ev.target.id==='help-search'){helpQuery=ev.target.value;const target=$('help-results');if(target)target.innerHTML=helpResultsMarkup();return}if(ev.target.id==='tx-search'){const cursor=ev.target.selectionStart;searchText=ev.target.value;render();const input=$('tx-search');input?.focus();input?.setSelectionRange(cursor,cursor)}});
document.addEventListener('submit',ev=>{const form=ev.target;const formId=form.getAttribute('id');if(!['transaction-form','goal-form','budget-form','recurring-form','profile-form','category-form','coach-form','salary-form','reconcile-form'].includes(formId))return;ev.preventDefault();({ 'transaction-form':storeTransaction,'goal-form':storeGoal,'budget-form':storeBudget,'recurring-form':storeRecurring,'profile-form':storeProfile,'category-form':storeCategory,'coach-form':storeCoachStrategy,'salary-form':storeSalary,'reconcile-form':storeReconciliation})[formId](form)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('modal-overlay').hidden)closeModal()});


// Personalizar el mensaje del navegador para la fecha futura (también en Safari).
document.addEventListener('invalid',event=>{
 if(event.target.id!=='tx-date')return;
 const input=event.target;
 if(input.value && input.value>now()){
   const today=new Date(now()+'T12:00:00').toLocaleDateString('es-PE',{day:'numeric',month:'long',year:'numeric'});
   input.setCustomValidity(`La fecha debe ser igual o anterior al ${today}.`);
 }
},true);
document.addEventListener('input',event=>{if(event.target.id==='tx-date')event.target.setCustomValidity('');});
document.addEventListener('change',event=>{if(event.target.id==='tx-date')event.target.setCustomValidity('');});

// Si la pestaña vuelve a abrirse después de un vencimiento, revisar reglas fijas.
document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='visible'&&$('welcome-screen').hidden&&$('lock-screen').hidden){
  const added=applyFixedSchedules();if(added){render();toast(`${added} movimiento(s) fijo(s) anotado(s). Revisa los importes.`)}
 }
});
