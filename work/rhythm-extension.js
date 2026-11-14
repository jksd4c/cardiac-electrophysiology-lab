/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
(function(global){
'use strict';
const H=typeof module==='object'&&module.exports?require('./pvc-origins.js'):global.HeartRhythm;
const Base=H.Engine,C=H.clamp,TAU=Math.PI*2,g=(d,c,w)=>Math.exp(-.5*((d-c)/w)**2),add=(a,b,k)=>{for(let i=0;i<3;i++)a[i]+=b[i]*k;},mod=(a,b)=>(a%b+b)%b;
const duration=shape=>({normal:90,rbbb:150,lbbb:155,lafb:105,lpfb:105,rbbLaf:155,rbbLpf:155,pre:145,fasc:135,fusion:120}[shape]||165);
const origins={vent:[-.24,-.8,.85],rvot:[-.28,.20,.62],left:[.73,-.58,.32],septal:[.02,-.66,.23]};
class ExpandedEngine extends Base{
 configure(options={}){this.input=options;super.configure(options);this.info=H.rhythms[this.id];return this;}
 makeEvents(){
  const r=H.rhythms[this.id];this.rateSetting=r.rate?C(Number(this.input.rhythmRate)||r.rate.value,r.rate.min,r.rate.max):this.bpm;
  this.period=60000/this.rateSetting;this.onset=240+this.rr;this.offset=Infinity;this.afEnd=Infinity;this.saEvents=[];this.markers=null;this.activeKind='';
  if(!r.extended){super.makeEvents();return;}
  const id=this.id,rr=this.rr,period=this.period,start=240,end=13200;
  const a=(t,kind='sinus',pr=174,block='',extra={})=>{const q=this.atrial(t,kind,pr,block);Object.assign(q,extra);if(pr!==null){const v=this.ventricles[this.ventricles.length-1];Object.assign(v,{shape:extra.shape||'normal',qrs:duration(extra.shape||'normal'),originV:false,waveRate:this.rateSetting,red:kind!=='sinus'});}if(kind==='sinus')this.saEvents.push({time:t,blocked:false});return q;};
  const v=(t,shape='wide',kind='ventricular',extra={})=>{const b=this.ventricular(t,kind);Object.assign(b,{shape,qrs:duration(shape),originV:true,waveRate:this.rateSetting,red:true,focus:origins.vent,...extra});return b;};
  const intro=(until=this.onset)=>{for(let t=start-2*rr;t<until-174;t+=rr)a(t);};
  const sinus=(until=end)=>{for(let t=start-2*rr;t<until;t+=rr)a(t);};
  this.markers=[[this.onset-350,'发作前'],[this.onset+35,'关键激动',1],[this.onset+1500,'机制观察',1]];
  if(['brady','tachy','rsa'].includes(id)){
    let t=start-2*period;for(let n=0;t<end;n++){a(t);t+=id==='rsa'?rr*(1+.20*Math.sin(n*.78)):period;}
    this.onset=0;this.markers=[[284,'窦性 P 波'],[449,'QRS'],[4000,'节律对照']];return;
  }
  if(id==='arrest'){
    for(let i=0;i<3;i++)a(start+i*rr);this.onset=start+3*rr;
    v(start+2*rr+174+1800,'normal','escapeJ',{originV:false});a(start+2*rr+174+1845,'retrograde',null);
    for(let t=start+5.4*rr;t<end;t+=rr)a(t);this.markers=[[this.onset+200,'窦性停搏',1],[start+2*rr+174+1835,'交界性逸搏',1],[start+5.4*rr+45,'窦律恢复']];return;
  }
  if(id==='saWenck'||id==='sa2'){
    this.saEvents=[];for(let i=-4,t=start-4*rr;t<end;i++,t+=rr){const k=mod(i,id==='saWenck'?4:5),blocked=id==='saWenck'?k===3:k===3;const delay=id==='saWenck'?[60,220,300,0][k]:60;if(!blocked)a(t+delay);}
    this.saEvents=[];for(let i=-4,t=start-4*rr;t<end;i++,t+=rr)this.saEvents.push({time:t,blocked:mod(i,id==='saWenck'?4:5)===3});
    this.onset=start+3*rr;this.markers=[[start+rr+250,'传出激动'],[this.onset+30,'窦房冲动未传出',1],[this.onset+rr+90,'下一次传出']];return;
  }
  if(id==='tachybrady'){
    this.afOnset=1800;this.pvOnset=Infinity;this.afEnd=5400;this.onset=1800;intro(1800);
    let t=2000,n=0;while(t<5200){v(t,'normal','afConducted',{originV:false});t+=[360,540,410,620,330][n++%5];}
    v(8100,'normal','escapeJ',{originV:false});a(8145,'retrograde',null);for(t=9900;t<end;t+=1333.333)a(t);this.markers=[[3000,'快速房颤',1],[6100,'转复后停顿',1],[8135,'逸搏接管',1],[9944,'窦律恢复']];return;
  }
  if(['pacBlocked','pacAberrant','pjc'].includes(id)){
    let t=start,n=0;while(t<end){a(t);if(n%2===0){const p=t+rr*(id==='pacBlocked'?.42:.58);if(id==='pjc'){v(t+174+rr*.58,'normal','pjc',{originV:false});a(t+174+rr*.58+40,'retrograde',null);t+=rr*2;}
      else{a(p,'pac',id==='pacBlocked'?null:190,id==='pacBlocked'?'av':'',{shape:id==='pacAberrant'?'rbbb':'normal'});t=p+rr;}}else t+=rr;n++;}
    const target=id==='pjc'?this.ventricles.find(b=>b.kind==='pjc').time:this.atria.find(b=>b.kind==='pac').time;this.onset=target;this.markers=[[target-250,'提前激动前'],[target+40,id==='pjc'?'交界性提前搏动':'提前 P′',1],[target+225,id==='pacBlocked'?'P′ 未下传':'下传 QRS',1]];return;
  }
  if(['atrialRhythm','wap','at','atBlock','mat'].includes(id)){
    intro();let n=0,t=this.onset;const vectors=[[.04,-.19,-.08],[.02,.15,-.025],[.17,-.04,.10]],foci=[[.36,.14,-.43],[-.92,-.10,.42],[-.66,.38,.29]];
    while(t<end){const multi=id==='mat'||id==='wap',k=multi?n%3:0,pr=multi?[135,185,155][k]:160,block=id==='atBlock'&&n%2===1;
      a(t,'atrial',block?null:pr,block?'av':'',{pVector:vectors[k],focus:foci[k],pShape:k});t+=period*(multi?[.80,1.22,.93,1.05][n%4]:1);n++;}return;
  }
  if(['ajr','jt','avnrt','avnrtAtyp','avrt','avrtAnti'].includes(id)){
    intro();for(let t=this.onset;t<end;t+=period){const anti=id==='avrtAnti',retro=id==='avnrt'?12:id==='avnrtAtyp'?period*.61:id==='avrt'?105:anti?period*.58:40;
      v(t,anti?'pre':'normal',id,{originV:anti,focus:origins.left});a(t+retro,'retrograde',null,'',{focus:id==='avrt'?[.65,-.10,-.25]:[-.407,-.3,.028]});}return;
  }
  if(['flutter','flutterVar','atypicalFlutter'].includes(id)){
    intro();this.flutterPeriod=period;let next=0,k=0;for(let n=0,t=this.onset;t<end;n++,t+=period){const conducted=n===next;if(conducted)next+=[2,3,2,4][id==='flutterVar'?k++%4:0];a(t,'flutter',conducted?155:null,conducted?'':'refractory');}return;
  }
  if(id==='wpw'){this.onset=0;for(let t=start-2*rr;t<end;t+=rr){const q=a(t,'sinus',90,'',{shape:'pre'});this.ventricles.at(-1).preexcited=true;this.ventricles.at(-1).red=true;q.normalVentTime=t+174;}this.markers=[[start+100,'δ 波起始',1],[start+175,'两路融合',1],[start+350,'继发复极']];return;}
  if(id==='preAf'){
    this.afOnset=this.onset;this.pvOnset=this.onset-65;intro();let t=this.onset+180,n=0;const factors=[.66,1.27,.83,1.46,.71,1.12,.94,.79,1.22];
    while(t<end){v(t,'pre','preAf',{qrs:125+(n%4)*16,axis:n*.64,focus:origins.left});t+=period*factors[n++%factors.length];}return;
  }
  if(['bigeminy','trigeminy','couplet','multifocal','interpolated','ront'].includes(id)){
    const step=id==='bigeminy'?2:id==='trigeminy'?3:4,ci=id==='ront'?this.coupling:id==='interpolated'?Math.min(310,rr*.42):this.coupling;this.coupling=ci;
    let ectopyIndex=0;for(let i=-2,t=start-2*rr;t<end;i++,t+=rr){const k=mod(i,step),trigger=id==='bigeminy'?k===0:id==='trigeminy'?k===1:k===0,skip=id!=='interpolated'&&(id==='bigeminy'?k===1:id==='trigeminy'?k===2:k===1);a(t,'sinus',skip?null:174,skip?'refractory':'');
      if(trigger){const multi=id==='multifocal',shape=multi&&ectopyIndex%2?'alternate':'wide';v(t+174+ci,shape,'pvc',{focus:multi&&ectopyIndex%2?origins.left:origins.vent});if(id==='couplet')v(t+174+ci+330,'wide','pvc');ectopyIndex++;}}
    const first=this.ventricles.find(b=>b.kind==='pvc'&&b.time>0);this.onset=first.time;this.markers=[[first.time-ci+260,'前搏 T 波'],[first.time+40,'提前宽 QRS',1],[first.time+400,id==='couplet'?'第二个室早':'间歇观察',1]];return;
  }
  if(r.pvcSite){
    const site=r.pvcSite;for(let i=-2,t=start-2*rr;t<end;i++,t+=rr){const k=mod(i,3);a(t,'sinus',k===1?null:174,k===1?'refractory':'');if(k===0)v(t+174+this.coupling,'site','pvc',{qrs:site.qrs,focus:site.focus,site,profile:site.profile});}
    const first=this.ventricles.find(b=>b.kind==='pvc'&&b.time>0);this.onset=first.time;this.markers=[[first.time-this.coupling+35,'窦性 QRS 对照'],[first.time+site.qrs*.38,'室早主波',1],[first.time+site.qrs*.77,'终末激动',1]];return;
  }
  if(r.branch){
    this.onset=0;let n=0;for(let t=start-2*rr;t<end;t+=rr,n++){let shape=r.branch==='alternating'?(Math.floor(Math.max(0,n-2)/4)%2?'lbbb':'rbbb'):r.branch;a(t,'sinus',174,'',{shape});this.ventricles.at(-1).branch=shape;this.ventricles.at(-1).red=true;}
    this.markers=[[start+190,'初始激动'],[start+290,'延迟区域',1],[start+4*rr+290,id==='altBBB'?'另一束支图形':'后续搏动',1]];return;
  }
  if(id==='asystole'){this.onset=start+3*rr;intro();this.markers=[[this.onset-rr+210,'最后一搏'],[this.onset+700,'心电静止',1]];return;}
  const ventricularIds=['aivr','nsvt','vt','rvot','fascVT','bbrVT','pmvt','tdp','bidir','ventFlutter'];
  if(ventricularIds.includes(id)){
    if(id==='tdp'){const lastP=start+rr;this.onset=lastP+174+540;intro(this.onset-300);for(const b of this.ventricles)b.longQT=true;this.markers=[[lastP+174+430,'延长的 T 波',1],[this.onset+35,'触发室早',1],[this.onset+period*5+65,'尖端扭转',1]];}
    else intro();
    if(id==='nsvt')this.offset=this.onset+period*6;
    const atrialPeriod=id==='aivr'?1333.333:rr;for(let t=this.onset+160;t<end;t+=atrialPeriod)a(t,'sinus',t>this.offset+120?174:null);
    let t=this.onset,n=0;while(t<Math.min(end,this.offset)){
      const shape=id==='rvot'?'rvot':id==='fascVT'?'fasc':id==='bbrVT'?'lbbb':['pmvt','tdp','bidir'].includes(id)?'dynamic':'wide';
      const axis=id==='tdp'?n*.47:id==='bidir'?(n%2?2.4:-.74):id==='pmvt'?Math.sin(n*2.7)*2.7:0;
      const focus=id==='rvot'?origins.rvot:id==='fascVT'?origins.septal:id==='vt'||id==='nsvt'?origins.left:['pmvt','tdp','bidir'].includes(id)?[.25+.6*Math.cos(axis),-.7+.22*Math.sin(axis),.35+.35*Math.sin(axis)]:origins.vent;
      v(t,shape,id,{axis,focus,qrs:id==='tdp'?145:id==='pmvt'?135+mod(n*17,48):duration(shape),amplitude:id==='tdp'?.72+.30*Math.sin(n*.42):1});
      const ramp=id==='aivr'?1+.28*Math.exp(-n/2.2):1,irregular=['pmvt','tdp'].includes(id)?1+.08*Math.sin(n*1.9):1;t+=period*ramp*irregular;n++;
    }
    if(id==='nsvt')this.markers=[[this.onset+40,'室速开始',1],[this.onset+period*3+40,'连续室性激动',1],[this.offset+500,'室速自止']];return;
  }
  throw new Error('Missing event generator for '+id);
 }
 vectorAt(t){
  if(!H.rhythms[this.id].extended)return super.vectorAt(t);
  const v=[0,0,0],id=this.id;
  if(id==='ventFlutter'&&t>=this.onset){const a=(t-this.onset)/this.period*TAU;return [.75*Math.sin(a),-.85*Math.sin(a+.15),.47*Math.sin(a+.6)];}
  for(const a of this.atria){if(a.kind==='flutter')continue;const d=t-a.time;if(d<0||d>110)continue;const k=Math.max(0,g(d,44,18)-g(0,44,18))*Math.sin(Math.PI*d/110);const dir=a.pVector||(a.kind==='retrograde'?[-.10,.15,-.025]:a.kind==='pac'?[.03,-.20,-.08]:[.11,-.13,.045]);add(v,dir,k);if(a.kind==='sinus')add(v,[.02,-.02,-.055],g(d,78,13)*Math.sin(Math.PI*d/110));}
  for(const b of this.ventricles){const d=t-b.time;if(d<0||d>780)continue;const shape=b.shape||'normal',q=b.qrs||90;
    add(v,this.qrsVector(b,d),1);add(v,this.tVector(b,d),1);
  }
  if(this.flutterPeriod&&t>=this.onset){const u=mod(t-this.onset,this.flutterPeriod)/this.flutterPeriod;const saw=u<.76?1-2*u/.76:-1+2*(u-.76)/.24;const scale=id==='atypicalFlutter'?.78:1;add(v,[-.06,.21,.19],saw*scale);}
  if(t>=this.afOnset&&t<this.afEnd){const x=(t-this.afOnset)/1000;add(v,[.05,-.05,.10],Math.sin(TAU*6.71*x)*.5);add(v,[-.04,.05,.08],Math.sin(TAU*10.37*x+.7)*.4);}
  return v;
 }
 qrsVector(b,d){const v=[0,0,0],shape=b.shape||'normal',q=b.qrs||90;if(d<0||d>q)return v;
    if(d<=q){const env=Math.sin(Math.PI*d/q),u=d/q;let parts=[];
      if(shape==='normal')parts=[[[-.20,-.045,.20],g(d,13,5)],[[1.12,-.99,-.54],g(d,34,7.5)],[[-.25,.20,-.14],g(d,64,9)]];
      else if(shape==='rbbb'||shape==='rbbLaf'||shape==='rbbLpf'){
        const main=shape==='rbbLaf'?[1.73333,1.08,-.42]:shape==='rbbLpf'?[-.68,-1.08,-.38]:[1.12,-.99,-.54];parts=[[[-.18,-.04,.20],g(d,12,5)],[main,g(d,37,10)],[[-.61,.12,1.02],g(d,q*.77,17)]];
      }else if(shape==='lbbb')parts=[[[.22,-.12,-.28],g(d,19,10)],[[1.03,-.79,-.74],g(d,q*.37,18)+.84*g(d,q*.66,16)]];
      else if(shape==='lafb'||shape==='lpfb'){const left=shape==='lafb';parts=[[(left?[-.18,-.08,.08]:[.18,.08,.08]),g(d,12,6)],[(left?[.68,1.08,-.25]:[-.68,-1.08,-.24]),g(d,42,13)]];}
      else if(shape==='pre'){const shift=30,dp=d-shift;add(v,[.42,-.26,.28],d<40?Math.sin(Math.PI*d/80)*.55:.4*Math.exp(-(d-40)/19));parts=[[[-.13,-.04,.12],g(dp,13,7)],[[.93,-.86,-.38],g(dp,34,12)],[[-.20,.15,-.08],g(dp,69,13)]];}
      else{let dir=shape==='site'?b.site.axis:shape==='rvot'?[.65,-1.3,-.75]:shape==='fasc'?[.62,1.08,.82]:shape==='alternate'?[-.77,.61,.62]:[.90,-1.04,-.62];if(shape==='dynamic')dir=[1.16*Math.cos(b.axis),1.16*Math.sin(b.axis),.7*Math.sin(b.axis+.8)];const amp=b.amplitude||1;parts=[[dir,amp*(g(u,.40,.15)+.34*g(u,.73,.13)+(b.profile==='rvotFree'?.26*g(u,.61,.035):0))]];}
      for(const [dir,k]of parts)add(v,dir,k*env);
    }
return v;}
 tVector(b,d){const v=[0,0,0],shape=b.shape||'normal';
    const effectiveRR=60000/(b.waveRate||this.bpm),tp=b.longQT?465:C(.33*effectiveRR,160,300),tw=b.longQT?68:C(effectiveRR*.052,25,45),td=d-tp;
    if(shape==='normal')add(v,[.27,-.24,-.08],g(td,0,tw));
    else if(shape==='lbbb'||shape==='rbbb'||shape==='rbbLaf'||shape==='rbbLpf')add(v,shape==='lbbb'?[-.22,.20,.16]:[.15,-.18,-.21],g(td,0,tw));
    else if(shape==='lafb'||shape==='lpfb')add(v,[.25,-.23,-.07],g(td,0,tw));
    else if(shape==='dynamic')add(v,[-.19*Math.cos(b.axis),-.19*Math.sin(b.axis),-.11*Math.sin(b.axis+.8)],g(td,0,tw));
    else add(v,shape==='alternate'?[.22,-.22,-.13]:[-.23,.25,.16],g(td,0,tw));
return v;}

 abnormalAt(t){if(!H.rhythms[this.id].extended)return super.abnormalAt(t);if(['rsa'].includes(this.id))return false;if(['brady','tachy'].includes(this.id)||this.info.branch||this.id==='wpw')return true;if(t>=this.afOnset&&t<this.afEnd)return true;return this.atria.some(a=>a.kind!=='sinus'&&t>=a.time&&t<a.time+110)||this.ventricles.some(v=>v.red&&t>=v.time&&t<v.time+Math.min(490,this.period));}
 frameAt(t){
  const f=super.frameAt(t);if(!H.rhythms[this.id].extended)return f;
  const id=this.id,r=this.info,a=f.a,v=f.v,aa=f.atrialAge,va=f.ventAge;f.af=t>=this.afOnset&&t<this.afEnd;f.pvTrigger=t>=this.pvOnset&&t<this.pvOnset+1000;f.atrialMode=f.af?2:a&&a.kind!=='sinus'?1:0;f.ventMode=v?.originV?1:0;f.redA=f.atrialMode>0||['brady','tachy'].includes(id);f.redV=!!v?.red||['brady','tachy'].includes(id);
  f.atrialFocus=a?.focus;f.ventricularFocus=v?.focus;f.branch=v?.branch||(id==='pacAberrant'&&v?.shape==='rbbb'?'rbbb':'');f.circuit=r.circuit&&(t>=this.onset)&&t<this.offset?r.circuit:null;f.circuitPhase=mod((t-this.onset)/this.period+({avnrt:.72,avnrtAtyp:.28,avrt:.55,avrtAnti:.2,bbr:.28,fasc:.1}[r.circuit]||0),1);f.circuitPeriod=this.period;f.mechanism=id;f.tdp=id==='tdp'&&t>=this.onset;f.longQT=id==='tdp';
  if(id==='wpw'){f.ventClock=174+(t-(a?.normalVentTime??99999));f.ventMode=0;f.preexcited=true;f.ventricularFocus=[.78,-.39,.03];if(va>=0&&va<160){f.title=aa<174?'旁道提前激动心室 · δ 波':'旁道与房室结–His 下传融合';f.stage=-1;}}
  if(['pjc','ajr','jt'].includes(id)&&v?.kind===id&&va>=0&&va<180){f.title=r.name+' · 交界区发放并下传';f.stage=3;}
  if(id==='flutter'||id==='flutterVar'||id==='atypicalFlutter'){if(t>=this.onset){f.atrialMode=3;f.redA=true;f.title='房内大折返 · '+(va>=0&&va<90?'房室下传':'F 波持续');f.stage=-1;}}
  if(f.circuit&&['avnrt','avnrtAtyp','avrt','avrtAnti','bbr','fasc','vt','mitral'].includes(f.circuit)){f.title=r.name+' · '+(va>=0&&va<v.qrs?'心室激动':'回路传播');f.stage=-1;}
  if(['aivr','nsvt','vt','rvot','fascVT','bbrVT','pmvt','tdp','bidir','ventFlutter'].includes(id)&&t>=this.onset&&t<this.offset){f.title=r.name+(va<170?' · 室性激动':' · 下一次激动前');f.stage=-1;}
  if(f.branch){f.title=va>=0&&va<180?'束支 / 分支传导异常 · 延迟激动':'窦性起搏 · '+r.name;f.ventMode=0;}
  if(id==='tachybrady'&&t>=this.afEnd){f.af=false;f.atrialMode=a?.kind==='retrograde'?1:0;f.redA=f.atrialMode>0;f.title=t<8100?'房颤终止后的长间歇':t<9900?'交界性逸搏接管':'较慢窦律恢复';f.stage=-1;}
  const internal=this.saEvents.filter(x=>x.time<=t).at(-1);f.saAge=internal?t-internal.time:9999;f.saBlocked=!!internal?.blocked&&f.saAge<250;
  if(f.saBlocked){f.title='窦房结已发放 · 窦房传出阻滞';f.stage=-1;}
  if(id==='asystole'&&t>this.onset+500){f.title='心电静止 · 无可辨电活动';f.stage=-1;}
  if(id==='arrest'&&t>=this.onset&&t<this.onset+rrSafe(this)-100){f.title='窦性停搏 · 等待逸搏';f.stage=-1;}
  return f;
 }
 ratesAt(t){
  if(!H.rhythms[this.id].extended)return super.ratesAt(t);
  const id=this.id,r=this.info,rate=this.rateSetting;let atrial=this.bpm,vent=this.bpm,note='教学示例';
  if(id==='brady'||id==='tachy'){atrial=vent=rate;note='窦性';}
  else if(id==='rsa'){const f=this.atria.filter(a=>a.time<=t),last=f.at(-1),prev=f.at(-2);atrial=vent=last&&prev?60000/(last.time-prev.time):this.bpm;note='随呼吸样周期变化';}
  else if(id==='saWenck'){vent=atrial=this.bpm*.75;note='平均外显率 · 窦房文氏';}
  else if(id==='sa2'){vent=atrial=this.bpm*.8;note='平均外显率 · 窦房漏搏';}
  else if(id==='arrest'&&t>=this.onset&&t<this.onset+rrSafe(this)*2){atrial='停顿';vent='间歇 / 逸搏';}
  else if(id==='tachybrady'){if(t>=1800&&t<5400){atrial='紊乱';vent=135;note='平均心室率';}else if(t>=5400&&t<8100){atrial='停顿';vent='—';note='转复后长间歇';}else if(t>=8100&&t<9900){atrial='逆传';vent='逸搏';}else if(t>=9900)atrial=vent=45;}
  else if(id==='asystole'&&t>=this.onset+500){atrial='—';vent='—';note='无可辨电活动';}
  else if(t>=this.onset&&r.rate){
    if(id==='preAf'){atrial='紊乱';vent=this.observedRate(this.ventricles.filter(v=>v.time>=this.onset));note='示例平均率 · 旁道下传';}
    else if(this.flutterPeriod){atrial=rate;vent=id==='flutterVar'?this.observedRate(this.ventricles.filter(v=>v.time>=this.onset)):rate/2;note='房内折返 / 房室滤过';}
    else if(id==='atBlock'){atrial=rate;vent=rate/2;}
    else if(['mat','wap'].includes(id)){atrial=vent=this.observedRate(this.ventricles.filter(v=>v.time>=this.onset));note='平均率 · 不齐';}
    else if(['aivr','nsvt','vt','rvot','fascVT','bbrVT','pmvt','tdp','bidir','ventFlutter'].includes(id)){atrial=id==='aivr'?45:this.bpm;vent=t<this.offset?rate:this.bpm;note=t<this.offset?'房室分离示例':'恢复窦性下传';}
    else {atrial=vent=rate;note='示例节律率';}
  }else if(['bigeminy','trigeminy','couplet','multifocal','interpolated','ront','pacBlocked','pacAberrant','pjc'].includes(id)){vent=this.observedRate(this.ventricles.filter(v=>v.time>=0&&v.time<12000));note='平均率 · 期前收缩';}
  return {atrial:typeof atrial==='number'?Math.round(atrial):atrial,vent:typeof vent==='number'?Math.round(vent):vent,note};
 }
 observedRate(beats){return beats.length<2?0:60000*(beats.length-1)/(beats.at(-1).time-beats[0].time);}
 firstFocusTime(){return H.rhythms[this.id].extended?this.onset:super.firstFocusTime();}
}
function rrSafe(e){return e.rr;}
H.Engine=ExpandedEngine;H.waveformLimit='矢量投影合成教学 ECG；不从解剖网格求解体表电位，不用于定位或诊断。';
if(typeof module==='object'&&module.exports)module.exports=H;
})(typeof window==='undefined'?globalThis:window);
