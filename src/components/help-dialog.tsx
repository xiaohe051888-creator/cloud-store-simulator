'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  const [activeTab, setActiveTab] = useState<'guide' | 'faq' | 'tips'>('guide');

  const tabs = [
    { id: 'guide' as const, label: '使用指南', icon: '📖' },
    { id: 'faq' as const, label: '常见问题', icon: '❓' },
    { id: 'tips' as const, label: '使用技巧', icon: '💡' },
  ];

  const guideSteps = [
    {
      title: '选择店铺等级',
      content: '点击首页的"模拟进货"，选择适合你的店铺等级。不同等级有不同的进货额度和折扣优惠。',
      tips: '建议新手先从青铜或白银等级开始，熟悉操作后再尝试更高等级。',
    },
    {
      title: '输入进货额度',
      content: '在进货页面输入你计划进货的金额（100-100000元）。系统会自动计算库存成本、利润和完成周期。',
      tips: '可以多次尝试不同的进货额度，然后使用"数据对比"功能找出最优方案。',
    },
    {
      title: '查看计算结果',
      content: '系统会显示详细的数据，包括库存成本、每日提成、完成周期、总利润等关键指标。',
      tips: '关注"总利润"和"完成周期"两个指标，平衡收益和时间成本。',
    },
    {
      title: '使用数据对比',
      content: '点击"添加对比"按钮，将当前模拟方案保存。可以添加多个方案进行对比。',
      tips: '系统会自动标记最优方案（利润最高），帮助你快速做出决策。',
    },
    {
      title: '智能推荐',
      content: '使用智能推荐功能，根据你的预算或目标利润，系统会自动计算出最优方案。',
      tips: '推荐功能考虑了多种因素，建议优先参考推荐结果。',
    },
  ];

  const faqItems = [
    {
      question: '什么是店铺等级？',
      answer: '店铺等级分为青铜、白银、黄金、铂金、钻石、至尊7个等级。等级越高，进货额度越大，折扣优惠越多。',
    },
    {
      question: '如何选择合适的店铺等级？',
      answer: '建议根据自己的资金情况和经营目标选择。新手可以从青铜或白银开始，熟悉后再尝试更高等级。',
    },
    {
      question: '进货额度可以设置多少？',
      answer: '进货额度范围为100-100000元。建议在100-100000元范围内设置，确保数据准确性。',
    },
    {
      question: '总利润是如何计算的？',
      answer: '总利润 = （进货额度 + 云店余额）×（销售折扣 - 进货折扣）。销售折扣为95折，进货折扣根据店铺等级不同。',
    },
    {
      question: '什么是结算周期？',
      answer: '结算周期是指从销售到回款的天数。所有店铺等级均为10天结算周期，即销售后10天回款。',
    },
    {
      question: '如何使用数据对比功能？',
      answer: '在确认进货页面点击"添加对比"按钮，将当前方案保存。可以添加多个方案，然后点击导航栏的"对比"按钮查看对比结果。',
    },
  ];

  const tipsItems = [
    {
      title: '对比多个方案',
      content: '尝试不同的进货额度和店铺等级，使用对比功能找出最优方案。',
      icon: '📊',
    },
    {
      title: '利用智能推荐',
      content: '不确定时，使用智能推荐功能，系统会根据你的条件自动推荐最佳方案。',
      icon: '🤖',
    },
    {
      title: '关注回款时间',
      content: '高利润方案可能需要更长的回款周期，根据自己的资金情况选择。',
      icon: '⏰',
    },
    {
      title: '善用复制功能',
      content: '复制步信号、邀请链接等信息时，点击复制按钮即可快速复制。',
      icon: '📋',
    },
    {
      title: '离线使用',
      content: '支持PWA，可以安装到手机桌面，离线使用更方便。',
      icon: '📱',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-white/95 backdrop-blur-lg shadow-2xl border-0 animate-in zoom-in-95 duration-300 flex flex-col">
        <CardHeader className="flex-shrink-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              帮助中心
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Tab 切换 */}
          <div className="flex gap-2 mt-4 p-1 bg-gray-100 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white shadow-md text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-sm sm:text-base">{tab.label}</span>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
          {/* 使用指南 */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              {guideSteps.map((step, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
                >
                  <div className="flex items-start gap-3">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-700 mb-2">{step.content}</p>
                      <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
                        <span className="text-yellow-600 mt-0.5">💡</span>
                        <p className="text-sm text-yellow-700 font-medium">{step.tips}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 常见问题 */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">Q{index + 1}.</span>
                    <span>{item.question}</span>
                  </h3>
                  <p className="text-sm text-gray-700 ml-5">A: {item.answer}</p>
                </div>
              ))}
            </div>
          )}

          {/* 使用技巧 */}
          {activeTab === 'tips' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tipsItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-700">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
