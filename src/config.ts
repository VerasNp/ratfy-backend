import path from 'path'
import { fileURLToPath } from 'url'
import z from 'zod'

const envSchema = z.object({
	APP_URL: z.string(),
	PORT: z.coerce.number().default(3000),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	DATABASE_URL: z.string(),
	JWT_SECRET: z.string(),
	SMTP_HOST: z.string(),
	SMTP_PORT: z.coerce.number(),
	SMTP_USER: z.string(),
	SMTP_PASSWORD: z.string(),
	FORGOT_PASSWORD_RATE_LIMIT_MAX: z.coerce.number().default(3),
	FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
	LOGIN_RATE_LIMIT_MAX: z.coerce.number().default(10),
	LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
	SIGNUP_RATE_LIMIT_MAX: z.coerce.number().default(5),
	SIGNUP_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
	RESEND_VERIFICATION_RATE_LIMIT_MAX: z.coerce.number().default(3),
	RESEND_VERIFICATION_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
})

const env = envSchema.safeParse(process.env)

if (!env.success) {
	console.error('Invalid environment variables:')
	process.exit(1)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const config = {
	jwt: {
		secret: env.data.JWT_SECRET,
	},
	app: {
		url: env.data.APP_URL,
		port: env.data.PORT,
		nodeEnv: env.data.NODE_ENV,
	},
	mail: {
		host: env.data.SMTP_HOST,
		port: env.data.SMTP_PORT,
		secure: false,
		auth: {
			user: env.data.SMTP_USER,
			pass: env.data.SMTP_PASSWORD,
		},
	},
	rateLimit: {
		forgotPassword: {
			max: env.data.FORGOT_PASSWORD_RATE_LIMIT_MAX,
			windowMs: env.data.FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS,
		},
		login: {
			max: env.data.LOGIN_RATE_LIMIT_MAX,
			windowMs: env.data.LOGIN_RATE_LIMIT_WINDOW_MS,
		},
		signup: {
			max: env.data.SIGNUP_RATE_LIMIT_MAX,
			windowMs: env.data.SIGNUP_RATE_LIMIT_WINDOW_MS,
		},
		resendVerification: {
			max: env.data.RESEND_VERIFICATION_RATE_LIMIT_MAX,
			windowMs: env.data.RESEND_VERIFICATION_RATE_LIMIT_WINDOW_MS,
		},
	},
	database: {
		url: env.data.DATABASE_URL,
	},
	templates: {
		dir: path.resolve(__dirname, 'infra', 'templates'),
	},
} as const
