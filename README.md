# eRhythmos

**An open-source 3D cardiac electrophysiology lab for learning how electrical activity becomes an ECG.**

[Open the web app](https://jksd4c.github.io/cardiac-electrophysiology-lab/) · [中文说明](README.zh-CN.md) · [Download v1.0.1](https://github.com/jksd4c/cardiac-electrophysiology-lab/releases/tag/v1.0.1)

**v1.0.1 · by jksd4c**

eRhythmos brings a translucent 3D heart, animated conduction pathways, membrane-potential visualization and synchronized 12-lead ECGs onto one shared timeline. Rotate the heart, follow an impulse, probe a myocardial point or pause a beat to explore how local electrical activity relates to the ECG.

Explore 75 rhythm scenarios, including AV block, atrial and ventricular ectopy, AF, VF and bundle-branch block, with RVOT/LVOT PVC examples and rhythm-specific detail views. The app is free to use, runs in your browser and supports Chinese and English. It also works offline from the downloadable package.

## Features

- **Interactive 3D anatomy:** a translucent heart with freely adjustable views, front/back occlusion, linked structure labels and an orientation cube.
- **Animated conduction:** SA node, AV node, His bundle, right and left bundle branches, left fascicles and Purkinje network. Normal activation is highlighted in yellow; abnormal activation and circuits are red.
- **Membrane potential:** switchable myocardial voltage colors, a −90 to +30 mV color bar, surface probes with phase 0–4 action potentials, and millisecond single-beat seeking.
- **75 rhythm scenarios:** sinus rhythms, escape rhythms, AV blocks, atrial and ventricular ectopy, AF/flutter, reentrant tachycardias, VT/VF, TdP and bundle/fascicular block patterns. PVC examples include RVOT, LVOT and other teaching origins.
- **Synchronized 12-lead ECG:** lead selection, a shared playback clock, event shortcuts, continuous scrubbing across time windows and an enlarged lead strip.
- **ECG inspection:** horizontal wheel zoom from 0.6 to 12 seconds, a stable central baseline, constant voltage gain and model-derived RR, PR, QRS, QT, QTcB and QTcF values where applicable.
- **3D cardiac vector:** a compact vector display in the heart viewport follows the selected lead and model orientation.
- **Optional local views:** rhythm-dependent atrial, ventricular tissue, conduction-circuit and single-beat comparison panels, collapsed by default.
- **References and attribution:** textbook navigation, the searchable rhythm catalog, licenses and privacy information are available through the footer's **Notices & licenses** entry.

## Use online or offline

Open **[the live web app](https://jksd4c.github.io/cardiac-electrophysiology-lab/)** in a modern browser with WebGL support. No account or installation is required.

For offline use, download and extract the ZIP from [Releases](https://github.com/jksd4c/cardiac-electrophysiology-lab/releases/tag/v1.0.1), then open `index.html` or `outputs/sinus-rhythm-3d.html`. The runtime library and model data are embedded. External reference links require an internet connection.

## Controls

| Control | Action |
| --- | --- |
| Top toolbar | Select a rhythm, play/pause, change playback speed or seek within the shared 12-second clip |
| Heart viewport | Drag to rotate; use the wheel to zoom; click a structure or its label to highlight both |
| Membrane potential | Toggle voltage colors; right-click the myocardium to place a probe, or choose Place probe and click the surface |
| Probe action potential | Inspect local voltage and phases 0–4; click a phase or drag the trace to seek |
| Single-beat timeline | Seek in 1 ms steps, switch beats or loop a beat; inspect the instantaneous frontal-vector quadrant |
| Orientation cube | Click a face to change view; press Enter while focused to return to the anterior view |
| ECG lead | Select a lead to inspect its enlarged strip and vector projection |
| Enlarged ECG | Drag to scrub; continue past an edge to move across windows; use the wheel to zoom in time |
| Local-view buttons | Open the detail panels available for the selected rhythm |
| Footer | Expand references, source attribution, licenses, feedback and privacy information |

## Source and development

`work/` contains the source modules, HTML template, editable conduction data, prepared anatomy data and embedded runtime library. Python 3's standard library is sufficient to rebuild the app:

```sh
python work/build.py
```

This regenerates `index.html` and `outputs/sinus-rhythm-3d.html`, including the membrane-potential tools. Use `python work/build.py --local` for a separate `local-v1.0` preview; see [LOCAL-v1.0.md](LOCAL-v1.0.md). Runtime requirements are WebGL, Canvas and `DecompressionStream`; Python and Node.js are development tools and are not bundled.

Run the existing checks with Node.js:

```sh
node work/rhythm-engine.test.js
node work/expanded-rhythms.test.js
node work/v011.test.cjs
node work/membrane.test.js
```

To build a source-inclusive ZIP and update the file checksum manifest:

```sh
python tools/package_release.py
```

GitHub Pages serves the repository's `main` branch from its root. `.nojekyll` keeps the generated page as a static asset. To publish a code change, rebuild the page, run the relevant checks and push the generated page with its corresponding source. See [CHANGELOG.md](CHANGELOG.md) for version history and validation details.

## License and attribution

Original project code and original documentation are licensed under **[GPL-3.0-only](LICENSE)**. Copyright (C) 2026 jksd4c. The author provides the official version free of charge; the license permits commercial use and governs modification and redistribution. The educational notice adds no field-of-use restrictions to the applicable licenses.

Third-party materials retain their own licenses:

| Material | Source and license |
| --- | --- |
| Anatomy data | **BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.** Main-heart processing also credits OrganUI. |
| Three.js r160 | MIT; see [the full notice](licenses/threejs-r160-MIT.txt) |
| OrganUI source documentation and relevant materials | MIT; see [the full notice](licenses/organui-MIT.txt). Its anatomy data retains the BodyParts3D license. |
| Medical textbooks, papers and guidelines | Bibliographic references and navigation links; their full texts and original figures are not included or relicensed. |

See [LICENSING.md](LICENSING.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [provenance/](provenance/) for scope, modifications and source records. Retain the relevant attribution when sharing the model, screenshots or videos.

## Educational status and privacy

This is an educational model, not a clinically validated ECG analyzer or patient-specific anatomical model. Conduction overlays and ECGs are generated teaching examples. Membrane colors and probe traces approximate working-myocyte action potentials; they are not measured patient voltages or an ionic-current solver. AF/VF use schematic local asynchronous activity; disorganized ventricular rhythms use an observation window instead of a global beat. See the [English educational notice](DISCLAIMER.en.md) or [中文版声明](DISCLAIMER.zh-CN.md).

The app includes no patient-data upload, advertising or analytics scripts. It stores only the language preference locally. The online version uses GitHub Pages, whose access logging is described in the [privacy notice](PRIVACY.md).

## Feedback and contributions

- Report reproducible problems through [GitHub Issues](https://github.com/jksd4c/cardiac-electrophysiology-lab/issues).
- For rights, privacy or other private concerns, contact **[jksd4c@gmail.com](mailto:jksd4c@gmail.com)**.
- Please do not submit patient identifiers or unauthorized medical records.
- See [CONTRIBUTING.md](CONTRIBUTING.md) before contributing code or third-party assets.

Maintained by **jksd4c**. Contributions and reproducible feedback are welcome.
