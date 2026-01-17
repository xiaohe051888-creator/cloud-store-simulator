import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Apple Style Button Component
 * 苹果官网风格的按钮组件
 *
 * 设计特点：
 * - 完全圆形或药丸形
 * - 纯色背景（蓝色或透明）
 * - 点击时轻微缩放
 * - 简洁清晰的文字
 * - 极其柔和的阴影
 * - 流畅的过渡动画
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_2px_8px_rgba(37,99,235,0.24)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.32)] active:scale-[0.97]',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 shadow-[0_2px_8px_rgba(220,38,38,0.24)] hover:shadow-[0_4px_16px_rgba(220,38,38,0.32)] active:scale-[0.97]',
        outline:
          'border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-[0.97]',
        secondary:
          'bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-[0.97]',
        ghost:
          'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 active:scale-[0.97]',
        link:
          'text-blue-600 underline-offset-4 hover:underline hover:text-blue-700',
        apple:
          'bg-white text-gray-900 hover:bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] active:scale-[0.97] border border-gray-200',
      },
      size: {
        default: 'h-12 px-8 text-base',
        sm: 'h-10 px-6 text-sm',
        lg: 'h-14 px-10 text-lg',
        icon: 'size-12',
        'icon-sm': 'size-10',
        'icon-lg': 'size-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
