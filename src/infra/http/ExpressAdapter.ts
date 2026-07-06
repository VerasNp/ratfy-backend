import express, { type Application } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'

import type { HttpResponse, HttpServerPort } from './HttpServerPort'
import { ZodError } from 'zod'
import ApplicationError from '#application/errors/ApplicationError.js'
import toHttpErrors from './errors/toHttpErrors'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import asyncHandler from './asyncHandler'
import InfraError from '#infra/errors/InfraError.js'
import type { DocsPort } from '#application/ports/DocsPort.js'
import DomainError from '#domain/errors/DomainError.js'

class ExpressAdapter implements HttpServerPort {
	public app: Application
	public constructor(
		private port: number,
		private readonly loggerService: LoggerPort,
		// private readonly docsService: DocsPort,
	) {
		this.app = express()
		this.app.use(express.json())
		this.app.use(cors())
		this.app.use(cookieParser())
	}

	public listen(): void {
		this.app.listen(this.port, () => {
			console.log(`Server running on port ${this.port}`)
		})
	}

	public register(
		method: string,
		url: string,
		callback: Function,
		middlewares: Function[] = [],
	): void {
		;(this.app as any)[method](
			url,
			...middlewares.map((m) => asyncHandler(m)),
			asyncHandler(async (req: any, res: any) => {
				const output: HttpResponse = await callback(req.params, req.body, req.query, req)
				if (output?.cookies) {
					for (const cookie of output.cookies) {
						res.cookie(cookie.name, cookie.value, cookie.options)
					}
				}

				if (output === undefined) {
					return res.status(204).send()
				}

				const statusCode = output.statusCode ?? 200

				if (output.message && output.body !== undefined) {
					return res
						.status(statusCode)
						.json({ message: output.message, data: output.body })
				}

				if (output.message) {
					return res.status(statusCode).json({ message: output.message })
				}

				return res.status(statusCode).json({ data: output.body })
			}),
		)
	}

	public registerErrorHandler(): void {
		this.app.use((err: any, req: any, res: any, next: any) => {
			if (err instanceof ZodError) {
				return res.status(400).json({
					message: 'Invalid input',
					errors: err.issues.map((issue: any) => ({
						message: issue.message,
						path: issue.path,
					})),
				})
			}
			if (err instanceof DomainError) {
				const httpError = toHttpErrors(err)
				return res.status(httpError.statusCode).json({
					message: httpError.message,
				})
			}
			if (err instanceof ApplicationError) {
				const httpError = toHttpErrors(err)
				return res.status(httpError.statusCode).json({
					message: httpError.message,
				})
			}
			if (err instanceof InfraError) {
				const httpError = toHttpErrors(err)
				return res.status(httpError.statusCode).json({
					message: httpError.message,
				})
			}
			this.loggerService.error('Unhandled error', {
				origin: 'ExpressAdapter',
				error: err,
			})
			console.error('Unhandled error:', err)
			return res.status(500).json({
				message: 'Internal server error',
			})
		})
	}
}

export default ExpressAdapter
