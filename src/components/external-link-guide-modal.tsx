'use client';

import { Button } from '@/components/ui/button';
import { ExternalLink, X, Copy } from 'lucide-react';

interface ExternalLinkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl?: string;
}

export default function ExternalLinkGuideModal({ isOpen, onClose, targetUrl }: ExternalLinkGuideModalProps) {
  if (!isOpen) return null;

  const url = targetUrl || '';

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      alert('链接已复制！');
    } catch (error) {
      console.error('复制失败:', error);
    }
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
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-3">
            需要在浏览器中打开
          </h3>

          {/* 链接框 */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 mb-1">目标链接</p>
            <p className="text-sm text-gray-900 font-medium break-all">
              {url}
            </p>
          </div>

          {/* 操作指引 */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 mb-6 border border-orange-100">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              操作指引
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p>1. 长按上方链接，点击复制</p>
              <p>2. 退出微信，打开浏览器</p>
              <p>3. 在浏览器地址栏粘贴并访问</p>
            </div>
          </div>

          {/* 按钮组 */}
          <div className="space-y-3">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-3 sm:py-3.5 text-base"
            >
              我知道了
            </Button>
            <Button
              onClick={handleCopy}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 text-base"
            >
              <Copy className="w-4 h-4" />
              复制链接
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
