# 抖音自动中控助手 - 详细开发计划 v2.1

## 项目概述

**扩展名称：** 抖音自动中控助手  
**扩展类型：** Chrome 浏览器扩展程序（Manifest V3）  
**目标平台：** 抖音网页版直播间 (live.douyin.com)  
**Chrome 版本要求：** 144.0.7559.110+（正式版本）（64 位）  
**版本：** 1.0.0  
**开发日期：** 2026-02-09

---

## 功能需求

### 核心功能

#### 1. 自动点赞
- **功能描述：** 模拟双击直播画面中央进行点赞
- **触发方式：** 双击视频区域
- **频率控制：** 可配置每分钟随机点击次数（1-60次）
- **默认值：** 10-50次/分钟
- **随机性：** 使用正态分布算法生成随机时间间隔，模拟人类行为
- **反检测：** 添加±30px随机偏移，模拟真实点击位置

#### 2. 自动评论
- **功能描述：** 自动发送预设评论到直播间
- **评论数量：** 支持最多50条评论
- **发送模式：**
  - **随机循环：** 从列表中随机选择评论发送
  - **按顺序：** 按列表顺序逐条循环发送
  - **智能去重：** 避免短时间内发送相同评论（记录最近10条）
- **发送间隔：** 可配置（5-3600秒），默认90秒
- **随机偏移：** 添加±20%时间偏移，避免规律性
- **输入方式：** 支持 textarea 和 contenteditable 两种输入框
- **发送方式：** 模拟输入后触发回车键事件

#### 3. UI界面
- **侧边栏位置：** 固定在网页右侧
- **尺寸：**
  - 高度：100vh（全屏）
  - 宽度：可调节 320px - 600px，默认 400px
- **控制方式：**
  - 浮动按钮控制显示/隐藏
  - 折叠按钮收起/展开
  - 宽度调节手柄（右侧边缘拖拽）
- **样式：** 使用 Shadow DOM 隔离，避免与抖音页面样式冲突

#### 4. 数据管理
- **配置保存：** 自动保存到 Chrome Storage（local）
- **评论导入：** 支持批量导入，每行一条评论
- **操作日志：** 记录所有操作，最多保留100条
- **统计数据：** 持久化存储总点赞数、总评论数

---

## 技术方案

### 架构设计

**方案：Content Script + Shadow DOM + Injected UI**

**优势：**
- ✅ 完全控制样式和布局（Shadow DOM 隔离）
- ✅ 浮动按钮易于实现和控制
- ✅ 宽度可调节、透明度可切换
- ✅ 与抖音页面样式完全隔离
- ✅ 兼容 Chrome 144 MV3 架构

---

## 文件结构

```
douyin-auto-helper/
├── manifest.json                 # 扩展配置（Chrome 144 MV3）
├── icons/                        # 图标文件夹
│   ├── icon16.png               # 16x16px - 浏览器工具栏
│   ├── icon48.png               # 48x48px - 扩展管理页面
│   └── icon128.png              # 128x128px - Chrome 商店
├── src/
│   ├── background.js             # Service Worker（Chrome 144 MV3）
│   ├── content/
│   │   ├── index.js             # 内容脚本入口
│   │   ├── ui-injector.js       # UI注入器
│   │   └── page-observer.js     # 页面变化监听（MutationObserver）
│   ├── components/
│   │   ├── FloatingButton.js    # 浮动按钮组件（右下角）
│   │   ├── Sidebar.js           # 侧边栏组件（右侧固定）
│   │   ├── LikeController.js    # 点赞控制器UI
│   │   ├── CommentController.js # 评论控制器UI
│   │   ├── LogPanel.js          # 日志面板UI
│   │   └── SettingsPanel.js     # 设置面板UI
│   ├── core/
│   │   ├── AutoLike.js          # 自动点赞核心逻辑
│   │   ├── AutoComment.js       # 自动评论核心逻辑
│   │   ├── ElementFinder.js     # 抖音元素查找器
│   │   └── AntiDetection.js     # 反检测机制
│   ├── utils/
│   │   ├── storage.js           # Chrome Storage 封装
│   │   ├── logger.js            # 日志系统
│   │   ├── dom-helper.js        # DOM操作工具
│   │   ├── random.js            # 随机数生成工具
│   │   └── validator.js         # 数据验证工具
│   └── styles/
│       ├── variables.css        # CSS变量定义
│       ├── floating-button.css  # 浮动按钮样式
│       ├── sidebar.css          # 侧边栏样式
│       ├── controls.css         # 控件样式
│       ├── logs.css             # 日志样式
│       └── animations.css       # 动画效果
├── doc/
│   └── development-plan.md      # 本文档
└── README.md                     # 使用说明
```

