'use client';

import { useState } from 'react';
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
import {
  shopLevelsConfig,
} from '@/lib/shop-config';
import {
  formatDate,
  generateSalesData,
  validateStockAmount,
  validateMaxBalance,
} from '@/lib/shop-utils';
import type { ShopLevel, ViewType, SalesData } from '@/types/shop';

export default function CloudShopSimulator() {
  // 应用状态
  const [currentLevel, setCurrentLevel] = useState<ShopLevel | null>(null);
  const [stockAmount, setStockAmount] = useState<number>(0);
  const [maxBalance, setMaxBalance] = useState<number>(0);
  const [currentView, setCurrentView] = useState<ViewType>('shopSelection');
  const [isEditMaxBalance, setIsEditMaxBalance] = useState<boolean>(true);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  
  // 输入框值状态
  const [stockInputValue, setStockInputValue] = useState<string>('');
  const [maxBalanceInputValue, setMaxBalanceInputValue] = useState<string>('0');
  
  // 错误状态
  const [stockError, setStockError] = useState<string>('');
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
    setMaxBalanceInputValue('0');
    setStockAmount(0);
    setMaxBalance(0);
    setIsEditMaxBalance(true);
    setStockError('');
    setMaxBalanceError('');
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
      if (!validation.valid) {
        setStockError(validation.error || '');
        return;
      }
      
      setStockError('');
      setStockAmount(numValue);
      
      // 如果同步模式，更新最高余额
      if (isEditMaxBalance) {
        setMaxBalance(numValue);
        setMaxBalanceInputValue(String(numValue));
      }
    }
  };

  // 处理最高余额输入
  const handleMaxBalanceInputChange = (value: string) => {
    setMaxBalanceInputValue(value);
    const numValue = parseInt(value) || 0;
    
    const validation = validateMaxBalance(numValue, stockAmount);
    if (!validation.valid) {
      setMaxBalanceError(validation.error || '');
      return;
    }
    
    setMaxBalanceError('');
    setMaxBalance(numValue);
  };

  // 切换同步最高余额
  const handleToggleEditMaxBalance = (checked: boolean) => {
    setIsEditMaxBalance(checked);
    
    if (checked && stockAmount > 0) {
      setMaxBalance(stockAmount);
      setMaxBalanceInputValue(String(stockAmount));
    }
  };

  // 确认进货
  const handleConfirmStock = () => {
    if (!currentLevel || !levelConfig) return;
    
    const numValue = parseInt(stockInputValue) || 0;
    const stockValidation = validateStockAmount(numValue, levelConfig);
    
    if (!stockValidation.valid) {
      setStockError(stockValidation.error || '');
      return;
    }
    
    const maxBalanceValidation = validateMaxBalance(maxBalance, numValue);
    if (!maxBalanceValidation.valid) {
      setMaxBalanceError(maxBalanceValidation.error || '');
      return;
    }
    
    // 生成销售数据
    const dailyCommission = Math.round(maxBalance * levelConfig.commissionRate);
    const dailyProfit = dailyCommission * (levelConfig.saleDiscount - levelConfig.stockDiscount);
    const data = generateSalesData(numValue, dailyCommission, dailyProfit);
    setSalesData(data);
    
    setCurrentView('levelDetails');
  };

  // 查看销售详情
  const handleViewSalesDetails = () => {
    setCurrentView('salesDetails');
  };

  // 计算详情数据
  const getDetailsData = () => {
    if (!levelConfig) return null;
    
    const stockCost = Math.round(stockAmount * levelConfig.stockDiscount);
    const dailyCommission = Math.round(maxBalance * levelConfig.commissionRate);
    const completionDays = Math.ceil(stockAmount / dailyCommission);
    const totalProfit = Math.round(stockAmount * (levelConfig.saleDiscount - levelConfig.stockDiscount));
    
    return { stockCost, dailyCommission, completionDays, totalProfit };
  };

  const detailsData = getDetailsData();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">云店模拟器</h1>
          <div className="flex items-center space-x-4">
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
                    与进货额度同步
                  </Label>
                </div>
                {maxBalanceError && (
                  <p className="text-sm text-red-500">{maxBalanceError}</p>
                )}
              </div>

              <Button
                className="w-full h-14 text-lg"
                onClick={handleConfirmStock}
                disabled={!stockAmount || !!stockError || !!maxBalanceError}
              >
                确认进货
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
                    {stockAmount}⚡
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

              <Button
                className="w-full h-12"
                onClick={handleViewSalesDetails}
              >
                查看销售详情
              </Button>

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
                <li>输入或确认云店历史最高余额</li>
                <li>点击"确认进货"按钮</li>
              </ol>
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
