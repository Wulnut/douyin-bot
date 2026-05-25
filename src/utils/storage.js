/**
 * Storage 工具类 - Chrome Storage API 封装
 */

class Storage {
  static async get(key) {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key];
    } catch (error) {
      console.error('[Storage] 获取失败:', error);
      return null;
    }
  }
  
  static async set(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
      return true;
    } catch (error) {
      console.error('[Storage] 保存失败:', error);
      return false;
    }
  }
  
  static async getConfig() {
    const config = await this.get('config');
    return config || this.getDefaultConfig();
  }
  
  static async setConfig(config) {
    return await this.set('config', config);
  }
  
  static async getStats() {
    const stats = await this.get('stats');
    return stats || this.getDefaultStats();
  }
  
  static async setStats(stats) {
    return await this.set('stats', stats);
  }
  
  static async getLogs() {
    const logs = await this.get('logs');
    return logs || [];
  }
  
  static async addLog(log) {
    const logs = await this.getLogs();
    logs.unshift({
      id: this.generateId(),
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      ...log
    });
    
    // 只保留最近100条
    if (logs.length > 100) {
      logs.length = 100;
    }
    
    return await this.set('logs', logs);
  }
  
  static async clearLogs() {
    return await this.set('logs', []);
  }
  
  static getDefaultConfig() {
    return {
      likeEnabled: false,
      likeMinPerMinute: 10,
      likeMaxPerMinute: 50,
      commentEnabled: false,
      commentInterval: 90,
      commentMode: 'random',
      comments: [],
      smartHistorySize: 10,
      sidebarWidth: 400,
      sidebarCollapsed: false
    };
  }
  
  static getDefaultStats() {
    return {
      totalLikes: 0,
      totalComments: 0,
      todayLikes: 0,
      todayComments: 0,
      lastResetDate: new Date().toISOString().split('T')[0]
    };
  }
  
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
