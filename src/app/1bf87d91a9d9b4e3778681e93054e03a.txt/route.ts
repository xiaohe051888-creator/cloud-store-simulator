import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 微信域名验证文件内容
  const verificationContent = '22f8d4e381575a977239b8ec83623e835ed69f2a';

  // 返回验证内容，设置正确的 Content-Type
  return new NextResponse(verificationContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
