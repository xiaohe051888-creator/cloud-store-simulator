'use client';

import { useState, useEffect } from 'react';

interface DownloadInfo {
  success: boolean;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: string;
  error?: string;
}

export default function GetDownloadLinkPage() {
  const [loading, setLoading] = useState(true);
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);

  useEffect(() => {
    const getLink = async () => {
      try {
        const response = await fetch('/api/upload-code', { method: 'POST' });
        const data = await response.json();
        setDownloadInfo(data);
      } catch (error) {
        setDownloadInfo({ success: false, error: '获取下载链接失败' });
      } finally {
        setLoading(false);
      }
    };

    getLink();
  }, []);

  const handleDownload = async () => {
    if (!downloadInfo?.downloadUrl) return;

    try {
      const response = await fetch(downloadInfo.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadInfo.fileName || 'cloud-shop-simulator-v1.4.5.tar.gz';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('下载完成！文件已保存到您的下载文件夹');
    } catch (error) {
      console.error('下载错误:', error);
      alert('下载失败，请直接点击下面的下载链接');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">正在获取下载链接...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <div className="space-y-6">
          {/* 图标 */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* 标题 */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {downloadInfo?.success ? '下载链接已生成' : '获取失败'}
            </h1>
            <p className="text-gray-600">
              云店模拟器 v1.4.5 完整源代码
            </p>
          </div>

          {downloadInfo?.success && downloadInfo.downloadUrl ? (
            <>
              {/* 文件信息 */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">文件名：</span>
                  <span className="font-medium text-gray-900 max-w-xs truncate">
                    {downloadInfo.fileName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">文件大小：</span>
                  <span className="font-medium text-gray-900">{downloadInfo.fileSize}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">链接有效期：</span>
                  <span className="font-medium text-green-600">30天</span>
                </div>
              </div>

              {/* 下载按钮 */}
              <button
                onClick={handleDownload}
                className="w-full py-4 px-6 rounded-xl font-bold text-white text-lg shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl active:scale-95 transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  点击下载
                </div>
              </button>

              {/* 复制链接 */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(downloadInfo.downloadUrl!);
                  alert('下载链接已复制到剪贴板');
                }}
                className="w-full py-3 px-6 rounded-xl font-medium text-gray-700 text-base border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 active:scale-95 transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  复制下载链接
                </div>
              </button>

              {/* 直接访问链接 */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800 mb-2">
                  或者直接点击下面的链接下载：
                </p>
                <a
                  href={downloadInfo.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-700 break-all"
                >
                  {downloadInfo.downloadUrl}
                </a>
              </div>
            </>
          ) : (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-800 mb-4">
                {downloadInfo?.error || '获取下载链接失败，请稍后重试'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="py-2 px-6 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                重新获取
              </button>
            </div>
          )}

          {/* 使用说明 */}
          <div className="text-left space-y-2 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">使用说明：</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>点击上方"点击下载"按钮下载文件</li>
              <li>或复制链接后在浏览器中打开</li>
              <li>双击下载的文件解压（Mac系统支持）</li>
              <li>打开终端，运行：<br />
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  cd projects && pnpm install && pnpm dev
                </code>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
