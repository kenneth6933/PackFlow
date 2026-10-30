import {objectsFromCSV,mapPerson} from './imports.js';
const normalized=s=>String(s).replace(/^\ufeff/,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const idOf=o=>String(Object.entries(o).find(([k])=>normalized(k)==='id')?.[1]||'').trim();
export function preparePeopleImport(text,users,actor){
 const objects=objectsFromCSV(text),counts=new Map();
 for(const o of objects){const key=idOf(o).toLowerCase();counts.set(key,(counts.get(key)||0)+1);}
 return objects.map((o,index)=>{
  const row={row:index+2,id:idOf(o),name:'',status:'ready',profileStatus:'pending',loginStatus:'pending',message:'Ready to import'};
  try{
   if(actor?.role!=='admin'||actor.active===false)throw Error('Active administrator required.');
   if(counts.get(row.id.toLowerCase())>1)throw Error('Duplicate ID in CSV (case insensitive).');
   const matches=users.filter(u=>u.id.toLowerCase()===row.id.toLowerCase());
   if(matches.length>1)throw Error('Conflicting personnel IDs. Resolve the saved profiles first.');
   const previous=matches[0];const parsed=mapPerson(o,previous),p=parsed.person;
   if(previous)p.id=previous.id;
   row.id=p.id;row.name=p.name;
   if(previous&&previous.role!==p.role)throw Error('Existing role cannot be changed by import.');
   if(p.id===actor.id&&!p.active)throw Error('Cannot disable your own account.');
   if(p.active&&!p.authUid&&parsed.password.length<6)throw Error('An active employee without a linked login needs a Password of at least 6 characters.');
   delete p.password;
   return {...row,person:p,...(p.active&&!p.authUid?{password:parsed.password}:{})};
  }catch(error){return {...row,status:'invalid',message:error.message};}
 });
}
export const peopleImportReport=rows=>rows.map(({row,id,name,status,profileStatus,loginStatus,message})=>({row,id,name,status,profileStatus,loginStatus,message}));
export function clearPeopleImport(rows){for(const row of rows){delete row.password;delete row.pendingUid;}}
function failureMessage(error,phase){
 if(phase==='profile')return 'Personnel data could not be saved. Check your connection and administrator access, then retry.';
 return ({
  'account/link-missing':'Personnel saved; the existing login link needs repair. Use Manage → Create / link login with its current password.',
  'account/link-pending':'Personnel saved; Firebase login exists, but linking failed. Retry in this dialog with the same CSV loaded.',
  'auth/invalid-credential':'Personnel saved; an existing Firebase login needs its current password to finish linking. Its password was not changed.',
  'auth/too-many-requests':'Personnel saved; Firebase rate limit reached. Wait, then retry.',
  'auth/quota-exceeded':'Personnel saved; Firebase creation quota reached. Try again later.',
  'auth/network-request-failed':'Personnel saved; network error during login setup. Check connection and retry.',
  'auth/weak-password':'Personnel saved; the initial password does not meet Firebase policy.',
  'auth/password-does-not-meet-requirements':'Personnel saved; the initial password does not meet Firebase policy.',
  'auth/operation-not-allowed':'Personnel saved; enable Email/Password in Firebase Authentication.'
 })[error?.code]||'Personnel saved; login setup did not finish. Check Firebase settings and retry.';
}
export async function runPeopleImport(rows,api,onProgress=()=>{}){
 const progress=()=>onProgress(peopleImportReport(rows));progress();
 for(const row of rows){
  if(!['ready','failed'].includes(row.status))continue;
  row.status='processing';let phase='profile';
  try{
   if(!row.profileSaved){row.message='Saving personnel data…';progress();await api.save(row.person);row.profileSaved=true;row.profileStatus='saved';}
   if(!row.person.active){row.status='inactive';row.loginStatus='inactive';row.message='Personnel saved as inactive; account creation skipped.';delete row.password;progress();continue;}
   phase='login';row.message='Personnel saved; setting up login…';progress();
   const result=await api.login(row.id,row.password||'',{preserveLinked:true,...(row.pendingUid?{resumeUid:row.pendingUid}:{})});
   if(result.skipped&&!result.verifiedLinked)throw Error('Existing Auth account is not linked.');
   row.status='complete';row.loginStatus=result.skipped?'unchanged':result.created?'created':'linked';
   row.message=result.skipped?'Personnel updated; linked login retained and password unchanged.':result.created?'Personnel saved and login created.':'Personnel saved and existing login linked; password unchanged.';
   delete row.password;delete row.pendingUid;
  }catch(error){row.status='failed';row.loginStatus=phase==='login'?'failed':'pending';row.message=failureMessage(error,phase);if(error?.code==='account/link-pending'&&error.authUid)row.pendingUid=error.authUid;}
  progress();
 }
 return peopleImportReport(rows);
}
