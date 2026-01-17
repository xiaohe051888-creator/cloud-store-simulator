'use client';

import { useState, useEffect } from 'react';

export default function WeChatGuide() {
  const [isWechat, setIsWechat] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // 检测是否在微信中打开
    const ua = navigator.userAgent.toLowerCase();
    const isWechatBrowser = ua.indexOf('micromessenger') !== -1;

    if (isWechatBrowser) {
      setIsWechat(true);
      // 延迟显示，避免闪烁
      setTimeout(() => setIsVisible(true), 300);
    }
  }, [isClient]);

  if (!isClient || !isWechat || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 sm:px-6" style={{ animation: 'wechat-fade-in 0.5s ease-out' }}>
      {/* 引导内容卡片 */}
      <div className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl bg-white shadow-xl" style={{ animation: 'wechat-slide-up 0.5s ease-out 0.1s both' }}>

        <div className="p-5 sm:p-8">
          {/* 图标区域 */}
          <div className="mb-4 sm:mb-6 flex justify-center">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-transform duration-300 hover:scale-110" style={{ animation: 'wechat-pulse 2s ease-in-out infinite' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          {/* 标题 */}
          <h2 className="mb-3 sm:mb-4 text-center text-xl sm:text-2xl font-bold text-gray-900">
            在浏览器中打开
          </h2>

          {/* 说明文字 */}
          <p className="mb-4 sm:mb-6 text-center text-sm sm:text-base text-gray-600 leading-relaxed">
            为了获得更好的使用体验，请在浏览器中打开本应用
          </p>

          {/* 操作指引 */}
          <div className="space-y-3 sm:space-y-4">
            {/* 步骤1 */}
            <div className="flex items-start gap-2.5 sm:gap-3 rounded-xl bg-gray-50/80 p-3 sm:p-4 transition-all duration-300 hover:bg-gray-50" style={{ animation: 'wechat-slide-in 0.5s ease-out 0.3s both' }}>
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs sm:text-sm">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base text-gray-800">点击右上角</p>
                <p className="text-xs sm:text-sm text-gray-500">找到并点击屏幕右上角的 ••• 三个点</p>
              </div>
            </div>

            {/* 步骤2 */}
            <div className="flex items-start gap-2.5 sm:gap-3 rounded-xl bg-gray-50/80 p-3 sm:p-4 transition-all duration-300 hover:bg-gray-50" style={{ animation: 'wechat-slide-in 0.5s ease-out 0.4s both' }}>
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-xs sm:text-sm">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base text-gray-800">选择浏览器</p>
                <p className="text-xs sm:text-sm text-gray-500">在菜单中选择"在浏览器打开"</p>
              </div>
            </div>
          </div>

          {/* 关闭提示 */}
          <p className="mt-4 sm:mt-6 text-center text-[10px] sm:text-xs text-gray-400">
            此提示仅在微信浏览器中显示
          </p>
        </div>
      </div>
    </div>
  );
}
