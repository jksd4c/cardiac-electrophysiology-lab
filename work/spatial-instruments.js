/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
/* Independent 3-D vector display and patient-coordinate cube, linked to the heart view. */
(function(){
'use strict';const T=window.THREE,H=window.HeartRhythm,Lab=window.HeartLab,$=id=>document.getElementById(id),tr=s=>window.HeartI18n?.t(s)??s;
let objects=null,lastTrail=0,lastSize='',lastText='';
const vector=a=>new T.Vector3(...a);
function textSprite(label,color){const c=document.createElement('canvas');c.width=128;c.height=64;const x=c.getContext('2d');x.fillStyle=color;x.font='500 29px Segoe UI';x.textAlign='center';x.fillText(label,64,42);const s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true,depthTest:false}));s.scale.set(.5,.25,1);return s;}
function makeRenderer(host){const r=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});r.setPixelRatio(Math.min(devicePixelRatio,2));r.setClearColor(0,0);r.outputColorSpace=T.SRGBColorSpace;host.append(r.domElement);return r;}
function init(){if(objects)return;const host=$('vector3d-scene'),renderer=makeRenderer(host),scene=new T.Scene(),group=new T.Group(),camera=new T.PerspectiveCamera(35,1,.1,30);scene.add(group);camera.position.set(0,0,6);camera.lookAt(0,0,0);
 for(const [dir,label,color]of [[[1,0,0],'L','#799fc0'],[[0,1,0],'S','#799fc0'],[[0,0,1],'A','#799fc0']]){const points=[vector(dir).multiplyScalar(-1.5),vector(dir).multiplyScalar(1.5)],line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color,transparent:true,opacity:.32}));group.add(line);const labelSprite=textSprite(label,color);labelSprite.position.copy(points[1]).multiplyScalar(1.12);group.add(labelSprite);}
 for(const axis of [0,1,2]){const pts=Array.from({length:65},(_,i)=>{const a=i/64*Math.PI*2,point=[Math.cos(a)*1.3,Math.sin(a)*1.3,0];if(axis===1)[point[1],point[2]]=[point[2],point[1]];if(axis===2)[point[0],point[2]]=[point[2],point[0]];return vector(point);});group.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:'#6685a1',transparent:true,opacity:.13})));}
 const net=new T.ArrowHelper(new T.Vector3(0,1,0),new T.Vector3(),1,0xffdc68,.20,.09),lead=new T.ArrowHelper(new T.Vector3(0,1,0),new T.Vector3(),1.6,0x608b9f,.15,.07),projection=new T.ArrowHelper(new T.Vector3(0,1,0),new T.Vector3(),1,0x70ffdf,.15,.07);group.add(net,lead,projection);
 const leadLabel=textSprite('II','#9febd7');group.add(leadLabel);
 const trail=new T.Line(new T.BufferGeometry().setFromPoints(Array.from({length:96},()=>new T.Vector3())),new T.LineBasicMaterial({color:'#efcb72',transparent:true,opacity:.55}));group.add(trail);
 const drop=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]),new T.LineDashedMaterial({color:'#8ae5ce',dashSize:.05,gapSize:.04,transparent:true,opacity:.6}));group.add(drop);
 const cubeHost=$('orientation-cube'),cubeRenderer=makeRenderer(cubeHost),cubeScene=new T.Scene(),cubeCamera=new T.PerspectiveCamera(29,1,.1,20);cubeCamera.position.set(0,0,5.4);
 const faceLabels=['L','R','S','I','A','P'],mats=faceLabels.map((name,i)=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle=['#214665','#143650','#2d5675','#142e46','#315c7c','#17354e'][i];x.fillRect(0,0,128,128);x.strokeStyle='#789ab6';x.lineWidth=4;x.strokeRect(3,3,122,122);x.fillStyle='#d6eafa';x.textAlign='center';x.textBaseline='middle';x.font='500 57px Segoe UI';x.fillText(name,64,67);return new T.MeshBasicMaterial({map:new T.CanvasTexture(c)});});
 const cube=new T.Mesh(new T.BoxGeometry(1.32,1.32,1.32),mats);cubeScene.add(cube);cubeRenderer.domElement.tabIndex=0;cubeRenderer.domElement.setAttribute('role','button');cubeRenderer.domElement.setAttribute('aria-label','方位立方体，点击面切换视角；Enter 恢复前面观');
 const ray=new T.Raycaster();function orient(face){const poses=[[-Math.PI/2,0],[Math.PI/2,0],[0,Math.PI/2],[0,-Math.PI/2],[0,0],[Math.PI,0]];[Lab.state.yaw,Lab.state.pitch]=poses[face];Lab.state.panX=Lab.state.panY=0;Lab.state.auto=false;$('auto').setAttribute('aria-pressed','false');window.heartViewer?.render();}
 cubeRenderer.domElement.onclick=e=>{const r=e.currentTarget.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),cubeCamera);const hit=ray.intersectObject(cube)[0];if(hit)orient(hit.face.materialIndex);};cubeRenderer.domElement.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();orient(4);}};
 objects={host,renderer,scene,group,camera,net,lead,projection,leadLabel,trail,drop,cubeHost,cubeRenderer,cubeScene,cubeCamera,cube};
}
function resize(){const o=objects,r=o.host.getBoundingClientRect(),cr=o.cubeHost.getBoundingClientRect(),key=[r.width,r.height,cr.width,cr.height,devicePixelRatio].join(':');if(key===lastSize||r.width<1)return;lastSize=key;o.renderer.setSize(r.width,r.height,false);o.camera.aspect=r.width/r.height;o.camera.updateProjectionMatrix();o.cubeRenderer.setSize(cr.width,cr.height,false);}
function write(id,content){const e=$(id),s=tr(content);if(e.textContent!==s)e.textContent=s;}
function draw(frame,rotation){if(!objects)return;resize();const o=objects,s=Lab.state,v=vector(frame.vector),d=vector(H.leads[s.lead]).normalize(),p=d.clone().multiplyScalar(v.dot(d)),scale=.85;
 o.group.quaternion.copy(rotation);o.cube.quaternion.copy(rotation);o.net.visible=v.length()>.005;if(o.net.visible){o.net.setDirection(v.clone().normalize());o.net.setLength(Math.min(2.2,v.length()*scale),.18,.085);o.net.setColor(H.rhythms[s.rhythm]&&Lab.engine.abnormalAt(frame.time)?0xff5269:0xffdc68);}o.lead.setDirection(d);o.lead.setLength(1.55,.12,.065);o.projection.visible=p.length()>.005;if(o.projection.visible){o.projection.setDirection(p.clone().normalize());o.projection.setLength(Math.min(2.2,p.length()*scale),.14,.07);}o.leadLabel.position.copy(d).multiplyScalar(1.85);
 if(o.currentLead!==s.lead){o.currentLead=s.lead;o.leadLabel.material.map.dispose();const replacement=textSprite(s.lead+' +','#9febd7');o.leadLabel.material.map=replacement.material.map;replacement.material.dispose();}
 const pos=o.drop.geometry.attributes.position;pos.setXYZ(0,v.x*scale,v.y*scale,v.z*scale);pos.setXYZ(1,p.x*scale,p.y*scale,p.z*scale);pos.needsUpdate=true;o.drop.computeLineDistances();
 const now=performance.now();if(now-lastTrail>45){lastTrail=now;const pts=o.trail.geometry.attributes.position,span=Math.min(1000,Lab.engine.rr);for(let i=0;i<96;i++){const q=Lab.engine.vectorAt(Math.max(0,frame.time-span+i/95*span));pts.setXYZ(i,q[0]*scale,q[1]*scale,q[2]*scale);}pts.needsUpdate=true;o.trail.geometry.computeBoundingSphere();o.trail.material.color.set(Lab.engine.abnormalAt(frame.time)?'#fb6b7c':'#efcb72');}
 o.renderer.render(o.scene,o.camera);o.cubeRenderer.render(o.cubeScene,o.cubeCamera);
 write('vector3d-lead',s.lead);const projected=Lab.engine.project(frame.vector,s.lead),actual=Lab.engine.ecg(frame.time,s.lead);write('vector3d-value',tr('向量投影')+' '+(projected>=0?'+':'')+projected.toFixed(2)+' mV'+(s.lead.startsWith('V')?' · ECG '+actual.toFixed(2)+' mV':''));
 const site=H.rhythms[s.rhythm].pvcSite,key=s.rhythm+'|'+s.lead+'|'+window.HeartI18n?.language;
 if(key!==lastText){lastText=key;let text=site?site.clues:s.rhythm==='rvot'?'RVOT：下壁轴，V1 负向主波；结合胸导联移行观察。':'箭头指向导联正极时投影为正；垂直时接近零。';write('vector3d-clue',text);}
}
window.HeartSpatial={init,draw};
})();
