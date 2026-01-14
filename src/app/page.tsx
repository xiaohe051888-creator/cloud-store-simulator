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
import type { ShopLevel, ViewType, SalesData, ComparisonData } from '@/types/shop';

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
      minLevelName: minItem?.levelName || ''
    };
  }, [comparisonData]);

  // 处理Enter键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentView === 'stockInput') {
      e.preventDefault();
      handleConfirmStock();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100" onKeyDown={handleKeyDown}>
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">云店模拟器</h1>
          <div className="flex items-center space-x-4">
            {comparisonData.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewComparison}
              >
                查看对比 ({comparisonData.length})
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHelpOpen(true)}
            >
              ?
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-6">
        {/* 店铺选择界面 */}
        {currentView === 'shopSelection' && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-xl text-center">请选择你的店铺等级</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              {(Object.keys(shopLevelsConfig) as ShopLevel[]).map((level) => {
                const config = shopLevelsConfig[level];
                return (
                  <Button
                    key={level}
                    variant="outline"
                    className="flex items-center justify-between min-h-[70px] hover:opacity-80 transition-opacity"
                    style={{
                      borderColor: config.color,
                      backgroundColor: `${config.color}20`,
                      color: config.color === '#000000' ? '#000' : config.color
                    }}
                    onClick={() => handleSelectLevel(level)}
                  >
                    <span className="text-lg font-semibold">{config.name}</span>
                    <span className="text-gray-400">→</span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* 进货额度输入界面 */}
        {currentView === 'stockInput' && levelConfig && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToShopSelection}>
                  ←
                </Button>
                <CardTitle className="text-2xl">{levelConfig.name}</CardTitle>
                <div className="w-8" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="stockAmount">
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
                  className={stockError ? 'border-red-500' : ''}
                />
                <p className={`text-sm ${stockError ? 'text-red-500' : 'text-gray-500'}`}>
                  {stockError || `进货额度范围：${levelConfig.minStock} - ${levelConfig.maxStock}电费`}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cloudBalance">
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
                  className={cloudBalanceError ? 'border-red-500' : isEditCloudBalance ? 'bg-gray-100' : ''}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editCloudBalance"
                    checked={isEditCloudBalance}
                    onCheckedChange={handleToggleEditCloudBalance}
                  />
                  <Label
                    htmlFor="editCloudBalance"
                    className="text-sm font-normal cursor-pointer"
                  >
                    与进货额度同步
                  </Label>
                </div>
                {cloudBalanceError && (
                  <p className="text-sm text-red-500">{cloudBalanceError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxBalance">
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
                  className={maxBalanceError ? 'border-red-500' : isEditMaxBalance ? 'bg-gray-100' : ''}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editMaxBalance"
                    checked={isEditMaxBalance}
                    onCheckedChange={handleToggleEditMaxBalance}
                  />
                  <Label
                    htmlFor="editMaxBalance"
                    className="text-sm font-normal cursor-pointer"
                  >
                    与云店余额同步
                  </Label>
                </div>
                {maxBalanceError && (
                  <p className="text-sm text-red-500">{maxBalanceError}</p>
                )}
              </div>

              <Button
                className="w-full h-14 text-lg"
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
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToStockInput}>
                  ←
                </Button>
                <CardTitle className="text-2xl">{levelConfig.name}详情</CardTitle>
                <div className="w-8" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">进货额度</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {detailsData.calculationBalance}⚡
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">进货成本</p>
                  <p className="text-xl font-semibold text-green-600">
                    {detailsData.stockCost}元
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">每日代缴额度</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {detailsData.dailyCommission}⚡
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">销售完成天数</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {detailsData.completionDays}天
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">总利润</p>
                  <p className="text-2xl font-bold text-green-600">
                    {detailsData.totalProfit}元
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 h-12"
                  onClick={handleAddToComparison}
                  disabled={currentComparisonId !== null}
                >
                  {currentComparisonId ? '✓ 已加入对比' : '加入对比'}
                </Button>
                <Button
                  className="flex-1 h-12"
                  onClick={handleViewSalesDetails}
                >
                  查看销售详情
                </Button>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-700">
                  进货第二天自动开始卖出，结算时间为卖出时间+10天。例如：12月20日卖出的电费，12月30日以95折结算回来本金和利润。
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 销售详情界面 */}
        {currentView === 'salesDetails' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToLevelDetails}>
                  ←
                </Button>
                <CardTitle className="text-2xl">销售详情</CardTitle>
                <div className="w-8" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">销售日期</TableHead>
                      <TableHead className="text-center">销售额度</TableHead>
                      <TableHead className="text-center">利润</TableHead>
                      <TableHead className="text-center">结算时间</TableHead>
                      <TableHead className="text-center">结算金额</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.map((sale, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center">{sale.date}</TableCell>
                        <TableCell className="text-center">{sale.amount}⚡</TableCell>
                        <TableCell className="text-center text-green-600">
                          {sale.profit.toFixed(2)}元
                        </TableCell>
                        <TableCell className="text-center">{sale.settlementDate}</TableCell>
                        <TableCell className="text-center">
                          {sale.settlementAmount.toFixed(2)}元
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="text-center font-bold text-blue-600">合计</TableCell>
                      <TableCell className="text-center font-bold text-blue-600">
                        {salesData.reduce((sum, s) => sum + s.amount, 0)}⚡
                      </TableCell>
                      <TableCell className="text-center font-bold text-blue-600">
                        {salesData.reduce((sum, s) => sum + s.profit, 0).toFixed(2)}元
                      </TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center font-bold text-blue-600">
                        {salesData.reduce((sum, s) => sum + s.settlementAmount, 0).toFixed(2)}元
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 font-medium">销售完成天数</p>
                  <p className="text-xl font-bold text-gray-800">
                    {salesData.length}天
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 数据对比界面 */}
        {currentView === 'comparison' && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBackToLevelDetails}>
                  ←
                </Button>
                <CardTitle className="text-2xl">数据对比详情</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearComparison}
                  disabled={comparisonData.length === 0}
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
                          <TableHead className="text-center">店铺等级</TableHead>
                          <TableHead className="text-center">进货额度⚡</TableHead>
                          <TableHead className="text-center">进货成本(元)</TableHead>
                          <TableHead className="text-center">完成天数</TableHead>
                          <TableHead className="text-center">总利润(元)</TableHead>
                          <TableHead className="text-center">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonData.map((item) => {
                          const levelConfig = shopLevelsConfig[item.level];
                          const isMaxProfit = maxProfitId === item.id;
                          const isCurrent = currentComparisonId === item.id;
                          
                          return (
                            <TableRow key={item.id} className={
                              isCurrent ? 'bg-blue-50' : ''
                            }>
                              <TableCell className="text-center font-medium" style={{ color: levelConfig.color }}>
                                {item.levelName}
                              </TableCell>
                              <TableCell className="text-center">{item.stockAmount}</TableCell>
                              <TableCell className="text-center">
                                {item.stockCost}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.completionDays}
                              </TableCell>
                              <TableCell className={`text-center font-bold ${isMaxProfit ? 'text-green-600 text-xl' : ''}`}>
                                {item.totalProfit}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteComparison(item.id)}
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

                  {/* 推荐信息卡片 */}
                  {maxProfitId && profitAnalysis && (() => {
                    const maxItem = comparisonData.find(d => d.id === maxProfitId);
                    if (!maxItem) return null;
                    return (
                      <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-green-800 text-lg mb-1">推荐方案</h4>
                            <p className="text-green-700">
                              推荐您升级到<span className="font-bold text-green-900 mx-1" style={{ color: shopLevelsConfig[maxItem.level].color }}>{maxItem.levelName}</span>，
                              同样的进货额度利润提升<span className="font-bold text-green-900 mx-1">{profitAnalysis.profitDiffRate}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {profitAnalysis && (
                    <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-4 text-lg">利润分析</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-600 mb-2">最低利润</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {profitAnalysis.minProfit}元
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-600 mb-2">最高利润</p>
                          <p className="text-2xl font-bold text-green-600">
                            {profitAnalysis.maxProfit}元
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-600 mb-2">利润差额</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {profitAnalysis.profitDiff}元
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-600 mb-2">利润差额率</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {profitAnalysis.profitDiffRate}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* 帮助模态框 */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>使用帮助</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">店铺等级说明</h4>
              <p className="text-gray-600 text-sm">
                系统提供7个店铺等级，从青铜到至尊，每个等级对应不同的进货额度范围和折扣比例。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">进货流程</h4>
              <ol className="list-decimal list-inside text-gray-600 text-sm space-y-1">
                <li>选择你的店铺等级</li>
                <li>输入进货额度（必须是100的整数倍）</li>
                <li>输入或确认云店余额（可手动输入或自动同步）</li>
                <li>输入或确认云店历史最高余额（可手动输入或自动同步）</li>
                <li>点击"确认进货"按钮或按Enter键</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">同步说明</h4>
              <p className="text-gray-600 text-sm">
                云店余额默认与进货额度同步，历史最高余额默认与云店余额同步。取消勾选后可手动输入。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">数据对比功能</h4>
              <p className="text-gray-600 text-sm">
                确认进货后，点击"加入对比"按钮可将当前方案加入对比列表。点击"查看对比"可查看所有对比方案，系统会自动标注最优方案（最高利润、最低成本、最快完成、最高代缴）。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">结算规则</h4>
              <p className="text-gray-600 text-sm">
                进货第二天自动开始卖出，结算时间为卖出时间+10天。例如：12月20日卖出的电费，12月30日以95折结算回来本金和利润。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">利润计算</h4>
              <p className="text-gray-600 text-sm">
                利润 = 销售折扣 - 进货折扣，即每卖出100电费额度赚的利润。
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
