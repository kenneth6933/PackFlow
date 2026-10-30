import {clone,scoped} from './core.js';
export function reviewSnapshot(state,actor,role='admin',packerId=''){
 if(actor?.role!=='admin'||role==='admin')return state;
 const out=scoped(state,{id:role==='packer'?packerId:actor.id,role});
 delete out._pools;delete out.accountJobs;
 if(role==='packer')out.settlements=out.settlements.filter(z=>z.lines.length);
 return out;
}
export function validateLoginPerson(actor,person,password){
 if(actor?.role!=='admin'||actor.active===false)throw Error('Administration only.');
 if(!person?.active)throw Error('Activate and save this person before creating a login.');
 if(!/^[A-Za-z0-9_.-]{1,60}$/.test(person.id))throw Error('Invalid person ID.');
 if(typeof password!=='string'||password.length<6)throw Error('Enter a password with at least 6 characters.');
 if(!['admin','driver','packer'].includes(person.role))throw Error('Invalid role.');
 return person.id.toLowerCase();
}
export async function provisionLogin({actor,person,password,skipExisting=false,resumeUid},api){
 const id=validateLoginPerson(actor,person,password);
 await api.authorize(actor);
 const identity=await api.identity(id,password,{skipExisting:skipExisting&&!resumeUid});
 if(identity.skipped)return {skipped:true,created:false};
 if(resumeUid&&identity.uid!==resumeUid)throw Error('Retry identity does not match the account created by this batch.');
 if(!identity.uid)throw Error('Firebase did not return an account UID.');
 try{await api.link(actor,person,identity.uid);}
 catch{const error=Error('The Firebase login exists, but the personnel link could not be saved. Check your connection and retry Create / link login with the same password.');error.code='account/link-pending';error.authUid=identity.uid;throw error;}
 return {uid:identity.uid,created:identity.created};
}
export async function secondaryIdentity({base,sdk,config,domain,id,password,name,skipExisting=false}){
 const secondaryApp=base.initializeApp(config,name),secondaryAuth=sdk.getAuth(secondaryApp);
 try{
  await sdk.setPersistence(secondaryAuth,sdk.inMemoryPersistence);
  let credential,created=true;
  try{credential=await sdk.createUserWithEmailAndPassword(secondaryAuth,`${id}@${domain}`,password);}
  catch(e){if(e.code!=='auth/email-already-in-use')throw e;if(skipExisting)return {skipped:true,created:false};created=false;credential=await sdk.signInWithEmailAndPassword(secondaryAuth,`${id}@${domain}`,password);}
  return {uid:credential.user.uid,created};
 }finally{try{await sdk.signOut(secondaryAuth);}finally{await base.deleteApp(secondaryApp);}}
}
