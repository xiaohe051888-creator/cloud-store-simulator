'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Copy, ExternalLink, CheckCircle } from 'lucide-react';

interface WeChatOpenGuideProps {
  onClose?: () => void;
}

export default function WeChatOpenGuide({ onClose }: WeChatOpenGuideProps) {
  const [copied, setCopied] = useState(false);
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

  // 复制当前链接
  const handleCopy = async () => {
    const url = window.location.href;

    try {
      // 尝试使用现代 Clipboard API
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // 降级方案：使用传统方法
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('复制失败:', err);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  // 关闭引导
  const handleClose = () => {
    setShowGuide(false);
    onClose?.();
  };

  if (!showGuide) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* 顶部彩色条 */}
        <div className="h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all active:scale-95"
        >
          <X size={18} className="text-gray-600" />
        </button>

        {/* 内容区域 */}
        <div className="p-6 pt-8">
          {/* 图标和标题 */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg">
              <ExternalLink className="text-white w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              微信内无法直接访问
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              请复制链接后在浏览器中打开，以获得最佳体验
            </p>
          </div>

          {/* 当前链接 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border-2 border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">当前链接：</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
              />
              <Button
                size="sm"
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-2 ${
                  copied
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                } text-white text-sm font-semibold transition-all`}
              >
                {copied ? (
                  <>
                    <CheckCircle size={16} />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    复制
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 操作步骤 */}
          <div className="bg-green-50 rounded-xl p-4 mb-6 border-2 border-green-200">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">
                3
              </span>
              在浏览器中打开
            </h4>
            <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside pl-2">
              <li>点击上方的<span className="font-semibold">"复制"</span>按钮</li>
              <li>退出微信，打开手机浏览器（如Safari、Chrome等）</li>
              <li>在地址栏粘贴链接并访问</li>
            </ol>
          </div>

          {/* 关闭按钮 */}
          <Button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3"
          >
            我知道了
          </Button>
        </div>
      </div>
    </div>
  );
}
