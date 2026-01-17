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

  // 触发闪烁动画
  const triggerShake = (setter: (value: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 500);
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
      // 在微信中，显示引导页面
      setShowWeChatLinkGuide(true);
    } else {
      // 在浏览器中，直接打开链接
      window.open(url, '_blank');
    }
  };
  
  // 关闭微信链接引导
  const handleCloseWeChatLinkGuide = () => {
    setShowWeChatLinkGuide(false);
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

  // 处理Enter键（已废弃，改用单个输入框的 onKeyDown 处理）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 不再需要全局处理
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]" onKeyDown={handleKeyDown}>
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewComparison}
              disabled={comparisonData.length === 0}
              className="text-xs sm:text-sm transition-all duration-200"
            >
              数据对比{comparisonData.length > 0 && ` (${comparisonData.length})`}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 tracking-tight">
              云店模拟器
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoHome}
              className="text-xs sm:text-sm transition-all duration-200"
            >
              回到首页
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 min-h-[calc(100vh-72px)]">
