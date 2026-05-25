/**
 * Logger 日志系统
 */

class Logger {
  static async add(log) {
    const logEntry = {
      id: this.generateId(),
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      type: log.type || 'info',
      source: log.source || 'system',
      message: log.message,
      data: log.data || {}
    };
    
    // 发送到 Storage
    try {
      if (typeof Storage !== 'undefined') {
        await Storage.addLog(logEntry);
      }
    } catch (error) {
      console.error('[Logger] 保存日志失败:', error);
    }
    
    // 同时输出到控制台
    this.console(logEntry);
    
    // 触发日志更新事件
    this.emit('log:added', logEntry);
    
    return logEntry;
  }
  
  static console(log) {
    const prefix = `[${log.time}][${log.source.toUpperCase()}]`;
    switch (log.type) {
      case 'success':
        console.log(`%c${prefix} ${log.message}`, 'color: #00C853', log.data);
        break;
      case 'warning':
        console.warn(`${prefix} ${log.message}`, log.data);
        break;
      case 'error':
        console.error(`${prefix} ${log.message}`, log.data);
        break;
      default:
        console.log(`${prefix} ${log.message}`, log.data);
    }
  }
  
  static async getAll() {
    try {
      if (typeof Storage !== 'undefined') {
        return await Storage.getLogs();
      }
    } catch (error) {
      console.error('[Logger] 获取日志失败:', error);
    }
    return [];
  }
  
  static async clear() {
    try {
      if (typeof Storage !== 'undefined') {
        await Storage.clearLogs();
      }
      this.emit('logs:cleared');
      return true;
    } catch (error) {
      console.error('[Logger] 清空日志失败:', error);
      return false;
    }
  }
  
  static emit(event, data) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`douyin-helper:${event}`, { detail: data }));
    }
  }
  
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
}
