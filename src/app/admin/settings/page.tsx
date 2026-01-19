'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Menu, X, Save, Trash2 } from 'lucide-react';
import { authStorage } from '@/lib/adminStorage';

interface SystemSettings {
  siteName: string;
  contactPhone: string;
  contactEmail: string;
  enableRegistration: boolean;
  maintenanceMode: boolean;
  announcement: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: '云店模拟器',
    contactPhone: '',
    contactEmail: '',
    enableRegistration: true,
    maintenanceMode: false,
    announcement: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clearingData, setClearingData] = useState(false);

  useEffect(() => {
    // 检查是否已登录
    if (!authStorage.isAuthenticated()) {
      window.location.href = '/admin';
      return;
    }
    
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem('admin_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('获取系统设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      alert('保存成功');
    } catch (error) {
      console.error('保存设置失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleClearData = () => {
    if (!confirm('确定要清除所有数据吗？此操作不可恢复！')) return;

    setClearingData(true);
    try {
      localStorage.removeItem('admin_users');
      localStorage.removeItem('admin_announcements');
      localStorage.removeItem('admin_benefits');
      localStorage.removeItem('admin_shop_levels');
      alert('数据已清除，刷新页面后将重新初始化模拟数据');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('清除数据失败:', error);
      alert('清除失败');
    } finally {
      setClearingData(false);
    }
  };

  const handleLogout = () => {
    if (!confirm('确定要退出登录吗？')) return;
    authStorage.logout();
    window.location.href = '/admin';
  };

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
            系统设置
          </h1>
          <p className="text-slate-600 mt-1">管理系统配置和选项</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle>基本设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>站点名称</Label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    placeholder="请输入站点名称"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>联系电话</Label>
                    <Input
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      placeholder="请输入联系电话"
                    />
                  </div>
                  <div>
                    <Label>联系邮箱</Label>
                    <Input
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      placeholder="请输入联系邮箱"
                    />
                  </div>
                </div>

                <div>
                  <Label>系统公告</Label>
                  <Input
                    value={settings.announcement}
                    onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                    placeholder="请输入系统公告"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Feature Settings */}
            <Card>
              <CardHeader>
                <CardTitle>功能设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>允许用户注册</Label>
                    <p className="text-sm text-slate-500">关闭后新用户将无法注册</p>
                  </div>
                  <Switch
                    checked={settings.enableRegistration}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableRegistration: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>维护模式</Label>
                    <p className="text-sm text-slate-500">开启后普通用户将无法访问</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Admin Actions */}
            <Card>
              <CardHeader>
                <CardTitle>管理员操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      '保存中...'
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        保存设置
                      </>
                    )}
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm text-slate-600 mb-3">危险操作</h4>
                  <Button
                    variant="outline"
                    onClick={handleClearData}
                    disabled={clearingData}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {clearingData ? (
                      '清除中...'
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        清除所有数据
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">
                    此操作将清除所有用户、公告、福利等数据，且不可恢复
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm text-slate-600 mb-3">账号管理</h4>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                  >
                    退出登录
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle>系统信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">版本</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">存储方式</span>
                  <span className="font-medium">LocalStorage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">数据模式</span>
                  <span className="font-medium">演示版</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
