/**
 * Document Processing Service
 * Business logic for PDF upload and text extraction
 */

import { parsePDF } from '../utils/pdfParser';
import type { Env } from '../env';
import type { ExtractedPDFData } from '../types/document';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

/**
 * Processes an uploaded PDF file
 * @param file File from multipart form data
 * @param env Cloudflare environment bindings
 * @returns Extracted text data and metadata
 * @throws Error if validation fails or extraction fails
 */
export async function processUploadedPDF(
  file: File,
  env: Env
): Promise<ExtractedPDFData> {
  // Validate file type
  if (file.type !== 'application/pdf') {
    throw new Error('Invalid file type. Only PDF files are allowed.');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 25 MB.');
  }

  // Convert to ArrayBuffer for parsing
  const arrayBuffer = await file.arrayBuffer();

  // Extract text from PDF
  const { text, pageCount } = await parsePDF(arrayBuffer);

  // Validate extracted text
  if (!text || text.trim().length === 0) {
    throw new Error('No text content found in PDF. The PDF may be empty or contain only images.');
  }

  return {
    text,
    pageCount,
    extractedAt: Date.now(),
  };
}

/**
 * Stores extracted text in SessionState Durable Object
 * @param sessionId User session ID
 * @param text Extracted text from PDF
 * @param env Cloudflare environment bindings
 * @throws Error if storage fails
 */
export async function storeExtractedText(
  sessionId: string,
  text: string,
  env: Env
): Promise<void> {
  try {
    // Get Durable Object instance
    const id = env.SESSION_STATE.idFromName(sessionId);
    const stub = env.SESSION_STATE.get(id);

    // Store text via Durable Object
    const response = await stub.fetch(new Request('http://internal/document-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }));

    if (!response.ok) {
      throw new Error(`Failed to store text: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`Failed to store extracted text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
