import type { Env } from "../env";

/**
 * SessionState Durable Object
 * Manages user session data including document text, summaries, flashcards, and quizzes
 */
export class SessionState {
	private state: DurableObjectState;
	private env: Env;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
	}

	// Session expiration (24 hours in milliseconds)
	private SESSION_EXPIRY = 24 * 60 * 60 * 1000;

	// Initialize session timestamp if not exists
	private async initializeSession(): Promise<void> {
		const createdAt = await this.state.storage.get<number>("createdAt");
		if (!createdAt) {
			await this.state.storage.put("createdAt", Date.now());
		}
	}

	// Check if session has expired
	private async isExpired(): Promise<boolean> {
		const createdAt = await this.state.storage.get<number>("createdAt");
		if (!createdAt) return false;

		const now = Date.now();
		return now - createdAt > this.SESSION_EXPIRY;
	}

	// Document text storage
	async setDocumentText(text: string): Promise<void> {
		await this.initializeSession();
		await this.state.storage.put("documentText", text);
		await this.state.storage.put("lastUpdated", Date.now());
	}

	async getDocumentText(): Promise<string | null> {
		return (await this.state.storage.get<string>("documentText")) || null;
	}

	// Summary storage
	async setSummary(summary: any): Promise<void> {
		await this.state.storage.put("summary", summary);
	}

	async getSummary(): Promise<any | null> {
		return (await this.state.storage.get<any>("summary")) || null;
	}

	// Flashcards storage
	async setFlashcards(flashcards: any[]): Promise<void> {
		await this.state.storage.put("flashcards", flashcards);
	}

	async getFlashcards(): Promise<any[] | null> {
		return (await this.state.storage.get<any[]>("flashcards")) || null;
	}

	// Quiz storage
	async setQuiz(quiz: any): Promise<void> {
		await this.state.storage.put("quiz", quiz);
	}

	async getQuiz(): Promise<any | null> {
		return (await this.state.storage.get<any>("quiz")) || null;
	}

	// Clear all session data
	async clearAll(): Promise<void> {
		await this.state.storage.deleteAll();
	}

	// HTTP handler for the Durable Object
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const method = request.method;

		try {
			// Check if session has expired
			if (await this.isExpired()) {
				await this.clearAll();
				return new Response(
					JSON.stringify({
						error: "Session expired",
						expired: true,
					}),
					{
						status: 401,
						headers: { "Content-Type": "application/json" },
					}
				);
			}
			switch (url.pathname) {
				case "/document-text":
					if (method === "GET") {
						const text = await this.getDocumentText();
						return new Response(JSON.stringify({ text }), {
							headers: { "Content-Type": "application/json" },
						});
					} else if (method === "POST") {
						const { text } = await request.json<{ text: string }>();
						await this.setDocumentText(text);
						return new Response(JSON.stringify({ success: true }), {
							headers: { "Content-Type": "application/json" },
						});
					}
					break;

				case "/summary":
					if (method === "GET") {
						const summary = await this.getSummary();
						return new Response(JSON.stringify({ summary }), {
							headers: { "Content-Type": "application/json" },
						});
					} else if (method === "POST") {
						const { summary } = await request.json<{ summary: any }>();
						await this.setSummary(summary);
						return new Response(JSON.stringify({ success: true }), {
							headers: { "Content-Type": "application/json" },
						});
					}
					break;

				case "/flashcards":
					if (method === "GET") {
						const flashcards = await this.getFlashcards();
						return new Response(JSON.stringify({ flashcards }), {
							headers: { "Content-Type": "application/json" },
						});
					} else if (method === "POST") {
						const { flashcards } = await request.json<{ flashcards: any[] }>();
						await this.setFlashcards(flashcards);
						return new Response(JSON.stringify({ success: true }), {
							headers: { "Content-Type": "application/json" },
						});
					}
					break;

				case "/quiz":
					if (method === "GET") {
						const quiz = await this.getQuiz();
						return new Response(JSON.stringify({ quiz }), {
							headers: { "Content-Type": "application/json" },
						});
					} else if (method === "POST") {
						const { quiz } = await request.json<{ quiz: any }>();
						await this.setQuiz(quiz);
						return new Response(JSON.stringify({ success: true }), {
							headers: { "Content-Type": "application/json" },
						});
					}
					break;

				case "/clear":
					if (method === "POST") {
						await this.clearAll();
						return new Response(JSON.stringify({ success: true }), {
							headers: { "Content-Type": "application/json" },
						});
					}
					break;

				default:
					return new Response("Not found", { status: 404 });
			}

			return new Response("Method not allowed", { status: 405 });
		} catch (error) {
			return new Response(
				JSON.stringify({
					error: error instanceof Error ? error.message : "Unknown error",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				}
			);
		}
	}
}
