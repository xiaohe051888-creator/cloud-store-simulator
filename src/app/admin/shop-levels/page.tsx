'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Menu, X, Save, RefreshCw } from 'lucide-react';
import { authStorage } from '@/lib/adminStorage';

interface ShopLevel {
  id: string;
  level: string;
  name: string;
  minStock: number;
  maxStock: number;
  commissionRate: number;
  stockDiscount: number;
  saleDiscount: number;
  color: string;
  completionDays: number;
  settlementDays: number;
  settlementDiscount: number;
  sellRatio: number;
  isActive: boolean;
}

// 默认店铺等级配置
const DEFAULT_LEVELS: ShopLevel[] = [
  {
    id: '1',
    level: '1',
    name: '1级小店',
    minStock: 5000,
    maxStock: 15000,
    commissionRate: 0.15,
    stockDiscount: 1,
    saleDiscount: 1,
    color: '#3b82f6',
    completionDays: 15,
    settlementDays: 15,
    settlementDiscount: 1,
    sellRatio: 0.08,
    isActive: true,
  },
  {
    id: '2',
    level: '2',
    name: '2级店铺',
    minStock: 15000,
    maxStock: 50000,
    commissionRate: 0.12,
    stockDiscount: 0.98,
    saleDiscount: 0.98,
    color: '#8b5cf6',
    completionDays: 15,
    settlementDays: 15,
    settlementDiscount: 1,
    sellRatio: 0.09,
    isActive: true,
  },
  {
    id: '3',
    level: '3',
    name: '3级店铺',
    minStock: 50000,
    maxStock: 150000,
    commissionRate: 0.1,
    stockDiscount: 0.95,
    saleDiscount: 0.95,
    color: '#ec4899',
    completionDays: 15,
    settlementDays: 15,
    settlementDiscount: 1,
    sellRatio: 0.1,
    isActive: true,
  },
  {
    id: '4',
    level: '4',
    name: '4级店铺',
    minStock: 150000,
    maxStock: 500000,
    commissionRate: 0.08,
    stockDiscount: 0.92,
    saleDiscount: 0.92,
    color: '#f59e0b',
    completionDays: 15,
    settlementDays: 15,
    settlementDiscount: 1,
    sellRatio: 0.11,
    isActive: true,
  },
  {
    id: '5',
    level: '5',
    name: '5级店铺',
    minStock: 500000,
    maxStock: 1000000,
    commissionRate: 0.06,
    stockDiscount: 0.9,
    saleDiscount: 0.9,
    color: '#10b981',
    completionDays: 15,
    settlementDays: 15,
    settlementDiscount: 1,
    sellRatio: 0.12,
    isActive: true,
  },
];

const STORAGE_KEY = 'admin_shop_levels';

export default function ShopLevelsPage() {
  const [levels, setLevels] = useState<ShopLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<ShopLevel | null>(null);
  const [editedData, setEditedData] = useState<Partial<ShopLevel>>({});

  useEffect(() => {
    // 检查是否已登录
    if (!authStorage.isAuthenticated()) {
      window.location.href = '/admin';
      return;
    }
    
    fetchLevels();
  }, []);

  const fetchLevels = () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem(STORAGE_KEY);
      const data = saved ? JSON.parse(saved) : DEFAULT_LEVELS;
      setLevels(data);
    } catch (error) {
      console.error('获取店铺等级配置失败:', error);
      setLevels(DEFAULT_LEVELS);
    } finally {
      setLoading(false);
    }
  };

  const saveLevels = (newLevels: ShopLevel[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLevels));
    } catch (error) {
      console.error('保存店铺等级配置失败:', error);
    }
  };

  const handleEdit = (level: ShopLevel) => {
    setEditingLevel(level);
    setEditedData({ ...level });
  };

  const handleSave = () => {
    if (!editingLevel) return;

    setSaving(true);
    try {
      const newLevels = levels.map((l) =>
        l.id === editingLevel.id ? { ...l, ...editedData } : l
      );
      setLevels(newLevels);
      saveLevels(newLevels);
      setEditingLevel(null);
      setEditedData({});
    } catch (error) {
      console.error('保存配置失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = (level: ShopLevel) => {
    try {
      const newLevels = levels.map((l) =>
        l.id === level.id ? { ...l, isActive: !l.isActive } : l
      );
      setLevels(newLevels);
      saveLevels(newLevels);
    } catch (error) {
      console.error('切换状态失败:', error);
    }
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              店铺配置管理
            </h1>
            <p className="text-slate-600 mt-1">配置各店铺等级的参数</p>
          </div>
          <Button onClick={fetchLevels} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {levels.map((level) => (
              <Card
                key={level.id}
                className={
                  editingLevel?.id === level.id ? 'ring-2 ring-blue-500' : ''
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle
                      className="flex items-center gap-2"
                      style={{ color: level.color }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: level.color }}
                      />
                      {level.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={level.isActive}
                        onCheckedChange={() => handleToggleActive(level)}
                      />
                      {editingLevel?.id === level.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving}
                          >
                            {saving ? (
                              '保存中...'
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-1" />
                                保存
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingLevel(null)}
                          >
                            取消
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(level)}
                        >
                          编辑
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingLevel?.id === level.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>最小进货额度</Label>
                          <Input
                            type="number"
                            value={editedData.minStock || ''}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                minStock: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>最大进货额度</Label>
                          <Input
                            type="number"
                            value={editedData.maxStock || ''}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                maxStock: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>佣金费率</Label>
                          <Input
                            type="number"
                            step="0.0001"
                            value={editedData.commissionRate || ''}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                commissionRate: parseFloat(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>进货折扣</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editedData.stockDiscount || ''}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                stockDiscount: parseFloat(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>销售折扣</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editedData.saleDiscount || ''}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                saleDiscount: parseFloat(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>结算周期（天）</Label>
                          <Input
                            type="number"
                            value={editedData.settlementDays || ''}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                settlementDays: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>预计完成天数</Label>
                          <Input
                            type="number"
                            value={editedData.completionDays || ''}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                completionDays: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>卖出比例</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editedData.sellRatio || ''}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                sellRatio: parseFloat(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>颜色</Label>
                        <Input
                          type="color"
                          value={editedData.color || ''}
                          onChange={(e) =>
                            setEditedData({ ...editedData, color: e.target.value })
                          }
                          className="h-10"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-600">进货额度：</span>
                          <span className="font-medium">
                            {level.minStock.toLocaleString()} -{' '}
                            {level.maxStock.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">佣金费率：</span>
                          <span className="font-medium">
                            {(level.commissionRate * 100).toFixed(3)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">进货折扣：</span>
                          <span className="font-medium">
                            {(level.stockDiscount * 10).toFixed(1)}折
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">销售折扣：</span>
                          <span className="font-medium">
                            {(level.saleDiscount * 10).toFixed(1)}折
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">结算周期：</span>
                          <span className="font-medium">{level.settlementDays}天</span>
                        </div>
                        <div>
                          <span className="text-slate-600">卖出比例：</span>
                          <span className="font-medium">
                            {(level.sellRatio * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${level.color}20` }}
                      >
                        <span className="text-slate-600">状态：</span>
                        <span className="font-medium">
                          {level.isActive ? '启用' : '禁用'}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
