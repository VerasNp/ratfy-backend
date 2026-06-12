import express from 'express'
import cors from 'cors'

import type { HttpServer } from './HttpServer'

class ExpressAdapter implements HttpServer {
	public app: any

	public constructor() {
		this.app = express()
		this.app.use(express.json())
		this.app.use(cors())
	}
	public listen(port: number): void {
		this.app.listen(port)
	}
	public register(method: string, url: string, callback: Function): void {
		this.app[method](url, async function (req: any, res: any) {
			try {
				const output = await callback(req.params, req.body)
				res.json(output)
			} catch (e: any) {
				res.status(422).json({
					message: e.message,
				})
			}
		})
	}
}

export default ExpressAdapter
