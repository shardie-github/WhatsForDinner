export async function idb(){ return await import('idb-keyval'); }
export async function getLocal(k:string){ const {get}=await idb(); return get(k); }
export async function setLocal(k:string,v:any){ const {set}=await idb(); return set(k,{v,ts:Date.now()}); }
