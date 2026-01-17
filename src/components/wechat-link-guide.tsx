'use client';

import { useEffect, useState } from 'react';

interface WeChatLinkGuideProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function WeChatLinkGuide({ isVisible, onClose }: WeChatLinkGuideProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-300"
    >
      <div className="relative h-full w-full">
        {/* 右上角箭头指示器 */}
        <div className="absolute top-8 right-6 sm:right-8 animate-in slide-in-from-right-8 duration-500">
          <div className="relative">
            {/* 大箭头 */}
            <svg
              className="w-24 h-24 sm:w-32 sm:h-32 text-red-500 drop-shadow-2xl animate-pulse"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
            >
              <path
                d="M50 85 L20 35 L40 35 L40 15 L60 15 L60 35 L80 35 Z"
                className="animate-bounce"
                style={{ animationDuration: '1.5s' }}
              />
            </svg>
            {/* 闪烁提示圆点 */}
            <div
              className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-full flex items-center justify-center animate-ping"
              style={{ animationDuration: '1s' }}
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full" />
            </div>
            {/* 光芒效果 */}
            <svg
              className="absolute -top-8 -right-8 w-20 h-20 sm:w-24 sm:h-24 text-yellow-400 opacity-60 animate-spin"
              viewBox="0 0 100 100"
              style={{ animationDuration: '3s' }}
            >
              <path
                d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        {/* 引导卡片 */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 sm:top-1/4 sm:left-1/4 sm:transform-none w-11/12 sm:w-80 animate-in zoom-in-95 duration-500">
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 overflow-hidden max-h-[80vh] overflow-y-auto">
            {/* 顶部彩色条纹 */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 微信图标 */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.022-.407-.026zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z" />
                  </svg>
                </div>
                {/* 三个点图标 */}
                <div className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-2 shadow-xl animate-bounce">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white rounded-full" />
                    <span className="w-2 h-2 bg-white rounded-full" />
                    <span className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* 标题 */}
            <h2 className="mb-4 text-xl sm:text-2xl font-bold text-center bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              请在浏览器中打开
            </h2>

            {/* 提示文字 */}
            <p className="mb-6 text-center text-sm sm:text-base text-gray-600 leading-relaxed">
              检测到您正在微信中访问，为获得完整功能，请切换到浏览器
            </p>

            {/* 操作步骤 */}
            <div className="space-y-4">
              {/* 步骤1 */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-100">
                <div className="flex-shrink-0 w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-base mb-1">点击右上角 •••</p>
                  <p className="text-sm text-gray-600">找到三个点按钮</p>
                </div>
                <svg className="w-6 h-6 text-red-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* 步骤2 */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-100">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-base mb-1">选择在浏览器打开</p>
                  <p className="text-sm text-gray-600">使用系统浏览器访问</p>
                </div>
                <svg className="w-6 h-6 text-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* 底部提示 */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-center text-xs text-gray-400">
                点击右上角关闭此提示
              </p>
            </div>
          </div>
        </div>

        {/* 底部装饰性箭头 */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <svg
            className="w-8 h-8 text-white/50 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ animationDuration: '2s' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
