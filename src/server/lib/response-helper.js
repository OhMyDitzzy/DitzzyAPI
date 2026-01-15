/**
 * Send standardized success response
 */
export function sendSuccess(
  res,
  data,
  message,
  statusCode = 200
) {
  const response = {
    status: statusCode,
    author: "Ditzzy",
    note: "Thank you for using this API!",
    results: data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send standardized error response
 */
export function sendError(
  res,
  statusCode,
  message,
  error
) {
  const response = {
    status: statusCode,
    message,
  };

  if (error) {
    response.error = error;
  }

  return res.status(statusCode).json(response);
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  badRequest: (res, message = "Bad request") =>
    sendError(res, 400, message),

  invalidUrl: (res, message = "Invalid URL") =>
    sendError(res, 400, message),

  missingParameter: (res, param) =>
    sendError(res, 400, `Missing required parameter: ${param}`),

  invalidParameter: (res, param, reason) =>
    sendError(
      res,
      400,
      `Invalid parameter: ${param}${reason ? ` - ${reason}` : ""}`
    ),

  notFound: (res, message = "Resource not found") =>
    sendError(res, 404, message),

  serverError: (
    res,
    message = "An error occurred, please try again later."
  ) =>
    sendError(res, 500, message),

  tooManyRequests: (
    res,
    message = "Too many requests, please slow down."
  ) =>
    sendError(res, 429, message),

  serviceUnavailable: (
    res,
    message = "Service temporarily unavailable"
  ) =>
    sendError(res, 503, message),
};