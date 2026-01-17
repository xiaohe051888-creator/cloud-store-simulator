import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Apple Style Badge Component
 * 苹果官网风格的徽章组件
 *
 * 设计特点：
 * - 极简设计
 * - 圆形或圆角矩形
 * - 纯色背景（不再使用渐变）
 * - 小字体
 * - 柔和阴影
 */

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 [&>svg]:pointer-events-none focus-visible:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.24)]",
        secondary:
          "bg-gray-100 text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        destructive:
          "bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.24)]",
        outline:
          "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50",
        success:
          "bg-green-600 text-white shadow-[0_2px_8px_rgba(22,163,74,0.24)]",
        warning:
          "bg-orange-500 text-white shadow-[0_2px_8px_rgba(249,115,22,0.24)]",
      },
      size: {
        default: "text-xs px-3 py-1.5",
        sm: "text-[10px] px-2 py-1",
        lg: "text-sm px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
