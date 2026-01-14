import { SalesData } from '@/types/shop';

// 格式化日期为 MM-DD 格式
export function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

// 生成销售数据
export function generateSalesData(
  totalAmount: number,
  dailyAmount: number,
  dailyProfit: number
): SalesData[] {
  const salesData: SalesData[] = [];
  let remainingAmount = totalAmount;
  const today = new Date();
  
  // 进货第二天开始卖出
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 1);
  
  let currentDate = new Date(startDate);
  
  while (remainingAmount > 0) {
    const saleAmount = Math.min(dailyAmount, remainingAmount);
    const saleProfit = (saleAmount / dailyAmount) * dailyProfit;
    const settlementDate = new Date(currentDate);
    settlementDate.setDate(currentDate.getDate() + 10);
    const settlementAmount = saleAmount * 0.95; // 95折结算
    
    salesData.push({
      date: formatDate(currentDate),
      amount: saleAmount,
      profit: saleProfit,
      settlementDate: formatDate(settlementDate),
      settlementAmount: settlementAmount
    });
    
    remainingAmount -= saleAmount;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return salesData;
}

// 验证进货额度
export function validateStockAmount(
  value: number,
  levelConfig: { minStock: number; maxStock: number }
): { valid: boolean; error?: string } {
  if (isNaN(value) || value <= 0) {
    return { valid: false, error: '请输入有效的进货额度' };
  }
  
  if (value % 100 !== 0) {
    return { valid: false, error: '进货额度必须是100的整数倍' };
  }
  
  if (value < levelConfig.minStock || value > levelConfig.maxStock) {
    return {
      valid: false,
      error: `进货额度范围：${levelConfig.minStock} - ${levelConfig.maxStock}电费`
    };
  }
  
  return { valid: true };
}

// 验证云店余额
export function validateCloudBalance(cloudBalance: number, stockAmount: number): { valid: boolean; error?: string } {
  if (cloudBalance < stockAmount) {
    return { valid: false, error: '云店余额必须大于或等于进货额度' };
  }
  return { valid: true };
}

// 验证最高余额
export function validateMaxBalance(maxBalance: number, cloudBalance: number): { valid: boolean; error?: string } {
  if (maxBalance < cloudBalance) {
    return { valid: false, error: '云店历史最高余额必须大于或等于云店余额' };
  }
  return { valid: true };
}
