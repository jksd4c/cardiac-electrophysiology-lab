/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
/* Complete English notices, accessible labels and event-clock terminology. */
(function(){
'use strict';
const pairs=`
局部放大|Local detail views
右室内膜|RV endocardium
左室内膜|LV endocardium
右|Right
BodyParts3D 4.0 · 左房壁 + 四组肺静脉；默认后面观，拖动可旋转|BodyParts3D 4.0 · LA wall and four PVs; posterior view by default, drag to rotate
 当前室早联律间期 | Current PVC coupling interval 
 示意触发间期 | Illustrative trigger interval 
 ms，红色提前激动只进入示例中已恢复的细胞。| ms. Red premature activation enters only cells that have recovered in this example.
室早|PVC
未出现 R≥S|No R≥S transition
上方观|Superior view
下方观|Inferior view
δ 波起始|Delta-wave onset
两路融合|Fusion of two activation paths
继发复极|Secondary repolarization
室性心律失常共识|Ventricular arrhythmia consensus
eRhythmos · 心脏电活动实验室 · v1.0.1|eRhythmos · Cardiac Electrophysiology Lab · v1.0.1
窦房结发放|SA node firing
· 左房壁 FJ2438 与四组肺静脉原始网格，统一坐标；肺静脉显示细分保留源开口边界。© The Database Center for Life Science，CC BY 4.0。|· LA wall FJ2438 and four PV meshes in shared coordinates. Display subdivision preserves source opening boundaries. © The Database Center for Life Science, CC BY 4.0.
异常节律示例频率|Example abnormal rhythm rate
与心脏同步的传导回路示意|Conduction circuit synchronized with the heart
当前搏动与正常窦搏十二导联形态对照|Current beat versus sinus reference in 12 leads
额面瞬时心电向量与导联轴|Instantaneous frontal vector and lead axes
十二导联的十个电极位置示意|Ten electrode positions for the 12-lead ECG
以下教材的官方版本与目录用于建立学习框架；各场景另附机制参考链接。波形、回路和组织活动为原创教学示意，不复刻教材原图，也不声称逐页核对整本教材。|Official editions and contents establish the learning framework; individual scenarios link to mechanism references. Waveforms, circuits and tissue activity are original teaching illustrations, not reproduced textbook figures or a page-by-page validation of complete textbooks.
jksd4c · GPT-6 Astra 辅助制作 · v1.0.1 · 开源发布|jksd4c · Developed with GPT-6 Astra · v1.0.1 · Open source
本项目用交互式心脏模型帮助学习传导系统、心律失常与心电图。模型及信号经过教学简化，未经临床用途验证，不作为诊断、治疗或消融定位依据。|An interactive model for learning cardiac conduction, arrhythmias and ECGs. Anatomy and signals are simplified for teaching and are not validated for diagnosis, treatment or ablation localization.
解剖表面来自 BodyParts3D，经 OrganUI 整理；左房及肺静脉来自同一官方图谱。已进行网格量化、显示与局部视图调整，并叠加教学传导路径。BodyParts3D © The Database Center for Life Science，|Anatomical surfaces come from BodyParts3D via OrganUI; the LA and PVs use the same official atlas. Meshes are quantized and adapted for display and local views, with teaching conduction overlays. BodyParts3D © The Database Center for Life Science, 
心电图由规则及模板合成，未使用真实患者心电记录。教材、指南和论文用于知识核对，书目及官方链接见“教材与模型目录”；不附其全文或原图。|ECGs are synthesized from rules and templates, without patient recordings. Textbooks, guidelines and papers support knowledge checks. Bibliography and official links appear in References & rhythm catalog; full texts and original figures are not included.
Three.js r160 使用 MIT 许可；GPT-6 Astra 用于辅助开发。来源署名不代表相关作者、机构或 OpenAI 对本项目背书。感谢公开资源的作者与维护者。|Three.js r160 is MIT licensed. GPT-6 Astra assisted development. Attribution does not imply endorsement by authors, institutions or OpenAI. We thank the authors and maintainers of these public resources.
本项目原创代码采用 GPL-3.0-only，作者免费提供官方版本。第三方模型与运行库保留各自许可；教学用途说明不增加许可证以外的使用限制。|Original project code is licensed under GPL-3.0-only; the author provides the official version free of charge. Third-party models and libraries retain their own licenses. The educational notice adds no restrictions beyond the applicable licenses.
本模型面向教学、学习与交流，以开源教学版本发布。原创代码与原创说明文档采用 GPL-3.0-only；第三方内容适用其各自许可，完整授权范围见 LICENSING.md。|Released as an open-source educational model for learning and discussion. Original code and original documentation use GPL-3.0-only. Third-party materials retain their own licenses; see LICENSING.md for the scope.
解剖外形来自公开图谱，传导路径和局部组织为教学叠加。心电图是合成信号，未经临床用途验证，不作为个体诊断、治疗、用药、消融定位或风险预测依据。本模型可能存在程序、解剖及波形偏差。|Atlas anatomy carries teaching overlays of conduction paths and local tissue. Synthetic ECGs are not clinically validated and must not guide individual diagnosis, treatment, medication, ablation or risk prediction. This model may contain software, anatomical or waveform errors.
BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International. 主心脏经 OrganUI 提供；左房及肺静脉取自同一官方图谱。|BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International. The main heart is supplied via OrganUI; the LA and PVs come from the same official atlas.
OrganUI 对网格进行选择、分组、三角化、坐标轴转换、缩放、法线及颜色处理；本项目去除主视图冠脉组，量化压缩网格、调整半透明显示，并为左房／肺静脉局部视图进行配准、放大与细分，叠加教学传导网络。模型和派生图像保留原许可及上述修改说明。|OrganUI selected, grouped and triangulated meshes, transformed axes and scale, and processed normals and colors. This project removes the main-view coronary group, quantizes meshes, adjusts transparency, and registers, enlarges and subdivides LA/PV views with teaching conduction overlays. Retain the original license and these modification notices with models and derived images.
历史 OBJ 头标注 CC BY-SA 2.1 Japan，官方当前数据库许可页标注 CC BY 4.0；本项目记录差异并依据已核实的官方当前授权，不延伸到其他来源不明的文件。|Historical OBJ headers specify CC BY-SA 2.1 Japan; the current official database page specifies CC BY 4.0. This difference is documented, and the verified current official grant is used. It does not extend to files of unknown provenance.
医学参考仅作知识核对与导航，不表示将教材、论文或原图纳入项目开源。第三方权利不因本项目声明而改变。GPT-6 Astra 为辅助工具，不表示 OpenAI 审校或背书，项目开源不包含该模型的权重或服务。|Medical references are for knowledge checks and navigation; their texts and figures are not part of this project's open-source materials. Third-party rights remain unchanged. GPT-6 Astra is an assisting tool, without OpenAI review or endorsement. Its weights and services are not included.
在法律允许范围内按现状提供，不保证完全无误或适合特定用途。本声明不排除依法不得免除的责任，也不削减适用开源许可授予的权利。完整版见随包 DISCLAIMER.zh-CN.md。|Provided as is to the extent permitted by law, without a guarantee of accuracy or fitness. This notice does not exclude non-excludable liability or reduce rights granted by applicable open-source licenses. See the included DISCLAIMER.en.md.
网格压缩、材质显示、局部配准与显示细分见完整教学声明和随包 THIRD_PARTY_NOTICES.md。模型及其截图、录像再分发时请保留来源、许可和修改说明。|Mesh compression, materials, local registration and display subdivision are documented in the full notice and THIRD_PARTY_NOTICES.md. Keep attribution, licenses and modification notices when redistributing models, screenshots or videos.
 · 左房壁 FJ2438 与四组肺静脉原始网格，统一坐标；肺静脉显示细分保留源开口边界。© The Database Center for Life Science，CC BY 4.0。| · LA wall FJ2438 and four PV meshes in shared coordinates. Display subdivision preserves source opening boundaries. © The Database Center for Life Science, CC BY 4.0.
第 2–6 章：基础与导联；第 8 章：束支阻滞；13–16 章：窦性、房性、交界性与室性节律；17–18 章：房室阻滞及预激；21 章：心脏骤停节律。|Ch. 2–6: basics and leads; Ch. 8: bundle branch block; Ch. 13–16: sinus, atrial, junctional and ventricular rhythms; Ch. 17–18: AV block and preexcitation; Ch. 21: cardiac arrest rhythms.
解剖来源：|Anatomy source: 
节律和播放设置|Rhythm and playback settings
选择心律|Select rhythm
暂停在当前示例的关键事件|Pause at the key event in this example
三维心脏及传导系统|3D heart and conduction system
解剖方位立方体|Anatomical orientation cube
心肌显影强度|Myocardial opacity
同步十二导联心电图|Synchronized 12-lead ECG
心电图显示时间窗|ECG time window
上一心电图窗口|Previous ECG window
下一心电图窗口|Next ECG window
选中导联放大，拖动游标可定位时间|Selected lead detail; drag to scrub time
在心电图上拖动十二秒进度|Scrub the 12-second ECG clip
同步时间轴|Synchronized timeline
定位十二秒教学片段|Seek within the 12-second teaching clip
片段中的心电事件|ECG events in this clip
局部放大与导联解释|Local views and lead explanations
按需展开的观察窗口|Optional detail panels
筛选模型目录|Filter model catalog
如 LBBB、室早、AVRT|e.g. LBBB, PVC, AVRT
点击查看完整声明、资源来源和第三方许可|View the full notice, attribution and third-party licenses
室早联律间期|PVC coupling interval
局部同步心电图|Synchronized local ECG
局部电活动及恢复时间示意|Local activity and recovery illustration
His 束下传|His bundle conduction
His–浦肯野|His–Purkinje
不可判读|Not interpretable
交界性激动逆传心房|Retrograde atrial activation from the AV junction
交界性逸搏下传|Conducted junctional escape
停搏|Arrest
室颤 · 心室多波前紊乱激动|VF · Disorganized ventricular wavefronts
左 / 右束支下传|Left / right bundle conduction
平均 · 含室早|Mean · Includes PVCs
平均 · 含房早|Mean · Includes PACs
平均心室率 · RR 不齐|Mean ventricular rate · Irregular RR
异位心室激动 · 宽 QRS|Ectopic ventricular activation · Wide QRS
异位心房激动|Ectopic atrial activation
心室复极 · T 波|Ventricular repolarization · T wave
房室传导延迟 · PR |AV conduction delay · PR 
房室结内传导 · 进入 His 束|AV nodal conduction → His bundle
房颤 · 心房紊乱激动|AF · Disorganized atrial activation
房颤 · 房室结不规则下传|AF · Irregular AV conduction
无有组织心室率|No organized ventricular rate
浦肯野 → 心室去极化|Purkinje → Ventricular depolarization
窦房结 → 心房去极化|SA node → Atrial depolarization
肺静脉触发 · 向左房传播|PV trigger → Left atrium
舒张间期 · 等待下一次激动|Diastole · Awaiting next activation
阻滞 · 本次 P 波未下传|Block · This P wave is not conducted
 · 下一次激动前| · Before next activation
 · 交界区发放并下传| · Junctional firing and conduction
 · 室性激动| · Ventricular activation
F 波持续|Continuous F waves
P′ 未下传|Nonconducted P′
下一次传出|Next exit impulse
下传 QRS|Conducted QRS
交界性提前搏动|Premature junctional beat
交界性逸搏接管|Junctional escape takes over
交界性逸搏|Junctional escape
传出激动|Exit impulse
关键激动|Key activation
初始激动|Initial activation
发作前|Before onset
另一束支图形|Alternate bundle morphology
后续搏动|Subsequent beat
回路传播|Circuit propagation
室早主波|PVC main deflection
室速开始|VT onset
室速自止|VT termination
尖端扭转|Torsades de pointes
平均外显率 · 窦房文氏|Mean visible rate · SA Wenckebach
平均外显率 · 窦房漏搏|Mean visible rate · SA dropped beats
平均心室率|Mean ventricular rate
平均率 · 不齐|Mean rate · Irregular
平均率 · 期前收缩|Mean rate · Premature beats
延迟区域|Delayed region
延长的 T 波|Prolonged T wave
心室激动|Ventricular activation
心电静止 · 无可辨电活动|Asystole · No recognizable electrical activity
心电静止|Asystole
快速房颤|Rapid AF
恢复窦性下传|Restored sinus conduction
房内大折返 · |Atrial macroreentry · 
房内折返 / 房室滤过|Atrial reentry / AV filtering
房室下传|AV conduction
房室分离示例|AV dissociation example
房颤终止后的长间歇|Long pause after AF termination
提前宽 QRS|Premature wide QRS
提前激动前|Before premature activation
教学示例|Teaching example
旁道与房室结–His 下传融合|Fusion of accessory-pathway and AV node–His activation
旁道提前激动心室 · δ 波|Accessory-pathway ventricular preexcitation · Delta wave
无可辨电活动|No recognizable electrical activity
最后一搏|Final beat
机制观察|Mechanism view
束支 / 分支传导异常 · 延迟激动|Bundle / fascicular conduction abnormality · Delayed activation
矢量投影合成教学 ECG；不从解剖网格求解体表电位，不用于定位或诊断。|Teaching ECG synthesized from vector projections; body-surface potentials are not solved from the anatomical mesh. Not for localization or diagnosis.
示例平均率 · 旁道下传|Example mean rate · Accessory-pathway conduction
示例节律率|Example rhythm rate
窦律恢复|Sinus rhythm resumes
窦性 P 波|Sinus P wave
窦性 QRS 对照|Sinus QRS reference
窦性停搏 · 等待逸搏|Sinus arrest · Awaiting escape
窦性停搏|Sinus arrest
窦性起搏 · |Sinus pacing · 
窦房冲动未传出|SA impulse fails to exit
窦房结已发放 · 窦房传出阻滞|SA node fires · Sinoatrial exit block
第二个室早|Second PVC
终末激动|Terminal activation
节律对照|Rhythm reference
触发室早|Trigger PVC
转复后停顿|Post-conversion pause
转复后长间歇|Long post-conversion pause
较慢窦律恢复|Slower sinus rhythm resumes
连续室性激动|Successive ventricular activation
间歇 / 逸搏|Pause / Escape
间歇观察|Pause view
随呼吸样周期变化|Varies with a respiratory-like cycle
胸导联正向一致|Positive precordial concordance
胸导联负向一致|Negative precordial concordance
多次转换|Multiple transitions
未见|None
T 波|T wave
P 波|P wave
窦性|Sinus
期前收缩|Premature beat
正常对照|Normal reference
逸搏|Escape
紊乱|Disorganized
逆传|Retrograde
颤动|Fibrillation
停顿|Pause
选择 |Select 
 导联| lead
。|.
`;
window.HeartI18n.add(pairs.trim().split('\n').map(s=>{const i=s.indexOf('|');return [s.slice(0,i),s.slice(i+1)];}));
})();

