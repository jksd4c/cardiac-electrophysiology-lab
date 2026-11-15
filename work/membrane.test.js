/* SPDX-License-Identifier: GPL-3.0-only · Copyright (C) 2026 jksd4c */
'use strict';
const assert=require('node:assert/strict'),C=require('./membrane-core.js'),H=require('./ecg-morphology.js');
const near=(a,b,tolerance=1e-6)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
// Physiological ordering, resting bounds, continuity and monotonic final recovery.
assert.deepEqual([-1,1,8,100,250,301].map(t=>C.actionPotential(t,300).phase),[4,0,1,2,3,4]);
for(const duration of [100,175,300,500]){
 for(const boundary of [0,.01,.055,.64,1])near(C.actionPotential(boundary*duration-1e-6,duration).voltage,C.actionPotential(boundary*duration+1e-6,duration).voltage,.001);
 let last=Infinity;for(let a=duration*.64;a<=duration;a+=.1){const v=C.actionPotential(a,duration).voltage;assert.ok(v<=last+.00001);last=v;}
}
assert.equal(C.color(-90),C.palette[0]);assert.equal(C.color(30),C.palette.at(-1));
assert.equal(C.quadrant([1,-1,0]).number,1);assert.equal(C.quadrant([-1,-1,0]).number,2);assert.equal(C.quadrant([-1,1,0]).number,3);assert.equal(C.quadrant([1,1,0]).number,4);assert.equal(C.quadrant([0,0,5]).angle,null);
near(C.branchDelay('lbbb','LV',[0,0,0]),65);near(C.branchDelay('lbbb','RV',[0,0,0]),0);near(C.branchDelay('rbbb','RV',[0,0,0]),60);
const sinus=new H.Engine({rhythm:'sinus'}),cycle=C.cycleAt(sinus,500);
assert.equal(cycle.start,414);assert.equal(cycle.end,1214);assert.equal(C.cycleSeek(cycle,900),1213);assert.equal(C.advance(1213,2,cycle),415);assert.equal(C.advance(11999,2,null),1);
const vf=new H.Engine({rhythm:'vf'});assert.equal(C.cycleAt(vf,4000).organized,false);
const probes=[{key:'VENT',position:[.5,-.8,.7],activation:230},{key:'LV',position:[.5,-.7,.1],activation:215},{key:'RA',position:[-.8,0,.3],activation:50},{key:'LA',position:[.3,.1,-.4],activation:95}];
// Representative sites remain finite across every rhythm, without seeking into
// the next beat or inventing a regular V–V cycle during fibrillation.
let samples=0;
for(const id of Object.keys(H.rhythms)){
 const engine=new H.Engine({rhythm:id});
 for(let t=0;t<12000;t+=47){const cycle=C.cycleAt(engine,t);assert.ok(cycle.start<=t&&cycle.end>t,`${id} cycle @ ${t}`);assert.ok(cycle.end<=12000&&cycle.end>cycle.start);
  for(const p of probes){const s=C.sample(p,engine,t);assert.ok(Number.isFinite(s.voltage)&&s.voltage>=-90.0001&&s.voltage<=30.0001,`${id} ${p.key} @ ${t}`);assert.ok(s.phase>=0&&s.phase<=4);samples++;}
 }
}
console.log(`PASS: ${samples} membrane samples across 75 scenarios; AP phases, bounds, continuity, recovery, BBB timing, quadrants, cycle seeking and loop boundaries.`);
