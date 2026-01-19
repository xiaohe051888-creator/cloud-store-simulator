'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Store,
  Gift,
  Megaphone,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: '仪表盘', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: '用户管理', href: '/admin/users', icon: Users },
    { name: '店铺配置', href: '/admin/shop-levels', icon: Store },
    { name: '福利管理', href: '/admin/benefits', icon: Gift },
    { name: '公告管理', href: '/admin/announcements', icon: Megaphone },
    { name: '系统设置', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    window.location.href = '/admin';
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-slate-700">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">云店模拟器</h1>
          <p className="text-xs text-slate-400">管理后台</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25'
                  : 'hover:bg-slate-700/50 hover:translate-x-1'
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-slate-400'
                )}
              />
              <span
                className={cn(
                  'font-medium',
                  isActive ? 'text-white' : 'text-slate-300'
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-slate-700 p-4">
        <div className="mb-4 px-4">
          <p className="text-sm font-medium text-white">
            {localStorage.getItem('adminInfo')
              ? JSON.parse(localStorage.getItem('adminInfo')!).name
              : '管理员'}
          </p>
          <p className="text-xs text-slate-400">
            {localStorage.getItem('adminInfo')
              ? JSON.parse(localStorage.getItem('adminInfo')!).phone
              : ''}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">退出登录</span>
        </button>
      </div>
    </div>
  );
}
