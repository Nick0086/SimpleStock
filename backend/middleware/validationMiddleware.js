import { createValidationError } from '../utils/errorUtils.js';

/**
 * Request validation middleware
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Create validation object with request data
      const validationObject = {
        body: req.body || {},
        query: req.query || {},
        params: req.params || {}
      };

      // Validate the request data
      const result = schema.parse(validationObject);

      // Update request with validated data
      req.body = result.body;
      req.query = result.query;
      req.params = result.params;

      next();
    } catch (error) {
      // Format Zod validation errors
      const formattedErrors = error.errors?.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      next(createValidationError(formattedErrors));
    }
  };
}; 