window.HeartI18n.add([["开源许可", "Open-source license"], ["源码仓库", "Source repository"], ["许可范围", "License scope"], ["原创代码 · GPL-3.0-only 完整许可", "Original code · Full GPL-3.0-only license"], ["简短隐私说明", "Privacy at a glance"], ["模型和心电图在浏览器本地计算，不要求注册，不提供患者资料上传功能，未内置广告或访问统计脚本。", "The model and ECG run locally in your browser. No registration, patient-data upload, advertising or analytics scripts are built in."], ["仅在本机保存中英文语言偏好；清除浏览器网站数据即可删除。浏览网页及打开外部链接时，托管平台和外部站点可能处理 IP 地址等访问记录，并适用各自的隐私政策。", "Only your language preference is stored locally; clearing the site's browser data removes it. Hosting providers and external sites may process access logs such as IP addresses when you visit them, under their own privacy policies."], ["主动通过邮件或 GitHub Issues 反馈时，相应服务会处理你提交的内容。公开 Issues 对所有人可见；请勿提交患者身份信息或其他敏感资料。", "Email and GitHub Issues services process information you voluntarily submit. Public issues are visible to everyone; do not include patient identifiers or other sensitive data."], ["隐私联系：", "Privacy contact: "], ["完整隐私说明", "Full privacy notice"], ["联系与反馈：", "Contact and feedback: "], ["项目 Issues", "Project issues"], ["反馈中请勿提交患者身份信息。", "Do not include patient identifiers in feedback."]]);
