'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

export default function CloudShopSimulator() {
  // 应用状态
  const [currentLevel, setCurrentLevel] = useState<ShopLevel | null>(null);
  const [stockAmount, setStockAmount] = useState<number>(0);
  const [cloudBalance, setCloudBalance] = useState<number>(0);      // 云店余额
  const [maxBalance, setMaxBalance] = useState<number>(0);           // 历史最高余额
  const [currentView, setCurrentView] = useState<ViewType>('shopSelection');
  const [isEditCloudBalance, setIsEditCloudBalance] = useState<boolean>(true);  // 云店余额是否可编辑
  const [isEditMaxBalance, setIsEditMaxBalance] = useState<boolean>(true);      // 最高余额是否可编辑
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  
  // 对比数据状态
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [currentComparisonId, setCurrentComparisonId] = useState<string | null>(null);
  
  // 输入框值状态
  const [stockInputValue, setStockInputValue] = useState<string>('');
  const [cloudBalanceInputValue, setCloudBalanceInputValue] = useState<string>('0');
  const [maxBalanceInputValue, setMaxBalanceInputValue] = useState<string>('0');
  
  // 错误状态
  const [stockError, setStockError] = useState<string>('');
  const [cloudBalanceError, setCloudBalanceError] = useState<string>('');
  const [maxBalanceError, setMaxBalanceError] = useState<string>('');

  // 销售数据
  const [salesData, setSalesData] = useState<SalesData[]>([]);

  // 推荐系统状态
  const [recommendInputType, setRecommendInputType] = useState<'budget' | 'profit'>('budget');
  const [recommendBudget, setRecommendBudget] = useState<string>('');
  const [recommendProfit, setRecommendProfit] = useState<string>('');
  const [recommendPeriod, setRecommendPeriod] = useState<string>(''); // 周期（天），1-30
  const [recommendResults, setRecommendResults] = useState<RecommendationResult[]>([]);

  // 获取当前等级配置
  const levelConfig = currentLevel ? shopLevelsConfig[currentLevel] : null;

  // 选择店铺等级
  const handleSelectLevel = (level: ShopLevel) => {
    setCurrentLevel(level);
    setCurrentView('stockInput');
    setStockInputValue('');
    setCloudBalanceInputValue('0');
    setMaxBalanceInputValue('0');
    setStockAmount(0);
    setCloudBalance(0);
    setMaxBalance(0);
    setIsEditCloudBalance(true);
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
    setCurrentLevel(null);
    setStockAmount(0);
    setCloudBalance(0);
    setMaxBalance(0);
    setCurrentView('shopSelection');
    setStockInputValue('');
    setCloudBalanceInputValue('0');
    setMaxBalanceInputValue('0');
    setIsEditCloudBalance(true);
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
      } else {
        setStockError('');
      }
      
      setStockAmount(numValue);
      
      // 如果云店余额是同步模式，自动更新
      if (isEditCloudBalance && numValue > 0) {
        setCloudBalance(numValue);
        setCloudBalanceInputValue(String(numValue));
        // 如果历史最高余额也是同步模式，也自动更新
        if (isEditMaxBalance) {
          setMaxBalance(numValue);
          setMaxBalanceInputValue(String(numValue));
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
    } else {
      setCloudBalanceError('');
    }
    
    setCloudBalance(numValue);
    
    // 如果历史最高余额是同步模式，自动更新
    if (isEditMaxBalance && numValue > 0) {
      setMaxBalance(numValue);
      setMaxBalanceInputValue(String(numValue));
    }
  };

  // 处理最高余额输入
  const handleMaxBalanceInputChange = (value: string) => {
    setMaxBalanceInputValue(value);
    const numValue = parseInt(value) || 0;
    
    const validation = validateMaxBalance(numValue, cloudBalance);
    if (!validation.valid && numValue > 0) {
      setMaxBalanceError(validation.error || '');
    } else {
      setMaxBalanceError('');
    }
    
    setMaxBalance(numValue);
  };

  // 切换同步云店余额
  const handleToggleEditCloudBalance = (checked: boolean) => {
    setIsEditCloudBalance(checked);
    
    if (checked && stockAmount > 0) {
      setCloudBalance(stockAmount);
      setCloudBalanceInputValue(String(stockAmount));
      // 如果历史最高余额也是同步模式，也自动更新
      if (isEditMaxBalance) {
        setMaxBalance(stockAmount);
        setMaxBalanceInputValue(String(stockAmount));
      }
    }
  };

  // 切换同步历史最高余额
  const handleToggleEditMaxBalance = (checked: boolean) => {
    setIsEditMaxBalance(checked);
    
    if (checked && cloudBalance > 0) {
      setMaxBalance(cloudBalance);
      setMaxBalanceInputValue(String(cloudBalance));
    }
  };

  // 确认进货
  const handleConfirmStock = useCallback(() => {
    if (!currentLevel || !levelConfig) return;
    
    const numValue = parseInt(stockInputValue) || 0;
    
    // 如果有输入进货额度，需要验证进货额度
    if (numValue > 0) {
      const stockValidation = validateStockAmount(numValue, levelConfig);
      if (!stockValidation.valid) {
        setStockError(stockValidation.error || '');
        return;
      }
    }
    
    // 验证云店余额
    if (cloudBalance > 0 && stockAmount > 0) {
      const cloudBalanceValidation = validateCloudBalance(cloudBalance, stockAmount);
      if (!cloudBalanceValidation.valid) {
        setCloudBalanceError(cloudBalanceValidation.error || '');
        return;
      }
    }
    
    // 验证历史最高余额
    if (maxBalance > 0 && cloudBalance > 0) {
      const maxBalanceValidation = validateMaxBalance(maxBalance, cloudBalance);
      if (!maxBalanceValidation.valid) {
        setMaxBalanceError(maxBalanceValidation.error || '');
        return;
      }
    }
    
    // 确保至少有进货额度或云店余额之一
    if (stockAmount === 0 && cloudBalance === 0) {
      setStockError('请输入进货额度或云店余额');
      return;
    }
    
    // 使用云店余额作为基准计算（如果没有进货额度）
    const calculationBalance = cloudBalance > 0 ? cloudBalance : stockAmount;
    
    // 生成销售数据
    const dailyCommission = Math.round(maxBalance * levelConfig.commissionRate);
    const dailyProfit = dailyCommission * (levelConfig.saleDiscount - levelConfig.stockDiscount);
    const data = generateSalesData(calculationBalance, dailyCommission, dailyProfit);
    setSalesData(data);
    
    setCurrentComparisonId(null);
    setCurrentView('levelDetails');
  }, [currentLevel, levelConfig, stockInputValue, cloudBalance, stockAmount, maxBalance]);

  // 加入对比
  const handleAddToComparison = useCallback(() => {
    if (!currentLevel || !levelConfig) return;
    
    // 使用云店余额作为基准计算（如果没有进货额度）
    const calculationBalance = cloudBalance > 0 ? cloudBalance : stockAmount;
    const stockCost = Math.round(calculationBalance * levelConfig.stockDiscount);
    const dailyCommission = Math.round(maxBalance * levelConfig.commissionRate);
    const completionDays = Math.ceil(calculationBalance / dailyCommission);
    const totalProfit = Math.round(calculationBalance * (levelConfig.saleDiscount - levelConfig.stockDiscount));
    
    const newComparison: ComparisonData = {
      id: Date.now().toString(),
      level: currentLevel,
      levelName: levelConfig.name,
      stockAmount: calculationBalance,
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
  }, [currentLevel, levelConfig, cloudBalance, stockAmount, maxBalance]);

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
    
    // 使用云店余额作为基准计算（如果没有进货额度）
    const calculationBalance = cloudBalance > 0 ? cloudBalance : stockAmount;
    
    const stockCost = Math.round(calculationBalance * levelConfig.stockDiscount);
    const dailyCommission = Math.round(maxBalance * levelConfig.commissionRate);
    const completionDays = Math.ceil(calculationBalance / dailyCommission);
    const totalProfit = Math.round(calculationBalance * (levelConfig.saleDiscount - levelConfig.stockDiscount));
    
    return { stockCost, dailyCommission, completionDays, totalProfit, calculationBalance };
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
      // 检查今天是否有回款可以结算
      const todaySettlement = settlementQueue.get(day) || 0;
      if (todaySettlement > 0) {
        // 用回款进货，增加库存
        const newStock = Math.round(todaySettlement / stockDiscount);
        remainingStock += newStock;
      }

      // 如果还有库存，当天可以卖出
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

          // 单日利润 = 回款 - 进货成本
          const dailyProfit = settlementAmount - stockCost;

          // 累计利润
          totalProfit += dailyProfit;

          // 将回款加入结算队列（卖出日+10天结算）
          const settlementDay = day + settlementDays;
          const existing = settlementQueue.get(settlementDay) || 0;
          settlementQueue.set(settlementDay, existing + settlementAmount);
        }
      }
    }

    return Math.round(totalProfit);
  }, []);

  // 推荐算法：根据预算或期望利润计算推荐方案
  const generateRecommendations = useCallback((): RecommendationResult[] => {
    let results: RecommendationResult[] = [];
    const targetBudget = recommendInputType === 'budget' ? parseInt(recommendBudget) || 0 : 0;
    const targetProfit = recommendInputType === 'profit' ? parseInt(recommendProfit) || 0 : 0;
    const period = parseInt(recommendPeriod) || 0; // 周期天数，0表示不考虑周期

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
        // 根据预算推荐
        if (targetBudget <= 0) continue;

        let stockCost: number;
        let dailyCommission: number;
        let completionDays: number;

        if (period > 0 && period <= 30) {
          // 考虑周期的推荐 - 利润最大化算法
          // 在预算限制内找到使复利利润最大的进货额度

          // 计算预算支持的最大进货额度（取100倍数）
          const maxStockByBudget = Math.floor(targetBudget / config.stockDiscount / 100) * 100;
          const cappedMaxStock = Math.min(config.maxStock, maxStockByBudget);

          // 从最低到最大进货额度，寻找利润最大值
          let maxProfit = -1;
          let bestStock = config.minStock;

          for (let stock = config.minStock; stock <= cappedMaxStock; stock += 100) {
            const actualCost = stock * config.stockDiscount;
            if (actualCost > targetBudget) break;

            const compoundProfit = calculateCompoundProfit(stock, config, period);
            if (compoundProfit > maxProfit) {
              maxProfit = compoundProfit;
              bestStock = stock;
            }
          }

          recommendedStock = bestStock;
          stockCost = Math.round(recommendedStock * config.stockDiscount);
          estimatedProfit = maxProfit;

          // 完成天数
          dailyCommission = Math.round(recommendedStock * config.commissionRate);
          completionDays = Math.ceil(recommendedStock / dailyCommission);

          // 匹配度稍后在所有结果计算完后统一重新计算（基于利润最大化）
          matchScore = 0; // 临时值，会被覆盖
          matchReason = `周期${period}天复利利润${estimatedProfit}元（进货成本${stockCost}元）`;
        } else {
          // 不考虑周期的推荐 - 利润最大化算法
          // 在预算限制内找到使单次利润最大的进货额度

          // 计算预算支持的最大进货额度（取100倍数）
          const maxStockByBudget = Math.floor(targetBudget / config.stockDiscount / 100) * 100;
          const cappedMaxStock = Math.min(config.maxStock, maxStockByBudget);

          // 从最低到最大进货额度，寻找利润最大值
          let maxProfit = -1;
          let bestStock = config.minStock;

          for (let stock = config.minStock; stock <= cappedMaxStock; stock += 100) {
            const actualCost = stock * config.stockDiscount;
            if (actualCost > targetBudget) break;

            const profit = stock * (config.saleDiscount - config.stockDiscount);
            if (profit > maxProfit) {
              maxProfit = profit;
              bestStock = stock;
            }
          }

          recommendedStock = bestStock;
          stockCost = Math.round(recommendedStock * config.stockDiscount);
          estimatedProfit = Math.round(maxProfit);
          dailyCommission = Math.round(recommendedStock * config.commissionRate);
          completionDays = Math.ceil(recommendedStock / dailyCommission);

          // 匹配度稍后在所有结果计算完后统一重新计算（基于利润最大化）
          matchScore = 0; // 临时值，会被覆盖
          matchReason = `单次利润${estimatedProfit}元（进货成本${stockCost}元）`;
        }

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
        // 根据期望利润推荐
        if (targetProfit <= 0) continue;

        let stockCost: number;
        let dailyCommission: number;
        let completionDays: number;

        if (period > 0 && period <= 30) {
          // 考虑周期的推荐 - 使用复利计算
          // 先计算最低和最高进货额度的复利利润
          const minCompoundProfit = calculateCompoundProfit(config.minStock, config, period);
          const maxCompoundProfit = calculateCompoundProfit(config.maxStock, config, period);

          // 检查是否在该等级范围内
          if (targetProfit < minCompoundProfit) {
            // 目标利润低于该等级最低复利利润
            recommendedStock = config.minStock;
            estimatedProfit = minCompoundProfit;
            const profitDiff = Math.abs(estimatedProfit - targetProfit);
            matchScore = (1 - profitDiff / targetProfit) * 100;
            matchReason = `最低复利利润: ${estimatedProfit}元（目标: ${targetProfit}元）`;
          } else if (targetProfit > maxCompoundProfit) {
            // 目标利润高于该等级最高复利利润
            recommendedStock = config.maxStock;
            estimatedProfit = maxCompoundProfit;
            const profitDiff = Math.abs(estimatedProfit - targetProfit);
            matchScore = Math.max(0, (1 - profitDiff / targetProfit) * 100);
            matchReason = `最高复利利润: ${estimatedProfit}元（目标: ${targetProfit}元）`;
          } else {
            // 目标利润在该等级范围内，使用二分法找到最接近的进货额度
            let low = config.minStock;
            let high = config.maxStock;
            let bestStock = config.minStock;
            let minDiff = Infinity;

            // 进行二分搜索（最多20次迭代）
            for (let i = 0; i < 20; i++) {
              const mid = Math.round((low + high) / 2);
              const midProfit = calculateCompoundProfit(mid, config, period);
              const diff = Math.abs(midProfit - targetProfit);

              if (diff < minDiff) {
                minDiff = diff;
                bestStock = mid;
              }

              if (midProfit < targetProfit) {
                low = mid + 100;
              } else {
                high = mid - 100;
              }
            }

            recommendedStock = bestStock;
            recommendedStock = Math.round(recommendedStock / 100) * 100; // 取100的倍数
            estimatedProfit = calculateCompoundProfit(recommendedStock, config, period);
            const profitDiff = Math.abs(estimatedProfit - targetProfit);
            matchScore = (1 - profitDiff / targetProfit) * 100;
            matchReason = `周期${period}天复利利润: ${estimatedProfit}元`;
          }

          stockCost = Math.round(recommendedStock * config.stockDiscount);
          dailyCommission = Math.round(recommendedStock * config.commissionRate);
          completionDays = Math.ceil(recommendedStock / dailyCommission);

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
          // 不考虑周期的推荐（原来的逻辑）
          // 计算达到目标利润所需的进货额度
          const requiredStock = Math.round(targetProfit / (config.saleDiscount - config.stockDiscount) / 100) * 100;

          // 检查是否在该等级范围内
          if (requiredStock < config.minStock) {
            // 目标利润低于该等级最低利润
            recommendedStock = config.minStock;
            estimatedProfit = minProfit;
            const profitDiff = Math.abs(estimatedProfit - targetProfit);
            matchScore = (1 - profitDiff / targetProfit) * 100;
            matchReason = `最低利润: ${minProfit}元（目标: ${targetProfit}元）`;
          } else if (requiredStock > config.maxStock) {
            // 目标利润高于该等级最高利润
            recommendedStock = config.maxStock;
            estimatedProfit = maxProfit;
            const profitDiff = Math.abs(estimatedProfit - targetProfit);
            matchScore = Math.max(0, (1 - profitDiff / targetProfit) * 100);
            matchReason = `最高利润: ${maxProfit}元（目标: ${targetProfit}元）`;
          } else {
            // 目标利润在该等级范围内
            recommendedStock = requiredStock;
            estimatedProfit = Math.round(recommendedStock * (config.saleDiscount - config.stockDiscount));
            const profitDiff = Math.abs(estimatedProfit - targetProfit);
            matchScore = (1 - profitDiff / targetProfit) * 100;
            matchReason = `预期利润: ${estimatedProfit}元（目标: ${targetProfit}元）`;
          }

          stockCost = Math.round(recommendedStock * config.stockDiscount);
          dailyCommission = Math.round(recommendedStock * config.commissionRate);
          completionDays = Math.ceil(recommendedStock / dailyCommission);

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
        }
      }
    }

    // 重新计算匹配度：以利润最大化为主
    if (results.length > 0) {
      // 找到全局最大利润
      const maxGlobalProfit = Math.max(...results.map(r => r.estimatedProfit));

      // 重新计算每个结果的匹配度：当前利润 / 全局最大利润
      results = results.map(result => ({
        ...result,
        matchScore: maxGlobalProfit > 0 ? Math.round((result.estimatedProfit / maxGlobalProfit) * 100) : 0
      }));
    }

    // 按匹配度（利润）排序
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }, [recommendInputType, recommendBudget, recommendProfit, recommendPeriod]);

  // 处理推荐查询
  const handleRecommend = useCallback(() => {
    const results = generateRecommendations();
    setRecommendResults(results);
    setCurrentView('recommendationResult');
  }, [generateRecommendations]);

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
    setIsEditCloudBalance(true);
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

  // 处理Enter键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentView === 'stockInput') {
      e.preventDefault();
      handleConfirmStock();
    }
    if (e.key === 'Enter' && currentView === 'recommendation') {
      e.preventDefault();
      handleRecommend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50" onKeyDown={handleKeyDown}>
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            云店模拟器
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('recommendation')}
              className="hidden sm:flex active:scale-95 transition-all duration-200 hover:shadow-md hover:border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
            >
              🎯 智能推荐
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('recommendation')}
              className="sm:hidden active:scale-95 transition-all duration-200 hover:shadow-md bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
            >
              推荐
            </Button>
            {comparisonData.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewComparison}
                className="hidden sm:flex active:scale-95 transition-all duration-200 hover:shadow-md hover:border-blue-300"
              >
                查看对比 ({comparisonData.length})
              </Button>
            )}
            {comparisonData.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewComparison}
                className="sm:hidden active:scale-95 transition-all duration-200 hover:shadow-md"
              >
                对比({comparisonData.length})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoHome}
              className="active:scale-95 transition-all duration-200 hover:shadow-md hover:border-blue-300"
            >
              首页
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHelpOpen(true)}
              className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full"
            >
              ?
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* 店铺选择界面 */}
        {currentView === 'shopSelection' && (
          <div className="max-w-4xl mx-auto w-full">
            <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="text-xl sm:text-2xl text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                  请选择你的店铺等级
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 sm:px-6 pb-6">
                {(Object.keys(shopLevelsConfig) as ShopLevel[]).map((level) => {
                  const config = shopLevelsConfig[level];
                  return (
                    <div
                      key={level}
                      onClick={() => handleSelectLevel(level)}
                      className="group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer bg-white"
                      style={{
                        borderColor: config.color,
                        backgroundColor: `${config.color}10`
                      }}
                    >
                      {/* 渐变背景条 */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-2 rounded-l-xl"
                        style={{ backgroundColor: config.color }}
                      />

                      {/* 主内容 */}
                      <div className="flex items-center p-4 sm:p-5 pl-6 sm:pl-8">
                        {/* 左侧：店铺名称 */}
                        <div className="w-28 sm:w-32 flex-shrink-0">
                          <h3
                            className="text-base sm:text-lg font-bold transition-colors duration-200 group-hover:scale-105"
                            style={{
                              color: config.color === '#000000' ? '#1f2937' : config.color,
                            }}
                          >
                            {config.name}
                          </h3>
                        </div>

                        {/* 中间：提示信息（居中） */}
                        <div className="flex-1 flex justify-center items-center space-x-2 sm:space-x-4">
                          <div className="flex items-center text-xs sm:text-sm" style={{ color: '#6b7280' }}>
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: config.color === '#000000' ? '#1f2937' : config.color }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="mr-1 hidden sm:inline">额度:</span>
                            <span className="font-bold text-sm sm:text-base" style={{ color: '#059669' }}>
                              {config.minStock}-{config.maxStock}⚡
                            </span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm" style={{ color: '#6b7280' }}>
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: config.color === '#000000' ? '#1f2937' : config.color }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12 a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="mr-1 hidden sm:inline">折扣:</span>
                            <span className="font-bold text-sm sm:text-base" style={{ color: '#2563eb' }}>
                              {(config.stockDiscount * 10).toFixed(1)}折
                            </span>
                          </div>
                        </div>

                        {/* 右侧：箭头图标 */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                             style={{ backgroundColor: `${config.color}25` }}>
                          <svg
                            className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ color: config.color === '#000000' ? '#1f2937' : config.color }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>

                      {/* 底部装饰条 */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1"
                        style={{
                          background: `linear-gradient(to right, transparent, ${config.color}, transparent)`
                        }}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* 底部提示 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 bg-white/60 backdrop-blur-sm inline-block px-4 py-2 rounded-full shadow-sm">
                💡 点击店铺等级查看详细信息和开始模拟
              </p>
            </div>
          </div>
        )}

        {/* 推荐系统输入界面 */}
        {currentView === 'recommendation' && (
          <Card className="max-w-lg mx-auto w-full animate-in fade-in-0 zoom-in-95 duration-300 shadow-xl border-0">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToShopSelection} className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full">
                  ←
                </Button>
                <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🎯 智能推荐系统
                </CardTitle>
                <div className="w-8" />
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
                    type="number"
                    placeholder="请输入您的预算"
                    min="1000"
                    step="100"
                    value={recommendBudget}
                    onChange={(e) => setRecommendBudget(e.target.value)}
                    className="focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 h-12"
                  />
                  <p className="text-sm text-gray-500">
                    系统将根据您的预算推荐最合适的店铺等级和进货额度（进货成本不超过预算）
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
                    type="number"
                    placeholder="请输入期望的利润"
                    min="100"
                    step="100"
                    value={recommendProfit}
                    onChange={(e) => setRecommendProfit(e.target.value)}
                    className="focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 h-12"
                  />
                  <p className="text-sm text-gray-500">
                    系统将根据您的期望利润推荐最合适的店铺等级
                  </p>
                </div>
              )}

              {/* 周期输入 */}
              <div className="space-y-2">
                <Label htmlFor="recommendPeriod" className="text-sm font-medium text-gray-700">
                  周期天数（可选）
                </Label>
                <Input
                  id="recommendPeriod"
                  type="number"
                  placeholder="留空则按完整销售周期计算"
                  min="1"
                  max="30"
                  value={recommendPeriod}
                  onChange={(e) => setRecommendPeriod(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 h-12"
                />
                <p className="text-sm text-gray-500">
                  输入1-30天的周期，系统将根据周期计算推荐方案（留空则按完整销售周期计算）
                </p>
              </div>

              <Button
                className="w-full h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={handleRecommend}
                disabled={
                  (recommendInputType === 'budget' && (!recommendBudget || parseInt(recommendBudget) <= 0)) ||
                  (recommendInputType === 'profit' && (!recommendProfit || parseInt(recommendProfit) <= 0)) ||
                  (recommendPeriod !== '' && (parseInt(recommendPeriod) < 1 || parseInt(recommendPeriod) > 30))
                }
              >
                生成推荐方案 (Enter)
              </Button>

              {/* 使用提示 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 p-4 rounded-xl">
                <h4 className="font-semibold text-purple-800 mb-2 text-sm">💡 使用提示</h4>
                <ul className="text-xs sm:text-sm text-purple-700 space-y-1 list-disc list-inside">
                  <li>按预算推荐：系统会根据您的预算，推荐最匹配的进货额度和店铺等级</li>
                  <li>按利润推荐：系统会根据您的期望利润，推荐能够达到该利润的店铺等级</li>
                  <li>周期选项：输入1-30天的周期，系统将根据周期计算推荐方案（留空则按完整销售周期计算）</li>
                  <li>推荐结果按匹配度从高到低排序，您可以选择任意方案直接开始模拟</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 推荐结果界面 */}
        {currentView === 'recommendationResult' && (
          <Card className="max-w-4xl mx-auto w-full animate-in fade-in-0 slide-in-from-top-4 duration-300 shadow-xl border-0">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setCurrentView('recommendation')} className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full">
                  ←
                </Button>
                <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🎯 推荐方案
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
                                  匹配度: {result.matchScore.toFixed(0)}%
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
                              <p className="text-xs text-gray-500 mb-1">进货成本</p>
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
                                {result.completionDays}天
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
          <Card className="max-w-lg mx-auto w-full animate-in fade-in-0 zoom-in-95 duration-300 shadow-xl border-0">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToShopSelection} className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full">
                  ←
                </Button>
                <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {levelConfig.name}
                </CardTitle>
                <div className="w-8" />
              </div>
            </CardHeader>
            <CardContent className="space-y-5 sm:space-y-6 px-6 pb-6">
              <div className="space-y-2">
                <Label htmlFor="stockAmount" className="text-sm font-medium text-gray-700">
                  进货额度（100的整倍数）
                </Label>
                <Input
                  id="stockAmount"
                  type="number"
                  placeholder="请输入进货额度"
                  min={levelConfig.minStock}
                  max={levelConfig.maxStock}
                  step="100"
                  value={stockInputValue}
                  onChange={(e) => handleStockInputChange(e.target.value)}
                  className={`${stockError ? 'border-red-500 ring-red-500' : ''} focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 h-12`}
                />
                <p className={`text-xs sm:text-sm ${stockError ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                  {stockError || `进货额度范围：${levelConfig.minStock} - ${levelConfig.maxStock}电费`}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cloudBalance" className="text-sm font-medium text-gray-700">
                  云店余额
                </Label>
                <Input
                  id="cloudBalance"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={cloudBalanceInputValue}
                  onChange={(e) => handleCloudBalanceInputChange(e.target.value)}
                  disabled={isEditCloudBalance}
                  className={`${cloudBalanceError ? 'border-red-500 ring-red-500' : ''} ${isEditCloudBalance ? 'bg-gray-50 border-gray-200' : ''} focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 h-12`}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editCloudBalance"
                    checked={isEditCloudBalance}
                    onCheckedChange={handleToggleEditCloudBalance}
                    className="active:scale-95 transition-all duration-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label
                    htmlFor="editCloudBalance"
                    className="text-sm font-normal cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    与进货额度同步
                  </Label>
                </div>
                {cloudBalanceError && (
                  <p className="text-sm text-red-500 font-medium">{cloudBalanceError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxBalance" className="text-sm font-medium text-gray-700">
                  云店历史最高余额
                </Label>
                <Input
                  id="maxBalance"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={maxBalanceInputValue}
                  onChange={(e) => handleMaxBalanceInputChange(e.target.value)}
                  disabled={isEditMaxBalance}
                  className={`${maxBalanceError ? 'border-red-500 ring-red-500' : ''} ${isEditMaxBalance ? 'bg-gray-50 border-gray-200' : ''} focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 h-12`}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editMaxBalance"
                    checked={isEditMaxBalance}
                    onCheckedChange={handleToggleEditMaxBalance}
                    className="active:scale-95 transition-all duration-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label
                    htmlFor="editMaxBalance"
                    className="text-sm font-normal cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    与云店余额同步
                  </Label>
                </div>
                {maxBalanceError && (
                  <p className="text-sm text-red-500 font-medium">{maxBalanceError}</p>
                )}
              </div>

              <Button
                className="w-full h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={handleConfirmStock}
                disabled={
                  (!stockAmount && !cloudBalance) ||
                  (stockAmount > 0 && !!stockError) ||
                  (cloudBalance > 0 && !!cloudBalanceError) ||
                  (maxBalance > 0 && !!maxBalanceError)
                }
              >
                确认进货 (Enter)
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 店铺详情界面 */}
        {currentView === 'levelDetails' && levelConfig && detailsData && (
          <Card className="max-w-3xl mx-auto w-full animate-in fade-in-0 zoom-in-95 duration-300 shadow-xl border-0">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToStockInput} className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full">
                  ←
                </Button>
                <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {levelConfig.name}详情
                </CardTitle>
                <div className="w-8" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1.5">进货额度</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-800">
                    {detailsData.calculationBalance}⚡
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-green-100">
                  <p className="text-xs sm:text-sm text-green-600 mb-1.5">进货成本</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">
                    {detailsData.stockCost}元
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-blue-100">
                  <p className="text-xs sm:text-sm text-blue-600 mb-1.5">每日代缴额度</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-600">
                    {detailsData.dailyCommission}⚡
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-purple-100">
                  <p className="text-xs sm:text-sm text-purple-600 mb-1.5">销售完成天数</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-600">
                    {detailsData.completionDays}天
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                <div className="flex justify-between items-center">
                  <p className="text-white font-medium">总利润</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {detailsData.totalProfit}元
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <Button
                  className="flex-1 h-12 sm:h-14 active:scale-95 transition-all duration-200 hover:shadow-lg"
                  onClick={handleAddToComparison}
                  disabled={currentComparisonId !== null}
                  variant={currentComparisonId ? "secondary" : "default"}
                >
                  {currentComparisonId ? '✓ 已加入对比' : '加入对比'}
                </Button>
                <Button
                  className="flex-1 h-12 sm:h-14 active:scale-95 transition-all duration-200 hover:shadow-lg"
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
          <Card className="max-w-3xl mx-auto w-full animate-in fade-in-0 slide-in-from-right-8 duration-300 shadow-xl border-0">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToLevelDetails} className="active:scale-90 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-full">
                  ←
                </Button>
                <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  销售详情
                </CardTitle>
                <div className="w-8" />
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="overflow-x-auto -mx-6 px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 hover:bg-blue-50/50">
                      <TableHead className="text-center font-semibold text-gray-700">销售日期</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700">销售额度</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700">利润</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700 hidden sm:table-cell">结算时间</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700 hidden sm:table-cell">结算金额</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.map((sale, index) => (
                      <TableRow key={index} className="hover:bg-blue-50/30 transition-colors duration-200">
                        <TableCell className="text-center font-medium">{sale.date}</TableCell>
                        <TableCell className="text-center font-semibold text-gray-800">{sale.amount}⚡</TableCell>
                        <TableCell className="text-center text-green-600 font-semibold">
                          {sale.profit.toFixed(2)}元
                        </TableCell>
                        <TableCell className="text-center text-gray-600 hidden sm:table-cell">{sale.settlementDate}</TableCell>
                        <TableCell className="text-center text-gray-800 font-medium hidden sm:table-cell">
                          {sale.settlementAmount.toFixed(2)}元
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
                      <TableCell className="text-center font-bold text-blue-700">
                        {salesData.reduce((sum, s) => sum + s.profit, 0).toFixed(2)}元
                      </TableCell>
                      <TableCell className="text-center font-bold text-blue-700 hidden sm:table-cell">-</TableCell>
                      <TableCell className="text-center font-bold text-blue-700 hidden sm:table-cell">
                        {salesData.reduce((sum, s) => sum + s.settlementAmount, 0).toFixed(2)}元
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
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
          <Card className="max-w-4xl mx-auto animate-in fade-in-0 slide-in-from-top-4 duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToLevelDetails} className="active:scale-90 transition-transform duration-100">
                  ←
                </Button>
                <CardTitle className="text-2xl">数据对比详情</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearComparison}
                  disabled={comparisonData.length === 0}
                  className="active:scale-95 transition-transform duration-100"
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
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center font-semibold text-gray-700">店铺等级</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700">进货额度⚡</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700 hidden sm:table-cell">进货成本(元)</TableHead>
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
      </main>

      {/* 帮助模态框 */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              使用帮助
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-2">📊</span> 店铺等级说明
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                系统提供7个店铺等级，从青铜到至尊，每个等级对应不同的进货额度范围和折扣比例。
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">🛒</span> 进货流程
              </h4>
              <ol className="list-decimal list-inside text-gray-700 text-sm space-y-2">
                <li className="pl-1">选择你的店铺等级</li>
                <li className="pl-1">输入进货额度（必须是100的整数倍）</li>
                <li className="pl-1">输入或确认云店余额（可手动输入或自动同步）</li>
                <li className="pl-1">输入或确认云店历史最高余额（可手动输入或自动同步）</li>
                <li className="pl-1">点击"确认进货"按钮或按Enter键</li>
              </ol>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-2">🔄</span> 同步说明
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                云店余额默认与进货额度同步，历史最高余额默认与云店余额同步。取消勾选后可手动输入。
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-2">📈</span> 数据对比功能
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                确认进货后，点击"加入对比"按钮可将当前方案加入对比列表。点击"查看对比"可查看所有对比方案，系统会自动标注最优方案（最高利润）。
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-2">💰</span> 结算规则
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                进货第二天自动开始卖出，结算时间为卖出时间+10天。每日回款 = 历史最高余额 × 店铺佣金率（包含本金+利润）。回款以95折结算回来，可以继续进货。
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-2">🔄</span> 复利计算
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                库存有限，每天按卖出比例出货。如黑钻店铺（进货3600，卖出15%），
                每天540，7天卖完。卖出后10天回款结算，回款立即进货增加库存。
                例如：黑钻店铺进货3600，第2-8天卖出，第12-18天连续回款。
                回款资金复利进货，循环滚动实现复利增长。
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-2">🧮</span> 利润计算
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                每日利润 = 卖出额度 × （销售折扣 - 进货折扣）。
                黑钻83折进货、95折卖出，每卖出540元利润64.8元。
                回款10天后结算，结算后资金立即进货，货卖完前新回款可增加库存。
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
