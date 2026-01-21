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
    <div className="fixed inset-0 z-[400] bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
      {/* 箭头指向右上角 */}
      <div className="absolute top-6 right-4 sm:right-6 transform transition-all animate-in fade-in slide-in-from-top-2 duration-500">
        <svg
          className="w-32 h-20 text-white opacity-90"
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

      {/* 引导内容 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-w-lg mx-auto">
        {/* 顶部装饰条 */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all active:scale-95"
        >
          <X size={18} className="text-gray-600" />
        </button>

        {/* 内容区域 */}
        <div className="pt-8 pb-4">
          {/* 图标和标题 */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <ExternalLink className="text-white w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                在浏览器中打开
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                微信内无法访问，请在浏览器中打开以获得最佳体验
              </p>
            </div>
          </div>

          {/* 操作步骤 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200">
            <h4 className="font-bold text-green-900 mb-4 text-base sm:text-lg">
              操作步骤
            </h4>
            <div className="space-y-4">
              {/* 步骤1 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                    点击右上角的<span className="font-bold text-green-700">三个点</span>
                    <MoreVertical className="inline-block w-5 h-5 mx-1 text-green-600" />
                  </p>
                </div>
              </div>

              {/* 步骤2 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
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
          <div className="mt-6">
            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 sm:py-3.5"
            >
              我知道了
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
