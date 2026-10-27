import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { Database } from "@ivmeapp/db";
import * as schema from "@ivmeapp/db/schema/auth";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { username } from "better-auth/plugins";

import { USERNAME_RE } from "./student";

export type AuthConfig = {
	BETTER_AUTH_URL: string;
	BETTER_AUTH_SECRET: string;
	CORS_ORIGIN: string;
};

export type AuthOptions = {
	desktopOrigins?: readonly string[];
	/** Giriş denemelerine oran sınırı (ADR-0012). Testlerde kapatılabilir. */
	rateLimit?: boolean;
};

/** Kamuya açık kayıtta seçilebilen roller. student ve admin yalnızca sunucu tarafında oluşur. */
export const PUBLIC_SIGNUP_ROLES = ["guardian", "teacher"] as const;
export type Role = "guardian" | "teacher" | "admin" | "student";

export function createAuth(
	env: AuthConfig,
	database: Database,
	options: AuthOptions = {},
) {
	return betterAuth({
		database: drizzleAdapter(database, {
			provider: "pg",
			schema,
		}),
		trustedOrigins: [env.CORS_ORIGIN, ...(options.desktopOrigins ?? [])],
		emailAndPassword: { enabled: true, minPasswordLength: 8 },
		user: {
			additionalFields: {
				role: { type: "string", defaultValue: "guardian", input: true },
			},
		},
		plugins: [
			username({
				minUsernameLength: 3,
				maxUsernameLength: 30,
				usernameNormalization: (value) => value.toLowerCase(),
				// Eklentinin varsayılanı tireyi kabul etmez; bizim biçim ("kaplan-4821") tire içerir.
				usernameValidator: (value) => USERNAME_RE.test(value),
			}),
		],
		hooks: {
			// Kamuya açık kayıtta yalnızca veli ya da öğretmen olunabilir (ADR-0012).
			before: createAuthMiddleware(async (ctx) => {
				// Rol ve kullanıcı adı oturum açıldıktan sonra istemciden değiştirilemez.
				if (ctx.path === "/update-user") {
					const patch = ctx.body as
						| { role?: unknown; username?: unknown }
						| undefined;
					if (patch?.role !== undefined || patch?.username !== undefined) {
						throw new APIError("BAD_REQUEST", {
							message: "Bu alan değiştirilemez",
						});
					}
					return;
				}
				if (ctx.path !== "/sign-up/email") return;
				const body = ctx.body as
					| { role?: unknown; username?: unknown }
					| undefined;
				if (
					body?.role !== undefined &&
					!PUBLIC_SIGNUP_ROLES.includes(body.role as never)
				) {
					throw new APIError("BAD_REQUEST", { message: "Geçersiz rol" });
				}
				// Kullanıcı adı yalnızca çocuk hesaplarına aittir ve sunucu tarafında atanır.
				if (body?.username !== undefined) {
					throw new APIError("BAD_REQUEST", {
						message: "Kullanıcı adı verilemez",
					});
				}
			}),
		},
		rateLimit: {
			enabled: options.rateLimit ?? true,
			window: 60,
			max: 100,
			customRules: {
				"/sign-in/username": { window: 300, max: 10 },
				"/sign-in/email": { window: 300, max: 10 },
				"/sign-up/email": { window: 3600, max: 10 },
			},
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		advanced: {
			// Cloudflare tüneli arkasında gerçek istemci adresi bu başlıkta gelir; oran sınırı buna göre işler
			ipAddress: { ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"] },
			defaultCookieAttributes: {
				sameSite: "none",
				secure: true,
				httpOnly: true,
			},
		},
	});
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];

export {
	CHILD_EMAIL_DOMAIN,
	createStudentUser,
	normalizeUsername,
	resetStudentPassword,
	USERNAME_RE,
	validateChildPassword,
	validateUsername,
} from "./student";
