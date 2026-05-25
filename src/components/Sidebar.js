/**
 * Sidebar 侧边栏组件
 * 固定在页面右侧，包含所有控制面板
 */

class Sidebar {
  constructor(config = {}) {
    this.config = {
      width: config.width || 400,
      collapsed: config.collapsed || false,
      ...config
    };
    
    this.element = null;
    this.container = null;
    this.shadow = null;
    this.isDragging = false;
    this.startX = 0;
    this.startWidth = 0;
    
    this.onToggleLike = null;
    this.onToggleComment = null;
    this.onSave = null;
    this.onReset = null;
  }
  
  /**
   * 创建并显示侧边栏
   */
  create() {
    // 创建 Shadow DOM 容器
    this.container = document.createElement('div');
    this.container.id = 'douyin-helper-sidebar-host';
    
    // 附加 Shadow DOM
    this.shadow = this.container.attachShadow({ mode: 'open' });
    
    // 注入样式
    this.injectStyles();
    
    // 创建侧边栏元素
    this.element = document.createElement('div');
    this.element.className = `douyin-helper-sidebar ${this.config.collapsed ? 'collapsed' : ''}`;
    this.element.style.width = `${this.config.width}px`;
    
    this.element.innerHTML = this.getHTML();
    
    this.shadow.appendChild(this.element);
    document.body.appendChild(this.container);
    
    // 绑定事件
    this.bindEvents();
    
    // 触发展示动画
    setTimeout(() => {
      this.element.classList.add('animate-fadeInRight');
    }, 10);
    
    return this;
  }
  
  /**
   * 注入样式
   */
  injectStyles() {
    const styleContent = `
      ${this.getVariablesCSS()}
      ${this.getSidebarCSS()}
      ${this.getControlsCSS()}
      ${this.getLogsCSS()}
      ${this.getAnimationsCSS()}
    `;
    
    const style = document.createElement('style');
    style.textContent = styleContent;
    this.shadow.appendChild(style);
  }
  
