'use client';

import { X, Share2, MoreHorizontal, Send } from 'lucide-react';

interface WeChatShareGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeChatShareGuide({ isOpen, onClose }: WeChatShareGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-300">
      <div className="relative w-full h-full flex flex-col items-center justify-center px-4">
        {/* 弹窗卡片 */}
        <div className="w-full max-w-sm animate-in zoom-in-95 duration-300">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-100/50">
            {/* 头部 - 渐变背景 */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-5">
              <div className="flex items-center justify-center gap-2.5">
                <Share2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                <h2 className="text-white text-xl sm:text-2xl font-bold">
                  分享给好友
                </h2>
              </div>
            </div>

            {/* 步骤说明 */}
            <div className="p-5 sm:p-6 space-y-5">
              {/* 第一步 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-base sm:text-lg font-bold">1</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm sm:text-base font-bold text-gray-800 mb-1">
                    点击右上角菜单
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    找到屏幕右上角的三个点图标
                  </p>
                </div>
              </div>

              {/* 连接线 */}
              <div className="flex items-start justify-center gap-3">
                <div className="w-8 flex-shrink-0"></div>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 my-3"></div>
                <div className="w-8 flex-shrink-0"></div>
              </div>

              {/* 第二步 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-base sm:text-lg font-bold">2</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm sm:text-base font-bold text-gray-800 mb-1">
                    选择转发给好友
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    在菜单中选择要分享的好友
                  </p>
                </div>
              </div>
            </div>

            {/* 关闭按钮 */}
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 hover:text-gray-900 rounded-xl py-3 sm:py-3.5 transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 shadow-md text-sm sm:text-base font-semibold border border-gray-200"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>关闭</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
