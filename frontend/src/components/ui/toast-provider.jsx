import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        className: 'toast',
        success: {
          className: 'toast-success',
        },
        error: {
          className: 'toast-error',
          duration: 6000,
        },
      }}
    />
  );
}