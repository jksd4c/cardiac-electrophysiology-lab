/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
(function(global){
'use strict';const H=typeof module==='object'&&module.exports?require('./rhythm-extension.js'):global.HeartRhythm;
const P=H.Engine.prototype,rawECG=P.ecg,gauss=(u,c,w)=>Math.exp(-.5*((u-c)/w)**2);
const rs=(r,s)=>[[r,.25,.10],[-s,.58,.14]],rSr=(r,s,R)=>[[r,.12,.055],[-s,.36,.10],[R,.77,.12]];
const profiles={
 normal:[rs(.25,1.25),rs(.43,1.1),rs(.86,.83),rs(1.25,.50),rs(1.35,.24),rs(1.10,.14)],
 rbbb:[rSr(.65,1.05,1.65),rSr(.65,1.25,1.15),rSr(.75,1.0,.65),[[1.15,.26,.10],[-.65,.77,.15]],[[1.4,.27,.1],[-.65,.78,.15]],[[1.25,.27,.1],[-.60,.78,.15]]],
 lbbb:[rs(.09,1.6),rs(.09,1.9),rs(.22,1.6),rs(.75,1.0),[[1.2,.40,.10],[1.2,.67,.10]],[[1.2,.40,.10],[1.1,.67,.10]]],
 rvot:[rs(.06,1.25),rs(.17,1.5),rs(.42,1.1),rs(1.25,.63),rs(1.55,.25),rs(1.35,.18)],
 rvotFree:[rs(.04,1.10),rs(.10,1.35),rs(.23,1.18),rs(.43,.90),rs(1.28,.42),rs(1.22,.22)],
 lvot:[rs(.67,1.06),rs(1.65,.42),rs(1.75,.23),rs(1.60,.17),rs(1.40,.13),rs(1.20,.1)],
 summit:Array.from({length:6},(_,i)=>[[.18,.26,.18],[1.15-i*.035,.63,.16]]),
 papPost:[rs(1.9,.17),rs(1.65,.20),rs(1.12,.56),rs(.58,1.05),rs(.43,1.1),rs(.33,1.0)],
 papAnt:[rs(1.65,.22),rs(1.50,.28),rs(.95,.62),rs(.50,1.12),rs(.32,1.20),rs(.22,1.12)],
 mitral:[rs(1.40,.08),rs(1.65,.07),rs(1.72,.07),rs(1.6,.07),rs(1.42,.06),rs(1.25,.05)],
 tricuspid:[rs(.06,1.4),rs(.18,1.55),rs(.27,1.2),rs(.38,1.08),rs(1.15,.50),rs(1.30,.3)],
 fasc:[rSr(.55,.58,1.25),rSr(.45,.64,.95),rs(1.0,.66),rs(.75,.70),rs(.80,.35),rs(.90,.25)],
 paraHis:[rs(0,1.10),rs(.08,1.18),rs(1.48,.35),rs(1.55,.24),rs(1.60,.16),rs(1.45,.1)]
};
function profile(b){if(b.profile)return b.profile;const k=b.branch||b.shape;if(k==='rbbLaf'||k==='rbbLpf')return 'rbbb';if(k==='lafb'||k==='lpfb')return 'normal';return profiles[k]?k:null;}
function chestQRS(b,d,n){const key=profile(b);if(!key||d<0||d>b.qrs)return 0;const u=d/b.qrs,env=Math.sin(Math.PI*u);let value=0;for(const [a,c,w]of profiles[key][n])value+=a*gauss(u,c,w);if(key==='rvotFree')value*=1-.22*gauss(u,.43,.026);return value*env;}
function chestT(b,d,n){const key=profile(b),rr=60000/(b.waveRate||75),tp=b.longQT?465:H.clamp(.33*rr,160,300),w=b.longQT?68:H.clamp(rr*.052,25,45);let sign=1;
 if(key==='rbbb')sign=n<3?-1:1;else if(key==='lbbb')sign=n<4?1:-1;else if(key!=='normal'){const c=profiles[key][n];sign=c.reduce((s,p)=>s+p[0]*p[2],0)>=0?-1:1;}
 return sign*(key==='normal'?.24:.22)*gauss(d,tp,w);
}
P.ecg=function(t,lead){let value=rawECG.call(this,t,lead);if(!this.info.extended||!/^V[1-6]$/.test(lead))return value;const n=Number(lead.slice(1))-1;
 for(const b of this.ventricles){if(!profile(b))continue;const d=t-b.time;if(d<0||d>780)continue;value-=this.project(this.qrsVector(b,d),lead)+this.project(this.tVector(b,d),lead);value+=chestQRS(b,d,n)+chestT(b,d,n);}return value;
};
P.allLeads=function(t){const vector=this.vectorAt(t),out=Object.fromEntries(H.leadNames.map(l=>[l,this.project(vector,l)]));if(this.info.extended)for(const b of this.ventricles){if(!profile(b))continue;const d=t-b.time;if(d<0||d>780)continue;const q=this.qrsVector(b,d),tv=this.tVector(b,d),old=q.map((v,i)=>v+tv[i]);for(let n=0;n<6;n++){const lead='V'+(n+1);out[lead]+=chestQRS(b,d,n)+chestT(b,d,n)-this.project(old,lead);}}return out;};
P.isolatedBeat=function(b,d,lead){if(d<0||d>780)return 0;if(/^V[1-6]$/.test(lead)&&profile(b))return chestQRS(b,d,Number(lead.slice(1))-1)+chestT(b,d,Number(lead.slice(1))-1);return this.project(this.qrsVector(b,d),lead)+this.project(this.tVector(b,d),lead);};
P.beatMetrics=function(b){if(!b)return null;let x=0,y=0;for(let d=0;d<b.qrs;d+=2){const v=this.info.extended?this.qrsVector(b,d):this.vectorAt(b.time+d);x+=v[0];y+=v[1];}const axis=Math.round(Math.atan2(-y,x)*180/Math.PI);let transition='未见',ratios=[];
 for(let n=0;n<6;n++){let high=0,low=0;for(let d=0;d<=b.qrs;d+=1){const a=profile(b)?chestQRS(b,d,n):this.project(this.info.extended?this.qrsVector(b,d):this.vectorAt(b.time+d),'V'+(n+1));high=Math.max(high,a);low=Math.min(low,a);}ratios.push(high/Math.max(.001,-low));if(transition==='未见'&&high>=-low&&high>.05)transition='V'+(n+1);}
 const flips=[];for(let n=1;n<6;n++)if((ratios[n]>=1)!==(ratios[n-1]>=1))flips.push((ratios[n]>=1?'S→R ':'R→S ')+'V'+(n+1));transition=flips.length===1?flips[0]:flips.length>1?'多次转换':ratios.every(r=>r>=1)?'胸导联正向一致':'未出现 R≥S';return {qrs:b.qrs,axis,transition,ratios,profile:profile(b)};
};
H.chestProfiles=profiles;H.chestQRS=chestQRS;
if(typeof module==='object'&&module.exports)module.exports=H;
})(typeof window==='undefined'?globalThis:window);
