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

    if (storedVersion && storedVersion !== currentVersion) {
      // 版本不一致，有更新
      setHasUpdate(true);
      setShowUpdatePrompt(true);
    } else if (!storedVersion) {
      // 首次访问，保存版本号
      localStorage.setItem('app_version', currentVersion);
    }
  }, [currentVersion]);

  // 用户点击更新
  const handleUpdate = () => {
    // 清除缓存
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }

    // 清除本地存储（可选）
    // localStorage.clear();

    // 保存新版本号
    localStorage.setItem('app_version', currentVersion);

    // 刷新页面
    window.location.reload();
  };

  // 稍后显示更新提示（避免首次访问就显示）
  useEffect(() => {
    if (hasUpdate) {
      const timer = setTimeout(() => {
        setShowUpdatePrompt(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasUpdate]);

  return {
    hasUpdate,
    showUpdatePrompt,
    handleUpdate,
    dismissUpdate: () => setShowUpdatePrompt(false),
  };
}
