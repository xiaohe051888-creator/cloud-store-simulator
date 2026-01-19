import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 创建初始管理员账号
  const adminPhone = process.env.ADMIN_PHONE || '13800138000';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

  // 检查管理员是否已存在
  const existingAdmin = await prisma.admin.findUnique({
    where: { phone: adminPhone },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.admin.create({
      data: {
        phone: adminPhone,
        password: hashedPassword,
        name: '超级管理员',
        role: 'super_admin',
      },
    });

    console.log('✓ 初始管理员账号创建成功');
    console.log(`  手机号: ${adminPhone}`);
    console.log(`  密码: ${adminPassword}`);
  } else {
    console.log('✓ 管理员账号已存在');
  }

  // 初始化店铺等级配置
  const defaultLevels = [
    {
      level: 'bronze',
      name: '青铜店长',
      minStock: 1000,
      maxStock: 5000,
      commissionRate: 0.0003,
      stockDiscount: 0.5,
      saleDiscount: 0.95,
      color: '#cd7f32',
      completionDays: 30,
      settlementDays: 10,
      settlementDiscount: 0.95,
      sellRatio: 0.03,
    },
    {
      level: 'silver',
      name: '白银店长',
      minStock: 5000,
      maxStock: 10000,
      commissionRate: 0.0005,
      stockDiscount: 0.55,
      saleDiscount: 0.93,
      color: '#c0c0c0',
      completionDays: 28,
      settlementDays: 10,
      settlementDiscount: 0.93,
      sellRatio: 0.04,
    },
    {
      level: 'gold',
      name: '黄金店长',
      minStock: 10000,
      maxStock: 50000,
      commissionRate: 0.0007,
      stockDiscount: 0.6,
      saleDiscount: 0.91,
      color: '#ffd700',
      completionDays: 26,
      settlementDays: 10,
      settlementDiscount: 0.91,
      sellRatio: 0.05,
    },
    {
      level: 'platinum',
      name: '白金店长',
      minStock: 50000,
      maxStock: 100000,
      commissionRate: 0.0009,
      stockDiscount: 0.65,
      saleDiscount: 0.89,
      color: '#00bcd4',
      completionDays: 24,
      settlementDays: 10,
      settlementDiscount: 0.89,
      sellRatio: 0.06,
    },
    {
      level: 'diamond',
      name: '钻石店长',
      minStock: 100000,
      maxStock: 500000,
      commissionRate: 0.0011,
      stockDiscount: 0.7,
      saleDiscount: 0.87,
      color: '#1e90ff',
      completionDays: 22,
      settlementDays: 10,
      settlementDiscount: 0.87,
      sellRatio: 0.07,
    },
    {
      level: 'master',
      name: '至尊店长',
      minStock: 500000,
      maxStock: 1000000,
      commissionRate: 0.0013,
      stockDiscount: 0.75,
      saleDiscount: 0.85,
      color: '#000000',
      completionDays: 20,
      settlementDays: 10,
      settlementDiscount: 0.85,
      sellRatio: 0.08,
    },
  ];

  for (const levelData of defaultLevels) {
    const existing = await prisma.shopLevelConfig.findUnique({
      where: { level: levelData.level },
    });

    if (!existing) {
      await prisma.shopLevelConfig.create({
        data: levelData,
      });
      console.log(`✓ ${levelData.name} 配置创建成功`);
    } else {
      console.log(`✓ ${levelData.name} 配置已存在`);
    }
  }

  // 创建示例福利
  const benefits = [
    {
      title: '新人礼品',
      category: 'newbie',
      description: '新用户注册即可领取20元实物礼品',
      requirements: '满足以下条件之一即可领取：\n1. 首次注册\n2. 首次模拟进货\n3. 邀请1位好友注册',
      content: JSON.stringify({
        reward: '价值20元的实物礼品一份（包邮到家）',
        steps: [
          '复制步信号：G2L07V',
          '在平台上下载安装登录步信',
          '点击搜索后输入步信号完成添加',
        ],
      }),
      priority: 10,
    },
    {
      title: '1月个人当天邀请奖励',
      category: 'community',
      description: '每日邀请好友注册可获得现金奖励',
      requirements: '当日邀请好友成功注册并完成首次模拟',
      content: JSON.stringify({
        reward: '每邀请1人奖励5元现金',
        note: '奖励次日结算到步信账户',
      }),
      priority: 5,
    },
  ];

  for (const benefitData of benefits) {
    const existing = await prisma.benefit.findFirst({
      where: { title: benefitData.title },
    });

    if (!existing) {
      await prisma.benefit.create({
        data: benefitData,
      });
      console.log(`✓ ${benefitData.title} 创建成功`);
    } else {
      console.log(`✓ ${benefitData.title} 已存在`);
    }
  }

  // 创建示例公告
  const announcements = [
    {
      title: '欢迎使用云店模拟器',
      content: '欢迎使用云店模拟器，请仔细阅读福利介绍，积极参与活动获取奖励！',
      type: 'info',
      priority: 10,
      isPinned: true,
    },
  ];

  for (const announcementData of announcements) {
    const existing = await prisma.announcement.findFirst({
      where: { title: announcementData.title },
    });

    if (!existing) {
      await prisma.announcement.create({
        data: announcementData,
      });
      console.log(`✓ ${announcementData.title} 创建成功`);
    } else {
      console.log(`✓ ${announcementData.title} 已存在`);
    }
  }

  console.log('\n数据库初始化完成！');
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
