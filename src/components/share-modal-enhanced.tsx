'use client';

import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Share2, X, Copy, MessageCircle, Share, Link2, Image as ImageIcon } from 'lucide-react';

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

    // 使用 MiniMax 平台域名
    const baseUrl = 'https://mv66yijv0rbs.space.minimaxi.com';
    return `${baseUrl}?${params.toString()}`;
  };

  // 复制链接
  const handleCopyLink = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      showCopySuccessModal();
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // 显示复制成功弹窗
  const showCopySuccessModal = () => {
    const modal = document.createElement('div');
    modal.id = 'copy-success-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 20px;
        padding: 32px 28px;
        max-width: 320px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
      ">
        <div style="
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        ">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 style="
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 20px;
        ">链接已复制</h3>
        <div style="
          background: #f3f4f6;
          border-radius: 12px;
          padding: 16px;
          text-align: left;
          margin-bottom: 8px;
        ">
          <p style="
            font-size: 13px;
            color: #4b5563;
            margin-bottom: 8px;
            line-height: 1.6;
          ">✅ 与好友聊天对话框中粘贴并发送</p>
          <p style="
            font-size: 13px;
            color: #4b5563;
            margin-bottom: 8px;
            line-height: 1.6;
          ">✅ 告知好友要长按链接再点击复制</p>
          <p style="
            font-size: 13px;
            color: #4b5563;
            line-height: 1.6;
          ">✅ 复制完成后在浏览器中粘贴打开</p>
        </div>
      </div>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(modal);
    
    // 点击弹窗外部关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // 3秒后自动关闭
    setTimeout(closeModal, 3000);
    
    function closeModal() {
      modal.style.opacity = '0';
      modal.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
        setCopied(false);
      }, 300);
    }
  };

  // 检测是否在微信环境
  const isWeChatBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('micromessenger') || userAgent.includes('wechat');
  };

  // 分享到微信
  const handleShareToWeChat = async () => {
    const url = generateShareUrl();
    
    // 微信环境：复制链接并提示
    if (isWeChatBrowser()) {
      await navigator.clipboard.writeText(url);
      showWeChatGuideModal();
    } else {
      // 非微信环境：复制链接并提示
      await navigator.clipboard.writeText(url);
      showWeChatGuideModal();
    }
  };

  // 显示微信分享引导
  const showWeChatGuideModal = () => {
    const modal = document.createElement('div');
    modal.id = 'wechat-share-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 20px;
        padding: 32px 28px;
        max-width: 340px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
      ">
        <div style="
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #07c160 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        ">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.68 0 3.26-.46 4.62-1.26l.37-.29c.14-.1.27-.22.21-.3l4.1-3.4c.28-.24.42-.63.42-1.01V8.25c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v.6c0 .38.14.77.42 1.01l4.1 3.4c.14.1.27.22.21.3l.37.29c-.17.12-.36.25-.58.26-.12.01-.25.01-.37.01zm5.5 5.5c-.28 0-.5-.22-.5-.5s-.22.5-.5.5v-4c0-.28.22-.5.5-.5s.5.22.5.5v4z"/>
          </svg>
        </div>
        <h3 style="
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 16px;
        ">分享到微信</h3>
        <div style="
          background: #f3f4f6;
          border-radius: 12px;
          padding: 20px;
          text-align: left;
          margin-bottom: 20px;
        ">
          <p style="
            font-size: 14px;
            color: #4b5563;
            margin-bottom: 12px;
            line-height: 1.6;
            font-weight: 600;
          ">📋 第一步：链接已复制</p>
          <p style="
            font-size: 13px;
            color: #4b5563;
            margin-bottom: 12px;
            line-height: 1.6;
          ">点击"我知道了"继续</p>
          
          <p style="
            font-size: 14px;
            color: #4b5563;
            margin-bottom: 12px;
            line-height: 1.6;
            font-weight: 600;
          ">💬 第二步：打开微信</p>
          <p style="
            font-size: 13px;
            color: #4b5563;
            margin-bottom: 12px;
            line-height: 1.6;
          ">打开微信聊天窗口，粘贴链接发送给好友</p>
          
          <p style="
            font-size: 14px;
            color: #4b5563;
            margin-bottom: 12px;
            line-height: 1.6;
            font-weight: 600;
          ">👥 第三步：好友打开</p>
          <p style="
            font-size: 13px;
            color: #4b5563;
            line-height: 1.6;
          ">好友长按链接即可访问云店模拟器</p>
        </div>
        <button id="close-wechat-modal" style="
          background: linear-gradient(135deg, #07c160 0%, #059669 100%);
          color: white;
          border: none;
          padding: 14px 40px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: transform 0.2s;
        ">我知道了</button>
      </div>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('#close-wechat-modal');
    const closeModal = () => {
      modal.style.opacity = '0';
      modal.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      }, 300);
    };
    
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  };

  // 分享到QQ
  const handleShareToQQ = async () => {
    if (!shareData) return;
    
    const url = generateShareUrl();
    const title = '云店模拟器 - 专业的店铺经营管理工具';
    const summary = `我的店铺等级：${shareData.shopLevel}，日收益${shareData.dailyCommission.toFixed(2)}元，总利润${shareData.totalProfit.toFixed(2)}元`;
    
    // QQ分享链接（通过QQ邮箱分享）
    const qqShareUrl = `https://mail.qq.com/cgi-bin/qm_share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
    
    try {
      await navigator.clipboard.writeText(url);
      window.open(qqShareUrl, '_blank');
    } catch (error) {
      console.error('Failed to share to QQ:', error);
    }
  };

  // 分享到微博
  const handleShareToWeibo = () => {
    const url = generateShareUrl();
    const title = '云店模拟器 - 专业的店铺经营管理工具';
    const pic = 'https://mv66yijv0rbs.space.minimaxi.com/icon-512.png';
    
    const weiboShareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&pic=${encodeURIComponent(pic)}`;
    
    window.open(weiboShareUrl, '_blank');
  };

  // 使用系统分享
  const handleSystemShare = async () => {
    if (!shareData) return;
    
    const url = generateShareUrl();
    const title = '云店模拟器';
    const text = `我的店铺等级：${shareData.shopLevel}，日收益${shareData.dailyCommission.toFixed(2)}元`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
      } else {
        // 不支持系统分享，复制链接
        await handleCopyLink();
      }
    } catch (error) {
      console.error('Failed to share:', error);
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

      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Failed to generate blob');
          alert('生成图片失败，请重试');
          return;
        }

        const fileName = `模拟器分享-${shareData.shopLevel}-${Date.now()}.png`;

        const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                     (window.navigator as any).standalone === true;

        if (isMobile || isPWA) {
          try {
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

            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);

            try {
              link.click();
            } catch (e) {
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
              setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            }

          } catch (error) {
            console.error('Mobile download failed:', error);
            alert('请长按图片保存，或截图分享');
          }
        } else {
          try {
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

          {/* 分享渠道 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 微信 */}
            <Button
              onClick={handleShareToWeChat}
              variant="outline"
              className="flex items-center justify-center gap-2 h-12 bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.68 0 3.26-.46 4.62-1.26l.37-.29c.14-.1.27-.22.21-.3l4.1-3.4c.28-.24.42-.63.42-1.01V8.25c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v.6c0 .38.14.77.42 1.01l4.1 3.4c.14.1.27.22.21.3l.37.29c-.17.12-.36.25-.58.26-.12.01-.25.01-.37.01zm5.5 5.5c-.28 0-.5-.22-.5-.5s-.22.5-.5.5v-4c0-.28.22-.5.5-.5s.5.22.5.5v4z"/>
              </svg>
              分享到微信
            </Button>

            {/* QQ */}
            <Button
              onClick={handleShareToQQ}
              variant="outline"
              className="flex items-center justify-center gap-2 h-12 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 text-blue-700"
            >
              <MessageCircle className="w-5 h-5" />
              分享到QQ
            </Button>

            {/* 微博 */}
            <Button
              onClick={handleShareToWeibo}
              variant="outline"
              className="flex items-center justify-center gap-2 h-12 bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300 text-red-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.26 0 .52.02.77.05l-.25.03-.5.06-.75.08-1.01-.1l-4.14-3.28c-.28-.23-.42-.63-.42-1.01v-3.2c0-.27-.14-.77-.42-1.01l-4.14-3.28c-.23-.18-.63-.28-.99-.28h-.25c-.27 0-.77-.05-.99-.28l-4.14-3.28c-.23-.19-.63-.25-1.01-.25H9.24c-.28 0-.77.07-1.01.25L5.09 7.7c-.23.19-.63.25-1.01.25h-.25c-.27 0-.77-.07-.99-.25L2.5 5.18c-.23-.18-.63-.25-.99-.25h-.25c-.28 0-.77.07-1.01.25L.25 9.24c-.23.19-.63.25-1.01.25H.25C.23 9.5.14 9.99.25 10.24L4.15 15.5c.23.19.63.25 1.01.25h.25c.28 0 .77-.07 1.01-.25l3.39-5.26c.23-.19.63-.25 1.01-.25h.25c.28 0 .77.07 1.01.25l3.39 5.26c.23.19.63.25 1.01.25h.25c.28 0 .77-.07 1.01-.25l3.39-5.26c.23-.19.63-.25 1.01-.25h.25c.28 0 .77-.07 1.01-.25l3.39 5.26c.23.19.63.25 1.01.25h.25c.28 0 .77-.07 1.01-.25l3.39 5.26c.23.19.63.25 1.01.25h.25c.28 0 .77-.07 1.01-.25l3.39 5.26c.23.19.63.25 1.01.25h.25c.28 0 .77-.07 1.01-.25l3.39-5.26c.23.19.63.25 1.01.25h.25c.28 0 .77-.07 1.01-.25L21.76 8.76c.23-.19.63-.25 1.01-.25h.25c.28 0 .77-.07 1.01-.25l3.39-5.26c.23-.19.63-.25 1.01-.25h.25c.28 0 .77-.07 1.01-.25l3.39 5.26c.23-.19.63-.25 1.01-.25h.25c.28 0 .77-.07 1.01-.25L21.76 15.5c.23-.19.63-.25 1.01-.25h.25c.28 0 .77-.07 1.01-.25l3.39-5.26c.23-.19.63-.25 1.01-.25h.25c.28 0 .77-.07 1.01-.25L21.76 18.76c-.23-.19-.63-.25-1.01-.25h-.25c-.27 0-.77.05-.99-.25l-3.39-5.26c-.23-.19-.63-.25-1.01-.25h-.25c-.27 0-.77.05-.99-.25l-3.39-5.26c-.23-.19-.63-.25-1.01-.25h-.25c-.27 0-.77.05-.99-.25L12.74 2z"/>
              </svg>
              分享到微博
            </Button>

            {/* 复制链接 */}
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="flex items-center justify-center gap-2 h-12"
            >
              <Copy className="w-4 h-4" />
              {copied ? '已复制' : '复制链接'}
            </Button>
          </div>

          {/* 其他操作 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 下载图片 */}
            <Button
              onClick={handleDownloadImage}
              variant="outline"
              className="flex items-center justify-center gap-2 h-12"
            >
              <ImageIcon className="w-4 h-4" />
              下载图片
            </Button>

            {/* 系统分享 */}
            <Button
              onClick={handleSystemShare}
              variant="outline"
              className="flex items-center justify-center gap-2 h-12"
            >
              <Share className="w-4 h-4" />
              系统分享
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
