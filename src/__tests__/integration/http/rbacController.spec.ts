import { createTestServer } from '#__tests__/testServer.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import CreateOperationUseCase from '#application/useCases/rbac/CreateOperationUseCase.js'
import RBACController from '#infra/controllers/RBACController.js'
import OperationRepositoryMemory from '#infra/repository/rbac/OperationRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import Operation from '#domain/rbac/operation/Operation.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'
import UpdateOperationUseCase from '#application/useCases/rbac/UpdateOperationUseCase.js'
import DeleteOperationUseCase from '#application/useCases/rbac/DeleteOperationUseCase.js'

let createOperationUseCase: CreateOperationUseCase
let updateOperationUseCase: UpdateOperationUseCase
let deleteOperationUseCase: DeleteOperationUseCase
let server: ExpressAdapter
let operationRepository: OperationRepository

describe('RBACController', () => {
	beforeEach(() => {
		server = createTestServer()
		operationRepository = new OperationRepositoryMemory()
		createOperationUseCase = new CreateOperationUseCase(operationRepository, loggerPortMock)
		updateOperationUseCase = new UpdateOperationUseCase(operationRepository, loggerPortMock)
		deleteOperationUseCase = new DeleteOperationUseCase(operationRepository, loggerPortMock)
		new RBACController(
			server,
			createOperationUseCase,
			updateOperationUseCase,
			deleteOperationUseCase,
			operationRepository,
		)
		server.registerErrorHandler()
	})
	describe('POST /rbac/operations', () => {
		it('should return 204 on success', async () => {
			const res = await request(server.app).post('/rbac/operations').send({
				name: 'TEST',
				description: 'Foo bar',
			})
			expect(res.status).toBe(200)
			expect(res.body).toEqual({
				body: {
					message: 'Operation created successfully',
				},
			})
		})

		it('should return 400 if name is missing', async () => {
			const res = await request(server.app).post('/rbac/operations').send({
				description: 'Foo bar',
			})
			expect(res.status).toBe(400)
			expect(res.body).toEqual({
				error: 'Validation error',
				details: [
					{
						message: 'Name is required',
					},
				],
			})
		})

		it('should return 409 if operation with the same name already exists', async () => {
			await request(server.app).post('/rbac/operations').send({
				name: 'TEST',
				description: 'Foo bar',
			})
			const res = await request(server.app).post('/rbac/operations').send({
				name: 'TEST',
				description: 'Foo bar',
			})
			expect(res.status).toBe(409)
			expect(res.body).toEqual({
				message: 'Operation with name TEST already exists',
			})
		})
	})
	describe('GET /rbac/operations', () => {
		it('should return 200 and list of operations', async () => {
			await request(server.app).post('/rbac/operations').send({
				name: 'TEST',
				description: 'Foo bar',
			})
			const res = await request(server.app).get('/rbac/operations')
			expect(res.status).toBe(200)
			expect(res.body).toEqual({
				body: [
					{
						id: expect.any(String),
						name: 'TEST',
						description: 'Foo bar',
					},
				],
			})
		})
	})
	describe('GET /rbac/operations/:operationName', () => {
		it('should return 200 and the operation if it exists', async () => {
			await request(server.app).post('/rbac/operations').send({
				name: 'TEST',
				description: 'Foo bar',
			})
			const res = await request(server.app).get(`/rbac/operations/TEST`)
			expect(res.status).toBe(200)
			expect(res.body).toEqual({
				body: {
					id: expect.any(String),
					name: 'TEST',
					description: 'Foo bar',
				},
			})
		})

		it("should return 404 if the operation doesn't exist", async () => {
			const res = await request(server.app).get(`/rbac/operations/${crypto.randomUUID()}`)
			expect(res.status).toBe(404)
			expect(res.body).toEqual({
				message: 'Operation not found',
			})
		})
	})

	describe('PUT /rbac/operations/:operationName', () => {
		it('should return 200 on successful update', async () => {
			await request(server.app).post('/rbac/operations').send({
				name: 'TEST',
				description: 'Foo bar',
			})
			const res = await request(server.app).put(`/rbac/operations/TEST`).send({
				name: 'UPDATED_TEST',
				description: 'Updated description',
			})
			expect(res.status).toBe(200)
			expect(res.body).toEqual({
				body: {
					message: 'Operation updated successfully',
				},
			})
		})

		it("should return 404 if the operation doesn't exist", async () => {
			const res = await request(server.app)
				.put(`/rbac/operations/${crypto.randomUUID()}`)
				.send({
					name: 'UPDATED_TEST',
					description: 'Updated description',
				})
			expect(res.status).toBe(404)
			expect(res.body).toEqual({
				message: 'Operation not found',
			})
		})
	})
	describe('DELETE /rbac/operations/:operationName', () => {
		it('should return 200 on successful deletion', async () => {
			await request(server.app).post('/rbac/operations').send({
				name: 'TEST',
				description: 'Foo bar',
			})
			const res = await request(server.app).delete(`/rbac/operations/TEST`)
			expect(res.status).toBe(200)
			expect(res.body).toEqual({
				body: {
					message: 'Operation deleted successfully',
				},
			})
		})
		it("should return 404 if the operation doesn't exist", async () => {
			const res = await request(server.app).delete(`/rbac/operations/${crypto.randomUUID()}`)
			expect(res.status).toBe(404)
			expect(res.body).toEqual({
				message: 'Operation not found',
			})
		})
	})
})
