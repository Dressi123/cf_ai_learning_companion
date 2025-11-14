/**
 * Error Handling Utilities
 * Standardized error responses for API routes
 */

import type { Context } from 'hono';
import type { ApiResponse } from '../types/api';
import { StatusCodes } from '../types/api';

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
	const { statusCode, code } = getStatusCodeAndCode(error);

	return c.json<ApiResponse<null>>(
		{
			message: errorMessage,
			code,
			data: null,
		},
		statusCode
	);
}

/**
 * Determines appropriate HTTP status code and code string based on error type
 * @param error Error object or unknown
 * @returns Object with HTTP status code and code string
 */
function getStatusCodeAndCode(error: unknown): { statusCode: number; code: string } {
	if (error instanceof Error) {
		const message = error.message.toLowerCase();

		// Session expired
		if (message.includes('session expired') || message.includes('expired')) {
			return { statusCode: 401, code: StatusCodes.UNAUTHORIZED };
		}

		// File size errors
		if (message.includes('too large') || message.includes('size')) {
			return { statusCode: 413, code: '413_PAYLOAD_TOO_LARGE' };
		}

		// Not found errors
		if (message.includes('not found') || message.includes('no document')) {
			return { statusCode: 404, code: StatusCodes.NOT_FOUND };
		}

		// Validation errors
		if (
			message.includes('invalid') ||
			message.includes('not a pdf') ||
			message.includes('no file') ||
			message.includes('no text content') ||
			message.includes('please upload')
		) {
			return { statusCode: 400, code: StatusCodes.BAD_REQUEST };
		}
	}

	// Default to internal server error
	return { statusCode: 500, code: StatusCodes.INTERNAL_SERVER_ERROR };
}
