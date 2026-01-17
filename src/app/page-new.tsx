'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import WeChatLinkGuide from '@/components/wechat-link-guide';
import ShareModal from '@/components/share-modal';
import PWAInstallPrompt from '@/components/pwa-install-prompt';
import PWAUpdatePrompt from '@/components/pwa-update-prompt';
import { useShareParams } from '@/hooks/use-share-params';
import {
  shopLevelsConfig,
} from '@/lib/shop-config';
import {
  formatDate,
  generateSalesData,
  validateStockAmount,
  validateCloudBalance,
  validateMaxBalance,
} from '@/lib/shop-utils';
import type { ShopLevel, ViewType, SalesData, ComparisonData, RecommendationResult } from '@/types/shop';

/**
 * Cloud Shop Simulator - Apple Style Edition
 * 云店模拟器 - 苹果官网风格版
 *
 * 设计特点：
 * - 极简主义，大量留白
 * - 大标题，小副标题
 * - 居中对齐
 * - 柔和的阴影
 * - 流畅的动画
 * - 响应式设计（支持4个客户端）
 */

function CloudShopSimulator() {
  // ==================== 状态管理 ====================
  const [currentLevel, setCurrentLevel] = useState<ShopLevel | null>(null);
  const [stockAmount, setStockAmount] = useState<number>(0);
  const [cloudBalance, setCloudBalance] = useState<number>(0);
  const [maxBalance, setMaxBalance] = useState<number>(0);
  const [currentView, setCurrentView] = useState<ViewType>('shopSelection');
  const [isEditMaxBalance, setIsEditMaxBalance] = useState<boolean>(true);

  // 对比数据状态
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [currentComparisonId, setCurrentComparisonId] = useState<string | null>(null);

  // 输入框值状态
  const [stockInputValue, setStockInputValue] = useState<string>('');
  const [cloudBalanceInputValue, setCloudBalanceInputValue] = useState<string>('');
  const [maxBalanceInputValue, setMaxBalanceInputValue] = useState<string>('0');

  // 错误状态
  const [stockError, setStockError] = useState<string>('');
  const [cloudBalanceError, setCloudBalanceError] = useState<string>('');
  const [maxBalanceError, setMaxBalanceError] = useState<string>('');

  // 输入框引用
  const cloudBalanceRef = useRef<HTMLInputElement>(null);
  const stockAmountRef = useRef<HTMLInputElement>(null);
  const maxBalanceRef = useRef<HTMLInputElement>(null);

  // 销售详情表格滚动容器引用
  const salesDetailsScrollRef = useRef<HTMLDivElement>(null);

  // 触摸滑动状态
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);

  // 触摸滑动处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (salesDetailsScrollRef.current) {
      const diff = touchStart - touchEnd;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          salesDetailsScrollRef.current.scrollLeft += 150;
        } else {
          salesDetailsScrollRef.current.scrollLeft -= 150;
        }
      }
    }
  };

  // 推荐系统输入框引用
  const recommendBudgetRef = useRef<HTMLInputElement>(null);
  const recommendPeriodRef = useRef<HTMLInputElement>(null);
  const recommendProfitRef = useRef<HTMLInputElement>(null);

  // 进货输入闪烁状态
  const [isStockShaking, setIsStockShaking] = useState<boolean>(false);
  const [isCloudBalanceShaking, setIsCloudBalanceShaking] = useState<boolean>(false);
  const [isMaxBalanceShaking, setIsMaxBalanceShaking] = useState<boolean>(false);

  // 销售数据
  const [salesData, setSalesData] = useState<SalesData[]>([]);

  // 推荐系统状态
  const [recommendInputType, setRecommendInputType] = useState<'budget' | 'profit'>('budget');
  const [recommendBudget, setRecommendBudget] = useState<string>('');
  const [recommendProfit, setRecommendProfit] = useState<string>('');
  const [recommendPeriod, setRecommendPeriod] = useState<string>('');
  const [recommendResults, setRecommendResults] = useState<RecommendationResult[]>([]);

  // 推荐系统验证状态
  const [budgetError, setBudgetError] = useState<string>('');
  const [periodError, setPeriodError] = useState<string>('');
  const [profitError, setProfitError] = useState<string>('');
  const [isBudgetShaking, setIsBudgetShaking] = useState<boolean>(false);
  const [isPeriodShaking, setIsPeriodShaking] = useState<boolean>(false);
  const [isProfitShaking, setIsProfitShaking] = useState<boolean>(false);

  // 微信链接引导状态
  const [showWeChatLinkGuide, setShowWeChatLinkGuide] = useState<boolean>(false);

  // 分享弹窗状态
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // 获取分享参数
  const { shareParams, isFromShare, clearShareParams } = useShareParams();

  // 获取当前等级配置
  const levelConfig = currentLevel ? shopLevelsConfig[currentLevel] : null;

  // ==================== 事件处理函数 ====================
  // 选择店铺等级
  const handleSelectLevel = (level: ShopLevel) => {
    clearShareParams();
    setCurrentLevel(level);
    setCurrentView('stockInput');
    setStockInputValue('');
    setCloudBalanceInputValue('');
    setMaxBalanceInputValue('0');
    setStockAmount(0);
    setCloudBalance(0);
    setMaxBalance(0);
    setIsEditMaxBalance(true);
    setStockError('');
    setCloudBalanceError('');
    setMaxBalanceError('');
    setCurrentComparisonId(null);
  };

  // 返回店铺选择
  const handleBackToShopSelection = () => {
    setCurrentView('shopSelection');
  };

  // 返回首页（重置所有状态）
  const handleGoHome = () => {
    clearShareParams();
    setCurrentLevel(null);
    setStockAmount(0);
    setCloudBalance(0);
    setMaxBalance(0);
    setCurrentView('shopSelection');
    setStockInputValue('');
    setCloudBalanceInputValue('');
    setMaxBalanceInputValue('0');
    setIsEditMaxBalance(true);
    setStockError('');
    setCloudBalanceError('');
    setMaxBalanceError('');
    setSalesData([]);
    setCurrentComparisonId(null);
  };

  // 返回进货输入
  const handleBackToStockInput = () => {
    setCurrentView('stockInput');
  };

  // 返回等级详情
  const handleBackToLevelDetails = () => {
    setCurrentView('levelDetails');
  };

  // 进入数据对比页面
  const handleViewComparison = () => {
    if (comparisonData.length > 0) {
      setCurrentView('comparison');
    }
  };

  // 处理进货额度输入
  const handleStockInputChange = (value: string) => {
    setStockInputValue(value);

    const numValue = parseInt(value) || 0;

    if (levelConfig) {
      const validation = validateStockAmount(numValue, levelConfig);
      if (!validation.valid && numValue > 0) {
        setStockError(validation.error || '');
      } else if (numValue > 0 && validation.valid) {
        setStockError('');
      } else if (!value) {
        setStockError('');
      }

      setStockAmount(numValue);

      if (isEditMaxBalance) {
        const newMaxBalance = numValue + cloudBalance;
        setMaxBalance(newMaxBalance);
        setMaxBalanceInputValue(String(newMaxBalance));
        const maxValidation = validateMaxBalance(newMaxBalance, numValue, cloudBalance);
        if (!maxValidation.valid) {
          setMaxBalanceError(maxValidation.error || '');
        } else {
          setMaxBalanceError('');
        }
      }
    }
  };

  // 处理云店余额输入
  const handleCloudBalanceInputChange = (value: string) => {
    setCloudBalanceInputValue(value);
    const numValue = parseInt(value) || 0;

    const validation = validateCloudBalance(numValue, stockAmount);
    if (!validation.valid && numValue > 0) {
      setCloudBalanceError(validation.error || '');
    } else if (numValue > 0 && validation.valid) {
      setCloudBalanceError('');
    } else if (!value) {
      setCloudBalanceError('');
    }

    setCloudBalance(numValue);

    if (isEditMaxBalance) {
      const newMaxBalance = stockAmount + numValue;
      setMaxBalance(newMaxBalance);
      setMaxBalanceInputValue(String(newMaxBalance));
      const maxValidation = validateMaxBalance(newMaxBalance, stockAmount, numValue);
      if (!maxValidation.valid) {
        setMaxBalanceError(maxValidation.error || '');
      } else {
        setMaxBalanceError('');
      }
    }
  };

  // 处理最高余额输入
  const handleMaxBalanceInputChange = (value: string) => {
    setMaxBalanceInputValue(value);
    const numValue = parseInt(value) || 0;

    const validation = validateMaxBalance(numValue, stockAmount, cloudBalance);
    if (!validation.valid && numValue > 0) {
      setMaxBalanceError(validation.error || '');
    } else if (numValue > 0 && validation.valid) {
      setMaxBalanceError('');
    } else if (!value) {
      setMaxBalanceError('');
    }

    setMaxBalance(numValue);
  };

  // 切换同步历史最高余额
  const handleToggleEditMaxBalance = (checked: boolean) => {
    setIsEditMaxBalance(checked);

    if (checked) {
      const newMaxBalance = stockAmount + cloudBalance;
      setMaxBalance(newMaxBalance);
      setMaxBalanceInputValue(String(newMaxBalance));
      const maxValidation = validateMaxBalance(newMaxBalance, stockAmount, cloudBalance);
      if (!maxValidation.valid) {
        setMaxBalanceError(maxValidation.error || '');
      } else {
        setMaxBalanceError('');
      }
    } else {
      setMaxBalanceError('');
    }
  };

  // 确认进货
  const handleConfirmStock = useCallback(() => {
    if (!currentLevel || !levelConfig) return;

    let isValid = true;

    if (stockInputValue) {
      const numValue = parseInt(stockInputValue) || 0;
      const validation = validateStockAmount(numValue, levelConfig);
      if (!validation.valid) {
        setStockError(validation.error || '');
        setIsStockShaking(true);
        setTimeout(() => setIsStockShaking(false), 500);
        isValid = false;
      }
    }

    if (cloudBalanceInputValue) {
      const numValue = parseInt(cloudBalanceInputValue) || 0;
      const validation = validateCloudBalance(numValue, stockAmount);
      if (!validation.valid) {
        setCloudBalanceError(validation.error || '');
        setIsCloudBalanceShaking(true);
        setTimeout(() => setIsCloudBalanceShaking(false), 500);
        isValid = false;
      }
    }

    if (maxBalanceInputValue) {
      const numValue = parseInt(maxBalanceInputValue) || 0;
      const validation = validateMaxBalance(numValue, stockAmount, cloudBalance);
      if (!validation.valid) {
        setMaxBalanceError(validation.error || '');
        setIsMaxBalanceShaking(true);
        setTimeout(() => setIsMaxBalanceShaking(false), 500);
        isValid = false;
      }
    }

    if (!isValid) return;

    const cloudTotalBalance = stockAmount + cloudBalance;
    const dailyCommission = Math.round(maxBalance * levelConfig.commissionRate);
    const dailyProfit = dailyCommission * (levelConfig.saleDiscount - levelConfig.stockDiscount);
    const data = generateSalesData(cloudTotalBalance, dailyCommission, dailyProfit);
    setSalesData(data);
    setCurrentView('levelDetails');
  }, [currentLevel, levelConfig, stockInputValue, cloudBalanceInputValue, maxBalanceInputValue, stockAmount, cloudBalance, maxBalance]);

  // 打开链接
  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ==================== 计算属性 ====================
  const detailsData = useMemo(() => {
    if (!currentLevel || !levelConfig) return null;

    const cloudTotalBalance = stockAmount + cloudBalance;
    const stockCost = Math.round(cloudTotalBalance * levelConfig.stockDiscount);
    const dailyCommission = Math.round(maxBalance * levelConfig.commissionRate);
    const completionDays = Math.ceil(cloudTotalBalance / dailyCommission);
    const totalProfit = Math.round(cloudTotalBalance * (levelConfig.saleDiscount - levelConfig.stockDiscount));

    return { stockCost, dailyCommission, completionDays, totalProfit, cloudTotalBalance };
  }, [currentLevel, levelConfig, stockAmount, cloudBalance, maxBalance]);

  // ==================== 渲染辅助函数 ====================
  // 渲染首页菜单
  const renderHome = () => (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in-0 slide-in-from-top-4 duration-500">
      {/* 页面标题 */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight mb-4">
          云店模拟器
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">
          专业的店铺经营管理模拟工具
        </p>
      </div>

      {/* 功能卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 进入平台 */}
        <Card
          onClick={() => setCurrentView('platform')}
          className="group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
        >
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
              进入平台
            </h3>
            <p className="text-gray-500 leading-relaxed">
              登录缴费平台，下载官方APP
            </p>
          </CardContent>
        </Card>

        {/* 模拟进货 */}
        <Card
          onClick={() => setCurrentView('levelSelection')}
          className="group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
        >
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
              模拟进货
            </h3>
            <p className="text-gray-500 leading-relaxed">
              选择店铺等级，设置进货额度
            </p>
          </CardContent>
        </Card>

        {/* 智能推荐 */}
        <Card
          onClick={() => setCurrentView('recommendation')}
          className="group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
        >
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
              智能推荐
            </h3>
            <p className="text-gray-500 leading-relaxed">
              按预算或利润推荐最适合的店铺
            </p>
          </CardContent>
        </Card>

        {/* 店铺等级 */}
        <Card
          onClick={() => setCurrentView('shopLevels')}
          className="group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
        >
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
              店铺等级
            </h3>
            <p className="text-gray-500 leading-relaxed">
              查看各等级说明、升级条件
            </p>
          </CardContent>
        </Card>

        {/* 数据对比 */}
        <Card
          onClick={handleViewComparison}
          disabled={comparisonData.length === 0}
          className={`group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-1 md:col-span-2 ${comparisonData.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 md:mb-0 group-hover:scale-110 transition-transform duration-300 ${comparisonData.length > 0 ? 'bg-pink-100' : 'bg-gray-100'}`}>
                <svg className={`w-8 h-8 ${comparisonData.length > 0 ? 'text-pink-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                  数据对比
                  {comparisonData.length > 0 && (
                    <span className="ml-3 text-lg font-normal text-gray-500">
                      ({comparisonData.length} 条数据)
                    </span>
                  )}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  对比不同等级店铺的经营数据
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 分享给好友 */}
        <Card
          onClick={async () => {
            const url = window.location.href;
            try {
              await navigator.clipboard.writeText(url);
              alert('链接已复制到剪贴板！');
            } catch (err) {
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: '云店模拟器',
                    text: '专业的店铺经营管理模拟工具',
                    url: url
                  });
                } catch (shareErr) {
                  alert('无法复制链接，请手动复制地址栏链接');
                }
              } else {
                alert('无法复制链接，请手动复制地址栏链接');
              }
            }
          }}
          className="group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-1 md:col-span-2"
        >
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mb-6 md:mb-0 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                  分享给好友
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  复制网站链接，分享给好友使用
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // 渲染店铺等级选择
  const renderLevelSelection = () => (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in-0 slide-in-from-top-4 duration-500">
      {/* 返回按钮和标题 */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackToShopSelection}
          className="rounded-full hover:bg-gray-100 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
            选择店铺等级
          </h1>
          <p className="text-gray-500 mt-2">请选择适合你的店铺等级</p>
        </div>
      </div>

      {/* 等级卡片列表 */}
      <div className="space-y-4">
        {Object.entries(shopLevelsConfig).map(([level, config]) => {
          if (!config || !level) return null;

          return (
            <Card
              key={level}
              onClick={() => handleSelectLevel(level as ShopLevel)}
              className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* 等级图标/颜色标识 */}
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl"
                      style={{ backgroundColor: config.color }}
                    />
                  </div>

                  {/* 等级信息 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                      {config.name}
                    </h3>

                    {/* 桌面端：详细信息 */}
                    <div className="hidden md:flex items-center gap-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="font-semibold text-gray-900">
                          {config.minStock}-{config.maxStock} ⚡
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-blue-600">
                          {(config.stockDiscount * 10).toFixed(1)}折
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-semibold text-green-600">
                          结算: {config.settlementDays}天
                        </span>
                      </div>
                    </div>

                    {/* 移动端：简化信息 */}
                    <div className="md:hidden flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">
                        {config.minStock}-{config.maxStock} ⚡
                      </span>
                      <span className="font-semibold text-blue-600">
                        {(config.stockDiscount * 10).toFixed(1)}折
                      </span>
                    </div>
                  </div>

                  {/* 箭头 */}
                  <div className="flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // 渲染平台页面
  const renderPlatform = () => (
    <div className="w-full max-w-lg mx-auto animate-in fade-in-0 slide-in-from-top-4 duration-500">
      {/* 返回按钮和标题 */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackToShopSelection}
          className="rounded-full hover:bg-gray-100 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
            进入平台
          </h1>
          <p className="text-gray-500 mt-2">选择要进入的平台</p>
        </div>
      </div>

      {/* 平台按钮列表 */}
      <div className="space-y-4">
        <Button
          onClick={() => openLink('https://www.ugpcgm.cn/#/pages/index/login/login')}
          variant="apple"
          className="w-full h-16 text-lg font-semibold"
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          登录缴费平台
        </Button>

        <Button
          onClick={() => openLink('https://www.ugpcgm.cn/#/pages/download/download')}
          variant="apple"
          className="w-full h-16 text-lg font-semibold"
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载缴费APP
        </Button>

        <Button
          onClick={() => openLink('https://www.ugpcgm.cn/#/myPages/groupChat/groupChat')}
          variant="apple"
          className="w-full h-16 text-lg font-semibold"
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          下载步信APP
        </Button>
      </div>
    </div>
  );

  // 渲染店铺等级说明
  const renderShopLevels = () => {
    // 这里需要实现店铺等级详情展示
    // 暂时返回占位符
    return (
      <div className="w-full max-w-5xl mx-auto animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToShopSelection}
            className="rounded-full hover:bg-gray-100 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
              店铺等级
            </h1>
            <p className="text-gray-500 mt-2">各等级说明和升级条件</p>
          </div>
        </div>

        <div className="text-center py-20 text-gray-500">
          店铺等级详情页面开发中...
        </div>
      </div>
    );
  };

  // 渲染智能推荐
  const renderRecommendation = () => {
    // 这里需要实现智能推荐界面
    // 暂时返回占位符
    return (
      <div className="w-full max-w-4xl mx-auto animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToShopSelection}
            className="rounded-full hover:bg-gray-100 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
              智能推荐
            </h1>
            <p className="text-gray-500 mt-2">根据你的需求推荐最适合的店铺等级</p>
          </div>
        </div>

        <div className="text-center py-20 text-gray-500">
          智能推荐功能开发中...
        </div>
      </div>
    );
  };

  // 渲染进货输入页面
  const renderStockInput = () => {
    if (!levelConfig) return null;

    return (
      <div className="w-full max-w-2xl mx-auto animate-in fade-in-0 slide-in-from-top-4 duration-500">
        {/* 返回按钮和标题 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToShopSelection}
            className="rounded-full hover:bg-gray-100 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
              {levelConfig.name}
            </h1>
            <p className="text-gray-500 mt-2">设置进货参数</p>
          </div>
        </div>

        {/* 输入表单 */}
        <Card className="mb-6">
          <CardContent className="p-8 space-y-6">
            {/* 进货额度 */}
            <div>
              <Label htmlFor="stockAmount" className="text-base font-semibold text-gray-900 mb-3 block">
                进货额度
              </Label>
              <Input
                id="stockAmount"
                ref={stockAmountRef}
                type="number"
                value={stockInputValue}
                onChange={(e) => handleStockInputChange(e.target.value)}
                placeholder={`请输入进货额度（${levelConfig.minStock}-${levelConfig.maxStock}）`}
                className={`text-lg ${stockError ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {stockError && (
                <p className="text-red-500 text-sm mt-2">{stockError}</p>
              )}
            </div>

            {/* 云店余额 */}
            <div>
              <Label htmlFor="cloudBalance" className="text-base font-semibold text-gray-900 mb-3 block">
                云店余额
              </Label>
              <Input
                id="cloudBalance"
                ref={cloudBalanceRef}
                type="number"
                value={cloudBalanceInputValue}
                onChange={(e) => handleCloudBalanceInputChange(e.target.value)}
                placeholder="请输入云店余额"
                className={`text-lg ${cloudBalanceError ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {cloudBalanceError && (
                <p className="text-red-500 text-sm mt-2">{cloudBalanceError}</p>
              )}
            </div>

            {/* 历史最高余额 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Label htmlFor="maxBalance" className="text-base font-semibold text-gray-900">
                  历史最高余额
                </Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="syncMaxBalance"
                    checked={isEditMaxBalance}
                    onCheckedChange={handleToggleEditMaxBalance}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor="syncMaxBalance" className="text-sm text-gray-600 cursor-pointer">
                    同步计算
                  </Label>
                </div>
              </div>
              <Input
                id="maxBalance"
                ref={maxBalanceRef}
                type="number"
                value={maxBalanceInputValue}
                onChange={(e) => handleMaxBalanceInputChange(e.target.value)}
                placeholder="请输入历史最高余额"
                disabled={isEditMaxBalance}
                className={`text-lg ${maxBalanceError ? 'border-red-500 focus:border-red-500' : ''} ${isEditMaxBalance ? 'bg-gray-50' : ''}`}
              />
              {maxBalanceError && (
                <p className="text-red-500 text-sm mt-2">{maxBalanceError}</p>
              )}
            </div>

            {/* 确认按钮 */}
            <Button
              onClick={handleConfirmStock}
              className="w-full h-14 text-lg font-semibold"
              size="lg"
            >
              确认进货
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ==================== 主渲染 ====================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 苹果风格导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* 左侧：数据对比按钮 */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewComparison}
                disabled={comparisonData.length === 0}
                className="h-10 px-4"
              >
                数据对比{comparisonData.length > 0 && ` (${comparisonData.length})`}
              </Button>
            </div>

            {/* 中间：标题 */}
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                云店模拟器
              </h1>
            </div>

            {/* 右侧：回到首页按钮 */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoHome}
                className="h-10 px-4"
              >
                回到首页
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 根据视图渲染不同内容 */}
        {currentView === 'shopSelection' && renderHome()}
        {currentView === 'levelSelection' && renderLevelSelection()}
        {currentView === 'platform' && renderPlatform()}
        {currentView === 'shopLevels' && renderShopLevels()}
        {currentView === 'recommendation' && renderRecommendation()}
        {currentView === 'stockInput' && renderStockInput()}
        {/* 其他视图待实现 */}
      </main>

      {/* 全局组件 */}
      <WeChatLinkGuide isVisible={showWeChatLinkGuide} onClose={() => setShowWeChatLinkGuide(false)} />
      <ShareModal isVisible={showShareModal} onClose={() => setShowShareModal(false)} />
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
    </div>
  );
}

// 包装组件以支持 Suspense
export default function CloudShopSimulatorWrapper() {
  return (
    <Suspense fallback={null}>
      <CloudShopSimulator />
    </Suspense>
  );
}
