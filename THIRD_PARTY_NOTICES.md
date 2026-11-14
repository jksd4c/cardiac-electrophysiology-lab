# 第三方资源、署名与许可声明

项目：心脏电活动实验室。版本：0.1.2 内测版。作者：jksd4c。核对日期：2026-11-14。

本说明覆盖 v0.1.2 应用及源码包。原创代码与原创说明文档采用 GPL-3.0-only；第三方代码、文档与解剖资产保留下述各自许可。具体范围见 LICENSING.md，不将第三方材料一概改为 GPL。

## 1. Three.js r160

权利人：three.js authors。当前应用内嵌 `three.min.js`，代码内的版本标识为 160，许可为 MIT。

- [项目主页](https://threejs.org/)
- [r160 的原始许可文件](https://github.com/mrdoob/three.js/blob/r160/LICENSE)
- 随包完整许可：`licenses/threejs-r160-MIT.txt`；审查副本的独立 HTML 也含完整文本。
- 版权：Copyright © 2010-2023 three.js authors。
- 本次没有改变库的运行代码。不能只保留“MIT”字样而省略其要求随副本保留的版权和许可通知。

## 2. BodyParts3D 4.0 解剖资产

必须保留的署名：

> BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.

- [官方下载页](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html)
- [官方授权页](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)，页面标注更新日期为 2025-02-27；本次于 2026-11-14 核对。
- [CC BY 4.0 许可摘要](https://creativecommons.org/licenses/by/4.0/)，[完整法律文本](https://creativecommons.org/licenses/by/4.0/legalcode.en)。
- 背景论文：Mitsuhashi 等，BodyParts3D: 3D structure database for anatomical concepts，Nucleic Acids Research 37 (2009), D782–D785，[DOI](https://doi.org/10.1093/nar/gkn613)。

主心脏由 OrganUI 对该图谱进行选择和转换后提供；本项目左房壁及四组肺静脉另使用官方几何档案的 FJ2438、FJ2925、FJ2933、FJ2944、FJ2950、FJ2955、FJ3020 和 FJ3040。来源与哈希见 `provenance/`。

现有 OBJ 文件头仍写旧版 CC BY-SA 2.1 Japan，并指向同一官方授权页面。本项目记录这项历史差异，并依据官方当前针对该数据库的 CC BY 4.0 授权；不得将此推论扩展到其他来源不明的镜像或文件。若以后取得的文件无法确认属于该授权范围，应暂停使用并向权利人核实，而不是直接改掉旧许可证。

修改情况：OrganUI 选择、分组和三角化原始网格，转换坐标轴、居中并统一缩放，重算法线、赋予示意颜色及生成 GLB。本项目去除运行模型中的冠脉组，将坐标量化并压缩为 JSON 数据，采用半透明材质；左房／肺静脉按相同图谱坐标系配准，对局部视图重新居中放大、进行肺静脉显示细分。信号传播路径、纤维和触发灶是教学叠加，不是从图谱分割出的真实传导组织。

主图谱中的合并心室壁仍是合并网格；单独心室腔面表示内部空间，不是额外心肌。参考图谱不能代表所有个体，也未据此取得患者级准确性认证。

再分发模型及含有该模型的截图、录像或衍生图示时，应在适当位置保留来源、许可和修改说明。不能将这些解剖资产一概标为本项目原创，也不能额外禁止第三方许可已允许的用途。

## 3. OrganUI / heart-3d

- [上游项目](https://github.com/organui/heart-3d)
- 本次核对的固定提交：`c72ce6654ff8e282942f97750d3104f55ef4fc3d`。
- [固定版本的模型署名](https://github.com/organui/heart-3d/blob/c72ce6654ff8e282942f97750d3104f55ef4fc3d/public/models/ATTRIBUTION.md)
- [固定版本的来源说明](https://github.com/organui/heart-3d/blob/c72ce6654ff8e282942f97750d3104f55ef4fc3d/docs/MODEL_PROVENANCE.md)
- [上游 MIT 许可](https://github.com/organui/heart-3d/blob/c72ce6654ff8e282942f97750d3104f55ef4fc3d/LICENSE)，随本包保留于 `licenses/organui-MIT.txt`。
- 版权：Copyright (c) 2026 OrganUI contributors。

本项目采用其整理后的心脏资产和来源整理信息，不能省略这一级来源。上游软件／文档的 MIT 许可与 BodyParts3D 模型的 CC BY 4.0 许可分别适用。保留上游 MIT 通知，不表示本页面运行了整个 OrganUI React 应用，也不表示其所有间接依赖都是本项目依赖。

`provenance/organui-manifest.json` 是上游清单。其 `retrieved: 2026-09-22` 是 OrganUI 的获取记录，不是 jksd4c 本项目的获取日期。清单中的 `heart.glb` SHA-256 与本地文件相符；上游清单本身的 Git blob 哈希亦与本地既有清单一致。本次核对提交不等于能够追溯证明最初下载时的提交，故不虚构原始下载记录。

## 4. 医学参考资料

教材、指南、共识、论文和 MSD 专业版用于知识与机制核对。具体题名、用途和官方导航见 `REFERENCES.md`，不随包提供教材、论文全文、插图或扫描页。付费教材只核对到目录的部分，不声称已阅读全文。

事实、机制和数学关系采用项目自己的说明及实现；原文表达、插图、表格和独创性编排可能受保护。文献可免费阅读、被 PMC 收录或被我们列为参考，并不意味着可随意转载或改编。若以后需要使用原图、原表、较长译文或真实 ECG，应单独核查具体许可及图注中的第三方权利信息。

## 5. 用户提供的视觉参考

最初的蓝色心脏医学插图可见 Mesa Schumacher 署名。作者识别仅依据图上署名，原始出处及授权范围未取得完整证明。本次检查的运行 HTML 和源码压缩包未发现该插图文件；它不纳入本次审查副本或宣传素材。

通用的蓝色、半透明和黄色传导线是设计参考；不能据“风格参考”推定复制其具体构图、线稿、纹理或将原图图生图改造就获得授权。发布前仍需人工比较明显的具体表达相似性；本次没有作出司法意义上的不相似鉴定。

## 6. 开发辅助工具、字体及浏览器

- **GPT-6 Astra / OpenAI**：开发辅助署名，不是嵌入的模型权重或运行库，不表示 OpenAI 认证、合作或背书。项目开源不包括 OpenAI 的模型、服务或权利人未授予的材料。
- **系统字体**：页面使用 Segoe UI、Microsoft YaHei 和 sans-serif 字体名称；本包未随附字体二进制。引用系统字体名称不等于获得字体文件再分发许可。
- **WebGL、Canvas、JavaScript、DecompressionStream**：运行环境接口，本项目未因此打包浏览器源码。
- **Python、Node.js**：构建／检查环境，不随本包捆绑。网格准备脚本涉及 NumPy 和 Matplotlib，但它们未进入当前运行 HTML。以后捆绑工具依赖时另列准确版本及许可。
- **mp4-muxer.js**：工作目录中存在旧文件，但不在本次检查的运行 HTML、旧发布源码包或本次审查副本中；不把未分发文件列为当前运行依赖。

本项目未因引用资料而取得 DBCLS、OrganUI、Three.js、OpenAI、出版机构或医学学会的认可。第三方名称仅用于准确识别来源。

## 7. 声明组织方式参考：AngioView

[AngioView](https://angioview.com/)，作者 Annas Rahman；2026-11-14 查看其 Credits and sources。参考其“简要教学用途 + 按类别说明来源、使用方式和许可 + 完整通知入口”的组织方式，本项目说明独立撰写。

该网站用于冠脉造影视角教学，本项目侧重传导、电活动和心律失常。未采用其代码、模型、截图或声明全文，也未使用它列出的 ImageCAS-X、CARDIAG、React 或 IBM Plex 字体；不将它的依赖清单照搬为我们的资源清单。不据其公开可访问性推断整个 AngioView 项目开源，也不将其声明视为本项目的授权依据或合规认证。


## 8. v0.1.1 界面与信号更新

新增的三维向量仪、方位立方体、双语界面及间期计算由本项目实现。AngioView 也用作方位组件的交互思路参考，未复制其代码、纹理或模型。版本升级没有更换 Three.js 或解剖网格，也未增加第三方运行依赖。QT 相关参考新增于 REFERENCES.md。

## 9. v0.1.2 开源发布

原创部分采用 GPL-3.0-only，加入完整许可证、逐文件许可标识与联系入口。此决定不改变上述第三方的许可和署名要求。页面右下角通过可操作的折叠区域提供来源、完整通知及模型修改说明，离线 HTML 亦内嵌完整 GPL 和两份 MIT 通知。
