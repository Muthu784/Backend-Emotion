const ErrorHandler = (err, req, res, next)=> {
  console.error(`[ERROR] ${err.message}`);
  
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? undefined: err.stack,
    },
  });
};

export default ErrorHandler;