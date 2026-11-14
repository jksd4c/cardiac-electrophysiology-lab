/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
(async function () {
  'use strict';
  const root = document.getElementById('heart-app');
  const area = document.getElementById('scene-wrap');
  const $ = id => document.getElementById(id);
  const T = window.THREE;
  const Lab=window.HeartLab; const state=Lab.state;
  const saved = window.openai?.widgetState?.privateContent;
  function restore(s) {
    if (!s || s.version !== 2) return;
    for (const [k,low,high] of [['opacity',.04,1],['speed',.1,1],['yaw',-100,100],['pitch',-1.4,1.4],['zoom',.6,2.4]]) if (Number.isFinite(s[k])) state[k] = Math.max(low,Math.min(high,s[k]));
    if (['conduction','anatomy','none'].includes(s.labelMode)) state.labelMode=s.labelMode;
  }
  restore(saved);
  function persist(){try{window.openai?.setWidgetState?.({modelContent:{selectedStructure:state.selected,view:'sinus-rhythm-3d'},privateContent:{version:2,opacity:state.opacity,speed:state.speed,yaw:state.yaw,pitch:state.pitch,zoom:state.zoom,labelMode:state.labelMode}})?.catch(()=>{});}catch(e){}}
  function fail(e){$('loading').hidden=false;$('loading').textContent='模型载入失败：'+e.message;console.error(e);}
  try {
    const vec=a=>new T.Vector3(...a), scene=new T.Scene(), heart=new T.Group();scene.add(heart);
    const camera=new T.PerspectiveCamera(30,1,.1,30);
    const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance',preserveDrawingBuffer:true});
    renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.domElement.className='heart-webgl';renderer.domElement.setAttribute('aria-label','三维心脏，点击结构高亮；拖动旋转，滚轮缩放');area.prepend(renderer.domElement);
    const overlay=document.createElement('canvas');overlay.className='overlay';overlay.setAttribute('aria-hidden','true');area.appendChild(overlay);const ctx=overlay.getContext('2d');
    const labelLayer=document.createElement('div');labelLayer.className='anatomy-labels';area.appendChild(labelLayer);
    const network=JSON.parse($('network-data').textContent),packed=JSON.parse($('model-data').textContent);
    const surfaces=[],fibers=[],nodes=[],pickFibers=[],pickSurfaces=[],allSamples=[];
    let width=900,height=640,dpr=1,hover=null,frameDt=.016,labelDirty=true;
    const keyColor = new T.Color('#70ffdf'), goldColor=new T.Color('#ffcc45');
    const raycaster=new T.Raycaster();const pointer=new T.Vector2();
    const depths=new T.WebGLRenderTarget(1,1,{minFilter:T.NearestFilter,magFilter:T.NearestFilter,depthBuffer:true,stencilBuffer:false});
    depths.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);depths.depthTexture.format=T.DepthFormat;
    const depthScene=new T.Scene(),depthHeart=new T.Group();depthScene.add(depthHeart);
    const depthVertex=`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
    const depthFragment=`precision highp float;varying vec3 p;uniform float cut;void main(){if(cut>.5&&p.y<.22&&p.z>.59+.18*p.x)discard;gl_FragColor=vec4(1.);}`;
    const depthMat=new T.ShaderMaterial({vertexShader:depthVertex,fragmentShader:depthFragment,uniforms:{cut:{value:0}},side:T.DoubleSide});
    const screenUniform={value:new T.Vector2(1,1)},depthUniform={value:depths.depthTexture},zoomUniform={value:1};
    const nearUniform={value:camera.near},farUniform={value:camera.far},xrayUniform={value:0};const depthNoCut=depthMat.clone();
    const opticalGLSL=`uniform sampler2D depthMap;uniform vec2 screenSize;uniform float nearClip;uniform float farClip;uniform float zoom;uniform float xray;float rearAmount(float z){float d=texture2D(depthMap,gl_FragCoord.xy/screenSize).x;float front=nearClip*farClip/(farClip-(farClip-nearClip)*d);return smoothstep(.17,1.02,max(0.,z-front)/zoom);}`;
    const D = {
      SA:['窦房结','SA node','上腔静脉与右心房交界附近 · 窦性激动起点'],
      AV:['房室结','AV node','右房间隔下部 · 房室传导延迟'],
      HIS:['希氏束','His bundle','连接房室交界与室间隔的传导主干'],
      RBB:['右束支','RBB','沿室间隔右侧下行，连接右室远端传导网络'],
      LBB:['左束支','LBB','室间隔左侧的传导主干与分支'],
      LAF:['左前分支','LAF','向左室前外侧分布的传导分支'],
      LPF:['左后分支','LPF','向左室下后侧分布的传导分支'],
      PURKINJE:['浦肯野网络','Purkinje','左右心室内膜下网络 · 将激动传向心室肌'],
      RA:['右心房','Right atrium','右心房壁 · 窦房结与房室结所在的心房'],
      LA:['左心房','Left atrium','左心房壁 · 接受经心房肌传来的激动'],
      VENT:['心室肌壁','Ventricular wall','来源模型中的完整心室肌壁，包含左右心室与室间隔'],
      RV:['右室内膜面','RV endocardium','显示右心室腔的内膜边界'],
      LV:['左室内膜面','LV endocardium','显示左心室腔的内膜边界'],
      AO:['主动脉','Aorta','升主动脉与主动脉弓'],
      PT:['肺动脉干','Pulmonary trunk','右室流出道上方的肺动脉干'],
      SVC:['上腔静脉','SVC','上腔静脉与右心房的连接']
    };
    const conductionKeys=['SA','AV','HIS','RBB','LBB','LAF','LPF','PURKINJE'];
    const anatomyKeys=['RA','LA','VENT','RV','LV','AO','PT','SVC'];
    const anchors={...network.anchors,RA:[-.91,-.24,.49],LA:[.35,.15,-.43],VENT:[.89,-.74,.59],RV:[-.28,-.78,.90],LV:[.68,-.73,.14],AO:[-.24,.94,.12],PT:[.23,.68,.59],SVC:[-.74,.97,.10]};
    const meshKey={'right-atrium':'RA','left-atrium':'LA','ventricular-wall':'VENT','right-ventricle':'RV','left-ventricle':'LV','ascending-aorta':'AO','aortic-arch':'AO','pulmonary-trunk':'PT','superior-vena-cava':'SVC'};
    const labelNodes={};
    for(const key of [...conductionKeys,...anatomyKeys]){
      const slot=document.createElement('div');slot.className='anatomy-label-slot';
      const button=document.createElement('button');button.type='button';button.className=root.classList.contains('inline-heart')?'btn anatomy-label':'anatomy-label';button.setAttribute('aria-label',`${D[key][0]} ${D[key][1]}`);button.setAttribute('aria-pressed','false');button.dataset.structure=key;
      const name=document.createElement('span');name.className='label-name';name.textContent=D[key][0];const latin=document.createElement('span');latin.className='label-latin';latin.textContent=D[key][1];if(root.classList.contains('inline-heart'))button.textContent=({PURKINJE:'浦肯野',RV:'右室内膜',LV:'左室内膜',VENT:'心室肌壁'}[key]||D[key][0]);else button.append(name,latin);slot.appendChild(button);labelLayer.appendChild(slot);
      button.onclick=e=>{e.stopPropagation();select(key)};button.onpointerenter=()=>{hover=key;labelDirty=true};button.onpointerleave=()=>{hover=null;labelDirty=true};labelNodes[key]={slot,button,x:0,y:0,ready:false};
    }
    function select(key,toggle=true,save=true){
      if(toggle&&state.selected===key)key=null;
      state.selected=key;
      if(key){state.labelMode=conductionKeys.includes(key)?'conduction':'anatomy';$('label-mode').value=state.labelMode;}
      for(const [k,n] of Object.entries(labelNodes)){n.button.setAttribute('aria-pressed',k===key?'true':'false');n.slot.classList.toggle('selected',k===key);n.slot.classList.toggle('muted',!!key&&k!==key);}
      $('structure-info').textContent=key?`${D[key][0]} · ${D[key][2]}`:'点击标签或三维结构，双向联动高亮';
      $('structure-info').classList.toggle('has-selection',!!key);$('clear-selection').hidden=!key;area.dataset.selection=key||'';labelDirty=true;$('magnify-structure').hidden=!key;if(save)persist();
    }
    $('clear-selection').onclick=()=>select(null,false);
    async function unpack(s,Type){const b=Uint8Array.from(atob(s),c=>c.charCodeAt(0));const r=new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate')).getReader();let a=[],n=0;while(true){const c=await r.read();if(c.done)break;a.push(c.value);n+=c.value.length}const all=new Uint8Array(n);let o=0;for(const c of a){all.set(c,o);o+=c.length}return new Type(all.buffer)}
    function weld(p,idx){const lookup=new Map(),positions=[],mapping=new Uint32Array(p.length/3);for(let i=0;i<mapping.length;i++){const key=p[i*3].toFixed(4)+','+p[i*3+1].toFixed(4)+','+p[i*3+2].toFixed(4);let v=lookup.get(key);if(v===undefined){v=positions.length/3;lookup.set(key,v);positions.push(p[i*3],p[i*3+1],p[i*3+2])}mapping[i]=v}const indices=Array.from(idx,i=>mapping[i]);return {p:positions,i:indices};}
    // Display subdivision of coarse vessel surfaces; original anatomical landmarks are retained.
    function refine(input,rounds){let {p,i}=input;for(let round=0;round<rounds;round++){
      const N=p.length/3,neighbours=Array.from({length:N},()=>new Set()),edges=new Map();
      for(let f=0;f<i.length;f+=3){const tri=i.slice(f,f+3);for(let k=0;k<3;k++){const a=tri[k],b=tri[(k+1)%3],o=tri[(k+2)%3],key=a<b?a+','+b:b+','+a;neighbours[a].add(b);neighbours[b].add(a);if(!edges.has(key))edges.set(key,{a,b,op:[]});edges.get(key).op.push(o);}}
      const boundary=Array.from({length:N},()=>[]);for(const e of edges.values())if(e.op.length===1){boundary[e.a].push(e.b);boundary[e.b].push(e.a)}
      const next=new Array(p.length);
      for(let v=0;v<N;v++){const ns=[...neighbours[v]],b=boundary[v];for(let c=0;c<3;c++){let target=p[v*3+c];if(b.length===2)target=.75*target+.125*(p[b[0]*3+c]+p[b[1]*3+c]);else{const beta=ns.length===3?3/16:3/(8*ns.length);target=(1-ns.length*beta)*target+beta*ns.reduce((s,j)=>s+p[j*3+c],0)}next[v*3+c]=p[v*3+c]*.35+target*.65;}}
      for(const e of edges.values()){e.index=next.length/3;for(let c=0;c<3;c++)next.push(e.op.length===2?.375*(p[e.a*3+c]+p[e.b*3+c])+.125*(p[e.op[0]*3+c]+p[e.op[1]*3+c]):.5*(p[e.a*3+c]+p[e.b*3+c]));}
      const out=[],edge=(a,b)=>edges.get(a<b?a+','+b:b+','+a).index;
      for(let f=0;f<i.length;f+=3){const [a,b,c]=i.slice(f,f+3),ab=edge(a,b),bc=edge(b,c),ca=edge(c,a);out.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca)}p=next;i=out;
    }return {p,i};}
    const links=new Map(),pointKey=p=>p.map(n=>n.toFixed(4)).join(',');
    for(const path of network.paths){const p=path.points;if(p.length<2)continue;for(const [end,other,type] of [[p[0],p[1],'out'],[p[p.length-1],p[p.length-2],'in']]){const key=pointKey(end);if(!links.has(key))links.set(key,{in:[],out:[]});links.get(key)[type].push(vec(end).sub(vec(other)).normalize());}}
    function smoothCurve(path){const pts=path.points.map(vec),curve=new T.CurvePath();for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],len=a.distanceTo(b);let da=k?b.clone().sub(pts[k-1]).normalize():b.clone().sub(a).normalize(),db=k+2<pts.length?pts[k+2].clone().sub(a).normalize():b.clone().sub(a).normalize();
      if(k===0){const node=links.get(pointKey(path.points[0]));if(node?.in.length)da.lerp(node.in[0],.48).normalize();}
      const limit=Math.min(len*.27,.035);curve.add(new T.CubicBezierCurve3(a,a.clone().addScaledVector(da,limit),b.clone().addScaledVector(db,-limit),b));}return curve;}
    function groupFor(p){if(p.kind==='atrial')return 'SA';if(p.kind==='his')return 'HIS';if(p.name==='LAF'||p.name==='LPF')return p.name;if(p.name==='LBB'||p.name==='LSF')return 'LBB';if(p.name.startsWith('RBB'))return 'RBB';return 'PURKINJE';}
    function inGroup(group,key){return group===key||(key==='LBB'&&(group==='LAF'||group==='LPF'));}
    const pathCurves=[];
    for(const path of network.paths){if(path.points.length<2)continue;const curve=smoothCurve(path),len=curve.getLength(),group=groupFor(path);pathCurves.push({path,curve,len,group});if(path.kind!=='atrial')for(let j=0,n=Math.max(3,Math.ceil(len/.045));j<=n;j++){const p=curve.getPointAt(j/n);allSamples.push([p.x,p.y,p.z,path.start+(path.end-path.start)*j/n]);}}
    const shellVertex=`attribute float activation;varying vec3 n;varying vec3 v;varying vec3 p;varying float at;void main(){p=position;at=activation;vec4 mv=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=-mv.xyz;gl_Position=projectionMatrix*mv;}`;
    const shellFragment=`precision highp float;uniform vec3 base;uniform float t;uniform float opacity;uniform float cut;uniform float kind;uniform float selected;uniform float back;uniform float mode;uniform float age;uniform float globalTime;uniform float abnormal;uniform float branchCode;uniform float chamber;uniform float preexcited;uniform vec3 focus;varying vec3 n;varying vec3 v;varying vec3 p;varying float at;
      void main(){float section=p.z-(.59+.18*p.x);if(cut>.5&&kind<1.5&&p.y<.22&&section>0.)discard;
      vec3 N=normalize(n),V=normalize(v);if(!gl_FrontFacing)N=-N;float facing=abs(dot(N,V)),rim=pow(1.-facing,2.8);
      vec3 L=normalize(vec3(-.6,.9,1.2));float diffuse=.27+.73*max(dot(N,L),0.);float key=pow(max(dot(reflect(-L,N),V),0.),46.);
      float strip=pow(max(dot(reflect(-normalize(vec3(.75,.15,.9)),N),V),0.),84.);
      float micro=sin(p.y*260.+sin(p.x*210.)*.5)*sin(p.z*220.);vec3 col=base*(.55+diffuse*.65)+vec3(.32,.56,.83)*rim+vec3(.64,.80,.96)*key*.7+vec3(.46,.69,.94)*strip*.5;
      col+=micro*.003;col=mix(col,vec3(.10,.80,.64)*(diffuse+.3)+vec3(.6,1.,.92)*rim,selected*.76);
      float arrival=at;float delay=0.;
       if(branchCode>.5){float left=chamber>.5?1.:chamber<-.5?0.:smoothstep(-.18,.12,p.x);bool rb=abs(branchCode-1.)<.1||branchCode>4.5;bool lb=abs(branchCode-2.)<.1;bool la=abs(branchCode-3.)<.1||abs(branchCode-5.)<.1;bool lp=abs(branchCode-4.)<.1||abs(branchCode-6.)<.1;if(rb)delay+=60.*(1.-left);if(lb)delay+=65.*left;if(la)delay+=22.*left*smoothstep(-.18,.22,p.z);if(lp)delay+=22.*left*(1.-smoothstep(-.18,.22,p.z));}
       float dt=t-at-delay-8.;if(mode>.5&&mode<1.5)dt=age-length(p-focus)*(kind<.1?105.:110.);
      float wave=at<900.?exp(-pow(dt/15.,2.)):0.;if(preexcited>.5)wave=max(wave,exp(-pow((age-length(p-focus)*110.)/15.,2.)));if(mode>2.5)wave=0.;
      if(mode>1.5&&mode<2.5){float ph=sin(atan(p.y+.4,p.x-.25)*2.-length(p.xy-vec2(.25,-.4))*15.+globalTime*.031)+.55*sin(p.z*22.+p.x*13.-globalTime*.047);wave=pow(max(0.,1.-abs(ph)*2.),3.);}
      vec3 waveColor=mix(vec3(.48,.40,.10),vec3(1.,.06,.09),abnormal*(branchCode>.5?step(.1,delay):1.));col+=waveColor*wave*(mode>.5?.90:.35);
      float a=opacity*(.09+.34*rim+.11*diffuse+.16*key);if(kind>1.5)a=opacity*(.19+.39*rim+.13*diffuse+.18*key);
      if(mode>1.5&&mode<2.5)a+=wave*.24;else if(mode>.5)a+=wave*.14;if(kind>.5&&kind<1.5)a*=.47;if(back>.5){col*=.61;a*=.50;}a+=selected*.18*(.25+rim);
      if(cut>.5&&kind<1.5&&p.y<.22){float edge=1.-smoothstep(0.,.015,abs(section));col+=vec3(.48,.68,.79)*edge;a+=edge*.55;}
      gl_FragColor=vec4(col,clamp(a,0.,.85));
      #include <colorspace_fragment>
      }`;
    for(const item of packed){const short=await unpack(item.p,Int16Array);let pos=Array.from(short,v=>v/10000);const indices=await unpack(item.i,Uint16Array),key=meshKey[item.name],cavity=key==='RV'||key==='LV',vessel=['AO','PT','SVC'].includes(key);
      let mesh=weld(pos,indices);if(vessel)mesh=refine(mesh,2);else if(cavity)mesh=refine(mesh,1);
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(mesh.p,3));g.setIndex(mesh.i);g.computeVertexNormals();pos=g.attributes.position.array;
      const act=new Float32Array(pos.length/3).fill(9999);
      if(key==='VENT'||cavity)for(let i=0;i<act.length;i++){const x=pos[i*3],y=pos[i*3+1],z=pos[i*3+2];let arrival=999;for(const p of allSamples){const d=Math.hypot(x-p[0],y-p[1],z-p[2]);arrival=Math.min(arrival,p[3]+d*55+9)}act[i]=arrival;}
      else if(key==='RA'||key==='LA'){const s=key==='RA'?anchors.SA:[.24,.29,.60];for(let i=0;i<act.length;i++)act[i]=(key==='RA'?6:55)+Math.hypot(pos[i*3]-s[0],pos[i*3+1]-s[1],pos[i*3+2]-s[2])*(key==='RA'?47:40);}
      g.setAttribute('activation',new T.BufferAttribute(act,1));
      const layer={key,meshes:[],mats:[],g,cavity,vessel};
      for(const back of [true,false]){const mat=new T.ShaderMaterial({vertexShader:shellVertex,fragmentShader:shellFragment,uniforms:{t:{value:0},base:{value:new T.Color(vessel?'#729edb':cavity?'#426ba4':'#4d80c1')},opacity:{value:state.opacity},cut:{value:0},kind:{value:vessel?2:cavity?1:0},selected:{value:0},back:{value:back?1:0},mode:{value:0},age:{value:0},globalTime:{value:0},abnormal:{value:0},branchCode:{value:0},preexcited:{value:0},chamber:{value:key==='LV'?1:key==='RV'?-1:0},focus:{value:new T.Vector3()}},side:back?T.BackSide:T.FrontSide,transparent:true,depthWrite:false,depthTest:true});const m=new T.Mesh(g,mat);m.name=item.name;m.userData.key=key;m.renderOrder=back?1:cavity?2:3;heart.add(m);layer.meshes.push(m);layer.mats.push(mat);if(!back)pickSurfaces.push(m);}
      surfaces.push(layer);
      {const m=new T.Mesh(g,vessel?depthNoCut:depthMat);depthHeart.add(m);}
    }
    const wireVertex=`varying vec3 p;varying vec3 n;varying vec3 v;varying float at;uniform float a;uniform float b;void main(){p=position;at=mix(a,b,uv.x);vec4 mv=modelViewMatrix*vec4(position,1.);v=-mv.xyz;n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*mv;}`;
    const wireFragment=`precision highp float;${opticalGLSL}uniform float t;uniform float importance;uniform float strength;uniform float selected;uniform float muted;uniform float hovering;uniform float mode;uniform float age;uniform float globalTime;uniform float abnormal;uniform float enabled;uniform float blocked;uniform vec3 focus;varying vec3 p;varying vec3 n;varying vec3 v;varying float at;void main(){float rear=rearAmount(v.z);
      float dt=t-at;if(mode>.5&&mode<1.5)dt=age-length(p-focus)*110.;float pulse=exp(-pow(dt/5.5,2.))*enabled,tail=dt>0.?exp(-dt/27.)*enabled:0.;if(mode>1.5&&mode<2.5){pulse=pow(max(0.,1.-abs(sin(p.x*14.+p.y*11.-globalTime*.035)+.5*sin(p.z*18.+globalTime*.043))*2.),3.);tail=pulse*.4;}float farAlpha=mix(mix(.10,.23,importance),mix(.72,.88,importance),xray);float visible=mix(1.,farAlpha,rear);visible=mix(visible,1.,max(selected,pulse)*xray);vec3 N=normalize(n),V=normalize(v);float light=.83+.17*max(dot(N,normalize(vec3(-.5,.7,1.))),0.);float spec=pow(max(dot(reflect(-normalize(vec3(-.5,.7,1.)),N),V),0.),24.);
      vec3 base=mix(vec3(1.,.81,.20),vec3(.08,.95,.72),selected);base=mix(base,vec3(.9,.12,.19),blocked*(1.-selected));vec3 col=base*light+vec3(.20,.15,.04)*spec;col=mix(col,abnormal>.5?vec3(1.,.17,.22):vec3(1.,.99,.76),clamp(pulse+tail*.32,0.,1.));col+=hovering*vec3(.10,.18,.17);
      float alpha=strength*visible*mix(1.,.62,muted)*(.84+pulse*.16+tail*.12);gl_FragColor=vec4(col,min(alpha,1.));
      #include <colorspace_fragment>
      }`;
    function depthUniforms(){return {depthMap:depthUniform,screenSize:screenUniform,nearClip:nearUniform,farClip:farUniform,zoom:zoomUniform,xray:xrayUniform};}
    const hitMaterial=new T.MeshBasicMaterial({visible:false,side:T.DoubleSide});
    for(const {path,curve,len,group} of pathCurves){const imp=path.kind==='his'?1:group==='PURKINJE'?.05:.83,rad=path.radius*(group==='PURKINJE'?1:1.04),segments=Math.max(8,Math.ceil(len/.012));
      const g=new T.TubeGeometry(curve,segments,rad,10,false);
      const positions=g.attributes.position,uv=g.attributes.uv;
      for(let i=0;i<positions.count;i++){const u=uv.getX(i),c=curve.getPointAt(u),scale=group==='PURKINJE'?1-.12*u:1-.10*u;positions.setXYZ(i,c.x+(positions.getX(i)-c.x)*scale,c.y+(positions.getY(i)-c.y)*scale,c.z+(positions.getZ(i)-c.z)*scale);}g.computeVertexNormals();
      const mat=new T.ShaderMaterial({vertexShader:wireVertex,fragmentShader:wireFragment,uniforms:{...depthUniforms(),a:{value:path.start},b:{value:path.end},t:{value:0},importance:{value:imp},strength:{value:path.kind==='atrial'?.45:1},selected:{value:0},muted:{value:0},hovering:{value:0},mode:{value:0},age:{value:0},globalTime:{value:0},abnormal:{value:0},enabled:{value:1},blocked:{value:0},focus:{value:new T.Vector3()}},transparent:true,depthWrite:false,depthTest:false});
      const m=new T.Mesh(g,mat);m.renderOrder=5;m.userData.key=group;heart.add(m);fibers.push({mesh:m,mat,path,group});
      const hit=new T.Mesh(new T.TubeGeometry(curve,Math.max(4,Math.ceil(len/.035)),Math.max(rad*2.5,.019),5,false),hitMaterial);hit.userData.key=group;hit.userData.priority=imp;heart.add(hit);pickFibers.push(hit);
    }
    // Restore the first version's moving luminous wavefront along the refined paths.
    const pulsePos=[],pulseTime=[],pulseGroup=[],pulseSide=[];
    for(const {path,curve,len,group} of pathCurves){const n=Math.max(3,Math.ceil(len/.018));for(let i=0;i<=n;i++){const p=curve.getPointAt(i/n);pulsePos.push(p.x,p.y,p.z);pulseTime.push(path.start+(path.end-path.start)*i/n);pulseGroup.push(conductionKeys.indexOf(group));pulseSide.push(path.name.startsWith('右')?-1:1);}}
    const pulseGeometry=new T.BufferGeometry();pulseGeometry.setAttribute('position',new T.Float32BufferAttribute(pulsePos,3));pulseGeometry.setAttribute('at',new T.Float32BufferAttribute(pulseTime,1));pulseGeometry.setAttribute('groupId',new T.Float32BufferAttribute(pulseGroup,1));
    pulseGeometry.setAttribute('ventSide',new T.Float32BufferAttribute(pulseSide,1));
    const pulseMat=new T.ShaderMaterial({uniforms:{...depthUniforms(),branchCode:{value:0},circuitOnly:{value:0},t:{value:0},aClock:{value:0},vAge:{value:0},modeA:{value:0},modeV:{value:0},redA:{value:0},redV:{value:0},globalTime:{value:0},focusA:{value:new T.Vector3()},focusV:{value:new T.Vector3()},hisOverride:{value:-9999},scale:{value:35},selectedGroup:{value:-1},selectionActive:{value:0}},vertexShader:`attribute float at;attribute float ventSide;attribute float groupId;uniform float branchCode;uniform float circuitOnly;uniform float t;uniform float aClock;uniform float vAge;uniform float modeA;uniform float modeV;uniform float redA;uniform float redV;uniform float globalTime;uniform vec3 focusA;uniform vec3 focusV;uniform float hisOverride;uniform float scale;uniform float selectedGroup;uniform float selectionActive;varying float energy;varying float red;varying float eyeDepth;void main(){bool atrial=groupId<.5;float clock=atrial?aClock:t;float age=atrial?aClock:vAge;float mode=atrial?modeA:modeV;vec3 focus=atrial?focusA:focusV;red=atrial?redA:redV;if(abs(groupId-2.)<.25&&hisOverride>-9000.)clock=hisOverride;float delay=0.;bool blockedGroup=false;
      if(branchCode>.5){bool rb=abs(branchCode-1.)<.1||abs(branchCode-5.)<.1||abs(branchCode-6.)<.1,lb=abs(branchCode-2.)<.1,la=abs(branchCode-3.)<.1||abs(branchCode-5.)<.1,lp=abs(branchCode-4.)<.1||abs(branchCode-6.)<.1;blockedGroup=(rb&&abs(groupId-3.)<.1)||(lb&&groupId>3.5&&groupId<6.5)||(la&&abs(groupId-5.)<.1)||(lp&&abs(groupId-6.)<.1);if(groupId>6.5&&((rb&&ventSide<0.)||(lb&&ventSide>0.)))delay=rb&&ventSide<0.?60.:65.;if(groupId>6.5&&ventSide>0.&&((la&&position.z>.14)||(lp&&position.z<=.14)))delay=max(delay,22.);if(!atrial)red=delay>.1?1.:0.;}
      float dt=clock-at-delay;if(mode>.5&&mode<1.5)dt=age-length(position-focus)*110.;energy=exp(-pow(dt/7.,2.));if(mode>.5&&mode<1.5&&!atrial&&groupId<6.5)energy=0.;if(mode>1.5&&mode<2.5)energy=pow(max(0.,1.-abs(sin(position.x*14.+position.y*11.-globalTime*.035)+.5*sin(position.z*18.+globalTime*.043))*2.),3.);if(blockedGroup||circuitOnly>.5&&groupId>1.5&&groupId<6.5||mode>2.5)energy=0.;vec4 mv=modelViewMatrix*vec4(position,1.);eyeDepth=-mv.z;gl_PointSize=scale/max(1.,-mv.z);gl_Position=projectionMatrix*mv;}`,fragmentShader:`precision highp float;${opticalGLSL}varying float energy;varying float red;varying float eyeDepth;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.||energy<.003)discard;float halo=pow(1.-r,2.);vec3 col=mix(vec3(1.,.89,.42),vec3(1.,.13,.20),red);col=mix(col,mix(vec3(1.,1.,.86),vec3(1.,.68,.64),red),pow(1.-r,6.)*.65);gl_FragColor=vec4(col,halo*energy*.85*mix(1.,mix(.12,1.,xray),rearAmount(eyeDepth)));}`,transparent:true,blending:T.AdditiveBlending,depthTest:false,depthWrite:false});
    const pulsePoints=new T.Points(pulseGeometry,pulseMat);pulsePoints.renderOrder=8;heart.add(pulsePoints);
    function glowTexture(){const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d'),g=x.createRadialGradient(48,48,0,48,48,48);g.addColorStop(0,'rgba(255,255,221,1)');g.addColorStop(.12,'rgba(255,239,151,.95)');g.addColorStop(.35,'rgba(255,212,68,.36)');g.addColorStop(1,'rgba(255,199,48,0)');x.fillStyle=g;x.fillRect(0,0,96,96);return new T.CanvasTexture(c)}
    // Share the anatomical depth pass with emissive nodes and billboard glows.
    function depthFade(material){material.onBeforeCompile=shader=>{
      Object.assign(shader.uniforms,depthUniforms());
      shader.vertexShader='varying float eyeDepth;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\n eyeDepth=-mvPosition.z;');
      shader.fragmentShader=opticalGLSL+'\nvarying float eyeDepth;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','#include <opaque_fragment>\n gl_FragColor.a*=mix(1.,mix(.16,1.,xray),rearAmount(eyeDepth));');
    };material.customProgramCacheKey=()=> 'anatomical-depth-v4';return material;}
    const glow=glowTexture();
    for(const key of ['SA','AV']){const node=new T.Mesh(new T.SphereGeometry(1,32,20),new T.MeshBasicMaterial({color:'#ffd34d',transparent:true,depthTest:false}));node.position.copy(vec(anchors[key]));node.scale.set(...(key==='SA'?[.029,.105,.027]:[.035,.041,.029]));node.rotation.z=key==='SA'?-.19:0;node.renderOrder=7;heart.add(node);
      const sprite=new T.Sprite(new T.SpriteMaterial({map:glow,color:'#ffe393',transparent:true,blending:T.AdditiveBlending,depthWrite:false,depthTest:false}));sprite.position.copy(node.position);sprite.scale.setScalar(.30);sprite.renderOrder=8;heart.add(sprite);
      const hit=new T.Mesh(new T.SphereGeometry(1,12,8),hitMaterial);hit.position.copy(node.position);hit.scale.copy(node.scale).multiplyScalar(2.4);hit.userData.key=key;hit.userData.priority=2;heart.add(hit);pickFibers.push(hit);nodes.push({key,node,sprite});}
    const focalA=new T.Vector3(.36,.14,-.43),focalV=new T.Vector3(-.24,-.80,.85),redColor=new T.Color('#ff485e');
    const focusSprite=new T.Sprite(new T.SpriteMaterial({map:glow,color:'#ff425d',transparent:true,blending:T.AdditiveBlending,depthTest:false,depthWrite:false}));focusSprite.renderOrder=9;heart.add(focusSprite);
    const blockCanvas=document.createElement('canvas');blockCanvas.width=blockCanvas.height=64;const bx=blockCanvas.getContext('2d');bx.strokeStyle='#ff5268';bx.lineWidth=7;bx.lineCap='round';bx.beginPath();bx.moveTo(18,18);bx.lineTo(46,46);bx.moveTo(46,18);bx.lineTo(18,46);bx.stroke();
    const blockSprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(blockCanvas),transparent:true,depthTest:false,depthWrite:false}));blockSprite.scale.setScalar(.19);blockSprite.renderOrder=10;heart.add(blockSprite);
    for(const n of nodes){depthFade(n.node.material);depthFade(n.sprite.material);}depthFade(focusSprite.material);depthFade(blockSprite.material);
    const circuitLayer=new T.Group();heart.add(circuitLayer);const circuitMeshes=[];let circuitKey='';
    const extraBlocks=Array.from({length:3},()=>{const sp=new T.Sprite(depthFade(new T.SpriteMaterial({map:blockSprite.material.map,transparent:true,depthTest:false,depthWrite:false})));sp.scale.setScalar(.12);sp.renderOrder=10;heart.add(sp);return sp;});
    function branchInfo(code){return {rbbb:{blocked:['RBB'],side:-1},lbbb:{blocked:['LBB','LAF','LPF'],sites:['LBB'],side:1},lafb:{blocked:['LAF'],side:0},lpfb:{blocked:['LPF'],side:0},rbbLaf:{blocked:['RBB','LAF'],side:-1},rbbLpf:{blocked:['RBB','LPF'],side:-1}}[code]||{blocked:[],side:0};}
    function makeCircuit(key){
      for(const item of circuitMeshes){item.mesh.geometry.dispose();item.mesh.material.dispose();item.dot.geometry.dispose();item.dot.material.dispose();}circuitMeshes.length=0;circuitLayer.clear();
      const AV=anchors.AV,HIS=anchors.HIS,LP=anchors.LPF,APtop=[.62,-.12,-.26],APbase=[.78,-.39,.03];
      const loop=(pts,offset=0,span=1)=>{const curve=new T.CatmullRomCurve3(pts.map(vec));const material=depthFade(new T.MeshBasicMaterial({color:'#d34658',transparent:true,opacity:.55,depthWrite:false,depthTest:false}));const mesh=new T.Mesh(new T.TubeGeometry(curve,90,.008,7,false),material);mesh.renderOrder=6;const dot=new T.Mesh(new T.SphereGeometry(.028,12,8),depthFade(new T.MeshBasicMaterial({color:'#ff8e95',transparent:true,depthTest:false,depthWrite:false})));dot.renderOrder=8;circuitLayer.add(mesh,dot);circuitMeshes.push({mesh,dot,curve,offset,span});};
      if(key==='avnrt'||key==='avnrtAtyp'){
        const slow=[[-.52,-.12,.05],[-.65,-.30,.05],[-.57,-.45,.05],AV],fast=[AV,[-.32,-.30,.04],[-.34,-.12,.03],[-.52,-.12,.05]];
        if(key==='avnrt'){loop(slow,0,.72);loop(fast,.72,.28);}else{loop([...fast].reverse(),0,.28);loop([...slow].reverse(),.28,.72);}
      }else if(['avrt','avrtAnti'].includes(key)){let p=[APtop,[-.04,-.08,-.16],AV,HIS,[.02,-.66,.22],[.58,-.75,.14],APbase,APtop];if(key==='avrtAnti')p=p.reverse();loop(p);}
      else if(key==='wpw'||key==='preAf')loop([APtop,[.74,-.22,-.13],APbase],0,.5);
      else if(key==='flutter')loop([[-.60,-.14,.08],[-.91,-.06,.23],[-1.01,-.38,.30],[-.85,-.60,.16],[-.52,-.49,.02],[-.45,-.27,.01],[-.60,-.14,.08]]);
      else if(key==='mitral')loop([[.25,-.22,-.40],[.62,-.10,-.35],[.82,-.30,-.22],[.61,-.50,-.33],[.25,-.43,-.44],[.25,-.22,-.40]]);
      else if(key==='vt')loop([[.70,-.66,.36],[.87,-.77,.42],[.85,-1.00,.38],[.59,-1.03,.29],[.48,-.83,.30],[.70,-.66,.36]]);
      else if(key==='fasc')loop([LP,[.18,-1.06,.05],[.36,-.75,.15],[.04,-.38,.17],LP]);
      else if(key==='bbr')loop([HIS,anchors.RBB,[-.24,-1.02,.65],[.05,-1.13,.33],LP,anchors.LBB,HIS]);
    }
    function updateCircuits(frame){const k=frame.circuit||'';if(k!==circuitKey){circuitKey=k;makeCircuit(k);}circuitLayer.visible=!!k;
      for(const item of circuitMeshes){const phase=(frame.circuitPhase-item.offset+1)%1,visible=phase<item.span;item.dot.visible=visible;item.dot.position.copy(item.curve.getPointAt(Math.min(.999,phase/item.span)));item.mesh.material.opacity=visible?.64:.28;}
      const info=branchInfo(frame.branch),sites=info.sites||info.blocked;for(let i=0;i<extraBlocks.length;i++){extraBlocks[i].visible=!!sites[i];if(sites[i])extraBlocks[i].position.copy(vec(anchors[sites[i]]));}
    }
    $('magnify-structure').onclick=()=>{const key=state.selected;if(!key)return;if(key==='LA'&&Lab.allowedDetail('pv')){Lab.detail('pv');state.yaw=Math.PI;}else if(['LV','RV','VENT'].includes(key))Lab.detail('ventricle');state.zoom=1.8;heart.rotation.set(state.pitch,state.yaw,0,'YXZ');const q=vec(anchors[key]).applyEuler(heart.rotation).multiplyScalar(state.zoom);state.panX=-q.x;state.panY=-q.y+.04;state.auto=false;$('auto').setAttribute('aria-pressed','false');};
    function setUniform(m,key,value){m.uniforms[key].value=T.MathUtils.lerp(m.uniforms[key].value,value,Math.min(1,frameDt*14));}
    function occludedPick(hit){const p=hit.point.clone().applyMatrix4(heart.matrixWorld.clone().invert());return state.cut&&!['AO','PT','SVC'].includes(hit.object.userData.key)&&p.y<.22&&p.z>.59+.18*p.x;}
    function pick(clientX,clientY){const r=renderer.domElement.getBoundingClientRect();pointer.set((clientX-r.left)/r.width*2-1,-(clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);
      const body=raycaster.intersectObjects(pickSurfaces,false).filter(h=>!occludedPick(h)),front=body[0]?.distance??Infinity;
      const hits=raycaster.intersectObjects(pickFibers,false).filter(h=>state.depthMode==='xray'||h.distance-front<.76*state.zoom);
      if(hits.length){const closest=hits[0].distance;const near=hits.filter(h=>h.distance<closest+.08).sort((a,b)=>(b.object.userData.priority||0)-(a.object.userData.priority||0));return near[0].object.userData.key;}
      return body.length?body[0].object.userData.key:null;
    }
    const labelDepthRay=new T.Raycaster(),behindLabels={};let depthKey='',lastDepthCheck=0;
    function updateLabelDepth(visible){const now=performance.now(),key=[state.yaw.toFixed(3),state.pitch.toFixed(3),state.panX,state.panY,state.zoom,state.cut,state.labelMode,state.depthMode].join(':');if(key===depthKey||now-lastDepthCheck<160)return;depthKey=key;lastDepthCheck=now;
      for(const k of visible){const a=vec(anchors[k]).applyMatrix4(heart.matrixWorld),dir=a.clone().sub(camera.position),distance=dir.length();labelDepthRay.set(camera.position,dir.normalize());const hits=labelDepthRay.intersectObjects(pickSurfaces,false).filter(h=>!occludedPick(h));behindLabels[k]=state.depthMode!=='xray'&&hits.length>0&&distance-hits[0].distance>.63*state.zoom;}
      const view=camera.position.clone().sub(heart.position).applyQuaternion(heart.quaternion.clone().invert()).normalize();
      $('view-title').textContent=Math.abs(view.y)>.82?(view.y>0?'上方观':'下方观'):Math.abs(view.z)>Math.abs(view.x)?(view.z>0?'ANTERIOR · 前面观':'POSTERIOR · 后面观'):(view.x>0?'LEFT · 左侧观':'RIGHT · 右侧观');
    }
    function drawLabels(){ctx.clearRect(0,0,width,height);const visible=state.labelMode==='conduction'?conductionKeys:state.labelMode==='anatomy'?anatomyKeys:[];for(const [k,l] of Object.entries(labelNodes))l.slot.hidden=!visible.includes(k);
      updateLabelDepth(visible);if(!visible.length)return;
      const compact=width<650,pad=compact?7:12,labelWidth=compact?86:116,minGap=compact?52:61,rail=Math.max(pad,(width-height*1.55)/2);
      const items=visible.map(key=>{const w=vec(anchors[key]).applyMatrix4(heart.matrixWorld),p=w.project(camera);return {key,x:(p.x*.5+.5)*width,y:(.5-p.y*.5)*height};}).sort((a,b)=>a.x-b.x);
      const split=Math.ceil(items.length/2);
      for(let side=0;side<2;side++){const list=items.slice(side?split:0,side?items.length:split).sort((a,b)=>a.y-b.y);let bottom=height-112;
        for(let i=list.length-1;i>=0;i--){list[i].ty=Math.min(Math.max(82,list[i].y-18),bottom-42);bottom=list[i].ty-minGap+42;}
        let top=side?(width<450?162:188):72;for(const q of list){q.ty=Math.max(top,q.ty);top=q.ty+minGap;const label=labelNodes[q.key],targetX=side?width-rail-labelWidth:rail;
          if(!label.ready){label.x=targetX;label.y=q.ty;label.ready=true}else{label.x+=(targetX-label.x)*.24;label.y+=(q.ty-label.y)*.24}
          label.slot.style.transform=`translate(${label.x.toFixed(1)}px,${label.y.toFixed(1)}px)`;label.slot.style.width=labelWidth+'px';label.slot.classList.toggle('right',!!side);label.slot.classList.toggle('hovered',hover===q.key);
          const endX=side?label.x-5:label.x+labelWidth+5,endY=label.y+20,visiblePoint=q.x>3&&q.x<width-3&&q.y>48&&q.y<height-32;
          const behind=!!behindLabels[q.key];label.slot.classList.toggle('behind',behind);label.slot.style.opacity=visiblePoint?(behind?'.84':'1'):'.35';if(!visiblePoint)continue;
          const selected=state.selected===q.key,hot=selected||hover===q.key;ctx.strokeStyle=hot?'rgba(112,255,223,.85)':'rgba(162,195,224,.25)';ctx.lineWidth=hot?1.1:.7;ctx.setLineDash(behind?[3,4]:[]);ctx.globalAlpha=behind?.55:1;ctx.beginPath();ctx.moveTo(q.x,q.y);const bend=side?endX-14:endX+14;ctx.bezierCurveTo(q.x+(side?12:-12),q.y,bend,endY,endX,endY);ctx.stroke();ctx.fillStyle=hot?'#70ffdf':'#bfd7e8';ctx.beginPath();ctx.arc(q.x,q.y,hot?3:1.8,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.setLineDash([]);
        }
      }
    }
    let lastSize='';
    function resize(){const r=area.getBoundingClientRect(),nw=Math.round(r.width),nh=Math.round(r.height),nd=Math.min(devicePixelRatio,2),size=nw+','+nh+','+nd;if(size===lastSize||nw<1||nh<1)return;lastSize=size;width=nw;height=nh;dpr=nd;renderer.setPixelRatio(dpr);renderer.setSize(width,height);overlay.width=Math.round(width*dpr);overlay.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);camera.aspect=width/height;camera.updateProjectionMatrix();depths.setSize(Math.ceil(width*dpr*.7),Math.ceil(height*dpr*.7));screenUniform.value.set(renderer.domElement.width,renderer.domElement.height);labelDirty=true;render();}
    function render(){const frame=Lab.engine.frameAt(state.time),t=frame.ventClock;camera.position.set(0,0,width<650?Math.max(6.8,7.05/(width/height)):6.15);camera.lookAt(0,0,0);camera.updateMatrixWorld();heart.rotation.set(state.pitch,state.yaw,0,'YXZ');heart.position.set(state.panX,state.panY-.04,0);heart.scale.setScalar(state.zoom);heart.updateMatrixWorld(true);depthHeart.matrixAutoUpdate=false;depthHeart.matrix.copy(heart.matrix);depthHeart.matrixWorldNeedsUpdate=true;zoomUniform.value=state.zoom;xrayUniform.value=state.depthMode==='xray'?1:0;depthMat.uniforms.cut.value=state.cut?1:0;
      focalA.set(...(frame.a?.kind==='escapeA'?[-.92,-.10,.42]:frame.a?.kind==='retrograde'?anchors.AV:[.36,.14,-.43]));
      if(frame.atrialFocus)focalA.set(...frame.atrialFocus);focalV.set(...(frame.ventricularFocus||[-.24,-.80,.85]));const branch=branchInfo(frame.branch);
      for(const s of surfaces){const selected=state.selected===s.key,atrial=s.key==='RA'||s.key==='LA';for(const m of s.mats){m.uniforms.t.value=atrial?frame.atrialClock:t;m.uniforms.opacity.value=state.opacity*(state.selected&&conductionKeys.includes(state.selected)?.78:1);m.uniforms.cut.value=state.cut?1:0;m.uniforms.mode.value=s.vessel?0:atrial?frame.atrialMode:frame.ventMode;m.uniforms.preexcited.value=!atrial&&!s.vessel&&frame.preexcited?1:0;m.uniforms.branchCode.value=atrial||s.vessel?0:({rbbb:1,lbbb:2,lafb:3,lpfb:4,rbbLaf:5,rbbLpf:6}[frame.branch]||0);m.uniforms.age.value=atrial?frame.atrialAge:frame.ventAge;m.uniforms.globalTime.value=state.time;m.uniforms.abnormal.value=s.vessel?0:atrial?Number(frame.redA):Number(frame.redV);m.uniforms.focus.value.copy(atrial?focalA:focalV);setUniform(m,'selected',selected?1:0);}}
      const hisOverride=frame.block&&frame.blockLevel==='his'?frame.atrialAge:-9999;
      for(const f of fibers){const selected=!!state.selected&&inGroup(f.group,state.selected),atrial=f.group==='SA',u=f.mat.uniforms;u.t.value=atrial?frame.atrialClock:f.group==='HIS'&&hisOverride>-9000?hisOverride:t;u.mode.value=atrial?frame.atrialMode:frame.ventMode;u.age.value=atrial?frame.atrialAge:frame.ventAge;u.globalTime.value=state.time;u.abnormal.value=Number(atrial?frame.redA:frame.redV);u.enabled.value=!atrial&&frame.ventMode===1&&f.group!=='PURKINJE'?0:1;u.focus.value.copy(atrial?focalA:focalV);u.blocked.value=branch.blocked.includes(f.group)?1:0;if(u.blocked.value)u.enabled.value=0;if(frame.branch&&!atrial){let delay=0;if(f.group==='PURKINJE'){const side=f.path.name.startsWith('右')?-1:1,z=f.path.points.at(-1)[2];if(branch.side&&side===branch.side)delay=side<0?60:65;if(side>0&&(branch.blocked.includes('LAF')&&z>.14||branch.blocked.includes('LPF')&&z<=.14))delay=Math.max(delay,22);}u.t.value-=delay;u.abnormal.value=delay>0?1:0;}if(frame.preexcited&&!atrial)u.abnormal.value=0;if(frame.circuit==='bbr'&&f.group!=='PURKINJE'&&!atrial)u.enabled.value=0;if(frame.atrialMode>2.5&&atrial)u.enabled.value=0;setUniform(f.mat,'selected',selected?1:0);setUniform(f.mat,'muted',state.selected&&!selected?1:0);setUniform(f.mat,'hovering',hover&&inGroup(f.group,hover)?1:0);f.mesh.renderOrder=selected?7:5;}
      const pu=pulseMat.uniforms;pu.branchCode.value=({rbbb:1,lbbb:2,lafb:3,lpfb:4,rbbLaf:5,rbbLpf:6}[frame.branch]||0);pu.circuitOnly.value=frame.circuit==='bbr'?1:0;pu.t.value=t;pu.aClock.value=frame.atrialClock;pu.vAge.value=frame.ventAge;pu.modeA.value=frame.atrialMode;pu.modeV.value=frame.ventMode;pu.redA.value=Number(frame.redA);pu.redV.value=frame.preexcited?0:Number(frame.redV);pu.globalTime.value=state.time;pu.focusA.value.copy(focalA);pu.focusV.value.copy(focalV);pu.hisOverride.value=hisOverride;pu.scale.value=height*dpr*.09;pu.selectedGroup.value=state.selected?conductionKeys.indexOf(state.selected):-1;pu.selectionActive.value=state.selected?1:0;
      for(const n of nodes){const selected=state.selected===n.key;let b=0,red=false;if(n.key==='SA'){if(!frame.af&&frame.a?.kind==='sinus')b=Math.exp(-Math.pow((frame.saAge??frame.atrialAge)/18,2));if(frame.saBlocked){b=.9;red=true;}}else{if(frame.a?.conducted&&frame.atrialAge>=60&&frame.atrialAge<(frame.preexcited?174:frame.a.pr)-22)b=.6;if(frame.a?.block==='his'&&frame.atrialAge>=60&&frame.atrialAge<152)b=.6;if(frame.ventAge>=-24&&frame.ventAge<5&&frame.ventMode===0)b=1;if(frame.block&&frame.blockLevel==='av'){b=.85;red=true;}if(frame.af&&frame.ventAge>=-65&&frame.ventAge<0){b=.8;red=true;}}n.node.material.color.lerp(selected?keyColor:red?redColor:goldColor,.2);n.node.material.opacity=state.selected&&!selected?.65:1;n.sprite.material.color.copy(red?redColor:goldColor);n.sprite.material.opacity=.08+b*.92;n.sprite.scale.setScalar(.27+b*.18);}
      blockSprite.visible=frame.block&&(frame.blockLevel!=='his'||frame.atrialAge>=150);if(frame.saBlocked)blockSprite.visible=true;blockSprite.position.copy(vec(frame.saBlocked?[-.79,.44,.24]:frame.blockLevel==='his'?[-.22,-.28,.27]:anchors.AV));
      const ventHot=(frame.ventMode===1||frame.preexcited)&&frame.ventAge>=0&&frame.ventAge<420,atrialHot=frame.atrialMode===1&&frame.atrialAge>=0&&frame.atrialAge<320;
      focusSprite.visible=ventHot||atrialHot||frame.af||frame.pvTrigger;focusSprite.position.copy(ventHot?focalV:focalA);focusSprite.scale.setScalar(frame.af?.34+.05*Math.sin(state.time*.04):.45);focusSprite.material.color.set('#ff304e');focusSprite.material.opacity=frame.af?.9:Math.max(.45,1.3-(ventHot?frame.ventAge:frame.atrialAge)/550);

      updateCircuits(frame);renderer.setRenderTarget(depths);renderer.setClearColor(0xffffff,1);renderer.clear();renderer.render(depthScene,camera);renderer.setRenderTarget(null);renderer.setClearColor(0,0);renderer.render(scene,camera);drawLabels();
      Lab.draw(frame);window.HeartSpatial?.draw(frame,heart.quaternion);
    }
    function playUI(){Lab.playUI();}
    $('play').onclick=()=>{state.running=!state.running;playUI()};$('auto').onclick=()=>{state.auto=!state.auto;$('auto').setAttribute('aria-pressed',state.auto)};
    $('cut').onclick=()=>{state.cut=!state.cut;$('cut').setAttribute('aria-pressed',state.cut)};
    $('label-mode').onchange=e=>{state.labelMode=e.target.value;labelDirty=true;persist()};
    $('opacity').oninput=e=>{state.opacity=Number(e.target.value)/100;$('opacity-value').textContent=e.target.value+'%'};
    $('speed').onchange=e=>{state.speed=Number(e.target.value);Lab.playUI()};
    $('scrub').oninput=e=>{state.stripStart=null;Lab.seek(Number(e.target.value));};
    root.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.yaw={front:-.1,back:Math.PI,left:-Math.PI/2,right:Math.PI/2}[b.dataset.view];state.pitch=.02;state.zoom=1;state.panX=state.panY=0;state.auto=false;$('auto').setAttribute('aria-pressed','false');$('view-title').textContent={front:'ANTERIOR · 前方视角',back:'POSTERIOR · 后方视角',left:'LEFT · 左侧视角',right:'RIGHT · 右侧视角'}[b.dataset.view];labelDirty=true;persist();});
    const pointers=new Map();let movement=0,lastDistance=0,dragging=false,hoverLast=0,panDrag=false;
    renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
    renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});dragging=true;movement=0;panDrag=e.shiftKey||e.button===2||e.button===1;state.auto=false;$('auto').setAttribute('aria-pressed','false');$('view-title').textContent='FREE VIEW · 自由视角';});
    renderer.domElement.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)){if(performance.now()-hoverLast>45){hover=pick(e.clientX,e.clientY);renderer.domElement.style.cursor=hover?'pointer':'grab';hoverLast=performance.now();}return;}
      const old=pointers.get(e.pointerId),dx=e.clientX-old.x,dy=e.clientY-old.y;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});movement+=Math.abs(dx)+Math.abs(dy);
      if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(lastDistance)state.zoom=Math.max(.6,Math.min(2.4,state.zoom*d/lastDistance));lastDistance=d;state.panX+=dx*.0025;state.panY-=dy*.0025;}
      else if(panDrag){state.panX+=dx*.005;state.panY-=dy*.005;}else{state.yaw+=dx*.007;state.pitch=Math.max(-1.4,Math.min(1.4,state.pitch+dy*.0055));}labelDirty=true;
    });
    renderer.domElement.addEventListener('pointerup',e=>{if(movement<6&&!panDrag)select(pick(e.clientX,e.clientY));pointers.delete(e.pointerId);lastDistance=0;dragging=false;persist();});
    renderer.domElement.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);lastDistance=0;dragging=false});renderer.domElement.addEventListener('pointerleave',()=>{hover=null});
    renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();state.zoom=Math.max(.6,Math.min(2.4,state.zoom*Math.exp(-e.deltaY*.0008)));labelDirty=true;},{passive:false});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.selected)select(null,false)});root.addEventListener('change',persist);
    window.addEventListener('openai:set_globals',e=>restore(e.detail?.globals?.widgetState?.privateContent));
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('loading').hidden=false;$('loading').textContent='显示已暂停，请刷新页面恢复。'});
    $('opacity').value=Math.round(state.opacity*100);$('opacity-value').textContent=Math.round(state.opacity*100)+'%';$('speed').value=state.speed;$('label-mode').value=state.labelMode;
    $('loading').hidden=true;new ResizeObserver(resize).observe(area);resize();select(null,false,false);
    window.HeartSpatial?.init();
    let prev=performance.now();function tick(now){const dt=Math.max(0,Math.min(80,now-prev));prev=now;frameDt=dt/1000;Lab.advanceECGDrag(dt);if(state.running)state.time=(state.time+dt*state.speed)%12000;if(state.auto)state.yaw+=dt/1000*Math.PI*2/32;render();requestAnimationFrame(tick)}requestAnimationFrame(tick);
    window.heartViewer={state,renderer,scene,camera,network,select,render,heart,stats:{anatomicalMeshes:surfaces.length,conductionSegments:fibers.length,triangles:surfaces.reduce((n,s)=>n+s.g.index.count/3,0)}};
    window.heartReady=true;area.dataset.ready='true';
  } catch(e) { fail(e); }
})();
