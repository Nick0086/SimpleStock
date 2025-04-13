/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, status = 500, errors = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Create an API error
 */
export const createError = (message, status = 500, errors = null) => {
  return new APIError(message, status, errors);
};

/**
 * Validation error creator
 */
export const createValidationError = (errors) => {
  return new APIError('Validation Error', 400, errors);
};

/**
 * Database error handler
 */
export const handleDBError = (error) => {
  if (error.code === '23505') { // Unique violation
    return new APIError('Duplicate entry', 409);
  }
  if (error.code === '23503') { // Foreign key violation
    return new APIError('Related resource not found', 404);
  }
  return new APIError('Database error', 500);
};

/**
 * Error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error(err);

  // Default error response
  const error = {
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details
    })
  };

  // Handle specific error types
  if (err instanceof APIError) {
    res.status(err.status).json(error);
  } else if (err.name === 'ValidationError') {
    res.status(400).json({
      ...error,
      message: 'Validation Error',
      details: err.details
    });
  } else {
    res.status(500).json(error);
  }
}; 