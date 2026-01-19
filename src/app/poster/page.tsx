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

  // 返回首页
  const handleGoBack = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* 顶部导航栏 */}
      <header className="glass sticky top-0 z-50 shadow-lg shadow-gray-200/50">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 flex justify-between items-center gap-2 sm:gap-4">
          {/* 左侧：应用名称和版本号 */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                云店模拟器
              </h1>
              <span className="text-[10px] sm:text-xs lg:text-sm text-gray-400 font-medium bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text">
                v1.4.4
              </span>
            </div>
          </div>

          {/* 右侧：返回按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoBack}
            className="touch-feedback text-xs sm:text-sm lg:text-base font-bold h-10 sm:h-11 lg:h-12 px-3 sm:px-4 lg:px-5 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 hover:border-gray-400 hover:shadow-lg hover:shadow-gray-500/20 hover:bg-gradient-to-r hover:from-gray-100 hover:to-slate-100 transition-all duration-300"
          >
            返回首页
          </Button>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6 min-h-[calc(100vh-56px)]">
        <div className="max-w-4xl mx-auto">
          {/* 操作按钮 */}
          <div className="flex justify-center gap-4 mb-4 sm:mb-8">
            <Button
              onClick={handleDownload}
              disabled={!posterDataUrl || isGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '生成中...' : '下载海报'}
            </Button>
          </div>

          {/* 海报预览区域 */}
          <Card className="overflow-hidden shadow-2xl">
            <div
              ref={posterRef}
              id="poster"
              className="relative w-full max-w-3xl mx-auto aspect-[3/4] sm:aspect-[4/3] bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4 sm:p-8 lg:p-12 flex flex-col justify-between overflow-hidden"
            >
              {/* 装饰性背景元素 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-5 left-5 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-5 right-5 w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-60 sm:h-60 bg-white rounded-full blur-3xl"></div>
              </div>

              {/* 顶部标题 */}
              <div className="relative z-10 flex-shrink-0">
                <div className="text-center mb-3 sm:mb-5 lg:mb-6">
                  <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white mb-1.5 sm:mb-3 lg:mb-4 drop-shadow-lg leading-tight">
                    云店模拟器
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-white/90 font-medium">
                    专业的店铺经营管理模拟工具
                  </p>
                </div>

                {/* 核心功能标签 */}
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 lg:gap-3 px-2">
                  {['7种店铺等级', '智能利润计算', '数据对比分析', 'PWA离线使用'].map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs lg:text-sm rounded-full border border-white/30 font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* 主要功能介绍 */}
              <div className="relative z-10 flex-1 flex items-center py-3 sm:py-5 lg:py-8">
                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-5 lg:p-6 border border-white/20 w-full">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                    {[
                      { icon: '💰', title: '模拟进货', desc: '精准计算利润' },
                      { icon: '📊', title: '智能推荐', desc: '最优等级选择' },
                      { icon: '🎁', title: '福利介绍', desc: '新人好礼相送' },
                      { icon: '📱', title: 'PWA支持', desc: '离线也能使用' },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="bg-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 backdrop-blur-sm"
                      >
                        <div className="text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-1.5 lg:mb-2">{item.icon}</div>
                        <div className="text-white font-bold text-xs sm:text-sm lg:text-base mb-0.5 sm:mb-1">{item.title}</div>
                        <div className="text-white/80 text-[10px] sm:text-xs lg:text-sm">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 底部二维码区域 */}
              <div className="relative z-10 flex-shrink-0 flex flex-col items-center">
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 lg:p-6 shadow-2xl max-w-[280px] sm:max-w-xs w-full">
                  <div className="flex flex-col items-center space-y-2.5 sm:space-y-3 lg:space-y-4">
                    {/* 二维码 */}
                    <div className="p-1.5 sm:p-2 bg-white rounded-lg sm:rounded-xl">
                      {qrCodeDataUrl && (
                        <img
                          src={qrCodeDataUrl}
                          alt="云店模拟器二维码"
                          className="w-32 h-32 sm:w-40 sm:h-40"
                        />
                      )}
                    </div>

                    {/* 提示文字 */}
                    <div className="text-center space-y-0.5 sm:space-y-1 lg:space-y-2">
                      <p className="text-gray-800 font-bold text-sm sm:text-base lg:text-lg">
                        扫码立即体验
                      </p>
                      <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">
                        云店模拟器 v1.4.4
                      </p>
                    </div>
                  </div>
                </div>

                {/* 额外信息 */}
                <div className="mt-2.5 sm:mt-4 lg:mt-6 text-white/90 text-center text-[10px] sm:text-xs lg:text-sm px-2">
                  <p>支持 iOS / Android / 微信浏览器</p>
                  <p className="mt-0.5 sm:mt-1 text-white/70">添加到主屏幕，离线也能使用</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 使用说明 */}
          <div className="mt-6 sm:mt-8 text-center text-gray-600 text-xs sm:text-sm">
            <p className="font-medium mb-2">使用说明：</p>
            <p>点击"下载海报"按钮，将海报保存到手机相册或电脑</p>
            <p className="mt-1">分享给好友，让他们扫描二维码体验云店模拟器</p>
          </div>
        </div>
      </div>
    </div>
  );
}
