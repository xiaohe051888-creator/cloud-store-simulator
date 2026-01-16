'use client';

import { useEffect } from 'react';

export default function PWAInstaller() {
  useEffect(() => {
    // 只在浏览器环境中注册 Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
          });
          console.log('Service Worker registered with scope:', registration.scope);
          
          // 监听更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 新的 Service Worker 已安装，提示用户刷新
                  if (window.confirm('发现新版本，是否立即更新？')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };

      registerServiceWorker();
    }
  }, []);

  return null;
}
