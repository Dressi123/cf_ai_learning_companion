// TypeScript types for Cloudflare Worker bindings

export interface Env {
	// AI binding for Workers AI
	AI: Ai;

	// R2 bucket for document storage
	DOCUMENTS: R2Bucket;

	// KV namespace for caching (optional)
	CACHE?: KVNamespace;

	// Durable Object binding for session state
	SESSION_STATE: DurableObjectNamespace;
}
