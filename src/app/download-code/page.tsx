'use client';

import { useState } from 'react';

export default function DownloadCodePage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch('/api/download/code');
      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cloud-shop-simulator-v1.4.4.tar.gz';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('下载完成！文件已保存到您的下载文件夹');
    } catch (error) {
      console.error('下载错误:', error);
      alert('下载失败，请稍后重试');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <div className="text-center space-y-6">
          {/* 图标 */}
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>

          {/* 标题 */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              云店模拟器 v1.4.4
            </h1>
            <p className="text-gray-600">
              完整源代码下载
            </p>
          </div>

          {/* 文件信息 */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">文件名：</span>
              <span className="font-medium text-gray-900">cloud-shop-simulator-v1.4.4.tar.gz</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">文件大小：</span>
              <span className="font-medium text-gray-900">731 KB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">格式：</span>
              <span className="font-medium text-gray-900">tar.gz</span>
            </div>
          </div>

          {/* 下载按钮 */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg shadow-lg transition-all duration-200 ${
              downloading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl active:scale-95'
            }`}
          >
            {downloading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                下载中...
              </div>
            ) : (
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                点击下载
              </div>
            )}
          </button>

          {/* 使用说明 */}
          <div className="text-left space-y-2 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">使用说明：</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>点击上方按钮下载文件</li>
              <li>文件会自动保存到您的下载文件夹</li>
              <li>双击文件解压（Mac系统支持）</li>
              <li>打开终端，进入项目目录运行：<br />
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
