import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// 验证管理员身份
export async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return { error: '未提供认证令牌', admin: null };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: '无效的认证令牌', admin: null };
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        lastLogin: true,
      },
    });

    if (!admin) {
      return { error: '管理员不存在', admin: null };
    }

    return { error: null, admin };
  } catch (error) {
    return { error: '验证失败', admin: null };
  }
}

// 验证管理员权限
export function hasPermission(admin: any, requiredRole: string = 'admin'): boolean {
  if (!admin) return false;
  const roles = ['admin', 'super_admin'];
  const adminRoleIndex = roles.indexOf(admin.role);
  const requiredRoleIndex = roles.indexOf(requiredRole);
  return adminRoleIndex >= requiredRoleIndex;
}