  /**
   * 获取 HTML 结构
   */
  getHTML() {
    return `
      <div class="resize-handle"></div>
      
      <div class="sidebar-header">
        <h3 class="title">抖音助手</h3>
        <div class="header-actions">
          <button class="btn-collapse" title="折叠">‹</button>
          <button class="btn-close" title="关闭">×</button>
        </div>
      </div>
      
      <div class="sidebar-content">
        <!-- 点赞控制 -->
        <div class="control-section like-section">
          <div class="section-header">
            <span class="section-title">
              <span class="section-icon">❤️</span>
              自动点赞
            </span>
            <label class="toggle-switch">
              <input type="checkbox" id="like-toggle">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="section-body">
            <div class="control-group">
              <label>每分钟次数</label>
              <div class="range-inputs">
                <input type="number" id="like-min" min="1" max="60" value="10">
                <span>-</span>
                <input type="number" id="like-max" min="1" max="60" value="50">
              </div>
            </div>
            <div class="status-bar">
              <span class="status-indicator" id="like-status">已停止</span>
              <span class="count-badge" id="like-count">0 次</span>
            </div>
          </div>
        </div>
        
        <!-- 评论控制 -->
        <div class="control-section comment-section">
          <div class="section-header">
            <span class="section-title">
              <span class="section-icon">💬</span>
              自动评论
            </span>
            <label class="toggle-switch">
              <input type="checkbox" id="comment-toggle">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="section-body">
            <div class="control-group">
              <label>发送间隔（秒）</label>
              <input type="number" id="comment-interval" min="5" max="3600" value="90">
            </div>
            <div class="control-group">
              <label>发送模式</label>
              <select id="comment-mode">
                <option value="random">随机循环</option>
                <option value="sequence">按顺序</option>
                <option value="smart">智能去重</option>
              </select>
            </div>
            <div class="control-group">
              <label>评论列表（<span id="comment-count-display">0</span>/50）</label>
              <textarea id="comment-list" placeholder="输入评论，每行一条..."></textarea>
              <div class="control-actions">
                <button class="btn-import" id="btn-import">📁 导入</button>
                <button class="btn-clear" id="btn-clear-comments">🗑️ 清空</button>
              </div>
              <input type="file" id="file-import" accept=".txt" style="display: none;">
            </div>
            <div class="status-bar">
              <span class="status-indicator" id="comment-status">已停止</span>
              <span class="count-badge" id="comment-count">0 条</span>
            </div>
          </div>
        </div>
        
        <!-- 日志面板 -->
        <div class="log-section">
          <div class="section-header">
            <span class="section-title">
              <span class="section-icon">📝</span>
              操作日志
            </span>
            <button class="btn-clear-logs" id="btn-clear-logs">清空</button>
          </div>
          <div class="log-container" id="log-container">
            <div class="log-empty">暂无日志</div>
          </div>
        </div>
      </div>
      
      <div class="sidebar-footer">
        <button class="btn-save" id="btn-save">💾 保存配置</button>
        <button class="btn-reset" id="btn-reset">↺ 重置</button>
      </div>
    `;
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 宽度调节
    const resizeHandle = this.element.querySelector('.resize-handle');
    resizeHandle.addEventListener('mousedown', this.onResizeStart.bind(this));
    
    // 折叠/展开
    const collapseBtn = this.element.querySelector('.btn-collapse');
    collapseBtn.addEventListener('click', this.toggleCollapse.bind(this));
    
    // 关闭
    const closeBtn = this.element.querySelector('.btn-close');
    closeBtn.addEventListener('click', this.hide.bind(this));
    
    // 点赞开关
    const likeToggle = this.element.querySelector('#like-toggle');
    likeToggle.addEventListener('change', (e) => {
      if (this.onToggleLike) {
        this.onToggleLike(e.target.checked);
      }
    });
    
    // 评论开关
    const commentToggle = this.element.querySelector('#comment-toggle');
    commentToggle.addEventListener('change', (e) => {
      if (this.onToggleComment) {
        this.onToggleComment(e.target.checked);
      }
    });
    
    // 保存按钮
    const saveBtn = this.element.querySelector('#btn-save');
    saveBtn.addEventListener('click', () => {
      if (this.onSave) {
        this.onSave(this.getConfig());
      }
    });
    
    // 重置按钮
    const resetBtn = this.element.querySelector('#btn-reset');
    resetBtn.addEventListener('click', () => {
      if (this.onReset) {
        this.onReset();
      }
    });
    
    // 导入按钮
    const importBtn = this.element.querySelector('#btn-import');
    const fileInput = this.element.querySelector('#file-import');
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', this.handleFileImport.bind(this));
    
    // 清空评论
    const clearCommentsBtn = this.element.querySelector('#btn-clear-comments');
    clearCommentsBtn.addEventListener('click', () => {
      const textarea = this.element.querySelector('#comment-list');
      textarea.value = '';
      this.updateCommentCount(0);
    });
    
    // 清空日志
    const clearLogsBtn = this.element.querySelector('#btn-clear-logs');
    clearLogsBtn.addEventListener('click', () => {
      this.clearLogs();
    });
    
    // 评论列表变化
    const commentList = this.element.querySelector('#comment-list');
    commentList.addEventListener('input', () => {
      const count = commentList.value.split('\n').filter(line => line.trim()).length;
      this.updateCommentCount(count);
    });
  }
  
  /**
   * 开始调节宽度
   */
  onResizeStart(e) {
    this.isDragging = true;
    this.startX = e.clientX;
    this.startWidth = parseInt(this.element.style.width);
    
    this.element.classList.add('resizing');
    
    document.addEventListener('mousemove', this.onResizeMove.bind(this));
    document.addEventListener('mouseup', this.onResizeEnd.bind(this));
    
    e.preventDefault();
  }
  
  /**
   * 调节宽度中
   */
  onResizeMove(e) {
    if (!this.isDragging) return;
    
    const delta = this.startX - e.clientX;
    let newWidth = this.startWidth + delta;
    
    // 限制范围
    newWidth = Math.max(320, Math.min(600, newWidth));
    
    this.element.style.width = `${newWidth}px`;
    this.config.width = newWidth;
  }
  
