/*
SPDX-License-Identifier: GPL-3.0-only
Copyright (C) 2026 jksd4c
See LICENSE for copying conditions and warranty disclaimer.
*/
const fs=require('node:fs'),vm=require('node:vm');
const H=require('./ecg-tools.js');
const body={nodeType:1,querySelectorAll:()=>[],matches:()=>false,hasAttribute:()=>false};
const context={window:{HeartRhythm:H,dispatchEvent:()=>{}},document:{body,documentElement:{},querySelector:()=>null,createTreeWalker:()=>({nextNode:()=>null}),querySelectorAll:()=>[]},NodeFilter:{SHOW_TEXT:4},localStorage:{getItem:()=> 'en',setItem:()=>{}},MutationObserver:class {observe(){}disconnect(){}},Event:class {}};
vm.createContext(context);for(const file of ['i18n.js','i18n-extra.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),context);
const membraneEntries=fs.readFileSync(__dirname+'/membrane-ui.js','utf8').match(/const entries = `([\s\S]*?)`;/)[1];
context.window.HeartI18n.add(membraneEntries.split('\n').map(s=>s.split('|')));
const t=context.window.HeartI18n.t,strings=new Set();
for(const [id,r]of Object.entries(H.rhythms)){
 for(const v of [r.name,r.ecg,r.mechanism,r.chapter,r.rate?.label])if(v)strings.add(v);
 const engine=new H.Engine({rhythm:id});for(let ms=0;ms<12000;ms+=37){strings.add(engine.frameAt(ms).title);const rates=engine.ratesAt(ms);for(const s of Object.values(rates))if(typeof s==='string')strings.add(s);}
 for(const mark of engine.markers||[])strings.add(mark[1]);
}
const html=fs.readFileSync(__dirname+'/laboratory-template.html','utf8').split('<script')[0]+fs.readFileSync(__dirname+'/membrane-panel.html','utf8');for(const match of html.matchAll(/>([^<>]+)</g))strings.add(match[1].trim());
for(const match of html.matchAll(/(?:aria-label|placeholder|title)="([^"]+)"/g))strings.add(match[1]);
for(const file of ['local-model.js','viewer-v5.js','laboratory.js','mechanism-details.js','spatial-instruments.js'])for(const match of fs.readFileSync(__dirname+'/'+file,'utf8').matchAll(/'([^'\n]+)'/g))if(/[\u3400-\u9fff]/.test(match[1]))strings.add(match[1]);
const missing=[...strings].filter(s=>/[\u3400-\u9fff]/.test(t(s))&&s!=='中文'&&!s.startsWith('语言 /'));
for(const s of missing)console.log(JSON.stringify([s,t(s)]));
console.log('Untranslated:',missing.length,'of',strings.size);
module.exports={H,t,missing};
