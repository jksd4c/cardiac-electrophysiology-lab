/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
/* Model-derived teaching measurements and viewport arithmetic. No patient ECG analysis. */
(function(global){
'use strict';
const H=typeof module==='object'&&module.exports?require('./ecg-morphology.js'):global.HeartRhythm;
const clamp=H.clamp;
function windowFor(time,span,duration=12000){span=clamp(span,600,duration);const start=clamp(Math.floor(clamp(time,0,duration-1)/span)*span,0,duration-span);return {start,end:start+span,span};}
function zoomWindow(start,span,anchor,delta,duration=12000){const next=clamp(span*Math.exp(delta*.0015),600,duration),ratio=clamp((anchor-start)/span,0,1),left=clamp(anchor-ratio*next,0,duration-next);return {start:left,end:left+next,span:next};}
function correctedQT(qtMs,rrMs,method='fridericia'){if(!(qtMs>0&&rrMs>0))return null;return qtMs/Math.pow(rrMs/1000,method==='bazett'?.5:1/3);}
H.Engine.prototype.intervalMetrics=function(time){
 const frame=this.frameAt(time),beats=this.ventricles,idx=beats.findLastIndex(b=>b.time<=time),b=beats[idx];
 const empty={beatTime:null,rr:null,pr:null,qrs:null,qt:null,qtcB:null,qtcF:null,jt:null,reason:'noBeat'};
 if(!b)return empty;
 if(frame.vf||this.id==='ventFlutter'&&time>=this.onset||this.id==='asystole'&&time>this.onset+500)return {...empty,reason:'unorganized'};
 const previous=beats[idx-1],rr=previous?b.time-previous.time:null,pr=b.atrial?.conducted?b.time-b.atrial.time:null;
 const result={...empty,beatTime:b.time,rr,pr,qrs:b.qrs,reason:'model'};
 if(frame.af||['mat','wap','flutter','flutterVar','atypicalFlutter','pmvt','tdp','preAf'].includes(this.id)&&time>=this.onset)return {...result,reason:'irregular'};
 const extended=this.info.extended,cycle=60000/(b.waveRate||this.bpm),wide=b.qrs>120;
 const peak=extended?(b.longQT?465:clamp(.33*cycle,160,300)):(wide?340:clamp(270*Math.sqrt(this.rr/800),232,300));
 const sigma=extended?(b.longQT?68:clamp(cycle*.052,25,45)):(wide?45:42);
 // For the isolated Gaussian T component, its descending maximum-slope tangent
 // meets baseline at peak + 2 sigma. Report that estimate, not a clinical QT.
 result.qt=peak+2*sigma;result.jt=result.qt-b.qrs;
 const next=beats[idx+1],followingA=this.atria.find(a=>a.time>b.time+b.qrs&&a.time<b.time+result.qt);
 if(next&&next.time<b.time+result.qt||followingA){result.qt=result.jt=null;result.reason='overlap';return result;}
 const intervals=beats.slice(Math.max(0,idx-3),idx+1).map((beat,i,a)=>i?beat.time-a[i-1].time:null).filter(x=>x>0);
 const stable=intervals.length>=2&&Math.max(...intervals)-Math.min(...intervals)<.10*(rr||1);
 const sinusBeat=b.kind==='normal'&&!b.originV&&!b.preexcited&&(!b.atrial||b.atrial.kind==='sinus');
 if(wide){result.reason='wideQRS';return result;}
 if(!stable||!sinusBeat){result.reason='unstable';return result;}
 result.qtcB=correctedQT(result.qt,rr,'bazett');result.qtcF=correctedQT(result.qt,rr);return result;
};
H.ECGTools={windowFor,zoomWindow,correctedQT};
if(typeof module==='object'&&module.exports)module.exports=H;
})(typeof window==='undefined'?globalThis:window);