  /**
   * 结束调节宽度
   */
  onResizeEnd() {
    this.isDragging = false;
    this.element.classList.remove('resizing');
    
    document.removeEventListener('mousemove', this.onResizeMove.bind(this));
    document.removeEventListener('mouseup', this.onResizeEnd.bind(this));
    
    // 触发保存
    this.emit('width:changed', this.config.width);
  }
  
  /**
   * 折叠/展开
   */
  toggleCollapse() {
    this.config.collapsed = !this.config.collapsed;
    this.element.classList.toggle('collapsed', this.config.collapsed);
    this.emit('collapse:changed', this.config.collapsed);
  }
  
  /**
   * 隐藏侧边栏
   */
  hide() {
    this.container.style.display = 'none';
    this.emit('hidden');
  }
  
  /**
   * 显示侧边栏
   */
  show() {
    this.container.style.display = 'block';
    this.emit('shown');
  }
  
  /**
   * 处理文件导入
   */
  handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const textarea = this.element.querySelector('#comment-list');
      
      // 追加到现有内容
      const existing = textarea.value.trim();
      const newComments = content.split('\n').filter(line => line.trim());
      
      if (existing) {
        textarea.value = existing + '\n' + newComments.join('\n');
      } else {
        textarea.value = newComments.join('\n');
      }
      
      // 限制最多50条
      const allComments = textarea.value.split('\n').filter(line => line.trim());
      if (allComments.length > 50) {
        textarea.value = allComments.slice(0, 50).join('\n');
        this.showNotification('已自动截取前50条评论', 'warning');
      }
      
