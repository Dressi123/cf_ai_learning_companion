import { ApiResponse, SummaryData, FlashcardsData, QuizData } from "../../../../workers/src/types/api";

/** Base URL for the API endpoints */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

/**
 * Retrieves or generates a summary of the uploaded document
 *
 * @param force - If true, forces regeneration of summary even if cached version exists
 * @returns Promise resolving to API response containing summary data
 * @throws Error if summary generation fails or server returns error status
 */
export const getSummary = async (force?: boolean): Promise<ApiResponse<SummaryData>> => {
	const url = force ? `${BASE_URL}/api/content/summary?force=true` : `${BASE_URL}/api/content/summary`;
	const res = await fetch(url, {
		method: "GET",
		credentials: "include",
	});

	const result: ApiResponse<SummaryData> = await res.json();

	if (!res.ok) {
		throw new Error(result.message || "Failed to generate summary");
	}

	return result;
};

/**
 * Retrieves or generates flashcards from the uploaded document
 *
 * @returns Promise resolving to API response containing flashcard list
 * @throws Error if flashcard generation fails or server returns error status
 */
export const getFlashcards = async (): Promise<ApiResponse<FlashcardsData>> => {
	const res = await fetch(`${BASE_URL}/api/content/flashcards`, {
		method: "GET",
		credentials: "include",
	});

	const result: ApiResponse<FlashcardsData> = await res.json();

	if (!res.ok) {
		throw new Error(result.message || "Failed to generate flashcards");
	}

	return result;
};

/**
 * Retrieves or generates quizzes from the uploaded document
 *
 * @returns Promise resolving to API response containing quiz list
 * @throws Error if quiz generation fails or server returns error status
 */
export const getQuizzes = async (): Promise<ApiResponse<QuizData>> => {
	const res = await fetch(`${BASE_URL}/api/content/quiz`, {
		method: "GET",
		credentials: "include",
	});

	const result: ApiResponse<QuizData> = await res.json();

	if (!res.ok) {
		throw new Error(result.message || "Failed to generate quizzes");
	}

	return result;
};
