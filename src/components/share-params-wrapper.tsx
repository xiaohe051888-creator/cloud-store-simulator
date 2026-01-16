'use client';

import { Suspense } from 'react';
import { useShareParams } from '@/hooks/use-share-params';
import type { ShareParams } from '@/hooks/use-share-params';

interface ShareParamsWrapperProps {
  children: (params: { shareParams: ShareParams; isFromShare: boolean }) => React.ReactNode;
}

function ShareParamsInner({ children }: ShareParamsWrapperProps) {
  const { shareParams, isFromShare } = useShareParams();
  return <>{children({ shareParams, isFromShare })}</>;
}

export default function ShareParamsWrapper({ children }: ShareParamsWrapperProps) {
  return (
    <Suspense fallback={null}>
      <ShareParamsInner>{children}</ShareParamsInner>
    </Suspense>
  );
}
