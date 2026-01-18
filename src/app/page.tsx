'use client';

import { Suspense } from 'react';

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

function CloudShopSimulator() {
  // 应用状态
  const [currentLevel, setCurrentLevel] = useState<ShopLevel | null>(null);
  const [stockAmount, setStockAmount] = useState<number>(0);
  const [cloudBalance, setCloudBalance] = useState<number>(0);      // 云店余额
  const [maxBalance, setMaxBalance] = useState<number>(0);           // 历史最高余额
  const [currentView, setCurrentView] = useState<ViewType>('shopSelection');
  const [isEditMaxBalance, setIsEditMaxBalance] = useState<boolean>(true);      // 最高余额是否可编辑
  
  // 福利详情展开状态
  const [expandedBenefit, setExpandedBenefit] = useState<'newbie' | 'community' | 'platform' | 'wechat' | 'buxin' | 'joinus' | 'becomemanager' | 'company' | null>(null);
  
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
      if (Math.abs(diff) > 50) { // 滑动超过50px才触发
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
  const [recommendPeriod, setRecommendPeriod] = useState<string>(''); // 周期（天），1-30
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
  const [targetUrl, setTargetUrl] = useState<string>('');
  const hasShownWeChatGuide = useRef(false);

  // 分享弹窗状态
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // 获取分享参数
  const { shareParams, isFromShare, clearShareParams } = useShareParams();

  // 获取当前等级配置
  const levelConfig = currentLevel ? shopLevelsConfig[currentLevel] : null;

  // 选择店铺等级
  const handleSelectLevel = (level: ShopLevel) => {
    clearShareParams(); // 清除分享参数，避免影响后续操作
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

  // 返回店铺等级选择
  const handleBackToLevelSelection = () => {
    setCurrentView('levelSelection');
  };

  // 返回首页（重置所有状态）
  const handleGoHome = () => {
    clearShareParams(); // 清除分享参数
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
    // 注意：不清空comparisonData，保留用户已添加的对比数据
  };

  // 返回进货输入
  const handleBackToStockInput = () => {
    setCurrentView('stockInput');
  };

  // 返回等级详情
  const handleBackToLevelDetails = () => {
    setCurrentView('levelDetails');
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

      // 如果历史最高余额是同步模式，自动更新为进货额度+云店余额的总和
      if (isEditMaxBalance) {
        const newMaxBalance = numValue + cloudBalance;
        setMaxBalance(newMaxBalance);
        setMaxBalanceInputValue(String(newMaxBalance));
        // 验证历史最高余额
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

    // 如果历史最高余额是同步模式，自动更新为进货额度+云店余额的总和
    if (isEditMaxBalance) {
      const newMaxBalance = stockAmount + numValue;
      setMaxBalance(newMaxBalance);
      setMaxBalanceInputValue(String(newMaxBalance));
      // 验证历史最高余额
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
      // 自动设置为进货额度+云店余额的总和
      const newMaxBalance = stockAmount + cloudBalance;
      setMaxBalance(newMaxBalance);
      setMaxBalanceInputValue(String(newMaxBalance));
      // 验证历史最高余额
      const maxValidation = validateMaxBalance(newMaxBalance, stockAmount, cloudBalance);
      if (!maxValidation.valid) {
        setMaxBalanceError(maxValidation.error || '');
      } else {
        setMaxBalanceError('');
      }
    } else {
      // 取消勾选时，保持当前值，允许任意输入
      setMaxBalanceError('');
    }
  };

  // 确认进货
  const handleConfirmStock = useCallback(() => {
    if (!currentLevel || !levelConfig) return;

    let isValid = true;

    // 验证进货额度
    if (stockInputValue) {
      const numValue = parseInt(stockInputValue) || 0;
      const stockValidation = validateStockAmount(numValue, levelConfig);
      if (!stockValidation.valid) {
        setStockError(stockValidation.error || '');
        isValid = false;
      } else {
        setStockError('');
      }
    }

    // 验证云店余额（无论是否同步模式，都进行验证）
    if (cloudBalanceInputValue) {
      const numValue = parseInt(cloudBalanceInputValue) || 0;
      const cloudBalanceValidation = validateCloudBalance(numValue, stockAmount);
      if (!cloudBalanceValidation.valid) {
        setCloudBalanceError(cloudBalanceValidation.error || '');
        isValid = false;
      } else {
        setCloudBalanceError('');
      }
    }

    // 确保至少有进货额度或云店余额之一
    if (stockAmount === 0 && cloudBalance === 0) {
      setStockError('请输入进货额度或云店余额');
      isValid = false;
    }

    if (!isValid) {
      // 触发闪烁动画
      if (stockError) triggerShake(setIsStockShaking);
      if (cloudBalanceError) triggerShake(setIsCloudBalanceShaking);
      if (maxBalanceError) triggerShake(setIsMaxBalanceShaking);
      return;
    }

    // 确定最终的历史最高余额：如果用户没有手动修改（即处于同步模式或默认值），则自动设置为进货额度+云店余额
    let finalMaxBalance = maxBalance;
    if (isEditMaxBalance) {
      finalMaxBalance = stockAmount + cloudBalance;
      setMaxBalance(finalMaxBalance);
      setMaxBalanceInputValue(String(finalMaxBalance));
    }

    // 验证最终的历史最高余额
    const maxBalanceValidation = validateMaxBalance(finalMaxBalance, stockAmount, cloudBalance);
    if (!maxBalanceValidation.valid) {
      setMaxBalanceError(maxBalanceValidation.error || '');
      triggerShake(setIsMaxBalanceShaking);
      return;
    }

    // 云店总余额 = 进货额度 + 云店余额，用于销售数据和总利润计算
    const cloudTotalBalance = stockAmount + cloudBalance;

    // 计算基准：用于进货成本计算，优先使用进货额度，如果没有则使用云店余额
    const calculationBalance = stockAmount > 0 ? stockAmount : cloudBalance;

    // 生成销售数据（基于云店总余额）
    const dailyCommission = Math.round(finalMaxBalance * levelConfig.commissionRate);
    const dailyProfit = dailyCommission * (levelConfig.saleDiscount - levelConfig.stockDiscount);
    const data = generateSalesData(cloudTotalBalance, dailyCommission, dailyProfit);
    setSalesData(data);

    setCurrentComparisonId(null);
    setCurrentView('levelDetails');
  }, [currentLevel, levelConfig, stockInputValue, cloudBalance, stockAmount, maxBalance, isEditMaxBalance, stockError, cloudBalanceError, maxBalanceError]);

  // 处理云店余额输入框的 Enter 键
  const handleCloudBalanceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      stockAmountRef.current?.focus();
    }
  };

  // 处理进货额度输入框的 Enter 键
  const handleStockAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      // 如果历史最高余额自动同步（不可编辑），直接确认进货
      if (isEditMaxBalance) {
        handleConfirmStock();
      } else {
        // 否则切换到历史最高余额输入框
        maxBalanceRef.current?.focus();
      }
    }
  };

  // 处理历史最高余额输入框的 Enter 键
  const handleMaxBalanceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleConfirmStock();
    }
  };
  
  // 处理推荐系统预算输入框的 Enter 键
  const handleRecommendBudgetKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      recommendPeriodRef.current?.focus();
    }
  };
  
  // 处理推荐系统周期输入框的 Enter 键
  const handleRecommendPeriodKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleRecommend();
    }
  };
  
  // 处理推荐系统利润输入框的 Enter 键
  const handleRecommendProfitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleRecommend();
    }
  };

  // 加入对比
  const handleAddToComparison = useCallback(() => {
    if (!currentLevel || !levelConfig) return;

    // 检查是否已存在对比数据，如果存在则必须进货额度相同
    if (comparisonData.length > 0) {
      const firstStockAmount = comparisonData[0].stockAmount;
      if (stockAmount !== firstStockAmount) {
        // 提示用户只能加入相同进货额度的数据
        alert('只能加入相同进货额度的数据进行对比');
        return;
      }
    }

    // 计算基准：数据对比页面所有计算都基于进货额度
    const calculationBalance = stockAmount > 0 ? stockAmount : cloudBalance;

    // 数据对比页面：每日代缴额度也基于进货额度计算
    const dailyCommission = Math.round(calculationBalance * levelConfig.commissionRate);
    const stockCost = Math.round(calculationBalance * levelConfig.stockDiscount);
    const completionDays = Math.ceil(calculationBalance / dailyCommission);
    const totalProfit = Math.round(calculationBalance * (levelConfig.saleDiscount - levelConfig.stockDiscount));

    const newComparison: ComparisonData = {
      id: Date.now().toString(),
      level: currentLevel,
      levelName: levelConfig.name,
      stockAmount: stockAmount,
      cloudBalance: cloudBalance,
      maxBalance: maxBalance,
      stockCost: stockCost,
      dailyCommission: dailyCommission,
      completionDays: completionDays,
      totalProfit: totalProfit,
      createdAt: new Date().toLocaleString('zh-CN')
    };

    setComparisonData(prev => [...prev, newComparison]);
    setCurrentComparisonId(newComparison.id);
  }, [currentLevel, levelConfig, cloudBalance, stockAmount, maxBalance, comparisonData]);

  // 查看对比
  const handleViewComparison = () => {
    setCurrentView('comparison');
  };

  // 查看福利介绍
  const handleViewBenefits = () => {
    setCurrentView('benefits');
    setExpandedBenefit(null); // 重置展开状态
  };

  // 查看项目介绍
  const handleViewProject = () => {
    setCurrentView('project');
    setExpandedBenefit(null); // 重置展开状态
  };

  // 查看公告
  const handleViewAnnouncement = () => {
    alert('公告功能开发中...');
  };

  // 删除对比数据
  const handleDeleteComparison = (id: string) => {
    setComparisonData(prev => prev.filter(item => item.id !== id));
    if (currentComparisonId === id) {
      setCurrentComparisonId(null);
    }
  };

  // 清空所有对比数据
  const handleClearComparison = () => {
    setComparisonData([]);
    setCurrentComparisonId(null);
  };

  // 查看销售详情
  const handleViewSalesDetails = () => {
    setCurrentView('salesDetails');
  };

  // 计算详情数据
  const getDetailsData = () => {
    if (!levelConfig) return null;

    // 计算基准：用于进货成本计算，优先使用进货额度，如果没有则使用云店余额
    const calculationBalance = stockAmount > 0 ? stockAmount : cloudBalance;

    // 云店总余额 = 进货额度 + 云店余额，用于销售数据和总利润计算
    const cloudTotalBalance = stockAmount + cloudBalance;

    const stockCost = Math.round(calculationBalance * levelConfig.stockDiscount);
    const dailyCommission = Math.round(maxBalance * levelConfig.commissionRate);
    const completionDays = Math.ceil(cloudTotalBalance / dailyCommission);
    const totalProfit = Math.round(cloudTotalBalance * (levelConfig.saleDiscount - levelConfig.stockDiscount));

    return { stockCost, dailyCommission, completionDays, totalProfit, cloudTotalBalance, calculationBalance };
  };

  const detailsData = getDetailsData();

  // 计算总利润最高的方案
  const maxProfitId = useMemo(() => {
    if (comparisonData.length === 0) return null;
    
    const maxProfit = Math.max(...comparisonData.map(d => d.totalProfit));
    const maxItem = comparisonData.find(d => d.totalProfit === maxProfit);
    return maxItem?.id || null;
  }, [comparisonData]);

  // 计算最低利润
  const minProfitId = useMemo(() => {
    if (comparisonData.length === 0) return null;
    
    const minProfit = Math.min(...comparisonData.map(d => d.totalProfit));
    const minItem = comparisonData.find(d => d.totalProfit === minProfit);
    return minItem?.id || null;
  }, [comparisonData]);

  // 计算利润分析数据
  const profitAnalysis = useMemo(() => {
    if (comparisonData.length === 0) return null;
    
    const maxProfit = Math.max(...comparisonData.map(d => d.totalProfit));
    const minProfit = Math.min(...comparisonData.map(d => d.totalProfit));
    const profitDiff = maxProfit - minProfit;
    const profitDiffRate = minProfit > 0 ? ((maxProfit - minProfit) / minProfit * 100).toFixed(2) : '0.00';
    
    // 找到最低利润的方案
    const minItem = comparisonData.find(d => d.totalProfit === minProfit);
    
    return {
      maxProfit,
      minProfit,
      profitDiff,
      profitDiffRate: profitDiffRate + '%',
      profitDiffText: `${profitDiff}元`,
      minLevelName: minItem?.levelName || ''
    };
  }, [comparisonData]);

  // 复利计算函数：根据卖出比例和结算周期计算周期内利润
  // 正确处理结算等待期：库存卖完且无回款时，店铺空转，无利润
  const calculateCompoundProfit = useCallback((
    initialStock: number,
    config: typeof shopLevelsConfig[ShopLevel],
    period: number
  ): number => {
    // 结算周期天数（卖出后10天回款）
    const settlementDays = config.settlementDays;
    // 销售折扣（95折）
    const saleDiscount = config.saleDiscount;
    // 进货折扣
    const stockDiscount = config.stockDiscount;
    // 卖出比例
    const sellRatio = config.sellRatio;

    // 当前剩余库存（可卖出额度）
    let remainingStock = initialStock;

    // 累计利润
    let totalProfit = 0;

    // 回款队列：key是结算日期，value是回款金额
    const settlementQueue: Map<number, number> = new Map();

    // 遍历每一天（从第2天开始卖出）
    for (let day = 2; day <= period + 1; day++) {
      // 步骤1：如果还有库存，当天可以卖出
      // 如果库存卖完且回款还没到账，店铺空转，当天无利润
      if (remainingStock > 0) {
        // 当天最大可卖出额度
        const maxDailySell = initialStock * sellRatio;

        // 实际卖出额度 = min(剩余库存, 每日卖出额度)
        const sellAmount = Math.min(remainingStock, maxDailySell);

        if (sellAmount > 0) {
          // 减少库存
          remainingStock -= sellAmount;

          // 回款 = 卖出额度 × 销售折扣（95折）
          const settlementAmount = sellAmount * saleDiscount;

          // 进货成本 = 卖出额度 × 进货折扣
          const stockCost = sellAmount * stockDiscount;

          // 单日利润 = 回款 - 进货成本（卖出当天就确认利润）
          const dailyProfit = settlementAmount - stockCost;

          // 累计利润
          totalProfit += dailyProfit;

          // 将回款加入结算队列（卖出日+10天结算）
          // 虽然利润当天确认，但回款要10天后才能到账用于进货
          const settlementDay = day + settlementDays;
          const existing = settlementQueue.get(settlementDay) || 0;
          settlementQueue.set(settlementDay, existing + settlementAmount);
        }
      }
      // else: remainingStock === 0 且今天没有回款到账
      // 店铺空转，当天无利润，等待回款到账

      // 步骤2：检查今天是否有回款可以结算
      // 回款到账当天进货，第二天才能卖出
      const todaySettlement = settlementQueue.get(day) || 0;
      if (todaySettlement > 0) {
        // 用回款进货，增加库存（按100的倍数取整）
        const newStock = Math.round(todaySettlement / stockDiscount / 100) * 100;
        if (newStock >= 100) {
          remainingStock += newStock;
        }
      }
    }

    return Math.round(totalProfit);
  }, []);

  // 复利计算函数（带预算）：考虑额度限制、额度释放和回款复利
  // 正确处理结算等待期：库存卖完且无回款时，店铺空转，无利润
  const calculateCompoundProfitWithBudget = useCallback((
    budget: number,
    config: typeof shopLevelsConfig[ShopLevel],
    period: number
  ): { stock: number; profit: number; totalStockCost: number } => {
    // 结算周期天数（卖出后10天回款）
    const settlementDays = config.settlementDays;
    // 销售折扣（95折）
    const saleDiscount = config.saleDiscount;
    // 进货折扣
    const stockDiscount = config.stockDiscount;
    // 卖出比例
    const sellRatio = config.sellRatio;
    // 店铺最高进货额度
    const maxShopStock = config.maxStock;

    // 步骤1：计算初始进货额度（取100倍数）
    let initialStock = Math.round(budget / stockDiscount / 100) * 100;
    // 确保在店铺范围内
    initialStock = Math.max(config.minStock, Math.min(maxShopStock, initialStock));

    // 计算初始进货成本
    let stockCost = Math.round(initialStock * stockDiscount);
    
    // 如果成本超过预算，减少进货额度
    while (stockCost > budget && initialStock > config.minStock) {
      initialStock -= 100;
      stockCost = Math.round(initialStock * stockDiscount);
    }

    // 剩余预算
    let remainingBudget = budget - stockCost;

    // 累计整个周期的进货成本
    let totalStockCost = stockCost;

    // 当前库存（可卖出额度）
    let currentStock = initialStock;

    // 累计利润
    let totalProfit = 0;

    // 累计回款（尚未用于进货的回款）
    let accumulatedSettlement = 0;

    // 可用于进货的利润（从totalProfit中分出来用于进货的部分）
    let availableProfitForStock = 0;

    // 回款队列：key是结算日期，value是回款金额
    const settlementQueue: Map<number, number> = new Map();

    // 遍历每一天（从第2天开始卖出）
    for (let day = 2; day <= period + 1; day++) {
      // 步骤1：如果还有库存，当天可以卖出
      // 如果库存卖完且今天没有回款到账，店铺空转，当天无利润
      if (currentStock > 0) {
        // 每日卖出额度 = 店铺历史最高余额 × 代缴比例
        const dailySellAmount = maxShopStock * sellRatio;

        // 实际卖出额度 = min(当前库存, 每日卖出额度)
        const sellAmount = Math.min(currentStock, dailySellAmount);

        if (sellAmount > 0) {
          // 减少库存（释放额度）
          currentStock -= sellAmount;

          // 回款 = 卖出额度 × 销售折扣（95折）
          const settlementAmount = sellAmount * saleDiscount;

          // 进货成本 = 卖出额度 × 进货折扣
          const stockCost = sellAmount * stockDiscount;

          // 单日利润 = 回款 - 进货成本（卖出当天就确认利润）
          const dailyProfit = settlementAmount - stockCost;

          // 累计利润
          totalProfit += dailyProfit;

          // 将回款加入结算队列（卖出日+10天结算）
          // 虽然利润当天确认，但回款要10天后才能到账用于进货
          const settlementDay = day + settlementDays;
          const existing = settlementQueue.get(settlementDay) || 0;
          settlementQueue.set(settlementDay, existing + settlementAmount);
        }
      }
      // else: currentStock === 0 且今天没有回款到账
      // 店铺空转，当天无利润，等待回款到账

      // 步骤2：检查今天是否有回款可以结算
      // 回款到账后存入累计回款池，不立即进货
      const todaySettlement = settlementQueue.get(day) || 0;
      if (todaySettlement > 0) {
        accumulatedSettlement += todaySettlement;
      }

      // 步骤3：进货逻辑（使用剩余预算 + 累计回款 + 可用利润）
      // 每日卖出额度 = 店铺历史最高余额 × 代缴比例
      const dailySellAmount = maxShopStock * sellRatio;

      if (currentStock === 0) {
        // 库存为0，需要判断是预算不足（有空档期）还是预算够多（无空档期）
        // 可用资金 = 剩余预算 + 累计回款 + 可用利润
        let availableFunds = remainingBudget + accumulatedSettlement + availableProfitForStock;

        // 如果剩余预算够补货（或者已经有累计回款），说明是预算够多的情况
        // 如果没有剩余预算也没有累计回款，只能用利润，说明是预算不足有空档期
        const hasBudgetOrSettlement = remainingBudget > 0 || accumulatedSettlement > 0;

        if (availableFunds >= 100 * stockDiscount) {
          // 计算能进货的额度（100的倍数）
          let stockToBuy = Math.floor(availableFunds / stockDiscount / 100) * 100;

          if (stockToBuy >= 100) {
            if (hasBudgetOrSettlement) {
              // 预算够多（无空档期）：只补货到刚好够第二天卖的额度
              // 需要补货的数量 = 每日要卖的
              stockToBuy = Math.min(stockToBuy, Math.ceil(dailySellAmount / 100) * 100);
            } else {
              // 预算不足（有空档期）：尽可能多进货，实现利滚利
              // 最多进货到 maxShopStock
              stockToBuy = Math.min(stockToBuy, maxShopStock);
            }

            // 进货成本
            const stockCost = Math.round(stockToBuy * stockDiscount);

            if (hasBudgetOrSettlement) {
              // 预算够多的情况：优先使用累计回款，不用剩余预算
              // 这样实际进货成本只包含初始进货的成本
              let settlementToUse = Math.min(accumulatedSettlement, stockCost);
              accumulatedSettlement -= settlementToUse;

              // 如果回款不够，再用剩余预算
              let budgetToUse = stockCost - settlementToUse;
              if (budgetToUse > 0) {
                budgetToUse = Math.min(remainingBudget, budgetToUse);
                remainingBudget -= budgetToUse;
                totalStockCost += budgetToUse; // 只计入用户实际掏的钱
              }

              // 如果还不够，用可用利润
              let profitToUse = stockCost - settlementToUse - budgetToUse;
              availableProfitForStock -= profitToUse; // 减少可用利润，但不影响累计利润
            } else {
              // 预算不足（有空档期）的情况：优先使用利润，再用剩余预算
              // 先用可用利润（不影响totalProfit的累计）
              let profitToUse = Math.min(availableProfitForStock, stockCost);
              availableProfitForStock -= profitToUse;

              // 再用剩余预算
              let budgetToUse = Math.min(remainingBudget, stockCost - profitToUse);
              remainingBudget -= budgetToUse;
              totalStockCost += budgetToUse; // 只计入用户实际掏的钱

              // 最后用累计回款
              let settlementToUse = stockCost - profitToUse - budgetToUse;
              accumulatedSettlement -= settlementToUse;
            }

            // 进货
            currentStock += stockToBuy;
          }
        }
        // else：资金不够，无法进货，店铺空转
      } else if (currentStock < dailySellAmount) {
        // 没有空档期但库存不足（预算够多的情况）：
        // 只补货到刚好够第二天卖的额度，达到循环后不再增加利润
        // 需要补货的数量 = 每日要卖的 - 当前库存
        const stockNeeded = dailySellAmount - currentStock;
        // 向上取整到100的倍数
        const roundedStockNeeded = Math.ceil(stockNeeded / 100) * 100;

        // 计算进货成本
        const stockCostNeeded = Math.round(roundedStockNeeded * stockDiscount);

        // 可用资金 = 剩余预算 + 累计回款 + 可用利润
        let availableFunds = remainingBudget + accumulatedSettlement + availableProfitForStock;

        if (availableFunds >= stockCostNeeded) {
          // 优先使用累计回款，不用剩余预算
          // 这样实际进货成本只包含初始进货的成本
          let settlementToUse = Math.min(accumulatedSettlement, stockCostNeeded);
          accumulatedSettlement -= settlementToUse;

          // 如果回款不够，再用剩余预算
          let budgetToUse = stockCostNeeded - settlementToUse;
          if (budgetToUse > 0) {
            budgetToUse = Math.min(remainingBudget, budgetToUse);
            remainingBudget -= budgetToUse;
            totalStockCost += budgetToUse; // 只计入用户实际掏的钱
          }

          // 如果还不够，用可用利润
          let profitToUse = stockCostNeeded - settlementToUse - budgetToUse;
          availableProfitForStock -= profitToUse; // 减少可用利润，但不影响累计利润

          // 补货到刚好够第二天卖的额度
          currentStock += roundedStockNeeded;
        }
        // else：资金不够，无法进货，店铺空转
      }
      // else：库存足够第二天卖，不进货（达到循环状态）
    }

    return {
      stock: initialStock,
      profit: Math.round(totalProfit),
      totalStockCost: Math.round(totalStockCost)
    };
  }, []);

  // 推荐算法：根据预算或期望利润计算推荐方案
  const generateRecommendations = useCallback((): RecommendationResult[] => {
    let results: RecommendationResult[] = [];
    const targetBudget = recommendInputType === 'budget' ? parseInt(recommendBudget) || 0 : 0;
    const targetProfit = recommendInputType === 'profit' ? parseInt(recommendProfit) || 0 : 0;
    const period = parseInt(recommendPeriod) || 0; // 周期天数，0表示不考虑周期

    // 如果是按利润推荐，计算目标利润范围（不能低于期望利润，可以高0-19元）
    const targetProfitMin = targetProfit; // 不能低于期望利润
    const targetProfitMax = targetProfit + 19; // 最多高19元

    // 遍历所有店铺等级，计算推荐方案
    for (const [level, config] of Object.entries(shopLevelsConfig) as [ShopLevel, typeof shopLevelsConfig[ShopLevel]][]) {
      // 计算该等级在最低和最高进货额度下的利润范围
      const minStock = config.minStock;
      const maxStock = config.maxStock;
      
      // 最低进货额度的情况
      const minStockCost = Math.round(minStock * config.stockDiscount);
      const minDailyCommission = Math.round(minStock * config.commissionRate);
      const minCompletionDays = Math.ceil(minStock / minDailyCommission);
      const minProfit = Math.round(minStock * (config.saleDiscount - config.stockDiscount));
      
      // 最高进货额度的情况
      const maxStockCost = Math.round(maxStock * config.stockDiscount);
      const maxDailyCommission = Math.round(maxStock * config.commissionRate);
      const maxCompletionDays = Math.ceil(maxStock / maxDailyCommission);
      const maxProfit = Math.round(maxStock * (config.saleDiscount - config.stockDiscount));

      // 根据输入类型计算推荐方案
      let recommendedStock: number;
      let estimatedProfit: number;
      let matchScore: number;
      let matchReason: string;

      if (recommendInputType === 'budget') {
        // 根据预算推荐（必须提供周期）
        if (targetBudget < 100 || targetBudget > 100000) continue;
        if (period < 1 || period > 30) continue;

        let stockCost: number;
        let dailyCommission: number;
        let completionDays: number;

        // 考虑周期的推荐 - 使用带预算的复利计算
        // 新算法：考虑初始进货后剩余预算的利用
        const result = calculateCompoundProfitWithBudget(targetBudget, config, period);
        recommendedStock = result.stock;
        estimatedProfit = result.profit;
        stockCost = Math.round(recommendedStock * config.stockDiscount);

        // 完成天数（显示用户输入的周期天数）
        dailyCommission = Math.round(recommendedStock * config.commissionRate);
        completionDays = period; // 直接使用用户输入的周期天数

        // 匹配度稍后在所有结果计算完后统一重新计算（基于利润最大化）
        matchScore = 0; // 临时值，会被覆盖
        matchReason = `周期${period}天复利利润${estimatedProfit}元（实际投入总成本${result.totalStockCost}元）`;

        results.push({
          level,
          levelName: config.name,
          recommendedStock,
          stockCost,
          estimatedProfit,
          completionDays,
          matchScore: Math.round(matchScore * 100) / 100,
          matchReason,
          maxProfit,
          minProfit
        });
      } else {
        // 根据期望利润推荐（新算法：寻找最低成本、最短周期的方案）
        // 自动遍历周期（5-30天），不需要用户输入周期
        // 每个等级只保留一个最优方案
        if (targetProfit <= 0) continue;

        // 存储该等级的最优方案
        let bestResult: RecommendationResult | null = null;

        // 遍历所有进货额度（100倍数递增）
        for (let stock = config.minStock; stock <= config.maxStock; stock += 100) {
          // 计算单次销售利润（不是复利计算）
          const profit = Math.round(stock * (config.saleDiscount - config.stockDiscount));
          const stockCost = Math.round(stock * config.stockDiscount);
          const dailyCommission = Math.round(stock * config.commissionRate);
          const completionDays = Math.ceil(stock / dailyCommission); // 单次销售完成天数

          // 检查利润是否在目标利润范围内（630-649元）
          if (profit >= targetProfitMin && profit <= targetProfitMax) {
            // 如果还没有找到方案，或者当前方案比之前的方案更优
            // 优先级1：成本最低
            // 优先级2：周期最短
            if (bestResult === null ||
                stockCost < bestResult.stockCost ||
                (stockCost === bestResult.stockCost && completionDays < bestResult.completionDays)) {
              bestResult = {
                level,
                levelName: config.name,
                recommendedStock: stock,
                stockCost,
                estimatedProfit: profit,
                completionDays,
                matchScore: 0, // 稍后统一计算
                matchReason: `单次利润${profit}元`,
                maxProfit,
                minProfit
              };
            }
          }
        }

        // 只添加该等级的最优方案
        if (bestResult !== null) {
          results.push(bestResult);
        }
      }
    }

    // 重新计算推荐率和排序
    if (results.length > 0) {
      if (recommendInputType === 'budget') {
        // 按预算推荐：基于利润最大化
        // 找到全局最大利润
        const maxGlobalProfit = Math.max(...results.map(r => r.estimatedProfit));

        // 重新计算每个结果的推荐率：当前利润 / 全局最大利润
        results = results.map(result => ({
          ...result,
          matchScore: maxGlobalProfit > 0 ? Math.round((result.estimatedProfit / maxGlobalProfit) * 100) : 0
        }));

        // 按推荐率（利润）排序
        results = results.sort((a, b) => b.matchScore - a.matchScore);
      } else {
        // 按利润推荐：基于成本和周期的综合评分
        // 先按成本排序（最低优先），再按周期排序（最短优先）
        const minCost = Math.min(...results.map(r => r.stockCost));
        const minPeriod = Math.min(...results.map(r => r.completionDays));

        // 重新计算每个结果的推荐率
        results = results.map(result => {
          // 成本得分：最低成本得100分
          const costScore = minCost > 0 ? (minCost / result.stockCost) * 100 : 0;

          // 周期得分：最短周期得100分
          const periodScore = minPeriod > 0 ? (minPeriod / result.completionDays) * 100 : 0;

          // 综合得分 = 成本得分×0.6 + 周期得分×0.4
          const totalScore = costScore * 0.6 + periodScore * 0.4;

          return {
            ...result,
            matchScore: Math.round(totalScore * 100) / 100
          };
        });

        // 先按成本排序（最低优先），再按周期排序（最短优先），最后按推荐率排序
        results = results.sort((a, b) => {
          if (a.stockCost !== b.stockCost) {
            return a.stockCost - b.stockCost;
          }
          if (a.completionDays !== b.completionDays) {
            return a.completionDays - b.completionDays;
          }
          return b.matchScore - a.matchScore;
        });
      }
    }

    return results;
  }, [recommendInputType, recommendBudget, recommendProfit, recommendPeriod, calculateCompoundProfit, calculateCompoundProfitWithBudget]);

  // 触发闪烁动画
  const triggerShake = (setter: (value: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 500);
  };

  // 验证推荐输入
  const validateRecommendInputs = useCallback((): boolean => {
    let isValid = true;
    
    if (recommendInputType === 'budget') {
      // 验证预算
      const budget = parseInt(recommendBudget) || 0;
      if (!recommendBudget || budget < 100 || budget > 100000) {
        setBudgetError('预算必须在100-100000元之间');
        isValid = false;
      } else {
        setBudgetError('');
      }
      
      // 验证周期
      const period = parseInt(recommendPeriod) || 0;
      if (!recommendPeriod || period < 1 || period > 30) {
        setPeriodError('周期必须在1-30天之间');
        isValid = false;
      } else {
        setPeriodError('');
      }
    } else {
      // 验证期望利润
      const profit = parseInt(recommendProfit) || 0;
      if (!recommendProfit || profit < 7 || profit > 9100) {
        setProfitError('期望利润必须在7-9100元之间');
        isValid = false;
      } else {
        setProfitError('');
      }
    }
    
    return isValid;
  }, [recommendInputType, recommendBudget, recommendPeriod, recommendProfit]);

  // 处理推荐查询
  const handleRecommend = useCallback(() => {
    // 先验证输入
    const isValid = validateRecommendInputs();
    
    if (!isValid) {
      // 触发闪烁动画
      if (recommendInputType === 'budget') {
        if (budgetError) triggerShake(setIsBudgetShaking);
        if (periodError) triggerShake(setIsPeriodShaking);
      } else {
        if (profitError) triggerShake(setIsProfitShaking);
      }
      return;
    }
    
    const results = generateRecommendations();
    setRecommendResults(results);
    setCurrentView('recommendationResult');
  }, [validateRecommendInputs, budgetError, periodError, profitError, recommendInputType, generateRecommendations]);

  // 选择推荐方案
  const handleSelectRecommendation = useCallback((result: RecommendationResult) => {
    const level = result.level;
    const config = shopLevelsConfig[level];
    
    setCurrentLevel(level);
    setStockAmount(result.recommendedStock);
    setStockInputValue(String(result.recommendedStock));
    setCloudBalance(result.recommendedStock);
    setCloudBalanceInputValue(String(result.recommendedStock));
    setMaxBalance(result.recommendedStock);
    setMaxBalanceInputValue(String(result.recommendedStock));
    setIsEditMaxBalance(true);
    
    // 直接进入确认流程
    const stockCost = Math.round(result.recommendedStock * config.stockDiscount);
    const dailyCommission = Math.round(result.recommendedStock * config.commissionRate);
    const dailyProfit = dailyCommission * (config.saleDiscount - config.stockDiscount);
    const data = generateSalesData(result.recommendedStock, dailyCommission, dailyProfit);
    setSalesData(data);
    setCurrentView('levelDetails');
    setCurrentComparisonId(null);
  }, []);

  // 检测是否在微信中
  const isWeChat = () => {
    return /micromessenger/i.test(navigator.userAgent);
  };

  // 打开链接
  const openLink = (url: string) => {
    // 检测是否在微信中打开
    const isWeChatBrowser = /micromessenger/i.test(navigator.userAgent);

    if (isWeChatBrowser) {
      // 在微信中，设置目标URL并显示引导弹窗
      setTargetUrl(url);
      setShowWeChatLinkGuide(true);
      // 更新URL参数，以便在浏览器打开后能检测到
      const target = encodeURIComponent(url);
      const newUrl = `${window.location.origin}/?target=${target}`;
      window.history.replaceState({}, '', newUrl);
    } else {
      // 在浏览器中，直接打开链接
      window.open(url, '_blank');
    }
  };
  
  // 关闭微信链接引导
  const handleCloseWeChatLinkGuide = () => {
    setShowWeChatLinkGuide(false);
    // 清除target参数，避免重复显示
    const url = new URL(window.location.href);
    url.searchParams.delete('target');
    window.history.replaceState({}, '', url.toString());
  };

  // 处理分享参数
  useEffect(() => {
    if (isFromShare && shareParams) {
      if (shareParams.level && Object.keys(shopLevelsConfig).includes(shareParams.level)) {
        setCurrentLevel(shareParams.level as ShopLevel);
        setCurrentView('levelDetails');
        
        if (shareParams.stock !== undefined) {
          setStockInputValue(String(shareParams.stock));
          setStockAmount(shareParams.stock);
        }
        
        if (shareParams.balance !== undefined) {
          setCloudBalanceInputValue(String(shareParams.balance));
          setCloudBalance(shareParams.balance);
        }
        
        if (shareParams.max !== undefined) {
          setMaxBalanceInputValue(String(shareParams.max));
          setMaxBalance(shareParams.max);
          setIsEditMaxBalance(false);
        }
        
        // 重新计算销售数据
        const config = shopLevelsConfig[shareParams.level as ShopLevel];
        if (config) {
          const cloudTotalBalance = (shareParams.stock || 0) + (shareParams.balance || 0);
          const dailyCommission = Math.round((shareParams.max || cloudTotalBalance) * config.commissionRate);
          const dailyProfit = dailyCommission * (config.saleDiscount - config.stockDiscount);
          const data = generateSalesData(cloudTotalBalance, dailyCommission, dailyProfit);
          setSalesData(data);
        }
      }
    }
  }, [isFromShare, shareParams]);

  // 处理目标链接跳转（用于微信环境检测和浏览器自动跳转）
  useEffect(() => {
    // 检查是否有分享参数，如果有分享参数，不执行处理（分享功能优先）
    const params = new URLSearchParams(window.location.search);
    const hasShareParams = params.get('level') || params.get('stock') || params.get('balance') || params.get('max') || params.get('profit');
    const target = params.get('target');

    // 只有当有 target 参数且没有分享参数时才处理
    if (target && !hasShareParams) {
      // 保存目标URL
      const targetUrl = decodeURIComponent(target);
      setTargetUrl(targetUrl);

      // 检测是否在微信中
      const isWeChatBrowser = /micromessenger/i.test(navigator.userAgent);

      if (isWeChatBrowser) {
        // 在微信中，显示引导页面（只在首次显示）
        if (!hasShownWeChatGuide.current) {
          setShowWeChatLinkGuide(true);
          hasShownWeChatGuide.current = true;
        }
        // 注意：不清除target参数，让浏览器打开后可以检测到并跳转
      } else {
        // 不在微信中，延迟跳转到目标链接
        setTimeout(() => {
          window.location.replace(targetUrl);
        }, 100);
      }
    }
  }, []);

  // 处理Enter键（已废弃，改用单个输入框的 onKeyDown 处理）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 不再需要全局处理
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50" onKeyDown={handleKeyDown}>
      {/* 顶部导航栏 */}
      <header className="glass sticky top-0 z-50 shadow-lg shadow-gray-200/50">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 flex justify-between items-center gap-2 sm:gap-4">
          {/* 左侧：应用名称和版本号 */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                云店模拟器
              </h1>
              <span className="text-[10px] sm:text-xs lg:text-sm text-gray-400 font-medium bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text">
                v1.2.5
              </span>
            </div>
          </div>

          {/* 右侧：功能按钮 */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 数据对比 - 仅在有对比数据时显示 */}
            {comparisonData.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewComparison}
                className="touch-feedback text-xs sm:text-sm lg:text-base font-bold h-10 sm:h-11 lg:h-12 px-3 sm:px-4 lg:px-5 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
              >
                数据对比({comparisonData.length})
              </Button>
            )}

            {/* 公告 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAnnouncement}
              className="touch-feedback text-xs sm:text-sm lg:text-base font-bold h-10 sm:h-11 lg:h-12 px-3 sm:px-4 lg:px-5 rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-300"
            >
              公告
            </Button>

            {/* 进入平台 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('platform')}
              className="touch-feedback text-xs sm:text-sm lg:text-base font-bold h-10 sm:h-11 lg:h-12 px-3 sm:px-4 lg:px-5 rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
            >
              进入平台
            </Button>

            {/* 回到首页 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoHome}
              className="touch-feedback text-xs sm:text-sm lg:text-base font-bold h-10 sm:h-11 lg:h-12 px-3 sm:px-4 lg:px-5 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 hover:border-gray-400 hover:shadow-lg hover:shadow-gray-500/20 hover:bg-gradient-to-r hover:from-gray-100 hover:to-slate-100 transition-all duration-300"
            >
              回到首页
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 min-h-[calc(100vh-56px)]">
        {/* 首页菜单 */}
        {currentView === 'shopSelection' && (
          <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
            <Card className="w-full bg-white/90 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0">
              <CardHeader className="pb-3 pt-4 sm:pt-5 px-4 sm:px-6 lg:px-8">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                  功能菜单
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 sm:space-y-3 lg:space-y-4 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-5 lg:pb-7">
                {/* 项目介绍 */}
                <div
                  onClick={handleViewProject}
                  className="group touch-feedback flex items-center p-4 sm:p-5 rounded-xl border-2 border-indigo-200 bg-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  {/* 装饰性背景光晕 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* 图标 */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mr-4 sm:mr-5 shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:shadow-indigo-500/30 transition-all duration-300 relative z-10">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>

                  {/* 标题和说明 */}
                  <div className="flex-1 relative z-10">
                    <h3 className="text-base sm:text-lg font-bold text-indigo-800 mb-1 group-hover:text-indigo-700 transition-colors">项目介绍</h3>
                    <p className="text-xs text-gray-600 sm:hidden">加入我们、公司介绍</p>
                    <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">加入我们、成为店长、公司介绍</p>
                  </div>

                  {/* 箭头图标 */}
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-500 flex-shrink-0 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* 进入平台 */}
                <div
                  onClick={() => setCurrentView('platform')}
                  className="group touch-feedback flex items-center p-4 sm:p-5 rounded-xl border-2 border-green-200 bg-white hover:border-green-400 hover:shadow-lg hover:shadow-green-500/10 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  {/* 装饰性背景光晕 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* 图标 */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-4 sm:mr-5 shadow-lg shadow-green-500/20 group-hover:scale-110 group-hover:shadow-green-500/30 transition-all duration-300 relative z-10">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>

                  {/* 标题和说明 */}
                  <div className="flex-1 relative z-10">
                    <h3 className="text-base sm:text-lg font-bold text-green-800 mb-1 group-hover:text-green-700 transition-colors">进入平台</h3>
                    <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors">登录缴费平台，下载APP</p>
                  </div>

                  {/* 箭头图标 */}
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-500 flex-shrink-0 group-hover:translate-x-1 group-hover:text-green-600 transition-all duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* 模拟进货 */}
                <div
                  onClick={() => setCurrentView('levelSelection')}
                  className="group touch-feedback flex items-center p-4 sm:p-5 rounded-xl border-2 border-blue-200 bg-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  {/* 装饰性背景光晕 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* 图标 */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl mr-4 sm:mr-5 shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:shadow-blue-500/30 transition-all duration-300 relative z-10">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>

                  {/* 标题和说明 */}
                  <div className="flex-1 relative z-10">
                    <h3 className="text-base sm:text-lg font-bold text-blue-800 mb-1 group-hover:text-blue-700 transition-colors">模拟进货</h3>
                    <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors">选择店铺输入进货额度计算利润</p>
                  </div>

                  {/* 箭头图标 */}
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500 flex-shrink-0 group-hover:translate-x-1 group-hover:text-blue-600 transition-all duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* 智能推荐 */}
                <div
                  onClick={() => setCurrentView('recommendation')}
                  className="group touch-feedback flex items-center p-4 sm:p-5 rounded-xl border-2 border-purple-200 bg-white hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  {/* 装饰性背景光晕 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* 图标 */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-4 sm:mr-5 shadow-lg shadow-purple-500/20 group-hover:scale-110 group-hover:shadow-purple-500/30 transition-all duration-300 relative z-10">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>

                  {/* 标题和说明 */}
                  <div className="flex-1 relative z-10">
                    <h3 className="text-base sm:text-lg font-bold text-purple-800 mb-1 group-hover:text-purple-700 transition-colors">智能推荐</h3>
                    <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors">按预算或利润计算指定周期内的利润</p>
                  </div>

                  {/* 箭头图标 */}
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-500 flex-shrink-0 group-hover:translate-x-1 group-hover:text-purple-600 transition-all duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* 福利介绍 */}
                <div
                  onClick={handleViewBenefits}
                  className="group touch-feedback flex items-center p-4 sm:p-5 rounded-xl border-2 border-rose-200 bg-white hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/10 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  {/* 装饰性背景光晕 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* 图标 */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl mr-4 sm:mr-5 shadow-lg shadow-rose-500/20 group-hover:scale-110 group-hover:shadow-rose-500/30 transition-all duration-300 relative z-10">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>

                  {/* 标题和说明 */}
                  <div className="flex-1 relative z-10">
                    <h3 className="text-base sm:text-lg font-bold text-rose-800 mb-1 group-hover:text-rose-700 transition-colors">福利介绍</h3>
                    <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors">查看福利政策和奖励活动</p>
                  </div>

                  {/* 箭头图标 */}
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-rose-500 flex-shrink-0 group-hover:translate-x-1 group-hover:text-rose-600 transition-all duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* 店铺等级 */}
                <div
                  onClick={() => setCurrentView('shopLevels')}
                  className="group touch-feedback flex items-center p-4 sm:p-5 rounded-xl border-2 border-orange-200 bg-white hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/10 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  {/* 装饰性背景光晕 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* 图标 */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl mr-4 sm:mr-5 shadow-lg shadow-orange-500/20 group-hover:scale-110 group-hover:shadow-orange-500/30 transition-all duration-300 relative z-10">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>

                  {/* 标题和说明 */}
                  <div className="flex-1 relative z-10">
                    <h3 className="text-base sm:text-lg font-bold text-orange-800 mb-1 group-hover:text-orange-700 transition-colors">店铺等级</h3>
                    <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors">查看各等级的升级条件和权益</p>
                  </div>

                  {/* 箭头图标 */}
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500 flex-shrink-0 group-hover:translate-x-1 group-hover:text-orange-600 transition-all duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 店铺等级选择 - 模拟进货 */}
        {currentView === 'levelSelection' && (
          <div className="w-full">
            <Card className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <CardHeader className="pb-2.5 sm:pb-3 pt-3 sm:pt-4 lg:pt-5 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={handleBackToShopSelection} className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full w-10 h-10 sm:w-12 sm:h-12">
                    <span className="text-xl sm:text-2xl font-bold">←</span>
                  </Button>
                  <CardTitle className="flex-1 text-center text-base sm:text-lg lg:text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                    请选择你的店铺等级
                  </CardTitle>
                  <div className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5 sm:space-y-3 lg:space-y-4 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-5 lg:pb-7">
                {Object.entries(shopLevelsConfig).map(([level, config]) => {
                  if (!config || !level) return null;
                  return (
                    <div
                      key={level}
                      onClick={() => handleSelectLevel(level as ShopLevel)}
                      className="group touch-feedback flex items-center p-4 sm:p-5 rounded-xl border-2 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
                      style={{
                        borderColor: config.color,
                      }}
                    >
                      {/* 装饰性背景光晕 */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
                        }}
                      />

                      {/* 左侧：店铺名称 */}
                      <div className="w-24 sm:w-28 flex-shrink-0 relative z-10">
                        <h3
                          className="text-sm sm:text-base lg:text-lg font-bold group-hover:scale-105 transition-transform duration-300"
                          style={{
                            color: config.color === '#000000' ? '#1f2937' : config.color,
                            textShadow: '0 0 1px rgba(0,0,0,0.3)',
                          }}
                        >
                          {config.name}
                        </h3>
                      </div>

                      {/* 中间：提示信息（居中） */}
                      <div className="hidden md:flex flex-1 justify-center items-center space-x-1.5 sm:space-x-2 relative z-10">
                        <div className="flex items-center text-xs sm:text-sm bg-white/80 px-2 sm:px-2.5 py-1 rounded-full shadow-sm">
                          <span className="font-bold text-sm sm:text-base lg:text-lg text-green-600">
                            {config.minStock}-{config.maxStock}⚡
                          </span>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm bg-white/80 px-2 sm:px-2.5 py-1 rounded-full shadow-sm">
                          <span className="font-bold text-sm sm:text-base lg:text-lg text-blue-600">
                            {(config.stockDiscount * 10).toFixed(1)}折
                          </span>
                        </div>
                      </div>

                      {/* 移动端：简化信息 */}
                      <div className="md:hidden flex flex-col space-y-1 flex-1 px-2 relative z-10">
                        <div className="text-xs sm:text-sm font-bold text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded-full inline-block">
                          {config.minStock}-{config.maxStock}⚡
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-full inline-block">
                          {(config.stockDiscount * 10).toFixed(1)}折
                        </div>
                      </div>

                      {/* 右侧：箭头图标 */}
                      <svg
                        className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 flex-shrink-0 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300 relative z-10"
                        style={{
                          color: config.color,
                        }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 福利介绍 */}
        {currentView === 'benefits' && (
          <Card className="w-full max-w-4xl mx-auto glass animate-fade-in animate-scale-in shadow-2xl border-0">
            <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToShopSelection}
                  className="touch-feedback w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-all duration-300"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 bg-clip-text text-transparent font-bold">
                  🎁 福利介绍
                </CardTitle>
                <div className="w-10 sm:w-12" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-5 px-4 sm:px-6 pb-5 sm:pb-6">
              {/* 一、新人礼品 */}
              <div className="border-2 border-rose-200 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <button
                  onClick={() => setExpandedBenefit(expandedBenefit === 'newbie' ? null : 'newbie')}
                  className="touch-feedback w-full flex items-center justify-between p-3 sm:p-5 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg shadow-rose-500/20">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm sm:text-base sm:text-lg font-bold text-rose-700">一、新人礼品</h3>
                      <p className="text-xs text-gray-600 sm:hidden">新人专享礼品</p>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">新人专享礼品奖励</p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 sm:w-6 sm:h-6 text-rose-600 transition-transform duration-200 ${expandedBenefit === 'newbie' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedBenefit === 'newbie' && (
                  <div className="p-3 sm:p-5 bg-white border-t border-rose-200 space-y-3 sm:space-y-4">
                    {/* 领取条件 */}
                    <div className="p-3 sm:p-4 bg-rose-50 rounded-xl border-2 border-rose-200">
                      <h4 className="text-sm sm:text-base sm:text-lg font-bold text-rose-700 mb-2 sm:mb-3">
                        领取条件
                        <span className="text-xs sm:text-sm sm:text-base font-semibold text-rose-600 ml-1 sm:ml-2">（满足其中一条即可）</span>
                      </h4>
                      <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm sm:text-base text-gray-700">
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>新人注册完成交过电费</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>新人注册完成开通了云店</span>
                        </li>
                      </ul>
                    </div>

                    {/* 领取方式 */}
                    <div className="p-3 sm:p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                      <h4 className="text-sm sm:text-base sm:text-lg font-bold text-purple-700 mb-2 sm:mb-3">领取方式</h4>
                      <div className="space-y-2 sm:space-y-3">
                        {/* 下载说明 */}
                        <p className="text-xs sm:text-sm sm:text-base text-gray-700 leading-relaxed">
                          在平台上下载安装登录步信添加阿东的步信
                        </p>

                        {/* 步信号 */}
                        <div className="flex items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-lg border border-purple-200">
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 mb-0.5 sm:text-sm sm:mb-1">阿东步信号：</p>
                            <p className="text-base sm:text-lg font-bold text-purple-700 font-mono">G2L07V</p>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('G2L07V');
                              alert('已复制到剪贴板');
                            }}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors touch-feedback flex-shrink-0"
                          >
                            点击复制
                          </button>
                        </div>

                        {/* 添加步骤 */}
                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm sm:text-base text-gray-700">
                          <p className="font-semibold text-purple-700">添加步骤：</p>
                          <ol className="space-y-1 sm:space-y-1.5 ml-3 sm:ml-4 list-decimal">
                            <li>在步信点击右上角的 +</li>
                            <li>点击"添加好友"</li>
                            <li>粘贴已经复制好的步信号</li>
                            <li>点击搜索后完成添加</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* 奖励内容 */}
                    <div className="p-3 sm:p-4 bg-green-50 rounded-xl border-2 border-green-200 flex items-center justify-center">
                      <h4 className="text-sm sm:text-base sm:text-lg font-bold text-green-700 flex items-center">
                        奖励内容：
                        <span className="text-base sm:text-lg sm:text-xl font-bold text-green-600 ml-1 sm:ml-2">价值20元的实物礼品一份（包邮到家）</span>
                      </h4>
                    </div>
                  </div>
                )}
              </div>

              {/* 二、社区福利 */}
              <div className="border-2 border-orange-200 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <button
                  onClick={() => setExpandedBenefit(expandedBenefit === 'community' ? null : 'community')}
                  className="touch-feedback w-full flex items-center justify-between p-3 sm:p-5 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-500/20">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm sm:text-base sm:text-lg font-bold text-orange-700">二、社区福利</h3>
                      <p className="text-xs text-gray-600 sm:hidden">邀请好友开店</p>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">邀请好友开店享多重奖励</p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 sm:w-6 sm:h-6 text-orange-600 transition-transform duration-200 ${expandedBenefit === 'community' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedBenefit === 'community' && (
                  <div className="p-3 sm:p-5 bg-white border-t border-orange-200 space-y-3 sm:space-y-4">
                    {/* 1月个人当天邀请奖励 - 橙色背景 */}
                    <div className="p-3 sm:p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                      <h4 className="text-sm sm:text-base sm:text-lg font-bold text-orange-700 mb-2 sm:mb-3">1月个人当天邀请奖励</h4>
                      <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm sm:text-base text-gray-700">
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>当天邀请第<span className="font-bold text-orange-600">1个</span>开店奖：<span className="font-bold text-green-600">18元</span></span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>当天邀请第<span className="font-bold text-orange-600">2个</span>开店再奖：<span className="font-bold text-green-600">38元</span></span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>当天邀请第<span className="font-bold text-orange-600">3个</span>开店再奖：<span className="font-bold text-green-600">108元</span></span>
                        </li>
                      </ul>
                    </div>

                    {/* 1月个人连续邀请奖励 - 琥珀色背景 */}
                    <div className="p-3 sm:p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                      <h4 className="text-sm sm:text-base sm:text-lg font-bold text-amber-700 mb-2 sm:mb-3">1月个人连续邀请奖励</h4>
                      <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm sm:text-base text-gray-700">
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>连续<span className="font-bold text-amber-600">3天</span>有邀请额外奖励<span className="font-bold text-green-600">68券</span></span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>连续<span className="font-bold text-amber-600">7天</span>有邀请再额外奖励<span className="font-bold text-green-600">168券</span></span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-2 sm:mt-4 p-2.5 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-xs sm:text-sm sm:text-base text-orange-800">
                        <span className="font-semibold">说明：</span>
                        完成邀请 联系 <span className="font-bold text-orange-600">阿东</span> 领奖
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 三、平台福利 */}
              <div className="border-2 border-blue-200 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <button
                  onClick={() => setExpandedBenefit(expandedBenefit === 'platform' ? null : 'platform')}
                  className="touch-feedback w-full flex items-center justify-between p-3 sm:p-5 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/20">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm sm:text-base sm:text-lg font-bold text-blue-700">三、平台福利</h3>
                      <p className="text-xs text-gray-600 sm:hidden">新店主专享奖励</p>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">新店主专享进货奖励</p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 sm:w-6 sm:h-6 text-blue-600 transition-transform duration-200 ${expandedBenefit === 'platform' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedBenefit === 'platform' && (
                  <div className="p-3 sm:p-5 bg-white border-t border-blue-200 space-y-3">
                      <div>
                        <h4 className="text-xs sm:text-sm sm:text-base font-semibold text-blue-700 mb-2 sm:mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></span>
                          1月新店主奖励
                        </h4>
                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm sm:text-base text-gray-700 ml-2 sm:ml-3">
                          <p className="text-gray-600 mb-1.5 sm:mb-2">
                            1月开店的新店主可参与
                          </p>
                          <ul className="space-y-1 sm:space-y-1.5">
                            <li className="flex items-start gap-1.5 sm:gap-2">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span>2月1日前首次同一天进货<span className="font-bold text-blue-600">2500及以上</span>，奖励<span className="font-bold text-green-600">38元</span>复缴券</span>
                            </li>
                            <li className="flex items-start gap-1.5 sm:gap-2">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span>2月1日前累积进货<span className="font-bold text-blue-600">7000及以上</span>，再奖励<span className="font-bold text-green-600">68元</span>复缴券</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs sm:text-sm sm:text-base text-blue-800">
                          <span className="font-semibold">领取奖励：</span>
                          完成要求联系 <span className="font-bold text-blue-600">阿东</span> 登记领取
                        </p>
                      </div>
                    </div>
                )}
              </div>

              {/* 四、微信群每日福利 */}
              <div className="border-2 border-green-200 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <button
                  onClick={() => setExpandedBenefit(expandedBenefit === 'wechat' ? null : 'wechat')}
                  className="touch-feedback w-full flex items-center justify-between p-3 sm:p-5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm sm:text-base sm:text-lg font-bold text-green-700">四、微信群每日福利</h3>
                      <p className="text-xs text-gray-600 sm:hidden">晒图、群抽奖、红包</p>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">晒图活动、群抽奖、红包福利</p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 sm:w-6 sm:h-6 text-green-600 transition-transform duration-200 ${expandedBenefit === 'wechat' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedBenefit === 'wechat' && (
                  <div className="p-3 sm:p-5 bg-white border-t border-green-200 space-y-3 sm:space-y-4">
                    {/* 晒图活动 - 蓝色背景 */}
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <h4 className="text-xs sm:text-sm sm:text-base font-bold text-blue-700 mb-2 sm:mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></span>
                        晒图活动
                      </h4>
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm sm:text-base text-gray-700">
                        <p>当日店铺有成交，即可晒店铺利润图</p>
                        <p>晒图时间：每日 <span className="font-bold text-blue-600">19:00-19:30</span></p>
                        <p>有效规则：利润排名前<span className="font-bold text-blue-600">40</span>记有效<span className="font-bold text-blue-600">1次</span></p>
                        <div className="mt-1.5 sm:mt-2 p-2 sm:p-3 bg-white rounded-lg border border-blue-200">
                          <p className="font-semibold text-blue-700 mb-1 sm:mb-2">惊喜奖励：</p>
                          <p>累计有效晒图<span className="font-bold text-blue-600">3次</span>奖<span className="font-bold text-blue-600">10元复缴券</span></p>
                          <p>当日晒图销冠额外奖<span className="font-bold text-blue-600">10元红包</span></p>
                        </div>
                        <p className="font-semibold text-red-600 mt-1.5 sm:mt-2">重要提醒：仅限晒本人店铺利润图</p>
                      </div>
                    </div>

                    {/* 群抽奖活动 - 紫色背景 */}
                    <div className="p-3 sm:p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                      <h4 className="text-xs sm:text-sm sm:text-base font-bold text-purple-700 mb-2 sm:mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></span>
                        群抽奖活动
                      </h4>
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm sm:text-base text-gray-700">
                        <p>微信群里每天一期免费抽奖</p>
                        <p>一等奖<span className="font-bold text-purple-600">1名</span>，奖励<span className="font-bold text-purple-600">18元</span>现金</p>
                        <p>二等奖<span className="font-bold text-purple-600">5名</span>，奖励<span className="font-bold text-purple-600">8元</span>现金</p>
                        <p>参加抽奖时间：每日 <span className="font-bold text-purple-600">11:00-21:00</span></p>
                        <div className="mt-1.5 sm:mt-2 p-2 sm:p-3 bg-white rounded-lg border border-purple-200">
                          <p className="font-semibold text-purple-700 mb-1 sm:mb-1">领奖说明：</p>
                          <p>中奖后发微信收款码（绿码）领奖</p>
                          <p className="font-semibold text-red-600 mt-1 sm:mt-1">注意：超过当天24点没有发收款码奖励作废</p>
                        </div>
                      </div>
                    </div>

                    {/* 微信群红包 - 橙色背景 */}
                    <div className="p-3 sm:p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                      <h4 className="text-xs sm:text-sm sm:text-base font-bold text-orange-700 mb-2 sm:mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></span>
                        微信群红包
                      </h4>
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm sm:text-base text-gray-700">
                        <p>发放时间：<span className="font-bold text-orange-600">21:30</span></p>
                        <p>红包个数：<span className="font-bold text-orange-600">60个</span></p>
                        <p>红包初始金额：<span className="font-bold text-orange-600">10元</span></p>
                        <p>当天每新增<span className="font-bold text-orange-600">1个</span>店主红包金额增加<span className="font-bold text-orange-600">10元</span></p>
                      </div>
                    </div>

                    {/* 说明 */}
                    <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                      <p className="text-xs sm:text-sm sm:text-base text-yellow-800 text-center font-semibold">
                        说明：以上活动为阿东私人举办的奖励活动
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 五、步信群每日福利 */}
              <div className="border-2 border-purple-200 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <button
                  onClick={() => setExpandedBenefit(expandedBenefit === 'buxin' ? null : 'buxin')}
                  className="touch-feedback w-full flex items-center justify-between p-3 sm:p-5 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/20">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm sm:text-base sm:text-lg font-bold text-purple-700">五、步信群每日福利</h3>
                      <p className="text-xs text-gray-600 sm:hidden">步信红包、签到</p>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">步信红包、签到奖励</p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 sm:w-6 sm:h-6 text-purple-600 transition-transform duration-200 ${expandedBenefit === 'buxin' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedBenefit === 'buxin' && (
                  <div className="p-3 sm:p-5 bg-white border-t border-purple-200 space-y-3 sm:space-y-4">
                    {/* 步信上：太极社区交流群 - 紫色背景 */}
                    <div className="p-3 sm:p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                      <h4 className="text-xs sm:text-sm sm:text-base font-bold text-purple-700 mb-2 sm:mb-3">步信上：太极社区交流群</h4>
                      <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm sm:text-base text-gray-700">
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>每天会发<span className="font-bold text-purple-600">2次</span>红包</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>第一次：<span className="font-bold text-purple-600">15:00</span></span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>第二次：<span className="font-bold text-purple-600">19:40</span></span>
                        </li>
                      </ul>
                    </div>

                    {/* 步信APP签到奖励 - 粉色背景 */}
                    <div className="p-3 sm:p-4 bg-pink-50 rounded-xl border-2 border-pink-200">
                      <h4 className="text-xs sm:text-sm sm:text-base font-bold text-pink-700 mb-2 sm:mb-3">步信APP签到奖励</h4>
                      <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm sm:text-base text-gray-700">
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>平均每天<span className="font-bold text-pink-600">5元</span></span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>每天<span className="font-bold text-pink-600">19:40</span>步信群查看如何进入课程和签到流程</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 项目介绍 */}
        {currentView === 'project' && (
          <Card className="w-full max-w-4xl mx-auto glass animate-fade-in animate-scale-in shadow-2xl border-0">
            <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToShopSelection}
                  className="touch-feedback w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-300"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                    项目介绍
                  </CardTitle>
                </div>
                <div className="w-10 sm:w-12" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-5 px-4 sm:px-6 pb-5 sm:pb-6">
              {/* 一、加入我们 */}
              <div className="border-2 border-green-200 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <button
                  onClick={() => setExpandedBenefit(expandedBenefit === 'joinus' ? null : 'joinus')}
                  className="touch-feedback w-full flex items-center justify-between p-3 sm:p-5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm sm:text-base sm:text-lg font-bold text-green-700">一、加入我们</h3>
                      <p className="text-xs text-gray-600 sm:hidden">注册会员福利</p>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">注册成为平台会员，享受专属福利</p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 sm:w-6 sm:h-6 text-green-600 transition-transform duration-200 ${expandedBenefit === 'joinus' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedBenefit === 'joinus' && (
                  <div className="p-3 sm:p-5 bg-white border-t border-green-200">
                    <div className="p-3 sm:p-4 bg-green-50 rounded-xl border-2 border-green-200">
                      <h4 className="text-sm sm:text-base sm:text-lg font-bold text-green-700 mb-2 sm:mb-3">注册成为平台会员</h4>
                      <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm sm:text-base text-gray-700">
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>永久享受<span className="font-bold text-green-600">95折</span>缴电费</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>首次缴费完成领<span className="font-bold text-green-600">20元</span>实物礼品（包邮到家）</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* 二、成为店长 */}
              <div className="border-2 border-blue-200 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <button
                  onClick={() => setExpandedBenefit(expandedBenefit === 'becomemanager' ? null : 'becomemanager')}
                  className="touch-feedback w-full flex items-center justify-between p-3 sm:p-5 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/20">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm sm:text-base sm:text-lg font-bold text-blue-700">二、成为店长</h3>
                      <p className="text-xs text-gray-600 sm:hidden">开通云店福利</p>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">开通云店，开启赚钱之旅</p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 sm:w-6 sm:h-6 text-blue-600 transition-transform duration-200 ${expandedBenefit === 'becomemanager' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedBenefit === 'becomemanager' && (
                  <div className="p-3 sm:p-5 bg-white border-t border-blue-200">
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <h4 className="text-sm sm:text-base sm:text-lg font-bold text-blue-700 mb-2 sm:mb-3">开通云店</h4>
                      <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm sm:text-base text-gray-700">
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>首次开通云店享<span className="font-bold text-blue-600">90折</span>进货<span className="font-bold text-blue-600">500</span>电费额度</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>使用新人<span className="font-bold text-blue-600">18元</span>云店抵用券实付<span className="font-bold text-green-600">432元</span></span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>系统自动派单销售，<span className="font-bold text-blue-600">3天</span>即可销售完成</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span><span className="font-bold text-blue-600">95折</span>销售，销售结算完成收入<span className="font-bold text-green-600">475元</span></span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>可提现、可复投、可给家里户号缴费</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* 三、公司介绍 */}
              <div className="border-2 border-purple-200 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <button
                  onClick={() => setExpandedBenefit(expandedBenefit === 'company' ? null : 'company')}
                  className="touch-feedback w-full flex items-center justify-between p-3 sm:p-5 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm sm:text-base sm:text-lg font-bold text-purple-700">三、公司介绍</h3>
                      <p className="text-xs text-gray-600 sm:hidden">海南创步科技</p>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">了解我们的公司背景与发展历程</p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 sm:w-6 sm:h-6 text-purple-600 transition-transform duration-200 ${expandedBenefit === 'company' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedBenefit === 'company' && (
                  <div className="p-3 sm:p-5 bg-white border-t border-purple-200 space-y-3 sm:space-y-4">
                    {/* 公司简介 */}
                    <div className="p-3 sm:p-4 bg-purple-50 rounded-xl border-2 border-purple-200 space-y-3 text-xs sm:text-sm sm:text-base text-gray-700 leading-relaxed">
                      <p>
                        　　海南创步科技有限公司，成立于<span className="font-bold text-purple-600">2022年6月9日</span>，位于海南省三沙市，属科技推广和应用服务业。公司聚焦数字生活服务平台研发与运营，核心产品为自主研发的"创缴通"一站式数字缴费平台，整合全国水费、电费、燃气费等生活缴费服务，支持银行卡、第三方支付及HTTPS+RSA加密等多重安全防护机制。
                      </p>
                      <p>
                        　　<span className="font-bold text-purple-600">2025年6月</span>正式上线该平台，并于同年<span className="font-bold text-purple-600">7月</span>获得中海洋盛佳投资控股有限公司<span className="font-bold text-green-600">3200万元</span>人民币A轮融资。平台随后扩展为"生活缴费+本地服务"综合入口，覆盖全国<span className="font-bold text-purple-600">300余个</span>城市。
                      </p>
                      <p>
                        　　<span className="font-bold text-purple-600">2025年12月11日</span>获中国人民保险集团股份有限公司<span className="font-bold text-green-600">1000万</span>产品责任险承保。
                      </p>
                    </div>

                    {/* 愿景 */}
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <h4 className="text-sm sm:text-base sm:text-lg font-bold text-blue-700 mb-2 sm:mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></span>
                        愿景 / VISION
                      </h4>
                      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm sm:text-base text-gray-700">
                        <p className="leading-relaxed">
                          构建中国领先的数字生活服务平台
                        </p>
                        <p className="leading-relaxed">
                          实现"<span className="font-bold text-blue-600">全民云店</span>+<span className="font-bold text-blue-600">本地服务</span>+<span className="font-bold text-blue-600">聚合电商</span>+<span className="font-bold text-blue-600">数字权益</span>"的闭环生态体系
                        </p>
                      </div>
                    </div>

                    {/* 使命 */}
                    <div className="p-3 sm:p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                      <h4 className="text-sm sm:text-base sm:text-lg font-bold text-amber-700 mb-2 sm:mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"></span>
                        使命 / MISSION
                      </h4>
                      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm sm:text-base text-gray-700">
                        <p className="leading-relaxed">
                          成为国民数字服务平台
                        </p>
                        <p className="leading-relaxed">
                          让每一个人在获得<span className="font-bold text-amber-600">高效</span>、<span className="font-bold text-amber-600">便捷</span>、<span className="font-bold text-amber-600">低成本</span>的生活服务的同时
                        </p>
                        <p className="leading-relaxed">
                          实现<span className="font-bold text-green-600">行为价值激励</span>，成为<span className="font-bold text-green-600">股东</span>享受<span className="font-bold text-green-600">终生分红</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 推荐系统输入界面 */}
        {currentView === 'recommendation' && (
          <Card className="w-full max-w-lg mx-auto bg-white/90 backdrop-blur-lg animate-in fade-in-0 slide-in-from-top-4 duration-300 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToShopSelection} className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full w-12 h-12">
                  <span className="text-2xl font-bold">←</span>
                </Button>
                <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🎯 智能推荐系统
                </CardTitle>
                <div className="w-12" />
              </div>
            </CardHeader>
            <CardContent className="space-y-5 sm:space-y-6 px-6 pb-6">
              {/* 选择推荐类型 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">选择推荐方式</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={recommendInputType === 'budget' ? 'default' : 'outline'}
                    onClick={() => setRecommendInputType('budget')}
                    className={`active:scale-95 transition-all duration-200 ${recommendInputType === 'budget' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'hover:border-purple-300'}`}
                  >
                    💰 按预算推荐
                  </Button>
                  <Button
                    variant={recommendInputType === 'profit' ? 'default' : 'outline'}
                    onClick={() => setRecommendInputType('profit')}
                    className={`active:scale-95 transition-all duration-200 ${recommendInputType === 'profit' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'hover:border-purple-300'}`}
                  >
                    📈 按利润推荐
                  </Button>
                </div>
              </div>

              {/* 预算输入 */}
              {recommendInputType === 'budget' && (
                <div className="space-y-2">
                  <Label htmlFor="recommendBudget" className="text-sm font-medium text-gray-700">
                    预算金额（元）
                  </Label>
                  <Input
                    id="recommendBudget"
                    ref={recommendBudgetRef}
                    type="number"
                    placeholder="预算金额（100-100000元）"
                    min="100"
                    max="100000"
                    step="100"
                    value={recommendBudget}
                    onChange={(e) => {
                      setRecommendBudget(e.target.value);
                      const value = parseInt(e.target.value) || 0;
                      if (e.target.value && (value < 100 || value > 100000)) {
                        setBudgetError('预算必须在100-100000元之间');
                      } else if (e.target.value && value >= 100 && value <= 100000) {
                        setBudgetError('');
                      } else if (!e.target.value) {
                        setBudgetError('');
                      }
                    }}
                    onKeyDown={handleRecommendBudgetKeyDown}
                    className={`focus:ring-2 transition-all duration-200 h-12 border-2 ${
                      budgetError
                        ? 'border-red-500 ring-red-500 focus:ring-red-500/50 focus:border-red-500'
                        : 'border-gray-300 focus:ring-purple-500/50 focus:border-purple-500'
                    } ${isBudgetShaking ? 'animate-shake' : ''}`}
                  />
                  <p className={`text-sm transition-colors duration-200 ${budgetError ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                    {budgetError || '预算范围：100-100000元，系统将根据您的预算推荐最合适的店铺等级和进货额度（投入总成本不超过预算）'}
                  </p>
                </div>
              )}

              {/* 期望利润输入 */}
              {recommendInputType === 'profit' && (
                <div className="space-y-2">
                  <Label htmlFor="recommendProfit" className="text-sm font-medium text-gray-700">
                    期望利润（元）
                  </Label>
                  <Input
                    id="recommendProfit"
                    ref={recommendProfitRef}
                    type="number"
                    placeholder="期望利润（7-9100元）"
                    min="7"
                    max="9100"
                    step="1"
                    value={recommendProfit}
                    onChange={(e) => {
                      setRecommendProfit(e.target.value);
                      const value = parseInt(e.target.value) || 0;
                      if (e.target.value && (value < 7 || value > 9100)) {
                        setProfitError('期望利润必须在7-9100元之间');
                      } else if (e.target.value && value >= 7 && value <= 9100) {
                        setProfitError('');
                      } else if (!e.target.value) {
                        setProfitError('');
                      }
                    }}
                    onKeyDown={handleRecommendProfitKeyDown}
                    className={`focus:ring-2 transition-all duration-200 h-12 border-2 ${
                      profitError
                        ? 'border-red-500 ring-red-500 focus:ring-red-500/50 focus:border-red-500'
                        : 'border-gray-300 focus:ring-purple-500/50 focus:border-purple-500'
                    } ${isProfitShaking ? 'animate-shake' : ''}`}
                  />
                  <p className={`text-sm transition-colors duration-200 ${profitError ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                    {profitError || '期望利润范围：7-9100元，系统将根据您的期望利润推荐最合适的店铺等级（利润可浮动0-19元）'}
                  </p>
                </div>
              )}

              {/* 周期输入（仅按预算推荐时显示） */}
              {recommendInputType === 'budget' && (
                <div className="space-y-2">
                  <Label htmlFor="recommendPeriod" className="text-sm font-medium text-gray-700">
                    周期天数 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="recommendPeriod"
                    ref={recommendPeriodRef}
                    type="number"
                    placeholder="周期天数（1-30天）"
                    min="1"
                    max="30"
                    value={recommendPeriod}
                    onChange={(e) => {
                      setRecommendPeriod(e.target.value);
                      const value = parseInt(e.target.value) || 0;
                      if (e.target.value && (value < 1 || value > 30)) {
                        setPeriodError('周期必须在1-30天之间');
                      } else if (e.target.value && value >= 1 && value <= 30) {
                        setPeriodError('');
                      } else if (!e.target.value) {
                        setPeriodError('');
                      }
                    }}
                    onKeyDown={handleRecommendPeriodKeyDown}
                    className={`focus:ring-2 transition-all duration-200 h-12 border-2 ${
                      periodError
                        ? 'border-red-500 ring-red-500 focus:ring-red-500/50 focus:border-red-500'
                        : 'border-gray-300 focus:ring-purple-500/50 focus:border-purple-500'
                    } ${isPeriodShaking ? 'animate-shake' : ''}`}
                  />
                  <p className={`text-sm transition-colors duration-200 ${periodError ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                    {periodError || '周期范围：1-30天，系统将根据周期计算推荐方案（复利计算）'}
                  </p>
                </div>
              )}

              <Button
                className="w-full h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={handleRecommend}
              >
                生成推荐方案 (Enter)
              </Button>

              {/* 使用提示 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 p-4 rounded-xl">
                <h4 className="font-semibold text-purple-800 mb-2 text-sm">💡 使用提示</h4>
                <ul className="text-xs sm:text-sm text-purple-700 space-y-1 list-disc list-inside">
                  <li>按预算推荐：系统会根据您的预算（100-100000元）和周期（1-30天），推荐最匹配的进货额度和店铺等级（复利计算）</li>
                  <li>按利润推荐：系统会基于单次销售利润，推荐最低成本、最短周期的方案（利润可浮动0-19元）</li>
                  <li>周期天数：按预算推荐时必须输入周期天数，推荐结果的完成天数显示为您输入的周期</li>
                  <li>输入验证：输入超出范围时会显示红色提示，点击生成按钮时也会进行验证</li>
                  <li>推荐结果先按成本最低，再按周期最短排序，您可以选择任意方案直接开始模拟</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 推荐结果界面 */}
        {currentView === 'recommendationResult' && (
          <Card className="max-w-4xl mx-auto w-full bg-white/90 backdrop-blur-lg animate-in fade-in-0 slide-in-from-top-4 duration-300 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setCurrentView('recommendation')} className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full w-12 h-12">
                  ←
                </Button>
                <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  智能推荐方案
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentView('recommendation')}
                  className="active:scale-95 transition-all duration-200 hover:shadow-md hover:border-purple-300"
                >
                  重新推荐
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {recommendResults.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-lg sm:text-xl text-gray-600 mb-2">没有找到匹配的方案</p>
                  <p className="text-sm text-gray-500">请尝试调整预算或期望利润</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendResults.map((result, index) => {
                    const config = shopLevelsConfig[result.level];
                    const isTopRecommendation = index === 0;
                    return (
                      <div
                        key={result.level}
                        onClick={() => handleSelectRecommendation(result)}
                        className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                          isTopRecommendation 
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-400 shadow-lg' 
                            : 'bg-white border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {/* 推荐标签 */}
                        {isTopRecommendation && (
                          <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            ⭐ 最佳匹配
                          </div>
                        )}

                        {/* 主内容 */}
                        <div className="p-5 sm:p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3
                                  className="text-xl sm:text-2xl font-bold"
                                  style={{
                                    color: config.color === '#000000' ? '#1f2937' : config.color,
                                  }}
                                >
                                  {result.levelName}
                                </h3>
                                <Badge
                                  variant="secondary"
                                  className={`${
                                    isTopRecommendation
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-purple-100 text-purple-700'
                                  }`}
                                >
                                  推荐率: {result.matchScore.toFixed(0)}%
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{result.matchReason}</p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                isTopRecommendation ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gray-100'
                              }`}>
                                <span className="text-2xl font-bold text-white">
                                  #{index + 1}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 数据卡片 */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-white/80 p-3 rounded-xl">
                              <p className="text-xs text-gray-500 mb-1">推荐进货额度</p>
                              <p className="text-lg font-bold text-gray-800">
                                {result.recommendedStock}⚡
                              </p>
                            </div>
                            <div className="bg-white/80 p-3 rounded-xl">
                              <p className="text-xs text-gray-500 mb-1">
                                {recommendInputType === 'budget' ? '首次进货成本' : '投入总成本'}
                              </p>
                              <p className="text-lg font-bold text-gray-800">
                                {result.stockCost}元
                              </p>
                            </div>
                            <div className="bg-white/80 p-3 rounded-xl">
                              <p className="text-xs text-gray-500 mb-1">预期利润</p>
                              <p className={`text-lg font-bold ${isTopRecommendation ? 'text-purple-600' : 'text-green-600'}`}>
                                {result.estimatedProfit}元
                              </p>
                            </div>
                            <div className="bg-white/80 p-3 rounded-xl">
                              <p className="text-xs text-gray-500 mb-1">完成天数</p>
                              <p className="text-lg font-bold text-gray-800">
                                {recommendInputType === 'budget' && recommendPeriod ? `${parseInt(recommendPeriod)}天` : `${result.completionDays}天`}
                              </p>
                            </div>
                          </div>

                          {/* 点击提示 */}
                          <div className="mt-4 flex items-center justify-center text-sm text-gray-500 group-hover:text-purple-600 transition-colors">
                            <span>点击选择此方案</span>
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 进货额度输入界面 */}
        {currentView === 'stockInput' && levelConfig && (
          <Card className="w-full max-w-lg mx-auto animate-in fade-in-0 slide-in-from-top-4 duration-300 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0">
            <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-6 px-3 sm:px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToLevelSelection} className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full w-10 h-10 sm:w-12 sm:h-12">
                  <span className="text-xl sm:text-2xl font-bold">←</span>
                </Button>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {levelConfig.name}
                </CardTitle>
                <div className="w-10 sm:w-12" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5 lg:space-y-6 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="cloudBalance" className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
                  云店余额（店铺已有额度）
                </Label>
                <Input
                  ref={cloudBalanceRef}
                  id="cloudBalance"
                  type="number"
                  placeholder="请输入你当前的云店余额"
                  min="0"
                  value={cloudBalanceInputValue}
                  onChange={(e) => handleCloudBalanceInputChange(e.target.value)}
                  onKeyDown={handleCloudBalanceKeyDown}
                  className={`focus:ring-2 transition-all duration-200 h-12 sm:h-13 lg:h-14 border-2 ${
                    cloudBalanceError
                      ? 'border-red-500 ring-red-500 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500/50 focus:border-blue-500'
                  } ${isCloudBalanceShaking ? 'animate-shake' : ''}`}
                />
                {cloudBalanceError && (
                  <p className="text-xs sm:text-xs transition-colors duration-200 text-red-500 font-medium">
                    {cloudBalanceError}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="stockAmount" className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
                  进货额度（100的整倍数）
                </Label>
                <Input
                  ref={stockAmountRef}
                  id="stockAmount"
                  type="number"
                  placeholder="请输入你要进货的额度"
                  min={levelConfig.minStock}
                  max={levelConfig.maxStock}
                  step="100"
                  value={stockInputValue}
                  onChange={(e) => handleStockInputChange(e.target.value)}
                  onKeyDown={handleStockAmountKeyDown}
                  className={`focus:ring-2 transition-all duration-200 h-12 sm:h-13 lg:h-14 border-2 ${
                    stockError
                      ? 'border-red-500 ring-red-500 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500/50 focus:border-blue-500'
                  } ${isStockShaking ? 'animate-shake' : ''}`}
                />
                <p className={`text-xs sm:text-xs transition-colors duration-200 ${stockError ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                  {stockError || `进货额度范围：${levelConfig.minStock} - ${levelConfig.maxStock}电费`}
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="maxBalance" className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
                  云店历史最高余额
                </Label>
                <Input
                  ref={maxBalanceRef}
                  id="maxBalance"
                  type="number"
                  placeholder="历史最高余额（自动同步）"
                  min="0"
                  value={maxBalanceInputValue}
                  onChange={(e) => handleMaxBalanceInputChange(e.target.value)}
                  onKeyDown={handleMaxBalanceKeyDown}
                  disabled={isEditMaxBalance}
                  className={`focus:ring-2 transition-all duration-200 h-12 sm:h-13 lg:h-14 border-2 ${
                    maxBalanceError
                      ? 'border-red-500 ring-red-500 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500/50 focus:border-blue-500'
                  } ${isEditMaxBalance ? 'bg-gray-50 border-gray-300' : ''} ${isMaxBalanceShaking ? 'animate-shake' : ''}`}
                />
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <Checkbox
                    id="editMaxBalance"
                    checked={isEditMaxBalance}
                    onCheckedChange={handleToggleEditMaxBalance}
                    className="active:scale-95 transition-all duration-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label
                    htmlFor="editMaxBalance"
                    className="text-xs sm:text-sm font-normal cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    自动设置为进货额度+云店余额
                  </Label>
                </div>
                {maxBalanceError && (
                  <p className="text-[10px] sm:text-xs text-red-500 font-medium">{maxBalanceError}</p>
                )}
              </div>

              <Button
                className="w-full h-10 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={handleConfirmStock}
              >
                确认进货 (Enter)
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 店铺详情界面 */}
        {currentView === 'levelDetails' && levelConfig && detailsData && (
          <Card className="w-full max-w-3xl mx-auto animate-in fade-in-0 slide-in-from-top-4 duration-300 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0">
            <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-6 px-3 sm:px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToStockInput} className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full w-10 h-10 sm:w-12 sm:h-12">
                  <span className="text-xl sm:text-2xl font-bold">←</span>
                </Button>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {levelConfig.name}详情
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowShareModal(true)}
                  className="active:scale-90 transition-all duration-200 hover:bg-purple-50 hover:text-purple-600 rounded-full w-10 h-10 sm:w-12 sm:h-12"
                  title="分享"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5 lg:space-y-6 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                <div className="bg-gradient-to-br from-white to-gray-50 p-3 sm:p-4 lg:p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-gray-100">
                  <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 mb-1.5">进货额度</p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
                    {detailsData.calculationBalance}⚡
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4 lg:p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-green-100">
                  <p className="text-[10px] sm:text-xs lg:text-sm text-green-600 mb-1.5">投入总成本</p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-green-600">
                    {detailsData.stockCost}元
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 lg:p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-blue-100">
                  <p className="text-[10px] sm:text-xs lg:text-sm text-blue-600 mb-1.5">每日代缴额度</p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-blue-600">
                    {detailsData.dailyCommission}⚡
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:p-4 lg:p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-purple-100">
                  <p className="text-[10px] sm:text-xs lg:text-sm text-purple-600 mb-1.5">销售完成天数</p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-purple-600">
                    {detailsData.completionDays}天
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 sm:p-5 lg:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border border-blue-100">
                  <div className="flex justify-between items-center">
                    <p className="text-blue-700 font-medium text-sm sm:text-base">云店总余额</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700">
                      {detailsData.cloudTotalBalance}⚡
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 sm:p-5 lg:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                  <div className="flex justify-between items-center">
                    <p className="text-white font-medium text-sm sm:text-base">总利润</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                      {detailsData.totalProfit}元
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 lg:gap-4">
                <Button
                  className="flex-1 h-10 sm:h-12 lg:h-14 text-sm sm:text-base active:scale-95 transition-all duration-200 hover:shadow-lg"
                  onClick={handleAddToComparison}
                  disabled={currentComparisonId !== null}
                  variant={currentComparisonId ? "secondary" : "default"}
                >
                  {currentComparisonId ? '✓ 已加入对比' : '加入对比'}
                </Button>
                <Button
                  className="flex-1 h-10 sm:h-12 lg:h-14 text-sm sm:text-base active:scale-95 transition-all duration-200 hover:shadow-lg"
                  onClick={handleViewSalesDetails}
                >
                  查看销售详情
                </Button>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <p className="text-sm text-blue-700 leading-relaxed">
                  💡 进货第二天自动开始卖出，结算时间为卖出时间+10天。例如：12月20日卖出的电费，12月30日以95折结算回来本金和利润。
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 销售详情界面 */}
        {currentView === 'salesDetails' && (
          <Card className="max-w-3xl mx-auto w-full bg-white/90 backdrop-blur-lg animate-in fade-in-0 slide-in-from-top-4 duration-300 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToLevelDetails} className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full w-12 h-12">
                  <span className="text-2xl font-bold">←</span>
                </Button>
                <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  销售详情
                </CardTitle>
                <div className="w-12" />
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {/* 移动端：卡片式布局 */}
              <div className="sm:hidden space-y-3">
                {salesData.map((sale, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">销售日期</p>
                        <p className="text-sm font-semibold text-gray-800">{sale.date}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">销售额度</p>
                        <p className="text-sm font-bold text-gray-800">{sale.amount}⚡</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">结算时间</p>
                        <p className="text-sm font-medium text-gray-600">{sale.settlementDate}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">结算金额</p>
                        <p className="text-sm font-bold text-gray-800">{sale.settlementAmount.toFixed(2)}元</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">利润</p>
                        <p className="text-base font-bold text-green-600">{sale.profit.toFixed(2)}元</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 移动端合计 */}
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-600">合计销售额度</p>
                      <p className="text-sm font-bold text-blue-700">
                        {salesData.reduce((sum, s) => sum + s.amount, 0)}⚡
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-600">合计结算金额</p>
                      <p className="text-sm font-bold text-blue-700">
                        {salesData.reduce((sum, s) => sum + s.settlementAmount, 0).toFixed(2)}元
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                      <p className="text-xs text-gray-600">合计利润</p>
                      <p className="text-base font-bold text-green-600">
                        {salesData.reduce((sum, s) => sum + s.profit, 0).toFixed(2)}元
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 桌面端：表格布局 */}
              <div className="hidden sm:block">
                <div
                  ref={salesDetailsScrollRef}
                  className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scroll-smooth"
                >
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 hover:bg-blue-50/50">
                        <TableHead className="text-center font-semibold text-gray-700">销售日期</TableHead>
                        <TableHead className="text-center font-semibold text-gray-700">销售额度</TableHead>
                        <TableHead className="text-center font-semibold text-gray-700">结算时间</TableHead>
                        <TableHead className="text-center font-semibold text-gray-700">结算金额</TableHead>
                        <TableHead className="text-center font-semibold text-gray-700">利润</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesData.map((sale, index) => (
                        <TableRow key={index} className="hover:bg-blue-50/30 transition-colors duration-200">
                          <TableCell className="text-center font-medium">{sale.date}</TableCell>
                          <TableCell className="text-center font-semibold text-gray-800">{sale.amount}⚡</TableCell>
                          <TableCell className="text-center text-gray-600">{sale.settlementDate}</TableCell>
                          <TableCell className="text-center text-gray-800 font-medium">
                            {sale.settlementAmount.toFixed(2)}元
                          </TableCell>
                          <TableCell className="text-center text-green-600 font-semibold">
                            {sale.profit.toFixed(2)}元
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter className="bg-gradient-to-r from-blue-100 to-purple-100">
                      <TableRow>
                        <TableCell className="text-center font-bold text-blue-700">合计</TableCell>
                        <TableCell className="text-center font-bold text-blue-700">
                          {salesData.reduce((sum, s) => sum + s.amount, 0)}⚡
                        </TableCell>
                        <TableCell className="text-center font-bold text-blue-700">-</TableCell>
                        <TableCell className="text-center font-bold text-blue-700">
                          {salesData.reduce((sum, s) => sum + s.settlementAmount, 0).toFixed(2)}元
                        </TableCell>
                        <TableCell className="text-center font-bold text-blue-700">
                          {salesData.reduce((sum, s) => sum + s.profit, 0).toFixed(2)}元
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center">
                  <p className="text-gray-700 font-medium">销售完成天数</p>
                  <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {salesData.length}天
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 数据对比界面 */}
        {currentView === 'comparison' && (
          <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-lg animate-in fade-in-0 slide-in-from-top-4 duration-300 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToShopSelection} className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full w-12 h-12">
                  <span className="text-2xl font-bold">←</span>
                </Button>
                <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">数据对比详情</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearComparison}
                  disabled={comparisonData.length === 0}
                  className="active:scale-95 transition-all duration-200 hover:shadow-md hover:border-blue-300"
                >
                  清空对比
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {comparisonData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">暂无对比数据</p>
                  <p className="text-sm">请先确认进货，然后点击"加入对比"按钮</p>
                  <p className="text-sm mt-2 text-blue-600">注意：只能对比相同进货额度的数据</p>
                </div>
              ) : (
                <>
                  {/* 移动端：卡片式布局 */}
                  <div className="sm:hidden space-y-3">
                    {comparisonData.map((item) => {
                      const levelConfig = shopLevelsConfig[item.level];
                      const isMaxProfit = maxProfitId === item.id;
                      const isCurrent = currentComparisonId === item.id;

                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                            isCurrent ? 'bg-blue-50/50 border-blue-300' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-bold text-base" style={{ color: levelConfig.color }}>
                                {item.levelName}
                              </h3>
                              {isMaxProfit && (
                                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                  最高利润
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">进货额度</p>
                                <p className="text-sm font-bold text-gray-800">{item.stockAmount}⚡</p>
                              </div>
                              <div className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">完成天数</p>
                                <p className="text-sm font-bold text-gray-800">{item.completionDays}天</p>
                              </div>
                              <div className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">投入成本</p>
                                <p className="text-sm font-bold text-gray-800">{item.stockCost}元</p>
                              </div>
                              <div className={`p-2 rounded-lg ${isMaxProfit ? 'bg-green-50' : 'bg-gray-50'}`}>
                                <p className="text-xs text-gray-500 mb-1">总利润</p>
                                <p className={`text-base font-bold ${isMaxProfit ? 'text-green-600' : 'text-gray-800'}`}>
                                  {item.totalProfit}元
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteComparison(item.id)}
                              className="w-full h-10 text-sm"
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 桌面端：表格布局 */}
                  <div className="hidden sm:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center font-semibold text-gray-700">店铺等级</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700">进货额度⚡</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700 hidden sm:table-cell">投入总成本(元)</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700">完成天数</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700">总利润(元)</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonData.map((item) => {
                          const levelConfig = shopLevelsConfig[item.level];
                          const isMaxProfit = maxProfitId === item.id;
                          const isCurrent = currentComparisonId === item.id;
                          
                          return (
                            <TableRow key={item.id} className={
                              isCurrent ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'
                            }>
                              <TableCell className="text-center font-bold" style={{ color: levelConfig.color }}>
                                {item.levelName}
                              </TableCell>
                              <TableCell className="text-center font-medium text-gray-800">{item.stockAmount}</TableCell>
                              <TableCell className="text-center text-gray-700 hidden sm:table-cell">
                                {item.stockCost}
                              </TableCell>
                              <TableCell className="text-center text-gray-700">
                                {item.completionDays}
                              </TableCell>
                              <TableCell className={`text-center font-bold ${isMaxProfit ? 'text-green-600 text-lg sm:text-xl' : 'text-gray-800'}`}>
                                {item.totalProfit}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteComparison(item.id)}
                                  className="active:scale-90 transition-all duration-200 hover:shadow-md"
                                >
                                  删除
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {profitAnalysis && (
                    <div className="mt-6 p-5 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                      <h4 className="font-bold text-gray-700 mb-4 sm:mb-5 text-lg sm:text-xl">💰 利润分析</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border border-gray-100">
                          <p className="text-xs sm:text-sm text-gray-500 mb-2">最低利润</p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-800">
                            {profitAnalysis.minProfit}元
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border border-green-100">
                          <p className="text-xs sm:text-sm text-green-600 mb-2">最高利润</p>
                          <p className="text-xl sm:text-2xl font-bold text-green-600">
                            {profitAnalysis.maxProfit}元
                          </p>
                        </div>
                        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border border-gray-100">
                          <p className="text-xs sm:text-sm text-gray-500 mb-2">利润差额</p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-800">
                            {profitAnalysis.profitDiff}元
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border border-blue-100">
                          <p className="text-xs sm:text-sm text-blue-600 mb-2">利润差额率</p>
                          <p className="text-xl sm:text-2xl font-bold text-blue-600">
                            {profitAnalysis.profitDiffRate}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 推荐信息卡片 */}
                  {maxProfitId && profitAnalysis && (() => {
                    const maxItem = comparisonData.find(d => d.id === maxProfitId);
                    if (!maxItem) return null;
                    return (
                      <div className="mt-6 p-5 sm:p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-emerald-200">
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                          <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-md">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-lg sm:text-xl mb-3">🎯 推荐方案</h4>
                            <p className="text-gray-700 leading-relaxed">
                              推荐您升级到<span className="font-bold text-emerald-700 mx-1 bg-white px-3 py-1 rounded-lg shadow-sm border border-emerald-100">{maxItem.levelName}</span>，
                              利润提升<span className="font-bold text-emerald-700 mx-1 bg-white px-3 py-1 rounded-lg shadow-sm border border-emerald-100">{profitAnalysis.profitDiffText}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* 店铺等级页面 */}
        {currentView === 'shopLevels' && (
          <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-lg animate-in fade-in-0 slide-in-from-top-4 duration-300 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToShopSelection} className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full w-12 h-12">
                  <span className="text-2xl font-bold">←</span>
                </Button>
                <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">店铺等级说明</CardTitle>
                <div className="w-12" />
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* 如何提升店铺等级 */}
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📈</span> 如何提升店铺等级？
                </h3>
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center font-semibold text-gray-700 whitespace-nowrap">升级条件</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700 whitespace-nowrap">目标等级</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="px-3 py-3 sm:px-4 text-gray-700 text-center">
                            <div className="space-y-2 text-sm sm:text-base">
                              <div>开店选择新手店500额度卖完自动升级</div>
                              <div>开店选择老手店开店完成之后自动升级</div>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-3 sm:px-4 text-center">
                            <Badge className="bg-gradient-to-r from-orange-400 to-orange-600 text-xs sm:text-sm">青铜</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="px-3 py-3 sm:px-4 text-gray-700 text-center text-sm sm:text-base">推荐 1 个用户开启云店</TableCell>
                          <TableCell className="px-3 py-3 sm:px-4 text-center">
                            <Badge className="bg-gradient-to-r from-gray-300 to-gray-400 text-xs sm:text-sm">白银</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="px-3 py-3 sm:px-4 text-gray-700 text-center text-sm sm:text-base">推荐 2 个用户开启云店</TableCell>
                          <TableCell className="px-3 py-3 sm:px-4 text-center">
                            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-xs sm:text-sm">黄金</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="px-3 py-3 sm:px-4 text-gray-700 text-center text-sm sm:text-base">推荐 4 个用户开启云店</TableCell>
                          <TableCell className="px-3 py-3 sm:px-4 text-center">
                            <Badge className="bg-gradient-to-r from-gray-200 to-gray-300 text-xs sm:text-sm">铂金</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="px-3 py-3 sm:px-4 text-gray-700 text-center text-sm sm:text-base">推荐 7 个用户开启云店</TableCell>
                          <TableCell className="px-3 py-3 sm:px-4 text-center">
                            <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-xs sm:text-sm">钻石</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="px-3 py-3 sm:px-4 text-gray-700 text-center text-sm sm:text-base">推荐 10 个用户开启云店</TableCell>
                          <TableCell className="px-3 py-3 sm:px-4 text-center">
                            <Badge className="bg-gradient-to-r from-gray-600 to-gray-800 text-white text-xs sm:text-sm">黑钻</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="px-3 py-3 sm:px-4 text-gray-700 text-center text-sm sm:text-base">推荐 15 个用户开启云店</TableCell>
                          <TableCell className="px-3 py-3 sm:px-4 text-center">
                            <Badge className="bg-gradient-to-r from-purple-500 to-purple-700 text-white text-xs sm:text-sm">至尊</Badge>
                          </TableCell>
                        </TableRow>
                    </TableBody>
                  </Table>
                  </div>
                </div>
              </div>

              {/* 升级店铺的权益 */}
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">💎</span> 升级店铺的权益
                </h3>
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 z-10 text-center font-semibold text-gray-700 whitespace-nowrap text-xs sm:text-sm bg-white/95 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-gray-200">等级</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700 whitespace-nowrap text-xs sm:text-sm">预缴折扣</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700 whitespace-nowrap text-xs sm:text-sm">最高余额</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700 whitespace-nowrap text-xs sm:text-sm">代缴比例</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700 whitespace-nowrap text-xs sm:text-sm">提现手续费</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700 whitespace-nowrap text-xs sm:text-sm">抽奖</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700 whitespace-nowrap text-xs sm:text-sm">E积分</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700 whitespace-nowrap text-xs sm:text-sm">股权</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="sticky left-0 z-10 px-2 py-2 sm:px-3 text-center bg-white/95 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-gray-200">
                            <Badge className="bg-gradient-to-r from-orange-400 to-orange-600 text-xs sm:text-sm">青铜</Badge>
                          </TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">88折</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">3000</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">20%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">1%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">-</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">1%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">-</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="sticky left-0 z-10 px-2 py-2 sm:px-3 text-center bg-white/95 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-gray-200">
                            <Badge className="bg-gradient-to-r from-gray-300 to-gray-400 text-xs sm:text-sm">白银</Badge>
                          </TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">87折</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">6000</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">19%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">0.95%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">1次/月</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">2%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">3%</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="sticky left-0 z-10 px-2 py-2 sm:px-3 text-center bg-white/95 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-gray-200">
                            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-xs sm:text-sm">黄金</Badge>
                          </TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">86折</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">10000</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">18%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">0.9%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">1次/月</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">5%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">6%</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="sticky left-0 z-10 px-2 py-2 sm:px-3 text-center bg-white/95 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-gray-200">
                            <Badge className="bg-gradient-to-r from-gray-200 to-gray-300 text-xs sm:text-sm">铂金</Badge>
                          </TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">85折</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">30000</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">17%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">0.85%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">1次/月</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">6%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">8%</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="sticky left-0 z-10 px-2 py-2 sm:px-3 text-center bg-white/95 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-gray-200">
                            <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-xs sm:text-sm">钻石</Badge>
                          </TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">84折</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">70000</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">16%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">0.8%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">2次/月</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">7%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">10%</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="sticky left-0 z-10 px-2 py-2 sm:px-3 text-center bg-white/95 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-gray-200">
                            <Badge className="bg-gradient-to-r from-gray-600 to-gray-800 text-white text-xs sm:text-sm">黑钻</Badge>
                          </TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">83折</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">130000</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">15%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">0.75%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">2次/月</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">8%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">15%</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="sticky left-0 z-10 px-2 py-2 sm:px-3 text-center bg-white/95 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-gray-200">
                            <Badge className="bg-gradient-to-r from-purple-500 to-purple-700 text-white text-xs sm:text-sm">至尊</Badge>
                          </TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">82折</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">200000</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">14%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">0.65%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">3次/月</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">10%</TableCell>
                          <TableCell className="px-1 sm:px-2 py-2 text-center text-gray-700 text-xs sm:text-sm">20%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 进入平台 */}
        {currentView === 'platform' && (
          <Card className="w-full max-w-4xl mx-auto glass animate-fade-in animate-scale-in shadow-2xl border-0">
            <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToShopSelection}
                  className="touch-feedback w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-green-100 hover:text-green-600 transition-all duration-300"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold">
                  进入平台
                </CardTitle>
                <div className="w-10 sm:w-12" />
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-4">
                  <Button
                    onClick={() => openLink('https://www.ugpcgm.cn/#/pages/index/login/login')}
                    className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    登录缴费平台
                  </Button>
                  <Button
                    onClick={() => openLink('https://www.ugpcgm.cn/#/pages/download/download')}
                    className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载缴费APP
                  </Button>
                  <Button
                    onClick={() => openLink('https://www.ugpcgm.cn/#/myPages/groupChat/groupChat')}
                    className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载步信APP
                  </Button>
              </div>
              
              {/* 温馨提示 */}
              <div className="mt-6 p-4 rounded-lg bg-yellow-50 border-2 border-yellow-200">
                <p className="text-sm sm:text-base text-yellow-800 font-medium flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  温馨提示：如在平台上无法充值请联系平台客服人工充值
                </p>
              </div>
              </CardContent>
            </Card>
        )}

      </main>

      {/* 微信链接引导 */}
      <WeChatLinkGuide
        isVisible={showWeChatLinkGuide}
        onClose={handleCloseWeChatLinkGuide}
        targetUrl={targetUrl}
      />

      {/* 分享弹窗 */}
      {showShareModal && detailsData && levelConfig && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareData={{
            shopLevel: levelConfig.name,
            stockAmount: detailsData.calculationBalance,
            cloudBalance: cloudBalance,
            maxBalance: maxBalance,
            totalProfit: detailsData.totalProfit,
            dailyCommission: detailsData.dailyCommission,
            completionDays: detailsData.completionDays,
          }}
        />
      )}

      {/* PWA安装提示 */}
      <PWAInstallPrompt />

      {/* PWA更新提示 */}
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
