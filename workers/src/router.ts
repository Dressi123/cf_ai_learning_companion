import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./env";
import { getOrCreateSessionId, createSessionCookie } from "./utils/sessionHelpers";
import { processUploadedPDF, storeExtractedText } from "./services/documentService";
import { handleError } from "./utils/errorHandler";
import type { UploadPDFResponse } from "./types/api";

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
		const file = formData.get('file') as File | null;

		if (!file) {
			return c.json<UploadPDFResponse>(
				{
					success: false,
					sessionId,
					error: 'No file uploaded. Please provide a PDF file.',
				},
				400
			);
		}

		// Process PDF and extract text
		const extractedData = await processUploadedPDF(file, c.env);

		// Store extracted text in Durable Object
		await storeExtractedText(sessionId, extractedData.text, c.env);

		// Return success response with session cookie
		const response = c.json<UploadPDFResponse>(
			{
				success: true,
				sessionId,
				pageCount: extractedData.pageCount,
			},
			200
		);

		response.headers.set('Set-Cookie', createSessionCookie(sessionId));

		return response;
	} catch (error) {
		return handleError(c, error, 'Failed to process PDF upload');
	}
});

app.post("/api/documents/upload-text", async (c) => {
	// TODO: Implement text upload
	return c.json({ message: "Text upload endpoint - to be implemented" });
});

// Content generation routes
app.get("/api/content/summary", async (c) => {
	// TODO: Implement summary generation
	return c.json({ message: "Summary endpoint - to be implemented" });
});

app.get("/api/content/flashcards", async (c) => {
	// TODO: Implement flashcard generation
	return c.json({ message: "Flashcards endpoint - to be implemented" });
});

app.get("/api/content/quiz", async (c) => {
	// TODO: Implement quiz generation
	return c.json({ message: "Quiz endpoint - to be implemented" });
});

export default app;
