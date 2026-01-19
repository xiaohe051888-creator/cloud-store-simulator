'use client';

import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 登录页不需要认证
  if (pathname === '/admin' || pathname === '/admin/') {
    return <>{children}</>;
  }

  // 检查是否有token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    const adminInfo = localStorage.getItem('adminInfo');

    if (!token || !adminInfo) {
      // 没有token，跳转到登录页
      window.location.href = '/admin';
      return null;
    }
  }

  return <>{children}</>;
}
