import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin/auth';

// 获取公告列表
export async function GET(request: NextRequest) {
  const { error, admin } = await verifyAdmin(request);
  if (error || !admin) {
    return NextResponse.json(
      { success: false, message: error || '未授权' },
      { status: 401 }
    );
  }

  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error('获取公告列表错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 创建公告
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

    const announcement = await prisma.announcement.create({
      data: body,
    });

    return NextResponse.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error('创建公告错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 更新公告
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

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error('更新公告错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 删除公告
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

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除公告错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
