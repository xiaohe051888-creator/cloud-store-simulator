import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin/auth';

// 获取用户列表（分页、搜索）
export async function GET(request: NextRequest) {
  const { error, admin } = await verifyAdmin(request);
  if (error || !admin) {
    return NextResponse.json(
      { success: false, message: error || '未授权' },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where = search
      ? {
          OR: [
            { userId: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {};

    // 并发查询总数和数据
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          lastActive: 'desc',
        },
        select: {
          id: true,
          userId: true,
          phone: true,
          registerTime: true,
          lastActive: true,
          simulationCount: true,
          createdAt: true,
          _count: {
            select: {
              simulations: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: users,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
