// 店铺等级类型
export type ShopLevel = 
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'blackdiamond'
  | 'royal';

// 界面类型
export type ViewType =
  | 'shopSelection'      // 首页菜单
  | 'levelSelection'     // 店铺等级选择（模拟进货）
  | 'stockInput'
  | 'levelDetails'
  | 'salesDetails'
  | 'comparison'
  | 'recommendation'
  | 'recommendationResult'
  | 'shopLevels'
  | 'benefits'           // 福利介绍
  | 'platform';          // 进入平台

// 店铺配置类型
export interface ShopLevelConfig {
  name: string;
  minStock: number;
  maxStock: number;
  commissionRate: number;
  stockDiscount: number;
  saleDiscount: number;
  color: string;
  completionDays: number;
  settlementDays: number;      // 结算周期（天）
  settlementDiscount: number;   // 结算折扣
  sellRatio: number;            // 卖出比例（每日卖出比例）
}

// 销售数据类型
export interface SalesData {
  date: string;
  amount: number;
  profit: number;
  settlementDate: string;
  settlementAmount: number;
}

// 应用状态类型
export interface AppState {
  currentLevel: ShopLevel | null;
  stockAmount: number;
  cloudBalance: number;  // 云店余额
  maxBalance: number;     // 云店历史最高余额
  currentView: ViewType;
  isEditCloudBalance: boolean;  // 是否可手动编辑云店余额
  isEditMaxBalance: boolean;   // 是否可手动编辑历史最高余额
}

// 对比数据类型
export interface ComparisonData {
  id: string;
  level: ShopLevel;
  levelName: string;
  stockAmount: number;
  cloudBalance: number;
  maxBalance: number;
  stockCost: number;
  dailyCommission: number;
  completionDays: number;
  totalProfit: number;
  createdAt: string;
}

// 推荐结果类型
export interface RecommendationResult {
  level: ShopLevel;
  levelName: string;
  recommendedStock: number;
  stockCost: number;
  estimatedProfit: number;
  completionDays: number;
  matchScore: number;
  matchReason: string;
  maxProfit: number;
  minProfit: number;
}
