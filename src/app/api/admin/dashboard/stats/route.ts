import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin/auth';
import { startOfDay, subDays } from 'date-fns';

// 获取仪表盘统计数据
export async function GET(request: NextRequest) {
  const { error, admin } = await verifyAdmin(request);
  if (error || !admin) {
    return NextResponse.json(
      { success: false, message: error || '未授权' },
      { status: 401 }
    );
  }

  try {
    const now = new Date();
    const today = startOfDay(now);
    const yesterday = startOfDay(subDays(now, 1));

    // 并发查询所有统计数据
    const [
      totalUsers,
      activeUsers,
      totalSimulations,
      todayUsers,
      todaySimulations,
      yesterdayUsers,
      yesterdaySimulations,
      totalRevenue,
      totalProfit,
    ] = await Promise.all([
      // 总用户数
      prisma.user.count(),
      // 活跃用户数（7天内有登录）
      prisma.user.count({
        where: {
          lastActive: {
            gte: subDays(now, 7),
          },
        },
      }),
      // 总模拟次数
      prisma.shopSimulation.count(),
      // 今日注册用户
      prisma.user.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      // 今日模拟次数
      prisma.shopSimulation.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      // 昨日注册用户
      prisma.user.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      }),
      // 昨日模拟次数
      prisma.shopSimulation.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      }),
      // 总销售额
      prisma.shopSimulation.aggregate({
        _sum: {
          totalRevenue: true,
        },
      }),
      // 总利润
      prisma.shopSimulation.aggregate({
        _sum: {
          totalProfit: true,
        },
      }),
    ]);

    // 计算增长率
    const userGrowth = yesterdayUsers > 0
      ? ((todayUsers - yesterdayUsers) / yesterdayUsers * 100).toFixed(2)
      : '0.00';

    const simulationGrowth = yesterdaySimulations > 0
      ? ((todaySimulations - yesterdaySimulations) / yesterdaySimulations * 100).toFixed(2)
      : '0.00';

    // 获取最近7天的模拟次数趋势数据
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(now, 6 - i));
      return date;
    });

    const simulationTrend = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const count = await prisma.shopSimulation.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDay,
            },
          },
        });

        return {
          date: date.toISOString().split('T')[0],
          count,
        };
      })
    );

    // 获取各等级店铺分布
    const levelDistribution = await prisma.shopSimulation.groupBy({
      by: ['level'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // 获取最近10条模拟记录
    const recentSimulations = await prisma.shopSimulation.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            userId: true,
            phone: true,
          },
        },
      },
    });

    const stats = {
      totalUsers,
      activeUsers,
      totalSimulations,
      totalRevenue: totalRevenue._sum.totalRevenue || 0,
      totalProfit: totalProfit._sum.totalProfit || 0,
      todayUsers,
      todaySimulations,
      userGrowth: parseFloat(userGrowth),
      simulationGrowth: parseFloat(simulationGrowth),
      simulationTrend,
      levelDistribution: levelDistribution.map(item => ({
        level: item.level,
        count: item._count.id,
      })),
      recentSimulations: recentSimulations.map(sim => ({
        id: sim.id,
        userId: sim.user.userId,
        phone: sim.user.phone,
        level: sim.level,
        stockAmount: sim.stockAmount,
        period: sim.period,
        totalProfit: sim.totalProfit,
        createdAt: sim.createdAt,
      })),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
