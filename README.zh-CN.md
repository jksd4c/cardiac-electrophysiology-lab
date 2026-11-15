# eRhythmos｜心脏电生理交互式学习工具

[English](README.md) · [打开网页版](https://jksd4c.github.io/cardiac-electrophysiology-lab/) · [下载 v1.0.1](https://github.com/jksd4c/cardiac-electrophysiology-lab/releases/tag/v1.0.1)

eRhythmos 是一个免费、开源的心脏电生理学习项目，通过可交互的三维心脏，将心脏结构、电冲动传播、心肌膜电位和十二导联心电图联系起来，帮助学习者理解心脏电活动与心电图表现之间的关系。

你可以自由旋转心脏，观察电冲动沿传导系统传播；切换不同心律，对照激动顺序与心电图的变化；也可以在心肌表面选择一个观察点，查看局部动作电位，并暂停、回放或逐步观察去极化与复极过程。

## 可以探索的内容

- **心脏传导系统**：观察窦房结、房室结、希氏束、左右束支及浦肯野网络的空间关系与激动过程。
- **常见心律失常**：学习逸搏、房室传导阻滞、房早、室早、房颤、室颤及其他节律，比较不同室早来源和束支阻滞的典型表现。
- **十二导联心电图**：同步观察心脏电活动与各导联波形，选择导联、放大波形，并结合心电向量理解其变化。
- **心肌动作电位**：通过颜色和局部曲线观察膜电位变化，查看动作电位的 0–4 期。
- **局部电生理机制**：在相关场景中展开左房、肺静脉或心室组织视图，辅助理解触发活动与复极差异。

eRhythmos 面向医学生、临床学习者、教师及对心脏电生理感兴趣的人，适合自主学习、课堂演示与交流讨论。项目支持中英文界面，无需注册，可直接在浏览器中使用，也可下载后离线运行。

项目以 **GPL-3.0-only** 开放原创代码，欢迎反馈问题、提出改进建议和参与贡献。第三方资源的来源与许可见项目说明。

*本项目用于教学与学习，模型及心电信号为教学示意，不作为临床诊疗依据。*

## 在线或离线使用

打开[网页版](https://jksd4c.github.io/cardiac-electrophysiology-lab/)即可开始使用。也可以下载并解压 [v1.0.1 发布包](https://github.com/jksd4c/cardiac-electrophysiology-lab/releases/tag/v1.0.1)，用支持 WebGL 的现代浏览器打开 `index.html`。页面内嵌运行库和模型数据；访问外部参考链接时需要联网。

<details>
<summary>操作指南</summary>

## 操作

- 顶部固定栏统一选择节律、播放、速度和 12 秒全局进度；在局部视图处仍可定位。关键事件按钮可直接暂停到代表性激动。
- 膜电位着色可自由开关，色标为 −90 至 +30 mV。右键心肌表面选点，或点击“标记点”后单击心肌，查看该点膜电位、0–4 期和动作电位曲线。
- 顶部单搏进度条支持 1 ms 拖动／步进、前后切换心搏和循环本搏；点选阶段或拖动动作电位曲线可定位时间，并显示瞬时额面向量象限。室颤等无组织心室节律改用观察窗。
- 拖动主模型旋转，滚轮缩放；点击结构或标签相互高亮。左下角方位立方体随模型旋转，可点击面复位；键盘 Enter 返回前面观。
- 右上角三维向量与主心脏同向旋转，并随所选导联更新投影。金色为正常、红色为异常净向量，青色为所选导联投影。
- 点选十二导联中的一个导联，在下方条带精看；拖动到边缘可继续跨窗口。滚轮只缩放时间轴（0.6–12 秒），基线始终位于条带中央，电压增益不变。可重置缩放或使用左右窗口按钮。
- 局部左房、心室壁、传导回路及单搏对照按当前节律提供，默认收起。QT、QTc 等均为合成模型的教学估算，方法可展开查看。

- 教材与模型目录位于页脚右下角“声明与许可”内，默认收起；支持按节律名称或缩写检索，点击目录项即可切换节律。每个场景的参考栏仅保留文献与链接。

</details>

<details>
<summary>源码、构建与检查</summary>

## 源码与重建

`work/` 包含完整运行源文件、预处理模型数据和内嵌库。Python 3 标准库即可重建页面：

```sh
python work/build.py
node work/rhythm-engine.test.js
node work/expanded-rhythms.test.js
node work/v011.test.cjs
node work/membrane.test.js
```

Python / Node.js 不随包分发。浏览器需支持 WebGL、Canvas 和 DecompressionStream。模型数据来自图谱，不是个体 CT；网络纤维为教学叠加。页面不上传患者数据，也没有患者数据导入功能。

版本记录和已有检查结果见 [CHANGELOG.md](CHANGELOG.md)。

</details>

## 开源许可与资源

原创代码和原创说明文档采用 **GPL-3.0-only**，Copyright (C) 2026 jksd4c。作者免费提供官方版本；许可证允许商用，分发和修改须遵守其条款。BodyParts3D 解剖数据保留 CC BY 4.0，Three.js 与 OrganUI 相关内容保留 MIT。详见 [LICENSE](LICENSE) 与 [LICENSING.md](LICENSING.md)。教学用途说明不另加使用领域限制。

解剖资料署名：**BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.** 主心脏的整理和转换同时署名 OrganUI。

完整资源说明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)，医学参考见 [REFERENCES.md](REFERENCES.md)，项目适用范围见[教学用途声明](DISCLAIMER.zh-CN.md)，隐私信息见 [PRIVACY.md](PRIVACY.md)。

## 反馈

- 普通问题：[GitHub Issues](https://github.com/jksd4c/cardiac-electrophysiology-lab/issues)。
- 权利、隐私及其他联系：[jksd4c@gmail.com](mailto:jksd4c@gmail.com)。
- 请勿在公开 Issues 或邮件中发送患者身份信息或未经授权的病历。
- [简短隐私说明 / Privacy](PRIVACY.md)。

在线版通过 GitHub Pages 提供，离线版仍可下载使用。

维护者：**jksd4c**。
