import { ShopLevelConfig } from '@/types/shop';

export const shopLevelsConfig: Record<string, ShopLevelConfig> = {
  bronze: {
    name: '青铜店铺',
    minStock: 100,
    maxStock: 3000,
    commissionRate: 0.20,
    stockDiscount: 0.88,
    saleDiscount: 0.95,
    color: '#cd7f32',
    completionDays: 5
  },
  silver: {
    name: '白银店铺',
    minStock: 100,
    maxStock: 6000,
    commissionRate: 0.19,
    stockDiscount: 0.87,
    saleDiscount: 0.95,
    color: '#757575',
    completionDays: 6
  },
  gold: {
    name: '黄金店铺',
    minStock: 100,
    maxStock: 10000,
    commissionRate: 0.18,
    stockDiscount: 0.86,
    saleDiscount: 0.95,
    color: '#ffd700',
    completionDays: 7
  },
  platinum: {
    name: '铂金店铺',
    minStock: 100,
    maxStock: 30000,
    commissionRate: 0.17,
    stockDiscount: 0.85,
    saleDiscount: 0.95,
    color: '#78909c',
    completionDays: 8
  },
  diamond: {
    name: '钻石店铺',
    minStock: 100,
    maxStock: 70000,
    commissionRate: 0.16,
    stockDiscount: 0.84,
    saleDiscount: 0.95,
    color: '#00bcd4',
    completionDays: 9
  },
  blackdiamond: {
    name: '黑钻店铺',
    minStock: 100,
    maxStock: 70000,
    commissionRate: 0.15,
    stockDiscount: 0.83,
    saleDiscount: 0.95,
    color: '#000000',
    completionDays: 10
  },
  royal: {
    name: '至尊店铺',
    minStock: 100,
    maxStock: 70000,
    commissionRate: 0.14,
    stockDiscount: 0.82,
    saleDiscount: 0.95,
    color: '#9c27b0',
    completionDays: 12
  }
};
