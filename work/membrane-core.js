/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 jksd4c
 * Phenomenological teaching overlay, not an ionic or patient-specific model.
 */
(function (root) {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mod = (a, b) => ((a % b) + b) % b;
  const smooth = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const palette = ['#243b9b', '#227ed0', '#31c6cb', '#a8e17c', '#ffe078', '#ff775d'];
  const phases = ['快速去极', '早期复极', '平台期', '快速复极', '静息期'];
  // Boundaries are fractions of local AP duration. The same expressions are
  // compiled into the surface shader below, so the probe and mesh agree.
  function actionPotential(age, duration = 300) {
    const u = age / duration;
    let phase = 4, voltage = -90;
    if (u >= 0 && u < .01) { phase = 0; voltage = -90 + 120 * smooth(u / .01); }
    else if (u >= .01 && u < .055) { phase = 1; voltage = 30 - 22 * smooth((u - .01) / .045); }
    else if (u >= .055 && u < .64) { phase = 2; voltage = 8 - 14 * ((u - .055) / .585); }
    else if (u >= .64 && u < 1) { phase = 3; voltage = -6 - 84 * smooth((u - .64) / .36); }
    return {voltage, phase, age, duration, recovery: phase === 0 ? null : clamp((30 - voltage) / 120, 0, 1)};
  }
  function branchDelay(code, key, p) {
    const left = key === 'LV' ? 1 : key === 'RV' ? 0 : smooth((p[0] + .18) / .30);
    let d = 0;
    if (['rbbb', 'rbbLaf', 'rbbLpf'].includes(code)) d += 60 * (1 - left);
    if (code === 'lbbb') d += 65 * left;
    if (['lafb', 'rbbLaf'].includes(code)) d += 22 * left * smooth((p[2] + .18) / .40);
    if (['lpfb', 'rbbLpf'].includes(code)) d += 22 * left * (1 - smooth((p[2] + .18) / .40));
    return d;
  }
  function parameters(engine, frame, atrial) {
    const beats = atrial ? engine.atria : engine.ventricles;
    const at = beats.findLastIndex(b => b.time <= frame.time);
    const rr = at > 0 ? beats[at].time - beats[at - 1].time : engine.period || engine.rr;
    const period = clamp(rr || 800, 150, 4000);
    const scale = clamp(Math.sqrt(period / 800), .65, 1.25);
    return {period, duration: (atrial ? 175 : frame.longQT ? 410 : 285) * scale};
  }
  function localDuration(key, p, params) {
    const atrial = key === 'LA' || key === 'RA';
    const variation = atrial ? 8 * p[0] : 16 * (p[1] + .8) - 9 * p[2] + (key === 'LV' || key === 'RV' ? 16 : 0);
    return clamp(params.duration + variation, 80, params.period * .86);
  }
  function localAge(probe, frame, params) {
    const {key, position: p, activation} = probe;
    const atrial = key === 'RA' || key === 'LA';
    const mode = atrial ? frame.atrialMode : frame.ventMode;
    let age = (atrial ? frame.atrialClock : frame.ventClock) - activation - (atrial ? 0 : branchDelay(frame.branch, key, p)) - 8;
    const focus = atrial ? frame.atrialFocus || (frame.a?.kind === 'escapeA' ? [-.92, -.10, .42] : frame.a?.kind === 'retrograde' ? [-.407, -.3, .028] : [.36, .14, -.43]) : frame.ventricularFocus || [-.24, -.80, .85];
    const spread = Math.hypot(...p.map((v, i) => v - focus[i])) * (['RV', 'LV'].includes(key) ? 110 : 105);
    if (mode === 1) age = (atrial ? frame.atrialAge : frame.ventAge) - spread;
    if (!atrial && frame.preexcited) age = Math.max(age, frame.ventAge - Math.hypot(...p.map((v, i) => v - focus[i])) * 110);
    if (mode === 2) {
      // Local asynchronous teaching pattern; no claim of a global AF/VF cycle.
      const period = (atrial ? 155 : 185) + 24 * Math.sin(p[0] * 3 + p[2] * 4);
      age = mod(frame.time + p[0] * 91 + p[1] * 67 + p[2] * 121 + 17 * Math.sin(frame.time * .007 + p[1] * 4), period);
    }
    if (mode === 3) age = mod(frame.time - (Math.atan2(p[2], p[0] + .3) / (2 * Math.PI) + .5) * params.period, params.period);
    return age;
  }
  function sample(probe, engine, time) {
    const frame = engine.frameAt(time), atrial = probe.key === 'RA' || probe.key === 'LA';
    const params = parameters(engine, frame, atrial), mode = atrial ? frame.atrialMode : frame.ventMode;
    let duration = localDuration(probe.key, probe.position, params);
    if (mode === 2) duration = (atrial ? 155 : 185) + 24 * Math.sin(probe.position[0] * 3 + probe.position[2] * 4);
    return {...actionPotential(localAge(probe, frame, params), duration), asynchronous: mode === 2};
  }
  function cycleAt(engine, time) {
    time = clamp(time, 0, 11999);
    const frame = engine.frameAt(time);
    const organized = !frame.vf && !(engine.id === 'asystole' && time > engine.onset + 500) && !(engine.id === 'ventFlutter' && time >= engine.onset);
    const beats = engine.ventricles;
    const previous = beats.findLast(b => b.time <= time), next = beats.find(b => b.time > time);
    if (!organized || !next || (next.time - (previous?.time ?? 0)) > 3000) {
      const start = Math.floor(time / 1000) * 1000;
      return {start, end: Math.min(12000, start + 1000), organized: false, index: -1};
    }
    return {start: Math.max(0, Math.ceil(previous?.time ?? 0)), end: Math.min(12000, Math.ceil(next.time)), organized: true, index: previous ? beats.indexOf(previous) : -1};
  }
  function cycleSeek(cycle, offset) { return clamp(Math.round(cycle.start + offset), cycle.start, cycle.end - 1); }
  function advance(time, delta, loop) { return loop ? loop.start + mod(time - loop.start + delta, loop.end - loop.start) : mod(time + delta, 12000); }
  function quadrant(vector) {
    const x = vector[0], inferior = -vector[1];
    if (Math.hypot(x, inferior) < .03) return {angle: null, label: '近零向量', number: null};
    const angle = Math.atan2(inferior, x) * 180 / Math.PI;
    if (Math.abs(x) < 1e-6 || Math.abs(inferior) < 1e-6) return {angle, label: '象限边界', number: null};
    const number = x > 0 ? (inferior > 0 ? 1 : 4) : (inferior > 0 ? 2 : 3);
    return {angle, number, label: ['','左下','右下','右上','左上'][number]};
  }
  function color(voltage) {
    const t = clamp((voltage + 90) / 120, 0, 1) * (palette.length - 1), index = Math.min(Math.floor(t), palette.length - 2), f = t - index;
    const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    return '#' + rgb(palette[index]).map((v, i) => Math.round(v * (1 - f) + rgb(palette[index + 1])[i] * f).toString(16).padStart(2, '0')).join('');
  }
  const api = {actionPotential, branchDelay, parameters, localDuration, localAge, sample, cycleAt, cycleSeek, advance, quadrant, color, palette, phases, clamp};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MembraneCore = api;
})(typeof window === 'undefined' ? globalThis : window);
