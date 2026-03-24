import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-[#00CC00] to-[#00B300] text-white shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 active:scale-100 active:translate-y-0",
        destructive:
          "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:scale-105",
        outline:
          "border-2 border-[#00B300] text-[#00B300] bg-white shadow-sm hover:bg-[#00B300] hover:text-white hover:shadow-md",
        secondary:
          "bg-white text-[#00B300] border-2 border-[#00B300] shadow-sm hover:bg-[#00B300] hover:text-white",
        ghost: "hover:bg-gray-100 hover:text-[#00B300]",
        link: "text-[#00B300] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
