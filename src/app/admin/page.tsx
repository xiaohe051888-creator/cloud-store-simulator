'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield } from 'lucide-react';
import { authStorage, initializeMockData } from '@/lib/adminStorage';

export default function AdminLoginPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 初始化模拟数据
  useEffect(() => {
    initializeMockData();

    // 检查是否已登录
    if (authStorage.isAuthenticated()) {
      window.location.href = '/admin/dashboard';
    }
  }, []);

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 发送验证码（模拟）
  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) {
      setError('请输入正确的手机号');
      return;
    }

    setSendingCode(true);
    setError('');

    try {
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
      setCountdown(60); // 60秒倒计时
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('发送验证码失败');
    } finally {
      setSendingCode(false);
    }
  };

  // 登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || !code) {
      setError('请填写完整信息');
      return;
    }

    if (code.length !== 4 && code.length !== 6) {
      setError('请输入正确的验证码');
      return;
    }

    setLoading(true);

    try {
      // 模拟登录验证
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 简单验证：任意4-6位数字验证码都可以登录
      if (/^\d{4,6}$/.test(code)) {
        const success = authStorage.login(phone);
        if (success) {
          // 跳转到仪表盘
          window.location.href = '/admin/dashboard';
        } else {
          setError('登录失败');
        }
      } else {
        setError('验证码格式错误');
      }
    } catch (err) {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            云店模拟器后台管理
          </CardTitle>
          <CardDescription>请使用管理员手机号登录（演示版本，任意4-6位数字验证码）</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={11}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">验证码</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  type="text"
                  placeholder="任意4-6位数字"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={sendingCode || countdown > 0 || !phone}
                  className="whitespace-nowrap min-w-[120px]"
                >
                  {sendingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      发送中
                    </>
                  ) : countdown > 0 ? (
                    `${countdown}秒`
                  ) : (
                    '获取验证码'
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <AlertDescription>验证码已发送，请输入任意4-6位数字即可登录</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-center text-gray-500">
              提示：这是演示版本，数据存储在浏览器本地
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
