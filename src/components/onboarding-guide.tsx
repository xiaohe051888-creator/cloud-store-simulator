'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingGuide({ isOpen, onClose }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: '欢迎使用云店模拟器',
      description: '专业的店铺经营管理模拟工具，帮助你轻松计算利润、对比方案、优化决策。',
      icon: '🏪',
    },
    {
      title: '选择店铺等级',
      description: '从青铜到至尊7种等级，每种等级有不同的进货额度和折扣优惠，选择最适合你的店铺类型。',
      icon: '⭐',
    },
    {
      title: '输入进货额度',
      description: '输入你计划进货的金额，系统会自动计算出库存成本、预计利润和完成周期等关键数据。',
      icon: '💰',
    },
    {
      title: '查看销售详情',
      description: '详细的销售数据表格，展示每天的销售金额、利润情况和结算时间，一目了然。',
      icon: '📊',
    },
    {
      title: '数据对比功能',
      description: '添加多个模拟方案进行对比，系统会自动分析并推荐最优方案，帮你做出最佳决策。',
      icon: '📈',
    },
    {
      title: '智能推荐系统',
      description: '根据预算或目标利润，智能推荐最佳的进货额度和选择周期，省时省力更精准。',
      icon: '🤖',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    onClose();
  };

  // 检查是否已经看过引导
  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenOnboarding');
    if (hasSeen && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-lg shadow-2xl border-0 animate-in zoom-in-95 duration-300">
        <CardContent className="p-6 sm:p-8">
          {/* 进度指示器 */}
          <div className="flex justify-center gap-1.5 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600'
                    : index < currentStep
                    ? 'w-2 bg-purple-600'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* 图标 */}
          <div className="text-6xl mb-6 text-center animate-bounce">
            {step.icon}
          </div>

          {/* 标题 */}
          <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {step.title}
          </h2>

          {/* 描述 */}
          <p className="text-gray-700 text-center leading-relaxed mb-8">
            {step.description}
          </p>

          {/* 进度 */}
          <div className="text-center text-sm text-gray-500 mb-6">
            {currentStep + 1} / {steps.length}
          </div>

          {/* 按钮组 */}
          <div className="flex gap-3">
            {!isFirstStep && (
              <Button
                onClick={handlePrev}
                variant="outline"
                className="flex-1 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              >
                上一步
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={`flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white ${
                isFirstStep ? 'flex-[2]' : 'flex-1'
              }`}
            >
              {isLastStep ? '开始使用' : '下一步'}
            </Button>
          </div>

          {/* 跳过 */}
          {!isLastStep && (
            <button
              onClick={handleClose}
              className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              跳过引导
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