---

## UI设计要求

### 配色方案（抖音品牌色）

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 主背景 | `#161823` | 抖音黑 |
| 次背景 | `#252733` | 浅黑（卡片背景）|
| 强调色 | `#FE2C55` | 抖音红（开关、按钮）|
| 主文字 | `#FFFFFF` | 白色 |
| 次文字 | `#8A8B99` | 灰色（提示文字）|
| 边框色 | `#3A3C4A` | 分隔线、边框 |
| 成功色 | `#00C853` | 成功状态指示 |
| 警告色 | `#FFC107` | 警告状态指示 |
| 错误色 | `#FF1744` | 错误状态指示 |

### 侧边栏布局

```
┌─────────────────────────┐
│ 顶部栏 (56px)           │
│ - "抖音助手"标题     │
│ - 折叠按钮 (左侧)        │
│ - 关闭按钮 (右侧)        │
├─────────────────────────┤
│ 自动点赞控制区           │
│ - 开关 + 标题            │
│ - 每分钟次数范围输入     │
│ - 状态指示器             │
├─────────────────────────┤
│ 自动评论控制区           │
│ - 开关 + 标题            │
│ - 发送间隔输入           │
│ - 发送模式选择           │
│ - 评论列表文本域         │
│ - 批量导入/清空按钮      │
│ - 状态指示器             │
├─────────────────────────┤
│ 操作日志区              │
│ - 标题 + 清空按钮        │
│ - 日志列表（滚动）       │
├─────────────────────────┤
│ 底部操作区 (48px)       │
│ - [保存配置] [重置]      │
└─────────────────────────┘
↑
宽度调节手柄（右侧边缘）
```

### 图标设计

- **文字：** 中文"助"
- **尺寸：** 16x16px、48x48px、128x128px
- **样式：** 红色圆形背景（#FE2C55），白色文字
- **字体：** 微软雅黑/系统默认中文字体

---

## 抖音直播间元素定位策略

### 1. 直播视频区域定位（点赞目标）

```javascript
// 选择器优先级（按可靠性排序）
const videoSelectors = [
  '.xgplayer-container video',           // 西瓜播放器（最常用）
  '[data-e2e="live-player"] video',      // 数据属性标记
  '.live-player-video video',            // 直播播放器
  '.room-player video',                  // 房间播放器
  'video[class*="player"]',              // 包含player的video
  'video'                                // 兜底选择
];

// 备用策略：按尺寸判断
// 选择面积最大的可见video元素（>300x200px）
```

### 2. 评论输入框定位

```javascript
// 现代抖音使用 contenteditable
const inputSelectors = [
  '[contenteditable="true"][data-e2e="comment-input"]',
  '[contenteditable="true"][placeholder*="说点什么"]',
  '[contenteditable="true"][placeholder*="发条评论"]',
  // 备用：textarea
  'textarea[data-e2e="comment-input"]',
  'textarea[placeholder*="说点什么"]',
  // 区域特征
  '.comment-input [contenteditable="true"]',
  '.chat-input [contenteditable="true"]',
  '.room-right [contenteditable="true"]'
];

// 兜底策略：查找所有可编辑元素，返回最下方的
```

---

## 数据存储结构

### 1. 配置数据（config）

