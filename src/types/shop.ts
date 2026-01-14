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
  | 'shopSelection'
  | 'stockInput'
  | 'levelDetails'
  | 'salesDetails';

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
  maxBalance: number;
  currentView: ViewType;
  isEditMaxBalance: boolean;
}
