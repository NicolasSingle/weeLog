import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

    const variants = {
      default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
      outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground dark:border-input",
      ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground",
      destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
    }

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      icon: "h-9 w-9",
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
