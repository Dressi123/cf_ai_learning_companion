import type { Env } from "../env";
import type { Summary } from "../types/content";

/**
 * Generates a summary of the document text stored in the session
 * using Workers AI (Llama 3.3 70B model)
 *
 * @param sessionId - The session ID to retrieve document text from
 * @param env - Environment bindings
 * @returns The generated summary object
 */
export async function generateSummary(sessionId: string, env: Env): Promise<Summary> {
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

	// Define the JSON schema for summary
	const summarySchema = {
		type: "object",
		properties: {
			title: { type: "string" },
			overview: { type: "string" },
			keyPoints: {
				type: "array",
				items: { type: "string" },
			},
		},
		required: ["title", "overview", "keyPoints"],
	};

	// Generate summary using Workers AI with strict JSON schema
	const prompt = `Please create a clear and structured summary of the following text.

Instructions:
- Use simple language that is easy for students to understand
- Break the information into short sections or bullet points
- Highlight the most important concepts, definitions, and examples

Text: ${documentText}`;

	const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
		prompt: prompt,
		max_tokens: 4096,
		response_format: {
			type: "json_schema",
			json_schema: summarySchema,
		},
	});

	// Workers AI returns { response: string } where response is the JSON string
	const responseData = (aiResponse as any).response;

	if (!responseData) {
		throw new Error("No response from AI model");
	}

	// Parse the JSON response
	const summary: Summary = typeof responseData === "string" ? JSON.parse(responseData) : responseData;

	if (!summary.title || !summary.overview || !Array.isArray(summary.keyPoints)) {
		throw new Error("AI response does not contain a valid summary structure");
	}

	// Store the summary back in the session
	await stub.fetch("http://internal/summary", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ summary }),
	});

	return summary;
}
