import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./env";
import { getOrCreateSessionId, createSessionCookie } from "./utils/sessionHelpers";
import { processUploadedPDF, storeExtractedText } from "./services/documentService";
import { generateSummary } from "./services/summaryService";
import { generateFlashcards } from "./services/flashcardService";
import { generateQuiz } from "./services/quizService";
import { handleError } from "./utils/errorHandler";
import type { ApiResponse, UploadData, FlashcardsData, SummaryData, QuizData } from "./types/api";
import { StatusCodes } from "./types/api";
import type { Flashcard, Summary, Question } from "./types/content";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use(
	"*",
	cors({
		origin: ["http://localhost:3000", "https://*.pages.dev"],
		credentials: true,
	})
);

// Health check
app.get("/", (c) => {
	return c.json({
		message: "CF AI Learning Companion API",
		version: "1.0.0",
		status: "healthy",
	});
});

// Document routes
app.post("/api/documents/upload", async (c) => {
	try {
		// Get or create session ID from cookie
		const sessionId = getOrCreateSessionId(c.req.raw);

		// Parse multipart form data
		const formData = await c.req.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return c.json<ApiResponse<null>>(
				{
					message: "No file uploaded. Please provide a PDF file.",
					code: StatusCodes.BAD_REQUEST,
					data: null,
				},
				400
			);
		}

		// Process PDF and extract text
		const extractedData = await processUploadedPDF(file, c.env);

		// Store extracted text in Durable Object
		await storeExtractedText(sessionId, extractedData.text, c.env);

		// Return success response with session cookie
		const response = c.json<ApiResponse<UploadData>>(
			{
				message: "Document uploaded successfully",
				code: StatusCodes.OK,
				data: {
					pageCount: extractedData.pageCount,
				},
			},
			200
		);

		response.headers.set("Set-Cookie", createSessionCookie(sessionId));

		return response;
	} catch (error) {
		return handleError(c, error, "Failed to process PDF upload");
	}
});

app.post("/api/documents/upload-text", async (c) => {
	// TODO: Implement text upload
	return c.json({ message: "Text upload endpoint - to be implemented" });
});

// Content generation routes
app.get("/api/content/summary", async (c) => {
	try {
		// Get session ID from cookie/header
		const sessionId = getOrCreateSessionId(c.req.raw);

		// Get the Durable Object stub
		const id = c.env.SESSION_STATE.idFromName(sessionId);
		const stub = c.env.SESSION_STATE.get(id);

		// Check if force regeneration is requested
		const forceRegenerate = c.req.query("force") === "true";

		// Check if summary already exists (unless force regeneration is requested)
		if (!forceRegenerate) {
			const existingResponse = await stub.fetch("http://internal/summary", {
				method: "GET",
			});

			if (existingResponse.ok) {
				const data = await existingResponse.json<{ summary?: Summary }>();
				if (data.summary) {
					// Return existing summary
					return c.json<ApiResponse<SummaryData>>({
						message: "Summary retrieved successfully",
						code: StatusCodes.OK,
						data: {
							cached: true,
							summary: data.summary,
						},
					});
				}
			}
		}

		// Generate new summary using AI
		const summary = await generateSummary(sessionId, c.env);

		return c.json<ApiResponse<SummaryData>>({
			message: "Summary generated successfully",
			code: StatusCodes.OK,
			data: {
				cached: false,
				summary,
			},
		});
	} catch (error) {
		return handleError(c, error, "Failed to generate summary");
	}
});

app.get("/api/content/flashcards", async (c) => {
	try {
		// Get session ID from cookie/header
		const sessionId = getOrCreateSessionId(c.req.raw);

		// Get the Durable Object stub
		const id = c.env.SESSION_STATE.idFromName(sessionId);
		const stub = c.env.SESSION_STATE.get(id);

		// Check if force regeneration is requested
		const forceRegenerate = c.req.query("force") === "true";

		// Check if flashcards already exist (unless force regeneration is requested)
		if (!forceRegenerate) {
			const existingResponse = await stub.fetch("http://internal/flashcards", {
				method: "GET",
			});

			if (existingResponse.ok) {
				const data = await existingResponse.json<{ flashcards?: Flashcard[] }>();
				if (data.flashcards && data.flashcards.length > 0) {
					// Return existing flashcards
					return c.json<ApiResponse<FlashcardsData>>({
						message: "Flashcards retrieved successfully",
						code: StatusCodes.OK,
						data: {
							cached: true,
							flashcards: data.flashcards,
						},
					});
				}
			}
		}

		// Generate new flashcards using AI
		const flashcards = await generateFlashcards(sessionId, c.env);

		return c.json<ApiResponse<FlashcardsData>>({
			message: "Flashcards generated successfully",
			code: StatusCodes.OK,
			data: {
				cached: false,
				flashcards,
			},
		});
	} catch (error) {
		return handleError(c, error, "Failed to generate flashcards");
	}
});

app.get("/api/content/quiz", async (c) => {
	try {
		// Get session ID from cookie/header
		const sessionId = getOrCreateSessionId(c.req.raw);

		// Get the Durable Object stub
		const id = c.env.SESSION_STATE.idFromName(sessionId);
		const stub = c.env.SESSION_STATE.get(id);

		// Check if force regeneration is requested
		const forceRegenerate = c.req.query("force") === "true";

		// Check if quiz already exists (unless force regeneration is requested)
		if (!forceRegenerate) {
			const existingResponse = await stub.fetch("http://internal/quiz", {
				method: "GET",
			});

			if (existingResponse.ok) {
				const data = await existingResponse.json<{ quiz?: Question[] }>();
				if (data.quiz && data.quiz.length > 0) {
					// Return existing quiz
					return c.json<ApiResponse<QuizData>>({
						message: "Quiz retrieved successfully",
						code: StatusCodes.OK,
						data: {
							cached: true,
							quiz: data.quiz,
						},
					});
				}
			}
		}

		// Generate new quiz using AI
		const quiz = await generateQuiz(sessionId, c.env);

		return c.json<ApiResponse<QuizData>>({
			message: "Quiz generated successfully",
			code: StatusCodes.OK,
			data: {
				cached: false,
				quiz,
			},
		});
	} catch (error) {
		return handleError(c, error, "Failed to generate quiz");
	}
});

export default app;
