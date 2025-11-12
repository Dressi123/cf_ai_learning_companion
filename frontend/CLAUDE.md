# CLAUDE.md - Frontend

This file provides guidance to Claude Code (claude.ai/code) when working with the **frontend** in this repository.

## Project Overview

This is the **frontend** for the CF AI Learning Companion. It is a pure Next.js 15.5 application that runs on Cloudflare Pages and communicates with the Workers backend API.

**Tech Stack:**
- **Framework**: Next.js 15.5 with App Router
- **React**: 19.1.0
- **Styling**: Tailwind CSS 4
- **Deployment**: Cloudflare Pages

## Architecture

### Separated Architecture
This project uses a **separated frontend/backend architecture**:
- **Frontend** (`./frontend/`): Pure Next.js on Cloudflare Pages (this directory)
- **Backend** (`../workers/`): Pure Workers with Hono

### Communication with Backend

The frontend communicates with the Workers backend via HTTP API calls:

```ts
// Example API service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: "POST",
    body: formData,
    credentials: "include", // Important for session cookies
  });

  return response.json();
}
```

## Development Commands

### Local Development
```bash
npm install              # Install dependencies
npm run dev              # Start Next.js dev server on http://localhost:3000
```

### Build & Deploy
```bash
npm run build            # Build Next.js app
npm run deploy           # Deploy to Cloudflare Pages
```

## Project Structure

```
frontend/
  src/
    app/
      layout.tsx         # Root layout with Geist fonts
      page.tsx           # Home page
      globals.css        # Tailwind and global styles

  public/                # Static assets
  package.json           # Dependencies
  next.config.ts         # Next.js configuration
  tsconfig.json          # TypeScript config
```

## Environment Variables

Create `.env.local` for local development:
```
NEXT_PUBLIC_API_URL=http://localhost:8787
```

For production (Cloudflare Pages):
```
NEXT_PUBLIC_API_URL=https://your-worker.workers.dev
```

## Key Considerations

- No backend logic in this directory - all API calls go to the Workers backend
- Session management via cookies set by the backend
- CORS is handled by the Workers backend
- Static assets are served from Cloudflare Pages CDN
