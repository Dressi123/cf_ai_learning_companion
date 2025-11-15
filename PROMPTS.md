# AI Assistance Documentation (PROMPTS.md)

This document chronicles all AI prompts used during the development of the CF AI Learning Companion. As required by the Cloudflare SWE internship assignment, this provides transparency into how AI-assisted coding was utilized throughout the project.

## Table of Contents

1. [Development Tools](#development-tools)
2. [Architecture & Design Prompts](#architecture--design-prompts)
3. [Implementation Prompts](#implementation-prompts)
4. [AI Content Generation Prompts](#ai-content-generation-prompts)
5. [Debugging & Production Issues](#debugging--production-issues)
6. [Development Reflections](#development-reflections)

---

## Development Tools

### Context7 MCP Server

Throughout this project, I utilized the **Context7 MCP (Model Context Protocol) server** to provide Claude Code with up-to-date access to documentation for Cloudflare services and other libraries. This was crucial because:

- **Real-time Documentation**: Context7 fetches the latest documentation for libraries like Workers AI, Durable Objects, Hono, and Next.js, ensuring recommendations were based on current APIs and best practices
- **Reduced Hallucinations**: Direct access to official docs meant fewer outdated or incorrect API suggestions
- **Faster Development**: No need to manually search docs or worry about API version mismatches

**How It Was Used:**
When prompts required documentation lookups (especially for Cloudflare-specific features), I appended **"use Context7"** to the prompt. This signaled Claude Code to:
1. Resolve the library ID via Context7
2. Fetch relevant documentation sections
3. Generate responses grounded in official documentation

**Example Prompts with Context7:**
- "How do I configure Durable Objects bindings in wrangler.jsonc? **use Context7**"
- "Show me the Workers AI API for JSON schema responses with Llama 3.3. **use Context7**"
- "What's the correct syntax for Hono's CORS middleware? **use Context7**"

This approach ensured all Cloudflare-specific code was accurate and followed current platform conventions.

---

## Architecture & Design Prompts

### 1. Separated Frontend/Backend Architecture

**Prompt:**

```
I want to migrate my Spring Boot application to Cloudflare. The current app has a
Java backend with Gemini AI and a Next.js frontend. Design a separated architecture
where the frontend runs on Cloudflare Pages and the backend runs on Workers.
Include session management with Durable Objects.
```

**Context:** Initial architecture decision for the project migration.

**AI Response Summary:**

-   Recommended Hono framework for Workers backend (lightweight, edge-optimized)
-   Suggested Durable Objects for session state instead of in-memory sessions
-   Proposed cookie-based session management for stateless Workers
-   Outlined CORS requirements for cross-origin frontend/backend communication

**Reflection:**
This prompt established the foundational architecture. The AI's suggestion to use Durable Objects was crucial—it solved the session persistence challenge elegantly without requiring external databases. The Hono recommendation proved excellent; its minimal footprint (10KB) aligned perfectly with Workers' edge runtime constraints.

### 2. Durable Objects Session Management Design

**Prompt:**

```
Design a Durable Object class called SessionState that stores:
- Document text extracted from PDFs
- Generated summaries
- Flashcard arrays
- Quiz questions
- Session metadata (createdAt, lastUpdated)

Include 24-hour session expiration and HTTP endpoints for CRUD operations.
```

**Context:** Needed a robust state management solution that worked with Workers.

**AI Response Summary:**

-   Designed `SessionState` class with `DurableObjectState` storage API
-   Implemented automatic expiration checking on each request
-   Created RESTful internal endpoints (`/document-text`, `/summary`, `/flashcards`, `/quiz`)
-   Used `state.storage.get/put` for persistent key-value storage

**Iteration:**
Initial design didn't include expiration logic. Follow-up prompt added:

```
Add automatic cleanup for expired sessions (24 hours from creation).
Check expiration on every fetch request and clear all data if expired.
```

**Reflection:**
Durable Objects proved to be the perfect fit for this use case. The strongly consistent storage guarantee meant no race conditions, and the automatic global distribution ensured low latency. The HTTP-based internal API (using `stub.fetch()`) felt initially unusual but created clean separation between the Worker router and DO logic.

---

## Implementation Prompts

### 3. PDF Processing Integration

**Prompt:**

```
Implement PDF text extraction using a library compatible with Cloudflare Workers.
The solution must work without Node.js filesystem APIs. Create a service that:
1. Validates PDF file type and size (max 25MB)
2. Extracts text from all pages
3. Returns { text: string, pageCount: number }
```

**Context:** Standard PDF libraries (like pdf-parse) don't work in Workers due to Node.js dependencies.

**AI Response Summary:**

-   Recommended `unpdf` library (built for edge runtimes)
-   Showed how to use `getDocumentProxy` with `Uint8Array` from `arrayBuffer()`
-   Implemented page-by-page iteration with `getTextContent()`
-   Added validation for file type, size, and empty PDFs

**Code Generated:**

```typescript
// workers/src/utils/pdfParser.ts
export async function extractTextFromPDF(file: File): Promise<ExtractedData> {
	const arrayBuffer = await file.arrayBuffer();
	const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));

	let fullText = "";
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const content = await page.getTextContent();
		const pageText = content.items.map((item: any) => item.str).join(" ");
		fullText += pageText + "\n";
	}

	return { text: fullText.trim(), pageCount: pdf.numPages };
}
```

**Reflection:**
The `unpdf` recommendation saved significant debugging time. This prompt showcased how AI can navigate ecosystem-specific constraints effectively.

### 4. Workers AI + Llama 3.3 Setup

**Prompt:**

```
Integrate Workers AI with Llama 3.3 (model: @cf/meta/llama-3.3-70b-instruct-fp8-fast)
to generate summaries. Use JSON schema response format to ensure structured output
with fields: title, overview, keyPoints (array). Write a summaryService.ts with a
generateSummary function.
```

**Context:** Needed to migrate from Gemini AI to Workers AI while ensuring type-safe responses.

**AI Response Summary:**

-   Showed `env.AI.run()` syntax with model ID
-   Demonstrated `response_format` with `json_schema` parameter
-   Explained Workers AI returns `{ response: string }` that needs JSON parsing
-   Included error handling for invalid AI responses

**Code Generated:**

```typescript
const summarySchema = {
	type: "object",
	properties: {
		title: { type: "string" },
		overview: { type: "string" },
		keyPoints: { type: "array", items: { type: "string" } },
	},
	required: ["title", "overview", "keyPoints"],
};

const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
	prompt: `Create a summary of: ${documentText}`,
	max_tokens: 4096,
	response_format: { type: "json_schema", json_schema: summarySchema },
});

const summary = JSON.parse(aiResponse.response);
```

**Reflection:**
JSON schema responses were game-changing. Unlike free-form text generation, this guaranteed parseable, type-safe output. The student-friendly prompt template (with instructions for simple language and short sections) was already refined from the initial Spring Boot migration, so no iteration was needed during this Cloudflare implementation—it worked perfectly from the start.

### 5. CORS Configuration for Production

**Prompt:**

```
Configure CORS for Hono router to allow requests from:
- http://localhost:3000 (development)
- https://e28adf82.cf-ai-learning-companion.pages.dev (production)

Enable credentials for cookie-based authentication.
```

**AI Response Summary:**

```typescript
import { cors } from "hono/cors";

app.use(
	"*",
	cors({
		origin: ["http://localhost:3000", "https://e28adf82.cf-ai-learning-companion.pages.dev"],
		credentials: true,
	})
);
```

**Reflection:**
Straightforward but essential. The `credentials: true` was critical for allowing session cookies to be sent cross-origin.

### 6. Force Regeneration Feature

**Prompt:**

```
I have three content generation services (Summary, Flashcards, Quiz) that follow
the same pattern but currently have "New Notes" buttons that just reset state
instead of regenerating content. The backend already supports a force=true query
parameter to bypass cache.

Update all three tabs to:
1. Change "New Notes" buttons to "Regenerate" buttons
2. Add force parameter support to API service functions
3. Call the APIs with force=true on regenerate
4. Show loading states and success/error toasts
5. Maintain the exact same pattern across all three implementations

Make sure the solution is type-safe, follows existing code patterns, and reuses
the toast notification system I already have.
```

**Context:** Wanted to give users control over AI regeneration without re-uploading documents.

**AI Response Summary:**

-   Updated all three API service functions to accept optional `force?: boolean` parameter
-   Modified URL construction: `const url = force ? \`\${BASE_URL}/api/content/summary?force=true\` : ...`
-   Added loading states (`const [isRegenerating, setIsRegenerating] = useState(false)`)
-   Integrated toast notifications on success/error
-   Maintained consistency across `SummaryTab.tsx`, `FlashcardTab.tsx`, `QuizTab.tsx`

**Reflection:**
This prompt demonstrated effective AI use for refactoring. By specifying "maintain the exact same pattern," the AI produced consistent code across all three components. The request to "reuse the toast notification system" showed how to leverage AI for codebase-aware changes rather than introducing new patterns.

---

## AI Content Generation Prompts

These are the **application-level prompts**—the actual prompts sent to Llama 3.3 to generate summaries, flashcards, and quizzes for users.

### 7. Summary Generation Prompt

**Final Prompt Template:**

```
Please create a clear and structured summary of the following text.

Instructions:
- Use simple language that is easy for students to understand
- Break the information into short sections or bullet points
- Highlight the most important concepts, definitions, and examples

Text: ${documentText}
```

**JSON Schema:**

```json
{
	"type": "object",
	"properties": {
		"title": { "type": "string" },
		"overview": { "type": "string" },
		"keyPoints": {
			"type": "array",
			"items": { "type": "string" }
		}
	},
	"required": ["title", "overview", "keyPoints"]
}
```

**Design Decisions:**

-   **Token limit:** 4096 tokens (balances detail with response time)
-   **Student-friendly language:** Explicitly requested to match target audience
-   **Structured output:** Title gives context, overview provides big picture, keyPoints enable quick scanning

**Iterations:**

1. **v1:** Generic "summarize this text" → too technical, inconsistent structure
2. **v2:** Added "use simple language" → better readability
3. **v3 (final):** Added "short sections or bullet points" → improved scannability

**Reflection:**
The prompt engineering process revealed how specific instructions directly correlate with output quality. "Student-friendly" alone wasn't enough; "short sections" was necessary to prevent wall-of-text responses. JSON schema eliminated parsing errors entirely, which was a massive improvement over regex/string manipulation approaches.

### 8. Flashcard Generation Prompt

**Final Prompt Template:**

```
Create exactly 10 flashcards from the following text to help students study effectively.

Instructions:
- Each flashcard should have a clear question, a concise answer, and a helpful hint
- Questions should focus on key concepts, definitions, and important facts
- Answers should be brief and to the point (1-3 sentences)
- Hints should guide thinking without giving away the answer
- Cover different topics from the text to ensure comprehensive review

Text: ${documentText}
```

**JSON Schema:**

```json
{
	"type": "object",
	"properties": {
		"flashcards": {
			"type": "array",
			"items": {
				"type": "object",
				"properties": {
					"question": { "type": "string" },
					"answer": { "type": "string" },
					"hint": { "type": "string" }
				},
				"required": ["question", "answer", "hint"]
			}
		}
	},
	"required": ["flashcards"]
}
```

**Design Decisions:**

-   **Exactly 10 cards:** Prevents overwhelming users while ensuring comprehensive coverage
-   **Token limit:** 2048 tokens (flashcards are shorter than summaries)
-   **Three-part structure:** Question, answer, hint supports active recall learning methodology
-   **Coverage requirement:** "Cover different topics" prevents all cards from being about the first paragraph

**Reflection:**
The hint field was a late addition that dramatically improved learning value. Initial versions without hints felt robotic; adding hints made flashcards feel more like a helpful tutor. The "exactly 10" constraint was necessary, without it, Llama sometimes generated 5, sometimes 15.

### 9. Quiz Generation Prompt

**Final Prompt Template:**

```
Create exactly 5 multiple-choice questions from the following text to test student understanding.

Instructions:
- Each question should have 4 options with exactly one correct answer
- Questions should test comprehension, not just memorization
- Include explanations for why the correct answer is right
- Make incorrect options plausible but clearly wrong upon reflection
- Cover different concepts from the text

Text: ${documentText}
```

**JSON Schema:**

```json
{
	"type": "object",
	"properties": {
		"quiz": {
			"type": "array",
			"items": {
				"type": "object",
				"properties": {
					"question": { "type": "string" },
					"options": {
						"type": "array",
						"items": { "type": "string" }
					},
					"correctAnswer": { "type": "number" },
					"explanation": { "type": "string" }
				},
				"required": ["question", "options", "correctAnswer", "explanation"]
			}
		}
	},
	"required": ["quiz"]
}
```

**Design Decisions:**

-   **5 questions:** Balances assessment thoroughness with time commitment
-   **Token limit:** 4096 tokens (explanations require more space)
-   **Comprehension over memorization:** "test comprehension" instruction encourages application questions
-   **Plausible distractors:** "Make incorrect options plausible" prevents trivially easy quizzes
-   **Explanations:** Turns quiz into learning opportunity, not just assessment

**Reflection:**
The explanation field turned out to be the most valuable part. Students could learn from mistakes rather than just seeing "wrong." The "plausible but clearly wrong" instruction for distractors was surprisingly effective. Llama generated options that required actual understanding to eliminate.

---

## Debugging & Production Issues

### 10. Cross-Site Cookie Issue Resolution

**Prompt:**

```
I deployed to Cloudflare Pages and Workers but when I upload it says success,
but when I try to generate summary it says "No document text found in session.
Please upload a document first."

The frontend is on e28adf82.cf-ai-learning-companion.pages.dev and backend
is on cf-ai-learning-worker.andreas-jack-2002.workers.dev
```

**Context:** Session cookies weren't persisting between upload and content generation in production.

**AI Diagnostic Process:**

1. Asked to see `documentService.ts` and `sessionHelpers.ts`
2. Identified `SameSite=Lax` as the issue
3. Explained browser cookie policies for cross-site requests
4. Recommended `SameSite=None; Secure`

**Solution Generated:**

```typescript
// Before (blocked by browser in production)
return `session_id=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`;

// After (works cross-site)
return `session_id=${sessionId}; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=86400`;
```

**Reflection:**
This was a subtle production-only bug that wouldn't appear in local development (both frontend and backend were on `localhost`). The AI's diagnostic approach was methodical:

1. Read relevant files
2. Identify configuration mismatch (different domains)
3. Explain underlying browser behavior
4. Provide targeted fix

The explanation of `SameSite` policies was educational—I now understand why separated frontend/backend architectures require `SameSite=None`.

---

## Development Reflections

### What Worked Well

**1. Structured Prompts with Context**
Prompts that included:

-   Current state ("I have X that does Y")
-   Desired outcome ("I want it to do Z")
-   Constraints ("must work in Workers", "must be type-safe")

...consistently produced better results than vague requests.

**2. Iterative Refinement**
Initial AI responses were often 80% correct. Follow-up prompts like "make this more student-friendly" or "add error handling for edge case X" efficiently refined solutions without starting over.

**3. AI as Architecture Advisor**
Early architecture prompts (Durable Objects, Hono, unpdf) were invaluable. The AI's knowledge of Cloudflare-specific constraints (no Node.js APIs, edge runtime limitations) steered the project toward compatible solutions.

### Challenges Overcome

**1. JSON Schema Learning Curve**
Initial attempts at Workers AI integration didn't use JSON schemas, leading to parsing errors when Llama returned slightly malformed JSON. Once discovered, JSON schemas became the foundation of reliable AI generation.

**2. Cross-Origin Cookie Mystery**
The production cookie bug was frustrating because it worked perfectly locally. AI debugging prompts that included deployment context ("frontend on Pages, backend on Workers") were essential to diagnosing the issue.

**3. Prompt Engineering for Llama 3.3**
Generic prompts like "create flashcards" produced inconsistent results. Learning to add specific instructions ("exactly 10 cards", "brief answers 1-3 sentences") dramatically improved consistency.

### Key Insights

**On AI-Assisted Development:**

-   AI excels at boilerplate, setup, and configuration (CORS, Durable Objects setup, TypeScript types)
-   AI is excellent for exploring unfamiliar ecosystems (Cloudflare Workers ecosystem recommendations)
-   AI debugging works best with full context (file contents, error messages, deployment environment)
-   Iterative prompting beats trying to get perfect output in one shot

**On Prompt Engineering (Application-Level):**

-   Specificity matters: "student-friendly" > "clear"
-   Constraints improve quality: "exactly 10 cards" > "some flashcards"
-   Examples help: Showing desired structure in prompt improves consistency
-   JSON schemas eliminate entire classes of bugs (parsing errors, missing fields)

**On Cloudflare Platform:**

-   Durable Objects are perfect for session state (strong consistency, automatic distribution)
-   Workers AI with JSON schemas is production-ready (reliable, fast, type-safe)
-   Cross-origin cookie handling requires careful attention in separated architectures
-   Edge compute delivers real performance benefits (sub-100ms response times globally)

### Future Improvements

If continuing this project, I would:

1. **Experiment with streaming responses** - Workers AI supports streaming; could show summaries generating in real-time
2. **A/B test different prompts** - Log which prompt variations produce highest-rated content
3. **Add few-shot examples to prompts** - Include 1-2 example flashcards in the prompt to guide style
4. **Implement feedback loop** - Let users rate AI outputs to iteratively improve prompts
5. **Explore longer context** - Test with longer documents (current 25MB PDF limit leaves headroom)

---

## Conclusion

This project demonstrated how AI-assisted development and AI-powered features can create a production-ready application on Cloudflare's edge platform. From architecture decisions (Durable Objects, Hono) to debugging (cross-site cookies), AI assistance accelerated development while maintaining code quality.

The combination of:

-   **Claude Code** for development assistance (architecture, implementation, debugging)
-   **Workers AI + Llama 3.3** for user-facing features (summaries, flashcards, quizzes)

...showcased the full spectrum of AI in modern software development: AI as development partner and AI as product feature.

**Total Development Time:** ~5 days (architecture → implementation → deployment → debugging)

**Lines of Code:**

-   Backend: ~1,117 lines (Workers + Durable Objects + Services)
-   Frontend: ~800 lines (Next.js components + API clients)

**AI Contribution:** Architecture guidance, boilerplate generation, debugging assistance, documentation, and all user-facing content generation.
