import { useState, useCallback } from 'react';
import { z } from 'zod';

export function useFormValidation(schema) {
  const [errors, setErrors] = useState({});

  const validate = useCallback((data) => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      const formattedErrors = {};
      error.errors.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      return false;
    }
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return { errors, validate, clearErrors };
}

// Additional validation schemas
export const validationSchemas = {
  passwordReset: z.object({
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  }),

  profile: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Invalid phone number')
  })
}; 