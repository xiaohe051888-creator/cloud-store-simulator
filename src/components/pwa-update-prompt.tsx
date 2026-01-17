'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X, Download, AlertCircle } from 'lucide-react';

interface ServiceWorkerRegistrationWithWaiting {
  waiting?: ServiceWorker;
  installing?: ServiceWorker | null;
  onupdatefound?: ((this: ServiceWorkerRegistration, ev: Event) => any) | null;
  addEventListener<K extends keyof ServiceWorkerRegistrationEventMap>(
    type: K,
    listener: (this: ServiceWorkerRegistration, ev: ServiceWorkerRegistrationEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
}

export default function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // 检查 Service Worker 是否支持
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // 注册 Service Worker 并监听更新
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          updateViaCache: 'none', // 强制检查更新
        });

        // 检查是否有等待中的 Service Worker
        if (registration.waiting) {
          setShowUpdatePrompt(true);
          setWaitingWorker(registration.waiting);
        }

        // 监听新 Service Worker 的安装
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新的 Service Worker 已安装，但等待激活
                setShowUpdatePrompt(true);
                setWaitingWorker(newWorker);
              }
            });
          }
        });

        // 监听控制权变化
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // 页面已经被新的 Service Worker 控制，刷新页面
          window.location.reload();
        });

      } catch (error) {
        console.error('Service Worker 注册失败:', error);
      }
    };

    // 延迟注册，避免阻塞页面加载
    setTimeout(registerSW, 1000);

    // 每30分钟检查一次更新
    const checkInterval = setInterval(() => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
      }
    }, 30 * 60 * 1000); // 30分钟

    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  // 处理更新
  const handleUpdate = () => {
    if (waitingWorker) {
      // 发送消息给等待中的 Service Worker，跳过等待直接激活
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  // 稍后更新（暂时隐藏提示）
  const handleLater = () => {
    setShowUpdatePrompt(false);
    // 1分钟后再次显示
    setTimeout(() => {
      setShowUpdatePrompt(true);
    }, 60 * 1000);
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-6 sm:w-96 z-[300] animate-in slide-in-from-bottom-4 duration-300">
      <Card className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden">

        <CardContent className="p-5">
          {/* 图标和标题 */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                <Download className="text-white w-6 h-6" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                <AlertCircle size={12} className="text-white fill-white" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                发现新版本
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                模拟器有新的内容更新，建议立即更新以获得最新功能
              </p>
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={handleLater}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white/80 hover:bg-gray-100 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>

          {/* 更新说明 */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
            <p className="text-xs text-gray-700">
              <span className="font-semibold text-blue-600">更新内容：</span>
              性能优化、功能改进、问题修复等
            </p>
          </div>

          {/* 按钮区域 */}
          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={handleUpdate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} className="animate-spin" />
              立即更新
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleLater}
              className="flex-1 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold"
            >
              稍后
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
