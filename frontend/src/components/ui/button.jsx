import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"
import { Loader } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        cancel: "bg-gray-200 text-gray-600 enabled:hover:bg-gray-300",
        gradient: "bg-gradient-to-r shadow from-accent-indigo to-purple-600 text-white enabled:hover:from-accent-indigo-foreground enabled:hover:to-purple-700 enabled:hover:shadow-xl",
        grey: "bg-accent text-accent-foreground shadow-sm enabled:hover:bg-accent",
        serchBut: "bg-[#f0f3ff] w-full border-none rounded-none",
        submit: 'bg-[#6777ef] shadow-custom-pri text-white hover:bg-[#394eea] hover:bg-[#394eea] text-xs',
        submitred: 'bg-[#fc544b] shadow-custom-red text-white hover:bg-[#fb160a] focus:bg-[#fb160a] text-xs',
        cancelbtn: "bg-secondary/80 text-secondary-foreground  hover:bg-secondary text-xs shadow-md",
        warning: "bg-[#ffa426] shadow-custom-war text-white hover:bg-[#ff990d] focus:bg-[#ff990d] ",
        info: "bg-[#3abaf4] shadow-custom-blue text-white hover:bg-[#0da8ee] focus:bg-[#0da8ee] ",
        danger: "bg-[#fc544b] shadow-custom-red text-white hover:bg-[#fb160a] focus:bg-[#fb160a] ",
        success: "bg-[#54ca68] shadow-custom-green text-white hover:bg-[#41c457] focus:bg-[#41c457] ",
        primary: "bg-accent-indigo shadow-custom text-white hover:bg-accent-indigo-foreground focus:bg-accent-indigo-foreground",
        addBtn: "border border-accent-indigo  text-accent-indigo hover:bg-accent-indigo hover:text-white bg-transparent font-bold rounded-lg whitespace-nowrap",
        iconBtn: "text-white bg-accent-indigo hover:bg-accent-indigo-foreground rounded-lg whitespace-nowrap",
        add: "text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500",
        back:'text-indigo-600 shadow-none border-none bg-indigo-50 hover:bg-indigo-100'
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        lgIcon: "h-10 w-10",
        xs: "text-xs px-2 py-2",
        customicon: "px-[15px] py-[7.5px] !rounded-[30px] ",
        serchBtn: "h-[46px] py-[9px] px-[15px] !w-auto ",
        modalSubmit: 'h-9 text-xs rounded-sm px-4 py-2',
        customIconBtn: "px-[14px] py-[3px] rounded-[30px] h-[30px] flex justify-center items-center",
        customEditBtn: "size-[32px] rounded-[5px] flex justify-center items-center",
      },
      intent: {
        indigo: "bg-accent-indigo enabled:hover:bg-accent-indigo-foreground text-white",
        green: "bg-green-500 enabled:hover:bg-green-600 text-white",
        red: "bg-red-500 enabled:hover:bg-red-600 text-white",
        yellow: "bg-yellow-500 enabled:hover:bg-yellow-600 text-white",
        teal: "bg-teal-500 enabled:hover:bg-teal-600 text-white",
        emerald: "bg-emerald-500 enabled:hover:bg-emerald-600 text-white",
      },
      border: {
        default: " border-input",
        none: "",
        indigo: "border border-accent-indigo enabled:hover:border-accent-indigo-foreground text-accent-indigo-foreground enabled:hover:text-accent-indigo-dark enabled:hover:bg-accent-indigo-light",
        green: "border border-green-500 enabled:hover:border-green-600 text-green-600 enabled:hover:text-green-800 enabled:hover:bg-green-100",
        red: "border border-red-500 enabled:hover:border-red-600 text-red-600 enabled:hover:text-red-800 enabled:hover:bg-red-100",
        yellow: "border border-yellow-500 enabled:hover:border-yellow-600 text-yellow-600 enabled:hover:text-yellow-800 enabled:hover:bg-yellow-100",
        teal: "border border-teal-500 enabled:hover:border-teal-600 text-teal-600 enabled:hover:text-teal-800 enabled:hover:bg-teal-100",
        emerald: "border border-emerald-500 enabled:hover:border-emerald-600 text-emerald-600 enabled:hover:text-emerald-800 enabled:hover:bg-emerald-100",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, intent, variant, border, size, disabled, asChild = false, isLoading = false, loadingText, loaderClassname, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, intent, border, className }))}
      disabled={disabled || isLoading}
      ref={ref}
      {...props} >
      {isLoading ? (
        <span className="pointer-events-none flex shrink-0 items-center justify-center gap-1.5">
          <Loader
            className={cn("size-4 shrink-0 animate-spin", loaderClassname)}
            aria-hidden="true"
          />
          <span className="sr-only">
            {loadingText ? loadingText : "Loading..."}
          </span>
          {loadingText ? loadingText : children}
        </span>
      ) : (
        children
      )}
    </Comp>)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }