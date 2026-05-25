/**
 * 抖音AI托评助手
 * Background Service Worker (Chrome MV3)
 * v2.1.0 - 支持DeepSeek AI智能评论
 */

// Service Worker 安装
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[抖音助手] 扩展已安装/更新', details);
  initializeDefaultConfig();
});

// 初始化默认配置
async function initializeDefaultConfig() {
  const defaultConfig = {
    // 点赞配置
    likeEnabled: false,
    likeMinPerMinute: 20,
    likeMaxPerMinute: 50,
    
    // AI评论配置
    aiCommentEnabled: false,
    commentInterval: 90,
    aiPrompt: '请根据以下文字和图片内容，以一个真实准备购买的35-55岁买家人设风格生成一条15个字以内的抖音直播间弹幕，只输出弹幕内容本身，不要任何解释',
    aiApiKey: '',
    
    // UI配置
    sidebarWidth: 400,
    sidebarCollapsed: false
  };
  
  const defaultStats = {
    totalLikes: 0,
    totalComments: 0,
    todayLikes: 0,
    todayComments: 0,
    lastResetDate: new Date().toISOString().split('T')[0]
  };
  
  try {
    const stored = await chrome.storage.local.get(['config', 'stats']);
    
    if (!stored.config) {
      await chrome.storage.local.set({ config: defaultConfig });
      console.log('[抖音助手] 已初始化默认配置');
    } else {
      // 合并新字段到旧配置
      const merged = { ...defaultConfig, ...stored.config };
      await chrome.storage.local.set({ config: merged });
    }
    
    if (!stored.stats) {
      await chrome.storage.local.set({ stats: defaultStats });
      console.log('[抖音助手] 已初始化默认统计');
    }
  } catch (error) {
    console.error('[抖音助手] 初始化失败:', error);
  }
}

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[抖音助手] 收到消息:', request.action, '来自:', sender.tab?.url);
  
  switch (request.action) {
    case 'GET_CONFIG':
      handleGetConfig(sendResponse);
      return true;
      
    case 'SET_CONFIG':
      handleSetConfig(request.config, sendResponse);
      return true;
      
    case 'GET_STATS':
      handleGetStats(sendResponse);
      return true;
      
    case 'UPDATE_STATS':
      handleUpdateStats(request.stats, sendResponse);
      return true;
      
    case 'GET_LOGS':
      handleGetLogs(sendResponse);
      return true;
      
    case 'ADD_LOG':
      handleAddLog(request.log, sendResponse);
      return true;
      
    case 'CLEAR_LOGS':
      handleClearLogs(sendResponse);
      return true;
    
    case 'CALL_DEEPSEEK_API':
      handleDeepSeekApiCall(request.payload, request.apiKey, sendResponse);
      return true;
      
    default:
      sendResponse({ success: false, error: '未知操作' });
      return false;
  }
});

// 调用 DeepSeek API（在background中代理，绕过CORS限制）
async function handleDeepSeekApiCall(payload, apiKey, sendResponse) {
  try {
    console.log('[抖音助手] 调用DeepSeek API...');
    
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errText = await response.text();
      console.error('[抖音助手] DeepSeek API错误:', response.status, errText);
      sendResponse({ success: false, error: `API错误 ${response.status}: ${errText}` });
      return;
    }
    
    const data = await response.json();
    console.log('[抖音助手] DeepSeek API响应成功');
    sendResponse({ success: true, data });
    
  } catch (error) {
    console.error('[抖音助手] DeepSeek API调用失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 获取配置
async function handleGetConfig(sendResponse) {
  try {
    const data = await chrome.storage.local.get('config');
    sendResponse({ success: true, config: data.config });
  } catch (error) {
    console.error('[抖音助手] 获取配置失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 保存配置
async function handleSetConfig(config, sendResponse) {
  try {
    await chrome.storage.local.set({ config });
    console.log('[抖音助手] 配置已保存');
    sendResponse({ success: true });
  } catch (error) {
    console.error('[抖音助手] 保存配置失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 获取统计数据
async function handleGetStats(sendResponse) {
  try {
    const data = await chrome.storage.local.get('stats');
    
    const today = new Date().toISOString().split('T')[0];
    if (data.stats && data.stats.lastResetDate !== today) {
      data.stats.todayLikes = 0;
      data.stats.todayComments = 0;
      data.stats.lastResetDate = today;
      await chrome.storage.local.set({ stats: data.stats });
    }
    
    sendResponse({ success: true, stats: data.stats });
  } catch (error) {
    console.error('[抖音助手] 获取统计失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 更新统计数据
async function handleUpdateStats(stats, sendResponse) {
  try {
    await chrome.storage.local.set({ stats });
    sendResponse({ success: true });
  } catch (error) {
    console.error('[抖音助手] 更新统计失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 获取日志
async function handleGetLogs(sendResponse) {
  try {
    const data = await chrome.storage.local.get('logs');
    sendResponse({ success: true, logs: data.logs || [] });
  } catch (error) {
    console.error('[抖音助手] 获取日志失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 添加日志
async function handleAddLog(log, sendResponse) {
  try {
    const data = await chrome.storage.local.get('logs');
    const logs = data.logs || [];
    
    logs.unshift({
      id: generateUUID(),
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      ...log
    });
    
    if (logs.length > 100) {
      logs.length = 100;
    }
    
    await chrome.storage.local.set({ logs });
    sendResponse({ success: true });
  } catch (error) {
    console.error('[抖音助手] 添加日志失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 清空日志
async function handleClearLogs(sendResponse) {
  try {
    await chrome.storage.local.set({ logs: [] });
    console.log('[抖音助手] 日志已清空');
    sendResponse({ success: true });
  } catch (error) {
    console.error('[抖音助手] 清空日志失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 生成 UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Service Worker 激活时清理旧日志
chrome.runtime.onStartup.addListener(() => {
  console.log('[抖音助手] Service Worker 已启动');
});

// 保持 Service Worker 活跃
chrome.alarms?.create('keepAlive', { periodInMinutes: 4.9 });
chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    console.log('[抖音助手] 保持活跃');
  }
});
