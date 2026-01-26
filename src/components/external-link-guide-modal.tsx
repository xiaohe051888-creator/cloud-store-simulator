'use client';

import { Button } from '@/components/ui/button';
import { X, MoreVertical, ExternalLink } from 'lucide-react';

interface ExternalLinkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl?: string;
}

export default function ExternalLinkGuideModal({ isOpen, onClose, targetUrl }: ExternalLinkGuideModalProps) {
  if (!isOpen) return null;

  // 点击"我知道了"后打开链接
  const handleConfirm = () => {
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* 顶部彩色条 */}
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all active:scale-95"
        >
          <X size={18} className="text-gray-600" />
        </button>

        {/* 内容区域 */}
        <div className="p-6 sm:p-8 pt-12">
          {/* 图标 */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
              <ExternalLink className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* 标题 */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4">
            检测到你在微信环境中
          </h3>
          <p className="text-base text-gray-600 text-center mb-6">
            为了体验完整功能请在浏览器中使用
          </p>

          {/* 操作指引 */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 mb-6 border border-orange-100">
            <div className="space-y-4">
              {/* 步骤1 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <MoreVertical className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">点击右上角的三个点</span>
                </div>
              </div>

              {/* 步骤2 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">选择在浏览器中打开</span>
                </div>
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <Button
            onClick={handleConfirm}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-3 sm:py-3.5 text-base"
          >
            我知道了
          </Button>
        </div>
      </div>
    </div>
  );
}
