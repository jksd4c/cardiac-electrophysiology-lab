/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
(function(){
 'use strict';
 const $=id=>document.getElementById(id), H=window.HeartRhythm;
 const state={running:!matchMedia('(prefers-reduced-motion: reduce)').matches,auto:false,cut:false,opacity:.46,speed:.5,time:0,yaw:-.10,pitch:.02,zoom:1,panX:0,panY:0,selected:null,labelMode:'conduction',rhythm:'sinus',bpm:75,lead:'II',detail:'none',depthMode:'spatial',context:'basic',rhythmRate:null,windowMs:4000,stripWindowMs:4000,stripStart:null,substrate:'normal',coupling:495,blockLevel:'av',pvFocus:'LSPV'};
 let engine=new H.Engine({bpm:state.bpm}),cacheVersion=0,stripRange=[0,4000],ecgDrag=null;
 const tr=s=>window.HeartI18n?.t(s)??s;
 const text=(id,s)=>{s=tr(s);const e=$(id);if(e&&e.textContent!==String(s))e.textContent=s;};
 const groups={};for(const group of H.groupOrder){const g=document.createElement('optgroup');g.label=group;$('rhythm').append(g);groups[group]=g;}for(const [id,r] of Object.entries(H.rhythms)){if(!groups[r.group]){const g=document.createElement('optgroup');g.label=r.group;$('rhythm').append(g);groups[r.group]=g;}const o=document.createElement('option');o.value=id;o.textContent=r.name;groups[r.group].append(o);}
 const order=['I','aVR','V1','II','aVL','V2','III','aVF','V3','V4','V5','V6'];
 const plots=[];
 for(const lead of order){const b=document.createElement('button');b.className='ecg-cell';b.setAttribute('aria-label','选择 '+lead+' 导联');b.setAttribute('aria-pressed',String(lead===state.lead));b.dataset.lead=lead;const name=document.createElement('span');name.textContent=lead;const c=document.createElement('canvas');c.setAttribute('aria-hidden','true');b.append(name,c);b.onclick=()=>setLead(lead);$('ecg-grid').append(b);plots.push({lead,canvas:c,button:b,base:document.createElement('canvas'),key:''});}
 const strip={canvas:$('lead-strip'),base:document.createElement('canvas'),key:''};
 for(const [id,r] of Object.entries(H.rhythms)){const b=document.createElement('button');b.textContent=r.name;b.dataset.search=(id+' '+r.name).toLowerCase();b.onclick=()=>{$('release-notice').open=false;$('reference-notice').open=false;configure({rhythm:id});window.scrollTo({top:0,behavior:'smooth'});};$('scope-list').append(b);}
 function fit(c){const r=c.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2),w=Math.round(r.width),h=Math.round(r.height);if(w<1||h<1)return null;if(c.width!==Math.round(w*d)||c.height!==Math.round(h*d)){c.width=Math.round(w*d);c.height=Math.round(h*d);}const x=c.getContext('2d');if(!x._heartI18n){const fill=x.fillText.bind(x);x.fillText=(s,...args)=>fill(tr(s),...args);x._heartI18n=true;}x.setTransform(d,0,0,d,0,0);return {x,w,h,d};}
 function playUI(){text('play',state.running?'暂停':'播放');$('play').setAttribute('aria-pressed',state.running);text('speed-label',state.speed+'×');}
 function seek(t,play=false){window.HeartMembrane?.onSeek(t);state.time=H.clamp(Math.round(t),0,11999);state.stripStart=null;state.running=play;playUI();window.heartViewer?.render();}
 function configure(update={}){
   const rhythmChanged=!!update.rhythm&&update.rhythm!==state.rhythm;if(rhythmChanged){state.context='basic';state.detail='none';state.rhythmRate=H.rhythms[update.rhythm].rate?.value??null;state.substrate=H.rhythms[update.rhythm].substrate||'normal';if(update.rhythm==='ront')state.coupling=280;}Object.assign(state,update);state.coupling=H.clamp(state.coupling,220,Math.min(600,60000/state.bpm*.85));
   engine=new H.Engine({rhythm:state.rhythm,bpm:state.bpm,coupling:state.coupling,blockLevel:state.blockLevel,rhythmRate:state.rhythmRate});Lab.engine=engine;state.time=0;cacheVersion++;Lab.local?.rebuild();
   $('rhythm').value=state.rhythm;$('substrate').value=state.substrate;state.stripStart=null;
   $('coupling').max=Math.floor(Math.min(600,engine.rr*.85));$('coupling').value=state.coupling;text('coupling-value',Math.round(state.coupling)+' ms');
   text('rhythm-ecg',engine.info.ecg);text('rhythm-mechanism',engine.info.mechanism);$('block-level-row').hidden=state.rhythm!=='av21';$('heart-app').dataset.rhythm=state.rhythm;
   syncDetails();scenarioUI();buildMarkers();playUI();window.heartViewer?.render();
 }
 function buildMarkers(){const host=$('event-markers');host.replaceChildren();if(engine.markers){for(const [t,label,red] of engine.markers){const b=document.createElement('button');b.textContent=label;b.classList.toggle('abnormal',!!red);b.onclick=()=>seek(t);host.append(b);}return;}let marks=[];const first=engine.atria.find(a=>a.time>=0&&a.conducted);
   if(state.rhythm==='sinus'||state.rhythm==='av1'){if(first)marks=[[first.time+30,'心房激动'],[first.time+115,'房室延迟'],[first.ventTime+35,'QRS'],[first.ventTime+270,'T 波']];}
   else if(state.rhythm==='af')marks=[[engine.pvOnset-250,'触发前'],[engine.pvOnset+35,'肺静脉触发',1],[engine.afOnset+1250,'房颤维持',1]];
   else if(state.rhythm==='vf')marks=[[engine.vfOnset-350,'室颤前'],[engine.vfOnset+250,'室颤波',1]];
   else if(state.rhythm==='pvc'){const p=engine.ventricles.find(v=>v.kind==='pvc'&&v.time>0);if(p)marks=[[p.time-state.coupling+260,'前搏 T 波'],[p.time+45,'室早 QRS',1],[p.time+400,'代偿间歇',1]];}
   else if(state.rhythm.startsWith('complete'))marks=[[640,'房室分离',1],[engine.ventricles.find(v=>v.time>1000).time+35,'独立逸搏',1]];
   else if(state.rhythm.startsWith('escape')){const ev=engine.ventricles.find(v=>v.time>240+engine.rr+400);marks=[[240+engine.rr+850,'窦性停顿'],[ev.time+35,'逸搏接管',1]];}
   else if(state.rhythm==='pac'){const a=engine.atria.find(a=>a.kind==='pac');marks=[[a.time+35,'提前 P′',1],[a.ventTime+35,'房早下传',1]];}
   else {const a=engine.atria.find(a=>a.block&&a.time>0);const prev=engine.atria.filter(x=>x.time<a.time&&x.time>0).slice(-3);marks=prev.map(x=>[x.time+Math.min(x.pr-30,140),'PR '+x.pr+' ms']);marks.push([a.time+(a.block==='his'?165:115),'P 未下传',1]);}
   for(const [t,label,red] of marks){const b=document.createElement('button');b.textContent=label;b.classList.toggle('abnormal',!!red);b.onclick=()=>seek(t);host.append(b);}
 }
 function setLead(lead){state.lead=lead;for(const p of plots)p.button.setAttribute('aria-pressed',p.lead===lead);text('selected-lead-label',lead);cacheVersion++;window.heartViewer?.render();}
 function allowedDetail(name){const r=H.rhythms[state.rhythm];if(name==='pv')return r.detail==='pv';if(name==='ventricle')return r.detail==='ventricle'||state.rhythm==='pvc'&&['ront','ischemia','scar'].includes(state.context);if(name==='circuit')return !!r.circuit;if(name==='morphology')return !!r.branch||!!r.pvcSite||['pacAberrant','rvot','fascVT','bbrVT','tdp','pmvt','wpw'].includes(state.rhythm);return name==='none';}
 function scenarioUI(){const r=H.rhythms[state.rhythm],setting=r.rate;const count=Object.keys(H.rhythms).length;text('catalog-count',count+' 个场景');$('rhythm-rate-row').hidden=!setting;if(setting){$('rhythm-rate').min=setting.min;$('rhythm-rate').max=setting.max;$('rhythm-rate').value=engine.rateSetting;text('rhythm-rate-label',setting.label);text('rhythm-rate-value',engine.rateSetting);}
   const source=H.sources[r.source]||H.sources.gold;$('scenario-source').href=source.url;text('scenario-source',source.name);text('scenario-chapter',r.chapter);
   document.querySelector('.detail-section').hidden=!['pv','ventricle','circuit','morphology'].some(allowedDetail);$('tab-circuit').hidden=!allowedDetail('circuit');$('tab-morphology').hidden=!allowedDetail('morphology');$('longqt-option').hidden=state.rhythm!=='tdp';$('coupling-row').hidden=!['pvc','ront'].includes(state.rhythm);$('ront-demo').hidden=!['pvc','ront'].includes(state.rhythm);window.HeartDetails?.reset();
 }
 function syncDetails(){
   $('tab-pv').hidden=!allowedDetail('pv');$('tab-ventricle').hidden=!allowedDetail('ventricle');$('pvc-context-row').hidden=state.rhythm!=='pvc';$('pvc-context').value=state.context;
   if(!allowedDetail(state.detail))state.detail='none';detail(state.detail,false);
 }
 function detail(name,toggle=true){if(!allowedDetail(name))name='none';if(toggle&&state.detail===name)name='none';state.detail=name;
   for(const b of document.querySelectorAll('[data-detail]'))b.setAttribute('aria-expanded',String(b.dataset.detail===name));
   $('panel-circuit').hidden=name!=='circuit';$('panel-morphology').hidden=name!=='morphology';$('panel-tissue').hidden=name!=='ventricle'&&name!=='pv';$('detail-close').hidden=name==='none';
   $('panel-tissue').setAttribute('aria-labelledby','tab-'+(name==='pv'?'pv':'ventricle'));$('ventricular-settings').hidden=name!=='ventricle';$('pv-settings').hidden=name!=='pv';$('atrium-credit').hidden=name!=='pv';Lab.local?.show(name);window.heartViewer?.render();
 }
 function waveformBase(plot,lead,start,end,large){const f=fit(plot.canvas);if(!f)return;const {w,h,d}=f,key=[cacheVersion,window.HeartI18n?.language,w,h,d,lead,start,end].join(':');if(key===plot.key)return f;plot.key=key;plot.base.width=plot.canvas.width;plot.base.height=plot.canvas.height;const x=plot.base.getContext('2d');x.setTransform(d,0,0,d,0,0);x.fillStyle='#fffdf9';x.fillRect(0,0,w,h);
   const left=large?22:5,right=4,pps=(w-left-right)/((end-start)/1000),gain=large?Math.min(58,h*.24):Math.min(h*.27,pps*.4),base=large?h*.5:h*.60;
   const smallX=pps*.04,smallY=gain*.1;x.lineWidth=.5;
   if(smallX>=2.1){x.strokeStyle='#e3b2bb44';x.beginPath();for(let xx=left;xx<w;xx+=smallX){x.moveTo(xx,0);x.lineTo(xx,h);}for(let yy=base%smallY;yy<h;yy+=smallY){x.moveTo(left,yy);x.lineTo(w,yy);}x.stroke();}
   x.strokeStyle='#cf97a35c';x.beginPath();for(let xx=left;xx<w;xx+=pps*.2){x.moveTo(xx,0);x.lineTo(xx,h);}for(let yy=base%(gain*.5);yy<h;yy+=gain*.5){x.moveTo(left,yy);x.lineTo(w,yy);}x.stroke();
   x.strokeStyle='#8195a444';x.beginPath();x.moveTo(left,base);x.lineTo(w,base);x.stroke();
   if(large){x.strokeStyle='#526674';x.lineWidth=1;x.beginPath();x.moveTo(3,base);x.lineTo(5,base);x.lineTo(5,base-gain);x.lineTo(16,base-gain);x.lineTo(16,base);x.lineTo(19,base);x.stroke();x.fillStyle='#697d89';x.font='9px Segoe UI';x.fillText('1 mV',3,13);const seconds=(end-start)/1000,tick=seconds<=1?.1:seconds<=3?.2:1;for(let s=Math.ceil(start/1000/tick)*tick;s<=end/1000;s+=tick){x.fillText(s.toFixed(tick<1?1:0)+' s',left+(s-start/1000)*pps+3,h-5);}}
   const step=(end-start)/Math.max(200,(w-left)*2);let was=null,started=false,lastX=left,lastY=base;x.lineWidth=large?1.5:1.05;x.lineJoin='round';x.lineCap='round';
   for(let t=start;t<=end+step/2;t+=step){const red=engine.abnormalAt(t),xx=left+(t-start)/1000*pps,yy=base-engine.ecg(t,lead)*gain;
     if(red!==was){if(started)x.stroke();x.beginPath();x.strokeStyle=red?'#bd2941':'#253d4c';x.moveTo(lastX,lastY);was=red;started=true;}x.lineTo(xx,yy);lastX=xx;lastY=yy;
   }x.stroke();plot.dim={left,right,pps,base,gain,start,end};return f;
 }
 function waveform(plot,lead,start,end,large,t){const f=waveformBase(plot,lead,start,end,large);if(!f)return;const {x,w,h}=f;x.clearRect(0,0,w,h);x.drawImage(plot.base,0,0,w,h);const d=plot.dim,cx=d.left+(t-start)/1000*d.pps;if(cx>=d.left&&cx<=w){x.strokeStyle='#087f89bb';x.lineWidth=1.1;x.beginPath();x.moveTo(cx,large?18:0);x.lineTo(cx,h);x.stroke();const val=engine.ecg(t,lead);x.fillStyle='#087f89';x.beginPath();x.arc(cx,d.base-val*d.gain,large?3:2,0,Math.PI*2);x.fill();if(large){x.beginPath();x.moveTo(cx-5,17);x.lineTo(cx+5,17);x.lineTo(cx,23);x.closePath();x.fill();x.font='10px Segoe UI';x.textAlign=cx>w-60?'right':'left';x.fillText((t/1000).toFixed(3)+' s',cx>w-60?cx-7:cx+7,13);x.textAlign='left';}}}
 function attachECGDrag(plot,lead){const c=plot.canvas;
   const move=e=>{if(!ecgDrag||ecgDrag.pointerId!==e.pointerId)return;const r=c.getBoundingClientRect();ecgDrag.moved=Math.max(ecgDrag.moved,Math.abs(e.clientX-ecgDrag.clientX));ecgDrag.edge=ecgDrag.moved>5?(e.clientX>r.right-12?1:e.clientX<r.left+12?-1:0):0;ecgDrag.lastX=e.clientX;const t=ecgDrag.anchor+(e.clientX-ecgDrag.clientX)*ecgDrag.msPerPx+ecgDrag.offset;state.stripStart=null;seek(t);};
   c.addEventListener('pointerdown',e=>{if(e.button!==0||!plot.dim)return;e.preventDefault();e.stopPropagation();const r=c.getBoundingClientRect(),d=plot.dim;ecgDrag={pointerId:e.pointerId,plot,clientX:e.clientX,lastX:e.clientX,anchor:d.start+(e.clientX-r.left-d.left)/d.pps*1000,msPerPx:1000/d.pps,offset:0,moved:0,edge:0};c.setPointerCapture(e.pointerId);c.classList.add('scrubbing');if(lead)setLead(lead);move(e);});
   c.addEventListener('pointermove',move);const end=e=>{if(ecgDrag?.pointerId!==e.pointerId)return;ecgDrag=null;c.classList.remove('scrubbing');if(c.hasPointerCapture(e.pointerId))c.releasePointerCapture(e.pointerId);};c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);c.addEventListener('lostpointercapture',end);c.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();});
 }
 function advanceECGDrag(dt){if(!ecgDrag?.edge)return;const span=ecgDrag.plot===strip?state.stripWindowMs:state.windowMs,delta=ecgDrag.edge*dt*span*.0007;ecgDrag.offset+=delta;state.time=H.clamp(ecgDrag.anchor+(ecgDrag.lastX-ecgDrag.clientX)*ecgDrag.msPerPx+ecgDrag.offset,0,11999);state.stripStart=null;}
 function intervalUI(t){const m=engine.intervalMetrics(t);for(const key of ['rr','pr','qrs','qt','qtcB','qtcF'])text('metric-'+key,m[key]===null?'—':Math.round(m[key])+' ms');text('interval-beat',m.beatTime===null?'':tr('上一搏')+' '+(m.beatTime/1000).toFixed(3)+' s');const copy={model:'QT 为合成 T 波切线估算；QTcB / QTcF 为两种校正示例。',noBeat:'等待可识别的心搏。',unorganized:'无可辨 QRS–T：不报告 QT / QTc。',irregular:'当前节律不规则或波形难以分界：QT / QTc 不报告。',wideQRS:'宽 QRS：保留 QT 估算，不套用常规 QTc；可结合 JT 理解。',unstable:'异位搏动或 RR 尚不稳定：QTc 暂不报告。',overlap:'T 波与后续激动重叠：QT / QTc 不报告。'};text('interval-note',copy[m.reason]);}
 function arrow(x,ax,ay,bx,by,color,width=1.5){const a=Math.atan2(by-ay,bx-ax),l=7;x.strokeStyle=color;x.fillStyle=color;x.lineWidth=width;x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.stroke();x.beginPath();x.moveTo(bx,by);x.lineTo(bx-l*Math.cos(a-.45),by-l*Math.sin(a-.45));x.lineTo(bx-l*Math.cos(a+.45),by-l*Math.sin(a+.45));x.closePath();x.fill();}
 function draw(frame){const t=frame.time;const {start,end}=H.ECGTools.windowFor(t,state.windowMs);stripRange=[start,end];text('ecg-window',(start/1000)+'–'+(end/1000)+' s');for(const p of plots)waveform(p,p.lead,start,end,false,t);const sw=H.ECGTools.windowFor(t,state.stripWindowMs);if(state.stripStart!==null&&!state.running&&!ecgDrag){sw.start=state.stripStart;sw.end=sw.start+state.stripWindowMs;}waveform(strip,state.lead,sw.start,sw.end,true,t);text('strip-zoom-label',(state.stripWindowMs/1000).toFixed(2)+' s · '+(sw.start/1000).toFixed(2)+'–'+(sw.end/1000).toFixed(2)+' s');intervalUI(t);
   const rates=engine.ratesAt(t);text('atrial-rate','心房 '+rates.atrial+(typeof rates.atrial==='number'?' 次/分':''));text('ventricular-rate','心室 '+rates.vent+(typeof rates.vent==='number'?' 次/分':''));text('rate-note',rates.note);text('phase-text',frame.title);text('time-label',(t/1000).toFixed(3));$('timeline-fill').style.width=t/120+'%';$('scrub').value=Math.floor(t);for(const b of document.querySelectorAll('[data-stage]'))b.classList.toggle('active',Number(b.dataset.stage)===frame.stage);$('heart-app').dataset.phase=frame.vf?'vf':frame.af?'af':frame.block?'block':frame.ventMode===1&&frame.ventAge<160?'ectopic':'organized';
   Lab.local?.draw(frame);window.HeartDetails?.draw(frame);
 }
 const Lab=window.HeartLab={state,engine,draw,configure,seek,detail,allowedDetail,setLead,playUI,fit,arrow,advanceECGDrag};
 $('rhythm').onchange=e=>{configure({rhythm:e.target.value});state.running=true;playUI();};
 
 $('restart').onclick=()=>seek(0,true);$('focus-event').onclick=()=>{if(engine.markers){seek(engine.markers[Math.min(1,engine.markers.length-1)][0]);return;}const offset=state.rhythm==='mobitz2'||state.rhythm==='advanced'||state.rhythm==='av21'&&state.blockLevel==='his'?165:state.rhythm.startsWith('av')||state.rhythm==='mobitz1'?120:35;seek(engine.firstFocusTime()+offset);};
 $('detail-close').onclick=()=>detail('none',false);$('depth-mode').onchange=e=>{state.depthMode=e.target.value;};
 $('block-level').onchange=e=>configure({blockLevel:e.target.value});
 $('substrate').onchange=e=>{state.substrate=e.target.value;Lab.local?.rebuild();};
 $('coupling').oninput=e=>{configure({rhythm:state.rhythm==='ront'?'ront':'pvc',coupling:Number(e.target.value)});seek(engine.firstFocusTime()+10);};
 $('ront-demo').onclick=()=>{configure({rhythm:'ront',coupling:280});detail('ventricle',false);seek(engine.firstFocusTime()-140,true);};
 $('pv-focus').onchange=e=>{state.pvFocus=e.target.value;Lab.local?.rebuild();};
 $('pv-demo').onclick=()=>{configure({rhythm:state.rhythm==='preAf'?'preAf':'af'});seek(engine.afOnset-400,true);};
 $('pvc-context').onchange=e=>{const context=e.target.value;configure({context,coupling:context==='ront'?280:Math.round(engine.rr*.62),substrate:context==='ischemia'?'ischemia':context==='scar'?'scar':'normal'});};
 $('rhythm-rate').oninput=e=>configure({rhythmRate:Number(e.target.value)});$('ecg-duration').onchange=e=>{state.windowMs=Number(e.target.value);state.stripWindowMs=state.windowMs;state.stripStart=null;cacheVersion++;};$('catalog-search').oninput=e=>{const q=e.target.value.trim().toLowerCase();for(const b of $('scope-list').children)b.hidden=!(b.dataset.search+' '+b.textContent.toLowerCase()).includes(q);};
 for(const p of plots)attachECGDrag(p,p.lead);attachECGDrag(strip,null);
 $('strip-zoom-reset').onclick=()=>{state.stripWindowMs=state.windowMs;state.stripStart=null;cacheVersion++;};
 $('lead-strip').addEventListener('wheel',e=>{e.preventDefault();if(!strip.dim)return;const r=e.currentTarget.getBoundingClientRect(),anchor=strip.dim.start+(e.clientX-r.left-strip.dim.left)/strip.dim.pps*1000,z=H.ECGTools.zoomWindow(strip.dim.start,state.stripWindowMs,anchor,e.deltaY);state.running=false;playUI();state.stripWindowMs=z.span;state.stripStart=z.start;cacheVersion++;},{passive:false});
 for(const [id,dir] of [['ecg-prev',-1],['ecg-next',1]])$(id).onclick=()=>{state.stripStart=null;seek(state.time+dir*state.stripWindowMs);};
 window.addEventListener('heart-language-change',()=>{cacheVersion++;buildMarkers();scenarioUI();setLead(state.lead);playUI();text('rhythm-ecg',engine.info.ecg);text('rhythm-mechanism',engine.info.mechanism);Lab.local?.rebuild();});
 $('lead-strip').onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();state.stripStart=null;seek(state.time+(e.key==='ArrowRight'?20:-20));}};
 document.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>detail(b.dataset.detail));
 window.addEventListener('resize',()=>{cacheVersion++;});
 configure();setLead('II');playUI();
})();
