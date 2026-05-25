/**
 * DOM Helper 工具类
 */

class DOMHelper {
  /**
   * 等待元素出现
   */
  static async waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // 超时处理
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`等待元素超时: ${selector}`));
      }, timeout);
    });
  }
  
  /**
   * 检查元素是否可见
   */
  static isVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && 
           rect.height > 0 && 
           rect.top >= 0 && 
           rect.left >= 0;
  }
  
  /**
   * 创建 Shadow DOM
   */
  static createShadowContainer(id) {
    const container = document.createElement('div');
    container.id = id;
    const shadow = container.attachShadow({ mode: 'open' });
    return { container, shadow };
  }
  
  /**
   * 延迟函数
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * 生成随机数（范围内）
   */
  static random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * 生成正态分布随机数
   */
  static normalRandom(min, max) {
    // Box-Muller 变换
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    const mean = (min + max) / 2;
    const stdDev = (max - min) / 4;
    
    let result = Math.round(mean + z * stdDev);
    return Math.max(min, Math.min(max, result));
  }
  
  /**
   * 创建 SVG 元素
   */
  static createSVG(svgString) {
    const div = document.createElement('div');
    div.innerHTML = svgString.trim();
    return div.firstChild;
  }
  
  /**
   * 防抖函数
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  /**
   * 节流函数
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMHelper;
}
