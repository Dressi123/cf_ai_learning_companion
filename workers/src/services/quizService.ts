import type { Env } from "../env";
import type { Question, QuizResponse } from "../types/content";

/**
 * Generates quiz questions from the document text stored in the session
 * using Workers AI (Llama 3.3 70B model)
 *
 * @param sessionId - The session ID to retrieve document text from
 * @param env - Environment bindings
 * @returns Array of quiz questions
 */
export async function generateQuiz(sessionId: string, env: Env): Promise<Question[]> {
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

	// Define the JSON schema for quiz
	const quizSchema = {
		type: "object",
		properties: {
			questions: {
				type: "array",
				items: {
					type: "object",
					properties: {
						id: { type: "number" },
						question: { type: "string" },
						answerOptions: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: { type: "number" },
									option: { type: "string" },
									explanation: { type: "string" },
								},
								required: ["id", "option", "explanation"],
							},
						},
						answerId: { type: "number" },
					},
					required: ["id", "question", "answerOptions", "answerId"],
				},
			},
		},
		required: ["questions"],
	};

	// Generate quiz using Workers AI with strict JSON schema
	const prompt = `Given the following text, generate 5 multiple choice questions and answers based on the main concepts, terms and ideas.
	For each question, create 4 answer choices with explanations as to why each option is the incorrect/correct choice.
	The language should be at the same level as the given text.
	Text: ${documentText}`;

	const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
		prompt: prompt,
		max_tokens: 4096,
		response_format: {
			type: "json_schema",
			json_schema: quizSchema,
		},
	});

	// Workers AI returns { response: string } where response is the JSON string
	const responseData = (aiResponse as any).response;

	if (!responseData) {
		throw new Error("No response from AI model");
	}

	// Parse the JSON response
	const parsedResponse: QuizResponse = typeof responseData === "string" ? JSON.parse(responseData) : responseData;

	if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
		throw new Error("AI response does not contain a valid questions array");
	}

	// Store the quiz back in the session
	await stub.fetch("http://internal/quiz", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ quiz: parsedResponse.questions }),
	});

	return parsedResponse.questions;
}
