// 后台管理系统前端数据管理工具（使用localStorage）

// 数据类型定义
export interface User {
  id: string;
  phone: string;
  nickname: string;
  shopLevel: number;
  initialStock: number;
  dailyProfit: number;
  settlementDays: number;
  totalSales: number;
  totalProfit: number;
  shopDays: number;
  lastLoginAt: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'coupon' | 'gift' | 'other';
  value: number;
  minValue: number;
  days: number;
  shopLevelRequired: number;
  stock: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  todayUsers: number;
  totalSales: number;
  totalProfit: number;
}

// LocalStorage 键名
const STORAGE_KEYS = {
  USERS: 'admin_users',
  ANNOUNCEMENTS: 'admin_announcements',
  BENEFITS: 'admin_benefits',
  ADMIN_INFO: 'adminInfo',
};

// 模拟数据初始化
export function initializeMockData() {
  // 检查是否已初始化
  if (localStorage.getItem(STORAGE_KEYS.USERS)) {
    return;
  }

  // 初始化用户数据
  const mockUsers: User[] = [
    {
      id: '1',
      phone: '13800138000',
      nickname: '张三',
      shopLevel: 1,
      initialStock: 10000,
      dailyProfit: 500,
      settlementDays: 15,
      totalSales: 15000,
      totalProfit: 7500,
      shopDays: 30,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      phone: '13800138001',
      nickname: '李四',
      shopLevel: 2,
      initialStock: 20000,
      dailyProfit: 1200,
      settlementDays: 15,
      totalSales: 36000,
      totalProfit: 18000,
      shopDays: 45,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      phone: '13800138002',
      nickname: '王五',
      shopLevel: 3,
      initialStock: 50000,
      dailyProfit: 3500,
      settlementDays: 15,
      totalSales: 105000,
      totalProfit: 52500,
      shopDays: 60,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      phone: '13900139000',
      nickname: '赵六',
      shopLevel: 1,
      initialStock: 10000,
      dailyProfit: 450,
      settlementDays: 15,
      totalSales: 13500,
      totalProfit: 6750,
      shopDays: 20,
      lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      phone: '13900139001',
      nickname: '钱七',
      shopLevel: 2,
      initialStock: 25000,
      dailyProfit: 1500,
      settlementDays: 15,
      totalSales: 45000,
      totalProfit: 22500,
      shopDays: 35,
      lastLoginAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // 初始化公告数据
  const mockAnnouncements: Announcement[] = [
    {
      id: '1',
      title: '系统升级通知',
      content: '系统将于本周六凌晨2:00-4:00进行升级维护，期间可能影响部分功能使用，请提前做好准备。',
      type: 'warning',
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: '新功能上线',
      content: '云店模拟器新增智能推荐功能，可根据您的经营数据自动推荐最优经营策略。',
      type: 'success',
      isPublished: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: '运营数据报告',
      content: '本周平台总交易额增长15%，活跃用户数增加200人，各店铺等级分布较为均衡。',
      type: 'info',
      isPublished: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // 初始化优惠活动数据
  const mockBenefits: Benefit[] = [
    {
      id: '1',
      title: '新店开业大礼包',
      description: '新用户注册即送1000元启动资金',
      type: 'gift',
      value: 1000,
      minValue: 0,
      days: 0,
      shopLevelRequired: 1,
      stock: 9999,
      usedCount: 156,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: '进货折扣券',
      description: '进货满5000元立减200元',
      type: 'coupon',
      value: 200,
      minValue: 5000,
      days: 7,
      shopLevelRequired: 1,
      stock: 500,
      usedCount: 328,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'VIP专属优惠',
      description: '3级及以上店铺享受进货95折',
      type: 'discount',
      value: 5,
      minValue: 10000,
      days: 0,
      shopLevelRequired: 3,
      stock: 9999,
      usedCount: 89,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      title: '结算加速服务',
      description: '结算周期缩短至7天',
      type: 'other',
      value: 0,
      minValue: 0,
      days: 0,
      shopLevelRequired: 2,
      stock: 200,
      usedCount: 67,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  // 保存到localStorage
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(mockAnnouncements));
  localStorage.setItem(STORAGE_KEYS.BENEFITS, JSON.stringify(mockBenefits));
}

// 用户管理
export const userStorage = {
  getAll: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): User | undefined => {
    const users = userStorage.getAll();
    return users.find(u => u.id === id);
  },

  create: (user: Omit<User, 'id' | 'createdAt'>): User => {
    const users = userStorage.getAll();
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  update: (id: string, updates: Partial<User>): User | undefined => {
    const users = userStorage.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;

    users[index] = { ...users[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[index];
  },

  delete: (id: string): boolean => {
    const users = userStorage.getAll();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    return true;
  },

  search: (query: string): User[] => {
    const users = userStorage.getAll();
    const lowerQuery = query.toLowerCase();
    return users.filter(
      u =>
        u.nickname.toLowerCase().includes(lowerQuery) ||
        u.phone.includes(lowerQuery) ||
        u.shopLevel.toString().includes(lowerQuery)
    );
  },

  filterByLevel: (level?: number): User[] => {
    const users = userStorage.getAll();
    return level ? users.filter(u => u.shopLevel === level) : users;
  },
};

// 公告管理
export const announcementStorage = {
  getAll: (): Announcement[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Announcement | undefined => {
    const announcements = announcementStorage.getAll();
    return announcements.find(a => a.id === id);
  },

  create: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Announcement => {
    const announcements = announcementStorage.getAll();
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    announcements.unshift(newAnnouncement);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    return newAnnouncement;
  },

  update: (id: string, updates: Partial<Omit<Announcement, 'id' | 'createdAt'>>): Announcement | undefined => {
    const announcements = announcementStorage.getAll();
    const index = announcements.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    announcements[index] = { ...announcements[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    return announcements[index];
  },

  delete: (id: string): boolean => {
    const announcements = announcementStorage.getAll();
    const filtered = announcements.filter(a => a.id !== id);
    if (filtered.length === announcements.length) return false;

    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
    return true;
  },

  togglePublish: (id: string): Announcement | undefined => {
    const announcements = announcementStorage.getAll();
    const index = announcements.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    announcements[index].isPublished = !announcements[index].isPublished;
    announcements[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    return announcements[index];
  },
};

// 优惠活动管理
export const benefitStorage = {
  getAll: (): Benefit[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BENEFITS);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Benefit | undefined => {
    const benefits = benefitStorage.getAll();
    return benefits.find(b => b.id === id);
  },

  create: (benefit: Omit<Benefit, 'id' | 'createdAt'>): Benefit => {
    const benefits = benefitStorage.getAll();
    const newBenefit: Benefit = {
      ...benefit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    benefits.unshift(newBenefit);
    localStorage.setItem(STORAGE_KEYS.BENEFITS, JSON.stringify(benefits));
    return newBenefit;
  },

  update: (id: string, updates: Partial<Benefit>): Benefit | undefined => {
    const benefits = benefitStorage.getAll();
    const index = benefits.findIndex(b => b.id === id);
    if (index === -1) return undefined;

    benefits[index] = { ...benefits[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.BENEFITS, JSON.stringify(benefits));
    return benefits[index];
  },

  delete: (id: string): boolean => {
    const benefits = benefitStorage.getAll();
    const filtered = benefits.filter(b => b.id !== id);
    if (filtered.length === benefits.length) return false;

    localStorage.setItem(STORAGE_KEYS.BENEFITS, JSON.stringify(filtered));
    return true;
  },

  toggleActive: (id: string): Benefit | undefined => {
    const benefits = benefitStorage.getAll();
    const index = benefits.findIndex(b => b.id === id);
    if (index === -1) return undefined;

    benefits[index].isActive = !benefits[index].isActive;
    localStorage.setItem(STORAGE_KEYS.BENEFITS, JSON.stringify(benefits));
    return benefits[index];
  },
};

// 仪表盘统计
export const dashboardStorage = {
  getStats: (): DashboardStats => {
    const users = userStorage.getAll();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayUsers = users.filter(u => new Date(u.lastLoginAt) >= todayStart).length;
    const activeUsers = users.filter(u => {
      const lastLogin = new Date(u.lastLoginAt);
      const daysSinceLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin <= 7;
    }).length;

    return {
      totalUsers: users.length,
      activeUsers,
      todayUsers,
      totalSales: users.reduce((sum, u) => sum + u.totalSales, 0),
      totalProfit: users.reduce((sum, u) => sum + u.totalProfit, 0),
    };
  },

  getUserGrowthData: () => {
    const users = userStorage.getAll();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const growthData = last30Days.map(date => {
      const count = users.filter(u => u.createdAt.split('T')[0] === date).length;
      return { date, count };
    });

    return growthData;
  },

  getLevelDistribution: () => {
    const users = userStorage.getAll();
    const distribution: Record<number, number> = {};

    users.forEach(u => {
      distribution[u.shopLevel] = (distribution[u.shopLevel] || 0) + 1;
    });

    return Object.entries(distribution).map(([level, count]) => ({
      level: parseInt(level),
      count,
    }));
  },
};

// 认证管理
export const authStorage = {
  login: (phone: string): boolean => {
    // 模拟验证码登录（任意4-6位数字验证码都可以）
    const adminInfo = {
      phone,
      name: '管理员',
      role: 'admin',
      loginAt: new Date().toISOString(),
    };

    localStorage.setItem('adminToken', 'mock-token-' + Date.now());
    localStorage.setItem(STORAGE_KEYS.ADMIN_INFO, JSON.stringify(adminInfo));
    return true;
  },

  logout: (): void => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem(STORAGE_KEYS.ADMIN_INFO);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('adminToken');
  },

  getAdminInfo: () => {
    const info = localStorage.getItem(STORAGE_KEYS.ADMIN_INFO);
    return info ? JSON.parse(info) : null;
  },
};
