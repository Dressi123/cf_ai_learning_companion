/**
 * Error Handling Utilities
 * Standardized error responses for API routes
 */

import type { Context } from 'hono';
import type { ErrorResponse } from '../types/api';

/**
 * Handles errors and returns appropriate HTTP response
 * @param c Hono context
 * @param error Error object or unknown
 * @param defaultMessage Default error message if error is not an Error instance
 * @returns JSON error response with appropriate status code
 */
export function handleError(c: Context, error: unknown, defaultMessage: string) {
  console.error('Error:', error);

  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  const statusCode = getStatusCode(error) as 400 | 413 | 500;

  return c.json<ErrorResponse>(
    {
      success: false,
      error: errorMessage,
    },
    statusCode
  );
}

/**
 * Determines appropriate HTTP status code based on error type
 * @param error Error object or unknown
 * @returns HTTP status code
 */
function getStatusCode(error: unknown): number {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // File size errors
    if (message.includes('too large') || message.includes('size')) {
      return 413; // Payload Too Large
    }

    // Validation errors
    if (
      message.includes('invalid') ||
      message.includes('not a pdf') ||
      message.includes('no file') ||
      message.includes('no text content')
    ) {
      return 400; // Bad Request
    }
  }

  // Default to internal server error
  return 500;
}
