/**
 * Session Management Utilities
 * Cookie-based session ID handling
 */

import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'session_id';
const SESSION_MAX_AGE = 86400; // 24 hours in seconds

/**
 * Retrieves session ID from cookie, or generates a new one if not found
 * @param request Incoming HTTP request
 * @returns Session ID (existing or newly generated)
 */
export function getOrCreateSessionId(request: Request): string {
  const cookieHeader = request.headers.get('Cookie');

  if (cookieHeader) {
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`));

    if (sessionCookie) {
      const sessionId = sessionCookie.split('=')[1].trim();
      if (sessionId && sessionId.length > 0) {
        return sessionId;
      }
    }
  }

  // Generate new session ID if not found
  return uuidv4();
}

/**
 * Creates a session cookie header value
 * @param sessionId Session ID to store in cookie
 * @returns Cookie header value with security attributes
 */
export function createSessionCookie(sessionId: string): string {
  // Use Lax for cross-origin cookie support (localhost:3000 -> localhost:8787)
  // Remove Secure flag for local development (would need HTTPS)
  return `${SESSION_COOKIE_NAME}=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE}`;
}
