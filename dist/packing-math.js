export function packingTotals(p,supplierCtn=p.referenceCtn??1){
 for(const [name,value] of [['Supplier Size',p.supplierSize],['RP Unit',p.rpUnit],['PACKSIZE (Ninso)',p.ninsoSize]])if(!Number.isSafeInteger(value)||value<1)throw Error(`${name} must be a positive whole number.`);
 if(!Number.isSafeInteger(supplierCtn)||supplierCtn<1)throw Error('Supplier CTN must be a positive whole number.');
 const totalSupplierPcs=supplierCtn*p.supplierSize;if(!Number.isSafeInteger(totalSupplierPcs))throw Error('Supplier total is too large.');
 const finishedPcs=totalSupplierPcs/p.rpUnit,totalNinsoCtn=totalSupplierPcs/(p.rpUnit*p.ninsoSize);
 return {referenceCtn:supplierCtn,totalSupplierPcs,finishedPcs,totalNinsoCtn};
}
export function packingBalance(finishedPcs,p){
 const raw=Math.max(0,finishedPcs)*p.rpUnit,wholePcs=Math.floor(raw/p.rpUnit+1e-9),ctn=Math.floor(wholePcs/p.ninsoSize),loose=wholePcs%p.ninsoSize;
 return {ctn,loose,rawRemainder:Math.max(0,raw-wholePcs*p.rpUnit)};
}
