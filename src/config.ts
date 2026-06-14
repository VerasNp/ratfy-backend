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
	database: {
		url: env.data.DATABASE_URL,
	},
	templates: {
		dir: path.resolve(__dirname, 'infra', 'templates'),
	},
} as const
