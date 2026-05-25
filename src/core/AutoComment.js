/**
 * AutoComment - 自动评论核心模块
 * 支持三种发送模式：随机、顺序、智能去重
 */

class AutoComment {
  constructor(config = {}) {
    this.config = {
      enabled: config.enabled || false,
      interval: config.interval || 90,      // 秒
      mode: config.mode || 'random',        // random/sequence/smart
      comments: config.comments || [],
      smartHistorySize: config.smartHistorySize || 10,
      ...config
    };
    
    this.state = {
      isRunning: false,
      isSending: false,                     // 防止重复发送
      totalComments: 0,
      todayComments: 0,
      currentIndex: 0,                      // 顺序模式用
      recentComments: [],                   // 智能去重用
      lastCommentTime: 0,
      retryCount: 0
    };
    
    this.maxRetries = 3;
    this.timerId = null;
  }
  
  /**
   * 启动自动评论
   */
  start() {
    if (this.state.isRunning) {
      console.log('[AutoComment] 已经是运行状态');
      return;
    }
    
    if (!this.config.enabled) {
      console.log('[AutoComment] 未启用，无法启动');
      return;
    }
    
    if (this.config.comments.length === 0) {
      this.log('warning', '评论列表为空，无法启动');
      return;
    }
    
    this.state.isRunning = true;
    this.log('info', '自动评论已启动', {
      mode: this.config.mode,
      interval: this.config.interval,
      commentsCount: this.config.comments.length
    });
    
    // 开始调度
    this.scheduleNextComment();
    
    this.emit('comment:started');
  }
  
  /**
   * 停止自动评论
   */
  stop() {
    if (!this.state.isRunning) {
      return;
    }
    
    this.state.isRunning = false;
    
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    
    this.log('info', '自动评论已停止', {
      total: this.state.totalComments,
      today: this.state.todayComments
    });
    
    this.emit('comment:stopped');
  }
  
  /**
   * 调度下一次评论
   */
  scheduleNextComment() {
    if (!this.state.isRunning) return;
    
    // 清除之前的定时器
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    
    // 计算下次发送时间（添加随机偏移 ±20%）
    const baseInterval = this.config.interval * 1000;
    const variance = baseInterval * 0.2;
    const nextInterval = baseInterval + (Math.random() - 0.5) * variance;
    
    // 最小间隔 3 秒，允许更短的发送间隔
    const finalInterval = Math.max(3000, nextInterval);
    
    this.log('info', `下次评论将在 ${Math.round(finalInterval / 1000)} 秒后发送`);
    
    this.timerId = setTimeout(() => {
      this.sendComment();
    }, finalInterval);
  }
  
  /**
   * 发送评论
   */
  async sendComment() {
    // 防止重复发送
    if (this.state.isSending) {
      this.log('warning', '评论发送中，跳过本次');
      return;
    }
    
    this.state.isSending = true;
    
    try {
      // 查找输入框
      const input = this.findInputElement();
      if (!input) {
        this.log('warning', '未找到评论输入框');
        this.handleRetry();
        this.state.isSending = false;
        return;
      }
      
      // 选择评论
      const comment = this.selectComment();
      if (!comment) {
        this.log('warning', '无法选择评论');
        this.state.isSending = false;
        this.scheduleNextComment();
        return;
      }
      
      // 模拟输入
      await this.simulateInput(input, comment);
      
      // 更新统计
      this.state.totalComments++;
      this.state.todayComments++;
      this.recordComment(comment);
      this.state.lastCommentTime = Date.now();
      
      this.log('success', '评论发送成功', {
        comment: comment.substring(0, 30) + (comment.length > 30 ? '...' : ''),
        total: this.state.totalComments,
        today: this.state.todayComments
      });
      
      this.emit('comment:success', {
        text: comment,
        total: this.state.totalComments,
        today: this.state.todayComments
      });
      
      // 重置重试计数
      this.state.retryCount = 0;
      
    } catch (error) {
      this.log('error', '评论发送失败', { error: error.message });
      this.handleRetry();
    } finally {
      this.state.isSending = false;
    }
    
    // 调度下一次
    this.scheduleNextComment();
  }
  
  /**
   * 选择评论
   */
  selectComment() {
    const { comments, mode } = this.config;
    const { recentComments, currentIndex } = this.state;
    
    if (comments.length === 0) return null;
    
    switch (mode) {
      case 'random':
        // 纯随机
        return comments[Math.floor(Math.random() * comments.length)];
        
      case 'sequence':
        // 顺序循环
        const seqComment = comments[currentIndex % comments.length];
        this.state.currentIndex++;
        return seqComment;
        
      case 'smart':
        // 智能去重：避免重复发送最近的N条
        const available = comments.filter(c => !recentComments.includes(c));
        const pool = available.length > 0 ? available : comments;
        return pool[Math.floor(Math.random() * pool.length)];
        
      default:
        return comments[0];
    }
  }
  
