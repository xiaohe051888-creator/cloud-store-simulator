'use client';

import { useState, useEffect } from 'react';

export type ClientType = 'desktop' | 'mobile' | 'pwa' | 'wechat';

export interface ClientInfo {
  isMobile: boolean;
  isDesktop: boolean;
  isPWA: boolean;
  isWeChat: boolean;
  clientType: ClientType;
  isIOS: boolean;
  isAndroid: boolean;
}

/**
 * 客户端检测 Hook
 * 检测用户使用的设备和环境
 */
export function useClientDetection(): ClientInfo {
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    isMobile: false,
    isDesktop: true,
    isPWA: false,
    isWeChat: false,
    clientType: 'desktop',
    isIOS: false,
    isAndroid: false,
  });

  useEffect(() => {
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // 检测iOS
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // 检测Android
    const isAndroid = /Android/i.test(navigator.userAgent);

    // 检测是否在微信中
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

    // 检测是否为PWA模式
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true ||
                  document.referrer.includes('android-app://');

    // 确定客户端类型
    let clientType: ClientType = 'desktop';
    if (isPWA) {
      clientType = 'pwa';
    } else if (isWeChat) {
      clientType = 'wechat';
    } else if (isMobile) {
      clientType = 'mobile';
    }

    setClientInfo({
      isMobile,
      isDesktop: !isMobile,
      isPWA,
      isWeChat,
      clientType,
      isIOS,
      isAndroid,
    });
  }, []);

  return clientInfo;
}

/**
 * 获取客户端特定的类名
 */
export function getClientClasses(clientInfo: ClientInfo): string {
  const classes: string[] = [];

  if (clientInfo.isMobile) classes.push('client-mobile');
  if (clientInfo.isDesktop) classes.push('client-desktop');
  if (clientInfo.isPWA) classes.push('client-pwa');
  if (clientInfo.isWeChat) classes.push('client-wechat');
  if (clientInfo.isIOS) classes.push('client-ios');
  if (clientInfo.isAndroid) classes.push('client-android');

  return classes.join(' ');
}
