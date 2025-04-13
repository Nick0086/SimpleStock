import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FormField({
  name,
  label,
  type = "text",
  className,
  ...props
}) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input
        id={name}
        type={type}
        className={cn(
          errors[name] && "border-red-500",
          className
        )}
        {...register(name)}
        {...props}
      />
      {errors[name] && (
        <p className="text-sm text-red-500">
          {errors[name].message}
        </p>
      )}
    </div>
  );
} 