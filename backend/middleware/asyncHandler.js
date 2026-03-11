//Thiss is a utility function to wrap async route handlers and middleware to catch errors and pass them to the error handling middleware. This helps to avoid repetitive try-catch blocks in each async function.

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = asyncHandler