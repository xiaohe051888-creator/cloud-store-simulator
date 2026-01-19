import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 发送验证码API（开发环境使用固定验证码）
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // 验证手机号格式
    if (!phone || phone.length !== 11) {
      return NextResponse.json(
        { success: false, message: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 检查是否为管理员
    const admin = await prisma.admin.findUnique({
      where: { phone },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: '管理员不存在' },
        { status: 401 }
      );
    }

    // 开发环境：返回固定验证码
    // 生产环境：对接短信服务发送真实验证码
    const verificationCode = '123456'; // 开发环境固定验证码

    // TODO: 生产环境对接短信API
    // const smsResult = await sendSms(phone, verificationCode);

    // 将验证码存储到session或Redis中（此处简化处理）

    return NextResponse.json({
      success: true,
      message: '验证码已发送',
      code: verificationCode, // 开发环境返回验证码，生产环境需删除
    });
  } catch (error) {
    console.error('发送验证码错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
