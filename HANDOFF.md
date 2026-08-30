# Stranger Things Letter Wall 项目交接文档

## 项目一句话

这是一个复刻《怪奇物语》字母灯墙的互动网页：电脑端显示灯墙，用户可以点字母或用摄像头手势输入消息；手机端扫码进入接收页，电脑点击发送后，手机黑屏上显示发光手写文字。

## 仓库信息

- GitHub 仓库：`https://github.com/chyxin071-sys/stranger-things.git`
- 当前主分支：`main`
- 本地目录：`E:\XIN Lab\S.thing`
- 本地预览：`http://localhost:3000/`
- 局域网预览：`http://192.168.2.105:3000/`

## 已完成的功能

- 灯墙背景、字母、灯点和彩灯线已复刻到网页里。
- 灯点位置已按用户手动校准后的配置固定到代码中。
- 字母灯会慢速、不同步地微弱呼吸。
- 点击字母可以输入 Message。
- 按 Enter 会直接发送 Message，不会再重复输入最后一个字母。
- 摄像头识别已接入 MediaPipe，本地模型文件已放进项目，不依赖国外 CDN 加载。
- 任意单指指向字母并短暂停留，可以选中字母。
- 双手张开可触发 Signal。
- Signal 动画分四步：
  1. A 到 Z 依次累积亮起。
  2. 随机闪烁若干灯。
  3. 把当前输入的单词逐字打两遍。
  4. 全部灯闪两遍后结束。
- 电脑端点 Connect 会生成二维码。
- 手机扫码后进入接收端页面。
- 多台手机可以扫码同一个二维码，接收同一条消息。
- Connect 成功后按钮会显示 Connected，弹窗自动收起。
- 手机端接收页使用用户提供的字体：`public/fonts/fz-liuxing.ttf`。
- 手机端文字会自动根据单词长度缩放，尽量完整居中显示。
- 已加入 CloudBase 静态构建入口。

## 重要文件

- 主页面逻辑：`app/page.tsx`
- 全局样式：`app/globals.css`
- 房间收发接口：`app/api/rooms/[room]/route.ts`
- CloudBase 静态入口：`src/main.tsx`
- CloudBase Vite 配置：`vite.cloudbase.config.ts`
- CloudBase 部署说明：`CLOUDBASE_DEPLOY.md`
- 用户字体：`public/fonts/fz-liuxing.ttf`
- 背景图：`public/reference-wall.png`
- MediaPipe 模型：`public/mediapipe/hand_landmarker.task`
- MediaPipe wasm：`public/mediapipe/wasm/`

## 本地开发命令

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000/
```

## 本地构建检查

完整应用构建：

```bash
npm run build
```

CloudBase 静态托管构建：

```bash
npm run build:cloudbase
```

构建完成后会生成：

```text
dist/
```

## CloudBase 当前部署失败原因

CloudBase 日志里失败的关键是：

```text
Path does not exist: /root/cloudbase-workspace/dist
```

意思是：云端部署时直接执行了上传命令：

```bash
tcb hosting deploy ./dist / -e cloud1-8grodf5s3006f004
```

但是它前面没有先执行：

```bash
npm install
npm run build:cloudbase
```

所以云端目录里还没有 `dist`，自然上传失败。

这不是 DNS 问题，也不是证书问题，也不是 GitHub 没推成功。主要是 CloudBase 部署配置里少了构建步骤。

## CloudBase Git 部署应该怎么填

如果 CloudBase 页面有分开的输入项，建议这样填：

```text
项目框架：其他
运行时环境：Node.js 22，如果没有 22，就先用 Node.js 18 试一下
目标目录：./
安装命令：npm install
构建命令：npm run build:cloudbase
构建产物目录：./dist
部署路径：/
```

如果页面只有一个“部署命令”输入框，就填：

```bash
npm install && npm run build:cloudbase && tcb hosting deploy ./dist /
```

如果要部署到子路径，例如 `pinnuozhujia.cn/stranger-things`，最后一段改成：

```bash
npm install && npm run build:cloudbase && tcb hosting deploy ./dist /stranger-things
```

但更推荐使用子域名：

```text
stranger.pinnuozhujia.cn
```

这样访问地址更干净，也不会影响公司官网和 ERP。

## 自定义域名状态

用户想用：

```text
stranger.pinnuozhujia.cn
```

这个是可以的。子域名通常不需要重新备案，只要主域名 `pinnuozhujia.cn` 已备案，并且腾讯云允许绑定该子域名即可。

当前用户已经完成了域名归属权 TXT 验证。HTTPS 证书可能需要等待签发，用户说可能要等一个工作日。

证书签发后，在 CloudBase 静态网站托管里继续绑定该域名，并选择对应证书即可。

## 上线后别人怎么访问

部署成功后，如果使用 CloudBase 默认域名，可以先把默认域名发给别人测试。

但是默认域名有访问频率限制和稳定性提示，只适合开发测试。

正式给朋友用，建议等 `stranger.pinnuozhujia.cn` 绑定成功后，发这个网址：

```text
https://stranger.pinnuozhujia.cn/
```

如果部署在子路径，则地址可能是：

```text
https://pinnuozhujia.cn/stranger-things/
```

## 一个重要限制

当前电脑和手机互动使用的是：

```text
app/api/rooms/[room]/route.ts
```

它在本地开发时可以用。但如果只部署到 CloudBase 静态网站托管，静态托管只会托管 HTML、CSS、JS、图片、字体这些静态文件，不一定会运行这个 API。

也就是说：

- 灯墙网页本身可以上线。
- 摄像头识别和本机互动可以上线。
- 手机扫码打开接收页可以上线。
- 但“电脑发送，远程手机实时收到”这部分，正式上线时可能需要补一个真正的后端。

推荐后续方案：

1. 用 CloudBase 云函数或云托管做房间消息接口。
2. 用 CloudBase 数据库保存房间消息。
3. 手机端轮询或订阅房间消息。

这一步做完后，远程朋友不在同一个 Wi-Fi 下也能收到消息。

## 接下来最建议做什么

1. 先把 CloudBase 静态部署跑成功。
2. 拿到一个能打开的公网网址。
3. 测试电脑端页面、摄像头、灯墙动画。
4. 测试手机端扫码能不能打开接收页面。
5. 如果手机端能打开但收不到电脑发送的消息，就开始做 CloudBase 云函数/数据库版本的房间系统。
6. 继续打磨 UI：底部 Message 和按钮可以继续往更“苹果 dock”式的丝滑交互调整。

## 给新 AI 的一句话提示

请继续维护这个项目：`E:\XIN Lab\S.thing`。这是一个《怪奇物语》字母灯墙互动网页，用户希望它能部署到腾讯 CloudBase，并最终支持电脑端输入消息、手机扫码接收发光手写文字。当前静态构建已配置为 `npm run build:cloudbase` 输出 `dist/`，CloudBase 部署失败主要是因为云端直接上传 `dist` 但没有先构建。优先帮助用户完成 CloudBase 部署配置，然后再把本地 `/api/rooms/[room]` 改成 CloudBase 云函数或数据库方案，让远程手机也能实时收到消息。
