/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
/* Educational event model. All displays use this clock; this is not a torso forward solver. */
(function (global) {
  'use strict';
  const TAU = Math.PI * 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rhythms = {
    sinus: {name:'窦性心律', group:'正常对照', ecg:'P 波先于每个 QRS；PR 恒定；RR 规则。', mechanism:'窦房结 → 心房肌 → 房室结延迟 → His–束支–浦肯野系统。', chapter:'Goldberger 第 2–6、13 章'},
    escapeA: {name:'房性逸搏 / 逸搏心律', group:'逸搏', ecg:'窦性停搏后较晚出现异位 P′；随后为窄 QRS。此处示例逸搏率 50 次/分。', mechanism:'先出现停顿，较低位心房起搏点接管；与提前发生的房早区别。', chapter:'Goldberger 第 13 章'},
    escapeJ: {name:'交界性逸搏 / 逸搏心律', group:'逸搏', ecg:'停顿后出现窄 QRS；示例逆行 P′ 位于 QRS 后，Ⅱ导联向下。逸搏率 50 次/分。', mechanism:'房室交界区接管，顺传激动心室并逆传激动心房。逆行 P 可位于 QRS 前、中或后，本例取后者。', chapter:'Goldberger 第 13 章'},
    escapeV: {name:'室性逸搏 / 逸搏心律', group:'逸搏', ecg:'停顿后出现宽 QRS，无先行相关 P；逸搏率 30 次/分。', mechanism:'心室低位起搏点在上级节律缺失后接管，经心肌较慢传播。', chapter:'Goldberger 第 13、16 章'},
    av1: {name:'一度房室传导阻滞', group:'房室传导阻滞', ecg:'PR = 260 ms（>200 ms）；每个 P 波均下传，不漏搏。', mechanism:'本例延迟设在房室结；一度房室传导延迟也可位于其他房室传导组织。', chapter:'Goldberger 第 17 章'},
    mobitz1: {name:'二度Ⅰ型 · 文氏现象', group:'房室传导阻滞', ecg:'PR 180 → 230 → 270 ms，随后一个 P 波未下传，下一次 PR 恢复 180 ms。', mechanism:'本例显示房室结内递增延迟及一次阻滞；不能把所有Ⅰ型都等同于结内阻滞。', chapter:'Goldberger 第 17 章；2018 ACC/AHA/HRS'},
    mobitz2: {name:'二度Ⅱ型 · Mobitz II', group:'房室传导阻滞', ecg:'已下传心搏的 PR 恒定（180 ms），间歇出现未下传 P 波。', mechanism:'阻滞示意在 His–浦肯野系统。本例取希氏束内阻滞的窄 QRS 形式；临床 QRS 也可宽。', chapter:'Goldberger 第 17 章；2018 ACC/AHA/HRS'},
    av21: {name:'2∶1 房室传导阻滞', group:'房室传导阻滞', ecg:'每两个 P 波仅一个 QRS。单凭固定 2∶1 片段不能分为 Mobitz I 或 II。', mechanism:'可切换结内 / 希浦系两个机制示例；这不是由本段体表心电图定位所得。', chapter:'Goldberger 第 17 章；2018 ACC/AHA/HRS'},
    advanced: {name:'高度房室传导阻滞 · 3∶1', group:'房室传导阻滞', ecg:'本例连续两个 P 波不能下传，仍保留部分房室传导（3∶1）。', mechanism:'与三度的完全房室阻滞区别；此处显示希浦系阻滞的一个教学实例。', chapter:'Goldberger 第 17 章；2018 ACC/AHA/HRS'},
    completeJ: {name:'三度房室阻滞 · 交界性逸搏', group:'房室传导阻滞', ecg:'P–P 与 R–R 各自规则，互不相关；PR 不固定。交界性逸搏率 42 次/分，QRS 窄。', mechanism:'心房激动不能到达心室；交界性起搏独立驱动下游 His–浦肯野系统。', chapter:'Goldberger 第 17 章；2018 ACC/AHA/HRS'},
    completeV: {name:'三度房室阻滞 · 室性逸搏', group:'房室传导阻滞', ecg:'房室分离；心房较快，心室独立以 30 次/分逸搏，QRS 宽。', mechanism:'完全阻滞后，较低位心室起搏点独立接管。', chapter:'Goldberger 第 17 章；2018 ACC/AHA/HRS'},
    pac: {name:'房性期前收缩 · 房早', group:'期前收缩', ecg:'提前出现形态改变的 P′，继以窄 QRS；重整窦房结后的间歇通常不完全代偿。', mechanism:'本例显示一个左房异位起点及正常房室下传。第一轮采用正常下传型，不混入未下传 / 差传型。', chapter:'Goldberger 第 14 章'},
    pvc: {name:'室性期前收缩 · 室早', group:'期前收缩', ecg:'提前出现宽 QRS，无相关先行 P；ST–T 与主波方向相反，本例为完全代偿间歇。', mechanism:'本例单一室性起点，不经正常窦房结–房室结顺序启动；可在心室局部视图调节联律间期观察 R-on-T。', chapter:'Goldberger 第 16 章'},
    af: {name:'心房颤动 · 肺静脉触发示例', group:'颤动', ecg:'片段先显示窦律，肺静脉快速发放后 P 波消失、出现 f 波，心室 RR 绝对不齐。', mechanism:'肺静脉肌袖触发后，心房出现紊乱传播；房室结滤过后不规则下传。此为一种机制示例，不代表所有房颤。', chapter:'Goldberger 第 15 章；Zipes & Jalife；Haïssaguerre 1998'},
    vf: {name:'心室颤动 · 室颤', group:'颤动', ecg:'片段由窦律转入形态、幅度与间期紊乱的颤动波；无可辨认的规则 QRS–T。', mechanism:'多个心室波前反复破裂与重入的示意；不继续显示有组织的心室激动或有效心室率。', chapter:'Goldberger 第 16、21 章；Zipes & Jalife'}
  };
  const leads = {
    I: [1,0,0], II: [.5,-Math.sqrt(3)/2,0], III: [-.5,-Math.sqrt(3)/2,0],
    aVR: [-.75,Math.sqrt(3)/4,0], aVL: [.75,Math.sqrt(3)/4,0], aVF: [0,-Math.sqrt(3)/2,0],
    V1: [-.78,0,.72], V2: [-.48,0,.92], V3: [-.12,0,1], V4: [.48,0,.87], V5: [.86,0,.5], V6: [1,0,.16]
  };
  const leadNames = Object.keys(leads);
  const gauss = (x,c,w) => Math.exp(-Math.pow((x-c)/w,2)/2);
  const add = (v, a, k) => {v[0]+=a[0]*k;v[1]+=a[1]*k;v[2]+=a[2]*k;};
  function random(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
  class Engine {
    constructor(options={}){this.configure(options);}
    configure(options={}){
      this.id = rhythms[options.rhythm] ? options.rhythm : 'sinus';
      this.bpm = clamp(Number(options.bpm)||75,60,100);
      this.rr = 60000/this.bpm; this.duration=12000;
      this.coupling = clamp(Number(options.coupling)||Math.round(this.rr*.62),220,Math.min(600,this.rr*.85));
      this.blockLevel = options.blockLevel==='his'?'his':'av';
      this.atria=[];this.ventricles=[];
      this.afOnset = this.id==='af' ? 240+this.rr : Infinity;
      this.pvOnset = this.afOnset-65;
      this.vfOnset = this.id==='vf' ? 240+this.rr+174 : Infinity;
      this.makeEvents();
      this.atria.sort((a,b)=>a.time-b.time);this.ventricles.sort((a,b)=>a.time-b.time);
      this.info=rhythms[this.id]; return this;
    }
    atrial(time,kind='sinus',pr=174,block=''){
      const a={time,kind,pr,block,conducted:pr!==null}; this.atria.push(a);
      if(pr!==null){a.ventTime=time+pr;this.ventricular(a.ventTime,kind==='sinus'?'normal':'conducted',a);}
      return a;
    }
    ventricular(time,kind='normal',a=null){const v={time,kind,atrial:a,qrs:kind==='pvc'||kind==='escapeV'?160:90};this.ventricles.push(v);return v;}
    makeEvents(){const rr=this.rr,id=this.id,start=240,end=this.duration+1300;
      if(id.startsWith('escape')){
        this.atrial(start);this.atrial(start+rr);
        const kind=id.slice(6),interval=kind==='V'?2000:1200;
        if(kind==='A')for(let t=start+rr+interval;t<end;t+=interval)this.atrial(t,'escapeA',174);
        else for(let t=start+rr+174+interval;t<end;t+=interval){this.ventricular(t,kind==='J'?'escapeJ':'escapeV');if(kind==='J')this.atrial(t+45,'retrograde',null);}
        return;
      }
      if(id==='pac'){
        let t=start,n=0;
        while(t<end){this.atrial(t);if(n%2===0){const p=t+rr*.58;this.atrial(p,'pac',190);t=p+rr;}else t+=rr;n++;}return;
      }
      if(id==='af'){
        for(let t=start;t<this.afOnset;t+=rr)this.atrial(t);
        const rng=random(7391);const intervals=Array.from({length:50},()=>.53+rng()*1.08);const mean=intervals.reduce((a,b)=>a+b)/intervals.length;
        let t=this.afOnset+rr*.52,k=0;while(t<end){this.ventricular(t,'afConducted');t+=rr*intervals[k++%intervals.length]/mean;}
        return;
      }
      for(let i=-2,t=start-2*rr;t<end;i++,t+=rr){
        if(id==='vf'&&t+174>=this.vfOnset)continue;
        let pr=174,block='';
        if(id==='av1')pr=260;
        if(id==='mobitz1'){pr=[180,230,270,null][((i%4)+4)%4];block=pr===null?'av':'';}
        if(id==='mobitz2'){pr=((i%3)+3)%3===2?null:180;block=pr===null?'his':'';}
        if(id==='av21'){pr=Math.abs(i%2)===1?null:180;block=pr===null?this.blockLevel:'';}
        if(id==='advanced'){pr=((i%3)+3)%3===0?180:null;block=pr===null?'his':'';}
        if(id.startsWith('complete')){pr=null;block=id==='completeJ'?'av':'his';}
        if(id==='pvc'&&((i%3)+3)%3===1){pr=null;block='refractory';}
        this.atrial(t,'sinus',pr,block);
        if(id==='pvc'&&((i%3)+3)%3===0)this.ventricular(t+174+this.coupling,'pvc');
      }
      if(id.startsWith('complete')){const isV=id==='completeV',interval=60000/(isV?30:42);for(let t=540-interval;t<end;t+=interval)this.ventricular(t,isV?'escapeV':'escapeJ');}
    }
    vectorAt(t){const v=[0,0,0];
      if(t>=this.vfOnset){const x=t/1000,amp=.40+.12*Math.sin(x*2.31)+.07*Math.sin(x*5.2);
        v[0]=amp*(Math.sin(TAU*(5.1*x+.12*Math.sin(x*1.1)))+.42*Math.sin(TAU*8.13*x+.4));
        v[1]=amp*(.85*Math.sin(TAU*(6.23*x+.2*Math.sin(x*.7))+1.1)+.31*Math.sin(TAU*9.37*x));
        v[2]=amp*(.73*Math.sin(TAU*5.77*x+.9)+.35*Math.sin(TAU*7.71*x+2));return v;
      }
      for(const a of this.atria){const d=t-a.time;if(d<0||d>110)continue;const p=gauss(d,44,18)-gauss(0,44,18);const env=Math.sin(Math.PI*d/110);const k=Math.max(0,p)*Math.max(0,env);
        if(a.kind==='retrograde')add(v,[-.10,.15,-.025],k);
        else if(a.kind==='escapeA')add(v,[.02,.13,-.04],k);
        else if(a.kind==='pac')add(v,[.03,-.20,-.08],k);
        else {add(v,[.11,-.13,.045],k);add(v,[.02,-.02,-.055],gauss(d,78,13)*Math.sin(Math.PI*d/110));}
      }
      for(const b of this.ventricles){const d=t-b.time;if(d<0||d>510)continue;
        if(b.qrs>120){
          if(d<=160){const env=Math.sin(Math.PI*d/160);add(v,[.87,-1.04,-.62],gauss(d,65,23)*env);add(v,[.33,-.40,-.25],gauss(d,113,18)*env);}
          add(v,[-.27,.30,.17],gauss(d,340,45));
        }else{
          if(d<=90){const env=Math.sin(Math.PI*d/90);add(v,[-.20,-.045,.20],gauss(d,13,5)*env);add(v,[1.12,-.99,-.54],gauss(d,34,7.5)*env);add(v,[-.25,.20,-.14],gauss(d,64,9)*env);}
          const tp=clamp(270*Math.sqrt(this.rr/800),232,300);add(v,[.27,-.24,-.08],gauss(d,tp,42));
        }
      }
      if(t>=this.afOnset){const x=(t-this.afOnset)/1000;const env=Math.min(1,x/.12);v[0]+=env*(.025*Math.sin(TAU*6.71*x)+.015*Math.sin(TAU*10.37*x));v[1]+=env*(.025*Math.sin(TAU*7.37*x+1)+.014*Math.sin(TAU*11.13*x));v[2]+=env*(.070*Math.sin(TAU*6.17*x+.6)+.030*Math.sin(TAU*9.71*x+1));}
      return v;
    }
    project(v,lead){const d=leads[lead]||leads.II;return v[0]*d[0]+v[1]*d[1]+v[2]*d[2];}
    ecg(t,lead){return this.project(this.vectorAt(t),lead);}
    allLeads(t){const v=this.vectorAt(t);return Object.fromEntries(leadNames.map(k=>[k,this.project(v,k)]));}
    abnormalAt(t){if(t>=this.afOnset||t>=this.vfOnset)return true;return this.atria.some(a=>a.kind!=='sinus'&&t>=a.time&&t<a.time+120)||this.ventricles.some(v=>(v.kind==='pvc'||v.kind.startsWith('escape')||v.kind==='conducted')&&t>=v.time&&t<v.time+490);}
    frameAt(t){
      const latest=(a,limit)=>{let v=null;for(const q of a){if(q.time<=limit)v=q;else break;}return v;};
      const a=latest(this.atria,t),v=latest(this.ventricles,t+22),lastV=latest(this.ventricles,t);
      const aa=a?t-a.time:9999,va=v?t-v.time:9999,af=t>=this.afOnset,vf=t>=this.vfOnset;
      const am=af?2:a&&a.kind!=='sinus'?1:0,vm=vf?2:v&&v.qrs>120?1:0;
      const block=!!a?.block&&aa>=(a.block==='his'?152:60)&&aa<Math.min(this.rr,400)&&a.block!=='refractory';
      const pvTrigger=t>=this.pvOnset&&t<this.pvOnset+1000;
      const redA=am>0,redV=vm>0||v?.kind==='escapeJ'||v?.kind==='conducted';
      let title='舒张间期 · 等待下一次激动',stage=-1;
      if(aa<100){title=am===1?(a.kind==='retrograde'?'交界性激动逆传心房':'异位心房激动'):'窦房结 → 心房去极化';stage=am===0?1:-1;}
      if(a?.conducted&&aa>=60&&aa<a.pr-22){title='房室传导延迟 · PR '+a.pr+' ms';stage=2;}
      if(a?.block==='his'&&aa>=60&&aa<152){title='房室结内传导 · 进入 His 束';stage=2;}
      if(block){title=(a.block==='his'?'His–浦肯野':'房室结')+'阻滞 · 本次 P 波未下传';stage=2;}
      if(va>=-22&&va<0&&vm===0){title='His 束下传';stage=3;}
      if(va>=0&&va<90){title=vm===1?'异位心室激动 · 宽 QRS':v?.kind==='escapeJ'?'交界性逸搏下传':va<26?'左 / 右束支下传':'浦肯野 → 心室去极化';stage=vm===1?-1:va<26?4:5;}
      if(va>=190&&va<430&&!block&&aa>110){title='心室复极 · T 波';stage=-1;}
      if(af){title=va>=0&&va<90?'房颤 · 房室结不规则下传':'房颤 · 心房紊乱激动';stage=-1;}
      if(pvTrigger&&!af){title='肺静脉触发 · 向左房传播';stage=-1;}
      if(vf){title='室颤 · 心室多波前紊乱激动';stage=-1;}
      return {time:t,a,v,lastV,atrialAge:aa,ventAge:va,atrialClock:aa,ventClock:174+va,atrialMode:am,ventMode:vm,redA,redV,af,vf,pvTrigger,block,blockLevel:a?.block||'',title,stage,vector:this.vectorAt(t)};
    }
    ratesAt(t){let atrial=this.bpm,vent=this.bpm,note='规则';const id=this.id;
      if(id.startsWith('escape')&&t>240+this.rr+800){vent=id==='escapeV'?30:50;atrial=id==='escapeA'?50:id==='escapeJ'?'逆传':'停搏';note='逸搏';}
      if(id==='mobitz1')vent=this.bpm*.75;
      if(id==='mobitz2')vent=this.bpm*2/3;
      if(id==='av21')vent=this.bpm/2;
      if(id==='advanced')vent=this.bpm/3;
      if(id==='completeJ')vent=42;if(id==='completeV')vent=30;
      if(id==='pac'){vent=this.ventricles.length>1?60000*(this.ventricles.length-1)/(this.ventricles.at(-1).time-this.ventricles[0].time):this.bpm;note='平均 · 含房早';}
      if(id==='pvc')note='平均 · 含室早';
      if(t>=this.afOnset){atrial='紊乱';const beats=this.ventricles.filter(v=>v.time>=this.afOnset&&v.time<this.duration);vent=beats.length>1?60000*(beats.length-1)/(beats[beats.length-1].time-beats[0].time):this.bpm;note='平均心室率 · RR 不齐';}
      if(t>=this.vfOnset){atrial='不可判读';vent='—';note='无有组织心室率';}
      return {atrial,vent:typeof vent==='number'?Math.round(vent):vent,note};
    }
    firstFocusTime(){if(this.id==='pvc')return this.ventricles.find(v=>v.kind==='pvc'&&v.time>0)?.time||0;if(this.id==='af')return this.pvOnset;if(this.id==='vf')return this.vfOnset;if(this.id==='escapeJ'||this.id==='escapeV')return this.ventricles[2].time;if(this.id.startsWith('complete'))return this.ventricles.find(v=>v.time>500).time;return this.atria.find(a=>(a.block||a.kind!=='sinus')&&a.time>0)?.time||240;}
  }
  const api={Engine,rhythms,leads,leadNames,clamp};
  if(typeof module==='object'&&module.exports)module.exports=api;else global.HeartRhythm=api;
})(typeof window==='undefined'?globalThis:window);
