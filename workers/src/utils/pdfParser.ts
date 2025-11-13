/**
 * PDF Text Extraction Utility
 * Uses unpdf library (Cloudflare-recommended for Workers)
 */

import { extractText } from 'unpdf';

export interface ParsedPDFResult {
  text: string;
  pageCount: number;
}

/**
 * Extracts text from a PDF buffer
 * @param pdfBuffer ArrayBuffer containing the PDF file
 * @returns Extracted text and page count
 * @throws Error if PDF parsing fails or no text is found
 */
export async function parsePDF(pdfBuffer: ArrayBuffer): Promise<ParsedPDFResult> {
  try {
    const { text, totalPages } = await extractText(pdfBuffer, {
      mergePages: true  // Combine all pages into single text
    });

    return {
      text: text.trim(),
      pageCount: totalPages
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
