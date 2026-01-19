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
import { Menu, X, Plus, Edit2, Trash2, Megaphone } from 'lucide-react';
import { authStorage, announcementStorage, type Announcement } from '@/lib/adminStorage';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editedData, setEditedData] = useState<Partial<Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // 检查是否已登录
    if (!authStorage.isAuthenticated()) {
      window.location.href = '/admin';
      return;
    }
    
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = () => {
    try {
      setLoading(true);
      const data = announcementStorage.getAll();
      setAnnouncements(data);
    } catch (error) {
      console.error('获取公告列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingAnnouncement(null);
    setEditedData({
      title: '',
      content: '',
      type: 'info',
      isPublished: false,
    });
  };

  const handleEdit = (announcement: Announcement) => {
    setIsCreating(false);
    setEditingAnnouncement(announcement);
    setEditedData({ ...announcement });
  };

  const handleSave = () => {
    if (!editedData.title || !editedData.content) {
      alert('请填写标题和内容');
      return;
    }

    try {
      if (isCreating) {
        announcementStorage.create(editedData as Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>);
      } else if (editingAnnouncement) {
        announcementStorage.update(editingAnnouncement.id, editedData);
      }
      
      setIsCreating(false);
      setEditingAnnouncement(null);
      setEditedData({});
      fetchAnnouncements();
    } catch (error) {
      console.error('保存公告失败:', error);
      alert('保存失败');
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这个公告吗？')) return;

    try {
      announcementStorage.delete(id);
      fetchAnnouncements();
    } catch (error) {
      console.error('删除公告失败:', error);
      alert('删除失败');
    }
  };

  const handleTogglePublish = (announcement: Announcement) => {
    try {
      announcementStorage.togglePublish(announcement.id);
      fetchAnnouncements();
    } catch (error) {
      console.error('切换状态失败:', error);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingAnnouncement(null);
    setEditedData({});
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
              公告管理
            </h1>
            <p className="text-slate-600 mt-1">管理系统公告</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            新建公告
          </Button>
        </div>

        {/* Edit/Create Form */}
        {(isCreating || editingAnnouncement) && (
          <Card className="mb-6 ring-2 ring-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                {isCreating ? '新建公告' : '编辑公告'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>标题</Label>
                <Input
                  value={editedData.title || ''}
                  onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                  placeholder="请输入公告标题"
                />
              </div>
              
              <div>
                <Label>类型</Label>
                <Select
                  value={editedData.type || 'info'}
                  onValueChange={(value) => setEditedData({ ...editedData, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">信息</SelectItem>
                    <SelectItem value="warning">警告</SelectItem>
                    <SelectItem value="success">成功</SelectItem>
                    <SelectItem value="error">错误</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>内容</Label>
                <Textarea
                  value={editedData.content || ''}
                  onChange={(e) => setEditedData({ ...editedData, content: e.target.value })}
                  placeholder="请输入公告内容"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editedData.isPublished || false}
                  onCheckedChange={(checked) => setEditedData({ ...editedData, isPublished: checked })}
                />
                <Label>立即发布</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>保存</Button>
                <Button variant="outline" onClick={handleCancel}>取消</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Announcements List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              暂无公告，点击上方按钮创建
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className={
                  editingAnnouncement?.id === announcement.id ? 'ring-2 ring-blue-500' : ''
                }
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{announcement.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          announcement.type === 'info' ? 'bg-blue-100 text-blue-800' :
                          announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          announcement.type === 'success' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {announcement.type === 'info' ? '信息' :
                           announcement.type === 'warning' ? '警告' :
                           announcement.type === 'success' ? '成功' : '错误'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          announcement.isPublished ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {announcement.isPublished ? '已发布' : '草稿'}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-4">{announcement.content}</p>
                      <p className="text-xs text-slate-400">
                        创建时间：{new Date(announcement.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={announcement.isPublished}
                        onCheckedChange={() => handleTogglePublish(announcement)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(announcement.id)}
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
