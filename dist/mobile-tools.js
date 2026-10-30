const normalize=value=>String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function searchProducts(products,query,limit=10){
 const words=normalize(query).split(/\s+/).filter(Boolean);if(!words.length)return {items:[],total:0};
 const rows=products.filter(p=>p.active).map(p=>{const name=normalize(p.name),code=normalize(p.code),barcode=String(p.barcode||'');const text=`${name} ${code} ${barcode}`;return {p,name,code,text};}).filter(r=>words.every(w=>r.text.includes(w)));
 rows.sort((a,b)=>Number(b.name.startsWith(words[0]))-Number(a.name.startsWith(words[0]))||a.name.localeCompare(b.name)||a.code.localeCompare(b.code));
 return {items:rows.slice(0,limit).map(r=>r.p),total:rows.length};
}
// Serialize snapshots so a slow earlier write cannot replace the newest draft.
export function draftWriter(save){let tail=Promise.resolve();return {write(value){const snapshot=value==null?null:JSON.parse(JSON.stringify(value));tail=tail.catch(()=>{}).then(()=>save(snapshot));return tail;},flush(){return tail;}};}
