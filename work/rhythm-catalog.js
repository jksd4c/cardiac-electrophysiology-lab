/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
/* Adult ECG teaching repertoire: patterns and mechanisms, not diagnostic classification by animation. */
(function(global){
'use strict';
const H=typeof module==='object'&&module.exports?require('./rhythm-engine.js'):global.HeartRhythm;
const sources=H.sources={
 gold:{name:'Goldberger · 第10版',url:'https://shop.elsevier.com/books/goldbergers-clinical-electrocardiography/goldberger/978-0-323-82475-0'},
 zipes:{name:'Zipes & Jalife · 第8版',url:'https://evolve.elsevier.com/cs/product/9780323757454?role=student'},
 sinus:{name:'MSD 专业版 · 窦房结功能障碍',url:'https://www.msdmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/sick-sinus-syndrome'},
 rsa:{name:'McGraw Hill · ECG Core Curriculum',url:'https://accessmedicine.mhmedical.com/content.aspx?bookid=3339&sectionid=277535337'},
 ectopic:{name:'MSD 专业版 · 异位室上性心律',url:'https://www.msdmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/ectopic-supraventricular-arrhythmias'},
 svt:{name:'2019 ESC · 室上性心动过速',url:'https://doi.org/10.1093/eurheartj/ehz467'},
 reentry:{name:'MSD 专业版 · 折返性室上速',url:'https://www.msdmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/reentrant-paroxysmal-supraventricular-tachycardias-psvt'},
 flutter:{name:'MSD 专业版 · 房扑',url:'https://www.msdmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/atrial-flutter'},
 wpw:{name:'MSD 专业版 · WPW',url:'https://www.msdmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/wolff-parkinson-white-syndrome-wpw-syndrome'},
 pvc:{name:'MSD 专业版 · 室性期前收缩',url:'https://www.msdmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/ventricular-premature-beats-vpb'},
 vt:{name:'2022 ESC · 室性心律失常',url:'https://doi.org/10.1093/eurheartj/ehac262'},
 va:{name:'2019 HRS/EHRA/APHRS/LAHRS · 室性心律失常共识',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC8453449/'},
 fasc:{name:'2019 APHRS · 三维标测共识',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC7132207/'},
 aivr:{name:'ECG Diagnosis · AIVR',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC5882183/'},
 tdp:{name:'MSD 专业版 · TdP',url:'https://www.msdmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/torsades-de-pointes-ventricular-tachycardia'},
 branch:{name:'MSD 专业版 · 束支与分支阻滞',url:'https://www.msdmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/bundle-branch-block-and-fascicular-block'},
 av:{name:'2018 ACC/AHA/HRS · 缓慢性心律与传导',url:'https://doi.org/10.1161/CIR.0000000000000628'},
 ront:{name:'R-on-T and the initiation of reentry revisited',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC11334931/'}
};
sources.af={name:'MSD 专业版 · 心房颤动',url:'https://www.msdmanuals.com/professional/cardiovascular-disorders/specific-cardiac-arrhythmias/atrial-fibrillation'};
const R=H.rhythms;
const groupNames={sinus:'01 · 窦性节律与窦房结',escape:'02 · 逸搏与加速自主节律',early:'03 · 房性 / 交界性期前收缩',atrial:'04 · 房性节律、房扑与房颤',svt:'05 · 折返性室上速与预激',av:'06 · 房室传导阻滞',vent:'07 · 室性期前收缩',vt:'08 · 室速与危险心律',branch:'09 · 束支 / 分支传导图形'};
function define(id,name,g,ecg,mechanism,chapter,source,extra={}){R[id]={name,group:groupNames[g],ecg,mechanism,chapter:'Goldberger 第 '+chapter+' 章',source,extended:true,...extra};}
for(const [id,r] of Object.entries(R)){r.source=id==='af'?'svt':id==='vf'?'vt':id==='pvc'?'pvc':id==='pac'?'ectopic':id.startsWith('escape')?'sinus':'av';r.group=groupNames[id==='sinus'?'sinus':id.startsWith('escape')?'escape':id==='pac'?'early':id==='pvc'?'vent':id==='af'?'atrial':id==='vf'?'vt':'av'];}
R.sinus.source='gold';R.af.source='af';R.af.detail='pv';
const rate=(value,min,max,label='示例节律频率')=>({rate:{value,min,max,label}});
define('brady','窦性心动过缓','sinus','窦性 P–QRS 关系保持，频率低于 60 次/分。','起搏仍来自窦房结，仅周期延长；本例不据此判断病因。','13','sinus',rate(45,30,59));
define('tachy','窦性心动过速','sinus','窦性 P 波先于每次 QRS，频率超过 100 次/分。','窦房结加快发放，仍沿正常房室传导途径下传。','13','gold',rate(130,105,180));
define('rsa','呼吸性窦性心律不齐','sinus','P 波形态一致；PP / RR 随呼吸样周期渐变。','用渐快、渐慢的窦性发放演示呼吸调节；可为生理现象。','13','rsa');
define('arrest','窦性停搏 · 非整倍数长间歇','sinus','P–QRS 成组消失；示例停顿不等于基础 PP 的整数倍。','窦房结暂时停止发放，随后交界性逸搏出现，再恢复窦律。','13','sinus');
define('saWenck','二度Ⅰ型窦房阻滞','sinus','PP 逐渐缩短后脱漏一组 P–QRS，呈周期性成组搏动。','窦房传出延迟递增，但增量递减；最终一次窦性冲动未传出。','13','sinus',{circuit:'sa'});
define('sa2','二度Ⅱ型窦房阻滞','sinus','停顿前 PP 恒定，漏搏后的长 PP 为基础 PP 的两倍。','窦房结继续发放，部分冲动不能传入心房；区别于窦性停搏。','13','sinus',{circuit:'sa'});
define('tachybrady','快慢综合征 · 转复后停顿','sinus','房颤结束后出现长间歇，随后逸搏，再恢复较慢窦律。','演示窦房结功能障碍的一种表现；综合征诊断还需临床资料。','13、15','sinus');
define('pacBlocked','房早未下传','early','提前 P′ 藏在前搏 T 波附近，随后没有 QRS。','房性冲动到达尚未恢复的房室结而阻滞；不要误认成窦房阻滞。','14','ectopic');
define('pacAberrant','房早伴差异性传导','early','提前 P′ 后出现 RBBB 样宽 QRS。','本例房早经房室结下传，右束支暂未恢复；宽 QRS 并非必然室早。','14、8','ectopic');
define('pjc','交界性期前收缩','early','提前窄 QRS，附近可见逆行 P′；本例 P′ 在 QRS 后。','交界区提前发放，分别向心室顺传、向心房逆传。','14','ectopic');
define('atrialRhythm','异位房性心律','atrial','非窦性 P′ 形态稳定，频率在 100 次/分以下。','固定房性起搏点主导本例节律，经房室结下传。','13、14','ectopic',rate(80,60,99));
define('wap','游走性心房起搏点','atrial','至少三种 P 波形态，PP、PR 不同，频率低于 100。','主导起搏部位在窦房结及不同房性区域间转移；保留可辨 P 波。','14','ectopic',rate(75,60,99));
define('at','局灶性房性心动过速','atrial','规则 P′–P′，本例 1∶1 房室下传。','固定房性灶快速发放；表面形态不能区分自律性、触发或微折返。','14','ectopic',rate(160,120,220));
define('atBlock','房速伴 2∶1 房室下传','atrial','P′ 频率高于心室率；每两次房性激动一次 QRS。','房性灶持续发放，房室结滤过；房室结不属于房速的必需回路。','14','ectopic',rate(180,140,240));
define('mat','多源性房性心动过速 · MAT','atrial','至少三种 P 波形态，PP / PR / RR 不齐，平均频率大于 100。','多个房性部位依次主导激动；与无离散 P 波的房颤区分。','14','ectopic',rate(130,110,170));
define('ajr','加速性交界性心律','escape','窄 QRS；本例 80 次/分，并有 QRS 后逆行 P′。','交界区自律性高于逸搏范围；这里用固定逆行房性激动示例。','13、14','ectopic',rate(80,60,100));
define('jt','交界性心动过速','svt','交界性窄 QRS 心动过速；本例伴逆行 P′。','交界区异常自动发放；不把所有交界性心动过速画成 AVNRT。','14','ectopic',rate(140,110,200));
define('flutter','典型房扑 · 2∶1 下传','atrial','连续规则 F 波；本例下壁导联负向锯齿波，心房 300、心室 150。','逆时针 CTI 依赖右房大折返：绕三尖瓣环，经过腔静脉–三尖瓣峡部。','15','flutter',{...rate(300,250,350,'心房扑动频率'),circuit:'flutter'});
define('flutterVar','典型房扑 · 变比例下传','atrial','F–F 规则，RR 随 2∶1、3∶1、4∶1 下传比例改变。','右房大折返持续，房室结传导比例变化；不等同于房颤。','15','flutter',{...rate(300,250,350,'心房扑动频率'),circuit:'flutter'});
define('atypicalFlutter','非典型房扑 · 左房环二尖瓣示例','atrial','规则房性快速活动，F 波形态可变；本例采用一种合成波形。','展示非 CTI 依赖的环二尖瓣大折返；真实回路必须依赖电生理标测。','15','svt',{...rate(260,220,320,'心房折返频率'),circuit:'mitral'});
define('avnrt','典型 AVNRT · 慢–快型','svt','规则窄 QRS，逆行 P′ 接近或埋入 QRS，短 RP。','房室结区慢径顺传、快径逆传；心房和心室通常不是回路必需组成。','14','reentry',{...rate(180,130,240),circuit:'avnrt'});
define('avnrtAtyp','非典型 AVNRT · 快–慢型','svt','规则窄 QRS，本例逆行 P′ 较晚、RP 长。','快径顺传、慢径逆传的机制例；长 RP 不能单凭体表 ECG 证明 AVNRT。','14','reentry',{...rate(150,120,200),circuit:'avnrtAtyp'});
define('avrt','顺向型 AVRT','svt','规则窄 QRS，QRS 后可见固定 RP 的逆行 P′。','顺传走房室结–His–浦肯野，逆传走旁道；本例旁道位于左侧。','14、18','svt',{...rate(180,130,240),circuit:'avrt'});
define('avrtAnti','逆向型 AVRT','svt','规则宽 QRS，心室完全或高度预激。','左侧旁道顺传、房室结–His 逆传；旁道位置与回路有其他变型。','14、18','svt',{...rate(180,130,230),circuit:'avrtAnti'});
define('wpw','心室预激图形 · WPW pattern','svt','PR 缩短、δ 波、QRS 增宽及继发性 ST–T 改变。','窦性激动同时经房室结及旁道下传，心室发生融合激动；仅图形不等于 WPW 综合征。','18','wpw',{circuit:'wpw'});
define('preAf','房颤伴心室预激','svt','不规则快速宽 QRS，宽度和形态逐搏变化。','房颤激动可经旁道快速到达心室；本例不使用房室结滤过后的普通房颤时序。','15、18','wpw',{circuit:'preAf',detail:'pv',...rate(220,180,280,'示例平均心室率')});
define('bigeminy','室早二联律','vent','一个窦性搏动后一个室早，反复交替。','固定室性灶提前激动；本例保留代偿间歇。','16','pvc');
define('trigeminy','室早三联律','vent','两个窦性搏动后一个室早，按组重复。','联律是室早的排列方式，不代表独立起源机制。','16','pvc');
define('couplet','成对室早','vent','两个连续宽 QRS 提前出现。','本例同一室性灶连续发放两次；三个或更多快速室性搏动才进入室速定义。','16','vt');
define('multifocal','多形态室早','vent','提前宽 QRS 至少两种形态。','用两个室性起点示例；真实多形态也可能来自同一灶的不同出口。','16','pvc');
define('interpolated','间位性室早','vent','室早插入两个窦性搏动之间，本例没有完全代偿间歇。','室性提前激动后，下一次窦性激动仍能下传；本例省略隐匿传导造成的 PR 变化。','16','pvc');
define('ront','R-on-T 室早','vent','提前 QRS 起始落在前搏 T 波内。','用于对照复极与不应期；R-on-T 并不意味着一定发生室速或室颤。','16','ront',{detail:'ventricle'});
define('aivr','加速性室性自主心律 · AIVR','escape','连续宽 QRS，示例约 90 次/分，起始周期逐渐缩短。','室性自律灶接管，本例发作时背景窦率 45；不据此诊断再灌注成功。','13、16','aivr',{...rate(90,65,110),focus:'vent'});
define('nsvt','非持续性单形性室速','vt','短阵六个连续宽 QRS，随后恢复窦性下传。','一段明确自止、短于 30 秒的室性心动过速。','16','vt',{...rate(180,130,230),circuit:'vt'});
define('vt','单形性室速 · 瘢痕相关示例','vt','规则宽 QRS，形态稳定；本例房室分离。','瘢痕边缘慢传导通道支持折返。这里只显示 12 秒，不能据片段判定是否持续 ≥30 秒。','16','vt',{...rate(170,120,230),circuit:'vt',detail:'ventricle',substrate:'scar'});
define('rvot','右室流出道室速 · RVOT','vt','本例 LBBB 样形态、下壁导联正向主波。','示例起点在右室流出道；该类常与触发活动有关，ECG 只能提供定位线索。','16','va',{...rate(160,120,220),focus:'rvot'});
define('fascVT','左后分支型特发性室速','vt','本例 RBBB 样、左上轴，QRS 相对普通室速较窄。','展示左室分支–浦肯野相关折返；其他分支型室速轴向可以不同。','16','fasc',{...rate(160,120,220),circuit:'fasc'});
define('bbrVT','束支折返性室速','vt','本例呈 LBBB 样宽 QRS。','右束支顺传、左束支逆传，经室间隔肌返回；为束支折返的一种方向。','16','va',{...rate(200,150,260),circuit:'bbr'});
define('pmvt','多形性室速 · 基础 QT 未延长','vt','QRS 形态与电轴逐搏改变，发作前 QT 未明显延长。','示范多形性室速；不能把所有多形性室速统称 TdP。','16','vt',{...rate(220,180,260),focus:'poly'});
define('tdp','尖端扭转型室速 · TdP','vt','发作前 QT 延长；随后宽 QRS 轴向和幅度绕基线扭转。','长 QT、复极离散及早后除极提供触发背景；局部图演示 EAD，并非离子通道求解。','16、11','tdp',{...rate(220,180,260),detail:'ventricle',substrate:'longqt',focus:'poly'});
define('bidir','双向性室速','vt','宽 QRS 额面电轴逐搏交替。','用交替激动方向表现形态；可见于 CPVT、地高辛中毒等，不由图形确定病因。','16、20','vt',{...rate(180,130,230),focus:'bidir'});
define('ventFlutter','心室扑动','vt','快速近正弦样波形，QRS 与 T 波难以分开。','展示极快速而相对规则的室性电活动，与完全紊乱的室颤区分。','16、21','gold',{...rate(300,250,350),focus:'vent'});
define('asystole','心电静止 · 终末停搏示例','vt','前几搏后所有可辨心电活动消失。','教学中的全心电静止；临床平直线须排除电极脱落、增益问题及细颤，ECG 本身不判断脉搏。','21','gold');
define('rbbb','完全性右束支阻滞','branch','QRS ≥120 ms；V1 终末 R′，I / V6 宽终末 S。','左束支先激动左室，右室经跨室间隔肌延迟激动。','8','branch',{branch:'rbbb',circuit:'branch'});
define('lbbb','完全性左束支阻滞','branch','QRS ≥120 ms；V1 负向主波，I / V6 宽大或切迹 R。','右束支先下传，左室经室间隔及心肌延迟激动。','8','branch',{branch:'lbbb',circuit:'branch'});
define('lafb','左前分支阻滞','branch','本例左上电轴、aVL qR、下壁 rS；QRS 仅轻度增宽。','左后分支先激动，随后传播到左室前上区域。','8','branch',{branch:'lafb',circuit:'branch'});
define('lpfb','左后分支阻滞','branch','本例右下电轴、I / aVL rS、下壁 qR。','左前分支先激动；临床诊断需排除其他右轴原因，孤立 LPFB 较少见。','8','branch',{branch:'lpfb',circuit:'branch'});
define('bifasc','右束支 + 左前分支阻滞','branch','RBBB 形态合并左上电轴。','两条分支传导受限，经保留的左后分支下传；不等于三度房室阻滞。','8、17','branch',{branch:'rbbLaf',circuit:'branch'});
define('bifascLP','右束支 + 左后分支阻滞','branch','RBBB 形态合并右下电轴。','经保留的左前分支下传；本例用理想化的双分支受阻演示。','8、17','branch',{branch:'rbbLpf',circuit:'branch'});
define('altBBB','交替性束支阻滞','branch','分段交替出现 RBBB 与 LBBB 形态。','交替受累提示广泛传导系统异常；本例按四搏一组切换，不模拟药物或负荷试验。','8、17','branch',{branch:'alternating',circuit:'branch'});
H.groupOrder=Object.values(groupNames);H.catalogCount=Object.keys(R).length;
if(typeof module==='object'&&module.exports)module.exports=H;
})(typeof window==='undefined'?globalThis:window);