      this.updateCommentCount(Math.min(allComments.length, 50));
      this.showNotification('导入成功', 'success');
    };
    
    reader.readAsText(file);
    e.target.value = ''; // 重置input
  }
  
  /**
   * 获取当前配置
   */
  getConfig() {
    const likeMin = parseInt(this.element.querySelector('#like-min').value) || 10;
    const likeMax = parseInt(this.element.querySelector('#like-max').value) || 50;
    const commentInterval = parseInt(this.element.querySelector('#comment-interval').value) || 90;
    const commentMode = this.element.querySelector('#comment-mode').value;
    const commentsText = this.element.querySelector('#comment-list').value;
    const comments = commentsText.split('\n').filter(line => line.trim()).slice(0, 50);
    
    return {
      likeEnabled: this.element.querySelector('#like-toggle').checked,
      likeMinPerMinute: Math.min(likeMin, likeMax),
      likeMaxPerMinute: Math.max(likeMin, likeMax),
      commentEnabled: this.element.querySelector('#comment-toggle').checked,
      commentInterval: commentInterval,
      commentMode: commentMode,
      comments: comments,
      sidebarWidth: this.config.width,
      sidebarCollapsed: this.config.collapsed
    };
  }
  
  /**
   * 设置配置
   */
  setConfig(config) {
    if (config.likeMinPerMinute !== undefined) {
      this.element.querySelector('#like-min').value = config.likeMinPerMinute;
    }
    if (config.likeMaxPerMinute !== undefined) {
      this.element.querySelector('#like-max').value = config.likeMaxPerMinute;
    }
    if (config.commentInterval !== undefined) {
      this.element.querySelector('#comment-interval').value = config.commentInterval;
    }
    if (config.commentMode !== undefined) {
      this.element.querySelector('#comment-mode').value = config.commentMode;
    }
    if (config.comments !== undefined) {
      this.element.querySelector('#comment-list').value = config.comments.join('\n');
      this.updateCommentCount(config.comments.length);
    }
  }
  
  /**
   * 更新点赞状态
   */
  updateLikeStatus(running, count) {
    const statusEl = this.element.querySelector('#like-status');
    const countEl = this.element.querySelector('#like-count');
    
    statusEl.textContent = running ? '运行中' : '已停止';
    statusEl.classList.toggle('running', running);
    countEl.textContent = `${count} 次`;
  }
  
  /**
   * 更新评论状态
   */
  updateCommentStatus(running, count) {
    const statusEl = this.element.querySelector('#comment-status');
    const countEl = this.element.querySelector('#comment-count');
    
    statusEl.textContent = running ? '运行中' : '已停止';
    statusEl.classList.toggle('running', running);
    countEl.textContent = `${count} 条`;
  }
  
  /**
   * 更新评论数量显示
   */
  updateCommentCount(count) {
    this.element.querySelector('#comment-count-display').textContent = count;
  }
  
  /**
   * 添加日志
   */
  addLog(log) {
    const container = this.element.querySelector('#log-container');
    
    // 移除空状态
    const emptyEl = container.querySelector('.log-empty');
    if (emptyEl) {
      emptyEl.remove();
    }
    
    // 创建日志项
    const logItem = document.createElement('div');
    logItem.className = `log-item ${log.type}`;
    logItem.innerHTML = `
      <span class="log-time">${log.time}</span>
      <span class="log-type"></span>
      <div class="log-content">
        <span class="log-message">${this.escapeHtml(log.message)}</span>
        ${log.data ? `<span class="log-data">${JSON.stringify(log.data)}</span>` : ''}
      </div>
      <span class="log-source">${log.source}</span>
    `;
    
    // 添加到顶部
    container.insertBefore(logItem, container.firstChild);
    
    // 限制数量
    while (container.children.length > 100) {
      container.removeChild(container.lastChild);
    }
    
    // 滚动到顶部
    container.scrollTop = 0;
  }
  
  /**
   * 清空日志
   */
  clearLogs() {
    const container = this.element.querySelector('#log-container');
    container.innerHTML = '<div class="log-empty">暂无日志</div>';
  }
  
  /**
   * 显示通知
   */
  showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#00C853' : type === 'warning' ? '#FFC107' : '#2196F3'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      animation: fadeInUp 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后移除
    setTimeout(() => {
      notification.style.animation = 'fadeIn 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  /**
   * HTML转义
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * 触发事件
   */
  emit(event, data) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`douyin-helper:sidebar:${event}`, { detail: data }));
    }
  }
  
  // CSS 样式（内联）
  getVariablesCSS() {
    return `
      :host {
        --color-bg-primary: #161823;
        --color-bg-secondary: #252733;
        --color-accent: #FE2C55;
        --color-accent-hover: #FF4766;
        --color-accent-active: #E6284D;
        --color-text-primary: #FFFFFF;
        --color-text-secondary: #8A8B99;
        --color-text-muted: #5C5E6B;
        --color-border: #3A3C4A;
        --color-divider: #2A2C38;
        --color-success: #00C853;
        --color-warning: #FFC107;
        --color-error: #FF1744;
        --color-info: #2196F3;
        --header-height: 56px;
        --footer-height: 48px;
        --spacing-xs: 4px;
        --spacing-sm: 8px;
        --spacing-md: 12px;
        --spacing-lg: 16px;
        --spacing-xl: 24px;
        --radius-sm: 4px;
        --radius-md: 8px;
        --radius-lg: 12px;
        --radius-full: 9999px;
        --transition-fast: 0.15s ease;
        --transition-normal: 0.25s ease;
      }
    `;
  }
  
  getSidebarCSS() {
    return `
      .douyin-helper-sidebar {
        position: fixed;
        right: 0;
        top: 0;
        height: 100vh;
        background: var(--color-bg-primary);
        border-left: 1px solid var(--color-border);
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
        font-size: 14px;
        color: var(--color-text-primary);
        overflow: hidden;
        transition: width var(--transition-normal), transform var(--transition-normal);
      }
      
      .resize-handle {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        cursor: col-resize;
        background: transparent;
        z-index: 10;
        transition: background var(--transition-fast);
      }
      
      .resize-handle:hover, .douyin-helper-sidebar.resizing .resize-handle {
        background: var(--color-accent);
      }
      
      .sidebar-header {
        height: var(--header-height);
        background: var(--color-bg-secondary);
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--spacing-lg);
        flex-shrink: 0;
        user-select: none;
      }
      
      .sidebar-header .title {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0;
      }
      
      .header-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
      
      .header-actions button {
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        color: var(--color-text-secondary);
        border-radius: var(--radius-md);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: all var(--transition-fast);
      }
      
      .header-actions button:hover {
        background: var(--color-bg-primary);
        color: var(--color-text-primary);
      }
      
      .header-actions button.close:hover {
        background: var(--color-error);
        color: white;
      }
      
      .sidebar-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-md);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }
      
      .sidebar-content::-webkit-scrollbar {
        width: 6px;
      }
      
      .sidebar-content::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .sidebar-content::-webkit-scrollbar-thumb {
        background: var(--color-border);
        border-radius: var(--radius-full);
      }
      
      .sidebar-content::-webkit-scrollbar-thumb:hover {
        background: var(--color-text-muted);
      }
      
      .sidebar-footer {
        height: var(--footer-height);
        background: var(--color-bg-secondary);
        border-top: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-md);
        padding: 0 var(--spacing-lg);
        flex-shrink: 0;
      }
      
      .douyin-helper-sidebar.collapsed {
        width: 40px !important;
      }
      
      .douyin-helper-sidebar.collapsed .sidebar-content,
      .douyin-helper-sidebar.collapsed .sidebar-footer {
        display: none;
      }
      
      .douyin-helper-sidebar.collapsed .sidebar-header {
        padding: 0;
        justify-content: center;
      }
      
      .douyin-helper-sidebar.collapsed .sidebar-header .title,
      .douyin-helper-sidebar.collapsed .btn-close {
        display: none;
      }
      
      .douyin-helper-sidebar.collapsed .btn-collapse {
        transform: rotate(180deg);
      }
    `;
  }
  
  getControlsCSS() {
    return `
      .control-section {
        background: var(--color-bg-secondary);
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 1px solid var(--color-border);
      }
      
      .control-section .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md) var(--spacing-lg);
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid var(--color-border);
      }
      
      .control-section .section-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-primary);
      }
      
      .control-section .section-icon {
        font-size: 16px;
      }
      
      .toggle-switch {
        position: relative;
        width: 44px;
        height: 24px;
        cursor: pointer;
      }
      
      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .toggle-slider {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--color-border);
        border-radius: var(--radius-full);
        transition: background var(--transition-fast);
      }
      
      .toggle-slider::before {
        content: '';
        position: absolute;
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background: white;
        border-radius: 50%;
        transition: transform var(--transition-fast);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
      
      .toggle-switch input:checked + .toggle-slider {
        background: var(--color-accent);
      }
      
      .toggle-switch input:checked + .toggle-slider::before {
        transform: translateX(20px);
      }
      
      .control-section .section-body {
        padding: var(--spacing-lg);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }
      
      .control-group {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
      }
      
      .control-group label {
        font-size: 12px;
        color: var(--color-text-secondary);
        font-weight: 500;
      }
      
      .control-group input[type="number"],
      .control-group select,
      .control-group textarea {
        background: var(--color-bg-primary);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        color: var(--color-text-primary);
        font-size: 14px;
        outline: none;
        transition: all var(--transition-fast);
      }
      
      .control-group input[type="number"]:focus,
      .control-group select:focus,
      .control-group textarea:focus {
        border-color: var(--color-accent);
        box-shadow: 0 0 0 2px rgba(254, 44, 85, 0.2);
      }
      
      .control-group input[type="number"] {
        width: 80px;
      }
      
      .control-group select {
        cursor: pointer;
      }
      
      .control-group textarea {
        min-height: 100px;
        resize: vertical;
        font-family: inherit;
        line-height: 1.5;
      }
      
      .range-inputs {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }
      
      .range-inputs span {
        color: var(--color-text-muted);
      }
      
      .control-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
      
      .control-actions button {
        flex: 1;
        padding: var(--spacing-sm) var(--spacing-md);
        border: 1px solid var(--color-border);
        background: var(--color-bg-primary);
        color: var(--color-text-secondary);
        border-radius: var(--radius-sm);
        font-size: 12px;
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      
      .control-actions button:hover {
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
        border-color: var(--color-text-muted);
      }
      
      .status-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--color-bg-primary);
        border-radius: var(--radius-sm);
        margin-top: var(--spacing-sm);
      }
      
      .status-indicator {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: 12px;
        color: var(--color-text-secondary);
      }
      
      .status-indicator::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-text-muted);
      }
      
      .status-indicator.running::before {
        background: var(--color-success);
        box-shadow: 0 0 6px var(--color-success);
      }
      
      .count-badge {
        font-size: 12px;
        color: var(--color-accent);
        font-weight: 600;
      }
      
      .btn-save, .btn-reset {
        padding: var(--spacing-sm) var(--spacing-xl);
        border: none;
        border-radius: var(--radius-sm);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      
      .btn-save {
        background: var(--color-accent);
        color: white;
      }
      
      .btn-save:hover {
        background: var(--color-accent-hover);
      }
      
      .btn-reset {
        background: transparent;
        color: var(--color-text-secondary);
        border: 1px solid var(--color-border);
      }
      
      .btn-reset:hover {
        background: var(--color-bg-primary);
        color: var(--color-text-primary);
      }
    `;
  }
  
  getLogsCSS() {
    return `
      .log-section {
        background: var(--color-bg-secondary);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 150px;
        max-height: 300px;
      }
      
      .log-section .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md) var(--spacing-lg);
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid var(--color-border);
        flex-shrink: 0;
      }
      
      .log-section .section-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-primary);
      }
      
      .log-section .section-icon {
        font-size: 16px;
      }
      
      .btn-clear-logs {
        padding: var(--spacing-xs) var(--spacing-sm);
        border: 1px solid var(--color-border);
        background: transparent;
        color: var(--color-text-secondary);
        border-radius: var(--radius-sm);
        font-size: 11px;
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      
      .btn-clear-logs:hover {
        background: var(--color-error);
        border-color: var(--color-error);
        color: white;
      }
      
      .log-container {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-sm);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
      }
      
      .log-container::-webkit-scrollbar {
        width: 4px;
      }
      
      .log-container::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .log-container::-webkit-scrollbar-thumb {
        background: var(--color-border);
        border-radius: var(--radius-full);
      }
      
      .log-item {
        display: flex;
        gap: var(--spacing-sm);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 11px;
        line-height: 1.4;
        animation: slideIn 0.2s ease;
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .log-item:hover {
        background: rgba(255, 255, 255, 0.03);
      }
      
      .log-time {
        color: var(--color-text-muted);
        font-family: 'Courier New', monospace;
        white-space: nowrap;
        flex-shrink: 0;
      }
      
      .log-item > .log-type {
        width: 4px;
        height: 100%;
        border-radius: var(--radius-full);
        flex-shrink: 0;
      }
      
      .log-item.success > .log-type {
        background: var(--color-success);
      }
      
      .log-item.warning > .log-type {
        background: var(--color-warning);
      }
      
      .log-item.error > .log-type {
        background: var(--color-error);
      }
      
      .log-item.info > .log-type {
        background: var(--color-info);
      }
      
      .log-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .log-message {
        color: var(--color-text-primary);
      }
      
      .log-data {
        color: var(--color-text-muted);
        font-size: 10px;
        font-family: 'Courier New', monospace;
      }
      
      .log-source {
        font-size: 9px;
        padding: 1px 4px;
        border-radius: var(--radius-sm);
        background: var(--color-bg-primary);
        color: var(--color-text-muted);
        text-transform: uppercase;
        flex-shrink: 0;
      }
      
      .log-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--color-text-muted);
        font-size: 12px;
        text-align: center;
      }
    `;
  }
  
  getAnimationsCSS() {
    return `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeInRight {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-fadeInRight {
        animation: fadeInRight 0.3s ease;
      }
    `;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sidebar;
}
