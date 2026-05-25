/**
 * FloatingButton 浮动按钮组件
 * 显示在页面右下角，用于控制侧边栏
 */

class FloatingButton {
  constructor(config = {}) {
    this.config = {
      visible: config.visible !== false,
      running: config.running || false,
      onClick: config.onClick || null,
      ...config
    };
    
    this.element = null;
    this.container = null;
    this.shadow = null;
  }
  
  /**
   * 创建并显示浮动按钮
   */
  create() {
    // 创建 Shadow DOM 容器
    this.container = document.createElement('div');
    this.container.id = 'douyin-helper-floating-btn-host';
    
    // 附加 Shadow DOM
    this.shadow = this.container.attachShadow({ mode: 'open' });
    
    // 注入样式
    this.injectStyles();
    
    // 创建按钮元素
    this.element = document.createElement('button');
    this.element.className = `douyin-helper-floating-btn ${this.config.running ? 'running' : ''}`;
    const iconUrl = chrome.runtime.getURL('icons/icon128.png');
    this.element.innerHTML = `
      <img class="btn-icon" src="${iconUrl}" alt="抖音助手" width="44" height="44">
      <span class="status-indicator"></span>
      <span class="tooltip">打开助手</span>
    `;
    
    this.shadow.appendChild(this.element);
    document.body.appendChild(this.container);
    
    // 绑定事件
    this.bindEvents();
    
    // 初始状态
    if (!this.config.visible) {
      this.hide();
    }
    
    return this;
  }
  
  /**
   * 注入样式
   */
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
      }
      
      .douyin-helper-floating-btn {
        position: fixed;
        right: 24px;
        bottom: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: transparent;
        border: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        overflow: hidden;
        z-index: 9998;
        transition: all 0.25s ease;
        user-select: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      }
      
      .douyin-helper-floating-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
      }
      
      .douyin-helper-floating-btn:active {
        transform: scale(0.95);
      }
      
      .douyin-helper-floating-btn .btn-icon {
        width: 44px;
        height: 44px;
        object-fit: contain;
        border-radius: 50%;
        pointer-events: none;
      }
      
      .douyin-helper-floating-btn .status-indicator {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #5C5E6B;
        border: 2px solid rgba(0, 0, 0, 0.35);
        transition: background 0.15s ease;
      }
      
      .douyin-helper-floating-btn.running .status-indicator {
        background: #00C853;
        box-shadow: 0 0 8px #00C853;
      }
      
      .douyin-helper-floating-btn.running {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(254, 44, 85, 0.4);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(254, 44, 85, 0);
        }
      }
      
      .douyin-helper-floating-btn .tooltip {
        position: absolute;
        right: 64px;
        bottom: 50%;
        transform: translateY(50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.15s ease;
        font-weight: normal;
      }
      
      .douyin-helper-floating-btn:hover .tooltip {
        opacity: 1;
        visibility: visible;
      }
      
      .douyin-helper-floating-btn.hidden {
        transform: scale(0);
        opacity: 0;
        pointer-events: none;
      }
    `;
    
    this.shadow.appendChild(style);
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    this.element.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.config.onClick) {
        this.config.onClick();
      }
      this.emit('clicked');
    });
  }
  
  /**
   * 显示按钮
   */
  show() {
    this.config.visible = true;
    this.element.classList.remove('hidden');
    this.emit('shown');
  }
  
  /**
   * 隐藏按钮
   */
  hide() {
    this.config.visible = false;
    this.element.classList.add('hidden');
    this.emit('hidden');
  }
  
  /**
   * 设置运行状态
   */
  setRunning(running) {
    this.config.running = running;
    this.element.classList.toggle('running', running);
    this.emit('status:changed', running);
  }
  
  /**
   * 销毁按钮
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.emit('destroyed');
  }
  
  /**
   * 触发事件
   */
  emit(event, data) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`douyin-helper:floating-btn:${event}`, { detail: data }));
    }
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloatingButton;
}
