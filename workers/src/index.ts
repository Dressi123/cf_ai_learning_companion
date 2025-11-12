import router from "./router";
import type { Env } from "./env";

export { SessionState } from "./durable-objects/SessionState";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return router.fetch(request, env, ctx);
	},
};
