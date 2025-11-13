# cf_ai_learning_companion

Plan out creating a PDF Upload Handler it should be on /api/documents/upload and use Hono. Implement multipart form data parsing and extract pdf file from request.
Finally upload to R2 bucket with unique key.

User answered Claude's questions:
⎿ · Should the PDF upload handler store the original PDF file in R2, or only extract text and store it in the SessionState Durable Object? → Only extract text to
Durable Object (no R2 storage)
· If storing PDFs in R2, what unique key format should be used? → sessionId/timestamp.pdf
