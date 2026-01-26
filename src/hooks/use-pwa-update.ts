import { useState, useEffect } from 'react';

/**
 * PWA 更新检测 Hook
 * 检测应用是否有新版本可用，并显示更新提示
 */
export function usePWAUpdate(currentVersion: string) {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    // 从本地存储获取上次记录的版本
    const storedVersion = localStorage.getItem('app_version');
    const sessionVersion = sessionStorage.getItem('app_version_session');

    // 检查版本不一致的情况
    const versionChanged = (storedVersion && storedVersion !== currentVersion) ||
                        (sessionVersion && sessionVersion !== currentVersion);

    if (versionChanged) {
      // 版本不一致，有更新
      setHasUpdate(true);
      setShowUpdatePrompt(true);
    } else if (!storedVersion || !sessionVersion) {
      // 首次访问或没有 session 版本，保存版本号
      localStorage.setItem('app_version', currentVersion);
      sessionStorage.setItem('app_version_session', currentVersion);
    }
  }, [currentVersion]);

  // 用户点击更新
  const handleUpdate = () => {
    // 清除所有缓存
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }

    // 清除本地存储（保留一些必要数据）
    const keysToKeep = ['app_version'];
    Object.keys(localStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // 清除 session 存储
    sessionStorage.clear();

    // 保存新版本号
    localStorage.setItem('app_version', currentVersion);
    sessionStorage.setItem('app_version_session', currentVersion);

    // 刷新页面（强制重新加载）
    window.location.reload();
  };

  return {
    hasUpdate,
    showUpdatePrompt,
    handleUpdate,
    dismissUpdate: () => setShowUpdatePrompt(false),
  };
}
