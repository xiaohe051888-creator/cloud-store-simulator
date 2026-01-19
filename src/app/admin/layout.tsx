'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 登录页不需要认证
    if (pathname === '/admin' || pathname === '/admin/') {
      setLoading(false);
      return;
    }

    // 检查是否有token
    const token = localStorage.getItem('adminToken');
    const adminInfo = localStorage.getItem('adminInfo');

    if (!token || !adminInfo) {
      // 没有token，跳转到登录页
      router.push('/admin');
      return;
    }

    setLoading(false);
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
