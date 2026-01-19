'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Activity,
  TrendingUp,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Menu,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSimulations: number;
  totalRevenue: number;
  totalProfit: number;
  todayUsers: number;
  todaySimulations: number;
  userGrowth: number;
  simulationGrowth: number;
  simulationTrend: Array<{ date: string; count: number }>;
  levelDistribution: Array<{ level: string; count: number }>;
  recentSimulations: Array<{
    id: string;
    userId: string;
    phone?: string | null;
    level: string;
    stockAmount: number;
    period: number;
    totalProfit: number;
    createdAt: Date;
  }>;
}

const LEVEL_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00c49f', '#ff00ff'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    growth,
    suffix = '',
  }: {
    title: string;
    value: number | string;
    icon: any;
    growth?: number;
    suffix?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <Icon className="w-4 h-4 text-slate-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix}
        </div>
        {growth !== undefined && (
          <p className={`text-xs mt-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? (
              <>
                <ArrowUp className="inline w-3 h-3" />
                {growth.toFixed(2)}%
              </>
            ) : (
              <>
                <ArrowDown className="inline w-3 h-3" />
                {Math.abs(growth).toFixed(2)}%
              </>
            )}
            较昨日
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            仪表盘
          </h1>
          <p className="text-slate-600 mt-1">欢迎回来，管理员</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="总用户数"
            value={stats?.totalUsers || 0}
            icon={Users}
            growth={stats?.userGrowth}
          />
          <StatCard
            title="活跃用户"
            value={stats?.activeUsers || 0}
            icon={Activity}
          />
          <StatCard
            title="总模拟次数"
            value={stats?.totalSimulations || 0}
            icon={TrendingUp}
            growth={stats?.simulationGrowth}
          />
          <StatCard
            title="总利润"
            value={stats?.totalProfit || 0}
            icon={DollarSign}
            suffix="元"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Simulation Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>模拟次数趋势（近7天）</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.simulationTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Level Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>店铺等级分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.levelDistribution || []}
                    dataKey="count"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {(stats?.levelDistribution || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={LEVEL_COLORS[index % LEVEL_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Simulations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>最近模拟记录</CardTitle>
            <Button size="sm" variant="outline" onClick={fetchStats}>
              刷新
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      用户ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      手机号
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      店铺等级
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      进货额度
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      周期
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      利润
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      时间
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentSimulations?.map((sim) => (
                    <tr key={sim.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm">{sim.userId}</td>
                      <td className="py-3 px-4 text-sm">{sim.phone || '-'}</td>
                      <td className="py-3 px-4 text-sm">{sim.level}</td>
                      <td className="py-3 px-4 text-sm">
                        {sim.stockAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm">{sim.period}天</td>
                      <td className="py-3 px-4 text-sm text-green-600">
                        +{sim.totalProfit.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(sim.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
