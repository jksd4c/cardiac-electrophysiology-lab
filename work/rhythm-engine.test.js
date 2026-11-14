/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
'use strict';
const assert=require('node:assert/strict');
const {Engine,rhythms,leadNames}=require('./rhythm-engine.js');
let checked=0;
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
for(const bpm of [60,75,100]){
 for(const rhythm of Object.keys(rhythms)){
  const e=new Engine({rhythm,bpm});
  assert.equal(e.bpm,bpm);
  for(let t=0;t<12000;t+=13){const l=e.allLeads(t);assert.equal(Object.keys(l).length,12);for(const lead of leadNames)assert.ok(Number.isFinite(l[lead]),`${rhythm}/${lead}/${t}`);close(l.I+l.III,l.II);close(l.aVR,-(l.I+l.II)/2);close(l.aVL,l.I-l.II/2);close(l.aVF,l.II-l.I/2);const f=e.frameAt(t);assert.ok(Number.isFinite(f.atrialClock)&&Number.isFinite(f.ventClock));assert.ok(f.title);checked++;}
 }
 const sinus=new Engine({bpm});close(sinus.ventricles[2].time-sinus.ventricles[1].time,60000/bpm);assert.ok(sinus.ventricles.every(v=>v.qrs===90));
 const av1=new Engine({rhythm:'av1',bpm});assert.ok(av1.atria.every(a=>a.pr===260&&a.conducted));
 const wenck=new Engine({rhythm:'mobitz1',bpm});const ws=wenck.atria.filter(a=>a.time>=0).slice(0,4);assert.deepEqual(ws.map(a=>a.pr),[180,230,270,null]);assert.equal(wenck.ventricles.filter(v=>v.atrial===ws[3]).length,0);
 const m2=new Engine({rhythm:'mobitz2',bpm});assert.ok(m2.atria.filter(a=>a.conducted).every(a=>a.pr===180));assert.ok(m2.atria.some(a=>a.block==='his'));
 const a21=new Engine({rhythm:'av21',bpm});const a=a21.atria.filter(a=>a.time>=0).slice(0,6);assert.deepEqual(a.map(x=>x.conducted),[true,false,true,false,true,false]);close(a21.ratesAt(6000).vent,Math.round(bpm/2));
 const high=new Engine({rhythm:'advanced',bpm});assert.deepEqual(high.atria.filter(a=>a.time>=0).slice(0,6).map(a=>a.conducted),[true,false,false,true,false,false]);
 for(const rhythm of ['completeJ','completeV']){const c=new Engine({rhythm,bpm});assert.ok(c.atria.every(a=>!a.conducted));assert.ok(c.ventricles.every(v=>v.atrial===null));const rr=60000/(rhythm==='completeJ'?42:30);close(c.ventricles[2].time-c.ventricles[1].time,rr);}
 const pac=new Engine({rhythm:'pac',bpm});const ai=pac.atria.findIndex(a=>a.kind==='pac');assert.ok(pac.atria[ai].time-pac.atria[ai-1].time<pac.rr);assert.ok(pac.atria[ai+1].time-pac.atria[ai-1].time<2*pac.rr);
 const pvc=new Engine({rhythm:'pvc',bpm});const vi=pvc.ventricles.findIndex(v=>v.kind==='pvc'&&v.time>0);assert.ok(pvc.ventricles[vi].qrs>=120);close(pvc.ventricles[vi+1].time-pvc.ventricles[vi-1].time,2*pvc.rr);assert.equal(pvc.ventricles[vi].atrial,null);
 for(const rhythm of ['escapeA','escapeJ','escapeV']){const e=new Engine({rhythm,bpm});assert.ok(e.ventricles[2].time-e.ventricles[1].time>e.rr,'Escape must be late');}
 const af=new Engine({rhythm:'af',bpm});assert.ok(af.atria.every(a=>a.time<af.afOnset));const afb=af.ventricles.filter(v=>v.time>af.afOnset);const rr=afb.slice(1).map((v,i)=>v.time-afb[i].time);assert.ok(Math.max(...rr)-Math.min(...rr)>250);assert.equal(af.frameAt(af.afOnset+1000).atrialMode,2);assert.deepEqual(af.ventricles,new Engine({rhythm:'af',bpm}).ventricles);
 const vf=new Engine({rhythm:'vf',bpm});assert.ok(vf.ventricles.every(v=>v.time<vf.vfOnset));assert.equal(vf.ratesAt(vf.vfOnset+500).vent,'—');assert.equal(vf.frameAt(vf.vfOnset+500).ventMode,2);
}
const e=new Engine();const p=e.atria.find(a=>a.time>=0);assert.ok(e.ecg(p.time+44,'II')>0);assert.ok(e.ecg(p.time+44,'aVR')<0);assert.ok(e.ecg(p.ventTime+34,'V1')<0);assert.ok(e.ecg(p.ventTime+34,'V6')>0);assert.ok(e.ecg(p.ventTime+270,'II')>0);
const pvc=new Engine({rhythm:'pvc',coupling:280}),v=pvc.ventricles.find(v=>v.kind==='pvc'&&v.time>0);close(v.time-pvc.ventricles[pvc.ventricles.indexOf(v)-1].time,280);
assert.notEqual(pvc.frameAt(v.time-10).title,'His 束下传');
for(const rhythm of ['escapeJ','escapeV']){const e=new Engine({rhythm});assert.ok(e.firstFocusTime()>2000);assert.equal(e.frameAt(e.firstFocusTime()+35).v.kind,rhythm);}
const afTrigger=new Engine({rhythm:'af'});close(afTrigger.afOnset-afTrigger.pvOnset,65);assert.ok(afTrigger.frameAt(afTrigger.pvOnset+30).pvTrigger);assert.ok(!afTrigger.frameAt(afTrigger.pvOnset+30).af);
console.log(`PASS: ${Object.keys(rhythms).length} rhythms × 3 rates, ${checked} sampled frames; lead identities, morphology signs, AV block, escape, ectopy, AF, VF timing.`);
