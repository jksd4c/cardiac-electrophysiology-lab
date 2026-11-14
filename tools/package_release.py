# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 jksd4c
# See LICENSE for copying conditions and warranty disclaimer.
"""Build a reproducible-source release archive from an explicit public allowlist."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys
import zipfile

root = Path(__file__).resolve().parent.parent
subprocess.run([sys.executable, str(root / 'work/build.py')], check=True)
assert (root / 'index.html').read_bytes() == (root / 'outputs/sinus-rhythm-3d.html').read_bytes()
roots = {'work', 'licenses', 'provenance', 'tools', 'outputs'}
names = {'LICENSE', 'LICENSING.md', 'README.md', 'PRIVACY.md', 'CONTRIBUTING.md',
         'DISCLAIMER.zh-CN.md', 'DISCLAIMER.en.md', 'THIRD_PARTY_NOTICES.md',
         'REFERENCES.md', 'LINK_POLICY.md', 'CHANGELOG.md', 'index.html',
         '.gitignore', '.gitattributes', '.nojekyll'}
files = sorted(p for p in root.rglob('*') if p.is_file()
               and (p.relative_to(root).parts[0] in roots or p.relative_to(root).as_posix() in names)
               and '__pycache__' not in p.parts and p.suffix != '.pyc')
manifest = {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
manifest_path = root / 'SHA256SUMS.json'
manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf8', newline='\n')
dest = root / 'dist/cardiac-electrophysiology-lab-v0.1.2.zip'
dest.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for p in files + [manifest_path]:
        archive.write(p, 'cardiac-electrophysiology-lab-v0.1.2/' + p.relative_to(root).as_posix())
with zipfile.ZipFile(dest) as archive:
    assert archive.testzip() is None
print(json.dumps({'archive': str(dest), 'files': len(files) + 1,
                  'sha256': hashlib.sha256(dest.read_bytes()).hexdigest()}, indent=2))
