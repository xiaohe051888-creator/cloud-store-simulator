'use client';

import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';

interface ExternalLinkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl?: string;
}

export default function ExternalLinkGuideModal({ isOpen, onClose, targetUrl }: ExternalLinkGuideModalProps) {
  if (!isOpen) return null;

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
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-3">
            需要在浏览器中打开
          </h3>

          {/* 操作指引 */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 mb-6 border border-orange-100">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              操作指引
            </h4>
            <div className="flex items-start gap-3">
              {/* 右上角三个点示意 */}
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16 border-2 border-gray-300 rounded-lg bg-gray-50">
                  {/* 右上角三个点 */}
                  <div className="absolute top-1.5 right-1.5 flex flex-col gap-1">
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  </div>
                  {/* 箭头指向 */}
                  <div className="absolute top-4 right-3">
                    <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* 文字说明 */}
              <div className="flex-1 space-y-1.5 text-sm text-gray-700">
                <p className="font-medium">点击右上角的三个点</p>
                <p>选择"在浏览器打开"即可访问</p>
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-3 sm:py-3.5 text-base"
          >
            我知道了
          </Button>
        </div>
      </div>
    </div>
  );
}
