/**
 * AntiDetection - 反检测机制
 * 隐藏自动化特征，模拟人类行为
 */

class AntiDetection {
  /**
   * 初始化所有反检测措施
   */
  static init() {
    this.hideWebdriver();
    this.hideChrome();
    this.protectConsole();
    this.randomizeBehavior();
  }
  
  /**
   * 隐藏 webdriver 标记
   */
  static hideWebdriver() {
    // 覆盖 navigator.webdriver
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
      configurable: true
    });
    
    // 删除 webdriver 属性
    delete navigator.webdriver;
    
    // 覆盖 Chrome 的 webdriver 检测
    const originalDefineProperty = Object.defineProperty;
    Object.defineProperty = function(obj, prop, descriptor) {
      if (prop === 'webdriver') {
        return obj;
      }
      return originalDefineProperty.call(this, obj, prop, descriptor);
    };
  }
  
  /**
   * 隐藏 Chrome 自动化特征
   */
  static hideChrome() {
    // 修改 chrome 对象
    if (window.chrome) {
      const chromeObj = window.chrome;
      
      // 覆盖 loadTimes
      if (chromeObj.loadTimes) {
        chromeObj.loadTimes = function() {
          return {
            requestTime: performance.now(),
            startLoadTime: performance.now(),
            commitLoadTime: performance.now(),
            finishDocumentLoadTime: performance.now(),
            finishLoadTime: performance.now(),
            firstPaintTime: 0,
            firstPaintAfterLoadTime: 0,
            navigationType: 'Other'
          };
        };
      }
      
      // 覆盖 csi
      if (chromeObj.csi) {
        chromeObj.csi = function() {
          return {
            startE: performance.now(),
            onloadT: Date.now(),
            pageT: performance.now()
          };
        };
      }
    }
    
    // 修改 Notification 权限
    const originalNotification = window.Notification;
    if (originalNotification) {
      Object.defineProperty(window, 'Notification', {
        get: function() {
          return originalNotification;
        },
        set: function(value) {
          originalNotification = value;
        }
      });
    }
  }
  
  /**
   * 保护控制台，防止检测
   */
  static protectConsole() {
    // 保存原始方法
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };
    
    // 检测是否在控制台打开状态
    let devtoolsOpen = false;
    
    // 通过 debugger 检测
    const checkDevTools = () => {
      const threshold = 160;
      const width = window.outerWidth - window.innerWidth;
      const height = window.outerHeight - window.innerHeight;
      
      if (width > threshold || height > threshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          // 可以在这里暂停自动化操作
        }
      } else {
        devtoolsOpen = false;
      }
    };
    
    // 定期检测
    setInterval(checkDevTools, 1000);
    
    // 覆盖 console 方法
    Object.keys(originalConsole).forEach(method => {
      console[method] = function(...args) {
        // 添加前缀以区分
        if (args.length > 0 && typeof args[0] === 'string') {
          if (args[0].includes('[抖音助手]')) {
            return originalConsole[method].apply(console, args);
          }
        }
        return originalConsole[method].apply(console, args);
      };
    });
  }
  
  /**
   * 随机化行为模式
   */
  static randomizeBehavior() {
    // 随机化一些浏览器特征
    const randomPlugin = {
      name: 'Chrome PDF Plugin',
      filename: 'internal-pdf-viewer',
      description: 'Portable Document Format'
    };
    
    // 修改 plugins 列表
    try {
      Object.defineProperty(navigator, 'plugins', {
        get: function() {
          return [randomPlugin];
        }
      });
    } catch (e) {
      // 忽略错误
    }
    
    // 修改 languages
    try {
      Object.defineProperty(navigator, 'languages', {
        get: function() {
          return ['zh-CN', 'zh', 'en'];
        }
      });
    } catch (e) {
      // 忽略错误
    }
  }
  
  /**
   * 生成随机延迟
   */
  static randomDelay(baseMs, variancePercent = 20) {
    const variance = baseMs * (variancePercent / 100);
    const randomOffset = (Math.random() - 0.5) * 2 * variance;
    return Math.max(0, baseMs + randomOffset);
  }
  
  /**
   * 生成人类化的鼠标移动路径
   */
  static generateMousePath(startX, startY, endX, endY, points = 10) {
    const path = [];
    const dx = endX - startX;
    const dy = endY - startY;
    
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      // 添加贝塞尔曲线式的随机偏移
      const randomX = (Math.random() - 0.5) * 20;
      const randomY = (Math.random() - 0.5) * 20;
      
      path.push({
        x: startX + dx * t + randomX,
        y: startY + dy * t + randomY
      });
    }
    
    return path;
  }
  
  /**
   * 模拟人类点击时间间隔
   */
  static humanLikeInterval() {
    // 人类点击间隔通常在 100-300ms 之间
    return 100 + Math.random() * 200;
  }
  
  /**
   * 模拟人类思考时间
   */
  static humanLikePause() {
    // 人类思考时间通常在 500-2000ms 之间
    return 500 + Math.random() * 1500;
  }
}

// 自动初始化
if (typeof window !== 'undefined') {
  AntiDetection.init();
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AntiDetection;
}
