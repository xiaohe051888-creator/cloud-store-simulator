import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Apple Style Card Component
 * 苹果官网风格的卡片组件
 *
 * 设计特点：
 * - 极简纯白背景
 * - 超细透明边框（几乎不可见）
 * - 极其柔和的阴影
 * - 大圆角（24px）
 * - 大量留白，内容居中对齐
 * - 悬停时微微上浮
 */

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white border border-gray-200/50 shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-3xl transition-all duration-500 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-8 pt-8 pb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight text-center leading-tight",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-base text-gray-500 leading-relaxed text-center max-w-md",
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "flex items-center justify-center gap-3 px-8 pt-4 pb-8",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-8 pb-8 flex flex-col items-center",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center justify-center gap-4 px-8 pt-4 pb-8 border-t border-gray-100",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
