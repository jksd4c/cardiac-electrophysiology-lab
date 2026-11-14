# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 jksd4c
# See LICENSE for copying conditions and warranty disclaimer.
import pathlib
import html
root=pathlib.Path(__file__).resolve().parent
template=(root/'laboratory-template.html').read_text(encoding='utf8')
for key,name in [('LAB_STYLES','laboratory.css'),('V011_STYLES','v011.css'),('ECG_TOOLS','ecg-tools.js'),('I18N_CODE','i18n.js'),('SPATIAL_CODE','spatial-instruments.js'),('THREE_LIBRARY','assets/three.min.js'),('ATRIUM_DATA','atrium-data.json'),('MODEL_DATA','model.json'),('NETWORK_DATA','network.json'),('RHYTHM_CODE','rhythm-engine.js'),('CATALOG_CODE','rhythm-catalog.js'),('PVC_CODE','pvc-origins.js'),('EXTENSION_CODE','rhythm-extension.js'),('MORPHOLOGY_CODE','ecg-morphology.js'),('LAB_CODE','laboratory.js'),('DETAIL_CODE','mechanism-details.js'),('LOCAL_CODE','local-model.js'),('VIEWER_CODE','viewer-v5.js')]:
 code=(root/name).read_text(encoding='utf8')
 if key=='I18N_CODE': code+='\n'+(root/'i18n-extra.js').read_text(encoding='utf8')
 template=template.replace('/*'+key+'*/',code)
template=template.replace('/*PROJECT_LICENSE*/',html.escape((root.parent/'LICENSE').read_text(encoding='utf8')))
out=root.parent/'outputs'/'sinus-rhythm-3d.html'
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(template,encoding='utf8', newline='\n');print(out, out.stat().st_size)

(root.parent/'index.html').write_text(template,encoding='utf8', newline='\n')