```javascript
{
  // 点赞配置
  likeEnabled: false,           // 点赞开关
  likeMinPerMinute: 10,        // 最小点赞次数/分钟
  likeMaxPerMinute: 50,        // 最大点赞次数/分钟
  
  // 评论配置
  commentEnabled: false,       // 评论开关
  commentInterval: 90,         // 评论间隔（秒）
  commentMode: 'random',       // 评论模式: random/sequence/smart
  comments: [],                // 评论列表（字符串数组）
  smartHistorySize: 10,        // 智能去重历史记录数
  
  // UI配置
  sidebarWidth: 400,           // 侧边栏宽度
  sidebarCollapsed: false      // 侧边栏折叠状态
}
```

### 2. 统计数据（stats）

```javascript
{
  totalLikes: 0,               // 累计点赞次数
  totalComments: 0,            // 累计评论次数
  todayLikes: 0,               // 今日点赞次数
  todayComments: 0,            // 今日评论次数
  lastResetDate: '2026-02-09'  // 上次重置日期
}
```

### 3. 日志数据（logs）

```javascript
[
  {
    id: 'uuid',                // 唯一标识
    time: '09:30:15',          // 时间戳（HH:MM:SS）
    type: 'success',          // 类型: info/success/warning/error
    source: 'like',           // 来源: like/comment/system
    message: '点赞成功',       // 消息内容
    data: {}                  // 附加数据
  }
]
// 最多保留100条，超出时删除最早的
```

---

## 核心组件详细设计

### 1. 浮动按钮（FloatingButton）

**位置：** 页面右下角（固定定位）

**功能：**
- 点击切换侧边栏显示/隐藏
- 显示运行状态指示（绿色圆点=运行中，灰色=已停止）
- 悬停显示提示文字

**样式：**
- 圆形按钮，56px x 56px
- 红色背景（#FE2C55），白色"助"字
- 阴影效果，提升层次感
- 状态指示点：右上角12px圆点

### 2. 侧边栏（Sidebar）

**定位：** `position: fixed; right: 0; top: 0;`

**尺寸：**
- 高度：100vh
- 宽度：可调节 320px - 600px
- 默认宽度：400px

**交互：**
- 右侧边缘拖拽调节宽度
- 折叠按钮收起为窄条（40px）
- 关闭按钮完全隐藏

**结构：**
- Shadow DOM 隔离
- 内部分为：header、content、footer
- content 区域可滚动

### 3. 点赞控制器（LikeController）

**UI组件：**
- 开关（Toggle Switch）
- 范围输入（最小-最大）
- 状态显示（运行中/已停止）
- 计数显示（已点赞次数）

**核心逻辑：**
- 每分钟生成随机点击计划
- 使用正态分布生成点击次数（更自然）
- 确保最小间隔 500ms
- 实时更新统计数据

### 4. 评论控制器（CommentController）

**UI组件：**
- 开关（Toggle Switch）
- 数字输入（间隔秒数）
- 下拉选择（发送模式）
- 文本域（评论列表）
- 按钮（批量导入、清空）
- 状态显示和计数

**核心逻辑：**
- 支持三种发送模式
- 智能去重模式维护最近发送记录
- 批量导入支持从文件读取
- 自动清理超出50条的旧评论

### 5. 日志面板（LogPanel）

**UI组件：**
- 标题栏（带清空按钮）
- 日志列表（滚动区域）
- 日志项（带颜色标识）
- 空状态提示

**功能：**
- 实时显示操作日志
- 按类型着色（成功=绿，错误=红，警告=黄，信息=灰）
- 自动滚动到最新日志
- 最多显示100条

---

## 核心功能实现方案

### 1. 自动点赞（AutoLike.js）

#### 算法流程

```
每分钟开始时：
  1. 生成本分钟的点击次数 N（正态分布，min-max范围）
  2. 生成 N 个随机时间点（0-60秒内）
  3. 确保任意两个时间点间隔 >= 500ms
  4. 按时间排序
  
每分钟执行中：
  1. 在每个时间点执行点赞
  2. 点赞操作：
     - 查找视频元素
     - 计算中心位置（添加±30px随机偏移）
     - 模拟双击事件序列（mousedown/up/click x2 + dblclick）
     - 每次事件间隔 10-30ms
  3. 更新统计数据
  4. 记录日志
  
每分钟结束时：
  1. 调度下一分钟的计划
  2. 循环执行
```

