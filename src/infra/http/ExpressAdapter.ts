import express, { type Application } from 'express'
import cors from 'cors'

import type { HttpServerPort } from './HttpServerPort'
import { ZodError } from 'zod'
import HttpError from './errors/toHttpErrors'
import ApplicationError from '#application/errors/ApplicationError.js'
import toHttpErrors from './errors/toHttpErrors'

class ExpressAdapter implements HttpServerPort {
	public app: Application
	public constructor(private port: number) {
		this.app = express()
		this.app.use(express.json())
		this.app.use(cors())
	}

	public listen(): void {
		this.app.listen(this.port, () => {
			console.log(`Server running on port ${this.port}`)
		})
	}

	public register(method: string, url: string, callback: Function): void {
		;(this.app as any)[method](url, async function (req: any, res: any) {
			try {
				const output = await callback(req.params, req.body, req.query)
				if (output === undefined || output === null) {
					return res.status(204).send()
				}
				res.json(output)
			} catch (e: any) {
				if (e instanceof ZodError) {
					return res.status(400).json({
						message: 'Validation error',
						issues: e.issues,
					})
				}
				if (e instanceof ApplicationError) {
					const httpError = toHttpErrors(e)
					return res.status(httpError.statusCode).json({ message: httpError.message })
				}
				console.error('Unexpected error:', e)
				return res.status(500).json({ message: 'Internal server error' })
			}
		})
	}
}

export default ExpressAdapter
