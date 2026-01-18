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
        {/* 箭头指向右上角 */}
        <div className="absolute top-8 right-4 sm:right-8 animate-in slide-in-from-right-8 duration-500 animate-bounce">
          <svg
            width="200"
            height="180"
            viewBox="0 0 200 180"
            className="w-32 h-28 sm:w-40 sm:h-36"
          >
            {/* 垂直向上的箭头 - 从左下角指向右上角微信菜单位置 */}
            <g transform="translate(0, 0)">
              {/* 箭头主线 - 垂直向上 */}
              <line
                x1="40"
                y1="160"
                x2="40"
                y2="40"
                stroke="#07C160"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* 箭头头部 - 向上 */}
              <line
                x1="40"
                y1="40"
                x2="15"
                y2="70"
                stroke="#07C160"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <line
                x1="40"
                y1="40"
                x2="65"
                y2="70"
                stroke="#07C160"
                strokeWidth="10"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        {/* 提示内容 */}
        <div className="mt-36 sm:mt-44 px-6 sm:px-12 max-w-2xl animate-in slide-in-from-bottom-8 duration-500">
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

          {/* 关闭按钮 - 弹窗下方中间 */}
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full px-6 py-3 transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-lg"
            >
              <X className="w-5 h-5" />
              <span className="font-semibold">关闭</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
