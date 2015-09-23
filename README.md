# wxbot 微信机器人

- __普通个人号 微信机器人/外挂__ (不同于[webot](https://github.com/node-webot/webot)等公众号机器人)
- 意义: 个人号可充当公众号使用 关系增强/门槛降低/更多行为/依旧自动化
- 与[qqbot](https://github.com/xhan/qqbot)/[wqq](https://github.com/fritx/wqq)等不同: 基于浏览器/用户行为自动化 更贴近用户/更可靠
- 基于浏览器桌面平台[electron](https://github.com/atom/electron) 跨平台win/linux/mac
- 基于微信网页版 <https://wx.qq.com>
- 目前处于高度开发和观察阶段
- 目前代码提供自动回复 可自行定制

```plain
$ cd wxbot
$ electron .  # 运行 需扫二维码登录
```

<img width="643" src="https://raw.githubusercontent.com/fritx/wxbot/dev/screenshot.jpeg">

## 功能实现

- [x] 自动回复
- [x] 识别并回复相同的文本/表情/emoji
- [x] 识别并回复图片/语音/链接分享
- [x] 发送图片
- [ ] 识别位置消息
- [ ] 读取链接分享内容
- [ ] 读取语音文件
- [ ] 读取用户表情/图片文件
- [ ] 感应系统消息 时间/邀请加群/红包等
- [x] 探索运行于无界面平台 [electron#228](https://github.com/atom/electron/issues/228)

## 无界面linux运行

- 从命令行输出 获取二维码图片url 自行打开/扫描
- 参照配置 [segmentio/nightmare#224 (comment)](https://github.com/segmentio/nightmare/issues/224#issuecomment-141575361)
