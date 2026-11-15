# v1.0.1 — 2026-11-15

- Named the project **eRhythmos** across the website, browser titles, documentation and release package.
- Rewrote the English and Chinese project introductions around interactive anatomy, conduction, membrane potentials, synchronized ECGs and learning workflows.
- Simplified the README and release bylines to identify the project author.
- Preserved the existing website/repository addresses, author credit, runtime behavior and applicable third-party notices.

---

# v1.0 — 2026-11-15

### Membrane-potential release

- Promoted the local-v1.0 tools into the public build and both web entry points. The local preview remains available with `python work/build.py --local`.
- Added switchable myocardial voltage colors, a −90 to +30 mV color bar and right-click surface probing. The selected point follows the heart and displays voltage, phases 0–4 and a synchronized local action-potential trace.
- Added a sticky single-beat timeline with 1 ms seeking, fine steps, previous/next beats, beat looping and phase shortcuts. Disorganized ventricular rhythms use an observation window instead of a global beat.
- Added instantaneous frontal-vector angle/quadrant readouts. Near-zero vectors do not display an unstable angle.
- Updated the Chinese and English interface, usage guides, reference links and release labels. Added a Windows preview launcher that starts a loopback-only background server.
- Retained existing anatomy, 75 rhythm scenarios, ECG generation and third-party licenses. Membrane colors and traces are teaching approximations, not measured patient voltages or an ionic-current solver.

### Verification

- Membrane regression: 76,800 samples across 75 scenarios, including phase continuity, voltage bounds, recovery, BBB delays, quadrants and cycle boundaries.
- Existing regression suites: 41,580 core rhythm frames, 44,370 expanded frames and 8,925 interval frames; zoom, QTc gating, event density and bilingual checks passed.
- Browser: public v1.0 build rendered the heart and ECG; right-click probing, all five phase buttons, 250 → 251 ms stepping, voltage toggle and English interface were verified without app console errors.
- The release archive includes editable source, embedded runtime assets, attribution and a SHA-256 manifest. No new third-party runtime dependency was added.

---

# v0.1.2 — 2026-11-14

### Open-source release

- Applied GPL-3.0-only to original code/documentation; retained third-party CC BY 4.0 and MIT notices.
- Added full GPL text to the offline page, source repository links, jksd4c@gmail.com feedback and bilingual privacy notice.
- Published source and an offline beta package; no independent medical certification is claimed.

### Interface update

- Removed the main-screen Leads & vectors panel and References & rhythm catalog tab, including the redundant vector button. The compact 3D vector in the heart viewport remains available.
- Moved the textbook references and searchable 75-scenario catalog into the bottom-right Notices & licenses disclosure. Selecting a catalog entry closes the disclosure, switches rhythm and returns to the main view.
- Removed internal model caveats beneath per-scenario references, including sinus, PVC-origin and circuit variants. These reference rows now show citations and source links only. Source labels no longer include chapter/framework qualifiers.
- Updated Chinese and English titles, version labels and notices. The compact catalog supports rhythm IDs as well as displayed names. Empty local-detail navigation is hidden when no rhythm-specific panel applies.
- The interface update did not change anatomy assets, runtime dependencies or ECG generation rules. The later open-source release applies the original-code license noted above.

## Verification

- Existing v0.1.1 regression suite passed: 8,925 interval frames, QTc gating, zoom and clip bounds, event density, DOM IDs and 751 bilingual source strings (zero untranslated).
- Browser checks: main-screen cleanup, compact 3D vector retained, references inside Notices & licenses, LBBB catalog search and selection, and Chinese/English interface switch.
- Packaged build matches the active HTML byte for byte; ZIP integrity and SHA-256 manifest checked.

---

# v0.1.1 — 2026-11-14

- Dark navy background; author footer `by: jksd4c`; small notices outside the model. Removed the requested subtitle and two redundant reference sections.
- Chinese / English UI, including 75 rhythm descriptions, local mechanisms, labels, controls and notices; language preference retained locally when browser storage is available.
- Removed the 60–100 baseline-rate control. Rhythm-specific rate controls remain where needed to explain an abnormal rhythm.
- Added model-derived RR, PR, QRS, QT, QTcB and QTcF, with explicit withholding of QTc for inappropriate or unstable examples.
- Continuous ECG scrubbing across window boundaries; horizontal wheel zoom from 0.6 to 12 seconds; centered baseline and constant voltage gain; accurate fractional time ticks.
- More frequent PAC / PVC examples and earlier AF / VF onset. Preserved compensatory pauses, escape timing and AV block patterns. Brighter abnormal focus lasting 320 ms atrial / 420 ms ventricular.
- Compact 3D vector at the upper-right of the heart viewport; patient-orientation cube at lower-left. No separate vector column. Main layout changes from 1.15:1 to 1.4:1, transferring about 10.4% of the former ECG width to the heart pane on wide screens.
- Single sticky control bar combines rhythm selection, playback, event shortcuts and full-clip seeking. It remains accessible while scrolling to local details.
- Fixed a duplicate long-QT option ID and playback-speed label; synchronized manual zoom with global seeking.

## Verification

- Existing extended suite: 75 scenarios, 44,370 sampled frames across rate endpoints; lead identities, timing, block patterns, VT / TdP and 10 PVC origins.
- Existing core suite: 15 rhythms × 3 rates, 41,580 sampled frames.
- v0.1.1: 8,925 interval frames, QTc formula examples and withholding rules, event density / compensatory timing, zoom anchors and clip bounds, unique DOM IDs, 785 bilingual source strings.
- Browser: rendered heart and ECG, English and Chinese switchback, RVOT / LVOT lead comparison, left/right window crossing, centered zoom, cube rotation / anterior reset, fixed transport at the lower morphology panel, AF and TdP detail controls. Desktop and a narrow viewport were inspected; no app errors were observed.

Clinical expert review, all-device performance and every browser/gesture combination remain outside this verification. Existing anatomical data and Three.js r160 are unchanged.
