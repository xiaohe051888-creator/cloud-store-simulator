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
      setShareParams({
        level: level || undefined,
        stock: stock ? parseInt(stock) : undefined,
        balance: balance ? parseInt(balance) : undefined,
        max: max ? parseInt(max) : undefined,
        profit: profit ? parseFloat(profit) : undefined,
      });
      setIsFromShare(true);

      // 清除 URL 参数，保持 URL 干净
      const cleanUrl = window.location.pathname;
      router.replace(cleanUrl);
    }
  }, [searchParams, router]);

  return { shareParams, isFromShare };
}
