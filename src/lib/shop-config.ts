import { ShopLevelConfig } from '@/types/shop';

export const shopLevelsConfig: Record<string, ShopLevelConfig> = {
  bronze: {
    name: '青铜店铺',
    minStock: 100,
    maxStock: 3000,
    commissionRate: 0.20,
    stockDiscount: 0.88,
    saleDiscount: 0.95,
    color: '#d97706',
    completionDays: 5,
    settlementDays: 10,      // 结算周期：卖出后10天回款
    settlementDiscount: 0.95, // 结算折扣：95折回款
    sellRatio: 0.20          // 卖出比例：20%
  },
  silver: {
    name: '白银店铺',
    minStock: 100,
    maxStock: 6000,
    commissionRate: 0.19,
    stockDiscount: 0.87,
    saleDiscount: 0.95,
    color: '#64748b',
    completionDays: 6,
    settlementDays: 10,
    settlementDiscount: 0.95,
    sellRatio: 0.19
  },
  gold: {
    name: '黄金店铺',
    minStock: 100,
    maxStock: 10000,
    commissionRate: 0.18,
    stockDiscount: 0.86,
    saleDiscount: 0.95,
    color: '#eab308',
    completionDays: 7,
    settlementDays: 10,
    settlementDiscount: 0.95,
    sellRatio: 0.18
  },
  platinum: {
    name: '铂金店铺',
    minStock: 100,
    maxStock: 30000,
    commissionRate: 0.17,
    stockDiscount: 0.85,
    saleDiscount: 0.95,
    color: '#0ea5e9',
    completionDays: 8,
    settlementDays: 10,
    settlementDiscount: 0.95,
    sellRatio: 0.17
  },
  diamond: {
    name: '钻石店铺',
    minStock: 100,
    maxStock: 70000,
    commissionRate: 0.16,
    stockDiscount: 0.84,
    saleDiscount: 0.95,
    color: '#14b8a6',
    completionDays: 9,
    settlementDays: 10,
    settlementDiscount: 0.95,
    sellRatio: 0.16
  },
  blackdiamond: {
    name: '黑钻店铺',
    minStock: 100,
    maxStock: 70000,
    commissionRate: 0.15,
    stockDiscount: 0.83,
    saleDiscount: 0.95,
    color: '#000000',
    completionDays: 10,
    settlementDays: 10,
    settlementDiscount: 0.95,
    sellRatio: 0.15          // 卖出比例：15%
  },
  royal: {
    name: '至尊店铺',
    minStock: 100,
    maxStock: 70000,
    commissionRate: 0.14,
    stockDiscount: 0.82,
    saleDiscount: 0.95,
    color: '#a855f7',
    completionDays: 12,
    settlementDays: 10,
    settlementDiscount: 0.95,
    sellRatio: 0.14
  }
};
