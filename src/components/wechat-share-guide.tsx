'use client';

import { X } from 'lucide-react';

interface WeChatShareGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeChatShareGuide({ isOpen, onClose }: WeChatShareGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-300">
      <div className="relative w-full h-full flex flex-col items-center">
        {/* 关闭按钮 - 右上角 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 transition-all duration-200 active:scale-90"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>

        {/* 箭头指向右上角 */}
        <div className="absolute top-20 right-8 sm:right-16 animate-in slide-in-from-right-8 duration-500">
          <svg
            width="120"
            height="100"
            viewBox="0 0 120 100"
            className="w-20 h-16 sm:w-24 sm:h-20"
          >
            {/* 箭头 */}
            <path
              d="M 100 10 L 90 20 M 100 10 L 90 0 M 100 10 L 20 80"
              stroke="#07C160"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce"
            />
          </svg>
        </div>

        {/* 右上角的三个点图标模拟 */}
        <div className="absolute top-16 right-4 sm:right-12 animate-in fade-in-0 duration-500">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            className="w-8 h-8 sm:w-10 sm:h-10"
          >
            <circle cx="8" cy="20" r="3" fill="#FFFFFF" />
            <circle cx="20" cy="20" r="3" fill="#FFFFFF" />
            <circle cx="32" cy="20" r="3" fill="#FFFFFF" />
          </svg>
        </div>

        {/* 提示内容 */}
        <div className="mt-40 sm:mt-52 px-6 sm:px-12 max-w-2xl animate-in slide-in-from-bottom-8 duration-500">
          {/* 主标题 */}
          <h2 className="text-white text-2xl sm:text-3xl font-bold text-center mb-8">
            分享给好友
          </h2>

          {/* 步骤说明 */}
          <div className="bg-white/95 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* 第一步 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 40 40"
                  className="w-8 h-8"
                >
                  <circle cx="8" cy="20" r="4" fill="#07C160" />
                  <circle cx="20" cy="20" r="4" fill="#07C160" />
                  <circle cx="32" cy="20" r="4" fill="#07C160" />
                </svg>
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                  点击右上角的三个点
                </p>
                <p className="text-sm text-gray-600">在页面右上角找到菜单按钮</p>
              </div>
            </div>

            {/* 箭头 */}
            <div className="flex justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="w-6 h-6 text-green-500 animate-bounce"
              >
                <path
                  d="M 12 4 L 12 20 M 12 20 L 6 14 M 12 20 L 18 14"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* 第二步 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 40 40"
                  className="w-8 h-8"
                >
                  {/* 发送给好友图标 */}
                  <rect x="4" y="4" width="32" height="32" rx="8" fill="#07C160" />
                  <path
                    d="M 12 14 L 28 14 M 12 20 L 24 20 M 12 26 L 20 26"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                  转发给好友
                </p>
                <p className="text-sm text-gray-600">选择要分享的好友</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
