const asyncHandler = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res, next);
  } catch (error) {
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500; // Validate status code
    console.error("Error:", error.message); // Log error for debugging
    res.status(statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

export { asyncHandler };
