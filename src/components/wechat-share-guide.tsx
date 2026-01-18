'use client';

import { X, ArrowDown } from 'lucide-react';

interface WeChatShareGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeChatShareGuide({ isOpen, onClose }: WeChatShareGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-black/85 to-black/95 backdrop-blur-md animate-in fade-in-0 duration-300">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* 箭头指向右上角 - 自动适应不同手机屏幕，始终指向屏幕右上角 */}
        <div className="fixed top-1 right-0 sm:right-1 animate-in slide-in-from-right-8 duration-500 animate-bounce z-[210]">
          <svg
            width="150"
            height="150"
            viewBox="0 0 150 150"
            className="w-28 h-28 sm:w-36 sm:h-36"
            style={{ overflow: 'visible', marginRight: '-5px' }}
          >
            {/* 渐变定义 */}
            <defs>
              <linearGradient id="arrowGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#07C160" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#07C160" stopOpacity="1" />
              </linearGradient>
              <filter id="arrowGlow">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#07C160" floodOpacity="0.5" />
              </filter>
            </defs>
            {/* 箭头 - 从下方指向屏幕右上角微信菜单位置 */}
            <g filter="url(#arrowGlow)">
              {/* 箭头主线 - 垂直向上 */}
              <line
                x1="150"
                y1="130"
                x2="150"
                y2="5"
                stroke="url(#arrowGradient)"
                strokeWidth="18"
                strokeLinecap="round"
              />
              {/* 箭头头部 - 向上 */}
              <line
                x1="150"
                y1="5"
                x2="110"
                y2="45"
                stroke="url(#arrowGradient)"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <line
                x1="150"
                y1="5"
                x2="190"
                y2="45"
                stroke="url(#arrowGradient)"
                strokeWidth="18"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        {/* 提示内容 - 整体居中 */}
        <div className="px-4 sm:px-8 max-w-md w-full animate-in zoom-in-95 duration-500">
          {/* 步骤说明卡片 */}
          <div className="bg-white/98 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 sm:space-y-6 border-4 border-white/50">
            {/* 第一步 */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <span className="text-white text-xl sm:text-2xl font-bold">1</span>
                </div>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-base sm:text-lg font-bold text-gray-800">
                  点击右上角三个点
                </p>
              </div>
            </div>

            {/* 连接箭头 - 指向下方 */}
            <div className="flex justify-center py-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md">
                <ArrowDown className="w-5 h-5 text-green-600" />
              </div>
            </div>

            {/* 第二步 */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <span className="text-white text-xl sm:text-2xl font-bold">2</span>
                </div>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-base sm:text-lg font-bold text-gray-800">
                  选择转发给好友
                </p>
              </div>
            </div>
          </div>

          {/* 关闭按钮 */}
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-full px-6 py-3 transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-xl shadow-black/20 border-2 border-gray-100 text-base sm:text-lg font-semibold"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>关闭</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
