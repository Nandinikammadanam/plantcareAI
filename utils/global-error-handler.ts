// Global error handler to catch unhandled errors
if (__DEV__) {
  // In development, we want to see the full error
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError(...args);
  };
} else {
  // In production, we want to catch and log errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Log the error
    originalConsoleError(...args);
    
    // Here you could send the error to a logging service
    // Example: sendErrorToLoggingService(args);
  };
  
  // Handle promise rejections
  const handlePromiseRejection = (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
  };
  
  // Handle JS errors
  const handleError = (error, isFatal) => {
    console.error('Global Error Handler:', error);
  };
  
  // Set up the error handlers
  if (typeof ErrorUtils !== 'undefined') {
    ErrorUtils.setGlobalHandler(handleError);
  }
  
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', handlePromiseRejection);
  }
}

export {};