'use client';

import { useEffect, useState } from 'react';

export default function WeChatGuidePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-300">
        {/* 顶部彩色条 */}
        <div className="h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />

        {/* 内容区域 */}
        <div className="p-6 sm:p-8 pt-8 sm:pt-10">
          {/* 图标 */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 shadow-lg">
              <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>

          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              请在浏览器中打开
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              为了更好的体验，请在浏览器中访问此页面
            </p>
          </div>

          {/* 操作步骤 */}
          <div className="space-y-4 mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  1
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">
                    点击右上角 ···
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    点击右上角的三个点
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  2
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">
                    选择在浏览器打开
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    在菜单中选择"在浏览器打开"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 复制链接按钮 */}
          <button
            onClick={() => {
              const url = window.location.origin + window.location.pathname;
              navigator.clipboard.writeText(url).then(() => {
                alert('链接已复制！');
              }).catch(() => {
                // 降级方案
                const textarea = document.createElement('textarea');
                textarea.value = url;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('链接已复制！');
              });
            }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 sm:py-3.5 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 active:scale-95 transition-all duration-200 shadow-lg"
          >
            复制链接到剪贴板
          </button>

          {/* 提示 */}
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-6">
            复制后在浏览器中粘贴即可访问
          </p>
        </div>
      </div>
    </div>
  );
}
