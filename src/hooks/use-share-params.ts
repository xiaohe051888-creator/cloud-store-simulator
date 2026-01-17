'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ShopLevel } from '@/types/shop';

export interface ShareParams {
  level?: string;
  stock?: number;
  balance?: number;
  max?: number;
  profit?: number;
}

const SHARE_PARAMS_STORAGE_KEY = 'cloudshop-share-params';

export function useShareParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [shareParams, setShareParams] = useState<ShareParams>({});
  const [isFromShare, setIsFromShare] = useState(false);

  useEffect(() => {
    const level = searchParams.get('level') as ShopLevel | null;
    const stock = searchParams.get('stock');
    const balance = searchParams.get('balance');
    const max = searchParams.get('max');
    const profit = searchParams.get('profit');

    if (level || stock || balance || max || profit) {
      const params = {
        level: level || undefined,
        stock: stock ? parseInt(stock) : undefined,
        balance: balance ? parseInt(balance) : undefined,
        max: max ? parseInt(max) : undefined,
        profit: profit ? parseFloat(profit) : undefined,
      };

      setShareParams(params);
      setIsFromShare(true);

      // 保存到 localStorage，确保 PWA 启动时也能获取到参数
      localStorage.setItem(SHARE_PARAMS_STORAGE_KEY, JSON.stringify(params));

      // 清除 URL 参数，保持 URL 干净，但保留 target 参数
      const target = searchParams.get('target');
      const cleanUrl = target ? `${window.location.pathname}?target=${target}` : window.location.pathname;
      router.replace(cleanUrl);
    } else {
      // 如果 URL 中没有参数，尝试从 localStorage 读取（PWA 场景）
      const storedParams = localStorage.getItem(SHARE_PARAMS_STORAGE_KEY);
      if (storedParams) {
        try {
          const params = JSON.parse(storedParams);
          // 只有当参数有效时才设置
          if (params.level || params.stock || params.balance || params.max || params.profit) {
            setShareParams(params);
            setIsFromShare(true);
          }
        } catch (e) {
          console.error('Failed to parse stored share params:', e);
        }
      }
    }
  }, [searchParams, router]);

  // 清除存储的分享参数（当用户开始新的操作时）
  const clearShareParams = () => {
    localStorage.removeItem(SHARE_PARAMS_STORAGE_KEY);
    setIsFromShare(false);
    setShareParams({});
  };

  return { shareParams, isFromShare, clearShareParams };
}
