import { ActionSchema } from '#application/DTOs/rbac/ActionDTO.js'
import { RoleSchema } from '#application/DTOs/rbac/RoleDTO.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'
import type CreateOperationUseCase from '#application/useCases/rbac/CreateOperationUseCase.js'
import type CreateRoleUseCase from '#application/useCases/rbac/CreateRoleUseCase.js'
import type DeleteOperationUseCase from '#application/useCases/rbac/DeleteOperationUseCase.js'
import type UpdateOperationUseCase from '#application/useCases/rbac/UpdateOperationUseCase.js'
import type UpdateRoleUseCase from '#application/useCases/rbac/UpdateRoleUseCase.js'
import NotFoundError from '#infra/errors/NotFoundError.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import {
	CreateOperationSchema,
	UpdateOperationSchema,
} from '#infra/http/schemas/OperationSchemas.js'

class RBACController {
	public constructor(
		private readonly httpServer: HttpServerPort,
		// private readonly createRoleUseCase: CreateRoleUseCase,
		// private readonly createActionUseCase: CreateActionUseCase,
		private readonly createOperationUseCase: CreateOperationUseCase,
		private readonly updateOperationUseCase: UpdateOperationUseCase,
		private readonly deleteOperationUseCase: DeleteOperationUseCase,
		private readonly operationRepository: OperationRepository,
		// private readonly updateRoleUseCase: UpdateRoleUseCase,
		// private readonly updatePermissionUseCase: UpdatePermissionUseCase,
		// private readonly updateResourceUseCase: UpdateResourceUseCase,
		// private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
	) {
		this.httpServer.register(
			'post',
			'/rbac/operations',
			async (_params: any, body: any, _query: any) => {
				const operationBody = CreateOperationSchema.parse(body)
				await this.createOperationUseCase.execute({
					name: operationBody.name,
					description: operationBody.description ?? null,
				})
				return {
					body: {
						message: 'Operation created successfully',
					},
				}
			},
		)

		this.httpServer.register(
			'get',
			'/rbac/operations',
			async (_params: any, _body: any, _query: any) => {
				const foundOperations = await this.operationRepository.listOperations()
				const operations = foundOperations.map((foundOperation) => ({
					id: foundOperation.id,
					name: foundOperation.name.value,
					description: foundOperation.description,
				}))
				return {
					body: operations,
				}
			},
		)

		this.httpServer.register(
			'get',
			'/rbac/operations/:operationName',
			async (params: any, _body: any, _query: any) => {
				const { operationName } = params
				const foundOperation =
					await this.operationRepository.findOperationByName(operationName)
				if (!foundOperation) {
					throw new NotFoundError('Operation not found')
				}
				return {
					body: {
						id: foundOperation.id,
						name: foundOperation.name.value,
						description: foundOperation.description,
					},
				}
			},
		)

		this.httpServer.register(
			'put',
			'/rbac/operations/:operationName',
			async (params: any, body: any, _query: any) => {
				const { operationName } = params
				const operationBody = UpdateOperationSchema.parse(body)
				await this.updateOperationUseCase.execute({
					nameOperationToUpdate: operationName,
					name: operationBody.name,
					description: operationBody.description ?? null,
				})
				return {
					body: {
						message: 'Operation updated successfully',
					},
				}
			},
		)

		this.httpServer.register(
			'delete',
			'/rbac/operations/:operationName',
			async (params: any, _body: any, _query: any) => {
				const { operationName } = params
				await this.deleteOperationUseCase.execute({
					operationName,
				})
				return {
					body: {
						message: 'Operation deleted successfully',
					},
				}
			},
		)

		// this.httpServer.register(
		// 	'post',
		// 	'/rbac/action',
		// 	async (_params: any, body: any, _query: any) => {
		// 		const actionBody = ActionSchema.parse(body)
		// 	},
		// )

		// this.httpServer.register(
		// 	'get',
		// 	'/rbac/actions',
		// 	async (_params: any, body: any, _query: any) => {
		// 		const actionBody = ActionSchema.parse(body)
		// 	},
		// )

		// this.httpServer.register(
		// 	'put',
		// 	'/rbac/action/:action',
		// 	async (params: any, body: any, _query: any) => {
		// 		const actionBody = ActionSchema.parse(body)
		// 	},
		// )

		// this.httpServer.register(
		// 	'put',
		// 	'/rbac/roles/:roleId',
		// 	async (params: any, body: any, _query: any) => {
		// 		const { roleId } = params
		// 		const roleBody = RoleSchema.parse(body)
		// 		this.updateRoleUseCase.execute(roleId, roleBody)
		// 	},
		// )

		// this.httpServer.register(
		// 	'post',
		// 	'/rbac/roles',
		// 	async (_params: any, body: any, _query: any) => {
		// 		const role = RoleSchema.parse(body)
		// 		await this.createRoleUseCase.execute(role)
		// 	},
		// )
	}
}

export default RBACController
