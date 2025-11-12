# CLAUDE.md - Workers Backend

This file provides guidance to Claude Code (claude.ai/code) when working with the **Workers backend** in this repository.

## Project Overview

This is the **backend Worker** for the CF AI Learning Companion. It is a pure Cloudflare Workers application that provides API endpoints for:
- PDF upload and text extraction
- AI-powered content generation (summaries, flashcards, quizzes)
- Session management via Durable Objects
- Document storage in R2

**Tech Stack:**
- **Runtime**: Cloudflare Workers with Node.js compatibility
- **Router**: Hono (lightweight web framework)
- **AI**: Workers AI with Llama 3.3 70B
- **Storage**: R2 for documents
- **State**: Durable Objects for sessions
- **Cache**: KV (optional)

## Architecture

### Separated Architecture
This project uses a **separated frontend/backend architecture**:
- **Frontend** (`../frontend/`): Pure Next.js on Cloudflare Pages
- **Backend** (`./workers/`): Pure Workers with Hono (this directory)

### Key Components

1. **Main Worker** (`src/index.ts`): Entry point that exports the fetch handler
2. **Router** (`src/router.ts`): Hono routes for API endpoints
3. **Durable Objects** (`src/durable-objects/SessionState.ts`): Session state management
4. **Services** (`src/services/`): Business logic (to be implemented)
   - `documentService.ts`: PDF upload & text extraction
   - `summaryService.ts`: AI summary generation
   - `flashcardService.ts`: AI flashcard generation
   - `quizService.ts`: AI quiz generation
5. **Types** (`src/types/`): TypeScript type definitions
6. **Utils** (`src/utils/`): Helper functions (PDF parser, prompts, etc.)

### Cloudflare Bindings

Configured in `wrangler.jsonc`:
- **AI** (`env.AI`): Workers AI binding for Llama 3.3
- **DOCUMENTS** (`env.DOCUMENTS`): R2 bucket for PDF storage
- **CACHE** (`env.CACHE`): KV namespace for caching
- **SESSION_STATE** (`env.SESSION_STATE`): Durable Object namespace

Access bindings in route handlers:
```ts
app.get("/api/content/summary", async (c) => {
  const ai = c.env.AI;
  const documents = c.env.DOCUMENTS;
  const sessionState = c.env.SESSION_STATE;
  // Use bindings...
});
```

### Session Management

Sessions are managed using Durable Objects:
1. Generate/retrieve session ID from cookie/header
2. Get Durable Object instance: `env.SESSION_STATE.get(id)`
3. Call methods via stub: `stub.fetch(new Request(...))`

## Development Commands

### Local Development
```bash
npm install              # Install dependencies
npm run dev              # Start Wrangler dev server on http://localhost:8787
npm run tail             # Watch live logs
```

### Deployment
```bash
npm run deploy           # Deploy to Cloudflare Workers
```

### Setup (First Time)
```bash
# Create R2 bucket
wrangler r2 bucket create ai-learning-documents

# Create KV namespace (optional)
wrangler kv:namespace create CACHE

# Update wrangler.jsonc with generated IDs
```

## Project Structure

```
workers/
  src/
    index.ts                      # Main Worker entry point
    router.ts                     # Hono routes definition
    env.ts                        # TypeScript types for bindings

    durable-objects/
      SessionState.ts             # User session management

    services/                     # Business logic (to be implemented)
      documentService.ts          # PDF upload/text extraction
      summaryService.ts           # AI summary generation
      flashcardService.ts         # AI flashcard generation
      quizService.ts              # AI quiz generation

    types/                        # Type definitions (to be implemented)
      document.ts                 # Document types
      content.ts                  # Summary/Flashcard/Quiz types
      api.ts                      # API response types

    utils/                        # Helper functions (to be implemented)
      pdfParser.ts                # PDF text extraction
      promptTemplates.ts          # AI prompts
      errorHandler.ts             # Error handling

  wrangler.jsonc                  # Cloudflare configuration
  package.json                    # Dependencies
  tsconfig.json                   # TypeScript config
```

## API Endpoints

All endpoints are prefixed with `/api`:

### Document Management
- `POST /api/documents/upload` - Upload PDF file
- `POST /api/documents/upload-text` - Upload raw text

### Content Generation
- `GET /api/content/summary` - Generate/retrieve summary
- `GET /api/content/flashcards` - Generate/retrieve flashcards
- `GET /api/content/quiz` - Generate/retrieve quiz

## Environment Variables

Create `.dev.vars` for local development (not committed):
```
# Add any secrets here
```

## Cloudflare-Specific Notes

- Uses Node.js compatibility mode (`nodejs_compat` flag)
- Compatibility date: 2025-03-01
- Durable Objects require migrations in `wrangler.jsonc`
- R2 buckets must be created before deployment
- Workers AI documentation: https://developers.cloudflare.com/workers-ai/
- Durable Objects docs: https://developers.cloudflare.com/durable-objects/
