import {parseHTML} from 'linkedom';
import {indexedDB} from 'fake-indexeddb';
import assert from 'node:assert/strict';
const {window}=parseHTML('<html><body><div id="app"></div><div id="toast"></div></body></html>');
globalThis.window=window;globalThis.document=window.document;globalThis.indexedDB=indexedDB;Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});window.HTMLElement.prototype.focus=function(){};window.HTMLElement.prototype.setSelectionRange=function(){};
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){return this.querySelector('option[selected]')?.value||this.querySelector('option')?.value||'';},set(v){for(const o of this.querySelectorAll('option')){if(o.value===v)o.setAttribute('selected','');else o.removeAttribute('selected');}}});
// Run demo UI checks in an isolated module fixture, never alter the live config.
const {mkdtemp,copyFile,writeFile}=await import('node:fs/promises');const {tmpdir}=await import('node:os');const {join}=await import('node:path');const {pathToFileURL}=await import('node:url');const fixture=await mkdtemp(join(tmpdir(),'packflow-ui-'));for(const name of ['app.js','store.js','core.js','spark.js','portal.js','imports.js','ui-tools.js','login-tools.js','admin-tools.js','people-import.js','mobile-tools.js','packing-math.js','record-tools.js','outstanding.js','admin-menu.js','date-range.js'])await copyFile(new URL('../dist/'+name,import.meta.url),join(fixture,name));await writeFile(join(fixture,'package.json'),'{'+'"type":"module"'+'}');await writeFile(join(fixture,'config.js'),"export const cloudReady=false;export const firebaseConfig=null;export const loginDomain='test.invalid';");await import(pathToFileURL(join(fixture,'app.js')).href);
const $=q=>document.querySelector(q);const all=q=>[...document.querySelectorAll(q)];const wait=async()=>{for(let i=0;i<30;i++)await new Promise(r=>setTimeout(r,5));};

await $('[data-id="PK01"]').onclick();await $('#loginform').onsubmit({preventDefault(){}});await wait();
await $('[data-nav="payroll"]').onclick();
assert.doesNotMatch($('#content').textContent,/Pending amount|Monthly status/);
assert.match($('#content').textContent,/Confirmed amount/);
assert.deepEqual(all('.phone-app [data-nav]').map(x=>x.dataset.nav),['deliveries','confirmations','payroll','history']);

assert.ok($('#datepreset'));assert.equal($('#monthfilter'),null);
assert.equal($('#datepreset').value,'thisMonth');
assert.deepEqual(all('#datepreset option').map(x=>x.textContent),['Today','Yesterday','This Month','Last Month','Custom Range']);
$('#datepreset').value='custom';$('#datepreset').onchange({target:$('#datepreset')});
$('#rangestart').value='2026-01-01';$('#rangeend').value='2026-12-31';$('#applyrange').onclick();
assert.match($('.date-filter small').textContent,/2026-01-01/);
$('#rangestart').value='2027-01-01';$('#applyrange').onclick();assert.match($('#rangeerror').textContent,/valid/);
assert.match($('.date-filter small').textContent,/2026-01-01/);
console.log('PASS date presets, custom apply and invalid range guard');

console.log('PASS Packer cards removed, menu preserved');process.exit(0);
