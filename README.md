# Stranger Things Letter Wall

一个做着玩的《怪奇物语》字母灯墙互动网页。

电脑端是一面会发光的字母墙，可以点击字母、用键盘输入，也可以打开摄像头用手势尝试输入和发送。手机端扫码进入同一个房间后，电脑发送的单词会在手机上以发光字体闪烁显示。

在线体验：

- <https://stranger.pinnuozhujia.cn/>
- 备用地址：<https://cloud1-8grodf5s3006f004-1421470557.tcloudbaseapp.com/>

隐藏统计页：

- <https://stranger.pinnuozhujia.cn/?stats=1>

## Features

- Stranger Things 风格字母灯墙
- 字母点击输入
- 键盘输入：`Backspace` 删除一个字母，`Esc` 清空，`Enter` 发送
- 摄像头手势识别，支持指向字母和张开手发送
- 电脑端生成 5 位房间码和二维码
- 手机扫码进入同一房间接收消息
- 多台手机可以加入同一个房间
- 手机接收端使用自定义字体 `Pinzelan-Italic.ttf`
- 手机竖屏和横屏显示适配
- CloudBase 云函数 + 文档型数据库同步房间消息
- 私有统计页查看访问、扫码、连接和发送记录

## Room Logic

点击 `Connect` 后，当前电脑页面会生成一个 5 位房间码。

同一个电脑页面里，后续再次点 `Connect` 会继续使用同一个房间码，这样第二台、第三台手机也可以继续扫码加入同一个房间。只有刷新页面或重新打开页面，才可能生成新的房间码。

这样可以避免两个互不相关的人串到同一个房间，同时也方便同一组人临时加入同一个房间。

## Local Development

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000/
```

局域网手机预览时，需要让手机和电脑在同一个网络里，并使用电脑的局域网地址访问。

## Build

```bash
npm run lint
npm run build:cloudbase
```

构建产物会输出到：

```text
dist/
```

## CloudBase

这个项目使用腾讯云 CloudBase：

- 静态网站托管：部署前端页面
- 云函数 `letter-wall-room`：处理房间、消息和统计
- 文档型数据库集合 `letter_wall_rooms`：保存房间状态和统计数据
- 身份认证：需要开启匿名登录

部署云函数：

```bash
npx -p @cloudbase/cli@3.8.1 tcb fn deploy --all --force -e cloud1-8grodf5s3006f004
```

部署静态网页：

```bash
npm run build:cloudbase
npx -p @cloudbase/cli@3.8.1 tcb hosting deploy ./dist / -e cloud1-8grodf5s3006f004
```

## Notes

这是一个实验性质的小项目，不是正式产品。可以继续往很多方向玩：

- 换成更恐怖、更电影感的灯光节奏
- 加声音、震动或更多接收端动画
- 做成多人房间模式
- 加一个真正有权限控制的管理后台
- 继续调手机端构图和手势体验

欢迎自由发挥，把它改成更有想象力的版本。
