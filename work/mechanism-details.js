/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
(function(){
'use strict';const Lab=window.HeartLab,H=window.HeartRhythm,S=Lab.state,$=id=>document.getElementById(id);let morphKey='',morphBase=document.createElement('canvas'),reference=null,metricsCache=new WeakMap();
function circuit(frame){const f=Lab.fit($('circuit-canvas'));if(!f)return;const {x,w,h}=f;x.clearRect(0,0,w,h);const r=H.rhythms[S.rhythm],type=r.circuit,phase=frame.circuitPhase||0;const pt=(a,b)=>[a*w,b*h];
 $('circuit-title').textContent=r.name;$('circuit-copy').textContent=r.mechanism;
 const node=(p,label,sub='')=>{x.fillStyle='#15374d';x.strokeStyle='#789fb2';x.lineWidth=1;x.beginPath();x.roundRect(p[0]-43,p[1]-20,86,40,7);x.fill();x.stroke();x.fillStyle='#d3e7ee';x.textAlign='center';x.font='11px Microsoft YaHei';x.fillText(label,p[0],p[1]+4);if(sub){x.font='9px Segoe UI';x.fillStyle='#90afc0';x.fillText(sub,p[0],p[1]+34);}x.textAlign='left';};
 const route=(points,{color='#cf586b',moving=true,p=phase,dash=false}={})=>{x.strokeStyle=color;x.lineWidth=2;x.setLineDash(dash?[4,5]:[]);x.beginPath();points.forEach((a,i)=>i?x.lineTo(...a):x.moveTo(...a));x.stroke();x.setLineDash([]);const n=points.length-1,m=Math.min(n-1,Math.floor(p*n)),u=p*n-m,a=points[m],b=points[m+1];if(moving&&frame.time>=Lab.engine.onset){x.fillStyle=['#d3bc75','#bdab6b','#cfb96f','#d5ba73'].includes(color)?'#ffe49b':'#ffb0b6';x.beginPath();x.arc(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,5,0,Math.PI*2);x.fill();}
   for(let i=0;i<n;i++){const a=points[i],b=points[i+1],cx=a[0]+.60*(b[0]-a[0]),cy=a[1]+.60*(b[1]-a[1]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]);x.fillStyle=color;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx-7*Math.cos(ang-.5),cy-7*Math.sin(ang-.5));x.lineTo(cx-7*Math.cos(ang+.5),cy-7*Math.sin(ang+.5));x.closePath();x.fill();}
 };
 const cross=p=>{x.strokeStyle='#ff6580';x.lineWidth=3;x.beginPath();x.moveTo(p[0]-6,p[1]-7);x.lineTo(p[0]+6,p[1]+7);x.moveTo(p[0]+6,p[1]-7);x.lineTo(p[0]-6,p[1]+7);x.stroke();};
 if(type==='avnrt'||type==='avnrtAtyp'){
  const top=pt(.5,.16),bottom=pt(.5,.70),slow=pt(.23,.42),fast=pt(.77,.42);let path=[top,slow,bottom,fast,top];if(type==='avnrtAtyp')path=path.reverse();route(path);route([bottom,pt(.5,.94)],{color:'#bdab6b',moving:false,dash:true});node(top,'上部连接区');node(bottom,'下部连接区');node(slow,'慢径');node(fast,'快径');x.fillStyle='#a4c4d4';x.textAlign='center';x.fillText('向 His–心室输出',w*.5,h*.97);x.textAlign='left';
 }else if(['avrt','avrtAnti','wpw','preAf'].includes(type)){
  const A=pt(.5,.14),AV=pt(.19,.40),His=pt(.20,.76),V=pt(.52,.86),AP=pt(.82,.46);let path=[A,AV,His,V,AP,A];if(type==='avrtAnti')path=path.reverse();if(type==='wpw'||type==='preAf'){route([A,AP,V]);route([A,AV,His,V],{color:'#d7bf76',p:(phase+.45)%1});}else route(path);node(A,'心房');node(AV,'房室结');node(His,'His–浦肯野');node(V,'心室');node(AP,'旁道');
 }else if(type==='branch'){
  const His=pt(.5,.16),R=pt(.17,.49),L=pt(.69,.36),AF=pt(.55,.70),PF=pt(.85,.70);const b=frame.branch||r.branch,blocked={rbbb:['RBB'],lbbb:['LBB','LAF','LPF'],lafb:['LAF'],lpfb:['LPF'],rbbLaf:['RBB','LAF'],rbbLpf:['RBB','LPF']}[b]||[];
  for(const [name,path]of [['RBB',[His,R]],['LBB',[His,L]],['LAF',[L,AF]],['LPF',[L,PF]]]){const stop=blocked.includes(name),distal=b==='lbbb'&&['LAF','LPF'].includes(name);route(path,{color:distal?'#6e7f8e':stop?'#cc5367':'#d3bc75',moving:!stop});if(stop&&!distal)cross(path[0].map((q,i)=>(q+path[1][i])/2));}
  const spread=(from,to,mid)=>route([from,mid,to],{color:'#db6980',dash:true,p:(phase+.55)%1});
  if(b==='lbbb'){const wall=pt(.74,.92);spread(R,wall,pt(.40,.87));node(wall,'左室心肌');}
  else if(b==='rbbb'){const wall=pt(.16,.87);spread(L,wall,pt(.40,.90));node(wall,'右室心肌');}
  else {if(['lafb','rbbLaf'].includes(b))spread(PF,AF,pt(.72,.90));if(['lpfb','rbbLpf'].includes(b))spread(AF,PF,pt(.70,.90));if(b.startsWith('rbb')){const wall=pt(.16,.87);spread(b==='rbbLaf'?PF:AF,wall,pt(.38,.89));node(wall,'右室心肌');}}
  node(His,'His');node(R,'RBB');node(L,'LBB');node(AF,'LAF');node(PF,'LPF');x.fillStyle='#92b2c3';x.fillText('虚线：经保留通路激动后，再经心肌传播',12,h-6);
 }else if(type==='sa'){
  const a=pt(.23,.40),b=pt(.70,.40);route([a,b],{color:frame.saBlocked?'#d06073':'#d5ba73',moving:!frame.saBlocked,p:Math.min(.99,(frame.saAge||0)/180)});node(a,'窦房结');node(b,'心房肌');if(frame.saBlocked)cross(pt(.47,.40));x.fillStyle='#a0bece';x.fillText('内部窦房冲动 ≠ 每次都能形成体表 P 波',w*.12,h*.75);
 }else{
  const cx=w*.44,cy=h*.49,rx=w*.26,ry=h*.30;let points=Array.from({length:29},(_,i)=>[cx+rx*Math.cos(i/28*Math.PI*2),cy+ry*Math.sin(i/28*Math.PI*2)]);
  route(points);x.fillStyle='#21445a';x.beginPath();x.ellipse(cx,cy,rx*.57,ry*.53,0,0,Math.PI*2);x.fill();x.fillStyle='#bad4e2';x.font='12px Microsoft YaHei';x.textAlign='center';x.fillText(({flutter:'三尖瓣环',mitral:'二尖瓣环',vt:'不可兴奋瘢痕',fasc:'分支–浦肯野',bbr:'室间隔'}[type]||'回路中心'),cx,cy+4);x.font='10px Microsoft YaHei';x.fillText(type==='flutter'?'下方通路：CTI':type==='vt'?'边缘通道：慢传导':type==='bbr'?'RBB 顺传 · LBB 逆传':'红色箭头：传播方向',cx,cy+ry+27);x.textAlign='left';
  if(type==='flutter'||type==='mitral'){route([[cx+rx,cy],pt(.88,.68),pt(.88,.9)],{color:'#cfb96f',p:(phase+.4)%1});node(pt(.88,.68),'房室结');x.fillStyle='#9bbdcb';x.fillText('滤过后下传',w*.80,h*.99);}
 }
}
function isolated(engine,b,d,lead){if(d<0||d>780)return 0;const q=engine.qrsVector(b,d),tv=engine.tVector(b,d);const total=q.map((v,i)=>v+tv[i]);if(/^V/.test(lead)&&H.chestProfiles[b.profile||b.branch||b.shape]||/^V/.test(lead)&&['rbbLaf','rbbLpf','lafb','lpfb'].includes(b.branch))return engine.isolatedBeat(b,d,lead);return engine.project(total,lead);}
function morphology(frame){const f=Lab.fit($('morphology-canvas'));if(!f)return;const {x,w,h,d}=f,b=frame.lastV;if(!b)return;if(!reference){reference=new H.Engine({rhythm:'sinus',bpm:S.bpm});}const rb={time:0,shape:'normal',qrs:90,waveRate:S.bpm};
 const key=[S.rhythm,b.time,b.shape,w,h,d,S.bpm,S.rhythmRate].join(':');let metrics=metricsCache.get(b);if(!metrics){metrics=Lab.engine.beatMetrics(b);metricsCache.set(b,metrics);}const label=b.kind==='normal'&&!b.red?'当前为窦性对照':'当前搏动';$('beat-metrics').textContent=label+' · QRS '+metrics.qrs+' ms（设定） · 合成额面轴 '+(metrics.axis>0?'+':'')+metrics.axis+'° · R/S '+metrics.transition;
 if(key!==morphKey){morphKey=key;morphBase.width=$('morphology-canvas').width;morphBase.height=$('morphology-canvas').height;const c=morphBase.getContext('2d');c.setTransform(d,0,0,d,0,0);c.fillStyle='#fffdf9';c.fillRect(0,0,w,h);const cols=w<620?2:3,rows=12/cols,cw=w/cols,ch=h/rows,order=['I','aVR','V1','II','aVL','V2','III','aVF','V3','V4','V5','V6'];
   for(let k=0;k<12;k++){const lead=order[k],left=k%cols*cw,top=Math.floor(k/cols)*ch,px=left+30,py=top+ch*.52,gain=ch*.28,scale=(cw-38)/560;c.save();c.beginPath();c.rect(left,top,cw,ch);c.clip();c.strokeStyle='#dcb7bf55';c.lineWidth=.5;c.beginPath();for(let ms=-40;ms<=520;ms+=40){c.moveTo(px+ms*scale,top);c.lineTo(px+ms*scale,top+ch);}for(let yy=top;yy<top+ch;yy+=gain*.2){c.moveTo(left,yy);c.lineTo(left+cw,yy);}c.stroke();c.fillStyle='#39556b';c.font='11px Segoe UI';c.fillText(lead,left+7,top+15);
     for(const [eng,beat,color]of [[reference,rb,'#738eab99'],[Lab.engine,b,'#be324b']]){c.beginPath();c.strokeStyle=color;c.lineWidth=eng===reference?1.2:1.55;for(let ms=-40;ms<=520;ms+=2){let val=isolated(eng,beat,ms,lead);if(ms===-40)c.moveTo(px+ms*scale,py-val*gain);else c.lineTo(px+ms*scale,py-val*gain);}c.stroke();}c.fillStyle='#738697';c.font='8px Segoe UI';c.fillText('0',px,top+ch-5);c.fillText('500 ms',px+470*scale,top+ch-5);c.restore();c.strokeStyle='#d7bec5';c.strokeRect(left,top,cw,ch);
   }
 }x.clearRect(0,0,w,h);x.drawImage(morphBase,0,0,w,h);
}
window.HeartDetails={reset(){morphKey='';reference=null;metricsCache=new WeakMap();},draw(frame){if(S.detail==='circuit')circuit(frame);else if(S.detail==='morphology')morphology(frame);}};
})();
