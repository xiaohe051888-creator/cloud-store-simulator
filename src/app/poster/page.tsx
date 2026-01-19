'use client';

import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PosterPage() {
  const [posterDataUrl, setPosterDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const posterRef = useRef<HTMLDivElement>(null);
  const resizeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 获取当前URL作为二维码内容
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-app-url.com';

  // 生成二维码
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(currentUrl, {
          width: 160,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error('生成二维码失败:', error);
      }
    };

    generateQRCode();
  }, [currentUrl]);

  // 生成海报
  const generatePoster = async () => {
    if (!posterRef.current) return;

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2, // 提高清晰度
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      setPosterDataUrl(dataUrl);
    } catch (error) {
      console.error('生成海报失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载海报
  const handleDownload = () => {
    if (posterDataUrl) {
      const link = document.createElement('a');
      link.download = '云店模拟器海报.png';
      link.href = posterDataUrl;
      link.click();
    }
  };

  // 组件挂载后自动生成海报
  useEffect(() => {
    // 延迟一下确保DOM完全渲染
    const timer = setTimeout(() => {
      generatePoster();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 当窗口大小改变时重新生成海报
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      resizeTimerRef.current = setTimeout(() => {
        generatePoster();
      }, 500);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 操作按钮 */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={handleDownload}
            disabled={!posterDataUrl || isGenerating}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '生成中...' : '下载海报'}
          </Button>
        </div>

        {/* 海报预览区域 */}
        <Card className="overflow-hidden shadow-2xl">
          <div
            ref={posterRef}
            id="poster"
            className="relative w-full aspect-[3/4] sm:aspect-[4/3] bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 sm:p-10 flex flex-col justify-between overflow-hidden"
          >
            {/* 装饰性背景元素 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* 顶部标题 */}
            <div className="relative z-10">
              <div className="text-center mb-4 sm:mb-6">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg">
                  云店模拟器
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-white/90 font-medium">
                  专业的店铺经营管理模拟工具
                </p>
              </div>

              {/* 核心功能标签 */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {['7种店铺等级', '智能利润计算', '数据对比分析', 'PWA离线使用'].map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm rounded-full border border-white/30 font-medium"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* 主要功能介绍 */}
            <div className="relative z-10 space-y-3 sm:space-y-4 flex-1 flex items-center">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { icon: '💰', title: '模拟进货', desc: '精准计算利润' },
                    { icon: '📊', title: '智能推荐', desc: '最优等级选择' },
                    { icon: '🎁', title: '福利介绍', desc: '新人好礼相送' },
                    { icon: '📱', title: 'PWA支持', desc: '离线也能使用' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{item.icon}</div>
                      <div className="text-white font-bold text-sm sm:text-base mb-0.5 sm:mb-1">{item.title}</div>
                      <div className="text-white/80 text-xs">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 底部二维码区域 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl max-w-xs w-full">
                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  {/* 二维码 */}
                  <div className="p-2 bg-white rounded-xl">
                    {qrCodeDataUrl && (
                      <img
                        src={qrCodeDataUrl}
                        alt="云店模拟器二维码"
                        className="w-40 h-40"
                      />
                    )}
                  </div>

                  {/* 提示文字 */}
                  <div className="text-center space-y-1 sm:space-y-2">
                    <p className="text-gray-800 font-bold text-base sm:text-lg">
                      扫码立即体验
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      云店模拟器 v1.4.3
                    </p>
                  </div>
                </div>
              </div>

              {/* 额外信息 */}
              <div className="mt-4 sm:mt-6 text-white/90 text-center text-xs sm:text-sm">
                <p>支持 iOS / Android / 微信浏览器</p>
                <p className="mt-1 text-white/70">添加到主屏幕，离线也能使用</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 使用说明 */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p className="font-medium mb-2">使用说明：</p>
          <p>点击"下载海报"按钮，将海报保存到手机相册或电脑</p>
          <p className="mt-1">分享给好友，让他们扫描二维码体验云店模拟器</p>
        </div>
      </div>
    </div>
  );
}
