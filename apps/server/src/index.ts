import { relative, resolve } from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { appRouter } from "@ivmeapp/api/routers/index";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono, type MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { createContext } from "./context";
import { ENV } from "./env.server";
import { auth } from "./services";

// Örnek gizli anahtarla üretimde açılmaz: .env.example'daki değer herkesçe bilinir
if (
	ENV.NODE_ENV === "production" &&
	/^change-me/i.test(ENV.BETTER_AUTH_SECRET)
) {
	console.error(
		"BETTER_AUTH_SECRET örnek değerde kalmış. `openssl rand -hex 32` ile yeni bir anahtar üretin.",
	);
	process.exit(1);
}

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: ENV.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", async (c) => auth.handler(c.req.raw));

// CSRF: çerezler sameSite=none olduğundan, başka bir siteden gelen bir istek çerezi taşıyabilir.
// Tarayıcı Origin başlığını her çapraz site isteğine koyar; beklenen adres dışındakini reddederiz.
// (Better Auth uç noktaları kendi trustedOrigins denetimini yapar.)
const originGuard: MiddlewareHandler = async (c, next) => {
	const origin = c.req.header("origin");
	if (origin && origin !== ENV.CORS_ORIGIN && c.req.method !== "OPTIONS") {
		return c.text("Forbidden", 403);
	}
	await next();
};
app.use("/rpc/*", originGuard);
app.use("/api-reference/*", originGuard);

export const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

export const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

const handleApi: MiddlewareHandler = async (c, next) => {
	const context = await createContext({ context: c });

	const rpcResult = await rpcHandler.handle(c.req.raw, {
		prefix: "/rpc",
		context: context,
	});

	if (rpcResult.matched) {
		return c.newResponse(rpcResult.response.body, rpcResult.response);
	}

	const apiResult = await apiHandler.handle(c.req.raw, {
		prefix: "/api-reference",
		context: context,
	});

	if (apiResult.matched) {
		return c.newResponse(apiResult.response.body, apiResult.response);
	}

	await next();
};
app.use("/rpc/*", handleApi);
app.use("/api-reference/*", handleApi);

// Evde/tek sunucuda tek adres: WEB_DIST verilirse derlenmiş web arayüzü de buradan sunulur
// (SPA: bilinmeyen yollar index.html'e düşer). Verilmezse yalnızca API çalışır.
if (ENV.WEB_DIST) {
	const root = relative(process.cwd(), resolve(ENV.WEB_DIST));
	app.use("/*", serveStatic({ root }));
	app.get("*", serveStatic({ root, path: "index.html" }));
} else {
	app.get("/", (c) => c.text("OK"));
}

serve(
	{
		fetch: app.fetch,
		port: ENV.PORT ?? 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
