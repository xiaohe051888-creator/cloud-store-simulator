import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Apple Style Input Component
 * 苹果官网风格的输入框组件
 *
 * 设计特点：
 * - 极简设计，几乎不可见的边框
 * - 大字体（16px）
 * - 大圆角（12px）
- 柔和的焦点状态（蓝色边框）
 * - 聚焦时轻微阴影
 * - 平滑过渡
 */

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // 基础样式
        "h-14 w-full min-w-0 rounded-2xl border-2 border-transparent bg-gray-50 px-5 text-base text-gray-900",
        "placeholder:text-gray-400",
        "transition-all duration-300 ease-out",

        // 焦点状态
        "focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]",
        "focus:outline-none",

        // Hover状态
        "hover:border-gray-300",

        // 禁用状态
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",

        // 文本选择
        "selection:bg-blue-100 selection:text-blue-900",

        // 文件输入
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-900",

        className
      )}
      {...props}
    />
  )
}

export { Input }
