/**
 * API Response Types
 */

export interface UploadPDFResponse {
  success: boolean;
  sessionId: string;
  pageCount?: number;
  error?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}
