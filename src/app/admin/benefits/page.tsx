'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Menu, X, Plus, Edit2, Trash2, Gift } from 'lucide-react';
import { authStorage, benefitStorage, type Benefit } from '@/lib/adminStorage';

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [editedData, setEditedData] = useState<Partial<Omit<Benefit, 'id' | 'createdAt'>>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // 检查是否已登录
    if (!authStorage.isAuthenticated()) {
      window.location.href = '/admin';
      return;
    }
    
    fetchBenefits();
  }, []);

  const fetchBenefits = () => {
    try {
      setLoading(true);
      const data = benefitStorage.getAll();
      setBenefits(data);
    } catch (error) {
      console.error('获取福利列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingBenefit(null);
    setEditedData({
      title: '',
      description: '',
      type: 'gift',
      value: 0,
      minValue: 0,
      days: 0,
      shopLevelRequired: 1,
      stock: 100,
      usedCount: 0,
      isActive: true,
    });
  };

  const handleEdit = (benefit: Benefit) => {
    setIsCreating(false);
    setEditingBenefit(benefit);
    setEditedData({ ...benefit });
  };

  const handleSave = () => {
    if (!editedData.title || !editedData.description) {
      alert('请填写标题和描述');
      return;
    }

    try {
      if (isCreating) {
        benefitStorage.create(editedData as Omit<Benefit, 'id' | 'createdAt'>);
      } else if (editingBenefit) {
        benefitStorage.update(editingBenefit.id, editedData);
      }
      
      setIsCreating(false);
      setEditingBenefit(null);
      setEditedData({});
      fetchBenefits();
    } catch (error) {
      console.error('保存福利失败:', error);
      alert('保存失败');
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这个福利吗？')) return;

    try {
      benefitStorage.delete(id);
      fetchBenefits();
    } catch (error) {
      console.error('删除福利失败:', error);
      alert('删除失败');
    }
  };

  const handleToggleActive = (benefit: Benefit) => {
    try {
      benefitStorage.toggleActive(benefit.id);
      fetchBenefits();
    } catch (error) {
      console.error('切换状态失败:', error);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingBenefit(null);
    setEditedData({});
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'gift': return '赠送';
      case 'coupon': return '优惠券';
      case 'discount': return '折扣';
      case 'other': return '其他';
      default: return type;
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
              福利管理
            </h1>
            <p className="text-slate-600 mt-1">管理用户福利活动</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            新建福利
          </Button>
        </div>

        {/* Edit/Create Form */}
        {(isCreating || editingBenefit) && (
          <Card className="mb-6 ring-2 ring-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                {isCreating ? '新建福利' : '编辑福利'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>标题</Label>
                <Input
                  value={editedData.title || ''}
                  onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                  placeholder="请输入福利标题"
                />
              </div>
              
              <div>
                <Label>描述</Label>
                <Textarea
                  value={editedData.description || ''}
                  onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                  placeholder="请输入福利描述"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>类型</Label>
                  <Select
                    value={editedData.type || 'gift'}
                    onValueChange={(value) => setEditedData({ ...editedData, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gift">赠送</SelectItem>
                      <SelectItem value="coupon">优惠券</SelectItem>
                      <SelectItem value="discount">折扣</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>数值</Label>
                  <Input
                    type="number"
                    value={editedData.value || ''}
                    onChange={(e) => setEditedData({ ...editedData, value: parseInt(e.target.value) })}
                    placeholder="福利数值"
                  />
                </div>

                <div>
                  <Label>最低消费</Label>
                  <Input
                    type="number"
                    value={editedData.minValue || ''}
                    onChange={(e) => setEditedData({ ...editedData, minValue: parseInt(e.target.value) })}
                    placeholder="最低消费金额"
                  />
                </div>

                <div>
                  <Label>有效期（天）</Label>
                  <Input
                    type="number"
                    value={editedData.days || ''}
                    onChange={(e) => setEditedData({ ...editedData, days: parseInt(e.target.value) })}
                    placeholder="0表示永久"
                  />
                </div>

                <div>
                  <Label>店铺等级要求</Label>
                  <Input
                    type="number"
                    value={editedData.shopLevelRequired || ''}
                    onChange={(e) => setEditedData({ ...editedData, shopLevelRequired: parseInt(e.target.value) })}
                    placeholder="最低店铺等级"
                  />
                </div>

                <div>
                  <Label>库存</Label>
                  <Input
                    type="number"
                    value={editedData.stock || ''}
                    onChange={(e) => setEditedData({ ...editedData, stock: parseInt(e.target.value) })}
                    placeholder="福利库存"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editedData.isActive || false}
                  onCheckedChange={(checked) => setEditedData({ ...editedData, isActive: checked })}
                />
                <Label>启用福利</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>保存</Button>
                <Button variant="outline" onClick={handleCancel}>取消</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : benefits.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              暂无福利，点击上方按钮创建
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <Card
                key={benefit.id}
                className={
                  editingBenefit?.id === benefit.id ? 'ring-2 ring-blue-500' : ''
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-purple-600" />
                      {benefit.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={benefit.isActive}
                        onCheckedChange={() => handleToggleActive(benefit)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">{benefit.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500">类型：</span>
                        <span className="font-medium">{getTypeLabel(benefit.type)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">数值：</span>
                        <span className="font-medium">{benefit.value}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">最低消费：</span>
                        <span className="font-medium">{benefit.minValue.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">等级要求：</span>
                        <span className="font-medium">{benefit.shopLevelRequired}级</span>
                      </div>
                      <div>
                        <span className="text-slate-500">库存：</span>
                        <span className="font-medium">{benefit.stock - benefit.usedCount}/{benefit.stock}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">状态：</span>
                        <span className={`font-medium ${benefit.isActive ? 'text-green-600' : 'text-slate-500'}`}>
                          {benefit.isActive ? '启用' : '禁用'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEdit(benefit)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(benefit.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
