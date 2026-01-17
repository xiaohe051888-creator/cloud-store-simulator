import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full",
          "rounded-xl",
          "border-2 border-gray-200/50",
          "bg-gray-50/50 px-5 text-base",
          "ring-offset-background",
          "placeholder:text-gray-400",
          "focus-visible:outline-none",
          "focus-visible:border-blue-500/50",
          "focus-visible:ring-2 focus-visible:ring-blue-500/20",
          "focus-visible:bg-white",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
