import { QueryClient } from "@tanstack/react-query";
import { handleApiError } from "./api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        console.error("Query Error:", handleApiError(error));
      }
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error("Mutation Error:", handleApiError(error));
      }
    }
  }
});

// Global error handler for React Query
queryClient.setDefaultOptions({
  queries: {
    onError: (error) => {
      // Log error to your error tracking service
      console.error("Query Error:", error);
    },
  },
  mutations: {
    onError: (error) => {
      // Log error to your error tracking service
      console.error("Mutation Error:", error);
    },
  },
});

// Add global cache listeners if needed
queryClient.getQueryCache().subscribe(({ type, query }) => {
  // You can add cache monitoring here
  if (type === "error") {
    console.error(`Cache error in query ${query.queryKey}:`, query.state.error);
  }
}); 