import {remaining} from './core.js';import {liveRecord} from './record-tools.js';
export const lossUnitLabel=unit=>unit==='raw'?'Each (EA)':'Finished PCS';
export function taskSummary(s,t){
 const received=Number.isFinite(t.receivedPcs)?t.receivedPcs:s.returns.filter(r=>r.taskId===t.id&&liveRecord(r)).reduce((n,r)=>n+r.pcs,0)+(s.adjustments||[]).filter(a=>a.taskId===t.id&&a.status==='confirmed').reduce((n,a)=>n+a.pcs,0);
 const approvedEA=Number.isFinite(t.approvedLossRaw)?t.approvedLossRaw:s.losses.filter(l=>l.taskId===t.id&&l.status==='approved').reduce((n,l)=>n+l.rawQty,0);
 const pendingEA=s.losses.filter(l=>l.taskId===t.id&&l.status==='pending').reduce((n,l)=>n+l.rawQty,0);
 const outstandingPcs=Math.max(0,remaining(s,t)),outstandingEA=outstandingPcs*t.rpUnit;
 return {received,approvedEA,pendingEA,outstandingPcs,outstandingEA,reportableEA:Math.max(0,Math.round(outstandingEA)-pendingEA)};
}
export const openTasks=(s)=>s.tasks.filter(t=>liveRecord(t)&&remaining(s,t)*t.rpUnit>1e-7);
export function validateLossReport(s,payload){
 const t=s.tasks.find(t=>t.id===payload.taskId);if(!t||!liveRecord(t))throw Error('Choose an active delivery task.');
 if(!Number.isSafeInteger(payload.qty)||payload.qty<1||!['raw','finished'].includes(payload.unit))throw Error('Enter a positive whole quantity in Each (EA) or Finished PCS.');
 if(!['damaged','missing'].includes(payload.reason)||!payload.note?.trim())throw Error('Select Damaged or Missing and enter an explanation.');
 const ea=payload.qty*(payload.unit==='raw'?1:t.rpUnit);if(ea>taskSummary(s,t).reportableEA)throw Error('Reported EA exceeds the outstanding balance after pending reports.');return ea;
}
