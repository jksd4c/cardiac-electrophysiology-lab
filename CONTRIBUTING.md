# 贡献指南

欢迎通过 [Issues](https://github.com/jksd4c/cardiac-electrophysiology-lab/issues) 报告问题，或提交 Pull Request。

- 请说明版本、节律、时间点、复现步骤及预期表现。医学内容修订应附原始参考链接和理由；功能测试不替代内容核对。
- 提交原创代码或原创文档，即表示你有权按本项目 GPL-3.0-only 提供该贡献；不要求转让版权。保留已有作者和第三方通知。
- 新增模型、图片、波形或其他第三方资源时，记录权利人、来源、固定版本、许可、修改及文件哈希。来源或再分发权限不明的材料不应随提交附入。
- 参考资料以书目及官方链接为主。不得因“免费”“教育”“已署名”而默认可转载教材全文、原图或整表。
- 如使用 AI 辅助，简要说明使用方式和核对情况。
- 不在公开问题或提交中包含患者身份、未经授权的病历、账号凭据或其他敏感内容。

运行相关验证：

```sh
python work/build.py
node work/rhythm-engine.test.js
node work/expanded-rhythms.test.js
node work/v011.test.cjs
```

权利、隐私或不适合公开讨论的问题，请联系 [jksd4c@gmail.com](mailto:jksd4c@gmail.com)。
