class apiError extends Error {
  constructor(
    statusCode = 500, // Default to 500 if not provided
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = Number.isInteger(statusCode) ? statusCode : 500; // Validate statusCode
    this.message = message;
    this.success = false;
    this.data = null;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { apiError };