  /**
   * 记录已发送评论（用于智能去重）
   */
  recordComment(comment) {
    this.state.recentComments.unshift(comment);
    if (this.state.recentComments.length > this.config.smartHistorySize) {
      this.state.recentComments.pop();
    }
  }
  
  /**
   * 查找输入框元素
   */
  findInputElement() {
    if (typeof ElementFinder !== 'undefined') {
      return ElementFinder.findCommentInput();
    }
    
    // 备用方案
    const selectors = [
      '[contenteditable="true"]',
      'textarea'
    ];
    
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    
    return null;
  }
  
  /**
   * 模拟输入 - 逐个字符输入避免重复
   */
  async simulateInput(element, text) {
    // 聚焦
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await this.delay(100 + Math.random() * 200);
    
    // 清空现有内容
    if (element.tagName === 'TEXTAREA') {
      element.value = '';
      element.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (element.isContentEditable) {
      element.innerHTML = '';
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    await this.delay(100);
    
    // 逐个字符输入，模拟真实人类行为
    if (element.tagName === 'TEXTAREA') {
      for (let i = 0; i < text.length; i++) {
        element.value += text[i];
        element.dispatchEvent(new Event('input', { bubbles: true }));
        await this.delay(30 + Math.random() * 50);
      }
    } else if (element.isContentEditable) {
      for (let i = 0; i < text.length; i++) {
        element.innerHTML += text[i];
        element.dispatchEvent(new Event('input', { bubbles: true }));
        await this.delay(30 + Math.random() * 50);
      }
    }
    
    await this.delay(200 + Math.random() * 200);
    
    // 先清空输入框防止重复发送
    if (element.tagName === 'TEXTAREA') {
      element.value = '';
    } else if (element.isContentEditable) {
      element.innerHTML = '';
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    
    await this.delay(50);
    
    // 重新输入内容
    if (element.tagName === 'TEXTAREA') {
      element.value = text;
    } else if (element.isContentEditable) {
      element.innerHTML = text;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    
    await this.delay(100);
    
    // 模拟回车发送 - 使用 preventDefault 阻止默认行为防止重复
    const enterEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      charCode: 13
    });
    element.dispatchEvent(enterEvent);
    
    // 立即清空输入框，防止再次触发发送
    await this.delay(50);
    if (element.tagName === 'TEXTAREA') {
      element.value = '';
    } else if (element.isContentEditable) {
      element.innerHTML = '';
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    
    // 等待发送完成
    await this.delay(500);
  }
  
  /**
   * 处理重试
   */
  handleRetry() {
    this.state.retryCount++;
    
    if (this.state.retryCount <= this.maxRetries) {
      this.log('info', `第 ${this.state.retryCount} 次重试...`);
      setTimeout(() => {
        this.sendComment();
      }, 2000 * this.state.retryCount);
    } else {
      this.log('error', '达到最大重试次数，跳过本次');
      this.state.retryCount = 0;
      this.scheduleNextComment();
    }
  }
  
  /**
   * 更新配置
   */
  updateConfig(config) {
    const prevEnabled = this.config.enabled;
    const wasRunning = this.state.isRunning;
    const oldInterval = this.config.interval;
    
    this.config = { ...this.config, ...config };
    
    // 处理状态变化
    if (prevEnabled && !this.config.enabled) {
      this.stop();
    } else if (!prevEnabled && this.config.enabled && this.config.comments.length > 0) {
      this.start();
    } else if (wasRunning && this.config.enabled && config.interval !== undefined && config.interval !== oldInterval) {
      // 间隔时间改变，重新调度
      this.log('info', `评论间隔已更新为 ${config.interval} 秒`);
      this.scheduleNextComment();
    }
  }
  
  /**
   * 获取统计
   */
  getStats() {
    return {
      total: this.state.totalComments,
      today: this.state.todayComments
    };
  }
  
  /**
   * 延迟
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * 记录日志
   */
  log(type, message, data = {}) {
    if (typeof Logger !== 'undefined') {
      Logger.add({
        type,
        source: 'comment',
        message,
        data
      });
    } else {
      console.log(`[AutoComment][${type}] ${message}`, data);
    }
  }
  
  /**
   * 触发事件
   */
  emit(event, data) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`douyin-helper:${event}`, { detail: data }));
    }
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutoComment;
}
