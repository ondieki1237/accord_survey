export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'You have already submitted a vote for this review cycle',
    });
  }

  // Generic error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
