'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 检查是否已安装PWA
    const checkPWAInstalled = () => {
      const isInStandaloneMode =
        (window.matchMedia('(display-mode: standalone)').matches) ||
        (window.navigator as any).standalone === true;

      if (isInStandaloneMode) {
        setShowPrompt(false);
      }
    };

    checkPWAInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('用户接受了PWA安装');
    } else {
      console.log('用户拒绝了PWA安装');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 可以在这里设置本地存储，记住用户的选择
    // localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-[100] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200 p-4 sm:p-5 max-w-sm">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Download className="text-white w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          <div className="flex-1 pt-0.5">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
              安装云店应用
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">
              添加到主屏幕，随时随地使用云店模拟器
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm"
              >
                立即安装
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs sm:text-sm"
              >
                稍后
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
