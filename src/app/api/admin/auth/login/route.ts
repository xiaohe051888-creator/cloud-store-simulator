import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';

// 登录API
export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    // 验证参数
    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: '手机号和验证码不能为空' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    if (phone.length !== 11) {
      return NextResponse.json(
        { success: false, message: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 查找管理员
    const admin = await prisma.admin.findUnique({
      where: { phone },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: '管理员不存在' },
        { status: 401 }
      );
    }

    // 验证验证码（开发环境：123456）
    // 生产环境：从session或Redis中获取验证码进行验证
    if (code !== '123456') {
      return NextResponse.json(
        { success: false, message: '验证码错误' },
        { status: 401 }
      );
    }

    // 更新最后登录时间
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    // 生成JWT Token
    const token = generateToken({
      adminId: admin.id,
      phone: admin.phone,
      role: admin.role,
    });

    // 返回管理员信息（不包含密码）
    const adminInfo = {
      id: admin.id,
      phone: admin.phone,
      name: admin.name,
      role: admin.role,
      lastLogin: new Date(),
    };

    return NextResponse.json({
      success: true,
      token,
      admin: adminInfo,
    });
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
