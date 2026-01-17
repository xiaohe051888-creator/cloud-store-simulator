'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Package, FileArchive } from 'lucide-react';

interface DownloadInfo {
  success: boolean;
  downloadUrl?: string;
  fileKey?: string;
  size?: number;
  error?: string;
}

export default function DownloadPage() {
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDownloadInfo();
  }, []);

  const fetchDownloadInfo = async () => {
    try {
      const response = await fetch('/api/upload-source');
      const data = await response.json();
      setDownloadInfo(data);
    } catch (err) {
      setError('获取下载链接失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (downloadInfo?.downloadUrl) {
      try {
        const response = await fetch(downloadInfo.downloadUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cloud-shop-simulator.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        setError('下载失败，请重试');
        console.error(err);
      }
    }
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">正在准备下载...</p>
        </div>
      </div>
    );
  }

  if (error || !downloadInfo?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md apple-shadow-lg">
          <CardHeader>
            <CardTitle className="text-destructive">获取下载链接失败</CardTitle>
            <CardDescription>{error || downloadInfo?.error || '未知错误'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchDownloadInfo} variant="outline" className="w-full apple-button">
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl apple-shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <FileArchive className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">云店模拟器 - 源代码下载</CardTitle>
          <CardDescription className="text-base">
            完整的 Next.js + TypeScript + shadcn/ui 项目代码
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 文件信息 */}
          <div className="bg-muted/50 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">文件名</span>
              <span className="font-mono text-sm">cloud-shop-simulator.zip</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">文件大小</span>
              <span className="font-semibold text-primary">
                {downloadInfo.size ? formatSize(downloadInfo.size) : '未知'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">有效期</span>
              <span className="text-foreground">7 天</span>
            </div>
          </div>

          {/* 包含内容 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">包含内容</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                完整源代码
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                配置文件
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                组件定义
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                静态资源
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * 不包含 node_modules，解压后需要运行 pnpm install
            </p>
          </div>

          {/* 下载按钮 */}
          <Button
            onClick={handleDownload}
            size="lg"
            className="w-full apple-button"
          >
            <Download className="mr-2 h-5 w-5" />
            下载源代码
          </Button>

          {/* 使用说明 */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">使用方法：</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>下载并解压文件</li>
              <li>在终端中进入项目目录</li>
              <li>运行 <code className="bg-muted px-2 py-1 rounded text-xs">pnpm install</code></li>
              <li>运行 <code className="bg-muted px-2 py-1 rounded text-xs">coze dev</code> 启动项目</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
