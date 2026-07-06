import { docsServiceMock } from '#application/ports/__mocks__/DocsServiceMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import ExpressAdapter from '#infra/http/ExpressAdapter.js'
import RateLimitMiddleware from '#infra/http/middlewares/RateLimitMiddleware.js'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

describe('RateLimitMiddleware', () => {
	let server: ExpressAdapter

	beforeEach(() => {
		server = new ExpressAdapter(0, loggerPortMock, docsServiceMock)
	})

	it('should allow requests within the limit', async () => {
		const rateLimiter = new RateLimitMiddleware(loggerPortMock, 60000, 2)

		server.register(
			'get',
			'/test',
			async () => ({ message: 'ok' }),
			[rateLimiter.handle()],
		)
		server.registerErrorHandler()

		const res1 = await request(server.app).get('/test')
		expect(res1.status).toBe(200)

		const res2 = await request(server.app).get('/test')
		expect(res2.status).toBe(200)
	})

	it('should return 429 when limit is exceeded', async () => {
		const rateLimiter = new RateLimitMiddleware(loggerPortMock, 60000, 2)

		server.register(
			'get',
			'/test',
			async () => ({ message: 'ok' }),
			[rateLimiter.handle()],
		)
		server.registerErrorHandler()

		await request(server.app).get('/test')
		await request(server.app).get('/test')

		const res3 = await request(server.app).get('/test')
		expect(res3.status).toBe(429)
		expect(res3.body).toEqual({
			message: 'Too many requests. Please try again later.',
		})
	})

	it('should reset after the window expires', async () => {
		const rateLimiter = new RateLimitMiddleware(loggerPortMock, 100, 1)

		server.register(
			'get',
			'/test',
			async () => ({ message: 'ok' }),
			[rateLimiter.handle()],
		)
		server.registerErrorHandler()

		await request(server.app).get('/test')

		const res2 = await request(server.app).get('/test')
		expect(res2.status).toBe(429)

		await new Promise((resolve) => setTimeout(resolve, 150))

		const res3 = await request(server.app).get('/test')
		expect(res3.status).toBe(200)
	})
})
