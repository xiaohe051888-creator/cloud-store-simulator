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

    // iOS环境下，如果没有自动提示，则手动显示引导
    if (isIOSDevice && !deferredPrompt) {
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
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
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  // 手动添加引导内容（iOS）
  const renderIOSGuide = () => (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <Share2 className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-gray-900 mb-3">添加到主屏幕步骤：</p>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>点击底部工具栏的<span className="font-semibold">分享按钮</span></li>
            <li>选择<span className="font-semibold">"添加到主屏幕"</span></li>
            <li>点击右上角的<span className="font-semibold">"添加"</span></li>
          </ol>
        </div>
      </div>
    </div>
  );

  // 手动添加引导内容（Android）
  const renderAndroidGuide = () => (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <PlusCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-gray-900 mb-3">添加到主屏幕步骤：</p>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>点击浏览器地址栏的<span className="font-semibold">菜单按钮</span> ⋮</li>
            <li>选择<span className="font-semibold">"添加到主屏幕"</span></li>
            <li>点击<span className="font-semibold">"添加"</span>完成安装</li>
          </ol>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:bottom-6 z-[100] animate-apple-fade-in">
      <div className="bg-white rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-gray-200/50 overflow-hidden max-w-sm">
        {/* 关闭按钮 */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>

        {/* 内容区域 */}
        <div className="p-6 sm:p-8">
          {/* 图标区域 */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                <Download className="text-white w-8 h-8" />
              </div>
              {/* 首次访问标记 */}
              {isFirstVisit && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                  <Star size={12} className="text-white fill-white" />
                </div>
              )}
            </div>
          </div>

          {/* 标题和描述 */}
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              安装云店应用
            </h3>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
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
          <div className="bg-gray-50 rounded-2xl p-5 mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Smartphone size={18} className="text-blue-600" />
                </div>
                <p className="text-xs font-medium text-gray-900">离线使用</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Download size={18} className="text-blue-600" />
                </div>
                <p className="text-xs font-medium text-gray-900">快速启动</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Star size={18} className="text-blue-600" />
                </div>
                <p className="text-xs font-medium text-gray-900">原生体验</p>
              </div>
            </div>
          </div>

          {/* 安装按钮 */}
          {deferredPrompt ? (
            <Button
              onClick={handleInstall}
              className="w-full"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              立即安装
            </Button>
          ) : (
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="w-full"
              size="lg"
            >
              知道了
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
