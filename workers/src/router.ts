import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./env";

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
	// TODO: Implement PDF upload
	return c.json({ message: "Upload endpoint - to be implemented" });
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
