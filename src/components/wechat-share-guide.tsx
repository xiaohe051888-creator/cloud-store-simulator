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
        <div className="w-full max-w-md animate-in zoom-in-95 duration-300">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100/50">
            {/* 头部 - 渐变背景 */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex items-center justify-center gap-3">
                <Share2 className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-white" />
                <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">
                  分享给好友
                </h2>
              </div>
            </div>

            {/* 步骤说明 */}
            <div className="p-6 sm:p-7 lg:p-8 space-y-6">
              {/* 第一步 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg sm:text-xl lg:text-2xl font-bold">1</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-1.5">
                    点击右上角菜单
                  </p>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-500">
                    找到屏幕右上角的三个点图标
                  </p>
                </div>
              </div>

              {/* 连接线 */}
              <div className="flex items-start justify-center gap-4">
                <div className="w-10 flex-shrink-0"></div>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 my-4"></div>
                <div className="w-10 flex-shrink-0"></div>
              </div>

              {/* 第二步 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg sm:text-xl lg:text-2xl font-bold">2</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-1.5">
                    选择转发给好友
                  </p>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-500">
                    在菜单中选择要分享的好友
                  </p>
                </div>
              </div>
            </div>

            {/* 关闭按钮 */}
            <div className="px-6 pb-6 sm:px-7 sm:pb-7 lg:px-8 lg:pb-8">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 hover:text-gray-900 rounded-2xl py-4 sm:py-4.5 transition-all duration-200 active:scale-98 flex items-center justify-center gap-2.5 shadow-md text-base sm:text-lg lg:text-xl font-semibold border border-gray-200"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                <span>关闭</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
