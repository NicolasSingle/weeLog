import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number
  onChange?: (value: number) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(parseFloat(e.target.value))
    }

    return (
      <input
        type="range"
        step="0.1"
        min="0"
        max="1"
        value={value}
        onChange={handleChange}
        className={cn(
          "w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary dark:bg-muted",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
