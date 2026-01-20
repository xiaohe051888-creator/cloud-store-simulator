import { useEffect, useRef } from 'react';

interface UseSwipeBackOptions {
  onSwipeBack: () => void;
  threshold?: number;
  disabled?: boolean;
}

export function useSwipeBack({
  onSwipeBack,
  threshold = 100,
  disabled = false,
}: UseSwipeBackOptions) {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      isSwiping.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;

      // 如果垂直滑动距离超过水平滑动距离，不触发返回
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        isSwiping.current = false;
        return;
      }

      // 阻止页面滚动，实现平滑的滑动效果
      if (deltaX > 0 && deltaX < threshold) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwiping.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX.current;

      // 如果滑动距离超过阈值，触发返回
      if (deltaX > threshold) {
        onSwipeBack();
      }

      isSwiping.current = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeBack, threshold, disabled]);

  return {
    isSupported: 'ontouchstart' in window,
  };
}
