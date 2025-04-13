import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/react-query";

export function useExample() {
  // Query example
  const query = useQuery({
    queryKey: ["example"],
    queryFn: () => api.get("/example"),
  });

  // Mutation example
  const mutation = useMutation({
    mutationFn: (data) => api.post("/example", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["example"]);
    },
  });

  return { query, mutation };
} 