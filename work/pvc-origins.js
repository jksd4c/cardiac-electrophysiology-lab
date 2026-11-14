/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
(function(global){
'use strict';const H=typeof module==='object'&&module.exports?require('./rhythm-catalog.js'):global.HeartRhythm;
// Qualitative site examples. Coordinates are teaching landmarks in atlas space, not mapped patient foci.
H.pvcSites={
 pvcRVOT:{name:'室早 · RVOT 间隔侧',focus:[-.17,.12,.56],axis:[.60,-1.35,-.75],qrs:150,profile:'rvot',clues:'LBBB 样；下壁导联正向；本例 R/S 移行在 V4。',note:'右室流出道间隔侧示例。移行位置与导联放置、心脏转位有关。'},
 pvcRVOTFree:{name:'室早 · RVOT 游离壁',focus:[-.55,.03,.77],axis:[.48,-1.10,-.78],qrs:180,profile:'rvotFree',clues:'LBBB 样；移行较晚；下壁 R 波较宽并带切迹。',note:'与间隔侧对照：本例 QRS 更宽、V5 才以 R 波为主。'},
 pvcLVOT:{name:'室早 · LVOT 主动脉窦邻近',focus:[.12,-.06,.13],axis:[.57,-1.25,.24],qrs:150,profile:'lvot',clues:'下壁导联正向；V1 有初始 r；本例 V2 提前移行。',note:'左室流出道示例。不能仅凭 V2 移行区分左冠窦、右冠窦、交界或壁内起源。'},
 pvcSummit:{name:'室早 · 左室 summit 区域',focus:[.36,.04,.50],axis:[-.42,-1.25,.78],qrs:185,profile:'summit',clues:'下壁轴；胸导联早移行；QRS 起始钝化。',note:'左室顶部心外膜区域示例。拟 δ 反映缓慢初始激动，不等同于房室旁道预激。'},
 pvcPapPost:{name:'室早 · 左室后内侧乳头肌',focus:[.51,-.90,-.04],axis:[.72,1.03,.68],qrs:165,profile:'papPost',clues:'RBBB 样；左上轴；本例 V4 转为 rS。',note:'乳头肌解剖和出口变化可造成同一来源多种 QRS，不能只看形态作唯一定位。'},
 pvcPapAnt:{name:'室早 · 左室前外侧乳头肌',focus:[.72,-.64,.45],axis:[-1.10,-.38,.70],qrs:165,profile:'papAnt',clues:'RBBB 样；右下轴；本例 II、III 主波方向不同。',note:'左室前外侧乳头肌示例；与后内侧乳头肌比较额面轴及胸导联移行。'},
 pvcMitral:{name:'室早 · 二尖瓣环前外侧',focus:[.60,-.28,.16],axis:[.48,-1.1,.72],qrs:165,profile:'mitral',clues:'RBBB 样；下壁轴；胸导联正向一致性。',note:'选择二尖瓣环前部的一种模式；其他瓣环部位会有不同电轴。'},
 pvcTricuspid:{name:'室早 · 三尖瓣环下部',focus:[-.70,-.46,.47],axis:[.45,.93,-.71],qrs:170,profile:'tricuspid',clues:'LBBB 样；上方电轴；胸导联晚移行。',note:'右室侧瓣环下部示例；并非所有三尖瓣环室早都呈同一电轴。'},
 pvcFasc:{name:'室早 · 左后分支 / 浦肯野',focus:[-.065,-.885,-.191],axis:[.66,1.02,.69],qrs:125,profile:'fasc',clues:'RBBB 样、左上轴；本例 QRS 125 ms，较心肌起源窄。',note:'局部浦肯野提前发放，与分支折返性室速的连续回路不同。'},
 pvcParaHis:{name:'室早 · His 旁区域',focus:[-.27,-.27,.20],axis:[.92,-.12,-.28],qrs:125,profile:'paraHis',clues:'本例 V1–V2 QS；I / aVL 正向较高；QRS 相对较窄。',note:'His 旁起源只是相对位置示意。临床需结合腔内电位与邻近结构标测。'}
};
for(const [id,s]of Object.entries(H.pvcSites)){H.rhythms[id]={name:s.name,group:'07b · 室早来源定位对照',ecg:s.clues,mechanism:s.note,chapter:'Goldberger 第 16 章；2019 室性心律失常共识 §5.2、§9.2–9.4',source:'va',extended:true,pvcSite:s,originKey:id};}
const at=H.groupOrder.indexOf('08 · 室速与危险心律');H.groupOrder.splice(at,0,'07b · 室早来源定位对照');H.catalogCount=Object.keys(H.rhythms).length;
if(typeof module==='object'&&module.exports)module.exports=H;
})(typeof window==='undefined'?globalThis:window);
