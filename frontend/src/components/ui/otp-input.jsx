import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const OTPInput = React.forwardRef(({ 
  length = 6, 
  onComplete,
  error,
  className,
  ...props 
}, ref) => {
  const [otp, setOtp] = React.useState(new Array(length).fill(""));
  const inputRefs = React.useRef([]);

  React.useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Take only the last character if multiple characters are pasted
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Call onComplete when all fields are filled
    const otpValue = newOtp.join("");
    if (otpValue.length === length) {
      onComplete?.(otpValue);
    }

    // Move to next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      if (isNaN(pastedData[i])) continue;
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);
    if (newOtp.join("").length === length) {
      onComplete?.(newOtp.join(""));
    }
  };

  return (
    <div>
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <Input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            ref={(el) => (inputRefs.current[index] = el)}
            className={cn(
              "w-10 h-10 text-center text-lg",
              error && "border-red-500",
              className
            )}
            {...props}
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
      )}
    </div>
  );
});

OTPInput.displayName = "OTPInput";

export { OTPInput }; 