#### 关键代码结构

```javascript
class AutoLike {
  constructor(config)
  start()           // 启动自动点赞
  stop()            // 停止自动点赞
  scheduleMinute()  // 调度下一分钟
  generatePlan()    // 生成点击计划
  performLike()     // 执行单次点赞
  simulateDoubleClick(element, x, y)  // 模拟双击事件
  normalDistribution(min, max)        // 正态分布生成
}
```

### 2. 自动评论（AutoComment.js）

#### 算法流程

```
评论循环：
  1. 检查是否启用
  2. 选择下一条评论（根据模式）
     - 随机模式：从列表随机选择
     - 顺序模式：按索引循环
     - 智能模式：排除最近10条后随机选择
  3. 查找输入框元素
  4. 模拟输入：
     - 聚焦输入框
     - 设置文本内容（使用原生setter绕过框架限制）
     - 触发 input/change 事件
     - 延迟 300-700ms
  5. 模拟发送：
     - 触发 keydown Enter
     - 触发 keyup Enter
  6. 记录成功/失败
  7. 计算下次发送时间（interval ± 20%）
  8. 调度下次执行
```

#### 错误处理

```javascript
// 重试机制
if (failed && retryCount < maxRetries) {
  retryCount++
  wait(retryCount * 2000ms)  // 递增延迟
  retry()
} else {
  logError()
  scheduleNext()  // 继续执行下一次
}
```

### 3. 元素查找器（ElementFinder.js）

```javascript
class ElementFinder {
  static findLiveVideo()     // 查找直播视频
  static findCommentInput()  // 查找评论输入框
  static isVisible(element)  // 检查元素是否可见
  static waitForElement(selector, timeout)  // 等待元素出现
}
```

### 4. 反检测机制（AntiDetection.js）

```javascript
class AntiDetection {
  static init()              // 初始化反检测
  static hideWebdriver()     // 隐藏 webdriver 标记
  static randomizeDelay(base)// 添加随机延迟
  static protectConsole()    // 保护控制台
}
```

---

## 消息通信协议

### 组件间通信方式

使用 CustomEvent 进行组件间通信：

```javascript
// 点赞成功
window.dispatchEvent(new CustomEvent('douyin-helper:like:success', {
  detail: { count: totalLikes }
}));

// 评论成功
window.dispatchEvent(new CustomEvent('douyin-helper:comment:success', {
  detail: { text: commentText, total: totalComments }
}));

// 错误事件
window.dispatchEvent(new CustomEvent('douyin-helper:error', {
  detail: { source: 'like', message: '...' }
}));
```

### Content Script ↔ Background 通信

```javascript
// 获取配置
chrome.runtime.sendMessage(
  { action: 'GET_CONFIG' },
  (response) => { ... }
);

// 保存配置
chrome.runtime.sendMessage(
  { action: 'SET_CONFIG', config: {...} },
  (response) => { ... }
);
```

---

## Chrome 144 MV3 兼容性说明

### 关键配置

```json
{
  "manifest_version": 3,
  "background": {
    "service_worker": "src/background.js"
  },
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "https://live.douyin.com/*"
  ]
}
```

### 注意事项

1. **Service Worker 生命周期**
   - 30秒空闲后自动终止
   - 所有状态必须持久化到 storage

2. **禁止使用的 API**
   - ❌ `chrome.webRequest`（使用 declarativeNetRequest 替代）
   - ❌ `chrome.extension.getBackgroundPage()`
   - ❌ `eval()` 和 `new Function()`（CSP限制）

3. **推荐的 API**
   - ✅ `chrome.storage.local`
   - ✅ `chrome.runtime.sendMessage`
   - ✅ `chrome.scripting.executeScript`

---

## 开发步骤

### 阶段1：基础架构（第1-2天）

1. ✅ 创建项目目录结构
2. ✅ 编写 manifest.json（MV3）
3. ✅ 创建基础样式文件（CSS变量）
4. ✅ 实现 Storage 工具类
5. ✅ 实现 Logger 工具类
6. ✅ 测试扩展加载

