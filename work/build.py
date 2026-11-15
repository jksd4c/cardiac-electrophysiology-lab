# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 jksd4c
# See LICENSE for copying conditions and warranty disclaimer.
import pathlib
import html
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('--local',action='store_true',help='Build a local-v1.0 preview without replacing the public release files')
args=parser.parse_args()
root=pathlib.Path(__file__).resolve().parent
template=(root/'laboratory-template.html').read_text(encoding='utf8')
for key,name in [('LAB_STYLES','laboratory.css'),('V011_STYLES','v011.css'),('ECG_TOOLS','ecg-tools.js'),('I18N_CODE','i18n.js'),('SPATIAL_CODE','spatial-instruments.js'),('THREE_LIBRARY','assets/three.min.js'),('ATRIUM_DATA','atrium-data.json'),('MODEL_DATA','model.json'),('NETWORK_DATA','network.json'),('RHYTHM_CODE','rhythm-engine.js'),('CATALOG_CODE','rhythm-catalog.js'),('PVC_CODE','pvc-origins.js'),('EXTENSION_CODE','rhythm-extension.js'),('MORPHOLOGY_CODE','ecg-morphology.js'),('LAB_CODE','laboratory.js'),('DETAIL_CODE','mechanism-details.js'),('LOCAL_CODE','local-model.js'),('VIEWER_CODE','viewer-v5.js')]:
 code=(root/name).read_text(encoding='utf8')
 if key=='I18N_CODE': code+='\n'+(root/'i18n-extra.js').read_text(encoding='utf8')
 template=template.replace('/*'+key+'*/',code)
template=template.replace('/*PROJECT_LICENSE*/',html.escape((root.parent/'LICENSE').read_text(encoding='utf8')))
template=template.replace('</style></head>',(root/'membrane.css').read_text(encoding='utf8')+'</style></head>')
panel=(root/'membrane-panel.html').read_text(encoding='utf8')
anchor='  </section>\n  <section class="ecg-pane"'
assert anchor in template,'Heart pane insertion point missing'
template=template.replace(anchor,panel+'\n'+anchor,1)
# Insert before the viewer, after HeartLab has initialized its shared clock.
viewer=(root/'viewer-v5.js').read_text(encoding='utf8')
viewer_tag='<script>'+viewer+'</script>'
assert viewer_tag in template,'Viewer script insertion point missing'
template=template.replace(viewer_tag,'<script>'+(root/'membrane-core.js').read_text(encoding='utf8')+'</script><script>'+(root/'membrane-ui.js').read_text(encoding='utf8')+'</script>'+viewer_tag,1)
if args.local:
 template=template.replace('name="app-version" content="v1.0.1"','name="app-version" content="local-v1.0"')
 template=template.replace('<span class="version-badge">v1.0.1</span>','<span class="version-badge">local-v1.0</span>')
 template=template.replace('<title>eRhythmos · 心脏电活动实验室 · v1.0.1</title>','<title>eRhythmos · 心脏电活动实验室 · local-v1.0</title>')
out=root.parent/'outputs'/('local-v1.0.html' if args.local else 'sinus-rhythm-3d.html')
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(template,encoding='utf8', newline='\n');print(out, out.stat().st_size)

if not args.local:
 (root.parent/'index.html').write_text(template,encoding='utf8', newline='\n')
