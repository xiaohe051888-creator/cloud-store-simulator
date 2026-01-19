import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin/auth';

// 获取福利列表
export async function GET(request: NextRequest) {
  const { error, admin } = await verifyAdmin(request);
  if (error || !admin) {
    return NextResponse.json(
      { success: false, message: error || '未授权' },
      { status: 401 }
    );
  }

  try {
    const benefits = await prisma.benefit.findMany({
      orderBy: { priority: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: benefits,
    });
  } catch (error) {
    console.error('获取福利列表错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 创建福利
export async function POST(request: NextRequest) {
  const { error, admin } = await verifyAdmin(request);
  if (error || !admin) {
    return NextResponse.json(
      { success: false, message: error || '未授权' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const benefit = await prisma.benefit.create({
      data: body,
    });

    return NextResponse.json({
      success: true,
      data: benefit,
    });
  } catch (error) {
    console.error('创建福利错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 更新福利
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

    const benefit = await prisma.benefit.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: benefit,
    });
  } catch (error) {
    console.error('更新福利错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 删除福利
export async function DELETE(request: NextRequest) {
  const { error, admin } = await verifyAdmin(request);
  if (error || !admin) {
    return NextResponse.json(
      { success: false, message: error || '未授权' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少福利ID' },
        { status: 400 }
      );
    }

    await prisma.benefit.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除福利错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
