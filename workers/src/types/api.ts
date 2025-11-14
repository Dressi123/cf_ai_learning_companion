/**
 * API Response Types
 */

import type { Flashcard, Summary } from "./content";

/**
 * Standardized API Response
 */
export interface ApiResponse<T> {
	message: string;
	code: string;
	data: T | null;
}

/**
 * Response Data Types
 */
export interface FlashcardsData {
	cached: boolean;
	flashcards: Flashcard[];
}

export interface SummaryData {
	cached: boolean;
	summary: Summary;
}

export interface UploadData {
	pageCount: number;
}

/**
 * HTTP Status Codes
 */
export const StatusCodes = {
	OK: "200_OK",
	CREATED: "201_CREATED",
	BAD_REQUEST: "400_BAD_REQUEST",
	UNAUTHORIZED: "401_UNAUTHORIZED",
	NOT_FOUND: "404_NOT_FOUND",
	INTERNAL_SERVER_ERROR: "500_INTERNAL_SERVER_ERROR",
} as const;
