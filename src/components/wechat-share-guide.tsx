'use client';

import { X, Share2, ArrowRight } from 'lucide-react';

interface WeChatShareGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeChatShareGuide({ isOpen, onClose }: WeChatShareGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-black/80 to-black/90 backdrop-blur-md animate-in fade-in-0 duration-300">
      <div className="relative w-full h-full flex flex-col items-center">
        {/* 箭头指向右上角 - 优化样式，与弹窗协调 */}
        <div className="absolute top-3 right-0 animate-in slide-in-from-right-8 duration-500 animate-bounce">
          <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            className="w-36 h-36 sm:w-44 sm:h-44"
            style={{ overflow: 'visible', marginLeft: '-35px' }}
          >
            {/* 渐变定义 */}
            <defs>
              <linearGradient id="arrowGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#07C160" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#07C160" stopOpacity="1" />
              </linearGradient>
              <filter id="arrowGlow">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#07C160" floodOpacity="0.4" />
              </filter>
            </defs>
            {/* 箭头 - 垂直向上，尖端在最右边 */}
            <g filter="url(#arrowGlow)">
              {/* 箭头主线 - 垂直向上 */}
              <line
                x1="180"
                y1="160"
                x2="180"
                y2="15"
                stroke="url(#arrowGradient)"
                strokeWidth="18"
                strokeLinecap="round"
              />
              {/* 箭头头部 - 向上 */}
              <line
                x1="180"
                y1="15"
                x2="140"
                y2="55"
                stroke="url(#arrowGradient)"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <line
                x1="180"
                y1="15"
                x2="220"
                y2="55"
                stroke="url(#arrowGradient)"
                strokeWidth="18"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        {/* 提示内容 */}
        <div className="mt-40 sm:mt-48 px-4 sm:px-8 max-w-3xl w-full animate-in slide-in-from-bottom-8 duration-500">
          {/* 主标题卡片 */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl p-6 sm:p-8 shadow-2xl mb-6">
            <div className="flex items-center justify-center gap-3">
              <Share2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">
                分享给好友
              </h2>
            </div>
          </div>

          {/* 步骤说明卡片 */}
          <div className="bg-white/98 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 sm:space-y-8 border-4 border-white/50">
            {/* 第一步 */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <span className="text-white text-2xl sm:text-3xl font-bold">1</span>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <p className="text-base sm:text-xl font-bold text-gray-800 mb-2">
                  点击右上角的三个点
                </p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  在页面右上角找到菜单按钮（三个点图标）
                </p>
              </div>
            </div>

            {/* 连接箭头 */}
            <div className="flex justify-center py-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md">
                <ArrowRight className="w-6 h-6 text-green-600" />
              </div>
            </div>

            {/* 第二步 */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <span className="text-white text-2xl sm:text-3xl font-bold">2</span>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <p className="text-base sm:text-xl font-bold text-gray-800 mb-2">
                  选择"转发给好友"
                </p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  在弹出的菜单中选择要分享的好友并发送
                </p>
              </div>
            </div>
          </div>

          {/* 关闭按钮 */}
          <div className="flex justify-center mt-8">
            <button
              onClick={onClose}
              className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-full px-8 py-4 transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-xl shadow-black/20 border-2 border-gray-100 text-base sm:text-lg font-semibold"
            >
              <X className="w-5 h-5" />
              <span>关闭</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
