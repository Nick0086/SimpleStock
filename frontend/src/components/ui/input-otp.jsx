import * as React from "react"
import { OTPInput as BaseOTPInput } from "input-otp"
import { Dot } from "lucide-react"

import { cn } from "../../lib/utils"

const OTPInput = React.forwardRef(({ className, ...props }, ref) => (
  <BaseOTPInput
    ref={ref}
    className={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      className
    )}
    {...props}
  />
))
OTPInput.displayName = "OTPInput"

const InputOTPGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const OTPSlot = React.forwardRef(({ char, hasFocus, isComplete, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-10 w-10 text-center text-base font-medium",
      "border-2 border-border rounded-md",
      "transition-all duration-200",
      "focus-within:border-primary",
      hasFocus && "border-primary ring-2 ring-primary ring-opacity-20",
      className
    )}
    {...props}
  >
    <input
      className={cn(
        "absolute inset-0 w-full h-full text-center appearance-none rounded-md",
        "focus:outline-none disabled:cursor-not-allowed"
      )}
      disabled={isComplete}
      value={char || ""}
      autoComplete="one-time-code"
      inputMode="numeric"
    />
  </div>
))
OTPSlot.displayName = "OTPSlot"

const InputOTPSeparator = React.forwardRef(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { OTPInput, InputOTPGroup, OTPSlot, InputOTPSeparator }
