import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useResetPassword() {
  return useMutation({
    mutationKey: ["resetPassword"],
    mutationFn: async ({ email }) => {
      const response = await api.post("/auth/reset-password", { email });
      return response.data;
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 
        "Failed to send password reset instructions"
      );
    },
    onSuccess: () => {
      toast.success("Password reset instructions sent to your email");
    },
  });
} 