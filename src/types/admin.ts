// 管理后台类型定义

// 管理员类型
export interface Admin {
  id: string;
  phone: string;
  name: string;
  role: string;
  createdAt: Date;
  lastLogin?: Date;
}

// 用户类型
export interface User {
  id: string;
  userId: string;
  phone?: string;
  registerTime: Date;
  lastActive: Date;
  simulationCount: number;
  createdAt: Date;
  simulations?: ShopSimulation[];
}

// 店铺模拟数据类型
export interface ShopSimulation {
  id: string;
  userId: string;
  level: string;
  stockAmount: number;
  cloudBalance: number;
  maxBalance: number;
  period: number;
  totalProfit: number;
  totalRevenue: number;
  dailyProfitData: any;
  createdAt: Date;
}

// 店铺等级配置类型
export interface ShopLevelConfig {
  id: string;
  level: string;
  name: string;
  minStock: number;
  maxStock: number;
  commissionRate: number;
  stockDiscount: number;
  saleDiscount: number;
  color: string;
  completionDays: number;
  settlementDays: number;
  settlementDiscount: number;
  sellRatio: number;
  isActive: boolean;
}

// 福利类型
export interface Benefit {
  id: string;
  title: string;
  category: string;
  description: string;
  requirements?: string;
  content: string;
  priority: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

// 公告类型
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: number;
  isActive: boolean;
  isPinned: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

// 统计数据类型
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSimulations: number;
  totalRevenue: number;
  totalProfit: number;
  todayUsers: number;
  todaySimulations: number;
  userGrowth: number; // 增长率
  simulationGrowth: number; // 增长率
}

// 用户奖励类型
export interface UserReward {
  id: string;
  userId: string;
  benefitId?: string;
  status: string;
  note?: string;
  adminId?: string;
  claimedAt?: Date;
  createdAt: Date;
}

// 系统日志类型
export interface SystemLog {
  id: string;
  adminId?: string;
  action: string;
  resource: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// 登录请求类型
export interface LoginRequest {
  phone: string;
  code: string;
}

// 登录响应类型
export interface LoginResponse {
  token: string;
  admin: Admin;
}

// 分页请求类型
export interface PaginationRequest {
  page: number;
  pageSize: number;
  search?: string;
  filter?: any;
}

// 分页响应类型
export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
