import path from 'path'
import { fileURLToPath } from 'url'
import z from 'zod'

const envSchema = z.object({
	APP_URL: z.string().min(1),
	PORT: z.coerce.number().default(3000),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	DATABASE_URL: z.string().min(1),
	JWT_SECRET: z.string().min(1),
	SMTP_HOST: z.string().min(1),
	SMTP_PORT: z.coerce.number(),
	SMTP_USER: z.string().min(1),
	SMTP_PASSWORD: z.string().min(1),
	SMTP_SECURE: z
		.string()
		.default('false')
		.transform((v) => v === 'true'),
	MINIO_ENDPOINT: z.string().default('localhost'),
	MINIO_PORT: z.coerce.number().default(9000),
	MINIO_ACCESS_KEY: z.string().min(1),
	MINIO_SECRET_KEY: z.string().min(1),
	MINIO_USE_SSL: z
		.string()
		.default('false')
		.transform((v) => v === 'true'),
	MINIO_BUCKET_AUDIO: z.string().default('audio'),
	MINIO_BUCKET_IMAGES: z.string().default('images'),
	MINIO_PUBLIC_URL: z.string().optional(),
	MINIO_BUCKET_DRM: z.string().optional(),
	MINIO_REGION: z.string().default('us-east-1'),
	REDIS_URL: z.string().default('redis://localhost:6379'),
	REDIS_CONNECT_TIMEOUT: z.coerce.number().default(10000),
	UPLOAD_MAX_FILE_SIZE: z.coerce.number().default(100 * 1024 * 1024),
	FORGOT_PASSWORD_RATE_LIMIT_MAX: z.coerce.number().default(3),
	FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
	LOGIN_RATE_LIMIT_MAX: z.coerce.number().default(10),
	LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
	SIGNUP_RATE_LIMIT_MAX: z.coerce.number().default(5),
	SIGNUP_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
	RESEND_VERIFICATION_RATE_LIMIT_MAX: z.coerce.number().default(3),
	RESEND_VERIFICATION_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
	RESET_PASSWORD_RATE_LIMIT_MAX: z.coerce.number().default(5),
	RESET_PASSWORD_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
	CORS_ORIGIN: z.string().min(1),
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
	cors: {
		origin: env.data.CORS_ORIGIN,
	},
	mail: {
		host: env.data.SMTP_HOST,
		port: env.data.SMTP_PORT,
		secure: env.data.SMTP_SECURE,
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
		resetPassword: {
			max: env.data.RESET_PASSWORD_RATE_LIMIT_MAX,
			windowMs: env.data.RESET_PASSWORD_RATE_LIMIT_WINDOW_MS,
		},
	},
	database: {
		url: env.data.DATABASE_URL,
	},
	templates: {
		dir: path.resolve(__dirname, 'infra', 'templates'),
	},
	minio: {
		endpoint: env.data.MINIO_ENDPOINT,
		port: env.data.MINIO_PORT,
		accessKey: env.data.MINIO_ACCESS_KEY,
		secretKey: env.data.MINIO_SECRET_KEY,
		useSSL: env.data.MINIO_USE_SSL,
		bucketAudio: env.data.MINIO_BUCKET_AUDIO,
		bucketImages: env.data.MINIO_BUCKET_IMAGES,
		publicUrl: env.data.MINIO_PUBLIC_URL,
		bucketDrm: env.data.MINIO_BUCKET_DRM,
		region: env.data.MINIO_REGION,
	},
	redis: {
		url: env.data.REDIS_URL,
		connectTimeout: env.data.REDIS_CONNECT_TIMEOUT,
	},
	upload: {
		maxFileSize: env.data.UPLOAD_MAX_FILE_SIZE,
	},
} as const
