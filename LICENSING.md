# 许可范围 / Licensing

2026-11-14 · v1.0.1 · Copyright (C) 2026 jksd4c

本项目原创代码及原创说明文档采用 **GNU General Public License version 3 only（GPL-3.0-only）**。完整、未修改的标准文本见 [LICENSE](LICENSE)。这是作者对相应原创部分作出的授权，无需向机构申请或取得“开源证书”。官方版本免费提供；GPL 允许商业使用，不以“仅学习”为理由另加禁止商用等限制。

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3 of the License.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

## 文件和资源边界

| 内容 | 许可与署名 |
| --- | --- |
| 原创 JavaScript、CSS、HTML 模板、Python 构建脚本、测试及原创说明文档 | GPL-3.0-only；Copyright (C) 2026 jksd4c；源文件包含 SPDX 标识 |
| `work/network.json` 教学传导网络 | GPL-3.0-only；配有 `.license` 文件；不声称为真实传导组织分割 |
| `work/model.json`、`work/atrium-data.json` 解剖数据与其内嵌副本 | BodyParts3D，CC BY 4.0；`model.json` 另保留 OrganUI 整理来源；修改与历史文件头差异见 THIRD_PARTY_NOTICES.md |
| `work/assets/three.min.js` 及其 HTML 内嵌副本 | Three.js r160，MIT；完整通知见 `licenses/threejs-r160-MIT.txt` |
| OrganUI 上游文档、来源整理及相关许可材料 | 保留其原始署名与 MIT 通知，见 `licenses/organui-MIT.txt`；其引用的解剖模型仍适用 BodyParts3D 许可 |
| `index.html`、`outputs/sinus-rhythm-3d.html` | 含上述不同来源的合成发布文件；原创程序部分 GPL-3.0-only，第三方库、数据及通知保留相应许可 |
| 教材、论文、指南及外部网页 | 仅提供书目和导航链接，未纳入本项目 GPL 授权 |
| GPL、MIT、CC 许可文本和上游来源文件 | 保留各自原始通知与条款；本项目不对标准许可文本及上游作品另作所有权主张 |

GPL 不取消第三方的独立署名要求。转发模型、截图、录像或衍生图示时，也应保留适用的模型署名、许可链接及修改说明。来源、具体文件和取得记录见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 与 [provenance/](provenance/)。

## 源码及再分发

对应源码位于 [jksd4c/cardiac-electrophysiology-lab](https://github.com/jksd4c/cardiac-electrophysiology-lab)，本版使用 `v1.0.1` 标签。`work/` 提供可修改的运行代码、模板、构建脚本及运行模型数据；执行 `python work/build.py` 可重新生成两份网页入口。

再分发受 GPL 覆盖的程序或修改版时，须按 GPL 提供相应源码、保留通知并满足其他条款。不得仅凭这里的简述替代完整许可证。上游解剖数据的原始下载和处理记录见来源文档。

“教学用途”“未经临床用途验证”说明项目定位和适用性，不增加 GPL 或第三方许可之外的使用领域限制。第三方名称和 AI 辅助制作署名不表示合作、认证或背书。

许可及权利联系：[jksd4c@gmail.com](mailto:jksd4c@gmail.com)。

参考：[GNU 应用许可证说明](https://www.gnu.org/licenses/gpl-howto.html) · [GPL v3](https://www.gnu.org/licenses/gpl-3.0.html) · [BodyParts3D 官方授权](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)。
