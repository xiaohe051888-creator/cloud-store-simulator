'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone, Star, Share2, PlusCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [browserType, setBrowserType] = useState<'chrome' | 'safari' | 'other'>('other');

  useEffect(() => {
    // 检测是否是首次访问
    const hasVisited = localStorage.getItem('cloudshop-has-visited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem('cloudshop-has-visited', 'true');
    }

    // 检测设备和浏览器
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // 检测浏览器类型
    if (isIOSDevice) {
      setBrowserType('safari');
    } else if (isAndroidDevice && /chrome/.test(userAgent)) {
      setBrowserType('chrome');
    } else {
      setBrowserType('other');
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // 首次访问或用户未拒绝过时才显示提示
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
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

    // iOS/Safari环境下，如果没有自动提示，则手动显示引导
    if (isIOSDevice && !deferredPrompt) {
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        // 延迟3秒显示，避免打扰用户初次浏览
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    }

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
    // 记住用户的选择，不再显示
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  // 手动添加引导内容（iOS/Safari）
  const renderIOSGuide = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <Share2 className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-blue-900 mb-2">添加到主屏幕步骤：</p>
          <ol className="text-sm text-blue-800 space-y-1.5 list-decimal list-inside">
            <li>点击底部工具栏的<span className="font-semibold">分享按钮</span></li>
            <li>选择<span className="font-semibold">"添加到主屏幕"</span></li>
            <li>点击右上角的<span className="font-semibold">"添加"</span></li>
          </ol>
        </div>
      </div>
    </div>
  );

  // 手动添加引导内容（Android/Chrome）
  const renderAndroidGuide = () => (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <PlusCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-green-900 mb-2">添加到主屏幕步骤：</p>
          <ol className="text-sm text-green-800 space-y-1.5 list-decimal list-inside">
            <li>点击浏览器地址栏的<span className="font-semibold">菜单按钮</span> ⋮</li>
            <li>选择<span className="font-semibold">"添加到主屏幕"</span></li>
            <li>点击<span className="font-semibold">"添加"</span>完成安装</li>
          </ol>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-4 sm:bottom-6 sm:top-auto sm:left-auto sm:right-6 sm:inset-4 sm:w-96 z-[300] flex items-end sm:items-start justify-center sm:justify-end animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <div className="bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden w-full">
        {/* 顶部彩色条 */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* 关闭按钮 */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all active:scale-95"
        >
          <X size={18} className="text-gray-600" />
        </button>

        {/* 内容区域 */}
        <div className="p-5 sm:p-6 pt-6 sm:pt-8">
          {/* 图标区域 */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Download className="text-white w-10 h-10" />
              </div>
              {/* 首次访问标记 */}
              {isFirstVisit && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Star size={12} className="text-white fill-white" />
                </div>
              )}
            </div>
          </div>

          {/* 标题和描述 */}
          <div className="text-center mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              安装云店应用
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {deferredPrompt
                ? '点击下方按钮即可安装到您的设备'
                : '手动添加到主屏幕，随时随地使用云店模拟器'
              }
            </p>
          </div>

          {/* 手动添加引导 */}
          {!deferredPrompt && (isIOS || isAndroid) && (
            <>
              {isIOS && renderIOSGuide()}
              {isAndroid && renderAndroidGuide()}
            </>
          )}

          {/* 功能特点 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Smartphone size={18} className="text-blue-600" />
                </div>
                <p className="text-xs text-gray-700 font-medium">离线使用</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Download size={18} className="text-purple-600" />
                </div>
                <p className="text-xs text-gray-700 font-medium">快速启动</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Star size={18} className="text-pink-600" />
                </div>
                <p className="text-xs text-gray-700 font-medium">原生体验</p>
              </div>
            </div>
          </div>

          {/* 按钮区域 */}
          <div className="flex gap-3">
            {deferredPrompt ? (
              <>
                <Button
                  size="lg"
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base font-semibold shadow-lg shadow-blue-500/30"
                >
                  立即安装
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleDismiss}
                  className="flex-1 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 text-base font-semibold"
                >
                  稍后
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={handleDismiss}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base font-semibold shadow-lg shadow-blue-500/30"
              >
                我知道了
              </Button>
            )}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="bg-gray-50 px-5 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            安装后可离线使用，无需连接网络
          </p>
        </div>
      </div>
    </div>
  );
}
