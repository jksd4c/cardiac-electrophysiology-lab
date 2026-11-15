/* SPDX-License-Identifier: GPL-3.0-only · Copyright (C) 2026 jksd4c */
(function () {
  'use strict';
  const C = window.MembraneCore, Lab = window.HeartLab, T = window.THREE;
  const $ = id => document.getElementById(id), tr = s => window.HeartI18n?.t(s) ?? s;
  let enabled = true, picking = false, probe = null, marker = null, loop = null, cycle = null, cachedEngine = null;
  let probeId = 0, traceKey = '', traceData = null, traceBase = document.createElement('canvas'), dragging = null, wasAsynchronous=false;
  const layers = [], names = {RA:'右心房', LA:'左心房', VENT:'心室肌壁', RV:'右室内膜面', LV:'左室内膜面'};
  const write = (id, s) => { const e = $(id), text = tr(s); if (e && e.textContent !== String(text)) e.textContent = text; };
  const entries = `膜电位观察|Membrane potential
膜电位着色|Voltage map
标记点|Place probe
清除点|Clear probe
膜电位 / mV|Membrane potential / mV
已复极 → 去极化|Repolarized → Depolarized
着色已关闭|Voltage map off
右键心肌表面，放置观察点|Right-click the myocardium to place a probe
局部动作电位 · mV|Local action potential · mV
当前膜电位|Membrane potential
动作电位阶段|AP phase
复极进度|Repolarization
快速去极|Upstroke
早期复极|Early repolarization
平台期|Plateau
快速复极|Rapid repolarization
静息期|Resting
定位动作电位阶段|Jump to action-potential phase
选点动作电位，拖动定位，方向键按一毫秒移动|Probe action potential: drag to seek; arrow keys step by 1 ms
右键单击选点；右键拖动仍可平移。也可先点“标记点”，再单击心肌。|Right-click to sample; right-drag to pan. Or choose Place probe, then click the myocardium.
膜电位模型与参考|Model and references
色标表示跨膜电位，曲线为心房／心室工作心肌的 0–4 期教学近似；血管与结区不套用该曲线。相同电位可处于不同阶段，以阶段读数区分。复极进度按峰值至静息电位计算，不等同于不应期或兴奋性。|Colors encode transmembrane voltage. The trace approximates phases 0–4 of working atrial/ventricular myocardium; vessels and nodal tissue are excluded. The same voltage may occur in different phases. Repolarization is normalized from peak to resting voltage, not refractoriness or excitability.
激动顺序沿用传导模型，动作电位时程按部位与周期作简化调整。房颤／室颤为局部非同步示意；无组织心室节律使用观察窗，不定义统一心动周期。该着色不是患者电位测量或离子电流求解。|Activation follows the conduction model; AP duration varies schematically with location and cycle length. AF/VF use local asynchronous patterns. Disorganized ventricular rhythms use an observation window rather than a global cardiac cycle. These are neither measured patient voltages nor ionic-current solutions.
单搏精细观察|Single-beat inspection
当前 V–V 周期|Current V–V cycle
观察窗 · 无统一周期|Observation window · no global cycle
上一搏|Previous beat
下一搏|Next beat
上一窗|Previous window
下一窗|Next window
循环本搏|Loop beat
循环观察窗|Loop window
暂停|Pause
定位当前心动周期，精度一毫秒|Seek within this cardiac cycle, 1 ms precision
前移一毫秒|Back 1 ms
后移一毫秒|Forward 1 ms
额面向量|Frontal vector
近零向量|Near-zero vector
象限边界|On an axis
左下|Left-inferior
右下|Right-inferior
右上|Right-superior
左上|Left-superior
去极中|Depolarizing
请单击心肌表面；Esc 取消选点。|Click the myocardium; Esc cancels probe placement.
请选择心房或心室肌壁；血管不显示工作心肌动作电位。|Choose an atrial or ventricular wall. Vessels have no working-myocyte action-potential trace.
已清除观察点。|Probe cleared.
当前窗口未经过此阶段，可切换相邻周期。|This phase is absent from the current window. Try an adjacent cycle.
拖动曲线或上方单搏时间条，逐毫秒观察。|Drag the trace or the single-beat timeline to inspect millisecond by millisecond.
局部非同步电活动 · 无全心统一分期|Local asynchronous activity · no global phase
心肌表面观察点|Myocardial surface probe
患者方位|Patient coordinates
前|Anterior
后|Posterior
左|Left
右|Right
上|Superior
下|Inferior
局部激动后|Since local activation
尚未激动|Before local activation
先在主模型上右键选点|Right-click a point on the main heart model
本周期相对时间 / ms|Time within this cycle / ms
心室肌壁|Ventricular wall
右心房|Right atrium
左心房|Left atrium
右室内膜面|RV endocardium
左室内膜面|LV endocardium`;
  window.HeartI18n?.add(entries.split('\n').map(s => s.split('|')));
  const cycleHost = document.createElement('section');
  cycleHost.className = 'mp-cycle'; cycleHost.setAttribute('aria-label', '单搏精细观察');
  cycleHost.innerHTML = `<div class="mp-cycle-heading"><strong id="mp-cycle-title">当前 V–V 周期</strong><span id="mp-cycle-value"></span><span class="mp-cycle-meta" id="mp-axis"></span><div class="mp-cycle-controls"><button id="mp-prev">上一搏</button><button id="mp-loop" aria-pressed="false">循环本搏</button><button id="mp-next">下一搏</button><span class="mp-cycle-fine"><button id="mp-minus" aria-label="前移一毫秒">−1 ms</button><button id="mp-plus" aria-label="后移一毫秒">+1 ms</button></span></div></div><div class="mp-cycle-range"><span>0 ms</span><input id="mp-scrub" type="range" min="0" max="799" step="1" value="0" aria-label="定位当前心动周期，精度一毫秒"><span id="mp-cycle-duration">800 ms</span></div>`;
  document.querySelector('.sticky-controls').append(cycleHost);
  $('mp-gradient').style.background = `linear-gradient(90deg,${C.palette.join(',')})`;
  document.querySelector('.model-help').textContent = '拖动旋转 · 滚轮缩放 · 右键心肌选点 · Shift 拖动平移';
  window.HeartI18n?.add([['拖动旋转 · 滚轮缩放 · 右键心肌选点 · Shift 拖动平移','Drag to rotate · Scroll to zoom · Right-click to sample · Shift-drag to pan']]);
  window.addEventListener('heart-language-change', () => { traceKey = ''; });

  function uniforms() { return {mpOn:{value:1}, mpAtrial:{value:0}, mpDuration:{value:285}, mpPeriod:{value:800}}; }
  function fragment(source) {
    const colors = C.palette.map(h => { const c = new T.Color(h); return `vec3(${c.r.toFixed(6)},${c.g.toFixed(6)},${c.b.toFixed(6)})`; });
    const helpers = `uniform float mpOn;uniform float mpAtrial;uniform float mpDuration;uniform float mpPeriod;
      float mpVoltage(float age,float duration){float u=age/duration;if(u<0.||u>=1.)return -90.;if(u<.01)return -90.+120.*smoothstep(0.,.01,u);if(u<.055)return 30.-22.*smoothstep(.01,.055,u);if(u<.64)return 8.-14.*(u-.055)/.585;return -6.-84.*smoothstep(.64,1.,u);}
      vec3 mpColor(float voltage){float f=clamp((voltage+90.)/120.,0.,1.)*5.;${colors.slice(0,-1).map((v,i)=>`if(f<=${i+1}.)return mix(${v},${colors[i+1]},f-${i}.);`).join('')}return ${colors[5]};}
    `;
    const mapping = `if(mpOn>.5&&kind<1.5){
      float ma=dt; if(preexcited>.5)ma=max(ma,age-length(p-focus)*110.);
      float variation=mpAtrial>.5?8.*p.x:16.*(p.y+.8)-9.*p.z+(kind>.5?16.:0.);
      float duration=clamp(mpDuration+variation,80.,mpPeriod*.86);
      if(mode>1.5&&mode<2.5){float period=(mpAtrial>.5?155.:185.)+24.*sin(p.x*3.+p.z*4.);ma=mod(globalTime+p.x*91.+p.y*67.+p.z*121.+17.*sin(globalTime*.007+p.y*4.),period);duration=period;}
      if(mode>2.5)ma=mod(globalTime-(atan(p.z,p.x+.3)/6.28318530718+.5)*mpPeriod,mpPeriod);
      vec3 mapped=mpColor(mpVoltage(ma,duration));col=mapped*(.64+.36*diffuse)+vec3(.15,.19,.21)*key+mapped*rim*.12;
      a=clamp(opacity*1.55,.28,.90)*(.82+.18*rim);if(kind>.5)a*=.65;if(back>.5){col*=.72;a*=.22;}col=mix(col,vec3(.7,1.,.95),selected*.12);
    }`;
    return source.replace('void main(){float section=', helpers + 'void main(){float section=').replace('gl_FragColor=vec4(col,clamp(a,0.,.85));', mapping + '\n gl_FragColor=vec4(col,clamp(a,0.,.92));');
  }
  function register(layer) { layers.push(layer); }
  function attach(heart, depthFade) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
    const x = canvas.getContext('2d'); x.strokeStyle = '#06131d'; x.lineWidth = 11; x.beginPath(); x.arc(32,32,18,0,Math.PI*2); x.stroke();
    x.strokeStyle = '#fff'; x.lineWidth = 5; x.stroke(); x.fillStyle = '#fff'; x.beginPath(); x.arc(32,32,4,0,Math.PI*2); x.fill();
    marker = new T.Sprite(depthFade(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),transparent:true,depthTest:false,depthWrite:false})));
    marker.scale.setScalar(.14); marker.renderOrder = 11; marker.visible = false; heart.add(marker);
  }
  function setPicking(value) { picking=value; $('mp-pick').setAttribute('aria-pressed',String(value)); $('scene-wrap').dataset.membranePicking=String(value); }
  function select(value) {
    if (!value || !names[value.key]) { write('mp-status','请选择心房或心室肌壁；血管不显示工作心肌动作电位。'); return; }
    probe={...value,id:++probeId}; traceKey=''; setPicking(false);
    if (marker) { marker.position.set(...probe.position); marker.visible=true; }
    $('mp-clear').disabled=false; write('mp-status','拖动曲线或上方单搏时间条，逐毫秒观察。');
    window.heartViewer?.render();
  }
  function clear() { probe=null; traceKey=''; traceData=null; if(marker)marker.visible=false; $('mp-clear').disabled=true; write('mp-status','已清除观察点。'); }
  function prepare(frame) {
    if (cachedEngine!==Lab.engine) { cachedEngine=Lab.engine; loop=null; traceKey=''; }
    cycle=loop||C.cycleAt(Lab.engine,frame.time);
    for(const layer of layers){const atrial=layer.key==='RA'||layer.key==='LA', p=C.parameters(Lab.engine,frame,atrial);for(const m of layer.mats){const u=m.uniforms;u.mpOn.value=enabled&&!layer.vessel?1:0;u.mpAtrial.value=atrial?1:0;u.mpDuration.value=p.duration;u.mpPeriod.value=p.period;}}
  }
  function onSeek(time) { if(loop&&(time<loop.start||time>=loop.end))loop=null; }
  function advance(time, delta) { return C.advance(time,delta,loop); }
  function seekOffset(value) { const c=dragging?.cycle||cycle||C.cycleAt(Lab.engine,Lab.state.time); Lab.seek(C.cycleSeek(c,Number(value))); }
  function adjacent(direction) { const c=cycle||C.cycleAt(Lab.engine,Lab.state.time);loop=null;Lab.seek(direction<0?Math.max(0,c.start-1):Math.min(11999,c.end)); }
  function jumpPhase(phase) {
    if(!probe||!cycle)return;
    let start=null,end=null;
    for(let t=cycle.start;t<cycle.end;t++){if(C.sample(probe,Lab.engine,t).phase===phase){if(start===null)start=t;end=t;}else if(start!==null)break;}
    if(start===null){write('mp-status','当前窗口未经过此阶段，可切换相邻周期。');return;}
    Lab.seek(Math.floor((start+end)/2));
  }
  $('mp-toggle').onchange=e=>{enabled=e.target.checked;$('membrane-panel').classList.toggle('mp-off',!enabled);window.heartViewer?.render();};
  $('mp-pick').onclick=()=>{setPicking(!picking);write('mp-status',picking?'请单击心肌表面；Esc 取消选点。':'右键单击选点；右键拖动仍可平移。也可先点“标记点”，再单击心肌。');};
  $('mp-clear').onclick=()=>{clear();window.heartViewer?.render();};
  $('mp-prev').onclick=()=>adjacent(-1);$('mp-next').onclick=()=>adjacent(1);
  $('mp-minus').onclick=()=>seekOffset(Lab.state.time-cycle.start-1);$('mp-plus').onclick=()=>seekOffset(Lab.state.time-cycle.start+1);
  $('mp-loop').onclick=()=>{loop=loop?null:{...cycle};if(loop)Lab.state.running=true;Lab.playUI();window.heartViewer?.render();};
  $('mp-scrub').oninput=e=>seekOffset(e.target.value);
  document.querySelectorAll('[data-mp-phase]').forEach(b=>b.onclick=()=>jumpPhase(Number(b.dataset.mpPhase)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setPicking(false);});
  const chart=$('mp-trace');
  function chartMove(e){if(!dragging||dragging.id!==e.pointerId)return;const r=chart.getBoundingClientRect(),f=C.clamp((e.clientX-r.left-42)/(r.width-54),0,1);seekOffset(f*(dragging.cycle.end-dragging.cycle.start-1));}
  chart.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();dragging={id:e.pointerId,cycle:{...cycle}};chart.setPointerCapture(e.pointerId);chartMove(e);});
  chart.addEventListener('pointermove',chartMove);
  for(const type of ['pointerup','pointercancel','lostpointercapture'])chart.addEventListener(type,()=>{dragging=null;});
  chart.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const offset=e.key==='Home'?0:e.key==='End'?cycle.end-cycle.start-1:Lab.state.time-cycle.start+(e.key==='ArrowLeft'?-1:1)*(e.shiftKey?10:1);seekOffset(offset);}});

  function trace(frame,current){
    const fit=Lab.fit(chart);if(!fit)return;const {x,w,h,d}=fit,left=42,right=w-12,top=22,bottom=h-25;
    const sx=t=>left+(t-cycle.start)/(cycle.end-cycle.start)*(right-left),sy=v=>bottom-(v+100)/140*(bottom-top);
    const key=[probe?.id,cycle.start,cycle.end,w,h,d,window.HeartI18n?.language,Lab.state.rhythm].join(':');
    if(key!==traceKey){
      traceKey=key;traceBase.width=chart.width;traceBase.height=chart.height;const b=traceBase.getContext('2d');b.setTransform(d,0,0,d,0,0);b.fillStyle='#071525';b.fillRect(0,0,w,h);b.font='9px Segoe UI';b.textAlign='right';b.lineWidth=.6;
      for(const v of [-90,-60,-30,0,30]){const yy=sy(v);b.strokeStyle=v===0?'#54728a70':'#31506a55';b.beginPath();b.moveTo(left,yy);b.lineTo(right,yy);b.stroke();b.fillStyle='#7f9fb9';b.fillText(v>0?'+'+v:String(v),left-7,yy+3);}
      b.textAlign='center';const duration=cycle.end-cycle.start,tick=duration>1200?200:duration>600?100:50;
      for(let ms=0;ms<duration;ms+=tick){const xx=sx(cycle.start+ms);b.strokeStyle='#31506a44';b.beginPath();b.moveTo(xx,top);b.lineTo(xx,bottom);b.stroke();b.fillStyle='#7697b1';b.fillText(String(ms),xx,h-10);}
      b.textAlign='left';b.fillStyle='#91aec4';b.fillText('mV',9,13);b.textAlign='right';b.fillText('ms',w-6,h-10);
      traceData=[];
      if(probe){
        // Include every millisecond, even when a fast phase is narrower than a pixel.
        for(let t=cycle.start;t<cycle.end;t++){traceData.push({time:t,...C.sample(probe,Lab.engine,t)});}
        b.lineWidth=1.8;b.lineJoin='round';b.lineCap='round';
        for(let i=1;i<traceData.length;i++){const a=traceData[i-1],v=traceData[i];b.strokeStyle=C.color((a.voltage+v.voltage)/2);b.beginPath();b.moveTo(sx(a.time),sy(a.voltage));b.lineTo(sx(v.time),sy(v.voltage));b.stroke();}
        let section=0;
        for(let i=1;i<=traceData.length;i++){if(i<traceData.length&&traceData[i].phase===traceData[section].phase)continue;const a=sx(traceData[section].time),z=sx(traceData[i-1].time),ph=traceData[section].phase;b.fillStyle=['#ff775d','#ffbb79','#e4dc84','#72cfcc','#5777d8'][ph];b.globalAlpha=.45;b.fillRect(a,top-9,Math.max(1,z-a),2);b.globalAlpha=1;if(z-a>16){b.textAlign='center';b.font='9px Segoe UI';b.fillText(String(ph),(a+z)/2,top-12);}section=i;}
      }else{b.textAlign='center';b.fillStyle='#a2bdd0';b.font='11px Segoe UI';b.fillText(tr('先在主模型上右键选点'),w/2,h*.47);}
    }
    x.clearRect(0,0,w,h);x.drawImage(traceBase,0,0,w,h);
    const cx=sx(frame.time);x.lineWidth=1;x.strokeStyle='#e0f7eeaa';x.setLineDash([3,3]);x.beginPath();x.moveTo(cx,top-3);x.lineTo(cx,bottom);x.stroke();x.setLineDash([]);
    if(current){x.fillStyle=C.color(current.voltage);x.strokeStyle='#fff';x.lineWidth=1.5;x.beginPath();x.arc(cx,sy(current.voltage),3.6,0,Math.PI*2);x.fill();x.stroke();}
  }
  function draw(frame){
    if(!cycle)return;
    const length=cycle.end-cycle.start,offset=frame.time-cycle.start;
    write('mp-cycle-title',cycle.organized?'当前 V–V 周期':'观察窗 · 无统一周期');
    write('mp-cycle-value',Math.floor(offset)+' / '+length+' ms');write('mp-cycle-duration',length+' ms');
    $('mp-scrub').max=length-1;$('mp-scrub').value=Math.floor(offset);$('mp-scrub').setAttribute('aria-valuetext',Math.floor(offset)+' / '+length+' ms');
    $('mp-loop').setAttribute('aria-pressed',String(!!loop));write('mp-loop',cycle.organized?'循环本搏':'循环观察窗');
    $('mp-prev').disabled=cycle.start<=0;$('mp-next').disabled=cycle.end>=12000;
    write('mp-prev',cycle.organized?'上一搏':'上一窗');write('mp-next',cycle.organized?'下一搏':'下一窗');
    const q=C.quadrant(frame.vector);write('mp-axis',tr('额面向量')+' · '+(q.angle===null?tr(q.label):(q.angle>=0?'+':'')+q.angle.toFixed(0)+'° · '+(q.number?'Q'+q.number+' ':'')+tr(q.label)));
    const value=probe?C.sample(probe,Lab.engine,frame.time):null;
    write('mp-scale-state',enabled?'已复极 → 去极化':'着色已关闭');
    write('mp-probe-name',probe?'P1 · '+tr(names[probe.key]):'右键心肌表面，放置观察点');
    write('mp-voltage',value?(value.voltage>0?'+':'')+value.voltage.toFixed(1)+' mV':'— mV');
    write('mp-phase',value?value.phase+' · '+tr(C.phases[value.phase]):'—');
    write('mp-recovery',value?value.recovery===null?'去极中':Math.round(value.recovery*100)+'%':'—');
    $('mp-color-cursor').hidden=!value;if(value)$('mp-color-cursor').style.left=C.clamp((value.voltage+90)/120*100,0,100)+'%';
    for(const b of document.querySelectorAll('[data-mp-phase]')){b.disabled=!probe;b.setAttribute('aria-pressed',String(!!value&&value.phase===Number(b.dataset.mpPhase)));}
    if(probe){const p=probe.position;write('mp-position',tr('患者方位')+' · '+tr(p[0]>0?'左':'右')+' / '+tr(p[2]>0?'前':'后')+' · '+p.map(v=>v.toFixed(2)).join(', ')+' · '+(value.age<0?tr('尚未激动'):tr('局部激动后')+' '+Math.round(value.age)+' ms'));
      if(value.asynchronous)write('mp-status','局部非同步电活动 · 无全心统一分期');
    }else write('mp-position','');
    if(wasAsynchronous&&!value?.asynchronous)write('mp-status','拖动曲线或上方单搏时间条，逐毫秒观察。');wasAsynchronous=!!value?.asynchronous;
    $('membrane-panel').dataset.phase=value?String(value.phase):'none';$('membrane-panel').dataset.voltage=value?value.voltage.toFixed(3):'';
    trace(frame,value);
  }
  window.HeartMembrane={uniforms,fragment,register,attach,select,prepare,draw,advance,onSeek,get picking(){return picking;}};
  Lab.state.running=false;Lab.state.time=414;Lab.playUI();
})();
