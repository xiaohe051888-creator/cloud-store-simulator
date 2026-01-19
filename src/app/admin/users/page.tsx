'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Menu, X, ChevronLeft, ChevronRight, Calendar, Activity, ShoppingBag, DollarSign, Clock } from 'lucide-react';
import { userStorage, authStorage, type User } from '@/lib/adminStorage';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // 检查是否已登录
    if (!authStorage.isAuthenticated()) {
      window.location.href = '/admin';
      return;
    }
    
    fetchUsers();
  }, []);

  useEffect(() => {
    // 搜索过滤
    if (search) {
      const filtered = userStorage.search(search);
      setFilteredUsers(filtered);
      setPage(1);
    } else {
      setFilteredUsers(users);
      setPage(1);
    }
  }, [search, users]);

  const fetchUsers = () => {
    try {
      setLoading(true);
      const allUsers = userStorage.getAll();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  // 分页逻辑
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            用户管理
          </h1>
          <p className="text-slate-600 mt-1">查看和管理所有用户信息</p>
        </div>

        {/* Search Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="搜索用户昵称或手机号..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>用户列表</CardTitle>
            <div className="text-sm text-slate-600">
              共 {filteredUsers.length} 位用户
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : displayUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                暂无用户数据
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户ID</TableHead>
                        <TableHead>手机号</TableHead>
                        <TableHead>昵称</TableHead>
                        <TableHead>店铺等级</TableHead>
                        <TableHead>注册时间</TableHead>
                        <TableHead>最后活跃</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{user.nickname}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user.shopLevel}级
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(user.lastLoginAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                            >
                              详情
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-600">
                      第 {page} / {totalPages} 页
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        上一页
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        下一页
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>用户详情</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelectedUser(null)}
                  >
                    <X />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">基本信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">用户ID</label>
                      <p className="font-medium">{selectedUser.id}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">昵称</label>
                      <p className="font-medium">{selectedUser.nickname}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">手机号</label>
                      <p className="font-medium">{selectedUser.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">店铺等级</label>
                      <p className="font-medium">{selectedUser.shopLevel}级</p>
                    </div>
                  </div>
                </div>

                {/* Shop Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">店铺信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        初始进货额度
                      </label>
                      <p className="font-medium">{selectedUser.initialStock.toLocaleString()}元</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">结算周期</label>
                      <p className="font-medium">{selectedUser.settlementDays}天</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">日均利润</label>
                      <p className="font-medium">{selectedUser.dailyProfit.toLocaleString()}元</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">经营天数</label>
                      <p className="font-medium">{selectedUser.shopDays}天</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">经营数据</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="text-sm text-slate-600 mb-1">总销售额</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedUser.totalSales.toLocaleString()}
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-slate-600 mb-1">总利润</div>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedUser.totalProfit.toLocaleString()}
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Time Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">时间信息</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm text-slate-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        注册时间
                      </label>
                      <p className="font-medium">
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        最后活跃时间
                      </label>
                      <p className="font-medium">
                        {new Date(selectedUser.lastLoginAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
