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
import InfraError from '#infra/shared/errors/InfraError.js'
import type { DocsPort } from '#application/ports/DocsPort.js'

class ExpressAdapter implements HttpServerPort {
	public app: Application
	public constructor(
		private port: number,
		private readonly loggerService: LoggerPort,
		private readonly docsService: DocsPort,
	) {
		this.app = express()
		this.app.use(express.json())
		this.app.use(cors())
		this.app.use(cookieParser())
		this._setupDocs()
	}

	private _setupDocs(): void {
		const spec = this.docsService.generate()
		this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec as any))
		this.app.get('/docs.json', (_req, res) => res.json(spec))
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
				if (output?.body === undefined) {
					return res.status(204).send()
				}
				return res.json(output)
			}),
		)
	}

	public registerErrorHandler(): void {
		this.app.use((err: any, req: any, res: any, next: any) => {
			if (err instanceof ZodError) {
				return res.status(400).json({
					message: 'Validation error',
					issues: err.issues,
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
			return res.status(500).json({
				message: 'Internal server error',
			})
		})
	}
}

export default ExpressAdapter
