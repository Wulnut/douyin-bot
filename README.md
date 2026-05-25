# 抖音AI托评助手 v3.0.1

> Chrome 扩展 | 抖音直播间 AI 智能评论 + 自动点赞工具

[![Version](https://img.shields.io/badge/版本-v3.0.1-red)](https://github.com/xxx139139-boop/dabao)
[![Platform](https://img.shields.io/badge/平台-Chrome-blue)](https://github.com/xxx139139-boop/dabao)

**抖音AI托评助手**是一款专为抖音直播间设计的 Chrome 浏览器扩展，支持 AI 智能评论、词库随机评论与自动点赞，帮助提升直播间互动效率。

---

## 功能特性

### 🤖 自动评论（核心功能）

- **AI 生成模式**：接入 **DeepSeek** 大模型，自动抓取直播间标题、主播、弹幕等上下文，生成真实感评论
- **词库随机模式**：在侧边栏配置评论词库（每行一条），发送时随机抽取，**无需 API Key**
- 支持自定义 **DeepSeek API Key** 和 **AI 预设提示词**（买家视角、粉丝视角等）
- 按设定的**发送间隔**（默认 90 秒）定时发送，间隔带 ±20% 随机波动
- 实时显示**已发送条数**、**上条评论内容**及**操作日志**

### ❤️ 自动点赞

- 模拟真人双击直播视频点赞
- 可设置每分钟点赞次数范围（默认 20–50 次）
- 正态分布随机化，避免固定频率被检测

### 🛡️ 反检测机制

- 隐藏 `navigator.webdriver` 标识
- 贝塞尔曲线鼠标轨迹模拟（三次贝塞尔 + 手部颤抖抖动）
- 正态分布随机延迟（Box-Muller 变换）
- 随机空闲鼠标微移、弹幕区域轻微滚动
- 变速鼠标移动（ease-in-out）

---

## 安装方法

### 方式一：加载源码（开发者）

#### 第一步：获取扩展

点击 GitHub 右上角 **Code → Download ZIP**，下载后解压，得到 `douyin-auto-helper` 文件夹。

#### 第二步：加载扩展

1. 打开 Chrome 浏览器，地址栏输入 `chrome://extensions/`
2. 开启右上角**开发者模式**
3. 点击**加载已解压的扩展程序**
4. 选择解压后的 `douyin-auto-helper` 文件夹（包含 `manifest.json` 的目录）
5. 扩展安装成功，图标出现在工具栏

### 方式二：安装 CRX 包（分享给他人）

1. 获取 `release/douyin-auto-helper.crx` 文件（见下方「构建与发布」）
2. 打开 `chrome://extensions/`，开启**开发者模式**
3. 将 `.crx` 文件拖入扩展管理页面，按提示确认安装

> 非 Chrome 网上应用店来源的 CRX，部分 Chrome 版本可能拦截安装。若拖入失败，可解压 `release/douyin-auto-helper.zip`，改用「加载已解压的扩展程序」安装。

### 第三步：开始使用

打开任意抖音直播间 `https://live.douyin.com/xxx`，扩展自动加载。

---

## 使用方法

1. 进入抖音直播间页面
2. 点击页面左下角**悬浮按钮**（TikTok 图标），打开控制面板
3. **自动评论**：
   - 选择 **AI 生成** 或 **词库随机** 模式
   - AI 模式：填写 **DeepSeek API Key** 和 **AI 预设提示词**
   - 词库模式：在 **评论词库** 中每行填写一条评论，发送时随机抽取
   - 设置**发送间隔**（建议 60–180 秒）
   - 打开 **自动评论** 开关
4. **自动点赞**：打开**自动点赞**开关即可
5. 点击**保存配置**保留设置

---

## 配置说明

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| 评论模式 | AI 生成 | 可选「AI 生成」或「词库随机」，二选一 |
| 发送间隔 | 90 秒 | 评论发送间隔，实际间隔有 ±20% 随机波动 |
| 每分钟点赞次数 | 20–50 | 随机正态分布 |
| AI 预设提示词 | 内置 | AI 模式下可根据直播内容自定义 |
| DeepSeek API Key | 空 | AI 模式下自行填写 |
| 评论词库 | 内置示例 | 词库模式下每行一条，发送时随机抽取 |

> AI 与词库为两种独立模式，在侧边栏切换后保存配置即可。建议发送间隔不低于 60 秒。

---

## 扩展图标

扩展使用 TikTok 风格图标，Manifest 中配置了三种尺寸：

| 文件 | 尺寸 | 用途 |
|------|------|------|
| `icons/icon16.png` | 16×16 | 工具栏小图标 |
| `icons/icon48.png` | 48×48 | 扩展管理页 |
| `icons/icon128.png` | 128×128 | Chrome 网上应用店 / 安装提示 |

如需重新生成图标，可在浏览器中打开 `douyin-auto-helper/icon-generator.html`，预览并下载各尺寸 PNG 后替换 `icons/` 目录下对应文件。

---

## 技术架构

```
douyin-auto-helper/
├── manifest.json              # 扩展配置（MV3）
├── package.json               # 构建依赖与 npm 脚本
├── icon-generator.html        # 图标生成工具
├── icons/                     # 扩展图标（16 / 48 / 128）
├── scripts/                   # 混淆与 CRX 打包脚本
│   ├── build.mjs              # 构建到 dist/
│   ├── pack.mjs               # 打包 .crx
│   ├── bump-version.mjs       # 版本号 patch +1
│   ├── write-version-info.mjs # 写入版本号与 commit hash
│   ├── setup-git-hooks.mjs    # 启用 Git hooks
│   └── obfuscator-config.mjs  # javascript-obfuscator 配置
├── .githooks/                 # Git hooks（提交时 bump 版本、写入 hash）
├── src/
│   ├── background.js          # Service Worker（DeepSeek API 代理，绕过 CORS）
│   ├── version.json           # 版本号 + 最后一次 commit hash（自动生成）
│   ├── content/
│   │   └── index.js           # 主脚本（功能集成入口）
│   ├── components/
│   │   ├── FloatingButton.js  # 悬浮按钮
│   │   └── Sidebar.js         # 控制面板
│   ├── core/
│   │   ├── AntiDetection.js   # 反检测机制
│   │   ├── AutoComment.js     # 自动评论
│   │   ├── AutoLike.js        # 自动点赞
│   │   └── ElementFinder.js   # DOM 查找 + 直播信息抓取
│   ├── styles/                # 样式文件
│   └── utils/                 # 存储、日志、DOM 工具
└── doc/                       # 开发文档
```

---

## 构建与发布

项目支持使用 `javascript-obfuscator` 混淆核心 JS，并打包为 `.crx` 方便分享。

### 环境要求

- [Node.js](https://nodejs.org/) 18 或更高版本

### 命令

```bash
npm install          # 首次安装依赖（同时启用 Git hooks）
npm run build        # 混淆并输出到 dist/
npm run pack         # 将 dist/ 打包为 .crx
npm run release      # 一步完成 build + pack
npm run version:bump # 手动 patch 版本 +1（一般无需手动执行）
```

### 版本号与提交哈希

每次 `git commit` 时：

1. **patch 版本 +1**（如 `3.0.0` → `3.0.1`），同步更新 `manifest.json`、`package.json`、`README.md` 等
2. **提交完成后**自动写入 `src/version.json`，记录当前 commit 短哈希与完整哈希，并 amend 进同一提交

侧边栏版本标签显示格式：`v3.0.1 · 963692b`（鼠标悬停可查看完整 commit hash）。`npm run build` / `npm run pack` 时也会在终端输出该信息。

`git commit --amend` 不会再次 bump 版本；跳过 hooks 使用 `git commit --no-verify`。

### 输出文件

| 路径 | 说明 |
|------|------|
| `dist/` | 混淆后的扩展目录（可用于「加载已解压的扩展程序」调试） |
| `release/douyin-auto-helper.crx` | 签名后的 CRX 安装包，可直接分享给他人 |
| `release/douyin-auto-helper.zip` | 同内容的 ZIP 备用包 |
| `build/key.pem` | CRX 签名私钥（**务必备份**） |

### 混淆范围

仅混淆 manifest 实际加载的两个 JS 文件，CSS、图标与 `manifest.json` 原样复制：

- `src/background.js`
- `src/content/index.js`

混淆配置见 `scripts/obfuscator-config.mjs`，已针对 Chrome 扩展 CSP 与 Service Worker 做了兼容（关闭 `selfDefending`、`debugProtection` 等易冲突选项）。

### 发布注意事项

1. **备份 `build/key.pem`**：同一私钥对应同一扩展 ID；丢失后再次打包，用户需卸载旧版并重新安装。
2. **CRX 安装限制**：普通 Chrome 对非商店 CRX 可能拦截；接收方需开启开发者模式，或将 ZIP 解压后加载。
3. **构建产物不入库**：`dist/`、`release/`、`node_modules/`、`build/key.pem` 已写入 `.gitignore`。

---

## 常见问题

**Q：扩展安全吗？**  
A：扩展仅在抖音直播间页面运行，不收集个人信息，API Key 保存在本地浏览器存储中。

**Q：会被抖音封号吗？**  
A：评论间隔和频率均可自定义，建议设置合理间隔，模拟真实用户行为。

**Q：支持哪些浏览器？**  
A：支持 Chrome 及基于 Chromium 内核的浏览器（Edge、360 极速浏览器等）。

**Q：AI 评论需要什么？**  
A：在侧边栏选择「AI 生成」模式，填写您自己的 DeepSeek API Key 即可。也可使用「词库随机」模式，无需 API Key。

**Q：如何打包成 CRX 分享给他人？**  
A：在项目根目录执行 `npm install` 后运行 `npm run release`，产物位于 `release/douyin-auto-helper.crx`。详见「构建与发布」章节。

---

## 更新日志

### v3.0.1 (2026-05-25)

- 移除会员/收费相关 UI 与逻辑
- 移除服务器地址配置
- AI 评论与词库评论均免费开放，自行配置 API Key 即可
- 新增 `npm run build` / `npm run pack` 构建流程，支持 JS 混淆与 CRX 打包

### v3.0.0 (2026-02-26)

- 支持 AI 评论自配 DeepSeek API Key
- 新增词库随机评论模式
- 优化控制面板 UI

### v2.2.0 (2026-02-12)

- 新增 AI 智能评论功能（DeepSeek 驱动）
- 优化点赞逻辑

### v1.0.0 (2026-02-09)

- 初始版本：自动点赞与自动评论

---

## 免责声明

本工具仅供学习交流使用，请遵守抖音平台规则，合理使用。使用本工具产生的任何后果由使用者自行承担。

---

*关键词：抖音直播间评论工具 | 抖音 AI 评论 | 抖音自动评论 | 直播间互动工具 | 抖音运营工具 | Chrome 扩展*
