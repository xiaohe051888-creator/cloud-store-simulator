'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Share2, MessageCircle, X } from 'lucide-react';

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

  // 检测是否在微信中
  const isWeChat = () => {
    return /micromessenger/i.test(navigator.userAgent);
  };

  // 生成分享链接
  const generateShareUrl = () => {
    if (!shareData) return '';
    const params = new URLSearchParams();
    params.set('level', shareData.shopLevel);
    params.set('stock', String(shareData.stockAmount));
    params.set('balance', String(shareData.cloudBalance));
    params.set('max', String(shareData.maxBalance));
    params.set('profit', String(shareData.totalProfit));

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}?${params.toString()}`;
  };

  // 分享链接
  const handleShareLink = async () => {
    const url = generateShareUrl();
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: '云店分享',
          text: `我的云店：${shareData?.shopLevel}级店铺，总利润${shareData?.totalProfit.toFixed(2)}元`,
          url,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  // 分享到微信（在微信环境中显示引导）
  const handleShareToWeChat = () => {
    const url = generateShareUrl();
    // 先复制链接到剪贴板
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((error) => {
      console.error('Failed to copy:', error);
    });

    // 显示引导信息（简单使用 alert，或者可以显示一个更友好的提示）
    alert('链接已复制！\n\n在微信中分享步骤：\n1. 点击右上角 •••\n2. 选择发送给朋友\n3. 粘贴链接发送');
  };

  // 生成分享图片
  const handleDownloadImage = async () => {
    if (!shareCardRef.current || !shareData) return;

    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: '#f8fafc',
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `云店分享-${shareData.shopLevel}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
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
            <Button
              onClick={handleDownloadImage}
              variant="outline"
              className="flex items-center justify-center gap-2 h-12"
            >
              <Download className="h-4 w-4" />
              下载图片
            </Button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button
                onClick={handleShareLink}
                className="flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Share2 className="h-4 w-4" />
                分享
              </Button>
            )}

            {!(typeof navigator !== 'undefined' && 'share' in navigator) && (
              <Button
                onClick={handleShareToWeChat}
                className="flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <MessageCircle className="h-4 w-4" />
                {copied ? '已复制，请粘贴到微信' : '分享到微信'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
