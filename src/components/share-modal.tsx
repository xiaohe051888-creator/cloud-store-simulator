'use client';

import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Share2, X, Copy } from 'lucide-react';

interface ShareData {
  shopLevel: string;
  stockAmount: number;
  cloudBalance: number;
  maxBalance: number;
  totalProfit: number;
  dailyCommission: number;
  completionDays: number;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData | null;
}

export default function ShareModal({ isOpen, onClose, shareData }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 检测是否移动端
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|iphone|ipad|ipod|windows phone|iemobile|blackberry/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  // 生成分享链接
  const generateShareUrl = () => {
    if (!shareData) return '';
    const params = new URLSearchParams();
    params.set('level', shareData.shopLevel);
    params.set('stock', String(shareData.stockAmount));
    params.set('balance', String(shareData.cloudBalance));
    params.set('max', String(shareData.maxBalance));
    params.set('profit', String(shareData.totalProfit));

    // 使用主域名而不是当前访问的域名，提高微信访问成功率
    const baseUrl = 'https://cloud-store-simulator.pages.dev';
    return `${baseUrl}?${params.toString()}`;
  };

  // 复制链接
  const handleCopyLink = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // 生成分享图片
  const handleDownloadImage = async () => {
    if (!shareCardRef.current || !shareData) return;

    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: '#f8fafc',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // 转换为 blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Failed to generate blob');
          alert('生成图片失败，请重试');
          return;
        }

        // 生成文件名
        const fileName = `模拟器分享-${shareData.shopLevel}-${Date.now()}.png`;

        // 检测是否为移动端或PWA环境
        const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                     (window.navigator as any).standalone === true;

        if (isMobile || isPWA) {
          // 移动端或PWA环境：使用兼容方案
          try {
            // 尝试使用 Web Share API (支持的浏览器)
            if (navigator.share && navigator.canShare) {
              const file = new File([blob], fileName, { type: 'image/png' });
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  files: [file],
                  title: '模拟器分享',
                  text: `分享我的店铺经营数据，等级：${shareData.shopLevel}`,
                });
                return;
              }
            }

            // 不支持 Web Share API，使用 Blob URL 方案
            const blobUrl = URL.createObjectURL(blob);

            // 尝试创建下载链接
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);

            try {
              link.click();
            } catch (e) {
              console.log('Download click failed, showing image');
              // 如果点击失败，显示图片让用户长按保存
              const imgWindow = window.open('', '_blank');
              if (imgWindow) {
                imgWindow.document.write(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <title>保存图片</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                      body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #f0f0f0; }
                      img { max-width: 100%; height: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin: 20px; }
                      p { text-align: center; color: #666; font-size: 14px; margin: 10px; }
                      button { padding: 10px 20px; margin: 10px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
                    </style>
                  </head>
                  <body>
                    <p>长按图片保存到相册</p>
                    <img src="${blobUrl}" alt="分享图片" />
                    <button onclick="window.close()">关闭</button>
                  </body>
                  </html>
                `);
              } else {
                alert('请长按图片保存，或截图分享');
              }
            } finally {
              document.body.removeChild(link);
              // 延迟释放 URL
              setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            }

          } catch (error) {
            console.error('Mobile download failed:', error);
            alert('请长按图片保存，或截图分享');
          }
        } else {
          // 桌面端：使用 File System Access API 或传统下载方式
          try {
            // 尝试使用 File System Access API (现代浏览器)
            if ('showSaveFilePicker' in window) {
              const fileHandle = await (window as any).showSaveFilePicker({
                suggestedName: fileName,
                types: [{
                  description: 'PNG Image',
                  accept: { 'image/png': ['.png'] },
                }],
              });
              const writable = await fileHandle.createWritable();
              await writable.write(blob);
              await writable.close();
              return;
            }

            // 回退到传统下载方式
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

          } catch (error) {
            console.error('Desktop download failed:', error);
            alert('下载失败，请重试');
          }
        }
      }, 'image/png');

    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('生成图片失败，请重试');
    }
  };

  if (!shareData) return null;

  const shareUrl = generateShareUrl();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex flex-row items-center justify-between pb-4 pt-6 px-6 border-b border-gray-100">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            分享我的云店
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100 active:scale-90 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <CardContent className="space-y-6 p-6">
          {/* 分享卡片预览 */}
          <div
            ref={shareCardRef}
            className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-xl border-2 border-blue-100"
          >
            {/* 顶部标题 */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                云店经营数据
              </h3>
              <p className="text-sm text-gray-600">专业的店铺经营管理模拟工具</p>
            </div>

            {/* 店铺等级 */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">店铺等级</span>
                <span className="text-xl font-bold text-blue-600">
                  {shareData.shopLevel}
                </span>
              </div>
            </div>

            {/* 核心数据 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <p className="text-xs text-gray-500 mb-1">进货额度</p>
                <p className="text-lg font-bold text-gray-800">
                  {shareData.stockAmount}⚡
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <p className="text-xs text-gray-500 mb-1">云店余额</p>
                <p className="text-lg font-bold text-gray-800">
                  {shareData.cloudBalance}⚡
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <p className="text-xs text-gray-500 mb-1">日收益</p>
                <p className="text-lg font-bold text-green-600">
                  {shareData.dailyCommission.toFixed(2)}元
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <p className="text-xs text-gray-500 mb-1">完成天数</p>
                <p className="text-lg font-bold text-gray-800">
                  {shareData.completionDays}天
                </p>
              </div>
            </div>

            {/* 总利润 */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white font-medium">总利润</span>
                <span className="text-2xl font-bold text-white">
                  {shareData.totalProfit.toFixed(2)}元
                </span>
              </div>
            </div>

            {/* 底部信息 */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                使用云店模拟器，优化你的店铺经营策略
              </p>
            </div>
          </div>

          {/* 二维码 */}
          <div className="flex justify-center">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <QRCodeSVG
                value={shareUrl}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 电脑端：下载图片 + 复制链接 */}
            {!isMobile && (
              <>
                <Button
                  onClick={handleDownloadImage}
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-12"
                >
                  <Download className="h-4 w-4" />
                  下载图片
                </Button>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-12"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? '已复制' : '复制链接'}
                </Button>
              </>
            )}

            {/* 移动端：下载图片 + 复制链接 */}
            {isMobile && (
              <>
                <Button
                  onClick={handleDownloadImage}
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-12"
                >
                  <Download className="h-4 w-4" />
                  下载图片
                </Button>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-12"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? '已复制' : '复制链接'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
