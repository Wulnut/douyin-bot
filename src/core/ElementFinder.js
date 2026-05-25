/**
 * ElementFinder - 抖音直播间元素查找器
 * 专门用于定位抖音网页版的关键元素
 */

class ElementFinder {
  /**
   * 查找直播视频元素（点赞目标）
   */
  static findLiveVideo() {
    // 选择器列表（按优先级排序）
    const selectors = [
      '.xgplayer-container video',           // 西瓜播放器
      '[data-e2e="live-player"] video',      // 数据属性标记
      '.live-player-video video',            // 直播播放器
      '.room-player video',                  // 房间播放器
      'video[class*="player"]',              // 包含player的video
      'video[class*="xgplayer"]',            // 西瓜播放器类名
      '.player video',                       // 通用player
      'video'                                // 兜底
    ];
    
    // 尝试每个选择器
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && this.isVisible(element)) {
        const rect = element.getBoundingClientRect();
        // 视频需要足够大（至少300x200）
        if (rect.width > 300 && rect.height > 200) {
          return element;
        }
      }
    }
    
    // 备用策略：查找最大的video元素
    return this.findLargestVideo();
  }
  
  /**
   * 查找最大的可见video元素
   */
  static findLargestVideo() {
    const videos = document.querySelectorAll('video');
    let largestVideo = null;
    let maxArea = 0;
    
    videos.forEach(video => {
      if (!this.isVisible(video)) return;
      
      const rect = video.getBoundingClientRect();
      const area = rect.width * rect.height;
      
      // 需要足够大（最小300x200）
      if (area > maxArea && rect.width > 300 && rect.height > 200) {
        maxArea = area;
        largestVideo = video;
      }
    });
    
    return largestVideo;
  }
  
  /**
   * 查找评论输入框
   */
  static findCommentInput() {
    // 现代抖音通常使用 contenteditable
    const selectors = [
      // 数据属性标记
      '[contenteditable="true"][data-e2e="comment-input"]',
      '[contenteditable="true"][data-e2e="chat-input"]',
      
      // placeholder 特征
      '[contenteditable="true"][placeholder*="说点什么"]',
      '[contenteditable="true"][placeholder*="发条评论"]',
      '[contenteditable="true"][placeholder*="和大家聊点什么"]',
      '[contenteditable="true"][placeholder*="评论"]',
      
      // 类名特征
      '.comment-input [contenteditable="true"]',
      '.chat-input [contenteditable="true"]',
      '.room-right [contenteditable="true"]',
      '[class*="comment"] [contenteditable="true"]',
      '[class*="chat"] [contenteditable="true"]',
      
      // 备用：textarea
      'textarea[data-e2e="comment-input"]',
      'textarea[data-e2e="chat-input"]',
      'textarea[placeholder*="说点什么"]',
      'textarea[placeholder*="发条评论"]',
      '.comment-input textarea',
      '.chat-input textarea',
      '#comment-input',
      '#chat-input'
    ];
    
    // 尝试每个选择器
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && this.isVisible(element)) {
        const rect = element.getBoundingClientRect();
        // 输入框需要足够大
        if (rect.width > 100 && rect.height > 20) {
          return element;
        }
      }
    }
    
    // 兜底策略：查找所有可编辑元素
    return this.findAnyEditableInput();
  }
  
  /**
   * 查找任何可编辑的输入元素
   */
  static findAnyEditableInput() {
    // 查找 contenteditable 元素
    const editables = document.querySelectorAll('[contenteditable="true"]');
    if (editables.length > 0) {
      // 返回最下方的一个（通常是评论输入框）
      const sorted = Array.from(editables).sort((a, b) => {
        return b.getBoundingClientRect().top - a.getBoundingClientRect().top;
      });
      
      for (const el of sorted) {
        if (this.isVisible(el)) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 100 && rect.height > 20) {
            return el;
          }
        }
      }
    }
    
    // 查找 textarea
    const textareas = document.querySelectorAll('textarea');
    if (textareas.length > 0) {
      const sorted = Array.from(textareas).sort((a, b) => {
        return b.getBoundingClientRect().top - a.getBoundingClientRect().top;
      });
      
      for (const el of sorted) {
        if (this.isVisible(el)) {
          return el;
        }
      }
    }
    
    return null;
  }
  
  /**
   * 查找发送按钮（备用方案）
   */
  static findSendButton() {
    const selectors = [
      'button[type="submit"]',
      'button[class*="send"]',
      'button[class*="submit"]',
      '[data-e2e="comment-submit"]',
      '[data-e2e="send-btn"]',
      '.send-btn',
      '.submit-btn'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && this.isVisible(element)) {
        return element;
      }
    }
    
    return null;
  }
  
  /**
   * 检查元素是否可见
   */
  static isVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return rect.width > 0 && 
           rect.height > 0 && 
           style.display !== 'none' && 
           style.visibility !== 'hidden' &&
           style.opacity !== '0';
  }
  
  /**
   * 等待元素出现
   */
  static async waitFor(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element && this.isVisible(element)) {
        resolve(element);
        return;
      }
      
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element && this.isVisible(element)) {
          observer.disconnect();
          resolve(element);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`等待元素超时: ${selector}`));
      }, timeout);
    });
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ElementFinder;
}
