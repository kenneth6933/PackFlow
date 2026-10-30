export const liveRecord=r=>r.status!=='voided';
export function poolPlan(pool,state){
 const queue=pool.queue.filter(id=>{const t=state.tasks.find(t=>t.id===id);return t&&liveRecord(t);});
 const available=id=>{const t=state.tasks.find(t=>t.id===id),received=state.returns.filter(r=>r.taskId===id&&liveRecord(r)).reduce((n,r)=>n+r.pcs,0)+state.adjustments.filter(a=>a.taskId===id&&a.status==='confirmed').reduce((n,a)=>n+a.pcs,0),lost=state.losses.filter(l=>l.taskId===id&&l.status==='approved').reduce((n,l)=>n+l.rawQty,0);return t.ctn*t.supplierSize-received*t.rpUnit-lost>=t.rpUnit;};
 let head=queue.findIndex(available);if(head<0)head=queue.length;
 return {queue,head};
}
