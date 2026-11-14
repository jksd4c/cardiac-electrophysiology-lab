/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
/* Local, offline bilingual interface. Text is authored for this teaching model. */
(function(){
'use strict';const H=window.HeartRhythm,dict=new Map(),zhRE=/[\u3400-\u9fff]/;let language='zh';try{language=localStorage.getItem('heart-language')==='en'?'en':'zh';}catch{}
const entries={
sinus:['Sinus rhythm','A P wave precedes each QRS; PR and RR remain constant.','SA node → atrial myocardium → AV nodal delay → His–Purkinje system.'],
escapeA:['Atrial escape rhythm','A delayed ectopic P wave follows a pause, then a narrow QRS. Example: 50 bpm.','A subsidiary atrial pacemaker takes over after sinus arrest; this is a late escape, not a premature beat.'],
escapeJ:['Junctional escape rhythm','A narrow QRS follows a pause. This example has a retrograde P wave after QRS; 50 bpm.','The AV junction activates ventricles forward and atria backward. Retrograde P timing varies clinically.'],
escapeV:['Ventricular escape rhythm','A delayed wide QRS has no related preceding P wave. Example: 30 bpm.','A distal ventricular pacemaker takes over when higher pacemakers fail.'],
av1:['First-degree AV block','PR is 260 ms; every P wave conducts.','This example places the delay in the AV node; first-degree AV delay may arise elsewhere.'],
mobitz1:['Second-degree AV block · Mobitz I','PR increases 180 → 230 → 270 ms, then a P wave fails to conduct; PR resets.','Progressive AV nodal delay followed by block is illustrated. Mobitz I is not always nodal.'],
mobitz2:['Second-degree AV block · Mobitz II','Conducted beats have a constant 180 ms PR, with intermittent nonconducted P waves.','His–Purkinje block is illustrated. This intra-His example has narrow QRS; QRS may be wide clinically.'],
av21:['2:1 AV block','Only one of every two P waves conducts. A fixed 2:1 strip alone cannot classify Mobitz I versus II.','Switch between nodal and His–Purkinje teaching examples; the surface strip does not establish the site.'],
advanced:['High-grade AV block · 3:1','Two consecutive P waves fail to conduct, with some AV conduction preserved.','This example has His–Purkinje block and differs from complete AV block.'],
completeJ:['Complete AV block · Junctional escape','P–P and R–R are individually regular but unrelated; junctional escape is 42 bpm with narrow QRS.','Atrial impulses cannot reach the ventricles; an independent junctional pacemaker drives the distal system.'],
completeV:['Complete AV block · Ventricular escape','AV dissociation; the ventricular escape rate is 30 bpm with wide QRS.','A distal ventricular pacemaker takes over independently after complete block.'],
pac:['Premature atrial contraction · PAC','An early altered P wave is followed by narrow QRS and a usually incomplete compensatory pause.','A left atrial ectopic focus fires early and conducts through the AV node.'],
pvc:['Premature ventricular contraction · PVC','An early wide QRS has no related preceding P wave; ST–T is discordant. A full compensatory pause is shown.','A ventricular focus bypasses the normal SA–AV sequence. Local views allow comparison of R-on-T timing.'],
af:['Atrial fibrillation · PV trigger','A short sinus segment is followed by PV firing, loss of discrete P waves and irregularly irregular RR.','A pulmonary vein trigger initiates disorganized atrial activation; AV filtering produces irregular ventricular conduction.'],
vf:['Ventricular fibrillation','Sinus rhythm gives way to chaotic waves without recognizable organized QRS–T complexes.','Multiple disorganized ventricular wavefronts are illustrated; no organized ventricular rate is reported.'],
brady:['Sinus bradycardia','Sinus P–QRS coupling is preserved at less than 60 bpm.','The SA node remains the pacemaker, with a longer cycle; no cause is inferred.'],
tachy:['Sinus tachycardia','Sinus P waves precede QRS at more than 100 bpm.','Faster SA firing uses the normal AV conduction pathway.'],
rsa:['Respiratory sinus arrhythmia','P morphology is consistent; PP and RR vary gradually.','A respiratory-like cycle modulates sinus timing; this may be physiological.'],
arrest:['Sinus arrest · Nonmultiple pause','P–QRS groups disappear; the pause is not an exact multiple of baseline PP.','Sinus firing stops transiently, a junctional escape appears, then sinus rhythm resumes.'],
saWenck:['Second-degree SA block · Type I','PP shortens progressively before a dropped P–QRS group.','SA exit delay increases by diminishing increments until one impulse fails to exit.'],
sa2:['Second-degree SA block · Type II','PP is constant before a pause equal to twice the baseline PP interval.','The SA node continues firing but an impulse fails to activate the atria.'],
tachybrady:['Tachy–brady pattern · Conversion pause','AF ends with a long pause, followed by escape and slower sinus rhythm.','An example of sinus node dysfunction; diagnosis also requires clinical information.'],
pacBlocked:['Nonconducted PAC','An early P wave may lie near the preceding T wave and is not followed by QRS.','The premature atrial impulse reaches a refractory AV node; this is not SA block.'],
pacAberrant:['PAC with aberrant conduction','An early P wave is followed by an RBBB-like wide QRS.','The PAC conducts while the right bundle is still refractory; wide QRS does not necessarily mean PVC.'],
pjc:['Premature junctional contraction','An early narrow QRS has a nearby retrograde P wave, shown here after QRS.','The AV junction fires early and conducts toward both ventricles and atria.'],
atrialRhythm:['Ectopic atrial rhythm','A stable nonsinus P morphology occurs below 100 bpm.','One ectopic atrial pacemaker drives the rhythm through the AV node.'],
wap:['Wandering atrial pacemaker','At least three P morphologies with variable PP and PR; rate below 100 bpm.','The dominant pacemaker shifts among atrial sites, with discrete P waves preserved.'],
at:['Focal atrial tachycardia','Regular ectopic P waves with 1:1 AV conduction in this example.','A focal atrial source fires rapidly; surface morphology does not determine its cellular mechanism.'],
atBlock:['Atrial tachycardia · 2:1 conduction','The atrial rate is twice the ventricular rate.','Atrial activity continues while the AV node filters alternate impulses.'],
mat:['Multifocal atrial tachycardia · MAT','At least three P morphologies, irregular PP/PR/RR and mean rate above 100 bpm.','Several atrial sites activate in sequence; discrete P waves distinguish this example from AF.'],
ajr:['Accelerated junctional rhythm','Narrow QRS at 80 bpm with retrograde P waves after QRS in this example.','Junctional automaticity exceeds the usual escape range.'],
jt:['Junctional tachycardia','A narrow-complex junctional tachycardia with retrograde P waves.','Automatic junctional firing is illustrated, rather than an AVNRT loop.'],
flutter:['Typical atrial flutter · 2:1 conduction','Regular flutter waves; this example has negative inferior sawtooth waves with atrial/ventricular rates 300/150.','Counterclockwise CTI-dependent right atrial macroreentry circles the tricuspid annulus.'],
flutterVar:['Typical atrial flutter · Variable conduction','F–F remains regular while RR changes with 2:1, 3:1 and 4:1 AV conduction.','The atrial circuit continues while AV conduction ratios vary; this is not AF.'],
atypicalFlutter:['Atypical flutter · Perimitral example','Regular rapid atrial activity with a representative synthetic F-wave morphology.','A non-CTI-dependent perimitral loop is illustrated; real circuit identification requires mapping.'],
avnrt:['Typical AVNRT · Slow–fast','Regular narrow QRS with a short RP; retrograde P may be buried in QRS.','Antegrade slow-pathway and retrograde fast-pathway conduction; atria and ventricles are usually not required in the circuit.'],
avnrtAtyp:['Atypical AVNRT · Fast–slow','Regular narrow QRS with a later retrograde P and long RP.','Antegrade fast-pathway and retrograde slow-pathway example; long RP alone does not establish AVNRT.'],
avrt:['Orthodromic AVRT','Regular narrow QRS followed by retrograde P at a fixed RP interval.','Antegrade AV node–His–Purkinje conduction and retrograde conduction through a left-sided accessory pathway.'],
avrtAnti:['Antidromic AVRT','Regular wide QRS with extensive ventricular preexcitation.','Antegrade left-sided accessory-pathway conduction and retrograde AV nodal–His conduction.'],
wpw:['Ventricular preexcitation · WPW pattern','Short PR, delta wave, wide QRS and secondary ST–T changes.','Sinus activation uses both the AV node and an accessory pathway, producing fusion; a pattern alone is not WPW syndrome.'],
preAf:['Preexcited atrial fibrillation','Fast irregular wide QRS with beat-to-beat variation in width and shape.','AF impulses reach the ventricles rapidly through an accessory pathway.'],
bigeminy:['Ventricular bigeminy','A sinus beat alternates with a PVC.','A fixed ventricular focus fires prematurely; compensatory pauses are retained.'],
trigeminy:['Ventricular trigeminy','Two sinus beats followed by one PVC, repeated.','This describes the arrangement of PVCs, not a separate origin mechanism.'],
couplet:['Ventricular couplets','Two consecutive premature wide QRS complexes.','Two successive ectopic ventricular beats are shown; this is distinct from a run of three or more.'],
multifocal:['Multiform PVCs','Premature wide QRS complexes have at least two morphologies.','Two foci are illustrated; clinically, multiple morphologies can also reflect different exits from one focus.'],
interpolated:['Interpolated PVCs','A PVC is inserted between sinus beats without a full compensatory pause.','The next sinus beat still conducts; concealed-conduction effects on PR are simplified here.'],
ront:['R-on-T PVC','The premature QRS begins during the preceding T wave.','Compare repolarization and refractoriness; R-on-T does not inevitably cause VT or VF.'],
aivr:['Accelerated idioventricular rhythm · AIVR','A wide-complex rhythm near 90 bpm, with gradual acceleration at onset.','A ventricular pacemaker takes over against a 45 bpm sinus background; this alone does not prove successful reperfusion.'],
nsvt:['Nonsustained monomorphic VT','A six-beat run of wide QRS complexes terminates, then sinus conduction resumes.','A clearly self-terminating ventricular tachycardia lasting less than 30 seconds.'],
vt:['Monomorphic VT · Scar-related example','Regular wide QRS with stable morphology and AV dissociation.','A slow-conduction channel around scar supports reentry. A 12-second clip does not establish a duration of 30 seconds or more.'],
rvot:['RV outflow tract VT','LBBB-like morphology with a positive inferior axis in this example.','An RVOT focus is illustrated; such arrhythmias are often triggered, but ECG supplies clues rather than definitive localization.'],
fascVT:['Left posterior fascicular VT','RBBB-like morphology, left superior axis and relatively narrow QRS.','Left ventricular fascicular–Purkinje reentry is illustrated; other fascicular circuits have different axes.'],
bbrVT:['Bundle branch reentrant VT','LBBB-like wide QRS in this example.','Antegrade RBB and retrograde LBB conduction form one possible bundle branch reentry direction.'],
pmvt:['Polymorphic VT · No baseline QT prolongation','QRS shape and axis change beat by beat; baseline QT is not markedly prolonged.','A polymorphic ventricular tachycardia example; not every polymorphic VT is TdP.'],
tdp:['Torsades de pointes · TdP','QT is prolonged before onset; subsequent QRS amplitude and axis twist around baseline.','Long QT, dispersed recovery and EADs provide a teaching context; the local view is not an ionic solver.'],
bidir:['Bidirectional VT','The frontal QRS axis alternates beat by beat.','Alternating activation directions illustrate the pattern; the image does not determine its cause.'],
ventFlutter:['Ventricular flutter','Very rapid near-sinusoidal activity with indistinguishable QRS and T.','Relatively regular fast ventricular activity, distinct from fully disorganized VF.'],
asystole:['Asystole · Terminal arrest example','Recognizable electrical activity disappears after several beats.','A teaching example of electrical silence; real flat traces require technical checks, and ECG alone cannot establish pulse status.'],
rbbb:['Complete right bundle branch block','QRS ≥120 ms, terminal R′ in V1 and broad terminal S in I/V6.','The left bundle activates the LV first; delayed RV activation crosses the septal myocardium.'],
lbbb:['Complete left bundle branch block','QRS ≥120 ms, dominant negative V1 and broad/notched R in I/V6.','The right bundle conducts first; LV activation is delayed through septal myocardium.'],
lafb:['Left anterior fascicular block','Left superior axis, qR in aVL and inferior rS; only mild QRS widening.','The posterior fascicle conducts first, followed by the anterosuperior LV.'],
lpfb:['Left posterior fascicular block','Right inferior axis, rS in I/aVL and inferior qR.','The anterior fascicle conducts first; other causes of right axis deviation must be excluded clinically.'],
bifasc:['RBBB + Left anterior fascicular block','RBBB morphology with a left superior axis.','Activation travels through the preserved posterior fascicle; this is not complete AV block.'],
bifascLP:['RBBB + Left posterior fascicular block','RBBB morphology with a right inferior axis.','The preserved anterior fascicle conducts in this idealized example.'],
altBBB:['Alternating bundle branch block','RBBB and LBBB morphologies alternate in blocks of beats.','Four-beat groups illustrate alternating involvement of the conduction system.'],
pvcRVOT:['PVC · Septal RVOT','LBBB-like; inferior leads positive; R/S transition at V4 in this example.','A septal RVOT focus; transition also depends on lead placement and cardiac orientation.'],
pvcRVOTFree:['PVC · RVOT free wall','LBBB-like, later transition and broader notched inferior R waves.','Compared with septal RVOT, QRS is wider and R becomes dominant only at V5.'],
pvcLVOT:['PVC · LVOT / Aortic sinus region','Inferior leads positive; initial r in V1 and early transition at V2.','An LVOT example; V2 transition alone cannot identify a particular cusp, commissure or intramural focus.'],
pvcSummit:['PVC · LV summit region','Inferior axis, early precordial transition and slow initial QRS upstroke.','An epicardial summit example; a pseudo-delta wave does not imply an AV accessory pathway.'],
pvcPapPost:['PVC · Posteromedial papillary muscle','RBBB-like, left superior axis; transition toward rS at V4.','Papillary muscle anatomy and variable exits can produce multiple QRS forms from one origin.'],
pvcPapAnt:['PVC · Anterolateral papillary muscle','RBBB-like, right inferior axis; II and III have different dominant polarities here.','Compare frontal axis and precordial transition with the posteromedial example.'],
pvcMitral:['PVC · Anterolateral mitral annulus','RBBB-like, inferior axis and positive precordial concordance.','One anterior mitral annular pattern; other annular sites have different axes.'],
pvcTricuspid:['PVC · Inferior tricuspid annulus','LBBB-like, superior axis and late precordial transition.','One inferior right-sided annular example, not a universal tricuspid annular pattern.'],
pvcFasc:['PVC · Posterior fascicle / Purkinje','RBBB-like with left superior axis; QRS is 125 ms in this example.','A premature Purkinje discharge differs from the continuous circuit of fascicular VT.'],
pvcParaHis:['PVC · Para-Hisian region','QS in V1–V2, prominent positive I/aVL and a relatively narrow QRS.','The focus is an anatomical teaching landmark; clinical localization requires intracardiac mapping.']
};
for(const [id,en]of Object.entries(entries)){const r=H.rhythms[id];for(let i=0;i<3;i++)dict.set(r[['name','ecg','mechanism'][i]],en[i]);}
const pairs=`
心脏电活动实验室|Cardiac Electrophysiology Lab
正常激动|Normal activation
异常激动 / 回路|Abnormal activation / circuit
选中结构|Selected structure
节律示例|Rhythm example
暂停|Pause
播放|Play
从头播放|Restart
关键事件|Key event
速度|Speed
实时|Real time
× 慢放|× slow motion
01 / 三维传导|01 / 3D CONDUCTION
02 / 同步十二导联|02 / SYNCHRONIZED 12-LEAD ECG
前面观|Anterior
上方观|Superior
下方观|Inferior
前面|Front
后面|Back
左侧|Left
右侧|Right
旋转|Rotate
切开心室前壁|Cutaway
标注|Labels
传导系统|Conduction
解剖结构|Anatomy
隐藏|Hidden
肌壁显影|Wall opacity
遮挡|Depth
空间遮挡|Spatial depth
透视查看|X-ray
向量与导联|Leads & vectors
时间窗|Window
2 秒|2 s
4 秒|4 s
6 秒|6 s
同一时间窗 · 直接拖动心电图定位 · 教学合成波形|Shared timeline · Drag to scrub · Synthetic teaching ECG
导联放大|Lead detail
重置缩放|Reset zoom
拖动至边缘连续翻窗 · 滚轮放大时间轴|Drag to an edge to keep scrolling · Wheel to zoom time
全段进度|Clip position
心电间期 · 模型估算|ECG intervals · Model estimates
上一搏|Latest beat
计算方法|Method
等待可识别的心搏。|Waiting for a recognizable beat.
QT 为合成 T 波切线估算；QTcB / QTcF 为两种校正示例。|QT uses the synthetic T-wave tangent; QTcB / QTcF demonstrate two correction formulas.
无可辨 QRS–T：不报告 QT / QTc。|No recognizable QRS–T: QT / QTc are not reported.
当前节律不规则或波形难以分界：QT / QTc 不报告。|Irregular activity or indistinct wave boundaries: QT / QTc are not reported.
宽 QRS：保留 QT 估算，不套用常规 QTc；可结合 JT 理解。|Wide QRS: QT is an estimate; routine QTc is withheld. Consider the JT component.
异位搏动或 RR 尚不稳定：QTc 暂不报告。|Ectopy or unstable RR: QTc is withheld.
T 波与后续激动重叠：QT / QTc 不报告。|T overlaps subsequent activation: QT / QTc are not reported.
规则|Regular
心房|Atria
心室|Ventricles
次/分|bpm
12 秒片段|12-second clip
心电图线索|ECG clues
传播机制|Activation mechanism
观察情境|Context
普通室早|Standard PVC
急性缺血 / 梗死相关|Acute ischemia / infarction context
梗死后瘢痕|Post-infarction scar
阻滞位置示例|Example block site
结内|AV nodal
His–浦肯野系统|His–Purkinje system
导联与心电向量|Leads & cardiac vectors
心室肌横截面|Ventricular wall section
左房 · 肺静脉|Left atrium · Pulmonary veins
回路与传导放大|Conduction circuits
单搏十二导联对照|Single-beat 12-lead comparison
教材与模型目录|References & rhythm catalog
收起窗口|Close panel
回路与传导|Conduction circuits
单搏形态 · 十二导联逐项对照|Single-beat morphology · 12 leads
以 QRS 起始对齐；蓝灰：基础窦搏，红：当前搏动。仅显示该搏 QRS–T 分量。|Aligned at QRS onset. Blue-gray: baseline sinus beat; red: current beat. Isolated QRS–T components only.
额面向量 · 肢体导联|Frontal vector · Limb leads
水平面向量 · 胸导联方向|Horizontal vector · Precordial lead directions
10 个电极 → 12 个导联|10 electrodes → 12 leads
心室壁局部 · 机制放大|Ventricular wall · Local mechanism
组织状态|Tissue state
正常|Normal
急性缺血|Acute ischemia
长 QT / EAD|Long QT / EAD
叠加 R-on-T 室早|Add R-on-T PVC
联律间期|Coupling interval
触发灶|Trigger focus
左上肺静脉|Left superior PV
左下肺静脉|Left inferior PV
右上肺静脉|Right superior PV
右下肺静脉|Right inferior PV
重播肺静脉触发|Replay PV trigger
正常去极化|Normal depolarization
异常激动|Abnormal activation
复极 / 未完全恢复|Repolarizing / not fully recovered
已恢复|Recovered
不可兴奋瘢痕|Inexcitable scar
先用教材建立框架，再按可核对的机制实现。|Textbook framework and traceable mechanisms
主参考|Reference
用来做什么|Purpose
本轮范围|Scope
筛选目录|Filter catalog
 个场景| scenarios
仅供学习，不作诊疗依据 · 声明与许可|For education, not clinical decisions · Notices & licenses
教学用途|Educational purpose
解剖模型与修改|Anatomy & modifications
信号与医学参考|Signals & medical references
代码与制作工具|Software & development tools
开放计划|Open-source plans
完整教学声明与发布状态|Full educational notice & release status
解剖来源与修改记录|Anatomy provenance & modifications
Three.js r160 · MIT 完整许可|Three.js r160 · Full MIT license
OrganUI · MIT 完整许可（上游代码／文档）|OrganUI · Full MIT license (upstream code / documentation)
BodyParts3D 官方授权|BodyParts3D official license
OrganUI 来源记录|OrganUI provenance
声明结构参考|Notice structure inspired by
的来源披露方式；未使用其代码或模型，不表示合作或获得其授权。|and its source-disclosure approach. No code or models from that project are used; no affiliation or endorsement is implied.
三维心电向量|3D cardiac vector
净向量|Net vector
导联投影|Lead projection
向量投影|Projection
与主模型同向旋转 · 胸导联方向为近似示意|Rotation linked to heart · Precordial axes are approximate
箭头指向导联正极时投影为正；垂直时接近零。|A vector toward the positive electrode gives a positive projection; a perpendicular vector approaches zero.
RVOT：下壁轴，V1 负向主波；结合胸导联移行观察。|RVOT: inferior axis and predominantly negative V1; also inspect precordial transition.
拖动旋转 · 滚轮缩放 · 点击结构与标签联动|Drag to rotate · Wheel to zoom · Click a structure or label
点击标签或结构，定位对应的传导组织。|Select a structure or label to highlight its conduction anatomy.
点击标签或三维结构，双向联动高亮|Click a label or 3D structure to highlight both
取消选中|Clear selection
局部查看|Focus structure
窦房结|SA node
房室结|AV node
希氏束|His bundle
右束支|Right bundle branch
左束支|Left bundle branch
左前分支|Left anterior fascicle
左后分支|Left posterior fascicle
浦肯野网络|Purkinje network
浦肯野|Purkinje
右心房|Right atrium
左心房|Left atrium
心室肌壁|Ventricular wall
右室内膜面|RV endocardium
左室内膜面|LV endocardium
主动脉|Aorta
肺动脉干|Pulmonary trunk
上腔静脉|SVC
前方视角|Anterior view
后方视角|Posterior view
左侧视角|Left view
右侧视角|Right view
前面观|Anterior view
后面观|Posterior view
左侧观|Left view
右侧观|Right view
自由视角|Free view
上部连接区|Upper connection
下部连接区|Lower connection
慢径|Slow pathway
快径|Fast pathway
向 His–心室输出|Output to His / ventricles
旁道|Accessory pathway
心房肌|Atrial myocardium
右室心肌|RV myocardium
左室心肌|LV myocardium
三尖瓣环|Tricuspid annulus
二尖瓣环|Mitral annulus
室间隔|Septum
分支–浦肯野|Fascicle–Purkinje
回路中心|Circuit center
下方通路：CTI|Inferior pathway: CTI
边缘通道：慢传导|Border channel: slow conduction
RBB 顺传 · LBB 逆传|Antegrade RBB · Retrograde LBB
红色箭头：传播方向|Red arrows: activation direction
滤过后下传|AV filtering
内部窦房冲动 ≠ 每次都能形成体表 P 波|An SA impulse does not always produce a surface P wave
虚线：经保留通路激动后，再经心肌传播|Dashed: myocardial spread after activation through preserved pathways
当前为窦性对照|Current beat: sinus reference
当前搏动|Current beat
 ms（设定） · 合成额面轴 | ms (model) · Synthetic frontal axis 
电极位置示意|Electrode positions
前面观 · 患者右侧在图左|Anterior view · Patient right is image left
心内膜侧|Endocardial side
心外膜侧|Epicardial side
正常组织|Normal tissue
急性缺血区域|Acute ischemic region
梗死后瘢痕与边缘区|Post-infarction scar & border zone
复极与兴奋性恢复|Repolarization & excitability recovery
长 QT 与早后除极|Long QT & EADs
肺静脉肌袖与左房连接|PV sleeves & LA junction
左房与肺静脉 · 解剖数据模型|Left atrium & pulmonary veins · Atlas geometry
心室壁横截面 · 局部放大|Ventricular wall section · Local view
拖动旋转 · 滚轮缩放|Drag to rotate · Wheel to zoom
触发 0 ms|Trigger 0 ms
A · 复极延长|A · Prolonged recovery
A · 正常区域|A · Normal region
B · 正常区域|B · Normal region
B · 缺血区域|B · Ischemic region
B · 瘢痕边缘|B · Scar border
B · EAD 示意|B · EAD example
室颤时不使用单一局部动作电位周期|A single local action-potential cycle is not used during VF
同步心电图 · 以本次窦性 QRS 起点为 0|Synchronized ECG · Zero = sinus QRS onset
局部电位为示意，无统一 mV 标尺|Local potentials are schematic, without a shared mV scale
正常心室激动到达局部组织|Normal ventricular activation reaches the tissue
室早激动进入已恢复的组织|PVC activates recovered tissue
提前激动遇到尚未恢复的区域|Premature activation encounters refractory tissue
室颤：局部激动失去有序传播|VF: disorganized local activation
TdP：复极延长背景下的多形性室速|TdP: polymorphic VT with prolonged repolarization
肺静脉触发灶短阵快速发放|Brief rapid firing from a PV trigger
心房紊乱维持 · 多波前示意|Disorganized atrial activation · Multiple wavefronts
房室延迟|AV delay
前搏 T 波|Preceding T wave
心房激动|Atrial activation
房早下传|Conducted PAC
提前 P′|Early P′
室早 QRS|PVC QRS
代偿间歇|Compensatory pause
房室分离|AV dissociation
独立逸搏|Independent escape
窦性停顿|Sinus pause
逸搏接管|Escape takes over
触发前|Before trigger
肺静脉触发|PV trigger
房颤维持|AF maintenance
室颤前|Before VF
室颤波|VF waves
P 未下传|Nonconducted P
心房扑动频率|Atrial flutter rate
心房折返频率|Atrial reentry rate
示例平均心室率|Example mean ventricular rate
示例节律频率|Example rhythm rate
三维心脏，点击结构高亮；拖动旋转，滚轮缩放|3D heart: click to highlight, drag to rotate, wheel to zoom
方位立方体，点击面切换视角；Enter 恢复前面观|Orientation cube: click a face; Enter restores anterior view
正在构建心脏与传导网络…|Building heart and conduction network…
正在解码真实解剖网格…|Decoding anatomical meshes…
显示已暂停，请刷新页面恢复。|Rendering paused. Reload the page to restore it.
模型载入失败：|Model loading failed: 
解剖网格加载失败：|Anatomy loading failed: 
起源点：|Origin: 
红色回路：|Red circuit: 
。模型位置为解剖关系示意，非患者标测点。|. Anatomical teaching landmark, not a patient mapping point.
。精确走行未由本图谱的传导组织分割确定。|. Exact conduction tissue was not segmented from this atlas.
电活动和 ECG 为同一时钟下的教学合成示例。|Activation and synthetic ECG share one teaching timeline.
导联、波形、间期、心律识别|Leads, waveforms, intervals and rhythm recognition
起搏与传播、复极 / 不应期、触发及折返的机制框架|Pacing, propagation, repolarization, refractoriness, triggers and reentry
细胞间传播、转子与心律失常、肺静脉与房颤、结构重构；局部视图采用简化的组织级示意。|Cell-to-cell propagation, rotors, AF triggers and structural remodeling; local views are simplified tissue-level illustrations.
教学重建的组织片段，非原始影像的显微切片。|Teaching reconstruction of a tissue fragment, not a microscopic image section.
可旋转的局部组织三维教学模型|Rotatable 3D tissue teaching model
分层心肌细胞的教学重建；A、B 为两个观察区域。|Layered myocardial cell illustration; A and B are observation regions.
箭头表示当前净心电向量，轨迹显示最近一个周期。|Arrow: instantaneous net vector. Trail: the recent cycle.
额面箭头：瞬时净向量；虚线：向选中导联轴的投影；轨迹：最近一个周期。|Frontal arrow: net vector. Dashed line: projection onto the selected lead axis. Trail: recent cycle.
X：患者左侧；Z：前方。此图仅示意水平面方向；胸导联另用局部形态模板，不能由单一向量投影精确还原。|X points left; Z points anterior. This shows approximate horizontal directions. Precordial morphology templates are not exactly reproduced by a single dipole projection.
时程为模型设定，电轴与 R/S 根据合成分量计算；胸导联使用病型形态模板。移行、电轴及某一导联形态不能单独证明起源位置。|Timing is prescribed; axis and R/S derive from synthetic components. Precordial leads use morphology templates. Transition, axis or a single lead cannot establish an origin alone.
回路拓扑为教学示意，不按解剖比例；方向箭头表示传播顺序，红叉表示受阻。此处不模拟消融效果或药物反应。|Circuit topology is schematic, not anatomically scaled. Arrows show sequence; red crosses show block. Ablation and drug responses are not simulated.
肢体导联遵循 Einthoven / Goldberger 关系；胸导联按病型合成典型形态，用于联动讲解，不是由该心脏网格求解的真实体表电位。旋转观察角度不会改变心电图。|Limb leads obey Einthoven / Goldberger relations. Precordial templates support linked teaching; they are not torso potentials solved from the heart mesh. View rotation does not change ECG signals.
正常心肌也存在生理性的复极差异。金色激动后，细胞逐渐复极并恢复兴奋性；紫色表示尚未充分恢复。|Normal myocardium also has recovery differences. After gold activation, cells repolarize and regain excitability; purple marks incomplete recovery.
急性缺血可使静息电位变得较不负、传导减慢，并增加局部恢复差异。本例特意区分“已复极”和“仍处于不应期”，不把缺血简单画成所有动作电位统一延长。|Acute ischemia can make resting potential less negative, slow conduction and increase recovery dispersion. Repolarization and residual refractoriness are distinguished; action potentials are not uniformly prolonged.
灰色瘢痕核心不能被激动；边缘区的存活心肌呈不同的恢复时间与传导延迟。瘢痕和急性缺血是不同的组织情境。|Gray scar is inexcitable. Surviving border-zone myocardium has heterogeneous recovery and conduction delay. Scar and acute ischemia are separate contexts.
长 QT 情境：动作电位延长，局部出现早后除极（EAD）。A、B 的复极时间不同；触发后的方向变化用于解释 TdP，不是数值模拟的离子流或真实患者标测。|Long-QT context: prolonged action potentials and local EADs. Regions A and B recover differently. Direction changes explain TdP conceptually, not simulated ionic currents or patient mapping.
长 QT、EAD 和多形性室速共用事件时钟；局部波前是机制示意，并非离子流或持续折返的数值求解。|Long QT, EAD and polymorphic VT share an event clock; local wavefronts are schematic, not ionic or sustained-reentry numerical solutions.
局部膜电位 / 不应期参数为示例；未求解持续折返，R-on-T 不等同于必然室颤。组织状态只切换局部示意，本轮未加入心梗定位的 ST–T 心电图。|Local potential and refractory parameters are illustrative. Sustained reentry is not solved; R-on-T does not imply inevitable VF. Tissue selection does not generate infarct-localizing ST–T changes.
肺静脉近心房侧可有心肌肌袖延伸。选择一个触发灶并点击“重播肺静脉触发”，观察快速异位激动进入左房，随后心房发生紊乱激动。|Myocardial sleeves may extend into pulmonary veins. Select a focus and replay the PV trigger to observe rapid ectopic activation entering the LA, followed by disorganization.
红色激动从所选肺静脉肌袖向左房传播；下方局部电位示意与全局十二导联使用同一触发时刻。|Red activation travels from the chosen PV sleeve into the LA. Local potentials and the 12-lead ECG share the trigger time.
短阵触发结束后，心房仍可在合适的基质上维持紊乱激动；本图以多个波前表示这一阶段，不把房颤等同于一个肺静脉永久快速起搏。|After the brief trigger ends, suitable atrial substrate may sustain disorganization. Multiple wavefronts illustrate maintenance; AF is not equated with permanent pacing from one PV.
解剖来自 BodyParts3D 图谱网格，并非个体 CT。触发点、波前及局部电位为教学叠加；原数据未分割心肌袖。其他触发与维持机制不在本例范围内。|Geometry is from the BodyParts3D atlas, not an individual CT. Triggers, wavefronts and potentials are teaching overlays; sleeves were not segmented. Other AF mechanisms are outside this example.
上腔静脉与右心房交界附近 · 窦性激动起点|Near the SVC–RA junction · Sinus activation origin
右房间隔下部 · 房室传导延迟|Inferior right atrial septum · AV delay
连接房室交界与室间隔的传导主干|Conduction trunk connecting AV junction and ventricular septum
沿室间隔右侧下行，连接右室远端传导网络|Descends along the right septum to the distal RV network
室间隔左侧的传导主干与分支|Main conduction trunk and fascicles on the left septum
向左室前外侧分布的传导分支|Fascicle toward the anterolateral LV
向左室下后侧分布的传导分支|Fascicle toward the inferoposterior LV
左右心室内膜下网络 · 将激动传向心室肌|Biventricular subendocardial network · Activates ventricular myocardium
右心房壁 · 窦房结与房室结所在的心房|Right atrial wall · Atrium containing SA and AV nodes
左心房壁 · 接受经心房肌传来的激动|Left atrial wall · Receives atrial activation
来源模型中的完整心室肌壁，包含左右心室与室间隔|Combined ventricular wall from the source atlas, including both ventricles and septum
显示右心室腔的内膜边界|Endocardial boundary of the RV cavity
显示左心室腔的内膜边界|Endocardial boundary of the LV cavity
升主动脉与主动脉弓|Ascending aorta and aortic arch
右室流出道上方的肺动脉干|Pulmonary trunk above the RVOT
上腔静脉与右心房的连接|SVC connection to the right atrium
V1：胸骨右缘第 4 肋间。|V1: fourth intercostal space, right sternal border.
V2：胸骨左缘第 4 肋间。|V2: fourth intercostal space, left sternal border.
V3：V2 与 V4 连线的中点。|V3: midway between V2 and V4.
V4：左锁骨中线第 5 肋间。|V4: fifth intercostal space, left midclavicular line.
V5：左腋前线，与 V4 同一水平。|V5: left anterior axillary line, level with V4.
V6：左腋中线，与 V4 同一水平。|V6: left midaxillary line, level with V4.
胸导联以 Wilson 中心电端为参考。|Precordial leads use the Wilson central terminal.
RL 为参考 / 地电极，不计入这 12 个导联。|RL is the reference/ground electrode and is not one of these 12 leads.
PR、QRS 为事件模型时程；QT 采用合成 T 波下降支最大斜率切线的基线交点。QTcB = QT / √RR；QTcF = QT / ∛RR（RR 以秒计）。房颤、明显 RR 不齐、重叠波形或宽 QRS 时不显示常规 QTc。仅作教学估算。|PR and QRS are event-model durations. QT uses the baseline intercept of the maximum-slope tangent on the synthetic T-wave downslope. QTcB = QT / √RR; QTcF = QT / ∛RR (RR in seconds). Routine QTc is withheld for AF, unstable RR, overlapping waves or wide QRS. Teaching estimates only.
`;
for(const line of pairs.trim().split('\n')){const i=line.indexOf('|');dict.set(line.slice(0,i),line.slice(i+1));}
const groups=['Sinus rhythms & SA node','Escape & accelerated rhythms','Atrial / junctional premature beats','Atrial rhythms, flutter & AF','Reentrant SVT & preexcitation','AV conduction block','Ventricular premature beats','Ventricular tachycardia & critical rhythms','Bundle / fascicular conduction'];for(const r of Object.values(H.rhythms)){const match=r.group.match(/^(\d{2}) ·/);if(match)dict.set(r.group,match[1]+' · '+groups[Number(match[1])-1]);}dict.set('07b · 室早来源定位对照','07b · PVC origin comparison');
const sourceNames={gold:'Goldberger · 10th ed.',zipes:'Zipes & Jalife · 8th ed.',sinus:'MSD Professional · Sinus node dysfunction',ectopic:'MSD Professional · Ectopic supraventricular rhythms',svt:'2019 ESC · Supraventricular tachycardia',reentry:'MSD Professional · Reentrant SVT',flutter:'MSD Professional · Atrial flutter',wpw:'MSD Professional · WPW',pvc:'MSD Professional · PVCs',vt:'2022 ESC · Ventricular arrhythmias',va:'2019 HRS/EHRA/APHRS/LAHRS · VA consensus',fasc:'2019 APHRS · 3D mapping consensus',tdp:'MSD Professional · TdP',branch:'MSD Professional · Bundle and fascicular block',av:'2018 ACC/AHA/HRS · Bradycardia & conduction',af:'MSD Professional · AF'};for(const [k,v]of Object.entries(sourceNames))dict.set(H.sources[k].name,v);
let replacements=[];function refresh(){replacements=[...dict.entries()].sort((a,b)=>b[0].length-a[0].length);}refresh();
function t(value){if(value==null)return '';let s=String(value);if(language!=='en'||!zhRE.test(s))return s;if(dict.has(s))return dict.get(s);const trimmed=s.trim();if(dict.has(trimmed))return s.replace(trimmed,dict.get(trimmed));for(const [zh,en]of replacements)if(zh.length>1&&s.includes(zh))s=s.split(zh).join(en);return s.replace(/第\s*([\d、–—， ,.\-]+)\s*章/g,(_,n)=>'Ch. '+n.replaceAll('、',', ')).replace(/第\s*(\d+)\s*版/g,'$1th edition').replaceAll('；','; ').replaceAll('：',': ').replaceAll('（',' (').replaceAll('）',')').replaceAll(' · 深部',' · deep').replaceAll('额面','frontal plane');}
const originals=new WeakMap(),attrs=new WeakMap();
function eligible(n){return n.parentElement&&!n.parentElement.closest('script,style,[data-language]');}
function translateNode(n){if(n.nodeType===3){if(!eligible(n))return;const s=n.nodeValue,prior=originals.get(n),source=prior&&s===prior.en?prior.zh:s;if(language==='en'&&zhRE.test(source)){const en=t(source);if(en!==s){originals.set(n,{zh:source,en});n.nodeValue=en;}}else if(language==='zh'){const old=originals.get(n);if(old&&s===old.en)n.nodeValue=old.zh;}return;}if(n.nodeType!==1)return;const walker=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);let child;while(child=walker.nextNode())translateNode(child);for(const el of [n,...n.querySelectorAll('[title],[aria-label],[placeholder],optgroup')]){if(el.matches('[data-language],script,style'))continue;for(const name of ['title','aria-label','placeholder','label']){if(!el.hasAttribute(name))continue;const val=el.getAttribute(name);let record=attrs.get(el)||{},source=record[name]&&val===record[name].en?record[name].zh:val;if(language==='en'&&zhRE.test(source)){record[name]={zh:source,en:t(source)};el.setAttribute(name,record[name].en);attrs.set(el,record);}else if(language==='zh'&&record[name]&&val===record[name].en)el.setAttribute(name,record[name].zh);}}}
let observer;function scan(root=document.body){observer?.disconnect();translateNode(root);observer?.observe(document.body,{childList:true,subtree:true,characterData:true});}
function setLanguage(next){language=next==='en'?'en':'zh';document.documentElement.lang=language==='en'?'en':'zh-CN';document.title=language==='en'?'Cardiac Electrophysiology Lab · v0.1.2':'心脏电活动实验室 · v0.1.2';try{localStorage.setItem('heart-language',language);}catch{}for(const b of document.querySelectorAll('[data-language]'))b.setAttribute('aria-pressed',b.dataset.language===language);scan();window.dispatchEvent(new Event('heart-language-change'));}
window.HeartI18n={t,setLanguage,get language(){return language;},add(entries){for(const [a,b]of entries)dict.set(a,b);refresh();scan();}};
observer=new MutationObserver(records=>{observer.disconnect();for(const record of records){if(record.type==='characterData')translateNode(record.target);else for(const n of record.addedNodes)translateNode(n);}observer.observe(document.body,{childList:true,subtree:true,characterData:true});});
document.querySelectorAll('[data-language]').forEach(b=>b.onclick=()=>setLanguage(b.dataset.language));setLanguage(language);
})();
