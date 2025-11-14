import { ApiResponse, UploadData } from "../../../../workers/src/types/api";

/** Base URL for the API endpoints */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

/**
 * Uploads text content to the server for processing
 *
 * @param text - The text content to upload and process
 * @returns Promise resolving to API response with null data on success
 * @throws Error if upload fails or server returns error status
 */
export const uploadText = async (text: string): Promise<ApiResponse<null>> => {
	const res = await fetch(`${BASE_URL}/api/documents/upload-text`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ text }),
		credentials: "include",
	});

	const result: ApiResponse<null> = await res.json();

	if (!res.ok) {
		throw new Error(result.message || "Failed to upload text");
	}

	return result;
};

/**
 * Uploads a PDF file to the server for processing
 *
 * @param file - The PDF file to upload
 * @returns Promise resolving to API response with upload data (pageCount)
 * @throws Error if upload fails or server returns error status
 */
export const uploadPDF = async (file: File): Promise<ApiResponse<UploadData>> => {
	const formData = new FormData();
	formData.append("file", file);
	const res = await fetch(`${BASE_URL}/api/documents/upload`, {
		method: "POST",
		body: formData,
		credentials: "include",
	});

	const result: ApiResponse<UploadData> = await res.json();

	if (!res.ok) {
		throw new Error(result.message || "Failed to upload pdf");
	}

	return result;
};
