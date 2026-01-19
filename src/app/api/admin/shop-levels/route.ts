import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin/auth';

// 获取所有店铺等级配置
export async function GET(request: NextRequest) {
  const { error, admin } = await verifyAdmin(request);
  if (error || !admin) {
    return NextResponse.json(
      { success: false, message: error || '未授权' },
      { status: 401 }
    );
  }

  try {
    const levels = await prisma.shopLevelConfig.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: levels,
    });
  } catch (error) {
    console.error('获取店铺等级配置错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 更新店铺等级配置
export async function PUT(request: NextRequest) {
  const { error, admin } = await verifyAdmin(request);
  if (error || !admin) {
    return NextResponse.json(
      { success: false, message: error || '未授权' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少配置ID' },
        { status: 400 }
      );
    }

    const level = await prisma.shopLevelConfig.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: level,
    });
  } catch (error) {
    console.error('更新店铺等级配置错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
