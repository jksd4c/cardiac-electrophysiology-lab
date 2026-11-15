# eRhythmos

**An Interactive Cardiac Electrophysiology Learning Tool**

[Open the web app](https://jksd4c.github.io/cardiac-electrophysiology-lab/) · [中文说明](README.zh-CN.md) · [Download v1.0.1](https://github.com/jksd4c/cardiac-electrophysiology-lab/releases/tag/v1.0.1)

eRhythmos is a free, open-source cardiac electrophysiology learning project. Through an interactive 3D heart, it connects cardiac anatomy, electrical impulse propagation, myocardial membrane potentials and the 12-lead ECG, helping learners understand how cardiac electrical activity relates to ECG patterns.

Rotate the heart to follow an impulse through the conduction system. Switch between rhythms to compare activation sequences and ECG changes. Select a point on the myocardium to inspect its local action potential, then pause, replay or step through depolarization and repolarization.

## What you can explore

- **The cardiac conduction system:** explore the spatial relationships and activation of the SA node, AV node, His bundle, right and left bundle branches, and Purkinje network.
- **Common arrhythmias:** study escape rhythms, AV block, atrial and ventricular premature beats, AF, VF and other rhythms; compare typical patterns associated with different PVC origins and bundle-branch blocks.
- **The 12-lead ECG:** observe cardiac electrical activity alongside each lead, select and enlarge a waveform, and use cardiac vectors to understand its changes.
- **Myocardial action potentials:** use colors and local traces to explore membrane-potential changes through phases 0–4.
- **Local electrophysiological mechanisms:** open atrial, pulmonary-vein or ventricular-tissue views in relevant scenarios to explore triggering activity and differences in repolarization.

eRhythmos is designed for medical students, clinical learners, educators and anyone interested in cardiac electrophysiology. It supports self-directed learning, classroom demonstrations and discussion. The app offers Chinese and English interfaces, requires no registration, and can be used in a browser or downloaded for offline use.

Original code is available under **GPL-3.0-only**. Feedback, suggestions and contributions are welcome. Third-party sources and licenses are documented in the project.

*For teaching and learning. The model and ECG signals are educational illustrations and must not be used as a basis for clinical diagnosis or treatment.*

## Use online or offline

Open **[the live web app](https://jksd4c.github.io/cardiac-electrophysiology-lab/)** in a modern browser with WebGL support. No account or installation is required.

For offline use, download and extract the ZIP from [Releases](https://github.com/jksd4c/cardiac-electrophysiology-lab/releases/tag/v1.0.1), then open `index.html` or `outputs/sinus-rhythm-3d.html`. The runtime library and model data are embedded. External reference links require an internet connection.

<details>
<summary>Interaction guide</summary>

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

</details>

<details>
<summary>Source, development and checks</summary>

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

</details>

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

## Further information

See the [educational notice](DISCLAIMER.en.md), [medical references](REFERENCES.md) and [privacy notice](PRIVACY.md) for the model's scope and supporting information.

The app includes no patient-data upload, advertising or analytics scripts. It stores only the language preference locally. The online version is hosted on GitHub Pages.

## Feedback and contributions

- Report reproducible problems through [GitHub Issues](https://github.com/jksd4c/cardiac-electrophysiology-lab/issues).
- For rights, privacy or other private concerns, contact **[jksd4c@gmail.com](mailto:jksd4c@gmail.com)**.
- Please do not submit patient identifiers or unauthorized medical records.
- See [CONTRIBUTING.md](CONTRIBUTING.md) before contributing code or third-party assets.

Maintained by **jksd4c**. Contributions and reproducible feedback are welcome.
