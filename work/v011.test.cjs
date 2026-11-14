/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const H=require('./ecg-tools.js'),{windowFor,zoomWindow,correctedQT}=H.ECGTools;
const close=(a,b,eps=1e-7)=>assert.ok(Math.abs(a-b)<eps,`${a} != ${b}`);
// A long clip must be reachable in either direction, including a short final window.
for(const span of [600,1640,2000,4000,6000,12000])for(let t=0;t<12000;t+=17){const w=windowFor(t,span);assert.ok(w.start<=t&&t<w.end);assert.ok(w.start>=0&&w.end<=12000);close(w.end-w.start,span);}
assert.equal(windowFor(4001,4000).start,4000);assert.equal(windowFor(3999,4000).start,0);
assert.equal(windowFor(8001,4000).start,8000);
// Cursor-centered time zoom keeps the same anchor pixel; limits never expose absent data.
for(const delta of [-200,-50,50,200]){const z=zoomWindow(4000,4000,5500,delta);close((5500-z.start)/z.span,1500/4000);}
assert.equal(zoomWindow(0,4000,0,-10000).span,600);
assert.equal(zoomWindow(0,4000,0,10000).span,12000);
assert.equal(zoomWindow(8000,4000,11999,2000).end,12000);
// Independent formula examples: QT is milliseconds and RR is converted to seconds.
close(correctedQT(400,1000),400);close(correctedQT(320,640,'bazett'),400);
close(correctedQT(360,729),400);assert.equal(correctedQT(400,0),null);
const E=id=>new H.Engine({rhythm:id,bpm:75});
const normal=E('sinus').intervalMetrics(7000);
assert.equal(normal.rr,800);assert.equal(normal.qrs,90);assert.ok(normal.pr>=120&&normal.pr<=200);
close(normal.qt,354);close(normal.qtcB,354/Math.sqrt(.8));close(normal.qtcF,354/Math.cbrt(.8));
// Never present routine QTc for disorganized signals, ectopy, unstable RR or wide QRS.
for(const id of ['af','vf','tdp','pmvt','preAf','mat','flutter','ventFlutter','asystole']){const m=E(id).intervalMetrics(10000);assert.equal(m.qtcB,null,id);assert.equal(m.qtcF,null,id);}
for(const id of ['lbbb','rbbb','pvcRVOT','pvcLVOT']){const e=E(id),v=e.ventricles.find(b=>b.time>0&&b.qrs>120);assert.ok(v,id);const m=e.intervalMetrics(v.time+50);assert.equal(m.qtcB,null,id);assert.equal(m.qtcF,null,id);assert.ok(m.qrs>120);}
let checked=0;for(const id of Object.keys(H.rhythms)){const e=E(id);for(let t=0;t<12000;t+=101){const m=e.intervalMetrics(t);for(const k of ['rr','pr','qrs','qt','qtcB','qtcF'])assert.ok(m[k]===null||Number.isFinite(m[k])&&m[k]>=0,`${id}: ${k}`);checked++;}}
// Examples occur promptly, but a PVC's compensatory interval is preserved.
for(const id of ['pvc','pvcRVOT','pvcLVOT']){const e=E(id),p=e.ventricles.filter(v=>v.time>0&&(v.kind==='pvc'||v.originV));assert.ok(p.length>=4,`${id}: sparse events`);assert.ok(p[0].time<1400);const first=p[0],i=e.ventricles.indexOf(first),prev=e.ventricles[i-1],next=e.ventricles[i+1];close(next.time-prev.time,2*e.rr);}
assert.ok(E('af').afOnset<2000);assert.ok(E('vf').vfOnset<2000);
// Source integration: single scrubber inside the sticky transport, unique DOM identities.
const html=fs.readFileSync(__dirname+'/laboratory-template.html','utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
assert.equal(new Set(ids).size,ids.length,'duplicate DOM id');assert.ok(html.indexOf('id="scrub"')<html.indexOf('class="workspace-grid"'));
assert.ok(!html.includes('id="bpm"'));assert.ok(html.includes('by: jksd4c'));
const {missing}=require('./check-i18n.cjs');assert.equal(missing.length,0);
console.log(`PASS v0.1.1: zoom anchoring, clip edges, QT/QTc gating (${checked} frames), event density, DOM structure and bilingual coverage.`);
