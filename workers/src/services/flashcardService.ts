import type { Env } from "../env";
import type { Flashcard, FlashcardsResponse } from "../types/content";

/**
 * Generates flashcards from the document text stored in the session
 * using Workers AI (Llama 3.3 70B model)
 *
 * @param sessionId - The session ID to retrieve document text from
 * @param env - Environment bindings
 * @returns Array of flashcards
 */
export async function generateFlashcards(sessionId: string, env: Env): Promise<Flashcard[]> {
	// Get the Durable Object stub for this session
	const id = env.SESSION_STATE.idFromName(sessionId);
	const stub = env.SESSION_STATE.get(id);

	// Retrieve the document text from storage
	const response = await stub.fetch("http://internal/document-text", {
		method: "GET",
	});

	if (!response.ok) {
		throw new Error("Failed to retrieve document text from session");
	}

	const data = await response.json<{ text?: string }>();
	const documentText = data.text;

	if (!documentText || documentText.trim().length === 0) {
		throw new Error("No document text found in session. Please upload a document first.");
	}

	// Define the JSON schema for flashcards
	const flashcardsSchema = {
		type: "object",
		properties: {
			flashcards: {
				type: "array",
				items: {
					type: "object",
					properties: {
						id: { type: "number" },
						question: { type: "string" },
						answer: { type: "string" },
						hint: { type: "string" },
					},
					required: ["id", "question", "answer", "hint"],
				},
			},
		},
		required: ["flashcards"],
	};

	// Generate flashcards using Workers AI with strict JSON schema
	const prompt = `Analyze the following text and identify the 10 most important concepts, terms, or key ideas.
For each, create a flashcard with a concise question, a clear answer, and a helpful hint.
The language used must be simple and easy for a student to understand.

Text: ${documentText}`;

	const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
		prompt: prompt,
		max_tokens: 2048,
		response_format: {
			type: "json_schema",
			json_schema: flashcardsSchema,
		},
	});

	// Workers AI returns { response: string } where response is the JSON string
	const responseData = (aiResponse as any).response;

	if (!responseData) {
		throw new Error("No response from AI model");
	}

	// Parse the JSON response
	const parsedResponse: FlashcardsResponse =
		typeof responseData === "string" ? JSON.parse(responseData) : responseData;

	if (!parsedResponse.flashcards || !Array.isArray(parsedResponse.flashcards)) {
		throw new Error("AI response does not contain a valid flashcards array");
	}

	// Store the flashcards back in the session
	await stub.fetch("http://internal/flashcards", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ flashcards: parsedResponse.flashcards }),
	});

	return parsedResponse.flashcards;
}
