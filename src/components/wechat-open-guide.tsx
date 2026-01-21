'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, MoreVertical, ExternalLink } from 'lucide-react';

interface WeChatOpenGuideProps {
  onClose?: () => void;
}

export default function WeChatOpenGuide({ onClose }: WeChatOpenGuideProps) {
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // 检测是否在微信浏览器中
    const isWeChat = /micromessenger/i.test(navigator.userAgent);

    // 如果在微信中，显示引导弹窗
    if (isWeChat) {
      // 延迟500ms显示，避免页面加载时立即弹出
      setTimeout(() => {
        setShowGuide(true);
      }, 500);
    }
  }, []);

  // 关闭引导
  const handleClose = () => {
    setShowGuide(false);
    onClose?.();
  };

  if (!showGuide) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-black/75 backdrop-blur-sm animate-in fade-in duration-300 flex items-center justify-center p-4">
      {/* 主卡片容器 */}
      <div className="relative w-full max-w-md mx-auto animate-in zoom-in-95 duration-300">
        {/* 箭头指向右上角 */}
        <div className="absolute -top-4 -right-2 sm:-right-4 transform animate-in fade-in slide-in-from-top-2 duration-500 z-10">
          <svg
            className="w-24 h-16 sm:w-32 sm:h-20 text-white opacity-90"
            viewBox="0 0 128 64"
            fill="none"
          >
            {/* 箭头主体 */}
            <path
              d="M128 8 Q128 0 120 0 H20 Q12 0 12 8 L12 20 L4 12 Q2 10 2 12 Q2 14 4 16 L12 24 V36 Q2 34 2 36 Q2 38 4 40 L12 48 V56 Q12 64 20 64 H120 Q128 64 128 56"
              fill="currentColor"
              stroke="none"
            />
            {/* 箭头尖端 */}
            <path
              d="M0 24 L12 20 L12 28 Z"
              fill="currentColor"
              stroke="none"
            />
          </svg>
        </div>

        {/* 引导内容卡片 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* 顶部彩色条 */}
          <div className="h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />

          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all active:scale-95 z-10"
          >
            <X size={18} className="text-gray-600" />
          </button>

          {/* 内容区域 */}
          <div className="p-6 sm:p-8 pt-8 sm:pt-10">
            {/* 图标和标题 */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <ExternalLink className="text-white w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                在浏览器中打开
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                微信内无法访问，请在浏览器中打开以获得最佳体验
              </p>
            </div>

            {/* 操作步骤 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-5 border-2 border-green-200">
              <h4 className="font-bold text-green-900 mb-3 sm:mb-4 text-base sm:text-lg text-center">
                操作步骤
              </h4>
              <div className="space-y-3 sm:space-y-4">
                {/* 步骤1 */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm sm:text-base">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                      点击右上角的<span className="font-bold text-green-700">三个点</span>
                      <MoreVertical className="inline-block w-5 h-5 sm:w-6 sm:h-6 mx-1 sm:mx-1.5 text-green-600" />
                    </p>
                  </div>
                </div>

                {/* 步骤2 */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm sm:text-base">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                      在菜单中选择<span className="font-bold text-green-700">"在浏览器中打开"</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 关闭按钮 */}
            <div className="mt-5 sm:mt-6">
              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 sm:py-3.5 text-base sm:text-base"
              >
                我知道了
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
