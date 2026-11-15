# 心脏电活动实验室 / Cardiac Electrophysiology Lab

[English](README.md) · [打开网页版](https://jksd4c.github.io/cardiac-electrophysiology-lab/)

**v0.1.2 内测版 · by: jksd4c · 基于 GPT-6 Astra 辅助制作**

下载并解压 [v0.1.2 发布包](https://github.com/jksd4c/cardiac-electrophysiology-lab/releases/tag/v0.1.2)，用现代桌面浏览器打开 `index.html` 或 `outputs/sinus-rhythm-3d.html`。页面内嵌运行库和模型数据，可以离线使用，无需账户、联网加载或安装依赖。首页右上角可切换中文与 English。

## 操作

- 顶部固定栏统一选择节律、播放、速度和 12 秒全局进度；在局部视图处仍可定位。关键事件按钮可直接暂停到代表性激动。
- 拖动主模型旋转，滚轮缩放；点击结构或标签相互高亮。左下角方位立方体随模型旋转，可点击面复位；键盘 Enter 返回前面观。
- 右上角三维向量与主心脏同向旋转，并随所选导联更新投影。金色为正常、红色为异常净向量，青色为所选导联投影。
- 点选十二导联中的一个导联，在下方条带精看；拖动到边缘可继续跨窗口。滚轮只缩放时间轴（0.6–12 秒），基线始终位于条带中央，电压增益不变。可重置缩放或使用左右窗口按钮。
- 局部左房、心室壁、传导回路及单搏对照按当前节律提供，默认收起。QT、QTc 等均为合成模型的教学估算，方法可展开查看。

- 教材与模型目录位于页脚右下角“声明与许可”内，默认收起；支持按节律名称或缩写检索，点击目录项即可切换节律。每个场景的参考栏仅保留文献与链接。

## 源码与重建

`work/` 包含完整运行源文件、预处理模型数据和内嵌库。Python 3 标准库即可重建页面：

```sh
python work/build.py
node work/rhythm-engine.test.js
node work/expanded-rhythms.test.js
node work/v011.test.cjs
```

Python / Node.js 不随包分发。浏览器需支持 WebGL、Canvas 和 DecompressionStream。模型数据来自图谱，不是个体 CT；网络纤维为教学叠加。页面不上传患者数据，也没有患者数据导入功能。

## 本版检查与发布状态

v0.1.2 通过现有 v0.1.1 回归检查（包括 8,925 个间期采样帧），双语源文案检查无缺失。浏览器验证了主界面入口移除、参考栏清理、声明内目录检索及选择节律后的跳转、中英文切换。既有核心与扩展节律测试记录见 CHANGELOG.md；本次未改变模型、心电信号或临床规则。

这些是程序行为检查，不是医学准确性认证；未穷举所有浏览器、显卡和全部手势组合。本次按教学内测版开源发布，未取得独立医学准确性认证。

原创代码和原创说明文档采用 **GPL-3.0-only**，Copyright (C) 2026 jksd4c。作者免费提供官方版本；许可证允许商用，分发和修改须遵守其条款。BodyParts3D 解剖数据保留 CC BY 4.0，Three.js 与 OrganUI 相关内容保留 MIT。详见 [LICENSE](LICENSE) 与 [LICENSING.md](LICENSING.md)。教学用途说明不另加使用领域限制。

详见 `CHANGELOG.md`、`DISCLAIMER.zh-CN.md`、`DISCLAIMER.en.md`、`THIRD_PARTY_NOTICES.md`、`REFERENCES.md` 与 `LICENSING.md` 和 `PRIVACY.md`。本项目仅供教学和学习，未经临床用途验证。

## 反馈

- 普通问题：[GitHub Issues](https://github.com/jksd4c/cardiac-electrophysiology-lab/issues)。
- 权利、隐私及其他联系：[jksd4c@gmail.com](mailto:jksd4c@gmail.com)。
- 请勿在公开 Issues 或邮件中发送患者身份信息或未经授权的病历。
- [简短隐私说明 / Privacy](PRIVACY.md)。

在线版通过 GitHub Pages 提供，离线版仍可下载使用。
