import * as React from "react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
  const handleChange = (e) => {
    const newValue = [Number(e.target.value)]
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)} ref={ref}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((value[0] - min) / (max - min)) * 100}%, hsl(var(--secondary)) ${((value[0] - min) / (max - min)) * 100}%, hsl(var(--secondary)) 100%)`
        }}
        {...props}
      />
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }

