/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
'use strict';const assert=require('node:assert/strict'),H=require('./ecg-morphology.js');const E=(id,o={})=>new H.Engine({rhythm:id,...o}),close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} vs ${b}`);let frames=0;
for(const bpm of [60,75,100])for(const [id,info]of Object.entries(H.rhythms)){
 const rates=info.rate?[info.rate.min,info.rate.max]:[undefined];for(const rhythmRate of rates){const e=E(id,{bpm,rhythmRate});assert.ok(e.ventricles.every(v=>Number.isFinite(v.time)&&v.qrs>0));assert.ok(e.atria.every(a=>Number.isFinite(a.time)));
  for(let t=0;t<12000;t+=83){const f=e.frameAt(t),l=e.allLeads(t);for(const lead of H.leadNames)assert.ok(Number.isFinite(l[lead]),`${id} ${lead} @ ${t}`);assert.equal(Object.keys(l).length,12);close(l.I+l.III,l.II);close(l.aVR,-(l.I+l.II)/2);close(l.aVL,l.I-l.II/2);close(l.aVF,l.II-l.I/2);assert.ok(f.title&&!f.title.includes('undefined'));assert.ok(Number.isFinite(f.ventClock));for(const value of Object.values(e.ratesAt(t)))assert.notEqual(value,NaN);frames++;}
  for(const t of [449,3000,6781]){const l=e.allLeads(t);for(const lead of H.leadNames)close(l[lead],e.ecg(t,lead),1e-8);}
 }
}
for(const id of Object.keys(H.rhythms)){const e=E(id);if(e.markers)for(const [t]of e.markers)assert.ok(t>=0&&t<12000,`${id} marker ${t}`);}
for(const id of ['brady','tachy']){const e=E(id);const t=e.atria.filter(a=>a.time>=0);close(t[1].time-t[0].time,60000/e.rateSetting);}
{const e=E('sa2');const a=e.atria.filter(a=>a.time>=0);assert.ok(a.some((q,i)=>i>0&&Math.abs(q.time-a[i-1].time-2*e.rr)<1));assert.ok(e.saEvents.some(q=>q.blocked));}
{const e=E('saWenck');const a=e.atria.filter(a=>a.time>=0).slice(0,4);assert.ok(a[2].time-a[1].time<a[1].time-a[0].time);assert.ok(a[3].time-a[2].time>e.rr&&a[3].time-a[2].time<2*e.rr);}
{const e=E('pacBlocked');assert.ok(e.atria.some(a=>a.kind==='pac'&&!a.conducted));}
{const e=E('pacAberrant');assert.ok(e.ventricles.some(v=>v.atrial?.kind==='pac'&&v.shape==='rbbb'&&!v.originV));}
for(const id of ['mat','wap']){const e=E(id);assert.equal(new Set(e.atria.filter(a=>a.time>=e.onset).map(a=>a.pShape)).size,3);assert.ok(id==='mat'?e.rateSetting>100:e.rateSetting<100);}
{const e=E('flutter');const a=e.atria.filter(a=>a.kind==='flutter').slice(0,6);assert.deepEqual(a.map(a=>a.conducted),[true,false,true,false,true,false]);assert.equal(e.ratesAt(7000).vent,150);assert.equal(e.frameAt(7000).atrialMode,3);}
{const e=E('wpw');assert.ok(e.atria.every(a=>a.pr<120));assert.ok(e.ventricles.every(v=>v.qrs>=120));}
{const e=E('preAf');const v=e.ventricles.filter(b=>b.time>=e.onset);assert.ok(new Set(v.map(b=>b.qrs)).size>=3);assert.ok(new Set(v.slice(1).map((b,i)=>Math.round(b.time-v[i].time))).size>=5);}
{const e=E('nsvt');assert.equal(e.ventricles.filter(b=>b.kind==='nsvt').length,6);assert.ok(e.offset-e.onset<30000);assert.ok(e.ventricles.some(b=>b.time>e.offset&&b.atrial));}
{const e=E('tdp');assert.ok(e.ventricles.filter(b=>b.time<e.onset).every(b=>b.longQT));assert.ok(new Set(e.ventricles.filter(b=>b.kind==='tdp').map(b=>b.axis)).size>5);const p=E('pmvt');assert.ok(p.ventricles.every(b=>!b.longQT));}
{const e=E('asystole');for(const value of Object.values(e.allLeads(11000)))close(value,0);}
for(const [id,min,max]of [['lafb',-90,-45],['lpfb',110,180]]){const e=E(id),b=e.ventricles.find(b=>b.time>0),m=e.beatMetrics(b);assert.ok(m.axis>=min&&m.axis<=max);assert.ok(m.qrs<120);}
for(const [id,min,max]of [['bifasc',-90,-45],['bifascLP',110,180]]){const e=E(id),b=e.ventricles.find(b=>b.time>0),m=e.beatMetrics(b);assert.ok(m.axis>=min&&m.axis<=max,id+' must retain its fascicular axis');assert.ok(m.qrs>=120);}
for(const id of ['rbbb','lbbb']){const e=E(id),b=e.ventricles.find(b=>b.time>0);assert.ok(b.qrs>=120);if(id==='rbbb'){assert.ok(e.isolatedBeat(b,115,'V1')>.3);assert.ok(e.isolatedBeat(b,115,'V6')<-.1);}else{assert.ok(e.isolatedBeat(b,70,'V1')<-.5);assert.ok(e.isolatedBeat(b,70,'V6')>.5);}}
for(const [id,transition]of [['pvcRVOT','S→R V4'],['pvcRVOTFree','S→R V5'],['pvcLVOT','S→R V2'],['pvcPapPost','R→S V4']]){const e=E(id),b=e.ventricles.find(b=>b.kind==='pvc'&&b.time>0),m=e.beatMetrics(b);assert.equal(m.transition,transition);assert.equal(b.focus,H.pvcSites[id].focus);assert.equal(b.atrial,null);}
{const a=E('pvcRVOT'),b=E('pvcLVOT');const av=a.ventricles.find(x=>x.kind==='pvc'),bv=b.ventricles.find(x=>x.kind==='pvc');assert.ok(a.isolatedBeat(av,80,'V2')<0);assert.ok(b.isolatedBeat(bv,40,'V2')>0);}
console.log(`PASS: ${H.catalogCount} scenarios; ${frames} frames across baseline/rhythm-rate endpoints; ECG identities, event timing, SA block, PAC, flutter, preexcitation, NSVT, TdP, BBB/fascicular axes and 10 PVC sites.`);