### 阶段2：UI组件（第3-4天）

1. 实现浮动按钮组件
2. 实现侧边栏组件（Shadow DOM）
3. 实现控制面板组件
4. 实现日志面板组件
5. 集成 UI 注入器
6. 测试 UI 显示和交互

### 阶段3：核心功能（第5-7天）

1. 实现元素查找器
2. 实现自动点赞核心逻辑
3. 实现自动评论核心逻辑
4. 实现反检测机制
5. 实现配置读写
6. 实现数据持久化

### 阶段4：集成测试（第8-9天）

1. 测试点赞功能（不同直播间）
2. 测试评论功能（多种输入框）
3. 测试配置保存和恢复
4. 测试边界情况（空列表、元素不存在等）
5. 测试 Chrome 144 兼容性

### 阶段5：优化完善（第10天）

1. 优化用户体验（动画、反馈）
2. 完善错误处理和提示
3. 优化性能（防抖、节流）
4. 编写使用文档
5. 准备发布

---

## 配置参数汇总

| 配置项 | 默认值 | 范围 | 说明 |
|--------|--------|------|------|
| 点赞开关 | false | true/false | 是否启用自动点赞 |
| 点赞次数/分钟（最小） | 10 | 1-60 | 每分钟最少点赞次数 |
| 点赞次数/分钟（最大） | 50 | 1-60 | 每分钟最多点赞次数 |
| 评论开关 | false | true/false | 是否启用自动评论 |
| 评论发送间隔 | 90 | 5-3600 | 两次评论间隔秒数 |
| 评论发送模式 | random | random/sequence/smart | 三种模式可选 |
| 评论列表 | [] | 最多50条 | 预设评论内容 |
| 智能去重历史 | 10 | 固定 | 智能模式记录的最近发送数 |
| 日志保留数量 | 100 | 固定 | 最多保留的日志条数 |
| 侧边栏宽度 | 400 | 320-600 | 侧边栏显示宽度（px）|
| 侧边栏折叠 | false | true/false | 是否折叠侧边栏 |

---

## 安全和合规声明

1. ✅ **数据安全**：所有数据存储在本地，不上传服务器
2. ✅ **隐私保护**：不收集任何用户隐私信息
3. ✅ **网络请求**：不发送任何网络请求
4. ✅ **运行范围**：仅在抖音直播间页面运行
5. ⚠️ **使用声明**：仅供学习交流使用
6. ⚠️ **风险提示**：请合理使用，避免违反平台规则

---

## 开发者信息

**扩展名称：** 抖音自动中控助手  
**版本：** 1.0.0  
**开发日期：** 2026-02-09  
**Chrome 版本：** 144.0.7559.110+  
**技术栈：**
- Chrome Extension Manifest V3
- JavaScript ES2022
- Shadow DOM v1
- CSS3
- Chrome Storage API

---

## 附录

### A. 抖音页面结构参考

```html
<!-- 视频区域 -->
<div class="xgplayer-container">
  <video>...</video>
</div>

<!-- 评论区 -->
<div class="room-right">
  <div class="comment-list">...</div>
  <div class="comment-input">
    <div contenteditable="true" placeholder="说点什么..."></div>
  </div>
</div>

<!-- 在线观众 -->
<div class="audience-info">在线观众 · <span>16</span></div>
```

### B. 事件序列（点赞）

```javascript
// 完整的双击事件序列
1. mousedown (button: 0)
2. mouseup (button: 0)
3. click (detail: 1)
4. mousedown (button: 0)
5. mouseup (button: 0)
6. dblclick (detail: 2)
```

### C. 事件序列（评论）

```javascript
// 输入过程
1. focus
2. input (设置值后触发)
3. change (设置值后触发)
4. delay 300-700ms
5. keydown (key: 'Enter')
6. keyup (key: 'Enter')
```

---

**文档版本：** v2.1  
**最后更新：** 2026-02-09  
**状态：** 已确认，准备开发
